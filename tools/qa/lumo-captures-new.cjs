// Captures LUMO production (connecté) → public/lumo/
// Pages : dashboard → screen3, historique stock (mouvements) → screen1,
// produits → screen2, caisse POS → screen5, vue mobile → screen4.
const { chromium } = require('playwright-core')
const fs = require('fs')

const BASE = 'https://lumo-frontend-production-1dba.up.railway.app'
const OUT = 'C:/Users/rene/rene-descartes-portfolio/public/lumo'
const EXE = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p))

;(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true })
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  p.on('pageerror', (e) => console.log('PAGEERROR:', e.message.slice(0, 150)))

  // connexion
  await p.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(2500)
  await p.locator('input').nth(0).fill('rcbeatzp@gmail.com')
  await p.locator('input').nth(1).fill('@Rc808032')
  await p.locator('input').nth(1).press('Enter')
  // Railway cold start possible : on patiente jusqu'à 45 s
  let logged = false
  for (let i = 0; i < 15 && !logged; i++) {
    await p.waitForTimeout(3000)
    logged = !p.url().includes('/login')
  }
  console.log('connecté:', logged, '→', p.url())
  if (!logged) throw new Error('connexion échouée')
  await p.waitForTimeout(3000)

  const shots = [
    { path: BASE + '/', file: 'screen3.png', name: 'dashboard' },
    { path: BASE + '/stock-history', file: 'screen1.png', name: 'mouvements de stock' },
    { path: BASE + '/products', file: 'screen2.png', name: 'produits & stocks' },
    { path: BASE + '/pos', file: 'screen5.png', name: 'caisse POS' },
  ]
  for (const s of shots) {
    await p.goto(s.path, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await p.waitForTimeout(3500)
    await p.screenshot({ path: OUT + '/' + s.file })
    console.log('capturé:', s.name, '→', s.file)
  }

  // vue mobile (interface responsive)
  await p.setViewportSize({ width: 390, height: 844 })
  await p.goto(BASE + '/products', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(3500)
  await p.screenshot({ path: OUT + '/screen4.png' })
  console.log('capturé: mobile → screen4.png')

  await b.close()
  process.exit(0)
})().catch((e) => { console.log('FATAL', String(e.message || e).slice(0, 300)); process.exit(1) })
