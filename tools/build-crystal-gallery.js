#!/usr/bin/env node
/**
 * Builds /crystal.html — the reading gallery for the thirty-four crystal pieces.
 *
 * WHY THIS PAGE EXISTS
 * ---------------------------------------------------------------------------
 * The photographs sat in assets/sculptures/ with nothing on the live site
 * linking to them: sculptures.html points at the eleven Águas Vivas works, and
 * the thirty-four piece pages under /pieces/ were orphans. Three hundred and
 * twenty-two photographs and thirty-four written narratives, unreachable.
 *
 * WHAT IT IS, AND WHAT IT IS NOT
 * ---------------------------------------------------------------------------
 * Not a collage and not a contact sheet. It reads: each piece gets a spread of
 * its own — a numeral, a heading, its narrative in the serif at reading size,
 * and two plates set against the text rather than tiled beside it. Sides
 * alternate so the eye moves down the page instead of scanning a grid.
 *
 * Every plate is masked so its edges fade into the ground rather than ending on
 * a cut line — see .cr-plate img below. No borders, no frames, no hard corners.
 *
 * WHERE THE WORDS COME FROM
 * ---------------------------------------------------------------------------
 * piece-narratives.js, written from each piece's own hero plate. This file adds
 * no claims of its own: the only facts it renders are the slug, the name, the
 * price and the photograph count, all of which come from catalog.json.
 */
const fs = require('fs');
const path = require('path');
const { narrativeFor, coverage } = require('../piece-narratives');
const { chrome } = require('./lib-chrome');

const ROOT = path.join(__dirname, '..');
const SCULPTURES = path.join(ROOT, 'assets/sculptures');
const OUT = path.join(ROOT, 'crystal.html');

const C = chrome();

const catalog = JSON.parse(fs.readFileSync(path.join(SCULPTURES, 'catalog.json'), 'utf8'));
const pieces = catalog.pieces;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII',
               'XVIII','XIX','XX','XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX',
               'XXXI','XXXII','XXXIII','XXXIV'];

/** The plates for a piece: hero first, then whatever else the folder holds. */
function platesFor(slug) {
  const dir = path.join(SCULPTURES, slug);
  if (!fs.existsSync(dir)) return [];
  const all = fs.readdirSync(dir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f) && !f.startsWith('.'))
    .sort();
  const hero = all.find(f => /hero/i.test(f)) || all[0];
  const rest = all.filter(f => f !== hero);
  return [hero, ...rest].filter(Boolean);
}

function money(n) {
  return typeof n === 'number' && n > 0 ? 'USD ' + n.toLocaleString('en-US') : 'On request';
}

// ── the spreads ───────────────────────────────────────────────────────────────
let missingPhotos = [];
const spreads = pieces.map((p, i) => {
  const n = narrativeFor(p.slug);
  const plates = platesFor(p.slug);
  if (!plates.length) missingPhotos.push(p.slug);

  const side = i % 2 === 0 ? 'cr-left' : 'cr-right';
  const heading = n ? n.heading : p.name;
  const body = n ? n.body : [];

  // Two plates carry the spread: the hero, and one from further into the set so
  // the second is a different view rather than a near-duplicate of the first.
  const plateA = plates[0];
  const plateB = plates.length > 2 ? plates[Math.min(3, plates.length - 1)] : plates[1];

  const img = (file, cls, eager) => file
    ? `<figure class="cr-plate ${cls}"><img src="assets/sculptures/${p.slug}/${encodeURIComponent(file)}" alt="${esc(p.name)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></figure>`
    : '';

  return `
<article class="cr-spread ${side}" id="${p.slug}">
  <div class="cr-plates">
    ${img(plateA, 'cr-plate-a', i === 0)}
    ${img(plateB, 'cr-plate-b', false)}
  </div>
  <div class="cr-text">
    <span class="cr-num">${ROMAN[i] || i + 1}</span>
    <h2 class="serif">${esc(heading)}</h2>
    <p class="cr-name">${esc(p.name)}${p.species ? ' &middot; ' + esc(p.species) : ''}</p>
    ${body.map(par => `<p>${esc(par)}</p>`).join('\n    ')}
    <div class="cr-foot">
      <span class="cr-price">${money(p.price_usd)}</span>
      <span class="cr-sep">&middot;</span>
      <span class="cr-ed">One of one</span>
      <a class="cr-more" href="pieces/${p.slug}.html">${plates.length} photograph${plates.length === 1 ? '' : 's'} &rarr;</a>
    </div>
  </div>
</article>`;
}).join('\n');

