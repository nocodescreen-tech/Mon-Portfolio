const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4174/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3500);
  const info = await p.evaluate(() => {
    const canvas = document.querySelector('#top canvas');
    const fallback = document.querySelector('#top .static-fallback, #top [aria-hidden="true"] > div');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // liste les éléments ayant une bordure visible dans le hero
    const bordered = [...document.querySelectorAll('#top *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 20 || r.height < 20 || r.width > 900 || r.height > 900) return false;
        const s = getComputedStyle(el);
        return s.borderStyle !== 'none' && parseFloat(s.borderWidth) > 0;
      })
      .slice(0, 8)
      .map((el) => ({ cls: (el.className||'').toString().slice(0,40), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height), border: getComputedStyle(el).borderWidth }));
    const sceneDivs = [...document.querySelectorAll('#top *')].filter((el)=>(el.className||'').toString().includes('fallback')).map((el)=>({cls:(el.className||'').toString().slice(0,40)}));
    return { hasCanvas: !!canvas, reduced, bordered, sceneDivs, webgl: !!((canvas) && (canvas.getContext('webgl2')||canvas.getContext('webgl'))) };
  });
  await p.screenshot({ path: 'tools/qa/hero-cadre-check.png' });
  console.log(JSON.stringify(info, null, 2));
  await b.close(); process.exit(0);
})().catch((e)=>{console.error('FATAL',e.message.slice(0,200));process.exit(1)});
