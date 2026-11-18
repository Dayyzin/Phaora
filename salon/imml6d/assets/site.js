// Chapter I: the cart (in this browser only: nothing is sold yet), and a piece page's close-ups.
(function () {
  // the lettering (David's SVG, never typed): fetched once and inlined into each header's box (build_pages.py lettering())
  // the pictures below the first screen (the row of pieces, the packaging): asked for after the page's load, so a phone's
  // first paint has the piece's own picture to itself (the orchestrator, 11 Nov)
  { const later = () => document.querySelectorAll('img[data-later]').forEach(im => { if (im.dataset.laterSrcset) im.srcset = im.dataset.laterSrcset; im.src = im.dataset.later; im.removeAttribute('data-later'); });
    // the deep-zoom viewer's library too (only a close-up needs it): after the load
    const osd = window.__osd = () => window.__osdP || (window.__osdP = new Promise((ok) => { const f = document.body.dataset.osd; if (!f || window.OpenSeadragon) return ok();
      const e = document.createElement('script'); e.src = f; e.onload = e.onerror = () => ok(); document.head.appendChild(e); }));
    if (document.readyState === 'complete') { later(); osd(); } else addEventListener('load', () => { later(); osd(); }, { once: true }); }
  // after the page's load, so its 235 KB never competes with the piece's own picture for a phone's first paint
  { const boxes = document.querySelectorAll('.lt[data-lettering]');
    const go = () => fetch('assets/lettering-solo-offwhite.svg').then(r => r.text()).then(t => {
      const svg = t.replace(/<!--[\s\S]*?-->/g, '').replace(/\s(width|height)="[^"]*"/, '').replace(/\s(width|height)="[^"]*"/, '').replace('<svg ', '<svg aria-hidden="true" ');
      boxes.forEach(b => { b.innerHTML = b.dataset.lettering === 'dark' ? svg : svg.replace(/fill="#E2DDD2"/g, 'fill="currentColor"'); });
    });
    if (boxes.length) { if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true }); } }
  // in the catalogue's piece layer (index.html, nogl_room.js: one page, no reloads): the host drives history and the way back
  const EMB = (() => { try { return window.parent !== window && !!window.parent.__pvHost; } catch (e) { return false; } })();
  const KEY = 'phaora-ch2-cart';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const write = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} };
  function showCount() {
    const n = read().length;
    document.querySelectorAll('nav .cart').forEach(a => { a.hidden = n === 0; a.textContent = 'CART · ' + n; });
  }
  window.PhCart = {
    // a line is the piece's id, or { id, size } once a size was picked on its page
    read, add(id, size) { const c = read(); c.push(size ? { id, size } : id); write(c); showCount(); },
    set(c) { write(c); showCount(); },   // the checkout's EDIT and REMOVE
    clear() { write([]); showCount(); }
  };
  // A piece page's size (David, 9 Nov: "Add a selection for visual not really functional, and a way to pick size and add
  // pre-sale purchase it"): S to XXL in the SIZE row, one at a time, underlined when picked, tapped again to clear; kept
  // per piece on this device. Visual only: no stock behind it, nothing is charged.
  const PICK = 'phaora-ch2-size-pick';
  const picks = () => { try { return JSON.parse(localStorage.getItem(PICK)) || {}; } catch (e) { return {}; } };
  window.PhPick = {
    get(id) { return picks()[id] || null; },
    set(id, z) { const a = picks(); if (z) a[id] = z; else delete a[id]; try { localStorage.setItem(PICK, JSON.stringify(a)); } catch (e) {} },
    // shows the stored pick in every SIZE row on the page (after a load, or the wheel's in-place switch)
    apply() {
      document.querySelectorAll('.sizes[data-piece]').forEach(g => { const z = PhPick.get(g.dataset.piece);
        g.querySelectorAll('[data-pick]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.pick === z)));
        const cue = g.parentElement.querySelector('.cue'); if (cue) cue.hidden = true; });
    }
  };
  const cueFor = (id) => { const g = document.querySelector(`.sizes[data-piece="${id}"]`), cue = g && g.parentElement.querySelector('.cue');
    if (cue) { cue.hidden = false; cue.classList.remove('nudge'); void cue.offsetWidth; cue.classList.add('nudge'); } };
  document.addEventListener('click', (e) => {
    const z = e.target.closest('.sizes [data-pick]'); if (!z) return;
    e.preventDefault(); const id = z.closest('.sizes').dataset.piece;
    PhPick.set(id, PhPick.get(id) === z.dataset.pick ? null : z.dataset.pick); PhPick.apply();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => PhPick.apply()); else PhPick.apply();

  // A yarn in the COLOURWAY row lights up on a tap (David: "Light up", not select): its name and the piece's own YARN
  // spec show quietly under the pair; a second tap, or the other yarn, settles it. Nothing is chosen or stored, and
  // the wheel's in-place switch resets it (the row is rebuilt).
  document.addEventListener('click', (e) => {
    const y = e.target.closest('.yarn'); if (!y) return;
    e.preventDefault(); const dd = y.closest('dd'), on = !y.classList.contains('lit');
    dd.querySelectorAll('.yarn').forEach(x => x.classList.toggle('lit', on && x === y));
    let n = dd.querySelector('.yname'); if (!n) { n = document.createElement('span'); n.className = 'yname'; n.setAttribute('aria-live', 'polite'); dd.appendChild(n); }
    const spec = [...(dd.closest('dl')?.querySelectorAll('dt') || [])].find(d => d.textContent === 'YARN');
    if (on) n.textContent = y.dataset.yarn + ' YARN' + (spec ? ' · ' + spec.nextElementSibling.textContent.trim() : '');
    n.classList.toggle('on', on);
  });

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const id = b.dataset.piece;
    // on a piece page (it has a SIZE row) PRE-SALE and ADD TO CART wait for a size: without one, only the quiet cue
    const sized = !!document.querySelector(`.sizes[data-piece="${id}"]`), size = sized ? PhPick.get(id) : null;
    if (sized && !size && (b.dataset.act === 'cart' || b.dataset.act === 'presale')) { e.preventDefault(); cueFor(id); return; }
    if (b.dataset.act === 'presale' && !sized) {
      e.preventDefault(); openSizes(b, true);   // the room (no SIZE row): the size pop, its CONFIRM goes to the presale checkout
    } else if (b.dataset.act === 'presale') {
      e.preventDefault();   // RESERVE on the checkout records the choice (once)
      location.href = 'checkout.html?buy=' + encodeURIComponent(id) + '&size=' + encodeURIComponent(size) + '&presale=1';
    } else if (b.dataset.act === 'cart') {
      e.preventDefault(); PhCart.add(id, size);
      const t = b.textContent; b.textContent = 'ADDED'; b.classList.add('done');
      setTimeout(() => { b.textContent = t; b.classList.remove('done'); }, 1400);
    } else if (b.dataset.act === 'buy') {
      e.preventDefault(); openSizes(b);
    }
  });

  // BUY NOW (David: "Buy now pops up a size next to it and another button to confirm"): the sizes and CONFIRM open
  // right next to it in the same type; a size is underlined when chosen; CONFIRM goes to checkout with that piece and
  // size, and does nothing until a size is chosen. Tapping elsewhere closes it.
  const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  let pop = null;
  function closeSizes() { if (pop) { pop.remove(); pop = null; } }
  function openSizes(b, presale) {
    closeSizes();
    const id = b.dataset.piece, host = b.parentElement;
    pop = document.createElement('span'); pop.className = 'sizepop';
    pop.innerHTML = SIZES.map(z => `<button type="button" data-size="${z}">${z}</button>`).join('<i>·</i>') + '<button type="button" class="ok" disabled>CONFIRM</button>';
    host.appendChild(pop);
    const below = innerWidth <= 820 || document.body.classList.contains('phone') || host.id === 'btn';   // the room: under BUY NOW, where the buttons are
    pop.classList.toggle('below', below);
    if (below) pop.style.top = (b.offsetTop + b.offsetHeight + 8) + 'px';
    else { pop.style.left = (b.offsetLeft + b.offsetWidth + 30) + 'px'; pop.style.top = b.offsetTop + 'px'; pop.style.height = b.offsetHeight + 'px'; }
    let size = null; const ok = pop.querySelector('.ok');
    pop.addEventListener('click', (e) => {
      e.stopPropagation(); e.preventDefault();
      const z = e.target.closest('[data-size]');
      if (z) { size = z.dataset.size; pop.querySelectorAll('[data-size]').forEach(x => x.setAttribute('aria-pressed', String(x === z))); ok.disabled = false; return; }
      if (e.target.closest('.ok') && size) {
        if (!presale) PhChoice.record({ piece: id, size });   // a presale is recorded once, by RESERVE
        location.href = (b.dataset.base || '') + 'checkout.html?buy=' + encodeURIComponent(id) + '&size=' + encodeURIComponent(size) + (presale ? '&presale=1' : '');
      }
    });
  }
  document.addEventListener('click', (e) => {   // tapping elsewhere closes it (and does nothing else)
    if (!pop || pop.contains(e.target) || e.target.closest('[data-act="buy"], [data-act="presale"]')) return;
    e.stopPropagation(); e.preventDefault(); closeSizes();
  }, true);

  // The one place a size choice is kept (David: "if they presale ... we can know which sizes to buy"). Each CONFIRM is one
  // record { piece, size, time }. For now it is only stored in this browser: no network call, nothing sent.
  // HOOK, if a presale opens: send the record with the visitor's email to the register (canon's /api/public/waitlist,
  // as the drop 1 site's register does), here and only here.
  window.PhChoice = {
    KEY: 'phaora-ch2-size-choices',
    record(r) {
      const rec = { piece: r.piece, size: r.size, presale: !!r.presale, time: new Date().toISOString() };
      try { const a = JSON.parse(localStorage.getItem(this.KEY)) || []; a.push(rec); localStorage.setItem(this.KEY, JSON.stringify(a)); } catch (e) {}
      return rec;
    },
    read() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; } }
  };
  showCount();

  // close-ups: touching the piece opens them; deep-zoom tiles for the 16Ks and 8Ks, the 4Ks as plain images
  const zoom = document.querySelector('.zoom'); if (!zoom) return;
  // every Chapter I piece, embedded in the page (the wheel opens one in place; no fetch, so it works inlined)
  const CH = JSON.parse(document.getElementById('chapter').textContent);
  let P = CH.pieces.find(q => q.id === CH.current), shots = P.shots;
  let viewer = null, cur = -1, curItem = null;
  const bar = zoom.querySelector('.bar'), label = zoom.querySelector('.label');
  // one viewer for everything (David: "add it too to the row of photos so pinch to zoom works there"): its strip carries
  // the garment's views first (front, back, three-quarter, as the page's row), then its close-ups; every item opens
  // in the same viewer with pinch, drag and double-tap, the strip staying underneath
  let items = [], nViews = 0;
  const is16 = (s) => Math.max(s.full_width || s.width || 0, s.height || 0) >= 15000;   // a 16K close-up, on its long side (the Reel's front stands 15360 tall; the preview keeps its source width as full_width)
  function makeItems() {
    const vv = P.views, vs = [vv[vv.length - 1]].concat(vv.slice(0, -1));   // the front first, as on the page
    nViews = vs.length;
    items = vs.map(v => ({ view: true, hires: !!v.hires, shot: v.view.replace('-', ' '), kind: 'image', thumb: v.thumb,
      file: v.hires ? v.hires.file : v.file, width: v.hires ? v.hires.width : v.width, height: v.hires ? v.hires.height : v.height }))
      .concat(shots).concat(P.spin ? [{ spin: true, kind: 'spin', shot: '360', thumb: P.spin.thumb }] : []);   // the worn 360 is always the strip's last item
  }
  function buildBar() { bar.innerHTML = ''; makeItems();
    items.forEach((s, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', s.shot); if (s.view) b.className = 'v';
      b.innerHTML = `<img src="${s.thumb}" alt="" loading="lazy">`; b.onclick = () => show(i); bar.appendChild(b);
    }); }
  buildBar();
  function show(i) { showItem(items[i], i); }
  // a close-up (i, its index) or a view of the garment full screen (i = -1): the same viewer, its dark ground and CLOSE
  // the 360 (David: the piece worn on a form, last in the strip): its frames drawn in place of the viewer, a drag turns it
  // (one turn across the screen), it turns slowly by itself until the first touch
  let spinEl = null, spinT = 0;
  function spinOff() { clearInterval(spinT); if (spinEl) spinEl.hidden = true; const o = zoom.querySelector('.osd'); if (o) o.hidden = false; }
  function spinOn() {
    const o = zoom.querySelector('.osd'); o.hidden = true;
    if (!spinEl) { spinEl = document.createElement('div'); spinEl.className = 'spin'; spinEl.innerHTML = '<img alt="" draggable="false">'; zoom.insertBefore(spinEl, zoom.querySelector('.bar')); spinWire(); }
    spinEl.hidden = false; const im = spinEl.querySelector('img'), F = P.spin.frames; spinEl.dataset.f = '0'; im.src = F[0];
    F.forEach(u => { const n = new Image(); n.src = u; });
    clearInterval(spinT); spinT = setInterval(() => spinTo(+spinEl.dataset.f + 0.12), 40);
  }
  function spinTo(f) { const F = P.spin.frames, n = F.length; f = ((f % n) + n) % n; spinEl.dataset.f = String(f); spinEl.querySelector('img').src = F[Math.floor(f)]; }
  function spinWire() {
    let id = null, x0 = 0, f0 = 0;
    spinEl.addEventListener('pointerdown', (e) => { clearInterval(spinT); id = e.pointerId; x0 = e.clientX; f0 = +spinEl.dataset.f; spinEl.setPointerCapture(id); e.stopPropagation(); });
    spinEl.addEventListener('pointermove', (e) => { if (e.pointerId !== id) return; spinTo(f0 - (e.clientX - x0) / Math.max(320, innerWidth) * P.spin.frames.length * 1.0); });
    const end = (e) => { if (e.pointerId === id) id = null; };
    spinEl.addEventListener('pointerup', end); spinEl.addEventListener('pointercancel', end);
  }
  function showItem(s, i) {
    cur = i; curItem = s;
    if (s.spin) {
      zoom.classList.add('wall'); bar.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
      label.textContent = '360'; spinOn(); return;
    }
    spinOff(); if (viewer) requestAnimationFrame(() => viewer.forceResize());
    zoom.classList.toggle('wall', !!s.view);   // a view of the garment on the page's own grey wall (David: "Page's grey wall"); close-ups on black
    bar.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
    label.textContent = s.shot.toUpperCase() + (s.kind === 'zoom' || s.full_width ? ' · ' + (is16(s) ? '16K' : '8K') : '');
    const src = s.kind === 'zoom' ? s.file : { type: 'image', url: s.file };
    if (!viewer && !window.OpenSeadragon && window.__osd) { window.__osd().then(() => { if (curItem === s) showItem(s, i); }); return; }   // its library, if the page has not loaded it yet
    if (!viewer) {
      OpenSeadragon.setImageFormatsSupported({ webp: true });   // the tiles are WebP; every current browser decodes it
      viewer = OpenSeadragon({ element: zoom.querySelector('.osd'), tileSources: src, showNavigationControl: false,
        maxZoomPixelRatio: 2, visibilityRatio: 0.9, animationTime: 0.9, blendTime: 0.2, gestureSettingsMouse: { clickToZoom: true },
        // tiles drawn on whole pixels (David, 11 Nov: a hairline at a tile boundary in the tee's TATTOO 8K); the tiles overlap by 2 px
        subPixelRoundingForTransparency: OpenSeadragon.SUBPIXEL_ROUNDING_OCCURRENCES ? OpenSeadragon.SUBPIXEL_ROUNDING_OCCURRENCES.ALWAYS : undefined,
        gestureSettingsTouch: { pinchToZoom: true, dblClickToZoom: true, clickToZoom: false, flickEnabled: true } });
      // a small plain close-up (the starlets' 200 px tattoo crops) never goes past 1:1 on the screen's own pixels;
      // the 4Ks and the tiled 8K/16Ks keep their 2x
      // a garment view never goes past its own pixels (1 image pixel per device pixel), so a pinch stays sharp; its
      // high-res image, when there is one, takes it further
      viewer.addHandler('resize', () => capView());
      wireHold();
      viewer.addHandler('open', () => { const t = curItem, small = t.kind !== 'zoom' && t.width < 1200;
        const vp = viewer.viewport, one = 1 / (window.devicePixelRatio || 1);
        vp.maxZoomPixelRatio = small || t.view ? one : 2; vp.minZoomImageRatio = small ? 0.05 : 0.9;
        // a close-up opens filling the screen (David, 11 Nov: on a tall phone the 16:9 close-up showed a hard edge with black
        // below): no letterbox, and it never zooms out past that; a view of the garment keeps its whole outline
        const fill = !t.view && !small; vp.homeFillsViewer = fill; vp.goHome(true); vp.minZoomLevel = fill ? vp.getHomeZoom() : null;
        // a view without its high-res image still zooms at least 2x past whole (the bridge until the 4Ks land)
        capView();
        if (small) { const z = vp.imageToViewportZoom(one); if (vp.getZoom() > z) vp.zoomTo(z, null, true); } settle(); });
    } else viewer.open(src);
    window.PhViewer = viewer;   // for review scripts
  }
  function open(i) { reveal(); show(typeof i === 'number' ? i : Math.max(0, cur)); }
  // what the page shows now, as an item of the viewer's strip: the view on show, or the close-up in the piece's place
  const here = () => shown >= 0 ? nViews + shown : (viewIdx === views.length - 1 ? 0 : viewIdx + 1);
  function close() { clearInterval(spinT); zoom.hidden = true; document.body.style.overflow = ''; }
  // every opening starts whole: once the viewer is visible again, its size re-read and its view sent home
  function reveal() { zoom.hidden = false; document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => { if (viewer) { viewer.forceResize(); viewer.viewport.goHome(true); capView(); settle(); } }); }
  // a swipe down closes the viewer, when the image is not zoomed in (a zoomed image pans instead); pointer events,
  // seen before the viewer's own handlers (capture)
  let sw = null, baseZoom = 1; const touching = new Set();
  // a view without its high-res image still zooms at least 2x past whole (the bridge until the 4Ks land); measured
  // again after every resize, since the home zoom moves with the container
  const capView = () => { if (!viewer || !curItem || !curItem.view || curItem.hires) return; const vp = viewer.viewport;
    vp.maxZoomPixelRatio = Math.max(1 / (window.devicePixelRatio || 1), 2.0 * vp.getHomeZoom() / vp.imageToViewportZoom(1)); };
  const settle = () => setTimeout(() => { if (viewer) baseZoom = viewer.viewport.getZoom(); }, 150);
  zoom.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; touching.add(e.pointerId);
    sw = touching.size === 1 ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null; }, true);
  const lift = (e) => { if (e.pointerType !== 'touch') return; touching.delete(e.pointerId);
    if (vgest) { sw = null; return; }   // the finger held the photo: never a swipe
    if (!sw || e.pointerId !== sw.id || !(viewer || (curItem && curItem.spin)) || e.type === 'pointercancel') { if (e.pointerId === (sw && sw.id)) sw = null; return; }
    const dy = e.clientY - sw.y, ddx = e.clientX - sw.x, dx = Math.abs(ddx); sw = null;
    if (curItem && curItem.spin) { if (dy > 90 && dx < 70) close(); return; }   // the 360: sideways turns it; down closes
    if (viewer.viewport.getZoom() > baseZoom * 1.08) return;   // zoomed in: the drag was a pan
    if (dy > 90 && dx < 70) close();   // down: closes
    else if (dx > 80 && Math.abs(dy) < 70) show((cur + (ddx < 0 ? 1 : -1) + items.length) % items.length); };   // sideways: the next item
  zoom.addEventListener('pointerup', lift, true); zoom.addEventListener('pointercancel', lift, true);
  // the views column: a view or a 4K close-up takes the piece's place; a 16K or 8K close-up opens in the deep zoom.
  // Touching the piece opens the close-ups (at the one shown, if it is a close-up).
  const piece = document.querySelector('.piece'), img = piece.querySelector('.g'), rest = piece.querySelector('.rest');
  let front = P.img, views = P.views;
  let shown = -1;
  // each view stands over its own real shadow (build_view_shadows.py: the caster turned as that view was shot); the
  // view's box is its own cut-out's, so its image takes the piece's height and the shadow is placed from that box
  let boxAspect = views[views.length - 1].aspect;
  function shade(vw) {
    const sh = vw.shadow;
    if (!sh) { rest.style.opacity = 0; return; }
    // the view is drawn contained in the piece's box: narrower views are centred at full height, wider ones at full width
    const kx = Math.min(1, vw.aspect / boxAspect), ky = Math.min(1, boxAspect / vw.aspect), ox = (1 - kx) / 2 * 100, oy = (1 - ky) / 2 * 100;
    const p = sh.place; rest.style.opacity = 0;
    setTimeout(() => { rest.src = sh.image; Object.assign(rest.style, { left: ox + p.left * kx + '%', top: oy + p.top * ky + '%', width: p.width * kx + '%', height: p.height * ky + '%' }); rest.style.opacity = 1; }, 180);
  }
  // a close-up smaller than the piece's box is shown no bigger than 1:1 (on the screen's own pixels: the srcset gives it
  // that density), centred in the box; never upscaled
  function place(src, oneToOne) { img.style.opacity = 0; const n = new Image(); n.src = src;
    n.decode().catch(() => {}).then(() => {
      if (oneToOne) { img.srcset = `${src} ${window.devicePixelRatio || 1}x`; img.style.objectFit = 'scale-down'; }
      else { img.removeAttribute('srcset'); img.style.objectFit = ''; }
      img.src = src; img.style.opacity = 1; }); }
  const col = document.querySelector('.views');
  col.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    if (b.dataset.shot !== undefined) {
      const i = +b.dataset.shot;
      if (shots[i].kind === 'zoom') { open(nViews + i); return; }
      shown = i; place(shots[i].file, true); piece.classList.add('cu-shown'); rest.style.opacity = '';
    } else { const v = +b.dataset.view; shown = -1; viewIdx = v < 0 ? views.length - 1 : v; place(v < 0 ? front : views[v].file); piece.classList.remove('cu-shown');
      shade(views[v < 0 ? views.length - 1 : v]); }
    col.querySelectorAll('button').forEach(x => x.setAttribute('aria-current', String(x === b)));
  });
  // press and hold zooms the garment in place (David: "Product page hold finger on the hoodie reveals zoom in"): a hold
  // of 300 ms that moves less than 10 px zooms about the point under the finger (or the mouse); moving then explores,
  // the part under the finger kept under it; letting go eases back. A tap still opens the close-ups; a finger that moves
  // before the hold is a scroll. The zoom goes only as far as the image stays sharp on this screen: up to 2.5x with the
  // view's high-res image (swapped in on the hold, never loaded with the page), less without one.
  let viewIdx = views.length - 1, hold = null, zoomed = false, swallow = false, lastTouch = 0, start = null;
  // the full-screen button (David: "full screen button to zoom in with pinching"): the view shown, full screen in the
  // close-ups' viewer: pinch, drag, double-tap, the wheel; its high-res image when there is one; CLOSE or a swipe down
  const fsb = piece.querySelector('.fs');
  if (fsb) fsb.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); open(here()); });   // the same viewer
  const HOLD = 250, SLOP = 10, ZMAX = 2.5, MINZ = 2.0, EASE = 'cubic-bezier(.45,0,.55,1)';
  // iOS (David on his iPhone: "You can select the hoodie when you tap and hold"): the finger never lands on the <img>,
  // whose long press iOS takes for itself (select, drag, preview), but on a plain transparent layer over it
  let hit = piece.querySelector('.hit');
  if (!hit) { hit = document.createElement('div'); hit.className = 'hit'; piece.insertBefore(hit, piece.querySelector('.fs')); }
  img.draggable = false;
  function sharpLimit() {
    const r = piece.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if (shown >= 0) {   // a close-up in the piece's place, drawn no bigger than 1:1: at least 2x, as the views
      const c = shots[shown], a = c.width / c.height, nat = img.naturalHeight || c.height;
      const drawnH = Math.min(r.height, r.width / a, nat / dpr);
      return Math.min(ZMAX, Math.max(MINZ, nat / (drawnH * dpr)));
    }
    const vw = views[viewIdx];
    const drawnH = Math.min(r.height, r.width / vw.aspect);   // the view is contained in the box
    const nat = vw.hires ? vw.hires.height : (img.naturalHeight || 1), sharp = nat / (drawnH * dpr);
    // with a high-res image: as far as it stays sharp; without one, at least 2x as a bridge until the 4Ks land (the
    // orchestrator: "A zoom that doesn't move reads as broken"; slight softness accepted)
    return Math.min(ZMAX, vw.hires ? Math.max(1, sharp) : Math.max(MINZ, sharp));
  }
  function aim(x, y) { const r = piece.getBoundingClientRect();   // the box, never the scaled image
    img.style.transformOrigin = `${Math.max(0, Math.min(r.width, x - r.left))}px ${Math.max(0, Math.min(r.height, y - r.top))}px`; }
  function zoomIn() {
    hold = null; const s = sharpLimit(); if (s <= 1.02) return;   // no sharper image to show: a hold is just a press
    zoomed = true; piece.classList.add('zoomed'); document.body.classList.add('holding'); aim(start.x, start.y);
    img.style.transition = `transform .25s ${EASE}, opacity .35s`; img.style.transform = `scale(${s.toFixed(3)})`;
    const vw = views[viewIdx];
    if (shown < 0 && vw.hires && img.dataset.hires !== vw.hires.file) {   // the high-res view, swapped in once it has decoded
      const want = viewIdx, n = new Image(); n.src = vw.hires.file;
      n.decode().catch(() => {}).then(() => { if (viewIdx === want && n.naturalWidth) { img.removeAttribute('srcset'); img.src = vw.hires.file; img.dataset.hires = vw.hires.file; } });
    }
  }
  function zoomOut() { if (!zoomed) return; zoomed = false; swallow = true; document.body.classList.remove('holding');
    img.style.transform = ''; setTimeout(() => { if (!zoomed) piece.classList.remove('zoomed'); }, 260); }
  const begin = (x, y, id) => {
    swallow = false; start = { x, y, id }; clearTimeout(hold); hold = setTimeout(zoomIn, HOLD); return true; };
  const follow = (x, y) => { if (!start) return;
    if (zoomed) { aim(x, y); return; }
    if (hold && Math.hypot(x - start.x, y - start.y) > SLOP) { clearTimeout(hold); hold = null; start = null; } };   // a move first: a scroll
  const release = () => { clearTimeout(hold); hold = null; start = null; zoomOut(); };   // also on a cancel: never stuck
  // touch: the page may still scroll from here (touchstart is left alone); once the hold has fired, every move is the
  // zoom's and the page holds still
  hit.addEventListener('touchstart', (e) => { lastTouch = Date.now();
    if (e.touches.length !== 1) { release(); return; } const t = e.touches[0]; begin(t.clientX, t.clientY, 'touch'); }, { passive: false });
  hit.addEventListener('touchmove', (e) => { if (zoomed) e.preventDefault(); const t = e.touches[0]; if (t) follow(t.clientX, t.clientY); }, { passive: false });
  hit.addEventListener('touchend', (e) => { if (zoomed) e.preventDefault(); release(); }, { passive: false });
  hit.addEventListener('touchcancel', release, { passive: false });
  // the mouse, the same path
  hit.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' || e.button) return;
    if (begin(e.clientX, e.clientY, e.pointerId)) { e.preventDefault(); hit.setPointerCapture(e.pointerId); } });
  hit.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') follow(e.clientX, e.clientY); });
  hit.addEventListener('pointerup', (e) => { if (e.pointerType !== 'touch') release(); });
  hit.addEventListener('pointercancel', (e) => { if (e.pointerType !== 'touch') release(); });
  // nothing in the piece selects, drags or opens a menu
  ['selectstart', 'dragstart', 'contextmenu'].forEach(t => piece.addEventListener(t, (e) => e.preventDefault()));
  // the viewer's hold (David: "Add same hold to zoom to ALL photos, 16k ones get in 2x the zoom close up from the one
  // on the hoodie"): every photo in it, views and close-ups, the same 250 ms hold as the garment on the page, about the
  // point under the finger; moving explores, the point first held staying under the finger; letting go eases back to
  // where it was. As far as the page's hold goes (up to 2.5x, as far as stays sharp, at least 2x); a 16K close-up twice
  // that, 5x. The drag, flick and click the viewer would make of the same finger are dropped while it holds.
  // iOS: the finger lands on a plain transparent layer (.shield) over the tiles, never an <img> (the preview draws them
  // as <img>s), so a long press never selects or calls up a menu (David's screenshot: Copy / Look Up over BACK).
  const osdEl = zoom.querySelector('.osd'), HOLD16 = 2 * ZMAX;
  let vh = null, vheld = null, vgest = false, vstart = null, springT = null;
  function wireHold() {
    const sh = document.createElement('div'); sh.className = 'shield'; viewer.canvas.appendChild(sh);
    ['canvas-drag', 'canvas-drag-end', 'canvas-click'].forEach(n => viewer.addHandler(n, (e) => { if (vgest) e.preventDefaultAction = true; }));
  }
  function vFactor() {
    const t = curItem, vp = viewer.viewport, dpr = window.devicePixelRatio || 1;
    if (is16(t)) return HOLD16;
    const sharp = 1 / (vp.viewportToImageZoom(vp.getZoom(true)) * dpr);   // image pixels per device pixel as drawn now
    return Math.min(ZMAX, t.view && t.hires ? Math.max(1, sharp) : Math.max(MINZ, sharp));
  }
  const springs = () => { const vp = viewer.viewport; return [vp.zoomSpring, vp.centerSpringX, vp.centerSpringY]; };
  function vAim(x, y, now) {
    const h = vheld, k = 1 / (h.W * h.z0), vp = viewer.viewport;
    const qx = h.c0.x + (Math.max(0, Math.min(h.W, x - h.r.left)) - h.W / 2) * k;
    const qy = h.c0.y + (Math.max(0, Math.min(h.H, y - h.r.top)) - h.H / 2) * k;
    vp.zoomTo(h.z0 * h.s, null, now);
    vp.panTo(new OpenSeadragon.Point(qx + (h.c0.x - qx) / h.s, qy + (h.c0.y - qy) / h.s), now);
  }
  function vIn() {
    vh = null; if (!viewer || !vstart) return; const vp = viewer.viewport, z0 = vp.getZoom(true);
    const s = Math.min(vFactor(), vp.getMaxZoom() / z0); if (s <= 1.02) return;   // nothing further to show: just a press
    const r = osdEl.getBoundingClientRect();
    vheld = { c0: vp.getCenter(true), z0, s, r, W: r.width, H: r.height }; vgest = true;
    clearTimeout(springT); springs().forEach(p => { p.animationTime = 0.25; });
    vAim(vstart.x, vstart.y, false);
  }
  function vOut() {
    clearTimeout(vh); vh = null; vstart = null; if (!vheld) return;
    const h = vheld, vp = viewer.viewport; vheld = null;
    vp.zoomTo(h.z0, null, false); vp.panTo(h.c0, false);
    springT = setTimeout(() => springs().forEach(p => { p.animationTime = 0.9; }), 320);
  }
  osdEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' && e.button) return;
    if (touching.size > 1) { vOut(); return; }   // a second finger: a pinch, never a hold
    vgest = false; vstart = { x: e.clientX, y: e.clientY }; clearTimeout(vh); vh = setTimeout(vIn, HOLD);
  }, true);
  zoom.addEventListener('pointermove', (e) => {
    if (vheld) { vAim(e.clientX, e.clientY, true); return; }
    if (vh && vstart && Math.hypot(e.clientX - vstart.x, e.clientY - vstart.y) > SLOP) { clearTimeout(vh); vh = null; vstart = null; }   // a pan
  }, true);
  ['pointerup', 'pointercancel'].forEach(t => zoom.addEventListener(t, vOut, true));   // before the viewer's own handlers
  ['selectstart', 'dragstart', 'contextmenu'].forEach(t => zoom.addEventListener(t, (e) => e.preventDefault()));
  // a tap after a hold is the end of the hold, not a tap
  piece.addEventListener('click', (e) => { if (swallow) { swallow = false; e.stopPropagation(); e.preventDefault(); } }, true);
  function fit() {   // desktop: the column runs from the top of the hood to the hem line of the piece
    const h = piece.getBoundingClientRect().height;
    col.style.height = innerWidth > 820 ? Math.round(h * 0.86) + 'px' : '';
    col.style.marginTop = innerWidth > 820 ? Math.round(h * 0.04) + 'px' : '';
  }
  addEventListener('resize', fit); img.addEventListener('load', fit); fit();
  piece.addEventListener('click', () => open(here()));
  zoom.querySelector('.close').addEventListener('click', close);
  addEventListener('keydown', (e) => {
    if (zoom.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show((cur + 1) % items.length);
    if (e.key === 'ArrowLeft') show((cur - 1 + items.length) % items.length);
  });
// ---- the wheel: every Chapter I piece, swiped left and right; a tap opens one in place (David: "a wheel of products
  // that you swipe left right and it opens same way it used to, not refreshing the tab, just slides from the wheel up
  // to where it sits and specs change to the right ones") ----
  const wheel = document.querySelector('.wheel');
  const info = document.querySelector('.info'), hint = document.querySelector('.hint'), design = document.querySelector('.design');
  const left = document.querySelector('.left'), h1 = info.querySelector('h1'), dl = info.querySelector('dl');
  const ids = CH.pieces.map(q => q.id), N = ids.length, byId = (id) => CH.pieces.find(q => q.id === id);
  const wis = wheel ? [...wheel.querySelectorAll('.wi')] : [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pos = ids.indexOf(P.id), spin = null, busy = false;
  const wrap = (k) => { k = ((k % N) + N) % N; return k > N / 2 ? k - N : k; };   // the wheel loops
  // the wheel is a flat, straight row (David: "Not actual wheel, just a flat straight wheel, meaning not a circle"):
  // every piece at one size on one level line, the current one centred, a gentle fade only at the screen's edges
  // the spacing: a piece's width and a little, wide enough that the loop's seam always falls off the screen
  const stepPx = () => Math.max(wheel.clientHeight * 0.82 * 1.12, wheel.clientWidth / (N - 1));
  function slot(i, at) {
    const W = wheel.clientWidth, H = wheel.clientHeight, k = wrap(i - at), a = Math.abs(k), hgt = H * 0.82;
    const x = W / 2 + k * stepPx(), edge = Math.min(x, W - x), fadeW = Math.max(40, W * 0.1);
    return { k, a, s: 1, x, y: H * 0.09, hgt, rot: 0, o: Math.max(0, Math.min(1, edge / fadeW)) };
  }
  // while it turns only the pieces' transform and opacity change (no layout on a frame: smooth on a phone); their size,
  // pointer and current state are written only when they change
  const setIf = (el, k, v) => { const c = el.__w || (el.__w = {}); if (c[k] !== v) { c[k] = v; if (k === 'aria') el.setAttribute('aria-current', v); else el.style[k] = v; } };
  function layoutWheel() {
    if (!wheel) return;
    wis.forEach((el, i) => { const t = slot(i, pos), w = t.hgt * Math.min(1, +el.style.getPropertyValue('--a'));   // a wide piece (sunglasses, a bag) kept in a square, standing on the row's floor, never over its neighbours
      setIf(el, 'width', w.toFixed(2) + 'px'); setIf(el, 'height', t.hgt.toFixed(2) + 'px'); setIf(el, 'willChange', 'transform, opacity');
      el.style.transform = `translate3d(${(t.x - w / 2).toFixed(2)}px, ${t.y.toFixed(2)}px, 0) rotate(${t.rot}deg) scale(${t.s})`;
      setIf(el, 'opacity', String(+t.o.toFixed(3))); setIf(el, 'zIndex', '1');
      setIf(el, 'pointerEvents', t.o < 0.15 ? 'none' : ''); setIf(el, 'aria', String(t.a < 0.5)); });
  }
  // the wheel's own easing: to a position over a time, eased (the room's curve)
  function spinTo(target, ms, done) {
    cancelAnimationFrame(spin); const from = pos, d = target - from, t0 = performance.now();
    if (reduce || ms <= 0) { pos = target; layoutWheel(); done && done(); return; }
    const step = (now) => { const u = Math.min(1, (now - t0) / ms), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      pos = from + d * e; layoutWheel(); if (u < 1) spin = requestAnimationFrame(step); else { pos = target; layoutWheel(); done && done(); } };
    spin = requestAnimationFrame(step);
  }
  const snap = (ms = 380) => spinTo(Math.round(pos), ms);
  // the shortest way round to a piece's index from where the wheel is
  const nearest = (i) => pos + wrap(i - pos);

  if (wheel) {
    layoutWheel(); addEventListener('resize', layoutWheel);
    // drag (touch or mouse) with momentum, snapping to a piece; a press that does not move is a tap
    let drag = null;
    wheel.addEventListener('pointerdown', (e) => {
      if (e.button || busy) return; cancelAnimationFrame(spin);
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, p0: pos, last: e.clientX, t: performance.now(), v: 0, moved: false, el: e.target.closest('.wi') };
      wheel.setPointerCapture(e.pointerId);
    });
    wheel.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0; if (!drag.moved && Math.abs(dx) > 6) drag.moved = true;
      if (!drag.moved) return;
      const step = stepPx(), now = performance.now();
      pos = drag.p0 - dx / step; layoutWheel();
      const dt = Math.max(1, now - drag.t); drag.v = 0.8 * drag.v + 0.2 * (-(e.clientX - drag.last) / step / dt * 1000); drag.last = e.clientX; drag.t = now;
    });
    const release = (e) => {
      if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null;
      if (!d.moved) { if (e.type === 'pointerup' && d.el) select(d.el.dataset.id); else snap(); return; }
      // momentum: carry on with the release speed, easing to the nearest piece in the throw's direction
      const v = Math.max(-6, Math.min(6, d.v)), target = Math.round(pos + v * 0.28);
      spinTo(target, Math.min(900, 380 + Math.abs(target - pos) * 160));
    };
    wheel.addEventListener('pointerup', release); wheel.addEventListener('pointercancel', release);
    wheel.addEventListener('click', (e) => { const el = e.target.closest('.wi'); if (el && e.detail === 0) select(el.dataset.id); });   // the keyboard's Enter
    // a sideways trackpad scroll turns the wheel; it settles on a piece when the scroll stops
    let idle = 0;
    wheel.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; e.preventDefault(); cancelAnimationFrame(spin);
      pos += e.deltaX / stepPx(); layoutWheel();
      clearTimeout(idle); idle = setTimeout(() => snap(), 140);
    }, { passive: false });
    // ← → turn the wheel by one piece (when no viewer is open and nothing is being typed)
    addEventListener('keydown', (e) => {
      if (!zoom.hidden || busy || /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); spinTo(Math.round(pos) + 1, 420); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); spinTo(Math.round(pos) - 1, 420); }
    });
  }

  // ---- a piece in place: everything on the page switches to it ----
  function columnHTML(q) {
    return [`<button type="button" data-view="-1" aria-current="true" aria-label="Front"><img src="${q.img}" alt=""></button>`]
      .concat(q.views.slice(0, -1).map((v, j) => `<button type="button" data-view="${j}" aria-label="${v.view.replace(/(^|-)\w/g, m => m.toUpperCase())}"><img src="${v.thumb}" alt=""></button>`))
      .concat(q.shots.map((c, j) => `<button type="button" class="cu" data-shot="${j}" aria-label="Close-up: ${c.shot}"><img src="${c.thumb}" alt=""></button>`)).join('');
  }
  function render(q) {
    P = q; shots = q.shots; views = q.views; front = q.img; shown = -1; viewIdx = views.length - 1; boxAspect = views[viewIdx].aspect;
    document.title = q.title;
    design.style.backgroundImage = q.design ? `url(${q.design})` : 'none'; design.classList.toggle('tile', !!q.tile);
    left.style.setProperty('--a', (q.w / q.h).toFixed(4)); piece.style.aspectRatio = `${q.w} / ${q.h}`;
    left.classList.toggle('big', !!q.big); if (q.big) left.style.setProperty('--hw', q.big + 'vw'); else left.style.removeProperty('--hw');   // a long, low piece (the gloves, the sunglasses) drawn as large as the Reel (David, 11 Nov)
    piece.classList.remove('cu-shown', 'zoomed');
    img.removeAttribute('srcset'); img.style.objectFit = ''; img.style.transform = ''; delete img.dataset.hires;
    img.width = q.w; img.height = q.h; img.alt = q.alt || (q.name.replace(/\w\S*/g, w => w[0] + w.slice(1).toLowerCase()) + ', front'); img.removeAttribute('srcset'); img.src = q.img;
    const sp = views[viewIdx].shadow; rest.src = sp.image;
    Object.assign(rest.style, { left: sp.place.left + '%', top: sp.place.top + '%', width: sp.place.width + '%', height: sp.place.height + '%' });
    col.innerHTML = columnHTML(q); fit();
    h1.textContent = q.name; h1.classList.toggle('long', !!q.long); dl.innerHTML = q.rows;
    { const tg = info.querySelector('.tag'); if (tg) { tg.textContent = q.tag || ''; tg.hidden = !q.tag; } const hz = piece.querySelector('.hz'); if (hz) hz.textContent = q.hz || 'HOLD TO ZOOM'; }   // the piece's one line; its zoom caption
    { const md = info.querySelector('.more-dl'); if (md && q.more) md.innerHTML = q.more; }   // the piece's own DETAILS
    info.querySelectorAll('[data-piece]').forEach(b => { b.dataset.piece = q.id; });
    const pp = info.querySelector('[data-act="presale"] .pp'); if (pp) pp.textContent = q.presale; PhPick.apply();
    closeSizes(); zoom.hidden = true; document.body.style.overflow = ''; cur = -1; curItem = null; buildBar(); craftRender(q); revealFor(q); fitInfo();
  }
  // the room's opening: the chosen piece's cut-out slides from its place on the wheel up to the hero's place while the
  // old hero goes down into the wheel; the text changes under a short crossfade; on a phone the page goes to the top
  // in the same motion. The address becomes the piece's own page (so refresh, share and back all work).
  function select(id, push = true) {
    const q = byId(id); if (!q || busy) return;
    const i = ids.indexOf(id), old = P, oi = ids.indexOf(old.id);
    if (id === old.id) { spinTo(nearest(i), 420); return; }
    busy = true;
    const DUR = reduce ? 0 : 700, EASE = 'cubic-bezier(.45,0,.55,1)', target = nearest(i);
    const fromEl = wis[i], fromR = fromEl ? fromEl.getBoundingClientRect() : null, heroR = piece.getBoundingClientRect();
    const phone = true, sy = scrollY;   // the page scrolls on a computer too now (the row sits under the craft): back to the top in the same motion
    const fade = [info, col, hint].filter(Boolean);
    fade.forEach(el => { el.style.transition = 'opacity .18s'; el.style.opacity = 0; });
    const n = new Image(); n.src = q.img; const o = new Image(); o.src = old.img;   // both flying pieces decoded before they move
    Promise.race([Promise.all([n.decode().catch(() => {}), o.decode().catch(() => {})]), new Promise(r => setTimeout(r, 350))]).then(() => {
      render(q);
      // where the new hero stands once the page is at its scroll (the top, on a phone)
      const nr = piece.getBoundingClientRect(), top = nr.top + (phone ? sy : 0);
      const to = { left: nr.left, top, width: nr.width, height: nr.height };
      img.style.visibility = 'hidden'; rest.style.transition = 'none'; rest.style.opacity = 0;
      const flies = [];
      const fly = (src, a, b, cls, el0) => {   // a fixed copy that moves from rect a to rect b (FLIP: placed at b, transformed from a)
        const el = el0 || new Image(); if (!el0) el.src = src; el.className = 'flyp ' + (cls || '');   // the new piece flies as the image already decoded (n): never a blank first frame
        Object.assign(el.style, { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' });
        document.body.appendChild(el); flies.push(el);
        const sx = a.width / b.width, sy2 = a.height / b.height, from = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${sx}, ${sy2})`;
        el.animate([{ transform: from }, { transform: 'none' }], { duration: DUR, easing: EASE, fill: 'forwards' });
        // two garments never cross in the air: the outgoing one fades out as it starts down (the first ~0.2 s)
        if (cls === 'down') el.animate([{ opacity: 1 }, { opacity: 0, offset: 0.28 }, { opacity: 0 }], { duration: DUR, fill: 'forwards' });
      };
      if (fromR) fly(q.img, fromR, to, 'up', n);
      // the old hero, down to its place on the wheel when the wheel has turned
      if (wheel && wis[oi]) { const t = slot(oi, target), wr = wheel.getBoundingClientRect(), hh = t.hgt * t.s, ww = hh * (old.w / old.h);
        const dest = { left: wr.left + t.x - ww / 2, top: wr.top + t.y + (t.hgt - hh) + (phone ? sy : 0), width: ww, height: hh };
        fly(old.img, heroR, dest, 'down', o); wis[oi].style.visibility = 'hidden'; }
      if (fromEl) fromEl.style.visibility = 'hidden';
      spinTo(target, DUR);
      if (phone && sy > 0) scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      if (push) try { if (EMB) parent.__pvHost.push(id, q.page); else history.pushState({ id }, '', q.page); } catch (e) {}
      setTimeout(() => {
        img.style.visibility = ''; flies.forEach(f => f.remove());
        wis.forEach(el => { if (el.style.visibility === 'hidden') { el.style.visibility = ''; el.animate([{ opacity: 0 }, { opacity: +el.style.opacity || 1 }], { duration: 260, easing: EASE }); } });   // its slot in the row fades back in
        rest.style.transition = ''; requestAnimationFrame(() => { rest.style.opacity = ''; });
        fade.forEach(el => { el.style.transition = 'opacity .32s'; el.style.opacity = ''; });
        busy = false;
      }, DUR + 20);
    });
  }
  if (!EMB) history.replaceState({ id: P.id }, '');
  (EMB ? () => {} : addEventListener.bind(window))('popstate', (e) => {   // embedded: the host's history drives it (__pvSelect)   // back and forward go the same way
    const id = (e.state && e.state.id) || (CH.pieces.find(q => location.pathname.endsWith('/' + q.page)) || {}).id;
    if (id && id !== P.id) select(id, false);
  });

  // ---- the craft (David, 10 Nov night: "a less lean website showing the craftsman of each"): after the piece, full-screen
  // sections, one at a time, each one image and one short line (the material, the technique, the details, worn; a piece
  // has the ones its renders exist for). A section's images are given their source and decoded a screen before it comes
  // into view, and it appears with opacity and transform only, once they are decoded; a close-up opens in the viewer.
  const craftEl = document.querySelector('.craft');
  let craftIO = null, craftNear = null, craftOn = null;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const fig = (o, shot, sizes, cls) => `<figure class="${cls || ''}"${shot ? ` data-shot="${esc(shot)}" role="button" tabindex="0" aria-label="See the close-up"` : ''}>` +
    `<img alt="" draggable="false" width="${o.w}" height="${o.h}" data-src="${esc(o.small || o.img)}"` +
    (o.small ? ` data-srcset="${esc(o.small)} 1920w, ${esc(o.img)} ${o.w}w" sizes="${sizes}"` : '') + `></figure>`;
  function craftRender(q) {
    if (!craftEl) return;
    if (craftIO) craftIO.disconnect(); if (craftNear) craftNear.disconnect(); if (craftOn) craftOn.disconnect(); document.body.classList.remove('in-craft');
    const C = q.craft || [];
    craftEl.hidden = !C.length;
    craftEl.innerHTML = C.map((c) => {
      const cap = `<div class="cap"><span class="lb">${esc(c.label)}</span>${c.line ? `<p>${esc(c.line)}</p>` : ''}${c.shot || c.parts ? '<span class="hz">TOUCH TO ZOOM IN</span>' : ''}</div>`;
      if (c.k === 'inhand') return `<section class="sec h">${fig(c, null, '(max-width: 820px) 100vw, 72vh', 'sq')}${cap}</section>`;   // in hand: the whole still, square, never cropped
      if (c.k === 'technique' && c.chart) return `<section class="sec t"><div class="pair">${fig(c.chart, null, '', 'chart')}${fig(c, c.shot, '(max-width: 820px) 100vw, 50vw')}</div>${cap}</section>`;
      if (c.parts) return `<section class="sec d"><div class="pair">${c.parts.map(p => fig(p, p.shot, '(max-width: 820px) 100vw, 50vw')).join('')}</div>${cap}</section>`;
      return `<section class="sec m">${fig(c, c.shot, '100vw', 'full')}${cap}</section>`;
    }).join('');
    const secs = [...craftEl.querySelectorAll('.sec')];
    const load = (sec) => { if (sec.__p) return sec.__p;
      return (sec.__p = Promise.all([...sec.querySelectorAll('img[data-src]')].map(im => { if (im.dataset.srcset) im.srcset = im.dataset.srcset; im.src = im.dataset.src;
        return (im.decode ? im.decode() : Promise.resolve()).catch(() => {}); }))); };
    // a screen ahead: given their source and decoded
    craftNear = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) load(e.target); }), { rootMargin: '100% 0px 100% 0px' });
    // in view: shown once decoded (never a half-drawn image sliding in)
    craftIO = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { const sec = e.target; load(sec).then(() => sec.classList.add('in')); craftIO.unobserve(sec); } }), { threshold: 0.12 });
    secs.forEach(sec => { craftNear.observe(sec); craftIO.observe(sec); });
    // the fixed header steps aside while any section is on screen
    const onScr = new Set(); craftOn = new IntersectionObserver((es) => { es.forEach(e => e.isIntersecting ? onScr.add(e.target) : onScr.delete(e.target));
      document.body.classList.toggle('in-craft', onScr.size > 0); }, { threshold: 0.02 });
    secs.forEach(sec => craftOn.observe(sec));
  }
  if (craftEl) {
    const go = (f) => { const j = shots.findIndex(s => s.shot === f.dataset.shot); if (j >= 0) open(nViews + j); };
    craftEl.addEventListener('click', (e) => { const f = e.target.closest('figure[data-shot]'); if (f) go(f); });
    craftEl.addEventListener('keydown', (e) => { const f = e.target.closest('figure[data-shot]'); if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(f); } });
    craftRender(P);
  }
  // the details never run under the row of pieces (gate 846a0757: the hint sat under the wheel on a two-line name): on a
  // computer, if the hint's foot comes within 18 px of the wheel, the details move up (no higher than under the way back),
  // then scale down from their top left; transform only, so nothing else moves
  const infoEl = document.querySelector('.piece-page .info'), wheelEl = document.querySelector('.piece-page .wheel');
  function fitInfo() {
    if (!infoEl || !wheelEl) return;
    infoEl.style.transform = ''; infoEl.style.transformOrigin = '0 0';
    if (innerWidth <= 820) return;
    const last = infoEl.querySelector('.hint') || infoEl.lastElementChild; if (!last) return;
    const r = infoEl.getBoundingClientRect(), over = last.getBoundingClientRect().bottom - (wheelEl.getBoundingClientRect().top - 18);
    if (over <= 0) return;
    const up = Math.min(over, Math.max(0, r.top - 150)), left = over - up;
    const k = left > 0 ? Math.max(0.6, 1 - left / (last.getBoundingClientRect().bottom - up - r.top)) : 1;
    infoEl.style.transform = `translateY(${-up}px)` + (k < 1 ? ` scale(${k})` : '');
  }
  if (infoEl) {
    fitInfo(); addEventListener('resize', fitInfo); addEventListener('load', fitInfo);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitInfo);
  }

  // ---- an object's reveal (assets/reveal.js) in the hero's place: played once when its page opens, and when the row
  // brings it in; it ends on the object at rest ----
  let rv = null;
  function revealFor(q) {
    if (rv) { rv.el.remove(); rv = null; img.style.visibility = ''; }
    if (!q.reveal || !window.PhReveal) return;
    rv = window.PhReveal(piece, q.reveal); img.style.visibility = 'hidden';
    const me = rv, go = () => { if (rv !== me) return; if (me.ready()) me.play(); else requestAnimationFrame(go); }; go();
  }
  if (window.PhReveal) revealFor(P); else addEventListener('load', () => revealFor(P), { once: true });
  if (location.hash === '#closeups') open();
  if (EMB) {   // the piece layer's side of the one-page catalogue (nogl_room.js)
    const hero = () => ({ id: P.id, rect: img.getBoundingClientRect(), src: img.currentSrc || img.src, page: P.page, title: P.title });
    window.__pvHero = hero;
    window.__pvHeroVis = (v) => { img.style.visibility = v && !rv ? '' : 'hidden'; if (rv) rv.el.style.visibility = v ? '' : 'hidden'; };
    window.__pvSelect = (id) => select(id, false);
    window.__pvShow = (id, src) => { const q = byId(id); if (!q) return Promise.resolve(null);
      if (q.id !== P.id) { render(q); pos = ids.indexOf(id); layoutWheel(); }
      if (src && (img.currentSrc || img.src) !== src) { img.removeAttribute('srcset'); img.src = src; }   // the catalogue cell's own file: one picture from the cell to here
      scrollTo(0, 0); zoom.hidden = true; document.body.style.overflow = '';
      return new Promise((res) => { const done = () => requestAnimationFrame(() => res(hero()));
        if (img.complete && img.naturalWidth) (img.decode ? img.decode() : Promise.resolve()).then(done, done);
        else img.addEventListener('load', () => (img.decode ? img.decode() : Promise.resolve()).then(done, done), { once: true }); }); };
    const b = document.createElement('base'); b.target = '_top'; document.head.appendChild(b);   // the cart, register: the whole window
    document.addEventListener('click', (e) => { const a = e.target.closest('a[href]'); if (!a) return; const h = a.getAttribute('href');
      if (/^index\.html#catalogue/.test(h)) { e.preventDefault(); e.stopPropagation(); parent.__pvHost.back(); }
      else if (h === 'index.html') { e.preventDefault(); e.stopPropagation(); parent.__pvHost.home(); } }, true);
    parent.__pvHost.ready();
  }
})();
