import { motion, useScroll, useSpring } from 'framer-motion'

/** Barre de progression du scroll. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-[2.5px] origin-left"
      style={{ scaleX, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }}
      aria-hidden="true"
    />
  )
}
