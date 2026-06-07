#!/usr/bin/env node
'use strict';
const fs = require('fs');

const WORKS = [
  {num:'I', idx:1, name:'Alba Bianca', tr:'White Dawn', slug:'alba-bianca', glow:'rgba(220,200,160,.35)', img:'av/phaora-aguasvivas-01-alba-bianca.png', video:'av/videos/Alba Bianca.mp4', revealed:true,
    narrative:'Alba Bianca — White Dawn — is the work that opens the collection. Carved from a single formation of selenite and amethyst, extracted from the mountains of Minas Gerais, it carries the mineral light of the interior for which Águas Vivas is named. No tool touched it that was not guided by hand.',
    specs:[
      {label:'Material',    value:'Selenite · Amethyst · 24k Gold'},
      {label:'Origin',      value:'Minas Gerais, Brazil'},
      {label:'Craft',       value:'Carved in Fabiano\'s atelier'},
      {label:'Collection',  value:'Águas Vivas · 003'},
      {label:'Work',        value:'I of Eleven'},
      {label:'Edition',     value:'One of one'},
      {label:'Availability',value:'Private inquiry only'},
    ],
    photos:[
      {f:'ab-01.jpg',span:2},{f:'ab-02.jpg',span:1},{f:'ab-03.jpg',span:1},
      {f:'ab-04.jpg',span:1},{f:'ab-05.jpg',span:1},{f:'ab-06.jpg',span:1},{f:'ab-07.jpg',span:1},
      {f:'ab-08.jpg',span:4},
      {f:'ab-09.jpg',span:1},{f:'ab-10.jpg',span:2},{f:'ab-11.jpg',span:1},
      {f:'ab-12.jpg',span:2},{f:'ab-13.jpg',span:1},{f:'ab-14.jpg',span:1},
      {f:'ab-15.jpg',span:1},{f:'ab-16.jpg',span:1},{f:'ab-17.jpg',span:1},{f:'ab-18.jpg',span:1},
      {f:'ab-19.jpg',span:4},
      {f:'ab-20.jpg',span:1},{f:'ab-21.jpg',span:1},{f:'ab-22.jpg',span:2},
      {f:'ab-23.jpg',span:1},{f:'ab-24.jpg',span:1},{f:'ab-25.jpg',span:1},{f:'ab-26.jpg',span:1},
      {f:'ab-27.jpg',span:4},
      {f:'ab-28.jpg',span:2},{f:'ab-29.jpg',span:2},
    ]
  },
  {num:'II',   idx:2,  name:'La Corte',      tr:'The Court',      slug:'la-corte',      glow:'rgba(79,181,190,.28)'},
  {num:'III',  idx:3,  name:'Crepuscolo',    tr:'Twilight',       slug:'crepuscolo',    glow:'rgba(110,80,160,.30)'},
  {num:'IV',   idx:4,  name:"L'Ascesa",      tr:'The Ascent',     slug:'l-ascesa',      glow:'rgba(79,181,190,.32)'},
  {num:'V',    idx:5,  name:'La Protezione', tr:'The Protection', slug:'la-protezione', glow:'rgba(200,164,94,.26)'},
  {num:'VI',   idx:6,  name:'Il Bacio',      tr:'The Kiss',       slug:'il-bacio',      glow:'rgba(180,80,100,.28)'},
  {num:'VII',  idx:7,  name:'Origine',       tr:'Origin',         slug:'origine',       glow:'rgba(60,140,120,.30)'},
  {num:'VIII', idx:8,  name:'Duetto',        tr:'Duet',           slug:'duetto',        glow:'rgba(79,181,190,.24)'},
  {num:'IX',   idx:9,  name:'Maestà',        tr:'Majesty',        slug:'maesta',        glow:'rgba(200,164,94,.32)'},
  {num:'X',    idx:10, name:"Sull'Altare",   tr:'On the Altar',   slug:'sull-altare',   glow:'rgba(160,120,200,.28)'},
  {num:'XI',   idx:11, name:"Volo d'Amore",  tr:'Flight of Love', slug:'volo-d-amore',  glow:'rgba(79,181,190,.32)'},
];

function ep(p) {
  return p.split('/').map(s => encodeURIComponent(s)).join('/');
}

function navDropdown(currentSlug) {
  return WORKS.map(w => {
    const active = w.slug === currentSlug ? ' nav-dp-active' : '';
    return `        <a href="av-${w.slug}.html" class="nav-dp-item${active}"><span class="nav-dp-num">${w.num}</span><span class="nav-dp-name">${w.name}</span></a>`;
  }).join('\n');
}

