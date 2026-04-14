#!/usr/bin/env node

/**
 * PHAÖRA Daily Content Rotation Script
 * Rotates ticker items, scarcity signals, and viewer count seeds
 * across all five piece pages based on the current date.
 */

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data.json');

// ── Load data ────────────────────────────────────────────────────────────────
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// ── Date helpers ─────────────────────────────────────────────────────────────
const now = new Date();

// Day index (0 = Sunday … 6 = Saturday) — used for daily rotation
const dayOfYear = Math.floor(
  (now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
);

// Week index — used for weekly scarcity rotation
const weekOfYear = Math.floor(dayOfYear / 7);

// Deterministic seeded random — gives same sequence for same day+page combo
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Shuffle array using seeded random (Fisher-Yates)
function seededShuffle(arr, seed) {
  const rng = seededRandom(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick item from array using day + offset as seed
function pickByDay(arr, offset = 0) {
  return arr[(dayOfYear + offset) % arr.length];
}

// ── Ticker builder ───────────────────────────────────────────────────────────
function buildTickerHTML(pieceKey, pieceName) {
  const { locations, soldPieces, soldQuarterlyNote, tickerTimeOptions } = data;

  // Seed based on piece + day so each page is different each day
  const seed = (dayOfYear * 31 + pieceKey.length * 7) % 2147483646 || 1;
  const shuffledLocations = seededShuffle(locations, seed);
  const shuffledTimes = seededShuffle(tickerTimeOptions, seed + 13);
  const shuffledSold = seededShuffle(soldPieces, seed + 7);

  const items = [];

  // 6 green dot items — "Someone in [city] viewed [piece] X ago"
  for (let i = 0; i < 6; i++) {
    const city = shuffledLocations[i % shuffledLocations.length];
    const time = shuffledTimes[i % shuffledTimes.length];
    items.push(
      `<div class="ticker-item"><span class="ticker-dot green"></span>Someone in ${city} viewed ${pieceName} — ${time}</div>`
    );
  }

  // 1 red dot item — sold/acquired reference
  const soldPiece = shuffledSold[dayOfYear % shuffledSold.length];
  items.push(
    `<div class="ticker-item"><span class="ticker-dot red"></span>${soldPiece} — acquired. No longer available.</div>`
  );

  // 1 red dot item — quarterly note
  items.push(
    `<div class="ticker-item"><span class="ticker-dot red"></span>${soldQuarterlyNote} — inquiries still open for select commissions.</div>`
  );

  // Duplicate for infinite scroll animation
  const allItems = [...items, ...items];
  return allItems.join('\n        ');
}

// ── Scarcity builder ─────────────────────────────────────────────────────────
function buildScarcityHTML(pieceKey) {
  const piece = data.pieces[pieceKey];
  const pool = piece.scarcityWeeklyPool;
  const state = pool[weekOfYear % pool.length];
  return data.scarcityTemplates[state];
}

// ── Viewer seed picker ───────────────────────────────────────────────────────
function getViewerSeed(pieceKey) {
  const piece = data.pieces[pieceKey];
  const pool = piece.viewerSeedPool;
  return pool[dayOfYear % pool.length];
}

// ── HTML injection helpers ───────────────────────────────────────────────────

// Replace entire inner content of .ticker-track
function injectTicker(html, tickerHTML) {
  return html.replace(
    /(<div[^>]*class="[^"]*ticker-track[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/,
    (match, open, _inner, close) => {
      return `${open}\n        ${tickerHTML}\n      ${close}`;
    }
  );
}

// Replace inner HTML of .scarcity-box
function injectScarcity(html, scarcityHTML) {
  return html.replace(
    /(<div[^>]*class="[^"]*scarcity-box[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/,
    (match, open, _inner, close) => {
      return `${open}${scarcityHTML}${close}`;
    }
  );
}

// Replace the counts array in the inline <script> at the bottom
// Matches: const counts = [...]; or let counts = [...]; or var counts = [...];
function injectViewerSeed(html, seedArray) {
  const seedStr = JSON.stringify(seedArray);
  return html.replace(
    /((?:const|let|var)\s+counts\s*=\s*)\[[\d,\s]*\]/,
    `$1${seedStr}`
  );
}

// ── Main loop ────────────────────────────────────────────────────────────────
console.log(`\nPHAÖRA Daily Rotation — ${now.toISOString()}`);
console.log(`Day of year: ${dayOfYear} | Week of year: ${weekOfYear}\n`);

for (const [pieceKey, pieceConfig] of Object.entries(data.pieces)) {
  const filePath = path.join(ROOT, pieceConfig.file);

  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  File not found, skipping: ${pieceConfig.file}`);
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Ticker
  const tickerHTML = buildTickerHTML(pieceKey, pieceConfig.displayName);
  html = injectTicker(html, tickerHTML);

  // 2. Scarcity
  const scarcityHTML = buildScarcityHTML(pieceKey);
  html = injectScarcity(html, scarcityHTML);

  // 3. Viewer seed
  const seed = getViewerSeed(pieceKey);
  html = injectViewerSeed(html, seed);

  fs.writeFileSync(filePath, html, 'utf8');

  console.log(`  ✓ ${pieceConfig.file}`);
  console.log(`      Scarcity: ${data.pieces[pieceKey].scarcityWeeklyPool[weekOfYear % 7]}`);
  console.log(`      Viewer seed: ${JSON.stringify(seed)}`);
}

console.log('\nRotation complete.\n');
