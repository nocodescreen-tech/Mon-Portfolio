import { Section, Reveal } from './ui'

const SERVICES = [
  {
    icon: 'fa-solid fa-globe',
    title: 'Sites vitrines & landing pages',
    text: 'Des sites rapides, soignés et pensés pour convertir — de la première maquette au déploiement.',
    tags: ['React', 'Tailwind', 'Vercel'],
  },
  {
    icon: 'fa-solid fa-cubes',
    title: 'Applications métier',
    text: 'Gestion des ventes, achats, stocks, clients, fournisseurs : des outils sur mesure qui simplifient le quotidien.',
    tags: ['Node.js', 'Express', 'PostgreSQL'],
  },
  {
    icon: 'fa-solid fa-cart-shopping',
    title: 'Plateformes e-commerce',
    text: 'Boutiques et plateformes de gestion commerciale complètes, avec authentification sécurisée et paiement.',
    tags: ['JWT', 'OAuth', 'RBAC'],
  },
  {
    icon: 'fa-solid fa-screwdriver-wrench',
    title: 'Maintenance & réseaux',
    text: 'Diagnostic, maintenance de parcs informatiques, mise en place et sécurisation de réseaux locaux.',
    tags: ['Hardware', 'LAN/Wi-Fi', 'Sécurité'],
  },
]

export default function Services() {
  return (
    <Section
      id="services"
      label="services"
      title={
        <>
          Ce que je peux <span className="italic text-brass">construire</span> pour vous
        </>
      }
      kicker="Quatre façons de vous accompagner — du premier pixel à la mise en production, et même au-delà du code."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={(i % 2) * 0.1}>
            <div className="group corner-cut relative h-full overflow-hidden border border-brass/12 bg-ink p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brass/50 hover:shadow-[0_18px_50px_-20px_rgba(240,180,41,0.35)]">
              <div className="sapeur-stripes absolute -right-8 -top-8 h-24 w-24 opacity-0 transition-opacity duration-500 group-hover:opacity-70" aria-hidden="true" />
              <span className="grid h-14 w-14 place-items-center corner-cut-sm bg-brass/12 text-brass transition-colors duration-300 group-hover:bg-brass group-hover:text-ink">
                <i className={`${s.icon} text-xl`} aria-hidden="true" />
              </span>
              <h3 className="mt-6 font-display text-xl text-mist">{s.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-fog">{s.text}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span key={t} className="font-mono text-[11px] uppercase tracking-wider text-brass-soft/90">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
