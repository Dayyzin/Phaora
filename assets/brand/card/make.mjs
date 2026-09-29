// Builds the PHAÖRA business card as one self-contained HTML file (fonts
// embedded) and renders it to print PDFs + PNG previews with Chromium.
//
//   FONTS=<dir holding the unpacked @fontsource/cormorant-garamond and
//   @fontsource/jost packages> node make.mjs <out dir>
//
// phaora-business-card.pdf           3.75 x 2.25 in: the 3.5 x 2 card + 1/8 in bleed. Upload this.
// phaora-business-card-crop-marks.pdf  the same on a larger sheet with trim marks, for a local shop.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire('/home/user/admin-phaora/package.json')
const { chromium } = require('playwright')

const OUT = process.argv[2]
const FONTS = process.env.FONTS ?? './fonts'
mkdirSync(OUT, { recursive: true })

const font = (fam, file, weight, style = 'normal') =>
  `@font-face{font-family:'${fam}';font-style:${style};font-weight:${weight};src:url(data:font/woff2;base64,${readFileSync(file).toString('base64')}) format('woff2')}`
const FACES = [
  font('Cormorant Garamond', `${FONTS}/fontsource-cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2`, 500),
  font('Jost', `${FONTS}/fontsource-jost/files/jost-latin-400-normal.woff2`, 400),
  font('Jost', `${FONTS}/fontsource-jost/files/jost-latin-500-normal.woff2`, 500),
].join('')

// Page = card with 1/8in bleed. Units below are inches.
const W = 3.75, H = 2.25, B = 0.125
const DPI = 96 // CSS px per inch; the SVGs are drawn in px.
const px = (i) => +(i * DPI).toFixed(2)

// Running-bond pavers, deterministic. Each stone a hair different in tone so
// the field reads as stone laid, not a grid printed.
function pavers(seed) {
  let s = seed
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const rowH = 0.43
  let out = ''
  for (let y = -0.1, r = 0; y < H; y += rowH, r++) {
    let x = -rnd() * 0.9
    while (x < W) {
      const len = 0.8 + rnd() * 1.1
      const tone = 7 + Math.round(rnd() * 5)
      out += `<rect x="${px(x)}" y="${px(y)}" width="${px(len)}" height="${px(rowH)}" fill="rgb(${tone - 6},${tone - 1},${tone + 5})"/>`
      // Joint: a dark cut with a faint lit lip, like the edge of a laid stone.
      out += `<path d="M${px(x)} ${px(y)}v${px(rowH)}M${px(x)} ${px(y)}h${px(len)}" stroke="#000" stroke-width="1.1" opacity=".75" fill="none"/>`
      out += `<path d="M${px(x) + 0.9} ${px(y) + 0.9}v${px(rowH) - 0.9}M${px(x) + 0.9} ${px(y) + 0.9}h${px(len) - 0.9}" stroke="#9FDCE2" stroke-width=".45" opacity=".10" fill="none"/>`
      x += len
    }
  }
  return `<svg class="stone" viewBox="0 0 ${px(W)} ${px(H)}" width="${px(W)}" height="${px(H)}">${out}</svg>`
}

// The mark, from phaora.com/favicon.svg: two dots over a ring, glowing.
const MARK = (id) => `
<svg viewBox="20 20 60 66" class="mark-svg">
  <defs>
    <radialGradient id="in${id}" cx="50%" cy="62%" r="50%">
      <stop offset="0%" stop-color="#0d6678" stop-opacity=".95"/>
      <stop offset="60%" stop-color="#041a26" stop-opacity=".6"/>
      <stop offset="100%" stop-color="#020812" stop-opacity="0"/>
    </radialGradient>
    <filter id="g${id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="50" cy="58" r="19" fill="url(#in${id})"/>
  <g filter="url(#g${id})">
    <circle cx="41" cy="30" r="4" fill="#DDEEF4"/>
    <circle cx="59" cy="30" r="4" fill="#DDEEF4"/>
    <circle cx="50" cy="58" r="21" fill="none" stroke="#DDEEF4" stroke-width="5.5"/>
  </g>
</svg>`

const FLAT_MARK = `
<svg viewBox="26 22 48 64" class="corner-mark">
  <circle cx="41" cy="30" r="4" fill="#5ABFC6"/>
  <circle cx="59" cy="30" r="4" fill="#5ABFC6"/>
  <circle cx="50" cy="58" r="21" fill="none" stroke="#5ABFC6" stroke-width="5.5"/>
</svg>`

