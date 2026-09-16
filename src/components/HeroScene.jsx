import { useEffect, useState, lazy } from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * Fallback statique élégant (motif géométrique minimal). Conservé pour mobile / fallback.
 */
function StaticFallback() {
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <div
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-[2rem]"
        style={{ background: 'radial-gradient(circle at 35% 30%, #ff5b2e22, transparent 70%)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border"
        style={{ borderColor: '#ff5b2e44', transform: 'translate(-50%,-50%) rotate(18deg)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: '#ff5b2e33', transform: 'translate(-50%,-50%)' }}
      />
    </div>
  )
}

/**
 * HeroScene – charge dynamiquement le composant 3D adapté (desktop : Parallax, mobile : Canvas 2D).
 */
export default function HeroScene() {
  const [Scene, setScene] = useState(null)

  useEffect(() => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT
    const importFn = isMobile
      ? () => import('./HeroSceneCanvas')
      : () => import('./HeroSceneParallax')
    lazy(importFn)
      .then((m) => setScene(() => m.default))
      .catch(() => setScene(() => StaticFallback))
  }, [])

  if (!Scene) {
    return (
      <div className="grid h-full w-full place-items-center" aria-hidden="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }
  return (
    <div className="relative h-full w-full">
      <Scene />
    </div>
  )
}
