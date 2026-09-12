#!/usr/bin/env node
/* ============================================================================
 * PHAÖRA — shop builder
 *
 *   node build-shop.js
 *
 * Reads assets/sculptures/catalog.json plus the photographs actually on disk,
 * and writes the whole shop as static files under /shop:
 *
 *   shop/index.html        the shop front
 *   shop/collection.html   every piece, filterable
 *   shop/p/<slug>.html     one page per piece
 *   shop/bag.html          the bag
 *   shop/about.html
 *
 * Two rules this file will not break:
 *   1. Nothing is printed that is not in the catalog or on disk. No invented
 *      dimensions, weights, materials or dates — a field with no value is left
 *      out of the page rather than guessed at.
 *   2. A piece with no photographs on disk does not ship. A shop with a broken
 *      tile in it is worse than a shop with one fewer piece.
 * ========================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT       = __dirname;
const SCULPTURES = path.join(ROOT, 'assets/sculptures');
const CATALOG    = path.join(SCULPTURES, 'catalog.json');
const OUT        = path.join(ROOT, 'shop');

const SITE  = 'https://phaora.com';
const EMAIL = 'phaoraco@gmail.com';
const PHONE = '+15612991261';

/* The piece that carries the shop front. Swap the slug to change the hero.
   Pick one photographed against black — the hero plate screen-blends the shot
   into the page so the sculpture floats, and a shot with its own backdrop
   (a nebula, a studio sweep) will show as a rectangle instead. */
const HERO_SLUG = 'seraph';

/* The six on the shop front, in order. Anything not found is skipped. */
const FEATURED = ['seraph', 'solara', 'pilgrim', 'mariner', 'emissary', 'amethyst-crown'];

/* Plural display names for the species that come out of the catalog. */
const PLURAL = { Macaw: 'Macaws', Cockatoo: 'Cockatoos', Eagle: 'Eagles', Parrot: 'Parrots' };

/* One line-art mark per species, in the order the categories are shown. */
const MARKS = {
  Macaw: '<path d="M22 4 32 17v27H12V17L22 4Z"/><path d="M12 17h20M22 4v40M16 25h12M16 34h12"/>',
  Cockatoo: '<path d="M15 12 19 6l4 6v32h-8V12Z"/><path d="M25 16l4-6 4 6v28h-8V16Z"/><path d="M15 20h8M25 24h8"/>',
  Eagle: '<path d="M22 4 36 22 22 48 8 22 22 4Z"/><path d="M8 22h28M22 4v44M15 13l14 18M29 13 15 31"/>',
  Parrot: '<path d="M22 6c6 7 12 10 12 17 0 8-5 13-12 19-7-6-12-11-12-19 0-7 6-10 12-17Z"/><path d="M22 6v36M10 23h24M14 14l16 18M30 14 14 32"/>'
};
const MARK_FALLBACK = '<path d="M22 5 34 20 22 47 10 20 22 5Z"/><path d="M10 20h24M22 5v42"/>';

/* -------------------------------------------------------------- utilities */
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const money = n => '$ ' + Number(n).toLocaleString('en-US');

const mark = sp => `<svg width="54" height="64" viewBox="0 0 44 54" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round" aria-hidden="true">${MARKS[sp] || MARK_FALLBACK}</svg>`;

/* ------------------------------------------------------------------- data */
const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

const pieces = catalog.pieces.map(p => {
  const dir = path.join(SCULPTURES, p.slug);
  let photos = [];
  if (fs.existsSync(dir)) {
    photos = fs.readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith('.'))
      .sort();
  }
  return {
    slug: p.slug,
    name: p.name,
    species: p.species || '',
    price: Number(p.price_usd) || 0,
    sold: !!p.is_sold,
    stripe: p.stripe_price_id || '',
    photos,
    hero: photos[0] || null
  };
}).filter(p => {
  if (!p.hero) { console.warn(`  ! ${p.slug} — no photographs on disk, not shipped`); return false; }
  return true;
});

const bySlug  = Object.fromEntries(pieces.map(p => [p.slug, p]));
const species = [...new Set(pieces.map(p => p.species).filter(Boolean))]
  .sort((a, b) => pieces.filter(p => p.species === b).length - pieces.filter(p => p.species === a).length);
const priced  = pieces.filter(p => p.price > 0).map(p => p.price);
const lowest  = priced.length ? Math.min(...priced) : 0;

