import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/**
 * SectionReveal — remplace l'ancien FadeSection unique : chaque grande
 * section possède sa propre identité d'entrée, mais toutes partagent le
 * même langage (mêmes easings, durées cohérentes, entrée ET sortie).
 *
 *   rise  — ascendance sobre (base, ~600 ms)
 *   wipe  — révélation cinématique gauche → droite (clip-path, ~900 ms)
 *   depth — travelling spatial : arrive de loin + zoom arrière (~850 ms)
 *   drift — glissement latéral (from: 1 droite / -1 gauche, ~700 ms)
 *   mask  — expansion depuis un cadre resserré vers plein cadre (~950 ms)
 *   lift  — bascule perspective, comme une planche qui se pose (~800 ms)
 *
 * Mobile (< 768 px) et reduced-motion : toutes retombent sur « rise » —
 * le site reste sobre et rapide là où le luxe coûte cher.
 * Uniquement transform / opacity / clip-path : zéro reflow.
 */
const VARIANTS = {
  rise: {
    hidden: { opacity: 0, y: 56 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  },
  wipe: {
    hidden: { opacity: 0.4, clipPath: 'inset(0% 100% 0% 0%)' },
    show: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.9, ease: EASE } },
  },
  depth: {
    hidden: { opacity: 0, y: 72, scale: 0.955, transformPerspective: 900 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.85, ease: EASE } },
  },
  drift: {
    hidden: { opacity: 0, x: 76 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
  },
  mask: {
    hidden: { opacity: 0, clipPath: 'inset(12% 9% 12% 9%)' },
    show: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.95, ease: EASE } },
  },
  lift: {
    hidden: { opacity: 0, y: 52, rotateX: 9, transformPerspective: 800 },
    show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: EASE } },
  },
}

export default function SectionReveal({
  children,
  className = '',
  id,
  variant = 'rise',
  from = 1, // direction de drift : +1 arrive de droite, -1 de gauche
  amount = 0.16,
  as: Tag = motion.section,
}) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  const inView = useInView(ref, { amount })
  const reduced = useReducedMotion()

  if (inView && !seen) setSeen(true)

  // sobriété mobile + reduced-motion : une seule identité, la plus légère
  const isMobile =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  const name = reduced || isMobile || !VARIANTS[variant] ? 'rise' : variant

  const v = VARIANTS[name]
  const hidden = name === 'drift' ? { ...v.hidden, x: 76 * from } : v.hidden
  const visible = seen || inView

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      initial={false}
      animate={visible ? 'show' : 'hidden'}
      variants={{ hidden, show: v.show }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </Tag>
  )
}
