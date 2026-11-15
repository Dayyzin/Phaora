"""The catalogue on its own, for a private link (the equity pitch, 15 Nov): index.html as built, with everything it uses in
one folder, pitch/. Run after build.py. The register links go to the live register (phaora.com); the pieces' own pages
are not in this folder, so a piece is not a link here. Images are kept to twice their largest shown size; the first row
loads first, the rest as they near the screen."""
import os, re, shutil
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
s = s.replace('<meta name="robots" content="noindex">', '<meta name="robots" content="noindex, nofollow">')
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
