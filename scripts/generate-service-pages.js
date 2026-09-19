/**
 * Service landing pages — the ones paid search lands on.
 *
 * WHY THESE EXIST SEPARATELY FROM THE TOWN PAGES. The 56 town pages are built
 * around geography and they earn organic traffic: somebody searching "masonry
 * Scituate" is telling you where they are. Paid search is the other axis —
 * somebody typing "paver driveway cost" is telling you WHAT THEY WANT and has
 * said nothing about where they are. Landing that click on a page headed
 * "Masonry and hardscape in Duxbury" makes them work out whether you do
 * driveways at all, and most of them do not bother.
 *
 * One page per thing a person actually types. The headline repeats their search
 * back to them, the body proves the work is understood, and the only action is
 * the estimator.
 *
 * NOTHING HERE IS INVENTED. Every claim on these pages already appears on the
 * live site — the one-year workmanship warranty, our own crews, the free site
 * visit, the estimator that prices from a satellite trace or a photograph. The
 * rest is method, which is knowledge rather than assertion: it can be checked
 * by anyone in the trade and it is what separates these pages from the
 * interchangeable ones they compete with. No prices, no job counts, no years in
 * business, no credentials.
 *
 * Shares the nav, stylesheet and script with the town pages by reading the same
 * three partials, so the pages cannot drift apart visually.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://phaora.com';
const FALLBACK_OG_IMAGE = 'https://phaora.com/assets/og/phaora-share.jpg';

const NAV_BODY = fs.readFileSync(path.join(__dirname, '_town-template-nav.html'), 'utf8');
const STYLE_BLOCK = fs.readFileSync(path.join(__dirname, '_town-template-style.css'), 'utf8');
const SCRIPT_BLOCK = fs.readFileSync(path.join(__dirname, '_town-template-script.js'), 'utf8');

const HERO_IMAGES = [
  '/hs/hardscape-gallery-paver-closeup.jpg',
  '/hs/hardscape-gallery-retaining-wall.jpg',
  '/hs/hardscape-gallery-elevated-patio.jpg',
  '/hs/hardscape-gallery-pool-steps.jpg',
  '/hs/hardscape-gallery-stone-detail.jpg',
  '/hs/hardscape-gallery-fire-pit.jpg',
  '/hs/hardscape-gallery-pool-featured.jpg',
];

/**
 * One entry per search a person actually performs.
 *
 * `h1` echoes the query rather than describing the company. `lede` answers the
 * only question they have in the first two seconds. `detail` is where the work
 * is proved — specific enough that somebody who has had this job done badly
 * recognises what went wrong.
 */
