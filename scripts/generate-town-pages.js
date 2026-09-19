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

/**
 * States this generator writes pages for.
 *
 * Shore work crosses state lines because ticket size does. A seawall or a
 * veneer wall is worth the truck in a way a walkway never is, so the coastal
 * list is drawn on value rather than on the two-hour radius that governs
 * ordinary work out of Worcester.
 *
 * `county` is what Census returns for that coordinate, not what memory says.
 * Connecticut is the reason that matters: the state abolished county
 * government and Census now returns PLANNING REGIONS — "Southeastern
 * Connecticut", "Lower Connecticut River Valley" — so a page claiming "New
 * London County" would name a thing that no longer exists.
 */
const STATE_NAMES = {
  ma: 'Massachusetts',
  ri: 'Rhode Island',
  nh: 'New Hampshire',
  me: 'Maine',
  ct: 'Connecticut',
};

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
 * coastal: true marks the four Cape Cod towns, whose "Working in X" paragraph
 * says SEASONAL coverage — matching what the homepage's own Territory grid
 * already says ("Cape Cod · Seasonal... We take Cape work through the
 * season"). Claiming identical year-round coverage to the MetroWest primary
 * towns would contradict copy already live on the site.
 */
const TOWNS = [
  {
    slug: 'newport', name: 'Newport', state: 'ri', county: 'Newport', coastal: true,
    workingIn: 'Newport is Newport County, Rhode Island, out on Aquidneck Island — the Cliff Walk side of town is nothing but stone against salt water, and we run it on the same trip as Jamestown and Little Compton.',
    nearby: ['jamestown', 'little-compton', 'narragansett'],
  },
  {
    slug: 'jamestown', name: 'Jamestown', state: 'ri', county: 'Newport', coastal: true,
    workingIn: 'Jamestown is Newport County, Rhode Island, all of Conanicut Island between the two bridges, and the same crews cover Newport and Narragansett on the way.',
    nearby: ['newport', 'narragansett', 'little-compton'],
  },
  {
    slug: 'little-compton', name: 'Little Compton', state: 'ri', county: 'Newport', coastal: true,
    workingIn: 'Little Compton is Newport County, Rhode Island, the far corner past Tiverton on Sakonnet Point, and we reach it on the same run as Newport.',
    nearby: ['newport', 'jamestown', 'barrington'],
  },
  {
    slug: 'narragansett', name: 'Narragansett', state: 'ri', county: 'Washington', coastal: true,
    workingIn: 'Narragansett is Washington County, Rhode Island, the open shore from the Towers down to Point Judith, on the same run as Jamestown and Westerly.',
    nearby: ['jamestown', 'westerly', 'newport'],
  },
  {
    slug: 'westerly', name: 'Westerly', state: 'ri', county: 'Washington', coastal: true,
    workingIn: 'Westerly is Washington County, Rhode Island, at the Connecticut line, and Watch Hill sits on its own point at the end of it — the same trip covers Narragansett and Stonington.',
    nearby: ['narragansett', 'stonington', 'newport'],
  },
  {
    slug: 'barrington', name: 'Barrington', state: 'ri', county: 'Bristol', coastal: true,
    workingIn: 'Barrington is Bristol County, Rhode Island, on the bay between Providence and Bristol, and the same crews carry on to Newport.',
    nearby: ['newport', 'little-compton', 'jamestown'],
  },
  {
    slug: 'new-castle', name: 'New Castle', state: 'nh', county: 'Rockingham', coastal: true,
    workingIn: 'New Castle is Rockingham County, New Hampshire, an island town reached by the bridges out of Portsmouth, and we run it on the same trip as Rye.',
    nearby: ['portsmouth', 'rye', 'kittery'],
  },
  {
    slug: 'rye', name: 'Rye', state: 'nh', county: 'Rockingham', coastal: true,
    workingIn: 'Rye is Rockingham County, New Hampshire, the open Atlantic shore below Portsmouth, and the same crews cover New Castle and Hampton.',
    nearby: ['new-castle', 'portsmouth', 'hampton'],
  },
  {
    slug: 'portsmouth', name: 'Portsmouth', state: 'nh', county: 'Rockingham', coastal: true,
    workingIn: 'Portsmouth is Rockingham County, New Hampshire, on the Piscataqua across from Kittery, and the same run takes in New Castle and Rye.',
    nearby: ['new-castle', 'rye', 'kittery'],
  },
  {
    slug: 'hampton', name: 'Hampton', state: 'nh', county: 'Rockingham', coastal: true,
    workingIn: 'Hampton is Rockingham County, New Hampshire, on the open shore above Salisbury, and our crews reach it on the same run as Rye.',
    nearby: ['rye', 'new-castle', 'salisbury'],
  },
  {
    slug: 'kittery', name: 'Kittery', state: 'me', county: 'York', coastal: true,
    workingIn: 'Kittery is York County, Maine, the first town over the Piscataqua from Portsmouth, and Kittery Point runs out along the water from there.',
    nearby: ['york', 'portsmouth', 'ogunquit'],
  },
  {
    slug: 'york', name: 'York', state: 'me', county: 'York', coastal: true,
    workingIn: 'York is York County, Maine — York Harbor and the Nubble on the open shore above Kittery, on the same run as Ogunquit.',
    nearby: ['kittery', 'ogunquit', 'kennebunkport'],
  },
  {
    slug: 'ogunquit', name: 'Ogunquit', state: 'me', county: 'York', coastal: true,
    workingIn: 'Ogunquit is York County, Maine, between York and Wells with the Marginal Way along the water, and we run it alongside Kennebunkport.',
    nearby: ['york', 'kennebunkport', 'kittery'],
  },
  {
    slug: 'kennebunkport', name: 'Kennebunkport', state: 'me', county: 'York', coastal: true,
    workingIn: 'Kennebunkport is York County, Maine, out along Ocean Avenue to Cape Arundel, and the same trip covers Ogunquit and York.',
    nearby: ['ogunquit', 'york', 'cape-elizabeth'],
  },
  {
    slug: 'cape-elizabeth', name: 'Cape Elizabeth', state: 'me', county: 'Cumberland', coastal: true,
    workingIn: 'Cape Elizabeth is Cumberland County, Maine, the open shore below Portland from Two Lights out to Kettle Cove.',
    nearby: ['kennebunkport', 'ogunquit', 'york'],
  },
  {
    slug: 'stonington', name: 'Stonington', state: 'ct', county: 'Southeastern Connecticut', coastal: true,
    workingIn: 'Stonington sits in the Southeastern Connecticut planning region at the Rhode Island line — Connecticut replaced its county governments with planning regions, so that is the unit that now means anything here. Stonington Borough runs out on its own point, and we reach it on the same trip as Westerly.',
    nearby: ['westerly', 'old-lyme', 'narragansett'],
  },
  {
    slug: 'old-lyme', name: 'Old Lyme', state: 'ct', county: 'Lower Connecticut River Valley', coastal: true,
    workingIn: 'Old Lyme is in the Lower Connecticut River Valley planning region at the mouth of the river, and the same run takes in Old Saybrook across the water and Stonington to the east.',
    nearby: ['old-saybrook', 'stonington', 'madison'],
  },
  {
    slug: 'old-saybrook', name: 'Old Saybrook', state: 'ct', county: 'Lower Connecticut River Valley', coastal: true,
    workingIn: 'Old Saybrook is in the Lower Connecticut River Valley planning region where the river meets the Sound, with Fenwick out on its own point, on the same run as Old Lyme.',
    nearby: ['old-lyme', 'madison', 'guilford'],
  },
  {
    slug: 'madison', name: 'Madison', state: 'ct', county: 'South Central Connecticut', coastal: true,
    workingIn: 'Madison is in the South Central Connecticut planning region on the Sound between Guilford and Clinton, and we run it alongside Guilford and Old Saybrook.',
    nearby: ['guilford', 'old-saybrook', 'old-lyme'],
  },
  {
    slug: 'guilford', name: 'Guilford', state: 'ct', county: 'South Central Connecticut', coastal: true,
    workingIn: 'Guilford is in the South Central Connecticut planning region on the Sound next to Madison and Branford, on the same trip as Madison and Old Saybrook.',
    nearby: ['madison', 'old-saybrook', 'old-lyme'],
  },
  {
    slug: 'salisbury', name: 'Salisbury', county: 'Essex', coastal: true,
    workingIn: 'Salisbury is Essex County at the New Hampshire line, north of the Merrimack from Newburyport, and the same run covers Newbury on the way down.',
    nearby: ['newburyport', 'newbury', 'rockport'],
  },
  {
    slug: 'newburyport', name: 'Newburyport', county: 'Essex', coastal: true,
    workingIn: 'Newburyport is Essex County at the mouth of the Merrimack, between Salisbury and Newbury, on the same run as Rockport and Gloucester.',
    nearby: ['salisbury', 'newbury', 'gloucester'],
  },
  {
    slug: 'newbury', name: 'Newbury', county: 'Essex', coastal: true,
    workingIn: 'Newbury is Essex County along the Plum Island shore, next to Newburyport and Rowley, on the same run as Salisbury.',
    nearby: ['newburyport', 'salisbury', 'rockport'],
  },
  {
    slug: 'rockport', name: 'Rockport', county: 'Essex', coastal: true,
    workingIn: 'Rockport is Essex County at the tip of Cape Ann, bordered on land only by Gloucester, and our crews reach it on the same run as Manchester-by-the-Sea.',
    nearby: ['gloucester', 'manchester-by-the-sea', 'newburyport'],
  },
  {
    slug: 'gloucester', name: 'Gloucester', county: 'Essex', coastal: true,
    workingIn: 'Gloucester is Essex County on Cape Ann, between Rockport and Manchester-by-the-Sea, and the same trucks carry on to Marblehead.',
    nearby: ['rockport', 'manchester-by-the-sea', 'marblehead'],
  },
  {
    slug: 'manchester-by-the-sea', name: 'Manchester-by-the-Sea', county: 'Essex', coastal: true,
    workingIn: 'Manchester-by-the-Sea is Essex County between Gloucester and Beverly, on the same coastal run as Rockport and Marblehead.',
    nearby: ['gloucester', 'rockport', 'marblehead'],
  },
  {
    slug: 'marblehead', name: 'Marblehead', county: 'Essex', coastal: true,
    workingIn: 'Marblehead is Essex County on its own neck between Salem and Swampscott, on the same run as Nahant and Gloucester.',
    nearby: ['nahant', 'gloucester', 'manchester-by-the-sea'],
  },
  {
    slug: 'nahant', name: 'Nahant', county: 'Essex', coastal: true,
    workingIn: 'Nahant is Essex County, a peninsula reached by the causeway out of Lynn, and our crews cover it on the same run as Marblehead and Winthrop.',
    nearby: ['marblehead', 'winthrop', 'gloucester'],
  },
  {
    slug: 'winthrop', name: 'Winthrop', county: 'Suffolk', coastal: true,
    workingIn: 'Winthrop is Suffolk County, a peninsula with Boston Harbor on one side and the open Atlantic on the other, next to Revere — the same trucks reach Nahant and Hull.',
    nearby: ['nahant', 'hull', 'marblehead'],
  },
  {
    slug: 'hull', name: 'Hull', county: 'Plymouth', coastal: true,
    workingIn: 'Hull is Plymouth County, the long peninsula off Hingham that ends at Pemberton Point, on the same run as Cohasset and Scituate.',
    nearby: ['hingham', 'cohasset', 'scituate'],
  },
  {
    slug: 'hingham', name: 'Hingham', county: 'Plymouth', coastal: true,
    workingIn: 'Hingham is Plymouth County at the head of its own harbor, between Hull and Cohasset, and the same crews carry on to Scituate.',
    nearby: ['hull', 'cohasset', 'scituate'],
  },
  {
    slug: 'cohasset', name: 'Cohasset', county: 'Norfolk', coastal: true,
    workingIn: 'Cohasset is Norfolk County on the open shore between Hingham and Scituate, and the same crews run Hull and Marshfield.',
    nearby: ['scituate', 'hingham', 'hull'],
  },
  {
    slug: 'scituate', name: 'Scituate', county: 'Plymouth', coastal: true,
    workingIn: 'Scituate is Plymouth County between Cohasset and Marshfield, and the harbor, the Glades and Peggotty Beach are all on the same run.',
    nearby: ['cohasset', 'marshfield', 'duxbury'],
  },
  {
    slug: 'marshfield', name: 'Marshfield', county: 'Plymouth', coastal: true,
    workingIn: 'Marshfield is Plymouth County between Scituate and Duxbury, and the same crews cover Green Harbor and Brant Rock on the way through.',
    nearby: ['scituate', 'duxbury', 'cohasset'],
  },
  {
    slug: 'duxbury', name: 'Duxbury', county: 'Plymouth', coastal: true,
    workingIn: 'Duxbury is Plymouth County behind its own barrier beach, between Marshfield and Kingston, on the same run as Plymouth.',
    nearby: ['marshfield', 'plymouth', 'scituate'],
  },
  {
    slug: 'plymouth', name: 'Plymouth', county: 'Plymouth', coastal: true,
    workingIn: 'Plymouth is Plymouth County and the largest town in Massachusetts by land area, running from Kingston Bay down the shore to the canal at Bourne.',
    nearby: ['duxbury', 'marshfield', 'bourne'],
  },
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
    slug: 'chatham', name: 'Chatham', county: 'Barnstable', coastal: true,
    workingIn: 'Chatham is Barnstable County, out on the elbow of the Cape near Harwich and Orleans — Cape work runs on its own seasonal schedule, alongside Falmouth, Dennis and Bourne.',
    nearby: ['dennis', 'falmouth', 'bourne'],
  },
  {
    slug: 'falmouth', name: 'Falmouth', county: 'Barnstable', coastal: true,
    workingIn: 'Falmouth is Barnstable County next to Bourne and Mashpee — Cape work runs on its own seasonal schedule, alongside Dennis, Chatham and Bourne.',
    nearby: ['bourne', 'dennis', 'chatham'],
  },
  {
    slug: 'dennis', name: 'Dennis', county: 'Barnstable', coastal: true,
    workingIn: 'Dennis is Barnstable County on Route 6A, between Yarmouth and Harwich — Cape work runs on its own seasonal schedule, alongside Falmouth, Chatham and Bourne.',
    nearby: ['chatham', 'falmouth', 'bourne'],
  },
  {
    slug: 'bourne', name: 'Bourne', county: 'Barnstable', coastal: true,
    workingIn: 'Bourne sits at the canal, Barnstable County, the first stop over the bridge — Cape work runs on its own seasonal schedule, alongside Falmouth, Dennis and Chatham.',
    nearby: ['falmouth', 'dennis', 'chatham'],
  },
];

