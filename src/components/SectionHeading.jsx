import { TitleReveal } from './motion'

const TITLE = {
  md: 'text-[clamp(2.4rem,6vw,4.2rem)]',
  xl: 'text-[clamp(2.6rem,7vw,5rem)]',
}

/**
 * SectionHeading — en-tête de section factorisé.
 * Ligne accent + label mono, puis titre révélé au scroll (masque).
 * `size` : 'md' (défaut) ou 'xl' (études de cas / grand titre).
 */
export default function SectionHeading({ label, title, size = 'md', className = '', as = 'div', desc }) {
  const Tag = as
  return (
    <Tag className={`mb-16 max-w-2xl ${size === 'xl' ? 'max-w-3xl' : ''} ${className}`}>
      <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] t-text3">
        <span aria-hidden="true" className="h-px w-10" style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
        {label}
      </p>
      <h2
        className={`mt-4 font-display font-semibold leading-tight tracking-tight t-text ${TITLE[size]}`}
        style={{ letterSpacing: '-0.02em' }}
      >
        <TitleReveal>{title}</TitleReveal>
      </h2>
      {desc && (
        <div className="mt-5 text-lg leading-relaxed t-text2">{desc}</div>
      )}
    </Tag>
  )
}