const SERVICES = [
  {
    slug: 'paver-driveways',
    nav: 'Paver driveways',
    h1: 'Paver driveways',
    title: 'Paver Driveways | New England | PHAÖRA',
    desc: 'Paver and cobblestone driveways across MA, RI, CT, NH and ME. Built on a base sized for vehicle load and New England frost. Instant estimate.',
    lede: 'Concrete paver, clay brick and cobblestone, on a base built for the weight that drives over it.',
    detail: [
      ['The base is the driveway', 'A patio base under a driveway is why the ruts appear. Vehicle load is concentrated and repeated in the same two tracks, so the compacted depth goes deeper than a walk or a terrace needs, in lifts, each one compacted before the next goes on. What shows on the surface in year three was decided before a single paver was set.'],
      ['Edge restraint is what holds the line', 'A paver field pushes outward every time a tyre turns on it. Without a restraint spiked into the base, the border walks, the joints open, and sand migrates out of them. It is the cheapest part of the job and the one whose absence you see first.'],
      ['Joint sand, and why it matters here', 'Polymeric sand locks the field together and keeps water from washing through the joints into the base. In a freeze-thaw climate a field with open joints takes water in, lifts, and never sits flat again.'],
      ['Pitch, and where the water is going', 'A driveway sheds toward somewhere on purpose, and that somewhere is not the garage slab or the neighbour. Pitch is set at the base, not corrected at the surface.'],
    ],
    related: ['drainage', 'walkways-and-steps'],
  },
  {
    slug: 'retaining-walls',
    nav: 'Retaining walls',
    h1: 'Retaining walls',
    title: 'Retaining Walls | New England | PHAÖRA',
    desc: 'Segmental block and natural stone retaining walls across MA, RI, CT, NH and ME. Drained behind, footed below frost. Instant estimate.',
    lede: 'Block and natural stone, drained behind and footed below the frost line.',
    detail: [
      ['A wall holds back water before it holds back soil', 'Saturated soil expands about nine percent when it freezes, and it expands against whatever will not move. That is the wall. Clean stone behind it, separated from the soil by fabric, and a pipe running out to daylight — so there is nothing back there to freeze.'],
      ['Below the frost line, or it lifts', 'A footing poured above frost depth rises with the ground every winter and settles differently every spring. The crack usually appears in the third year, which is long enough that nobody connects it to the footing.'],
      ['Batter, and why a wall leans back', 'A wall built plumb is already leaning forward as far as it will ever be allowed to. Set back into the hill, each course behind the one below, so the soil load pushes it into itself rather than away.'],
      ['Geogrid where the height needs it', 'Past a certain height a wall stops being a wall and becomes a reinforced soil mass — layers of grid tied into the fill behind. Height, slope and what sits above it decide where that line falls, and it is worth being told before the block is chosen.'],
    ],
    related: ['drainage', 'seawalls-and-shore-protection'],
  },
  {
    slug: 'patios',
    nav: 'Patios',
    h1: 'Patios',
    title: 'Patios | Paver, Bluestone and Flagstone | PHAÖRA',
    desc: 'Paver, bluestone, flagstone and brick patios across MA, RI, CT, NH and ME. Built on a base for ground that freezes. Instant estimate.',
    lede: 'Concrete paver, bluestone, flagstone or brick, set on a base built for the ground it sits in.',
    detail: [
      ['Every course copies the first one', 'A base that was levelled rather than built transfers every low spot it has straight up through the field. It cannot be corrected later from the top — the stone comes up and the base gets rebuilt, which is the same money twice.'],
      ['Pitch you cannot see and water can', 'A terrace sheds away from the house at a fall slight enough that nobody notices while standing on it. Flat reads as correct and holds water at the door.'],
      ['Sitting stone and set stone', 'Flagstone laid on sand moves seasonally; the same stone on a compacted base with a proper setting bed does not. Which one is appropriate depends on the stone, the traffic and the exposure, and it is a decision worth making out loud.'],
      ['The edge is a detail, not an afterthought', 'A soldier course, a cut edge or a stone border finishes a field and holds it. An unrestrained edge is where a patio starts coming apart.'],
    ],
    related: ['walkways-and-steps', 'drainage'],
  },
  {
    slug: 'walkways-and-steps',
    nav: 'Walkways and steps',
    h1: 'Walkways and steps',
    title: 'Walkways and Steps | Granite and Bluestone | PHAÖRA',
    desc: 'Front walks, garden paths, granite and bluestone steps across MA, RI, CT, NH and ME. Even risers, solid treads. Instant estimate.',
    lede: 'The run people use every day, and the one they notice the moment it moves.',
    detail: [
      ['Risers that match, tread to tread', 'People climb steps without looking at them. A riser that differs from the one below by even a small amount is what catches a toe, and it is the single most common defect in residential stonework.'],
      ['Set solid, pitched to shed', 'A granite tread that rocks was bedded badly. A tread that holds water ices over, and a front walk is where that matters most.'],
      ['Old steps and the knees that use them', 'A pre-war house often has granite steps that were fine at forty-five and are a fall risk at eighty — worn noses, a pitched walk, no landing at the door. Rebuilding that run is a different job from replacing it, and usually a smaller one.'],
      ['The landing at the top', 'A door needs somewhere to stand before it opens. A step straight onto a threshold is the arrangement people fall from while holding something.'],
    ],
    related: ['patios', 'paver-driveways'],
  },
  {
    slug: 'stone-veneer',
    nav: 'Stone veneer',
    h1: 'Stone veneer',
    title: 'Stone Veneer | Foundations, Columns, Chimneys | PHAÖRA',
    desc: 'Natural and manufactured stone veneer on foundations, columns, chimneys and facades across MA, RI, CT, NH and ME. Instant estimate.',
    lede: 'Foundations, columns, chimneys and facades, in natural and manufactured stone.',
    detail: [
      ['A drainage plane behind the stone', 'Veneer is not waterproof and is not meant to be. Water gets behind it, and what happens next is decided by whether there is a way out — weather-resistant barrier, a drainage gap, flashing and weeps at the bottom. Veneer laid tight to sheathing traps it.'],
      ['Joints tooled, not struck flush', 'A tooled joint sheds water off the face. A flush joint holds it against the stone, and held water is what freezes and spalls the face off.'],
      ['Ledge, lath and what carries the weight', 'Stone is heavy and something has to hold it. A supporting ledge, or lath and scratch coat specified for the weight, decided before the first stone goes up rather than discovered when the bottom course starts to sag.'],
      ['Pattern, and where the joints land', 'Coursing, corners and the way stones are sorted for size is the difference between stonework and stone stuck to a wall. It is laid out dry before it is set.'],
    ],
    related: ['retaining-walls', 'patios'],
  },
  {
    slug: 'drainage',
    nav: 'Drainage and regrading',
    h1: 'Drainage and regrading',
    title: 'Yard Drainage and Regrading | PHAÖRA',
    desc: 'French drains, swales, regrading and dry wells across MA, RI, CT, NH and ME. The reason the rest of it is still straight in twenty years.',
    lede: 'The part nobody sees, and the reason the rest of it is still straight in twenty years.',
    detail: [
      ['Where is the water coming from, and where is it going', 'A wet yard is a route, not a puddle. The fix starts by working out what is feeding it — roof, driveway, the neighbour, the water table — because a drain installed at the low spot without answering that just moves the problem a few feet.'],
      ['Ground that holds water, by survey', 'Some ground drains and some does not, and it is mapped. Poorly drained soil holds water under a base course, freezes, lifts, and cracks the surface from below. It is why two identical driveways on the same street fail ten years apart, and it is knowable before anything is built.'],
      ['Grade away from the building', 'Most wet basements are a grading problem dressed as a waterproofing problem. Soil settles against a foundation over decades until it pitches back toward the house.'],
      ['Out to daylight, or to something that can take it', 'A pipe that ends in the ground is a pipe that backs up. It runs out to daylight where the grade allows, and to a dry well sized for the catchment where it does not.'],
    ],
    related: ['retaining-walls', 'paver-driveways'],
  },
  {
    slug: 'seawalls-and-shore-protection',
    nav: 'Seawalls and shore protection',
    h1: 'Seawalls and shore protection',
    title: 'Seawall Repair and Shore Protection | New England Coast | PHAÖRA',
    desc: 'Seawall, revetment, bulkhead and riprap repair on the New England coast — MA, RI, CT, NH and ME. Instant estimate.',
    lede: 'Seawalls, revetments, bulkheads and riprap, on ground that takes breaking water.',
    detail: [
      ['The water takes the ground out from under it first', 'A coastal wall rarely fails at the face. It fails when water pulls the material out from behind and below it, and the face comes after. What you can see from the lawn is the last part to go.'],
      ['Toe protection, because that is where it starts', 'Scour at the base undermines everything above. Armour sized for the energy that actually arrives at that spot, set into the bed rather than laid on it.'],
      ['Backfill that drains, and a wall that lets it', 'Water that gets behind a seawall has to get out, or it pushes. Weeps, filter fabric and graded stone behind the face — a solid wall with nowhere to relieve pressure is a wall loading itself every tide.'],
      ['Permitting is part of the work here', 'Building below the historic high water line is licensed work, and in Massachusetts that means Chapter 91 and an Order of Conditions from the Conservation Commission before anything is built. Knowing which approvals a wall needs, and roughly how long they take, is part of quoting it honestly.'],
    ],
    related: ['retaining-walls', 'drainage'],
  },
];

