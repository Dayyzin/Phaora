// The catalogue in the room (David, 15 Nov): the pieces in sets of 6 (3 x 2 on a computer, 2 x 3 on a phone), one set a screen,
// rising out of the top as the next set comes up from the floor; the nav goes on the first scroll.
(() => {
  const main = document.getElementById('sets'); if (!main) return;
  const items = [...main.querySelectorAll('.it')];
  let per = 0, sets = [], gt = 0;
  // the pinned wall fades back once a set has come together in the middle, and returns while the next set moves
  const gather = () => { document.body.classList.remove('gathered'); clearTimeout(gt); gt = setTimeout(() => document.body.classList.add('gathered'), 450); };
  const io = new IntersectionObserver(es => es.forEach(e => {
    const s = e.target;
    if (e.isIntersecting && e.intersectionRatio > 0.55) { s.classList.add('on'); s.classList.remove('past'); gather(); }
    else if (!e.isIntersecting || e.intersectionRatio < 0.45) { s.classList.remove('on'); s.classList.toggle('past', e.boundingClientRect.top < 0); }
  }), { threshold: [0, 0.45, 0.55, 1] });
  const group = () => {   // sets of 8 (4 x 2), or 6 on a phone (2 x 3); each piece a little after the one before
    const n = 6; if (n === per) return; per = n;   // 3 x 2 on a computer, 2 x 3 on a phone (David, 15 Nov: 6 per scroll)
    sets.forEach(s => io.unobserve(s)); main.innerHTML = ''; sets = [];
    for (let i = 0; i < items.length; i += n) {
      const s = document.createElement('section'); s.className = 'set';
      items.slice(i, i + n).forEach((it, j) => { it.style.transitionDelay = (j * 0.06) + 's'; s.appendChild(it); });
      main.appendChild(s); sets.push(s); io.observe(s);
    }
    if (sets[0]) { sets[0].classList.add('on'); gather(); }
  };
  group(); addEventListener('resize', group);
  addEventListener('scroll', () => document.body.classList.toggle('scrolled', scrollY > 8), { passive: true });
  // David's lettering with the solo Ö, inlined in the room's dark ink (never typed)
  fetch('assets/lettering-solo-offwhite.svg').then(r => r.text()).then(t => { const svg = t.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/fill="#E2DDD2"/g, 'fill="currentColor"').replace(/\s(width|height)="[^"]*"/, '').replace(/\s(width|height)="[^"]*"/, '');
    document.querySelectorAll('.logo').forEach(l => { l.innerHTML = svg; }); });
})();
// The piece view, in the same room (David, 15 Nov): a tap lifts the piece from its cell and it grows slowly to full
// scale in the room's centre (about 1.4 s), its shadow with it, while the others sink and fade; its name, type, specs,
// THE PIECE / KEEP A SEAT and the price fade in around it. No page load: ?piece=<name> is its own URL, Back reverses it.
(() => {
  const main = document.getElementById('sets'); if (!main) return;
  const items = [...main.querySelectorAll('.it')], byId = Object.fromEntries(items.map(it => [it.id, it]));
  const phone = () => innerWidth < 821;
  const EASE = 'cubic-bezier(.62,0,.22,1)', T = 1400;
  let cur = null, busy = false, pushed = false; const title0 = document.title;
  const pv = document.createElement('div'); pv.className = 'pv'; pv.setAttribute('aria-hidden', 'true');
  pv.innerHTML = '<div class="pv-light"></div><figure class="pv-fig"><img alt=""></figure>' +
    '<div class="pv-txt pv-head"><h1 class="t cut"></h1><p class="s cut"></p></div>' +
    '<ul class="pv-txt pv-specs cut"></ul><div class="pv-txt pv-buy"><p class="links cut"></p><a class="price"></a></div>' +
    '<div class="pv-txt pv-turn"></div><button class="pv-x" aria-label="Close"><i></i><i></i></button>';
  document.body.appendChild(pv);
  const fig = pv.querySelector('.pv-fig'), img = fig.querySelector('img');
  const pre = {}; const load = src => pre[src] || (pre[src] = new Promise(r => { const i = new Image(); i.decoding = 'async'; i.onload = i.onerror = () => r(src); i.src = src; }));
  const srcOf = it => (it.querySelector('.ph img.a') || it.querySelector('.ph img'));
  // preload the full picture as a finger lands (phone) or a pointer rests (desktop)
  main.addEventListener('pointerdown', e => { const it = e.target.closest('.it'); if (it) load(it.dataset.full); }, { passive: true });
  main.addEventListener('pointerover', e => { const it = e.target.closest('.it'); if (it && !phone()) load(it.dataset.full); }, { passive: true });
  // the box the piece fills in the room: centre stage, the text either side (beneath, on a phone)
  const box = (w, h) => {
    const W = innerWidth, H = innerHeight, p = phone();
    const bw = p ? W * .98 : W * .4, bh = p ? H * .52 : H * .8, cy = p ? H * .44 : H * .52;
    const k = Math.min(bw / w, bh / h); return { w: w * k, h: h * k, x: (W - w * k) / 2, y: cy - h * k / 2 };
  };
  const rectOf = el => { // the visible picture inside an object-fit:contain img
    const r = el.getBoundingClientRect(), iw = el.naturalWidth || 1, ih = el.naturalHeight || 1, k = Math.min(r.width / iw, r.height / ih);
    const w = iw * k, h = ih * k, cs = getComputedStyle(el).objectPosition.split(' ').map(v => parseFloat(v) / 100);
    return { x: r.left + (r.width - w) * (cs[0] || .5), y: r.top + (r.height - h) * (isNaN(cs[1]) ? .5 : cs[1]), w, h };
  };
  const fill = it => {
    pv.querySelector('h1').textContent = it.querySelector('.t').textContent;
    pv.querySelector('.pv-head .s').innerHTML = it.querySelector('.s').innerHTML;
    pv.querySelector('.pv-specs').innerHTML = it.querySelector('.specs.full').innerHTML;
    const pr = it.querySelector('.price'), pa = pv.querySelector('.price'), keep = it.querySelector('.links a[href*="phaora"], .links a:not([href$=".html"])');
    pv.querySelector('.pv-buy .links').innerHTML = '<span>The piece</span>' + (keep ? `<span class="dot">·</span><a href="${keep.getAttribute('href')}">Keep a seat</a>` : '');
    pa.textContent = pr ? pr.textContent : ''; pa.href = pr ? pr.getAttribute('href') : '#'; pa.hidden = !pr;
    const views = [it.dataset.full].concat((it.dataset.views || '').split(',').filter(Boolean));
    const turn = pv.querySelector('.pv-turn'); turn.innerHTML = views.length > 1 ? views.map((v, i) => `<button data-i="${i}"${i ? '' : ' class="on"'} aria-label="View ${i + 1}"></button>`).join('') + '<span class="cut">Turn</span>' : '';
    fig.dataset.i = 0; fig._views = views; views.slice(1).forEach(load);
  };
  const place = r => Object.assign(fig.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
  const from = (a, b) => `translate(${a.x - b.x}px,${a.y - b.y}px) scale(${a.w / b.w},${a.h / b.h})`;
  async function open(it, push, still) {
    if (busy || cur === it) return; busy = true; cur = it; fill(it);
    const small = srcOf(it); img.src = small.currentSrc || small.src; fig.classList.remove('turned');
    const iw = small.naturalWidth, ih = small.naturalHeight, to = box(iw, ih); place(to);
    if (push) { history.pushState({ piece: it.id }, '', '?piece=' + it.id); pushed = true; }
    document.title = it.querySelector('.t').textContent + ' · ' + title0;
    document.documentElement.classList.add('viewing'); it.classList.add('chosen', 'hid'); pv.setAttribute('aria-hidden', 'false');
    pv.classList.add('open');
    load(it.dataset.full).then(src => { if (cur === it && !fig.classList.contains('turned')) img.src = src; });
    if (still) { pv.classList.add('shown'); busy = false; return; }
    const a = rectOf(small);
    const lift = { x: a.x - a.w * .02, y: a.y - a.h * .06, w: a.w * 1.04, h: a.h * 1.04 };
    await fig.animate([{ transform: from(a, to) }, { transform: from(lift, to), offset: .14 }, { transform: 'none' }],
      { duration: T, easing: EASE }).finished;
    pv.classList.add('shown'); busy = false;
  }
  async function close() {
    if (!cur || busy) return; busy = true; const it = cur; pushed = false;
    pv.classList.remove('shown'); document.documentElement.classList.remove('viewing');
    const small = srcOf(it), a = rectOf(small), to = fig.getBoundingClientRect();
    const onScreen = a.y + a.h > 0 && a.y < innerHeight && it.closest('.set.on');
    if (onScreen) await fig.animate([{ transform: 'none' }, { transform: from(a, { x: to.left, y: to.top, w: to.width, h: to.height }) }],
      { duration: T * .8, easing: EASE, fill: 'forwards' }).finished;
    else await fig.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).finished;
    it.classList.remove('hid'); pv.classList.remove('open'); pv.setAttribute('aria-hidden', 'true');
    fig.getAnimations().forEach(x => x.cancel()); it.classList.remove('chosen'); cur = null; busy = false;
    document.title = title0;
  }
  // the turn: the piece's views, a quarter turn between them (drag across it, or the marks under it)
  async function turnTo(i) {
    const v = fig._views; if (!v || v.length < 2 || busy) return; i = (i + v.length) % v.length; if (i === +fig.dataset.i) return;
    const dir = i > +fig.dataset.i ? 1 : -1; busy = true; await load(v[i]);
    await img.animate([{ transform: 'none' }, { transform: `rotateY(${-90 * dir}deg)`, opacity: .4 }], { duration: 260, easing: 'ease-in' }).finished;
    img.src = v[i]; fig.dataset.i = i; fig.classList.toggle('turned', i > 0);
    pv.querySelectorAll('.pv-turn button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    await img.animate([{ transform: `rotateY(${90 * dir}deg)`, opacity: .4 }, { transform: 'none' }], { duration: 300, easing: 'ease-out' }).finished;
    busy = false;
  }
  pv.querySelector('.pv-turn').addEventListener('click', e => { const b = e.target.closest('button'); if (b) turnTo(+b.dataset.i); });
  let sx = null; fig.addEventListener('pointerdown', e => { sx = e.clientX; });
  addEventListener('pointerup', e => { if (sx === null) return; const d = e.clientX - sx; sx = null; if (Math.abs(d) > 30) turnTo(+fig.dataset.i + (d < 0 ? 1 : -1)); });
  main.addEventListener('click', e => {
    const it = e.target.closest('.it'); if (!it || e.target.closest('a[href]:not([href$=".html"])')) return;
    if (!e.target.closest('.ph, .t, .links span, .links a[href$=".html"]')) return;
    e.preventDefault(); open(it, true);
  });
  pv.querySelector('.pv-x').addEventListener('click', () => { if (busy) return; if (pushed) history.back(); else { history.replaceState(null, '', location.pathname); close(); } });
  pv.querySelector('.pv-light').addEventListener('click', () => pv.querySelector('.pv-x').click());
  addEventListener('keydown', e => { if (!cur) return; if (e.key === 'Escape') pv.querySelector('.pv-x').click(); if (e.key === 'ArrowRight') turnTo(+fig.dataset.i + 1); if (e.key === 'ArrowLeft') turnTo(+fig.dataset.i - 1); });
  addEventListener('popstate', () => { const id = new URLSearchParams(location.search).get('piece'); if (id && byId[id]) open(byId[id]); else close(); });
  addEventListener('wheel', e => { if (cur) e.preventDefault(); }, { passive: false });
  addEventListener('touchmove', e => { if (cur) e.preventDefault(); }, { passive: false });
  addEventListener('resize', () => { if (cur && !busy) { const s = srcOf(cur); place(box(s.naturalWidth, s.naturalHeight)); } });
  // a piece's own URL opens straight onto it
  const id = new URLSearchParams(location.search).get('piece');
  if (id && byId[id]) { const it = byId[id]; history.replaceState({ piece: id }, '');
    const go = () => { const s = it.closest('.set'); if (s) scrollTo(0, s.offsetTop); open(it, false, true); };
    const im = srcOf(it); im.complete ? requestAnimationFrame(go) : im.addEventListener('load', go, { once: true }); }
})();
