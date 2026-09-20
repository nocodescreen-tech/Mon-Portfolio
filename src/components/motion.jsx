import { useEffect, useMemo, useRef } from 'react'
import { motion, useAnimate, useInView, useScroll, useTransform, stagger } from 'framer-motion'

// Motion toujours actif (choix du projet) : les révélations jouent même si
// l'OS demande moins de mouvement — le site doit rester vivant.
const REDUCED = () => false

// Easing signature du site (équivalent power4.out de l'ancien gsap).
const EASE = [0.22, 1, 0.36, 1]

/** motion.<tag> dynamique pour le prop `as` (mise en cache par composant). */
const tagCache = new Map()
function motionTag(Tag) {
  if (typeof Tag === 'string') return motion[Tag] ?? motion.div
  if (!tagCache.has(Tag)) tagCache.set(Tag, motion.create(Tag))
  return tagCache.get(Tag)
}

/**
 * Reveal — masque qui monte (signature). Sobre, une seule direction.
 * Joue à l'entrée du viewport, se referme en sortant (parité ScrollTrigger
 * toggleActions 'play none none reverse'). Déclencheur : top 88% du viewport.
 */
export function Reveal({ children, className = '', as: Tag = 'div', delay = 0 }) {
  const ref = useRef(null)
  const M = motionTag(Tag)
  const inView = useInView(ref, { margin: '0px 0px -12% 0px' })

  return (
    <M
      ref={ref}
      className={className}
      initial={REDUCED() ? false : { y: 36, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : { y: 36, opacity: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </M>
  )
}

/**
 * TitleReveal — le titre monte depuis un masque, légèrement plus long.
 */
export function TitleReveal({ children, className = '', as: Tag = 'span', delay = 0 }) {
  const ref = useRef(null)
  const M = motionTag(Tag)
  const inView = useInView(ref, { margin: '0px 0px -12% 0px' })

  return (
    <M
      ref={ref}
      className={className}
      initial={REDUCED() ? false : { y: 40, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </M>
  )
}

/** Ligne pour TitleReveal (masque + bloc). */
export function Line({ children, className = '' }) {
  return (
    <span className="block overflow-hidden">
      <span className={`block will-change-transform ${className}`}>{children}</span>
    </span>
  )
}

/**
 * Parallax léger — profondeur discrète, pas d'excès.
 * Translation verticale scrubée sur toute la traversée du viewport.
 */
export function Parallax({ children, className = '', speed = 0.5 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${-60 * speed}px`, `${60 * speed}px`])

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}

/**
 * LineDraw — ligne qui se dessine au scroll (timeline approche/parcours).
 */
export function LineDraw({ className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'end 55%'] })
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      ref={ref}
      className={`h-px origin-left bg-[var(--accent)] ${className}`}
      style={{ scaleX }}
    />
  )
}

/**
 * MediaZoom — « travelling » cinématique : l'image se recentre lentement
 * (scale 1.18 → 1) pendant que le cadre traverse l'écran (scrub au scroll).
 * L'image garde ses propres effets de survol (l'échelle s'applique au wrapper).
 */
export function MediaZoom({ children, className = '', amount = 1.16 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [amount, 1])

  return (
    <motion.div ref={ref} className={`will-change-transform ${className}`} style={{ scale }}>
      {children}
    </motion.div>
  )
}

/**
 * GroupReveal — révèle les enfants directs en une seule vague (stagger).
 * Les enfants restent des éléments DOM tels quels : l'animation impérative
 * (useAnimate) cible les nœuds existants sans injecter de wrapper.
 * Un seul observateur d'entrée pour la grille entière : rythme régulier.
 */
export function GroupReveal({ children, className = '', as: Tag = 'div', y = 30, stagger: staggerDelay = 0.06, delay = 0 }) {
  const [scope, animate] = useAnimate()
  const M = useMemo(() => motionTag(Tag), [Tag])
  const inView = useInView(scope, { once: true, margin: '0px 0px -16% 0px' })

  // État caché posé dès le montage (avant la première frame d'entrée).
  useEffect(() => {
    if (REDUCED()) return
    const items = scope.current ? Array.from(scope.current.children) : []
    if (!items.length) return
    animate(items, { y, opacity: 0, rotateX: 7, transformPerspective: 700 }, { duration: 0 })
  }, [])

  // Une seule vague quand la grille entre à 84% du viewport.
  useEffect(() => {
    if (!inView || REDUCED()) return
    const items = scope.current ? Array.from(scope.current.children) : []
    if (!items.length) return
    const anim = animate(
      items,
      { y: 0, opacity: 1, rotateX: 0, transformPerspective: 700 },
      { duration: 0.5, ease: EASE, delay: stagger(staggerDelay, { startDelay: delay }) },
    )
    // Libère le transform inline pour que les hover CSS des cards reprennent la main.
    anim.finished.then(() => items.forEach((el) => { el.style.transform = '' })).catch(() => {})
  }, [inView])

  return (
    <M ref={scope} className={className}>
      {children}
    </M>
  )
}
