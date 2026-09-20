// ============================================================
// POST /api/admin/login — authentification admin.
// Reçoit { email, motDePasse }, vérifie en base, crée une session,
// pose un cookie httpOnly (le token n'apparaît jamais au client).
// ============================================================
import { query, cors, sendJSON } from '../_db.js'
import { verifyPassword, signToken, createSession, setSessionCookie } from '../_auth.js'

// Rate-limit login : 8 tentatives / 15 min / IP (anti brute-force).
const WW = 15 * 60 * 1000
const MAX = 8
const attempts = new Map()

function loginRateLimited(ip) {
  const now = Date.now()
  const e = attempts.get(ip)
  if (!e || now - e.start > WW) {
    attempts.set(ip, { start: now, count: 1 })
    return false
  }
  e.count += 1
  return e.count > MAX
}

export default async function handler(req, res) {
  cors(res, req)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Méthode non autorisée.' })

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return sendJSON(res, 400, { error: 'JSON invalide.' })
  }

  const email = String(body.email || '').trim().slice(0, 200)
  const pw = String(body.motDePasse || '')

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'inconnu'

  if (loginRateLimited(ip)) {
    return sendJSON(res, 429, { error: 'Trop de tentatives. Réessayez dans 15 minutes.' })
  }

  try {
    const { rows } = await query('SELECT id, email, nom, mot_de_passe FROM admin WHERE email = $1', [email])
    const admin = rows[0]
    if (!admin || !verifyPassword(pw, admin.mot_de_passe)) {
      return sendJSON(res, 401, { error: 'Identifiants incorrects.' })
    }
    const token = signToken(admin.id)
    await createSession(admin.id, token)
    setSessionCookie(res, token)
    // Pas de token dans la réponse : uniquement les infos admin non sensibles.
    return sendJSON(res, 200, { admin: { id: admin.id, email: admin.email, nom: admin.nom } })
  } catch (err) {
    console.error('[login]', err?.message)
    return sendJSON(res, 500, { error: 'Erreur serveur.' })
  }
}