const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message.slice(0, 220)));
  p.on('console', (m) => { if (m.type() === 'error') logs.push('CONSOLE: ' + m.text().slice(0, 200)); });
  await p.goto('http://localhost:4174/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(2500);
  // simule un déplacement + appui de souris pour générer du fluide
  await p.mouse.move(400, 300);
  await p.mouse.down();
  await p.mouse.move(520, 260, { steps: 8 });
  await p.mouse.up();
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    // le fond fluide est un canvas fixed
    const canvas = document.querySelector('canvas');
    // vérifie contexte
    const gl = canvas ? (canvas.getContext('webgl2') || canvas.getContext('webgl')) : null;
    let hasGL = !!gl, glError = null;
    if (gl) { try { glError = gl.getError() } catch(e){ glError = 'throw:'+(e&&e.message||e) } }
    // lit des pixels du canvas (haut-gauche) pour voir s'il y a du contenu non transparent
    let nonEmpty = false;
    if (gl) {
      try {
        const px = new Uint8Array(4 * 25);
        gl.readPixels(5, 5, 5, 5, gl.RGBA, gl.UNSIGNED_BYTE, px);
        for (let i=0;i<px.length;i+=4){ if (px[i]>10||px[i+1]>10||px[i+2]>10) { nonEmpty=true; break } }
      } catch(e){ }
    }
    return { hasGL, glError, nonEmpty, hasCanvas: !!canvas, bodyBg: getComputedStyle(document.body).backgroundColor };
  });
  await p.screenshot({ path: 'tools/qa/fluid-live.png' });
  console.log('RESULT_START');
  console.log(JSON.stringify({ r, logs }, null, 2));
  console.log('RESULT_END');
  await b.close().catch(()=>{});
  process.exit(0);
})().catch((e)=>{ console.log('FATAL', (e&&e.message||e).slice(0,220)); process.exit(1) });
