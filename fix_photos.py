#!/usr/bin/env python3
"""
Fix blurry/old photos across the site:
1. Four Worlds: replace 5.png + 7.png (old CGI) with new lifestyle photos, fix White Cockatoos + Canopy
2. Statement Pieces: Canopy -> 1.png
3. Thumbnails: Canopy -> 1.png, Perch -> studio, Devotion -> studio
4. Perch piece page: first slide -> studio
5. Similar cards: unnamed-3.jpg -> img/IMG_6959.JPG
"""
import re, os

ROOT = '/home/user/Phaora'

def read(p):
    with open(p, encoding='utf-8') as f: return f.read()

def write(p, c):
    with open(p, 'w', encoding='utf-8') as f: f.write(c)

gallery = read(f'{ROOT}/gallery.html')
index   = read(f'{ROOT}/index.html')

# ── 1. FOUR WORLDS SECTION ───────────────────────────────────────
# Blue Macaws: 5.png (old CGI) → high-quality lifestyle photo of blue macaws
index = index.replace(
    'src="5.png" alt="Sodalite Macaws on Amethyst Geode"',
    'src="Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 18.png" alt="Blue Macaws on Amethyst Cathedral"'
)

# Scarlet Macaws: 7.png (old PH editorial) → high-quality lifestyle photo of scarlet macaws
index = index.replace(
    'src="7.png" alt="Crimson Macaws on White Quartz"',
    'src="Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 25.png" alt="Scarlet Macaws on White Quartz"'
)

# White Cockatoos: unnamed.jpeg (17KB blurry) → high-quality lifestyle photo
index = index.replace(
    'src="unnamed.jpeg" alt="White Cockatoos on Amethyst — Garden"',
    'src="Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 22.png" alt="White Cockatoos on Amethyst — Garden"'
)

# The Canopy: unnamed-2.jpg (blurry) → 1.png (campaign photo, 1.8MB)
index = index.replace(
    'src="unnamed-2.jpg" alt="White Doves on Driftwood — Modern Interior"',
    'src="1.png" alt="White Doves on Driftwood — Modern Interior"'
)

print('Four Worlds: images updated')

# ── 2. STATEMENT PIECES SECTION ─────────────────────────────────
index = index.replace(
    'src="unnamed-2.jpg" alt="The Canopy — White Quartz Doves on Driftwood"',
    'src="1.png" alt="The Canopy — White Quartz Doves on Driftwood"'
)
print('Statement Pieces: Canopy -> 1.png')

# ── 3. THUMBNAILS ────────────────────────────────────────────────
# Canopy gallery card
gallery = gallery.replace(
    'src="unnamed-2.jpg" alt="The Canopy',
    'src="1.png" alt="The Canopy'
)
# Canopy fc-card (lazy loader - 1.png has no spaces, will load fine)
index = index.replace(
    'data-src="unnamed-2.jpg" alt="The Canopy"',
    'data-src="1.png" alt="The Canopy"'
)

# Perch gallery card
gallery = gallery.replace(
    'src="unnamed.jpeg" alt="The Perch',
    'src="img/IMG_6958.JPG" alt="The Perch'
)
# Perch fc-card
index = index.replace(
    'data-src="unnamed.jpeg" alt="The Perch"',
    'data-src="img/IMG_6958.JPG" alt="The Perch"'
)

# Devotion: numbered PNG (wrong/may show wrong sculpture) → studio
gallery = gallery.replace(
    'src="Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 24.png" alt="The Devotion',
    'src="img/IMG_7050.JPG" alt="The Devotion'
)
index = index.replace(
    'data-src="Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 24.png" alt="The Devotion"',
    'data-src="img/IMG_7050.JPG" alt="The Devotion"'
)

write(f'{ROOT}/gallery.html', gallery)
write(f'{ROOT}/index.html', index)
print('Thumbnails: Canopy, Perch, Devotion fixed in gallery + index')

# ── 4. PERCH PIECE PAGE: first slide -> studio ────────────────────
perch = read(f'{ROOT}/pieces/the-perch.html')
perch = perch.replace('../unnamed.jpeg', '../img/IMG_6958.JPG')
write(f'{ROOT}/pieces/the-perch.html', perch)
print('Perch piece page: unnamed.jpeg -> studio')

# ── 5. SIMILAR CARDS: unnamed-3.jpg -> img/IMG_6959.JPG ──────────
for slug in ['the-aerie', 'the-monolith', 'the-vessel']:
    path = f'{ROOT}/pieces/{slug}.html'
    html = read(path)
    html = html.replace('../unnamed-3.jpg', '../img/IMG_6959.JPG')
    write(path, html)
    print(f'{slug}: unnamed-3.jpg -> studio in similar card')

print('\nDone.')
