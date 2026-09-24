// Vérification visuelle du dossier split-screen ouvert.
const { chromium } = require('playwright-core')
const fs = require('fs')
const EXE = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p))

;(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true })
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto('http://localhost:4180/', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await p.waitForTimeout(2000)
  // attend le montage (serveur frais = transformation lente)
  for (let i = 0; i < 40; i++) {
    const ok = await p.evaluate(() => !!document.getElementById('projets'))
    if (ok) break
    await p.waitForTimeout(500)
  }
  await p.evaluate(() => document.getElementById('projets').scrollIntoView())
  await p.waitForTimeout(900)
  const active = await p.locator('[data-stage-slide][data-offset="0"]').boundingBox()
  await p.mouse.click(active.x + active.width * 0.5, active.y + active.height * 0.35)
  await p.waitForTimeout(1200)
  await p.screenshot({ path: 'tools/qa/detail-split-desktop.png' })
  console.log('capture détail desktop faite')

  // vue 2 (chevron droit) puis version mobile
  await p.keyboard.press('ArrowRight')
  await p.waitForTimeout(700)
  await p.setViewportSize({ width: 390, height: 844 })
  await p.waitForTimeout(900)
  await p.screenshot({ path: 'tools/qa/detail-split-mobile.png' })
  console.log('capture détail mobile faite')
  await b.close()
  process.exit(0)
})().catch((e) => { console.log('FATAL', e.message); process.exit(1) })
