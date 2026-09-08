// Audit mobile LUMO — 390×844, chaque page
const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 100)));

  await p.goto('http://localhost:5180/login', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1200);
  await p.locator('input[type=email]').fill('no.codescreen@gmail.com');
  await p.locator('input[type=password]').fill('@Rc808032');
  await p.locator('button[type=submit]').click();
  await p.waitForTimeout(7000);

  const routes = ['/', '/pos', '/products', '/clients', '/sales', '/purchases', '/stock-history', '/cash', '/dettes', '/settings', '/activities', '/stats'];
  const results = [];

  for (const route of routes) {
    await p.evaluate((r) => { history.pushState({}, '', r); window.dispatchEvent(new PopStateEvent('popstate')); }, route);
    await p.waitForTimeout(3500);
    const r = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const over = document.documentElement.scrollWidth - vw;
      const wideEls = [...document.querySelectorAll('body *')]
        .filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > vw + 2 && getComputedStyle(el).position !== 'fixed';
        })
        .slice(0, 4)
        .map(el => ({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 35), w: Math.round(el.getBoundingClientRect().width) }));
      return {
        url: location.pathname,
        overflow: over,
        titre: (document.querySelector('h1,h2')?.textContent || '').slice(0, 35),
        wideEls,
        boutons: document.querySelectorAll('button').length,
      };
    });
    results.push(r);
  }

  console.log(JSON.stringify(results, null, 2));
  console.log('ERREURS JS (global):', errs.length ? errs.slice(0, 5) : 'aucune');
  await b.close();
})();
