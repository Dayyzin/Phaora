import re, os

PIECES = '/home/user/Phaora/pieces'

PAGES = [
    'the-hyacinths.html',
    'the-aerie.html',
    'the-crimson-duo.html',
    'the-parliament.html',
    'the-soloist.html',
]

GALLERY = {
    'the-hyacinths':  'Untitled design - 1.PNG',
    'the-aerie':      'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 20.png',
    'the-crimson-duo':'Untitled design - 13.PNG',
    'the-parliament': 'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 21.png',
    'the-soloist':    'Untitled (4320 x 1350 px) (2160 x 1000 px) (720 x 1000 px) - 15.png',
}
STUDIO = {
    'the-hyacinths':  'img/IMG_7038.JPG',
    'the-aerie':      'img/IMG_6969.JPG',
    'the-crimson-duo':'img/IMG_6961.JPG',
    'the-parliament': 'img/IMG_7039.JPG',
    'the-soloist':    'img/IMG_6973.JPG',
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
    if 'img/' in s and 'img_' in s:
        return 'Studio'
    if 'unnamed' in s:
        return 'Garden'
    return 'Lifestyle'

def extract_thumbs(html):
    m = html.find('<div class="hero__thumbs">')
    if m == -1:
        return []
    pos = m + len('<div class="hero__thumbs">')
    depth = 1
    while pos < len(html) and depth > 0:
        o = html.find('<div', pos)
        c = html.find('</div>', pos)
        if o != -1 and (c == -1 or o < c):
            depth += 1
            pos = o + 4
        elif c != -1:
            depth -= 1
            pos = c + 6
        else:
            break
    section = html[m:pos]
    return re.findall(r'<img\s+src="([^"]+)"', section)

def build_section(photos, sku, title_html, price):
    n = len(photos)
    w = round(100.0/n, 1)
    slides = '\n'.join(
        f'    <div class="ps-slide{"  active" if i==0 else ""}" data-index="{i}"><img src="{s}" alt="{l}" loading="{"eager" if i==0 else "lazy"}"></div>'
        for i,(s,l) in enumerate(photos)
    )
    thumbs = '\n'.join(
        f'    <div class="ps-thumb{"  active" if i==0 else ""}" data-index="{i}"><img src="{s}" alt="{l}" loading="lazy"><span>{l}</span></div>'
        for i,(s,l) in enumerate(photos)
    )
    dots = ''.join(
        f'<button class="ps-dot{"  active" if i==0 else ""}" data-index="{i}" aria-label="Photo {i+1}"></button>'
        for i in range(n)
    )
    return f'''<!-- PHOTO SWITCHER -->
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
</div>''', n

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

def convert(fname):
    slug = fname.replace('.html','')
    path = os.path.join(PIECES, fname)
    html = open(path).read()

    # --- CSS ---
    # Find hero CSS start
    m_hero = re.search(r'\.hero\s*\{', html)
    if not m_hero:
        print(f'SKIP {fname}: no .hero{{'); return
    # Find .story{ after hero
    m_story = re.search(r'\.story\s*\{', html[m_hero.start():])
    if not m_story:
        print(f'SKIP {fname}: no .story{{'); return
    story_pos = m_hero.start() + m_story.start()
    # Find @media after story
    m_media = re.search(r'@media\s*\(max-width:\s*768px\)', html[story_pos:])
    if not m_media:
        print(f'SKIP {fname}: no @media'); return
    media_pos = story_pos + m_media.start()
    # Find end of media query block
    depth=0; i=media_pos
    while i < len(html):
        if html[i]=='{': depth+=1
        elif html[i]=='}':
            depth-=1
            if depth==0: media_end=i+1; break
        i+=1
    # Replace: hero_start..story_pos => PS_CSS, story_pos..media_pos stays, media_pos..media_end => NEW_MEDIA
    html = html[:m_hero.start()] + PS_CSS + '\n' + html[story_pos:media_pos] + NEW_MEDIA + html[media_end:]

    # --- Extract hero data ---
    sku = (re.search(r'class="hero__sku label">(.*?)</div>', html, re.DOTALL) or ['',''])[0]
    sku = re.search(r'class="hero__sku label">(.*?)</div>', html, re.DOTALL)
    sku = sku.group(1).strip() if sku else ''
    title = re.search(r'class="hero__title">(.*?)</h1>', html, re.DOTALL)
    title = title.group(1).strip() if title else ''
    price = re.search(r'class="hero__price">(.*?)</div>', html, re.DOTALL)
    price = price.group(1).strip() if price else ''

    # --- Photos ---
    thumbs = extract_thumbs(html)
    if thumbs:
        photos = [(s, get_label(s)) for s in thumbs]
    else:
        g = '../' + GALLERY.get(slug,'')
        s = '../' + STUDIO.get(slug,'')
        photos = [(g,'Lifestyle'),(s,'Studio')] if STUDIO.get(slug) else [(g,'Lifestyle')]

    new_section, n = build_section(photos, sku, title, price)

    # --- Replace hero HTML ---
    m_sec = re.search(r'<section\s+class="hero[^"]*"', html)
    if not m_sec:
        print(f'SKIP {fname}: no hero section'); return
    # Find matching </section>
    pos = m_sec.end(); depth=1
    while pos < len(html) and depth > 0:
        o = html.find('<section', pos)
        c = html.find('</section>', pos)
        if c==-1: break
        if o!=-1 and o<c:
            depth+=1; pos=o+8
        else:
            depth-=1
            if depth==0: sec_end=c+10; break
            pos=c+10
    html = html[:m_sec.start()] + new_section + '\n' + html[sec_end:]

    # --- JS: add IIFE, remove old thumb handler ---
    anchor = "document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));"
    iife = make_iife(n)
    if anchor in html and '// Photo switcher' not in html:
        html = html.replace(anchor, anchor + '\n\n' + iife)
    # Remove hero__thumb JS
    html = re.sub(
        r"\n\s*document\.querySelectorAll\(['\"]\.hero__thumb['\"]\)\.forEach[^;]+;\s*\}\s*\)\s*;",
        '', html, flags=re.DOTALL
    )

    open(path,'w').write(html)
    print(f'OK  {fname}  ({n} slides)')

for p in PAGES:
    convert(p)
