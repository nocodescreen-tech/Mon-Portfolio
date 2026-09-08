import { useRef } from 'react'

const BASE = 'relative overflow-hidden rounded-2xl border t-border t-surface t-shadow'

/**
 * Card — boîte unifiée du design system.
 *  - spotlight : halo radial qui suit la souris (via --mx/--my)
 *  - hover     : élévation douce + bordure qui s'illumine
 * Peut rendre n'importe quelle balise (as). Respecte prefers-reduced-motion.
 */
export default function Card({
  as: Tag = 'div',
  spotlight = false,
  hover = false,
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)

  const handleMove = (e) => {
    if (!spotlight || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const cls = [
    BASE,
    spotlight && 'spotlight-card',
    hover && 'card-hover',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag ref={ref} onPointerMove={handleMove} className={cls} {...rest}>
      {children}
    </Tag>
  )
}