const hero     = bySlug[HERO_SLUG] || pieces[0];
const featured = FEATURED.map(s => bySlug[s]).filter(Boolean);
/* top up to six if a featured slug went missing */
for (const p of pieces) { if (featured.length >= 6) break; if (!featured.includes(p)) featured.push(p); }

/* A real photograph of a real piece carries the band, not stock crystal. */
const bandPiece = bySlug['sanctum'] || hero;
const bandPhoto = bandPiece.hero;

/* ------------------------------------------------------------------ chrome */
function head(title, desc, opts = {}) {
  const depth = opts.depth || 0;              // 0 = /shop/, 1 = /shop/p/
  const up    = '../'.repeat(depth);
  const img   = opts.image || `${SITE}/assets/sculptures/${hero.slug}/${hero.hero}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/shop/${opts.canonical || ''}">
<link rel="icon" type="image/svg+xml" href="${up}../assets/favicon.svg">
<meta property="og:type" content="${opts.ogType || 'website'}">
<meta property="og:title" content="${esc(opts.ogTitle || title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}shop.css">
${opts.jsonld ? `<script type="application/ld+json">${JSON.stringify(opts.jsonld)}</script>` : ''}
</head>
<body>
<canvas id="fleck" aria-hidden="true"></canvas>
<div class="page">`;
}

const ICON = {
  search: '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="7.2" cy="7.2" r="5.2"/><path d="m11 11 4 4"/></svg>',
  user:   '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8.5" cy="5.4" r="3.1"/><path d="M2.6 15c0-3.2 2.6-5 5.9-5s5.9 1.8 5.9 5"/></svg>',
  bag:    '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3.4 5.4h10.2l-.9 9.2H4.3L3.4 5.4Z"/><path d="M6.2 7.2V4.6a2.3 2.3 0 0 1 4.6 0v2.6"/></svg>',
  bagSm:  '<svg width="14" height="14" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3.4 5.4h10.2l-.9 9.2H4.3L3.4 5.4Z"/><path d="M6.2 7.2V4.6a2.3 2.3 0 0 1 4.6 0v2.6"/></svg>',
  burger: '<svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M0 1h20M0 7h20M0 13h20"/></svg>',
  close:  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m1 1 16 16M17 1 1 17"/></svg>',
  ig:     '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="1.6" y="1.6" width="13.8" height="13.8" rx="4"/><circle cx="8.5" cy="8.5" r="3.4"/><circle cx="12.6" cy="4.4" r=".9" fill="currentColor" stroke="none"/></svg>',
  pin:    '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8.5" cy="8.5" r="7"/><path d="M7 15c-.5-1.7.3-4.3.8-6.2M6.2 7.4c0-1.6 1.2-2.8 2.8-2.8 1.5 0 2.6 1 2.6 2.5 0 1.9-1.1 3.4-2.6 3.4-.8 0-1.4-.6-1.2-1.4"/></svg>',
  yt:     '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="1" y="3.6" width="15" height="9.8" rx="3"/><path d="m7.1 6.6 3.8 1.9-3.8 1.9V6.6Z"/></svg>',
  arw:    '<span class="arw">&rarr;</span>'
};

function nav(here, depth = 0) {
  const up = '../'.repeat(depth);
  const on = k => here === k ? ' class="on"' : '';
  return `
<nav class="nav">
  <button class="icon-btn burger" data-drawer-open aria-label="Menu">${ICON.burger}</button>
  <a href="${up}index.html" class="wordmark">Pha&ouml;ra</a>
  <div class="nav-mid">
    <a href="${up}collection.html"${on('shop')}>Shop</a>
    <a href="${up}about.html"${on('about')}>About</a>
    <a href="${up}journal/"${on('journal')}>Journal</a>
  </div>
  <div class="nav-end">
    <button class="icon-btn" data-search-open aria-label="Search the collection" aria-controls="searchbar" aria-expanded="false">${ICON.search}</button>
    <a href="mailto:${EMAIL}" class="icon-btn" aria-label="Contact the studio">${ICON.user}</a>
    <a href="${up}bag.html" class="icon-btn" aria-label="Bag">${ICON.bag}<span class="bag-count">0</span></a>
  </div>
</nav>

<div class="searchbar" id="searchbar">
  <form action="${up}collection.html" method="get" role="search">
    <input type="search" name="q" id="searchInput" placeholder="Search the collection&hellip;" autocomplete="off" aria-label="Search the collection">
    <button type="submit">Search</button>
  </form>
</div>

<div class="drawer" id="drawer">
  <button class="icon-btn drawer-close" data-drawer-close aria-label="Close">${ICON.close}</button>
  <a href="${up}index.html" data-drawer-close>Shop front</a>
  <a href="${up}collection.html" data-drawer-close>The collection</a>
  <a href="${up}about.html" data-drawer-close>About</a>
  <a href="${up}journal/" data-drawer-close>Journal</a>
  <a href="${up}bag.html" data-drawer-close>Bag</a>
</div>`;
}

