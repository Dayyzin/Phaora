#!/usr/bin/env node
/**
 * Bulk-add towns to towns.json from a CSV, so a page per town is a paste
 * rather than a typing job.
 *
 *   node tools/add-towns.js ma-towns.csv          add them
 *   node tools/add-towns.js ma-towns.csv --dry    show what would change
 *
 * The CSV wants a header and at least a town column. County is optional but
 * worth having — it is the only line on the page that says where the town is:
 *
 *   town,county
 *   Worcester,Worcester
 *   Shrewsbury,Worcester
 *
 * WHY THIS EXISTS AND NOT A HARDCODED LIST OF 351:
 *
 * Massachusetts has 351 cities and towns, and the county each one sits in is
 * a fact that goes on a public page. Writing them from memory would put a few
 * hundred assertions on the site that nobody checked, and a handful of them
 * would be wrong. So the list comes from a source you paste — mass.gov, the
 * MassGIS municipality table, Wikipedia's list of Massachusetts municipalities
 * — and this merges it in.
 *
 * A town with no county still builds. The eyebrow just names the town.
 *
 * What it will NOT do is invent `borders` or `local`. Neighbour lists and the
 * local paragraph are the two things that make a town page a real page instead
 * of a doorway page, and both are written by a person. Run the generator after
 * this and it prints exactly which towns are still missing them.
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "towns.json");
const [, , csvPath, ...flags] = process.argv;
const DRY = flags.includes("--dry");

if (!csvPath) {
  console.error("usage: node tools/add-towns.js <file.csv> [--dry]");
  process.exit(1);
}

/** Minimal CSV: header row, quoted fields, commas inside quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  const src = text.trim();
  for (let i = 0; i < src.length; i += 1) {
    const c = src[i];
    if (quoted) {
      if (c === '"') { if (src[i + 1] === '"') { field += '"'; i += 1; } else quoted = false; }
      else field += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ",") { row.push(field); field = ""; continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; continue; }
    if (c === "\r") continue;
    field += c;
  }
  row.push(field); rows.push(row);

  const header = rows.shift().map((h) => h.trim().toLowerCase());
  const townCol = header.findIndex((h) => h === "town" || h === "name" || h === "municipality");
  if (townCol === -1) throw new Error("CSV needs a 'town' column (or 'name' / 'municipality').");
  const countyCol = header.findIndex((h) => h === "county");

  return rows
    .filter((r) => r.some((c) => c.trim()))
    .map((r) => ({
      town: (r[townCol] ?? "").trim(),
      county: countyCol === -1 ? null : ((r[countyCol] ?? "").trim().replace(/\s+County$/i, "") || null),
    }))
    .filter((t) => t.town);
}

/** "West Bridgewater" -> "masonry-west-bridgewater-ma", matching the existing slugs. */
function slugFor(town) {
  const base = town
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `masonry-${base}-ma`;
}

const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const existing = new Set(data.towns.map((t) => t.slug));

/* Spread the photos so two towns in a row are not the same picture. Deterministic
   by slug, so re-running does not reshuffle pages that are already indexed. */
const PHOTOS = [...new Set(data.towns.map((t) => t.photo))].sort();
const photoFor = (slug) => {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PHOTOS[h % PHOTOS.length];
};

const incoming = parseCsv(fs.readFileSync(csvPath, "utf8"));
const added = [], skipped = [];

for (const row of incoming) {
  const slug = slugFor(row.town);
  if (existing.has(slug)) { skipped.push(row.town); continue; }
  existing.add(slug);
  const entry = { slug, town: row.town, borders: [], photo: photoFor(slug) };
  if (row.county) entry.county = row.county;
  added.push(entry);
}

// Alphabetical, so a diff of towns.json is readable rather than append-ordered.
data.towns = data.towns.concat(added).sort((a, b) => a.town.localeCompare(b.town));

console.log(`read ${incoming.length} rows`);
console.log(`  add     ${added.length}`);
console.log(`  already ${skipped.length}`);
console.log(`  total   ${data.towns.length} towns`);
const noCounty = data.towns.filter((t) => !t.county).length;
if (noCounty) console.log(`  ${noCounty} without a county — they build, the eyebrow just names the town`);
console.log(`\nEvery added town needs 'borders' and 'local' written before it is a real page.`);
console.log(`Run: node tools/build-town-pages.js   — it prints which are still blank.`);

if (DRY) { console.log("\n--dry: nothing written"); process.exit(0); }
fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n");
console.log(`\nwrote ${path.relative(process.cwd(), DATA_PATH)}`);
