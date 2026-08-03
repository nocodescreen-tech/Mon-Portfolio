import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { profile } from '../data/content'
import { Magnetic } from './ui'

const NAV = [
  { href: '#a-propos', label: 'À propos' },
  { href: '#services', label: 'Services' },
  { href: '#competences', label: 'Compétences' },
  { href: '#projets', label: 'Projets' },
  { href: '#parcours', label: 'Parcours' },
  { href: '#contact', label: 'Contact' },
]

function Logo() {
  return (
    <a href="#top" className="group inline-flex items-center" aria-label="René Descartes — accueil">
      {/* marque typographique RD */}
      <span className="font-display italic font-bold text-3xl leading-none text-brass transition-colors group-hover:text-brass-soft">
        RD
      </span>
    </a>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-ink/85 backdrop-blur-xl border-b border-brass/10 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 md:px-10">
          <Logo />

          <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative font-mono text-[13px] tracking-wide text-fog hover:text-mist transition-colors"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-brass transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <Magnetic>
              <a
                href="#contact"
                className="corner-cut-sm inline-flex items-center gap-2 bg-brass px-5 py-2.5 font-mono text-[13px] font-semibold text-ink transition-all hover:bg-brass-soft hover:shadow-[0_0_28px_rgba(240,180,41,0.35)]"
              >
                Discutons
                <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true" />
              </a>
            </Magnetic>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-10 w-10 place-items-center corner-cut-sm bg-ink-2 ring-1 ring-brass/40"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
          >
            <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'} text-brass text-lg`} aria-hidden="true" />
          </button>
        </div>
      </motion.header>

      {/* menu mobile plein écran */}
      <motion.div
        initial={false}
        animate={open ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-ink/97 backdrop-blur-2xl lg:hidden"
      >
        {NAV.map((item, i) => (
          <motion.a
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            initial={false}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: open ? 0.08 + i * 0.06 : 0, duration: 0.4 }}
            className="font-display text-4xl text-mist py-2 hover:text-brass transition-colors"
          >
            {item.label}
          </motion.a>
        ))}
        <a
          href={`mailto:${profile.email}`}
          className="mt-6 font-mono text-sm text-brass underline underline-offset-8"
        >
          {profile.email}
        </a>
      </motion.div>
    </>
  )
}
