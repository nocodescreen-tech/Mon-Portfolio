const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message.slice(0, 180)));
  p.on('console', (m) => { if (m.type() === 'error') logs.push('CONSOLE: ' + m.text().slice(0, 150)); });
  await p.goto('http://localhost:4174/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3500);
  const gl = await p.evaluate(() => {
    const c = document.querySelector('#top canvas');
    if (!c) return { found: false };
    const g = c.getContext('webgl2') || c.getContext('webgl');
    if (!g) return { found: true, webgl: false };
    // lit le source de la scène chargée (le bundle)
    return { found: true, webgl: true, w: c.width, h: c.height, perr: g.getError() };
  });
  await p.screenshot({ path: 'tools/qa/hero-3d-new.png' });
  console.log('RESULT_START');
  console.log(JSON.stringify({ gl, logs }, null, 2));
  console.log('RESULT_END');
  await b.close().catch(()=>{});
  process.exit(0);
})().catch((e)=>{ console.log('FATAL', (e&&e.message||e).slice(0,180)); process.exit(1) });
