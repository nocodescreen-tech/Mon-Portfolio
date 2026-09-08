// Captures LUMO nouveau design (thème clair Terre & Fleuve)
const { chromium } = require('playwright-core');
const path = 'C:/Users/rene/Desktop/hubcommerce-project/client/public/';

(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });

  async function login(p) {
    await p.goto('http://localhost:5180/login', { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(1200);
    await p.locator('input[type=email]').fill('no.codescreen@gmail.com');
    await p.locator('input[type=password]').fill('@Rc808032');
    await p.locator('button[type=submit]').click();
    await p.waitForTimeout(7000);
  }

  // ── DESKTOP 1440×900 ──
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 80)));
  await login(p);

  // screen4 = Dashboard (showcase)
  await p.waitForTimeout(2000);
  await p.screenshot({ path: path + 'screen4.png' });
  console.log('screen4.png = dashboard OK');

  // screen3 = hero : scroll vers les widgets
  await p.evaluate(() => window.scrollTo(0, 700));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: path + 'screen3.png' });
  console.log('screen3.png = dashboard (widgets) OK');

  // screen2 = Produits & Stock
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.goto('http://localhost:5180/products', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: path + 'screen2.png' });
  console.log('screen2.png = produits OK');

  // screen5 = POS
  await p.goto('http://localhost:5180/pos', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: path + 'screen5.png' });
  console.log('screen5.png = POS OK');

  // screen1 = Analytiques
  await p.goto('http://localhost:5180/stats', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: path + 'screen1.png' });
  console.log('screen1.png = stats OK');

  // ── MOBILE 390×844 (dashboard_mobile.png) ──
  const mctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await mctx.newPage();
  mp.on('pageerror', e => errs.push(String(e).slice(0, 80)));
  await login(mp);
  await mp.waitForTimeout(2500);
  await mp.screenshot({ path: path + 'dashboard_mobile.png' });
  console.log('dashboard_mobile.png = mobile OK');

  console.log('ERREURS JS:', errs.length ? errs.slice(0, 4) : 'aucune');
  await b.close();
})();
