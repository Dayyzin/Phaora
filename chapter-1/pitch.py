"""The catalogue on its own, for a private link (the equity pitch, 15 Nov): index.html as built, with everything it uses in
one folder, pitch/. Run after build.py. The register links go to the live register (phaora.com); the pieces' own pages
are not in this folder, so a piece is not a link here. Images are kept to twice their largest shown size; the first row
loads first, the rest as they near the screen."""
import os, re, shutil, sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).parent
OUT = HERE / 'pitch'
LIVE = 'https://www.phaora.com/'
MAXW, MAXH = 760, 900   # twice the catalogue's largest box (about 360 x 420 CSS px at 1440)

s = (HERE / 'index.html').read_text()
s = s.replace('href="/"', f'href="{LIVE}"')
s = re.sub(r'<a (class="ph[^"]*") href="[a-z-]+\.html">(.*?)</a>', r'<div \1>\2</div>', s, flags=re.S)
s = re.sub(r'<a href="[a-z-]+\.html">The piece</a>', '<span>The piece</span>', s)
s = re.sub(r'<a class="ph( two)?" href="[a-z-]+\.html">(.*?)</a>', r'<div class="ph\1">\2</div>', s, flags=re.S)   # the words stay (the band as the room has it)
s = re.sub(r'<a class="pc(?:img)?" href="[a-z-]+\.html"[^>]*></a>', '', s)   # the room frames: no link over THE PIECE here
s = re.sub(r'href="(film|book|room|house)\.html"', 'href="#top"', s)   # the nav's other rooms are not in this folder: back to the top
s = s.replace('<meta name="robots" content="noindex">', '<meta name="robots" content="noindex, nofollow, noarchive">')
# the first row (four pieces) loads at once and first; the rest when near the screen
n = 0
def lazy(m):
    global n
    n += 1
    tag = m.group(0)
    return tag.replace('loading="eager"', 'loading="eager" fetchpriority="high"') if n <= 5 else tag.replace('loading="eager"', 'loading="lazy"')
s = re.sub(r'<img [^>]*>', lazy, s)

if OUT.exists(): shutil.rmtree(OUT)
for d in ('assets/catalogue', 'assets/css', 'assets/brand'): (OUT / d).mkdir(parents=True, exist_ok=True)
for src in sorted(set(re.findall(r'src="(assets/catalogue/[^"]+)"', s))):
    im = Image.open(HERE / src); k = 1 if '/panel/' in src else min(1, MAXW / im.width, MAXH / im.height)
    (OUT / src).parent.mkdir(parents=True, exist_ok=True)
    if k < 1: im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.save(OUT / src, quality=86, method=6)
# the piece view's full picture and its turn (twice the largest it is shown: about 80 vh)
FULL = 1600
def big(src, dst):
    im = Image.open(HERE / src); k = min(1, FULL / im.width, FULL / im.height)
    if k < 1: im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    (OUT / dst).parent.mkdir(parents=True, exist_ok=True); im.save(OUT / dst, quality=84, method=6)
def full(m):
    src = m.group(1); dst = src.replace('assets/catalogue/shadowed/', 'assets/catalogue/full/'); big(src, dst); return f'data-full="{dst}"'
s = re.sub(r'data-full="([^"]+)"', full, s)
def views(m):
    out = []
    for src in m.group(1).split(','):
        dst = src.replace('assets/catalogue/shadowed/', 'assets/catalogue/full/'); big(src, dst); out.append(dst)
    return f'data-views="{",".join(out)}"'
s = re.sub(r'data-views="([^"]+)"', views, s)
# the acts' pictures (close-up plates, the scene stills) come too, kept to their own size
for src in sorted(set(re.findall(r'"((?:img|assets)/[^"]+\.(?:webp|png|jpg))"', s[s.find('id="acts"'):]))):
    (OUT / src).parent.mkdir(parents=True, exist_ok=True); shutil.copy(HERE / src, OUT / src)
