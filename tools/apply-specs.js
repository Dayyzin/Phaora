#!/usr/bin/env node
/* ============================================================================
 * PHAÖRA — measured values into the catalog
 *
 *   node tools/apply-specs.js --template > specs.csv   write a sheet to fill
 *   node tools/apply-specs.js specs.csv --dry          show what would change
 *   node tools/apply-specs.js specs.csv                write catalog.json
 *
 * WHY
 * ---------------------------------------------------------------------------
 * All thirty-four pieces carry no material, no dimensions, no weight and no
 * finish, so build-shop.js prints none — by design, it refuses to guess. The
 * pieces are only all out on a table during a reshoot, and they will not be
 * again for a long time. A tape measure and a scale alongside the camera turns
 * thirty-four "on request" pages into pages that answer the question a buyer
 * actually asks, and this is the path from a sheet filled on a phone into the
 * catalog.
 *
 * Blank cells are left alone. A row can be filled in on day two and topped up
 * on day four; nothing is cleared by omission, so a half-filled sheet is safe
 * to apply. Only a value that parses is written — "about 14" is refused rather
 * than rounded, because a spec on a page for a five-figure object should be a
 * measurement and not a reading of someone's handwriting.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CATALOG = path.join(ROOT, 'assets/sculptures/catalog.json');
const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

/* csv column -> where it lands. The names match build-shop.js exactly. */
const COLS = [
  ['slug',        null,      'text'],
  ['name',        null,      'text'],   // reference only, never written
  ['material',    'p.base_material',              'text'],
  ['height_in',   's.total_height_inches',        'num'],
  ['width_in',    's.total_width_inches',         'num'],
  ['depth_in',    's.total_depth_inches',         'num'],
  ['wingspan_in', 'p.wingspan_inches',            'num'],
  ['weight_lb',   's.weight_lbs_total',           'num'],
  ['base_lb',     'p.base_size_lbs',              'num'],
  ['finish',      's.finish',                     'text'],
  ['price_usd',   'p.price_usd',                  'num'],
];

const argv = process.argv.slice(2);
if (argv.includes('--template')) {
  const head = COLS.map(c => c[0]).join(',');
  const rows = catalog.pieces.map(p =>
    [p.slug, '"' + p.name.replace(/"/g, '""') + '"'].concat(Array(COLS.length - 2).fill('')).join(','));
  console.log([head].concat(rows).join('\n'));
  process.exit(0);
}

const file = argv.find(a => !a.startsWith('--'));
const DRY = argv.includes('--dry');
if (!file) {
  console.error('usage: node tools/apply-specs.js --template > specs.csv');
  console.error('       node tools/apply-specs.js specs.csv [--dry]');
  process.exit(2);
}

/* A field-level CSV reader: quoted cells, doubled quotes, commas inside them.
   A finish reads "Hand-polished, unwaxed" often enough to matter. */
function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

const rows = parseCsv(fs.readFileSync(file, 'utf8'));
const header = rows.shift().map(h => h.trim().toLowerCase());
const idx = Object.fromEntries(header.map((h, i) => [h, i]));
if (idx.slug === undefined) { console.error('! no "slug" column'); process.exit(1); }

const bySlug = Object.fromEntries(catalog.pieces.map(p => [p.slug, p]));
const changes = [], refused = [], unknown = [];

for (const r of rows) {
  const slug = (r[idx.slug] || '').trim();
  if (!slug) continue;
  const piece = bySlug[slug];
  if (!piece) { unknown.push(slug); continue; }
  piece.specs = piece.specs || {};

  for (const [col, target, kind] of COLS) {
    if (!target) continue;
    const raw = (r[idx[col]] !== undefined ? r[idx[col]] : '').trim();
    if (raw === '') continue;                       // blank never clears

    let value;
    if (kind === 'num') {
      /* Accept 14, 14.5, "14.5 in", 1,250 — refuse anything vaguer. */
      const m = raw.replace(/,/g, '').match(/^\$?\s*(\d+(?:\.\d+)?)\s*(?:in|inch|inches|"|lb|lbs|pounds|usd|\$)?$/i);
      if (!m) { refused.push(`${slug} ${col}="${raw}"`); continue; }
      value = parseFloat(m[1]);
    } else {
      value = raw;
    }

    const [scope, key] = target.split('.');
    const bag = scope === 's' ? piece.specs : piece;
    if (bag[key] === value) continue;
    changes.push(`${slug.padEnd(18)} ${col.padEnd(12)} ${String(bag[key] || '(blank)').padEnd(12)} -> ${value}`);
    bag[key] = value;
  }
}

if (unknown.length) console.error(`! not in the catalog, skipped: ${[...new Set(unknown)].join(', ')}`);
if (refused.length) {
  console.error(`! ${refused.length} value${refused.length > 1 ? 's' : ''} not a clean measurement, left blank:`);
  refused.forEach(r => console.error('    ' + r));
}
if (!changes.length) { console.log('nothing to change'); process.exit(0); }

console.log(changes.join('\n'));
console.log(`\n${changes.length} field${changes.length > 1 ? 's' : ''}`);
if (DRY) { console.log('--dry, catalog.json not written'); process.exit(0); }

fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
console.log('wrote assets/sculptures/catalog.json');
console.log('next:  node build-shop.js');
