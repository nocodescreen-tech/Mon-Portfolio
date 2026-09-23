import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/**
 * CursorLabel — curseur contextuel volontairement sobre.
 * État normal : RIEN (le fluide SplashCursor suffit, pas de gadget permanent).
 * Au survol d'un élément [data-cursor="…"] : une pastille-label suit le
 * pointeur (spring) et annonce l'intention — « Glisser », « Découvrir »…
 *
 * - desktop uniquement (pointer: fine), jamais sous prefers-reduced-motion
 * - pointer-events: none, ne masque jamais le curseur natif
 * - zéro coût au repos : un seul listener passif + springs, pas de render
 *   React par mouvement de souris
 */
export default function CursorLabel() {
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState(null)
  const x = useMotionValue(-300)
  const y = useMotionValue(-300)
  const sx = useSpring(x, { stiffness: 520, damping: 42, mass: 0.7 })
  const sy = useSpring(y, { stiffness: 520, damping: 42, mass: 0.7 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setEnabled(true)

    const onOver = (e) => {
      const el = e.target instanceof Element ? e.target.closest('[data-cursor]') : null
      setLabel(el ? el.getAttribute('data-cursor') : null)
    }
    const onMove = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const onOut = (e) => {
      const next = e.relatedTarget instanceof Element ? e.relatedTarget.closest('[data-cursor]') : null
      if (!next) setLabel(null)
    }
    // pendant un appui / drag : pas de label flottant parasite
    const onDown = () => setLabel(null)
    const onUp = (e) => {
      const el = e.target instanceof Element ? e.target.closest('[data-cursor]') : null
      setLabel(el ? el.getAttribute('data-cursor') : null)
    }

    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onOut, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    return () => {
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <AnimatePresence>
      {label && (
        <motion.div
          key="cursor-label"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.18, ease: EASE }}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[80]"
          style={{ x: sx, y: sy, translateX: '-50%', translateY: 'calc(-100% - 16px)' }}
        >
          <span
            className="rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] whitespace-nowrap"
            style={{
              background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
              borderColor: 'var(--border-strong)',
              color: 'var(--accent)',
              backdropFilter: 'blur(5px)',
            }}
          >
            {label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
