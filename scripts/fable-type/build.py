import cv2, numpy as np, potrace, sys, json
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen

UP = 3  # supersample before tracing

def masks(path):
    im = cv2.imread(path).astype(np.float32)
    B, G, R = im[..., 0], im[..., 1], im[..., 2]
    white = np.clip((R - 10) / (236 - 10), 0, 1)
    teal = np.clip((B - R - 8) / (111 - 8), 0, 1)
    return white, teal

def glyph_bitmap(soft, y0, y1, x0, x1, own_whole=True):
    """Soft mask for one glyph: pixels in [x0,x1); components that sit mostly
    inside the strip are kept whole (overhangs), mostly-outside ones dropped."""
    H, W = soft.shape
    hard = (soft > 0.5).astype(np.uint8)
    pad = 120
    ya, yb = y0, y1
    xa, xb = max(0, x0 - pad), min(W, x1 + pad)
    sub = hard[ya:yb, xa:xb]
    n, lab = cv2.connectedComponents(sub, connectivity=8)
    keep = np.zeros_like(sub, bool)
    sx0, sx1 = x0 - xa, x1 - xa
    for i in range(1, n):
        m = lab == i
        tot = m.sum()
        inside = m[:, sx0:sx1].sum()
        if tot == 0 or inside == 0:
            continue
        if inside / tot > 0.9:
            keep |= m            # whole component, overhang allowed
        else:
            mm = np.zeros_like(m); mm[:, sx0:sx1] = m[:, sx0:sx1]
            keep |= mm           # split by the strip
    # drop slivers of neighbouring letters that the cut left behind
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(keep.astype(np.uint8), connectivity=8)
    if n2 > 1:
        big = st2[1:, cv2.CC_STAT_AREA].max()
        for i in range(1, n2):
            x, y, w, h, a = st2[i]
            edge = x <= sx0 + 1 or x + w >= sx1 - 1
            if edge and a < 0.06 * big:
                keep[lab2 == i] = False
    # dilate keep a little so antialiased edge pixels come along
    k = cv2.dilate(keep.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    out = np.where(k, soft[ya:yb, xa:xb], 0)
    if not own_whole:
        pass
    return out, xa

def trace(soft, up=UP):
    big = cv2.resize(soft, None, fx=up, fy=up, interpolation=cv2.INTER_CUBIC)
    bm = potrace.Bitmap(big > 0.5)
    return bm.trace(turdsize=6 * up, alphamax=1.0, opticurve=True, opttolerance=0.2)

def draw(plist, pen, fx, shape=None):
    for curve in plist:
        pts = [curve.start_point] + [sg.end_point for sg in curve.segments]
        if shape is not None and min(p.x for p in pts) <= 0.5 and min(p.y for p in pts) <= 0.5 \
                and max(p.x for p in pts) >= shape[1] - 1.5 and max(p.y for p in pts) >= shape[0] - 1.5:
            continue  # potracer's frame around the bitmap
        pen.moveTo(fx(curve.start_point))
        for seg in curve.segments:
            if seg.is_corner:
                pen.lineTo(fx(seg.c)); pen.lineTo(fx(seg.end_point))
            else:
                pen.curveTo(fx(seg.c1), fx(seg.c2), fx(seg.end_point))
        pen.closePath()

def build(spec, out, family, upm=1000):
    glyphs, adv, cmap = {}, {}, {}
    order = ['.notdef', 'space']
    from fontTools.pens.recordingPen import RecordingPen
    nd = TTGlyphPen(None); glyphs['.notdef'] = nd.glyph(); adv['.notdef'] = (500, 0)
    sp = TTGlyphPen(None); glyphs['space'] = sp.glyph(); adv['space'] = (spec['space'], 0)
    cmap[0x20] = 'space'; cmap[0xA0] = 'space'
    for g in spec['glyphs']:
        name, soft, xa, cut0, cut1, base, scale = g['name'], g['soft'], g['xa'], g['cut0'], g['cut1'], g['base'], g['scale']
        y0 = g['y0'] - 4; xa = xa - 4
        soft = np.pad(soft, 4)
        plist = trace(soft)
        shp = (soft.shape[0] * UP, soft.shape[1] * UP)
        def fx(p, xa=xa, y0=y0):
            x = p.x / UP + xa; y = p.y / UP + y0
            return (round((x - g.get('adv', (cut0,))[0]) * scale + spec['lsb_pad']), round((base - y) * scale))
        pen = TTGlyphPen(None)
        draw(plist, Cu2QuPen(pen, max_err=1.0, reverse_direction=True), fx, shp)
        glyphs[name] = pen.glyph()
        a0, a1 = g.get('adv', (cut0, cut1))
        w = round((a1 - a0) * scale + 2 * spec['lsb_pad'])
        adv[name] = w
        order.append(name)
        for u in g['unicodes']:
            cmap[u] = name
    fb = FontBuilder(upm, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    metrics = {}
    gt = fb.font['glyf']
    for n in order:
        a = adv[n] if isinstance(adv[n], int) else adv[n][0]
        gl = gt[n]; gl.recalcBounds(gt)
        metrics[n] = (a, getattr(gl, 'xMin', 0) or 0)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=spec['ascent'], descent=-spec['descent'])
    fb.setupNameTable({'familyName': family, 'styleName': 'Regular',
                       'copyright': 'PHAÖRA', 'uniqueFontIdentifier': family + '-Regular',
                       'fullName': family + ' Regular', 'psName': family.replace(' ', '') + '-Regular'})
    fb.setupOS2(sTypoAscender=spec['ascent'], sTypoDescender=-spec['descent'], sTypoLineGap=0,
                usWinAscent=spec['ascent'], usWinDescent=spec['descent'],
                sxHeight=spec.get('xh', 400), sCapHeight=spec.get('cap', 700), fsType=0)
    fb.setupPost()
    fb.font.save(out + '.ttf')
    fb.font.flavor = 'woff2'
    fb.font.save(out + '.woff2')
    print('wrote', out, len(order) - 2, 'glyphs')
