/**
 * Logo — uniquement le nom. Minimal, typographique, aucune icône.
 * « René.Descartes » avec un point accent.
 */
export default function Logo({ size = 24, href = '#top' }) {
  return (
    <a href={href} className="group inline-flex items-center whitespace-nowrap" aria-label="René Descartes — accueil">
      <span className="font-display font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text)', fontSize: size }}>
        René<span className="logo-dot" style={{ color: 'var(--accent)' }}>.</span>Descartes
      </span>
    </a>
  )
}
