#!/usr/bin/env node
/* ============================================================================
 * PHAÖRA — town page generator
 *
 *   node scripts/generate-town-pages.js
 *
 * Extends the existing masonry-<town>-ma/ pattern (13 hand-built pages) to
 * more real, already-claimed towns, without hand-copying and editing HTML
 * per town.
 *
 * TOWNS below are not invented: every one is already named as served on the
 * live homepage's own Territory grid (Medfield, Milton, Walpole, Falmouth,
 * Bourne — "Serving" tier) or is the real Cindy job (Dennis, Route 6A, per
 * CLAUDE.md's own naming rule) or its immediate Cape neighbor (Chatham).
 * Counties and neighboring towns are real geography, not guessed — no new
 * town gets added here without both.
 *
 * Everything else (services grid, the five reasons a wall lasts, the
 * warranty block, the CTA) is identical prose to the existing 13 pages —
 * copied, not reworded, since it was already fact-checked once.
 * ========================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const HERO_IMAGES = [
  '/portfolio/images/retaining-wall-lit.jpg',
  '/portfolio/images/retaining-wall.jpg',
  '/portfolio/images/wall-granite-steps.jpg',
  '/portfolio/images/paver-driveway.jpg',
];

// Reused, real, already-existing OG image — these towns don't have their own
// photographed OG card yet, and a URL pointing at a file that doesn't exist
// is worse than a generic real one. Swap in a per-town photo when one exists.
const FALLBACK_OG_IMAGE = 'https://phaora.com/assets/og/phaora-share.jpg';

/**
 * cape: true marks the four Cape Cod towns, whose "Working in X" paragraph
 * says SEASONAL coverage — matching what the homepage's own Territory grid
 * already says ("Cape Cod · Seasonal... We take Cape work through the
 * season"). Claiming identical year-round coverage to the MetroWest primary
 * towns would contradict copy already live on the site.
 */
const TOWNS = [
  {
    slug: 'medfield', name: 'Medfield', county: 'Norfolk',
    workingIn: 'Medfield is Norfolk County between Dover and Walpole, and we run the same crews through Sherborn and Millis on the way.',
    nearby: ['dover', 'sherborn', 'walpole'],
  },
  {
    slug: 'milton', name: 'Milton', county: 'Norfolk',
    workingIn: 'Milton is Norfolk County at the Boston line, and the same trucks that cover Walpole and Dedham reach it without a special trip.',
    nearby: ['walpole', 'dover'],
  },
  {
    slug: 'walpole', name: 'Walpole', county: 'Norfolk',
    workingIn: 'Walpole is Norfolk County alongside Medfield and Norwood, on the same run as Milton and Dover.',
    nearby: ['medfield', 'milton', 'dover'],
  },
  {
    slug: 'chatham', name: 'Chatham', county: 'Barnstable', cape: true,
    workingIn: 'Chatham is Barnstable County, out on the elbow of the Cape near Harwich and Orleans — Cape work runs on its own seasonal schedule, alongside Falmouth, Dennis and Bourne.',
    nearby: ['dennis', 'falmouth', 'bourne'],
  },
  {
    slug: 'falmouth', name: 'Falmouth', county: 'Barnstable', cape: true,
    workingIn: 'Falmouth is Barnstable County next to Bourne and Mashpee — Cape work runs on its own seasonal schedule, alongside Dennis, Chatham and Bourne.',
    nearby: ['bourne', 'dennis', 'chatham'],
  },
  {
    slug: 'dennis', name: 'Dennis', county: 'Barnstable', cape: true,
    workingIn: 'Dennis is Barnstable County on Route 6A, between Yarmouth and Harwich — Cape work runs on its own seasonal schedule, alongside Falmouth, Chatham and Bourne.',
    nearby: ['chatham', 'falmouth', 'bourne'],
  },
  {
    slug: 'bourne', name: 'Bourne', county: 'Barnstable', cape: true,
    workingIn: 'Bourne sits at the canal, Barnstable County, the first stop over the bridge — Cape work runs on its own seasonal schedule, alongside Falmouth, Dennis and Chatham.',
    nearby: ['falmouth', 'dennis', 'chatham'],
  },
];