function foot(depth = 0) {
  const up = '../'.repeat(depth);
  return `
<footer class="foot">
  <div class="foot-in">
    <a href="${up}index.html" class="wordmark">Pha&ouml;ra</a>
    <div class="foot-mid">
      <a href="${up}collection.html">Shop</a>
      <a href="${up}about.html">About</a>
      <a href="${up}journal/">Journal</a>
    </div>
    <div class="foot-end">
      <a href="https://www.instagram.com/phaoraco" aria-label="Instagram" rel="noopener">${ICON.ig}</a>
      <a href="https://www.pinterest.com/phaoraco" aria-label="Pinterest" rel="noopener">${ICON.pin}</a>
      <a href="https://www.youtube.com/@phaoraco" aria-label="YouTube" rel="noopener">${ICON.yt}</a>
    </div>
  </div>
  <div class="foot-bottom">
    <span>Pha&ouml;ra &middot; MMXXVI</span>
    <span>Art / Nature / Eternity</span>
  </div>
</footer>
</div>
<script src="${up}shop.js"></script>
</body>
</html>
`;
}

/* Derivative paths written by optimize-shop-images.js. The full 2048 plate is
   still what a piece page opens with; these are for grids and thumb strips,
   where shipping the original means 25MB before the first card draws. */
const cardSrc  = slug => `assets/sculptures/_derived/${slug}/card.jpg`;
const thumbSrc = (slug, file) => `assets/sculptures/_derived/${slug}/t-${file.replace(/\.(jpe?g|png|webp)$/i, '.jpg')}`;

/* --------------------------------------------------------------- fragments */
function card(p, depth = 0) {
  const up = '../'.repeat(depth);
  const priceHtml = p.price > 0
    ? `<div class="card-price">${money(p.price)}</div>`
    : `<div class="card-price poa">By appointment</div>`;
  const sub = [p.species, 'One of one'].filter(Boolean).join(' &middot; ');
  const bag = p.sold
    ? ''
    : `<button class="card-bag" data-add="${p.slug}" data-name="${esc(p.name)}" data-price="${p.price}" data-sub="${esc(sub.replace(/&middot;/g, '·'))}" data-img="${up}../${cardSrc(p.slug)}" aria-label="Put ${esc(p.name)} in the bag">${ICON.bagSm}</button>`;
  return `      <article class="card${p.sold ? ' sold' : ''}">
        <a href="${up}p/${p.slug}.html" aria-label="${esc(p.name)}">
          <div class="card-img">
            <img src="${up}../${cardSrc(p.slug)}" alt="${esc(p.name)} — hand-carved crystal sculpture" width="640" height="640" loading="lazy" decoding="async">
            ${p.sold ? '<span class="card-flag">Acquired</span>' : ''}
          </div>
          <div class="card-body">
            <h3 class="card-name">${esc(p.name)}</h3>
            <p class="card-sub">${sub}</p>
            ${priceHtml}
          </div>
        </a>
        ${bag}
      </article>`;
}

