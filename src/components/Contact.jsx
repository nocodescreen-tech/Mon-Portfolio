import { profile } from '../data/content'
import { Section, Reveal, Magnetic } from './ui'
import ContactForm from './ContactForm'

export default function Contact() {
  const channels = [
    {
      icon: 'fa-solid fa-envelope',
      label: 'Email',
      value: profile.email,
      href: `mailto:${profile.email}`,
      note: 'Réponse sous 24h',
    },
    {
      icon: 'fa-solid fa-phone',
      label: 'Téléphone',
      value: profile.phone,
      href: `tel:${profile.phone.replace(/\s/g, '')}`,
      note: 'Appels & SMS',
    },
    {
      icon: 'fa-brands fa-whatsapp',
      label: 'WhatsApp',
      value: profile.phone,
      href: profile.whatsapp,
      note: 'Le plus rapide',
    },
    {
      icon: 'fa-solid fa-file-pdf',
      label: 'CV',
      value: 'Télécharger mon CV (PDF)',
      href: profile.cvUrl,
      note: 'À jour — 2026',
    },
  ]

  const socials = [
    { icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn', href: profile.links.linkedin },
    { icon: 'fa-brands fa-github', label: 'GitHub', href: profile.links.github },
    { icon: 'fa-brands fa-facebook-f', label: 'Facebook', href: profile.links.facebook },
  ]

  return (
    <Section
      id="contact"
      label="contact"
      title={
        <>
          Un projet en tête ? <br />
          <span className="italic text-brass">Éclairons-le</span> ensemble
        </>
      }
      kicker="Disponible pour des projets freelance, des collaborations et des opportunités full stack — sur place à Matadi ou à distance."
    >
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="min-w-0 space-y-4">
          {channels.map(({ icon, label, value, href, note }, i) => (
            <Reveal key={label} delay={i * 0.08}>
              <Magnetic strength={0.15}>
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noreferrer' : undefined}
                  className="group corner-cut flex items-center gap-5 border border-brass/12 bg-ink-2/60 p-5 transition-all hover:border-brass/50 hover:bg-ink-3"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center corner-cut-sm bg-brass/12 text-brass transition-colors group-hover:bg-brass group-hover:text-ink">
                    <i className={`${icon} text-lg`} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-fog">{label}</span>
                    <span className="block truncate text-[15px] font-medium text-mist">{value}</span>
                    <span className="block text-[12px] text-brass-soft/80">{note}</span>
                  </span>
                </a>
              </Magnetic>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <div className="flex items-center gap-3 pt-2 font-mono text-[13px] text-fog">
              <i className="fa-solid fa-location-dot text-brass" aria-hidden="true" />
              {profile.location}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="corner-cut relative overflow-hidden border border-brass/20 bg-ink-2/70 p-8 md:p-10">
            <div className="sapeur-stripes absolute inset-x-0 top-0 h-2 opacity-70" aria-hidden="true" />
            <h3 className="font-display text-2xl text-mist">
              Travaillons <span className="italic text-brass">ensemble</span>
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-fog">
              Décrivez votre besoin — site vitrine, application métier, plateforme de gestion,
              maintenance de votre parc informatique — et je reviens vers vous avec une proposition claire.
            </p>

            <ContactForm />

            <div className="mt-7 flex items-center justify-between border-t border-brass/10 pt-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fog">Réseaux</span>
              <div className="flex gap-2.5">
                {socials.map(({ icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center corner-cut-sm bg-ink ring-1 ring-brass/20 text-fog transition-all hover:text-brass hover:ring-brass/60"
                  >
                    <i className={`${icon} text-[15px]`} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
