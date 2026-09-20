import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Reveal } from './motion'
import SectionHeading from './SectionHeading'

const EASE = [0.22, 1, 0.36, 1]

/* Contenu réel des projets (source unique alignée sur /data/content & les liens live). */
const PROJECTS = [
  {
    n: '01', tag: 'Projet de référence', title: 'LUMO',
    role: 'Conçu et développé de A à Z',
    image: '/lumo/screen1.png', alt: 'Interface LUMO — mouvements de stock',
    href: '#lumo', cta: "Voir l'étude de cas", external: false,
    stack: ['React', 'Node.js', 'PostgreSQL'],
    context: 'Les petits commerces suivaient ventes et stocks sur des cahiers.',
    problem: 'Aucune visibilité sur les entrées, sorties et niveaux de stock au quotidien.',
    result: 'Une plateforme de gestion commerciale centralisée, déployée en production.',
    scope: ['Ventes & caisse', 'Achats', 'Stocks & produits', 'Clients & fournisseurs', 'Rôles (RBAC)', 'Tableau de bord'],
  },
  {
    n: '02', tag: 'Plateforme touristique', title: 'Visit.toi',
    role: 'Conçu et développé de A à Z · Design & motion',
    image: '/visit-toi/cover.svg', alt: 'Visit.toi — plateforme touristique communautaire pour la RDC',
    href: '#contact', cta: 'Discuter de ce projet', external: false,
    stack: ['React', 'TypeORM', 'PostgreSQL', 'Mapbox'],
    context: 'Découvrir les lieux et merveilles de la RDC, sans données fiables ni interface soignée.',
    problem: 'Informations dispersées et peu fiables sur les sites touristiques du pays.',
    result: 'Une plateforme communautaire : carte interactive, favoris, avis, profils et console de modération.',
    scope: ['Carte interactive', 'Favoris', 'Avis', 'Profils', 'Console de modération'],
  },
  {
    n: '03', tag: 'Génération de CV', title: 'CV Studio',
    role: 'Design & code · Génération de CV',
    image: '/cvstudio/screen1.png', alt: 'CV Studio — générateur de CV professionnel en ligne',
    href: 'https://cv-studio-jade.vercel.app/', cta: 'Voir le site live', external: true,
    stack: ['React', 'Tailwind', 'Vercel'],
    context: 'Créer un CV professionnel moderne, sans outil payant ni gabarit rigide.',
    problem: 'Des CV génériques, coûteux à produire, difficilement personnalisables.',
    result: 'Un studio en ligne pour composer et exporter des CV soignés — en production.',
    scope: ['Éditeur de contenu', 'Modèles', 'Export PDF', 'Publication'],
  },
  {
    n: '04', tag: 'Projet réel', title: 'Ce portfolio',
    role: 'Design & code · Motion · Frontend',
    image: '/portfolio-cover.png', alt: 'René Descartes — portfolio, image de marque',
    href: '#contact', cta: 'Créer un projet similaire', external: false,
    stack: ['React', 'Vite', 'Motion'],
    context: "Comment montrer un travail sérieux, sans ressembler à un site tout fait ?",
    problem: 'Un portfolio efficace doit montrer le design ET le code, sans gabarit.',
    result: "Un site conçu à la main : traînée fluide au curseur, motion design, thème clair/sombre.",
    scope: ['Design éditorial', 'Motion design', 'Thème clair/sombre', 'Backend contact'],
  },
]