/* ========================================================== the shop front */
function buildIndex() {
  const cats = species.map(sp => {
    const n = pieces.filter(p => p.species === sp).length;
    return `    <a class="cat" href="collection.html?only=${encodeURIComponent(sp)}">
      ${mark(sp)}
      <span class="cat-name">${esc(PLURAL[sp] || sp + 's')}</span>
      <span class="cat-n">${n} work${n === 1 ? '' : 's'}</span>
      <span class="cat-go">Explore ${ICON.arw}</span>
    </a>`;
  }).join('\n');

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'PHAÖRA — Crystal Sculpture',
    url: `${SITE}/shop/`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: pieces.length,
      itemListElement: pieces.map((p, i) => ({
        '@type': 'ListItem', position: i + 1,
        url: `${SITE}/shop/p/${p.slug}.html`, name: p.name
      }))
    }
  };

  const html = head(
    'PHAÖRA — Timeless art, born of earth',
    `Hand-carved crystal sculpture from Minas Gerais, Brazil. ${pieces.length} works, each one of one.`,
    { jsonld, canonical: '' }
  ) + nav('shop') + `

<!-- HERO -->
<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">Crystal Sculpture</p>
    <h1 class="display">Timeless art,<br>born of earth</h1>
    <p>Rare crystal, carved by hand in Minas Gerais. Every piece is one of one — the stone decides how far the cut can go.</p>
    <a href="collection.html" class="ghost-btn">Explore collection ${ICON.arw}</a>
  </div>
  <div class="hero-plate">
    <span class="hero-ring" aria-hidden="true"></span>
    <img src="../assets/sculptures/${hero.slug}/${hero.hero}" alt="${esc(hero.name)} — ${esc(hero.species)} carved in crystal on amethyst" width="2048" height="2048" fetchpriority="high" decoding="async">
  </div>
</section>

<!-- CATEGORIES -->
<section class="cats-wrap">
  <div class="section-head"><h2>Shop by category</h2></div>
  <div class="cats">
${cats}
  </div>
</section>

<!-- FEATURED -->
<section>
  <div class="section-head">
    <h2>Featured collection</h2>
    <a href="collection.html" class="viewall">View all ${ICON.arw}</a>
  </div>
  <div class="grid-wrap">
    <div class="grid">
${featured.slice(0, 6).map(p => card(p)).join('\n')}
    </div>
  </div>
</section>

<!-- THE DIFFERENCE -->
<section class="band">
  <div class="band-img">
    <img src="../assets/sculptures/${bandPiece.slug}/${bandPhoto}" alt="Crystal detail from ${esc(bandPiece.name)}" loading="lazy" decoding="async">
  </div>
  <div class="band-copy">
    <p class="eyebrow">The Pha&ouml;ra difference</p>
    <h3 class="display">Authenticity in every piece</h3>
    <p>Drawn from the earth. Cut by hand. There is no edition and no second casting — each sculpture is a single work, and the formations in the stone are the reason no two can be the same.</p>
    <a href="about.html" class="ghost-btn">Discover more ${ICON.arw}</a>
  </div>
</section>
` + foot();

  write('index.html', html);
}