function page(w, idx) {
  const prev = idx > 0 ? WORKS[idx - 1] : null;
  const next = idx < WORKS.length - 1 ? WORKS[idx + 1] : null;
  const emailSubject = encodeURIComponent(`Inquiry — ${w.name} · Águas Vivas`);

  const mediaHtml = w.revealed
    ? `  <div class="piece-bg" id="pieceBg" style="background-image:url('${w.img}')"></div>\n  <video class="piece-video" id="pieceVideo" autoplay loop muted playsinline>\n    <source src="${ep(w.video)}" type="video/mp4">\n  </video>`
    : '';

  const statusText = w.revealed ? 'Private inquiry open' : 'Sealed &middot; August MMXXVI';

  const galleryHtml = (w.revealed && w.photos && w.photos.length) ? (function() {
    const total = w.photos.length;
    const gridItems = w.photos.map((p, i) => {
      const spanClass = p.span === 4 ? 'ab-photo--s4 ab-photo--hero' : p.span === 2 ? 'ab-photo--s2 ab-photo--wide' : 'ab-photo--sq';
      return `<div class="ab-photo ${spanClass}" onclick="openLb(${i})" role="button" tabindex="0" aria-label="View photograph ${i+1}">
  <img src="av/alba-bianca/${p.f}" loading="lazy" alt="Alba Bianca — photograph ${i+1} of ${total}">
  <span class="ab-photo-num">${String(i+1).padStart(2,'0')}</span>
</div>`;
    }).join('\n');
    const thumbItems = w.photos.map((p, i) =>
      `<div class="ab-thumb${i===0?' active':''}" onclick="openLb(${i})" aria-label="Photo ${i+1}"><img src="av/alba-bianca/${p.f}" loading="lazy" alt="Thumbnail ${i+1}"></div>`
    ).join('\n');
    return `<section class="ab-gallery">
  <div class="ab-gallery-header">
    <h2 class="ab-gallery-title">Twenty-nine views<br>of <em>one work</em></h2>
    <span class="ab-gallery-count">${total} photographs</span>
  </div>
  <div class="ab-grid" id="abGrid">${gridItems}</div>
  <div class="ab-strip-wrap">
    <p class="ab-strip-label">Scroll to explore all ${total}</p>
    <div class="ab-strip" id="abStrip">${thumbItems}</div>
  </div>
</section>

<!-- LIGHTBOX -->
<div class="ab-lb" id="abLb" role="dialog" aria-modal="true" aria-label="Photo viewer">
  <button class="ab-lb-close" onclick="closeLb()" aria-label="Close">Close &times;</button>
  <button class="ab-lb-prev" onclick="shiftLb(-1)" aria-label="Previous">&larr;</button>
  <div class="ab-lb-img-wrap">
    <img class="ab-lb-img" id="abLbImg" src="" alt="">
  </div>
  <button class="ab-lb-next" onclick="shiftLb(1)" aria-label="Next">&rarr;</button>
  <div class="ab-lb-bar">
    <span class="ab-lb-counter" id="abLbCounter">01 / ${total}</span>
    <div class="ab-lb-progress"><div class="ab-lb-fill" id="abLbFill" style="width:${(1/total*100).toFixed(1)}%"></div></div>
    <a href="mailto:david@phaora.com?subject=${encodeURIComponent('Inquiry — Alba Bianca · Águas Vivas')}" class="ab-lb-inq">Inquire &rarr;</a>
  </div>
</div>`;
  })() : '';

  const editorialHtml = (w.revealed && w.narrative && w.specs)
    ? `<section class="work-editorial">
  <div class="work-editorial-text">
    <p class="work-edit-eyebrow">Work ${w.num} of XI &nbsp;&middot;&nbsp; &#193;guas Vivas &nbsp;&middot;&nbsp; Collection 003</p>
    <h2 class="work-edit-title">The first light.<br><em>The opening work.</em></h2>
    <p class="work-edit-body">${w.narrative}</p>
  </div>
  <dl class="work-edit-specs">
    ${w.specs.map(s => `<div class="work-spec-row"><dt class="work-spec-label">${s.label}</dt><dd class="work-spec-value">${s.value}</dd></div>`).join('\n    ')}
  </dl>
</section>`
    : `<div class="piece-details">
  <div class="piece-spec"><span class="spec-label">Material</span><span class="spec-value">Crystal &middot; Minas Gerais</span></div>
  <div class="piece-details-sep"></div>
  <div class="piece-spec"><span class="spec-label">Collection</span><span class="spec-value">&#193;guas Vivas &middot; 003</span></div>
  <div class="piece-details-sep"></div>
  <div class="piece-spec"><span class="spec-label">Edition</span><span class="spec-value">One of one</span></div>
  <div class="piece-details-sep"></div>
  <div class="piece-spec"><span class="spec-label">Reveal</span><span class="spec-value">23 August MMXXVI</span></div>
</div>`;

  const videoJS = w.revealed
    ? `(function(){\n  var v=document.getElementById('pieceVideo'),bg=document.getElementById('pieceBg');\n  bg.classList.add('loaded');\n  if(!v)return;\n  v.addEventListener('canplay',function(){v.classList.add('loaded')},{once:true});\n  v.load();\n})();`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${w.name} — ${w.tr}. Work ${w.num} of eleven. Águas Vivas · Collection 003 by Phaöra. Hand-carved crystal from the mountains of Minas Gerais.">
<meta property="og:title" content="${w.name} — PHAÖRA · Águas Vivas">
<meta property="og:description" content="${w.tr}. Work ${w.num} of eleven. One of one. Private inquiry only.">
<meta property="og:image" content="${w.img}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<title>${w.name} — PHAÖRA · Águas Vivas</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--pearl:#EAEFF5;--silver:#DBE6F0;--teal:#4FB5BE;--teal-d:rgba(79,181,190,.55);--gold:#C8A45E;--gold-lt:#D9BC7C;--ink:#020812}
html{scroll-behavior:smooth}
body{background:var(--ink);color:var(--pearl);font-family:'Inter',sans-serif;font-weight:300;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
#pageStars{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.5}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:200;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 clamp(20px,4vw,60px);height:64px;transition:background .4s}
nav.scrolled{background:rgba(2,8,18,.92);backdrop-filter:blur(14px);border-bottom:1px solid rgba(79,181,190,.08)}
.nav-links{display:flex;gap:24px}
.nav-links a{font-size:10px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(234,239,245,.38);transition:color .2s;white-space:nowrap}
.nav-links a:hover{color:rgba(234,239,245,.82)}
.nav-wm{font-family:'Cormorant Garamond',serif;font-size:19px;letter-spacing:.42em;text-indent:.42em;text-transform:uppercase;color:var(--pearl);text-align:center;white-space:nowrap}
.nav-wm .o{color:var(--teal-d)}
.nav-right{display:flex;gap:20px;align-items:center;justify-content:flex-end}
.nav-right a{font-size:10px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(234,239,245,.38);transition:color .2s}
.nav-right a:hover{color:rgba(234,239,245,.82)}
.nav-right .enq{border:1px solid rgba(200,164,94,.28);padding:7px 16px;color:rgba(200,164,94,.75);transition:border-color .2s,color .2s}
.nav-right .enq:hover{border-color:var(--gold);color:var(--gold)}
.nav-burger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:8px;background:none;border:none;z-index:201}
.nav-burger span{display:block;width:22px;height:1.5px;background:rgba(234,239,245,.65);transition:transform .3s,opacity .3s}
.nav-burger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
.nav-burger.open span:nth-child(2){opacity:0}
.nav-burger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
.mobile-menu{position:fixed;inset:0;z-index:200;background:rgba(2,8,18,.97);backdrop-filter:blur(16px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;opacity:0;pointer-events:none;transition:opacity .35s}
.mobile-menu.open{opacity:1;pointer-events:auto}
.mobile-menu a{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(28px,6vw,42px);color:rgba(234,239,245,.55);text-decoration:none;padding:12px 0;letter-spacing:.08em;transition:color .2s;text-align:center}
.mobile-menu a:hover{color:var(--pearl)}
.mobile-menu a.av{color:rgba(79,181,190,.65)}
.mobile-menu .m-rule{width:32px;height:1px;background:linear-gradient(90deg,transparent,rgba(200,164,94,.3),transparent);margin:20px 0}
.mobile-menu .m-small{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(14px,3vw,18px);font-style:italic;color:rgba(200,164,94,.6)}
@media(max-width:768px){.nav-links{display:none}.nav-right a{display:none}.nav-burger{display:flex}}
.nav-dropdown{position:relative;display:flex;align-items:center}
.nav-dropdown-trigger{font-size:10px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(79,181,190,.95);white-space:nowrap;cursor:pointer;display:flex;align-items:center;gap:5px;transition:color .2s}
.nav-dropdown-chevron{opacity:.88;transition:transform .28s,opacity .2s;flex-shrink:0}
.nav-dropdown:hover .nav-dropdown-chevron{transform:rotate(180deg)}
.nav-dropdown-panel{position:absolute;top:calc(100% + 18px);left:50%;transform:translateX(-50%) translateY(-6px);background:rgba(2,8,18,.97);border:1px solid rgba(79,181,190,.16);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);min-width:192px;padding:16px 0;opacity:0;pointer-events:none;transition:opacity .22s,transform .22s;z-index:300}
.nav-dropdown:hover .nav-dropdown-panel{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
.nav-dropdown-panel::before{content:'';position:absolute;top:-18px;left:0;right:0;height:18px}
.nav-dp-header{font-size:8px;letter-spacing:.28em;text-transform:uppercase;color:rgba(200,164,94,.38);padding:0 18px 12px;border-bottom:1px solid rgba(79,181,190,.08);margin-bottom:6px}
.nav-dp-item{display:flex;align-items:baseline;gap:9px;padding:5px 18px;text-decoration:none;transition:background .15s}
.nav-dp-item:hover,.nav-dp-active{background:rgba(79,181,190,.06)}
.nav-dp-num{font-family:'Cormorant Garamond',serif;font-size:11px;font-style:italic;color:rgba(79,181,190,.22);width:18px;flex-shrink:0;transition:color .15s}
.nav-dp-item:hover .nav-dp-num,.nav-dp-active .nav-dp-num{color:rgba(79,181,190,.6)}
.nav-dp-name{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:rgba(79,181,190,.48);transition:color .15s}
.nav-dp-item:hover .nav-dp-name{color:rgba(79,181,190,1)}
.nav-dp-active .nav-dp-name{color:rgba(79,181,190,.85)}
.nav-dp-footer{margin-top:8px;padding:10px 18px 0;border-top:1px solid rgba(79,181,190,.08)}
.nav-dp-footer a{font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:rgba(200,164,94,.52);transition:color .2s}
.nav-dp-footer a:hover{color:rgba(200,164,94,.9)}

/* HERO */
.piece-hero{position:relative;width:100%;height:100vh;min-height:640px;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden}
.piece-bg{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center;filter:brightness(.42) saturate(.7);transform:scale(1.04);transition:transform 10s ease}
.piece-bg.loaded{transform:scale(1)}
.piece-video{position:absolute;inset:0;z-index:1;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.4s ease;filter:brightness(.50) saturate(.80) contrast(1.08);image-rendering:high-quality}
.piece-video.loaded{opacity:1}
.piece-overlay{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(to bottom,rgba(2,8,18,.75) 0%,rgba(2,8,18,.15) 28%,rgba(2,8,18,.15) 62%,rgba(2,8,18,.92) 100%),radial-gradient(ellipse 65% 52% at 50% 52%,${w.glow} 0%,transparent 68%)}
.piece-numeral{position:absolute;z-index:3;font-family:'Cormorant Garamond',serif;font-weight:300;font-style:italic;font-size:clamp(140px,22vw,320px);line-height:1;color:rgba(234,239,245,.035);pointer-events:none;top:50%;left:50%;transform:translate(-50%,-50%);letter-spacing:-.02em;user-select:none;white-space:nowrap}
.piece-content{position:relative;z-index:4;text-align:center;display:flex;flex-direction:column;align-items:center;padding:0 clamp(24px,5vw,80px);animation:fadeUp 1.2s cubic-bezier(.22,1,.36,1) .3s both}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.piece-eyebrow{font-size:9px;font-weight:500;letter-spacing:.46em;text-indent:.46em;text-transform:uppercase;color:rgba(79,181,190,.52);margin-bottom:28px}
.piece-name{font-family:'Cormorant Garamond',serif;font-weight:300;font-style:italic;font-size:clamp(52px,9vw,124px);line-height:.95;color:var(--silver);letter-spacing:.01em;text-shadow:0 0 80px rgba(79,181,190,.22),0 4px 10px rgba(0,0,0,.55);margin-bottom:16px}
.piece-tr{font-size:10px;font-weight:500;letter-spacing:.38em;text-transform:uppercase;color:rgba(79,181,190,.48);margin-bottom:36px}
.piece-rule{width:36px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin-bottom:36px}
.piece-status{font-size:9px;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:rgba(200,164,94,.52);display:flex;align-items:center;gap:10px;margin-bottom:28px}
.piece-status::before{content:'';width:4px;height:4px;border-radius:50%;background:rgba(200,164,94,.6);box-shadow:0 0 7px rgba(200,164,94,.4)}
.piece-inq-cta{display:inline-flex;align-items:center;gap:12px;font-size:10px;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:rgba(200,164,94,.8);border:1px solid rgba(200,164,94,.25);padding:13px 34px;transition:all .3s cubic-bezier(.22,1,.36,1)}
.piece-inq-cta:hover{background:rgba(200,164,94,.07);border-color:var(--gold);color:var(--gold);gap:18px}
.piece-inq-cta svg{transition:transform .3s}
.piece-inq-cta:hover svg{transform:translateX(4px)}
.piece-scroll{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);z-index:4;display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0;animation:fadeUp .8s ease 1.4s forwards}
.piece-scroll-text{font-size:8px;font-weight:500;letter-spacing:.32em;text-transform:uppercase;color:rgba(234,239,245,.2)}
.piece-scroll-line{width:1px;height:0;background:linear-gradient(180deg,rgba(79,181,190,.5),transparent);animation:scrollLine 1s ease 2s forwards}
@keyframes scrollLine{to{height:28px}}

/* DETAILS */
.piece-details{border-bottom:1px solid rgba(234,239,245,.04);padding:clamp(52px,7vw,96px) clamp(32px,5vw,80px);display:flex;align-items:center;justify-content:center;gap:clamp(36px,5vw,90px);flex-wrap:wrap}
.piece-spec{text-align:center}
.spec-label{font-size:8px;font-weight:500;letter-spacing:.28em;text-transform:uppercase;color:rgba(234,239,245,.22);margin-bottom:10px;display:block}
.spec-value{font-family:'Cormorant Garamond',serif;font-size:clamp(17px,1.8vw,22px);font-weight:300;color:rgba(234,239,245,.68);letter-spacing:.02em}
.piece-details-sep{width:1px;height:36px;background:rgba(234,239,245,.06)}

/* INQUIRY */
.piece-inquiry{display:flex;flex-direction:column;align-items:center;text-align:center;padding:clamp(60px,8vw,100px) clamp(32px,5vw,80px);position:relative}
.piece-inquiry::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:500px;height:280px;background:radial-gradient(ellipse,rgba(12,70,90,.15) 0%,transparent 70%);pointer-events:none}
.inq-line{font-family:'Cormorant Garamond',serif;font-weight:300;font-style:italic;font-size:clamp(22px,2.8vw,36px);color:rgba(234,239,245,.52);margin-bottom:12px;line-height:1.4}
.inq-sub{font-size:13px;line-height:1.8;color:rgba(234,239,245,.28);max-width:400px;margin-bottom:36px}
.inq-cta{display:inline-block;border:1px solid rgba(200,164,94,.28);padding:15px 44px;font-size:10px;font-weight:500;letter-spacing:.32em;text-transform:uppercase;color:rgba(200,164,94,.8);transition:all .3s}
.inq-cta:hover{background:rgba(200,164,94,.07);border-color:var(--gold);color:var(--gold)}

