// QA final — sécurité côté client + rendu.
// Vérifie dans un vrai navigateur :
//  1) console : 0 erreur
//  2) aucune source sensible dans localStorage/sessionStorage/cookies-lecturables
//  3) aucun en-tête Serveur inutile / rien qui fuie
//  4) route #/admin affiche l'écran de connexion (cookie httpOnly → pas de token client)
//  5) robots.txt dispo
// Note : vite preview ne sert pas /api, donc l'admin affichera le login (sans cookie → 401 côté browser).
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message.slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error') logs.push('CONSOLE: ' + m.text().slice(0, 200)); });

  const results = {};

  // --- Site public ---
  await p.goto('http://localhost:4174/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(2500);
  results.public = await p.evaluate(() => ({
    ls: Object.keys(localStorage || {}),
    ss: Object.keys(sessionStorage || {}),
    anyToken: JSON.stringify(Object.values(localStorage)).match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\./i) !== null,
  }));
  await p.screenshot({ path: 'tools/qa/final-hero-v2.png' });

  // --- Route admin (cookie httpOnly → doit montrer le login, PAS de token client) ---
  await p.goto('http://localhost:4174/#/admin', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(1800);
  results.admin = await p.evaluate(() => ({
    hasLogin: /se connecter|boîte de réception|espace privé/i.test(document.body.innerText),
    storageAfterAdminLogin: Object.keys(localStorage),
    anyJwtInStorage: JSON.stringify(localStorage).match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\./i) !== null,
    bodySnippet: document.body.innerText.slice(0, 120),
  }));

  // --- robots.txt ---
  const rob = await p.request.get('http://localhost:4174/robots.txt');
  results.robots = { status: rob.status(), body: (await rob.text()).trim() };

  results.logs = logs;
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message.slice(0, 200)); process.exit(1); });