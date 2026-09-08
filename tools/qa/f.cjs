
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 90)); });
  page.on('pageerror', e => errors.push(e.message.slice(0, 90)));
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4500);
  await page.screenshot({ path: 'C:\\Users\\rene\\rene-descartes-portfolio\\f-dark.png' });
  await page.evaluate(() => { document.querySelector('button[role="switch"]')?.click(); });
  await page.waitForTimeout(900);
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.screenshot({ path: 'C:\\Users\\rene\\rene-descartes-portfolio\\f-light.png' });
  // nam visible une fois (pas de doublon) : count de textes René.Descartes dans nav
  const navLogo = await page.$eval('header', el => el.querySelector('a')?.innerText.trim()).catch(e=>'ERR');
  console.log(JSON.stringify({ theme, navLogo, errors }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.slice(0,150)); process.exit(1); });
