import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import Stage3D from './projects/Stage3D'
import DetailOverlay from './projects/DetailOverlay'
import { PROJECTS } from './projects/data'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Projets — showcase premium à profondeur (ex-carousel).
 *
 * La scène 3D (Stage3D) montre le projet actif au premier plan entouré de
 * ses voisins ; chaque projet expose plusieurs vues légendées (LUMO en a
 * 5 réelles). Clic sur le visuel → vue détaillée immersive (DetailOverlay)
 * avec continuité spatiale : l'image cliquée s'agrandit réellement (FLIP
 * layoutId), galerie complète, navigation projet ↔ projet.
 *
 * Conservé : contenus, liens, index latéral, fiche éditoriale, flèches,
 * progression, compteur aria-live, clavier scopé, drag/swipe, labels
 * curseur contextuels.
 */
export default function ProjectsCarousel() {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const [views, setViews] = useState(() => PROJECTS.map(() => 0))
  const [detail, setDetail] = useState(false)
  const [sourceProject, setSourceProject] = useState(null)
  const zoneRef = useRef(null)
  const reduced = useReducedMotion()
  const inZone = useInView(zoneRef, { amount: 0.25 })
  const p = PROJECTS[idx]
  const total = PROJECTS.length

  const go = (next) => {
    const target = (((next % total) + total) % total)
    setDir(target > idx ? 1 : -1)
    setIdx(target)
  }

  // vue du projet actif (persiste par projet — §34)
  const setView = (v) => setViews((prev) => prev.map((x, j) => (j === idx ? v : x)))

  const openDetail = () => {
    setSourceProject(PROJECTS[idx].n)
    setDetail(true)
  }

  // clavier : uniquement quand la section est à l'écran, jamais depuis un
  // champ, jamais pendant la vue détaillée (qui a son propre clavier)
  useEffect(() => {
    const onKey = (e) => {
      if (!inZone || detail) return
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (e.key === 'ArrowRight') go(idx + 1)
      if (e.key === 'ArrowLeft') go(idx - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, inZone, detail])

  return (
    <section id="projets" className="relative section-ample" aria-roledescription="carrousel">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <SectionHeading label="Projets" title="Des outils livrés de A à Z" />

        <div ref={zoneRef} className="mt-14 grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-14">
          {/* Index vertical numéroté (desktop) + pastilles (mobile) */}
          <div className="flex flex-row items-center gap-2 lg:flex-col lg:items-stretch lg:gap-0">
            {PROJECTS.map((x, i) => {
              const active = i === idx
              return (
                <button
                  key={x.n}
                  type="button"
                  onClick={() => go(i)}
                  aria-current={active ? 'true' : undefined}
                  aria-label={`Projet ${x.title}`}
                  className="group relative flex items-center gap-3 pb-3 font-mono text-sm transition-colors lg:justify-end lg:pb-0"
                >
                  <span className={`hidden transition-colors lg:inline ${active ? 'text-[var(--accent)]' : 'text-[var(--text-3)] group-hover:text-[var(--text-2)]'}`}>
                    {x.n}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`h-[2px] w-6 transition-all duration-300 lg:h-8 lg:w-[2px] ${active ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)] group-hover:bg-[var(--accent)]/50'}`}
                    style={active ? { transform: 'scaleY(1)' } : {}}
                  />
                </button>
              )
            })}
          </div>

          {/* Scène + fiche éditoriale : côte à côte sur grand écran
              (la section respire, la fiche se lit comme un panneau),
              empilées sur tablette/mobile */}
          <div className="grid gap-10 xl:grid-cols-[1.22fr_0.78fr] xl:items-start xl:gap-12">
            {/* colonne visuelle : la scène (cadre qui clippe les voisines
                en biseau sur les bords — jamais de débordement) + contrôles */}
            <div>
              <div className="overflow-hidden">
                <Stage3D
                  projects={PROJECTS}
                  idx={idx}
                  view={views[idx]}
                  onView={setView}
                  onGo={go}
                  onOpen={openDetail}
                />
              </div>

              {/* flèches + progression + compteur */}
              <div className="mt-6 flex items-center gap-3">
                <button type="button" onClick={() => go(idx - 1)} aria-label="Projet précédent" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border t-border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => go(idx + 1)} aria-label="Projet suivant" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border t-border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
                <span aria-hidden="true" data-testid="carousel-progress" className="ml-2 h-[2px] flex-1 overflow-hidden rounded-full" style={{ background: 'var(--bg-3)' }}>
                  <motion.span
                    className="block h-full origin-left rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }}
                    initial={false}
                    animate={{ scaleX: (idx + 1) / total }}
                    transition={{ duration: 0.55, ease: EASE }}
                  />
                </span>
                <span className="font-mono text-sm t-text3" aria-live="polite">{p.n} <span className="mx-1 opacity-40">/</span> 0{total}</span>
              </div>
            </div>

            {/* fiche éditoriale — panneau latéral, traverse les projets */}
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={idx}
                custom={dir}
                initial={{ opacity: 0, x: dir * 34, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: dir * -34, filter: 'blur(4px)' }}
                transition={{ duration: reduced ? 0 : 0.38, ease: EASE }}
                className="rounded-2xl border p-6 t-surface t-border md:p-7"
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em] t-coral">{p.role}</p>
                <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight t-text md:text-4xl">{p.title}</h3>
                <div className="mt-6 space-y-4">
                  <Row k="Le contexte" v={p.context} />
                  <Row k="Le problème" v={p.problem} />
                  <Row k="Le résultat" v={p.result} />
                </div>
                <div className="mt-7 border-t pt-5 t-border">
                  <div className="font-mono text-[11px] uppercase tracking-wider t-text3">Périmètre livré</div>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                    {p.scope.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-[14px] t-text2">
                        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: 'var(--accent)' }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="rounded-full border px-3 py-1 font-mono text-[12px] t-text2" style={{ borderColor: 'var(--border)' }}>{s}</span>
                  ))}
                </div>
                <a
                  href={p.href}
                  target={p.external ? '_blank' : undefined}
                  rel={p.external ? 'noreferrer' : undefined}
                  data-cursor={p.external ? 'Ouvrir' : 'Découvrir'}
                  className="cta-glow mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white hover:brightness-110"
                  style={{ background: 'var(--flame)' }}
                >
                  {p.cta}
                  <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true" />
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* vue détaillée immersive — continuité spatiale depuis la slide */}
      <AnimatePresence>
        {detail && (
          <DetailOverlay
            projects={PROJECTS}
            idx={idx}
            view={views[idx]}
            onView={setView}
            onGo={go}
            onClose={() => setDetail(false)}
            sourceProject={sourceProject}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function Row({ k, v }) {
  return (
    <div className="border-l-2 pl-4" style={{ borderColor: 'var(--accent)' }}>
      <div className="font-mono text-[11px] uppercase tracking-wider t-text3">{k}</div>
      <p className="mt-1 text-[16px] leading-relaxed t-text2">{v}</p>
    </div>
  )
}
