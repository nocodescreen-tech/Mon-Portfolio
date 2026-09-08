import { profile, skillGroups } from '../data/content'
import { GroupReveal } from './motion'
import Card from './Card'
import SectionHeading from './SectionHeading'

/* Icône de chaque compétence : logo officiel (marque) ou icône de concept. */
const ICONS = {
  // logos officiels — FontAwesome brands (embarqué localement)
  React: 'fa-brands fa-react',
  'Tailwind CSS': 'fa-brands fa-tailwind-css',
  'JavaScript (ES6+)': 'fa-brands fa-js',
  HTML5: 'fa-brands fa-html5',
  CSS3: 'fa-brands fa-css3-alt',
  'Node.js': 'fa-brands fa-node-js',
  PostgreSQL: 'fa-brands fa-postgresql',
  Figma: 'fa-brands fa-figma',
  'Google OAuth': 'fa-brands fa-google',
  Git: 'fa-brands fa-git-alt',
  GitHub: 'fa-brands fa-github',
  // concepts (pas de logo officiel)
  'Design d’interface': 'fa-solid fa-pen-nib',
  Prototypage: 'fa-solid fa-shapes',
  'Design system': 'fa-solid fa-layer-group',
  'Express.js': 'fa-solid fa-server',
  SQL: 'fa-solid fa-database',
  'REST API': 'fa-solid fa-arrow-right-arrow-left',
  JWT: 'fa-solid fa-key',
  RBAC: 'fa-solid fa-user-shield',
  'VS Code': 'fa-solid fa-code',
  Postman: 'fa-solid fa-paper-plane',
  Railway: 'fa-solid fa-cloud',
  Vercel: 'fa-solid fa-bolt',
  'Maintenance PC': 'fa-solid fa-screwdriver-wrench',
  'LAN / Wi-Fi': 'fa-solid fa-wifi',
  'Sécurité réseau': 'fa-solid fa-shield-halved',
}

/**
 * Compétences — 6 pôles (source unique : content.skillGroups), chaque
 * compétence avec son icône (logo officiel ou icône de concept).
 */
export default function Skills() {
  return (
    <section id="competences" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading label="Compétences" title="Ce que je sais faire" />

        <GroupReveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g) => (
            <Card key={g.id} hover spotlight className="flex flex-col p-6">
              <div className="flex items-start gap-4">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg"
                  style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}
                >
                  <i className={`fa-solid ${g.icon}`} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold t-text">{g.label}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed t-text3">{g.desc}</p>
                </div>
              </div>

              <ul className="mt-6 flex flex-wrap gap-2" aria-label={`Outils ${g.label}`}>
                {g.items.map((t) => {
                  const icon = ICONS[t]
                  return (
                    <li
                      key={t}
                      className="chip-fx inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[12px] t-text2"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {icon && <i className={`${icon} text-[12px]`} style={{ color: 'var(--text-3)' }} aria-hidden="true" />}
                      {t}
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
        </GroupReveal>

        {/* preuve GitHub : profil + dépôt public réel */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-10">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2.5 font-mono text-sm transition-colors"
            style={{ color: 'var(--text-3)' }}
          >
            <i className="fa-brands fa-github text-base transition-colors group-hover:t-accent" aria-hidden="true" />
            <span className="transition-colors group-hover:t-accent">Voir mes explorations UI/UX sur GitHub</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-xs opacity-60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:t-accent" aria-hidden="true" />
          </a>

          <span aria-hidden="true" className="hidden h-4 w-px sm:block" style={{ background: 'var(--border-strong)' }} />

          <a
            href={profile.lumoRepo}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2.5 font-mono text-sm transition-colors"
            style={{ color: 'var(--text-3)' }}
          >
            <i className="fa-solid fa-code-branch text-sm transition-colors group-hover:t-accent" aria-hidden="true" />
            <span className="transition-colors group-hover:t-accent">LUMO — code source</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-xs opacity-60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:t-accent" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
