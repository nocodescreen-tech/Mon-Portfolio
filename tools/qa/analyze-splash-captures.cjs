// Analyse des 3 captures : le résidu S3b est-il du fluide restant,
// ou un contenu statique du hero qui a changé entre la base et S2/S3 ?
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

function diff(a, b, x0, y0, x1, y1) {
  let n = 0
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * a.width + x) * a.bpp
      const d = Math.abs(a.px[i] - b.px[i]) + Math.abs(a.px[i + 1] - b.px[i + 1]) + Math.abs(a.px[i + 2] - b.px[i + 2])
      if (d > 36) n++
    }
  }
  return n
}

function warm(img, x0, y0, x1, y1) {
  let n = 0
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * img.width + x) * img.bpp
      const r = img.px[i], g = img.px[i + 1], b = img.px[i + 2]
      // teinte flamme : rouge dominant net, vert intermédiaire
      if (r > 60 && r > g && g > b && r - b > 45) n++
    }
  }
  return n
}

const base = decodePNG(fs.readFileSync('tools/qa/splash-1-idle.png'))
const fluid = decodePNG(fs.readFileSync('tools/qa/splash-2-fluid.png'))
const paused = decodePNG(fs.readFileSync('tools/qa/splash-3-apres-pause.png'))

console.log('diff(base, fluid)  =', diff(base, fluid, 120, 620, 1340, 820))
console.log('diff(base, paused) =', diff(base, paused, 120, 620, 1340, 820))
console.log('diff(fluid, paused)=', diff(fluid, paused, 120, 620, 1340, 820), ' ← si >0, le fluide S2 a bien disparu en S3')
console.log('warm(base)  =', warm(base, 120, 620, 1340, 820))
console.log('warm(fluid) =', warm(fluid, 120, 620, 1340, 820))
console.log('warm(paused)=', warm(paused, 120, 620, 1340, 820))
