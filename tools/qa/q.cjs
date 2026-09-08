
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 90)); });
  page.on('pageerror', e => errors.push(e.message.slice(0, 90)));
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4500);
  // capture sombre (defaut)
  await page.screenshot({ path: 'C:\\Users\\rene\\rene-descartes-portfolio\\q-dark.png' });
  // basculer en clair via le toggle
  const toggles = await page.$$('button[role="switch"]');
  const clicks = await page.evaluate(() => { document.querySelector('button[role="switch"]')?.click(); return true});
  await page.waitForTimeout(800);
  const themeLight = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.screenshot({ path: 'C:\\Users\\rene\\rene-descartes-portfolio\\q-light.png' });
  // combat buttons visibles?
  const light = await page.$eval('#top', el => el.innerText.includes('Voir mes projets'));
  console.log(JSON.stringify({ themeLight, lightHasText: light, errors }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.slice(0,150)); process.exit(1); });
