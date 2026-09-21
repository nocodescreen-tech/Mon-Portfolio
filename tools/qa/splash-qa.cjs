// QA SplashCursor — valide l'intégration production-ready de l'overlay fluide.
// Pré-requis : dev server sur http://localhost:4180 (QA_PORT=4180 node splash-qa.cjs).
//
// Architecture des tests :
//   Navigateur principal (GPU matériel si dispo — rendu réaliste) :
//     S1  boot : engine initialisé en idle, canvas masqué, 0 erreur JS
//     S2  mouvement → running + preuve pixels (delta captures avant/après)
//     S3  idle → pause + canvas effacé (zéro rémanence)
//     S4  visibilitychange : masqué = stoppé ; retour = idle puis running au mouvement
//     S5  thème dark↔light : couleurs live, engine NON recréé
//     S8  resize viewport → backing store recalculé (dpr plafonné)
//     S10 scroll + marquee/carousel : aucune erreur, effet actif
//     S12 fluide + FPS ≥ 45 en conditions réalistes
//   Navigateur dédié SWIFTSHADER (rendu logiciel — device faible simulé) :
//     S13 tier plafonné LOW
//     S9  charge soutenue → auto-extinction (REDUCE EFFECT avant le site)
//   Contextes isolés : S11 route #/admin (démontage/remontage), S6 reduced-motion,
//     S7 WebGL indisponible (site intact)
//
// Si l'adaptatif éteint l'effet (device réellement faible), les scénarios
// suivants sont marqués SKIP (comportement nominal), pas FAIL.

const { chromium } = require('playwright-core')
const fs = require('fs')
const zlib = require('zlib')

const BASE = `http://localhost:${process.env.QA_PORT || 4180}/`
const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
]
const results = []
let networkErrors = 0

function record(name, pass, info) {
  results.push({ test: name, pass, info: info == null ? '' : String(info) })
  console.log((pass ? 'PASS' : 'FAIL') + '  ' + name + (info != null ? '  — ' + info : ''))
}

function skip(name, reason) {
  results.push({ test: name + ' — SKIP', pass: true, info: reason })
  console.log('SKIP  ' + name + '  — ' + reason)
}

// ————— décode PNG minimal (cf. decode-png.cjs) —————
function decodePNG(buf) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10]
  for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) throw new Error('pas un PNG')
  let off = 8, width = 0, height = 0, colorType = 0
  const idat = []
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      colorType = data[9]
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    off += 12 + len
  }
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const bpp = colorType === 6 ? 4 : 3
  const stride = width * bpp
  const px = Buffer.alloc(height * stride)
  let pos = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[pos]
    pos++
    const row = raw.subarray(pos, pos + stride)
    pos += stride
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : null
    const out = px.subarray(y * stride, (y + 1) * stride)
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[x - bpp] : 0
      const b = prev ? prev[x] : 0
      const c = x >= bpp && prev ? prev[x - bpp] : 0
      let v
      switch (filter) {
        case 1: v = row[x] + a; break
        case 2: v = row[x] + b; break
        case 3: v = row[x] + ((a + b) >> 1); break
        case 4: {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
          v = row[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)
          break
        }
        default: v = row[x]
      }
      out[x] = v & 0xff
    }
  }
  return { width, height, bpp, px }
}

function diffPixels(a, b, x0, y0, x1, y1) {
  let n = 0
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * a.width + x) * a.bpp
      const d =
        Math.abs(a.px[i] - b.px[i]) + Math.abs(a.px[i + 1] - b.px[i + 1]) + Math.abs(a.px[i + 2] - b.px[i + 2])
      if (d > 36) n++
    }
  }
  return n
}

// zigzag court (< fenêtre perf de 700 ms) : réveille l'engine sans verdict
async function zigzag(page, y0, y1, x0, x1, steps = 10) {
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps
    const y = i % 2 === 0 ? y0 : y1
    await page.mouse.move(Math.round(x), Math.round(y), { steps: 3 })
    await page.waitForTimeout(14)
  }
}

const hook = (page) => page.evaluate(() => (window.__splash ? { ...window.__splash } : null))

async function awaitHook(page, timeout = 15000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    const h = await hook(page)
    if (h) return h
    await page.waitForTimeout(200)
  }
  return null
}

function watchErrors(page, logs) {
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') logs.push('CONSOLE: ' + m.text())
  })
}

