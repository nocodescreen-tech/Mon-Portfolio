import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { lumo } from '../data/content'
import { Reveal, GroupReveal } from './motion'
import SectionHeading from './SectionHeading'
import Card from './Card'
import Button from './Button'
import Tilt3D from './Tilt3D'

const EASE = [0.22, 1, 0.36, 1]

const SCREENS = [
  { src: '/lumo/screen1.png', label: 'Mouvements de stock', note: 'traçabilité entrées / sorties, recherche et filtres' },
  { src: '/lumo/screen2.png', label: 'Produits & stocks', note: 'catalogue, niveaux de stock et alertes' },
  { src: '/lumo/screen3.png', label: 'Tableau de bord', note: 'les indicateurs clés de l’activité en un coup d’œil' },
  { src: '/lumo/screen5.png', label: 'Caisse (POS)', note: 'le panier client et la finalisation de la vente' },
  { src: '/lumo/screen4.png', label: 'Interface responsive', note: 'pensée mobile et bureau' },
]

const CONTEXT = [
  { k: 'Contexte', v: 'Les petits commerces de la RDC gèrent encore ventes et stock sur des cahiers ou des méthodes manuelles, faute d’outil adapté.' },
  { k: 'Problème', v: 'Aucune visibilité claire sur les entrées, sorties, les niveaux de stock et les opérations au quotidien.' },
  { k: 'Utilisateurs', v: 'Commerçants, gérants et gestionnaires de petites structures qui ont besoin d’un outil simple et fiable.' },
]

const CONSTRAINTS = [
  'Développer en gardant en tête que chaque requête et chaque performance compte.',
  'Une interface simple : un outil non compris n’est pas utilisé.',
  'Construire seul un système complet, de la base au déploiement.',
]

const DECISIONS = [
  { k: 'Comprendre', v: "Le flux réel d'un commerce est le point de départ : ventes, achats, stock, clients." },
  { k: 'Structurer', v: 'Le modèle de données est dessiné avant la première ligne de code.' },
  { k: 'Concevoir', v: "Une interface simple, utilisable sans mode d'emploi." },
]

const FEATURE_ICONS = [
  'fa-cart-shopping',
  'fa-truck-fast',
  'fa-boxes-stacked',
  'fa-users',
  'fa-user-shield',
  'fa-chart-line',
  'fa-rocket',
]

/**
 * Étude de cas LUMO — récit professionnel en cartes.
 * Contexte → contraintes → décisions UX → captures animées →
 * fonctionnalités livrées → stack → app en ligne.
 * Aucune statistique inventée.
 */
