#!/usr/bin/env node
/* ============================================================================
 * PHAÖRA — drop a shoot into a piece folder
 *
 *   node tools/import-photos.js <slug> <folder> [--hero <file>] [--dry] [--force]
 *
 * WHAT IT IS FOR
 * ---------------------------------------------------------------------------
 * Reshooting the collection means three hundred photographs arriving as
 * IMG_4471.JPG in one folder per piece, and the site wants them as
 * 00-hero.jpg, 01.jpg, 02.jpg inside assets/sculptures/<slug>/. Doing that by
 * hand thirty-four times is where a five-day turnaround goes to die.
 *
 * ORDER
 * ---------------------------------------------------------------------------
 * By EXIF capture time, because that is the order the piece was actually
 * turned on the table. Files with no capture time fall back to mtime, then to
 * a natural-sort of the name — IMG_9 before IMG_10, which a plain sort gets
 * wrong. build-shop.js takes photos[0] as the hero and sorts the folder
 * lexically, which is why the hero is named 00-.
 *
 * THE OLD PHOTOGRAPHS ARE NOT DELETED
 * ---------------------------------------------------------------------------
 * They move to assets/sculptures/_retired/<slug>-<stamp>/. "Strip away the
 * current photos" should not mean losing them because a shoot turned out badly
 * — _retired is outside every piece folder, so no builder reads it, and it is
 * gitignored so it never enters a commit. Delete it yourself when the new set
 * is signed off.
 *
 * It also clears assets/sculptures/_derived/<slug>/ so the 640px cards and
 * 240px thumbnails regenerate from the new plates rather than staying stale.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { exifDate } = require('./lib-exif');

const ROOT       = path.join(__dirname, '..');
const SCULPTURES = path.join(ROOT, 'assets/sculptures');
const DERIVED    = path.join(SCULPTURES, '_derived');
const RETIRED    = path.join(SCULPTURES, '_retired');
const CATALOG    = path.join(SCULPTURES, 'catalog.json');

const OK_EXT = /\.(jpe?g|png|webp)$/i;
/* An iPhone shoots HEIC unless told otherwise. build-shop.js will not match it
   and no browser will show it, so it is caught here rather than discovered on
   day five. */
const HEIC = /\.(heic|heif)$/i;

const argv = process.argv.slice(2);
const flag = n => argv.includes(n);
const val  = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const pos  = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--hero');

const slug = pos[0], src = pos[1];
const DRY  = flag('--dry'), FORCE = flag('--force'), heroPick = val('--hero');

if (!slug || !src) {
  console.error('usage: node tools/import-photos.js <slug> <folder> [--hero <file>] [--dry] [--force]');
  process.exit(2);
}

/* The slug must be a real piece, or the photographs land somewhere the shop
   never looks and the mistake is invisible until the page is blank. */
