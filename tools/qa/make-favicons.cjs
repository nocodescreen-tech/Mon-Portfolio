const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const svg = fs.readFileSync('C:/Users/rene/rene-descartes-portfolio/public/logo.svg', 'utf8');
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const sizes = [[16, 'favicon-16.png'], [32, 'favicon-32.png'], [180, 'apple-touch-icon.png']];
  for (const [size, name] of sizes) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
    await page.waitForTimeout(120);
    await page.screenshot({ path: `C:/Users/rene/rene-descartes-portfolio/public/${name}`, omitBackground: true });
    console.log(name, fs.statSync(`C:/Users/rene/rene-descartes-portfolio/public/${name}`).size, 'o');
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message.slice(0, 200)); process.exit(1); });