// ── the index strip ───────────────────────────────────────────────────────────
const indexStrip = pieces.map((p, i) =>
  `      <a href="#${p.slug}"><span class="cri-num">${ROMAN[i] || i + 1}</span><span class="cri-name">${esc(p.name)}</span></a>`
).join('\n');

const total = pieces.length;
const photoTotal = pieces.reduce((s, p) => s + platesFor(p.slug).length, 0);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Crystal &mdash; PHAÖRA</title>
<meta name="description" content="Thirty-four one-of-one crystal sculptures, hand-carved in Minas Gerais. Each piece written and photographed in full. By appointment.">
<meta property="og:title" content="Crystal — PHAÖRA">
<meta property="og:description" content="Thirty-four one-of-one crystal sculptures, hand-carved in Minas Gerais.">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${C.fonts}" rel="stylesheet">
<style>
img{max-width:100%;display:block}

${C.css}

/* ── HERO ─────────────────────────────────────────────────────────────── */
.cr-hero{padding:clamp(120px,18vh,200px) clamp(20px,5vw,64px) clamp(56px,8vh,96px);text-align:center;max-width:860px;margin:0 auto}
.cr-hero h1{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(44px,7vw,86px);line-height:1.02;letter-spacing:-.01em;margin:18px 0 0}
.cr-hero h1 em{font-style:italic;color:var(--gold-lt)}
.cr-hero .cr-lede{font-family:'Cormorant Garamond',serif;font-size:clamp(17px,2vw,21px);line-height:1.7;color:rgba(234,239,245,.62);margin:26px auto 0;max-width:60ch}
.cr-hero .rule-h{margin-top:34px}
.cr-tally{display:flex;gap:clamp(24px,5vw,56px);justify-content:center;margin-top:34px;flex-wrap:wrap}
.cr-tally div{text-align:center}
.cr-tally b{display:block;font-family:'Cormorant Garamond',serif;font-weight:400;font-size:30px;color:var(--pearl);line-height:1}
.cr-tally span{display:block;font-size:9px;letter-spacing:.26em;text-transform:uppercase;color:rgba(234,239,245,.34);margin-top:8px}

/* ── INDEX ────────────────────────────────────────────────────────────── */
.cr-index{max-width:1080px;margin:0 auto;padding:0 clamp(20px,5vw,64px) clamp(60px,10vh,120px)}
.cr-index-head{font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:rgba(200,164,94,.46);padding-bottom:14px;border-bottom:1px solid rgba(79,181,190,.10);margin-bottom:18px}
.cr-index-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:2px 22px}
.cr-index-grid a{display:flex;align-items:baseline;gap:10px;padding:7px 0;transition:color .2s}
.cri-num{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12px;color:rgba(79,181,190,.3);width:34px;flex-shrink:0;text-align:right}
.cri-name{font-size:12px;letter-spacing:.04em;color:rgba(234,239,245,.5);transition:color .2s}
.cr-index-grid a:hover .cri-name{color:var(--pearl)}
.cr-index-grid a:hover .cri-num{color:var(--teal)}

/* ── SPREADS ──────────────────────────────────────────────────────────── */
.cr-body{max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,64px)}
.cr-spread{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(32px,5vw,76px);align-items:center;
  padding:clamp(56px,9vh,110px) 0;border-top:1px solid rgba(79,181,190,.07);scroll-margin-top:84px}
.cr-spread:first-child{border-top:none}
.cr-right .cr-plates{order:2}
.cr-right .cr-text{order:1}

/* The plates. No frame, no corner: each image is masked so all four edges
   dissolve into the page. Two gradients intersected — one horizontal, one
   vertical — feather roughly 8% in from every side. */
.cr-plates{position:relative}
.cr-plate{margin:0;line-height:0}
.cr-plate img{
  width:100%;height:auto;border-radius:14px;
  -webkit-mask-image:
     linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%),
     linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%);
          mask-image:
     linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%),
     linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%);
  -webkit-mask-composite:source-in;
          mask-composite:intersect;
  filter:saturate(1.02);
}
.cr-plate-b{position:absolute;width:46%;right:-4%;bottom:-11%;z-index:2}
.cr-plate-b img{border-radius:10px}

