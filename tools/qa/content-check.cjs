
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--use-gl=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 90)); });
  page.on('pageerror', e => errors.push(e.message.slice(0, 90)));
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'load', timeout: 25000 });
  await page.waitForTimeout(3500);

  const out = {};
  // Ouverture
  out.role = await page.$eval('#top', el => el.innerText.includes('technicien informatique')).catch(()=>false);
  // LUMO case study
  await page.evaluate(() => document.getElementById('lumo')?.scrollIntoView());
  await page.waitForTimeout(700);
  out.lumoProblem = await page.$eval('#lumo', el => el.innerText.includes('De nombreux petits commerces')).catch(()=>false);
  out.lumoRole = await page.$eval('#lumo', el => el.innerText.includes('Mon rôle')).catch(()=>false);
  out.lumoBuilt = await page.$eval('#lumo', el => el.innerText.includes('Ce que j\'ai construit')).catch(()=>false);
  // Approche : e-commerce corrigé
  await page.evaluate(() => document.getElementById('approche')?.scrollIntoView());
  await page.waitForTimeout(700);
  const appr = await page.$eval('#approche', el => el.innerText).catch(()=>'');
  out.ecommerceHonest = !appr.includes('paiement sécurisé') && appr.includes('gestion des commandes');
  out.maintenanceSeparee = appr.includes('Maintenance informatique') && appr.includes('Réseaux');
  // Parcours : depuis 2024
  await page.evaluate(() => document.getElementById('parcours')?.scrollIntoView());
  await page.waitForTimeout(700);
  out.depuis2024 = await page.$eval('#parcours', el => el.innerText.includes('Depuis 2024')).catch(()=>false);
  out.anglais = await page.$eval('#parcours', el => el.innerText.includes('Formation en anglais général')).catch(()=>false);
  out.hScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(JSON.stringify({ out, errors }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.slice(0,150)); process.exit(1); });
