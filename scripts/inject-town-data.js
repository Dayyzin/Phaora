#!/usr/bin/env node
/* ============================================================================
 * PHAÖRA — town figures onto every town page, and the index rebuilt
 *
 *   node scripts/inject-town-data.js           write
 *   node scripts/inject-town-data.js --check   report what would change, write nothing
 *
 * MONTHLY REFRESH
 *   1. Run scripts/town-data.sql against the database once per batch, 1 to 7
 *      (change only the number in `1 as batch`). It is read-only.
 *   2. Paste each batch's single result row into scripts/town-data.json under
 *      "batches", replacing last month's row for that batch, and set
 *      "computed_on" to the date the rows carry.
 *   3. Run this script. It rewrites the marked block in every town page, the
 *      marked JSON-LD in each page's <head>, and /hardscape-index/index.html.
 *   4. node scripts/check-town-pages.js
 *
 * Pages on disk carry edits made after they were generated, so nothing outside
 * the markers is touched: the body block sits right before "Working in <Town>"
 * between <!-- town-data:start --> and <!-- town-data:end -->, and the head
 * block right before </head> between the town-data-head markers. A second run
 * with the same JSON changes nothing.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { TOWNS } = require('./generate-town-pages.js');
const TD = require('./town-data-block.js');

const ROOT = path.join(__dirname, '..');
const CHECK = process.argv.includes('--check');

// Thirteen MetroWest pages were built by hand and have no TOWNS entry. All
// thirteen are inland towns, so none takes the seawalls link.
function pageFor(dir, html) {
  const [, slug, st] = /^masonry-([a-z-]+)-([a-z]{2})$/.exec(dir);
  const t = TOWNS.find((x) => x.slug === slug && (x.state || 'ma') === st);
  if (t) return { slug, st, name: t.name, county: t.county, coastal: Boolean(t.coastal) };
  const name = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const eyebrow = /<p class="eyebrow">[^<]*·&nbsp; ([^<]+?) County<\/p>/.exec(html);
  return { slug, st, name, county: eyebrow ? eyebrow[1] : null, coastal: false };
}

function write(file, next) {
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (prev === next) return false;
  if (!CHECK) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, next);
  }
  return true;
}

function main() {
  const dirs = fs.readdirSync(ROOT)
    .filter((d) => /^masonry-[a-z-]+-(ma|ri|nh|me|ct|tx|co|wy|in)$/.test(d))
    .filter((d) => fs.existsSync(path.join(ROOT, d, 'index.html')))
    .sort();

  let changed = 0;
  const shown = [];
  const skipped = [];
  for (const dir of dirs) {
    const file = path.join(ROOT, dir, 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    const page = pageFor(dir, html);
    const p = TD.plan(page);
    if (p.f.skip) skipped.push(`${dir}: ${p.f.skip}`);
    else shown.push(dir);
    if (write(file, TD.inject(html, page))) changed++;
  }

  const indexFile = path.join(ROOT, 'hardscape-index', 'index.html');
  const indexChanged = write(indexFile, TD.indexPage(new Set(dirs)));

  console.log(`${dirs.length} town pages · ${shown.length} with figures · ${skipped.length} services only`);
  for (const s of skipped) console.log(`  no figures  ${s}`);
  console.log(`${CHECK ? 'would change' : 'changed'}: ${changed} town page(s), index ${indexChanged ? 'yes' : 'no'}`);
}

main();
