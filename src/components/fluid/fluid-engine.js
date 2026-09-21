// Orchestrateur du fluide — machine à états idle | running | hidden.
//
//   aucune interaction   → idle      : zéro rAF, zéro GPU, canvas masqué
//   souris/touch actifs  → running   : plein régime (dt = temps réel)
//   mouvement arrêté      → décroissance ~30 fps, le temps que la traînée
//                           retombe naturellement, puis retour en idle
//   onglet masqué        → hidden    : boucle annulée, reprise au retour
//
// Gère aussi : resize (ResizeObserver + flag, appliqué une fois par frame,
// throttle 120 ms), qualité adaptative (downgrades monotones avec
// hystérésis via quality-manager.js), couleurs de thème, perte de contexte
// WebGL et cleanup complet des ressources.

import { createGLContext, isSoftwareRenderer } from './gl'
import { createSimulation } from './simulation'
import { createPointerInput } from './pointer-input'
import { createPerfMonitor } from './quality-manager'
import { PRESETS, lowerTier } from './device-profile'

let instanceCounter = 0

// clamp du delta par frame : un vrai swipe < 0.10/frame ; au-delà c'est une
// téléportation (retour dans la fenêtre) — on évite la trainée fantôme.
const MAX_DELTA = 0.12

export function createFluidEngine({ canvas, preset: presetArg, intensity = 1, colors, debug = false, onAutoDisable }) {
  const ctx = createGLContext(canvas)
  if (!ctx) return null
  const { gl, ext } = ctx

  // rendu logiciel détecté (SwiftShader/VM) → plancher LOW d'office
  let presetName = isSoftwareRenderer(gl) ? 'low' : presetArg
  const instance = ++instanceCounter

  const dims = { cssW: 1, cssH: 1, w: 2, h: 2 }
  const pointer = createPointerInput({ onActivity: wake })
  const perf = createPerfMonitor()

  let sim
  try {
    sim = createSimulation({ gl, ext, config: buildSimConfig(presetName, intensity), getCanvasSize: () => dims })
  } catch {
    return null // shader non compilable → fallback silencieux, site intact
  }

  let state = 'idle'
  let rafId = null
  let disposed = false
  let contextLost = false
  let themeColors = colors
  let lastInputAt = 0
  let lastFrameTime = 0
  let decayFlip = false
  let resizeFlag = true
  let lastResizeApply = 0
  let appliedDpr = 1
  let lastPublish = 0
  let splatForce = 6000 * intensity

  function buildSimConfig(name, i) {
    const p = PRESETS[name]
    return {
      simResolution: p.sim,
      dyeResolution: p.dye,
      pressureIterations: p.pressureIterations,
      curl: p.curl,
      densityDissipation: p.densityDissipation,
      velocityDissipation: p.velocityDissipation,
      pressure: 0.1,
      splatRadius: 0.2 * Math.sqrt(i),
      splatForce: 6000 * i,
      shading: p.shading,
    }
  }

  // ————— resize —————

  function applyResize(now = performance.now()) {
    const cssW = canvas.clientWidth
    const cssH = canvas.clientHeight
    if (!cssW || !cssH) return
    const dpr = Math.min(window.devicePixelRatio || 1, PRESETS[presetName].dprCap)
    const w = Math.floor(cssW * dpr)
    const h = Math.floor(cssH * dpr)
    if (canvas.width !== w) canvas.width = w
    if (canvas.height !== h) canvas.height = h
    dims.cssW = cssW
    dims.cssH = cssH
    dims.w = w
    dims.h = h
    appliedDpr = dpr
    sim.syncSize() // ne recrée les FBOs que si la résolution cible a changé
    resizeFlag = false
    lastResizeApply = now
  }

  // ————— couleurs de splat (thème) —————

  function pickColor(s, now) {
    const p = themeColors.primary
    const q = themeColors.secondary
    const t = Math.random()
    const j = 0.8 + Math.random() * 0.4 // variation de luminosité organique
    s.color.r = (p.r + (q.r - p.r) * t) * 0.15 * j
    s.color.g = (p.g + (q.g - p.g) * t) * 0.15 * j
    s.color.b = (p.b + (q.b - p.b) * t) * 0.15 * j
    s.colorAt = now
  }

  function consumePointers(now) {
    const cssW = dims.cssW
    const cssH = dims.cssH
    if (!cssW || !cssH) return
    const aspect = dims.w / dims.h
    const force = splatForce
    const slots = pointer.slots
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i]
      if (!s.active) continue
      if (s.pendingAnchor) {
        s.pendingAnchor = false
        s.px = s.x
        s.py = s.y
        s.moved = false
      }
      if (s.burst) {
        s.burst = false
        pickColor(s, now)
        sim.clickBurst(s.x / cssW, 1 - s.y / cssH, s.color)
      } else if (s.moved) {
        s.moved = false
        const tx = s.x / cssW
        const ty = 1 - s.y / cssH
        let dtx = tx - s.px / cssW
        let dty = (s.py - s.y) / cssH
        if (aspect < 1) dtx *= aspect
        if (aspect > 1) dty /= aspect
        if (dtx < -MAX_DELTA) dtx = -MAX_DELTA
        else if (dtx > MAX_DELTA) dtx = MAX_DELTA
        if (dty < -MAX_DELTA) dty = -MAX_DELTA
        else if (dty > MAX_DELTA) dty = MAX_DELTA
        s.px = s.x
        s.py = s.y
        if (dtx !== 0 || dty !== 0) {
          if (now - s.colorAt > 220) pickColor(s, now)
          sim.splat(tx, ty, dtx * force, dty * force, s.color)
        }
      }
    }
  }

  // ————— boucle d'animation —————

  function frame(now) {
    if (disposed || contextLost || state !== 'running') return

    const preset = PRESETS[presetName]
    const sinceInput = now - lastInputAt

    let work
    if (sinceInput < preset.activeMs) {
      work = true // plein régime
    } else if (sinceInput < preset.decayMs) {
      decayFlip = !decayFlip
      work = decayFlip // décroissance : une frame sur deux (~30 fps)
    } else {
      enterIdle() // plus rien à montrer : pause totale + effacement
      return
    }

    if (work) {
      const fullRate = sinceInput < preset.activeMs
      if (resizeFlag && now - lastResizeApply > 120) applyResize(now)
      const dt = Math.min((now - lastFrameTime) / 1000, fullRate ? 1 / 60 : 1 / 30)
      lastFrameTime = now
      consumePointers(now)
      sim.step(dt)
      sim.render()

      let verdict = null
      if (fullRate) verdict = perf.tick(now)
      else perf.reset() // ne pas mesurer la décroissance volontaire
      if (verdict && !disposed) handleVerdict(verdict)
    }

    if (debug && now - lastPublish > 500) {
      lastPublish = now
      publish()
    }
    if (disposed) return
    rafId = requestAnimationFrame(frame)
  }

  function handleVerdict(kind) {
    // déjà au plancher et toujours trop lent → l'effet doit céder la
    // place à l'interface (règle : REDUCE EFFECT avant REDUCE WEBSITE
    // PERFORMANCE)
    if (presetName === 'low') {
      disable('perf')
      return
    }
    const next = kind === 'critical' ? 'low' : lowerTier(presetName)
    if (!next) {
      disable('perf')
      return
    }
    presetName = next
    splatForce = 6000 * intensity
    try {
      sim.applyConfig(buildSimConfig(next, intensity)) // dye conservé
    } catch {
      disable('perf')
      return
    }
    resizeFlag = true // le dprCap a baissé → ré-applique
    publish()
  }

  function disable(reason) {
    dispose()
    if (onAutoDisable) onAutoDisable(reason)
  }

  function enterIdle() {
    stopLoop()
    state = 'idle'
    sim.clearDisplay()
    canvas.style.visibility = 'hidden'
    publish()
  }

  function stopLoop() {
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function wake() {
    if (disposed || contextLost || state === 'hidden') return
    lastInputAt = performance.now()
    if (state === 'running') return
    state = 'running'
    canvas.style.visibility = ''
    if (resizeFlag) applyResize() // dims à jour avant le premier splat
    pointer.reanchor() // pas de delta de la frame de réveil
    lastFrameTime = performance.now()
    perf.reset()
    publish()
    if (rafId == null) rafId = requestAnimationFrame(frame)
  }

  // ————— visibilité —————

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      stopLoop()
      state = 'hidden'
      publish()
    } else if (state === 'hidden') {
      state = 'idle' // pas de reprise auto : le prochain mouvement réveille
      publish()
    }
  }

  // ————— perte de contexte WebGL —————

  function onContextLost(e) {
    e.preventDefault()
    contextLost = true
    stopLoop()
    state = 'idle'
    canvas.style.visibility = 'hidden'
    publish()
  }

  function onContextRestored() {
    try {
      sim.dispose()
      sim = createSimulation({ gl, ext, config: buildSimConfig(presetName, intensity), getCanvasSize: () => dims })
      contextLost = false
      resizeFlag = true
      state = 'idle'
      publish()
    } catch {
      disable('context')
    }
  }

  // ————— debug (dev uniquement) —————

  function publish() {
    if (!debug) return
    try {
      const stats = sim ? sim.getStats() : null
      window.__splash = {
        instance,
        state,
        fps: Math.round(perf.fps),
        tier: presetName,
        dpr: appliedDpr,
        canvas: [canvas.width, canvas.height],
        resizePending: resizeFlag,
        colors: {
          primary: [themeColors.primary.r, themeColors.primary.g, themeColors.primary.b],
          secondary: [themeColors.secondary.r, themeColors.secondary.g, themeColors.secondary.b],
        },
        dye: stats ? [stats.dyeW, stats.dyeH] : null,
      }
    } catch {
      /* le hook debug ne doit jamais casser le site */
    }
  }

  // ————— montage / cleanup —————

  const onWinResize = () => {
    resizeFlag = true
  }
  const ro = new ResizeObserver(() => {
    resizeFlag = true
  })
  ro.observe(canvas)
  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.addEventListener('webglcontextrestored', onContextRestored)
  window.addEventListener('resize', onWinResize)
  document.addEventListener('visibilitychange', onVisibilityChange)
  pointer.attach()
  publish()

  function dispose() {
    if (disposed) return
    disposed = true
    stopLoop()
    pointer.detach()
    ro.disconnect()
    canvas.removeEventListener('webglcontextlost', onContextLost)
    canvas.removeEventListener('webglcontextrestored', onContextRestored)
    window.removeEventListener('resize', onWinResize)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    if (sim) sim.dispose()
    try {
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      /* contexte déjà parti */
    }
    canvas.style.visibility = ''
    if (debug) {
      try {
        delete window.__splash
      } catch {
        /* noop */
      }
    }
  }

  return {
    wake,
    dispose,
    setColors(c) {
      themeColors = c
      publish()
    },
    get state() {
      return state
    },
    get preset() {
      return presetName
    },
  }
}