/** The five reasons, shared with the town pages because they are the same five. */
const FAILURES = [
  ['A base that was built, not just levelled', 'Compacted gravel, deep enough for the ground it sits in. Every course above copies the first one, and so does every mistake in it.'],
  ['Below the frost line', 'New England ground moves in winter. A footing poured above the frost line lifts with it, and the wall on top of it cracks — not that winter, usually the third one.'],
  ['Somewhere for the water to go', 'Saturated soil expands about nine percent when it freezes, against something that cannot move. Clean stone, fabric, and a pipe run out to daylight.'],
  ['Joints shaped, not just filled', 'A tooled joint sheds water off the face of the stone. A joint struck flush holds it there, and held water is what freezes.'],
  ['A cap that sheds', 'The top takes the weather and everything anyone sets on it. Pitched away, set solid, joints tight.'],
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function render(service, heroImage) {
  const url = `${SITE}/${service.slug}/`;
  const detail = service.detail
    .map(([h, p]) => `      <div class="tp-cell"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`)
    .join('\n');
  const failures = FAILURES.map(
    ([h, p]) => `      <li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`
  ).join('\n');
  const others = SERVICES.filter((s) => s.slug !== service.slug)
    .map((s) => `      <a href="/${s.slug}/">${esc(s.nav)}</a>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(service.title)}</title>
<meta name="description" content="${esc(service.desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(service.title)}">
<meta property="og:description" content="${esc(service.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${FALLBACK_OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(service.h1)} by PHAÖRA">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(service.title)}">
<meta name="twitter:description" content="${esc(service.desc)}">
<meta name="twitter:image" content="${FALLBACK_OG_IMAGE}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Service","serviceType":"${esc(service.h1)}","provider":{"@type":"GeneralContractor","name":"PHAÖRA","legalName":"SKYINCH CAPITAL LLC","url":"${SITE}/","telephone":"+1-561-299-1261","email":"phaoraco@gmail.com"},"areaServed":[{"@type":"State","name":"Massachusetts"},{"@type":"State","name":"Rhode Island"},{"@type":"State","name":"Connecticut"},{"@type":"State","name":"New Hampshire"},{"@type":"State","name":"Maine"}],"url":"${url}","description":"${esc(service.desc)}"}</script>
<script src="/tag.js"></script>
<style>
${STYLE_BLOCK}
</style>
</head>
<body>

${NAV_BODY}

<header class="tp-hero" style="background-image:url('${heroImage}')">
  <div class="veil"></div>
  <div class="tp-wrap">
    <p class="eyebrow">Massachusetts &nbsp;·&nbsp; Rhode Island &nbsp;·&nbsp; Connecticut &nbsp;·&nbsp; New Hampshire &nbsp;·&nbsp; Maine</p>
    <h1>${esc(service.h1)}.</h1>
    <p class="tp-lede">${esc(service.lede)}</p>
    <a class="tp-cta" href="/estimate/">Price your project &rarr;</a>
  </div>
</header>

<div class="tp-wrap">

  <section class="tp-sec">
    <h2 class="tp-h2">What decides whether it lasts</h2>
    <div class="tp-grid">
${detail}
    </div>
  </section>

  <section class="tp-sec">
    <h2 class="tp-h2">The five things every failure comes back to</h2>
    <p class="tp-p">Every wall and patio we have taken apart failed for one of these five reasons.
      They are most of what separates a job that looks right at twenty years from one that does
      not make five.</p>
    <ol class="tp-num">
${failures}
    </ol>
  </section>

  <section class="tp-sec">
    <div class="tp-assure">
      <div><h3>One-year workmanship warranty</h3><p>If something we built moves, cracks or fails in the first year because of how it was built, we come back and fix it. No argument, no invoice.</p></div>
    </div>
  </section>

  <section class="tp-ask">
    <h2>A number before anyone visits.</h2>
    <p class="tp-p">Trace the job on a satellite view of your own property, or send a photograph,
      and the page prices it. The on-site visit is free and it is what makes it exact.</p>
    <p style="margin:20px 0 0"><a class="tp-cta" href="/estimate/">Price it now &rarr;</a></p>
  </section>

  <div class="tp-near">
    <p class="lbl">We also build</p>
    <div class="row">
${others}
    </div>
  </div>

</div>

<script>
${SCRIPT_BLOCK}
</script>
</body>
</html>
`;
}

/**
 * Add the service block to the sitemap without disturbing the town block.
 *
 * Driven by what is ON DISK rather than by SERVICES, for the same reason the
 * town rewriter is: a page that was hand-built and is not in this file would
 * otherwise be dropped from the sitemap every time this runs.
 */
function rewriteSitemap() {
  const file = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(file)) {
    console.log('no sitemap.xml — skipped');
    return;
  }
  const slugs = SERVICES.map((s) => s.slug)
    .filter((slug) => fs.existsSync(path.join(ROOT, slug, 'index.html')))
    .sort();

  const isService = (line) =>
    slugs.some((slug) => line.includes(`<loc>${SITE}/${slug}/</loc>`));

  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const kept = lines.filter((line) => !isService(line));
  const entries = slugs.map(
    (slug) =>
      `  <url><loc>${SITE}/${slug}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  );

  // Ahead of the town block: these are the pages paid traffic lands on.
  const firstTown = kept.findIndex((line) =>
    /<loc>https:\/\/phaora\.com\/masonry-[a-z-]+-(ma|ri|nh|me|ct)\//.test(line)
  );
  const at = firstTown === -1 ? kept.findIndex((l) => l.includes('</urlset>')) : firstTown;
  if (at === -1) {
    console.log('sitemap has no insertion point — left alone');
    return;
  }
  const out = [...kept.slice(0, at), ...entries, ...kept.slice(at)];
  fs.writeFileSync(file, out.join('\n'));
  console.log(`sitemap.xml: ${entries.length} service URLs`);
}

let written = 0;
SERVICES.forEach((service, i) => {
  const dir = path.join(ROOT, service.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(service, HERO_IMAGES[i % HERO_IMAGES.length]));
  console.log(`wrote ${service.slug}/index.html`);
  written++;
});
console.log(`\n${written} service page(s) generated.`);
rewriteSitemap();
