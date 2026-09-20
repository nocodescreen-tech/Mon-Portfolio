import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/**
 * FadeSection — fait fondre chaque section en entrée ET en sortie pendant
 * le scroll (utile pour un site « vivant » avec des transitions fluides).
 * - Entrée : invisible → visible (fade + léger y) quand la section arrive
 * - Sortie : redevient invisible quand elle quitte le viewport
 * Respecte prefers-reduced-motion (apparition instantanée).
 */
export default function FadeSection({
  children,
  className = '',
  amount = 0.18,
  y = 42,
  once = false,
  as: Tag = motion.section,
}) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  const inView = useInView(ref, { amount, once })

  // reduced-motion : pas de fondu, contenu immédiatement visible
  const reduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // pour once=false on bascule l'opacité ; pour once=true on ne fonde qu'à la 1ère entrée
  const isVisible = reduced || inView || (once && seen)

  if (inView && !seen) setSeen(true)

  return (
    <Tag
      ref={ref}
      className={className}
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : y }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </Tag>
  )
}