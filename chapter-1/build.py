#!/usr/bin/env python3
"""The Chapter I site: builds every page, every image slot and SLOTS.md from content.py.

    python3 build.py            # from this folder; needs Pillow (pip install pillow)

Adding a photo: put the file in its slot's folder as master.<png|jpg|webp|tif> (a film: master.mp4), then run
build.py. The folder and the file each slot wants are in SLOTS.md. The build makes the web sizes (480 to 7680 wide,
WebP) and the srcset, and the page picks it up. Nothing else changes.
"""
import hashlib, html, json, os, re, shutil, subprocess, sys
from pathlib import Path
from PIL import Image, ImageChops

Image.MAX_IMAGE_PIXELS = None
HERE = Path(__file__).resolve().parent
# The stand-ins' sources live in phaora-ops. On phaora.com's repo (this folder is /chapter-1/) point PHAORA_OPS at a
# phaora-ops checkout to refresh them; without it every slot keeps what it already built, and masters still work.
REPO = Path(os.environ.get('PHAORA_OPS') or (HERE.parents[4] if len(HERE.parents) > 4 and (HERE.parents[4] / 'departments').exists() else HERE.parent.parent / 'phaora-ops'))
REGISTER = '/'   # the live register (phaora.com's own page); this site's copy of it is dropped
sys.path.insert(0, str(HERE))
import content as C

WIDTHS = [480, 960, 1600, 2560, 3840, 7680]
CACHE = HERE / '.cache'
SLOTS = []          # every slot, for SLOTS.md
SITE_TITLE = 'PHAÖRA'
E = html.escape


# ---------------------------------------------------------------- sources
def resolve(src):
    """A repo path (or 'git:'+path, read from HEAD when it is not checked out) -> a file on disk, or None."""
    p = src[4:] if src.startswith('git:') else src
    f = REPO / p
    if f.exists():
        return f
    CACHE.mkdir(exist_ok=True)
    c = CACHE / hashlib.sha1(p.encode()).hexdigest()[:16] / Path(p).name
    if c.exists():
        return c
    try:
        blob = subprocess.run(['git', '-C', str(REPO), 'cat-file', 'blob', 'HEAD:' + p], capture_output=True, check=True).stdout
    except subprocess.CalledProcessError:
        return None
    c.parent.mkdir(parents=True, exist_ok=True)
    c.write_bytes(blob)
    return c


def sig(f):
    st = f.stat()
    return f'{f.name}:{st.st_size}'