/* PREV / NEXT */
.piece-nav{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(234,239,245,.04)}
.piece-nav-link{padding:clamp(24px,3.5vw,44px) clamp(24px,4vw,60px);display:flex;flex-direction:column;transition:background .3s}
.piece-nav-link:hover{background:rgba(234,239,245,.018)}
.piece-nav-link.next{align-items:flex-end;text-align:right;border-left:1px solid rgba(234,239,245,.04)}
.piece-nav-label{font-size:8px;font-weight:500;letter-spacing:.28em;text-transform:uppercase;color:rgba(234,239,245,.2);margin-bottom:10px}
.piece-nav-name{font-family:'Cormorant Garamond',serif;font-weight:300;font-style:italic;font-size:clamp(18px,2.2vw,28px);color:rgba(234,239,245,.52);transition:color .2s;line-height:1.2}
.piece-nav-link:hover .piece-nav-name{color:rgba(234,239,245,.82)}
.piece-nav-arrow{font-size:10px;color:rgba(200,164,94,.38);margin-top:8px;letter-spacing:.1em;transition:color .2s,transform .25s}
.piece-nav-link:hover .piece-nav-arrow{color:var(--gold)}
.piece-nav-link.prev .piece-nav-arrow{align-self:flex-start}
.piece-nav-link.next:hover .piece-nav-arrow{transform:translateX(4px)}
.piece-nav-link.prev:hover .piece-nav-arrow{transform:translateX(-4px)}

