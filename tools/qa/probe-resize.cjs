// Sonde 2 : S8 resize (mouvement minimal, sans déclencher l'auto-disable)
// + vérification explicite de l'auto-disable (§20) sous swiftshader.
const { chromium } = require('playwright-core')
const fs = require('fs')
const exe = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p))

async function hook(p) {
  return p.evaluate(() => (window.__splash ? { ...window.__splash } : null))
}
async function awaitHook(p, timeout = 12000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    const h = await hook(p)
    if (h) return h
    await p.waitForTimeout(200)
  }
  return null
}

;(async () => {
  const b = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] })

  // ————— Partie 1 : resize avec engine vivant (mouvements minimaux) —————
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto('http://localhost:4180/', { waitUntil: 'domcontentloaded' })
  const h0 = await awaitHook(p)
  console.log('hook initial:', JSON.stringify(h0))

  await p.mouse.move(300, 400) // réveil
  await p.waitForTimeout(250)
  console.log('après 1 move:', JSON.stringify(await hook(p)))

  console.log('--- setViewportSize 1024x640 ---')
  await p.setViewportSize({ width: 1024, height: 640 })
  await p.waitForTimeout(150)
  await p.mouse.move(400, 300) // réveil après resize
  await p.waitForTimeout(350)
  const r = await p.evaluate(() => {
    const c = document.querySelector('#fluid-cursor')
    return {
      hook: window.__splash ? { ...window.__splash } : null,
      client: c ? [c.clientWidth, c.clientHeight] : null,
      inner: [window.innerWidth, window.innerHeight],
      style: c ? { w: c.style.width, h: c.style.height } : null,
    }
  })
  console.log('après resize + move:', JSON.stringify(r))
  await p.close()

  // ————— Partie 2 : auto-disable sous charge soutenue (swiftshader) —————
  const p2 = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p2.goto('http://localhost:4180/', { waitUntil: 'domcontentloaded' })
  const hA = await awaitHook(p2)
  console.log('auto-disable hook initial:', JSON.stringify(hA && { state: hA.state, tier: hA.tier }))
  // mouvement soutenu ~3 s : doit déclencher l'extinction si fps < 35×2 fenêtres
  for (let i = 0; i < 90; i++) {
    await p2.mouse.move(200 + ((i * 31) % 800), 250 + ((i * 47) % 300), { steps: 1 })
    await p2.waitForTimeout(18)
  }
  await p2.waitForTimeout(600)
  const hB = await hook(p2)
  const canvasB = await p2.evaluate(() => !!document.querySelector('#fluid-cursor'))
  console.log('après charge soutenue:', JSON.stringify({ hook: hB, canvasPresent: canvasB }))
  await p2.close()

  await b.close()
  process.exit(0)
})().catch((e) => { console.log('FATAL', e.message); process.exit(1) })
