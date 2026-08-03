const { chromium } = require('playwright-core');

const URL = 'http://localhost:5174/';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600); // préchargeur

  const report = {};

  // 1. Sections
  report.sections = await page.evaluate(() => {
    const out = {};
    for (const id of ['top', 'a-propos', 'services', 'competences', 'projets', 'parcours', 'contact']) {
      const el = document.getElementById(id);
      out[id] = el ? Math.round(el.getBoundingClientRect().height) + 'px' : 'ABSENT';
    }
    return out;
  });

  // 2. Débordement horizontal
  report.hOverflowDesktop = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  // 3. Icônes FA rendues ?
  report.faIcons = await page.evaluate(() => {
    const icons = document.querySelectorAll('i.fa-solid, i.fa-brands');
    let rendered = 0;
    for (const el of [...icons].slice(0, 200)) {
      const style = getComputedStyle(el);
      if (style.fontFamily && style.fontFamily.includes('Font Awesome')) rendered++;
    }
    return { total: icons.length, rendered };
  });

  // 4. Images LUMO chargées ?
  report.lumoImages = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img[src*="/lumo/"]')];
    return imgs.map((i) => {
      const r = i.getBoundingClientRect();
      return { src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0, w: Math.round(r.width) };
    });
  });

  // 5. Formulaire : validation client
  const form = page.locator('form');
  await form.locator('button[type=submit]').click();
  await page.waitForTimeout(400);
  report.formValidation = await page.evaluate(() => {
    const msgs = [...document.querySelectorAll('.form-error-msg')].map((e) => e.textContent);
    return msgs.length ? msgs : 'AUCUNE ERREUR AFFICHÉE (bug)';
  });

  // 6. Formulaire : envoi (API absente en dev → repli mailto)
  await form.locator('input[name=nom]').fill('Test QA');
  await form.locator('input[name=email]').fill('test@example.com');
  await form.locator('textarea[name=message]').fill('Message de test QA pour vérifier le formulaire.');
  await form.locator('button[type=submit]').click();
  await page.waitForTimeout(800);
  report.formSubmit = await page.evaluate(() => {
    const status = document.querySelector('[role=status]');
    return status ? status.textContent.trim().slice(0, 120) : 'PAS DE STATUS (bug)';
  });

  // 7. Honeypot : rempli → le statut ne doit PAS changer (rempli via JS car invisible)
  await page.evaluate(() => {
    const hp = document.querySelector('input[name=website]');
    hp.value = 'spam';
  });
  const statusBefore = await page.evaluate(() => {
    const s = document.querySelector('[role=status]');
    return s ? s.textContent.trim() : 'aucun';
  });
  await form.locator('input[name=nom]').fill('Robot');
  await form.locator('input[name=email]').fill('robot@spam.com');
  await form.locator('textarea[name=message]').fill('Ceci est un message spam de robot.');
  await form.locator('button[type=submit]').click();
  await page.waitForTimeout(400);
  report.honeypotStatusUnchanged = await page.evaluate((before) => {
    const s = document.querySelector('[role=status]');
    return s ? s.textContent.trim() === before : before === 'aucun';
  }, statusBefore);

  // 8. Lightbox : ouvrir la première capture
  await page.evaluate(() => document.getElementById('projets').scrollIntoView());
  await page.waitForTimeout(1200);

  // Recheck des images après scroll (lazy-loading)
  report.lumoImagesAfterScroll = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img[src*="/lumo/"]')];
    return { loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length, total: imgs.length };
  });

  // Honeypot : le message de statut ne doit PAS changer
  const zoomBtn = page.locator('#projets button[aria-label^="Agrandir"]').first();
  if (await zoomBtn.count()) {
    await zoomBtn.click();
    await page.waitForTimeout(600);
    report.lightbox = await page.evaluate(() => !!document.querySelector('[role=dialog] img'));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    report.lightboxClosed = await page.evaluate(() => !document.querySelector('[role=dialog]'));
  } else {
    report.lightbox = 'bouton absent';
  }

  // 9. Capture plein écran + mobile
  await page.screenshot({ path: 'C:/Users/rene/shot-full2.png', fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(URL, { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(2200);
  report.hOverflowMobile = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await mobile.screenshot({ path: 'C:/Users/rene/shot-mobile2.png', fullPage: true });

  report.consoleErrors = errors.slice(0, 8);
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
