#!/usr/bin/env python3
"""
Comprehensive fix script:
1. Strip wrong lifestyle slides to studio-only on 9 pages
2. Fix Eclipse: remove portal slides, studio only
3. Fix thumbnails: Guardians, Tenderness, Eclipse, Canopy in gallery+index
4. Fix Four Worlds section images
5. Fix Statement Pieces section (only Canopy + Vessel)
6. Fix "Prices from $12,500" -> "Prices from $6,000"
"""

import re, os

ROOT = '/home/user/Phaora'
PIECES = os.path.join(ROOT, 'pieces')

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# ─────────────────────────────────────────────────
# 1. STRIP WRONG LIFESTYLE SLIDES (2→1, studio only)
# ─────────────────────────────────────────────────
pages_to_strip = {
    'the-ethereals':  '../img/IMG_7056.JPG',
    'the-companions': '../img/IMG_7043.JPG',
    'the-lovers':     '../img/IMG_7044.JPG',
    'the-gathering':  '../img/IMG_7053.JPG',
    'the-pair':       '../img/IMG_7049.JPG',
    'the-devotion':   '../img/IMG_7050.JPG',
    'the-whisper':    '../img/IMG_7041.JPG',
    'the-guardians':  '../img/IMG_7051.JPG',
    'the-embrace':    '../img/IMG_6966.JPG',
}

for slug, studio in pages_to_strip.items():
    path = os.path.join(PIECES, slug + '.html')
    html = read(path)

    # Replace 2-slide stage with 1-slide stage (studio only)
    # Pattern: active slide (wrong PNG) + second slide (studio)
    new_slide = f'    <div class="ps-slide active" data-index="0"><img src="{studio}" alt="Studio" loading="eager"></div>'

    # Remove first slide (wrong PNG) + second slide, replace with single studio slide
    html = re.sub(
        r'    <div class="ps-slide active" data-index="0">.*?</div>\s*\n\s*<div class="ps-slide" data-index="1">.*?</div>',
        new_slide,
        html, count=1, flags=re.DOTALL
    )

    # Update filmstrip: replace 2 thumbs with 1 studio thumb
    new_thumb = f'    <div class="ps-thumb active" data-index="0"><img src="{studio}" alt="Studio" loading="lazy"><span>Studio</span></div>'
    html = re.sub(
        r'    <div class="ps-thumb active" data-index="0">.*?</div>\s*\n\s*<div class="ps-thumb" data-index="1">.*?</div>',
        new_thumb,
        html, count=1, flags=re.DOTALL
    )

    # Update psTotal: 2 -> 1
    html = html.replace('<span id="psTotal">2</span>', '<span id="psTotal">1</span>')

    # Update progress bar: 50% -> 100%
    html = html.replace('style="width:50%"', 'style="width:100%"')

    # Update dots: 2 dots -> 1 dot
    html = re.sub(
        r'<div class="ps-dots" id="psDots">.*?</div>',
        '<div class="ps-dots" id="psDots"><button class="ps-dot active" data-index="0" aria-label="Photo 1"></button></div>',
        html, count=1, flags=re.DOTALL
    )

    # Update JS: total=2 -> total=1
    html = html.replace('const total=2;', 'const total=1;')

    write(path, html)
    print(f'{slug}: stripped to studio only')

# ─────────────────────────────────────────────────
# 2. FIX ECLIPSE: Remove portal slides, studio only
# ─────────────────────────────────────────────────
eclipse_path = os.path.join(PIECES, 'the-eclipse.html')
html = read(eclipse_path)

# Replace entire ps-stage slides block
old_stage = '''    <div class="ps-slide active" data-index="0"><img src="../Untitled design - 7.PNG" alt="Poolside" loading="eager"></div>
    <div class="ps-slide" data-index="1"><img src="../Untitled design - 8.PNG" alt="Poolside" loading="lazy"></div>
    <div class="ps-slide" data-index="2"><img src="../Untitled design - 9.PNG" alt="Overhead" loading="lazy"></div>
    <div class="ps-slide" data-index="3"><img src="../Untitled design - 10.PNG" alt="Close Up" loading="lazy"></div>
    <div class="ps-slide" data-index="4"><img src="../img/IMG_6960.JPG" alt="Studio" loading="lazy"></div>'''
new_stage = '    <div class="ps-slide active" data-index="0"><img src="../img/IMG_6960.JPG" alt="Studio" loading="eager"></div>'
html = html.replace(old_stage, new_stage)

