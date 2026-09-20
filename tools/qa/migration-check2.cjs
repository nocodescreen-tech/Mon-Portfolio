// QA précis : après scroll progressif, aucun élément DANS le viewport ne doit rester invisible.
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push(e.message.slice(0, 120)));

  await p.goto('http://localhost:5176/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(2000);

  // scroll progressif page entière (comme un vrai visiteur) par pas de 700px
  const docH = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < docH; y += 700) {
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(250);
  }
  // puis remonte section par section et vérifie ce qui est à l'écran
  const sections = ['#top', '#projets', '#lumo', '#approche', '#prestations', '#competences', '#parcours', '#a-propos', '#contact'];
  const results = {};
  for (const id of sections) {
    await p.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'start' }), id);
    await p.waitForTimeout(1000);
    results[id] = await p.evaluate(() => {
      const vw = window.innerHeight, vx = 0, vwW = window.innerWidth;
      const bad = [];
      document.querySelectorAll('#app section *, #app h1, #app h2, #app h3, #app p, #app a, #app button').forEach((n) => {
        if (!n.textContent?.trim() && n.tagName !== 'IMG' && n.tagName !== 'CANVAS') return;
        const r = n.getBoundingClientRect();
        if (r.height < 8 || r.bottom < vx + 20 || r.top > vw - 20 || r.right < 0 || r.left > vwW) return; // hors écran = ok
        const op = parseFloat(getComputedStyle(n).opacity);
        if (op < 0.05) bad.push(`${n.tagName}.${(n.className || '').toString().slice(0, 30)} op=${op}`);
      });
      return bad.length ? bad.slice(0, 5) : 'ok';
    });
  }
  console.log(JSON.stringify({ results, logs }, null, 2));
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message.slice(0, 150)); process.exit(1); });
