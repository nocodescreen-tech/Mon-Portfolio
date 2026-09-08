import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/content'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const EASE = [0.22, 1, 0.36, 1]

const LINKS = [
  { href: '#projets', label: 'Projets' },
  { href: '#lumo', label: 'Étude de cas' },
  { href: '#approche', label: 'Approche' },
  { href: '#prestations', label: 'Prestations' },
  { href: '#competences', label: 'Compétences' },
  { href: '#parcours', label: 'Parcours' },
  { href: '#a-propos', label: 'À propos' },
  { href: '#contact', label: 'Contact' },
]

/** Ferme le tiroir puis défile doucement vers l'ancre (après la sortie). */
function scrollAfterClose(href) {
  const el = document.querySelector(href)
  if (!el) return
  window.setTimeout(() => {
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -84, duration: 1.25 })
    else el.scrollIntoView({ behavior: 'smooth' })
    history.replaceState(null, '', href)
  }, 360)
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const burgerRef = useRef(null)
  const closeRef = useRef(null)
  const firstFocus = useRef(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // verrouille le scroll de la page quand le tiroir est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Échap ferme le tiroir
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // focus : premier élément du tiroir à l'ouverture, retour burger à la fermeture
  useEffect(() => {
    if (firstFocus.current) {
      firstFocus.current = false
      return
    }
    if (open) closeRef.current?.focus({ preventScroll: true })
    else burgerRef.current?.focus({ preventScroll: true })
  }, [open])

  // section active (scrollspy léger)
  useEffect(() => {
    const sections = LINKS
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter(Boolean)
    if (!sections.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(`#${en.target.id}`)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const handleNav = (e, href) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(false)
    scrollAfterClose(href)
  }

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b py-3 backdrop-blur-xl' : 'border-b border-transparent py-5'
        }`}
        style={scrolled ? { background: 'color-mix(in srgb, var(--bg) 82%, transparent)', borderColor: 'var(--border)' } : { background: 'transparent' }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 whitespace-nowrap px-6 md:px-10">
          <span className="sm:hidden"><Logo size={22} /></span>
          <span className="hidden sm:inline"><Logo size={28} /></span>

          <nav className="hidden items-center gap-5 whitespace-nowrap xl:flex" aria-label="Navigation principale">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-current={active === l.href ? 'true' : undefined}
                className={`nav-link whitespace-nowrap text-[13px] transition-colors duration-300 ${active === l.href ? 'is-active t-accent' : 't-text2 hover:t-accent'}`}
              >
                {l.label}
              </a>
            ))}

            <ThemeToggle compact />

            <a
              href={`mailto:${profile.email}`}
              className="cta-glow whitespace-nowrap rounded-full px-5 py-2 text-[13px] font-medium text-white hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
            >
              Discutons
            </a>
          </nav>

          <div className="flex items-center gap-3 xl:hidden">
            {/* toggle compact seulement si assez de place — sinon il est dans le tiroir */}
            <span className="max-sm:hidden">
              <ThemeToggle compact />
            </span>
            <button
              ref={burgerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={open}
              aria-haspopup="dialog"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <line x1="3" y1="6" x2="17" y2="6" stroke="var(--text)" strokeWidth="2" strokeLinecap="round"
                  style={{ transition: 'transform 0.3s ease, opacity 0.2s', transform: open ? 'translateY(4px) rotate(45deg)' : 'none', opacity: open ? 0 : 1 }} />
                <line x1="3" y1="10" x2="17" y2="10" stroke="var(--text)" strokeWidth="2" strokeLinecap="round"
                  style={{ transition: 'transform 0.3s ease', transform: open ? 'rotate(-45deg)' : 'none' }} />
                <line x1="3" y1="14" x2="17" y2="14" stroke="var(--text)" strokeWidth="2" strokeLinecap="round"
                  style={{ transition: 'transform 0.3s ease, opacity 0.2s', transform: open ? 'translateY(-4px) rotate(-45deg)' : 'none', opacity: open ? 0 : 1 }} />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Tiroir latéral droit (mobile) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[65] bg-black/55 backdrop-blur-[3px] xl:hidden"
              aria-hidden="true"
            />
            <motion.aside
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: EASE }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,400px)] flex-col border-l xl:hidden"
              style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}
            >
              {/* entête du tiroir */}
              <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: 'var(--border)' }}>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] t-text3">Navigation</span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full border transition-colors hover:t-accent"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                  aria-label="Fermer le menu"
                >
                  <i className="fa-solid fa-xmark text-[15px]" aria-hidden="true" />
                </button>
              </div>

              {/* liens */}
              <nav className="flex-1 overflow-y-auto px-6 py-4" aria-label="Menu mobile">
                {LINKS.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={(e) => handleNav(e, l.href)}
                    aria-current={active === l.href ? 'true' : undefined}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.06 + i * 0.045, duration: 0.35, ease: EASE } }}
                    exit={{ opacity: 0, x: 20, transition: { duration: 0.18 } }}
                    className="group flex items-center justify-between gap-4 border-b py-4"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="flex items-baseline gap-5">
                      <span className="font-mono text-[11px] t-accent" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={`font-display text-[1.65rem] font-medium transition-colors duration-300 group-hover:t-accent ${active === l.href ? 't-accent' : 't-text'}`}>
                        {l.label}
                      </span>
                    </span>
                    <i
                      className="fa-solid fa-arrow-right -translate-x-2 text-sm opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 t-accent"
                      aria-hidden="true"
                    />
                  </motion.a>
                ))}
              </nav>

              {/* pied du tiroir */}
              <div className="border-t px-6 py-6" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] t-text3">Thème</span>
                  <ThemeToggle />
                </div>

                <div className="mt-6 flex items-center gap-2 font-mono text-xs" style={{ color: 'var(--text-3)' }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#22c55e' }} aria-hidden="true" />
                  Disponible — je réponds rapidement
                </div>

                <a
                  href={`mailto:${profile.email}`}
                  className="mt-3 block truncate font-mono text-sm transition-colors hover:t-accent"
                  style={{ color: 'var(--accent)' }}
                >
                  {profile.email}
                </a>

                <div className="mt-5 flex items-center gap-5">
                  {[
                    { icon: 'fa-brands fa-github', label: 'GitHub', href: profile.links.github },
                    { icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn', href: profile.links.linkedin },
                    { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', href: `${profile.whatsapp}?text=${encodeURIComponent(profile.whatsappMsg)}` },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.href.startsWith('http') ? '_blank' : undefined}
                      rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
                      aria-label={s.label}
                      className="grid h-10 w-10 place-items-center rounded-full border transition-colors hover:t-accent"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                    >
                      <i className={`${s.icon} text-[15px]`} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
