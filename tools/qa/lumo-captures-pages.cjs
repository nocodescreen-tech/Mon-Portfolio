// Recapture des VRAIES pages via navigation SPA (sidebar) — pas de reload
const { chromium } = require('playwright-core');
const path = 'C:/Users/rene/Desktop/hubcommerce-project/client/public/';

(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 80)));

  // Login
  await p.goto('http://localhost:5180/login', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1200);
  await p.locator('input[type=email]').fill('no.codescreen@gmail.com');
  await p.locator('input[type=password]').fill('@Rc808032');
  await p.locator('button[type=submit]').click();
  await p.waitForTimeout(7000);

  const url = p.url();
  console.log('après login →', url);
  if (!url.endsWith('/') && !url.includes('/dashboard')) { console.log('LOGIN ÉCHOUÉ'); process.exit(1); }

  // screen2 = PRODUITS (sidebar → Produits)
  await p.locator('a[href="/products"]').first().click();
  await p.waitForTimeout(4500);
  const prodUrl = p.url();
  console.log('→ produits:', prodUrl);
  if (prodUrl.includes('/login')) { console.log('RENVOYÉ VERS LOGIN !'); } else {
    await p.screenshot({ path: path + 'screen2.png' });
    console.log('screen2.png = page PRODUITS ✓');
  }

  // screen5 = POS (sidebar → Caisse)
  await p.locator('a[href="/pos"]').first().click();
  await p.waitForTimeout(4500);
  const posUrl = p.url();
  console.log('→ pos:', posUrl);
  if (posUrl.includes('/login')) { console.log('RENVOYÉ VERS LOGIN !'); } else {
    await p.screenshot({ path: path + 'screen5.png' });
    console.log('screen5.png = page POS ✓');
  }

  // screen1 = ANALYTIQUES (sidebar → stats)
  await p.locator('a[href="/stats"]').first().click();
  await p.waitForTimeout(4500);
  const stUrl = p.url();
  console.log('→ stats:', stUrl);
  if (stUrl.includes('/login')) { console.log('RENVOYÉ VERS LOGIN !'); } else {
    await p.screenshot({ path: path + 'screen1.png' });
    console.log('screen1.png = page ANALYTIQUES ✓');
  }

  console.log('ERREURS JS:', errs.length ? errs.slice(0, 4) : 'aucune');
  await b.close();
})();
