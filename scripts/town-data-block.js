/**
 * The "by the numbers" block on each town page, and the Massachusetts Hardscape
 * Replacement Index, both built from scripts/town-data.json (the saved output of
 * scripts/town-data.sql).
 *
 * inject-town-data.js uses this for the pages on disk; generate-town-pages.js
 * render() uses it for pages written fresh, so the two always print the same
 * block. Every number printed comes from the JSON. This file only decides which
 * figures a page may carry and how they read.
 */
const fs = require('fs');
const path = require('path');

const DATA = require('./town-data.json');

const STATE_NAMES = {
  ma: 'Massachusetts', ri: 'Rhode Island', nh: 'New Hampshire', me: 'Maine',
  ct: 'Connecticut', tx: 'Texas', co: 'Colorado', wy: 'Wyoming', in: 'Indiana',
};

/** States whose pages are cities but whose homes are filed under the county. */
const COUNTY_STATES = new Set(['tx', 'co', 'wy', 'in']);

/** Texas does not publish sale prices; its date is the day the owner changed. */
const DEED_DATE_ONLY = new Set(['TX']);

/** Town names the source spells differently from the page. */
const SOURCE_TOWN = { 'MA|Manchester-by-the-Sea': 'Manchester' };

const MIN_HOMES = 200;
const MIN_RECORDS = 10;
const MIN_PRICED = 20;
// A field stands for the town only where the record fills it for nine homes in ten.
const COVERAGE = 0.9;
// Sales show where the record runs into the last twelve months.
const FRESH_MONTHS = 12;
// Below 3% of homes in 24 months the record is missing sales, not the town.
const MIN_TURNOVER = 0.03;
const INDEX_MIN_HOMES = 500;

/**
 * Areas whose rows on file are not the town's housing stock (2026-10-11).
 * Shown nowhere; the page keeps its services row and this reason as a comment.
 */
const NOT_THE_TOWN = {
  'MA|Ipswich': 'the 217 homes on file are the ones billed away from the house; the rest of the roll has no owner address and was never imported',
  'CT|Groton': 'the 561 homes on file are a fraction of the 8,049 single-family parcels in the state layer',
  'CO|Adams': 'the state layer files houses and residential lots under one class and puts package-deed prices on single parcels',
};

const SERVICES = [
  ['/patios/', 'patios'],
  ['/paver-driveways/', 'paver driveways'],
  ['/retaining-walls/', 'retaining walls'],
  ['/walkways-and-steps/', 'walkways and steps'],
  ['/stone-veneer/', 'stone veneer'],
  ['/drainage/', 'drainage'],
];
const SEAWALLS = ['/seawalls-and-shore-protection/', 'seawalls and shore protection'];

const COMPUTED_ON = DATA.computed_on;
const AREAS = new Map();
for (const batch of DATA.batches) {
  for (const a of batch.areas) AREAS.set(`${a.state}|${a.town}`, a);
}

