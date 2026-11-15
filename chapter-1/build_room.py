#!/usr/bin/env python3
"""The room's inputs for every Chapter I piece (the pin room, assets/room.js, ported from phaora-ops chapter2).

    python3 build_room.py        # from this folder; needs Pillow, numpy, scipy

For each piece in content.ROOM that has no approved room set yet, from the image its page's front slot holds now
(img/<page>/front/, the stand-in until the full render lands):
- assets/room/<id>.webp: the piece alone, cropped and framed as chapter2's build_room.py frames the room's cut-outs
  (the hem at 93% of the height, the frame no wider than 0.867 of its height);
- assets/h_<id>_L.png / _R.png: the walls' pin art, 84 x 100 heights. A piece with no print of its own shows the house Ö,
  as the Veil Coat does (assets/h_logo_L.png);
- assets/caster-<id>.bin / .json: the shadow caster, a soft volume raised from the cut-out's silhouette (build_room.py's
  pillow(), unchanged), in the room's caster units, with the Veil Coat's fit (its caster is made the same way).
The Veil Coat and the Ödara keep chapter2's approved room sets; Heliodora keeps her pin art and the Muse's caster.
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import content as C

A = os.path.join(HERE, 'assets')
COLS, ROWS = 84, 100
# the fit room.js places a pillow caster with (the Veil Coat's and the bomber's, both pillows from framed cut-outs: averaged)
PILLOW_FIT = {"scale": 2.82, "x": 0.0001, "y": 1.6847, "z": 0.9, "tilt": 0.0, "widthFactor": 1.005}


def front_src(page):
    d = os.path.join(HERE, 'img', page, 'front')
    meta = json.load(open(os.path.join(d, 'SOURCE.json')))
    files = sorted(meta['files'], key=lambda f: int(f[1:-5]))
    f = next((x for x in files if int(x[1:-5]) >= 1600), files[-1])
    return Image.open(os.path.join(d, f)), meta.get('ground')


def core_cut(im):
    """A cut-out that carries its soft ground shadow in the alpha (the line's fronts): the piece is the solid core."""
    im = im.convert('RGBA'); a = np.asarray(im).astype(np.float32); al = a[..., 3] / 255
    lum = a[..., :3].mean(-1); chroma = a[..., :3].max(-1) - a[..., :3].min(-1)
    # the piece: solid, or part-clear but not the shadow's dark neutral (a pale card in a holder, a lit edge)
    m = ndimage.binary_opening(al > 0.9, iterations=2)
    lab, n = ndimage.label(m)
    if n: s = ndimage.sum(m, lab, range(1, n + 1)); m = np.isin(lab, 1 + np.nonzero(s > 0.01 * s.max())[0])
    m = ndimage.binary_fill_holes(m) | (m & (al > 0.9))
    near = ndimage.binary_dilation(m, iterations=8)   # the piece's own soft edge kept, the ground shadow beyond it dropped
    soft = ndimage.gaussian_filter(near.astype(np.float32), 1.5) * al
    return Image.fromarray(np.dstack([a[..., :3], soft * 255]).astype(np.uint8), 'RGBA')


def ground_cut(im, H=1600, shadow=False, shade_cut=True):
    """chapter2 build_line.cutout, unchanged but for taking an image: an opaque render cut from its studio ground."""
    im = im.convert('RGB')
    if im.size[1] > H: im = im.resize((round(im.size[0] * H / im.size[1]), H), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32); h, w, _ = a.shape
    yy, xx = np.mgrid[0:h, 0:w]; b = np.zeros((h, w), bool); m = max(8, h // 40); b[:m] = b[-m:] = True; b[:, :m] = b[:, -m:] = True
    basis = lambda X, Y: np.stack([np.ones_like(X), X, Y, X * X, Y * Y, X * Y], -1)
    Bb = basis(xx[b] / w, yy[b] / h); Ba = basis(xx.ravel() / w, yy.ravel() / h)
    G = np.stack([(Ba @ np.linalg.lstsq(Bb, a[..., c][b], rcond=None)[0]).reshape(h, w) for c in range(3)], -1)
    for _ in range(3):   # a piece that reaches the frame's edge (the top-handle's still): its border pixels left out of the ground's fit
        keep = np.abs(a[b] - G[b]).max(-1) < 18
        if keep.all() or keep.sum() < 0.3 * b.sum(): break
        G = np.stack([(Ba @ np.linalg.lstsq(Bb[keep], a[..., c][b][keep], rcond=None)[0]).reshape(h, w) for c in range(3)], -1)
    if G.mean() < 60: return im.convert('RGBA')   # a dark studio ground (the top-handle's): no cut, the render as it is
    d = np.abs(a - G).max(-1); dark = np.clip((G - a).max(-1), 0, None)
    r = a / np.maximum(G, 1); k = r.mean(-1)
    shade = (k > 0.45) & (k < 0.985) & (np.abs(r - k[..., None]).max(-1) < 0.035)   # the ground only darker (a shadow on the floor), not the piece
    if not shade_cut: shade = shade & (d < 40)   # a dark, neutral piece whose lit far edge reads as a floor shadow (the card holder's back): only near-ground tones count
    core = ndimage.binary_opening((d > 14) & ~shade, iterations=3)
    filled = ndimage.binary_fill_holes(core); holes, nh = ndimage.label(filled & ~core)
    if nh:   # a hole is the piece's own pale surface only if it differs from the ground; a handle's loop does not
        md = ndimage.mean(d, holes, range(1, nh + 1)); core = core | np.isin(holes, 1 + np.nonzero(md > 6)[0])
    lab, n = ndimage.label(core)
    if n: sizes = ndimage.sum(core, lab, range(1, n + 1)); core = np.isin(lab, 1 + np.nonzero(sizes > 0.002 * h * w)[0])
    obj = ndimage.gaussian_filter(ndimage.binary_erosion(core, iterations=1).astype(np.float32), 1.0)
    near = np.clip(1 - ndimage.distance_transform_edt(~core) / (0.10 * h), 0, 1) ** 1.5
    sh = ndimage.gaussian_filter(np.clip((dark - 5) / 40.0, 0, 1) * near, 0.006 * h)   # the shadow softened (no torn edge where it meets the ground)
    alpha = np.maximum(obj, sh * (1 - obj)) if shadow else obj   # shadow=False: the piece alone (the room casts its own)
    al = np.maximum(alpha, 1e-3)[..., None]
    C = np.clip((a - (1 - al) * G) / al, 0, 255)
    out = Image.fromarray(np.dstack([C, alpha[..., None] * 255]).astype(np.uint8), 'RGBA')
    ys, xs = np.nonzero(alpha > 0.02); pad = 8
    return out.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(w, xs.max() + pad + 1), min(h, ys.max() + pad + 1)))


