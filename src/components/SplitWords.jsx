import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/**
 * SplitWords — typographie vivante : le texte monte mot par mot depuis un
 * masque, avec un stagger court (45 ms). Se rejoue en sortie comme les
 * autres primitives (parité Reveal/TitleReveal).
 * - `text` : chaîne pure (les contenus JSX retombent sur TitleReveal)
 * - reduced-motion : texte rendu tel quel, immédiatement lisible
 */
export default function SplitWords({ text, className = '', delay = 0, as: Tag = 'span' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '0px 0px -12% 0px' })
  const reduced = useReducedMotion()
  const M = motion[Tag] ?? motion.span

  if (reduced || typeof text !== 'string') {
    return <Tag className={className}>{text}</Tag>
  }

  const words = text.split(' ')

  return (
    <M
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: delay } } }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden="false">
          <motion.span
            className="inline-block will-change-transform"
            variants={{ hidden: { y: '115%' }, show: { y: '0%', transition: { duration: 0.55, ease: EASE } } }}
          >
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </M>
  )
}
