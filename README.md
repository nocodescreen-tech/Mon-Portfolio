# Portfolio — René Descartes

Portfolio professionnel React (Vite) — direction artistique **"LUMO — brass & ink"** :
encre profonde, laiton lumineux, typographie Fraunces + Space Grotesk + JetBrains Mono,
motifs de rayons de lumière, coins coupés "couture", animations Framer Motion.

## Démarrer en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de production dans dist/
npm run preview    # prévisualiser le build
```

> Si le port 5173 est occupé (ex : un autre projet Vite), utilisez `npm run dev -- --port 5174`.

## Formulaire de contact — vraiment fonctionnel

Le formulaire envoie vers `/api/contact` (fonction serverless Vercel) avec :

- **Validation client** : nom, email (regex), message, erreurs affichées sous chaque champ
- **Honeypot anti-spam** : champ invisible, les bots se font ignorer silencieusement
- **Rate limiting serveur** : 5 envois / 10 min / IP (→ 429)
- **Validation serveur** : nom, email, message re-vérifiés côté API
- **Envoi email** : via SMTP (nodemailer), HTML + texte, reply-to = l'expéditeur
- **Repli mailto** : si l'API n'est pas déployée (dev local), le navigateur ouvre
  un email pré-rempli — le formulaire ne « casse » jamais

### Configuration SMTP (déploiement Vercel)

1. Poussez ce dépôt sur Vercel (framework preset Vite, le dossier `api/` est auto-détecté)
2. Dashboard Vercel → Settings → Environment Variables :

| Variable | Exemple |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | votre adresse d'envoi |
| `SMTP_PASS` | mot de passe applicatif (Gmail → "App password") |
| `SMTP_FROM` | `Portfolio <no-reply@votresite.com>` (optionnel) |
| `CONTACT_TO` | `no.codescreen@gmail.com` (votre boîte de réception) |

> Sans SMTP configuré, l'API répond 503 et le client bascule sur le repli mailto —
> le site reste utilisable en attendant.

## Contenu personnalisable

Tout le contenu vit dans **`src/data/content.js`** : profil, stats, qualités,
compétences, fonctionnalités LUMO, timeline, textes « à propos ».

Les visuels LUMO réels sont dans **`public/lumo/`** (logo, 5 captures d'écran,
dashboard mobile, portrait). La galerie projet est `src/components/LumoScreens.jsx`.

## Stack

React 19 · Vite 8 · Tailwind CSS v4 · Framer Motion · Font Awesome 6 · nodemailer (API)

## QA

`qa2.cjs` (Playwright + Edge headless) vérifie : sections, débordement horizontal,
rendu des icônes, chargement des images, validation du formulaire, honeypot,
lightbox — sur desktop et mobile.
