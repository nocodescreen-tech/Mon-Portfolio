// Sonde visibilité : le fluide peint-il réellement des pixels visibles ?
// Burst de clic (×10) sur une zone sombre + capture immédiate + diff local.
const { chromium } = require('playwright-core')
const fs = require('fs')
const zlib = require('zlib')

function decodePNG(buf) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10]
  for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) throw new Error('pas un PNG')
  let off = 8, width = 0, height = 0, colorType = 0
  const idat = []
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); colorType = data[9] }
    else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    off += 12 + len
  }
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const bpp = colorType === 6 ? 4 : 3
  const stride = width * bpp
  const px = Buffer.alloc(height * stride)
  let pos = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[pos]; pos++
    const row = raw.subarray(pos, pos + stride); pos += stride
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : null
    const out = px.subarray(y * stride, (y + 1) * stride)
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[x - bpp] : 0
      const b = prev ? prev[x] : 0
      const c = x >= bpp && prev ? prev[x - bpp] : 0
      let v
      switch (filter) {
        case 1: v = row[x] + a; break
        case 2: v = row[x] + b; break
        case 3: v = row[x] + ((a + b) >> 1); break
        case 4: { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v = row[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); break }
        default: v = row[x]
      }
      out[x] = v & 0xff
    }
  }
  return { width, height, bpp, px }
}

function diffRegion(a, b, x0, y0, x1, y1) {
  let n = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * a.width + x) * a.bpp
      const d = Math.abs(a.px[i] - b.px[i]) + Math.abs(a.px[i + 1] - b.px[i + 1]) + Math.abs(a.px[i + 2] - b.px[i + 2])
      if (d > 36) n++
    }
  }
  return n
}

;(async () => {
  const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe']
    .find((p) => fs.existsSync(p))
  const b = await chromium.launch({ executablePath: exe, headless: true })
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto('http://localhost:4180/', { waitUntil: 'domcontentloaded' })
  let h = null
  for (let i = 0; i < 60 && !h; i++) {
    await p.waitForTimeout(200)
    h = await p.evaluate(() => (window.__splash ? { ...window.__splash } : null))
  }
  console.log('hook:', JSON.stringify(h))
  if (!h) { console.log('FATAL pas de hook'); process.exit(1) }

  // diagnostics canvas
  const diag = await p.evaluate(() => {
    const c = document.querySelector('#fluid-cursor')
    const r = c.getBoundingClientRect()
    const cs = getComputedStyle(c)
    return { rect: [r.x, r.y, r.width, r.height], z: cs.zIndex, vis: cs.visibility, pe: cs.pointerEvents, backing: [c.width, c.height], parent: c.parentElement.tagName }
  })
  console.log('canvas:', JSON.stringify(diag))

  // capture de référence (zone sombre à droite du hero)
  const ref = await p.screenshot()
  // burst au clic (color ×10) sur zone sombre + petit mouvement
  await p.mouse.move(1100, 350)
  await p.mouse.down()
  await p.mouse.up()
  await p.waitForTimeout(120)
  const hookNow = await p.evaluate(() => (window.__splash ? { ...window.__splash } : null))
  const shot = await p.screenshot()
  console.log('hook au burst:', JSON.stringify(hookNow))

  const A = decodePNG(ref)
  const B = decodePNG(shot)
  const local = diffRegion(A, B, 900, 200, 1300, 500)
  console.log('diff zone burst (900-1300 x 200-500) =', local, 'px changés sur 160000')
  fs.writeFileSync('tools/qa/probe-ref.png', ref)
  fs.writeFileSync('tools/qa/probe-burst.png', shot)
  await b.close()
  process.exit(0)
})().catch((e) => { console.log('FATAL', e.message); process.exit(1) })
