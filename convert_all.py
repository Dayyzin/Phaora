import re, os, glob

PIECES = '/home/user/Phaora/pieces'

# Skip: already correct ps-wrap or completely different template
SKIP = {'the-canopy.html','the-eclipse.html','the-perch.html','the-dynasty.html','the-portal.html',
        'the-hyacinths.html','the-aerie.html','the-crimson-duo.html','the-parliament.html','the-soloist.html'}

GALLERY = {
    'the-ascent':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 33.png',
    'the-cathedral':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 35.png',
    'the-companions': 'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 17.png',
    'the-courtship':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 36.png',
    'the-devotion':   'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 24.png',
    'the-duet':       'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 16.png',
    'the-eden':       'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 12.png',
    'the-embrace':    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 29.png',
    'the-ethereals':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 38.png',
    'the-gathering':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 23.png',
    'the-grace':      'IMG_7035.JPG',
    'the-grotto':     'Untitled design - 12.PNG',
    'the-guardians':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 32.png',
    'the-herald':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 28.png',
    'the-indigos':    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 18.png',
    'the-lovers':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 30.png',
    'the-monolith':   'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 31.png',
    'the-nest':       'IMG_7052.JPG',
    'the-orbit':      'IMG_6963.JPG',
    'the-pair':       'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 34.png',
    'the-radiance':   'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 11.png',
    'the-raptor':     'IMG_6964.JPG',
    'the-scarlets':   'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 25.png',
    'the-sentinels':  'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 22.png',
    'the-sovereign':  'IMG_7047.JPG',
    'the-tenderness': 'IMG_6962.JPG',
    'the-vessel':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 14.png',
    'the-violet':     'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 27.png',
    'the-whisper':    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 37.png',
}
STUDIO = {
    'the-ascent':     'img/IMG_7046.JPG',
    'the-cathedral':  'img/IMG_7055.JPG',
    'the-companions': 'img/IMG_7043.JPG',
    'the-courtship':  'img/IMG_7048.JPG',
    'the-devotion':   'img/IMG_7050.JPG',
    'the-duet':       'img/IMG_7054.JPG',
    'the-eden':       'img/IMG_7037.JPG',
    'the-embrace':    'img/IMG_6966.JPG',
    'the-ethereals':  'img/IMG_7056.JPG',
    'the-gathering':  'img/IMG_7053.JPG',
    'the-grace':      'img/IMG_7035.JPG',
    'the-grotto':     'img/IMG_6975.JPG',
    'the-guardians':  'img/IMG_7051.JPG',
    'the-herald':     'img/IMG_7045.JPG',
    'the-indigos':    'img/IMG_6967.JPG',
    'the-lovers':     'img/IMG_7044.JPG',
    'the-monolith':   'img/IMG_6965.JPG',
    'the-nest':       'img/IMG_7052.JPG',
    'the-orbit':      'img/IMG_6963.JPG',
    'the-pair':       'img/IMG_7049.JPG',
    'the-radiance':   'img/IMG_7036.JPG',
    'the-raptor':     'img/IMG_6964.JPG',
    'the-scarlets':   'img/IMG_6974.JPG',
    'the-sentinels':  'img/IMG_7040.JPG',
    'the-sovereign':  'img/IMG_7047.JPG',
    'the-tenderness': 'img/IMG_6962.JPG',
    'the-vessel':     'img/IMG_6971.JPG',
    'the-violet':     'img/IMG_7042.JPG',
    'the-whisper':    'img/IMG_7041.JPG',
}