// ── formatting ───────────────────────────────────────────────────────────────

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
const int = (n) => Number(n).toLocaleString('en-US');
const pct = (x) => `${Math.round(x * 100)}%`;
const money = (n) => `$${int(Math.round(n / 1000) * 1000)}`;
const acres = (sqft) => (sqft / 43560).toFixed(2);
const monthName = (iso) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
const ym = (iso) => iso.slice(0, 7);
function addMonths(iso, n) {
  const d = new Date(`${iso.slice(0, 7)}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
}
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

const UPDATED = monthName(COMPUTED_ON);
const FRESH_FROM = addMonths(COMPUTED_ON, -FRESH_MONTHS);

// ── which figures an area can carry ──────────────────────────────────────────

function sourceFor(a, salesShown) {
  const town = a.town;
  switch (a.state) {
    case 'MA':
      // The mail_parcels class check admits houses with their own ground, never class 102.
      return {
        text: 'MassGIS statewide property tax parcels', name: 'MassGIS statewide property tax parcels', publisher: 'MassGIS',
        note: 'Homes are residential parcels with their own ground; condominium units are not counted.',
      };
    case 'CT': {
      const name = 'Connecticut statewide parcel and CAMA data';
      const publisher = 'Connecticut Office of Policy and Management';
      return {
        text: `${publisher} statewide parcel and CAMA data${salesShown ? `, with sales from the ${town} assessor’s records` : ''}`,
        name, publisher,
      };
    }
    case 'RI': case 'NH': case 'ME':
      return { text: `${town} assessor’s property records`, name: `${town} assessor’s property records`, publisher: `${town} assessor` };
    case 'TX': {
      const pub = {
        'Harris County': 'Harris Central Appraisal District',
        'Tarrant County': 'Tarrant Appraisal District',
        'Bexar County': 'Bexar County',
      }[town];
      const name = town === 'Bexar County' ? 'Bexar County public parcel records' : `${pub} property records`;
      return { text: name, name, publisher: pub };
    }
    case 'IN': {
      const publisher = 'Indiana Department of Local Government Finance';
      return { text: `${publisher} real property and sales disclosure records`, name: `${publisher} real property and sales disclosure records`, publisher };
    }
    default:
      return null;
  }
}

/** The figures for one area, or { skip } with the reason none can be shown. */
function figures(key) {
  const a = AREAS.get(key);
  if (!a) return { skip: 'no homes on file for this area' };
  if (NOT_THE_TOWN[key]) return { skip: NOT_THE_TOWN[key] };
  if (a.homes < MIN_HOMES) return { skip: `${a.homes} homes on file, under ${MIN_HOMES}` };

  const f = { area: a, homes: a.homes, count: 1 };
  if (a.yb_n >= MIN_RECORDS && a.yb_n / a.homes >= COVERAGE && a.median_year) {
    f.medianYear = a.median_year;
    f.pre1980N = a.pre1980_n;
    f.pre1980 = a.pre1980_n / a.homes;
    f.count += 2;
  }
  const deedOnly = DEED_DATE_ONLY.has(a.state);
  const n = deedOnly ? a.dated_24 : a.priced_24;
  if (a.through_month && a.through_month >= FRESH_FROM && n >= MIN_RECORDS && n / a.homes >= MIN_TURNOVER) {
    f.sales = {
      kind: deedOnly ? 'owners' : 'sold', n, share: n / a.homes,
      through: a.through_month, from: addMonths(a.through_month, -23),
    };
    f.count += 1;
    if (!deedOnly && a.priced_24 >= MIN_PRICED && a.median_price_24) {
      f.price = a.median_price_24;
      f.count += 1;
    }
  }
  if (a.lot_n >= MIN_RECORDS && a.lot_n / a.homes >= COVERAGE && a.median_lot_sqft) {
    f.lotSqft = a.median_lot_sqft;
    f.count += 1;
  }
  if (f.count < 3) return { skip: 'fewer than three figures on record for this area' };
  f.source = sourceFor(a, Boolean(f.sales));
  return f;
}

/** Every Massachusetts town with enough homes, ranked by share built before 1980. */
function maIndex() {
  const rows = [];
  for (const [key, a] of AREAS) {
    if (a.state !== 'MA' || a.homes < INDEX_MIN_HOMES || NOT_THE_TOWN[key]) continue;
    const f = figures(key);
    if (f.skip || !f.medianYear) continue;
    rows.push({ town: a.town, f });
  }
  rows.sort((x, y) => (y.f.pre1980 - x.f.pre1980) || (x.f.medianYear - y.f.medianYear) || x.town.localeCompare(y.town));
  rows.forEach((r, i) => { r.rank = i + 1; });
  return rows;
}
let INDEX_CACHE = null;
const index = () => (INDEX_CACHE = INDEX_CACHE || maIndex());

// ── a page ───────────────────────────────────────────────────────────────────

/**
 * page: { slug, st, name, county, coastal }. Town pages in MA, CT, RI, NH and ME
 * read the town; city pages in TX, CO, WY and IN read their county.
 */
function plan(page) {
  const st = page.st.toLowerCase();
  const ST = st.toUpperCase();
  const isCounty = COUNTY_STATES.has(st);
  const sourceTown = isCounty
    ? (st === 'tx' ? `${page.county} County` : page.county)
    : (SOURCE_TOWN[`${ST}|${page.name}`] || page.name);
  const key = `${ST}|${sourceTown}`;
  const label = isCounty ? `${page.county} County` : page.name;
  const place = `${label}, ${STATE_NAMES[st]}`;
  const url = `https://phaora.com/masonry-${page.slug}-${st}/`;
  const f = figures(key);
  const rank = st === 'ma' && !f.skip ? index().find((r) => r.town === sourceTown) : null;
  return { page, st, isCounty, key, label, place, url, f, rank };
}

function servicesFor(page) {
  return page.coastal ? [...SERVICES, SEAWALLS] : SERVICES;
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function leadSentence(p) {
  const { f, label: L, page, isCounty, rank } = p;
  const P = page.name;
  if (rank && rank.rank <= 10) {
    return `${L} ranks ${ordinal(rank.rank)} of ${index().length} Massachusetts towns for the share of homes built before 1980: ${pct(f.pre1980)} of its ${int(f.homes)} homes on record.`;
  }
  if (f.pre1980 !== undefined && f.pre1980 >= 0.5) {
    return isCounty
      ? `${P} is in ${L}, where ${pct(f.pre1980)} of the ${int(f.homes)} homes on record were built before 1980.`
      : `${pct(f.pre1980)} of the ${int(f.homes)} homes on record in ${L} were built before 1980.`;
  }
  if (f.sales) {
    const verb = f.sales.kind === 'owners' ? 'changed owners' : 'sold';
    return isCounty
      ? `${P} is in ${L}, where ${int(f.sales.n)} homes ${verb} in the 24 months to ${monthName(f.sales.through)}.`
      : `${int(f.sales.n)} homes in ${L} ${verb} in the 24 months to ${monthName(f.sales.through)}.`;
  }
  if (f.medianYear) {
    return isCounty
      ? `${P} is in ${L}, where ${int(f.homes)} homes are on record and the median year built is ${f.medianYear}.`
      : `${L} has ${int(f.homes)} homes on record, and the median year built is ${f.medianYear}.`;
  }
  return isCounty
    ? `${P} is in ${L}, where ${int(f.homes)} homes are on record.`
    : `${L} has ${int(f.homes)} homes on record.`;
}

function tiles(p) {
  const { f } = p;
  const out = [['Homes on record', int(f.homes), null]];
  if (f.pre1980 !== undefined) out.push(['Built before 1980', pct(f.pre1980), `${int(f.pre1980N)} homes`]);
  if (f.sales) {
    out.push([
      f.sales.kind === 'owners' ? 'New owners in 24 months' : 'Sold in 24 months',
      int(f.sales.n),
      `To ${monthName(f.sales.through)} · ${pct(f.sales.share)} of homes`,
    ]);
  }
  if (f.price) out.push(['Median sale price', money(f.price), `24 months to ${monthName(f.sales.through)}`]);
  if (f.medianYear) out.push(['Median year built', String(f.medianYear), null]);
  if (f.lotSqft) out.push(['Median lot', `${acres(f.lotSqft)} acres`, `${int(f.lotSqft)} sq ft`]);
  return out.slice(0, 4);
}

/** Questions as [question, parts]; a part is a string or [text, href]. */
function faq(p) {
  const { f, label: L, page } = p;
  const data = [];
  const age = f.medianYear
    ? [`How old are the homes in ${L}?`, [`The median year built on record in ${L} is ${f.medianYear}, and ${int(f.pre1980N)} of its ${int(f.homes)} homes on record, ${pct(f.pre1980)}, were built before 1980.`]]
    : null;
  if (age) data.push(age);
  if (f.sales) {
    const verb = f.sales.kind === 'owners' ? 'changed owners' : 'sold';
    const q = f.sales.kind === 'owners'
      ? `How many homes in ${L} have changed owners recently?`
      : `How many homes in ${L} have sold recently?`;
    data.push([q, [`In public property records, ${int(f.sales.n)} homes in ${L} ${verb} in the 24 months to ${monthName(f.sales.through)}, ${pct(f.sales.share)} of the homes on record.`]]);
  }
  if (f.price) {
    data.push([`What do homes in ${L} sell for?`, [`The median sale price of a home in ${L} was ${money(f.price)} across ${int(f.sales.n)} sales in the 24 months to ${monthName(f.sales.through)}.`]]);
  }
  if (f.lotSqft) {
    data.push([`How big are the lots in ${L}?`, [`The median lot on record in ${L} is ${acres(f.lotSqft)} acres, or ${int(f.lotSqft)} square feet.`]]);
  }
  if (data.length < 3) data.push([`How many homes are in ${L}?`, [`Public property records list ${int(f.homes)} homes in ${L}.`]]);
  if (data.length < 3 && age) {
    const i = data.indexOf(age);
    data.splice(i, 1,
      [`How old are the homes in ${L}?`, [`The median year built on record in ${L} is ${f.medianYear}.`]],
      [`How many homes in ${L} were built before 1980?`, [`${int(f.pre1980N)} of the ${int(f.homes)} homes on record in ${L}, ${pct(f.pre1980)}, were built before 1980.`]]);
  }

  const svc = servicesFor(page);
  const parts = ['PHAÖRA builds '];
  const base = svc.filter((s) => s !== SEAWALLS);
  base.forEach(([href, name], i) => {
    if (i > 0) parts.push(i === base.length - 1 ? ' and ' : ', ');
    parts.push([name, href]);
  });
  parts.push(` in ${page.name}`);
  if (svc.includes(SEAWALLS)) parts.push(', and ', [SEAWALLS[1], SEAWALLS[0]], ' on the coast');
  parts.push('. The on-site estimate is free.');
  return [...data.slice(0, 4), [`What hardscape work does PHAÖRA do in ${page.name}?`, parts]];
}

const partsText = (parts) => parts.map((x) => (Array.isArray(x) ? x[0] : x)).join('');
const partsHtml = (parts) => parts.map((x) => (Array.isArray(x) ? `<a href="${x[1]}">${esc(x[0])}</a>` : esc(x))).join('');

function servicesRow(page) {
  const links = servicesFor(page).map(([href, name]) => `        <a href="${href}">${esc(cap(name))}</a>`).join('\n');
  return `    <div class="td-svc">
      <p class="lbl">Services in ${esc(page.name)}</p>
      <div class="row">
${links}
      </div>
    </div>`;
}

// ── HTML ─────────────────────────────────────────────────────────────────────

const START = '<!-- town-data:start -->';
const END = '<!-- town-data:end -->';
const HEAD_START = '<!-- town-data-head:start -->';
const HEAD_END = '<!-- town-data-head:end -->';

// Colours are the template's own: pearl, gold-lt, teal and its white alphas.
const CSS = `.td-stats{grid-template-columns:1fr 1fr}
@media(min-width:700px){.td-stats{grid-template-columns:repeat(var(--n,4),minmax(0,1fr))}}
@media(max-width:699px){.td-stats>:last-child:nth-child(odd){grid-column:1/-1}}
.td-stats .tp-cell h3{font-size:10.5px;letter-spacing:.16em;color:rgba(234,239,245,.62)}
.td-stats .td-n{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(30px,6vw,40px);line-height:1;color:var(--gold-lt);margin:10px 0 0}
.td-stats .td-sub{font-size:12.5px;line-height:1.5;color:rgba(234,239,245,.62);margin:6px 0 0}
.td-faq{margin:30px 0 0;border-top:1px solid rgba(234,239,245,.08)}
.td-qa{padding:18px 0;border-bottom:1px solid rgba(234,239,245,.08)}
.td-qa h3{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(19px,4vw,23px);line-height:1.25;color:var(--pearl);margin:0}
.td-qa p{color:rgba(234,239,245,.73);font-size:14.5px;line-height:1.7;margin:8px 0 0;max-width:64ch}
.td-qa a{color:var(--pearl);border-bottom:1px solid rgba(234,239,245,.14)}
.td-qa a:hover{color:var(--teal);border-color:var(--teal)}
.td-svc{margin:28px 0 0}
.td-svc .lbl{font-size:10px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:rgba(234,239,245,.58);margin:0}
.td-svc .row{display:flex;flex-wrap:wrap;gap:10px 18px;margin:14px 0 0}
.td-svc a{font-size:14px;color:rgba(234,239,245,.6);border-bottom:1px solid rgba(234,239,245,.14);padding-bottom:2px}
.td-svc a:hover{color:var(--teal);border-color:var(--teal)}
.td-src{font-size:12px;line-height:1.6;color:rgba(234,239,245,.58);margin:22px 0 0}
.td .gx-work-all{margin-top:8px}`;

function datasetLd(p) {
  const { f, label: L, place, url } = p;
  const vars = ['Homes on record'];
  if (f.medianYear) vars.push('Median year built', 'Share of homes built before 1980');
  if (f.sales) vars.push(f.sales.kind === 'owners' ? 'Homes with a new owner in 24 months' : 'Homes sold in 24 months');
  if (f.price) vars.push('Median sale price over 24 months');
  if (f.lotSqft) vars.push('Median lot size');
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${L} homes by the numbers`,
    description: `${vars.join(', ')} for ${place}, computed by PHAÖRA from ${f.source.name}.`,
    url: `${url}#by-the-numbers`,
    variableMeasured: vars,
    spatialCoverage: { '@type': 'Place', name: place },
    temporalCoverage: f.sales ? `${ym(f.sales.from)}/${ym(f.sales.through)}` : ym(COMPUTED_ON),
    dateModified: COMPUTED_ON,
    isAccessibleForFree: true,
    creator: { '@type': 'Organization', name: 'PHAÖRA', url: 'https://phaora.com/' },
    isBasedOn: { '@type': 'CreativeWork', name: f.source.name, publisher: { '@type': 'Organization', name: f.source.publisher } },
  };
}

function faqLd(questions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(([q, parts]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: partsText(parts) },
    })),
  };
}

