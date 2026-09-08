import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

/**
 * CountUp — chiffre qui compte à l'entrée dans le viewport.
 * Détection d'entrée en vue maison (scroll/resize/intervalle) : fiable même
 * quand un défilement est instantané. N'utiliser qu'avec des valeurs réelles.
 */
export default function CountUp({
  to,
  duration = 1.8,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  ariaLabel,
}) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return
    let started = false
    let controls = null

    const start = () => {
      if (started) return
      started = true
      controls = animate(0, to, {
        duration,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => setVal(v),
      })
    }

    const check = () => {
      if (started) return
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) start()
    }

    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    const interval = window.setInterval(check, 350)

    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      window.clearInterval(interval)
      controls?.stop()
    }
  }, [to, duration])

  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val)

  return (
    <span ref={ref} className={className} aria-label={ariaLabel ?? `${prefix}${to}${suffix}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