/* PHOTO GALLERY */
.ab-gallery{background:#010610}
.ab-gallery-header{padding:clamp(48px,6vw,80px) clamp(32px,5vw,80px) clamp(28px,3vw,44px);display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
.ab-gallery-title{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(26px,3.2vw,48px);color:var(--pearl);line-height:1.1}
.ab-gallery-title em{font-style:italic;color:rgba(79,181,190,.7)}
.ab-gallery-count{font-size:9px;font-weight:500;letter-spacing:.32em;text-transform:uppercase;color:rgba(234,239,245,.28);flex-shrink:0}
.ab-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;padding:0 3px 3px}
.ab-photo{position:relative;overflow:hidden;cursor:zoom-in;background:#0a0e1a}
.ab-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s cubic-bezier(.22,1,.36,1),filter .5s;filter:brightness(.88) saturate(.9)}
.ab-photo:hover img{transform:scale(1.04);filter:brightness(1) saturate(1)}
.ab-photo--sq{aspect-ratio:1/1}
.ab-photo--wide{aspect-ratio:16/9}
.ab-photo--hero{aspect-ratio:21/7}
.ab-photo--s2{grid-column:span 2}
.ab-photo--s4{grid-column:span 4}
.ab-photo-num{position:absolute;bottom:12px;right:14px;font-size:9px;font-weight:500;letter-spacing:.2em;color:rgba(234,239,245,.28);pointer-events:none;z-index:2;transition:color .2s}
.ab-photo:hover .ab-photo-num{color:rgba(234,239,245,.65)}

/* FILMSTRIP */
.ab-strip-wrap{padding:clamp(32px,4vw,56px) 0;border-top:1px solid rgba(234,239,245,.04);background:#010610;overflow:hidden}
.ab-strip-label{font-size:9px;font-weight:500;letter-spacing:.32em;text-transform:uppercase;color:rgba(234,239,245,.22);padding:0 clamp(24px,4vw,60px) 20px}
.ab-strip{display:flex;gap:4px;overflow-x:auto;padding:0 clamp(24px,4vw,60px) 8px;scrollbar-width:none;cursor:grab}
.ab-strip::-webkit-scrollbar{display:none}
.ab-strip.dragging{cursor:grabbing;user-select:none}
.ab-thumb{flex:0 0 120px;aspect-ratio:1/1;overflow:hidden;cursor:pointer;position:relative;background:#0a0e1a}
.ab-thumb img{width:100%;height:100%;object-fit:cover;filter:brightness(.7) saturate(.8);transition:filter .3s,transform .3s}
.ab-thumb:hover img,.ab-thumb.active img{filter:brightness(1) saturate(1);transform:scale(1.06)}
.ab-thumb.active::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--teal)}

/* LIGHTBOX */
.ab-lb{position:fixed;inset:0;z-index:2000;background:rgba(2,6,16,.97);backdrop-filter:blur(12px);display:none;flex-direction:column;align-items:center;justify-content:center}
.ab-lb.open{display:flex}
.ab-lb-img-wrap{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:64px 80px 80px}
.ab-lb-img{max-width:100%;max-height:100%;object-fit:contain;opacity:0;transition:opacity .35s ease;display:block}
.ab-lb-img.visible{opacity:1}
.ab-lb-close{position:absolute;top:20px;right:24px;font-size:9px;font-weight:500;letter-spacing:.28em;text-transform:uppercase;color:rgba(234,239,245,.4);cursor:pointer;background:none;border:none;padding:8px;transition:color .2s;z-index:10}
.ab-lb-close:hover{color:var(--pearl)}
.ab-lb-prev,.ab-lb-next{position:absolute;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(234,239,245,.3);cursor:pointer;padding:20px 16px;font-size:18px;transition:color .2s;z-index:10}
.ab-lb-prev:hover,.ab-lb-next:hover{color:rgba(234,239,245,.9)}
.ab-lb-prev{left:12px}
.ab-lb-next{right:12px}
.ab-lb-bar{position:absolute;bottom:0;left:0;right:0;padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
.ab-lb-counter{font-size:10px;font-weight:500;letter-spacing:.24em;color:rgba(234,239,245,.35)}
.ab-lb-progress{flex:1;height:1px;background:rgba(234,239,245,.08);margin:0 24px;position:relative;overflow:hidden}
.ab-lb-fill{height:100%;background:var(--teal);transition:width .3s ease;position:absolute;top:0;left:0}
.ab-lb-inq{font-size:9px;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:rgba(200,164,94,.5);text-decoration:none;transition:color .2s}
.ab-lb-inq:hover{color:var(--gold)}

@media(max-width:768px){
  .ab-grid{grid-template-columns:repeat(2,1fr)}
  .ab-photo--s4,.ab-photo--s2{grid-column:span 2}
  .ab-photo--hero{aspect-ratio:4/3}
  .ab-photo--wide{aspect-ratio:4/3}
  .ab-lb-img-wrap{padding:60px 12px 72px}
  .ab-lb-prev,.ab-lb-next{padding:12px 8px}
  .ab-thumb{flex:0 0 80px}
}

/* EDITORIAL */
.work-editorial{padding:clamp(60px,8vw,100px) clamp(32px,5vw,80px);border-bottom:1px solid rgba(234,239,245,.04);display:grid;grid-template-columns:1fr 1fr;gap:clamp(48px,7vw,100px);align-items:start}
.work-edit-eyebrow{font-size:9px;font-weight:500;letter-spacing:.36em;text-transform:uppercase;color:rgba(79,181,190,.48);margin-bottom:24px}
.work-edit-title{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(28px,3.2vw,46px);line-height:1.15;color:var(--pearl);margin-bottom:28px}
.work-edit-title em{font-style:italic;color:rgba(79,181,190,.72)}
.work-edit-body{font-size:14px;line-height:1.88;color:rgba(234,239,245,.42);max-width:480px}
.work-edit-specs{display:flex;flex-direction:column;gap:0;border-top:1px solid rgba(234,239,245,.06)}
.work-spec-row{display:flex;justify-content:space-between;align-items:baseline;gap:24px;padding:14px 0;border-bottom:1px solid rgba(234,239,245,.04)}
.work-spec-label{font-size:9px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(234,239,245,.28);flex-shrink:0}
.work-spec-value{font-family:'Cormorant Garamond',serif;font-size:17px;color:rgba(234,239,245,.68);letter-spacing:.02em;text-align:right}

/* FOOTER */
footer{padding:clamp(28px,4vw,52px) clamp(24px,5vw,80px);border-top:1px solid rgba(79,181,190,.08);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.footer-copy{font-size:10px;letter-spacing:.12em;color:rgba(234,239,245,.18)}
.footer-coords{font-size:10px;letter-spacing:.14em;color:rgba(234,239,245,.14)}

/* ═══ MOBILE ═══ */
@media(max-width:768px){
  .work-editorial{grid-template-columns:1fr;gap:40px;padding:48px 20px}
  .work-edit-title{font-size:clamp(24px,6vw,38px)}
  .work-spec-value{font-size:15px}
  .piece-hero{min-height:480px}
  .piece-name{font-size:clamp(40px,11vw,100px);line-height:1.02}
  .piece-eyebrow{font-size:8px;letter-spacing:.3em;margin-bottom:20px}
  .piece-tr{font-size:9px;letter-spacing:.26em;margin-bottom:28px}
  .piece-rule{margin-bottom:24px}
  .piece-status{margin-bottom:20px}
  .piece-content{padding:0 20px}
  .piece-inq-cta{padding:14px 28px;font-size:9px}
  .piece-details{flex-direction:column;align-items:flex-start;gap:20px;padding:36px 20px}
  .piece-details-sep{display:none}
  .piece-spec{display:flex;align-items:baseline;gap:16px}
  .spec-label{margin-bottom:0;min-width:80px}
  .piece-inquiry{padding:48px 20px}
  .inq-line{font-size:clamp(18px,4.5vw,30px)}
  .inq-sub{font-size:12px;margin-bottom:28px}
  .inq-cta{padding:13px 32px;font-size:9px}
  .piece-nav{grid-template-columns:1fr}
  .piece-nav-link.next{border-left:none;border-top:1px solid rgba(234,239,245,.04);align-items:flex-start;text-align:left}
  .piece-nav-link{padding:24px 20px}
  footer{flex-direction:column;gap:6px}
}
@media(max-width:480px){
  .piece-numeral{font-size:clamp(100px,28vw,220px)}
  .piece-hero{min-height:420px}
}
</style>
</head>
<body>
<canvas id="pageStars"></canvas>

<nav id="mainNav">
  <div class="nav-links">
    <a href="hardscape-gallery.html">Hardscape</a>
    <div class="nav-dropdown active">
      <a class="nav-dropdown-trigger" href="sculptures.html">&#193;guas Vivas <svg class="nav-dropdown-chevron" width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M.5 1L3.5 4l3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></a>
      <div class="nav-dropdown-panel">
        <p class="nav-dp-header">Collection 003 &nbsp;&middot;&nbsp; Eleven Works</p>
${navDropdown(w.slug)}
        <div class="nav-dp-footer"><a href="sculptures.html#collection">View all works &rarr;</a></div>
      </div>
    </div>
    <a href="hardscape-gallery.html">Gallery</a>
  </div>
  <a href="index.html" class="nav-wm">PHA<span class="o">&Ouml;</span>RA</a>
  <div class="nav-right">
    <button class="nav-burger" id="navBurger" aria-label="Menu"><span></span><span></span><span></span></button>
    <a href="#">Studio</a>
    <a href="mailto:david@phaora.com">Contact</a>
    <a href="mailto:david@phaora.com" class="enq">Enquire &rarr;</a>
  </div>
</nav>

<div class="mobile-menu" id="mobileMenu">
  <a href="index.html">Home</a>
  <a href="hardscape-gallery.html">Hardscape</a>
  <a href="sculptures.html" class="av">&#193;guas Vivas &middot; Collection</a>
  <a href="hardscape-gallery.html">Gallery</a>
  <div class="m-rule"></div>
  <a href="mailto:david@phaora.com" class="m-small">Contact &amp; Enquire &rarr;</a>
</div>

<section class="piece-hero">
${mediaHtml}
  <div class="piece-overlay"></div>
  <div class="piece-numeral">${w.num}</div>
  <div class="piece-content">
    <p class="piece-eyebrow">Collection 003 &nbsp;&middot;&nbsp; Work ${w.idx} of Eleven</p>
    <h1 class="piece-name">${w.name}</h1>
    <p class="piece-tr">${w.tr}</p>
    <div class="piece-rule"></div>
    <p class="piece-status">${statusText}</p>
    <a href="mailto:david@phaora.com?subject=${emailSubject}" class="piece-inq-cta">
      Inquire privately
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M0 5h12M8 1l4 4-4 4"/></svg>
    </a>
  </div>
</section>

${editorialHtml}

${galleryHtml}

<div class="piece-inquiry">
  <p class="inq-line">Each work is placed by private conversation.</p>
  <p class="inq-sub">No public sale. No auction. David responds personally within twenty-four hours.</p>
  <a href="mailto:david@phaora.com?subject=${emailSubject}" class="inq-cta">Request a private introduction &rarr;</a>
</div>

<div class="piece-nav">
${prev
  ? `  <a class="piece-nav-link prev" href="av-${prev.slug}.html">
    <span class="piece-nav-label">Previous work</span>
    <span class="piece-nav-name">${prev.name}</span>
    <span class="piece-nav-arrow">&larr; ${prev.num}</span>
  </a>`
  : '  <div></div>'}
${next
  ? `  <a class="piece-nav-link next" href="av-${next.slug}.html">
    <span class="piece-nav-label">Next work</span>
    <span class="piece-nav-name">${next.name}</span>
    <span class="piece-nav-arrow">${next.num} &rarr;</span>
  </a>`
  : '  <div></div>'}
</div>

<footer>
  <span class="footer-copy">Pha&ouml;ra &middot; MMXXVI &nbsp;&middot;&nbsp; &#193;guas Vivas &middot; Collection 003 &nbsp;&middot;&nbsp; Boca Raton</span>
  <span class="footer-coords">26&deg;21&prime;N 80&deg;05&prime;W</span>
</footer>

<script>
(function(){
  var canvas=document.getElementById('pageStars'),ctx=canvas.getContext('2d'),stars=[];
  function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;build();draw()}
  function rng(s){var x=Math.sin(s+1)*10000;return x-Math.floor(x)}
  function build(){stars=[];var n=Math.min(Math.max(Math.floor(canvas.width*canvas.height/2400),220),640);for(var i=0;i<n;i++){var r=rng(i*3.71+1);stars.push({x:rng(i*7.13)*canvas.width,y:rng(i*5.29)*canvas.height,size:r<.72?.5:r<.94?.85:1.35,op:.07+rng(i*2.87)*.26})}}
  function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);stars.forEach(function(s){ctx.beginPath();ctx.arc(s.x,s.y,s.size,0,Math.PI*2);ctx.fillStyle='rgba(190,215,235,'+s.op+')';ctx.fill()})}
  resize();window.addEventListener('resize',resize);
})();
window.addEventListener('scroll',function(){document.getElementById('mainNav').classList.toggle('scrolled',window.scrollY>60)},{passive:true});
${videoJS}
(function(){
  var b=document.getElementById('navBurger'),m=document.getElementById('mobileMenu');
  if(!b||!m)return;
  b.addEventListener('click',function(){b.classList.toggle('open');m.classList.toggle('open');document.body.style.overflow=m.classList.contains('open')?'hidden':''});
  m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){b.classList.remove('open');m.classList.remove('open');document.body.style.overflow=''})});
})();

