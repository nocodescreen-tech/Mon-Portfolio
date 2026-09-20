import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { profile } from '../data/content'
import Button from './Button'

// Timeline d'ouverture — même chorégraphie que l'ancienne timeline gsap :
// logo, lignes de titre masquées, rôle, promesse, actions, scène, indice.
const EASE = [0.22, 1, 0.36, 1]
const line = {
  hidden: { y: '112%' },
  show: (i) => ({ y: '0%', transition: { duration: 0.6, delay: 0.2 + i * 0.08, ease: EASE } }),
}

/**
 * Hero — écran d'ouverture. Le fond global (SplashCursor) offre déjà
 * la traînée fluide qui suit le curseur ; le hero pose
 * le titre monumental et l'appel à l'action par-dessus.
 */
export default function Opening() {
  const root = useRef(null)

  // « Le scroll raconte une histoire » : le hero s'éloigne (fond monte, glisse)
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end start'] })
  const fadeY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])
  const fadeOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <section ref={root} id="top" className="relative flex min-h-screen items-center overflow-hidden">
      {/* voile pour la lisibilité du texte */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(80% 80% at 30% 45%, transparent 30%, color-mix(in srgb, var(--bg) 70%, transparent) 100%)' }} aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-10">
        <motion.div className="max-w-2xl" style={{ y: fadeY, opacity: fadeOpacity }}>
          {/* dispo */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
          >
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] t-text3">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: '#22c55e', boxShadow: '0 0 0 4px rgba(34,197,94,0.14)' }}
                aria-hidden="true"
              />
              Disponible
            </span>
          </motion.div>

          {/* titre */}
          <h1 className="mt-8 font-display font-semibold leading-[1.02] tracking-tight t-text" style={{ letterSpacing: '-0.03em' }}>
            <span className="block overflow-hidden">
              <motion.span variants={line} custom={0} initial="hidden" animate="show" className="block text-[clamp(3.2rem,10vw,7rem)]">
                René
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={line} custom={1} initial="hidden" animate="show" className="block text-[clamp(3.2rem,10vw,7rem)]" style={{ color: 'var(--accent)', WebkitTextFillColor: 'transparent', backgroundImage: 'var(--flame)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                Descartes
              </motion.span>
            </span>
          </h1>

          {/* rôle */}
          <motion.p
            className="mt-6 font-display text-xl font-medium t-text md:text-2xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, ease: EASE }}
          >
            Développeur full-stack · Designer UI/UX
          </motion.p>

          {/* promesse */}
          <motion.p
            className="mt-4 max-w-md text-lg leading-relaxed t-text2"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.65, ease: EASE }}
          >
            Des applications web complètes, de l'interface à la base de données. Je fais des outils simples, utiles, qui rendent vraiment service au quotidien.
          </motion.p>

          {/* actions */}
          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.75, ease: EASE }}
          >
            <Button href="#projets" variant="primary">
              Voir mes projets
            </Button>
            <Button href={`mailto:${profile.email}`} variant="ghost" iconEnd={false}>
              Me contacter
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* indice de scroll — discret, masqué sur mobile */}
      <motion.div
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] t-text3">Scroll</span>
        <span className="h-8 w-px" style={{ background: 'linear-gradient(180deg, var(--accent), transparent)' }} />
      </motion.div>
    </section>
  )
}
