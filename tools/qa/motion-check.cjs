const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push(e.message.slice(0, 120)));
  await p.goto('http://127.0.0.1:5176/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);

  // 1) le canvas bouge-t-il ? (2 captures à 600ms d'écart)
  const snap = () => p.evaluate(() => {
    const c = document.querySelector('#top canvas');
    if (!c) return null;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 400) sum += d[i] + d[i+1] + d[i+2];
    return sum;
  });
  const a = await snap();
  await p.waitForTimeout(600);
  const b = await snap();
  const moving = a !== null && b !== null && a !== b;

  // 2) suivi du curseur : déplacer la souris et voir si le canvas change
  const before = await snap();
  await p.mouse.move(200, 200);
  await p.mouse.move(1000, 600);
  await p.waitForTimeout(400);
  const after = await snap();

  // 3) largeurs sans débordement + sections présentes
  const widths = {};
  for (const w of [320, 390, 768, 1440]) {
    const tab = await browser.newPage({ viewport: { width: w, height: 800 } });
    await tab.goto('http://127.0.0.1:5176/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await tab.waitForTimeout(1400);
    widths[w] = await tab.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth ? 'DEBORDE' : 'ok');
    await tab.close();
  }
  const sections = await p.evaluate(() => ['#top','#projets','#lumo','#approche','#prestations','#competences','#parcours','#a-propos','#contact'].map(s => !!document.querySelector(s)));

  console.log(JSON.stringify({ canvasExists: a !== null, moving, cursorReacts: before !== after, widths, sections, logs }, null, 2));
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message.slice(0,150)); process.exit(1); });
