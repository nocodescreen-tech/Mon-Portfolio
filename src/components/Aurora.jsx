import { useEffect, useRef } from 'react'

const ORBS = [
  { size: 680, top: '-14%', left: '-12%', cls: 'orb-a', color: 'var(--orb-1)', opacity: 0.16 },
  { size: 520, top: '24%', right: '-16%', cls: 'orb-b', color: 'var(--orb-2)', opacity: 0.13 },
  { size: 760, bottom: '-20%', left: '30%', cls: 'orb-c', color: 'var(--orb-3)', opacity: 0.12 },
]

const MOTES = [
  { top: '16%', left: '10%', s: 3, dur: 17, delay: -3, dx: 60, dy: -140, peak: 0.5 },
  { top: '72%', left: '20%', s: 2, dur: 23, delay: -8, dx: -80, dy: -110, peak: 0.35 },
  { top: '34%', left: '86%', s: 4, dur: 19, delay: -12, dx: -55, dy: -160, peak: 0.45 },
  { top: '84%', left: '70%', s: 2, dur: 26, delay: -5, dx: 70, dy: -95, peak: 0.3 },
  { top: '12%', left: '56%', s: 3, dur: 21, delay: -15, dx: -40, dy: -120, peak: 0.4 },
  { top: '60%', left: '38%', s: 2, dur: 28, delay: -18, dx: 90, dy: -75, peak: 0.25 },
]

/**
 * Aurora — ambiance lumineuse animée et interactive.
 *  - orbes qui dérivent lentement (GPU)
 *  - poussières lumineuses qui montent
 *  - profondeur : le halo entier glisse doucement vers la souris
 * Pure décor : pointer-events none, masquée si prefers-reduced-motion.
 */
export default function Aurora({ className = '', grain = false }) {
  const trackRef = useRef(null)
  const enabled = true

  // parallax souris (suivi doux, sans boucle coûteuse)
  useEffect(() => {
    if (!enabled) return
    const track = trackRef.current
    if (!track) return
    let pending = false
    const onMove = (e) => {
      if (pending) return
      pending = true
      requestAnimationFrame(() => {
        pending = false
        const x = (e.clientX / window.innerWidth - 0.5) * 46
        const y = (e.clientY / window.innerHeight - 0.5) * 30
        track.style.setProperty('--px', `${x.toFixed(1)}px`)
        track.style.setProperty('--py', `${y.toFixed(1)}px`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled])

  if (!enabled) return null

  return (
    <div aria-hidden="true" className={`pointer-events-none overflow-hidden ${className || 'absolute inset-0'}`}>
      <div ref={trackRef} className="aurora-track absolute inset-0">
        {ORBS.map((o, i) => (
          <span
            key={i}
            className={`aurora-orb ${o.cls}`}
            style={{
              width: o.size,
              height: o.size,
              top: o.top,
              left: o.left,
              right: o.right,
              background: `radial-gradient(circle at center, ${o.color} 0%, transparent 68%)`,
              opacity: o.opacity,
            }}
          />
        ))}
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="mote"
            style={{
              top: m.top,
              left: m.left,
              width: m.s,
              height: m.s,
              ['--dur' ]: `${m.dur}s`,
              ['--delay']: `${m.delay}s`,
              ['--dx']: `${m.dx}px`,
              ['--dy']: `${m.dy}px`,
              ['--peak']: m.peak,
            }}
          />
        ))}
      </div>
      {grain && <span className="grain absolute inset-0" />}
    </div>
  )
}