// erreurs JS réelles ; les erreurs réseau (API absente en dev) sont à part
function realErrors(logs) {
  return logs.filter((l) => !/Failed to load resource|net::ERR|Failed to fetch/.test(l))
}
function countNetworkErrors(logs) {
  return logs.filter((l) => /Failed to load resource|net::ERR|Failed to fetch/.test(l)).length
}

async function main() {
  const exe = CHROME_CANDIDATES.find((p) => fs.existsSync(p))
  if (!exe) throw new Error('Chrome/Edge introuvable pour la QA headless')

  // ==================== Navigateur principal (GPU matériel) ====================
  const browser = await chromium.launch({ executablePath: exe, headless: true })

  // ————— Page 1 : cycle de vie complet —————
  let alive = true
  {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const logs = []
    watchErrors(p, logs)
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await p.waitForTimeout(3000)
    const h = await awaitHook(p)
    const vis = await p.evaluate(() => {
      const c = document.querySelector('#fluid-cursor')
      return c ? c.style.visibility : 'ABSENT'
    })
    record('S1a engine initialisé en idle (lazy, requestIdleCallback)', !!h && h.state === 'idle', JSON.stringify(h))
    record('S1b canvas masqué en idle (zéro coût)', vis === 'hidden', 'visibility=' + vis)
    record('S1c aucune erreur JS au chargement', realErrors(logs).length === 0, realErrors(logs).join(' | ').slice(0, 300))
    if (!h) alive = false
    const base = decodePNG(await p.screenshot({ path: 'tools/qa/splash-1-idle.png' }))

    // S2 — réveil + preuve pixels : zigzag (traînée) puis burst de clic ×10
    // sur zone sombre, capture immédiate. La traînée seule (~15% d'alpha)
    // retombe vite sous tout seuil de détection — le burst garantit le signal.
    await zigzag(p, 640, 800, 140, 1300)
    await p.mouse.move(1100, 350)
    await p.mouse.down()
    await p.mouse.up()
    const h2 = await hook(p)
    if (!h2) alive = false
    const shot = decodePNG(await p.screenshot({ path: 'tools/qa/splash-2-fluid.png' }))
    const burstPx = diffPixels(base, shot, 900, 200, 1300, 500)
    if (h2 && h2.state === 'running') {
      record('S2a mouvement → running + canvas visible', true, 'state=running tier=' + h2.tier)
      record('S2b pixels fluides rendus (burst + traînée)', burstPx > 400, burstPx + ' px (zone burst 400×300)')
      record('S2c résolutions bornées au preset', !!h2.dye && h2.dye[0] <= 1700, 'dye=' + JSON.stringify(h2.dye))
    } else {
      record('S2a mouvement → running', false, 'hook=' + JSON.stringify(h2))
      skip('S2b/S2c', 'engine auto-éteint par l\'adaptatif (GPU insuffisant en headless)')
    }

    // S3 — idle → pause : les pixels du burst doivent avoir disparu
    // (comparaison S2↔S3 : le contenu statique s'annule, reste le fluide)
    if (alive) {
      await p.waitForTimeout(4200)
      const h3 = await hook(p)
      const vis3 = await p.evaluate(() => document.querySelector('#fluid-cursor')?.style.visibility ?? 'ABSENT')
      const shot3 = decodePNG(await p.screenshot({ path: 'tools/qa/splash-3-apres-pause.png' }))
      const fluidGone = diffPixels(shot, shot3, 900, 200, 1300, 500)
      const residue = diffPixels(base, shot3, 900, 200, 1300, 500)
      record('S3a retour en idle après décroissance', h3 != null && h3.state === 'idle' && vis3 === 'hidden', 'state=' + (h3 && h3.state))
      record('S3b canvas effacé, zéro rémanence', fluidGone > 300 && residue < 40, 'fluide disparu=' + fluidGone + ' px, résiduel=' + residue + ' px')
      if (!h3) alive = false
    } else skip('S3', 'engine éteint (§20)')

    // S4 — visibilitychange
    if (alive) {
      await p.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
        document.dispatchEvent(new Event('visibilitychange'))
      })
      await p.waitForTimeout(300)
      const h4a = await hook(p)
      await zigzag(p, 640, 800, 200, 1000, 5)
      const h4b = await hook(p)
      record('S4a onglet masqué → simulation stoppée', h4a != null && h4a.state === 'hidden', 'state=' + (h4a && h4a.state))
      record('S4b mouvement ignoré pendant masqué', h4b != null && h4b.state === 'hidden', 'state=' + (h4b && h4b.state))
      await p.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
        document.dispatchEvent(new Event('visibilitychange'))
      })
      await p.waitForTimeout(200)
      const h4c = await hook(p)
      await zigzag(p, 640, 800, 300, 900, 5)
      const h4d = await hook(p)
      record('S4c retour onglet → idle (pas de reprise auto)', h4c != null && h4c.state === 'idle', 'state=' + (h4c && h4c.state))
      record('S4d mouvement après retour → running', h4d != null && h4d.state === 'running', 'state=' + (h4d && h4d.state))
      if (!h4d) alive = false
    } else skip('S4', 'engine éteint (§20)')

    // S5 — thème dark↔light sans recréation
    if (alive) {
      const instBefore = (await hook(p)).instance
      const darkColors = (await hook(p)).colors.primary
      await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
      await p.waitForTimeout(400)
      const h5 = await hook(p)
      const lightColors = h5 && h5.colors.primary
      await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
      await p.waitForTimeout(200)
      const darkOk = darkColors && Math.abs(darkColors[0] - 1) < 0.02 && Math.abs(darkColors[1] - 0.357) < 0.02
      const lightOk = lightColors && Math.abs(lightColors[0] - 0.902) < 0.02 && Math.abs(lightColors[1] - 0.31) < 0.02
      record('S5a couleur dark = --accent #ff5b2e', !!darkOk, JSON.stringify(darkColors))
      record('S5b bascule light = --accent #e64f1e (live)', !!lightOk, JSON.stringify(lightColors))
      record("S5c thème changé SANS recréer l'engine", h5 != null && h5.instance === instBefore, 'instance ' + instBefore + ' → ' + (h5 && h5.instance))
      if (!h5) alive = false
    } else skip('S5', 'engine éteint (§20)')

    // S8 — resize
    if (alive) {
      await p.waitForTimeout(2000) // idle
      await p.setViewportSize({ width: 1024, height: 640 })
      await p.waitForTimeout(300)
      await p.mouse.move(400, 300) // réveil → applyResize nouvelles dims
      await p.waitForTimeout(400)
      const dims8 = await p.evaluate(() => {
        const c = document.querySelector('#fluid-cursor')
        return { w: c ? c.width : null, h: c ? c.height : null, dpr: window.devicePixelRatio }
      })
      const h8 = await hook(p)
      record(
        'S8 resize → backing store recalculé (dpr plafonné)',
        !!h8 && dims8.dpr === 1 && dims8.w === 1024 && dims8.h === 640,
        JSON.stringify(dims8)
      )
      if (!h8) alive = false
    } else skip('S8', 'engine éteint (§20)')

    // S10 — scroll + sections animées + S12 — FPS réaliste
    if (alive) {
      const logs10 = []
      watchErrors(p, logs10)
      await p.evaluate(() => window.scrollTo(0, 1400))
      await p.waitForTimeout(600)
      await zigzag(p, 200, 700, 150, 900, 8)
      const h10 = await hook(p)
      networkErrors += countNetworkErrors(logs) + countNetworkErrors(logs10)
      record(
        'S10 scroll + carousel : aucune erreur, effet actif',
        realErrors(logs10).length === 0 && h10 != null && (h10.state === 'running' || h10.state === 'idle'),
        'erreurs=' + realErrors(logs10).length + ' state=' + (h10 && h10.state)
      )

      const fpsPromise = p.evaluate(
        () =>
          new Promise((res) => {
            let frames = 0
            const t0 = performance.now()
            const tick = () => {
              frames++
              if (performance.now() - t0 < 2000) requestAnimationFrame(tick)
              else res(Math.round((frames * 1000) / (performance.now() - t0)))
            }
            requestAnimationFrame(tick)
          })
      )
      const moves = (async () => {
        for (let i = 0; i < 46; i++) {
          await p.mouse.move(200 + ((i * 37) % 700), 300 + ((i * 53) % 280), { steps: 2 })
          await p.waitForTimeout(12)
        }
      })()
      const [fps] = await Promise.all([fpsPromise, moves])
      const h12 = await hook(p)
      record(
        'S12 GPU réel : fluide vivant, FPS ≥ 45',
        h12 != null && fps >= 45,
        'fps nav=' + fps + ' tier=' + (h12 && h12.tier) + ' dye=' + JSON.stringify(h12 && h12.dye)
      )
    } else skip('S10/S12', 'engine éteint (§20)')
    await p.close()
  }

  // ==================== Navigateur SWIFTSHADER : plafond LOW + auto-extinction ====================
  {
    const sw = await chromium.launch({
      executablePath: exe,
      headless: true,
      args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
    })
    const p = await sw.newPage({ viewport: { width: 1440, height: 900 } })
    const logs = []
    watchErrors(p, logs)
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    const h0 = await awaitHook(p)
    record(
      'S13 rendu logiciel (SwiftShader) → tier plafonné LOW',
      h0 != null && h0.tier === 'low',
      'tier=' + (h0 && h0.tier) + ' dye=' + JSON.stringify(h0 && h0.dye)
    )

    // ~3-5 s de mouvement continu : 3 fenêtres < 35 fps → auto-extinction
    for (let i = 0; i < 90; i++) {
      await p.mouse.move(200 + ((i * 31) % 800), 250 + ((i * 47) % 300), { steps: 1 })
      await p.waitForTimeout(18)
    }
    await p.waitForTimeout(800)
    const hAfter = await hook(p)
    const canvasAfter = await p.evaluate(() => !!document.querySelector('#fluid-cursor'))
    networkErrors += countNetworkErrors(logs)
    const disabledCleanly = hAfter == null && !canvasAfter
    const stillHealthy = hAfter != null && hAfter.fps >= 45
    record(
      'S9 charge soutenue → auto-extinction propre OU fluide ≥ 45 fps (§20)',
      disabledCleanly || stillHealthy,
      disabledCleanly
        ? 'effet éteint proprement (engine + canvas retirés)'
        : 'effet vivant fps=' + (hAfter && hAfter.fps)
    )
    record('S9b aucune erreur JS sous charge', realErrors(logs).length === 0, realErrors(logs).join(' | ').slice(0, 200))
    await p.close()
    await sw.close()
  }

  // ==================== Page 3 : admin → démontage/remontage ====================
  {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const logs = []
    watchErrors(p, logs)
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    const hBefore = await awaitHook(p)
    await p.evaluate(() => {
      window.location.hash = '#/admin'
    })
    await p.waitForTimeout(1500)
    const hAdmin = await hook(p)
    record('S11a route admin : cleanup complet (hook supprimé)', hBefore != null && hAdmin == null, 'avant=' + (hBefore != null) + ' après=' + JSON.stringify(hAdmin))
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    const hBack = await awaitHook(p)
    record('S11b retour site public : remontage propre', hBack != null && hBack.state === 'idle', 'state=' + (hBack && hBack.state))
    networkErrors += countNetworkErrors(logs)
    record(
      'S11c aucune erreur JS réelle après navigation admin',
      realErrors(logs).length === 0,
      (realErrors(logs).join(' | ') || '(erreurs fetch API admin attendues en dev sans backend)').slice(0, 250)
    )
    await p.close()
  }

  // ==================== Ctx : prefers-reduced-motion ====================
  {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    const logs = []
    watchErrors(p, logs)
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await p.waitForTimeout(6000)
    await zigzag(p, 640, 800, 140, 1300, 6)
    await p.waitForTimeout(500)
    const h = await hook(p)
    const canvas = await p.evaluate(() => !!document.querySelector('#fluid-cursor'))
    networkErrors += countNetworkErrors(logs)
    record('S6 reduced-motion → effet désactivé (ni canvas, ni engine)', h == null && !canvas, 'hook=' + JSON.stringify(h))
    record('S6b aucune erreur sous reduced-motion', realErrors(logs).length === 0, realErrors(logs).join(' | ').slice(0, 200))
    await p.close()
  }

  // ==================== Ctx : WebGL indisponible ====================
  {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const logs = []
    watchErrors(p, logs)
    await p.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (/webgl|experimental-webgl/.test(type)) return null
        return orig.call(this, type, ...args)
      }
    })
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await p.waitForTimeout(6000)
    await zigzag(p, 640, 800, 140, 1300, 6)
    const h = await hook(p)
    const heroOk = await p.evaluate(() => !!document.querySelector('h1'))
    networkErrors += countNetworkErrors(logs)
    record(
      'S7 WebGL indisponible → site intact (hero rendu), 0 erreur JS',
      h == null && heroOk && realErrors(logs).length === 0,
      'hero=' + heroOk + ' erreurs=' + realErrors(logs).length
    )
    await p.close()
  }

  await browser.close()

  // ————— bilan —————
  const failed = results.filter((r) => !r.pass)
  console.log('\nRESULT_START')
  console.log(
    JSON.stringify(
      { total: results.length, passed: results.length - failed.length, failed: failed.length, networkErrorsDevOnly: networkErrors, results },
      null,
      2
    )
  )
  console.log('RESULT_END')
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => {
  console.log('FATAL', String(e && e.message ? e.message : e).slice(0, 400))
  process.exit(1)
})
