
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--use-gl=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'load', timeout: 25000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.getElementById('lumo')?.scrollIntoView());
  await page.waitForTimeout(800);
  const text = await page.$eval('#lumo', el => el.innerText).catch(()=>'');
  console.log('--- texte réel de #lumo (extrait) ---');
  console.log(text.slice(0, 600));
  console.log('--- checks ---');
  console.log('contient "Mon rôle":', text.includes('Mon rôle'));
  console.log('contient "construit":', text.includes('construit'));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.slice(0,150)); process.exit(1); });
