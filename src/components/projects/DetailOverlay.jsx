import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/**
 * DetailOverlay — vue détaillée « dossier », split-screen.
 *
 * Composition clairement différente : un grand panneau centré, le MÉDIA à
 * gauche (remplit la hauteur du dossier) et les INFORMATIONS à droite en
 * colonne éditoriale — comme une page produit, pas une modale empilée.
 * Mobile : empilé (média en haut, infos en dessous, défilement).
 *
 * Continuité spatiale : le média partage un `layoutId` avec la slide de la
 * scène — l'image cliquée s'agrandit réellement. À l'intérieur : galerie
 * complète des vues (object-contain pour les interfaces — lisibles en
 * entier), légendes + pagination + compteur sur le média, navigation
 * projet ↔ projet en bas du dossier (§37).
 *
 * Accessibilité : dialog aria-modal, focus posé sur la fermeture puis
 * restitué au déclencheur (garde StrictMode), Escape ferme, flèches = vues,
 * scroll verrouillé. Reduced-motion : transitions à 0.
 * Clés React uniques entre frères (préfixes « media- » et « info- ») :
 * la réconciliation reste prévisible, l'exit d'AnimatePresence se résout.
 *
 * RENDU EN PORTAIL vers document.body : la section Projets est enveloppée
 * dans SectionReveal qui anime des transforms (will-change) — un ancêtre
 * transformé devient le conteneur des éléments fixed, l'overlay serait
 * dimensionné sur la section au lieu du viewport. Le portail le sort de
 * cet arbre : plein écran réel, fond total.
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

  return createPortal(
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

      {/* le dossier — « safe center » : le centrage retombe sur « start »
          quand le contenu dépasse l'écran (mobile), sinon le haut du média
          et la fermeture deviennent inatteignables (scroll impossible) */}
      <div className="fixed inset-0 grid [place-items:safe_center] overflow-y-auto overscroll-contain p-3 md:p-8">
        <motion.div
          key={'panel-' + p.n}
          initial={{ opacity: 0, y: reduced ? 0 : 26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="relative grid h-[min(88vh,780px)] w-full max-w-[1100px] grid-rows-[auto_1fr] overflow-hidden rounded-3xl border-[1.5px] t-border t-surface t-shadow-lg max-lg:h-auto max-lg:max-h-none lg:grid-cols-[1.15fr_0.85fr] lg:grid-rows-1"
        >
          {/* fermeture — flotte au-dessus du dossier, toujours accessible */}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer la vue détaillée"
            className="absolute right-4 top-4 z-[4] grid h-11 w-11 place-items-center rounded-full border backdrop-blur-md transition-colors hover:t-accent"
            style={{ borderColor: 'var(--border-strong)', background: 'color-mix(in srgb, var(--bg) 68%, transparent)', color: 'var(--text)' }}
          >
            <i className="fa-solid fa-xmark text-base" aria-hidden="true" />
          </button>

          {/* MÉDIA — à gauche (desktop) / en haut (mobile) ; cible du FLIP */}
          <motion.div
            key={'media-' + p.n}
            layoutId={p.n === sourceProject ? 'project-media-' + p.n : undefined}
            initial={p.n === sourceProject ? { opacity: 0.5 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
            className="group relative h-[46vh] min-h-[300px] overflow-hidden max-lg:rounded-b-none lg:h-auto lg:min-h-0"
          >
            <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]">
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
                  className={
                    'absolute inset-0 h-full w-full ' +
                    (v.fit === 'contain' ? 'object-contain p-4 md:p-7' : 'object-cover object-top')
                  }
                />
              </AnimatePresence>
            </div>

            {/* dégradé de lisibilité + chrome de galerie */}
            <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: 'linear-gradient(180deg, transparent, var(--bg) 92%)' }} aria-hidden="true" />

            {vs.length > 1 &&
              [
                { label: 'Vue précédente', fn: () => onView((view - 1 + vs.length) % vs.length), icon: 'fa-chevron-left', pos: 'left-3' },
                { label: 'Vue suivante', fn: () => onView((view + 1) % vs.length), icon: 'fa-chevron-right', pos: 'right-3' },
              ].map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={b.fn}
                  aria-label={b.label}
                  className={`absolute ${b.pos} top-1/2 z-[2] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-105 hover:t-accent focus-visible:outline-2 focus-visible:outline-[var(--accent)] max-md:opacity-90`}
                  style={{ borderColor: 'var(--border-strong)', background: 'color-mix(in srgb, var(--bg) 55%, transparent)', color: 'var(--text)' }}
                >
                  <i className={`fa-solid ${b.icon}`} aria-hidden="true" />
                </button>
              ))}

            {vs.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-5 p-4 md:p-5">
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
                    <p className="mt-0.5 truncate text-[13px] t-text2">{v.note}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    {vs.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        onClick={() => onView(i)}
                        data-testid={`view-seg-${i}`}
                        className={`h-[3px] rounded-full transition-all duration-300 ${i === view ? 'w-7' : 'w-4 hover:w-6'}`}
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

          {/* INFORMATIONS — colonne éditoriale à droite, défile si besoin */}
          <motion.div
            key={'info-' + p.n}
            initial={{ opacity: 0, x: reduced ? 0 : 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : 0.14 }}
            className="flex min-h-0 flex-col overflow-y-auto p-6 md:p-9 max-lg:rounded-t-none"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] t-text3">
              Étude de cas <span className="mx-1 t-accent">{p.n}</span>/ 0{total}
            </p>

            <p className="mt-7 font-mono text-xs uppercase tracking-[0.2em] t-coral">{p.role}</p>
            <h2 className="mt-2 font-display text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-[1.05] tracking-tight t-text" style={{ letterSpacing: '-0.02em' }}>
              {p.title}
            </h2>
            <p className="mt-5 leading-relaxed t-text2">{p.result}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <span key={s} className="rounded-full border px-3 py-1 font-mono text-[12px] t-text2" style={{ borderColor: 'var(--border)' }}>{s}</span>
              ))}
            </div>

            <div className="mt-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] t-text3">Périmètre livré</p>
              <ul className="mt-1">
                {p.scope.map((s) => (
                  <li key={s} className="flex items-center gap-3 border-b py-2.5 text-[15px] t-text2" style={{ borderColor: 'var(--border)' }}>
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: 'var(--accent)' }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={p.href}
              target={p.external ? '_blank' : undefined}
              rel={p.external ? 'noreferrer' : undefined}
              data-cursor={p.external ? 'Ouvrir' : 'Découvrir'}
              className="cta-glow mt-8 inline-flex shrink-0 items-center gap-2 self-start rounded-full px-7 py-3.5 font-medium text-white hover:brightness-110"
              style={{ background: 'var(--flame)' }}
            >
              {p.cta}
              <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true" />
            </a>

            {/* navigation projet ↔ projet — en bas du dossier */}
            <div className="mt-auto grid grid-cols-2 gap-3 pt-8 max-lg:mt-8">
              <button
                type="button"
                onClick={() => onGo(idx - 1)}
                className="group flex min-w-0 flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-2)]"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] t-text3 transition-colors group-hover:t-accent">← Précédent</span>
                <span className="truncate font-display text-lg font-medium t-text2 transition-all duration-300 group-hover:translate-x-1 group-hover:t-accent">{prevP.title}</span>
              </button>
              <button
                type="button"
                onClick={() => onGo(idx + 1)}
                className="group flex min-w-0 flex-col items-end gap-0.5 rounded-xl px-3 py-2.5 text-right transition-colors hover:bg-[var(--surface-2)]"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] t-text3 transition-colors group-hover:t-accent">Suivant →</span>
                <span className="truncate font-display text-lg font-medium t-text2 transition-all duration-300 group-hover:-translate-x-1 group-hover:t-accent">{nextP.title}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>,
    document.body
  )
}