def dark_cut(im, H=1600, keep_pale=False):
    """chapter2 build_room.dark_cut, unchanged: a dark piece on a pale studio ground, closed over its light trims."""
    im = im.convert('RGB')
    if im.height > H: im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32); g = a.mean(-1); ch = a.max(-1) - a.min(-1)
    dark = ndimage.binary_opening(g < 120, iterations=2)
    lab, n = ndimage.label(dark); s = ndimage.sum(dark, lab, range(1, n + 1)); dark = np.isin(lab, 1 + np.nonzero(s > 0.01 * s.max())[0])
    m = ndimage.binary_closing(np.pad(dark, 30), structure=np.ones((3, 3)), iterations=14)[30:-30, 30:-30]
    m = ndimage.binary_fill_holes(m) & (True if keep_pale else ~((ch < 9) & (g > 125)))   # keep_pale: a lid's pale sheen stays (the Reel)
    m = ndimage.binary_opening(m, iterations=1)
    lab, n = ndimage.label(m); s = ndimage.sum(m, lab, range(1, n + 1)); m = np.isin(lab, 1 + np.nonzero(s > 0.01 * s.max())[0])
    h = ndimage.binary_fill_holes(m) & ~m; hl, hn = ndimage.label(h)
    if hn: hs = ndimage.sum(h, hl, range(1, hn + 1)); m = m | np.isin(hl, 1 + np.nonzero(hs < 400)[0])
    al = ndimage.gaussian_filter(m.astype(np.float32), 0.7)
    return Image.fromarray(np.dstack([a, al * 255]).astype(np.uint8), 'RGBA')


