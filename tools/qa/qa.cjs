
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('C: ' + m.text().slice(0, 110)); });
  page.on('pageerror', e => errors.push('P: ' + e.message.slice(0, 110)));
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4500);
  const checks = {};
  checks.canvas3D = await page.$$eval('#top canvas', els => els.length).catch(()=>0);
  checks.webgl = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2') || !!document.createElement('canvas').getContext('webgl'));
  checks.theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  checks.bigTitle = await page.$eval('#top h1', el => el.textContent.replace(/\s+/g,' ').trim()).catch(e=>'ERR');
  checks.logo = await page.$$eval('#top span', els => els.filter(e=>e.textContent==='RD').length).catch(()=>0);
  console.log(JSON.stringify({ checks, errors }, null, 2));
  await page.screenshot({ path: 'C:\\Users\\rene\\rene-descartes-portfolio\\qa-dark.png' });
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.slice(0,150)); process.exit(1); });
