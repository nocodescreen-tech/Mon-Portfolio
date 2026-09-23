import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Stage3D — galerie de projets à profondeur cinématique.
 *
 * Scène en perspective : la slide active vient naturellement au premier
 * plan ; les voisines restent perceptibles (plus petites, tournées sur Y,
 * légèrement floutées, moins opaques) et se traversent au drag. Le deck
 * entier suit le pointeur (élastique), puis s'nappe au relâchement.
 *
 * Chaque projet expose plusieurs « vues » (multi-angle) : la vue active
 * porte sa légende, les flèches latérales et la pagination minimaliste
 * racontent le projet au lieu de faire défiler des images.
 *
 * Perf : seules les slides |offset| ≤ 1 montent leurs images (budget
 * précédent / actuelle / suivante), la vue suivante est préchargée, tout
 * est transform/opacity. Mobile : 3D éteinte, une image, swipe.
 */

// états spatiaux par offset — valeurs testées, sobres (pas de kitsch).
// Pas de blur sur les voisines : opacity + scale + rotateY suffisent à
// lire la profondeur, et le filtre coûte cher en rasterisation GPU.
function offsetStyle(offset, is3D) {
  if (offset === 0) {
    return { x: 0, z: 0, scale: 1, opacity: 1, rotateY: 0 }
  }
  if (Math.abs(offset) === 1) {
    return is3D
      ? {
          x: offset > 0 ? '56%' : '-56%',
          z: -150,
          scale: 0.85,
          opacity: 0.4,
          rotateY: offset > 0 ? -13 : 13,
        }
      : { x: offset * 36, z: 0, scale: 0.97, opacity: 0, rotateY: 0 }
  }
  return {
    x: offset > 0 ? '115%' : '-115%',
    z: -320,
    scale: 0.8,
    opacity: 0,
    rotateY: 0,
  }
}

export default function Stage3D({ projects, idx, view, onView, onGo, onOpen }) {
  const reduced = useReducedMotion()
  // 3D desktop uniquement, décision prise au montage (non réactive — sobriété)
  const [is3D] = useState(() => !window.matchMedia('(max-width: 767px)').matches)
  const dragging = useRef(false)

  // budget d'images : précharge la vue suivante du projet actif (§40)
  useEffect(() => {
    const vs = projects[idx]?.views
    if (!vs || vs.length < 2) return
    const next = vs[(view + 1) % vs.length]
    if (next) {
      const im = new Image()
      im.src = next.src
    }
  }, [idx, view, projects])

  const handleDragEnd = (e, info) => {
    if (info.offset.x < -80 || info.velocity.x < -420) onGo(idx + 1)
    else if (info.offset.x > 80 || info.velocity.x > 420) onGo(idx - 1)
    setTimeout(() => {
      dragging.current = false
    }, 90)
  }

  return (
    <div className="relative select-none" style={{ perspective: is3D && !reduced ? 1600 : undefined }}>
      <motion.div
        drag={reduced ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.32}
        dragMomentum={false}
        onDragStart={() => {
          dragging.current = true
        }}
        onDragEnd={handleDragEnd}
        data-cursor="Glisser"
        className="relative mx-auto h-[52vh] min-h-[340px] w-full cursor-grab touch-pan-y active:cursor-grabbing md:w-[84%]"
        style={{ transformStyle: is3D && !reduced ? 'preserve-3d' : undefined }}
      >
        {projects.map((p, i) => (
          <Slide
            key={p.n}
            p={p}
            offset={i - idx}
            view={view}
            onView={onView}
            onOpen={() => {
              if (!dragging.current) onOpen()
            }}
            onPick={() => {
              if (!dragging.current) onGo(i)
            }}
            is3D={is3D && !reduced}
            reduced={reduced}
          />
        ))}
      </motion.div>
    </div>
  )
}

/* ————— une slide (un projet) à sa place dans la profondeur ————— */

function Slide({ p, offset, view, onView, onOpen, onPick, is3D, reduced }) {
  const near = Math.abs(offset) <= 1
  const active = offset === 0
  const vs = p.views
  const v = vs[Math.min(view, vs.length - 1)]

  return (
    <motion.div
      data-stage-slide=""
      data-offset={offset}
      className={`group absolute inset-0 ${active ? 'rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]' : ''}`}
      initial={false}
      animate={offsetStyle(offset, is3D)}
      transition={{ duration: reduced ? 0 : 0.62, ease: EASE }}
      style={{
        zIndex: active ? 3 : near ? 1 : 0,
        pointerEvents: near ? 'auto' : 'none',
        transformStyle: is3D ? 'preserve-3d' : undefined,
      }}
      onClick={(e) => {
        // éviter que le relâchement d'un drag ne déclenche l'ouverture
        e.stopPropagation()
        if (!near) return
        if (active) onOpen()
        else onPick()
      }}
      data-cursor={active ? 'Ouvrir' : near ? 'Afficher' : undefined}
      {...(active
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-label': `Ouvrir la vue détaillée — ${p.title}`,
            onKeyDown: (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen()
              }
            },
          }
        : {})}
    >
      <div className="relative h-full overflow-hidden rounded-2xl border-[1.5px] t-border t-surface t-shadow">
        {near &&
          (active ? (
            <ActiveMedia p={p} v={v} vs={vs} view={view} onView={onView} reduced={reduced} />
          ) : (
            /* voisine : poster seul, voilé, jamais en avant */
            <>
              <img src={vs[0].src} alt="" draggable={false} loading="lazy" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--bg) 45%, transparent)' }} aria-hidden="true" />
              <span className="absolute bottom-4 left-5 font-display text-lg font-medium t-text3">{p.title}</span>
            </>
          ))}
      </div>
    </motion.div>
  )
}