def light_cut(im, ground):
    """A bright piece on a black ground (the jewellery's velvet stand-ins): the alpha from how far it rises over the ground."""
    im = im.convert('RGB'); a = np.asarray(im).astype(np.float32)
    g = np.array([int(ground[k:k + 2], 16) for k in (1, 3, 5)], np.float32)
    d = np.clip((a - g).max(-1), 0, None)
    al = np.clip((d - 10) / 50, 0, 1)
    m = ndimage.binary_closing(al > 0.25, iterations=2)
    lab, n = ndimage.label(m)
    if n: s = ndimage.sum(m, lab, range(1, n + 1)); keep = np.isin(lab, 1 + np.nonzero(s > 0.02 * s.max())[0]); al = al * ndimage.binary_dilation(keep, iterations=2)
    C_ = np.clip((a - (1 - al[..., None]) * g) / np.maximum(al[..., None], 1e-3), 0, 255)
    out = Image.fromarray(np.dstack([C_, al * 255]).astype(np.uint8), 'RGBA')
    return out.resize((out.width * 4, out.height * 4), Image.LANCZOS)   # a 144p stand-in: up to a size the room can draw


def frame(out):
    """As chapter2's build_room.cut: cropped tight, then framed with the hem at 93% and the frame at most 0.867 wide."""
    a = np.asarray(out); ys, xs = np.nonzero(a[..., 3] > 5); pad = 2
    out = out.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), xs.max() + pad + 1, ys.max() + pad + 1))
    if out.height > 1600: out = out.resize((round(out.width * 1600 / out.height), 1600), Image.LANCZOS)
    gw, gh = out.size; Hc = round(max(gh / 0.93, gw / 0.867)); fr = Image.new('RGBA', (gw, Hc), (0, 0, 0, 0))
    fr.paste(out, (0, round(0.93 * Hc) - gh))
    return fr


def pins(pid):
    src = os.path.join(A, 'h_logo_L.png')   # no print of its own: the house Ö, as the Veil Coat
    out = Image.open(src).convert('L')
    out.save(os.path.join(A, f'h_{pid}_L.png')); out.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(A, f'h_{pid}_R.png'))


def pillow(pid, im, H=0.69, depth=0.27, grid=150):
    """chapter2 build_room.pillow, unchanged: a closed soft volume from the cut-out's silhouette."""
    al = np.asarray(im)[..., 3] > 127
    h, w = al.shape; gh = grid; gw = max(8, round(grid * w / h))
    m = np.asarray(Image.fromarray(al.astype(np.uint8) * 255).resize((gw, gh), Image.BOX)) > 127
    m = ndimage.binary_fill_holes(m)
    d = ndimage.distance_transform_edt(np.pad(m, 1))[1:-1, 1:-1]
    z = np.sqrt(np.clip(d - 0.5, 0, None) / max(d.max() - 0.5, 1)) * depth / 2
    px = H / gh
    yy, xx = np.mgrid[0:gh, 0:gw]
    X = (xx - gw / 2) * px; Y = 0.9118 + (gh - 1 - yy) * px
    used = np.zeros((gh, gw), bool)
    cells = m[:-1, :-1] & m[1:, :-1] & m[:-1, 1:] & m[1:, 1:]
    used[:-1, :-1] |= cells; used[1:, :-1] |= cells; used[:-1, 1:] |= cells; used[1:, 1:] |= cells
    idx = -np.ones((gh, gw), np.int64); n = int(used.sum()); idx[used] = np.arange(n)
    V = np.concatenate([np.stack([X[used], Y[used], z[used]], -1), np.stack([X[used], Y[used], -z[used]], -1)]).astype(np.float32)
    cy, cx = np.nonzero(cells)
    a, b, c, e = idx[cy, cx], idx[cy, cx + 1], idx[cy + 1, cx], idx[cy + 1, cx + 1]
    F = np.concatenate([np.stack([a, c, b], -1), np.stack([b, c, e], -1), np.stack([a, b, c], -1) + n, np.stack([b, e, c], -1) + n])
    assert len(V) < 65536, len(V)
    with open(os.path.join(A, f'caster-{pid}.bin'), 'wb') as fh: fh.write(V.tobytes() + F.astype(np.uint16).tobytes())
    json.dump(dict(vertices=len(V), triangles=len(F), index='u16', bounds=[V.min(0).round(4).tolist(), V.max(0).round(4).tolist()],
                   source=f'assets/room/{pid}.webp silhouette, a soft volume (build_room.py)'),
              open(os.path.join(A, f'caster-{pid}.json'), 'w'), indent=1)


