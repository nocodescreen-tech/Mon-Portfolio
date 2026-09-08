import { profile } from '../data/content'
import Aurora from './Aurora'

const NAV = [
  { href: '#projets', label: 'Projets' },
  { href: '#lumo', label: 'Étude de cas' },
  { href: '#approche', label: 'Approche' },
  { href: '#prestations', label: 'Prestations' },
  { href: '#competences', label: 'Compétences' },
  { href: '#parcours', label: 'Parcours' },
  { href: '#a-propos', label: 'À propos' },
  { href: '#contact', label: 'Contact' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const socials = [
    { icon: 'fa-brands fa-github', label: 'GitHub', href: profile.links.github },
    { icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn', href: profile.links.linkedin },
    { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', href: `${profile.whatsapp}?text=${encodeURIComponent(profile.whatsappMsg)}` },
    { icon: 'fa-solid fa-envelope', label: 'Email', href: `mailto:${profile.email}` },
  ]

  return (
    <footer className="relative overflow-hidden border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}>
      <Aurora grain />
      {/* filet lumineux en haut du footer */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* marque */}
          <div>
            <div className="font-display text-xl font-semibold t-text">
              René<span style={{ color: 'var(--accent)' }}>.</span>Descartes
            </div>
            <p className="mt-2 max-w-xs text-sm leading-relaxed t-text3">
              Développeur full-stack · Designer UI/UX
            </p>
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs t-text3">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#22c55e' }} aria-hidden="true" />
              Disponible pour un projet
            </p>
          </div>

          {/* navigation */}
          <nav aria-label="Navigation pied de page">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] t-text3">Navigation</div>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="nav-link text-[15px] t-text2 transition-colors hover:t-accent">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* réseaux */}
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] t-text3">Contact & réseaux</div>
            <a href={`mailto:${profile.email}`} className="mt-4 block truncate text-[15px] font-medium transition-colors hover:t-accent" style={{ color: 'var(--text)' }}>
              {profile.email}
            </a>
            <div className="mt-5 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full border transition-all duration-300 hover:-translate-y-0.5 hover:t-accent"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-2)' }}
                >
                  <i className={`${s.icon} text-[15px]`} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* barre basse */}
      <div className="relative border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-5 font-mono text-xs t-text3 sm:flex-row md:px-10">
          <span>© {year} René Descartes — conçu et développé avec soin</span>
          <a
            href="#top"
            className="cta-glow inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs t-text3 hover:t-accent"
            style={{ borderColor: 'var(--border)' }}
            aria-label="Revenir en haut"
          >
            Haut de page
            <i className="fa-solid fa-arrow-up text-[11px]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
