#!/usr/bin/env node
/**
 * Duplicate-content scan over the built static site.
 *
 * WHAT IT MEASURES
 * ---------------------------------------------------------------------------
 * For every indexable HTML page: what share of its sentences appear on no other
 * page. Sentences are normalised (tags stripped, lowercased, stopwords and
 * short fragments dropped) so a page is compared on its substance rather than
 * its punctuation. Nav, footer and the correspondence block are shared by
 * design and count against every page equally — the number to watch is whether
 * a page has ANY writing of its own, not whether it clears a particular bar.
 *
 * WHAT IT DELIBERATELY IGNORES
 * ---------------------------------------------------------------------------
 * Pages carrying <meta name="robots" content="noindex"> are not asked to be
 * distinct: a cart, a rendering template, or a work the studio has chosen not
 * to reveal has nothing to be distinct about, and the honest answer there is to
 * keep it out of the index rather than pad it with text. They are listed under
 * a separate heading so the tally stays visible.
 *
 * Editor backups (*.before.html, *.legacy.html and friends) are skipped — they
 * are not served.
 *
 * Exit code 1 if any INDEXABLE page falls under MIN_UNIQUE.
 */
const fs = require('fs'), path = require('path');

const MIN_UNIQUE = 30;   // percent
const ROOT = path.join(__dirname, '..');

const STOP = new Set(("a an and are as at be been but by for from had has have he her his in into is it its of on or our she that the their them there they this to was we were what when where which who will with you your us not no do does did can could would should may might must if then than so").split(" "));

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', 'uploads', 'assets', 'av'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const BACKUP = /\.(legacy|beforeham|beforedesign|newdesign|v2|beforecat|before\d*)\.html$|\.html\.before|before\d*\.html$/;

function sentences(html) {
  const t = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/gi, ' ')
    .toLowerCase();
  const out = new Set();
  for (const raw of t.split(/(?<=[.!?])\s+|\n+/)) {
    const w = raw.split(/[^a-z0-9'’-]+/)
      .map(x => x.replace(/^['’-]+|['’-]+$/g, ''))
      .filter(x => x.length > 2 && !STOP.has(x));
    if (w.length < 5) continue;
    out.add(w.join(' '));
  }
  return out;
}

const files = walk(ROOT).filter(f => !BACKUP.test(f)).map(f => path.relative(ROOT, f));
const S = new Map(), noindex = new Set();
for (const f of files) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (/<meta\s+name=["']robots["'][^>]*noindex/i.test(html)) noindex.add(f);
  S.set(f, sentences(html));
}

const rows = [];
for (const [f, mine] of S) {
  let own = 0;
  for (const s of mine) {
    let seen = false;
    for (const [g, other] of S) if (g !== f && other.has(s)) { seen = true; break; }
    if (!seen) own++;
  }
  rows.push({ f, pct: mine.size ? Math.round(own / mine.size * 1000) / 10 : 0, n: mine.size, own });
}
rows.sort((a, b) => a.pct - b.pct);

const indexable = rows.filter(r => !noindex.has(r.f));
const excluded  = rows.filter(r =>  noindex.has(r.f));

console.log('INDEXABLE');
console.log('page'.padEnd(46), 'unique%', ' own', ' sentences');
for (const r of indexable) {
  const flag = r.pct < MIN_UNIQUE ? '  <-- under floor' : '';
  console.log(r.f.padEnd(46), String(r.pct).padStart(6), String(r.own).padStart(4), String(r.n).padStart(9), flag);
}
console.log(`\nNOINDEX (${excluded.length} pages, not asked to be distinct)`);
for (const r of excluded) console.log('  ' + r.f);

const failing = indexable.filter(r => r.pct < MIN_UNIQUE);
console.log(`\n${indexable.length} indexable pages, ${failing.length} under the ${MIN_UNIQUE}% floor.`);
if (failing.length) process.exitCode = 1;