/* ========================================================== the collection */
function buildCollection() {
  const filters = ['All', ...species].map((s, i) => {
    const val = s === 'All' ? 'all' : s;
    const label = s === 'All' ? 'All works' : (PLURAL[s] || s + 's');
    const n = s === 'All' ? pieces.length : pieces.filter(p => p.species === s).length;
    return `    <button class="fbtn${i === 0 ? ' on' : ''}" data-filter="${esc(val)}">${esc(label)}<i>${n}</i></button>`;
  }).join('\n');

  const html = head(
    `PHAÖRA — The collection · ${pieces.length} works`,
    `Every PHAÖRA crystal sculpture. ${pieces.length} works, each one of one, hand-carved in Minas Gerais, Brazil.`,
    { canonical: 'collection.html' }
  ) + nav('shop') + `

<header class="phead">
  <p class="eyebrow">The collection</p>
  <h1 class="display">${pieces.length} works,<br>one of each</h1>
  <p>Carved from crystal drawn out of Minas Gerais. Nothing here is made twice${lowest ? `, and the collection opens at ${money(lowest)}` : ''}.</p>
</header>

<div class="filters" id="filters">
${filters}
  <span class="qchip" id="qchip" hidden>Search <b id="qterm"></b><button type="button" id="qclear" aria-label="Clear the search">&times;</button></span>
  <span class="filter-spacer"></span>
  <select class="sortsel" id="sort" aria-label="Order the collection">
    <option value="as-hung">As hung</option>
    <option value="price-desc">Price, high to low</option>
    <option value="price-asc">Price, low to high</option>
    <option value="name">Name</option>
  </select>
</div>

<div class="grid-wrap">
  <div class="grid wide" id="grid">
${pieces.map(p => card(p).replace('<article class="card', `<article data-species="${esc(p.species)}" data-price="${p.price}" data-name="${esc(p.name)}" class="card`)).join('\n')}
    <p class="empty" id="empty" hidden>No work matches that.</p>
  </div>
</div>

<script>
(function(){
  var grid=document.getElementById('grid');
  var empty=document.getElementById('empty');
  var cards=[].slice.call(grid.querySelectorAll('.card'));
  var order=cards.slice();
  var chip=document.getElementById('qchip'), term=document.getElementById('qterm');
  var current='all', query='';

  function apply(){
    var shown=0;
    cards.forEach(function(c){
      var okSpecies = current==='all' || c.getAttribute('data-species')===current;
      var hay=(c.getAttribute('data-name')+' '+c.getAttribute('data-species')).toLowerCase();
      var okQuery = !query || hay.indexOf(query)!==-1;
      var ok = okSpecies && okQuery;
      c.hidden=!ok;
      if(ok) shown++;
    });
    empty.hidden = shown>0;
    chip.hidden = !query;
    term.textContent = query;
  }

  function sync(){
    var u=new URL(location);
    current==='all' ? u.searchParams.delete('only') : u.searchParams.set('only',current);
    query ? u.searchParams.set('q',query) : u.searchParams.delete('q');
    history.replaceState(null,'',u);
  }

  document.getElementById('filters').addEventListener('click',function(e){
    var b=e.target.closest('.fbtn'); if(!b) return;
    this.querySelectorAll('.fbtn').forEach(function(x){x.classList.remove('on')});
    b.classList.add('on');
    current=b.getAttribute('data-filter');
    apply(); sync();
  });

  document.getElementById('qclear').addEventListener('click',function(){
    query=''; apply(); sync();
    var i=document.getElementById('searchInput'); if(i) i.value='';
  });

  document.getElementById('sort').addEventListener('change',function(){
    var m=this.value,next=order.slice();
    function p(c){return parseInt(c.getAttribute('data-price'),10)||0}
    // An unpriced piece is not a cheap piece. It sorts last either way rather
    // than pretending to be zero.
    if(m==='price-desc') next.sort(function(a,b){return p(b)-p(a)});
    else if(m==='price-asc') next.sort(function(a,b){return (p(a)||Infinity)-(p(b)||Infinity)});
    else if(m==='name') next.sort(function(a,b){return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'))});
    next.forEach(function(c){grid.insertBefore(c,empty)});
  });

  // deep links: the category row on the shop front, and the nav search
  var params=new URLSearchParams(location.search);
  var only=params.get('only');
  if(only){
    var btn=document.querySelector('.fbtn[data-filter="'+CSS.escape(only)+'"]');
    if(btn){ btn.classList.add('on'); document.querySelector('.fbtn[data-filter="all"]').classList.remove('on'); current=only; }
  }
  var q=(params.get('q')||'').trim().toLowerCase();
  if(q){
    query=q;
    var input=document.getElementById('searchInput');
    if(input) input.value=params.get('q');
  }
  apply();
})();
</script>
` + foot();

  write('collection.html', html);
}

/* =========================================================== piece pages */
function buildPieces() {
  fs.mkdirSync(path.join(OUT, 'p'), { recursive: true });

  pieces.forEach((p, i) => {
    const prev = pieces[(i - 1 + pieces.length) % pieces.length];
    const next = pieces[(i + 1) % pieces.length];
    const sub  = [p.species, 'One of one'].filter(Boolean).join(' · ');

    const thumbs = p.photos.map((f, j) =>
      `      <button class="pdp-thumb${j === 0 ? ' on' : ''}" data-full="../../assets/sculptures/${p.slug}/${f}" aria-label="View plate ${j + 1}"><img src="../../${thumbSrc(p.slug, f)}" alt="${esc(p.name)} — plate ${j + 1}" width="240" height="240" loading="lazy" decoding="async"></button>`
    ).join('\n');

    /* Only rows that have a real value. No invented stone, size or weight. */
    const specs = [
      ['Edition', 'One of one'],
      p.species ? ['Form', p.species] : null,
      ['Origin', 'Minas Gerais, Brazil'],
      ['Hand', 'Carved, not cast'],
      ['Plates', String(p.photos.length)]
    ].filter(Boolean)
     .map(([k, v]) => `      <div class="spec"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n');

    const offer = {
      '@type': 'Offer',
      url: `${SITE}/shop/p/${p.slug}.html`,
      availability: p.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      ...(p.price > 0 ? { price: p.price, priceCurrency: catalog.metadata?.currency || 'USD' } : {})
    };
    const jsonld = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      sku: p.slug,
      image: p.photos.slice(0, 6).map(f => `${SITE}/assets/sculptures/${p.slug}/${f}`),
      description: `${p.name} — a one-of-one crystal sculpture hand-carved in Minas Gerais, Brazil.`,
      brand: { '@type': 'Brand', name: 'PHAÖRA' },
      offers: offer
    };

    const priceBlock = p.price > 0
      ? `<div class="pdp-price">${money(p.price)}</div>`
      : `<div class="pdp-price poa">By appointment</div>`;

    const action = p.sold
      ? `<button class="solid-btn" disabled>Acquired</button>`
      : `<button class="solid-btn" data-add="${p.slug}" data-name="${esc(p.name)}" data-price="${p.price}" data-sub="${esc(sub)}" data-img="../../assets/sculptures/${p.slug}/${p.hero}">Put in the bag</button>`;

    const html = head(
      `${p.name} — PHAÖRA`,
      `${p.name} — one-of-one crystal sculpture, hand-carved in Minas Gerais, Brazil.`,
      {
        depth: 1,
        canonical: `p/${p.slug}.html`,
        ogType: 'product',
        image: `${SITE}/assets/sculptures/${p.slug}/${p.hero}`,
        jsonld
      }
    ) + nav('shop', 1) + `

<div class="pdp">
  <div class="pdp-stage">
    <div class="pdp-main">
      <img id="pdpMain" src="../../assets/sculptures/${p.slug}/${p.hero}" alt="${esc(p.name)} — hand-carved crystal sculpture" width="2048" height="2048" fetchpriority="high" decoding="async">
    </div>
    <div class="pdp-thumbs" id="pdpThumbs">
${thumbs}
    </div>
  </div>

  <div class="pdp-info">
    <p class="eyebrow">${esc(p.species || 'Crystal')} &middot; ${String(i + 1).padStart(2, '0')} of ${pieces.length}</p>
    <h1 class="display">${esc(p.name)}</h1>
    <p class="pdp-sub">${esc(sub)}</p>
    ${priceBlock}
    <p class="pdp-note">${p.sold ? 'This piece has been acquired.' : 'Crating and delivery arranged by the studio.'}</p>

    <div class="pdp-actions">
      ${action}
      <a class="ghost-btn" style="justify-content:center" href="mailto:${EMAIL}?subject=${encodeURIComponent('Enquiry: ' + p.name)}">Ask about this piece ${ICON.arw}</a>
    </div>

    <dl class="pdp-specs">
${specs}
    </dl>
  </div>
</div>

<section class="grid-wrap" style="padding-top:12px">
  <div class="section-head" style="padding:0">
    <h2>More from the collection</h2>
    <a href="../collection.html" class="viewall">View all ${ICON.arw}</a>
  </div>
  <div class="grid">
${[prev, next, pieces[(i + 2) % pieces.length]].filter((v, k, a) => a.indexOf(v) === k && v !== p).slice(0, 3).map(q => card(q, 1)).join('\n')}
  </div>
</section>

<script>
(function(){
  var main=document.getElementById('pdpMain'),wrap=document.getElementById('pdpThumbs');
  if(!wrap) return;
  wrap.addEventListener('click',function(e){
    var t=e.target.closest('.pdp-thumb'); if(!t) return;
    main.src=t.getAttribute('data-full');
    wrap.querySelectorAll('.pdp-thumb').forEach(function(x){x.classList.remove('on')});
    t.classList.add('on');
  });
})();
</script>
` + foot(1);

    write(path.join('p', `${p.slug}.html`), html);
  });
}

