import { profile, aboutParagraphs, qualities } from '../data/content'
import { Section, Reveal } from './ui'

export default function About() {
  const facts = [
    { icon: 'fa-solid fa-graduation-cap', label: 'Formation', value: 'Licence ISIPA Matadi — 2026' },
    { icon: 'fa-solid fa-location-dot', label: 'Localisation', value: profile.location },
    { icon: 'fa-solid fa-envelope', label: 'Email', value: profile.email },
    { icon: 'fa-solid fa-wrench', label: 'Spécialités', value: 'Web · UI/UX · Maintenance & Réseaux' },
  ]

  return (
    <Section
      id="a-propos"
      label="a-propos"
      title={
        <>
          Une vision <span className="italic text-brass">systémique</span>
          <br />
          du numérique
        </>
      }
      kicker="Développeur, designer et technicien : je comprends la machine, le réseau, le code et l'utilisateur."
    >
      <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div className="min-w-0">
          <div className="relative">
            <div className="sapeur-stripes absolute -left-6 -top-6 h-24 w-24 corner-cut-sm opacity-60 max-sm:hidden" aria-hidden="true" />
            <div className="space-y-6 text-[15px] md:text-base leading-relaxed text-mist/85">
              {aboutParagraphs.map((p, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.2} className="mt-10">
            <div className="flex items-center gap-3 mb-5">
              <i className="fa-solid fa-wand-magic-sparkles text-brass" aria-hidden="true" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-brass">Qualités professionnelles</h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {qualities.map((q) => (
                <span
                  key={q}
                  className="corner-cut-sm border border-brass/20 bg-ink-2 px-3.5 py-1.5 text-[13px] text-mist/90 transition-colors hover:border-brass/60 hover:text-brass"
                >
                  {q}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="min-w-0">
          {/* portrait réel */}
          <Reveal delay={0.05}>
            <div className="relative mb-8 max-w-sm">
              <div className="sapeur-stripes absolute -right-5 -top-5 h-28 w-28 corner-cut-sm opacity-70 max-sm:hidden" aria-hidden="true" />
              <div className="portrait-frame corner-cut overflow-hidden border border-brass/30 bg-ink-2">
                <img
                  src="/lumo/rene.jpg"
                  alt="Portrait de René Descartes"
                  className="w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="corner-cut-sm absolute -bottom-4 -left-4 flex items-center gap-2 bg-brass px-4 py-2 font-mono text-[12px] font-semibold text-ink shadow-[0_10px_30px_-10px_rgba(240,180,41,0.6)]">
                <i className="fa-solid fa-code" aria-hidden="true" />
                Full Stack
              </div>
            </div>
          </Reveal>

          <div className="space-y-4">
            {facts.map(({ icon, label, value }, i) => (
              <Reveal key={label} delay={i * 0.08}>
                <div className="group corner-cut flex items-start gap-5 border border-brass/12 bg-ink-2/60 p-6 transition-all hover:border-brass/45 hover:bg-ink-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center corner-cut-sm bg-brass/12 text-brass transition-colors group-hover:bg-brass group-hover:text-ink">
                    <i className={`${icon} text-lg`} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-fog">{label}</div>
                    <div className="mt-1 text-[15px] font-medium text-mist break-words">{value}</div>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.35}>
              <div className="corner-cut relative overflow-hidden bg-gradient-to-br from-brass/15 via-ink-2 to-ink-2 border border-brass/25 p-6">
                <div className="font-display text-lg italic text-brass-soft leading-snug">
                  « Je code comme je pense : avec méthode, clarté et le souci du détail. »
                </div>
                <div className="mt-3 font-mono text-xs text-fog">— René Descartes</div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  )
}
