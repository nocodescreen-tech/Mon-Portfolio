// ============================================================
// POST /api/contact — reception d'un message du formulaire public.
// 1. Valide (honeypot + format + débit)
// 2. Persiste en base Postgres (Supabase) si DATABASE_URL présent
// 3. Envoie l'email vers la boîte admin via SMTP
// ============================================================
import nodemailer from 'nodemailer'
import { query, cors, sendJSON, hasDb } from './_db.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Limitation de débit : 10 envois / 10 min / IP (comptés APRÈS le honeypot).
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
  cors(res, req)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Méthode non autorisée.' })

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'inconnu'

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return sendJSON(res, 400, { error: 'JSON invalide.' })
  }

  // Honeypot : les bots remplissent ce champ — on répond OK sans rien faire.
  if (body.website) return sendJSON(res, 200, {})

  if (rateLimited(ip)) {
    return sendJSON(res, 429, { error: 'Trop de messages. Réessayez dans quelques minutes.' })
  }

  const nom = String(body.nom || '').trim().slice(0, 120)
  const email = String(body.email || '').trim().slice(0, 200)
  const sujet = String(body.sujet || '').trim().slice(0, 200) || 'Nouveau projet'
  const message = String(body.message || '').trim().slice(0, 5000)

  if (nom.length < 2) return sendJSON(res, 400, { error: 'Nom invalide.' })
  if (!EMAIL_RE.test(email)) return sendJSON(res, 400, { error: 'Email invalide.' })
  if (message.length < 10) return sendJSON(res, 400, { error: 'Message trop court.' })

  let persistedId = null
  if (hasDb()) {
    try {
      const r = await query(
        `INSERT INTO messages (nom, email, sujet, message, ip)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [nom, email, sujet, message, ip],
      )
      persistedId = r.rows[0].id
    } catch (err) {
      // Échec base → on continue vers l'email (dégradation douce), mais on le logge.
      console.error('[contact] base KO:', err?.message)
    }
  }

  // Envoi email (envoi vers boîte admin). Si SMTP absent, OK si au moins persisté.
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_TO } = process.env
  let emailOk = false
  if (SMTP_HOST && SMTP_USER && SMTP_PASS && CONTACT_TO) {
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
            <div style="background:#0b0f0e;color:#ff5b2e;padding:16px 24px;font-weight:bold">
              Nouveau message — Portfolio René Descartes${persistedId ? ` · #${persistedId}` : ''}
            </div>
            <div style="padding:24px">
              <p><strong>Nom :</strong> ${nom.replace(/</g, '&lt;')}</p>
              <p><strong>Email :</strong> <a href="mailto:${email}">${email.replace(/</g, '&lt;')}</a></p>
              <p><strong>Sujet :</strong> ${sujet.replace(/</g, '&lt;')}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
              <p style="white-space:pre-wrap">${message.replace(/</g, '&lt;')}</p>
            </div>
          </div>`,
      })
      emailOk = true
    } catch (err) {
      console.error('[contact] SMTP KO:', err?.message)
    }
  }

  if (persistedId || emailOk) {
    return sendJSON(res, 200, { id: persistedId })
  }
  return sendJSON(res, 503, {
    error: 'Stockage et envoi indisponibles. Utilisez le repli mailto.',
  })
}