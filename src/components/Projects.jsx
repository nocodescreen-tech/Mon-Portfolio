import { Reveal, MediaZoom } from './motion'
import SectionHeading from './SectionHeading'
import Tilt3D from './Tilt3D'

/**
 * Projets sélectionnés — composition éditoriale, du plus concret au plus récent.
 * LUMO, projet de référence, puis ce portfolio, réalisé à la main.
 * Chaque ligne : image en travelling + contenu clair + une action précise.
 */
const PROJECTS = [
  {
    tag: '01 · Projet de référence',
    title: 'LUMO',
    role: 'Conçu et développé de A à Z',
    problem: 'Les petits commerces suivaient leurs ventes et leurs stocks sur des cahiers.',
    result: 'Une plateforme de gestion commerciale centralisée, déployée en production.',
    image: '/lumo/screen1.png',
    alt: 'Interface LUMO — mouvements de stock',
    href: '#lumo',
    cta: "Voir l'étude de cas",
    stack: ['React', 'Node.js', 'PostgreSQL'],
    featured: true,
  },
  {
    tag: '02 · Projet réel',
    title: 'Ce portfolio',
    role: 'Design & code · Motion · Frontend',
    problem: "Comment montrer un travail sérieux, sans ressembler à un site tout fait ?",
    result: "Un site conçu et développé à la main : scène 3D, motion design, thème clair/sombre, sans gabarit.",
    image: '/portfolio-cover.png',
    alt: 'René Descartes — portfolio, image de marque',
    href: '#contact',
    cta: 'Créer un projet similaire',
    stack: ['React', 'Three.js', 'GSAP'],
    featured: false,
  },
]

export default function Projects() {
  return (
    <section id="projets" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading label="Projets" title="Ce que je construis" />

        <div className="space-y-24 md:space-y-28">
          {PROJECTS.map((p) => (
            <Reveal key={p.title}>
              <article className="group grid items-center gap-8 md:grid-cols-2 md:gap-14">
                {/* image — scène interactive 3D (tilt) + travelling */}
                <div className={p.featured ? 'md:order-1' : 'md:order-2'}>
                  <Tilt3D>
                    <div className="relative overflow-hidden rounded-2xl border t-border t-surface t-shadow">
                      <MediaZoom>
                        <img
                          src={p.image}
                          alt={p.alt}
                          loading="lazy"
                          className="w-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.04]"
                        />
                      </MediaZoom>
                      {/* voile dégradé pour la lecture du badge */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{ background: 'linear-gradient(120deg, rgba(10,11,13,0.42), transparent 55%)' }}
                      />
                      <span className="absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-[11px] t-accent t-surface2 backdrop-blur">
                        {p.tag}
                      </span>
                    </div>
                  </Tilt3D>
                </div>

                {/* contenu */}
                <div className={p.featured ? 'md:order-2' : 'md:order-1'}>
                  <h3 className="font-display text-4xl font-semibold tracking-tight t-text md:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                    {p.title}
                  </h3>
                  <p className="mt-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] t-coral">
                    {p.role}
                    <span aria-hidden="true" className="h-px w-8" style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
                  </p>

                  <div className="mt-7 space-y-6">
                    {[
                      { k: 'Le contexte', v: p.problem },
                      { k: 'Le résultat', v: p.result },
                    ].map((b) => (
                      <div key={b.k} className="flex gap-4">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-2 w-2 shrink-0 rotate-45"
                          style={{ background: 'var(--accent)' }}
                        />
                        <div>
                          <div className="font-mono text-[11px] uppercase tracking-wider t-text3">{b.k}</div>
                          <p className="mt-1 text-lg leading-relaxed t-text2">{b.v}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <span
                        key={s}
                        className="chip-fx rounded-full border px-3 py-1 font-mono text-[12px] t-text2"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <a
                    href={p.href}
                    className="cta-glow mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-medium"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--accent)' }}
                  >
                    {p.cta}
                    <i className="fa-solid fa-arrow-right text-sm transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