def bbox_of(im):
    """The piece's own box in the frame, as fractions: the alpha's box, or what differs from the ground's corner."""
    w, h = im.size
    if im.mode in ('RGBA', 'LA') and im.getchannel('A').getextrema()[0] < 250:
        b = im.getchannel('A').point(lambda a: 255 if a > 60 else 0).getbbox()
    else:
        rgb = im.convert('RGB')
        sm = rgb.resize((max(1, w // 8), max(1, h // 8)))
        bg = Image.new('RGB', sm.size, sm.getpixel((2, 2)))
        d = ImageChops.difference(sm, bg).convert('L').point(lambda v: 255 if v > 28 else 0)
        b = d.getbbox()
        if b:
            b = (b[0] * 8, b[1] * 8, b[2] * 8, b[3] * 8)
    if not b:
        return [0, 0, 1, 1]
    return [round(b[0] / w, 4), round(b[1] / h, 4), round(b[2] / w, 4), round(b[3] / h, 4)]


# ---------------------------------------------------------------- slots
class Slot:
    def __init__(self, page, name, wants, size, ratio, label, sources=(), final=False, kind='image', alt=''):
        self.page, self.name, self.wants, self.size, self.ratio, self.label = page, name, wants, size, ratio, label
        self.sources, self.final_src, self.kind, self.alt = list(sources), final, kind, alt
        self.dir = HERE / ('media' if kind == 'video' else 'img') / page / name
        self.rel = self.dir.relative_to(HERE).as_posix()
        self.state, self.now, self.files, self.w, self.h, self.bbox, self.ground = 'waiting', '', [], 0, 0, [0, 0, 1, 1], None
        self.process()
        SLOTS.append(self)

    def master(self):
        if self.dir.exists():
            for f in sorted(self.dir.glob('master.*')):
                return f
        return None

    def process(self):
        m = self.master()
        src, srcname, final = None, '', False
        if m:
            src, srcname, final = m, f'{self.rel}/{m.name}', True
        else:
            for s in self.sources:
                f = resolve(s)
                if f:
                    src, srcname = f, (s[4:] if s.startswith('git:') else s)
                    final = self.final_src
                    break
        old = json.loads((self.dir / 'SOURCE.json').read_text()) if (self.dir / 'SOURCE.json').exists() else {}
        if not src and old and all((self.dir / f).exists() for f in (old.get('files') or ['video.mp4'])):
            # its source not reachable from here (phaora-ops absent, or a checkout without it): keep the stand-in already built
            self.files = old.get('files') or ['video.mp4']
            self.w, self.h, self.bbox, self.ground = old.get('w', 0), old.get('h', 0), old.get('bbox', [0, 0, 1, 1]), old.get('ground')
            self.state = 'final' if old.get('final') else 'stand-in'
            self.now = old['source'] + ('' if self.kind == 'video' else f' ({self.w} × {self.h})')
            return
        if not src:
            if self.dir.exists():   # an old stand-in with no source left: clear its outputs
                for f in self.dir.glob('w*.webp'):
                    f.unlink()
            return
        self.dir.mkdir(parents=True, exist_ok=True)
        meta = self.dir / 'SOURCE.json'
        s = sig(src)
        old = json.loads(meta.read_text()) if meta.exists() else {}
        if self.kind == 'video':
            out = self.dir / 'video.mp4'
            if old.get('sig') != s or not out.exists():
                shutil.copyfile(src, out)
            self.files = ['video.mp4']
            meta.write_text(json.dumps({'source': srcname, 'sig': s, 'final': final}, indent=1))
        else:
            if old.get('sig') == s and all((self.dir / f).exists() for f in old.get('files', [])) and old.get('files'):
                self.files, self.w, self.h, self.bbox, self.ground = old['files'], old['w'], old['h'], old['bbox'], old.get('ground')
            else:
                for f in self.dir.glob('w*.webp'):
                    f.unlink()
                im = Image.open(src)
                im.load()
                if im.mode not in ('RGB', 'RGBA'):
                    im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
                if im.mode == 'RGBA' and im.getchannel('A').getextrema()[0] == 255:
                    im = im.convert('RGB')
                self.w, self.h = im.size
                self.bbox = bbox_of(im)
                self.ground = None if im.mode == 'RGBA' else '#%02x%02x%02x' % im.convert('RGB').resize((64, 64)).getpixel((1, 1))
                ws = [w for w in WIDTHS if w < self.w] + [min(self.w, WIDTHS[-1])]
                ws = sorted(set(ws))
                files = []
                for w in ws:
                    h = round(self.h * w / self.w)
                    r = im if w == self.w else im.resize((w, h), Image.LANCZOS)
                    fn = f'w{w}.webp'
                    r.save(self.dir / fn, 'WEBP', quality=84 if w <= 3840 else 80, method=4)
                    files.append(fn)
                self.files = files
                meta.write_text(json.dumps({'source': srcname, 'sig': s, 'final': final, 'files': files,
                                            'w': self.w, 'h': self.h, 'bbox': self.bbox, 'ground': self.ground}, indent=1))
        self.state = 'final' if final else 'stand-in'
        self.now = srcname + ('' if self.kind == 'video' else f' ({self.w} × {self.h})')

    # -- html
    def srcset(self):
        return ', '.join(f'{self.rel}/{f} {f[1:-5]}w' for f in self.files)

    def src(self, near=1600):
        best = min(self.files, key=lambda f: abs(int(f[1:-5]) - near))
        return f'{self.rel}/{best}'

    def tag(self):
        if self.state == 'final':
            return ''
        want = f'{self.rel}/master.* ({self.wants}; {self.size})'
        head = 'STAND-IN' if self.state == 'stand-in' else 'WAITS FOR'
        return f'<span class="tag">{head} · {E(want)}</span>'

    def img(self, sizes='100vw', cls='', loading='lazy', extra=''):
        r = self.ratio.replace(':', '/')
        alt = E(self.alt or self.label)
        if self.state == 'waiting':
            return (f'<figure class="slot waiting {cls}" style="--r:{r}" data-slot="{self.rel}" {extra}>'
                    f'<span class="ph"><span class="phl">{E(self.label)}</span></span>{self.tag()}</figure>')
        if self.kind == 'video':
            return (f'<figure class="slot {self.state} {cls}" style="--r:{r}" data-slot="{self.rel}" {extra}>'
                    f'<video src="{self.rel}/video.mp4" playsinline muted loop preload="metadata" aria-label="{alt}"></video>{self.tag()}</figure>')
        lo = (' lowres' if self.w < 900 else '') + (' opaque' if self.ground else '')
        return (f'<figure class="slot {self.state}{lo} {cls}" style="--r:{r}" data-slot="{self.rel}" {extra}>'
                f'<img srcset="{self.srcset()}" sizes="{sizes}" src="{self.src()}" width="{self.w}" height="{self.h}" alt="{alt}" loading="{loading}" decoding="async">'
                f'{self.tag()}</figure>')


# ---------------------------------------------------------------- page frame
NAV = [('line.html', 'The line'), ('film.html', 'The film'), ('book.html', 'The book'), ('house.html', 'The house'), (REGISTER, 'Register')]
FOOT = [('care.html', 'Care'), ('sizes.html', 'Sizes'), ('returns.html', 'Returns'), ('contact.html', 'Contact'), ('privacy.html', 'Privacy'), ('terms.html', 'Terms')]


def header(theme, here):
    lt = 'offwhite' if theme == 'dark' else 'ink'
    links = ''.join(f'<a href="{h}"{" aria-current=page" if h == here else ""}>{E(t)}</a>' for h, t in NAV)
    return (f'<header class="top"><a class="logo lettering {lt}" data-lettering="{lt}" href="index.html" aria-label="PHAÖRA, home"></a>'
            f'<nav class="nav">{links}</nav><button class="menu" type="button" aria-expanded="false" aria-controls="menu">Menu</button></header>'
            f'<div class="sheet" id="menu" hidden><nav>{links}{"".join(f"<a href={h}>{E(t)}</a>" for h, t in FOOT)}</nav></div>')


def footer(theme):
    mark = 'assets/brand/mark-cream.png' if theme == 'dark' else 'assets/brand/mark-ink.png'
    links = ''.join(f'<a href="{h}">{E(t)}</a>' for h, t in FOOT)
    return (f'<footer class="foot"><a class="mark" href="index.html" aria-label="PHAÖRA"><img src="{mark}" alt="" width="40" height="40"></a>'
            f'<nav>{links}</nav><p class="fine">PHAÖRA · Chapter I</p></footer>')


def page(fn, title, desc, body, theme='light', scripts=(), head='', here=None, bodycls=''):
    t = f'{title} · Chapter I · {SITE_TITLE}' if title else f'{SITE_TITLE} · Chapter I'
    sc = ''.join(f'<script src="{s}" defer></script>' for s in scripts)
    doc = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(t)}</title>
<meta name="description" content="{E(desc)}">
<meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="assets/brand/mark-180.png"><link rel="apple-touch-icon" href="assets/brand/mark-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<link rel="preload" href="assets/fonts/PhaoraFable-Lower-candidate.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css">{head}
</head>
<body class="{theme} {bodycls}">
{header(theme, here or fn)}
{body}
{footer(theme)}
<script src="assets/js/site.js" defer></script>{sc}
</body></html>
'''
    (HERE / fn).write_text(doc)
    PAGES.append(fn)


PAGES = []


def fa(text, tag='h2', cls=''):
    """A heading in David's face (lowercase, unicase); what it lacks (figures, marks) falls to the text face."""
    return f'<{tag} class="fa {cls}">{E(text)}</{tag}>'


def price_of(pid):
    if pid in C.PRICES:   # David, 14 Nov: the Chapter I prices (content.PRICES)
        return C.PRICES[pid]
    pr = json.loads((HERE / 'prices.json').read_text())['prices'].get(pid, {})
    if pr and not pr.get('draft') and pr.get('approved') and pr.get('price'):
        return pr['price'], pr.get('presale')
    return None, None


PIECE = {p['id']: p for p in C.PIECES}


# ---------------------------------------------------------------- brand files
def brand():
    out = HERE / 'assets' / 'brand'
    out.mkdir(parents=True, exist_ok=True)
    # David's mark (packaging/artwork/PHAORA-logo-o.png, 10 Nov), drawn light on black: the same drawing, its light
    # made the ink (on a light ground) or kept cream (on a dark one). Nothing redrawn or retouched.
    src = REPO / 'departments/apparel/packaging/artwork/PHAORA-logo-o.png'
    if not src.exists():
        return
    if not (out / 'mark-ink.png').exists() or (out / 'mark-ink.png').stat().st_mtime < src.stat().st_mtime:
        im = Image.open(src).convert('L')
        for name, col in (('mark-ink', (20, 22, 27)), ('mark-cream', (226, 221, 210))):
            a = im.resize((512, 512), Image.LANCZOS)
            rgba = Image.new('RGBA', a.size, col + (0,))
            rgba.putalpha(a)
            rgba.save(out / f'{name}.png', optimize=True)
        ic = Image.open(src).convert('RGB').resize((180, 180), Image.LANCZOS)
        ic.save(out / 'mark-180.png', optimize=True)
        Image.open(src).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(out / 'mark-1024.webp', quality=90)


# ---------------------------------------------------------------- piece pages
def piece_slots(p):
    pg = p['page']
    tall = p['ratio'] == '9:16'
    s16 = '8640 × 15360' if tall else '15360 × 8640'
    s8 = '4320 × 7680' if tall else '7680 × 4320'
    views = {}
    for i, (v, srcs) in enumerate(p['views'].items()):
        first = i == 0
        views[v] = Slot(pg, v, p['wants'].get(v) or (f'{v} view, 16K' if first else f'{v} view, 8K'),
                        '16K, ' + s16 if first else '8K, ' + s8, p['ratio'], f'{p["name"]}, {v.replace("-", " ")} view',
                        srcs, final=v in p.get('final', set()), alt=f'{p["name"]}, {p["plain"].lower()}: {v.replace("-", " ")} view')
    details = [Slot(pg, 'detail-' + k, f'{lab.lower()}, 8K close-up', '8K, 7680 × 4320', '16:9', lab, srcs, final=fin) for k, lab, srcs, fin in p['details']]
    wplace, wkept, wcode, wsrc = p['world']
    world = Slot(pg, 'world', f'{wcode}: the last frame, the world plate ({wplace.lower()})', '8K, 5760 × 7680', '3:4', f'{wplace}. {wkept}', wsrc)
    return views, details, world


def walk_band(p, views, world):
    """The dark band as the walk-around (David, 14 Nov: "a walkaround the whole piece and zooms into the details and a
    description is written in 2.5D"): scroll moves the camera round the piece and pushes in to each part; the specs are
    its notes, engraved beside each part on a leader from a pin (assets/js/walk.js, content.PIECES[i]['stops'])."""
    vdata = {v: dict(bbox=s.bbox, w=s.w or 1000, h=s.h or (1778 if p['ratio'] == '9:16' else 563), ok=s.state != 'waiting') for v, s in views.items()}
    first = next(iter(views))
    # on the dark stage the front walks on the room's clean cut-out (assets/room/<id>.webp, build_room.py): the line's
    # stand-in carries a light ground shadow in its alpha that reads as a white halo on black. A front master replaces it.
    # the other views likewise walk on their clean cut-outs (assets/walk/<id>_<view>.webp, build_room.py walk_cuts)
    cutviews = {}
    for v, sl in views.items():
        cut = HERE / 'assets' / ('room' if v == first else 'walk') / (f"{p['id']}.webp" if v == first else f"{p['id']}_{v}.webp")
        if not cut.exists():
            continue
        if sl.state == 'final' and sl.files and Image.open(sl.dir / sl.files[0]).mode == 'RGBA':   # a final cut-out walks as it is;
            continue                                                                                # one on its own opaque ground, cut out
            continue
        ci = Image.open(cut); cw, chh = ci.size
        vdata[v] = dict(bbox=bbox_of(ci), w=cw, h=chh, ok=True)
        rel = cut.relative_to(HERE).as_posix()
        cutviews[v] = (f'<figure class="slot stand-in" style="--r:{cw}/{chh}" data-slot="{sl.rel}"><img src="{rel}" '
                       f'width="{cw}" height="{chh}" alt="{E(sl.alt or sl.label)}" loading="{"eager" if v == first else "lazy"}" decoding="async"></figure>')
    stops = []
    for st in p['stops']:   # a stop on a view with no picture yet walks on the front instead
        v = st['v'] if vdata.get(st['v'], {}).get('ok') else next(iter(views))
        stops.append(dict(v=v, f=st['f'], z=st['z'], n=[dict(at=a, l=l, v=val, m=m) for a, l, val, m in st['n']]))
    walkdata = json.dumps(dict(views=vdata, stops=stops), ensure_ascii=False)
    vhtml = ''.join(f'<div class="view" data-v="{v}">{cutviews.get(v) or s.img(sizes="(min-width: 821px) 180vw, 320vw", loading="eager" if v == first else "lazy")}</div>' for v, s in views.items())
    vtags = ''.join(f'<div class="vtag" data-v="{v}">{s.tag()}</div>' for v, s in views.items())
    wbg = (f'<div class="worldbg{" soft" if world.w < 900 else ""}" style="background-image:url({world.src(1600)})"></div>' if world.state != 'waiting' else '<div class="worldbg none"></div>')
    notes = ''
    for i, st in enumerate(stops):
        for j, n in enumerate(st['n']):
            mk = f'<span class="mk">{E(n["m"])}</span>' if n['m'] else ''
            notes += (f'<div class="note" data-s="{i}" data-n="{j}"><i class="pin"></i><i class="lead"></i>'
                      f'<span class="txt"><span class="lab">{E(n["l"])}</span><span class="val">{E(n["v"])}</span>{mk}</span></div>')
    wplace, wkept, _, _ = p['world']
    return f'''<section class="walk band" aria-label="A walk around {E(p['name'])}">
  <div class="stage onblack lit{' endplate' if world.state != 'waiting' else ''}">
   <div class="floor"></div>{wbg}
   <div class="cam">{vhtml}</div><div class="vtags">{vtags}</div>
   <div class="wcap"><p class="eyebrow">Where it is going</p>{fa(wplace, 'p', 'wplace')}<p class="kept">{E(wkept)}</p></div>
   <div class="notes">{notes}</div>
   <div class="hud"><p class="eyebrow">In the world</p>{fa(p['name'], 'p', 'pname')}<p class="plain">{E(p['plain'])}</p></div>
   <div class="where"><span class="place">{E(wplace)}</span></div>
   <div class="prog"><i></i></div><p class="hint">Scroll to walk around it</p>
  </div>
  <div class="track" style="--n:{len(stops) + 1}"></div>
  <script type="application/json" class="walkdata">{walkdata}</script>
 </section>'''


def piece_page(p, prev, nxt):
    """A piece's page, top to bottom (the site rebuild, 14 Nov): (a) the piece in its world, full width (the director's
    signature shot); (b) its views beside its name, specs, price, made to order and sizes (Lustre: nothing about buying);
    (c) close-ups at 100%; (d) its scene: its page of the book, story and maker's note, and its short inline; (e) the
    pieces in the same scene; (f) the rest of the line, small."""
    pg = p['page']
    views, details, world = piece_slots(p)
    details = details + [Slot(pg, k, f'{lab.lower()}, 8K close-up', '8K, 7680 × 4320', '16:9', lab, [src]) for k, lab, src in C.MORE_DETAILS.get(p['id'], [])]
    hf, idea = C.HERO[p['id']]
    hero = Slot(pg, 'hero', f'the director’s signature shot: {idea} (story/product-stills/DIRECTOR-SHOTS.md; its 144p preview stands in)',
                '8K, 7680 × 4320', '16:9', f'{p["name"]}: {idea}', [C.PS + hf + '_256x144.png'], alt=f'{p["name"]}, {p["plain"].lower()}: {idea}')
    price, presale = price_of(p['id'])
    enq = p.get('nosale')
    # (b) the buy block
    specs = ''.join(f'<dt>{E(a)}</dt><dd>{E(b)}</dd>' for a, b in p['specs'])
    if p['sizes']:
        specs += f'<dt>SIZE</dt><dd>{" · ".join(p["sizes"])}</dd>'
    sizes = ''.join(f'<button type="button" class="sz">{s}</button>' for s in p['sizes'])
    if enq:
        buy = ''
    else:
        pr = (f'<span class="nw">{E(price)}</span>' + (f' <span class="pre">pre-sale <span class="nw">{E(presale)}</span></span>' if presale else '')) if price else ''
        buy = (f'{f"<div class=sizes role=group aria-label=Size>{sizes}</div>" if sizes else ""}{f"<p class=price>{pr}</p>" if pr else ""}<p class="mto">Made to order.</p>'
               f'<a class="cta" href="{REGISTER}">Keep a seat</a><p class="cta-note">The register sees the pre-sale first.</p>')
    policy = C.POLICY_KNIT if p['policy'] == 'knit' else C.POLICY_MADE
    more = ('' if enq else f'<dt>Pre-sale</dt><dd>{E(C.POLICY_PRESALE)}</dd><dt>Returns</dt><dd>{E(policy)}</dd>') + \
        f'<dt>Care</dt><dd>{E(C.CARE[p["care"]])} <a href="care.html">Care</a></dd><dt>Size</dt><dd><a href="sizes.html">The measurements</a></dd>'
    vlist = [(v, s) for v, s in views.items()]
    gal = ''.join(f'<div class="gv{" first" if i == 0 else ""}">{s.img(sizes="(min-width: 821px) 50vw, 100vw", loading="eager" if i == 0 else "lazy")}<p class="cap">{E(v.replace("-", " "))}</p></div>' for i, (v, s) in enumerate(vlist))
    # (c) close-ups
    strip = ''.join(f'<div class="mc">{s.img(sizes="(min-width: 821px) 25vw, 80vw")}<p class="cap">{E(s.label)}</p></div>' for s in details[:4])
    # (d) the dark band: the piece in its world (its short; the Veil Coat's is the film) and how it is made. No book here
    # (David, 14 Nov: "No book in the product page"): the story, its plate and its link live in book.html
    ch = next((c for c in C.BOOK if p['id'] in c['enter']), None)
    code = next((c for c, pid, _, _ in SHORTS if pid == p['id']), None)
    short = FILM if p['id'] == 'veil_coat' else SHORT_SLOTS.get(code) if code else None
    nb = C.BOOK_NOTES.get(p['id'])
    notes = ''
    if nb:
        h, lines, close = nb
        notes = (f'<div class="sn"><p class="eyebrow">How it is made</p><ol>' + ''.join(f'<li>{E(x)}</li>' for x in lines) +
                 f'</ol><p class="close">{E(close)}</p></div>')
    sh = ''
    if short:
        lab = 'The film' if short is FILM else f'{code}, the coming attraction'
        sh = f'<div class="short">{short.img(sizes="(min-width: 821px) 60vw, 100vw", cls="playin")}<p class="cap">{E(lab)}</p></div>'
    scene = (f'<section class="scene" id="scene"><p class="eyebrow">In the world</p><div class="scene-in">{sh}{notes}</div></section>'
             if (sh or notes) else '')
    if p['id'] in C.WALK:   # the band as the walk-around: the specs as its engraved notes
        scene = walk_band(p, views, world)
    # (e) in the same scene
    same = C.SAME.get(p['id']) or ([x for x in ch['enter'] if x != p['id']] if ch else [])
    same = [x for x in same if x in PIECE][:3]
    samehtml = ''
    if same:
        cells = ''.join(f'<a class="sc" href="{PIECE[x]["page"]}.html"><span class="im"><img src="assets/room/{x}.webp" alt="{E(PIECE[x]["name"])}" loading="lazy"></span>{fa(PIECE[x]["name"], "span", "nm")}<span class="pl">{E(PIECE[x]["plain"])}</span></a>' for x in same)
        samehtml = f'<section class="same"><p class="eyebrow">In the same scene</p><div class="sgrid">{cells}</div></section>'
    # (f) the rest of the line, small
    rest = ''.join(f'<a class="rl" href="{q["page"]}.html"><span class="im"><img src="assets/room/{q["id"]}.webp" alt="" loading="lazy"></span>{fa(q["name"], "span", "nm")}</a>' for q in C.PIECES if q['id'] != p['id'])
    hero_tag = hero.tag()
    body = f'''
<main class="pp" data-id="{p['id']}">
 <section class="hero">{hero.img(sizes="100vw", loading="eager", cls="herofig")}
  <div class="hero-cap"><p class="eyebrow">Chapter I · {E(dict(C.CATS)[p['cat']])}</p>{fa(p['name'], 'h1', 'pname')}<p class="plain">{E(p['plain'])}</p></div>
 </section>
 <section class="buy2" id="buy">
  <div class="gallery{' tall' if p['ratio'] == '9:16' else ''}">{gal}</div>
  <div class="buy-in">
   <p class="eyebrow">Chapter I</p>{fa(p['name'], 'h2', 'big')}<p class="plain">{E(p['plain'])}</p>
   <p class="about">{E(p['about'])}</p>
   <dl class="specs">{specs}</dl>
   {buy}
   <details class="more"><summary>Details</summary><dl>{more}</dl></details>
  </div>
 </section>
 <section class="macro"><p class="eyebrow">Close, at 100%</p><div class="strip">{strip}</div></section>
 {scene}
 {samehtml}
 <nav class="restline" aria-label="The rest of the line"><p class="eyebrow">The rest of the line</p><div class="rgrid">{rest}</div>
  <div class="pn"><a href="{prev['page']}.html"><span>Before</span>{fa(prev['name'], 'span')}</a><a href="index.html#catalogue" class="all">The catalogue</a><a href="{nxt['page']}.html"><span>Next</span>{fa(nxt['name'], 'span')}</a></div></nav>
</main>'''
    page(f"{pg}.html", f"{p['name']}, {p['plain'].lower()}", p['about'], body, theme='light', scripts=['assets/js/piece.js'] + (['assets/js/walk.js'] if p['id'] in C.WALK else []), here='line.html', bodycls='piecepage pp-page' + (' onblack' if p['id'] in C.WALK else ''))
    return views


# ---------------------------------------------------------------- the room (index.html)
def room_home():
    """The catalogue's front door: the intro, then the pin room (assets/room.js, chapter2's, scene unchanged), one piece a
    gesture in content.ROOM's order (Heliodora, then Gelosia, then the line); a tap on the piece opens its page. After the
    last piece the room opens into the catalogue (every piece by category). The register stays phaora.com's own (/)."""
    fits = json.loads((HERE / 'assets' / 'room' / 'fits.json').read_text())
    pins = {'muse_allover': 'muse_allover', 'veil_coat': 'veil_coat', 'muse_bomber': 'muse_bomber'}
    room = []
    for pid in C.ROOM:
        p = PIECE[pid]; r = p['room']
        w, h = Image.open(HERE / 'assets' / 'room' / f'{pid}.webp').size
        price = price_of(pid)[0]
        links = [['The piece', f"{p['page']}.html"]] + ([] if p.get('nosale') else [[f'Keep a seat · {price}' if price else 'Keep a seat', REGISTER]])
        d = dict(id=pid, name=p['name'].upper(), sub=f"{E(p['plain'].upper())} &nbsp;·&nbsp; CHAPTER I", img=f'assets/room/{pid}.webp',
                 aspect=round(w / h, 5), page=f"{p['page']}.html", caster=r.get('caster') or pid,
                 pinsL=f"assets/h_{pins.get(pid, pid)}_L.png", pinsR=f"assets/h_{pins.get(pid, pid)}_R.png", links=links)
        if r.get('specs'):
            d['specs'] = r['specs']
        room.append(d)
    cat = []
    for k, t in C.CATS:
        for p in [p for p in C.PIECES if p['cat'] == k]:
            w, h = Image.open(HERE / 'assets' / 'room' / f"{p['id']}.webp").size
            cat.append(dict(id=p['id'], name=p['name'], plain=p['plain'], page=f"{p['page']}.html", img=f"assets/room/{p['id']}.webp",
                            aspect=round(w / h, 5), cat=k))
    J = lambda o: json.dumps(o, ensure_ascii=False)
    nav = ''.join(f'<a href="{h}"{" class=p" if t in ("The line", "Register") else ""}>{E(t)}</a>' for h, t in NAV)   # a phone keeps the line and the register
    tpl = (HERE / 'room_page.html').read_text()
    doc = (tpl.replace('{{TITLE}}', f'{SITE_TITLE} · Chapter I').replace('{{NAV}}', nav).replace('{{PIECES}}', J(room))
           .replace('{{FITS}}', J(fits)).replace('{{CATALOGUE}}', J(cat)).replace('{{CATS}}', J(C.CATS)))
    (HERE / 'index.html').write_text(doc)
    PAGES.append('index.html')


# ---------------------------------------------------------------- the other pages
def home(fronts):
    room = []
    for pid in ('veil_coat', 'muse_allover', 'muse_bomber'):
        p = PIECE[pid]
        seq = HERE / 'img' / 'home' / f'turn-{p["page"]}'
        seq.mkdir(parents=True, exist_ok=True)
        frames = sorted(f.name for f in seq.glob('f[0-9][0-9][0-9].webp'))
        (seq / 'README.txt').write_text(f'The turning room, {p["name"]}: drop one turn as 72 frames here, f000.webp to f071.webp '
                                        '(5 degrees a frame, the piece on its own ground, 2160 px tall). The page scrubs them with the scroll.\n')
        SLOTS.append(type('S', (), dict(page='home', name=f'turn-{p["page"]}', rel=seq.relative_to(HERE).as_posix(),
                                        wants=f'{p["name"]}: one turn, 72 frames, f000-f071.webp', size='72 frames, 2160 px tall',
                                        state='final' if len(frames) >= 72 else 'stand-in', now=(f'{len(frames)} frames' if frames else f'its views ({", ".join(PIECE_VIEWS[pid])}) turned by the page'))))
        vs = PIECE_VIEWS_SLOTS[pid]
        views = ''.join(f'<div class="tv" data-v="{v}">{s.img(sizes="(min-width: 821px) 60vw, 120vw")}</div>' for v, s in vs.items() if s.state != 'waiting')
        room.append(f'''<section class="turn" data-frames="{len(frames)}" data-seq="{seq.relative_to(HERE).as_posix()}">
  <div class="turn-stage"><div class="spot"></div><div class="tcam">{views}</div>
   <div class="turn-txt"><p class="eyebrow">{E(dict(C.CATS)[p['cat']])}</p>{fa(p['name'], 'h2', 'big')}<p class="plain">{E(p['plain'])}</p><a class="more-link" href="{p['page']}.html">Walk around it</a></div></div>
  <div class="turn-track"></div></section>''')
    cats = ''.join(f'<a class="cat" href="line.html#{k}">{fronts[next(p["id"] for p in C.PIECES if p["cat"] == k)].img(sizes="(min-width: 821px) 22vw, 45vw")}<span class="fa">{E(t.lower())}</span></a>' for k, t in C.CATS)
    body = f'''
<div id="opening" aria-hidden="true"><canvas></canvas><video muted playsinline preload="auto"></video><button type="button" class="skip">Skip</button></div>
<main class="home">
 <section class="hero">
  <div class="lettering big offwhite" data-lettering="offwhite" role="img" aria-label="PHAÖRA"></div>
  <p class="fa line">a seat is kept for you, before the first scene.</p>
  <p class="eyebrow">Chapter I</p>
  <p class="scrollcue">The room</p>
 </section>
 <div class="room">{''.join(room)}</div>
 <section class="cats"><p class="eyebrow">The line</p>{fa('fifteen pieces in black, cream and gold', 'h2')}<div class="catgrid">{cats}</div><a class="more-link" href="line.html">See the whole line</a></section>
 <section class="duo">
  <a class="tile" href="film.html">{FILM_POSTER.img(sizes="(min-width: 821px) 48vw, 100vw")}<span class="eyebrow">The film</span>{fa('a seat is kept for you', 'span', 'big')}</a>
  <a class="tile" href="book.html">{BOOK_COVER.img(sizes="(min-width: 821px) 48vw, 100vw")}<span class="eyebrow">The book</span>{fa('two reels, nine chapters', 'span', 'big')}</a>
 </section>
 <section class="keep"><p class="eyebrow">The register</p>{fa('tonight the front row is full but for one.', 'h2')}<a class="cta" href="{REGISTER}">Keep your seat</a></section>
</main>'''
    page('index.html', '', 'A cinema in knit, leather and silk. PHAÖRA Chapter I, made to order on pre-sale.', body, theme='dark', scripts=['assets/js/opening.js', 'assets/js/turn.js'], here='index.html', bodycls='homepage')


def line_page(fronts):
    out = ''
    for k, t in C.CATS:
        cards = ''
        for p in [p for p in C.PIECES if p['cat'] == k]:
            cards += (f'<a class="card" href="{p["page"]}.html">{fronts[p["id"]].img(sizes="(min-width: 821px) 24vw, 46vw")}'   # the catalogue: image and name
                      f'{fa(p["name"], "span", "nm")}<span class="pl">{E(p["plain"])}</span></a>')
        out += f'<section class="cat-sec" id="{k}"><p class="eyebrow">{E(t)}</p><div class="cards">{cards}</div></section>'
    body = f'<main class="line"><header class="ph-head"><p class="eyebrow">Chapter I</p>{fa("the line", "h1")}<p class="lede">Knitwear, leather and silk, in black, cream and gold. Every piece of Chapter I, by category.</p></header>{out}</main>'
    page('line.html', 'The line', 'PHAÖRA Chapter I: the line.', body, here='line.html')


def film_page():
    shorts = ''
    for code, pid, still, prev in SHORTS:
        p = PIECE[pid]
        s = SHORT_SLOTS[code]
        shorts += f'<a class="short" href="{p["page"]}.html">{s.img(sizes="(min-width: 821px) 30vw, 90vw")}<span class="eyebrow">{code}</span>{fa(p["name"], "span", "nm")}<span class="pl">{E(p["world"][0])}</span></a>'
    body = f'''
<main class="film">
 <header class="ph-head"><p class="eyebrow">The film · Chapter I</p>{fa('a seat is kept for you', 'h1')}<p class="lede">There is a cinema that runs one last show on Christmas Eve. One coat comes in out of the snow, and one seat in the front row is kept.</p></header>
 <section class="screen first">{SHORT02.img(sizes="100vw", cls="filmslot")}<button class="play" type="button">Play</button></section>
 <section class="caption-row"><p class="eyebrow">Short 2 · The Reel</p>{fa('down the aisle', 'h2')}<p class="small">The Reel rolls on its edge down the whole cinema aisle, step by step, slows, rocks and stands still; then one move into the gold clasp, whose engraved Ö becomes the Ö of the lettering on black.</p></section>
 <section class="screen">{FILM.img(sizes="100vw", cls="filmslot")}<button class="play" type="button">Play</button></section>
 <section class="caption-row"><p class="eyebrow">The film</p>{fa('a seat is kept for you', 'h2')}</section>
 <section class="vert"><div>{FILM_V.img(sizes="(min-width: 821px) 26vw, 70vw")}</div><div><p class="eyebrow">Fifteen seconds</p>{fa('the night, in seven beats', 'h2')}<p class="small">The net on the shoulder in the snow. The door opening by itself. The row and the kept seat. The sit. The lights up on the box. The coat on its rail in the morning. The lettering.</p></div></section>
 <section class="attractions"><p class="eyebrow">Coming attractions</p>{fa('the picture is tomorrow', 'h2')}<p class="lede">What plays on the screen: each piece in the place it is going, with one place kept for someone. Reel One is the night out; Reel Two, the suite from day to the next morning.</p><div class="shorts">{shorts}</div></section>
 <section class="coda">{NEXT_REEL.img(sizes="(min-width: 821px) 60vw, 100vw")}<p class="eyebrow">The next reel</p><p class="lede">Up in the booth, the first reel came off the projector and another went on.</p></section>
</main>'''
    page('film.html', 'The film', 'A Seat Is Kept for You: the PHAÖRA Chapter I film.', body, theme='dark', scripts=['assets/js/film.js'], here='film.html')



def poem_sections():
    """POEM.md (phaora-ops marketing/story/POEM.md, ee289bad, copied here as it is): {chapter key: [stanza: [line]]}."""
    keys = {'prologue': 'prologue', 'coda': 'coda'}
    out, cur = {}, None
    for line in (HERE / 'POEM.md').read_text().splitlines():
        m = re.fullmatch(r'\*\*(.+?)\*\*', line.strip())
        if m:
            t = m.group(1).strip(); k = t.split('.')[0].strip().lower()
            cur = keys.get(k, k); out[cur] = [[]]; continue
        if cur is None or line.strip() == '---':
            continue
        if not line.strip():
            if out[cur][-1]: out[cur].append([])
            continue
        out[cur][-1].append(line.strip())
    return {k: [st for st in v if st] for k, v in out.items()}


def verse(stanzas):
    """Stanzas as verse: each line its own (unbroken on a computer; on a phone a long line wraps with a hanging indent);
    the poem's *italics* kept."""
    em = lambda t: re.sub(r'\*(.+?)\*', r'<em>\1</em>', E(t))
    return '<div class="verse">' + ''.join('<p class="st">' + ''.join(f'<span class="l">{em(l)}</span>' for l in st) + '</p>' for st in stanzas) + '</div>'


def book_page():
    """The book's own home (David, 14 Nov: "No book in the product page. We need a dedicated place for it"):
    book.html opens on the cover, then lists the chapters; each chapter is its own page (book-<key>.html) with its plate,
    its text from BOOK.md and the maker's notes of the pieces that enter. On the cinema's black, cream type, gold
    numerals. No dates."""
    global POEM
    POEM = poem_sections()   # the book is the poem now (David, 14 Nov: "put it on the site")
    chs = [dict(key=c['key'], title=c['title'], reel=c['reel'], text=c['text'], plate=c['plate'], enter=c['enter']) for c in C.BOOK]
    chs.append(dict(key='coda', title='Coda', reel=None, text=C.BOOK_CODA['text'], plate=C.BOOK_CODA['plate'], enter=[]))

    def split(title):   # 'I. Snow' -> ('I', 'snow'); 'Prologue' -> ('', 'prologue')
        if '. ' in title:
            n, t = title.split('. ', 1)
            return n, t.lower()
        return '', title.lower()

    def numeral(n):
        return f'<span class="bnum">{E(n)}</span>' if n else ''

    def fn(c):
        return f"book-{c['key']}.html"

    items = ''
    for c in chs:
        n, t = split(c['title'])
        reel = f'<li class="breel fa">{E(c["reel"].lower())}</li>' if c['reel'] else ''
        items += f'{reel}<li><a href="{fn(c)}">{numeral(n)}{fa(t, "span", "bt")}</a></li>'
    cover = BOOK_PLATES['v']
    body = f'''
<main class="bookhome">
 <section class="bcover">
  <div class="bcover-plate">{cover.img(sizes="(min-width: 821px) 34vw, 80vw", cls="plate", loading="eager")}</div>
  <div class="bcover-txt"><div class="lettering offwhite" data-lettering="offwhite" role="img" aria-label="PHAÖRA"></div>{fa('a seat is kept for you', 'h1')}<p class="eyebrow">Chapter I · the book</p></div>
 </section>
 <nav class="bchapters" aria-label="The chapters"><ol>{items}</ol></nav>
</main>'''
    page('book.html', 'The book', 'A Seat Is Kept for You: the book of PHAÖRA Chapter I, in two reels.', body, theme='dark', here='book.html', bodycls='bookdark')

    for i, c in enumerate(chs):
        n, t = split(c['title'])
        s = BOOK_PLATES[c['key']]
        d, kept = c['plate'][0], c['plate'][1]
        stanzas = POEM.get(c['key'], [])
        said = ' '.join(' '.join(st) for st in stanzas)
        named = [q for q in C.PIECES if re.search(r'(?<!\w)' + re.escape(q['name']) + r'(?!\w)', said)]   # the pieces this section names
        named.sort(key=lambda q: said.index(q['name']))
        links = ''.join(f'<a class="more-link" href="{q["page"]}.html">The piece · {E(q["name"])}</a>' for q in named)
        prev = chs[i - 1] if i else None
        nxt = chs[i + 1] if i + 1 < len(chs) else None
        pn = (f'<nav class="bpn">' + (f'<a href="{fn(prev)}"><span>Before</span>{fa(split(prev["title"])[1], "span")}</a>' if prev else '<span></span>') +
              '<a href="book.html" class="all">The chapters</a>' +
              (f'<a href="{fn(nxt)}"><span>Next</span>{fa(split(nxt["title"])[1], "span")}</a>' if nxt else '<span></span>') + '</nav>')
        last = ''
        if c['key'] == 'coda':
            last = (f'<section class="blast"><a class="card-link" href="{REGISTER}"><span class="k fa">kept for</span><span class="blank"></span></a></section>')   # the poem's last line, then the card
        reel = f'<p class="breel fa">{E(c["reel"].lower())}</p>' if c['reel'] else ''
        body = f'''
<main class="bchapter" id="{c['key']}">
 <header class="bhead">{reel}<p class="eyebrow">A seat is kept for you</p><h1>{numeral(n)}{fa(t, 'span', 'bt')}</h1></header>
 <section class="bspread">
  <div class="btext">{verse(stanzas)}{f'<p class="blinks">{links}</p>' if links else ''}</div>
  <figure class="bplate">{s.img(sizes="(min-width: 821px) 40vw, 92vw", cls="plate")}<figcaption>{E(d)}<br><em>Kept: {E(kept)}</em></figcaption></figure>
 </section>
 {last}
 {pn}
</main>'''
        page(fn(c), f"The book · {c['title']}", f"A Seat Is Kept for You, {c['title']}.", body, theme='dark', here='book.html', bodycls='bookdark')


def register_page():
    row = {code: dict(name=PIECE[pid]['name'], page=PIECE[pid]['page'], img=ROW_IMG[pid], notes=notes) for code, pid, notes in C.ROW}
    body = f'''
<main class="register">
 <div id="frame">
  <section id="house" aria-label="The front row, seen from above: six seats, one kept">
   <div id="row"><img class="bef" src="assets/register/row_before.webp" srcset="assets/register/row_before.webp 1170w, assets/register/row_before@2x.webp 2340w" sizes="(min-width: 821px) 480px, 100vw" alt=""><img class="aft" src="assets/register/row_after.webp" srcset="assets/register/row_after.webp 1170w, assets/register/row_after@2x.webp 2340w" sizes="(min-width: 821px) 480px, 100vw" alt=""><div class="warm" id="warm"></div></div>
   <div class="rfoot"><p id="hint">Touch a seat to see who is in it.<br>The red one is yours.</p><button class="slip fa" id="turn" type="button">turn the card</button></div>
  </section>
  <div class="scrim" id="scrim"></div>
  <aside id="piece" aria-live="polite"><button class="x fa" id="px" type="button">close</button><img id="pimg" alt=""><div class="nm fa" id="pname"></div><ol id="pnotes"></ol><a id="plink" class="more-link" href="#">Walk around it</a></aside>
  <aside id="cardsheet">
   <button class="x fa" id="cx" type="button">close</button>
   <div class="flip" id="flip"><div class="in">
    <div class="face f"><img src="assets/brand/mark-cream.png" alt="The card"></div>
    <form class="face b" id="form" novalidate>
     <div class="k">kept for</div>
     <input id="nm" type="text" maxlength="22" autocomplete="given-name" spellcheck="false" placeholder="your name" aria-label="Your name" enterkeyhint="next">
     <input id="em" type="email" maxlength="80" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="your email" aria-label="Your email" enterkeyhint="done">
     <input id="hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">
     <div class="no"><span>chapter one</span><span>the front row</span></div>
    </form>
   </div></div>
   <button class="slip fa" id="keep" type="button">keep my seat</button>
   <div id="err" role="status"></div>
   <p id="terms">The register sees Chapter I before anyone else.<br>Your name and address are kept for that, and nothing else.</p>
   <div id="after"><p class="ty fa">your seat is kept.</p><p>Your name is on the register. Word comes to you first, before anyone else.</p><p class="links"><a href="book.html">Read the book</a> · <a href="film.html">The film</a> · <a href="line.html">The line</a></p></div>
  </aside>
  <div id="reward" aria-hidden="true">{REWARD_D.img(cls="rv desk")}{REWARD_P.img(cls="rv phone")}<p class="who fa"></p></div>
 </div>
 <script type="application/json" id="rowdata">{json.dumps(row, ensure_ascii=False)}</script>
</main>'''
    page('register.html', 'Register', 'A seat is kept for you. The PHAÖRA register: Chapter I, before anyone else.', body, theme='dark', scripts=['assets/js/register.js'], here='register.html', bodycls='regpage')


def text_page(fn, title, eyebrow, sections, desc, lede=''):
    secs = ''
    for h, paras in sections:
        secs += f'<section class="tsec">{fa(h.lower(), "h2") if h else ""}' + ''.join(p if p.startswith('<') else f'<p>{E(p)}</p>' for p in paras) + '</section>'
    body = f'<main class="text"><header class="ph-head"><p class="eyebrow">{E(eyebrow)}</p>{fa(title.lower(), "h1")}{f"<p class=lede>{E(lede)}</p>" if lede else ""}</header>{secs}</main>'
    page(fn, title, desc, body)


def for_david(what):
    return f'<p class="fordavid">For David: {E(what)}</p>'


def other_pages():
    names = ''.join(f'<li>{fa(n, "span", "nm")}<span class="pl">{E(w)}</span><span class="why">{E(why)}</span></li>' for n, w, why in NAMES)
    text_page('house.html', 'The house', 'PHAÖRA', [
        ('', [C.BOOK_LAST]),
        ('The mark', [f'<figure class="markfig"><img src="assets/brand/mark-ink.png" alt="The Ö, David’s drawn mark" width="512" height="512"></figure>',
                      'An O, two dots above it, a line drawn through. It is on the card that keeps the seat, on every clasp and disc, and inside every piece.']),
        ('The names', ['Each piece is named from Minas Gerais and Brazil: its gold, its baroque, its old words.', f'<ul class="names">{names}</ul>']),
        ('The story', ['One night, told the same way everywhere: the film, the book, the shorts and the register tell one story, "A Seat Is Kept for You".',
                       '<p><a class="more-link" href="book.html">The book</a> <a class="more-link" href="film.html">The film</a></p>']),
    ], 'PHAÖRA, a house of knitwear, leather and silk.')
    text_page('care.html', 'Care', 'Chapter I', [
        ('The knit', [C.CARE['knit'], '<p class="tag">UNCONFIRMED · the knitter confirms it</p>']),
        ('The silk', [C.CARE['silk'], '<p class="tag">UNCONFIRMED · the silk maker confirms it</p>']),
        ('The leather', [C.CARE['leather'], '<p class="tag">UNCONFIRMED · the leather workshop confirms it</p>']),
        ('The gold', [C.CARE['gold'], for_david('the care line for the gold hardware and the sunglasses, once the maker states the metal')]),
    ], 'PHAÖRA Chapter I: care for the knit, the silk and the leather.')
    rows = lambda rr: '<table class="sz"><thead><tr><th></th><th>S</th><th>M</th><th>L</th><th>XL</th><th>XXL</th></tr></thead><tbody>' + ''.join(
        f'<tr><th>{E(a)}</th><td>·</td><td>{E(b)}</td><td>·</td><td>·</td><td>·</td></tr>' for a, b in rr) + '</tbody></table><p class="small">M is the block. S, L, XL and XXL follow when it is graded.</p>'
    text_page('sizes.html', 'Sizes', 'Chapter I', [
        ('The hoodies', ['Heliodora and Cantilena.', rows([('Body length, shoulder to hem', '72 cm'), ('Front, knitted width', '65.6 cm'), ('Front, knitted length', '64.4 cm'),
                                                                     ('Back, knitted width', '65.3 cm'), ('Shoulder, seam to seam', '71.5 cm'), ('Shoulder drop', '16.3 cm'),
                                                                     ('Sleeve length', '55.4 cm'), ('Hem band, flat', '51.5 cm')])]),
        ('Outerwear and silk', ['Gelosia, Ödara and Alvor come in XS, S, M, L and XL.', for_david('their measurements, once the patterns are graded')]),
        ('The gloves', ['Ritornelo comes in S, M and L.', for_david('the hand measurements for each size')]),
    ], 'PHAÖRA Chapter I: measurements for the knitwear.', lede='Measured flat, in centimetres. The block is cut at size M; the other sizes follow when the block is graded.')
    text_page('returns.html', 'Pre-sale and returns', 'Chapter I', [
        ('The pre-sale', [C.POLICY_PRESALE]),
        ('The knitwear', [C.POLICY_KNIT]),
        ('Every other piece', [C.POLICY_MADE]),
        ('Shipping', [for_david('the stated ship window for every pre-order, and the countries shipped to (counsel to confirm the wording)')]),
    ], 'PHAÖRA Chapter I: the pre-sale, exchanges and shipping.')
    text_page('contact.html', 'Contact', 'PHAÖRA', [
        ('Write to the house', [for_david('the address the house answers from'), 'For an order, a size, or a piece you would like to see closer.']),
        ('Press', [for_david('the press contact')]),
        ('The register', ['<p><a class="more-link" href="' + REGISTER + '">Keep a seat</a></p>']),
    ], 'Contact PHAÖRA.')
    text_page('privacy.html', 'Privacy', 'PHAÖRA', [('', [for_david('the privacy notice. Nothing is written here until counsel drafts it.'),
                                                     'What the register keeps today: a name and an email address, for word of Chapter I.'])], 'PHAÖRA privacy.')
    text_page('terms.html', 'Terms', 'PHAÖRA', [('', [for_david('the terms of sale and of use. Nothing is written here until counsel drafts them.')])], 'PHAÖRA terms.')


NAMES = [
 ('Gelosia', 'The Veil Coat', 'The carved lattice screen on colonial houses, which a woman could see through without being seen. The coat’s net is that lattice.'),
 ('Ödara', 'The Muse Bomber', '“Beautiful, at peace”: a Yoruba word that passed into Brazilian speech.'),
 ('Alvor', 'The silk slip', 'A literary word for the first whiteness of dawn.'),
 ('Heliodora', 'The Muse', 'Bárbara Heliodora, the poet-heroine of the 1789 Minas conspiracy; also heliodor, the golden gem of Minas.'),
 ('Cantilena', 'The PÖ hoodie', 'A song that keeps returning to the same few notes: the PÖ said again and again.'),
 ('Voluta', 'The Reel', 'The spiral scroll carved on the baroque churches of Minas, and a coil like a reel of film.'),
 ('Coema', 'The Matinee', 'Old Tupi for morning.'),
 ('Itaoca', 'The PÖ top-handle', 'Old Tupi: itá stone and oka house, “house of stone”.'),
 ('Ritornelo', 'The opera gloves', 'The refrain that comes back, in opera: the gloves are left to say someone is coming back.'),
 ('Coaraci', 'The disc belt', 'Old Tupi for the sun.'),
 ('Öbolo', 'The card holder', 'The small coin paid for passage.'),
 ('Cordel', 'The silk scarf', 'Brazil’s string literature: black-and-cream woodcut booklets hung in a row on a cord, like the scarf’s frames.'),
 ('Öfusca', 'The sunglasses', '“She dazzles”, and also “she darkens”.'),
 ('Öitava', 'The Ö pendant', 'The unit Minas weighed its gold in, about 3.6 g.'),
 ('Lustre', 'The Marquee necklace', 'The Portuguese word for a chandelier.'),
]

ST = C.ST
SHORTS = [('C1', 'muse_allover', ST + 'ca-01-the-muse_108x144.png', None), ('C2', 'quiet_black_trousers', ST + 'ca-02-the-quiet-black-trousers_108x144.png', None),
          ('C3', 'opera_gloves', ST + 'ca-03-the-opera-gloves_108x144.png', None), ('C4', 'silk_scarf', ST + 'ca-04-the-silk-scarf_108x144.png', None),
          ('C5', 'card_holder', ST + 'ca-05-the-card-holder_108x144.png', None), ('C6', 'sunglasses', ST + 'ca-06-star-in-shades_108x144.png', None),
          ('C7', 'quiet_black', ST + 'ca-07-quiet-black_108x144.png', None), ('C8', 'po_tophandle', ST + 'ca-08-the-po-top-handle_108x144.png', None),
          ('C9', 'cantilena', None, None), ('C10', 'muse_bomber', ST + 'ca-10-the-muse-bomber_108x144.png', None),
          ('C11', 'silk_slip', ST + 'ca-11-the-silk-slip_108x144.png', None), ('C12', 'disc_belt', ST + 'ca-12-the-disc-belt_108x144.png', None),
          ('C13', 'the_reel', ST + 'ca-13-the-reel_108x144.png', None),
          ('C14', 'matinee', ST + 'ca-14-the-matinee_108x144.png', 'departments/apparel/marketing/story/preview/60_the-matinee_suite-bench_16x9_144p.mp4')]


SHORTS = [s for s in SHORTS if s[1] not in C.OUT]   # Carbonado is out (C2, C7)


def main():
    global PACKAGING, FILM, FILM_V, FILM_POSTER, BOOK_COVER, NEXT_REEL, SHORT_SLOTS, BOOK_PLATES, REWARD_D, REWARD_P, ROW_IMG, PIECE_VIEWS, PIECE_VIEWS_SLOTS
    brand()
    pk = C.CH2 + 'assets/packaging/'
    PACKAGING = [Slot('shared', 'pack-' + k, f'packaging/chapter1/renders: {k} (the approved final, 3840 px)', '8K, 7680 × 4320', '4:3', lab, [pk + f'{k}-1920.webp'])
                 for k, lab in (('closed', 'The closed box, its band and the gold disc'), ('open', 'The open box, the piece folded in cream tissue'),
                                ('disc', 'The gold disc on the band'), ('shopping', 'The shopping bag with cream tissue'), ('trims', 'The hang tag, the card and the sealed envelope'))]
    va = 'departments/apparel/marketing/ads/veil-coat-film/preview/'
    FILM = Slot('film', 'film', 'the film, "A Seat Is Kept for You", the final cut', '16:9, 3840 × 2160 MP4', '16:9', 'The film', ['git:' + va + 'veil-coat-film_christmas_16x9_144p.mp4'], kind='video')
    FILM_V = Slot('film', 'vertical', 'the 15 s vertical', '9:16, 2160 × 3840 MP4', '9:16', 'The film, fifteen seconds', ['git:' + va + 'veil-coat-film_15s_9x16_144p.mp4'], kind='video')
    FILM_POSTER = Slot('film', 'poster', 'clip 8: the row from behind and above, the kept seat on the left third', '8K, 7680 × 4320', '16:9', 'The front row and the kept seat',
                       [ST + 'b2_the-front-row-and-the-kept-seat_256x144.png'])
    NEXT_REEL = Slot('film', 'next-reel', 'the next reel: the leader, II in red', '16:9, 3840 × 2160 MP4', '16:9', 'The next reel',
                     ['git:departments/apparel/marketing/ads/next-reel/preview/next_reel_3_leader_II_144p_red.mp4'], kind='video')
    global SHORT02
    # Short 2, the long one (marketing/ads/shorts/02_the-reel_cinema-aisle_long.py): the Reel's roll down the aisle into the
    # clasp and David's end card. First on the film page (David, 14 Nov); its 144p preview stands in
    SHORT02 = Slot('film', 'short-02', 'Short 2, the Reel down the aisle into the clasp and the end card, the 4K master', '16:9, 3840 × 2160 MP4', '16:9',
                   'Short 2: the Reel, down the aisle', ['departments/apparel/marketing/ads/shorts/preview/02_the-reel_cinema-aisle-long_16x9_144p.mp4'], kind='video')
    SHORT_SLOTS = {}
    for code, pid, still, prev in SHORTS:
        p = PIECE[pid]
        if prev:
            SHORT_SLOTS[code] = Slot('film', 'short-' + code.lower(), f'{code}, {p["name"]}: the coming attraction', '16:9, 3840 × 2160 MP4', '16:9', f'{code} {p["name"]}, {p["world"][0].lower()}', ['git:' + prev], kind='video')
        else:
            SHORT_SLOTS[code] = Slot('film', 'short-' + code.lower(), f'{code}, {p["name"]}: the coming attraction (until it lands, its last frame)', '16:9, 3840 × 2160 MP4 or 8K still', '16:9',
                                     f'{code} {p["name"]}, {p["world"][0].lower()}', [still] if still else [])
    BOOK_PLATES = {}
    for ch in C.BOOK:
        d, kept, srcs, r = ch['plate']
        BOOK_PLATES[ch['key']] = Slot('book', 'plate-' + ch['key'], f'the plate for {ch["title"]}: {d}', '8K, ' + ('5760 × 7680' if r == '3:4' else '7680 × 4320'), r, f'{ch["title"]}: {kept}', srcs)
    d, kept, srcs, r = C.BOOK_CODA['plate']
    BOOK_PLATES['coda'] = Slot('book', 'plate-coda', f'the plate for the coda: {d}', '8K, 5760 × 7680', r, f'Coda: {kept}', srcs)
    BOOK_COVER = BOOK_PLATES['v']
    REWARD_D = Slot('register', 'reward-desk', 'the kept seat’s film: the cushion folds down, the card lands (desk)', '16:9 MP4', '16:9', 'The kept seat', [C.CH2 + 'assets/register/reward_desk.mp4'], final=True, kind='video')
    REWARD_P = Slot('register', 'reward-phone', 'the kept seat’s film (phone)', '9:16 MP4', '9:16', 'The kept seat', [C.CH2 + 'assets/register/reward_phone.mp4'], final=True, kind='video')
    PIECE_VIEWS, PIECE_VIEWS_SLOTS, fronts = {}, {}, {}
    for i, p in enumerate(C.PIECES):
        vs = piece_page(p, C.PIECES[i - 1], C.PIECES[(i + 1) % len(C.PIECES)])
        PIECE_VIEWS[p['id']] = [v for v, s in vs.items() if s.state != 'waiting']
        PIECE_VIEWS_SLOTS[p['id']] = vs
        fronts[p['id']] = next(iter(vs.values()))
    ROW_IMG = {pid: fronts[pid].src(960) for _, pid, _ in C.ROW}
    room_home()
    line_page(fronts)
    film_page()
    book_page()
    # register_page(): the live register at / is the register
    other_pages()
    write_slots()
    print(f'{len(PAGES)} pages')


def write_slots():
    rows = ['| page | slot | the file it wants | what’s there now |', '|---|---|---|---|']
    n = {'final': 0, 'stand-in': 0, 'waiting': 0}
    for s in SLOTS:
        n[s.state] += 1
        now = {'final': 'FINAL: ', 'stand-in': 'stand-in: ', 'waiting': 'WAITING: a placeholder of the right ratio'}[s.state] + (s.now if s.state != 'waiting' else '')
        rows.append(f'| {s.page} | `{s.rel}/` | {s.wants} ({s.size}) | {now} |')
    head = f'''# SLOTS: every image and film on the Chapter I site

Built by `build.py`. {len(SLOTS)} slots: **{n['final']} final**, **{n['stand-in']} holding a stand-in** (the best approved
render or still we have, at 144p or 1600), **{n['waiting']} waiting** (a quiet placeholder of the right ratio, labelled
with what it waits for).

**To add a photo:** put the file in the slot's folder as `master.png` (or `.jpg`, `.webp`, `.tif`; a film: `master.mp4`),
then run `python3 build.py`. The build makes the web sizes (480, 960, 1600, 2560, 3840 and 7680 wide, WebP) and the
srcset, and every page that uses the slot shows it. A turning-room slot takes its 72 frames as `f000.webp` to
`f071.webp` instead.

The first image on each piece page is its 16K front; every other image is 8K. The site serves them up to 7680 wide;
the 16K master stays in the slot as the source.

Stand-ins and placeholders carry a small label on the preview (any host but phaora.com): STAND-IN or WAITS FOR, and the
path. On phaora.com the labels never show.

'''
    (HERE / 'SLOTS.md').write_text(head + '\n'.join(rows) + '\n')
    print(n, len(SLOTS))


if __name__ == '__main__':
    main()
