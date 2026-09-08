import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Button — bouton réellement vivant.
 *  - Magnetic : attiré par le curseur (mouvement visible)
 *  - Lift : translation + ombre au hover
 *  - Scale : au press (whileTap)
 *  - Glow : halo qui s'intensifie au hover
 *  - Shine : reflet qui traverse
 *  - Ripple : onde au clic
 * Toutes les animations respectent prefers-reduced-motion.
 */
export default function Button({ href, children, variant = 'primary', className = '', onClick, target, rel, download, ariaLabel, iconEnd = true }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 200, damping: 16, mass: 0.3 })
  const y = useSpring(my, { stiffness: 200, damping: 16, mass: 0.3 })

  // Motion des boutons toujours actif (choix du projet).
  const reduced = false

  const base =
    'group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-[15px] font-medium transition-[background-color,border-color,color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]'

  const handleMove = (e) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.4)
    my.set((e.clientY - (r.top + r.height / 2)) * 0.4)
  }
  const reset = () => { mx.set(0); my.set(0) }

  const spawnRipple = (e) => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const d = Math.max(r.width, r.height) * 2
    const dot = document.createElement('span')
    dot.style.cssText = `position:absolute;z-index:5;width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px;border-radius:50%;background:rgba(255,255,255,0.35);transform:scale(0);pointer-events:none;`
    el.appendChild(dot)
    requestAnimationFrame(() => {
      dot.animate([{ transform: 'scale(0)', opacity: 0.6 }, { transform: 'scale(1)', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(0,0,0.2,1)' })
    })
    setTimeout(() => dot.remove(), 680)
  }

  const style = variant === 'primary'
    ? { border: '2px solid transparent', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: '#fff' }
    : { border: '2px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      download={download}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={(e) => { spawnRipple(e); onClick?.(e) }}
      whileHover={reduced ? undefined : { y: -3, scale: 1.05 }}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      style={{ ...style, x, y }}
      className={`${base} ${variant === 'primary' ? 'text-white' : 't-text'} ${className}`}
    >
      <span className="relative z-[1] inline-flex items-center gap-2.5">
        {children}
        {iconEnd && <i className="fa-solid fa-arrow-right text-sm transition-transform duration-300 group-hover:translate-x-1.5 group-hover:-translate-y-0.5" aria-hidden="true" />}
      </span>
      {/* halo lumineux au hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={variant === 'primary' ? { boxShadow: '0 0 44px -8px var(--accent)', background: 'rgba(255,255,255,0.12)' } : { boxShadow: '0 8px 24px -10px rgba(0,0,0,0.4)' }}
        aria-hidden="true"
      />
      {/* shine */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" aria-hidden="true" />
      {/* overflow pour contenu (le halo reste dans les bords) */}
    </motion.a>
  )
}
