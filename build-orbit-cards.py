#!/usr/bin/env python3
# ============================================================================
# PHAÖRA — shop card derivatives for the turntable pieces.
#
#   python3 build-orbit-cards.py
#
# The turntable stills in sculpture/360/ are matted cutouts, 700-1200px on the
# long edge and 90-250KB each. Thirty-five of them is 4.6MB of grid, and the
# matte leaves a third of every frame empty, so each piece renders smaller than
# its tile. This writes one card still per piece into assets/shop/cards/ :
# cropped to the alpha bounds so the stone fills the tile, resized to 720px,
# re-encoded as WebP with the alpha kept — the transparency is the point, the
# pieces sit straight on the star field.
#
# It also writes a lighter set of the twelve frames for the one piece the shop
# front turns in its hero, so the top of the page is half a megabyte rather
# than a millstone.
#
# Sources are never touched. Idempotent: a derivative newer than its source is
# left alone.
# ============================================================================
import json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'sculpture', '360')
CARDS = os.path.join(ROOT, 'assets', 'shop', 'cards')
HERO = os.path.join(ROOT, 'assets', 'shop', 'orbit')

CARD_PX, CARD_Q = 720, 78
HERO_PX, HERO_Q = 760, 70
HERO_ID = 'IMG_0983'
MARGIN = 0.035           # a little air so the crop never shaves an edge

def still(d):
    """hero.webp where it exists, the first frame where it does not."""
    p = os.path.join(SRC, d, 'hero.webp')
    return p if os.path.exists(p) else os.path.join(SRC, d, 'f_01.webp')

def box(im, bb):
    w, h = im.size
    mx, my = int((bb[2]-bb[0])*MARGIN), int((bb[3]-bb[1])*MARGIN)
    return (max(0, bb[0]-mx), max(0, bb[1]-my), min(w, bb[2]+mx), min(h, bb[3]+my))

def write(im, dst, px, q):
    im.thumbnail((px, px), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, 'WEBP', quality=q, method=6)
    return im.size

def stale(src, dst):
    return not os.path.exists(dst) or os.path.getmtime(src) > os.path.getmtime(dst)

dims, made = {}, 0
for d in sorted(os.listdir(SRC)):
    if not d.startswith('IMG_'):
        continue
    src = still(d)
    dst = os.path.join(CARDS, d + '.webp')
    im = Image.open(src).convert('RGBA')
    bb = im.getchannel('A').getbbox() or (0, 0) + im.size
    im = im.crop(box(im, bb))
    if stale(src, dst):
        dims[d] = write(im, dst, CARD_PX, CARD_Q); made += 1
    else:
        im.thumbnail((CARD_PX, CARD_PX), Image.LANCZOS); dims[d] = im.size

# The hero turns, so all twelve frames share ONE crop box — a per-frame crop
# would make the piece swim inside its own tile as it goes round.
frames = [os.path.join(SRC, HERO_ID, 'f_%02d.webp' % i) for i in range(1, 13)]
u = None
for f in frames:
    b = Image.open(f).convert('RGBA').getchannel('A').getbbox()
    u = b if u is None else (min(u[0],b[0]), min(u[1],b[1]), max(u[2],b[2]), max(u[3],b[3]))
for i, f in enumerate(frames, 1):
    dst = os.path.join(HERO, HERO_ID, 'f_%02d.webp' % i)
    if not stale(f, dst):
        continue
    im = Image.open(f).convert('RGBA')
    write(im.crop(box(im, u)), dst, HERO_PX, HERO_Q); made += 1

print(json.dumps({'written': made, 'dims': {k: list(v) for k, v in sorted(dims.items())}}))

# --- share card -------------------------------------------------------------
# The shop front's og:image. The stills are transparent, and a transparent
# share card renders as a white box on half the platforms that unfurl it, so
# the hero piece is composited onto the page's own ground and flattened.
def og():
    dst = os.path.join(ROOT, 'assets', 'shop', 'og-shop.jpg')
    src = still(HERO_ID)
    if not stale(src, dst):
        return
    W, H = 1200, 630
    bg = Image.new('RGB', (W, H), (2, 6, 16))
    px = bg.load()
    for y in range(H):                      # the same top-down wash as .sky
        k = y / (H - 1)
        px_r = int(5 + (1 - 5) * k); px_g = int(11 + (4 - 11) * k); px_b = int(23 + (11 - 23) * k)
        for x in range(W):
            px[x, y] = (px_r, px_g, px_b)
    im = Image.open(src).convert('RGBA')
    bb = im.getchannel('A').getbbox() or (0, 0) + im.size
    im = im.crop(box(im, bb))
    im.thumbnail((int(H * 0.76), int(H * 0.76)), Image.LANCZOS)
    bg.paste(im, ((W - im.size[0]) // 2, (H - im.size[1]) // 2), im)
    bg.save(dst, 'JPEG', quality=86, optimize=True, progressive=True)

og()
