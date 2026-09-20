// ============================================================
// GET /api/admin/stats — statistiques du tableau de bord.
// ============================================================
import { query, cors, sendJSON } from '../_db.js'
import { requireAuth } from '../_auth.js'

export default async function handler(req, res) {
  cors(res, req)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return sendJSON(res, 405, { error: 'Méthode non autorisée.' })

  const ctx = await requireAuth(req, res)
  if (!ctx) return

  try {
    const [total, nouveaux, favoris, repondus, recents, dernier7] = await Promise.all([
      query(`SELECT count(*)::int AS n FROM messages`),
      query(`SELECT count(*)::int AS n FROM messages WHERE statut = 'nouveau'`),
      query(`SELECT count(*)::int AS n FROM messages WHERE favori = true`),
      query(`SELECT count(*)::int AS n FROM messages WHERE statut = 'repondu'`),
      query(`SELECT * FROM messages ORDER BY cree_le DESC LIMIT 5`),
      query(
        `SELECT date_trunc('day', cree_le)::text AS jour, count(*)::int AS n
         FROM messages WHERE cree_le > now() - interval '7 days'
         GROUP BY 1 ORDER BY 1`,
      ),
    ])

    return sendJSON(res, 200, {
      stats: {
        total: total.rows[0]?.n ?? 0,
        nouveaux: nouveaux.rows[0]?.n ?? 0,
        favoris: favoris.rows[0]?.n ?? 0,
        repondus: repondus.rows[0]?.n ?? 0,
      },
      recents: recents.rows,
      dernier7: dernier7.rows,
    })
  } catch (err) {
    console.error('[stats]', err?.message)
    return sendJSON(res, 500, { error: 'Erreur serveur.' })
  }
}