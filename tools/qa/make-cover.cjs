const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const svg = fs.readFileSync('C:/Users/rene/rene-descartes-portfolio/public/portfolio-cover.svg', 'utf8');
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#121316">${svg}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'C:/Users/rene/rene-descartes-portfolio/public/portfolio-cover.png', omitBackground: false });
  console.log('PNG', fs.statSync('C:/Users/rene/rene-descartes-portfolio/public/portfolio-cover.png').size, 'o');
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message.slice(0, 200)); process.exit(1); });
