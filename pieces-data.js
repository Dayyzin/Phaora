/*
 * PHAÖRA — shared piece data and helpers.
 * Loaded by both sculptures.html (the Index) and piece.html (the detail page).
 * Edit pieces in one place. Both pages pick up the change automatically.
 */

// ========================================================
// DATA — 44 works, sorted within each collection by price desc
// status: 'available' | 'last' | 'acquired'
// ========================================================
const PIECES = [

  // I — Blue Macaws
  { sku: 4, name: 'The Dynasty', collection: 'blue-macaws', tier: 'statement', price: 52000, material: 'Sodalite Quartet on Amethyst Tower', status: 'available', image: 'https://phaora.com/img/the-dynasty-main.jpg' },
  { sku: 7, name: 'The Portal', collection: 'blue-macaws', tier: 'statement', price: 35000, material: 'Sodalite Duo on Ring Geode', status: 'available', image: 'https://phaora.com/img/the-portal-main.jpg' },
  { sku: 43, name: 'The Sliced', collection: 'blue-macaws', tier: 'signature', price: 26000, material: 'Sodalite Macaws on Sliced Geode', status: 'available', image: 'https://phaora.com/6.png' },
  { sku: 14, name: 'The Indigos', collection: 'blue-macaws', tier: 'signature', price: 24000, material: 'Sodalite Macaw Duo on Raw Stone', status: 'available', image: 'https://phaora.com/img/IMG_6967.JPG' },
  { sku: 17, name: 'The Grotto', collection: 'blue-macaws', tier: 'signature', price: 24000, material: 'Blue Quartz Duo on Amethyst Cave', status: 'available', image: 'https://phaora.com/img/IMG_6975.JPG' },
  { sku: 28, name: 'The Eclipse', collection: 'blue-macaws', tier: 'signature', price: 24000, material: 'Sodalite Duo on Geode Slice', status: 'available', image: 'https://phaora.com/img/IMG_6960.JPG' },
  { sku: 13, name: 'The Hyacinths', collection: 'blue-macaws', tier: 'signature', price: 22000, material: 'Sodalite Macaw Duo', status: 'available', image: 'https://phaora.com/img/IMG_7038.JPG' },
  { sku: 15, name: 'The Sentinels', collection: 'blue-macaws', tier: 'signature', price: 22000, material: 'Blue Quartz Duo on Serpentine', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2022.png' },
  { sku: 25, name: 'The Soloist', collection: 'blue-macaws', tier: 'signature', price: 18500, material: 'Sodalite Solo Macaw', status: 'available', image: 'https://phaora.com/img/the-soloist-main.jpg' },

  // II — Crimson Duo
  { sku: 6, name: 'The Scarlets', collection: 'crimson-duo', tier: 'statement', price: 42000, material: 'Red Jasper Trio on Clear Quartz', status: 'available', image: 'https://phaora.com/img/IMG_6974.JPG' },
  { sku: 5, name: 'The Parliament', collection: 'crimson-duo', tier: 'statement', price: 38000, material: 'Red Jasper Trio on Serpentine', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2021.png' },
  { sku: 16, name: 'The Crimson Duo', collection: 'crimson-duo', tier: 'signature', price: 24000, material: 'Red Jasper on Clear Quartz', status: 'available', image: 'https://phaora.com/img/IMG_6961.JPG' },
  { sku: 44, name: 'The Smoke', collection: 'crimson-duo', tier: 'signature', price: 24000, material: 'Smoky Jasper Macaws on White Quartz', status: 'available', image: 'https://phaora.com/img/brown-macaws-on-white-crystal-main.jpg' },

  // III — White Cockatoos
  { sku: 41, name: 'The Cluster', collection: 'white-cockatoos', tier: 'statement', price: 44000, material: 'White Quartz Cockatoos on Amethyst Cluster', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2011.png' },
  { sku: 42, name: 'The Twins', collection: 'white-cockatoos', tier: 'signature', price: 28000, material: 'White Quartz Twins on Amethyst', status: 'available', image: 'https://phaora.com/img/twin-parrots-on-amethyst-main.jpg' },
  { sku: 10, name: 'The Cathedral', collection: 'white-cockatoos', tier: 'signature', price: 26000, material: 'Clear Quartz Duo on Amethyst', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2035.png' },
  { sku: 26, name: 'The Radiance', collection: 'white-cockatoos', tier: 'signature', price: 22000, material: 'Clear Quartz with Ruby Eyes', status: 'available', image: 'https://phaora.com/img/the-radiance-main.jpg' },
  { sku: 18, name: 'The Ethereals', collection: 'white-cockatoos', tier: 'signature', price: 20000, material: 'Clear Quartz Duo on Amethyst Tower', status: 'available', image: 'https://phaora.com/img/the-ethereals-main.jpg' },
  { sku: 24, name: 'The Violet', collection: 'white-cockatoos', tier: 'signature', price: 18500, material: 'Amethyst Solo Parrot', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2027.png' },
  { sku: 32, name: 'The Guardians', collection: 'white-cockatoos', tier: 'entry', price: 16500, material: 'Clear Quartz Duo on Geode', status: 'available', image: 'https://phaora.com/img/IMG_7051.JPG' },
  { sku: 36, name: 'The Perch', collection: 'white-cockatoos', tier: 'entry', price: 16500, material: 'White Quartz Cockatoo Duo', status: 'available', image: 'https://phaora.com/img/IMG_6958.JPG' },
  { sku: 29, name: 'The Devotion', collection: 'white-cockatoos', tier: 'entry', price: 14500, material: 'Clear Quartz Duo', status: 'available', image: 'https://phaora.com/img/IMG_7050.JPG' },
  { sku: 35, name: 'The Grace', collection: 'white-cockatoos', tier: 'entry', price: 14500, material: 'Clear Quartz Vertical Duo', status: 'available', image: 'https://phaora.com/IMG_7035.JPG' },
  { sku: 38, name: 'The Orbit', collection: 'white-cockatoos', tier: 'entry', price: 12500, material: 'Clear Quartz Compact Duo', status: 'available', image: 'https://phaora.com/IMG_6963.JPG' },

  // IV — The Canopy
  { sku: 1, name: 'The Canopy', collection: 'canopy', tier: 'statement', price: 68000, material: 'White Quartz Flock on Driftwood', status: 'available', image: 'https://phaora.com/img/IMG_6959.JPG' },
  { sku: 40, name: 'The Driftwood', collection: 'canopy', tier: 'statement', price: 68000, material: 'White Quartz Cockatoos on Driftwood', status: 'available', image: 'https://phaora.com/img/cockatoos-on-driftwood-tree-main.jpg' },
  { sku: 2, name: 'The Aerie', collection: 'canopy', tier: 'statement', price: 48000, material: 'White Quartz Eagle & Flock', status: 'available', image: 'https://phaora.com/img/IMG_6969.JPG' },
  { sku: 11, name: 'The Monolith', collection: 'canopy', tier: 'statement', price: 45000, material: 'Green Aventurine Crystal Tower', status: 'last', image: 'https://phaora.com/img/the-monolith-main.jpg' },
  { sku: 12, name: 'The Raptor', collection: 'canopy', tier: 'statement', price: 36000, material: 'Labradorite Eagle on Amethyst', status: 'available', image: 'https://phaora.com/IMG_6964.JPG' },
  { sku: 39, name: 'The Vessel', collection: 'canopy', tier: 'statement', price: 35000, material: 'Aquamarine Carved Basin', status: 'last', image: 'https://phaora.com/img/the-vessel-main.jpg' },
  { sku: 8, name: 'The Sovereign', collection: 'canopy', tier: 'statement', price: 32000, material: 'Rose Quartz Eagle', status: 'available', image: 'https://phaora.com/IMG_7047.JPG' },
  { sku: 9, name: 'The Ascent', collection: 'canopy', tier: 'statement', price: 32000, material: 'Rose Quartz Eagle on Serpentine', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2033.png' },
  { sku: 3, name: 'The Eden', collection: 'canopy', tier: 'signature', price: 28000, material: 'Rose Quartz Trio on Fountain', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2012.png' },
  { sku: 22, name: 'The Gathering', collection: 'canopy', tier: 'signature', price: 26000, material: 'Green Aventurine Trio', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2023.png' },
  { sku: 19, name: 'The Companions', collection: 'canopy', tier: 'signature', price: 22000, material: 'Rose Quartz Parrot Duo', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2017.png' },
  { sku: 20, name: 'The Lovers', collection: 'canopy', tier: 'signature', price: 22000, material: 'Rose Quartz Parrot Duo', status: 'available', image: 'https://phaora.com/img/the-lovers-main.jpg' },
  { sku: 21, name: 'The Duet', collection: 'canopy', tier: 'signature', price: 22000, material: 'Rose Quartz & Serpentine', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2016.png' },
  { sku: 23, name: 'The Courtship', collection: 'canopy', tier: 'signature', price: 22000, material: 'Rose Quartz Parrot Duo', status: 'available', image: 'https://phaora.com/img/the-courtship-main.jpg' },
  { sku: 27, name: 'The Pair', collection: 'canopy', tier: 'signature', price: 22000, material: 'Rose Quartz & Serpentine', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2034.png' },
  { sku: 33, name: 'The Herald', collection: 'canopy', tier: 'entry', price: 16500, material: 'Rose Quartz Solo Eagle', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2028.png' },
  { sku: 30, name: 'The Whisper', collection: 'canopy', tier: 'entry', price: 14500, material: 'Rose Quartz & Gold Leaf', status: 'available', image: 'https://phaora.com/img/the-whisper-main.jpg' },
  { sku: 31, name: 'The Nest', collection: 'canopy', tier: 'entry', price: 14500, material: 'Green Aventurine Duo', status: 'available', image: 'https://phaora.com/IMG_7052.JPG' },
  { sku: 34, name: 'The Embrace', collection: 'canopy', tier: 'entry', price: 14500, material: 'Rose Quartz Chalice Duo', status: 'available', image: 'https://phaora.com/Untitled%20%284320%20x%201350%20px%29%20%282160%20x%201000%20px%29%20%28720%20x%201000%20px%29%20-%2029.png' },
  { sku: 37, name: 'The Tenderness', collection: 'canopy', tier: 'entry', price: 14500, material: 'Rose Quartz Soft Duo', status: 'available', image: 'https://phaora.com/img/IMG_6962.JPG' },

  // ── THE TURNTABLE WORKS ───────────────────────────────────────────
  // Nineteen pieces shot on the turntable, each one carved from its own
  // stone — no two alike, and no two priced alike. `orbit` is what the
  // piece page leads with: twelve frames you can turn, not a photograph.
  { sku: 45, name: 'Assembly', collection: 'blue-macaws', tier: 'entry', price: 2975, material: 'Sodalite Flock on Amethyst', status: 'available', image: 'sculpture/360/IMG_1025/hero.webp', orbit: 'sculpture/360/IMG_1025' },
  { sku: 46, name: 'Council', collection: 'blue-macaws', tier: 'entry', price: 2850, material: 'Sodalite Trio on Amethyst', status: 'available', image: 'sculpture/360/IMG_1024/hero.webp', orbit: 'sculpture/360/IMG_1024' },
  { sku: 47, name: 'Hollow', collection: 'blue-macaws', tier: 'entry', price: 2775, material: 'Sodalite Macaws on Amethyst Cave', status: 'available', image: 'sculpture/360/IMG_1027/hero.webp', orbit: 'sculpture/360/IMG_1027' },
  { sku: 48, name: 'Twilight', collection: 'blue-macaws', tier: 'entry', price: 2375, material: 'Sodalite Duo on Raw Stone', status: 'available', image: 'sculpture/360/IMG_1038/hero.webp', orbit: 'sculpture/360/IMG_1038' },
  { sku: 49, name: 'Choir', collection: 'white-cockatoos', tier: 'entry', price: 2900, material: 'White Quartz Trio on Amethyst Cluster', status: 'available', image: 'sculpture/360/IMG_1047/hero.webp', orbit: 'sculpture/360/IMG_1047' },
  { sku: 50, name: 'Consorts', collection: 'white-cockatoos', tier: 'entry', price: 2725, material: 'Golden Quartz Duo on Amethyst', status: 'available', image: 'sculpture/360/IMG_1023/hero.webp', orbit: 'sculpture/360/IMG_1023' },
  { sku: 51, name: 'Veil', collection: 'white-cockatoos', tier: 'entry', price: 2625, material: 'White Quartz Duo on Amethyst', status: 'available', image: 'sculpture/360/IMG_1042/hero.webp', orbit: 'sculpture/360/IMG_1042' },
  { sku: 52, name: 'Confidants', collection: 'white-cockatoos', tier: 'entry', price: 2575, material: 'White Quartz Duo on Amethyst', status: 'available', image: 'sculpture/360/IMG_1048/hero.webp', orbit: 'sculpture/360/IMG_1048' },
  { sku: 53, name: 'Updraft', collection: 'white-cockatoos', tier: 'entry', price: 2050, material: 'White Quartz Bird on Clear Quartz', status: 'available', image: 'sculpture/360/IMG_1015/hero.webp', orbit: 'sculpture/360/IMG_1015' },
  { sku: 54, name: 'Dawn', collection: 'canopy', tier: 'entry', price: 2675, material: 'Rose & White Quartz on Amethyst', status: 'available', image: 'sculpture/360/IMG_1040/hero.webp', orbit: 'sculpture/360/IMG_1040' },
  { sku: 55, name: 'Murmur', collection: 'canopy', tier: 'entry', price: 2525, material: 'Rose Quartz Duo on Amethyst', status: 'available', image: 'sculpture/360/IMG_1051/hero.webp', orbit: 'sculpture/360/IMG_1051' },
  { sku: 56, name: 'Rosewater', collection: 'canopy', tier: 'entry', price: 2475, material: 'Rose & White Quartz Pair', status: 'available', image: 'sculpture/360/IMG_1046/hero.webp', orbit: 'sculpture/360/IMG_1046' },
  { sku: 57, name: 'Verdance', collection: 'canopy', tier: 'entry', price: 2425, material: 'Rose Quartz Pair on Serpentine', status: 'available', image: 'sculpture/360/IMG_1041/hero.webp', orbit: 'sculpture/360/IMG_1041' },
  { sku: 58, name: 'Moss', collection: 'canopy', tier: 'entry', price: 2300, material: 'White & Rose Quartz on Serpentine', status: 'available', image: 'sculpture/360/IMG_1043/hero.webp', orbit: 'sculpture/360/IMG_1043' },
  { sku: 59, name: 'Falcon', collection: 'canopy', tier: 'entry', price: 2250, material: 'Rose Quartz Eagle', status: 'available', image: 'sculpture/360/IMG_1012/hero.webp', orbit: 'sculpture/360/IMG_1012' },
  { sku: 60, name: 'Petal', collection: 'canopy', tier: 'entry', price: 2150, material: 'Rose Quartz Duo on Pale Stone', status: 'available', image: 'sculpture/360/IMG_1052/hero.webp', orbit: 'sculpture/360/IMG_1052' },
  { sku: 61, name: 'Emperor', collection: 'canopy', tier: 'entry', price: 1950, material: 'Carved Stone Penguin', status: 'available', image: 'sculpture/360/IMG_1003/hero.webp', orbit: 'sculpture/360/IMG_1003' },
  { sku: 62, name: 'Blush', collection: 'canopy', tier: 'entry', price: 1450, material: 'Rose Quartz Macaw on Geode', status: 'available', image: 'sculpture/360/IMG_1008/hero.webp', orbit: 'sculpture/360/IMG_1008' },
  { sku: 63, name: 'Stem', collection: 'canopy', tier: 'entry', price: 850, material: 'Rose Quartz Bloom on Gold Stem', status: 'available', image: 'sculpture/360/IMG_1005/hero.webp', orbit: 'sculpture/360/IMG_1005' },

  // Named and shot, waiting on a price before they can be listed. Leaving
  // them out of PIECES rather than guessing a number onto a sculpture:
  //   0976 Fern, 0977 Orchard, 0978 Azurite, 0979 Frost, 0980 Meadow, 0981 Plume, 0982 Flare, 0983 Alliance
  //   0985 Orb, 0987 Obelisk, 0989 Gull, 0991 Pillar, 0992 Jade, 0993 Snowcap, 0994 Cliff, 0998 Harlequin
];

// Palettes per collection — ordered from darkest to lightest.
// Per-piece gradients pick two stops from the palette based on
// a deterministic hash of the piece name, so every card is unique.
const PALETTES = {
  'blue-macaws': [
    '#1F3552', '#2C4A6B', '#3A5878', '#4E6F94', '#6B89A8',
    '#8FA6BE', '#A9BACB', '#C9B8CE', '#D9CDD9', '#EDE4EA',
  ],
  'crimson-duo': [
    '#2E120E', '#4A1D18', '#6B2A22', '#8C3A30', '#A85348',
    '#C27468', '#D49A8E', '#E4BDB0', '#EFD5C8', '#F4E5D8',
  ],
  'white-cockatoos': [
    '#2B1F3A', '#3E2E4F', '#55456A', '#6E5A82', '#8A6C8E',
    '#A788A6', '#C0A8C0', '#D8C4D8', '#E8DCE4', '#F1E8D8',
  ],
  'canopy': [
    '#2A1B10', '#3A2818', '#4A3628', '#6B4E34', '#8C6B48',
    '#A88A66', '#C9AE8A', '#D8C2A0', '#E8DCC6', '#F1E8D4',
  ],
};

// Fast string hash (djb2 variant) — stable, small, sufficient.
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Build a unique gradient per piece.
function pieceGradient(piece) {
  const palette = PALETTES[piece.collection];
  const h = hash(piece.name);
  // Pick three stops spanning the palette for depth:
  // dark anchor, mid tone, light highlight.
  const darkIdx  = h % 3;                          // 0..2
  const midIdx   = 3 + ((h >> 3) % 4);             // 3..6
  const lightIdx = 7 + ((h >> 6) % 3);             // 7..9
  const dark  = palette[darkIdx];
  const mid   = palette[midIdx];
  const light = palette[lightIdx];

  // Vary angle, highlight position, and mid stop so no two look alike.
  const angle    = 110 + ((h >> 2) % 70);          // 110..179
  const hx       = 22 + ((h >> 4) % 28);           // 22..49
  const hy       = 26 + ((h >> 5) % 28);           // 26..53
  const midStop  = 30 + ((h >> 7) % 22);           // 30..51
  const darkStop = 68 + ((h >> 8) % 18);           // 68..85

  return `
    radial-gradient(ellipse at ${hx}% ${hy}%, ${hexA(light, 0.55)} 0%, transparent 54%),
    linear-gradient(${angle}deg, ${light} 0%, ${mid} ${midStop}%, ${dark} ${darkStop}%, ${palette[0]} 100%)
  `;
}

// Convert a hex color to rgba() with given alpha.
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ========================================================
// RENDER
// Slug for DOM id — stable across re-renders
// ========================================================
function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