/* ————— média actif : galerie de vues + légendes + ancre FLIP ————— */

function ActiveMedia({ p, v, vs, view, onView, reduced }) {
  const multi = vs.length > 1
  return (
    <>
      {/* ancre du FLIP vers la vue détaillée (layoutId partagé) */}
      <motion.div
        layoutId={'project-media-' + p.n}
        transition={{ duration: reduced ? 0 : 0.55, ease: EASE }}
        className="absolute inset-0"
      >
        {/* zoom lent au survol sur un wrapper dédié — le transform inline
            de framer sur l'image ne doit pas écraser le scale CSS */}
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img
              key={v.src}
              src={v.src}
              alt={p.alt}
              draggable={false}
              loading="lazy"
              initial={{ opacity: 0, x: 26 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -26 }}
              transition={{ duration: reduced ? 0 : 0.32, ease: EASE }}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </AnimatePresence>
        </div>

        {/* fond de lisibilité (identique au design actuel) */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 45%, var(--bg) 100%)' }} aria-hidden="true" />

        {/* numéro géant filigrane */}
        <span
          aria-hidden="true"
          className="absolute left-6 top-3 font-display text-7xl font-bold leading-none opacity-90 md:text-9xl"
          style={{ WebkitTextFillColor: 'transparent', backgroundImage: 'var(--flame)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}
        >
          {p.n}
        </span>

        {/* étiquette projet */}
        <span className="absolute right-5 top-5 rounded-full border px-3 py-1 font-mono text-[11px] t-accent" style={{ background: 'color-mix(in srgb, var(--bg) 60%, transparent)', borderColor: 'var(--border)' }}>
          {p.tag}
        </span>

        {/* légende de la vue — le carousel raconte le projet (§34) */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={v.label}
            data-testid="view-caption"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : 0.28, ease: EASE }}
            className="absolute bottom-9 left-6 max-w-[70%] rounded-full border px-3.5 py-1.5"
            style={{ background: 'color-mix(in srgb, var(--bg) 72%, transparent)', borderColor: 'var(--border)', backdropFilter: 'blur(5px)' }}
          >
            <span className="font-mono text-[11px] uppercase tracking-wider t-accent">{v.label}</span>
            <span className="ml-2 text-[12px] t-text2">{v.note}</span>
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {multi && (
        <ViewNav vs={vs} view={view} onView={onView} reduced={reduced} />
      )}
    </>
  )
}

/* ————— navigation des vues : chevrons latéraux + pagination minimaliste ————— */

function ViewNav({ vs, view, onView, reduced }) {
  const prev = () => onView((view - 1 + vs.length) % vs.length)
  const next = () => onView((view + 1) % vs.length)
  return (
    <>
      {[
        { side: 'left', label: 'Vue précédente', fn: prev, icon: 'fa-chevron-left', pos: 'left-3' },
        { side: 'right', label: 'Vue suivante', fn: next, icon: 'fa-chevron-right', pos: 'right-3' },
      ].map((b) => (
        <button
          key={b.side}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            b.fn()
          }}
          aria-label={b.label}
          className={`absolute ${b.pos} top-1/2 z-[2] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border opacity-0 backdrop-blur-md transition-all duration-300 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--accent)]`}
          style={{ borderColor: 'var(--border-strong)', background: 'color-mix(in srgb, var(--bg) 55%, transparent)', color: 'var(--text)' }}
        >
          <i className={`fa-solid ${b.icon} text-sm`} aria-hidden="true" />
        </button>
      ))}

      {/* pagination minimaliste : ligne de segments, active accent */}
      <div data-testid="view-pagination" className="absolute bottom-3.5 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1.5" aria-hidden="true">
        {vs.map((_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation()
              onView(i)
            }}
            data-testid={`view-seg-${i}`}
            className={`h-[3px] rounded-full transition-all duration-300 ${i === view ? 'w-7' : 'w-3.5 hover:w-5'}`}
            style={{ background: i === view ? 'var(--accent)' : 'var(--border-strong)' }}
          />
        ))}
      </div>
    </>
  )
}
