# AUDIT + DESIGN CONCEPT MAP — Portfolio René Descartes

_Établi à partir du code réel (pas d'hypothèses). Comportement documenté à la racine.

---

## PARTIE A — AUDIT DU PROJET EXISTANT

### 1. Architecture
- **Stack** : Vite 8 · React 19 · Tailwind 4 (via `@tailwindcss/vite`) · motion (framer-motion) · Lenis · React Three Fiber + drei + postprocessing · lucide-react · sonner · FontAwesome (fallback).
- **Structure** : `src/components/*` (23 composants) monodossier plat, `data/content.js` = source de contenu, `src/index.css` = design system complet.
- **Backend** : `api/*` serverless Vercel (contact persistant Supabase Postgres + admin JWT en cookie httpOnly) — **récent et fonctionnel, à conserver tel quel**.
- **Routing** : SPA une page ; `#/admin` = boîte privée (lazy).

### 2. Ce qui est FORT (KEEP)
- Design system graphite+flamme **cohérent et complet** (vars `--bg/--text/--accent`, thème sombre/clair, radius/shadow/motion units). Identité reconnaissable.
- Accessibilité déjà sérieuse : `prefers-reduced-motion` respecté, focus-visible, scroll-margin, ARIA (drawer dialog, aria-pressed), skip-link, hover sans info exclusive.
- Perf déjà pensée : 3D desktop+lazy+fallback mobile, DPR ≤ 2, images lazy, FontAwesome réduit, Lenis root.
- Étude de cas LUMO riche (vraies captures navigables), contenu 100 % réel (zéro chiffre/clients inventés) — conforme à la mission.
- Grandes sections éditoriales : numérotation, annotations mono, marges généreuses.

### 3. Ce qui est RÉPÉTITIF / GÉNÉRIQUE (REFACTOR)
Risque « portfolio IA » identifié, par ordre :
1. **Navigation conventionnelle** : top bar fixe + links list ou horizontal ×8 liens + tiroir latéral standard. Fonctionnel mais attendu. → **passer à un index éditorial latéral / compact**.
2. **Sections à rythme uniforme** : presque toutes `py-24 md:py-32` + `max-w-6xl` + `SectionHeading` + grilles de `Card` hover/spotlight. Variété de composition insuffisante.
3. **Badge/étiquette répété** : pattern « puce + label mono uppercase + accent » très présent (hero, case study, features, skills). À garder comme fil conducteur mais à diversifier la mise.
4. **CTA récurrents** : `rounded-full border` + `cta-glow` partout → même forme. Unifier via un vrai système de boutons sémantiques.
5. **Hero** : titre 2 lignes + 2 boutons + scène à droite + gradient voile. Le fond gauche (« scenic drop ») est correct, mais la nav `Disponible` + 2 CTA est le cliché exact à éviter.
6. **Aurora** : orbes + poussières en dur sur tout l'écran fixe → joli mais très « ambient template » ; le garder discret mais l'ordonner au système.

### 4. Ce qui est FAIBLE / MANQUE
- **Typographie display peu exploitée** : Space Grotesk existe mais pas de type monumentale / masques texte / kinetic.
- **Navigation sans personnalité ni index numérique** au desktop (le drawer mobile a déjà `01..08`, le desktop non).
- **Aucun élément signature** propre (pas de motif récurrent : coordonnées, grille pointillée « produit tech », trait flamme).
- **Sections Projects en cards égales** alors que LUMO mérite un moment horizontal / full-bleed.
- **Contact = formulaire classique** ; pas de scène de fin de parcours, pas d'état de disponibilité fort.
- Scroll : Lenis est là mais **peu de liens scroll↔motion** hormis parallax/MediaZoom.

---

## PARTIE B — DESIGN CONCEPT MAP

### 1. Direction artistique (1 phrase)
**« Plateau technique éditorial »** : un studio de fabrication numérique où chaque section est une *plaque* sur fond graphite, reliée par un **fil flamme** (accent corail) et des **coordonnées techniques** (repères mono, axes, numéros). Sobre-lumineux-alternant, jamais de bento/gradient générique.

### 2. Visual language
- Arrière-plan graphite (`#121316`) → grandes **plaques** (sections) alternant fond plein / fond `--bg-2` / zone négative.
- **Motif signature** : fine grille de points (`background-image radial-gradient` 0.5px, opacité très basse) disposée en coin de section + **trait flamme** dégradé 90°.
- Asymétrie : colonnes 5/7, images qui débordent de leur grille, objets « hors cadre ».
- Métadonnées : coordonnées `00–INDEX`, latitude/longitude symboliques Matadi, horodatage, numéros `01/04`.

### 3. Typography
- Display **Space Grotesk** (garde) — monumentale en hero (`clamp(3rem,11vw,8rem)`), tracking serré.
- Texte **Inter** (garde), labels **DM Mono** (garde) — inchangé, c'est déjà bon.
- Ajout : **masque texte** sur certaines titres (clip-path reveal), taille géante sur chiffres de stats qui débordent.

### 4. Color system (garde + ordonne)
Garde les vars existantes — elles sont justes. On ajoute :
- `--grid-dot: rgba(255,91,46,0.05)` pour le motif.
- `--flame` gradient dédié (accent→accent-2) centralisé.
- 1 couleur « succès/neuf » réservée au statut disponible.

### 5. Grid / Spacing
- Conteneur large 6xl conservé, mais sections avec **plein-bleed** alternés et colonnes non symétriques (5/7, 4/8).
- Espacement : garder les échelles `--dur`/`--dur-med` ; introduire `--section-a`/`--section-b` (120px/240px) pour que le rythme varie.

### 6. Navigation concept
**Index compact latéral** à gauche (desktop) : bouts de ligne numérotés pré-xs + label au hover, doux. En plus d'une **barre supérieure minimale** (logo + actions seules, pas 8 liens). Mobile : drawer conservé (déjà bon).
→ Lien direct avec le pattern « repères / coordonnées » de l'identité.

### 7. Hero concept
**Un, fort.** Direction retenue : **scène objet + type monumentale en masque**.
- Gauche : titre géant en reveal masqué (« René » / « Descartes »), une ligne « studio technique », status disponible discret.
- Droite : l'existante **sphère iridescente R3F** comme un « cœur » au-dessus d'un disque réflecteur — on la **garde mais on lui donne un rôle** : elle tourne au scroll (scrollProgress), la caméra se rapproche légèrement.
- Supprimer le double CTA dans le hero → un seul bouton « Demarrer un projet », l'autre déplacé en nav.
- Métadonnées bas : `MATADI · RDC` / `07.62°S 13.46°E` / scroll cue.

### 8. About / Identité
Conserver portrait réel + repères chiffrés (déjà vrais). Ajouter : **ligne « diapason »** (texte qui se révèle au scroll ligne à ligne), chiffre géant en filigrane.

### 9. Projets — traitement case study différencié
- LUMO (featured) → **moment horizontal** : full-bleed, image large qui défile, pas de card égale. Garde le lien vers l'étude de cas.
- Les 3 autres → **liste éditoriale** : une ligne par projet (n° + titre + stack + flèche), pas de 3 cards identiques. Hover = reveal d'une image de bord qui suit la souris *ou* teinte accent.
- Au clic : LUMO → section en cascading navigable (captures), les autres → liens existants.

### 10. Contact — fin de parcours
- État « Disponible » + email en gros.
- Formulaire **déjà persistant** (Supabase) conservé (il marche, ne pas recasser).
- Mise en scène : grande zone, mailto doublé, statut en direct.

### 11. 3D
**Une seule scène (hero)** : sphère iridescente + gyroscope léger + particules (existantes), avec contrôle scroll + redimensionnement, pause hors viewport, discontinued sur mobile/reduced-motion. On n'ajoute PAS de 3D ailleurs.

### 12. Shader concept
Passif : on utilise l'**iridescence** du material + la réflexion, pas de shader GLSL coûteux. Si un fade de transition section est ajouté, en CSS clip-path, pas en shader. → **aucun shader lourd**. (Respecte perf + mission « pas partout ».)

### 13. Motion language (un seul moteur)
On **garde framer-motion (Motion)** — déjà utilisé, Lenis pour scroll. Pas de GSAP (one job : Motion). Règles :
- Easing unique `[0.22,1,0.36,1]` (existe).
- Reveals : masque (clip-path) pour titres, fade+y pour blocs, stagger maîtrisé.
- Scroll-linked : hero scrollProgress → sphère + camera ; Parallax sur images ; MediaZoom conservé.
- Hover : magnetic sur CTA principal, tilt sur visuels, accent border sur projets.
- Modération : le silence visuel est gardé (sections contenu pleines = pas d'animation).

### 14. Cursor
**Ajout léger (desktop only, désactivé mobile/tactile/reduced-motion)** : un point + anneau qui suit, qui grossit et affiche « Voir » sur les projets, « Ouvrir » sur les liens. Éliminé si impropre (perf). État link / project. → optionnel mais inclus si aucune dégradation.

### 15. Responsive
- Desktop : immersive (index lateral, hero 3D, projets horizontaux).
- Tablet : adaptatif (index→haut, projets en grille 2).
- Mobile : focused — 3D remplacée par 2D (déjà), nav drawer (déjà), projets en une colonne dense avec n° géant, padding réduit.

### 16. Perf
- Garder : lazy 3D, DPR cap, images lazy, FontAwesome réduit, Lenis root.
- Ajouter : `content-visibility` sur sections hors écran, dimension réelle sur images (éviter CLS), pause RAF hors viewport, chargement différé du composant cursor, `will-change` minimal.

### 17-18-19. Accessibility / risques
- Conserver : reduced-motion, focus-visible, ARIA, skip-link, contrast.
- Risques à surveiller : curseur (ne doit JAMAIS masquer un état focus natif → désactivé reduced-motion), index lateral (bien focusable), moments horizontaux (overflow scroll accessibles clavier + aria), CLI (aucune information hover-only).

---

## PARTIE C — STRATÉGIES & LIBRARIES

### Libraries RETENUES
- motion (déjà) — moteur d'animation **_un_**
- lenis (déjà) — smooth scroll
- @react-three/fiber + drei (déjà) — _une_ scène hero
- lucide-react — icônes (lire AGENTS : remplacer FontAwesome par lucide progressivement)
- tailwind-merge (déjà)

### Libraries REFUSÉES (et pourquoi)
- **GSAP / ScrollTrigger** : Motion suffit ; deux moteurs = dette (règle one-job-one-tool).
- **Shadercanvas / shaders** : iridescence matériau suffit, pas de GLSL coûteux.
- **ThreeUI / Rive / postprocessing lourd** : coût perf pour zéro gain sur une seule scène.
- **Nouvelles libs UI** (aceternity, reactbits, 21st) : réutilisées **comme inspiration de patterns**, pas installées — le code du design system existant reste la source.

### Motion strategy
Motion(framer) unifié + Lenis ; easing `[0.22,1,0.36,1]` ; reveals en masque ; scroll-linked uniquement là où ça raconte (hero sphère, parallax portraits, MediaZoom) ; silence visuel assumé.

### 3D strategy
Une seule scène hero, lazy, desktop-only, avec fallback 2D mobile, pause hors écran, DPR≤2. Objectif : **qu'elle paraisse un objet, pas un effet**.

### Performance strategy
Lazy + code-split des scènes/cursor/admin, `content-visibility`, dimension images, RAF pause hors viewport, `will-change` ciblé, zéro re-render superflu (useMemo/useCallback dans les composants motion).

---

## PARTIE D — RÈGLE DE CONTRÔLE
Avant chaque visuel récurrent : utile ? cohérent ? original ? performant ? accessible ? adapté ? → si « ressemble à un template IA », on change.

---

_Ne jamais détruire ce qui fonctionne. Toute modification préservera le backend contact existant._