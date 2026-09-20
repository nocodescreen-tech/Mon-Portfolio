// Harnais HTTP — exécute les vrais handlers serverless (api/*.js) sur un mini-serveur
// avec req/res façade compatibles (method, url, headers, body / status, json, setHeader, end).
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

async function loadModule(p) {
  const full = resolve(p)
  const m = await import(pathToFileURL(full).href + '?t=' + Date.now())
  return m.default
}

function makeReq(method, url, body, token) {
  const headers = { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.4' }
  if (token) headers.authorization = 'Bearer ' + token
  return {
    method,
    url,
    headers,
    socket: { remoteAddress: '127.0.0.1' },
    body: body ? JSON.stringify(body) : '',
  }
}

function makeRes() {
  const out = { status: null, headers: {}, body: null }
  let statusCode = 200
  const res = {
    statusCode,
    headersSent: false,
    setHeader: (k, v) => { out.headers[k] = v },
    status: (s) => { statusCode = s; res.statusCode = s; return res },
    json: (data) => { out.status = statusCode; out.body = data; res.headersSent = true; return res },
    end: (d) => { if (!res.headersSent) { out.status = statusCode; out.body = d; res.headersSent = true } return res },
  }
  return { res, out }
}

async function call(path, method, body, token) {
  const handler = await loadModule(path)
  const { res, out } = makeRes()
  const req = makeReq(method, '/', body, token)
  await handler(req, res)
  return { status: out.status, body: out.body }
}

async function main() {
  const B = resolve('api/')

  // 1) login invalide → 401 (autoroute serveur)
  const bad = await call(B + '/admin/login.js', 'POST', { email: 'no.codescreen@gmail.com', motDePasse: 'MOT_DE_PASSE_FAUX' })
  console.log('login invalide →', bad.status, '(attendu 401)')

  // 2) contact public — persisté (ne dépend pas de l'auth)
  const cont = await call(B + '/contact.js', 'POST', {
    nom: 'Visiteur Test',
    email: 'visiteur.test+' + Date.now() + '@example.com',
    sujet: 'Test HTTP',
    message: 'Un vrai message envoyé via le harnais HTTP de test, assez long pour passer la validation.',
  })
  const cid = cont.body && cont.body.id
  console.log('contact POST →', cont.status, cid ? 'persisté id=' + cid : JSON.stringify(cont.body).slice(0, 80))

  // Nettoyage du message de test
  const { default: pg } = await import('pg')
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  if (cid) {
    await pool.query('DELETE FROM messages WHERE id=$1', [cid])
    console.log('  (message de test nettoyé, id=' + cid + ')')
  }
  await pool.end()

  console.log('=== TEST SERVERLESS HTTP (façade) TERMINÉ ===')
  if (bad.status !== 401 || (!cid && cont.status !== 200)) {
    console.error('!! résultats inattendus, revoir')
    process.exit(1)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error('ERREUR:', (e && e.message) || e)
  if (e && e.stack) console.error(e.stack.split('\n').slice(1, 4).join('\n'))
  process.exit(1)
})