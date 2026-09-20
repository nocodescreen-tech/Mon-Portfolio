# Déploiement — Message de contact persistant + Boîte de réception admin

Le portfolio garde un frontend Vite SPA unique. La persistance se fait via des
**fonctions serverless Vercel** (`api/`) + **Postgres Supabase** (`pg`).

## Architecture

```
backend (Vercel serverless)
  api/contact.js            POST public — reçoit un message : persiste + email
  api/admin/login.js        POST — connexion admin → JWT
  api/admin/logout.js       POST — révoque la session
  api/admin/messages.js     GET/PATCH/DELETE — CRUD messages (auth JWT)
  api/admin/stats.js        GET — statistiques dashboard (auth JWT)
  api/admin/repondre.js     POST — répond par email, marque "repondu" (auth JWT)
  api/_db.js  _auth.js      helpers partagés (préfixe `_` = non exposé)
  db/init.sql               schéma Postgres (idempotent, réversible)
  tools/seed-admin.js       init schéma + création admin

frontend (SPA)
  src/admin/AdminApp.jsx    boîte de réception privée — route #/admin (lazy)
  ContactForm → /api/contact (déjà branché)
```

## Étapes

### 1. Env (local + Vercel identiques)
Reporter dans **Vercel → Settings → Environment Variables** (et dans `.env` local pour dev) :

| Variable | Exemple |
|---|---|
| `DATABASE_URL` | connexion string Supabase `postgresql://…` |
| `JWT_SECRET` | longue chaîne aléatoire (gen via `openssl rand -hex 32`) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` / `CONTACT_TO` | expéditeur/ destinataire |

`.env` local est déjà gitignoré. Le `.env.example` documente tout.

### 2. Base (une seule fois)
Deux façons :
- **SQL Supabase** : copier `db/init.sql` dans l'éditeur SQL de Supabase, exécuter.
- **CLI** : `DATABASE_URL="$DATABASE_URL" node tools/seed-admin.js "no.codescreen@gmail.com" "VOTRE_MOT_DE_PASSE"` 
  (applique le schéma ET crée l'admin).

### 3. Déploiement
`vercel --prod` (ou pousser sur la branche liée). `vercel.json` assure les rewrites
SPA : toute route hors `/api` → `/index.html`, y compris `#/admin`.

### 4. Utilisation
- Boîte : site → `/#/admin` → connexion → boîte de réception / dashboard.
- Répondre depuis la boîte = email réel vers le visiteur (SMTP) + statut "repondu".

## Sécurité déjà en place
- Honeypot anti-bot + validation serveur + rate-limit (10/10 min/IP).
- JWT signé, sessions révocables côté base, mot de passe admin hashé **scrypt**.
- SQL 100 % paramétré (pas d'interpolation).
- Préfixe `_` : les helpers ne sont pas exposés comme routes par Vercel.

## Rollback / réversibilité
Les instructions `DROP …` sont en commentaire en bas de `db/init.sql`.