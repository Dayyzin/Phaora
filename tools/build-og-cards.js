#!/usr/bin/env node
/**
 * The picture that shows up when a link gets texted.
 *
 * Thirteen town pages were all sharing one generic card, so sending three of
 * them to a client looked like sending the same link three times. Each town
 * gets its own photograph now, cropped to 1200x630 with the town name laid
 * over the bottom — so a Weston homeowner sees WESTON, and David can tell at a
 * glance which link he just pasted.
 *
 *   node tools/build-og-cards.js
 *
 * Writes assets/og/town-<slug>.jpg. Re-run after changing a town's photo.
 */
const fs = require("fs");
const path = require("path");
/* playwright lives in the global node install here, not in this repo. */
const { chromium } = (() => {
  for (const m of ["playwright-core", "playwright",
                   "/opt/node22/lib/node_modules/playwright"]) {
    try { return require(m); } catch { /* try the next */ }
  }
  throw new Error("playwright not found — npm i -g playwright, or set NODE_PATH");
})();

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assets", "og");
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "towns.json"), "utf8"));
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

/* The site's ink and teal. Kept literal — this runs without the stylesheet. */
const INK = "#020610", TEAL = "#4FB5BE", PEARL = "#EAEFF5";

const card = (photo, line, sub) => `<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;background:${INK};position:relative;
    font-family:'DejaVu Sans',sans-serif}
  img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  /* the photograph dims into the ink at the bottom so type always has ground */
  .veil{position:absolute;inset:0;background:
    linear-gradient(180deg,rgba(2,6,16,.30) 0%,rgba(2,6,16,0) 34%,rgba(2,6,16,.80) 76%,rgba(2,6,16,.96) 100%)}
  .bar{position:absolute;left:0;right:0;bottom:0;padding:0 64px 54px;display:flex;
    align-items:flex-end;justify-content:space-between;gap:40px}
  .town{font-size:76px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
    color:${PEARL};line-height:1;text-shadow:0 2px 30px rgba(2,6,16,.8)}
  .sub{margin-top:18px;font-size:19px;font-weight:600;letter-spacing:.30em;
    text-transform:uppercase;color:rgba(234,239,245,.62)}
  .mark{flex:0 0 auto;margin-bottom:6px}
  .rule{position:absolute;left:64px;bottom:0;width:132px;height:4px;background:${TEAL}}
</style>
<img src="${photo}">
<div class="veil"></div>
<div class="bar">
  <div><div class="town">${line}</div><div class="sub">${sub}</div></div>
  <svg class="mark" width="92" height="92" viewBox="0 0 100 100">
    <circle cx="41" cy="30" r="4" fill="${PEARL}"/>
    <circle cx="59" cy="30" r="4" fill="${PEARL}"/>
    <circle cx="50" cy="58" r="21" fill="none" stroke="${PEARL}" stroke-width="5.5"/>
  </svg>
</div>
<div class="rule"></div>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: CHROME,
    args: ["--no-sandbox", "--no-proxy-server", "--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });

  const jobs = DATA.towns.map((t) => ({
    file: `town-${t.slug}.jpg`, photo: t.photo,
    line: t.town, sub: "Masonry &amp; Hardscape",
  })).concat([{
    file: "town-service-area.jpg", photo: DATA.heroFallback,
    line: "Where we build", sub: "MetroWest &amp; Greater Boston",
  }]);

  for (const j of jobs) {
    const src = path.join(ROOT, j.photo);
    if (!fs.existsSync(src)) { console.error("missing photo:", j.photo); process.exitCode = 1; continue; }
    /* The page setContent creates is about:blank, which cannot read file://.
       Embedding the photograph is simpler than serving a directory. */
    const uri = "data:image/jpeg;base64," + fs.readFileSync(src).toString("base64");
    await p.setContent(card(uri, j.line, j.sub), { waitUntil: "load" });
    await p.waitForTimeout(120);
    await p.screenshot({ path: path.join(OUT, j.file), type: "jpeg", quality: 86 });
    const kb = Math.round(fs.statSync(path.join(OUT, j.file)).size / 1024);
    console.log(`${j.file.padEnd(30)} ${String(kb).padStart(4)}KB  ${j.photo}`);
  }
  await b.close();
  console.log(`\n${jobs.length} cards written to assets/og/`);
})();
