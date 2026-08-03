import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SHOTS = [
  { src: '/lumo/screen1.png', caption: 'Tableau de bord — vue d’ensemble', wide: true },
  { src: '/lumo/screen2.png', caption: 'Gestion des ventes & achats', wide: true },
  { src: '/lumo/screen3.png', caption: 'Stock & produits', wide: true },
  { src: '/lumo/screen4.png', caption: 'Interface responsive', wide: false },
  { src: '/lumo/screen5.png', caption: 'Statistiques & rapports', wide: true },
  { src: '/lumo/dashboard_mobile.png', caption: 'Dashboard mobile', wide: false },
  { src: '/lumo/architecture.png', caption: 'Architecture technique (PERN)', wide: true },
]

/** Galerie de captures réelles de LUMO avec lightbox. */
export default function LumoScreens() {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(null) // index ou null

  const open = useCallback((i) => setLightbox(i), [])
  const close = useCallback(() => setLightbox(null), [])
  const step = useCallback(
    (dir) => setLightbox((cur) => (cur === null ? cur : (cur + dir + SHOTS.length) % SHOTS.length)),
    []
  )

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, close, step])

  const shot = SHOTS[active]

  return (
    <div>
      {/* cadre navigateur */}
      <div className="corner-cut relative overflow-hidden border border-brass/20 bg-ink-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-2 border-b border-brass/15 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex items-center gap-1.5 font-mono text-[10px] text-fog">
            <img src="/lumo/lumo_logo.svg" alt="" className="h-3.5 w-3.5" />
            lumo.app — capture réelle
          </span>
        </div>

        <button
          type="button"
          onClick={() => open(active)}
          className="group relative block w-full cursor-zoom-in bg-ink"
          aria-label={`Agrandir la capture : ${shot.caption}`}
        >
          <img
            src={shot.src}
            alt={shot.caption}
            className="w-full object-cover"
            loading="lazy"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/40 group-hover:opacity-100">
            <span className="corner-cut-sm flex items-center gap-2 bg-brass px-4 py-2 font-mono text-[12px] font-semibold text-ink">
              <i className="fa-solid fa-expand" aria-hidden="true" />
              Agrandir
            </span>
          </span>
        </button>
        <div className="flex items-center justify-between gap-3 border-t border-brass/10 px-4 py-2.5">
          <span className="font-mono text-[11px] text-fog">{shot.caption}</span>
          <span className="font-mono text-[10px] text-brass/70">
            {active + 1} / {SHOTS.length}
          </span>
        </div>
      </div>

      {/* vignettes */}
      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6" role="tablist" aria-label="Captures LUMO">
        {SHOTS.map((s, i) => (
          <button
            key={s.src}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`corner-cut-sm relative overflow-hidden border transition-all duration-300 ${
              i === active
                ? 'border-brass shadow-[0_0_18px_rgba(240,180,41,0.35)]'
                : 'border-brass/15 opacity-60 hover:opacity-100 hover:border-brass/50'
            }`}
          >
            <img src={s.src} alt="" className="aspect-[2/1] w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lightbox-backdrop fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-10"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Aperçu de capture LUMO"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center corner-cut-sm bg-brass/15 text-brass transition-colors hover:bg-brass hover:text-ink"
            >
              <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); step(-1) }}
              aria-label="Capture précédente"
              className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center corner-cut-sm bg-ink-2/80 text-brass ring-1 ring-brass/30 transition-colors hover:bg-brass hover:text-ink"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
            <motion.figure
              key={lightbox}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={SHOTS[lightbox].src}
                alt={SHOTS[lightbox].caption}
                className="max-h-[82vh] w-auto rounded-sm border border-brass/25 object-contain shadow-2xl"
              />
              <figcaption className="mt-3 text-center font-mono text-[12px] text-brass-soft">
                {SHOTS[lightbox].caption} — {lightbox + 1} / {SHOTS.length}
              </figcaption>
            </motion.figure>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); step(1) }}
              aria-label="Capture suivante"
              className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center corner-cut-sm bg-ink-2/80 text-brass ring-1 ring-brass/30 transition-colors hover:bg-brass hover:text-ink"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