/* ================================================================== the bag */
function buildBag() {
  const html = head(
    'PHAÖRA — Your bag',
    'The pieces you are holding.',
    { canonical: 'bag.html' }
  ) + nav('', 0) + `

<header class="phead">
  <p class="eyebrow">Your bag</p>
  <h1 class="display">Holding</h1>
</header>

<div class="cart-wrap">
  <div id="bagBody"></div>
</div>

<script>
/* shop.js, which defines PhaoraBag, is loaded at the end of the document —
   after this block is parsed. Wait for the parse to finish before reading it. */
document.addEventListener('DOMContentLoaded', function(){
  var body=document.getElementById('bagBody');
  var EMAIL=${JSON.stringify(EMAIL)};

  function money(n){ return '$ ' + Number(n).toLocaleString('en-US'); }

  function render(){
    var items=window.PhaoraBag.all();
    if(!items.length){
      body.innerHTML='<div class="cart-empty"><p>Nothing in the bag yet.</p>'+
        '<a href="collection.html" class="ghost-btn">See the collection <span class="arw">&rarr;</span></a></div>';
      return;
    }

    var total=0, unpriced=0, rows='';
    items.forEach(function(it){
      total+=it.price||0;
      if(!it.price) unpriced++;
      rows+='<div class="cart-row">'+
        '<img src="'+it.img+'" alt="">'+
        '<div><div class="cart-name">'+it.name+'</div>'+
        '<div class="cart-sub">'+(it.sub||'')+'</div>'+
        '<button class="cart-drop" data-drop="'+it.slug+'">Remove</button></div>'+
        '<div class="cart-price">'+(it.price?money(it.price):'By appointment')+'</div>'+
      '</div>';
    });

    var totalLabel = unpriced
      ? money(total)+' <span style="font-size:11px;letter-spacing:.14em">+ '+unpriced+' by appointment</span>'
      : money(total);

    // Every piece is one of one and crating is quoted per work, so the bag is
    // an enquiry list the studio prices — not a checkout that takes a card.
    var lines=items.map(function(it){
      return '- '+it.name+(it.price?(' ('+money(it.price)+')'):' (by appointment)');
    }).join('\\n');
    var mail='mailto:'+EMAIL+
      '?subject='+encodeURIComponent('Enquiry: '+items.length+' piece'+(items.length>1?'s':''))+
      '&body='+encodeURIComponent('I would like to enquire about:\\n\\n'+lines+'\\n\\n');

    body.innerHTML=rows+
      '<div class="cart-total"><span>Total</span><b>'+totalLabel+'</b></div>'+
      '<a class="solid-btn" style="width:100%" href="'+mail+'">Send this to the studio</a>'+
      '<p class="cart-msg">David answers personally. He will confirm each piece is still available, '+
      'quote crating and delivery, and send payment instructions. '+
      'Prefer to talk? <a href="tel:${PHONE}">(561) 299-1261</a>.</p>';
  }

  body.addEventListener('click',function(e){
    var b=e.target.closest('[data-drop]'); if(!b) return;
    window.PhaoraBag.remove(b.getAttribute('data-drop'));
    render();
  });

  render();
});
</script>
` + foot();

  write('bag.html', html);
}

