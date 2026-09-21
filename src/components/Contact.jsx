import { profile } from '../data/content'
import { Reveal } from './motion'
import SplitWords from './SplitWords'
import ContactForm from './ContactForm'
import Button from './Button'
import Card from './Card'

/**
 * Contact — conclusion calme. Cartes-canaux + formulaire.
 * Entrées en douceur, accent corail, respiration.
 */
export default function Contact() {
  const channels = [
    { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', value: 'Message direct', href: `${profile.whatsapp}?text=${encodeURIComponent(profile.whatsappMsg)}`, external: true, cursor: 'Écrire' },
    { icon: 'fa-solid fa-envelope', label: 'Email', value: profile.email, href: `mailto:${profile.email}`, cursor: 'Écrire' },
    { icon: 'fa-brands fa-github', label: 'GitHub', value: 'github.com/nocodescreen-tech', href: profile.links.github, external: true, cursor: 'Voir' },
    { icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn', value: 'René Descartes', href: profile.links.linkedin, external: true, cursor: 'Voir' },
  ]

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-[0.2em] t-text3">
            <span aria-hidden="true" className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, var(--accent))' }} />
            Contact
            <span aria-hidden="true" className="h-px w-10" style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.6rem,8vw,5rem)] font-semibold leading-[1] tracking-tight t-text" style={{ letterSpacing: '-0.02em' }}>
            <SplitWords text="Parlons de votre projet" />
          </h2>
          <Reveal>
            <p className="mt-6 text-lg leading-relaxed t-text2">
              Un projet, une envie ou une simple question : écrivez-moi. Je réponds vite, où que vous soyez.
            </p>
          </Reveal>
        </div>

        {/* canaux + formulaire */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0 space-y-4">
            {channels.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.05}>
                <Card
                  as="a"
                  href={c.href}
                  target={c.external ? '_blank' : undefined}
                  rel={c.external ? 'noreferrer' : undefined}
                  hover
                  spotlight
                  data-cursor={c.cursor}
                  className="group flex items-center gap-5 p-5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>
                    <i className={`${c.icon} text-lg`} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[11px] uppercase tracking-wider t-text3">{c.label}</span>
                    <span className="block truncate font-medium t-text">{c.value}</span>
                  </span>
                  <i
                    className="fa-solid fa-arrow-right ml-auto text-sm opacity-40 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                    style={{ color: 'var(--accent)' }}
                    aria-hidden="true"
                  />
                </Card>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <div className="pt-2">
                <Button href={profile.cvUrl} download variant="primary" ariaLabel="Télécharger mon CV" iconEnd={false}>
                  <i className="fa-solid fa-file-arrow-down text-sm" aria-hidden="true" />
                  Télécharger mon CV
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="min-w-0">
            <Card className="p-7 md:p-9">
              <h3 className="font-display text-xl font-semibold t-text">Écrivez-moi</h3>
              <p className="mt-2 text-[15px] leading-relaxed t-text2">
                Dites-moi en quelques lignes ce que vous avez en tête — je reviens vers vous avec des idées concrètes.
              </p>
              <ContactForm />
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
