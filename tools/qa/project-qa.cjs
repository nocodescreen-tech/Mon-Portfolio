// QA showcase projets — valide le carousel 3D premium + vue détaillée.
// Pré-requis : dev server sur http://localhost:4180.
//
//   P1  desktop : 4 slides, voisines en profondeur 3D (rotateY), opacité < 1
//   P2  budget d'images : |offset| ≤ 1 montent leurs <img>, les autres non
//   P3  clic sur une voisine → projet suivant
//   P4  drag souris → projet suivant (élastique + snap)
//   P5  vues multi-angle : chevron → légende change, pagination suit
//   P6  clic slide active → vue détaillée (dialog, FLIP layoutId partagé)
//   P7  détail : chevrons de vues + Escape ferme
//   P8  détail : navigation projet ↔ projet, compteur de scène synchronisé
//   P9  focus restitué au déclencheur après fermeture (clavier complet)
//   P10 mobile : 3D éteinte (perspective none, voisines invisibles),
//       swipe tactile + tap chevron de vue
//   P11 reduced-motion : vue détaillée fonctionnelle, transitions nulles
//   P12 zéro CLS : hauteur de scène stable après chargement des images
//   P13 0 erreur JS partout

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

const counter = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('#projets [aria-live="polite"]')
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : null
  })
const caption = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('[data-testid="view-caption"]')
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : null
  })
const dialogOpen = (page) => page.evaluate(() => !!document.querySelector('[role="dialog"][aria-modal="true"]'))

