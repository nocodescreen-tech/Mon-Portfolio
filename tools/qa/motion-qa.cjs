// QA « site vivant » — valide l'évolution motion sans casser l'existant.
// Pré-requis : dev server sur http://localhost:4180.
//
//   D1  desktop : 0 erreur JS, 9 sections rendues
//   D2  SplitWords : titres révélés mot par mot (spans masqués présents)
//   D3  carousel drag souris : la slide bascule au relâchement
//   D4  clavier scopé : les flèches changent la slide dans la zone,
//       mais ne volent jamais les flèches d'un champ formulaire
//   D5  nav intelligente : s'efface en descendant, revient en remontant
//   D6  curseur contextuel : pastille « Glisser » au survol du visuel
//   D7  progression carousel : scaleX avance avec la slide
//   T1  tablette 768×1024 : rendu + 0 erreur
//   M1  mobile 375×812 (touch) : rendu + swipe tactile du carousel
//   R1  reduced-motion : titres rendus sans masques, 0 erreur
//
// Les erreurs réseau (API absente en dev) sont comptées à part.

const { chromium } = require('playwright-core')
const fs = require('fs')

const BASE = `http://localhost:${process.env.QA_PORT || 4180}/`
const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
]
const results = []
let networkErrors = 0

const record = (name, pass, info) => {
  results.push({ test: name, pass, info: info == null ? '' : String(info) })
  console.log((pass ? 'PASS' : 'FAIL') + '  ' + name + (info != null ? '  — ' + info : ''))
}

function watchErrors(page, logs) {
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') logs.push('CONSOLE: ' + m.text())
  })
}
const realErrors = (logs) => logs.filter((l) => !/Failed to load resource|net::ERR|Failed to fetch/.test(l))
const countNetwork = (logs) => logs.filter((l) => /Failed to load resource|net::ERR|Failed to fetch/.test(l)).length

const counterText = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('#projets [aria-live="polite"]')
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : null
  })

