const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5176/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'tools/qa/hero-new.png' });
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message.slice(0,150)); process.exit(1); });
