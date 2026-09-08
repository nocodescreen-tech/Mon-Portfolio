import { motion } from 'framer-motion'
import useTheme from './useTheme'

const SPRING = { type: 'spring', stiffness: 520, damping: 34, mass: 0.6 }

/**
 * ThemeToggle — switch animé soleil/lune.
 * La pastille glisse en translateX (GPU, ressort) : déplacement fluide,
 * aucun saut de mise en page.
 */
export default function ThemeToggle({ compact = false }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  const pillW = compact ? 48 : 56
  const pillH = compact ? 26 : 30
  const knob = compact ? 20 : 24
  const pad = 3
  // course = largeur piste − pastille − marges
  const travel = pillW - knob - pad * 2

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      className="relative inline-flex shrink-0 cursor-pointer items-center rounded-full border"
      style={{
        width: pillW,
        height: pillH,
        borderColor: 'var(--border-strong)',
        background: 'var(--surface-2)',
      }}
    >
      {/* pastille — glisse en X avec un ressort */}
      <motion.span
        animate={{ x: dark ? travel : 0 }}
        transition={SPRING}
        className="absolute grid place-items-center rounded-full"
        style={{
          width: knob,
          height: knob,
          left: pad,
          top: pad,
          background: dark ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      >
        {dark ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4.5" fill="#fff" />
            <g stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
              <line x1="4.9" y1="4.9" x2="7" y2="7" /><line x1="17" y1="17" x2="19.1" y2="19.1" />
              <line x1="4.9" y1="19.1" x2="7" y2="17" /><line x1="17" y1="7" x2="19.1" y2="4.9" />
            </g>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="#2151e0" />
          </svg>
        )}
      </motion.span>
    </button>
  )
}
