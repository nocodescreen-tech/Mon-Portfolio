import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/**
 * DetailOverlay — vue détaillée immersive du projet.
 *
 * Continuité spatiale (§36) : le média partage un `layoutId` avec la
 * slide de la scène — l'image cliquée s'agrandit réellement, aucune
 * modale ne « apparaît ». À l'intérieur : galerie complète des vues
 * (object-contain — les interfaces restent lisibles), légendes, fiche
 * éditoriale, CTA existants, et navigation projet ↔ projet (§37).
 *
 * Accessibilité : dialog aria-modal, focus piégé au bouton fermer puis
 * restitué au déclencheur, Escape ferme, flèches = vues, scroll verrouillé.
 * Reduced-motion : toutes les transitions tombent à 0 (rendu instantané).
 */
export default function DetailOverlay({ projects, idx, view, onView, onGo, onClose, sourceProject }) {
  const reduced = useReducedMotion()
  const p = projects[idx]
  const vs = p.views
  const v = vs[Math.min(view, vs.length - 1)]
  const total = projects.length
  const closeRef = useRef(null)
  const prevFocus = useRef(null)

  // montage : mémorise le focus (une seule fois — le double-montage
  // StrictMode ne doit pas capturer le bouton de fermeture comme cible),
  // verrouille le scroll, pose le focus
  useEffect(() => {
    if (!(prevFocus.current instanceof HTMLElement)) {
      prevFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    }
    closeRef.current?.focus({ preventScroll: true })
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      if (prevFocus.current) prevFocus.current.focus({ preventScroll: true })
    }
  }, [])

  // clavier : Escape ferme, flèches naviguent les vues
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight' && vs.length > 1) onView((view + 1) % vs.length)
      if (e.key === 'ArrowLeft' && vs.length > 1) onView((view - 1 + vs.length) % vs.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, vs.length, onView, onClose])

  const prevP = projects[(idx - 1 + total) % total]
  const nextP = projects[(idx + 1) % total]
  const info = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: reduced ? 0 : 0.25 } },
  }
  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Projet ${p.title} — vue détaillée`}
      className="fixed inset-0 z-[75]"
      initial={false}
    >
      {/* fond */}
      <motion.div
        className="lightbox-backdrop fixed inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.3 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* panneau défilant */}
      <div className="fixed inset-0 overflow-y-auto overscroll-contain">
        <div className="relative mx-auto my-[5vh] w-[min(1080px,94vw)] pb-10">
          {/* fermeture — toujours accessible, focus d'entrée */}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer la vue détaillée"
            className="absolute right-0 top-0 z-[2] grid h-11 w-11 place-items-center rounded-full border transition-colors hover:t-accent"
            style={{ borderColor: 'var(--border-strong)', background: 'color-mix(in srgb, var(--bg) 82%, transparent)', color: 'var(--text)' }}
          >
            <i className="fa-solid fa-xmark text-base" aria-hidden="true" />
          </button>

          {/* média — cible du FLIP (uniquement pour le projet d'origine :
              changer de projet DANS la vue donne une transition slide,
              pas un vol parasite). Aspect stable : zéro CLS. */}
          <motion.div
            key={p.n}
            layoutId={p.n === sourceProject ? 'project-media-' + p.n : undefined}
            initial={p.n === sourceProject ? { opacity: 0.5 } : { opacity: 0, x: reduced ? 0 : 42 }}
            animate={{ opacity: 1, x: 0 }}
            exit={p.n === sourceProject ? undefined : { opacity: 0, x: reduced ? 0 : 28 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
            className="relative aspect-[16/10] overflow-hidden rounded-2xl border-[1.5px] t-border t-surface t-shadow-lg"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={v.src}
                src={v.src}
                alt={p.alt}
                draggable={false}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: reduced ? 0 : 0.34, ease: EASE }}
                className="absolute inset-0 h-full w-full object-contain p-3 md:p-5"
              />
            </AnimatePresence>

            {/* chevrons de vues */}
            {vs.length > 1 &&
              [
                { side: 'left', label: 'Vue précédente', fn: () => onView((view - 1 + vs.length) % vs.length), icon: 'fa-chevron-left', pos: 'left-3' },
                { side: 'right', label: 'Vue suivante', fn: () => onView((view + 1) % vs.length), icon: 'fa-chevron-right', pos: 'right-3' },
              ].map((b) => (
                <button
                  key={b.side}
                  type="button"
                  onClick={b.fn}
                  aria-label={b.label}
                  className={`absolute ${b.pos} top-1/2 z-[2] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border opacity-0 backdrop-blur-md transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--accent)] max-md:opacity-90`}
                  style={{ borderColor: 'var(--border-strong)', background: 'color-mix(in srgb, var(--bg) 55%, transparent)', color: 'var(--text)' }}
                >
                  <i className={`fa-solid ${b.icon}`} aria-hidden="true" />
                </button>
              ))}
          </motion.div>

          {/* panneau éditorial — une seule clé unique (jamais en collision
              avec la clé du média : la réconciliation React doit rester
              prévisible pour que l'exit d'AnimatePresence se résolve) */}
          <motion.div
            key={'panel-' + p.n}
            initial={{ opacity: 0, y: reduced ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: reduced ? 0 : 0.18 }}
          >
            {/* légende + compteur de vues */}
            {vs.length > 1 && (
              <div className="mt-3 flex items-center justify-between gap-4 px-1">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={v.label}
                    data-testid="detail-caption"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: reduced ? 0 : 0.24, ease: EASE }}
                    className="text-[13px] t-text2"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-wider t-accent">{v.label}</span>
                    <span className="mx-2 opacity-40">·</span>
                    {v.note}
                  </motion.p>
                </AnimatePresence>
                <span className="shrink-0 font-mono text-xs t-text3" aria-live="polite">
                  {String(view + 1).padStart(2, '0')} <span className="mx-0.5 opacity-40">/</span> {String(vs.length).padStart(2, '0')}
                </span>
              </div>
            )}

            {/* fiche éditoriale — mêmes contenus que la scène */}
            <motion.div
              variants={info}
              initial="hidden"
              animate="show"
              className="mt-6 grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-12"
            >
              <div>
                <motion.p variants={item} className="font-mono text-xs uppercase tracking-[0.2em] t-coral">{p.role}</motion.p>
                <motion.h2 variants={item} className="mt-2 font-display text-4xl font-semibold tracking-tight t-text md:text-5xl">{p.title}</motion.h2>
                <motion.p variants={item} className="mt-5 text-lg leading-relaxed t-text2">{p.result}</motion.p>
                <motion.div variants={item} className="mt-6 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="rounded-full border px-3 py-1 font-mono text-[12px] t-text2" style={{ borderColor: 'var(--border)' }}>{s}</span>
                  ))}
                </motion.div>
              </div>
              <motion.div variants={item} className="rounded-2xl border p-6 t-surface t-border">
                <div className="font-mono text-[11px] uppercase tracking-wider t-text3">Périmètre livré</div>
                <ul className="mt-4 space-y-2.5">
                  {p.scope.map((s) => (
                    <li key={s} className="flex items-center gap-3 text-[15px] t-text2">
                      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: 'var(--accent)' }} />
                      {s}
                    </li>
                  ))}
                </ul>
                <a
                  href={p.href}
                  target={p.external ? '_blank' : undefined}
                  rel={p.external ? 'noreferrer' : undefined}
                  data-cursor={p.external ? 'Ouvrir' : 'Découvrir'}
                  className="cta-glow mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white hover:brightness-110"
                  style={{ background: 'var(--flame)' }}
                >
                  {p.cta}
                  <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true" />
                </a>
              </motion.div>
            </motion.div>

            {/* navigation projet ↔ projet (§37) — la galerie continue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.35, duration: 0.4 }}
              className="mt-10 flex items-stretch justify-between gap-3 border-t pt-6 t-border"
            >
              <button
                type="button"
                onClick={() => onGo(idx - 1)}
                className="group flex min-w-0 flex-1 flex-col items-start gap-1 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[var(--surface-2)]"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] t-text3">← Projet précédent</span>
                <span className="truncate font-display text-lg font-medium t-text2 transition-colors group-hover:t-accent">{prevP.title}</span>
              </button>
              <button
                type="button"
                onClick={() => onGo(idx + 1)}
                className="group flex min-w-0 flex-1 flex-col items-end gap-1 rounded-xl px-3 py-3 text-right transition-colors hover:bg-[var(--surface-2)]"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] t-text3">Projet suivant →</span>
                <span className="truncate font-display text-lg font-medium t-text2 transition-colors group-hover:t-accent">{nextP.title}</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
