#!/usr/bin/env node
/**
 * A page per town, because the competition has one and we have none.
 *
 * phaora.com names exactly one of the thirteen towns the ads target. The
 * firms bidding against us run a page per town per service — masonry-company
 * Wayland, stone-masonry Lincoln, masonry-contractor Lexington — and that is
 * why they rank there and we do not.
 *
 *   node tools/build-town-pages.js            all towns
 *   node tools/build-town-pages.js weston     one, by name or slug
 *
 * These are not doorway pages. Google throws those out, and rightly. Each one
 * carries the same thing a good guide carries — what decides whether the work
 * lasts in New England ground — plus the estimate tool and the towns around
 * it. What it does NOT carry is a single invented fact: no job we did not do,
 * no year we were not there, no frost depth nobody checked. Anything unknown
 * renders as nothing at all.
 */
const fs = require("fs");
const path = require("path");
const { chrome } = require("./lib-chrome");

const ROOT = path.join(__dirname, "..");
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "towns.json"), "utf8"));
const OFFERS = JSON.parse(fs.readFileSync(path.join(__dirname, "offers.json"), "utf8"));
const C = chrome();

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** "Wayland, Lincoln, Waltham, Newton and Wellesley" */
const list = (a) => a.length < 2 ? (a[0] || "")
  : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];

/* The work, in the words the site already uses for it. */
const TRADES = [
  ["Patios", "Concrete paver, bluestone, flagstone or brick, set on a base built for the ground it sits in."],
  ["Walkways", "Front walks, garden paths and steps — the run people use every day and notice when it moves."],
  ["Retaining walls", "Block or natural stone, drained behind and footed below the frost line."],
  ["Driveways", "Paver and cobblestone, edged and restrained so the border holds its line."],
  ["Steps and landings", "Granite, bluestone and built treads, set solid and pitched to shed."],
  ["Stone veneer", "Foundations, columns, chimneys and facades in natural and manufactured stone."],
  ["Drainage", "The part nobody sees and the reason the rest of it is still straight in twenty years."],
];

/* Straight off the journal — the five things that actually decide it. */
const LASTS = [
  ["A base that was built, not just levelled", "Compacted gravel, deep enough for the ground it sits in. Every course above copies the first one, and so does every mistake in it."],
  ["Below the frost line", "New England ground moves in winter. A footing poured above the frost line lifts with it, and the wall on top of it cracks — not that winter, usually the third one."],
  ["Somewhere for the water to go", "Saturated soil expands about nine percent when it freezes, against something that cannot move. Clean stone, fabric, and a pipe run out to daylight."],
  ["Joints shaped, not just filled", "A tooled joint sheds water off the face of the stone. A joint struck flush holds it there, and held water is what freezes."],
  ["A cap that sheds", "The top takes the weather and everything anyone sets on it. Pitched away, set solid, joints tight."],
];

