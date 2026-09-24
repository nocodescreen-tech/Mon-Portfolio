// Captures Visit.toi (dev server local 5174) → public/visit-toi/
// Desktop héros → cover.png · page complète → full.png · mobile → mobile.png
const { chromium } = require('playwright-core')
const fs = require('fs')

const EXE = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p))
const OUT = 'C:/Users/rene/rene-descartes-portfolio/public/visit-toi'

;(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true })
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  p.on('pageerror', (e) => console.log('PAGEERROR:', e.message.slice(0, 150)))

  await p.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(4000)

  await p.screenshot({ path: OUT + '/cover.png' })
  console.log('capturé: héros desktop → cover.png')

  // page complète (si raisonnable en hauteur)
  await p.screenshot({ path: OUT + '/full.png', fullPage: true })
  const full = await p.evaluate(() => ({ h: document.body.scrollHeight, w: document.body.scrollWidth }))
  console.log('capturé: page complète → full.png (' + full.w + 'x' + full.h + ')')

  // vue mobile
  await p.setViewportSize({ width: 390, height: 844 })
  await p.waitForTimeout(1500)
  await p.screenshot({ path: OUT + '/mobile.png' })
  console.log('capturé: mobile → mobile.png')

  await b.close()
  process.exit(0)
})().catch((e) => { console.log('FATAL', String(e.message || e).slice(0, 300)); process.exit(1) })
