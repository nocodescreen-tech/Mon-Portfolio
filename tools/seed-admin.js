#!/usr/bin/env node
// ============================================================
// Script d'initialisation admins (local / CI).
//   node tools/seed-admin.js "email" "motdepasse"
// Insert ou met à jour l'admin. Exige DATABASE_URL dans l'env.
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPool } from '../api/_db.js'
import { hashPassword } from '../api/_auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function run() {
  const email = process.argv[2]
  const pw = process.argv[3]
  const [schemaFile] = process.argv.slice(4)

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL manquant. Exportez-la d\'abord.')
    process.exit(1)
  }

  const pool = getPool()
  let client
  try {
    client = await pool.connect()

    // 1) Appliquer le schéma (idempotent)
    const sql = fs.readFileSync(path.join(__dirname, '../db/init.sql'), 'utf8')
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('✓ Schéma appliqué (messages/admin/sessions).')

    if (email && pw) {
      const hash = hashPassword(pw)
      await client.query(
        `INSERT INTO admin (email, mot_de_passe, nom)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET mot_de_passe = EXCLUDED.mot_de_passe, nom = EXCLUDED.nom`,
        [email, hash, email.split('@')[0]],
      )
      console.log(`✓ Admin prêt : ${email}`)
    } else {
      console.log('ℹ Aucun admin créé (passez un email + mot de passe).')
    }
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {})
    console.error('❌', err.message)
    process.exit(1)
  } finally {
    if (client) client.release()
    await pool.end().catch(() => {})
  }
}

run()