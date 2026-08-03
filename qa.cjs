const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text().slice(0, 300));
  });
  page.on('pageerror', (err) => errors.push('PAGEERROR: ' + String(err).slice(0, 300)));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Débordement horizontal ?
  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    bodyScrollW: document.body.scrollWidth,
  }));

  // Sections présentes et tailles
  const sections = await page.evaluate(() => {
    const ids = ['top', 'a-propos', 'competences', 'projets', 'parcours', 'contact'];
    const out = {};
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) {
        const r = el.getBoundingClientRect();
        out[id] = { h: Math.round(r.height), top: Math.round(r.top + window.scrollY) };
      } else out[id] = 'ABSENT';
    }
    return out;
  });

  // Textes de police display chargée ?
  const fonts = await page.evaluate(() => {
    const d = document.createElement('span');
    d.style.fontFamily = '"Fraunces", Georgia, serif';
    d.style.fontSize = '72px';
    d.textContent = 'René';
    document.body.appendChild(d);
    const w = d.offsetWidth;
    d.remove();
    return w;
  });

  // Lien mailto du formulaire + présence des CTA
  const ctaCount = await page.evaluate(() => document.querySelectorAll('a, button').length);

  // Capture plein écran
  await page.screenshot({ path: 'C:/Users/rene/shot-full-pw.png', fullPage: true });
  // Mobile
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(2000);
  const mobOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await mobile.screenshot({ path: 'C:/Users/rene/shot-mobile.png', fullPage: true });

  console.log(JSON.stringify({
    overflow,
    horizontalOverflowPx: overflow.scrollW - overflow.clientW,
    sections,
    frauncesWidthAt72px: fonts,
    ctaCount,
    mobileHorizontalOverflowPx: mobOverflow,
    consoleErrors: errors.slice(0, 10),
  }, null, 2));

  await browser.close();
})();
