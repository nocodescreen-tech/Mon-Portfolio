/**
 * API de contact — fonction serverless (Vercel).
 *
 * Déploiement : poussez ce dépôt sur Vercel, puis configurez ces variables
 * d'environnement dans le dashboard (Settings → Environment Variables) :
 *
 *   SMTP_HOST      ex: smtp.gmail.com
 *   SMTP_PORT      ex: 587
 *   SMTP_USER      votre adresse d'envoi
 *   SMTP_PASS      mot de passe applicatif (Gmail: "App password")
 *   SMTP_FROM      expéditeur visible (ex: "Portfolio <no-reply@votresite.com>")
 *   CONTACT_TO     votre adresse de réception (ex: no.codescreen@gmail.com)
 *
 * Sans SMTP configuré, l'API répond 503 avec un message clair — le formulaire
 * bascule alors sur le repli mailto côté client.
 */
import nodemailer from 'nodemailer'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Limitation de débit : 10 envois / 10 min / IP (comptés APRÈS le filtre
// honeypot — les bots n'épuisent pas le quota des visiteurs légitimes)
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 10
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 })
    return false
  }
  entry.count += 1
  return entry.count > MAX_PER_WINDOW
}

export default async function handler(req, res) {
  // CORS pour permettre l'envoi depuis un autre domaine si besoin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Méthode non autorisée.' })

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'inconnu'

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return res.status(400).json({ ok: false, error: 'JSON invalide.' })
  }

  // Honeypot : les bots remplissent ce champ — ignorés sans compter dans le quota
  if (body.website) {
    return res.status(200).json({ ok: true }) // silencieux pour ne pas éduquer le bot
  }

  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Trop de messages. Réessayez dans quelques minutes.' })
  }

  const nom = String(body.nom || '').trim().slice(0, 120)
  const email = String(body.email || '').trim().slice(0, 200)
  const sujet = String(body.sujet || '').trim().slice(0, 200) || 'Nouveau projet'
  const message = String(body.message || '').trim().slice(0, 5000)

  // Validation serveur
  if (nom.length < 2) return res.status(400).json({ ok: false, error: 'Nom invalide.' })
  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Email invalide.' })
  if (message.length < 10) return res.status(400).json({ ok: false, error: 'Message trop court.' })

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_TO } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
    return res.status(503).json({
      ok: false,
      error: 'SMTP non configuré côté serveur. Utilisez le repli mailto.',
    })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT || 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: CONTACT_TO,
      replyTo: `${nom} <${email}>`,
      subject: `[Portfolio] ${sujet} — ${nom}`,
      text: `Nom : ${nom}\nEmail : ${email}\n\n${message}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
          <div style="background:#0b0f0e;color:#f0b429;padding:16px 24px;font-weight:bold">Nouveau message — Portfolio René Descartes</div>
          <div style="padding:24px">
            <p><strong>Nom :</strong> ${nom.replace(/</g, '&lt;')}</p>
            <p><strong>Email :</strong> <a href="mailto:${email}">${email.replace(/</g, '&lt;')}</a></p>
            <p><strong>Sujet :</strong> ${sujet.replace(/</g, '&lt;')}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
            <p style="white-space:pre-wrap">${message.replace(/</g, '&lt;')}</p>
          </div>
        </div>`,
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[contact] envoi échoué:', err)
    return res.status(500).json({ ok: false, error: "Échec de l'envoi." })
  }
}
