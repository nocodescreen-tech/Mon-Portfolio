import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { profile } from '../data/content'
import HeroScene from './HeroScene'
import Button from './Button'

/**
 * Hero — écran d'ouverture. Rien d'inutile : un monogramme, un titre
 * qui se révèle, une promesse claire, deux actions. La 3D soutient.
 */
export default function Opening() {
  const root = useRef(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.fromTo('[data-logo]', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.45 }, 0.1)
        .fromTo('[data-title-line]', { yPercent: 112 }, { yPercent: 0, duration: 0.6, stagger: 0.08 }, 0.2)
        .fromTo('[data-role]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4 }, 0.5)
        .fromTo('[data-intro]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4 }, 0.65)
        .fromTo('[data-cta]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, 0.75)
        .fromTo('[data-scene]', { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.8 }, 0.35)
        .fromTo('[data-hint]', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.1)
    }, root)
    return () => ctx.revert()
  }, [])

  // « Le scroll raconte une histoire » : le hero s'éloigne (fond monte, glisse)
  // pendant que l'on défile vers le contenu — pattern cinématique.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.to('[data-hero-fade]', {
        yPercent: -10,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="top" className="relative flex min-h-screen items-center overflow-hidden">
      {/* scène 3D — à droite, soutient sans remplacer */}
      <div data-scene className="absolute inset-y-0 right-0 w-full lg:w-[54%]" aria-hidden="true">
        <HeroScene />
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full lg:w-[56%] bg-linear-to-r from-[var(--bg)] via-[var(--bg)]/92 to-transparent" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-10">
        <div data-hero-fade className="max-w-2xl">
          {/* dispo */}
          <div data-logo className="flex items-center gap-4">
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] t-text3">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: '#22c55e', boxShadow: '0 0 0 4px rgba(34,197,94,0.14)' }}
                aria-hidden="true"
              />
              Disponible
            </span>
          </div>

          {/* titre */}
          <h1 className="mt-8 font-display font-semibold leading-[1.02] tracking-tight t-text" style={{ letterSpacing: '-0.03em' }}>
            <span className="block overflow-hidden">
              <span data-title-line className="block text-[clamp(3rem,8vw,5.5rem)]">René</span>
            </span>
            <span className="block overflow-hidden">
              <span data-title-line className="block text-[clamp(3rem,8vw,5.5rem)]" style={{ color: 'var(--accent)' }}>
                Descartes
              </span>
            </span>
          </h1>

          {/* rôle */}
          <p data-role className="mt-6 font-display text-xl font-medium t-text md:text-2xl">
            Développeur full-stack · Designer UI/UX
          </p>

          {/* promesse */}
          <p data-intro className="mt-4 max-w-md text-lg leading-relaxed t-text2">
            Des applications web complètes, de l'interface à la base de données. Je fais des outils simples, utiles, qui rendent vraiment service au quotidien.
          </p>

          {/* actions */}
          <div data-cta className="mt-9 flex flex-wrap items-center gap-4">
            <Button href="#projets" variant="primary">
              Voir mes projets
            </Button>
            <Button href={`mailto:${profile.email}`} variant="ghost" iconEnd={false}>
              Me contacter
            </Button>
          </div>
        </div>
      </div>

      {/* indice de scroll — discret, masqué sur mobile */}
      <div data-hint className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex" aria-hidden="true">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] t-text3">Scroll</span>
        <span className="h-8 w-px" style={{ background: 'linear-gradient(180deg, var(--accent), transparent)' }} />
      </div>
    </section>
  )
}
