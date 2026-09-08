// Captures LOGIN pour les showcases Stock / POS / Analytiques
const { chromium } = require('playwright-core');
const path = 'C:/Users/rene/Desktop/hubcommerce-project/client/public/';

(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const errs = [];

  // screen2 = login plein écran, formulaire rempli
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push(String(e).slice(0, 80)));
  await p.goto('http://localhost:5180/login', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);
  await p.locator('input[type=email]').fill('no.codescreen@gmail.com');
  await p.locator('input[type=password]').fill('••••••••');
  await p.waitForTimeout(600);
  await p.screenshot({ path: path + 'screen2.png' });
  console.log('screen2.png = login (rempli) OK');

  // screen5 = login propre
  const p2 = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p2.on('pageerror', e => errs.push(String(e).slice(0, 80)));
  await p2.goto('http://localhost:5180/login', { waitUntil: 'networkidle', timeout: 60000 });
  await p2.waitForTimeout(2200);
  await p2.screenshot({ path: path + 'screen5.png' });
  console.log('screen5.png = login (propre) OK');

  // screen1 = login variante responsive 1280×800
  const p3 = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p3.on('pageerror', e => errs.push(String(e).slice(0, 80)));
  await p3.goto('http://localhost:5180/login', { waitUntil: 'networkidle', timeout: 60000 });
  await p3.waitForTimeout(2200);
  await p3.screenshot({ path: path + 'screen1.png' });
  console.log('screen1.png = login (1280×800) OK');

  console.log('ERREURS JS:', errs.length ? errs.slice(0, 4) : 'aucune');
  await b.close();
})();