/**
 * The towns the bench holds that this list did not cover.
 *
 * Appended rather than merged in: the entries above are hand-written and stay
 * that way, and the generated file is rebuilt from the bench by
 * build-town-gap-data.js. An entry worth writing by hand gets moved up into the
 * list above and deleted from the data file, which is why the append is one-way.
 *
 * Optional. Without the file this script does exactly what it did before.
 */
try {
  const gap = require('./town-gap-data.js');
  const have = new Set(TOWNS.map((t) => `${t.slug}-${(t.state || 'ma').toLowerCase()}`));
  for (const t of gap) {
    // A hand-written entry always wins. Two entries for one directory would
    // mean the second silently overwrites the first at write time.
    if (have.has(`${t.slug}-${(t.state || 'ma').toLowerCase()}`)) continue;
    TOWNS.push(t);
  }
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
}

const NAV_BODY = fs.readFileSync(path.join(__dirname, '_town-template-nav.html'), 'utf8');
const STYLE_BLOCK = fs.readFileSync(path.join(__dirname, '_town-template-style.css'), 'utf8');
const SCRIPT_BLOCK = fs.readFileSync(path.join(__dirname, '_town-template-script.js'), 'utf8');

function render(town, heroImage) {
  const st = (town.state || 'ma').toLowerCase();
  const stateName = STATE_NAMES[st];
  const desc = `Patios, walkways, retaining walls, steps and drainage in ${town.name}, ${stateName}. Built to New England frost depth by our own crews. Free on-site estimate, and a price online in about thirty seconds.`;
  const title = `Masonry &amp; Hardscape Contractor in ${town.name}, ${st.toUpperCase()} | PHAÖRA`;
  const url = `https://phaora.com/masonry-${town.slug}-${st}/`;

  // Every one of these states adopts the IRC, so Table R301.2(1) is accurate
  // everywhere — the STATE's name on the code is not. Naming the Massachusetts
  // Residential Code on a Maine page would be a straightforwardly false claim
  // about which rulebook applies.
  const codeName = st === 'ma' ? 'the Massachusetts Residential Code' : 'the residential code';

  // Connecticut abolished county government; Census returns PLANNING REGIONS
  // in their place. Appending " County" to "Southeastern Connecticut" names a
  // unit of government that does not exist, on a published page.
  const regionLabel = st === 'ct' ? `${town.county} Planning Region` : `${town.county} County`;
  const frostParagraph = town.coastal
    ? `Frost depth here is set by the town, not the state — Table R301.2(1) of ${codeName} is filled in by each building department, and coastal towns commonly run shallower than inland ones. We build to the depth your building department gives, and we ask before we dig.`
    : `Frost depth here is set by the town, not the state — Table R301.2(1) of ${codeName} is filled in by each building department. Inland it is commonly 42 to 48 inches; nearer the coast it is often less. We build to the depth your building department gives, and we ask before we dig.`;

  // The neighbour's own state, not this page's — Salisbury MA links to
  // Newburyport MA, but Kittery ME links to Portsmouth NH across the river.
  // A neighbour may be written 'slug' or 'slug|state'. The second form exists
  // because slugs are not unique across states — there is a Portsmouth in New
  // Hampshire and a Portsmouth in Rhode Island, and matching on slug alone sends
  // every link to whichever one was declared first.
  const nearbyLinks = town.nearby
    .map((entry) => {
      const [slug, want] = String(entry).split('|');
      const n =
        TOWNS.find((x) => x.slug === slug && (!want || (x.state || 'ma') === want)) ||
        TOWNS.find((x) => x.slug === slug);
      const nst = (want || (n && n.state) || 'ma').toLowerCase();
      // Thirteen town directories predate this generator and have no TOWNS
      // entry, so the name has to come back out of the slug. Printing the slug
      // raw puts a lowercase 'newton' in the middle of a sentence.
      const label = n
        ? n.name
        : slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `      <a href="/masonry-${slug}-${nst}/">${label}</a>`;
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
<meta property="og:image:alt" content="Masonry and hardscape in ${town.name}, ${stateName} by PHAÖRA">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${FALLBACK_OG_IMAGE}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"GeneralContractor","name":"PHAÖRA","legalName":"SKYINCH CAPITAL LLC","url":"${url}","telephone":"+1-561-299-1261","email":"phaoraco@gmail.com","description":"${desc}","areaServed":[{"@type":"City","name":"${town.name}, ${stateName}"}]}</script>
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
    <p class="eyebrow">${town.name}, ${stateName} &nbsp;·&nbsp; ${regionLabel}</p>
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


/**
 * The sitemap, rewritten from TOWNS rather than edited by hand.
 *
 * It had drifted badly: thirteen town URLs listed against thirty-six pages on
 * disk, so twenty-three pages existed and no search engine was told. Hand
 * editing is what caused that — every page generated since the last time
 * somebody remembered has been invisible. Now the generator owns its own
 * entries and the drift cannot come back.
 *
 * Only the masonry-*-ma block is touched. Every other URL in the file is left
 * exactly as it is.
 */
function rewriteSitemap() {
  const file = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(file)) {
    console.log('no sitemap.xml — skipped');
    return;
  }
  const xml = fs.readFileSync(file, 'utf8');
  const lines = xml.split('\n');
  const isTown = (line) => /<loc>https:\/\/phaora\.com\/masonry-[a-z-]+-(ma|ri|nh|me|ct)\//.test(line);

  const firstTown = lines.findIndex(isTown);
  if (firstTown === -1) {
    console.log('sitemap has no town block — left alone');
    return;
  }
  const kept = lines.filter((line) => !isTown(line));
  // Every town page ON DISK, not just the generated ones. Thirteen of these
  // pages are hand-built and are not in TOWNS — driving the sitemap from TOWNS
  // alone dropped all thirteen the first time this ran.
  const slugs = fs
    .readdirSync(ROOT)
    .filter((name) => /^masonry-[a-z-]+-(ma|ri|nh|me|ct)$/.test(name))
    .filter((name) => fs.existsSync(path.join(ROOT, name, 'index.html')))
    .sort();

  const entries = slugs.map(
    (dir) =>
      `  <url><loc>https://phaora.com/${dir}/</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`
  );

  // Re-insert where the town block used to start, counting only kept lines.
  const before = lines.slice(0, firstTown).filter((line) => !isTown(line)).length;
  const out = [...kept.slice(0, before), ...entries, ...kept.slice(before)];
  fs.writeFileSync(file, out.join('\n'));
  console.log(`sitemap.xml: ${entries.length} town URLs (was ${lines.filter(isTown).length})`);
}

let written = 0;
TOWNS.forEach((town, i) => {
  const dir = path.join(ROOT, `masonry-${town.slug}-${(town.state || 'ma').toLowerCase()}`);
  fs.mkdirSync(dir, { recursive: true });
  const html = render(town, HERO_IMAGES[i % HERO_IMAGES.length]);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`wrote masonry-${town.slug}-${(town.state || 'ma').toLowerCase()}/index.html`);
  written++;
});
console.log(`\n${written} town page(s) generated.`);
rewriteSitemap();
