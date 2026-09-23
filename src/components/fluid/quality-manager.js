// Moniteur de performance : FPS mesuré par fenêtres, verdicts de
// downgrade MONOTONES avec hystérésis + cooldown (jamais de ping-pong
// HIGH↔LOW : on ne remonte jamais tout seul, on ne redescend qu'une
// fenêtre "calme" passée).

export function createPerfMonitor({
  windowMs = 700, // ~42 frames à 60 fps par fenêtre d'échantillon
  badFps = 50,
  criticalFps = 30, // en dessous de 30 fps soutenu au plancher LOW, l'effet cède
  badWindowsNeeded = 3, // 3 fenêtres (~2 s) sous 50 fps avant de descendre
  criticalWindowsNeeded = 3, // ~2 s soutenu sous 35 fps : signal device faible fiable
  cooldownMs = 4000,
} = {}) {
  let frames = 0
  let windowStart = 0
  let badCount = 0
  let criticalCount = 0
  let cooldownUntil = 0
  let lastFps = 60

  /**
   * À appeler une fois par frame simulée.
   * Retourne null | 'bad' | 'critical'.
   */
  function tick(now) {
    if (windowStart === 0) windowStart = now
    frames++
    if (now - windowStart < windowMs) return null

    lastFps = (frames * 1000) / (now - windowStart)
    frames = 0
    windowStart = now

    // hystérésis : on ignore les verdicts juste après un changement
    if (now < cooldownUntil) return null

    if (lastFps < criticalFps) {
      // fenêtres consécutives sous le seuil critique avant de déclencher —
      // une bouffée de jank isolée (GC, anim lourde) ne doit pas compter
      criticalCount++
      badCount = 0
      if (criticalCount >= criticalWindowsNeeded) {
        cooldownUntil = now + cooldownMs
        criticalCount = 0
        return 'critical'
      }
      return null
    }
    if (lastFps < badFps) {
      badCount++
      if (badCount >= badWindowsNeeded) {
        cooldownUntil = now + cooldownMs
        badCount = 0
        return 'bad'
      }
      return null
    }
    badCount = 0
    return null
  }

  return {
    tick,
    reset() {
      frames = 0
      windowStart = 0
      badCount = 0
      criticalCount = 0
    },
    get fps() {
      return lastFps
    },
  }
}
