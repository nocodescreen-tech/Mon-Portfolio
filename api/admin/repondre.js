// ============================================================
// POST /api/admin/repondre — répond au visiteur par email (SMTP),
// marque le message "repondu".
//   { id, reponse }
// ============================================================
import nodemailer from 'nodemailer'
import { query, cors, sendJSON } from '../_db.js'
import { requireAuth } from '../_auth.js'

export default async function handler(req, res) {
  cors(res, req)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Méthode non autorisée.' })

  const ctx = await requireAuth(req, res)
  if (!ctx) return

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return sendJSON(res, 400, { error: 'JSON invalide.' })
  }

  const id = Number(body.id)
  const reponse = String(body.reponse || '').trim()
  if (!id) return sendJSON(res, 400, { error: 'id requis.' })
  if (reponse.length < 5) return sendJSON(res, 400, { error: 'Réponse trop courte.' })

  const { rows } = await query('SELECT * FROM messages WHERE id = $1', [id])
  const msg = rows[0]
  if (!msg) return sendJSON(res, 404, { error: 'Message introuvable.' })

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env
  let emailOk = false
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT || 587) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
      await transporter.sendMail({
        from: SMTP_FROM || SMTP_USER,
        to: msg.email,
        replyTo: SMTP_USER,
        subject: `Re : ${msg.sujet}`,
        text: `Bonjour ${msg.nom},\n\n${reponse}\n\n— René Descartes`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
            <div style="padding:24px;background:#fafafa">
              <p>Bonjour ${msg.nom.replace(/</g, '&lt;')},</p>
              <p style="white-space:pre-wrap">${reponse.replace(/</g, '&lt;')}</p>
              <p>— René Descartes</p>
            </div>
          </div>`,
      })
      emailOk = true
    } catch (err) {
      console.error('[repondre] SMTP KO:', err?.message)
    }
  }

  // Marque "repondu" (avec repondu_a) que l'email soit parti ou non.
  await query(`UPDATE messages SET statut = 'repondu', repondu_a = now() WHERE id = $1`, [id])

  if (!emailOk) {
    return sendJSON(res, 500, { error: "Réponse enregistrée mais l'email n'a pas pu partir (SMTP absent ou erreur)." })
  }
  return sendJSON(res, 200, {})
}