export default function ProjectsCarousel() {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const zoneRef = useRef(null)
  const p = PROJECTS[idx]
  const total = PROJECTS.length

  const go = (next) => {
    setDir(next > idx ? 1 : -1)
    setIdx(((next % total) + total) % total)
  }

  // clavier pour accessibilité
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(idx + 1)
      if (e.key === 'ArrowLeft') go(idx - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  return (
    <section id="projets" className="relative section-ample">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <SectionHeading label="Projets" title="Des outils livrés de A à Z" />

        <div ref={zoneRef} className="mt-14 grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-14">
          {/* Index vertical numéroté (desktop) + pastilles (mobile) */}
          <div className="flex flex-row items-center gap-2 lg:flex-col lg:items-stretch lg:gap-0">
            {PROJECTS.map((x, i) => {
              const active = i === idx
              return (
                <button
                  key={x.n}
                  type="button"
                  onClick={() => go(i)}
                  aria-current={active ? 'true' : undefined}
                  aria-label={`Projet ${x.title}`}
                  className="group relative flex items-center gap-3 pb-3 font-mono text-sm transition-colors lg:justify-end lg:pb-0"
                >
                  <span className={`hidden transition-colors lg:inline ${active ? 'text-[var(--accent)]' : 'text-[var(--text-3)] group-hover:text-[var(--text-2)]'}`}>
                    {x.n}
                  </span>
                  {/* barre latérale active */}
                  <span
                    aria-hidden="true"
                    className={`h-[2px] w-6 transition-all duration-300 lg:h-8 lg:w-[2px] ${active ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)] group-hover:bg-[var(--accent)]/50'}`}
                    style={active ? { transform: 'scaleY(1)' } : {}}
                  />
                </button>
              )
            })}
          </div>

          {/* Visuel + détail */}
          <div>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={idx}
                custom={dir}
                initial={{ opacity: 0, x: dir * 48, filter: 'blur(5px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: dir * -48, filter: 'blur(5px)' }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {/* grand visuel */}
                <div className="relative overflow-hidden rounded-2xl border-[1.5px] t-border transition-colors duration-500 t-surface t-shadow">
                  <div className="relative h-[52vh] min-h-[340px] overflow-hidden">
                    <img src={p.image} alt={p.alt} className="h-full w-full object-cover object-top" loading="lazy" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 45%, var(--bg) 100%)' }} aria-hidden="true" />
                    {/* numero géant filigrane */}
                    <span aria-hidden="true" className="absolute left-6 top-3 font-display text-7xl font-bold leading-none opacity-90 md:text-9xl" style={{ WebkitTextFillColor: 'transparent', backgroundImage: 'var(--flame)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                      {p.n}
                    </span>
                    <span className="absolute right-5 top-5 rounded-full border px-3 py-1 font-mono text-[11px] t-accent" style={{ background: 'color-mix(in srgb, var(--bg) 60%, transparent)', borderColor: 'var(--border)' }}>
                      {p.tag}
                    </span>
                  </div>
                </div>

                {/* fiche détaillée */}
                <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] t-coral">{p.role}</p>
                    <h3 className="mt-2 font-display text-4xl font-semibold tracking-tight t-text md:text-5xl">{p.title}</h3>
                    <div className="mt-6 space-y-4">
                      <Row k="Le contexte" v={p.context} />
                      <Row k="Le problème" v={p.problem} />
                      <Row k="Le résultat" v={p.result} />
                    </div>
                  </div>
                  <div className="rounded-2xl border p-6 md:p-7 t-surface t-border">
                    <div className="font-mono text-[11px] uppercase tracking-wider t-text3">Périmètre livré</div>
                    <ul className="mt-4 space-y-2.5">
                      {p.scope.map((s) => (
                        <li key={s} className="flex items-center gap-3 text-[15px] t-text2">
                          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: 'var(--accent)' }} />
                          {s}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {p.stack.map((s) => (
                        <span key={s} className="rounded-full border px-3 py-1 font-mono text-[12px] t-text2" style={{ borderColor: 'var(--border)' }}>{s}</span>
                      ))}
                    </div>
                    <a
                      href={p.href}
                      target={p.external ? '_blank' : undefined}
                      rel={p.external ? 'noreferrer' : undefined}
                      className="cta-glow mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white hover:brightness-110"
                      style={{ background: 'var(--flame)' }}
                    >
                      {p.cta}
                      <i className="fa-solid fa-arrow-right text-sm transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* flèches de navigation + compteur */}
            <div className="mt-6 flex items-center gap-3">
              <button type="button" onClick={() => go(idx - 1)} aria-label="Projet précédent" className="grid h-12 w-12 place-items-center rounded-full border t-border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">
                <i className="fa-solid fa-arrow-left" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => go(idx + 1)} aria-label="Projet suivant" className="grid h-12 w-12 place-items-center rounded-full border t-border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
              <span className="ml-auto font-mono text-sm t-text3">{p.n} <span className="mx-1 opacity-40">/</span> 0{total}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Row({ k, v }) {
  return (
    <div className="border-l-2 pl-4" style={{ borderColor: 'var(--accent)' }}>
      <div className="font-mono text-[11px] uppercase tracking-wider t-text3">{k}</div>
      <p className="mt-1 text-[16px] leading-relaxed t-text2">{v}</p>
    </div>
  )
}