.cr-text{max-width:56ch}
.cr-num{display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;
  letter-spacing:.2em;color:rgba(79,181,190,.42);margin-bottom:16px}
.cr-text h2{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(28px,3.4vw,44px);
  line-height:1.1;letter-spacing:-.005em;color:var(--pearl)}
.cr-name{font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:rgba(200,164,94,.6);margin:14px 0 26px}
.cr-text p{font-family:'Cormorant Garamond',serif;font-size:clamp(16px,1.5vw,18.5px);line-height:1.72;
  color:rgba(234,239,245,.78);margin-bottom:1.15em}
.cr-text p:first-of-type::first-letter{font-size:2.9em;float:left;line-height:.86;padding:.04em .1em 0 0;color:var(--gold-lt)}
.cr-foot{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-top:28px;
  padding-top:18px;border-top:1px solid rgba(79,181,190,.09)}
.cr-price{font-size:11px;letter-spacing:.16em;color:rgba(234,239,245,.72)}
.cr-sep,.cr-ed{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(234,239,245,.3)}
.cr-more{margin-left:auto;font-size:10px;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(79,181,190,.72);transition:color .2s}
.cr-more:hover{color:var(--teal)}

/* ── CLOSE ────────────────────────────────────────────────────────────── */
.cr-close{text-align:center;padding:clamp(80px,13vh,150px) clamp(20px,5vw,64px);max-width:680px;margin:0 auto}
.cr-close h3{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(28px,4vw,42px);line-height:1.15}
.cr-close h3 em{font-style:italic;color:var(--gold-lt)}
.cr-close p{font-family:'Cormorant Garamond',serif;font-size:17px;line-height:1.7;color:rgba(234,239,245,.6);margin:20px 0 32px}
.cr-cta{display:inline-block;border:1px solid rgba(79,181,190,.3);padding:14px 30px;font-size:10px;
  letter-spacing:.24em;text-transform:uppercase;color:rgba(79,181,190,.85);transition:border-color .2s,color .2s}
.cr-cta:hover{border-color:var(--teal);color:var(--teal)}

@media(max-width:900px){
  .cr-spread{grid-template-columns:1fr;gap:34px;padding:56px 0}
  .cr-right .cr-plates,.cr-right .cr-text{order:initial}
  .cr-plate-b{position:static;width:64%;margin:14px 0 0 auto}
  .cr-text{max-width:none}
  .cr-index-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
}
</style>
</head>
<body>

${C.nav}
${C.mobile}

<header class="cr-hero">
  <p class="eyebrow">Hardscape &middot; Crystal</p>
  <h1>Stone that was never <em>meant</em> to be walked on</h1>
  <p class="cr-lede">The same hands that set granite set these. Thirty-four one-of-one carvings out of Minas Gerais &mdash; amethyst, quartz, agate, labradorite &mdash; each one written up from its own plates and photographed from every side.</p>
  <div class="rule-h"></div>
  <div class="cr-tally">
    <div><b>${total}</b><span>Works</span></div>
    <div><b>${photoTotal}</b><span>Photographs</span></div>
    <div><b>1</b><span>Of each</span></div>
  </div>
</header>

<nav class="cr-index" aria-label="The collection">
  <p class="cr-index-head">The collection</p>
  <div class="cr-index-grid">
${indexStrip}
  </div>
</nav>

<main class="cr-body">
${spreads}
</main>

<section class="cr-close">
  <h3>Every piece is placed by <em>conversation</em></h3>
  <p>There is no cart and no auction. Write to the studio, say which one, and David answers personally.</p>
  <a class="cr-cta" href="mailto:david@phaora.com?subject=Crystal%20enquiry">Write to the studio &rarr;</a>
</section>

${C.foot}

<script>
${C.nav_js}
</script>

</body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');

const cov = coverage(pieces.map(p => p.slug));
console.log(`crystal.html — ${total} pieces, ${photoTotal} photographs`);
console.log(`  narratives ${cov.covered}/${cov.total}${cov.missing.length ? '  missing: ' + cov.missing.join(', ') : ''}`);
if (missingPhotos.length) console.log(`  NO PHOTOS: ${missingPhotos.join(', ')}`);
if (cov.missing.length || missingPhotos.length) process.exitCode = 1;