/** The marked block that goes in <head>: the block's styles, and its JSON-LD. */
function headBlock(page) {
  const p = plan(page);
  const lines = [HEAD_START, `<style>\n${CSS}\n</style>`];
  if (!p.f.skip) {
    lines.push(`<script type="application/ld+json">${jsonLd(datasetLd(p))}</script>`);
    lines.push(`<script type="application/ld+json">${jsonLd(faqLd(faq(p)))}</script>`);
  }
  lines.push(HEAD_END);
  return `${lines.join('\n')}\n`;
}

/** The marked block that goes right before "Working in <Town>". */
function bodyBlock(page) {
  const p = plan(page);
  const { f, label: L, rank } = p;
  if (f.skip) {
    return `  ${START}
  <!-- No figures for ${esc(p.label)}: ${esc(f.skip)}. -->
  <section class="tp-sec td">
${servicesRow(page)}
  </section>
  ${END}

`;
  }
  const t = tiles(p);
  const cells = t.map(([h, v, sub]) => `      <div class="tp-cell"><h3>${esc(h)}</h3><p class="td-n">${esc(v)}</p>${sub ? `<p class="td-sub">${esc(sub)}</p>` : ''}</div>`).join('\n');
  const qa = faq(p).map(([q, parts]) => `      <div class="td-qa"><h3>${esc(q)}</h3><p>${partsHtml(parts)}</p></div>`).join('\n');
  const more = rank
    ? `\n    <a class="gx-work-all" href="/hardscape-index/#${page.slug}">See how ${esc(page.name)} ranks &rarr;</a>`
    : '';
  return `  ${START}
  <section class="tp-sec td" id="by-the-numbers" aria-labelledby="td-h">
    <h2 class="tp-h2" id="td-h">${esc(L)} by the numbers</h2>
    <p class="tp-p">${esc(leadSentence(p))}</p>
    <div class="tp-grid td-stats" style="--n:${t.length}">
${cells}
    </div>
    <div class="td-faq">
${qa}
    </div>
${servicesRow(page)}
    <p class="td-src">Source: ${esc(f.source.text)}; updated ${UPDATED}.${f.source.note ? ` ${esc(f.source.note)}` : ''}</p>${more}
  </section>
  ${END}

`;
}

