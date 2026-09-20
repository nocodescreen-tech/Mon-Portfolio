// ============================================================
// /api/admin/messages — CRUD des messages (authentifié).
//   GET     ?statut=xx&debut=&limite=   liste paginée (+ id single)
//   PATCH   { id, statut?, favori?, sujet?, ... }  mise à jour partielle
//   DELETE  { id }  suppression
// ============================================================
import { query, cors, sendJSON } from '../_db.js'
import { requireAuth } from '../_auth.js'

const STATUTS = ['nouveau', 'lu', 'repondu', 'archive']
const LIMITE_MAX = 100

export default async function handler(req, res) {
  cors(res, req)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const ctx = await requireAuth(req, res)
  if (!ctx) return

  try {
    if (req.method === 'GET') return getMessages(req, res)
    if (req.method === 'PATCH') return patchMessage(req, res, ctx)
    if (req.method === 'DELETE') return deleteMessage(req, res)
    return sendJSON(res, 405, { error: 'Méthode non autorisée.' })
  } catch (err) {
    console.error('[messages]', err?.message)
    return sendJSON(res, 500, { error: 'Erreur serveur.' })
  }
}

async function getMessages(req, res) {
  const url = new URL(req.url?.startsWith('http') ? req.url : `http://x${req.url}`, 'http://x')
  const id = url.searchParams.get('id')
  if (id) {
    const { rows } = await query('SELECT * FROM messages WHERE id = $1', [Number(id)])
    return sendJSON(res, 200, { message: rows[0] || null })
  }

  const statut = url.searchParams.get('statut')
  const favori = url.searchParams.get('favori')
  const debut = Math.max(0, Number(url.searchParams.get('debut')) || 0)
  const limite = Math.min(LIMITE_MAX, Number(url.searchParams.get('limite')) || 50)

  const where = []
  const params = []
  if (statut && STATUTS.includes(statut)) {
    params.push(statut)
    where.push(`statut = $${params.length}`)
  }
  if (favori === 'true' || favori === '1') {
    where.push('favori = true')
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  params.push(limite)
  params.push(debut)

  const [list, cnt, nouveau] = await Promise.all([
    query(
      `SELECT * FROM messages ${whereSql} ORDER BY cree_le DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    ),
    query(`SELECT count(*)::int AS n FROM messages ${whereSql}`, where.length ? where.map((_, i) => undefined).filter(() => false) : []),
    query(`SELECT count(*)::int AS n FROM messages WHERE statut = 'nouveau'`),
  ])

  const total = cnt.rows[0]?.n ?? 0
  const totalNouveau = nouveau.rows[0]?.n ?? 0

  return sendJSON(res, 200, {
    messages: list.rows,
    meta: { total, totalNouveau, debut, limite },
  })
}

async function patchMessage(req, res) {
  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return sendJSON(res, 400, { error: 'JSON invalide.' })
  }
  const id = Number(body.id)
  if (!id) return sendJSON(res, 400, { error: 'id requis.' })

  const allowed = {}
  if ('statut' in body) {
    if (!STATUTS.includes(body.statut)) return sendJSON(res, 400, { error: 'statut invalide.' })
    allowed.statut = body.statut
  }
  if ('favori' in body) allowed.favori = Boolean(body.favori)
  if ('sujet' in body) allowed.sujet = String(body.sujet).slice(0, 200)

  const keys = Object.keys(allowed)
  if (!keys.length) return sendJSON(res, 400, { error: 'Rien à mettre à jour.' })

  // Statut "lu" → marque lu_a ; "repondu" → repondu_a.
  const sets = []
  const params = []
  for (const k of keys) {
    params.push(allowed[k])
    sets.push(`${k} = $${params.length}`)
  }
  if (allowed.statut === 'lu') sets.push(`lu_a = now()`)
  if (allowed.statut === 'repondu') sets.push(`repondu_a = now()`)
  params.push(id)

  const { rows } = await query(`UPDATE messages SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params)
  if (!rows[0]) return sendJSON(res, 404, { error: 'Message introuvable.' })
  return sendJSON(res, 200, { message: rows[0] })
}

async function deleteMessage(req, res) {
  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return sendJSON(res, 400, { error: 'JSON invalide.' })
  }
  const id = Number(body.id)
  if (!id) return sendJSON(res, 400, { error: 'id requis.' })
  await query('DELETE FROM messages WHERE id = $1', [id])
  return sendJSON(res, 200, {})
}