import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/**
 * DetailOverlay — vue détaillée « étude de cas », présentation cinématique.
 *
 * Continuité spatiale (§36) : le média partage un `layoutId` avec la slide
 * de la scène — l'image cliquée s'agrandit réellement, aucune modale ne
 * « apparaît ». À l'intérieur : média héroïque (62 vh, object-contain pour
 * les interfaces — lisibles en entier), légendes + pagination + compteur
 * sur le média, corps éditorial typographique (zéro boîte dans la boîte),
 * CTA existants, et navigation projet ↔ projet en grands panneaux (§37).
 *
 * Accessibilité : dialog aria-modal, focus posé au bouton fermer puis
 * restitué au déclencheur (garde StrictMode), Escape ferme, flèches = vues,
 * scroll verrouillé. Reduced-motion : transitions à 0 (rendu instantané).
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
        className="fixed inset-0"
        style={{ background: 'color-mix(in srgb, var(--bg) 82%, transparent)', backdropFilter: 'blur(14px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.32 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* présentation défilante */}
      <div className="fixed inset-0 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-[min(1150px,94vw)] pb-16 pt-[4vh]">
          {/* barre haute : étude + fermeture */}
          <div className="flex items-center justify-between gap-4 pb-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] t-text3">
              Étude de cas <span className="mx-1 t-accent">{p.n}</span>/ 0{total}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fermer la vue détaillée"
              className="grid h-11 w-11 place-items-center rounded-full border transition-colors hover:t-accent"
              style={{ borderColor: 'var(--border-strong)', background: 'color-mix(in srgb, var(--bg) 70%, transparent)', color: 'var(--text)' }}
            >
              <i className="fa-solid fa-xmark text-base" aria-hidden="true" />
            </button>
          </div>

          {/* média cinématique — cible du FLIP (uniquement pour le projet
              d'origine : changer de projet DANS la vue donne une transition
              slide, pas un vol parasite) */}
          <motion.div
            key={p.n}
            layoutId={p.n === sourceProject ? 'project-media-' + p.n : undefined}
            initial={p.n === sourceProject ? { opacity: 0.5 } : { opacity: 0, x: reduced ? 0 : 42 }}
            animate={{ opacity: 1, x: 0 }}
            exit={p.n === sourceProject ? undefined : { opacity: 0, x: reduced ? 0 : 28 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
            className="group relative h-[62vh] min-h-[420px] overflow-hidden rounded-3xl border-[1.5px] t-border t-surface t-shadow-lg"
          >
            <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={v.src}
                  src={v.src}
                  alt={p.alt}
                  draggable={false}
                  initial={{ opacity: 0, x: 34 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -34 }}
                  transition={{ duration: reduced ? 0 : 0.34, ease: EASE }}
                  className={
                    'absolute inset-0 h-full w-full ' +
                    (v.fit === 'contain' ? 'object-contain p-5 md:p-9' : 'object-cover object-top')
                  }
                />
              </AnimatePresence>
            </div>

            {/* dégradé de lisibilité en bas du média */}
            <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: 'linear-gradient(180deg, transparent, var(--bg) 92%)' }} aria-hidden="true" />

            {/* chevrons de vues — toujours visibles : c'est une galerie */}
            {vs.length > 1 &&
              [
                { label: 'Vue précédente', fn: () => onView((view - 1 + vs.length) % vs.length), icon: 'fa-chevron-left', pos: 'left-4' },
                { label: 'Vue suivante', fn: () => onView((view + 1) % vs.length), icon: 'fa-chevron-right', pos: 'right-4' },
              ].map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={b.fn}
                  aria-label={b.label}
                  className={`absolute ${b.pos} top-1/2 z-[2] grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-105 hover:t-accent focus-visible:outline-2 focus-visible:outline-[var(--accent)] max-md:opacity-90`}
                  style={{ borderColor: 'var(--border-strong)', background: 'color-mix(in srgb, var(--bg) 55%, transparent)', color: 'var(--text)' }}
                >
                  <i className={`fa-solid ${b.icon}`} aria-hidden="true" />
                </button>
              ))}

            {/* légende + pagination + compteur, posés sur le média */}
            {vs.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-6 p-5 md:p-7">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={v.label}
                    data-testid="view-caption"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: reduced ? 0 : 0.26, ease: EASE }}
                    className="min-w-0"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] t-accent">{v.label}</span>
                    <p className="mt-1 truncate text-[14px] t-text2">{v.note}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    {vs.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        onClick={() => onView(i)}
                        data-testid={`view-seg-${i}`}
                        className={`h-[3px] rounded-full transition-all duration-300 ${i === view ? 'w-8' : 'w-4 hover:w-6'}`}
                        style={{ background: i === view ? 'var(--accent)' : 'var(--border-strong)' }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs t-text3" aria-live="polite">
                    {String(view + 1).padStart(2, '0')} <span className="mx-0.5 opacity-40">/</span> {String(vs.length).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* corps éditorial — typographique, zéro boîte dans la boîte */}
          <motion.div
            key={'panel-' + p.n}
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : 0.18 }}
            className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] t-coral">{p.role}</p>
              <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-tight t-text" style={{ letterSpacing: '-0.02em' }}>
                {p.title}
              </h2>
              <p className="mt-6 text-lg leading-relaxed t-text2">{p.result}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <span key={s} className="rounded-full border px-3 py-1 font-mono text-[12px] t-text2" style={{ borderColor: 'var(--border)' }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] t-text3">Périmètre livré</p>
              <ul className="mt-2">
                {p.scope.map((s) => (
                  <li key={s} className="flex items-center gap-3 border-b py-3 text-[15px] t-text2" style={{ borderColor: 'var(--border)' }}>
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
                className="cta-glow mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-medium text-white hover:brightness-110"
                style={{ background: 'var(--flame)' }}
              >
                {p.cta}
                <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true" />
              </a>
            </div>
          </motion.div>

          {/* navigation projet ↔ projet — grands panneaux, la galerie continue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.35, duration: 0.4 }}
            className="mt-14 grid grid-cols-2 gap-4 border-t pt-7 t-border"
          >
            <button
              type="button"
              onClick={() => onGo(idx - 1)}
              className="group flex min-w-0 flex-col items-start gap-1.5 rounded-2xl px-4 py-4 text-left transition-colors hover:bg-[var(--surface-2)]"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] t-text3 transition-colors group-hover:t-accent">← Précédent</span>
              <span className="truncate font-display text-2xl font-medium t-text2 transition-all duration-300 group-hover:translate-x-1 group-hover:t-accent">{prevP.title}</span>
            </button>
            <button
              type="button"
              onClick={() => onGo(idx + 1)}
              className="group flex min-w-0 flex-col items-end gap-1.5 rounded-2xl px-4 py-4 text-right transition-colors hover:bg-[var(--surface-2)]"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] t-text3 transition-colors group-hover:t-accent">Suivant →</span>
              <span className="truncate font-display text-2xl font-medium t-text2 transition-all duration-300 group-hover:-translate-x-1 group-hover:t-accent">{nextP.title}</span>
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
