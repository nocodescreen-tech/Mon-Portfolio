
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4000);
  // capture 1, attendre 1.2s, capture 2 → compare pour voir le mouvement
  await page.screenshot({ path: 'C:\\Users\\rene\\rene-descartes-portfolio\\m1.png' });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'C:\\Users\\rene\\rene-descartes-portfolio\\m2.png' });
  // analyser la zone droite (3D) pixel-wise via canvas | pixelmatch utilise buffer
  const diff = await page.evaluate(() => {
    const c = document.querySelector('#top canvas');
    if (!c) return 'no canvas';
    return { w: c.width, h: c.height, hasCanvas: true };
  });
  console.log(JSON.stringify(diff));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.slice(0,150)); process.exit(1); });
