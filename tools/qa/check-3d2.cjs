const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message.slice(0, 150)));
  p.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU|passive/i.test(m.text())) logs.push('CONSOLE: ' + m.text().slice(0, 130)); });
  await p.goto('http://localhost:4174/', { waitUntil: 'networkidle', timeout: 30000 });
  await p.waitForTimeout(5000);
  const r = await p.evaluate(() => {
    const c = document.querySelector('#top canvas');
    if (!c) return { canvas: false };
    const rect = c.getBoundingClientRect();
    const styles = getComputedStyle(c);
    // détecte des pixels oranges (nébuleuse flamme) dans le canvas
    let orange = 0;
    try {
      const d = c.getContext('webgl2') || c.getContext('webgl');
      const w = c.width, h = c.height;
      const px = new Uint8Array(4 * 200);
      const x = Math.floor(w/2), y = Math.floor(h/2);
      d.readPixels(x, y, 20, 10, d.RGBA, d.UNSIGNED_BYTE, px);
      for (let i = 0; i < px.length; i += 4) {
        if (px[i] > 100 && px[i] > px[i+1] + 30 && px[i+1] > 40) orange++;
      }
    } catch (e) { orange = -999; }
    return {
      canvas: true,
      rectW: Math.round(rect.width), rectH: Math.round(rect.height),
      cssW: styles.width, cssH: styles.height,
      bufW: c.width, bufH: c.height,
      orangePx: orange,
      theme: document.documentElement.getAttribute('data-theme'),
    };
  });
  await p.screenshot({ path: 'tools/qa/hero-3d-final.png' });
  console.log('RESULT_START');
  console.log(JSON.stringify({ r, logs }, null, 2));
  console.log('RESULT_END');
  await b.close().catch(()=>{});
  process.exit(0);
})().catch((e)=>{ console.log('FATAL', (e&&e.message||e).slice(0,180)); process.exit(1) });
