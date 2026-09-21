// Sonde nav intelligente : scrollTo natif sous Lenis + événements scroll framer.
const { chromium } = require('playwright-core')
const fs = require('fs')
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe']
  .find((p) => fs.existsSync(p))

;(async () => {
  const b = await chromium.launch({ executablePath: exe, headless: true })
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto('http://localhost:4180/', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2000)

  const read = () =>
    p.evaluate(() => ({
      y: window.scrollY,
      headerY: Math.round(document.querySelector('header').getBoundingClientRect().y),
      headerTransform: document.querySelector('header').style.transform,
    }))

  console.log('initial:', JSON.stringify(await read()))

  await p.evaluate(() => window.scrollTo(0, 400))
  await p.waitForTimeout(400)
  console.log('après scrollTo 400:', JSON.stringify(await read()))

  await p.evaluate(() => window.scrollTo(0, 1000))
  await p.waitForTimeout(600)
  console.log('après scrollTo 1000 (descend):', JSON.stringify(await read()))
  await p.waitForTimeout(600)
  console.log('  +600ms:', JSON.stringify(await read()))

  await p.evaluate(() => window.scrollTo(0, 600))
  await p.waitForTimeout(600)
  console.log('après scrollTo 600 (remonte):', JSON.stringify(await read()))

  // essai via lenis.scrollTo (API du projet)
  await p.evaluate(() => window.__lenis?.scrollTo(1600, { duration: 0.6 }))
  await p.waitForTimeout(1000)
  console.log('après lenis.scrollTo 1600:', JSON.stringify(await read()))
  await p.evaluate(() => window.__lenis?.scrollTo(300, { duration: 0.6 }))
  await p.waitForTimeout(1000)
  console.log('après lenis.scrollTo 300 (remonte):', JSON.stringify(await read()))

  await b.close()
  process.exit(0)
})().catch((e) => { console.log('FATAL', e.message); process.exit(1) })