const CSS = `
.tp-hero{position:relative;overflow:hidden;background:var(--navy,#020610);min-height:clamp(300px,44vh,420px);display:flex;align-items:flex-end}
.tp-hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 58%}
.tp-hero .veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,6,16,.86) 0%,rgba(2,6,16,.52) 40%,rgba(2,6,16,.72) 72%,var(--ink) 100%)}
.tp-wrap{position:relative;max-width:1000px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}
.tp-hero .tp-wrap{padding-top:120px;padding-bottom:clamp(34px,6vw,56px)}
.tp-hero h1{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(32px,7vw,56px);line-height:1.06;margin:14px 0 0;color:var(--pearl)}
.tp-hero h1 em{font-style:italic;color:var(--gold-lt)}
.tp-lede{color:rgba(234,239,245,.72);font-size:clamp(15px,3.4vw,17.5px);line-height:1.65;margin:16px 0 0;max-width:56ch}
.tp-cta{display:inline-block;margin:24px 0 0;padding:14px 26px;border:1px solid rgba(79,181,190,.45);background:rgba(79,181,190,.08);
  color:var(--teal);font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;transition:background .2s,color .2s}
.tp-cta:hover{background:var(--teal);color:var(--ink)}
.tp-sec{padding:clamp(38px,7vw,72px) 0 0}
.tp-h2{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(24px,5vw,34px);line-height:1.16;color:var(--pearl);margin:0}
.tp-p{color:rgba(234,239,245,.62);font-size:15px;line-height:1.72;margin:14px 0 0;max-width:64ch}
.tp-grid{display:grid;gap:1px;margin:26px 0 0;background:rgba(234,239,245,.08);border:1px solid rgba(234,239,245,.08)}
@media(min-width:700px){.tp-grid{grid-template-columns:1fr 1fr}}
.tp-cell{background:var(--ink);padding:20px 22px}
.tp-cell h3{font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--pearl);margin:0}
.tp-cell p{color:rgba(234,239,245,.55);font-size:14px;line-height:1.65;margin:9px 0 0}
.tp-num{counter-reset:n;margin:26px 0 0;border-top:1px solid rgba(234,239,245,.08)}
.tp-num li{counter-increment:n;list-style:none;padding:18px 0;border-bottom:1px solid rgba(234,239,245,.08);display:grid;gap:4px 18px}
@media(min-width:700px){.tp-num li{grid-template-columns:52px 1fr}}
.tp-num li::before{content:counter(n,upper-roman);font-family:'Cormorant Garamond',serif;font-style:italic;font-size:19px;color:var(--gold)}
.tp-num h3{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(19px,4vw,23px);color:var(--pearl);margin:0}
.tp-num p{color:rgba(234,239,245,.58);font-size:14.5px;line-height:1.7;margin:8px 0 0;max-width:60ch}
@media(min-width:700px){.tp-num h3,.tp-num p{grid-column:2}}
.tp-assure{display:grid;gap:1px;margin:26px 0 0;background:rgba(234,239,245,.08);border:1px solid rgba(234,239,245,.08)}
@media(min-width:700px){.tp-assure:has(>*+*){grid-template-columns:1fr 1fr}}
.tp-assure>div{background:var(--ink);padding:22px 24px;border-left:2px solid var(--teal)}
.tp-assure h3{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(19px,4vw,23px);color:var(--pearl);margin:0}
.tp-assure p{color:rgba(234,239,245,.6);font-size:14.5px;line-height:1.68;margin:9px 0 0;max-width:56ch}
.tp-ask{margin:clamp(38px,6vw,64px) 0 0;border:1px solid rgba(200,164,94,.32);padding:clamp(22px,4vw,34px)}
.tp-ask h2{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(22px,4.6vw,30px);color:var(--pearl);margin:0}
.tp-near{margin:clamp(34px,5vw,52px) 0 0;padding:22px 0 clamp(48px,8vw,84px);border-top:1px solid rgba(234,239,245,.08)}
.tp-near .lbl{font-size:10px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:rgba(234,239,245,.34);margin:0}
.tp-near .row{display:flex;flex-wrap:wrap;gap:10px 18px;margin:14px 0 0}
.tp-near a{font-size:14px;color:rgba(234,239,245,.6);border-bottom:1px solid rgba(234,239,245,.14);padding-bottom:2px}
.tp-near a:hover{color:var(--teal);border-color:var(--teal)}
`;

/* What we are allowed to promise. An offer with an empty line renders
   nothing — financing has no lender behind it yet, and a page that offers
   it anyway is a claim we cannot keep. */
function assurances() {
  const live = [OFFERS.warranty, OFFERS.financing].filter((o) => o && o.line);
  if (!live.length) return "";
  return `
  <section class="tp-sec">
    <div class="tp-assure">
${live.map((o) => `      <div><h3>${esc(o.line)}</h3><p>${esc(o.detail)}</p></div>`).join("\n")}
    </div>
  </section>`;
}