${w.photos ? `
/* Lightbox + filmstrip */
(function(){
  var PHOTOS=${JSON.stringify(w.photos.map((p,i)=>({f:p.f,i})))};
  var TOTAL=PHOTOS.length;
  var cur=0;
  var lb=document.getElementById('abLb');
  var img=document.getElementById('abLbImg');
  var counter=document.getElementById('abLbCounter');
  var fill=document.getElementById('abLbFill');
  var strip=document.getElementById('abStrip');

  function pad(n){return n<10?'0'+n:String(n)}
  function updateStrip(i){
    if(!strip)return;
    var thumbs=strip.querySelectorAll('.ab-thumb');
    thumbs.forEach(function(t,j){t.classList.toggle('active',j===i)});
    var th=thumbs[i];
    if(th) th.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  }
  function loadImg(i,cb){
    var src='av/alba-bianca/'+PHOTOS[i].f;
    img.classList.remove('visible');
    setTimeout(function(){
      img.onload=function(){img.classList.add('visible');if(cb)cb()};
      img.onerror=function(){img.classList.add('visible')};
      img.src=src;
      img.alt='Alba Bianca — photograph '+(i+1)+' of '+TOTAL;
    },160);
  }
  function setLb(i){
    cur=(i+TOTAL)%TOTAL;
    loadImg(cur);
    counter.textContent=pad(cur+1)+' / '+pad(TOTAL);
    fill.style.width=((cur+1)/TOTAL*100).toFixed(1)+'%';
    updateStrip(cur);
  }
  window.openLb=function(i){cur=i;lb.classList.add('open');document.body.style.overflow='hidden';setLb(i)};
  window.closeLb=function(){lb.classList.remove('open');document.body.style.overflow=''};
  window.shiftLb=function(d){setLb(cur+d)};

  /* keyboard */
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open'))return;
    if(e.key==='ArrowLeft')shiftLb(-1);
    if(e.key==='ArrowRight')shiftLb(1);
    if(e.key==='Escape')closeLb();
  });

  /* touch swipe */
  var tx=0;
  lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-tx;
    if(Math.abs(dx)>40)shiftLb(dx<0?1:-1);
  },{passive:true});

  /* filmstrip drag scroll */
  if(strip){
    var dragging=false,startX=0,scrollLeft=0;
    strip.addEventListener('mousedown',function(e){dragging=true;strip.classList.add('dragging');startX=e.pageX-strip.offsetLeft;scrollLeft=strip.scrollLeft});
    document.addEventListener('mouseup',function(){dragging=false;strip.classList.remove('dragging')});
    strip.addEventListener('mousemove',function(e){if(!dragging)return;e.preventDefault();var x=e.pageX-strip.offsetLeft;strip.scrollLeft=scrollLeft-(x-startX)*1.4});
  }
})();
` : ''}
</script>
</body>
</html>`;
}

WORKS.forEach((w, i) => {
  const html = page(w, i);
  const filename = `av-${w.slug}.html`;
  fs.writeFileSync(filename, html, 'utf8');
  console.log(`✓  ${filename}`);
});
console.log(`\nDone — ${WORKS.length} pages generated.`);
