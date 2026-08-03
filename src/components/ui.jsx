import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/** Apparition au scroll : translation + échelle + fondu + flou — bien visible. */
export function Reveal({ children, delay = 0, y = 42, className = '', once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.97, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Compteur animé au passage dans le viewport. */
export function Counter({ to, prefix = '', suffix = '', duration = 1.6 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(to * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  )
}

/** Bouton / lien à effet magnétique (attire la souris). */
export function Magnetic({ children, strength = 0.25, className = '' }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) * strength
    const y = (e.clientY - (r.top + r.height / 2)) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }
  const onLeave = () => {
    const el = ref.current
    if (el) el.style.transform = 'translate(0px, 0px)'
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`inline-block transition-transform duration-300 ease-out ${className}`}>
      {children}
    </div>
  )
}

/** En-tête de section signature : étiquette `// code` + titre serif. */
export function Section({ id, label, title, kicker, children, className = '' }) {
  return (
    <section id={id} className={`relative py-24 md:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <Reveal>
          <div className="flex items-center gap-4 mb-4">
            <span className="code-label font-mono text-xs md:text-sm tracking-widest uppercase text-brass">
              {label}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-brass/40 to-transparent" />
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-medium text-mist leading-[1.05]">
            {title}
          </h2>
          {kicker && (
            <p className="mt-5 max-w-2xl text-fog text-base md:text-lg leading-relaxed">{kicker}</p>
          )}
        </Reveal>
        <div className="mt-14 md:mt-16">{children}</div>
      </div>
    </section>
  )
}
