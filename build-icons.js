const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Vector paths extracted via potrace from the cropped Ö
// Original viewBox 127.456 × 152.016 ; we keep that aspect, place inside any canvas
const VB_W = 127.456032;
const VB_H = 152.016636;
// potrace's output uses translate + scale(0.1,-0.1) — we already have those baked into the path data.
// Reuse the potrace <g> wrapper exactly as emitted.
const PATHS = `
<g transform="translate(-0.543968,152.000000) scale(0.100000,-0.100000)" fill="url(#gold)">
<path d="M430 1500 c-20 -20 -26 -65 -12 -86 13 -21 52 -34 77 -28 30 7 45 31 45 73 0 55 -70 81 -110 41z"/>
<path d="M761 1494 c-12 -15 -21 -35 -21 -46 0 -25 44 -68 70 -68 28 0 70 43 70 73 0 31 -39 67 -72 67 -17 0 -34 -10 -47 -26z"/>
<path d="M480 1274 c-147 -31 -290 -129 -374 -255 -101 -152 -129 -398 -70 -600 59 -199 231 -358 440 -404 114 -26 304 -17 403 18 255 90 401 313 401 612 0 205 -52 339 -179 466 -126 126 -265 179 -461 178 -52 0 -124 -7 -160 -15z m261 -44 c185 -34 328 -179 385 -390 24 -89 25 -300 1 -390 -67 -254 -245 -400 -487 -400 -233 0 -411 146 -477 392 -22 80 -24 308 -4 388 36 145 133 285 241 348 90 53 225 74 341 52z"/>
</g>`;

// Gold gradient — top highlight → mid gold → deep antique
function buildSVG({ size, fillRatio, bg = '#000000', transparent = false }) {
  const glyphH = size * fillRatio;
  const glyphW = glyphH * (VB_W / VB_H);
  const tx = (size - glyphW) / 2;
  const ty = (size - glyphH) / 2;
  const sx = glyphW / VB_W;
  const sy = glyphH / VB_H;
  const bgRect = transparent ? '' : `<rect width="${size}" height="${size}" fill="${bg}"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#F8E08A"/>
      <stop offset="35%"  stop-color="#E6BE5C"/>
      <stop offset="65%"  stop-color="#B8862E"/>
      <stop offset="100%" stop-color="#7A5418"/>
    </linearGradient>
  </defs>
  ${bgRect}
  <g transform="translate(${tx} ${ty}) scale(${sx} ${sy})">
    ${PATHS}
  </g>
</svg>`;
}

const OUT = '/home/user/Phaora/public';

async function render(name, opts, fmt = 'png') {
  const svg = buildSVG(opts);
  const out = path.join(OUT, name);
  let pipeline = sharp(Buffer.from(svg), { density: 384 }).resize(opts.size, opts.size);
  if (fmt === 'png') {
    await pipeline.png({ compressionLevel: 9 }).toFile(out);
  }
  const stat = fs.statSync(out);
  console.log(`wrote ${out} (${stat.size} bytes)`);
}

(async () => {
  // Save final SVG too for future use
  fs.writeFileSync('/home/user/Phaora/assets/brand/o-mark.svg',
    buildSVG({ size: 1024, fillRatio: 0.67 }));

  await render('icon-1024.png',         { size: 1024, fillRatio: 0.67 });
  await render('icon-512.png',          { size: 512,  fillRatio: 0.67 });
  await render('icon-192.png',          { size: 192,  fillRatio: 0.67 });
  await render('apple-touch-icon.png',  { size: 180,  fillRatio: 0.67 });
  await render('icon-mask-512.png',     { size: 512,  fillRatio: 0.55 });

  // favicon 32 — bump fill so it reads small; use png intermediate then convert via sharp -> ico via re-encoding
  const favSvg = buildSVG({ size: 32, fillRatio: 0.78 });
  const favPng = await sharp(Buffer.from(favSvg), { density: 384 }).resize(32, 32).png().toBuffer();
  fs.writeFileSync('/tmp/fav32.png', favPng);
  console.log('wrote /tmp/fav32.png (will convert to ico via Pillow)');
})();