PS_CSS = """.ps-wrap{padding-top:50px;position:relative;background:var(--bg);}
.ps-stage{position:relative;height:600px;overflow:hidden;background:var(--bg2);}
.ps-slide{position:absolute;inset:0;opacity:0;transition:opacity 0.7s cubic-bezier(0.22,1,0.36,1);pointer-events:none;}
.ps-slide.active{opacity:1;pointer-events:auto;}
.ps-slide img{width:100%;height:100%;object-fit:cover;transition:transform 8s cubic-bezier(0.22,1,0.36,1);transform:scale(1.04);}
.ps-slide.active img{transform:scale(1);}
.ps-gradient-b{position:absolute;inset:0;pointer-events:none;z-index:2;background:linear-gradient(to bottom,transparent 40%,var(--bg) 100%);}
.ps-gradient-l{position:absolute;inset:0;pointer-events:none;z-index:2;background:linear-gradient(to right,rgba(8,8,6,0.35) 0%,transparent 35%);}
.ps-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:10;background:rgba(8,8,6,0.5);backdrop-filter:blur(12px);border:1px solid var(--border);width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s;color:var(--cream-dim);font-size:16px;}
.ps-arrow:hover{background:rgba(201,169,110,0.1);border-color:var(--gold);color:var(--gold);}
.ps-arrow--prev{left:20px;}
.ps-arrow--next{right:20px;}
.ps-counter{position:absolute;top:20px;right:20px;z-index:10;font-family:var(--f-sans);font-size:10px;letter-spacing:0.2em;color:rgba(242,237,228,0.5);}
#psCurrent{color:var(--cream);}
.ps-progress{position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(201,169,110,0.08);z-index:10;}
.ps-progress-bar{height:100%;background:var(--gold);transition:width 0.7s cubic-bezier(0.22,1,0.36,1);}
.ps-filmstrip{display:flex;gap:6px;padding:14px 32px 0;overflow-x:auto;scrollbar-width:none;background:linear-gradient(to bottom,var(--bg) 0%,var(--bg2) 100%);}
.ps-filmstrip::-webkit-scrollbar{display:none;}
.ps-thumb{flex-shrink:0;width:80px;height:54px;position:relative;overflow:hidden;cursor:pointer;border:1px solid var(--border);opacity:0.45;transition:all 0.3s;}
.ps-thumb:hover{opacity:0.75;border-color:var(--border-hover);}
.ps-thumb.active{opacity:1;border-color:var(--gold);}
.ps-thumb img{width:100%;height:100%;object-fit:cover;}
.ps-thumb span{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(8,8,6,0.85),transparent);padding:4px 5px 3px;font-family:var(--f-sans);font-size:7px;letter-spacing:0.1em;color:var(--cream-dim);text-transform:uppercase;opacity:0;transition:opacity 0.3s;}
.ps-thumb:hover span,.ps-thumb.active span{opacity:1;}
.ps-dots{display:none;gap:6px;justify-content:center;padding:10px 0 0;}
.ps-dot{width:5px;height:5px;border-radius:50%;background:var(--cream-faint);border:none;cursor:pointer;transition:all 0.3s;padding:0;}
.ps-dot.active{background:var(--gold);width:16px;border-radius:3px;}
.hero__info{max-width:900px;margin:0 auto;padding:40px 32px 0;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:20px;animation:fadeUp 0.8s 0.3s both;}
.hero__sku{font-family:var(--f-sans);font-size:10px;letter-spacing:0.25em;color:var(--gold-dim);margin-bottom:10px;}
.hero__title{font-family:var(--f-display);font-size:48px;font-weight:400;color:var(--cream);line-height:1.15;}
.hero__title em{color:var(--gold);font-style:italic;}
.hero__price{font-family:var(--f-display);font-size:38px;color:var(--gold);font-weight:400;}
.hero__price-note{font-family:var(--f-body);font-size:14px;color:var(--cream-dim);font-style:italic;font-weight:300;margin-top:4px;}"""

NEW_MEDIA = '@media(max-width:768px){.ps-stage{height:420px;}.ps-filmstrip{padding:10px 16px 0;}.ps-thumb{width:60px;height:42px;}.ps-arrow{display:none;}.ps-dots{display:flex;}.hero__title{font-size:32px;}.hero__price{font-size:28px;}.hero__info{flex-direction:column;align-items:flex-start;}.story{grid-template-columns:1fr;gap:32px;}.stats-grid{grid-template-columns:repeat(2,1fr);}.lifestyle__grid{grid-template-columns:1fr;}.sold-grid{grid-template-columns:1fr;}.similar-grid{grid-template-columns:1fr;}.intent-grid{grid-template-columns:1fr;}.certificate__signers{flex-direction:column;gap:20px;}.section{padding:40px 20px 0;}}'

def get_label(src):
    s = src.lower()
    if 'img/' in s and 'img_' in s: return 'Studio'
    if 'unnamed' in s: return 'Garden'
    return 'Lifestyle'

