import { useRef } from 'react'
import { motion, useSpring } from 'framer-motion'

const reducedMotion = () => false

/**
 * Tilt3D — scène interactive en perspective.
 * La carte pivote doucement (rotateX/rotateY) vers le curseur et un reflet
 * lumineux suit la souris. Désactivé si prefers-reduced-motion ou sur écran
 * tactile (pas de hover fiable).
 */
export default function Tilt3D({ children, className = '', max = 6, glare = true }) {
  const ref = useRef(null)
  const glareRef = useRef(null)
  const rotX = useSpring(0, { stiffness: 220, damping: 20, mass: 0.5 })
  const rotY = useSpring(0, { stiffness: 220, damping: 20, mass: 0.5 })

  const handleMove = (e) => {
    if (reducedMotion() || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    rotY.set((px - 0.5) * 2 * max)
    rotX.set((0.5 - py) * 2 * max)
    if (glare && glareRef.current) {
      glareRef.current.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`)
      glareRef.current.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
    }
  }

  const reset = () => {
    rotX.set(0)
    rotY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerEnter={() => { if (glareRef.current) glareRef.current.style.opacity = '1' }}
      onPointerLeave={() => { reset(); if (glareRef.current) glareRef.current.style.opacity = '0' }}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1100 }}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      {glare && (
        <span
          ref={glareRef}
          aria-hidden="true"
          className="tilt-glare pointer-events-none absolute inset-0 rounded-[inherit] opacity-0"
          style={{ opacity: 0 }}
        />
      )}
    </motion.div>
  )
}
