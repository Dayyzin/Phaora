#!/usr/bin/env node
/* ============================================================================
 * PHAÖRA — catalog editor
 *
 *   node scripts/catalog-editor.js
 *   then open http://localhost:4600
 *
 * A local tool for entering the facts build-shop.js refuses to guess at:
 * base_material, price_usd, description, and the five specs.* dimensions —
 * currently blank or 0 on all 34 pieces because they are facts about
 * physical objects that only David knows.
 *
 * Same rule build-shop.js follows: nothing here invents a value. A field
 * left blank writes "" or 0, exactly what was there before a guess. This
 * tool's only job is to make typing the real ones fast.
 *
 * Writes straight back to assets/sculptures/catalog.json on every advance —
 * one piece at a time, so quitting halfway through piece 19 leaves 1-18
 * saved and loses nothing.
 * ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCULPTURES = path.join(ROOT, 'assets/sculptures');
const CATALOG = path.join(SCULPTURES, 'catalog.json');
const HTML_FILE = path.join(__dirname, 'catalog-editor.html');
const PORT = 4600;

const EDITABLE_FIELDS = [
  'base_material', 'base_size_lbs', 'wingspan_inches', 'carve_hours', 'price_usd', 'description',
];
const SPEC_FIELDS = ['total_height_inches', 'total_width_inches', 'total_depth_inches', 'weight_lbs_total', 'finish'];

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function readCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
}

/* Hero first, then numeric plates in order — read off disk rather than
   trusting photo_count, which is a count, not a guarantee any given file
   still exists under that name. */
function photosFor(slug) {
  const dir = path.join(SCULPTURES, slug);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
  files.sort((a, b) => {
    const heroA = a.startsWith('00-hero') ? 0 : 1;
    const heroB = b.startsWith('00-hero') ? 0 : 1;
    if (heroA !== heroB) return heroA - heroB;
    return a.localeCompare(b, undefined, { numeric: true });
  });
  return files.map((f) => `/photos/${slug}/${f}`);
}

/* Numbering doesn't need to stay contiguous — photosFor() reads whatever is
   actually on disk and sorts it, so a gap left by a delete is invisible to
   everything downstream. This only needs to find ONE name nothing is using. */
function nextPlateName(dir, ext) {
  const used = new Set(fs.readdirSync(dir));
  for (let n = 1; n < 100; n++) {
    const candidate = String(n).padStart(2, '0') + ext;
    if (!used.has(candidate)) return candidate;
  }
  throw new Error('No free plate slot under 100 — clear some out first.');
}

