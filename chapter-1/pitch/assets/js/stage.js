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
// scale in the room's centre (about 1.4 s), its shadow with it, while the others sink and fade. Then each scroll step is
// one act, all in the room: 1 arrival; 2 close, at 100% (a push into the piece's own picture, or a passed close-up);
// 3 the maker's notes beside their parts; 4 its scene on the back wall, the light lower; 5 its companions in the same
// scene; 6 back to the line. No page load: ?piece=<name> is its own URL, Back reverses it.
(() => {
  const main = document.getElementById('sets'); if (!main) return;
  const items = [...main.querySelectorAll('.it')], byId = Object.fromEntries(items.map(it => [it.id, it]));
  const ACTS = JSON.parse((document.getElementById('acts') || {}).textContent || '{}');
  const phone = () => innerWidth < 821;
  const EASE = 'cubic-bezier(.62,0,.22,1)', T = 1400;
  const E = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let cur = null, busy = false, pushed = false, steps = [], step = 0, R = null; const title0 = document.title, html = document.documentElement;
  const pv = document.createElement('div'); pv.className = 'pv'; pv.setAttribute('aria-hidden', 'true');
  pv.innerHTML = '<div class="pv-light"></div><div class="pv-dim"></div><div class="pv-wall"><img alt=""></div>' +
    '<figure class="pv-fig"><img alt=""></figure><div class="pv-plate"><img alt=""></div>' +
    '<svg class="pv-lines" aria-hidden="true"></svg><div class="pv-notes"></div><ol class="pv-made cut"></ol>' +
    '<div class="pv-txt pv-head"><h1 class="t cut"></h1><p class="s cut"></p></div>' +
    '<ul class="pv-txt pv-specs cut"></ul><div class="pv-txt pv-buy"><p class="links cut"></p><a class="price"></a></div>' +
    '<div class="pv-txt pv-turn"></div><p class="pv-cap cut"></p>' +
    '<div class="pv-scene"><p class="e cut">Where it is going</p><p class="pl cut"></p><p class="kp cut"></p></div>' +
    '<div class="pv-same"><p class="e cut">In the same scene</p><div class="row"></div></div>' +
    '<button class="pv-arrow prev" aria-label="Before"><i></i></button><button class="pv-arrow next" aria-label="Next"><i></i></button>' +
    '<div class="pv-drawer"><button class="tab cut">Details</button><dl></dl></div>' +
    '<button class="pv-x" aria-label="Close"><i></i><i></i></button>';
  document.body.appendChild(pv);
  const $ = q => pv.querySelector(q);
  const fig = $('.pv-fig'), img = fig.querySelector('img'), lines = $('.pv-lines');
  const pre = {}; const load = src => pre[src] || (pre[src] = new Promise(r => { const i = new Image(); i.decoding = 'async'; i.onload = i.onerror = () => r(i); i.src = src; }));
  const srcOf = it => (it.querySelector('.ph img.a') || it.querySelector('.ph img'));
  main.addEventListener('pointerdown', e => { const it = e.target.closest('.it'); if (it) load(it.dataset.full); }, { passive: true });
  main.addEventListener('pointerover', e => { const it = e.target.closest('.it'); if (it && !phone()) load(it.dataset.full); }, { passive: true });
  // the box the piece fills in the room: centre stage, the text either side (beneath, on a phone)
  const box = (w, h) => {
    const W = innerWidth, H = innerHeight, p = phone();
    const bw = p ? W * .98 : W * .4, bh = p ? H * .52 : H * .74, cy = p ? H * .44 : H * .53;
    const k = Math.min(bw / w, bh / h); return { w: w * k, h: h * k, x: (W - w * k) / 2, y: cy - h * k / 2 };
  };
  const rectOf = el => { // the visible picture inside an object-fit:contain img
    const r = el.getBoundingClientRect(), iw = el.naturalWidth || 1, ih = el.naturalHeight || 1, k = Math.min(r.width / iw, r.height / ih);
    const w = iw * k, h = ih * k, cs = getComputedStyle(el).objectPosition.split(' ').map(v => parseFloat(v) / 100);
    return { x: r.left + (r.width - w) * (cs[0] || .5), y: r.top + (r.height - h) * (isNaN(cs[1]) ? .5 : cs[1]), w, h };
  };
  const fill = it => {
    const A = ACTS[it.id] || {};
    $('h1').textContent = it.querySelector('.t').textContent;
    $('.pv-head .s').innerHTML = it.querySelector('.s').innerHTML;
    $('.pv-specs').innerHTML = it.querySelector('.specs.short').innerHTML;
    const pr = it.querySelector('.price'), pa = $('.price'), keep = it.querySelector('.links a:not([href$=".html"])');
    $('.pv-buy .links').innerHTML = keep ? `<a href="${keep.getAttribute('href')}">Keep a seat</a>` : '';
    pa.textContent = pr ? pr.textContent : ''; pa.href = pr ? pr.getAttribute('href') : '#'; pa.hidden = !pr;
    const views = [it.dataset.full].concat((it.dataset.views || '').split(',').filter(Boolean));
    $('.pv-turn').innerHTML = views.length > 1 ? views.map((v, i) => `<button data-i="${i}"${i ? '' : ' class="on"'} aria-label="${['Front', 'Three-quarter', 'Back', 'Side'][i] || 'View'}"></button>`).join('') + '<span class="cut">Turn</span>' : '';
    fig.dataset.i = 0; fig._views = views; views.slice(1).forEach(load);
    // the acts this piece has, in order; an act with nothing real to show is skipped
    steps = [{ a: 'arrival' }];
    (A.close || []).forEach((c, k) => steps.push({ a: 'close', k }));
    if (A.notes || A.made) steps.push({ a: 'notes' });
    if (A.scene) steps.push({ a: 'scene' });
    if (A.same) steps.push({ a: 'same' });
    steps.push({ a: 'back' }); step = 0; pv.dataset.act = 'arrival';
    if (A.scene) { $('.pv-wall img').src = A.scene.img; $('.pv-scene .pl').textContent = A.scene.place; $('.pv-scene .kp').textContent = A.scene.kept; }
    $('.pv-same .row').innerHTML = (A.same || []).filter(p => byId[p]).map(p => { const o = byId[p];
      return `<button class="sc" data-p="${p}"><img src="${E(o.dataset.full)}" alt=""><span class="nm cut">${E(o.querySelector('.t').textContent)}</span></button>`; }).join('');
    $('.pv-made').innerHTML = (A.made || []).map(x => `<li>${E(x)}</li>`).join('');
    $('.pv-notes').innerHTML = (A.notes || []).map((n, k) => `<div class="nt"><b>${k + 1}</b><span class="l">${E(n.n)}</span>${n.m ? `<span class="m">${E(n.m)}</span>` : ''}</div>`).join('') +
      (A.notes || []).map((n, k) => `<i class="pin">${k + 1}</i>`).join('');
    $('.pv-drawer dl').innerHTML = (A.details || []).map(([k, v]) => `<dt>${E(k)}</dt><dd>${E(v)}</dd>`).join('');
    pv.classList.remove('drawer');
    pv.classList.toggle('lone', !A.prev);
  };
  const place = r => { R = r; Object.assign(fig.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' }); };
  const from = (a, b) => `translate(${a.x - b.x}px,${a.y - b.y}px) scale(${a.w / b.w},${a.h / b.h})`;
  // where the piece stands in each act: a transform on its arrival box (transform and opacity only)
  const at = (k, x, y) => { // the piece scaled k, its box centred on x, y
    const w = R.w * k, h = R.h * k; return { t: `translate(${x - w / 2 - R.x}px,${y - h / 2 - R.y}px) scale(${k})`, x: x - w / 2, y: y - h / 2, w, h };
  };
  const pbox = () => (ACTS[cur.id] || {}).pbox || [0, 0, 1, 1];
  const ptIn = (g, f) => { const b = pbox(); return [g.x + (b[0] + f[0] * (b[2] - b[0])) * g.w, g.y + (b[1] + f[1] * (b[3] - b[1])) * g.h]; };
  function layout() {
    if (!cur) return; const s = steps[step], A = ACTS[cur.id] || {}, W = innerWidth, H = innerHeight, p = phone();
    pv.dataset.act = s.a; html.classList.toggle('dim', s.a === 'scene' || s.a === 'same');
    let g = { t: 'none' };
    lines.innerHTML = ''; pv.classList.remove('plated');
    if (s.a === 'close') {
      const c = A.close[s.k]; $('.pv-cap').textContent = c.cap;
      if (c.plate) {   // a passed close-up render, crossfaded over the piece
        $('.pv-plate img').src = c.plate; pv.classList.add('plated');
        const prev = steps.slice(0, step).reverse().find(x => x.a === 'close' && !A.close[x.k].plate);
        if (prev) { const f = A.close[prev.k].f; g = push(f); }
      } else g = push(c.f);
    } else if (s.a === 'notes') {
      g = p ? at(.62, W / 2, H * .36) : at(.7, W / 2, H * .53);
      if (A.notes) notes(g, A.notes);
    } else if (s.a === 'scene') g = p ? at(.42, W / 2, H * .7) : at(.5, W * .72, H * .66);
    else if (s.a === 'same') g = p ? at(.4, W / 2, H * .33) : at(.56, W * .36, H * .55);
    fig.style.transform = g.t;
  }
  function push(f) {   // the view pushes into the part at 100%: one pixel of the render to one pixel of the screen
    const nat = img.naturalWidth || R.w, z = Math.max(1.35, Math.min(3.2, nat / R.w)), W = innerWidth, H = innerHeight;
    const b = pbox(), px = (b[0] + f[0] * (b[2] - b[0])) * R.w, py = (b[1] + f[1] * (b[3] - b[1])) * R.h;
    const cx = W / 2, cy = phone() ? H * .45 : H * .5;
    return { t: `translate(${cx - R.x - px * z}px,${cy - R.y - py * z}px) scale(${z})` };
  }
  function notes(g, N) {   // each note small beside its part, on a hairline from a numbered pin
    const W = innerWidth, p = phone(), els = [...pv.querySelectorAll('.pv-notes .nt')], pins = [...pv.querySelectorAll('.pv-notes .pin')];
    const pts = N.map(n => ptIn(g, n.at)), side = { l: [], r: [] };
    N.forEach((n, k) => { pins[k].style.transform = `translate(${pts[k][0] - 7}px,${pts[k][1] - 7}px)`; if (!p) side[n.at[0] < .5 ? 'l' : 'r'].push(k); });
    if (p) { els.forEach(e => e.style.transform = ''); return; }
    let svg = '';
    for (const sd of ['l', 'r']) {
      let last = -1e9; side[sd].sort((a, b) => pts[a][1] - pts[b][1]).forEach(k => {
        const e = els[k], h = e.offsetHeight || 30, y = Math.max(pts[k][1] - 10, last + 12); last = y + h;
        const x = sd === 'l' ? g.x - 36 - e.offsetWidth : g.x + g.w + 36;
        e.style.transform = `translate(${x}px,${y}px)`; e.classList.toggle('r', sd === 'l');
        const ex = sd === 'l' ? x + e.offsetWidth + 6 : x - 6;
        svg += `<line x1="${pts[k][0]}" y1="${pts[k][1]}" x2="${ex}" y2="${y + 7}"/>`;
      });
    }
    lines.setAttribute('viewBox', `0 0 ${W} ${innerHeight}`); lines.innerHTML = svg;
  }
  async function go(n) {   // one act on (or back)
    if (!cur || busy) return; const to = step + n; if (to < 0 || to >= steps.length) return;
    if (steps[to].a === 'back') return pv.querySelector('.pv-x').click();
    if (+fig.dataset.i) { const v = fig._views[0]; img.src = v; fig.dataset.i = 0; fig.classList.remove('turned'); pv.querySelectorAll('.pv-turn button').forEach((b, i) => b.classList.toggle('on', !i)); }
    step = to; busy = true; layout(); setTimeout(() => { busy = false; }, 900);
  }
  async function open(it, push, still) {
    if (busy || cur === it) return; busy = true; cur = it; fill(it);
    const small = srcOf(it); img.src = small.currentSrc || small.src; fig.classList.remove('turned'); fig.style.transition = 'none'; fig.style.transform = 'none';
    const iw = small.naturalWidth, ih = small.naturalHeight, to = box(iw, ih); place(to); layout();
    if (push) { history.pushState({ piece: it.id }, '', '?piece=' + it.id); pushed = true; }
    document.title = it.querySelector('.t').textContent + ' · ' + title0;
    html.classList.add('viewing'); it.classList.add('chosen', 'hid'); pv.setAttribute('aria-hidden', 'false');
    pv.classList.add('open');
    load(it.dataset.full).then(i => { if (cur === it && !fig.classList.contains('turned')) img.src = i.src; });
    requestAnimationFrame(() => { fig.style.transition = ''; });
    if (still) { pv.classList.add('shown'); busy = false; return; }
    const a = rectOf(small);
    const lift = { x: a.x - a.w * .02, y: a.y - a.h * .06, w: a.w * 1.04, h: a.h * 1.04 };
    await fig.animate([{ transform: from(a, to) }, { transform: from(lift, to), offset: .14 }, { transform: 'none' }],
      { duration: T, easing: EASE }).finished;
    pv.classList.add('shown'); busy = false;
  }
  async function close() {
    if (!cur || busy) return; busy = true; const it = cur; pushed = false;
    if (step) { step = 0; layout(); await new Promise(r => setTimeout(r, 1000)); }
    pv.classList.remove('shown', 'drawer'); html.classList.remove('viewing', 'dim');
    const small = srcOf(it), a = rectOf(small), to = fig.getBoundingClientRect();
    const onScreen = a.y + a.h > 0 && a.y < innerHeight && it.closest('.set.on');
    if (onScreen) await fig.animate([{ transform: 'none' }, { transform: from(a, { x: to.left, y: to.top, w: to.width, h: to.height }) }],
      { duration: T * .8, easing: EASE, fill: 'forwards' }).finished;
    else await fig.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).finished;
    it.classList.remove('hid'); pv.classList.remove('open'); pv.setAttribute('aria-hidden', 'true');
    fig.getAnimations().forEach(x => x.cancel()); it.classList.remove('chosen'); cur = null; busy = false;
    document.title = title0;
  }
  async function swap(it, push) {   // another piece, in the same room: the view fades over to it
    if (!cur || busy || it === cur) return; busy = true;
    pv.classList.add('fading'); await new Promise(r => setTimeout(r, 450));
    const old = cur; old.classList.remove('hid', 'chosen'); cur = null; busy = false; html.classList.remove('dim');
    const s = it.closest('.set'); if (s) scrollTo(0, s.offsetTop);
    await open(it, false, true); if (push) { history.pushState({ piece: it.id }, '', '?piece=' + it.id); pushed = true; }
    pv.classList.remove('fading');
  }
  // the turn: the piece's views, a quarter turn between them (drag across it, or the marks under it)
  async function turnTo(i) {
    const v = fig._views; if (!v || v.length < 2 || busy || step) return; i = (i + v.length) % v.length; if (i === +fig.dataset.i) return;
    const dir = i > +fig.dataset.i ? 1 : -1; busy = true; await load(v[i]);
    await img.animate([{ transform: 'none' }, { transform: `rotateY(${-90 * dir}deg)`, opacity: .4 }], { duration: 260, easing: 'ease-in' }).finished;
    img.src = v[i]; fig.dataset.i = i; fig.classList.toggle('turned', i > 0);
    pv.querySelectorAll('.pv-turn button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    await img.animate([{ transform: `rotateY(${90 * dir}deg)`, opacity: .4 }, { transform: 'none' }], { duration: 300, easing: 'ease-out' }).finished;
    busy = false;
  }
  const nb = d => { if (!cur) return; const A = ACTS[cur.id] || {}, p = d < 0 ? A.prev : A.next; if (p && byId[p]) swap(byId[p], true); };
  $('.pv-turn').addEventListener('click', e => { const b = e.target.closest('button'); if (b) turnTo(+b.dataset.i); });
  $('.pv-same').addEventListener('click', e => { const b = e.target.closest('.sc'); if (b && byId[b.dataset.p]) swap(byId[b.dataset.p], true); });
  $('.pv-arrow.prev').addEventListener('click', () => nb(-1)); $('.pv-arrow.next').addEventListener('click', () => nb(1));
  $('.pv-drawer .tab').addEventListener('click', () => pv.classList.toggle('drawer'));
  // a drag across the piece turns it; a swipe elsewhere goes to the piece before or next (a phone); up and down, the acts
  let sx = null, sy = null, onFig = false;
  pv.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; onFig = !!e.target.closest('.pv-fig'); });
  addEventListener('pointerup', e => {
    if (sx === null || !cur) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { if (onFig && !step) turnTo(+fig.dataset.i + (dx < 0 ? 1 : -1)); else if (phone()) nb(dx < 0 ? 1 : -1); }
    else if (Math.abs(dy) > 50 && e.pointerType !== 'mouse') go(dy < 0 ? 1 : -1);
  });
  main.addEventListener('click', e => {
    const it = e.target.closest('.it'); if (!it || e.target.closest('a[href]:not([href$=".html"])')) return;
    if (!e.target.closest('.ph, .t, .links span, .links a[href$=".html"]')) return;
    e.preventDefault(); open(it, true);
  });
  $('.pv-x').addEventListener('click', () => { if (busy) return; if (pushed) history.back(); else { history.replaceState(null, '', location.pathname); close(); } });
  $('.pv-light').addEventListener('click', () => { if (!step) $('.pv-x').click(); });
  addEventListener('keydown', e => { if (!cur) return;
    if (e.key === 'Escape') $('.pv-x').click();
    if (e.key === 'ArrowRight') step ? nb(1) : turnTo(+fig.dataset.i + 1); if (e.key === 'ArrowLeft') step ? nb(-1) : turnTo(+fig.dataset.i - 1);
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(1); } if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); } });
  addEventListener('popstate', () => { const id = new URLSearchParams(location.search).get('piece');
    if (id && byId[id]) { if (cur && cur !== byId[id]) { pushed = false; swap(byId[id]); } else open(byId[id]); } else close(); });
  let wl = 0;
  addEventListener('wheel', e => { if (!cur) return; e.preventDefault(); if (pv.classList.contains('drawer')) return;
    const now = Date.now(); if (Math.abs(e.deltaY) < 8 || now - wl < 1000) return; wl = now; go(e.deltaY > 0 ? 1 : -1); }, { passive: false });
  addEventListener('touchmove', e => { if (cur && !e.target.closest('.pv-drawer')) e.preventDefault(); }, { passive: false });
  addEventListener('resize', () => { if (cur && !busy) { const s = srcOf(cur); fig.style.transition = 'none'; place(box(s.naturalWidth, s.naturalHeight)); layout(); requestAnimationFrame(() => { fig.style.transition = ''; }); } });
  // a piece's own URL opens straight onto it (?act=<n> for a given act)
  const q = new URLSearchParams(location.search), id = q.get('piece');
  if (id && byId[id]) { const it = byId[id]; history.replaceState({ piece: id }, '');
    const go0 = async () => { const s = it.closest('.set'); if (s) scrollTo(0, s.offsetTop); await open(it, false, true);
      const n = +q.get('act') || 0; if (n) { await load(it.dataset.full); for (let k = 0; k < n; k++) { busy = false; go(1); } } };
    const im = srcOf(it); im.complete ? requestAnimationFrame(go0) : im.addEventListener('load', go0, { once: true }); }
})();