/* ================================================================== about */
function buildAbout() {
  const html = head(
    'PHAÖRA — About the sculpture',
    'Crystal drawn from Minas Gerais and carved by hand. Each PHAÖRA sculpture is one of one.',
    { canonical: 'about.html' }
  ) + nav('about') + `

<header class="phead">
  <p class="eyebrow">About</p>
  <h1 class="display">One stone,<br>one answer</h1>
</header>

<div class="prose">
  <p class="lead">A block of crystal will only give up one shape. The work is finding it before the stone decides for you.</p>

  <h2>The stone</h2>
  <p>Every piece begins in Minas Gerais, the Brazilian state that has supplied the world's amethyst and quartz for two centuries. Stone is selected whole — for the way light moves inside it, and for the flaws, which are the part no one can reproduce.</p>

  <h2>The cut</h2>
  <p>Carved by hand, not cast. A mould would make the second one possible, and there is no second one. What the stone permits is what the piece becomes; where a vein runs wrong, the form changes to meet it.</p>

  <h2>Buying</h2>
  <p>Every work is one of one, so the bag is an enquiry list rather than a checkout. Send it and David answers personally — confirming the piece is still available, quoting crating and delivery, and arranging payment. Nothing is charged until you have spoken to him.</p>

  <p><a href="mailto:${EMAIL}" class="ghost-btn">Write to the studio ${ICON.arw}</a></p>
</div>
` + foot();

  write('about.html', html);
}

/* ================================================================ journal */
/* Copy lives in journal-posts.js so a change to what the shop tells a customer
   arrives as a reviewable diff rather than as a string buried in a builder. */