# Replace filmstrip
old_film = '''    <div class="ps-thumb active" data-index="0"><img src="../Untitled design - 7.PNG" alt="Poolside" loading="lazy"><span>Poolside</span></div>
    <div class="ps-thumb" data-index="1"><img src="../Untitled design - 8.PNG" alt="Poolside" loading="lazy"><span>Poolside</span></div>
    <div class="ps-thumb" data-index="2"><img src="../Untitled design - 9.PNG" alt="Overhead" loading="lazy"><span>Overhead</span></div>
    <div class="ps-thumb" data-index="3"><img src="../Untitled design - 10.PNG" alt="Close Up" loading="lazy"><span>Close Up</span></div>
    <div class="ps-thumb" data-index="4"><img src="../img/IMG_6960.JPG" alt="Studio" loading="lazy"><span>Studio</span></div>'''
new_film = '    <div class="ps-thumb active" data-index="0"><img src="../img/IMG_6960.JPG" alt="Studio" loading="lazy"><span>Studio</span></div>'
html = html.replace(old_film, new_film)

# Update psTotal: 5 -> 1
html = html.replace('<span id="psTotal">5</span>', '<span id="psTotal">1</span>')

# Update dots
html = re.sub(
    r'<div class="ps-dots" id="psDots">.*?</div>',
    '<div class="ps-dots" id="psDots"><button class="ps-dot active" data-index="0" aria-label="Photo 1"></button></div>',
    html, count=1, flags=re.DOTALL
)

# Update JS: total = 6 -> total = 1
html = html.replace('const total = 6;', 'const total = 1;')
html = html.replace('const total = 5;', 'const total = 1;')

write(eclipse_path, html)
print('the-eclipse: stripped to studio only')

# ─────────────────────────────────────────────────
# 3. FIX THUMBNAILS IN gallery.html + index.html
# ─────────────────────────────────────────────────
gallery_path = os.path.join(ROOT, 'gallery.html')
index_path   = os.path.join(ROOT, 'index.html')

gallery = read(gallery_path)
index   = read(index_path)

# Guardians: numbered PNG -> studio
gallery = gallery.replace(
    'src="Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 32.png" alt="The Guardians',
    'src="img/IMG_7051.JPG" alt="The Guardians'
)
index = index.replace(
    'data-src="Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 32.png" alt="The Guardians',
    'data-src="img/IMG_7051.JPG" alt="The Guardians'
)

# Tenderness: root-relative -> img/ path
gallery = gallery.replace(
    'src="IMG_6962.JPG" alt="The Tenderness',
    'src="img/IMG_6962.JPG" alt="The Tenderness'
)
index = index.replace(
    'data-src="IMG_6962.JPG" alt="The Tenderness',
    'data-src="img/IMG_6962.JPG" alt="The Tenderness'
)

# Eclipse: portal PNG -> studio
gallery = gallery.replace(
    'src="Untitled design - 7.PNG" alt="The Eclipse',
    'src="img/IMG_6960.JPG" alt="The Eclipse'
)
index = index.replace(
    'data-src="Untitled design - 7.PNG" alt="The Eclipse',
    'data-src="img/IMG_6960.JPG" alt="The Eclipse'
)

# Canopy: unnamed-3.jpg (blurry wide shot) -> unnamed-2.jpg (close-up)
gallery = gallery.replace(
    'src="unnamed-3.jpg" alt="The Canopy',
    'src="unnamed-2.jpg" alt="The Canopy'
)
index = index.replace(
    'data-src="unnamed-3.jpg" alt="The Canopy',
    'data-src="unnamed-2.jpg" alt="The Canopy'
)

print('Thumbnails: Guardians, Tenderness, Eclipse, Canopy fixed in gallery+index')

# ─────────────────────────────────────────────────
# 4. FIX FOUR WORLDS SECTION (index.html)
# ─────────────────────────────────────────────────
# Blue Macaws: Untitled_design_-_6-compressed.jpeg -> 5.png
index = index.replace(
    'src="Untitled_design_-_6-compressed.jpeg" alt="Blue Macaws on Amethyst Cathedral — oceanside"',
    'src="5.png" alt="Sodalite Macaws on Amethyst Geode"'
)

# Scarlet Macaws: img/IMG_6964.JPG -> 7.png
index = index.replace(
    'src="img/IMG_6964.JPG" alt="Scarlet Macaws on White Quartz"',
    'src="7.png" alt="Crimson Macaws on White Quartz"'
)

# White Cockatoos: Untitled_design_-_5-compressed.jpeg -> unnamed.jpeg
index = index.replace(
    'src="Untitled_design_-_5-compressed.jpeg" alt="White Cockatoos on Amethyst — Garden"',
    'src="unnamed.jpeg" alt="White Cockatoos on Amethyst — Garden"'
)

