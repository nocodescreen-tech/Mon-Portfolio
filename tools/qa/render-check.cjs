const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push(e.message.slice(0, 120)));
  await p.goto('http://127.0.0.1:5176/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(2200);
  // capture du hero
  await p.screenshot({ path: 'tools/qa/render-hero.png' });
  // caractérise le canvas : variété de couleurs (pas un aplat)
  const h = await p.evaluate(() => {
    const c = document.querySelector('#top canvas');
    if (!c) return { canvas: false };
    const ctx = c.getContext('2d');
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let nonBg = 0, orange = 0;
    for (let i = 0; i < d.length; i += 40) {
      const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
      if (a > 20) { nonBg++; if (r > 150 && r > g + 40) orange++; }
    }
    return { canvas: true, w: c.width, h: c.height, sampled: Math.floor(d.length/40), nonBg, orange };
  });
  console.log(JSON.stringify({ h, logs }, null, 2));
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message.slice(0,150)); process.exit(1); });