def extract_thumbs(html):
    m = html.find('<div class="hero__thumbs">')
    if m == -1: return []
    pos = m + len('<div class="hero__thumbs">'); depth = 1
    while pos < len(html) and depth > 0:
        o = html.find('<div', pos); c = html.find('</div>', pos)
        if o != -1 and (c == -1 or o < c): depth += 1; pos = o + 4
        elif c != -1: depth -= 1; pos = c + 6
        else: break
    return re.findall(r'<img\s+src="([^"]+)"', html[m:pos])

def extract_ps_slides(html):
    return re.findall(r'<div class="ps-slide[^"]*"[^>]*>\s*<img src="([^"]+)"', html)

def build_section(photos, sku, title_html, price):
    n = len(photos); w = round(100.0/n, 1)
    slides = '\n'.join(
        f'    <div class="ps-slide{" active" if i==0 else ""}" data-index="{i}"><img src="{s}" alt="{l}" loading="{"eager" if i==0 else "lazy"}"></div>'
        for i,(s,l) in enumerate(photos))
    thumbs = '\n'.join(
        f'    <div class="ps-thumb{" active" if i==0 else ""}" data-index="{i}"><img src="{s}" alt="{l}" loading="lazy"><span>{l}</span></div>'
        for i,(s,l) in enumerate(photos))
    dots = ''.join(
        f'<button class="ps-dot{" active" if i==0 else ""}" data-index="{i}" aria-label="Photo {i+1}"></button>'
        for i in range(n))
    section = f'''<!-- PHOTO SWITCHER -->
<section class="ps-wrap" id="photoSwitcher">
  <div class="ps-stage" id="psStage">
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
  <div class="ps-dots" id="psDots">{dots}</div>
</section>

<div class="hero__info">
  <div>
    <div class="hero__sku label">{sku}</div>
    <h1 class="hero__title">{title_html}</h1>
  </div>
  <div style="text-align:right;">
    <div class="hero__price">{price}</div>
    <div class="hero__price-note">Acquisition by private inquiry</div>
  </div>
</div>'''
    return section, n

def make_iife(n):
    return f"""// Photo switcher
(function(){{
  const total={n};let cur=0;let timer;
  const stage=document.getElementById('psStage');
  const strip=document.getElementById('psFilmstrip');
  const dotsEl=document.getElementById('psDots');
  const bar=document.getElementById('psBar');
  const curEl=document.getElementById('psCurrent');
  const btnP=document.getElementById('psArrowPrev');
  const btnN=document.getElementById('psArrowNext');
  const slides=stage.querySelectorAll('.ps-slide');
  const thumbs=strip.querySelectorAll('.ps-thumb');
  const dots=dotsEl.querySelectorAll('.ps-dot');
  function goTo(n){{slides[cur].classList.remove('active');thumbs[cur]?.classList.remove('active');dots[cur]?.classList.remove('active');cur=(n+total)%total;slides[cur].classList.add('active');thumbs[cur]?.classList.add('active');dots[cur]?.classList.add('active');thumbs[cur]?.scrollIntoView({{behavior:'smooth',block:'nearest',inline:'center'}});curEl.textContent=cur+1;bar.style.width=((cur+1)/total*100)+'%';}}
  btnP.addEventListener('click',()=>{{goTo(cur-1);resetTimer();}});
  btnN.addEventListener('click',()=>{{goTo(cur+1);resetTimer();}});
  thumbs.forEach(t=>t.addEventListener('click',()=>{{goTo(+t.dataset.index);resetTimer();}}));
  dots.forEach(d=>d.addEventListener('click',()=>{{goTo(+d.dataset.index);resetTimer();}}));
  document.addEventListener('keydown',e=>{{if(e.key==='ArrowLeft'){{goTo(cur-1);resetTimer();}}if(e.key==='ArrowRight'){{goTo(cur+1);resetTimer();}}}});
  let tx=null;
  stage.addEventListener('touchstart',e=>{{tx=e.touches[0].clientX;}},{{passive:true}});
  stage.addEventListener('touchend',e=>{{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>50){{goTo(dx<0?cur+1:cur-1);resetTimer();}}tx=null;}});
  function resetTimer(){{clearInterval(timer);timer=setInterval(()=>goTo(cur+1),5500);}}
  resetTimer();
}})();"""