# The Canopy: Untitled_design_-_1-compressed.jpeg -> unnamed-2.jpg
index = index.replace(
    'src="Untitled_design_-_1-compressed.jpeg" alt="White Doves on Driftwood — Modern Interior"',
    'src="unnamed-2.jpg" alt="White Doves on Driftwood — Modern Interior"'
)

print('Four Worlds: images updated')

# ─────────────────────────────────────────────────
# 5. FIX STATEMENT PIECES SECTION (only Canopy + Vessel)
# ─────────────────────────────────────────────────
old_statement_grid = '''  <div class="sculpt-featured-grid container">
    <a class="sf-card" href="#contact">
      <div class="sf-img-wrap">
        <img src="img/IMG_7047.JPG" alt="White Cockatoo Detail — Crystal Sculpture" loading="lazy">
      </div>
      <div class="sf-card-body">
        <h4>The Canopy</h4>
        <div class="sf-meta"><span class="sf-price">$68,000</span><span class="sf-tier">Statement</span></div>
        <div class="sf-desc">Five white quartz doves on sculptural Brazilian driftwood. The signature piece of the collection.</div>
        <button class="sf-inquire-btn">Inquire About This Piece →</button>
      </div>
      <div class="sf-tag new">Flagship</div>
    </a>
    <a class="sf-card" href="#contact">
      <div class="sf-img-wrap">
        <img src="Untitled_design_-_6-compressed__1_.jpeg" alt="Blue Macaws on Amethyst Geode" loading="lazy">
      </div>
      <div class="sf-card-body">
        <h4>The Dynasty</h4>
        <div class="sf-meta"><span class="sf-price">$52,000</span><span class="sf-tier">Statement</span></div>
        <div class="sf-desc">Amazonite blue macaws perched on a massive amethyst geode. Sunset-hued. One-of-one.</div>
        <button class="sf-inquire-btn">Inquire About This Piece →</button>
      </div>
      <div class="sf-tag">1 Available</div>
    </a>
    <a class="sf-card" href="#contact">
      <div class="sf-img-wrap">
        <img src="Untitled_design_-_3-compressed.jpeg" alt="Scarlet Macaws on White Quartz" loading="lazy">
      </div>
      <div class="sf-card-body">
        <h4>The Scarlets</h4>
        <div class="sf-meta"><span class="sf-price">$42,000</span><span class="sf-tier">Statement</span></div>
        <div class="sf-desc">Deep crimson jasper macaws on cathedral-grade white quartz. Dark drama. Museum presence.</div>
        <button class="sf-inquire-btn">Inquire About This Piece →</button>
      </div>
      <div class="sf-tag">New Arrival</div>
    </a>
  </div>'''

new_statement_grid = '''  <div class="sculpt-featured-grid container">
    <a class="sf-card" href="pieces/the-canopy.html">
      <div class="sf-img-wrap">
        <img src="unnamed-2.jpg" alt="The Canopy — White Quartz Doves on Driftwood" loading="lazy">
      </div>
      <div class="sf-card-body">
        <h4>The Canopy</h4>
        <div class="sf-meta"><span class="sf-price">$68,000</span><span class="sf-tier">Statement</span></div>
        <div class="sf-desc">Five white quartz doves on sculptural Brazilian driftwood. The signature piece of the collection.</div>
        <button class="sf-inquire-btn">Inquire About This Piece →</button>
      </div>
      <div class="sf-tag new">Flagship</div>
    </a>
    <a class="sf-card" href="pieces/the-vessel.html">
      <div class="sf-img-wrap">
        <img src="img/IMG_6971.JPG" alt="The Vessel — Aquamarine Quartz Basin" loading="lazy">
      </div>
      <div class="sf-card-body">
        <h4>The Vessel</h4>
        <div class="sf-meta"><span class="sf-price">$35,000</span><span class="sf-tier">Statement</span></div>
        <div class="sf-desc">A hand-carved basin from a single aquamarine-toned quartz — the only functional object in the collection.</div>
        <button class="sf-inquire-btn">Inquire About This Piece →</button>
      </div>
      <div class="sf-tag">Available</div>
    </a>
  </div>'''

index = index.replace(old_statement_grid, new_statement_grid)
print('Statement Pieces: updated to Canopy + Vessel only')

# ─────────────────────────────────────────────────
# 6. FIX PRICE DISPLAY
# ─────────────────────────────────────────────────
index = index.replace('Prices from $12,500', 'Prices from $6,000')
print('Price display: updated to Prices from $6,000')

write(gallery_path, gallery)
write(index_path, index)
print('gallery.html + index.html saved')
print('\nDone.')
