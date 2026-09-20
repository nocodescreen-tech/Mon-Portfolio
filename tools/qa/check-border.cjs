const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 2600 } });
  await p.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(2000);
  const r = await p.evaluate(() => {
    const rows = [];
    document.querySelectorAll('#projets article').forEach((art) => {
      const img = art.querySelector('img');
      if (!img) return;
      const wrap = img.closest('[class*="rounded-2xl"]');
      const s = getComputedStyle(wrap);
      rows.push({ title: art.querySelector('h3')?.innerText, border: s.borderWidth + ' ' + s.borderStyle + ' ' + s.borderColor, radius: s.borderRadius });
    });
    return rows;
  }).catch((e) => 'ERR:' + (e && e.message || e));
  console.log('RESULT_START\n' + JSON.stringify(r, null, 2) + '\nRESULT_END');
  await b.close().catch(()=>{});
  process.exit(0);
})().catch((e)=>{ console.log('FATAL', (e && e.message || e).slice(0,150)); process.exit(1) });