def convert(filepath):
    fname = os.path.basename(filepath)
    slug = fname.replace('.html','')
    if fname in SKIP: print(f'SKIP {fname}'); return

    html = open(filepath).read()
    if '.hero__image{' not in html and '.hero__image {' not in html:
        print(f'SKIP {fname} (no hero__image CSS)'); return

    # --- CSS replacement ---
    m_hero = re.search(r'\.hero\s*\{', html)
    if not m_hero: print(f'SKIP {fname}: no .hero{{'); return
    m_story = re.search(r'\.story\s*\{', html[m_hero.start():])
    if not m_story: print(f'SKIP {fname}: no .story{{'); return
    story_pos = m_hero.start() + m_story.start()
    m_media = re.search(r'@media\s*\(max-width:\s*768px\)', html[story_pos:])
    if not m_media: print(f'SKIP {fname}: no @media'); return
    media_pos = story_pos + m_media.start()
    depth=0; i=media_pos
    while i < len(html):
        if html[i]=='{': depth+=1
        elif html[i]=='}':
            depth-=1
            if depth==0: media_end=i+1; break
        i+=1
    html = html[:m_hero.start()] + PS_CSS + '\n' + html[story_pos:media_pos] + NEW_MEDIA + html[media_end:]
    # Remove any leftover appended ps-wrap <style> block (hybrid pages)
    html = re.sub(r'\n<style>\s*\.ps-wrap\s*\{[^<]*</style>', '', html)

    # --- Hero data ---
    sku_m = re.search(r'class="hero__sku label">(.*?)</div>', html, re.DOTALL)
    sku = sku_m.group(1).strip() if sku_m else ''
    title_m = re.search(r'class="hero__title">(.*?)</h1>', html, re.DOTALL)
    title_html = title_m.group(1).strip() if title_m else ''
    price_m = re.search(r'class="hero__price">(.*?)</div>', html, re.DOTALL)
    price = price_m.group(1).strip() if price_m else ''

    # --- Photos ---
    is_hybrid = bool(re.search(r'<section\s+class="hero\s+ps-wrap"', html))
    if is_hybrid:
        srcs = extract_ps_slides(html)
        photos = [(s, get_label(s)) for s in srcs] if srcs else []
    else:
        thumbs = extract_thumbs(html)
        if thumbs:
            photos = [(s, get_label(s)) for s in thumbs]
        else:
            g = '../' + GALLERY.get(slug,'')
            s = '../' + STUDIO.get(slug,'')
            photos = [(g,'Lifestyle'),(s,'Studio')] if STUDIO.get(slug) else [(g,'Lifestyle')]
    if not photos:
        g = GALLERY.get(slug)
        photos = [(f'../{g}','Lifestyle')] if g else [('../img/placeholder.jpg','Studio')]

    new_section, n = build_section(photos, sku, title_html, price)

    # --- Replace hero HTML section ---
    m_sec = re.search(r'<section\s+class="hero[^"]*"[^>]*>', html)
    if m_sec:
        pos = m_sec.end(); depth = 1
        while pos < len(html) and depth > 0:
            o = html.find('<section', pos); c = html.find('</section>', pos)
            if c == -1: break
            if o != -1 and o < c: depth+=1; pos=o+8
            else:
                depth-=1
                if depth==0: sec_end=c+10; break
                pos=c+10
        html = html[:m_sec.start()] + new_section + '\n' + html[sec_end:]
    else:
        print(f'  (no hero section HTML, CSS-only update)')

    # --- JS ---
    anchor = "document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));"
    iife = make_iife(n)
    if anchor in html and '// Photo switcher' not in html:
        html = html.replace(anchor, anchor + '\n\n' + iife)
    elif '// Photo switcher' in html:
        html = re.sub(r'// Photo switcher\s*\(function\(\)\{.*?\}\)\(\);', iife, html, flags=re.DOTALL)
    html = re.sub(r"\n\s*document\.querySelectorAll\(['\"]\.hero__thumb['\"]\)\.forEach[^;]+;\s*\}\s*\)\s*;", '', html, flags=re.DOTALL)

    open(filepath,'w').write(html)
    print(f'OK  {fname}  ({n} slides)')

for f in sorted(glob.glob(os.path.join(PIECES,'*.html'))):
    convert(f)
