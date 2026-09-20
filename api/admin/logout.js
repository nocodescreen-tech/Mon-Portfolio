// ============================================================
// POST /api/admin/logout — révoque la session et efface le cookie.
// ============================================================
import { cors, sendJSON } from '../_db.js'
import { requireAuth, revokeSession, clearSessionCookie } from '../_auth.js'

export default async function handler(req, res) {
  cors(res, req)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Méthode non autorisée.' })

  const ctx = await requireAuth(req, res)
  if (!ctx) return clearSessionCookie(res)
  await revokeSession(ctx.token)
  clearSessionCookie(res)
  return sendJSON(res, 200, {})
}