const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
const known = new Set(catalog.pieces.map(p => p.slug));
if (!known.has(slug) && !FORCE) {
  console.error(`! "${slug}" is not in catalog.json.`);
  /* A typed slug is usually one keystroke out — "opl" for "opal". Substring
     matching misses exactly that case, so this is edit distance. */
  const dist = (a, b) => {
    const m = Array.from({ length: a.length + 1 }, (_, i) => [i].concat(Array(b.length).fill(0)));
    for (let j = 0; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        m[i][j] = Math.min(m[i-1][j] + 1, m[i][j-1] + 1,
                           m[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    return m[a.length][b.length];
  };
  const near = [...known]
    .map(s => [s, dist(s, slug)])
    .filter(([, d]) => d <= 3)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([s]) => s);
  if (near.length) console.error(`  did you mean: ${near.join(', ')}`);
  console.error('  add the catalog entry first, or pass --force for a piece you are about to add.');
  process.exit(1);
}
if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
  console.error(`! ${src} is not a folder`);
  process.exit(1);
}

const entries = fs.readdirSync(src).filter(f => !f.startsWith('.'));
const heicFound = entries.filter(f => HEIC.test(f));
const files = entries.filter(f => OK_EXT.test(f));

if (heicFound.length) {
  console.error(`! ${heicFound.length} HEIC file${heicFound.length > 1 ? 's' : ''} in ${src}`);
  console.error('  The shop cannot use HEIC and no browser will render it. Convert first:');
  console.error('    on a Mac:  open in Preview > File > Export > JPEG');
  console.error('    on iPhone: Settings > Camera > Formats > Most Compatible, then reshoot');
  console.error('    or AirDrop to a Mac, which converts on the way out');
  if (!files.length) process.exit(1);
  console.error(`  continuing with the ${files.length} usable file${files.length > 1 ? 's' : ''}.\n`);
}
if (!files.length) { console.error(`! no usable photographs in ${src}`); process.exit(1); }

/* IMG_9 before IMG_10: a lexical sort puts 10 first. */
const natural = (a, b) => a.replace(/\d+/g, d => d.padStart(12, '0'))
  .localeCompare(b.replace(/\d+/g, d => d.padStart(12, '0')));

const ordered = files
  .map(f => {
    const full = path.join(src, f);
    return { f, full, when: exifDate(full), mtime: fs.statSync(full).mtimeMs };
  })
  .sort((a, b) => {
    if (a.when && b.when && a.when !== b.when) return a.when - b.when;
    if (a.when && !b.when) return -1;
    if (!a.when && b.when) return 1;
    if (a.mtime !== b.mtime) return a.mtime - b.mtime;
    return natural(a.f, b.f);
  });

/* The hero is the shot on black. It is the grid tile and the og:image, so it
   is worth naming rather than accepting whatever came out of the camera
   first. */
let hero = ordered[0];
if (heroPick) {
  const pick = ordered.find(o => o.f === heroPick || o.f.toLowerCase() === heroPick.toLowerCase());
  if (!pick) { console.error(`! --hero ${heroPick} is not in ${src}`); process.exit(1); }
  hero = pick;
}
const rest = ordered.filter(o => o !== hero);

const dest = path.join(SCULPTURES, slug);
const existing = fs.existsSync(dest)
  ? fs.readdirSync(dest).filter(f => OK_EXT.test(f) && !f.startsWith('.')) : [];

const ext = f => path.extname(f).toLowerCase().replace('.jpeg', '.jpg');
const plan = [{ from: hero, to: '00-hero' + ext(hero.f) }]
  .concat(rest.map((o, i) => ({ from: o, to: String(i + 1).padStart(2, '0') + ext(o.f) })));

const withExif = ordered.filter(o => o.when).length;
console.log(`${slug}  <-  ${src}`);
console.log(`  ${files.length} photographs, ${withExif} with a capture time` +
            (withExif < files.length ? ` (${files.length - withExif} ordered by file time)` : ''));
if (existing.length) console.log(`  ${existing.length} already in place -> _retired/`);

for (const p of plan) {
  const t = p.from.when ? new Date(p.from.when).toISOString().slice(0, 19).replace('T', ' ') : '(no capture time)';
  console.log(`    ${p.to.padEnd(12)} <- ${p.from.f.padEnd(24)} ${t}`);
}

if (DRY) { console.log('\n  --dry, nothing written'); process.exit(0); }

/* retire, then write, then invalidate the derivatives */
if (existing.length) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const bin = path.join(RETIRED, `${slug}-${stamp}`);
  fs.mkdirSync(bin, { recursive: true });
  for (const f of existing) fs.renameSync(path.join(dest, f), path.join(bin, f));
  console.log(`  retired ${existing.length} to ${path.relative(ROOT, bin)}`);
}
fs.mkdirSync(dest, { recursive: true });
for (const p of plan) fs.copyFileSync(p.from.full, path.join(dest, p.to));

const derived = path.join(DERIVED, slug);
if (fs.existsSync(derived)) {
  fs.rmSync(derived, { recursive: true, force: true });
  console.log('  cleared stale derivatives');
}

console.log(`  wrote ${plan.length} to assets/sculptures/${slug}/`);
console.log('\nnext:  node optimize-shop-images.js && node build-shop.js');
