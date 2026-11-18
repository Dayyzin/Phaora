"""Builds assets/shop/catalogue.json from the salon's own sources: the room's articles (git show of the 18 Nov
index.html, kept as assets/shop/source-room.html), assets/pieces/pieces.json and assets/walk. Nothing is typed in by
hand except SIDE and CATEGORY below, which are calls, not data (see AUDIT.md)."""
import html, json, re, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
src = open(os.path.join(HERE, 'source-room.html'), encoding='utf-8').read()
pics = json.load(open(os.path.join(ROOT, 'assets/pieces/pieces.json'), encoding='utf-8'))
ACTS = json.loads(re.search(r'<script[^>]*id="acts"[^>]*>(.*?)</script>', src, re.S).group(1))
txt = lambda s: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()
# side and category: calls (no catalogue field says either); listed in AUDIT.md for David
SIDE = {'gelosia': 'women', 'oitava': 'both', 'odara': 'both', 'itaoca': 'women', 'coema': 'both', 'voluta': 'women',
        'ritornelo': 'women', 'alvor': 'women', 'cantilena': 'both', 'coaraci': 'both', 'ofusca': 'women',
        'heliodora': 'both', 'cordel': 'both', 'carbonado-trousers': 'both', 'obolo': 'both', 'lustre': 'both'}
CAT = {'gelosia': 'outerwear', 'odara': 'outerwear', 'oitava': 'jewellery', 'lustre': 'jewellery', 'itaoca': 'bags',
       'coema': 'bags', 'voluta': 'bags', 'ritornelo': 'gloves', 'alvor': 'dresses', 'cantilena': 'knit', 'heliodora': 'knit',
       'carbonado-trousers': 'knit', 'coaraci': 'belts', 'ofusca': 'eyewear', 'cordel': 'scarves', 'obolo': 'small leather goods'}
WHOLE = re.compile(r'^(front|back|three quarter|open|flat|straight|side) view$', re.I)
out = []
for m in re.finditer(r'<article class="it" id="([\w-]+)"([^>]*)>(.*?)</article>', src, re.S):
    pid, attrs, body = m.groups()
    a = dict(re.findall(r'data-([\w-]+)="([^"]*)"', attrs))
    name = txt(re.search(r'<h2[^>]*>(.*?)</h2>', body, re.S).group(1))
    typ = txt(re.search(r'<p class="s[^"]*">(.*?)</p>', body, re.S).group(1)).replace(' · CHAPTER I', '').replace('· CHAPTER I', '').strip()
    full = re.search(r'<ul class="specs cut full">(.*?)</ul>', body, re.S).group(1)
    specs = [txt(li) for li in re.findall(r'<li>(.*?)</li>', full, re.S)]
    pr = re.search(r'<a class="price" href="([^"]*)">(.*?)</a>', body, re.S)
    keep = re.search(r'<p class="links[^"]*">.*?<a href="([^"]*)"', body, re.S)
    tile = re.search(r'<img[^>]*src="([^"]+)"', body).group(1).replace('/shadowed/', '/full/')
    d = pics.get(pid) or ({'pics': [{'src': a['full'], 'label': 'front view'}], 'details': ACTS.get(pid, {}).get('details', [])} if pid in ACTS else None)
    stack = [{'src': p['src'], 'label': p['label']} for p in d['pics']] if d else [{'src': a['full'], 'label': 'front view'}]
    labels = {s['label'].lower() for s in stack}
    for v in [x for x in a.get('views', '').split(',') if x]:   # the room's turn views, where the stack lacks that view
        lab = 'three quarter view' if 'three-quarter' in v else 'back view' if '_back' in v else 'front view' if '_front' in v else 'side view' if '_side' in v else 'view'
        if lab not in labels: stack.append({'src': v, 'label': lab}); labels.add(lab)
    stack.sort(key=lambda s: 0 if WHOLE.match(s['label']) else 1)   # whole-piece shots first, then the close-ups (stable)
    out.append({'id': pid, 'name': name, 'type': typ, 'specs': specs, 'price': txt(pr.group(2)) if pr else '',
                'href': (pr.group(1) if pr else keep.group(1) if keep else 'https://www.phaora.com/'),
                'tile': tile if not tile.endswith('disc_belt_zoom.webp') else stack[0]['src'], 'stack': stack, 'side': SIDE[pid], 'category': CAT[pid],
                'details': {k: v for k, v in (d['details'] if d else []) if k not in ('Size', 'Pre-order')}})
# size and fit: the site's own measurements page (maison/rhztw6/sizes.html), word for word, on pieces that have sizes
FLAT = 'Measured flat, in centimetres. The block is cut at size M; the other sizes follow when the block is graded.'
BLOCK = 'M is the block. S, L, XL and XXL follow when it is graded.'
HOOD = [['Body length, shoulder to hem', '72 cm'], ['Front, knitted width', '65.6 cm'], ['Front, knitted length', '64.4 cm'],
        ['Back, knitted width', '65.3 cm'], ['Shoulder, seam to seam', '71.5 cm'], ['Shoulder drop', '16.3 cm'],
        ['Sleeve length', '55.4 cm'], ['Hem band, flat', '51.5 cm']]