for w in sorted(set(re.findall(r'"(assets/world/[^"]+)/walk\.json"', s))):   # a piece's world walk: its frames and data, whole
    if (OUT / w).exists(): shutil.rmtree(OUT / w)
    shutil.copytree(HERE / w, OUT / w)
# the house's own pages come too (the floor's links: care, sizes, returns, contact, privacy, terms), with what they use;
# their links to pages not in this folder go to the catalogue, the register to the live one
HOUSE = ['care', 'sizes', 'returns']   # contact, privacy and terms wait on their text (an address, counsel)
for pg in HOUSE:
    h = (HERE / f'{pg}.html').read_text()
    for f in set(re.findall(r'(?:src|href)="(assets/[^"#:]+)"', h)):
        (OUT / f).parent.mkdir(parents=True, exist_ok=True); shutil.copy(HERE / f, OUT / f)
    for u in re.findall(r'url\(["\']?([^"\')]+)', (HERE / 'assets/css/site.css').read_text()):
        src = (HERE / 'assets/css' / u).resolve()
        if src.exists(): dst = OUT / 'assets/css' / u; dst.resolve().parent.mkdir(parents=True, exist_ok=True); shutil.copy(src, dst.resolve())
    for f in ('assets/brand/lettering-ink.svg', 'assets/brand/lettering-offwhite.svg'): shutil.copy(HERE / f, OUT / f)   # site.js inlines them
    h = h.replace('href="/"', f'href="{LIVE}"')
    h = re.sub(r'href="(?!https?:|#)([^"]+)"', lambda m: m.group(0) if m.group(1).startswith('assets/') or m.group(1).split('#')[0] in [x + '.html' for x in HOUSE] else 'href="index.html"', h)
    h = re.sub(r'<p class="(?:fordavid|tag)">.*?</p>', '', h, flags=re.S)   # notes to David and UNCONFIRMED tags never go out
    h = h.replace('<meta name="robots" content="noindex">', '<meta name="robots" content="noindex, nofollow, noarchive">')
    (OUT / f'{pg}.html').write_text(h)
# the house's pages are not in this folder: the floor keeps only the links that go somewhere from here
s = re.sub(r'<a href="(?!https?:)([a-z-]+\.html)">([^<]*)</a>', lambda m: m.group(0) if (OUT / m.group(1)).exists() else '', s)
sheets = re.findall(r'href="(assets/css/[^"]+\.css)"', s)   # the page's own sheet(s) and script(s), and what they point at
css = ''.join((HERE / c).read_text() for c in sheets)
for f in sheets + re.findall(r'src="(assets/js/[^"]+)"', s) + ['assets/brand/mark-180.png', 'assets/lettering-solo-offwhite.svg'] + \
        ['assets/css/' + u for u in re.findall(r'url\(["\']?([^"\')]+)', css) if ':' not in u] + \
        re.findall(r'<link rel="preload" as="image" href="([^"]+)"', s):
    f = os.path.normpath(f); (OUT / f).parent.mkdir(parents=True, exist_ok=True); shutil.copy((HERE / f).resolve(), OUT / f)
(OUT / 'index.html').write_text(s)
left = [u for u in re.findall(r'(?:src|href)="([^"#:]+)"', s) if not (OUT / u).exists()]
assert not left, left
left = [u for u in re.findall(r'url\(["\']?([^"\')]+)', css) if ':' not in u and not (OUT / 'assets/css' / u).resolve().exists()]
assert not left, left
files = [p for p in OUT.rglob('*') if p.is_file()]
print(len(files), 'files,', round(sum(p.stat().st_size for p in files) / 1024), 'KB')

# python3 pitch.py --salon <main checkout>: the same folder as the hidden page phaora.com/salon/r0r7lx/ (linked from
# nowhere, not in robots.txt or the sitemap). Copies only; committing to main is a separate, deliberate step.
if '--salon' in sys.argv:
    dst = Path(sys.argv[sys.argv.index('--salon') + 1]) / 'salon' / 'r0r7lx'
    if dst.exists(): shutil.rmtree(dst)
    shutil.copytree(OUT, dst); print('salon ->', dst)
