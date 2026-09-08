
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4500);
  // capturer 3 fois la zone droite (canvas) espacée de 600ms, découper la droite, hacher
  const shot = async (path) => { await page.screenshot({ path, clip: { x: 800, y: 0, width: 640, height: 900 } }); };
  await shot('C:\\Users\\rene\\rene-descartes-portfolio\\z1.png');
  await page.waitForTimeout(600);
  await shot('C:\\Users\\rene\\rene-descartes-portfolio\\z2.png');
  await page.waitForTimeout(600);
  await shot('C:\\Users\\rene\\rene-descartes-portfolio\\z3.png');
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.slice(0,150)); process.exit(1); });
