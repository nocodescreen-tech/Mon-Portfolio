import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Motion toujours actif (choix du projet) : les révélations jouent même si
// l'OS demande moins de mouvement — le site doit rester vivant.
const REDUCED = () => false

/**
 * Reveal — masque qui monte (signature). Sobre, une seule direction.
 */
export function Reveal({ children, className = '', as: Tag = 'div', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || REDUCED()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [delay])
  return <Tag ref={ref} className={className}>{children}</Tag>
}

/**
 * TitleReveal — le titre monte depuis un masque (ligne x ligne si [data-line]).
 */
export function TitleReveal({ children, className = '', as: Tag = 'span', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || REDUCED()) return
    const ctx = gsap.context(() => {
      const lines = el.querySelectorAll('[data-line]')
      if (lines.length) {
        gsap.fromTo(
          lines,
          { yPercent: 112 },
          {
            yPercent: 0,
            duration: 0.55,
            ease: 'power4.out',
            stagger: 0.07,
            delay,
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
          },
        )
      } else {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power4.out',
            delay,
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
          },
        )
      }
    }, ref)
    return () => ctx.revert()
  }, [delay])
  return <Tag ref={ref} className={className}>{children}</Tag>
}

/** Ligne pour TitleReveal. */
export function Line({ children, className = '' }) {
  return (
    <span className="block overflow-hidden">
      <span data-line className={`block will-change-transform ${className}`}>{children}</span>
    </span>
  )
}

/**
 * Parallax léger — profondeur discrète, pas d'excès.
 */
export function Parallax({ children, className = '', speed = 0.5 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || REDUCED()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -60 * speed },
        {
          y: 60 * speed,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [speed])
  return <div ref={ref} className={className}>{children}</div>
}

/**
 * LineDraw — ligne qui se dessine au scroll (timeline approche/parcours).
 */
export function LineDraw({ className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || REDUCED()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: 'left center',
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top 90%', end: 'bottom 55%', scrub: 0.6 },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [])
  return <div ref={ref} className={`h-px bg-[var(--accent)] ${className}`} />
}

/**
 * MediaZoom — « travelling » cinématique : l'image se recentre lentement
 * (scale 1.18 → 1) pendant que le cadre traverse l'écran (scrub au scroll).
 * L'image garde ses propres effets de survol (l'échelle s'applique au wrapper).
 */
export function MediaZoom({ children, className = '', amount = 1.16 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || REDUCED()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scale: amount },
        {
          scale: 1,
          ease: 'none',
          transformOrigin: 'center center',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [amount])
  return <div ref={ref} className={`will-change-transform ${className}`}>{children}</div>
}

/**
 * GroupReveal — révèle les enfants directs en une seule vague (stagger).
 * Un seul ScrollTrigger pour la grille entière : rythme de « gaps » réguliers.
 * Sans animation si prefers-reduced-motion (contenu visible d'office).
 */
export function GroupReveal({ children, className = '', as: Tag = 'div', y = 30, stagger = 0.06, delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || REDUCED()) return
    const items = Array.from(el.children)
    if (!items.length) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y, opacity: 0, rotationX: 7 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          transformPerspective: 700,
          duration: 0.5,
          ease: 'power3.out',
          stagger,
          delay,
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [y, stagger, delay])
  return <Tag ref={ref} className={className}>{children}</Tag>
}
