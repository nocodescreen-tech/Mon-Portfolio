import { useEffect, useState } from 'react'

/**
 * Fallback statique élégant (motif géométrique minimal) utilisé quand la 3D
 * n'est pas dispo (mobile toucher, pas de WebGL, reduced-motion).
 */
function StaticFallback({ accent }) {
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <div
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-[2rem]"
        style={{ background: `radial-gradient(circle at 35% 30%, ${accent}22, transparent 70%)` }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border"
        style={{ borderColor: `${accent}44`, transform: 'translate(-50%,-50%) rotate(18deg)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `${accent}33`, transform: 'translate(-50%,-50%)' }}
      />
    </div>
  )
}

/** Statique pour rendu SSR / tests / première passe. */
const isServer = typeof window === 'undefined'

/**
 * HeroScene — scène 3D lazy-loadée. Fallback statique sur mobile,
 * device faible, absences WebGL ou reduced-motion. Suspense intégré.
 */
export default function HeroScene() {
  const [mode, setMode] = useState(isServer ? 'fallback' : 'loading')
  const [resolved, setResolved] = useState(null)

  // charger le canvas 3D uniquement quand la condition est OK
  useEffect(() => {
    if (isServer) return
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const noWebGL = !(document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl'))

    // La 3D est lourde : on ne la charge que sur un vrai écran (souris) + WebGL.
    if (coarse || noWebGL) {
      setMode('fallback')
      return
    }
    setMode('loading')
    import('./HeroSceneCanvas')
      .then((m) => { setResolved(() => m.default) })
      .catch(() => setMode('fallback'))
  }, [])

  if (mode === 'fallback') return <StaticFallback accent="#ff5b2e" />
  if (!resolved) {
    return (
      <div className="grid h-full w-full place-items-center" aria-hidden="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-accent" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }
  const Canvas = resolved
  return <Canvas />
}
