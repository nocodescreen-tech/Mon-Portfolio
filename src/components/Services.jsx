import { services } from '../data/content'
import { GroupReveal } from './motion'
import Card from './Card'
import SectionHeading from './SectionHeading'

const ICONS = [
  'fa-globe',
  'fa-briefcase',
  'fa-cart-shopping',
  'fa-screwdriver-wrench',
  'fa-network-wired',
]

/**
 * Prestations — les 5 services réellement proposés (content.services).
 * Cartes numérotées + icônes + tags technos.
 */
export default function Services() {
  return (
    <section id="prestations" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading
          label="Prestations"
          title="Ce que je propose"
          desc="Des sites aux outils métier, jusqu'à la machine et au réseau : je m'occupe du projet de bout en bout."
        />

        <GroupReveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {services.map((s, i) => (
            <Card key={s.n} hover spotlight className="flex flex-col p-6">
              <div className="flex items-center justify-between">
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 place-items-center rounded-xl text-lg"
                  style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}
                >
                  <i className={`fa-solid ${ICONS[i % ICONS.length]}`} />
                </span>
                <span className="font-mono text-xs t-coral">{s.n}</span>
              </div>

              <h3 className="mt-5 font-display text-xl font-semibold t-text">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed t-text2">{s.text}</p>

              <ul className="mt-auto flex flex-wrap gap-2 pt-6" aria-label={`Technologies ${s.title}`}>
                {s.tags.map((t) => (
                  <li
                    key={t}
                    className="chip-fx rounded-full border px-3 py-1 font-mono text-[12px] t-text2"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </GroupReveal>
      </div>
    </section>
  )
}