function pieceDir(slug) {
  const dir = path.join(SCULPTURES, slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function setHero(slug, filename) {
  const dir = pieceDir(slug);
  const target = path.join(dir, filename);
  if (!fs.existsSync(target)) throw new Error(`${filename} does not exist`);

  const currentHero = fs.readdirSync(dir).find((f) => f.startsWith('00-hero') && IMAGE_EXT.has(path.extname(f).toLowerCase()));
  if (currentHero === filename) return; // already the hero

  if (currentHero) {
    const heroExt = path.extname(currentHero);
    fs.renameSync(path.join(dir, currentHero), path.join(dir, nextPlateName(dir, heroExt)));
  }
  const ext = path.extname(filename);
  fs.renameSync(target, path.join(dir, '00-hero' + ext));
}

/* build-shop.js's own rule: a piece with no photographs does not ship. This
   tool won't create that state either — refusing the delete that would is
   cheaper than debugging a piece that silently vanished from the build. */
function deletePhoto(slug, filename) {
  const dir = pieceDir(slug);
  const target = path.join(dir, filename);
  if (!fs.existsSync(target)) throw new Error(`${filename} does not exist`);

  const remaining = fs.readdirSync(dir).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
  if (remaining.length <= 1) throw new Error('Cannot delete the last photo — a piece needs at least one to ship.');

  fs.unlinkSync(target);
  // If the hero was just deleted, promote whatever sorts first among what's
  // left rather than leave the piece heroless.
  const stillHasHero = fs.readdirSync(dir).some((f) => f.startsWith('00-hero'));
  if (!stillHasHero) {
    const survivors = photosFor(slug).map((p) => p.split('/').pop());
    if (survivors[0]) setHero(slug, survivors[0]);
  }
}

function uploadPhoto(slug, originalName, base64Data) {
  const ext = path.extname(originalName).toLowerCase();
  if (!IMAGE_EXT.has(ext)) throw new Error(`Unsupported file type "${ext}" — use jpg, png, or webp`);

  const dir = pieceDir(slug);
  const hasPhotos = fs.readdirSync(dir).some((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
  const filename = hasPhotos ? nextPlateName(dir, ext) : '00-hero' + ext;
  fs.writeFileSync(path.join(dir, filename), Buffer.from(base64Data, 'base64'));
  return filename;
}

function isFilled(v) {
  if (typeof v === 'number') return v !== 0;
  return typeof v === 'string' && v.trim() !== '';
}

function completionOf(piece) {
  const fields = [...EDITABLE_FIELDS, ...SPEC_FIELDS.map((f) => piece.specs?.[f])];
  const values = EDITABLE_FIELDS.map((f) => piece[f]).concat(SPEC_FIELDS.map((f) => piece.specs?.[f]));
  return values.every(isFilled);
}

function piecesPayload() {
  const catalog = readCatalog();
  return catalog.pieces.map((p) => ({
    slug: p.slug,
    name: p.name,
    species: p.species,
    photos: photosFor(p.slug),
    base_material: p.base_material,
    base_size_lbs: p.base_size_lbs,
    wingspan_inches: p.wingspan_inches,
    carve_hours: p.carve_hours,
    price_usd: p.price_usd,
    description: p.description,
    specs: { ...p.specs },
    complete: completionOf(p),
  }));
}

function saveOne(slug, body) {
  const catalog = readCatalog();
  const piece = catalog.pieces.find((p) => p.slug === slug);
  if (!piece) throw new Error(`No piece with slug "${slug}"`);

  for (const f of EDITABLE_FIELDS) {
    if (!(f in body)) continue;
    // Numbers stay numbers, blank numeric input writes 0 — never a guessed
    // placeholder, and never left as a string in a field the site expects
    // to do arithmetic on.
    if (typeof piece[f] === 'number') {
      piece[f] = body[f] === '' || body[f] == null ? 0 : Number(body[f]) || 0;
    } else {
      piece[f] = body[f] ?? '';
    }
  }
  if (body.specs) {
    for (const f of SPEC_FIELDS) {
      if (!(f in body.specs)) continue;
      if (typeof piece.specs[f] === 'number') {
        piece.specs[f] = body.specs[f] === '' || body.specs[f] == null ? 0 : Number(body.specs[f]) || 0;
      } else {
        piece.specs[f] = body.specs[f] ?? '';
      }
    }
  }

  fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
  return completionOf(piece);
}

function send(res, status, body, contentType) {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), 'application/json');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/') {
    send(res, 200, fs.readFileSync(HTML_FILE, 'utf8'), 'text/html; charset=utf-8');
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/pieces') {
    sendJson(res, 200, piecesPayload());
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/photos/')) {
    // slug and filename only — no traversal via this path, since anything
    // with '..' or a separator in either segment simply won't match a real
    // file under SCULPTURES and falls through to the 404 below.
    const rel = decodeURIComponent(url.pathname.slice('/photos/'.length));
    const full = path.join(SCULPTURES, rel);
    if (!full.startsWith(SCULPTURES) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
      send(res, 404, 'Not found', 'text/plain');
      return;
    }
    const ext = path.extname(full).toLowerCase();
    const type = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    send(res, 200, fs.readFileSync(full), type);
    return;
  }

  // Photo routes are checked before the plain field-save route below, since
  // both start with /api/piece/<slug> and the field-save route would
  // otherwise swallow /api/piece/<slug>/photo/... by treating the whole
  // remainder as the slug.
  const photoMatch = req.method === 'POST' && url.pathname.match(/^\/api\/piece\/([^/]+)\/photo\/(hero|delete|upload)$/);
  if (photoMatch) {
    const slug = decodeURIComponent(photoMatch[1]);
    const action = photoMatch[2];
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        const body = JSON.parse(raw || '{}');
        let result = {};
        if (action === 'hero') { setHero(slug, body.filename); }
        else if (action === 'delete') { deletePhoto(slug, body.filename); }
        else if (action === 'upload') { result.filename = uploadPhoto(slug, body.originalName, body.dataBase64); }
        sendJson(res, 200, { ok: true, photos: photosFor(slug), ...result });
      } catch (err) {
        sendJson(res, 400, { ok: false, error: err.message });
      }
    });
    return;
  }

  if (req.method === 'POST' && /^\/api\/piece\/[^/]+$/.test(url.pathname)) {
    const slug = decodeURIComponent(url.pathname.slice('/api/piece/'.length));
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        const body = JSON.parse(raw || '{}');
        const complete = saveOne(slug, body);
        sendJson(res, 200, { ok: true, complete });
      } catch (err) {
        sendJson(res, 400, { ok: false, error: err.message });
      }
    });
    return;
  }

  send(res, 404, 'Not found', 'text/plain');
});

server.listen(PORT, () => {
  const catalog = readCatalog();
  const done = catalog.pieces.filter(completionOf).length;
  console.log(`Catalog editor — http://localhost:${PORT}`);
  console.log(`${done}/${catalog.pieces.length} pieces already complete`);
});