/** Put both blocks into a page's HTML, replacing earlier copies. */
function inject(html, page) {
  const head = headBlock(page);
  const body = bodyBlock(page);
  const headRe = new RegExp(`${HEAD_START}[\\s\\S]*?${HEAD_END}\\n`);
  const bodyRe = new RegExp(`  ${START}[\\s\\S]*?${END}\\n\\n`);
  let out = headRe.test(html) ? html.replace(headRe, () => head) : html.replace('</head>', () => `${head}</head>`);
  if (bodyRe.test(out)) {
    out = out.replace(bodyRe, () => body);
  } else {
    const anchor = /(^[ \t]*<section class="tp-sec">\s*<h2 class="tp-h2">Working in )/m;
    if (!anchor.test(out)) throw new Error(`no "Working in" section on ${page.slug}-${page.st}`);
    out = out.replace(anchor, (m) => `${body}${m}`);
  }
  return out;
}

// ── the index page ───────────────────────────────────────────────────────────

const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');

function indexPage(pageSlugs) {
  const rows = index();
  const url = 'https://phaora.com/hardscape-index/';
  const title = 'Massachusetts Hardscape Replacement Index | PHAÖRA';
  const n = rows.length;
  const top = rows.slice(0, 3).map((r) => `${r.town === 'Manchester' ? 'Manchester-by-the-Sea' : r.town} (${(r.f.pre1980 * 100).toFixed(1)}%)`);
  const desc = `${n} Massachusetts towns ranked by the share of homes built before 1980, from MassGIS property tax parcels. Homes on record, median year built and recent sales for each.`;
  const fresh = rows.filter((r) => r.f.sales);
  const body = rows.map((r) => {
    const name = r.town === 'Manchester' ? 'Manchester-by-the-Sea' : r.town;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const link = pageSlugs.has(`masonry-${slug}-ma`) ? `<a href="/masonry-${slug}-ma/">${esc(name)}</a>` : esc(name);
    const s = r.f.sales;
    const sold = s
      ? `<td data-v="${s.n}">${int(s.n)}<span class="m">to ${MONTHS[Number(s.through.slice(5, 7)) - 1].slice(0, 3)} ${s.through.slice(0, 4)}</span></td>`
      : '<td data-v="-1">&mdash;</td>';
    return `        <tr id="${slug}"><td data-v="${r.rank}">${r.rank}</td><td data-v="${esc(name)}">${link}</td><td data-v="${r.f.homes}">${int(r.f.homes)}</td><td data-v="${r.f.medianYear}">${r.f.medianYear}</td><td data-v="${r.f.pre1980.toFixed(4)}">${(r.f.pre1980 * 100).toFixed(1)}%</td>${sold}</tr>`;
  }).join('\n');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Massachusetts Hardscape Replacement Index',
    description: desc,
    url,
    variableMeasured: ['Homes on record', 'Median year built', 'Share of homes built before 1980', 'Homes sold in 24 months'],
    spatialCoverage: { '@type': 'Place', name: 'Massachusetts' },
    temporalCoverage: ym(COMPUTED_ON),
    dateModified: COMPUTED_ON,
    isAccessibleForFree: true,
    creator: { '@type': 'Organization', name: 'PHAÖRA', url: 'https://phaora.com/' },
    isBasedOn: { '@type': 'CreativeWork', name: 'MassGIS statewide property tax parcels', publisher: { '@type': 'Organization', name: 'MassGIS' } },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://phaora.com/assets/og/phaora-share.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="https://phaora.com/assets/og/phaora-share.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">${jsonLd(ld)}</script>
<script src="/tag.js"></script>
<style>
${read('_town-template-style.css')}
${CSS}
.hri-wrap{margin:26px 0 0;overflow-x:auto;-webkit-overflow-scrolling:touch}
.hri{width:100%;border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums}
.hri th{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(234,239,245,.58);text-align:right;vertical-align:bottom;padding:0 0 10px 12px;border-bottom:1px solid rgba(234,239,245,.14)}
.hri th button{font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;background:none;border:0;padding:6px 0;cursor:pointer;text-align:inherit}
.hri th button:hover,.hri th[aria-sort=ascending] button,.hri th[aria-sort=descending] button{color:var(--teal)}
.hri td{padding:11px 0 11px 12px;border-bottom:1px solid rgba(234,239,245,.08);color:rgba(234,239,245,.73);text-align:right;vertical-align:top}
.hri th:first-child,.hri td:first-child{padding-left:0;text-align:left}
.hri td:first-child{color:var(--gold)}
.hri th:nth-child(2),.hri td:nth-child(2){text-align:left}
.hri a{color:var(--pearl);border-bottom:1px solid rgba(234,239,245,.14)}
.hri a:hover{color:var(--teal);border-color:var(--teal)}
.hri .m{display:block;font-size:11px;color:rgba(234,239,245,.58);margin:2px 0 0}
.hri tr:target td{background:rgba(79,181,190,.08)}
.hri-defs{margin:26px 0 0;border-top:1px solid rgba(234,239,245,.08)}
.hri-defs div{padding:14px 0;border-bottom:1px solid rgba(234,239,245,.08)}
.hri-defs dt{font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--pearl)}
.hri-defs dd{color:rgba(234,239,245,.70);font-size:14px;line-height:1.65;margin:6px 0 0}
.hri .sm{display:none}
@media(max-width:520px){.hri{font-size:12.5px}.hri th,.hri td{padding-left:7px}.hri th{letter-spacing:.06em}.hri .lg{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.hri .sm{display:inline}.hri .m{font-size:10.5px}}
</style>
<link rel="stylesheet" href="/assets/theme/galaxy.css?v=10">
<script src="/assets/theme/galaxy.js?v=10" defer></script>
</head>
<body>

${read('_town-template-nav.html')}

<header class="tp-hero">
  <img src="/portfolio/images/wall-granite-steps.jpg" alt="" aria-hidden="true">
  <div class="veil"></div>
  <div class="tp-wrap">
    <p class="eyebrow">Massachusetts &nbsp;·&nbsp; ${n} towns &nbsp;·&nbsp; ${UPDATED}</p>
    <h1>Massachusetts Hardscape<br><em>Replacement Index</em>.</h1>
    <p class="tp-lede">Every Massachusetts town with ${INDEX_MIN_HOMES} or more homes in public property records, ranked by the share of those homes built before 1980.</p>
    <a class="tp-cta" href="/estimate/">Price your project &rarr;</a>
  </div>
</header>

<div class="tp-wrap">

  <section class="tp-sec td" id="ranking" aria-labelledby="hri-h">
    <h2 class="tp-h2" id="hri-h">The ranking</h2>
    <p class="tp-p">${top.slice(0, 2).join(', ')} and ${top[2]} lead the ${n} towns. The walks, steps, walls and drives laid with a house built before 1980 are more than 45 years old.</p>
    <div class="hri-wrap">
      <table class="hri" id="hri">
        <thead><tr><th aria-sort="ascending"><button type="button"><span class="lg">Rank</span><span class="sm" aria-hidden="true">#</span></button></th><th aria-sort="none"><button type="button"><span class="lg">Town</span><span class="sm" aria-hidden="true">Town</span></button></th><th aria-sort="none"><button type="button"><span class="lg">Homes</span><span class="sm" aria-hidden="true">Homes</span></button></th><th aria-sort="none"><button type="button"><span class="lg">Median year built</span><span class="sm" aria-hidden="true">Year</span></button></th><th aria-sort="none"><button type="button"><span class="lg">Built before 1980</span><span class="sm" aria-hidden="true">Pre&#8209;1980</span></button></th><th aria-sort="none"><button type="button"><span class="lg">Sold in 24 months</span><span class="sm" aria-hidden="true">Sold</span></button></th></tr></thead>
        <tbody>
${body}
        </tbody>
      </table>
    </div>
  </section>

  <section class="tp-sec">
    <h2 class="tp-h2">How the index is built</h2>
    <dl class="hri-defs">
      <div><dt>Homes</dt><dd>Residential parcels with their own ground in the MassGIS statewide property tax parcels: one-, two- and three-family houses among them. Condominium units are not counted. Towns with fewer than ${INDEX_MIN_HOMES} homes on record are left out.</dd></div>
      <div><dt>Built before 1980</dt><dd>The share of a town’s homes on record whose year built is 1979 or earlier. The ranking sorts on this figure, highest first; a tie goes to the town with the older median year.</dd></div>
      <div><dt>Median year built</dt><dd>The middle year built among the town’s homes on record.</dd></div>
      <div><dt>Sold in 24 months</dt><dd>Sales over $1,000 recorded on a single home, in the 24 months to the month shown. Shown for the ${fresh.length} towns whose record runs into the last twelve months.</dd></div>
    </dl>
    <p class="td-src">Source: MassGIS statewide property tax parcels; updated ${UPDATED}.</p>
  </section>

  <section class="tp-ask">
    <h2>A number before anyone visits.</h2>
    <p class="tp-p">Trace your patio on a satellite view of your own property, or send a photograph
      of the job, and the page prices it. The on-site visit is free and it is what makes it exact.</p>
    <p style="margin:20px 0 0"><a class="tp-cta" href="/estimate/">Price it now &rarr;</a></p>
  </section>

  <div class="tp-near">
    <p class="lbl">Services</p>
    <div class="row">
${[...SERVICES, SEAWALLS].map(([href, name]) => `      <a href="${href}">${cap(name)}</a>`).join('\n')}
      <a href="/service-area/">Service area</a>
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
      <ul><li><a href="/portfolio/">Our Work</a></li></ul>
    </div>
    <div class="footer-col">
      <h5>Divisions</h5>
      <ul><li><a href="/hardscape-gallery.html">Hardscape</a></li></ul>
    </div>
    <div class="footer-col">
      <h5>Connect</h5>
      <ul><li><a href="tel:+15612991261">(561) 299-1261</a></li><li><a href="/estimate/">Instant estimate</a></li><li><a href="/blog">Journal</a></li><li><a href="/contact.html">Contact</a></li><li><a href="/service-area/">Service area</a></li></ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">Phaöra · MMXXVI &nbsp;·&nbsp; New England &nbsp;·&nbsp; All rights reserved</span>
    <span class="footer-coords">42°21′N 71°03′W</span>
  </div>
</footer>

<script>
${read('_town-template-script.js')}
</script>
<script>
// The table is complete without this; it only re-sorts by a column on click.
(function(){
  var t=document.getElementById('hri');if(!t)return;
  var heads=t.tHead.rows[0].cells,body=t.tBodies[0];
  Array.prototype.forEach.call(heads,function(th,col){
    th.querySelector('button').addEventListener('click',function(){
      var asc=th.getAttribute('aria-sort')!=='ascending';
      Array.prototype.forEach.call(heads,function(h){h.setAttribute('aria-sort','none')});
      th.setAttribute('aria-sort',asc?'ascending':'descending');
      var rows=Array.prototype.slice.call(body.rows);
      rows.sort(function(a,b){
        var x=a.cells[col].getAttribute('data-v'),y=b.cells[col].getAttribute('data-v');
        var nx=parseFloat(x),ny=parseFloat(y);
        var c=(isNaN(nx)||isNaN(ny))?x.localeCompare(y):nx-ny;
        return asc?c:-c;
      });
      rows.forEach(function(r){body.appendChild(r)});
    });
  });
})();
</script>
</body>
</html>
`;
}

module.exports = {
  COMPUTED_ON, AREAS, START, END, HEAD_START, HEAD_END,
  plan, figures, index, faq, partsText, headBlock, bodyBlock, inject, indexPage,
};
