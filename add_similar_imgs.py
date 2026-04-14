import re, os, glob

PIECES = '/home/user/Phaora/pieces'

GALLERY = {
    'the-canopy':     'unnamed-3.jpg',
    'the-aerie':      'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 20.png',
    'the-eden':       'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 12.png',
    'the-dynasty':    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 13.png',
    'the-parliament': 'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 21.png',
    'the-scarlets':   'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 25.png',
    'the-portal':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 19.png',
    'the-sovereign':  'IMG_7047.JPG',
    'the-ascent':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 33.png',
    'the-cathedral':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 35.png',
    'the-monolith':   'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 31.png',
    'the-raptor':     'IMG_6964.JPG',
    'the-hyacinths':  'Untitled design - 1.PNG',
    'the-indigos':    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 18.png',
    'the-sentinels':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 22.png',
    'the-crimson-duo':'Untitled design - 13.PNG',
    'the-grotto':     'Untitled design - 12.PNG',
    'the-ethereals':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 38.png',
    'the-companions': 'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 17.png',
    'the-lovers':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 30.png',
    'the-duet':       'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 16.png',
    'the-gathering':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 23.png',
    'the-courtship':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 36.png',
    'the-violet':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 27.png',
    'the-soloist':    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 15.png',
    'the-radiance':   'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 11.png',
    'the-pair':       'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 34.png',
    'the-eclipse':    'Untitled design - 7.PNG',
    'the-devotion':   'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 24.png',
    'the-whisper':    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 37.png',
    'the-nest':       'IMG_7052.JPG',
    'the-guardians':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 32.png',
    'the-herald':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 28.png',
    'the-embrace':    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 29.png',
    'the-grace':      'IMG_7035.JPG',
    'the-perch':      'unnamed.jpeg',
    'the-tenderness': 'IMG_6962.JPG',
    'the-orbit':      'IMG_6963.JPG',
    'the-vessel':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 14.png',
}

IMG_STYLE = 'width:100%;height:100%;object-fit:cover;display:block;'

def process(filepath):
    html = open(filepath).read()
    
    # Find all similar-card links and add img to their image div
    def replace_card(m):
        full = m.group(0)
        href = re.search(r'href="([^"]+)"', full)
        if not href:
            return full
        linked = href.group(1).replace('.html','').replace('pieces/','').replace('../','')
        # Extract just the slug (basename without extension)
        linked = os.path.basename(linked)
        photo = GALLERY.get(linked)
        if not photo:
            return full
        img_tag = f'<img src="../{photo}" alt="{linked.replace("-"," ").title()}" loading="lazy" style="{IMG_STYLE}">'
        # Replace empty similar-card__image div (with optional comment/whitespace inside)
        replaced = re.sub(
            r'(<div class="similar-card__image">)\s*(?:<!--[^>]*-->)?\s*(</div>)',
            r'\1' + img_tag + r'\2',
            full
        )
        return replaced

    new_html = re.sub(
        r'<a\s+href="[^"]*"\s+class="similar-card[^"]*"[^>]*>.*?</a>',
        replace_card,
        html,
        flags=re.DOTALL
    )
    
    if new_html != html:
        open(filepath, 'w').write(new_html)
        count = len(re.findall(r'similar-card__image"><img', new_html))
        print(f'OK  {os.path.basename(filepath)}  ({count} cards filled)')
    else:
        print(f'--  {os.path.basename(filepath)}  (no change)')

for f in sorted(glob.glob(os.path.join(PIECES, '*.html'))):
    process(f)
