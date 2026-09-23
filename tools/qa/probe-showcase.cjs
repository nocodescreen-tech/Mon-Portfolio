// Sonde 2 : pourquoi le clic sur la slide n'ouvre pas / pourquoi Escape colle.
const { chromium } = require('playwright-core')
const fs = require('fs')
const exe = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p))

;(async () => {
  const b = await chromium.launch({ executablePath: exe, headless: true })
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  p.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type().toUpperCase() + ': ' + m.text().slice(0, 300)) })
  await p.goto('http://localhost:4180/', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2500)
  await p.evaluate(() => document.getElementById('projets').scrollIntoView())
  await p.waitForTimeout(900)

  // 1. JS click sur la slide active (bypass les événements pointeur)
  const openedByJs = await p.evaluate(() => {
    document.querySelector('[data-stage-slide][data-offset="0"]').click()
    return new Promise((res) => setTimeout(() => res(!!document.querySelector('[role="dialog"]')), 500))
  })
  console.log('JS CLICK OPENED:', openedByJs)
  if (openedByJs) {
    await p.keyboard.press('Escape')
    await p.waitForTimeout(2500)
    const stillThere = await p.evaluate(() => !!document.querySelector('[role="dialog"]'))
    console.log('APRES ESCAPE (2.5s):', stillThere ? 'ENCORE OUVERT (exit bloquée!)' : 'fermé proprement')
  }

  // 2. clic réel avec inspection du point
  const box = await p.locator('[data-stage-slide][data-offset="0"]').boundingBox()
  const at = await p.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y)
    return el ? el.tagName + '.' + String(el.className).slice(0, 60) : 'rien'
  }, [box.x + box.width * 0.5, box.y + box.height * 0.35])
  console.log('ELEMENT AT POINT:', at)
  await p.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.35)
  await p.waitForTimeout(800)
  const openedByReal = await p.evaluate(() => !!document.querySelector('[role="dialog"]'))
  console.log('REAL CLICK OPENED:', openedByReal)

  if (openedByReal) {
    // 3. flèches puis Escape, avec détails
    await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(500)
    const cap = await p.evaluate(() => document.querySelector('[data-testid="detail-caption"]')?.textContent.trim())
    console.log('CAPTION:', cap)
    await p.keyboard.press('Escape')
    await p.waitForTimeout(500)
    const s1 = await p.evaluate(() => !!document.querySelector('[role="dialog"]'))
    await p.waitForTimeout(2000)
    const s2 = await p.evaluate(() => !!document.querySelector('[role="dialog"]'))
    console.log('ESCAPE: après 0.5s=' + s1 + ' après 2.5s=' + s2)

    // 4. re-open + switch projet dans le détail
    if (s2) {
      // encore ouvert — re-click backdrop pour fermer puis rouvrir propre
      await p.evaluate(() => document.querySelector('.lightbox-backdrop')?.click())
      await p.waitForTimeout(1000)
    }
    const box2 = await p.locator('[data-stage-slide][data-offset="0"]').boundingBox()
    await p.mouse.click(box2.x + box2.width * 0.5, box2.y + box2.height * 0.35)
    await p.waitForTimeout(700)
    await p.locator('button:has-text("Projet suivant")').click()
    await p.waitForTimeout(900)
    const t = await p.evaluate(() => document.querySelector('[role="dialog"] h2')?.textContent)
    console.log('TITRE APRES SWITCH:', t)
    await p.keyboard.press('Escape')
    await p.waitForTimeout(1500)
    const fin = await p.evaluate(() => !!document.querySelector('[role="dialog"]'))
    console.log('ESCAPE APRES SWITCH:', fin ? 'bloqué' : 'ok')
  }

  console.log('--- CONSOLE (' + errors.length + ') ---')
  errors.slice(0, 6).forEach((e) => console.log(e))
  await p.screenshot({ path: 'tools/qa/probe-showcase.png' })
  await b.close()
  process.exit(0)
})().catch((e) => { console.log('FATAL', e.message); process.exit(1) })
