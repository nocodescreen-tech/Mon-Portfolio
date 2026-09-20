# AGENTS.md — Portfolio René Descartes

Site portfolio Vite + React 19 + Tailwind 4. Thème graphite+flamme (accent `#ff5b2e`), contenu en français, localisation Matadi, RDC.

## Standards motion & UI (OBLIGATOIRES — détails dans `.cursor/rules/`)

- **Toujours lire et appliquer les règles de `.cursor/rules/`** :
  - `motion-design-stack.mdc` — stack animation : framer-motion, three.js/R3F, lenis, lucide, sonner (jamais gsap/animejs/ogl/FontAwesome)
  - `threejs-scenes-3d.mdc` — scènes 3D : R3F + drei + post-processing, fallback mobile/reduced-motion obligatoire
  - `emotion-visuelle-microinteractions.mdc` — émotion visuelle : reveals, boutons magnétiques, spotlight, feedback
- Toute nouvelle animation/nouvelle section doit respecter ces standards : easing `[0.22, 1, 0.36, 1]`, `prefers-reduced-motion`, hover feedback sur chaque élément interactif, patterns premium type 21st.dev/getlayers/Horizon UI adaptés au thème graphite+flamme.

## QA visuelle

- Scripts Playwright dans `tools/qa/` (captures + checks console). Lancer le dev server (`npm run dev`) puis un script `.cjs` avec Chrome/Edge headless pour valider un rendu avant de considérer une tâche finie.
