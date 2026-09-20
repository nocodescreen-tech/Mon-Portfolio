import { ReactLenis } from 'lenis/react'
import { useEffect, useRef } from 'react'

/** Hauteur de décalage sous le header fixe pour les ancres. */
const ANCHOR_OFFSET = -84

/**
 * Smooth scroll Lenis (sans gsap : les animations scroll-driven passent
 * désormais par useScroll de framer-motion, qui lit le scroll natif).
 * root=true : Lenis pilote le scroll natif de la fenêtre.
 * Expose l'instance sur window.__lenis et fait défiler tous les liens
 * internes (#ancre) en douceur (nav, drawer, footer, boutons).
 */
export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (!lenis) return
    window.__lenis = lenis

    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')
      if (!id || id === '#') return
      const el = document.querySelector(id)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { offset: ANCHOR_OFFSET, duration: 1.25 })
      history.replaceState(null, '', id)
    }

    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      window.__lenis = undefined
    }
  }, [])

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
