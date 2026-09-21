// Détection de l'appareil + presets de qualité.
// Jamais de résolutions fixes pour tous : DYE 1440 du composant d'origine
// est remplacé par un barème par palier, écrêté ensuite par l'adaptatif.

export const PRESETS = {
  high: {
    dye: 1024,
    sim: 128,
    pressureIterations: 12,
    curl: 3,
    dprCap: 2,
    shading: true,
    densityDissipation: 3.5,
    velocityDissipation: 2,
    // fenêtres (ms) : plein régime après la dernière interaction, puis
    // décroissance à ~30 fps, puis pause complète et effacement.
    activeMs: 900,
    decayMs: 2400,
  },
  medium: {
    dye: 768,
    sim: 96,
    pressureIterations: 8,
    curl: 3,
    dprCap: 1.5,
    shading: true,
    densityDissipation: 3.5,
    velocityDissipation: 2,
    activeMs: 900,
    decayMs: 2200,
  },
  low: {
    dye: 512,
    sim: 64,
    pressureIterations: 5,
    curl: 3,
    dprCap: 1.25,
    shading: false,
    // dissipation accrue : le fluide retombe plus vite, la phase de
    // décroissance coûteuse est plus courte sur les machines faibles.
    densityDissipation: 4.5,
    velocityDissipation: 2.5,
    activeMs: 700,
    decayMs: 1700,
  },
}

export const TIER_ORDER = ['high', 'medium', 'low']

export function detectDeviceProfile() {
  if (typeof window === 'undefined') return { coarse: false, cores: 4, memory: 8 }
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory || 8
  return { coarse, cores, memory }
}

/**
 * Résout le preset initial selon les props et l'appareil.
 * Retourne 'high' | 'medium' | 'low' | null (null = effet désactivé).
 */
export function resolvePreset({ quality = 'auto', mobile = 'auto' } = {}) {
  if (quality === 'off') return null
  if (quality === 'high' || quality === 'medium' || quality === 'low') return quality

  const { coarse, cores, memory } = detectDeviceProfile()
  if (coarse) {
    if (mobile === 'off') return null
    if (mobile === 'on') return 'low'
    // mobile auto : OFF sur les téléphones très modestes, sinon LOW.
    if (cores <= 3 || memory <= 3) return null
    return 'low'
  }
  if (cores >= 8 && memory >= 8) return 'high'
  if (cores >= 4) return 'medium'
  return 'low'
}

/** Palier juste en dessous, ou null si déjà au plancher. */
export function lowerTier(tier) {
  const i = TIER_ORDER.indexOf(tier)
  return i >= 0 && i < TIER_ORDER.length - 1 ? TIER_ORDER[i + 1] : null
}