function page(t, all) {
  const bySlug = new Map(all.map((x) => [x.town, x]));
  /* Only link the neighbours we actually have a page for. */
  const near = t.borders.filter((b) => bySlug.has(b)).map((b) => bySlug.get(b));
  const title = `Masonry & Hardscape Contractor in ${t.town}, MA | PHAÖRA`;
  const desc = `Patios, walkways, retaining walls, steps and drainage in ${t.town}, Massachusetts. `
             + `Built to New England frost depth by our own crews. Free on-site estimate, and a price online in about thirty seconds.`;
  const url = `https://phaora.com/${t.slug}/`;

  const ld = {
    "@context": "https://schema.org", "@type": "GeneralContractor",
    name: "PHAÖRA", legalName: "SKYINCH CAPITAL LLC", url,
    telephone: "+1-561-299-1261", email: "phaoraco@gmail.com",
    description: desc,
    areaServed: [{ "@type": "City", name: `${t.town}, Massachusetts` }]
      .concat(t.borders.map((b) => ({ "@type": "City", name: `${b}, Massachusetts` }))),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://phaora.com/assets/og/phaora-share.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${C.fonts}" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script src="/tag.js"></script>
<style>
${C.css}
${CSS}</style>
</head>
<body>

${C.nav}

${C.mobile}

<header class="tp-hero">
  <img src="/portfolio/images/retaining-wall-lit.jpg" alt="" aria-hidden="true">
  <div class="veil"></div>
  <div class="tp-wrap">
    <p class="eyebrow">${esc(t.town)}, Massachusetts &nbsp;·&nbsp; ${esc(t.county)} County</p>
    <h1>Masonry and hardscape<br>in <em>${esc(t.town)}</em>.</h1>
    <p class="tp-lede">Patios, walkways, retaining walls, steps and drainage — built by our own crews, for ground that freezes.</p>
    <a class="tp-cta" href="/estimate/">Price your project &rarr;</a>
  </div>
</header>

<div class="tp-wrap">

  <section class="tp-sec">
    <h2 class="tp-h2">What we build in ${esc(t.town)}</h2>
    <div class="tp-grid">
${TRADES.map(([h, p]) => `      <div class="tp-cell"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("\n")}
    </div>
  </section>

  <section class="tp-sec">
    <h2 class="tp-h2">What decides whether it lasts here</h2>
    <p class="tp-p">Every wall and patio we have taken apart failed for one of these five reasons.
      They are the same in ${esc(t.town)} as anywhere else in New England, and they are most of
      what separates a job that looks right at twenty years from one that does not make five.</p>
    <ol class="tp-num">
${LASTS.map(([h, p]) => `      <li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join("\n")}
    </ol>
  </section>
${t.local ? `
  <section class="tp-sec">
    <h2 class="tp-h2">Working in ${esc(t.town)}</h2>
    <p class="tp-p">${esc(t.local)}</p>
  </section>` : ""}
${assurances()}
  <section class="tp-ask">
    <h2>A number before anyone visits.</h2>
    <p class="tp-p">Trace your patio on a satellite view of your own property, or send a photograph
      of the job, and the page prices it. The on-site visit is free and it is what makes it exact.</p>
    <p style="margin:20px 0 0"><a class="tp-cta" href="/estimate/">Price it now &rarr;</a></p>
  </section>
${near.length ? `
  <div class="tp-near">
    <p class="lbl">We also work in</p>
    <div class="row">
${near.map((n) => `      <a href="/${n.slug}/">${esc(n.town)}</a>`).join("\n")}
    </div>
  </div>` : ""}
</div>

${C.foot}

<script>
${C.nav_js}
</script>
</body>
</html>
`;
}

const want = process.argv[2] && process.argv[2].toLowerCase();
const towns = DATA.towns.filter((t) =>
  !want || t.slug === want || t.town.toLowerCase() === want || t.slug.includes(want));

if (!towns.length) { console.error(`no town matching "${want}"`); process.exit(1); }

for (const t of towns) {
  const dir = path.join(ROOT, t.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(t, DATA.towns));
  const gaps = [!t.local && "local"].filter(Boolean);
  console.log(`${t.slug.padEnd(24)} ${gaps.length ? "blank: " + gaps.join(", ") : "complete"}`);
}

/* The hub. Thirteen pages nothing links to are thirteen pages Google treats
   as orphans, so they hang off one service-area page, which hangs off the
   footer, which is on every page of the site. */
function hub(all) {
  const title = "Service Area | Masonry & Hardscape Across MetroWest and Greater Boston | PHAÖRA";
  const desc = "The towns we build in — patios, walkways, retaining walls, steps and drainage "
             + "across MetroWest and Greater Boston, by our own crews.";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="https://phaora.com/service-area/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${C.fonts}" rel="stylesheet">
<script src="/tag.js"></script>
<style>
${C.css}
${CSS}
.tp-towns{display:grid;gap:1px;margin:26px 0 0;background:rgba(234,239,245,.08);border:1px solid rgba(234,239,245,.08)}
@media(min-width:560px){.tp-towns{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.tp-towns{grid-template-columns:repeat(3,1fr)}}
.tp-towns a{background:var(--ink);padding:17px 20px;display:flex;justify-content:space-between;align-items:baseline;gap:12px;transition:background .2s}
.tp-towns a:hover{background:var(--ink2,#03080F)}
.tp-towns b{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:19px;color:var(--pearl)}
.tp-towns span{font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:rgba(234,239,245,.3)}
.tp-towns a:hover b{color:var(--gold-lt)}
</style>
</head>
<body>

${C.nav}

${C.mobile}

<header class="tp-hero">
  <img src="/portfolio/images/retaining-wall-lit.jpg" alt="" aria-hidden="true">
  <div class="veil"></div>
  <div class="tp-wrap">
    <p class="eyebrow">Service area &nbsp;·&nbsp; Massachusetts</p>
    <h1>Where we <em>build</em>.</h1>
    <p class="tp-lede">MetroWest and Greater Boston, with our own crews. If your town is not on this
      list it does not mean no — it means ask.</p>
    <a class="tp-cta" href="/estimate/">Price your project &rarr;</a>
  </div>
</header>

<div class="tp-wrap">
  <section class="tp-sec">
    <h2 class="tp-h2">The towns</h2>
    <div class="tp-towns">
${all.map((t) => `      <a href="/${t.slug}/"><b>${esc(t.town)}</b><span>${esc(t.county)}</span></a>`).join("\n")}
    </div>
  </section>

  <section class="tp-ask">
    <h2>Not sure it is worth a visit?</h2>
    <p class="tp-p">Trace the job on a satellite view of your own property, or send a photograph, and
      the page prices it before anyone drives out. The visit is free and it is what makes it exact.</p>
    <p style="margin:20px 0 0"><a class="tp-cta" href="/estimate/">Price it now &rarr;</a></p>
  </section>

  <div class="tp-near"></div>
</div>

${C.foot}

<script>
${C.nav_js}
</script>
</body>
</html>
`;
}

/* The sitemap lists the towns that actually exist on disk, so building one
   page does not advertise twelve that would 404. */
fs.mkdirSync(path.join(ROOT, "service-area"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "service-area", "index.html"), hub(DATA.towns));

const SITEMAP = path.join(ROOT, "sitemap.xml");
const live = DATA.towns.filter((t) => fs.existsSync(path.join(ROOT, t.slug, "index.html")));
let xml = fs.readFileSync(SITEMAP, "utf8");
xml = xml.replace(/\n  <!-- towns -->[\s\S]*?<!-- \/towns -->/, "");
const block = "\n  <!-- towns -->\n" +
  `  <url><loc>https://phaora.com/service-area/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n` +
  live.map((t) =>
  `  <url><loc>https://phaora.com/${t.slug}/</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`
).join("\n") + "\n  <!-- /towns -->";
fs.writeFileSync(SITEMAP, xml.replace("</urlset>", block.trimEnd() + "\n</urlset>"));

console.log(`\n${towns.length} page${towns.length === 1 ? "" : "s"} written, ${live.length} in the sitemap.`);