async function toProjects(page) {
  await page.evaluate(() => document.getElementById('projets').scrollIntoView())
  await page.waitForTimeout(900)
}

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
    await toProjects(p)

    // P1 — slides + profondeur 3D des voisines (à idx=0, seule +1 existe)
    const stage = await p.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('[data-stage-slide]'))
      return slides.map((s) => ({
        offset: s.getAttribute('data-offset'),
        transform: getComputedStyle(s).transform,
        opacity: getComputedStyle(s).opacity,
        perspective: getComputedStyle(s.parentElement.parentElement).perspective,
      }))
    })
    const neighbors3D = stage.filter((s) => Math.abs(s.offset) === 1)
    const has3D = neighbors3D.length >= 1 && neighbors3D.every((s) => s.transform.includes('matrix3d') && parseFloat(s.opacity) < 0.95)
    const perspectiveSet = stage.some((s) => s.perspective && s.perspective !== 'none')
    record('P1 voisines en profondeur 3D (rotateY + opacité)', has3D && perspectiveSet && stage.length === 4, JSON.stringify(stage.map((s) => s.offset + ':' + s.opacity)))

    // P2 — budget d'images (idx=0 → offsets 0,1 visibles ; 2,3 non chargées)
    const imgBudget = await p.evaluate(() => {
      const byOffset = {}
      document.querySelectorAll('[data-stage-slide]').forEach((s) => {
        byOffset[s.getAttribute('data-offset')] = s.querySelectorAll('img').length
      })
      return byOffset
    })
    const budgetOk = imgBudget['0'] > 0 && imgBudget['1'] > 0 && imgBudget['2'] === 0 && imgBudget['3'] === 0
    record('P2 budget images (précédente/actuelle/suivante uniquement)', budgetOk, JSON.stringify(imgBudget))

    // P3 — clic sur la voisine droite : la frange visible est celle qui
    // dépasse la slide active dans le cadre de la scène (≈ 92→100 %)
    const before3 = await counter(p)
    const wrap3 = await p.evaluate(() =>
      document.querySelector('[data-cursor="Glisser"]').parentElement.parentElement.getBoundingClientRect(),
    )
    await p.mouse.click(wrap3.x + wrap3.width * 0.96, wrap3.y + wrap3.height * 0.5)
    await p.waitForTimeout(900)
    const after3 = await counter(p)
    record('P3 clic voisine → projet suivant', before3 !== after3, before3 + ' → ' + after3)

    // retour au projet 01 via l'index latéral (fiable, pas de clipping)
    await p.evaluate(() => document.querySelectorAll('#projets button[aria-label^="Projet"]')[0].click())
    await p.waitForTimeout(700)

    // P4 — drag souris
    const before4 = await counter(p)
    const track = await p.locator('[data-cursor="Glisser"]').first().boundingBox()
    await p.mouse.move(track.x + track.width * 0.5, track.y + track.height * 0.5)
    await p.mouse.down()
    await p.mouse.move(track.x + track.width * 0.5 - 280, track.y + track.height * 0.5, { steps: 8 })
    await p.mouse.up()
    await p.waitForTimeout(900)
    const after4 = await counter(p)
    record('P4 drag souris → projet suivant', before4 !== after4, before4 + ' → ' + after4)

    // retour 01
    await p.evaluate(() => {
      document.querySelectorAll('#projets button[aria-label^="Projet"]')[0].click()
    })
    await p.waitForTimeout(300)
    await p.evaluate(() => document.getElementById('projets').scrollIntoView())
    await p.waitForTimeout(900)

    // P5 — vues multi-angle (LUMO a 5 vues réelles)
    const cap5a = await caption(p)
    await p.evaluate(() => document.querySelector('#projets button[aria-label="Vue suivante"]').click())
    await p.waitForTimeout(500)
    const cap5b = await caption(p)
    const segWidths = await p.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid^="view-seg-"]')).map((s) => s.style.background),
    )
    record('P5 chevron de vue → légende change (le carousel raconte)', cap5a !== cap5b && segWidths.some((b) => b.includes('rgb(255, 91, 46)') || b.includes('var(--accent)') || b.includes('230, 79, 30')), cap5a + ' → ' + cap5b)

    // P6 — clic slide active → vue détaillée
    const active = await p.locator('[data-stage-slide][data-offset="0"]').boundingBox()
    await p.mouse.click(active.x + active.width * 0.5, active.y + active.height * 0.35)
    await p.waitForTimeout(800)
    const open6 = await dialogOpen(p)
    const detailTitle = await p.evaluate(() => document.querySelector('[role="dialog"] h2')?.textContent)
    record('P6 clic slide active → vue détaillée (dialog)', open6 && detailTitle === 'LUMO', 'dialog=' + open6 + ' titre=' + detailTitle)

    // P7 — vues dans le détail + Escape
    const dcap7a = await p.evaluate(() => document.querySelector('[data-testid="view-caption"]')?.textContent.replace(/\s+/g, ' ').trim())
    await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(500)
    const dcap7b = await p.evaluate(() => document.querySelector('[data-testid="view-caption"]')?.textContent.replace(/\s+/g, ' ').trim())
    record('P7a flèches dans le détail → vue suivante', dcap7a !== dcap7b, dcap7a + ' → ' + dcap7b)
    await p.keyboard.press('Escape')
    await p.waitForTimeout(700)
    const closed7 = !(await dialogOpen(p))
    record('P7b Escape ferme la vue détaillée', closed7, 'fermé=' + closed7)

    // P8 — navigation projet ↔ projet dans le détail, scène synchronisée
    await p.evaluate(() => document.getElementById('projets').scrollIntoView())
    await p.waitForTimeout(500)
    const active8 = await p.locator('[data-stage-slide][data-offset="0"]').boundingBox()
    await p.mouse.click(active8.x + active8.width * 0.5, active8.y + active8.height * 0.35)
    await p.waitForTimeout(700)
    await p.locator('button:has-text("Suivant")').click()
    await p.waitForTimeout(900)
    const t8 = await p.evaluate(() => document.querySelector('[role="dialog"] h2')?.textContent)
    await p.keyboard.press('Escape')
    await p.waitForTimeout(700)
    const c8 = await counter(p)
    record('P8 projet ↔ projet dans le détail, scène synchronisée', t8 === 'Visit.toi' && c8.includes('02'), 'détail=' + t8 + ' compteur=' + c8)

    // retour 01 + P9 — parcours clavier complet (focus → Enter → Escape → focus restitué)
    await p.evaluate(() => document.querySelectorAll('#projets button[aria-label^="Projet"]')[0].click())
    await p.waitForTimeout(300)
    await p.evaluate(() => document.getElementById('projets').scrollIntoView())
    await p.waitForTimeout(800)
    await p.locator('[data-stage-slide][data-offset="0"]').focus()
    const focusBefore = await p.evaluate(() => {
      const el = document.activeElement
      return el ? el.tagName + '[' + (el.getAttribute('data-stage-slide') ?? el.className).toString().slice(0, 40) + ']' : 'none'
    })
    await p.keyboard.press('Enter')
    await p.waitForTimeout(700)
    const open9 = await dialogOpen(p)
    await p.keyboard.press('Escape')
    await p.waitForTimeout(1400) // exit FLIP + restitution du focus
    const focus9 = await p.evaluate(() => ({
      closed: !document.querySelector('[role="dialog"]'),
      active:
        document.activeElement && document.activeElement.matches('[data-stage-slide][data-offset="0"]')
          ? 'slide-active'
          : document.activeElement
            ? document.activeElement.tagName + ':' + String(document.activeElement.className).slice(0, 60) + ':' + (document.activeElement.getAttribute('data-stage-slide') ?? '')
          : 'none',
    }))
    record('P9 clavier complet + focus restitué', open9 && focus9.closed && focus9.active === 'slide-active', 'avant Enter: ' + focusBefore + ' ; après Escape: ' + JSON.stringify(focus9))

    // P12 — zéro CLS : hauteur de scène stable
    const h1 = await p.evaluate(() => document.querySelector('[data-cursor="Glisser"]').getBoundingClientRect().height)
    await p.waitForTimeout(1200)
    const h2 = await p.evaluate(() => document.querySelector('[data-cursor="Glisser"]').getBoundingClientRect().height)
    record('P12 zéro layout shift (hauteur scène stable)', Math.abs(h1 - h2) < 1, h1 + 'px → ' + h2 + 'px')

    networkErrors += countNetwork(logs)
    record('P13 aucune erreur JS (desktop)', realErrors(logs).length === 0, realErrors(logs).join(' | ').slice(0, 250))
    await p.screenshot({ path: 'tools/qa/project-1-desktop.png' })
    await p.close()
  }

  // ==================== Mobile ====================
  {
    const p = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true })
    const logs = []
    watchErrors(p, logs)
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await p.waitForTimeout(2200)
    await toProjects(p)

    const mob = await p.evaluate(() => {
      const stageEl = document.querySelector('[data-cursor="Glisser"]')
      const slides = Array.from(document.querySelectorAll('[data-stage-slide]'))
      return {
        perspective: getComputedStyle(stageEl.parentElement).perspective,
        neighborOpacity: slides.filter((s) => Math.abs(s.getAttribute('data-offset')) === 1).map((s) => getComputedStyle(s).opacity),
      }
    })
    const flat = mob.perspective === 'none' && mob.neighborOpacity.every((o) => parseFloat(o) === 0)
    record('P10a mobile : 3D éteinte, voisines invisibles', flat, JSON.stringify(mob))

    const before = await counter(p)
    const track = await p.locator('[data-cursor="Glisser"]').first().boundingBox()
    const client = await p.context().newCDPSession(p)
    const tx = Math.round(track.x + track.width * 0.7)
    const ty = Math.round(track.y + track.height * 0.4)
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx, y: ty }] })
    for (let i = 1; i <= 6; i++) {
      await p.waitForTimeout(16)
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx - i * 40, y: ty }] })
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await p.waitForTimeout(900)
    const after = await counter(p)

    // tap chevron de vue (retour au projet 01 d'abord)
    await p.evaluate(() => document.querySelectorAll('#projets button[aria-label^="Projet"]')[0].click())
    await p.waitForTimeout(300)
    await toProjects(p)
    const capA = await caption(p)
    const chev = await p.locator('#projets button[aria-label="Vue suivante"]').first().boundingBox()
    await p.touchscreen.tap(chev.x + chev.width / 2, chev.y + chev.height / 2)
    await p.waitForTimeout(500)
    const capB = await caption(p)
    networkErrors += countNetwork(logs)
    record('P10b mobile : swipe + tap chevron de vue', before !== after && capA !== capB, 'projet: ' + before + '→' + after + ' ; vue: "' + capA + '" → "' + capB + '"')
    await p.screenshot({ path: 'tools/qa/project-2-mobile.png' })
    await p.close()
  }

  // ==================== Reduced motion ====================
  {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    const logs = []
    watchErrors(p, logs)
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await p.waitForTimeout(2200)
    await toProjects(p)
    const active = await p.locator('[data-stage-slide][data-offset="0"]').boundingBox()
    await p.mouse.click(active.x + active.width * 0.5, active.y + active.height * 0.35)
    await p.waitForTimeout(600)
    const open = await dialogOpen(p)
    const title = await p.evaluate(() => document.querySelector('[role="dialog"] h2')?.textContent)
    await p.keyboard.press('Escape')
    await p.waitForTimeout(400)
    const closed = !(await dialogOpen(p))
    networkErrors += countNetwork(logs)
    record('P11 reduced-motion : vue détaillée fonctionnelle, Escape OK', open && title === 'LUMO' && closed && realErrors(logs).length === 0, 'dialog=' + open + '→' + closed)
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
