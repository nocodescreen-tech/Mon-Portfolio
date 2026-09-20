const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message.slice(0, 160)));
  p.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU|INSUFFICIENT|favicon/i.test(m.text())) logs.push('CONSOLE: ' + m.text().slice(0, 140)); });
  await p.goto('http://localhost:4174/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => {
    const heroCanvas = document.querySelector('#top canvas');
    const dotCanvas = document.querySelector('main canvas, body > div > canvas, [class="fixed inset-0 z-0"] canvas');
    const projects = document.querySelector('#projets');
    const projCanvas = projects ? projects.querySelector('canvas') : null;
    return {
      heroHasOwnCanvas: !!heroCanvas,               // hero ne doit PAS avoir son propre canvas (fond global)
      globalDotCanvas: !!dotCanvas,                 // le DotField global existe
      projTitle: projects ? (projects.innerText.split('\n')[0]) : null,
      hasCarouselNav: projects ? (projects.querySelectorAll('button[aria-label*="Projet"]').length) : 0,
      hasDetail: projects ? /Contexte|Problème|Résultat|Périmètre/.test(projects.innerText) : false,
      heroTitle: document.querySelector('#top h1')?.innerText,
    };
  });
  // simule un clic "suivant" sur le carrousel
  const nextBtn = await p.$('#projets button[aria-label="Projet suivant"]');
  if (nextBtn) { await nextBtn.click(); await p.waitForTimeout(700); }
  const after = await p.evaluate(() => {
    const h3 = document.querySelector('#projets h3')?.innerText;
    return { activeTitle: h3, activeNum: document.querySelector('#projets span[class*="flame-text"]')?.textContent || null };
  });
  await p.screenshot({ path: 'tools/qa/final-site.png' });
  console.log('RESULT_START');
  console.log(JSON.stringify({ r, after, logs }, null, 2));
  console.log('RESULT_END');
  await b.close().catch(()=>{});
  process.exit(0);
})().catch((e)=>{ console.log('FATAL', (e&&e.message||e).slice(0,180)); process.exit(1) });
