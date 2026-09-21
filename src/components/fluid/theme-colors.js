// Couleurs du fluide pilotées par le thème du site.
// Jamais de couleur hardcodée : on lit les design tokens CSS
// (--accent / --accent-2) qui changent avec [data-theme="dark"|"light"].

// flamme graphite (dark) — filet de sécurité si les variables manquent
const FALLBACK = {
  primary: { r: 1, g: 91 / 255, b: 46 / 255 }, // #ff5b2e
  secondary: { r: 1, g: 138 / 255, b: 77 / 255 }, // #ff8a4d
}

/** '#rrggbb' | '#rgb' | 'rgb[a](...)' → {r,g,b} en 0..1, sinon null. */
export function parseCssColor(value) {
  if (!value) return null
  const v = String(value).trim()
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
    }
  }
  const rgb = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i)
  if (rgb) {
    return { r: +rgb[1] / 255, g: +rgb[2] / 255, b: +rgb[3] / 255 }
  }
  return null
}

/** Lit les couleurs d'accent du thème courant sur <html>. */
export function readThemeColors() {
  try {
    const cs = getComputedStyle(document.documentElement)
    const primary = parseCssColor(cs.getPropertyValue('--accent')) || FALLBACK.primary
    const secondary = parseCssColor(cs.getPropertyValue('--accent-2')) || primary
    return { primary, secondary }
  } catch {
    return { primary: FALLBACK.primary, secondary: FALLBACK.secondary }
  }
}
