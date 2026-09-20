// Helpers partagés — **NON exposés comme endpoint** (préfixe `_` ignore chez Vercel).
import pg from 'pg'

// Pool lazy partagé. Vérifie uniquement que DATABASE_URL existe ;
// la connexion se fait à la première requête (serverless-friendly).
const { Pool } = pg
let pool = null

export function getPool() {
  if (pool) return pool
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL manquant — configurez la variable d\'environnement (Supabase).')
  }
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 })
  return pool
}

/** Retourne `{ db: boolean }` — true si DATABASE_URL est présent (persistance active). */
export function hasDb() {
  return Boolean(process.env.DATABASE_URL)
}

/** Exécute une requête paramétrée. Lève si la base est absente. */
export async function query(text, params = []) {
  const p = getPool()
  const client = await p.connect()
  try {
    const r = await client.query(text, params)
    return r
  } finally {
    client.release()
  }
}

/** Helpers CORS unifiés. En mode cookie httpOnly, on réflète l'origine
 *  demandée (jamais `*`) + Allow-Authorization-Credentials, pour que le
 *  cookie fonctionne en même-origine (SPA + /api au même domaine sur Vercel). */
const ALLOWED_ORIGINS = new Set([
  (process.env.SITE_ORIGIN || '').toLowerCase().replace(/\/$/, '').split(',').map((s) => s.trim()).filter(Boolean),
].flat())

export function cors(res, req) {
  const origin = req?.headers?.origin
  // Si pas d'origine ou origine autorisée → on la réflète ; sinon on n'en pose pas.
  const allowed = !origin || ALLOWED_ORIGINS.size === 0 || ALLOWED_ORIGINS.has(String(origin).toLowerCase().replace(/\/$/, ''))
  if (origin && allowed) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export function sendJSON(res, status, data) {
  res.status(status).json({ ok: status < 400, ...data })
}