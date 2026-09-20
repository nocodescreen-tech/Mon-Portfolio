// QA runtime réel — scène 3D (R3F WebGL) + route admin (#/admin).
// Lance le preview build, puis vérifie :
//  1) aucune erreur console/WebGL, fond du canvas thémé (pas de blanc pur)
//  2) le canvas R3F est vivant (non vide)
//  3) la route #/admin render le login sans crash
const { chromium } = require('playwright-core');

(async () => {
  const src = async (fn) => {
    const r = await (await import('@playwright/test'))._readConfigFile?.(); // noop
    return fn;
  };
  void src;
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message.slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error') logs.push('CONSOLE: ' + m.text().slice(0, 200)); });

  await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3500); // laisser charger le bundle R3F (lazy) + WebGL

  // Scène 3D : il y a un WebGL canvas dans #top
  const gl = await p.evaluate(() => {
    const canvas = document.querySelector('#top canvas');
    if (!canvas) return { found: false };
    // détecter webgl
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { found: true, webgl: false };
    const bg = getComputedStyle(canvas).backgroundColor;
    return { found: true, webgl: true, w: canvas.width, h: canvas.height, bg, bodyBg: getComputedStyle(document.body).backgroundColor };
  });

  // Route admin
  await p.goto('http://localhost:4173/#/admin', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(1500);
  const admin = await p.evaluate(() => {
    const body = document.body.innerText;
    return {
      hasLogin: /se connecter|boîte de réception/i.test(body),
      hasPrivate: /espace privé/i.test(body),
    };
  });

  // capture
  await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2000);
  await p.screenshot({ path: 'tools/qa/final-hero.png' });

  console.log(JSON.stringify({ gl, admin, logs }, null, 2));
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message.slice(0, 200)); process.exit(1); });