const CSS = `
${FACES}
@page { size: ${W}in ${H}in; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { background: #00060C; -webkit-print-color-adjust: exact; print-color-adjust: exact }
.face { position: relative; width: ${W}in; height: ${H}in; overflow: hidden; background: #00060C; break-after: page }
.face:last-child { break-after: auto }
.stone { position: absolute; inset: 0 }
.center { position: absolute; left: 0; right: 0; text-align: center }
.mark-svg { position: absolute; left: 50%; top: .43in; width: .6in; height: .66in; transform: translateX(-50%) }
.wordmark {
  top: 1.2in; font-family: 'Cormorant Garamond'; font-weight: 500; font-size: 17.5pt; line-height: 1;
  letter-spacing: .5em; text-indent: .5em; color: #EAEAF0;
}
.wordmark .o { color: #5ABFC6 }
.rule { position: absolute; left: 50%; top: 1.52in; width: .5in; height: .9pt; margin-left: -.25in; background: #5ABFC6 }
.tagline {
  top: 1.66in; font-family: 'Jost'; font-weight: 400; font-size: 4.9pt; line-height: 1;
  letter-spacing: .3em; text-indent: .3em; color: #C3CCD5;
}
/* Back: a site-drawing corner around the mark. */
.vline { position: absolute; top: 0; bottom: 0; left: ${W - B - 0.52}in; width: .5pt; background: rgba(90,191,198,.55) }
.hline { position: absolute; left: 0; right: 0; top: ${B + 0.52}in; height: .5pt; background: rgba(90,191,198,.55) }
.corner-mark { position: absolute; left: ${W - B - 0.52 + 0.14}in; top: ${B + 0.1}in; width: .24in; height: .32in }
.contact { position: absolute; left: ${B + 0.3}in; bottom: ${B + 0.27}in; font-family: 'Jost'; color: #EAEAF0 }
.contact .name { font-weight: 500; font-size: 7.4pt; letter-spacing: .3em; margin-bottom: 6pt }
.contact .line { font-weight: 400; font-size: 6.6pt; letter-spacing: .14em; line-height: 1.8 }
`

const FRONT = `<section class="face front">
  ${pavers(7)}
  ${MARK('f')}
  <div class="center wordmark">PHA<span class="o">Ö</span>RA</div>
  <div class="rule"></div>
  <div class="center tagline">FULL-SERVICE HOME IMPROVEMENT · MASSACHUSETTS</div>
</section>`

const BACK = `<section class="face back">
  ${pavers(23)}
  <div class="vline"></div><div class="hline"></div>
  ${FLAT_MARK}
  <div class="contact">
    <div class="name">DAVID</div>
    <div class="line">(561) 299-1261</div>
    <div class="line">phaoraco@gmail.com</div>
    <div class="line">phaora.com</div>
  </div>
</section>`

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>PHAÖRA business card</title><style>${CSS}</style></head><body>${FRONT}${BACK}</body></html>`
writeFileSync(`${OUT}/card.html`, html)

// Crop-mark sheet: the bleed page centred on a larger white sheet, marks at trim.
const M = 0.25
const marks = []
for (const [x, y] of [[M + B, M + B], [M + W - B, M + B], [M + B, M + H - B], [M + W - B, M + H - B]]) {
  const dx = x < M + W / 2 ? -1 : 1, dy = y < M + H / 2 ? -1 : 1
  marks.push(`<line x1="${x}" y1="${y + dy * (B + 0.02)}" x2="${x}" y2="${y + dy * (B + M)}"/>`)
  marks.push(`<line x1="${x + dx * (B + 0.02)}" y1="${y}" x2="${x + dx * (B + M)}" y2="${y}"/>`)
}
const sheet = (face) => `<section class="sheet"><div class="slot">${face}</div>
<svg class="marks" viewBox="0 0 ${W + 2 * M} ${H + 2 * M}"><g stroke="#000" stroke-width=".004">${marks.join('')}</g></svg></section>`
const marksHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
@page { size: ${W + 2 * M}in ${H + 2 * M}in; margin: 0 }
html, body { background: #fff }
.sheet { position: relative; width: ${W + 2 * M}in; height: ${H + 2 * M}in; break-after: page }
.sheet:last-child { break-after: auto }
.slot { position: absolute; left: ${M}in; top: ${M}in }
.marks { position: absolute; inset: 0; width: 100%; height: 100% }
</style></head><body>${sheet(FRONT)}${sheet(BACK)}</body></html>`

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const page = await browser.newPage()
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.pdf({ path: `${OUT}/phaora-business-card.pdf`, width: `${W}in`, height: `${H}in`, printBackground: true, preferCSSPageSize: true })

const shot = await browser.newPage({ viewport: { width: px(W), height: px(H) }, deviceScaleFactor: 4 })
await shot.setContent(html, { waitUntil: 'load' })
await shot.evaluate(() => document.fonts.ready)
const faces = await shot.$$('.face')
await faces[0].screenshot({ path: `${OUT}/preview-front.png` })
await faces[1].screenshot({ path: `${OUT}/preview-back.png` })

await page.setContent(marksHtml, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.pdf({ path: `${OUT}/phaora-business-card-crop-marks.pdf`, width: `${W + 2 * M}in`, height: `${H + 2 * M}in`, printBackground: true, preferCSSPageSize: true })
await browser.close()
console.log('ok')
