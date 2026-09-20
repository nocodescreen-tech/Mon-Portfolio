// Auth — JWT en cookie httpOnly + sessions révocables + scrypt (no bcrypt).
//
// SÉCURITÉ : le token JWT n'est JAMAIS lu ni affiché côté client. Il vit
// uniquement dans un cookie httpOnly, Secure, SameSite. Le navigateur l'envoie
// automatiquement ; rien n'apparaît dans localStorage, in-memory, ni devtools.
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { query } from './_db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-changer-en-prod'
const TOKEN_TTL_S = 7 * 24 * 60 * 60 // 7 jours (secondes)

const SECURE_ONLY = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

/* ================= Cookies httpOnly ================= */

/** Nom du cookie de session. */
export const AUTH_COOKIE = 'portfolio_admin_session'

/** Pose le cookie httpOnly de session sur la réponse. */
export function setSessionCookie(res, token) {
  const maxAge = TOKEN_TTL_S
  const parts = [
    `${AUTH_COOKIE}=${token}`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `HttpOnly`,
    `SameSite=Lax`,
  ]
  // Secure=disabled hors prod pour permettre le test en http local ; actif sur Vercel (https).
  if (SECURE_ONLY) parts.push(`Secure`)
  res.setHeader('Set-Cookie', parts.join('; '))
}

/** Efface le cookie de session (logout). */
export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${AUTH_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${SECURE_ONLY ? '; Secure' : ''}`)
}

/* ================= Hash mot de passe (scrypt) ================= */

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored).split(':')
  if (!salt || !hash) return false
  const candidate = crypto.scryptSync(pw, salt, 64).toString('hex')
  const a = Buffer.from(candidate, 'hex')
  const b = Buffer.from(hash, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/* ================= JWT ================= */

export function signToken(adminId) {
  const jti = crypto.randomUUID()
  // jti est une claim du payload (jsonwebtoken v9 refuse jti dans options).
  return jwt.sign({ sub: String(adminId), jti }, JWT_SECRET, { expiresIn: TOKEN_TTL_S })
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const { rows } = await query(
      'SELECT s.admin_id, a.email FROM sessions s JOIN admin a ON a.id = s.admin_id WHERE s.jti = $1 AND s.expire_le > now()',
      [decoded.jti],
    )
    if (!rows[0]) return null
    return { adminId: rows[0].admin_id, email: rows[0].email }
  } catch {
    return null
  }
}

export async function createSession(adminId, token) {
  const { jti } = jwt.decode(token)
  const expire = new Date(Date.now() + TOKEN_TTL_S * 1000)
  await query('INSERT INTO sessions (admin_id, jti, expire_le) VALUES ($1, $2, $3)', [adminId, jti, expire])
}

export async function revokeSession(token) {
  let jti
  try {
    jti = jwt.decode(token)?.jti
  } catch {
    return
  }
  if (jti) await query('DELETE FROM sessions WHERE jti = $1', [jti]).catch(() => {})
}

/* ================= Middleware auth (cookie uniquement) ================= */

/**
 * Lit le token UNIQUEMENT depuis le cookie httpOnly. Aucun Bearer, aucun
 * header de token — le client ne manie jamais la valeur.
 * Retourne { adminId, email } ou null (en ayant envoyé 401).
 */
export async function requireAuth(req, res) {
  const raw = parseCookies(req.headers.cookie || '')[AUTH_COOKIE]
  if (!raw) {
    if (!res.headersSent) res.status(401).json({ ok: false, error: 'Non autorisé.' })
    return null
  }
  const ctx = await verifyToken(raw).catch(() => null)
  if (!ctx) {
    if (!res.headersSent) res.status(401).json({ ok: false, error: 'Non autorisé.' })
    return null
  }
  ctx.token = raw
  return ctx
}

/** Parse simple d'un header Cookie. */
function parseCookies(header) {
  const out = {}
  header.split(';').forEach((pair) => {
    const i = pair.indexOf('=')
    if (i > -1) {
      const k = pair.slice(0, i).trim()
      const v = pair.slice(i + 1).trim()
      if (k) out[k] = decodeURIComponent(v)
    }
  })
  return out
}