export default function CaseStudy() {
  const [shot, setShot] = useState(0)

  return (
    <section id="lumo" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading
          size="xl"
          label="Étude de cas"
          desc={lumo.subtitle}
          title={
            <>
              <span data-line className="inline-block">{lumo.title}</span>{' '}
              <span data-line className="inline-block" style={{ color: 'var(--accent)' }}>— la gestion qui a du sens</span>
            </>
          }
        />

        {/* contexte + problème + utilisateurs */}
        <GroupReveal className="grid gap-5 md:grid-cols-3" stagger={0.09}>
          {CONTEXT.map((c) => (
            <Card key={c.k} hover spotlight className="p-6">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                <div className="font-mono text-[11px] uppercase tracking-wider t-coral">{c.k}</div>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed t-text2">{c.v}</p>
            </Card>
          ))}
        </GroupReveal>

        {/* contraintes + décisions UX */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Reveal>
            <Card hover spotlight className="h-full p-7">
              <div className="font-mono text-[11px] uppercase tracking-wider t-text3">Contraintes</div>
              <ul className="mt-5 space-y-4">
                {CONSTRAINTS.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] leading-relaxed t-text2">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card hover spotlight className="h-full p-7">
              <div className="font-mono text-[11px] uppercase tracking-wider t-text3">Décisions UX</div>
              <ul className="mt-5 space-y-4">
                {DECISIONS.map((d) => (
                  <li key={d.k} className="border-l-2 pl-4" style={{ borderColor: 'var(--accent)' }}>
                    <span className="font-medium t-text">{d.k}</span>
                    <span className="block text-[15px] leading-relaxed t-text2">{d.v}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>

        {/* interface — vraies captures navigables */}
        <Reveal className="mt-20">
          <div className="font-mono text-[11px] uppercase tracking-wider t-text3">Interface finale — captures réelles</div>
        </Reveal>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <Reveal>
            <Tilt3D max={4}>
              <Card className="overflow-hidden">
              {/* barre de fenêtre */}
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
                <span className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#febc2e' }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#28c840' }} />
                </span>
                <span className="font-mono text-[12px] t-text3">{SCREENS[shot].label}</span>
                <span className="font-mono text-[11px] t-text3">{shot + 1} / {SCREENS.length}</span>
              </div>

              {/* capture avec transition animée */}
              <div className="relative aspect-[16/10] w-full bg-[var(--bg-3)]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={shot}
                    src={SCREENS[shot].src}
                    alt={SCREENS[shot].label}
                    initial={{ opacity: 0, y: 12, scale: 0.998 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 1.002 }}
                    transition={{ duration: 0.34, ease: EASE }}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                    loading="lazy"
                  />
                </AnimatePresence>
              </div>

              <p className="border-t px-5 py-3 font-mono text-[12px] t-coral" style={{ borderColor: 'var(--border)' }}>
                ↳ {SCREENS[shot].note}
              </p>
              </Card>
            </Tilt3D>
          </Reveal>

          {/* liste des écrans */}
          <div className="flex flex-col gap-2.5">
            {SCREENS.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setShot(i)}
                className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                  i === shot ? 'card-hover' : ''
                }`}
                style={{
                  borderColor: i === shot ? 'var(--accent)' : 'var(--border)',
                  background: i === shot ? 'var(--surface-2)' : 'transparent',
                  boxShadow: i === shot ? '0 0 0 1px var(--accent) inset, 0 8px 24px -16px var(--accent)' : undefined,
                }}
                aria-pressed={i === shot}
              >
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: i === shot ? 'var(--accent)' : 'var(--border-strong)' }} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium" style={i === shot ? { color: 'var(--accent)' } : undefined}>
                    {s.label}
                  </span>
                  <span className="block text-[12px] t-text3">{s.note}</span>
                </span>
                <i
                  className={`fa-solid fa-arrow-right ml-auto text-xs transition-all duration-300 ${
                    i === shot ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                  }`}
                  style={i === shot ? { color: 'var(--accent)' } : { color: 'var(--text-3)' }}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>

        {/* fonctionnalités livrées — liste réelle */}
        <Reveal className="mt-20">
          <div className="font-mono text-[11px] uppercase tracking-wider t-text3">Ce qui est livré</div>
        </Reveal>
        <GroupReveal className="mt-6 grid gap-3.5 sm:grid-cols-2" stagger={0.05}>
          {lumo.built.map((f, i) => (
            <Card key={f} spotlight className="flex items-center gap-4 p-4">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-base"
                style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}
              >
                <i className={`fa-solid ${FEATURE_ICONS[i % FEATURE_ICONS.length]}`} />
              </span>
              <span className="text-[15px] font-medium leading-snug t-text">{f}</span>
            </Card>
          ))}
        </GroupReveal>

        {/* stack + app en ligne */}
        <Reveal className="mt-12">
          <div className="flex flex-wrap items-center gap-6 border-t pt-8" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap gap-2">
              {lumo.stack.map((s) => (
                <span key={s} className="chip-fx rounded-full border px-3 py-1 font-mono text-[12px] t-text2" style={{ borderColor: 'var(--border)' }}>{s}</span>
              ))}
            </div>
            <Button
              href="https://lumo-frontend-production-1dba.up.railway.app/"
              target="_blank"
              rel="noreferrer"
              iconEnd={false}
              className="ml-auto"
            >
              Voir l'app en ligne
              <i className="fa-solid fa-arrow-up-right-from-square text-sm" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
