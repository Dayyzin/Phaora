#!/usr/bin/env node
/* ============================================================================
 * PHAÖRA — shop image derivatives
 *
 *   node optimize-shop-images.js
 *
 * The photographs are 2048×2048 and run 400KB–1.2MB each. That is right for the
 * piece itself and wrong for a grid of thirty-four of them: the collection page
 * would pull 25MB before a phone drew a single card.
 *
 * This writes two smaller copies into assets/sculptures/_derived/<slug>/ :
 *
 *   card.jpg     640px  — the grid tile
 *   t-<name>     240px  — the thumbnail strip on a piece page
 *
 * Originals are never touched, and the full 2048 plate is still what a piece
 * page shows when you open it. _derived sits outside every piece folder on
 * purpose, so the builders that read those folders never mistake a derivative
 * for a photograph.
 *
 * Idempotent: a derivative newer than its source is left alone, so re-running
 * after adding one piece costs one piece.
 * ========================================================================== */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT       = __dirname;
const SCULPTURES = path.join(ROOT, 'assets/sculptures');
const DERIVED    = path.join(SCULPTURES, '_derived');

const CARD_PX  = 640, CARD_Q  = 80;
const THUMB_PX = 240, THUMB_Q = 78;

/* Pillow does the resampling. Kept as one python call for the whole run rather
   than one per file — 322 interpreter starts is most of the wall clock. */
const PY = `
import sys, json, os
from PIL import Image

jobs = json.loads(sys.stdin.read())
done = 0
for src, dst, px, q in jobs:
    im = Image.open(src)
    im = im.convert("RGB")
    im.thumbnail((px, px), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, "JPEG", quality=q, optimize=True, progressive=True)
    done += 1
print(done)
`;

const isPhoto = f => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith('.');

/* a derivative is stale when it is missing or older than its source */
function stale(src, dst) {
  if (!fs.existsSync(dst)) return true;
  return fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs;
}

const slugs = fs.readdirSync(SCULPTURES).filter(s => {
  if (s.startsWith('_') || s.startsWith('.')) return false;
  return fs.statSync(path.join(SCULPTURES, s)).isDirectory();
});

const jobs = [];
let skipped = 0;

for (const slug of slugs) {
  const dir = path.join(SCULPTURES, slug);
  const photos = fs.readdirSync(dir).filter(isPhoto).sort();
  if (!photos.length) continue;

  const outDir = path.join(DERIVED, slug);

  // the grid tile, cut from the piece's first plate
  const heroSrc = path.join(dir, photos[0]);
  const cardDst = path.join(outDir, 'card.jpg');
  if (stale(heroSrc, cardDst)) jobs.push([heroSrc, cardDst, CARD_PX, CARD_Q]);
  else skipped++;

  // one thumbnail per plate for the strip under a piece
  for (const f of photos) {
    const src = path.join(dir, f);
    const dst = path.join(outDir, 't-' + f.replace(/\.(jpe?g|png|webp)$/i, '.jpg'));
    if (stale(src, dst)) jobs.push([src, dst, THUMB_PX, THUMB_Q]);
    else skipped++;
  }
}

if (!jobs.length) {
  console.log(`nothing to do — ${skipped} derivatives already current`);
  process.exit(0);
}

console.log(`resizing ${jobs.length} file${jobs.length === 1 ? '' : 's'} (${skipped} already current)…`);
const out = execFileSync('python3', ['-c', PY], {
  input: JSON.stringify(jobs),
  encoding: 'utf8',
  maxBuffer: 1 << 26
});

const bytes = p => {
  let n = 0;
  for (const f of fs.readdirSync(p, { withFileTypes: true })) {
    const full = path.join(p, f.name);
    n += f.isDirectory() ? bytes(full) : fs.statSync(full).size;
  }
  return n;
};
const mb = n => (n / 1048576).toFixed(1) + 'MB';

console.log(`wrote ${out.trim()} derivatives → assets/sculptures/_derived/ (${mb(bytes(DERIVED))})`);
