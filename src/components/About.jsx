import { about, skillGroups } from '../data/content'
import { Reveal, Parallax, GroupReveal, MediaZoom } from './motion'
import SectionHeading from './SectionHeading'
import CountUp from './CountUp'
import Card from './Card'
import Tilt3D from './Tilt3D'

/**
 * À propos — humain et concis. Portrait réel, texte court.
 * Repères chiffrés animés : uniquement des valeurs visibles sur le site
 * (pôles de compétences, domaines d'activité, projets livrés) — aucune
 * statistique inventée.
 */
export default function About() {
  const stats = [
    { n: skillGroups.length, label: 'pôles de compétences' },
    { n: about.domains.length, label: "domaines d'activité" },
    { n: 2, label: 'projets livrés de A à Z' },
  ]

  return (
    <section id="a-propos" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading label="À propos" title="Le designer qui code" />

        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* photo */}
          <Parallax speed={0.4}>
            <Reveal>
              <Tilt3D max={5}>
                <div className="relative">
                  {/* halo derrière le portrait */}
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-[28px]"
                    style={{ background: 'linear-gradient(135deg, transparent 35%, var(--accent) 60%, transparent 95%)', opacity: 0.22, filter: 'blur(20px)' }}
                  />
                  <Card className="relative">
                    <MediaZoom>
                      <img src="/lumo/portrait.png" alt="Portrait de René Descartes" className="w-full object-cover" loading="lazy" />
                    </MediaZoom>
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] backdrop-blur"
                      style={{ background: 'color-mix(in srgb, var(--bg) 70%, transparent)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                      Matadi · RDC
                    </span>
                  </Card>
                </div>
              </Tilt3D>
            </Reveal>
          </Parallax>

          {/* texte */}
          <div>
            <Reveal>
              <p className="font-display text-2xl font-medium leading-snug t-text md:text-[1.7rem]">{about.intro}</p>
            </Reveal>

            <div className="mt-6 space-y-5">
              {about.paragraphs.map((p, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p className="text-base leading-relaxed t-text2 md:text-[17px]">{p}</p>
                </Reveal>
              ))}
            </div>

            {/* relation design/code/utilisateur */}
            <Reveal>
              <div className="mt-9 border-l-2 pl-5" style={{ borderColor: 'var(--accent)' }}>
                <p className="text-[15px] leading-relaxed t-text2">
                  Je crois qu'un bon produit tient sur une équation simple :{' '}
                  <span className="font-medium t-text">le design rend l'outil clair</span>,{' '}
                  <span className="font-medium t-text">le code le rend fiable</span>, et{' '}
                  <span className="font-medium t-text">l'utilisateur reste au centre</span>.
                </p>
              </div>
            </Reveal>

            {/* domaines d'activité */}
            <Reveal>
              <div className="mt-8 flex flex-wrap gap-2">
                {about.domains.map((d) => (
                  <span
                    key={d}
                    className="chip-fx inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[12px] t-text2"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span aria-hidden="true" className="h-1 w-1 rounded-full" style={{ background: 'var(--accent)' }} />
                    {d}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* repères chiffrés animés (valeurs visibles du site) */}
        <GroupReveal className="mt-16 grid gap-10 sm:grid-cols-3" stagger={0.1}>
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-start gap-2">
              <span aria-hidden="true" className="h-px w-10" style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
              <div className="font-display text-4xl font-semibold tracking-tight t-text md:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                <CountUp to={s.n} />
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] t-text3">{s.label}</div>
            </div>
          ))}
        </GroupReveal>
      </div>
    </section>
  )
}
