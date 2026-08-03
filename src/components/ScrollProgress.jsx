import { motion, useScroll, useSpring } from 'framer-motion'

/** Barre de progression du scroll, en laiton. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="scroll-progress fixed inset-x-0 top-0 z-[60] h-[3px] bg-gradient-to-r from-river via-brass to-glow"
      style={{ scaleX }}
      aria-hidden="true"
    />
  )
}
