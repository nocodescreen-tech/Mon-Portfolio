import { lumoFeatures, lumoStack, profile } from '../data/content'
import { Section, Reveal } from './ui'
import LumoScreens from './LumoScreens'

export default function Projects() {
  return (
    <Section
      id="projets"
      label="projets"
      title={
        <>
          Projet phare — <span className="italic text-brass">LUMO</span>
        </>
      }
      kicker="Une plateforme web intelligente de gestion centralisée et automatisée des activités commerciales. Captures réelles de l'application ci-dessous."
    >
      <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <Reveal>
            <LumoScreens />
          </Reveal>
        </div>

        <div>
          <Reveal>
            <div className="flex items-center gap-4">
              <img src="/lumo/lumo_logo.svg" alt="Logo LUMO" className="h-14 w-14" loading="lazy" />
              <div>
                <div className="font-display text-2xl text-mist">LUMO</div>
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-fog">
                  Plateforme de gestion commerciale
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-6 text-[15px] md:text-base leading-relaxed text-mist/85">
              <span className="font-display italic text-brass-soft text-lg">LUMO</span> — la lumière sur votre
              activité. Conçue et développée de bout en bout : interface React, API REST sécurisée
              (JWT + Google OAuth + RBAC) et base PostgreSQL pensée pour la montée en charge.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <h3 className="mt-8 mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-brass">
              <i className="fa-solid fa-list-check text-[11px]" aria-hidden="true" />
              Fonctionnalités — 12 modules
            </h3>
            <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {lumoFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[14px] text-mist/85">
                  <span className="grid h-5 w-5 shrink-0 place-items-center corner-cut-sm bg-brass/12">
                    <i className="fa-solid fa-check text-[10px] text-brass" aria-hidden="true" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8">
              <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-brass">
                <i className="fa-solid fa-layer-group text-[11px]" aria-hidden="true" />
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {lumoStack.map((t) => (
                  <span
                    key={t}
                    className="corner-cut-sm border border-brass/20 bg-ink-2 px-3 py-1.5 font-mono text-[12px] text-brass-soft"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href={profile.lumoLive}
                target="_blank"
                rel="noreferrer"
                className="corner-cut inline-flex items-center gap-2.5 bg-brass px-6 py-3.5 font-mono text-sm font-semibold text-ink transition-all hover:bg-brass-soft hover:shadow-[0_0_32px_rgba(240,180,41,0.4)]"
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-sm" aria-hidden="true" />
                Voir l'app en direct
              </a>
              <a
                href={profile.lumoRepo}
                target="_blank"
                rel="noreferrer"
                className="corner-cut inline-flex items-center gap-2.5 border border-mist/25 px-6 py-3.5 font-mono text-sm text-mist transition-all hover:border-brass hover:text-brass"
              >
                <i className="fa-brands fa-github text-base" aria-hidden="true" />
                Code source
              </a>
              <a
                href="#contact"
                className="corner-cut inline-flex items-center gap-2.5 border border-mist/25 px-6 py-3.5 font-mono text-sm text-mist transition-all hover:border-brass hover:text-brass"
              >
                <i className="fa-solid fa-comments text-sm" aria-hidden="true" />
                Discuter du projet
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
