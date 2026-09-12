/**
 * The real projects on this site, and which town each one is in.
 *
 * Stage 7 of docs/strategy/GROWTH_ENGINE_BUILD.md (in canon) requires that a
 * town page carry at least one real project in that town, and that every
 * project page link back to its town page. Both need one thing this repo did
 * not have: a machine answer to "what town is this job in".
 *
 * WHY THE JSON-LD AND NOT THE PROSE
 * ---------------------------------------------------------------------------
 * The town is read from each project page's own `application/ld+json` block —
 * `areaServed.address.addressLocality`, or the top-level `address` — because
 * that is a claim somebody wrote deliberately, in a field that means exactly
 * one thing. Grepping the copy for town names finds "we also work in Weston"
 * in a Marlborough job and files it under Weston, which is how a page ends up
 * claiming a job that happened somewhere else.
 *
 * A page with no structured locality is reported as **unattributed**, never
 * guessed at. That is the same rule as everywhere else here: what is unknown
 * renders as nothing rather than as an invention.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/** Directories that hold one project per subdirectory. */
const PROJECT_ROOTS = ["portfolio", "projects"];

/** Subdirectories that are not projects. */
const NOT_A_PROJECT = new Set(["images", "assets"]);

function readJsonLd(html) {
  const out = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(JSON.parse(m[1]));
    } catch {
      // A malformed block is not a locality. Skipped deliberately and without
      // throwing: one bad page must not stop the build of twelve good ones.
    }
  }
  return out;
}

/** Pull `addressLocality` out of whatever shape the block happens to be. */
function localityFrom(node) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const hit = localityFrom(n);
      if (hit) return hit;
    }
    return null;
  }
  const addr = node.address;
  if (addr && typeof addr === "object" && typeof addr.addressLocality === "string") {
    return addr.addressLocality.trim();
  }
  // `areaServed` is where a Service puts it; `provider.areaServed` is the whole
  // state and is deliberately not read — "Massachusetts" is not a town.
  const area = node.areaServed;
  if (area) {
    const hit = localityFrom(area);
    if (hit) return hit;
  }
  return null;
}

function titleOf(html) {
  const m = /<title>([^<]*)<\/title>/i.exec(html);
  if (!m) return null;
  // Titles here read "Thing in Town, MA — The Name | PHAÖRA". The suffix is
  // chrome, not part of the job's name.
  return m[1].replace(/\s*\|\s*PHAÖRA\s*$/u, "").replace(/&amp;/g, "&").trim();
}

/**
 * Every project page on disk.
 *
 * Returns `{ url, dir, title, town }` with `town === null` when the page makes
 * no structured claim about where the work was.
 */
function allProjects() {
  const found = [];
  for (const root of PROJECT_ROOTS) {
    const base = path.join(ROOT, root);
    if (!fs.existsSync(base)) continue;
    for (const name of fs.readdirSync(base)) {
      if (NOT_A_PROJECT.has(name)) continue;
      const file = path.join(base, name, "index.html");
      if (!fs.existsSync(file)) continue;
      const html = fs.readFileSync(file, "utf8");
      const town = readJsonLd(html).map(localityFrom).find(Boolean) || null;
      found.push({
        url: `/${root}/${name}/`,
        dir: path.join(base, name),
        title: titleOf(html),
        town,
      });
    }
  }
  return found;
}

/** The projects in one town, matched on the town name and nothing else. */
function projectsIn(town, projects) {
  const want = String(town).trim().toLowerCase();
  return (projects || allProjects()).filter(
    (p) => p.town && p.town.toLowerCase() === want,
  );
}

module.exports = { allProjects, projectsIn, readJsonLd, localityFrom };
