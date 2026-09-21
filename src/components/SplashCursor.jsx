import { useEffect, useRef, useState } from 'react'
import { resolvePreset } from './fluid/device-profile'
import { createFluidEngine } from './fluid/fluid-engine'
import { readThemeColors, parseCssColor } from './fluid/theme-colors'

/**
 * SplashCursor — traînée fluide WebGL qui suit le curseur, version
 * production : initialisation différée (requestIdleCallback), boucle rAF
 * intelligente (idle → running → décroissance → pause), qualité adaptative
 * avec hystérésis, DPR plafonné par palier, visibilité d'onglet, couleurs
 * thémées, reduced-motion et fallback WebGL silencieux.
 *
 * API :
 *   enabled   bool          — interrupteur (défaut true)
 *   quality   'auto'|'high'|'medium'|'low'|'off' — palier initial
 *   mobile    'auto'|'on'|'off'  — comportement tactile ('auto' : LOW, OFF
 *                              sur téléphones très modestes)
 *   intensity number 0.5–2 — force/rayon des splats (défaut 1)
 *   color     'theme'|'#hex'— source des couleurs (défaut 'theme' = tokens
 *                              CSS --accent / --accent-2)
 *
 * À monter UNE seule fois, à la racine du layout (fait dans App.jsx,
 * chunk lazy + montage différé en idle — zéro impact LCP/INP).
 *
 * Note reduced-motion : le site garde volontairement ses animations UI sous
 * `prefers-reduced-motion: reduce` (cf. index.css), mais pas cet effet :
 * simulation GPU purement décorative → désactivée complètement.
 */
export default function SplashCursor({
  enabled = true,
  quality = 'auto',
  mobile = 'auto',
  intensity = 1,
  color = 'theme',
} = {}) {
  const canvasRef = useRef(null)
  const [autoOff, setAutoOff] = useState(false)
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const presetName = resolvePreset({ quality, mobile })
  const active = enabled && !reduced && !autoOff && presetName != null

  // bascule reduced-motion en direct (changement de réglage OS)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // création/destruction de l'engine — l'initialisation WebGL attend
  // la fenêtre idle : le rendu initial du site passe toujours en premier.
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return

    let engine = null
    let idleId = null
    let timerId = null
    let observer = null
    let cancelled = false

    const fixedColor = color !== 'theme' ? parseCssColor(color) : null
    const initialColors = fixedColor ? { primary: fixedColor, secondary: fixedColor } : readThemeColors()

    const startEngine = () => {
      if (cancelled) return
      try {
        engine = createFluidEngine({
          canvas,
          preset: presetName,
          intensity,
          colors: initialColors,
          debug: import.meta.env.DEV,
          onAutoDisable: () => setAutoOff(true),
        })
      } catch {
        engine = null // WebGL capricieux : le site continue sans effet
      }
      if (!engine) return
      // suivi du thème : le fluide change de teinte sans recréer l'engine
      if (!fixedColor) {
        observer = new MutationObserver(() => {
          if (engine) engine.setColors(readThemeColors())
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
      }
    }

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(startEngine, { timeout: 2500 })
    } else {
      timerId = window.setTimeout(startEngine, 1000)
    }

    return () => {
      cancelled = true
      if (idleId != null) window.cancelIdleCallback(idleId)
      if (timerId != null) window.clearTimeout(timerId)
      if (observer) observer.disconnect()
      if (engine) engine.dispose()
      engine = null
    }
  }, [active, presetName, intensity, color])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      id="fluid-cursor"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        // au-dessus du contenu (z-[1]), sous la nav (z-50), la barre de
        // progression (z-60), le drawer mobile (z-65/70) et le skip-link.
        zIndex: 40,
        // masqué jusqu'au premier rendu : l'engine l'affiche au réveil
        visibility: 'hidden',
      }}
    />
  )
}