function buildJournal() {
  const posts = require('./journal-posts.js').filter(post => {
    if (bySlug[post.pictured]) return true;
    console.warn(`  ! journal/${post.slug} — pictured piece "${post.pictured}" has no photographs, not shipped`);
    return false;
  });
  if (!posts.length) return [];

  const longDate = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    const month = ['January','February','March','April','May','June','July',
                   'August','September','October','November','December'][m - 1];
    return `${d} ${month} ${y}`;
  };

  const items = posts.map(post => {
    const pic = bySlug[post.pictured];
    return `    <a class="jitem" href="${post.slug}.html">
      <div class="jitem-img"><img src="../../${cardSrc(pic.slug)}" alt="${esc(pic.name)}" width="640" height="640" loading="lazy" decoding="async"></div>
      <div>
        <p class="jitem-date">${esc(longDate(post.date))}</p>
        <h2 class="display">${esc(post.title)}</h2>
        <p>${esc(post.standfirst)}</p>
        <span class="viewall">Read ${ICON.arw}</span>
      </div>
    </a>`;
  }).join('\n');

  write(path.join('journal', 'index.html'),
    head('PHAÖRA — The sculpture journal',
      'Writing on the stone, the carving and where the material comes from.',
      { depth: 1, canonical: 'journal/' }) +
    nav('journal', 1) + `

<header class="phead">
  <p class="eyebrow">The journal</p>
  <h1 class="display">On the stone<br>and the cut</h1>
  <p>What the material is, why it behaves the way it does, and what that means for an object carved out of it.</p>
</header>

<div class="jlist">
${items}
</div>
` + foot(1));

  posts.forEach((post, i) => {
    const pic  = bySlug[post.pictured];
    const next = posts[(i + 1) % posts.length];

    const body = post.body.map(b =>
      typeof b === 'string'
        ? `  <p>${esc(b)}</p>`
        : `  <h2>${esc(b.h)}</h2>`
    ).join('\n');

    const jsonld = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.standfirst,
      datePublished: post.date,
      image: `${SITE}/assets/sculptures/${pic.slug}/${pic.hero}`,
      publisher: { '@type': 'Organization', name: 'PHAÖRA' },
      mainEntityOfPage: `${SITE}/shop/journal/${post.slug}.html`
    };

    write(path.join('journal', `${post.slug}.html`),
      head(`${post.title} — PHAÖRA`, post.standfirst, {
        depth: 1,
        canonical: `journal/${post.slug}.html`,
        ogType: 'article',
        image: `${SITE}/assets/sculptures/${pic.slug}/${pic.hero}`,
        jsonld
      }) +
      nav('journal', 1) + `

<div class="jhero">
  <div class="jhero-img"><img src="../../assets/sculptures/${pic.slug}/${pic.hero}" alt="${esc(pic.name)}" fetchpriority="high" decoding="async"></div>
</div>

<header class="jhead">
  <p class="jitem-date">${esc(longDate(post.date))}</p>
  <h1 class="display">${esc(post.title)}</h1>
  <p>${esc(post.standfirst)}</p>
</header>

<article class="jbody">
${body}
</article>

<div class="jfoot">
  <span class="jcap">Pictured: <a href="../p/${pic.slug}.html" style="color:var(--gold)">${esc(pic.name)}</a></span>
  <a class="viewall" href="${next.slug === post.slug ? './' : next.slug + '.html'}">${next.slug === post.slug ? 'Back to the journal' : esc(next.title)} ${ICON.arw}</a>
</div>
` + foot(1));
  });

  return posts.map(p => p.slug);
}

/* ================================================================ sitemap */
/* The builder owns the block between the shop markers and nothing else, so
   adding a piece or a post updates the sitemap in the same command that built
   the page, and the town entries below it are never touched. */
function syncSitemap(posts) {
  const file = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(file)) { console.warn('  ! no sitemap.xml, skipped'); return 0; }

  const url = (loc, freq, pri) =>
    `  <url><loc>${SITE}${loc}</loc><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`;

  const lines = [
    '  <!-- shop — generated by build-shop.js, edits here are overwritten -->',
    url('/shop/', 'weekly', '0.9'),
    url('/shop/collection.html', 'weekly', '0.9'),
    url('/shop/about.html', 'monthly', '0.6'),
    ...pieces.map(p => url(`/shop/p/${p.slug}.html`, 'monthly', '0.7')),
    url('/shop/journal/', 'weekly', '0.7'),
    ...posts.map(s => url(`/shop/journal/${s}.html`, 'yearly', '0.6')),
    '  <!-- /shop -->'
  ].join('\n');

  let xml = fs.readFileSync(file, 'utf8');
  const block = /[ \t]*<!-- shop[^>]*-->[\s\S]*?<!-- \/shop -->/;

  if (block.test(xml)) xml = xml.replace(block, lines);
  else if (xml.includes('  <!-- towns -->')) xml = xml.replace('  <!-- towns -->', lines + '\n\n  <!-- towns -->');
  else xml = xml.replace('</urlset>', lines + '\n</urlset>');

  fs.writeFileSync(file, xml, 'utf8');
  return pieces.length + posts.length + 4;
}

/* ------------------------------------------------------------------ write */
function write(rel, html) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
}

/* -------------------------------------------------------------------- run */
fs.mkdirSync(OUT, { recursive: true });
buildIndex();
buildCollection();
buildPieces();
buildBag();
buildAbout();
const postSlugs = buildJournal();
const sitemapUrls = syncSitemap(postSlugs);

console.log(`shop front       shop/index.html`);
console.log(`collection       shop/collection.html   (${pieces.length} works, ${species.length} categories)`);
console.log(`piece pages      shop/p/*.html          (${pieces.length})`);
console.log(`journal          shop/journal/*.html    (${postSlugs.length} posts)`);
console.log(`bag + about      shop/bag.html, shop/about.html`);
console.log(`sitemap          sitemap.xml            (${sitemapUrls} shop urls)`);
