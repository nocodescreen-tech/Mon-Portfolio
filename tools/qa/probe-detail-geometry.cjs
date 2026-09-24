// Mesure : pourquoi le dossier n'est pas centré verticalement ?
const { chromium } = require('playwright-core')
const fs = require('fs')
const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))

;(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true })
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto('http://localhost:4180/', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await p.waitForTimeout(2500)
  for (let i = 0; i < 40; i++) {
    const ok = await p.evaluate(() => !!document.getElementById('projets'))
    if (ok) break
    await p.waitForTimeout(500)
  }
  await p.evaluate(() => document.getElementById('projets').scrollIntoView())
  await p.waitForTimeout(900)
  const box = await p.locator('[data-stage-slide][data-offset="0"]').boundingBox()
  await p.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.35)
  await p.waitForTimeout(1500)
  const m = await p.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]')
    const container = dialog && dialog.querySelector(':scope > div:last-child')
    const panel = container && container.firstElementChild
    const cr = container ? container.getBoundingClientRect() : null
    const pr = panel ? panel.getBoundingClientRect() : null
    return {
      viewport: [window.innerWidth, window.innerHeight],
      container: cr ? { top: cr.top, height: cr.height, scrollH: container.scrollHeight, clientH: container.clientHeight, scrollTop: container.scrollTop } : null,
      panel: pr ? { top: pr.top, height: pr.height } : null,
      panelStyles: panel ? { h: panel.style.height, cls: panel.className.slice(0, 140) } : null,
    }
  })
  console.log(JSON.stringify(m, null, 2))
  await b.close()
  process.exit(0)
})().catch((e) => { console.log('FATAL', e.message); process.exit(1) })
