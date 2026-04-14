import re, os

BASE = '/home/user/Phaora'

# --- 1. Fix thumbnails in index.html and gallery.html ---
THUMB_FIXES = {
    # file/path in gallery/index → replacement
    'Untitled design - 1.PNG':                                                           'img/IMG_7038.JPG',       # Hyacinths not loading
    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 18.png':             'img/IMG_6967.JPG',       # Indigos not loading
    'Untitled design - 13.PNG':                                                          'img/IMG_6961.JPG',       # Crimson Duo not loading
    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 25.png':             'img/IMG_6974.JPG',       # Scarlets not loading
    'Untitled_design_-_4-compressed__1_.jpeg':                                           'img/IMG_7047.JPG',       # Sovereign wrong (shows canopy)
    'Untitled_design_-_3-compressed__1_.jpeg':                                           'img/IMG_6964.JPG',       # Raptor wrong
    'Untitled design - 12.PNG':                                                          'img/IMG_6975.JPG',       # Grotto wrong
}

for fname in ['index.html', 'gallery.html']:
    path = os.path.join(BASE, fname)
    html = open(path).read()
    changed = []
    for old, new in THUMB_FIXES.items():
        if old in html:
            html = html.replace(old, new)
            changed.append(f'{old[:30]}... → {new}')
    open(path, 'w').write(html)
    print(f'{fname}: {len(changed)} thumbnails fixed')
    for c in changed: print(f'  {c}')

# --- 2. Fix piece pages: rebuild ps-wrap with correct slides ---

def rebuild_ps_section(html, photos):
    """Replace the ps-wrap section with a fresh one using given photos."""
    n = len(photos)
    w = round(100.0/n, 1)
    slides = '\n'.join(
        f'    <div class="ps-slide{" active" if i==0 else ""}" data-index="{i}"><img src="{s}" alt="{l}" loading="{"eager" if i==0 else "lazy"}"></div>'
        for i,(s,l) in enumerate(photos))
    thumbs = '\n'.join(
        f'    <div class="ps-thumb{" active" if i==0 else ""}" data-index="{i}"><img src="{s}" alt="{l}" loading="lazy"><span>{l}</span></div>'
        for i,(s,l) in enumerate(photos))
    dots = ''.join(
        f'<button class="ps-dot{" active" if i==0 else ""}" data-index="{i}" aria-label="Photo {i+1}"></button>'
        for i in range(n))

    new_stage = f'''  <div class="ps-stage" id="psStage">
{slides}
    <div class="ps-gradient-b"></div>
    <div class="ps-gradient-l"></div>
    <button class="ps-arrow ps-arrow--prev" id="psArrowPrev" aria-label="Previous">&#8592;</button>
    <button class="ps-arrow ps-arrow--next" id="psArrowNext" aria-label="Next">&#8594;</button>
    <div class="ps-counter"><span id="psCurrent">1</span> / <span id="psTotal">{n}</span></div>
    <div class="ps-progress"><div class="ps-progress-bar" id="psBar" style="width:{w}%"></div></div>
  </div>
  <div class="ps-filmstrip" id="psFilmstrip">
{thumbs}
  </div>
  <div class="ps-dots" id="psDots">{dots}</div>'''

    # Replace from ps-stage open tag to psDots close tag
    html = re.sub(
        r'<div class="ps-stage" id="psStage">.*?</div>\s*<!-- end psDots -->|'
        r'<div class="ps-stage" id="psStage">.*?<div class="ps-dots" id="psDots">.*?</div>',
        new_stage, html, count=1, flags=re.DOTALL)
    
    # Fix total in counter span
    html = re.sub(r'(<span id="psTotal">)\d+(</span>)', rf'\g<1>{n}\2', html)
    # Fix progress bar width
    html = re.sub(r'(id="psBar"\s+style="width:)[^"]+(")', rf'\g<1>{w}%\2', html)
    # Fix JS total
    html = re.sub(r'(const total=)\d+;', rf'\g<1>{n};', html)
    return html

# Hyacinths: strip to studio only
path = f'{BASE}/pieces/the-hyacinths.html'
html = open(path).read()
html = rebuild_ps_section(html, [('../img/IMG_7038.JPG', 'Studio')])
open(path,'w').write(html)
print('Hyacinths: stripped to studio only')

# Indigos: strip to studio only  
path = f'{BASE}/pieces/the-indigos.html'
html = open(path).read()
html = rebuild_ps_section(html, [('../img/IMG_6967.JPG', 'Studio')])
open(path,'w').write(html)
print('Indigos: stripped to studio only')

# Sentinels: lifestyle (22.png) first, studio second
path = f'{BASE}/pieces/the-sentinels.html'
html = open(path).read()
html = rebuild_ps_section(html, [
    ('../Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 22.png', 'Lifestyle'),
    ('../img/IMG_7040.JPG', 'Studio'),
])
open(path,'w').write(html)
print('Sentinels: lifestyle + studio (2 slides)')

print('Done.')
