import { skillGroups } from '../data/content'
import { Section, Reveal } from './ui'

const GROUP_ICONS = {
  langages: 'fa-solid fa-code',
  frontend: 'fa-solid fa-palette',
  backend: 'fa-solid fa-server',
  bdd: 'fa-solid fa-database',
  api: 'fa-solid fa-shield-halved',
  outils: 'fa-solid fa-screwdriver-wrench',
  deploiement: 'fa-solid fa-rocket',
}

export default function Skills() {
  return (
    <Section
      id="competences"
      label="competences"
      title={
        <>
          Un arsenal <span className="italic text-brass">complet</span>
          <br />
          du front au back
        </>
      }
      kicker="De l'interface React jusqu'à la base de données PostgreSQL, en passant par la sécurité et le déploiement."
      className="bg-ink-2/40 border-y border-brass/8"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, gi) => (
          <Reveal key={group.id} delay={(gi % 3) * 0.08}>
            <div className="group relative h-full corner-cut border border-brass/12 bg-ink p-6 transition-all duration-300 hover:border-brass/50 hover:-translate-y-1.5 hover:shadow-[0_18px_50px_-20px_rgba(240,180,41,0.35)]">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-3 font-display text-xl text-mist">
                  <i className={`${GROUP_ICONS[group.id] || 'fa-solid fa-layer-group'} text-base text-brass/80`} aria-hidden="true" />
                  {group.label}
                </h3>
                <span className="font-mono text-xs text-brass/60 group-hover:text-brass transition-colors">
                  {group.code}
                </span>
              </div>
              <div className="mt-2 h-px w-10 bg-brass/40 transition-all duration-500 group-hover:w-full" />
              <ul className="mt-5 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px] text-mist/85">
                    <span className="h-1.5 w-1.5 rotate-45 bg-brass/70" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}

        {/* carte finale — approche */}
        <Reveal delay={0.16}>
          <div className="corner-cut relative h-full overflow-hidden bg-brass p-6 transition-transform duration-300 hover:-translate-y-1.5">
            <div className="sapeur-stripes absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <h3 className="flex items-center gap-3 font-display text-xl text-ink">
                  <i className="fa-solid fa-lightbulb" aria-hidden="true" />
                  Ma méthode
                </h3>
                <div className="mt-2 h-px w-10 bg-ink/40" />
                <p className="mt-5 text-[14px] leading-relaxed text-ink/85">
                  Analyser → concevoir → coder → tester → livrer. Chaque brique est pensée pour
                  l'utilisateur final, chaque ligne pour la maintenabilité.
                </p>
              </div>
              <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70">
                bonnes pratiques · veille · rigueur
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