const NAV_BODY = fs.readFileSync(path.join(__dirname, '_town-template-nav.html'), 'utf8');
const STYLE_BLOCK = fs.readFileSync(path.join(__dirname, '_town-template-style.css'), 'utf8');
const SCRIPT_BLOCK = fs.readFileSync(path.join(__dirname, '_town-template-script.js'), 'utf8');

function render(town, heroImage) {
  const desc = `Patios, walkways, retaining walls, steps and drainage in ${town.name}, Massachusetts. Built to New England frost depth by our own crews. Free on-site estimate, and a price online in about thirty seconds.`;
  const title = `Masonry &amp; Hardscape Contractor in ${town.name}, MA | PHAÖRA`;
  const url = `https://phaora.com/masonry-${town.slug}-ma/`;

  const frostParagraph = town.cape
    ? 'Frost depth here is set by the town, not the state — Table R301.2(1) of the Massachusetts Residential Code is filled in by each building department, and coastal towns commonly run shallower than inland ones. We build to the depth your building department gives, and we ask before we dig.'
    : 'Frost depth here is set by the town, not the state — Table R301.2(1) of the Massachusetts Residential Code is filled in by each building department. Inland it is commonly 42 to 48 inches; nearer the coast it is often less. We build to the depth your building department gives, and we ask before we dig.';

  const nearbyLinks = town.nearby
    .map((slug) => {
      const t = TOWNS.find((x) => x.slug === slug);
      return `      <a href="/masonry-${slug}-ma/">${t ? t.name : slug}</a>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${FALLBACK_OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Masonry and hardscape in ${town.name}, Massachusetts by PHAÖRA">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${FALLBACK_OG_IMAGE}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"GeneralContractor","name":"PHAÖRA","legalName":"SKYINCH CAPITAL LLC","url":"${url}","telephone":"+1-561-299-1261","email":"phaoraco@gmail.com","description":"${desc}","areaServed":[{"@type":"City","name":"${town.name}, Massachusetts"}]}</script>
<script src="/tag.js"></script>
<style>
${STYLE_BLOCK}
</style>
</head>
<body>

${NAV_BODY}

<header class="tp-hero">
  <img src="${heroImage}" alt="" aria-hidden="true">
  <div class="veil"></div>
  <div class="tp-wrap">
    <p class="eyebrow">${town.name}, Massachusetts &nbsp;·&nbsp; ${town.county} County</p>
    <h1>Masonry and hardscape<br>in <em>${town.name}</em>.</h1>
    <p class="tp-lede">Patios, walkways, retaining walls, steps and drainage — built by our own crews, for ground that freezes.</p>
    <a class="tp-cta" href="/estimate/">Price your project &rarr;</a>
  </div>
</header>

<div class="tp-wrap">

  <section class="tp-sec">
    <h2 class="tp-h2">What we build in ${town.name}</h2>
    <div class="tp-grid">
      <div class="tp-cell"><h3>Patios</h3><p>Concrete paver, bluestone, flagstone or brick, set on a base built for the ground it sits in.</p></div>
      <div class="tp-cell"><h3>Walkways</h3><p>Front walks, garden paths and steps — the run people use every day and notice when it moves.</p></div>
      <div class="tp-cell"><h3>Retaining walls</h3><p>Block or natural stone, drained behind and footed below the frost line.</p></div>
      <div class="tp-cell"><h3>Driveways</h3><p>Paver and cobblestone, edged and restrained so the border holds its line.</p></div>
      <div class="tp-cell"><h3>Steps and landings</h3><p>Granite, bluestone and built treads, set solid and pitched to shed.</p></div>
      <div class="tp-cell"><h3>Stone veneer</h3><p>Foundations, columns, chimneys and facades in natural and manufactured stone.</p></div>
      <div class="tp-cell"><h3>Drainage</h3><p>The part nobody sees and the reason the rest of it is still straight in twenty years.</p></div>
    </div>
  </section>

  <section class="tp-sec">
    <h2 class="tp-h2">What decides whether it lasts here</h2>
    <p class="tp-p">Every wall and patio we have taken apart failed for one of these five reasons.
      They are the same in ${town.name} as anywhere else in New England, and they are most of
      what separates a job that looks right at twenty years from one that does not make five.</p>
    <ol class="tp-num">
      <li><h3>A base that was built, not just levelled</h3><p>Compacted gravel, deep enough for the ground it sits in. Every course above copies the first one, and so does every mistake in it.</p></li>
      <li><h3>Below the frost line</h3><p>New England ground moves in winter. A footing poured above the frost line lifts with it, and the wall on top of it cracks — not that winter, usually the third one.</p></li>
      <li><h3>Somewhere for the water to go</h3><p>Saturated soil expands about nine percent when it freezes, against something that cannot move. Clean stone, fabric, and a pipe run out to daylight.</p></li>
      <li><h3>Joints shaped, not just filled</h3><p>A tooled joint sheds water off the face of the stone. A joint struck flush holds it there, and held water is what freezes.</p></li>
      <li><h3>A cap that sheds</h3><p>The top takes the weather and everything anyone sets on it. Pitched away, set solid, joints tight.</p></li>
    </ol>
  </section>

  <section class="tp-sec">
    <h2 class="tp-h2">Working in ${town.name}</h2>
    <p class="tp-p">${town.workingIn}</p>
    <p class="tp-p">${frostParagraph}</p>
  </section>


  <section class="tp-sec">
    <div class="tp-assure">
      <div><h3>One-year workmanship warranty</h3><p>If something we built moves, cracks or fails in the first year because of how it was built, we come back and fix it. No argument, no invoice.</p></div>
    </div>
  </section>
  <section class="tp-ask">
    <h2>A number before anyone visits.</h2>
    <p class="tp-p">Trace your patio on a satellite view of your own property, or send a photograph
      of the job, and the page prices it. The on-site visit is free and it is what makes it exact.</p>
    <p style="margin:20px 0 0"><a class="tp-cta" href="/estimate/">Price it now &rarr;</a></p>
  </section>

  <div class="tp-near">
    <p class="lbl">We also work in</p>
    <div class="row">
${nearbyLinks}
    </div>
  </div>
</div>

<footer>
  <div class="footer-top">
    <div>
      <div class="footer-wm">PHA<span class="o">&Ouml;</span>RA</div>
      <p class="footer-tagline">Full-service home improvement across New England — masonry, the whole home, and snow plowing.<br><strong>Registered &amp; insured · One-year workmanship warranty · New England</strong></p>
    </div>
    <div class="footer-col">
      <h5>The House</h5>
      <ul><li><a href="#">About</a></li><li><a href="#">Studio</a></li><li><a href="#">Press</a></li></ul>
    </div>
    <div class="footer-col">
      <h5>Divisions</h5>
      <ul><li><a href="/shop/">Shop</a></li><li><a href="/hardscape-gallery.html">Hardscape</a></li><li><a href="/sculptures.html">Sculpture</a></li><li><a href="/sculptures.html" class="av">Águas Vivas</a></li></ul>
    </div>
    <div class="footer-col">
      <h5>Connect</h5>
      <ul><li><a href="tel:+15612991261">(561) 299-1261</a></li><li><a href="/estimate/">Instant estimate</a></li><li><a href="/blog">Journal</a></li><li><a href="/contact.html">Contact</a></li><li><a href="/service-area/">Service area</a></li><li><a href="#">Instagram</a></li></ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">Phaöra · MMXXVI &nbsp;·&nbsp; New England &nbsp;·&nbsp; All rights reserved</span>
    <span class="footer-coords">42°21′N 71°03′W</span>
  </div>
</footer>

<script>
${SCRIPT_BLOCK}
</script>
</body>
</html>
`;
}

let written = 0;
TOWNS.forEach((town, i) => {
  const dir = path.join(ROOT, `masonry-${town.slug}-ma`);
  fs.mkdirSync(dir, { recursive: true });
  const html = render(town, HERO_IMAGES[i % HERO_IMAGES.length]);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`wrote masonry-${town.slug}-ma/index.html`);
  written++;
});
console.log(`\n${written} town page(s) generated.`);
