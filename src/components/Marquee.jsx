const WORDS = [
  'Développement web',
  'Design UI/UX',
  'Applications métier',
  'Frontend & Backend',
  'React',
  'Node.js',
  'PostgreSQL',
  'Motion design',
  'LUMO',
  'Maintenance informatique',
  'Réseaux',
]

/** Deux copies identiques pour un défilement infini sans rupture. */
function Track() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-display text-[clamp(1.6rem,4.5vw,3rem)] font-semibold uppercase tracking-tight md:px-10" style={{ color: 'var(--text-2)', letterSpacing: '-0.02em' }}>
            {w}
          </span>
          <span aria-hidden="true" className="text-lg md:text-xl" style={{ color: 'var(--accent)' }}>✦</span>
        </span>
      ))}
    </div>
  )
}

/**
 * Marquee — bandeau motion infini entre le hero et les projets.
 * Pause au survol. Rendu décoratif (aria-hidden).
 */
export default function Marquee() {
  return (
    <div aria-hidden="true" className="marquee relative border-y py-7 md:py-9" style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}>
      <div className="marquee-track" style={{ ['--marquee-dur' ]: '36s' }}>
        <Track />
        <Track />
      </div>
      {/* fondus sur les bords */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-24" style={{ background: 'linear-gradient(90deg, var(--bg-2), transparent)' }} />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-24" style={{ background: 'linear-gradient(270deg, var(--bg-2), transparent)' }} />
    </div>
  )
}
