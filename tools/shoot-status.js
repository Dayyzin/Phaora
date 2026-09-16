#!/usr/bin/env node
/* ============================================================================
 * PHAÖRA — where the reshoot stands
 *
 *   node tools/shoot-status.js            every piece
 *   node tools/shoot-status.js --todo     only what is not done
 *
 * Thirty-four pieces across five days is a job you cannot hold in your head.
 * This reads what is actually on disk against what the shop needs and says
 * which pieces are finished, which are thin, and which have not been touched.
 *
 * "Reshot" is decided by file time, not by a list someone has to maintain: a
 * piece whose hero is newer than this file's own baseline date has been done in
 * this round. Pass --since YYYY-MM-DD to set that baseline.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCULPTURES = path.join(ROOT, 'assets/sculptures');
const catalog = JSON.parse(fs.readFileSync(path.join(SCULPTURES, 'catalog.json'), 'utf8'));

const argv = process.argv.slice(2);
const TODO = argv.includes('--todo');
const sinceArg = (() => { const i = argv.indexOf('--since'); return i >= 0 ? argv[i + 1] : null; })();
/* Default baseline: midnight today, so "what did I shoot today" is the default
   question on each day of the shoot. */
const since = sinceArg ? Date.parse(sinceArg) : new Date().setHours(0, 0, 0, 0);

const OK = /\.(jpe?g|png|webp)$/i;
const HEIC = /\.(heic|heif)$/i;
const WANT = 8;  /* hero + front + two sides + back + base + detail + scale */

const rows = catalog.pieces.map(p => {
  const dir = path.join(SCULPTURES, p.slug);
  let files = [], heic = [], newest = 0, heroAt = 0;
  if (fs.existsSync(dir)) {
    const all = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
    heic = all.filter(f => HEIC.test(f));
    files = all.filter(f => OK.test(f)).sort();
    for (const f of files) {
      const m = fs.statSync(path.join(dir, f)).mtimeMs;
      if (m > newest) newest = m;
      if (/^00-/.test(f)) heroAt = m;
    }
  }
  const sp = p.specs || {};
  const measured = [p.base_material, sp.total_height_inches, sp.weight_lbs_total]
    .filter(v => v !== '' && v !== 0 && v !== undefined && v !== null).length;

  const hasHero = files.some(f => /^00-/.test(f));
  const fresh = (heroAt || newest) >= since;

  let state;
  if (!files.length)        state = 'no photos';
  else if (!hasHero)        state = 'no hero';
  else if (heic.length)     state = 'HEIC present';
  else if (!fresh)          state = 'old set';
  else if (files.length < WANT) state = `thin (${files.length}/${WANT})`;
  else                      state = 'done';

  return { slug: p.slug, name: p.name, n: files.length, heic: heic.length, state, measured, fresh };
});

const done = rows.filter(r => r.state === 'done');
const show = TODO ? rows.filter(r => r.state !== 'done') : rows;

const MARK = { 'done': '  done', 'no photos': '  ----', 'no hero': '  HERO', 'HEIC present': '  HEIC', 'old set': '   old' };
console.log('piece'.padEnd(20), 'shots', ' specs', ' state');
for (const r of show) {
  console.log(
    r.slug.padEnd(20),
    String(r.n).padStart(5),
    (r.measured + '/3').padStart(6),
    ' ' + (MARK[r.state] || '      ') + '  ' + (r.state === 'done' ? '' : r.state)
  );
}

const measuredAll = rows.filter(r => r.measured === 3).length;
console.log(`\n${done.length} of ${rows.length} pieces reshot` +
            (sinceArg ? ` since ${sinceArg}` : ' today') +
            `  ·  ${measuredAll} of ${rows.length} measured`);
const heicTotal = rows.reduce((s, r) => s + r.heic, 0);
if (heicTotal) console.log(`! ${heicTotal} HEIC files on disk — the shop cannot use them`);
if (!TODO && done.length < rows.length) console.log('run with --todo for just the remainder');
