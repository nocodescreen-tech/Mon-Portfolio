const { chromium } = require('playwright-core');
(async () => {
  console.log('STEP launch'); 
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  console.log('STEP newPage');
  const p = await b.newPage({ viewport: { width: 1440, height: 1200 } });
  console.log('STEP goto');
  await p.goto('http://localhost:4174/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p.waitForTimeout(2200);
  console.log('STEP scroll');
  await p.evaluate(() => document.querySelector('#projets')?.scrollIntoView({ block: 'start' })).catch((e)=>console.log('scrolerr',e.message));
  await p.waitForTimeout(1000);
  console.log('STEP evaluate');
  const info = await p.evaluate(() => {
    const cards = [];
    document.querySelectorAll('#projets article img').forEach((img) => {
      const frame = img.closest('[class*="rounded-2xl"]');
      const s = frame ? getComputedStyle(frame) : null;
      cards.push({ src: img.getAttribute('src'), nat: img.naturalWidth+'x'+img.naturalHeight, border: s ? s.borderWidth+' '+s.borderStyle+' '+s.borderColor : null, radius: s?s.borderRadius:null });
    });
    return { theme: document.documentElement.getAttribute('data-theme'), cards };
  }).catch((e)=>'EVALERR:'+e.message);
  console.log('STEP close');
  await b.close().catch(()=>{});
  console.log('RESULT_START\n' + JSON.stringify(info, null, 2) + '\nRESULT_END');
  process.exit(0);
})().catch((e)=>{ console.log('FATAL', (e&&e.message||e).slice(0,200)); process.exit(1) });
