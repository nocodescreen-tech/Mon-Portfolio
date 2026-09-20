// QA post-migration gsap → framer-motion : console, canvas, reveals, sections.
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push(e.message.slice(0, 120)));
  p.on('console', (m) => { if (m.type() === 'error') logs.push(m.text().slice(0, 120)); });

  await p.goto('http://localhost:5176/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(2500);

  // 1) Canvas 2D vivant : pixels non vides + change entre 2 frames
  const snap = () => p.evaluate(() => {
    const c = document.querySelector('#top canvas');
    if (!c) return null;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let sum = 0, orange = 0, n = 0;
    for (let i = 0; i < d.length; i += 400) { sum += d[i] + d[i+1] + d[i+2]; n++; if (d[i] > 150 && d[i] > d[i+1] + 40) orange++; }
    return { sum, orange, n };
  });
  const a = await snap();
  await p.waitForTimeout(600);
  const b = await snap();
  const canvasAlive = a && b && a.sum !== b.sum;

  // 2) Titre hero révélé (translateY ~ 0, visible)
  const heroTitle = await p.evaluate(() => {
    const el = document.querySelector('#top h1 span span');
    if (!el) return { found: false };
    const s = getComputedStyle(el);
    return { found: true, opacity: s.opacity, transform: s.transform };
  });

  // 3) Scroll complet : chaque section doit avoir son contenu visible
  const sections = ['#top', '#projets', '#lumo', '#approche', '#prestations', '#competences', '#parcours', '#a-propos', '#contact'];
  const results = {};
  for (const id of sections) {
    await p.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'start' }), id);
    await p.waitForTimeout(900);
    results[id] = await p.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return 'ABSENT';
      // éléments invisibles (opacity 0) après le passage
      const hidden = [...el.querySelectorAll('*')].filter((n) => parseFloat(getComputedStyle(n).opacity) < 0.05).length;
      const txt = (el.innerText || '').trim().length;
      return txt > 20 ? (hidden > 3 ? `VISIBLE mais ${hidden} noeuds opaques` : 'ok') : 'VIDE';
    }, id);
  }

  // 4) Capture finale
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(800);
  await p.screenshot({ path: 'tools/qa/migration-hero.png' });

  console.log(JSON.stringify({ canvasAlive, heroTitle, results, logs }, null, 2));
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message.slice(0, 150)); process.exit(1); });
