const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message.slice(0, 160)));
  p.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU|INSUFFICIENT|fetch failed/i.test(m.text())) logs.push('CONSOLE: ' + m.text().slice(0, 140)); });
  await p.goto('http://localhost:4174/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const canvas = document.querySelector('#top canvas');
    let webgl = false, perr = null;
    if (canvas) { const g = canvas.getContext('webgl2') || canvas.getContext('webgl'); webgl = !!g; try { perr = g ? g.getError() : null } catch {} }
    const svgBackdrop = !!document.querySelector('.pointer-events-none.fixed');
    const svgPts = document.querySelectorAll('.pointer-events-none.fixed svg').length;
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    return {
      canvas: !!canvas, webgl, perr,
      svgBackdrop, svgLayers: svgPts,
      bodyBg,
      theme: document.documentElement.getAttribute('data-theme'),
      title: document.querySelector('#top h1')?.innerText,
    };
  });
  await p.screenshot({ path: 'tools/qa/final-hero-live.png' });
  console.log('RESULT_START');
  console.log(JSON.stringify({ r, logs }, null, 2));
  console.log('RESULT_END');
  await b.close().catch(()=>{});
  process.exit(0);
})().catch((e)=>{ console.log('FATAL', (e&&e.message||e).slice(0,180)); process.exit(1) });