TROU = [['Hem, all round', '63 cm'], ['Waistband, 1x1 rib, deep', '4 cm'], ['Hem turned inside', '2.5 cm']]
OUT = ['Gelosia, Ödara and Alvor come in XS, S, M, L and XL.', 'Each is made to order, so its measurements are sent to you before it is cut. Between two sizes, write to hello@phaora.com with your chest, waist and height, and the house will answer with the size to choose.']
FIT = {'cantilena': {'p': [FLAT], 'm': HOOD, 'e': BLOCK}, 'heliodora': {'p': [FLAT], 'm': HOOD, 'e': BLOCK},
       'carbonado-trousers': {'p': [FLAT], 'm': TROU, 'e': BLOCK},
       'gelosia': {'p': OUT}, 'odara': {'p': OUT}, 'alvor': {'p': OUT},
       'ritornelo': {'p': ['Ritornelo comes in S, M and L.', 'Measure round your hand at its widest, just below the knuckles, without the thumb. Write the measurement to hello@phaora.com, and the house will answer with your size.']}}
for p in out:
    sz = [x for x in p['specs'] if x.upper().startswith('SIZE')]
    p['fit'] = dict(FIT[p['id']], sizes=sz[0][4:].strip()) if sz and p['id'] in FIT else None
    p['specs'] = [x for x in p['specs'] if not x.upper().startswith('SIZE')]
# the walkaround: only pieces that already have its frames (the room's world, assets/world/<id>/walk.json)
for p in out:
    w = ACTS.get(p['id'], {}).get('world')
    p['walkaround'] = w if w and os.path.exists(os.path.join(ROOT, w)) else ''
# the pictures, prepared (18 Nov review): each whole-piece picture cropped to the piece with a little air; on the cut-outs
# the offset side shadow is dropped and only the contact shadow under the piece kept; on the white renders the ground
# connected to the border is set to exactly #ffffff (it measured 252-255). The piece's own pixels are never touched.
# Close-ups are photographs and are used as they are. Every prepared file is a copy in assets/shop/img/.
import numpy as np
from PIL import Image, ImageDraw
WHOLE_SRC = re.compile(r' view$', re.I)
def prep(src, whole):
    path = os.path.join(ROOT, src); im = Image.open(path)
    if not whole: return src, im
    dst = 'assets/shop/img/' + src.replace('assets/', '').replace('/', '__').rsplit('.', 1)[0] + '.webp'
    if im.mode == 'RGBA':
        A = np.asarray(im).copy(); al = A[..., 3].astype(int); H, W = al.shape
        solid = al >= 200
        keep = solid.copy()
        for dy in (-2, -1, 0, 1, 2):
            for dx in (-2, -1, 0, 1, 2): keep |= np.roll(np.roll(solid, dy, 0), dx, 1)
        cols = np.where(solid.any(0))[0]
        if len(cols):
            low = H - 1 - np.argmax(solid[::-1], axis=0)        # the lowest solid pixel in each column
            band = max(4, int(H * .015)); ys = np.arange(H)[:, None]
            contact = solid.any(0)[None, :] & (ys > low[None, :]) & (ys <= low[None, :] + band)
            keep |= contact
        A[..., 3] = np.where(keep, A[..., 3], 0)
        out = Image.fromarray(A, 'RGBA'); bb = Image.fromarray(np.where(A[..., 3] > 8, 255, 0).astype('uint8')).getbbox()
    else:
        out = im.convert('RGB')
        for xy in [(0, 0), (out.width - 1, 0), (0, out.height - 1), (out.width - 1, out.height - 1)]:
            if min(out.getpixel(xy)) >= 240: ImageDraw.floodfill(out, xy, (255, 255, 255), thresh=6)
        g = np.asarray(out).min(2); bb = Image.fromarray(np.where(g < 250, 255, 0).astype('uint8')).getbbox()
    if bb:
        x0, y0, x1, y1 = bb; air = int(max(x1 - x0, y1 - y0) * .04)
        out = out.crop((max(0, x0 - air), max(0, y0 - air), min(out.width, x1 + air), min(out.height, y1 + air)))
    os.makedirs(os.path.join(ROOT, 'assets/shop/img'), exist_ok=True)
    out.save(os.path.join(ROOT, dst), 'WEBP', quality=90, method=6); return dst, out
def variant(src, whole=True):
    src, im = prep(src, whole); w, h = im.size
    r = {'src': src, 'w': w, 'h': h, 'blend': im.mode != 'RGBA' and whole}
    if w > 1300:
        dst = 'assets/shop/1200/' + src.replace('assets/', '').replace('/', '__')
        os.makedirs(os.path.join(ROOT, 'assets/shop/1200'), exist_ok=True)
        im.resize((1200, round(h * 1200 / w)), Image.LANCZOS).save(os.path.join(ROOT, dst), 'WEBP', quality=88, method=6)
        r['s1200'] = dst
    return r
for p in out:
    p['tile'] = variant(p['tile'])
    p['stack'] = [dict(variant(s['src'], bool(WHOLE_SRC.search(s['label']))), label=s['label']) for s in p['stack']]
    t, f = p['tile'], p['stack'][0]   # the front: the larger of the room's cut-out and the piece's own front render
    if f['label'] == 'front view' and t['w'] * t['h'] > f['w'] * f['h'] * 1.15: p['stack'][0] = dict(t, label='front view')
json.dump(out, open(os.path.join(HERE, 'catalogue.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'pieces')
