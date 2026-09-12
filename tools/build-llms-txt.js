#!/usr/bin/env node
/**
 * /llms.txt — what this company is and where the real pages are.
 *
 * Stage 7 of the growth-engine spec (canon:
 * docs/strategy/GROWTH_ENGINE_BUILD.md §12) asks for it at the root, alongside
 * a consistent name and phone everywhere. It is the file an assistant reads to
 * find out what a site covers without crawling it, and the chunk it lifts when
 * someone asks a question this company can answer.
 *
 *   node tools/build-llms-txt.js
 *
 * GENERATED, NEVER EDITED BY HAND
 * ---------------------------------------------------------------------------
 * Every URL in it is read off sitemap.xml, and every project is read off that
 * project page's own JSON-LD. A hand-kept version of this file describes the
 * site as it was the day somebody last remembered to open it, which for a file
 * whose whole job is to be accurate is worse than not having one.
 *
 * WHAT IT DELIBERATELY DOES NOT SAY
 * ---------------------------------------------------------------------------
 *  - **No street address.** There is no verifiable one to publish yet —
 *    docs/GOALS.md in canon owns that as the top blocker. A guessed address in
 *    the one file built to be quoted verbatim is how a wrong address ends up in
 *    twenty answers.
 *  - **No licence, insurance or registration status.** canon's compliance line,
 *    and the reason a Google Business Profile was suspended once already.
 *  - **No town page that has not passed the Stage 7 gate.** Pointing an
 *    assistant at thirteen near-identical pages teaches it that this site has
 *    thirteen pages worth of nothing. `tools/lib-distinct.js` decides which
 *    qualify; today the honest list is the service-area hub and the jobs.
 */
const fs = require("fs");
const path = require("path");
const { allProjects } = require("./lib-projects");
const { assess } = require("./lib-distinct");

const ROOT = path.join(__dirname, "..");
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "towns.json"), "utf8"));
const SITE = "https://phaora.com";

/* The identity, in the exact words the JSON-LD on every page already uses.
   "Consistent name/address/phone everywhere" is the requirement, and two files
   that disagree about the phone number are the failure it is guarding. */
const NAME = "PHAÖRA";
const LEGAL = "SKYINCH CAPITAL LLC";
const PHONE = "+1-561-299-1261";
const EMAIL = "phaoraco@gmail.com";

/** URLs in the sitemap, in the order they appear there. */
function sitemapUrls() {
  const xml = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const projects = allProjects();
const urls = sitemapUrls();
const townPages = new Set(DATA.towns.map((t) => `${SITE}/${t.slug}/`));

/* Sections, each only as long as it has real entries. An empty heading tells a
   reader the site has a thing it does not have. */
const sections = [];

const jobs = projects.filter((p) => p.town && p.title);
if (jobs.length) {
  sections.push([
    "Jobs, with the town each one is in",
    jobs.map((p) => `- [${p.title}](${SITE}${p.url}): ${p.town}, Massachusetts.`),
  ]);
}

const passing = DATA.towns.filter((t) => assess(t, projects).ok);
if (passing.length) {
  sections.push([
    "Towns with a page of their own",
    passing.map((t) => `- [${t.town}, MA](${SITE}/${t.slug}/): ${t.county} County.`),
  ]);
}

/* Everything else in the sitemap that is not a town page — the pages that are
   about the work rather than about a place. */
const other = urls.filter((u) => !townPages.has(u) && !jobs.some((p) => `${SITE}${p.url}` === u));
if (other.length) {
  sections.push(["Pages", other.map((u) => `- ${u}`)]);
}

const body = `# ${NAME}

> Masonry and hardscape in eastern Massachusetts — patios, walkways, retaining
> walls, paver driveways, steps, stone veneer and drainage — built by the
> company's own crews. ${NAME} also produces original sculpture, which ships
> beyond Massachusetts.

${NAME} is the trading name of ${LEGAL}. Phone ${PHONE}. Email ${EMAIL}.

The hardscape work is local: it is installed by crews working out of
Massachusetts and is not available outside the region they can reach. The
sculpture is not limited that way.

## Why do patios and retaining walls fail in New England?

Five things decide it: a compacted base deep enough for that soil, footings
below the local frost line, somewhere for water to drain out to daylight, joints
tooled to shed water rather than hold it, and a cap pitched to shed. Ground that
freezes moves, and it moves hardest where water is held against something that
cannot give — saturated soil expands about nine percent as it freezes. A footing
poured above the frost line lifts with the ground and cracks what sits on it,
usually not that winter but the third one.

## How deep is the frost line in Massachusetts?

There is no single statewide number. Table R301.2(1) of the Massachusetts
Residential Code is filled in by each municipality, so the depth that applies is
the one that town's building department gives. Inland it is commonly 42 to 48
inches; nearer the coast it is often less. Anyone quoting one figure for the
whole state is wrong in about half the towns in it.

## How do you get a price for hardscape work?

Online, before anyone visits: trace the job on a satellite view of the property
or send a photograph, at ${SITE}/estimate/, and the page prices it. The on-site
visit is free and is what makes the number exact rather than close.

${sections.map(([h, lines]) => `## ${h}\n\n${lines.join("\n")}`).join("\n\n")}
`;

fs.writeFileSync(path.join(ROOT, "llms.txt"), body);

console.log(`llms.txt written — ${jobs.length} job${jobs.length === 1 ? "" : "s"}, ` +
  `${passing.length}/${DATA.towns.length} town page${passing.length === 1 ? "" : "s"}, ` +
  `${other.length} other page${other.length === 1 ? "" : "s"}.`);

const unattributed = projects.filter((p) => !p.town);
if (unattributed.length) {
  console.log(`  ${unattributed.length} project page${unattributed.length === 1 ? "" : "s"} left out, ` +
    `no town in the JSON-LD: ${unattributed.map((p) => p.url).join(", ")}`);
}