def main():
    os.makedirs(os.path.join(A, 'room'), exist_ok=True)
    piece = {p['id']: p for p in C.PIECES}
    fits = {}
    for pid in C.ROOM:
        p = piece[pid]; r = p['room']
        if r.get('approved'):   # chapter2's approved set, as it is
            continue
        im, ground = front_src(p['page'])
        if r.get('cut') == 'dark':
            cut = dark_cut(Image.alpha_composite(Image.new('RGBA', im.size, (230, 230, 232, 255)), im.convert('RGBA')), keep_pale=r.get('keep_pale', False))
            ca = np.asarray(cut).astype(np.float32); b = np.concatenate([ca[:6, :, :3].reshape(-1, 3), ca[-6:, :, :3].reshape(-1, 3), ca[:, :6, :3].reshape(-1, 3), ca[:, -6:, :3].reshape(-1, 3)])
            gnd = np.median(b, 0); near = np.abs(ca[..., :3] - gnd).max(-1) < 16   # the studio's own ground caught inside a loop (a strap)
            keep = ndimage.binary_opening(~near, iterations=2); ca[..., 3] *= ndimage.gaussian_filter(keep.astype(np.float32), 0.7)
            cut = Image.fromarray(ca.astype(np.uint8), 'RGBA')
        elif ground: cut = light_cut(im, ground)
        elif im.mode == 'RGBA' and np.asarray(im)[..., 3].min() < 250: cut = core_cut(im)
        else: cut = ground_cut(im)
        if r.get('drop_white'):   # a pale studio floor baked under the piece (Coema's stand-in): near-white neutral pixels out
            ca = np.asarray(cut).astype(np.float32); lum = ca[..., :3].mean(-1); chroma = ca[..., :3].max(-1) - ca[..., :3].min(-1)
            pale = ndimage.binary_dilation((lum > 150) & (chroma < 14), iterations=2)
            ca[..., 3] *= 1 - ndimage.gaussian_filter(pale.astype(np.float32), 1.2)
            cut = Image.fromarray(ca.astype(np.uint8), 'RGBA')
        fr = frame(cut)
        fr.save(os.path.join(A, 'room', 'raw', f'{pid}.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
        if not r.get('pins'): pins(pid)
        if not r.get('caster'):
            pillow(pid, fr); fits[pid] = dict(PILLOW_FIT, geo=f'caster-{pid}')
        print(pid, fr.size)
    json.dump(fits, open(os.path.join(A, 'room', 'fits.json'), 'w'), indent=1)
    walk_cuts(piece)
    walk_mattes()
    room_finals()


def walk_cuts(piece):
    """The walk-around's other views on the product page's dark band: each stand-in view cut clean of its light ground
    shadow (assets/walk/<id>_<view>.webp), as the front's room cut-out is. A view's own master, once it lands, is used as
    it is."""
    os.makedirs(os.path.join(A, 'walk', 'raw'), exist_ok=True)
    for pid in C.ROOM:
        p = piece[pid]; r = p['room']
        for v in list(p['views'])[1:]:
            d = os.path.join(HERE, 'img', p['page'], v)
            if not os.path.exists(os.path.join(d, 'SOURCE.json')): continue
            meta = json.load(open(os.path.join(d, 'SOURCE.json')))
            if meta.get('final') or not meta.get('files'): continue
            files = sorted(meta['files'], key=lambda f: int(f[1:-5])); f = next((x for x in files if int(x[1:-5]) >= 1600), files[-1])
            im = Image.open(os.path.join(d, f)); ground = meta.get('ground')
            if r.get('cut') == 'dark': cut = dark_cut(Image.alpha_composite(Image.new('RGBA', im.size, (230, 230, 232, 255)), im.convert('RGBA')))
            elif ground and sum(int(ground[k:k + 2], 16) for k in (1, 3, 5)) < 180: cut = light_cut(im, ground)
            elif im.mode == 'RGBA' and np.asarray(im)[..., 3].min() < 250: cut = core_cut(im)
            else: cut = ground_cut(im)
            if not (ground and sum(int(ground[k:k + 2], 16) for k in (1, 3, 5)) < 180):   # not the jewellery (its crystals are grey)
                ca = np.asarray(cut).astype(np.float32); lum = ca[..., :3].mean(-1); chroma = ca[..., :3].max(-1) - ca[..., :3].min(-1)
                grey = ndimage.binary_opening((chroma < 12) & (lum > 105) & (lum < 236), iterations=2)   # a floor shadow: neutral mid-grey
                lab, n = ndimage.label(grey)
                if n: sz = ndimage.sum(grey, lab, range(1, n + 1)); grey = np.isin(lab, 1 + np.nonzero(sz > 0.004 * grey.size)[0])
                ca[..., 3] *= 1 - ndimage.gaussian_filter(ndimage.binary_dilation(grey, iterations=2).astype(np.float32), 1.2)
                cut = Image.fromarray(ca.astype(np.uint8), 'RGBA')
            a = np.asarray(cut); ys, xs = np.nonzero(a[..., 3] > 5); pad = 4
            cut = cut.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), xs.max() + pad + 1, ys.max() + pad + 1))
            if cut.height > 1600: cut = cut.resize((round(cut.width * 1600 / cut.height), 1600), Image.LANCZOS)
            cut.save(os.path.join(A, 'walk', 'raw', f'{pid}_{v}.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
            print(pid, v, cut.size)



WALK_PIECES = ('veil_coat', 'oitava', 'muse_bomber', 'po_tophandle', 'matinee', 'the_reel', 'lustre')


def walk_mattes():
    """The walk-around's dark-band images, from the raw cut-outs (assets/room/raw, assets/walk/raw) through
    build.clean_cutout: the enclosed backdrop keyed where the piece has gaps, the edge feathered and decontaminated."""
    from build import clean_cutout
    import glob
    for pid in WALK_PIECES:
        srcs = [(os.path.join(A, 'room', 'raw', f'{pid}.webp'), os.path.join(A, 'walk', f'{pid}_front.webp'))]
        srcs += [(f, os.path.join(A, 'walk', os.path.basename(f))) for f in sorted(glob.glob(os.path.join(A, 'walk', 'raw', f'{pid}_*.webp')))]
        for src, dst in srcs:
            out = clean_cutout(Image.open(src), key=pid in C.KEY_GAPS, slivers=pid in C.SLIVERS, **C.CUT_OPTS.get(pid, {}))
            out.save(dst, 'WEBP', quality=90, alpha_quality=100, method=6)
            print(os.path.basename(dst))


def room_finals():
    """The room's cut-outs (and the catalogue's, the same scene's and the rest of the line's) from their raw ones."""
    from build import clean_cutout
    for pid in C.ROOM:
        src = os.path.join(A, 'room', 'raw', f'{pid}.webp')
        clean_cutout(Image.open(src), key=pid in C.KEY_GAPS, slivers=pid in C.SLIVERS, **C.CUT_OPTS.get(pid, {})).save(
            os.path.join(A, 'room', f'{pid}.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)


if __name__ == '__main__':
    main()
