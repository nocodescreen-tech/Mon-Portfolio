const fs = require('fs');
const zlib = require('zlib');

// Décode minimal PNG (truecolor RGB/A, filters) — pas de dépendance
function decodePNG(file) {
  const buf = fs.readFileSync(file);
  // vérif signature
  const sig = [137,80,78,71,13,10,26,10];
  for (let i=0;i<8;i++) if (buf[i]!==sig[i]) throw new Error('pas un PNG');
  let off = 8, width=0, height=0, bitDepth=0, colorType=0, idat=[];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off+4, off+8);
    const data = buf.subarray(off+8, off+8+len);
    if (type === 'IHDR') { width=data.readUInt32BE(0); height=data.readUInt32BE(4); bitDepth=data[8]; colorType=data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = colorType===6?4:3;
  const stride = width*bpp;
  const px = Buffer.alloc(height*stride);
  let pos=0;
  for (let y=0;y<height;y++){
    const filter=raw[pos]; pos++;
    const row=raw.subarray(pos, pos+stride); pos+=stride;
    const prev = y>0?px.subarray((y-1)*stride, y*stride):null;
    const out = px.subarray(y*stride, (y+1)*stride);
    for(let x=0;x<stride;x++){
      let a=x>=bpp?out[x-bpp]:0, b=prev?prev[x]:0, c=(x>=bpp&&prev)?prev[x-bpp]:0;
      let v;
      switch(filter){
        case 0: v=row[x]; break;
        case 1: v=row[x]+a; break;
        case 2: v=row[x]+b; break;
        case 3: v=row[x]+((a+b)>>1); break;
        case 4: { const p=a+b-c, pp=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c); v=row[x]+(pp<=pb&&pp<=pc?a:pb<=pc?b:c); break; }
        default: v=row[x];
      }
      out[x]=v&0xff;
    }
  }
  return { width, height, bpp, px };
}

const { width, height, bpp, px } = decodePNG('tools/qa/fluid-shot.png');
let colored=0,total=0,maxr=0;
for (let y=0;y<height;y+=6){
  for(let x=0;x<width;x+=6){
    const i=(height>0? y*width+x : 0)*bpp;
    const r=px[i],g=px[i+1],bl=px[i+2];
    const isBG=r<48&&g<48&&bl<58;
    const colorf=Math.max(r,g,bl)-Math.min(r,g,bl)>40;
    if(r>maxr)maxr=r;
    total++; if(!isBG&&(colorf||r>120)) colored++;
  }
}
console.log('image', width+'x'+height, 'bpp', bpp);
console.log('colored', colored, '/', total, '=', (100*colored/total).toFixed(1)+'%', '| maxR', maxr);