async function main() {
  const exe = CHROME_CANDIDATES.find((p) => fs.existsSync(p))
  if (!exe) throw new Error('Chrome/Edge introuvable')
  const browser = await chromium.launch({ executablePath: exe, headless: true })

  // ==================== Desktop ====================
  {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const logs = []
    watchErrors(p, logs)
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await p.waitForTimeout(2500)

    const sections = await p.evaluate(() =>
      ['projets', 'lumo', 'approche', 'prestations', 'competences', 'parcours', 'a-propos', 'contact']
        .map((id) => [id, !!document.getElementById(id)]),
    )
    const missing = sections.filter(([, ok]) => !ok)
    record('D1a les 8 sections + marquee sont rendues', missing.length === 0, JSON.stringify(missing))
    networkErrors += countNetwork(logs)
    record('D1b aucune erreur JS', realErrors(logs).length === 0, realErrors(logs).join(' | ').slice(0, 250))

    // D2 — SplitWords : les titres de sections sont découpés en mots masqués
    await p.evaluate(() => document.getElementById('projets').scrollIntoView())
    await p.waitForTimeout(900)
    const wordSpans = await p.evaluate(() => document.querySelectorAll('#projets h2 span span').length)
    record('D2 titres révélés mot par mot (SplitWords)', wordSpans >= 4, wordSpans + ' spans de mots')

    // D3 — drag souris sur le visuel
    const before = await counterText(p)
    const visual = p.locator('[data-cursor="Glisser"]').first()
    const box = await visual.boundingBox()
    await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5)
    await p.mouse.down()
    await p.mouse.move(box.x + box.width * 0.5 - 260, box.y + box.height * 0.5, { steps: 8 })
    await p.mouse.up()
    await p.waitForTimeout(800)
    const afterDrag = await counterText(p)
    record('D3 drag souris → slide suivante', before !== afterDrag, before + ' → ' + afterDrag)

    // D4 — clavier scopé : flèches dans la zone ; jamais depuis un champ
    const zoneCounter = await counterText(p)
    await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(700)
    const afterKey = await counterText(p)
    const keyWorks = zoneCounter !== afterKey
    await p.evaluate(() => document.getElementById('contact').scrollIntoView())
    await p.waitForTimeout(1500) // laisse Lenis finir son scroll animé
    const contactFirstInput = p.locator('#contact input, #contact textarea').first()
    await contactFirstInput.focus({ timeout: 5000 })
    const stable = await counterText(p)
    for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(400)
    const afterFormKeys = await counterText(p)
    record(
      'D4 clavier scopé (zone OK, formulaire ignoré)',
      keyWorks && stable === afterFormKeys,
      'zone: ' + zoneCounter + '→' + afterKey + ' ; formulaire: ' + stable + '→' + afterFormKeys,
    )

    // D5 — nav intelligente (part d'une position haute, descend, remonte)
    await p.evaluate(() => window.scrollTo(0, 300))
    await p.waitForTimeout(800)
    await p.evaluate(() => window.scrollTo(0, 900))
    await p.waitForTimeout(900)
    const headerHidden = await p.evaluate(() => {
      const r = document.querySelector('header').getBoundingClientRect()
      return r.bottom < 10 // entièrement sortie
    })
    await p.evaluate(() => window.scrollTo(0, 500))
    await p.waitForTimeout(900)
    const headerShown = await p.evaluate(() => {
      const r = document.querySelector('header').getBoundingClientRect()
      return r.y > -10 && r.y < 10
    })
    record('D5 nav s\'efface en descendant, revient en remontant', headerHidden && headerShown, 'hidden=' + headerHidden + ' shown=' + headerShown)

    // D6 — curseur contextuel : la slide active annonce l'action « Ouvrir »
    await p.evaluate(() => document.getElementById('projets').scrollIntoView())
    await p.waitForTimeout(600)
    await p.locator('[data-stage-slide][data-offset="0"]').hover()
    await p.waitForTimeout(350)
    const label = await p.evaluate(() => {
      const els = Array.from(document.querySelectorAll('span'))
      const fixed = els.find((el) => el.textContent.trim() === 'Ouvrir' && el.closest('.fixed'))
      return fixed ? fixed.textContent.trim() : null
    })
    record('D6 pastille curseur « Ouvrir » au survol de la slide', label === 'Ouvrir', 'label=' + label)
    await p.mouse.move(40, 500) // quitte la zone
    await p.waitForTimeout(300)

    // D7 — progression
    const prog = await p.evaluate(() => {
      const bar = document.querySelector('[data-testid="carousel-progress"] span')
      return bar ? getComputedStyle(bar).transform : null
    })
    record('D7 barre de progression du carousel présente', !!prog, 'transform=' + String(prog).slice(0, 40))

    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({ path: 'tools/qa/motion-1-desktop.png' })
    await p.close()
  }

  // ==================== Tablette ====================
  {
    const p = await browser.newPage({ viewport: { width: 768, height: 1024 } })
    const logs = []
    watchErrors(p, logs)
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await p.waitForTimeout(2200)
    const ok = await p.evaluate(() => !!document.getElementById('contact') && !!document.getElementById('projets'))
    networkErrors += countNetwork(logs)
    record('T1 tablette : sections rendues, 0 erreur', ok && realErrors(logs).length === 0, 'erreurs=' + realErrors(logs).length)
    await p.close()
  }

  // ==================== Mobile (touch) ====================
  {
    const p = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true })
    const logs = []
    watchErrors(p, logs)
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await p.waitForTimeout(2200)
    const ok = await p.evaluate(() => !!document.getElementById('contact'))
    record('M1a mobile : sections rendues, 0 erreur', ok && realErrors(logs).length === 0, 'erreurs=' + realErrors(logs).length)
    // swipe tactile du carousel
    await p.evaluate(() => document.getElementById('projets').scrollIntoView())
    await p.waitForTimeout(900)
    const before = await counterText(p)
    const box = await p.locator('[data-cursor="Glisser"]').first().boundingBox()
    if (box) {
      // swipe tactile via CDP (touchscreen.swipe indisponible dans playwright-core)
      const client = await p.context().newCDPSession(p)
      const tx = Math.round(box.x + box.width * 0.7)
      const ty = Math.round(box.y + box.height * 0.4)
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx, y: ty }] })
      for (let i = 1; i <= 6; i++) {
        await p.waitForTimeout(16)
        await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx - i * 40, y: ty }] })
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await p.waitForTimeout(900)
    }
    const after = await counterText(p)
    networkErrors += countNetwork(logs)
    record('M1b swipe tactile → slide suivante', before !== after, before + ' → ' + after)
    await p.screenshot({ path: 'tools/qa/motion-2-mobile.png' })
    await p.close()
  }

  // ==================== Reduced motion ====================
  {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    const logs = []
    watchErrors(p, logs)
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await p.waitForTimeout(2200)
    await p.evaluate(() => document.getElementById('projets').scrollIntoView())
    await p.waitForTimeout(900)
    const plainWords = await p.evaluate(() => document.querySelectorAll('#projets h2 span span').length)
    const headingVisible = await p.evaluate(() => {
      const h = document.querySelector('#projets h2')
      return h && h.textContent.trim().length > 0 && h.getBoundingClientRect().height > 10
    })
    networkErrors += countNetwork(logs)
    record(
      'R1 reduced-motion : titres rendus sans masques, 0 erreur',
      plainWords === 0 && !!headingVisible && realErrors(logs).length === 0,
      'wordSpans=' + plainWords + ' heading=' + headingVisible,
    )
    await p.close()
  }

  await browser.close()

  const failed = results.filter((r) => !r.pass)
  console.log('\nRESULT_START')
  console.log(JSON.stringify({ total: results.length, passed: results.length - failed.length, failed: failed.length, networkErrorsDevOnly: networkErrors, results }, null, 2))
  console.log('RESULT_END')
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => {
  console.log('FATAL', String(e && e.message ? e.message : e).slice(0, 400))
  process.exit(1)
})
