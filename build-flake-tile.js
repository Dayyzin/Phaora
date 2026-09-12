#!/usr/bin/env node
/* ============================================================================
 * PHAÖRA — the gold flake field
 *
 *   node build-flake-tile.js
 *
 * The shop sits on the same ground the photography does: black, with gold leaf
 * suspended in it. assets/shop/backdrop-source.png is the studio plate that
 * ground comes from.
 *
 * This lifts the individual flakes out of that plate and re-scatters them into
 * a seamless tile, assets/shop/flakes.png, which the page repeats. Two reasons
 * it is rebuilt rather than used directly:
 *
 *   - the plate has a lamp burning in the top third. Tiled, that lamp would
 *     repeat down the page as a row of suns. The glow belongs to the top of the
 *     page only, and it is a CSS gradient there.
 *   - a plate repeated is a pattern you can see. Flakes drawn with wrap-around
 *     — every sprite also painted at ±tile width and ±tile height — give a tile
 *     whose edges match exactly, so the field reads as continuous at any
 *     length of page.
 *
 * Output is transparent, so the page colour shows through and one file covers
 * the whole site.
 * ========================================================================== */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT   = __dirname;
const SRC    = path.join(ROOT, 'assets/shop/backdrop-source.png');
const OUT    = path.join(ROOT, 'assets/shop/flakes.png');

const TILE   = 1100;   // px square
const SEED   = 7;      // fixed, so a rebuild gives the same field

if (!fs.existsSync(SRC)) {
  console.error(`missing ${path.relative(ROOT, SRC)} — put the studio plate there first`);
  process.exit(1);
}

const PY = `
import sys, json, random, math
from collections import deque
from PIL import Image

src_path, out_path, tile, seed = json.loads(sys.stdin.read())
random.seed(seed)

im = Image.open(src_path).convert("RGB")
W, H = im.size
px = im.load()

# --- find the flakes -------------------------------------------------------
# Gold on black: bright, and warm enough that red clearly leads blue. The lamp
# in the top of the plate is bright but neutral, so the warmth test excludes it
# without having to mask the region by hand.
def is_gold(x, y):
    r, g, b = px[x, y]
    return r > 105 and g > 70 and (r - b) > 40

mask = bytearray(W * H)
for y in range(H):
    row = y * W
    for x in range(W):
        if is_gold(x, y):
            mask[row + x] = 1

# --- label connected blobs -------------------------------------------------
seen = bytearray(W * H)
blobs = []
for y in range(H):
    for x in range(W):
        i = y * W + x
        if not mask[i] or seen[i]:
            continue
        q = deque([(x, y)])
        seen[i] = 1
        minx = maxx = x
        miny = maxy = y
        n = 0
        while q:
            cx, cy = q.popleft()
            n += 1
            if cx < minx: minx = cx
            if cx > maxx: maxx = cx
            if cy < miny: miny = cy
            if cy > maxy: maxy = cy
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < W and 0 <= ny < H:
                    j = ny * W + nx
                    if mask[j] and not seen[j]:
                        seen[j] = 1
                        q.append((nx, ny))
        if n >= 4:
            blobs.append((n, minx, miny, maxx, maxy))

blobs.sort(reverse=True)

# --- cut each blob out as its own sprite -----------------------------------
# Alpha comes from the pixel's own brightness, so a flake keeps its soft edge
# and its specular centre instead of arriving as a hard-cut shape.
sprites = []
for n, minx, miny, maxx, maxy in blobs[:260]:
    pad = 2
    x0, y0 = max(0, minx - pad), max(0, miny - pad)
    x1, y1 = min(W, maxx + pad + 1), min(H, maxy + pad + 1)
    w, h = x1 - x0, y1 - y0
    if w < 2 or h < 2 or w > 120 or h > 120:
        continue
    sp = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sp_px = sp.load()
    for yy in range(h):
        for xx in range(w):
            r, g, b = px[x0 + xx, y0 + yy]
            lum = 0.2126*r + 0.7152*g + 0.0722*b
            warm = (r - b)
            if lum < 26 or warm < 14:
                continue
            a = int(min(255, (lum - 20) * 1.45))
            if a <= 0:
                continue
            sp_px[xx, yy] = (r, g, b, a)
    if sp.getbbox():
        sprites.append((sp, n))

if not sprites:
    print(json.dumps({"error": "no flakes found"}))
    sys.exit(1)

big   = [s for s, n in sprites if n >= 60]
mid   = [s for s, n in sprites if 16 <= n < 60]
small = [s for s, n in sprites if n < 16]
if not big:   big = [s for s, _ in sprites[:12]]
if not mid:   mid = big
if not small: small = mid

# --- scatter into a seamless tile ------------------------------------------
tile_img = Image.new("RGBA", (tile, tile), (0, 0, 0, 0))

def stamp(sprite, cx, cy, scale, angle, alpha):
    s = sprite
    if scale != 1.0:
        nw = max(1, int(s.width * scale))
        nh = max(1, int(s.height * scale))
        s = s.resize((nw, nh), Image.LANCZOS)
    if angle:
        s = s.rotate(angle, expand=True, resample=Image.BICUBIC)
    if alpha < 1.0:
        a = s.getchannel("A").point(lambda v: int(v * alpha))
        s = s.copy(); s.putalpha(a)
    ox, oy = cx - s.width // 2, cy - s.height // 2
    # wrap-around: paint the same sprite at every edge-crossing offset so the
    # tile's four sides line up with themselves
    for dx in (-tile, 0, tile):
        for dy in (-tile, 0, tile):
            tile_img.alpha_composite(s, (ox + dx, oy + dy))

# counts tuned so the field reads like the plate: mostly dust, a few real flakes
plan = [(small, 520, (0.7, 1.5), 0.35, 0.85),
        (mid,   130, (0.7, 1.6), 0.5,  0.95),
        (big,    34, (0.6, 1.5), 0.55, 1.0)]

count = 0
for pool, howmany, (smin, smax), amin, amax in plan:
    for _ in range(howmany):
        sp = random.choice(pool)
        stamp(sp,
              random.randrange(tile),
              random.randrange(tile),
              random.uniform(smin, smax),
              random.uniform(0, 360),
              random.uniform(amin, amax))
        count += 1

tile_img.save(out_path, "PNG", optimize=True)
print(json.dumps({
    "blobs": len(blobs), "sprites": len(sprites),
    "big": len(big), "mid": len(mid), "small": len(small),
    "stamped": count
}))
`;

console.log('reading the studio plate…');
const res = JSON.parse(execFileSync('python3', ['-c', PY], {
  input: JSON.stringify([SRC, OUT, TILE, SEED]),
  encoding: 'utf8',
  maxBuffer: 1 << 26
}));

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`found ${res.blobs} flakes, cut ${res.sprites} sprites (${res.big} large, ${res.mid} mid, ${res.small} dust)`);
console.log(`scattered ${res.stamped} onto a seamless ${TILE}×${TILE} tile → assets/shop/flakes.png (${kb}KB)`);
