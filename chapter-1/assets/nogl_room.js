// Preview copy only (the real site's room is assets/room.js, WebGL): the same room as images. The intro is the real
// intro captured on its capture clock at 24 fps, the heroes are their turntable frames (every 5 degrees), the walls and
// the floor are the real room rendered with no garment. No canvas, no three.js, no fetch, no modules.
// Smooth on an iPhone (David, 9 Nov: everything that moves must move smoothly): every frame is decoded (img.decode)
// before it is shown, by a few <img> layers per sequence; a frame on screen is only ever faded (opacity) and placed
// (transform), its src never changes while it shows, and nothing is laid out while anything moves. Between two frames
// the two are crossfaded by the clock (plus-lighter: an exact blend), so a 24 fps flipbook plays at the screen's rate.
(function () {
  'use strict';
  const PV = window.__PV, IMG = PV.img, PIECES = window.PIECES, CATALOGUE = window.CATALOGUE;
  // each kind (desk: a computer, phone) comes in its own files (index.html's loader): pv_room_<kind>.js now, the intro's
  // parts and the turntables after. KD(kind): that kind's frame and room, once its file is in; FR(c): a turntable's frames
  const KS = {}, KIND0 = window.__PVKIND || (PV.kinds.desk ? 'desk' : 'phone');
  const KD = (kind) => KS[kind] || (window['__PVR_' + kind] && PV.kinds[kind] ? (KS[kind] = Object.assign({}, PV.kinds[kind].K, window['__PVR_' + kind])) : null);
  let KIND = KIND0;
  const FR = (c) => window['__PVS_' + KIND + '_' + c] || null;
  window.__pvArrived = () => { dirty = true; queueBlobs(); };
  function queueBlobs() { const kd = KD(KIND);
    if (kd) [...kd.shadow, ...kd.light].forEach(s => blobs(s.u));
    for (const p of PIECES) { const F = FR(p.caster); if (F) blobs(F); } }
  if (window.__pvLoad) window.__pvLoad(KIND0);
  PIECES.forEach(p => { p.src = IMG[p.img] || p.img; });
  CATALOGUE.forEach(p => { p.src = IMG[p.img] || p.img; });   // a cell's picture is its page's own hero file (build_line.py), so the opening is one picture
  // David, 9 Nov: "website is too laggy, 360 has probably a 2 second delay and noir transition to go to the bottom has
  // probably a 4 second delay": the turn starts on the gesture and takes 2 s; the opening hands off at once and settles by 2.4 s
  const GH = 1.95, PY = 1.62, TS0 = 0.05, TSD = 2.0, OPEN_T = 2.4, HAND = 0.45, GLIDE = 1.2, SEAM_D0 = 60, SEAM_D1 = 220;
  const INTRO_END = 8.0, BEATS = [1.2, 4.4, 5.8];   // the 8 s intro (c8bb5327; David: "The intro you made it so fucking long")
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const easeIO = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const easeIOs = (x) => easeIO(Math.min(1, Math.max(0, x)));
  const seamP = (deg) => { const u = Math.min(1, Math.max(0, (deg - SEAM_D0) / (SEAM_D1 - SEAM_D0))); return u * u * (3 - 2 * u); };
  const spinDegU = (u) => 360 * (0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u))));
  const $ = (id) => document.getElementById(id);
  const stage = $('stage'), uiEl = $('ui'), nmEl = $('nm'), subEl = $('sub'), LOGO = $('logo'), CAT = $('cat');
  const specBox = $('specs'), white = $('white'), garBox = $('gar'), shadBox = $('shad'), bgBox = $('bgs');
  const introEl = $('introL');
  try { if (!(window.CSS && CSS.supports && CSS.supports('mix-blend-mode', 'plus-lighter'))) document.documentElement.classList.add('noplus'); } catch (e) {}
  // the lettering, inlined the way the room inlines it (David's SVG, never typed)
  const putLettering = (svg) => { LOGO.innerHTML = svg.replace(/<!--[\s\S]*?-->/g, '').replace(/fill="#E2DDD2"/g, 'fill="currentColor"').replace(/\s(width|height)="[^"]*"/, '').replace(/\s(width|height)="[^"]*"/, ''); };
  if (/\.svg$/.test(PV.lettering)) fetch(PV.lettering).then(r => r.text()).then(putLettering); else putLettering(PV.lettering);   // the site fetches the file and inlines it (David's SVG, never typed)
  // a style written only when it changes (no style work for what stays)
  const css = (el, k, v) => { const c = el.__css || (el.__css = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };
  const op = (el, a) => css(el, 'opacity', a <= 0.0005 ? '0' : a >= 0.9995 ? '1' : a.toFixed(4));
  const decode = (el) => (el.decode ? el.decode() : Promise.resolve()).catch(() => {});
  // the frames come as data: URIs inside their files; giving an <img> a long data: URI makes the main thread parse it at
  // that moment (and leaves big strings for the garbage collector), which showed up mid-turn. So every frame is turned
  // into a blob: URL ahead of time, a few at a time while the page is idle; a layer then takes the short blob: URL.
  const BLOB = new Map(), blobQ = [];
  const src = (u) => BLOB.get(u) || u;
  function toBlob(u) { const i = u.indexOf(','), bin = atob(u.slice(i + 1)), n = bin.length, a = new Uint8Array(n);
    for (let k = 0; k < n; k++) a[k] = bin.charCodeAt(k);
    BLOB.set(u, URL.createObjectURL(new Blob([a], { type: u.slice(5, u.indexOf(';')) }))); }
  const idle = window.requestIdleCallback || ((f) => setTimeout(() => f({ timeRemaining: () => 8 }), 30));
  // each entry: [array, index]; the array's data: URI is replaced by its blob: URL, so the big string can go (a smaller
  // heap: the garbage collector's pauses stay short)
  function blobWork(dl) { while (blobQ.length && dl.timeRemaining() > 2) { const [A, i] = blobQ.shift(), u = A[i];
      if (typeof u === 'string' && u.startsWith('data:')) { if (!BLOB.has(u)) toBlob(u); if (!usedRaw.has(u)) A[i] = BLOB.get(u); } }
    if (blobQ.length) idle(blobWork, { timeout: 200 }); else blobWork.on = false; }
  const usedRaw = new Set();   // a data: URI a layer already holds as its key stays (its layer keeps matching it)
  function blobs(A) { for (let i = 0; i < A.length; i++) if (typeof A[i] === 'string' && A[i].startsWith('data:')) blobQ.push([A, i]);
    if (!blobWork.on) { blobWork.on = true; idle(blobWork, { timeout: 200 }); } }

  // ---- frames without a hitch: a pool of <img> layers; want() gives a frame a layer and decodes it in the background,
  // show() fades in the frames asked for that are decoded (a frame not decoded yet gives its share to the others; if none
  // is, the screen stays as it is) and fades out the rest. A layer on screen is never given a new frame. ----
  // opaque (the intro): its frames cover the whole frame, so a crossfade needs no blend group: the first frame at full
  // strength below, the next over it at its share (an exact blend for opaque images, and no full-frame render surface to
  // composite on every frame, which plus-lighter needs)
  function Pool(box, n, cls, layers, opaque) {   // layers: each frame on its own layer (the big frames: the garment, the intro)
    const L = []; let clk = 0;
    for (let i = 0; i < n; i++) { const el = document.createElement('img'); el.alt = ''; el.decoding = 'async'; if (cls) el.className = cls;
      el.style.cssText = 'left:0;top:0;opacity:0;transform-origin:0 0' + (layers ? ';will-change:opacity,transform' : ''); box.appendChild(el);
      L.push({ el, uri: null, ready: false, used: 0, on: false, bw: 0, bh: 0 }); }
    function want(uri, w, h) {
      if (!uri) return null;
      for (const s of L) if (s.uri === uri) { s.used = ++clk; return s; }
      let v = null; for (const s of L) if (!s.on && (!v || s.used < v.used)) v = s;
      if (!v) return null;
      v.uri = uri; v.ready = false; v.used = ++clk;
      if (w && (Math.abs(v.bw - w) > 0.5 || Math.abs(v.bh - h) > 0.5)) { v.bw = w; v.bh = h; v.el.style.width = w + 'px'; v.el.style.height = h + 'px'; }
      v.el.src = src(uri); if (uri.startsWith('data:')) usedRaw.add(uri); const me = v; decode(v.el).then(() => { if (me.uri === uri) me.ready = true; });
      return v;
    }
    const P = { want, show, hide, ready: (uri) => L.some(s => s.uri === uri && s.ready), miss: 0 };
    function show(list) {   // [{ u: uri, a: weight, r: [x, y, w, h] in the stage's px }]
      let tot = 0, rt = 0; const got = []; P.miss = 0;
      for (const x of list) { if (x.a <= 0.0005) continue; tot += x.a; const s = want(x.u, x.r[2], x.r[3]); if (s && s.ready) { got.push([s, x]); rt += x.a; } else P.miss++; }
      if (!(intro && box !== introEl)) { MISS += P.miss; MISSBY[box.id] = (MISSBY[box.id] || 0) + P.miss; }   // under the intro the room is not on screen yet
      if (!got.length || rt <= 0) return tot <= 0 ? (hide(), true) : false;
      for (const s of L) s.on = false;
      let acc = 0, z = 0;
      for (const [s, x] of got) { s.on = true; const w = x.a * tot / rt;
        if (opaque) { acc += w; op(s.el, acc > 0 ? w / acc : 0); css(s.el, 'zIndex', String(++z)); } else op(s.el, w);
        css(s.el, 'transform', `translate(${x.r[0].toFixed(2)}px,${x.r[1].toFixed(2)}px) scale(${(x.r[2] / s.bw).toFixed(5)},${(x.r[3] / s.bh).toFixed(5)})`); }
      for (const s of L) if (!s.on) op(s.el, 0);
      return true;
    }
    function hide() { for (const s of L) { s.on = false; op(s.el, 0); } P.miss = 0; }
    POOLS.push(P); return P;
  }
  // a check's window: how many frames asked for were not decoded in time (each one a held frame on screen)
  let MISS = 0, STALL = 0; const POOLS = [], MISSBY = {}; window.__stall = () => STALL; window.__missBy = () => MISSBY; window.__misses = () => MISS; window.__pending = () => POOLS.reduce((a, p) => a + p.miss, 0);

  // ---- the frame: the captured room's frame, scaled to cover the window (desktop 1280x720, phone 390x844) ----
  let K = null, phone = false, S = 1, offX = 0, offY = 0, dirty = true;
  const wx = (X) => K.ox + K.k * X, wy = (Y) => K.oy - K.k * Y;
  const rectOf = (cx, cy, w, h) => [wx(cx - w / 2), wy(cy + h / 2), K.k * w, K.k * h];
  function place(el, cx, cy, w, h) { const r = rectOf(cx, cy, w, h);
    el.style.left = r[0].toFixed(2) + 'px'; el.style.top = r[1].toFixed(2) + 'px'; el.style.width = r[2].toFixed(2) + 'px'; el.style.height = r[3].toFixed(2) + 'px'; }
  const PH_CLEAR = 120, PH_NAME_MIN = 72;
  let SAFE = null;
  function visibleH() {   // the visible viewport, less the bottom safe area (as room.js)
    if (!SAFE) { SAFE = document.createElement('div'); SAFE.style.cssText = 'position:fixed;left:0;bottom:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)'; document.body.appendChild(SAFE); }
    let h = innerHeight; if (window.visualViewport) h = Math.min(h, visualViewport.height);
    return h - (parseFloat(getComputedStyle(SAFE).paddingBottom) || 0);
  }
  // the room's still layers, one <img> each (decoded once, then only faded): the three walls, the three pieces' carved
  // specs, the three pieces at rest
  const bgEl = [], specEl = [], restEl = [];
  let stillsFor = null;
  function stills() {
    if (stillsFor === K) return;
    stillsFor = K; [bgEl, specEl, restEl].forEach(A => { A.forEach(e => e.remove()); A.length = 0; });
    for (let i = 0; i < PIECES.length; i++) {
      const b = document.createElement('img'); b.alt = ''; b.src = K.bg[i]; b.style.opacity = i ? '0' : '1'; bgBox.appendChild(b); bgEl.push(b); decode(b);
      const s = document.createElement('img'); s.alt = ''; s.src = K.specs[i].uri; s.style.opacity = '0'; specBox.appendChild(s); specEl.push(s); decode(s);
      const sp = K.specs[i]; Object.assign(s.style, { left: sp.x + 'px', top: sp.y + 'px', width: sp.w + 'px', height: sp.h + 'px' });
      const g = document.createElement('img'); g.className = 'pl'; g.alt = ''; g.src = PIECES[i].src; g.style.opacity = '0'; garBox.appendChild(g); restEl.push(g); decode(g);
    }
  }
  function layout() {
    const vw = innerWidth, vh = innerHeight, want = (vw / vh < 1 && PV.kinds.phone) || !PV.kinds.desk ? 'phone' : 'desk';
    if (want !== KIND) { if (KD(want)) { KIND = want; window.__pvLoad && window.__pvLoad(want); } else if (window.__pvLoad) window.__pvLoad(want); }   // the other kind's files come in after a resize; until then this one stays
    if (!KD(KIND)) KIND = KD('desk') ? 'desk' : 'phone';
    phone = KIND === 'phone';
    document.body.classList.toggle('phone', phone);
    if (K !== KD(KIND)) { K = KD(KIND); stillsFor = null; warmTurn.all = false; }
    const FW = K.frame[0], FH = K.frame[1];
    // desktop: the preview's 16:9 frame scaled to cover the window, centred (the room's layout). Phone: the captured
    // portrait frame, its piece's centre at 56% of the window's height (the room's PHONE_CY), so a short window
    // (a browser's toolbars) loses wall above and floor below, never the buttons under the specs
    if (!phone) { S = Math.max(vw / FW, vh / FH); offY = (vh - FH * S) * 0.5; }
    else {   // the room's phone fit (room.js phoneFit): the frame is captured at its tightest (390x694, the room scaled to
      // K.pscale) and scaled up as far as the room itself would be, while the name stays clear of the logo and ADD TO CART,
      // PRE-ORDER and the size row under them end 120 px above the visible bottom. The name and buttons keep their own size.
      const vis = visibleH(), nF = parseFloat(K.nameTop), bF = parseFloat(K.btnTop) - 100, nH = 52, BLK = 60 + 38;   // bF: where the buttons sat before the step (room.js fits against it; the step's rows lie under it, as David placed them)
      const Sc = Math.max(vw / FW, vh / FH), St = (vw / FW) / (K.pscale || 1), Smax = (vis - PH_CLEAR - PH_NAME_MIN - BLK - nH) / (bF - nF - nH);
      S = Math.max(Sc, Math.min(St, Smax));
      if (vw >= vh) S = vh / FH;   // the phone frame on a wide window (the desk's files not in yet): whole, centred
      offY = (vh - FH * S) * 0.56;
      const blockBot = () => offY + bF * S + BLK, nameTop = () => offY + (nF + nH) * S - nH;
      if (blockBot() > vis - PH_CLEAR) offY -= blockBot() - (vis - PH_CLEAR);
      if (nameTop() < PH_NAME_MIN) offY += PH_NAME_MIN - nameTop();
      offY = Math.min(0, Math.max(vh - FH * S, offY));
    }
    offX = (vw - FW * S) / 2;
    stage.style.width = FW + 'px'; stage.style.height = FH + 'px';
    stage.style.transform = `translate(${offX}px, ${offY}px) scale(${S})`;
    if (!phone && (vw >= 1600 || offX >= -1)) { LOGO.style.left = (offX + 136 * S).toFixed(1) + 'px'; LOGO.style.top = (offY + 16 * S).toFixed(1) + 'px'; }
    else { LOGO.style.left = ''; LOGO.style.top = ''; }
    const nameEl = $('name');
    nameEl.style.top = K.nameTop;   // where the room put it, over the frame; on a phone at its own size (bottom kept), as the buttons (top kept)
    $('btn').style.top = phone ? K.btnTop : '';
    nameEl.style.transformOrigin = '50% 100%'; $('btn').style.transformOrigin = '50% 0';
    nameEl.style.transform = $('btn').style.transform = phone ? `scale(${(1 / S).toFixed(4)})` : '';
    stills();
    PIECES.forEach((pc, i) => place(restEl[i], 0, PY, GH * pc.aspect, GH));
    catRects = null; dirty = true;
  }

  // ---- the room's pieces ----
  const nShad = Math.max(...Object.keys(PV.kinds).map(k => { const R = window['__PVR_' + k]; return R ? [...R.shadow, ...R.light].reduce((a, s) => a + s.u.length, 0) : 0; }));
  const AHEAD = 12, gPool = Pool(garBox, 4 * AHEAD + 12, 'pl', true), sPool = Pool(shadBox, Math.max(180, nShad + 12), 'pl');   // every angle of every piece's turn and of the light kept decoded
  function setBg(i, j, m) {   // the walls are opaque: i at full strength below, j over it at m (an exact crossfade, no blend group)
    bgEl.forEach((b, q) => { op(b, q === i ? 1 : q === j ? m : 0); css(b, 'zIndex', q === j && j !== i ? '2' : '1'); }); }
  function setSpecs(i, a) { specEl.forEach((s, q) => op(s, q === i ? a : 0)); }
  function setName(i) { const pc = PIECES[i];
    if (nmEl.textContent !== pc.name) { nmEl.textContent = pc.name; subEl.innerHTML = pc.sub; nmEl.classList.toggle('long', pc.name.length > 10); }
    if (stage.dataset.piece !== pc.id) { stage.dataset.piece = pc.id; document.querySelectorAll('#btn a').forEach(a => { a.dataset.piece = pc.id;
      // David: "Add to cart and next to it the price, bottom you leave presale all centered"
      a.textContent = a.dataset.act === 'presale' ? 'PRE-ORDER · ' + (pc.presale || pc.price) : 'ADD TO CART · ' + pc.price;
      // no pre-order price of its own (presale is the price): one line, the pre-order (the orchestrator, 11 Nov)
      if (a.dataset.act === 'cart') a.style.display = pc.presale && pc.presale !== pc.price ? '' : 'none'; }); } }   // the piece's own prices (capture.html PIECES)
  function showRest(i, a) { restEl.forEach((g, q) => op(g, q === i ? (a === undefined ? 1 : a) : 0)); }
  // the turn's first frames, decoded while the piece stands, for either way it may turn
  function warmTurn(i) { const F = FR(PIECES[i].caster), ft = PV.fit[PIECES[i].caster];   // a piece with no turntable has no fit
    if (F && ft) { const r = rectOf(ft.x, ft.y, ft.w, ft.h); const N = F.length; for (let q = 0; q < AHEAD; q++) { gPool.want(F[q], r[2], r[3]); gPool.want(F[(N - 1 - q) % N], r[2], r[3]); } }   // the first 60 degrees either way
    if (i === PIECES.length - 1) piecePage();
    if (i === PIECES.length - 1 && !catRects && !cat) { measureCat(); if (!CAT.__clipped) { CAT.__clipped = true; clipShadows(); } }   // the last piece: the catalogue measured while it stands, not on the opening's first frame
    if (!warmTurn.all) { warmTurn.all = true; K.shadow.forEach(sh => sh.u.forEach(u => sPool.want(u, sh.w, sh.h))); K.light.forEach(L => L.u.forEach(u => sPool.want(u, L.w, L.h))); } }
  // the turn: the cut-out at rest, the turntable frames while it turns; between 60 and 220 degrees the soft fade C, both
  // frames on one box moving from the old outline to the new (the room's showSpin). Between two turntable frames the two
  // are crossfaded by the angle (David: "Yeah I do", to a smoother turn): the garment layers add (plus-lighter), so
  // (1 - f) of one and f of the next is an exact blend, never a flicker
  // the turntable frames a turn shows at deg (two neighbouring frames crossfaded by the angle; in the soft fade C both
  // pieces' on one box), or null while the piece faces front or its turntable is not in
  function spinList(i, j, deg, dir, s) {
    if (!(deg >= 0.01 && deg <= 359.99)) return null;
    const ci = PIECES[i].caster, cj = PIECES[j].caster, FI = FR(ci), FJ = FR(cj); if (!FI || !FJ) return null;
    const a = (((dir * deg) % 360) + 360) % 360, N = FI.length, x = a / (360 / N), k = Math.floor(x) % N, k2 = (k + 1) % N, f = x - Math.floor(x), L = [];
    const on = (F, ft, w) => { const r = ft.r || rectOf(ft.x, ft.y, ft.w, ft.h); L.push({ u: F[k], a: w * (1 - f), r }, { u: F[k2], a: w * f, r }); };
    if (s > 0 && s < 1) {
      const fo = PV.fit[ci], fn = PV.fit[cj], bx = [0, 1, 2, 3].map(q => fo.box[q] + (fn.box[q] - fo.box[q]) * s);
      const onto = (f) => { const ph = (bx[2] - bx[3]) / (f.B[3] - f.B[2]), pw = ph * f.B[4]; return { r: rectOf(bx[0] - f.B[0] * pw + pw / 2, bx[2] + f.B[2] * ph - ph / 2, pw, ph) }; };
      on(FI, onto(fo), 1 - s); on(FJ, onto(fn), s);
    } else on(s >= 1 ? FJ : FI, PV.fit[s >= 1 ? cj : ci], 1);
    return L;
  }
  // a turn's clock goes on only when the frames it is about to show are decoded (David: every frame decoded before it shows):
  // a machine that decodes fast enough never waits; a slow one turns a little slower instead of holding a frame
  function spinReadyAt(r, t) {
    const u = Math.min(1, Math.max(0, (t - TS0) / TSD)), deg = spinDegU(u), L = spinList(r.from, r.to, deg, r.dir, seamP(deg));
    if (!L) return true; let ok = true;
    for (const x of L) if (x.a > 0.0005 && !gPool.ready(x.u)) { ok = false; gPool.want(x.u, x.r[2], x.r[3]); }
    return ok;
  }
  function showSpin(i, j, deg, dir, s) {
    if (!(deg >= 0.01 && deg <= 359.99)) { gPool.hide(); return showRest(deg >= 270 ? j : i); }
    const a = (((dir * deg) % 360) + 360) % 360, ci = PIECES[i].caster, cj = PIECES[j].caster;
    const FI = FR(ci), FJ = FR(cj);
    if (!FI || !FJ) { gPool.hide(); return showRest(deg >= 270 ? j : i); }   // its turntable not in yet: the piece stands
    const N = FI.length, x = a / (360 / N), k = Math.floor(x) % N, k2 = (k + 1) % N, f = x - Math.floor(x);
    const L = spinList(i, j, deg, dir, s);
    const shown = gPool.show(L);
    showRest(i, shown ? 0 : 1);   // a frame not decoded yet: the piece stands until it is (never a blank)
    // the frames ahead, the way it turns, for both pieces
    const r = rectOf(PV.fit[ci].x, PV.fit[ci].y, PV.fit[ci].w, PV.fit[ci].h);
    for (let q = 1; q <= AHEAD; q++) { const kk = ((dir > 0 ? k2 + q : k - q) % N + N) % N; gPool.want(FI[kk], r[2], r[3]); if (deg > 20) gPool.want(FJ[kk], r[2], r[3]); }   // 60 degrees ahead, for both pieces
  }
  // the garment's cast shadow, as the real room casts it at each angle of the turn (captured every few degrees, laid
  // over the shadowless room with multiply; two angles crossfaded by the angle): it turns with the piece and crossfades
  // with the soft fade C. All the shadow layers add (plus-lighter) inside one group that multiplies the room below.
  function shadowAt(L, i, a, w) { if (w <= 0) return; const sh = K.shadow[i], n = sh.u.length, x = ((((a % 360) + 360) % 360) / (360 / n)), k = Math.floor(x) % n, f = x - Math.floor(x), r = [sh.x, sh.y, sh.w, sh.h];
    L.push({ u: sh.u[k], a: w * (1 - f), r }, { u: sh.u[(k + 1) % n], a: w * f, r }); }
  function drawRest(i) { setBg(i, i, 0); gPool.hide(); showRest(i); const L = []; restShadow(L, i, 1); sPool.show(L); setSpecs(i, 1); op(white, 0); op(uiEl, intro ? 0 : 1); setName(i); catalogue(null, 0); warmTurn(i); }   // under the intro the name and buttons wait
  function drawSwitch(r, t) {
    const u = Math.min(1, Math.max(0, (t - TS0) / TSD)), deg = spinDegU(u), s = seamP(deg), spinI = deg < 270 ? r.from : r.to;
    setBg(r.from, r.to, easeIO(u));   // the pins move from one design to the next over the turn, the real shadow with them
    showSpin(r.from, r.to, deg, r.dir, s);
    // the light where the mouse had it hands over to the turn's own shadow in the first 0.35 s (both are the real room's)
    const a = r.dir * deg, L = [], wl = r.az0 ? 1 - smooth(0, 0.35, t) : 0;
    if (wl > 0) lightAt(L, r.from, r.az0 * wl, wl);
    shadowAt(L, r.from, a, (1 - s) * (1 - wl)); shadowAt(L, r.to, a, s * (1 - wl)); sPool.show(L);
    const sh = K.shadow[r.from], n = sh.u.length, kn = Math.round((((a + r.dir * 30) % 360) + 360) % 360 / (360 / n)) % n;   // the shadow's angles ahead
    sPool.want(sh.u[kn], sh.w, sh.h); if (s > 0 || deg > 30) { const sj = K.shadow[r.to]; sPool.want(sj.u[kn % sj.u.length], sj.w, sj.h); }
    const cut = t < TS0 + TSD * 2 / 3 ? 1 - smooth(TS0, TS0 + TSD / 2, t) : smooth(TS0 + TSD * 2 / 3, TS0 + TSD, t);
    setSpecs(spinI, cut); op(uiEl, cut); op(white, 0); setName(spinI);
  }
  // the room opening into the catalogue (after the last hero), and back
  function drawOpen(r, t) {
    setBg(cur, cur, 0); gPool.hide(); showRest(cur); const L = [], wl = r.az0 ? 1 - smooth(0, 0.35, r.reverse ? OPEN_T - t : t) : 0;
    if (wl > 0) lightAt(L, cur, r.az0 * wl, wl); shadowAt(L, cur, 0, 1 - wl); sPool.show(L);
    op(white, Math.pow(smooth(0.05, 1.3, t), 1.6));   // as the room (b27637f1)
    setSpecs(cur, 1 - smooth(0, HAND + 0.3, t));
    op(uiEl, 1 - smooth(0, 0.3, t));
    catalogue(r, t);
  }
  // the catalogue's cells measured once (with no transform), not on every frame: the opening then only moves them
  let catRects = null, catScroll = 0;
  function measureCat() {
    const cells = [...CAT.querySelectorAll('.ci')];
    cells.forEach(ci => { const ph = ci.querySelector('.ph'); ph.style.transform = 'none'; ph.__css = {}; });
    catScroll = CAT.scrollTop; catRects = cells.map(ci => { const ph = ci.querySelector('.ph'); return { ci, ph, rest: ph.querySelector('.rest'), cap: [...ci.querySelectorAll('.nm, .pr')], rc: ph.getBoundingClientRect(), id: ci.dataset.id }; });
    catRects.forEach(c => { c.ph.style.transformOrigin = '0 0'; c.ph.style.willChange = 'transform'; });
  }
  function catalogue(r, t) {
    if (!r || !r.open) { const pre = cur === PIECES.length - 1 && !intro; css(CAT, 'visibility', pre ? 'visible' : 'hidden'); css(CAT, 'opacity', pre ? '0.002' : '0');   /* 0.002: painted (its images decoded), not seen */ css(CAT, 'willChange', pre ? 'opacity' : 'auto'); css(CAT, 'pointerEvents', 'none'); css(garBox, 'visibility', ''); return; }
    if (!CAT.__clipped) { CAT.__clipped = true; clipShadows(); }
    const on = t >= HAND; css(CAT, 'visibility', 'visible'); css(CAT, 'opacity', on ? '1' : '0.002'); css(CAT, 'willChange', 'opacity'); css(CAT, 'transform', 'none');
    css(CAT, 'pointerEvents', t >= OPEN_T - 0.05 ? 'auto' : 'none');
    css(garBox, 'visibility', on ? 'hidden' : '');
    if (!catRects) measureCat();
    const hero = PIECES[cur].id, hw = GH * PIECES[cur].aspect / 2;
    const rx = offX + S * wx(-hw), ry = offY + S * wy(PY + GH / 2), rw = S * K.k * 2 * hw, sc0 = CAT.scrollTop - catScroll;
    let k = 0;
    for (const c of catRects) {
      const rc = { left: c.rc.left, top: c.rc.top - sc0, width: c.rc.width };
      if (c.id === hero) {
        const g = easeIOs((t - HAND) / GLIDE), s0 = rw / rc.width;
        const dx = (rx - rc.left) * (1 - g), dy = (ry - rc.top) * (1 - g), sc = s0 + (1 - s0) * g;
        css(c.ph, 'transform', g >= 1 ? 'none' : `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${sc.toFixed(5)})`);
        if (c.rest) op(c.rest, smooth(HAND + GLIDE - 0.3, HAND + GLIDE, t));   // its cell's shadow only once it has landed (David: "Noir when going down carries a dark shadow with it")
      } else {
        const g = easeIOs((t - HAND - 0.15 - Math.min(0.08, 0.5 / catRects.length) * k++) / 1.1);   // the stagger fits the opening, however many cells (the line: 24)
        css(c.ph, 'transform', g >= 1 ? 'none' : `translateY(${((1 - g) * (innerHeight - rc.top + 40)).toFixed(2)}px)`); if (c.rest) op(c.rest, 1);
      }
      const ca = smooth(1.8, 2.3, t); c.cap.forEach(e => op(e, ca));
    }
    const ha = smooth(1.8, 2.3, t); CAT.querySelectorAll('.cgh').forEach(e => op(e, ha));
  }
  // the catalogue by category (David, 10 Nov night: Knitwear, Outerwear, Bags, Accessories). Only the pieces on the site now:
  // every one of them is knitwear (the hoodies, the Noir crewneck, the tee); a category shows once it has a piece
  // FOCUS (12 Nov, README 'Two acts'): the catalogue in two acts, not one mixed grid. The house first (leather, silk, gold;
  // the Veil Coat first in it), then, after a break, the picture (the knits: what plays on the screen). The act names
  // are working labels; naming is David's. The pendant has no tile (13 Nov).
  const HOUSE = ['veil_coat', 'muse_bomber', 'opera_gloves', 'silk_slip', 'matinee', 'the_reel', 'po_tophandle', 'disc_belt', 'card_holder'];
  const PICTURE = ['muse_allover', 'cantilena', 'quiet_black', 'quiet_black_trousers', 'silk_scarf', 'sunglasses'];
  const ACTS = HOUSE.concat(PICTURE), CATS = ['THE HOUSE', 'THE PICTURE'], catOf = (p) => PICTURE.includes(p.id) ? CATS[1] : CATS[0];
  // a piece shows only when it is live (its Blender build approved and its quote in: capture.html's CATALOGUE, live: true)
  for (let i = CATALOGUE.length - 1; i >= 0; i--) if (CATALOGUE[i].live === false || CATALOGUE[i].id === 'pendant') CATALOGUE.splice(i, 1);
  const rank = (p) => { const i = ACTS.indexOf(p.id); return i < 0 ? ACTS.length : i; };
  CATALOGUE.sort((a, b) => rank(a) - rank(b) || (a.live === 'soon') - (b.live === 'soon'));
  { const sh = PV.shadow;
    let lastCat = null;
    CAT.querySelector('.grid').innerHTML = CATALOGUE.map(p => { const q = sh.places[p.id], c = catOf(p), head = c !== lastCat ? `<h2 class="cgh${lastCat ? ' next act2' : ''}">${c}</h2>` : ''; lastCat = c;
      if (p.live === 'soon') return head + `<div class="ci soon" data-id="${p.id}"><div class="ph" style="aspect-ratio:5"></div><div class="nm${p.name.length > 20 ? ' long' : ''}">${p.name}</div><div class="pr">SOON</div></div>`;   // no approved render yet (approved.json): its name and SOON
      return head +
      `<a class="ci" data-id="${p.id}" href="${p.page}"><div class="ph" style="aspect-ratio:${p.aspect};--sa:${Math.sqrt(p.aspect).toFixed(4)}">` +
        (q ? `<div class="rest" data-src="${(sh.images && sh.images[p.id] || sh).alpha}" data-q="${q.left},${q.top},${q.width},${q.height}"></div>` : '') +   // a line piece's cut carries its own shadow
        `<img class="g" src="${p.src}" alt="${p.name}"></div><div class="nm${p.name.length > 20 ? ' long' : ''}">${p.name}</div><div class="ds">${p.plain || ''}</div><div class="pr">${p.price || '—'}</div></a>`; }).join(''); }
  // the shadows bleed past their cells as in the real catalogue, but each is cut where the screen ends, so nothing
  // reaches past the window's edge (an iOS frame pans sideways to anything that does)
  // an object's reveal (assets/reveal.js, PV.reveal) plays once in its cell the first time the cell is well in view
  if (window.PhReveal && PV.reveal) {
    const io = new IntersectionObserver((es) => es.forEach(e => { if (!e.isIntersecting || !cat) return; io.unobserve(e.target);
      const id = e.target.dataset.id, ph = e.target.querySelector('.ph'), g = ph.querySelector('.g'), r = window.PhReveal(ph, PV.reveal[id]);
      r.el.style.zIndex = '1'; g.style.visibility = 'hidden';
      const go = () => r.ready() ? r.play() : requestAnimationFrame(go); go(); }), { threshold: 0.5 });
    CAT.querySelectorAll('.ci').forEach(ci => { if (PV.reveal[ci.dataset.id]) io.observe(ci); });
  }
  CAT.querySelectorAll('.rest').forEach(r => { r.style.backgroundImage = `url("${IMG[r.dataset.src]}")`; r.style.backgroundRepeat = 'no-repeat'; });
  function clipShadows() {
    const W = document.documentElement.clientWidth || innerWidth;
    CAT.querySelectorAll('.ci').forEach(ci => { const ph = ci.querySelector('.ph'), r = ph.querySelector('.rest'); if (!r) return; const q = r.dataset.q.split(',').map(Number);
      const t = ph.style.transform; ph.style.transform = 'none'; const b = ph.getBoundingClientRect(); ph.style.transform = t;
      const iw = b.width * q[2] / 100, ih = b.height * q[3] / 100, il = b.left + b.width * q[0] / 100;
      const L = Math.max(il, 0), R = Math.min(il + iw, W);
      r.style.left = (L - b.left) + 'px'; r.style.width = Math.max(0, R - L) + 'px'; r.style.top = q[1] + '%'; r.style.height = q[3] + '%';
      r.style.backgroundSize = iw + 'px ' + ih + 'px'; r.style.backgroundPosition = (il - L) + 'px 0'; });
  }
  addEventListener('resize', clipShadows);
  CAT.addEventListener('scroll', () => { LOGO.style.opacity = String(1 - smooth(0, 90, CAT.scrollTop)); LOGO.style.pointerEvents = CAT.scrollTop > 60 ? 'none' : ''; }, { passive: true });


  // ---- the intro: the real one, frame by frame (24 fps), each crossfading into the next by the clock ----
  // the kind's intro, in parts (pv_intro_<kind>_<n>.js): { u: the frames, t: each one's time (s) }. A frame the eye could
  // not tell from the blend of its neighbours is not stored, so a slow fade is a straight blend between two keys at the
  // screen's rate, never a step. The desk's are 2560 wide (the 1280x720 frame at 2x: the carved lines as sharp as a still).
  const IKIND = KIND0;
  const IK = () => { if (IK.v) return IK.v; const n = PV.kinds[IKIND].introParts, P = [];
    for (let i = 0; i < n; i++) { const p = window['__PVI_' + IKIND + '_' + i]; if (!p) return null; P.push(p); }
    return (IK.v = { u: [].concat(...P.map(p => p.u)), t: [].concat(...P.map(p => p.t)) }); };
  let intro = (window.INTRO_ON && !window.CAT_LINK && PV.kinds[IKIND].introParts > 0) ? { t0: null, k: 0 } : null;   // black until its frames are in
  const iPool = intro ? Pool(introEl, 7, '', true, true) : null;
  const clock = () => performance.now() / 1000;
  function introFrame(now) {
    const I = IK(); if (!I) return;   // every part in before the clock starts (it is dark until then)
    const KI = KD(IKIND), T = I.t, n = T.length, R = [0, 0, KI.frame[0], KI.frame[1]];
    if (intro.t0 === null) {   // the clock starts once its first frames are decoded (a cold load never skips its start)
      for (let j = 0; j < 4; j++) iPool.want(I.u[j], R[2], R[3]);
      if (!(iPool.ready(I.u[0]) && iPool.ready(I.u[1]))) return;
      intro.t0 = now;
    }
    // its clock goes on only when the two keys it is about to blend are decoded (a slow machine plays it a touch slower,
    // never a held frame); a skip (introNext) moves t0, which moves the clock with it
    if (intro.tv === undefined || intro.t0 !== intro.t0s) { intro.tv = now - intro.t0; intro.t0s = intro.t0; intro.tl = now; }
    const t1 = intro.tv + (now - intro.tl); intro.tl = now;
    { let kk = intro.k; while (kk < n - 1 && T[kk + 1] <= t1) kk++; const kk2 = Math.min(n - 1, kk + 1);
      if (iPool.ready(I.u[kk]) && iPool.ready(I.u[kk2])) intro.tv = t1; else { STALL += t1 - intro.tv; iPool.want(I.u[kk], R[2], R[3]); iPool.want(I.u[kk2], R[2], R[3]); } }
    const t = intro.tv;
    if (t >= INTRO_END) { endIntro(false); return; }
    let k = intro.k; while (k < n - 1 && T[k + 1] <= t) k++; intro.k = k;
    const k2 = Math.min(n - 1, k + 1), f = k2 > k ? Math.min(1, Math.max(0, (t - T[k]) / (T[k2] - T[k]))) : 0;
    iPool.show([{ u: I.u[k], a: 1 - f, r: R }, { u: I.u[k2], a: f, r: R }]);
    for (let j = 2; j <= 5; j++) if (k + j < n) iPool.want(I.u[k + j], R[2], R[3]);
  }
  function endIntro(skip) {
    if (!intro) return; intro = null;
    const hold = document.getElementById('hold'); if (hold) hold.remove();   // the black over the first-paint still: the walls are under the intro now
    introEl.style.transition = `opacity ${skip ? 0.5 : 0.35}s ease`; introEl.style.opacity = '0'; introEl.style.pointerEvents = 'none';
    setTimeout(() => { introEl.hidden = true; iPool.hide(); }, 600);
    LOGO.style.transition = 'opacity .5s ease'; LOGO.style.opacity = '1'; uiEl.style.opacity = '1'; uiEl.__css = {};
    cur = 0; run = null; dirty = true;
  }
  // no skipping in the dark (David: "Don't let anyone skip the intro while it's black, people will think it's wrong when
  // they didn't even wait on it. Only once it lights up."): a tap or a scroll does nothing until the studio lights are up
  const LIT = 6.0, introT = () => (intro && intro.t0 !== null) ? (intro.tv !== undefined ? intro.tv : clock() - intro.t0) : 0;
  introEl.addEventListener('click', (e) => { e.stopPropagation(); if (introT() < LIT) return; endIntro(true); });   // the tap only skips: it never opens the piece under it
  function introNext() { if (introT() < LIT) return; const t = introT(), nb = BEATS.find(b => b > t + 0.05);
    if (nb === undefined) endIntro(true); else { intro.t0 = clock() - nb; intro.tv = undefined; } }

  // ---- one gesture, one step ----
  let cur = 0, run = null, cat = false;
  // hold to move the light (David: "Can you add so you can play with the shadow by holding finger on the hoodie? Make it
  // so you can select the hoodie tho", then "Move the light"): a tap still opens the piece; a press held 300 ms picks up
  // the light, a sideways drag swings it about the piece (the real room's shadow at every 10 degrees, crossfaded), and on
  // release it eases back to its place (0.6 s). The piece stays facing front.
  const HOLD_MS = 300, HOLD_SLOP = 10, BACK_T = 0.6;   // the light swings up to 80 degrees either way
  let hold = null, press = null, holdTimer = 0, suppressClick = 0;
  function onHero(x, y) { const pc = PIECES[cur], hw = GH * pc.aspect / 2;
    return x > offX + S * wx(-hw) && x < offX + S * wx(hw) && y > offY + S * wy(PY + GH / 2) && y < offY + S * wy(PY - GH / 2); }
  function pressStart(x, y) { clearTimeout(holdTimer); press = null;
    if (run || intro || cat || hold || !onHero(x, y)) return;
    press = { x, y }; holdTimer = setTimeout(() => { if (press && !run && !cat) hold = { i: cur, a: 0, x0: press.x, back: null }; }, HOLD_MS);
    const L = K.light[cur], m = Math.round(-L.az0 / L.step); for (let q = m - 2; q <= m + 2; q++) if (q >= 0 && q < L.u.length) sPool.want(L.u[q], L.w, L.h); }
  const AZ_MAX = 80;
  function pressMove(x, y) {
    if (hold && !hold.back) { hold.a = Math.max(-AZ_MAX, Math.min(AZ_MAX, (x - hold.x0) / (phone ? innerWidth : 700) * 160)); return true; }
    if (press && Math.hypot(x - press.x, y - press.y) > HOLD_SLOP) { clearTimeout(holdTimer); press = null; }
    return !!hold; }
  function pressEnd() { clearTimeout(holdTimer); press = null;
    if (!hold) return false;
    if (!hold.back) hold.back = { t0: clock(), from: hold.a };
    suppressClick = performance.now() + 600; return true; }
  // the shadow with the light at az (degrees from its rest): the two captured angles either side, crossfaded by the angle
  function lightAt(out, i, az, wgt) { const L = K.light[i], n = L.u.length, f = (az - L.az0) / L.step, k = Math.max(0, Math.min(n - 1, Math.floor(f))),
      k2 = Math.min(n - 1, k + 1), w = Math.max(0, Math.min(1, f - k)), r = [L.x, L.y, L.w, L.h];
    out.push({ u: L.u[k], a: wgt * (1 - w), r }, { u: L.u[k2], a: wgt * w, r });
    for (const kk of [k - 1, k + 2]) if (kk >= 0 && kk < n) sPool.want(L.u[kk], L.w, L.h); }   // the angles either side, decoded ahead
  function setLight(i, az) { const L = []; lightAt(L, i, az, 1); sPool.show(L); }
  function restShadow(out, i, w) { if (hov.a) lightAt(out, i, hov.a, w); else shadowAt(out, i, 0, w); }
  function drawHold(az) { const i = hold.i; setBg(i, i, 0); gPool.hide(); showRest(i); setLight(i, az); }
  function step(dir) {
    if (intro) { if (dir > 0) introNext(); return; }
    if (run || hold) return;
    const az0 = hov.a; hov.a = 0; hov.back = null;   // the light as the mouse left it, handed to the run (then at rest until it ends)
    if (!cat && dir > 0 && cur === PIECES.length - 1) { run = { open: true, t0: clock(), az0 }; return; }
    if (cat) { if (dir < 0 && CAT.scrollTop <= 0) run = { open: true, reverse: true, t0: clock() }; return; }
    const next = cur + dir; if (next < 0 || next >= PIECES.length) { hov.a = az0; return; }
    run = { from: cur, to: next, dir, t0: clock(), az0 };
  }
  window.step = step;
  // as the real room (5da4ca19, David: "scrolling once skips the PÖ always"): input never steps while a switch runs,
  // and a wheel gesture that has stepped stays spent until the switch is over AND its stream has been quiet for 300 ms
  // (timed by the events' own timestamps), so a trackpad's momentum tail can never carry on to the next piece
  const WHEEL_QUIET = 300;
  let wAcc = 0, wLast = -1e9, wSpent = false;
  addEventListener('wheel', (e) => {
    if (cat && !run && (e.deltaY > 0 || CAT.scrollTop > 0)) return;   // the catalogue scrolls as a page
    e.preventDefault();
    if (hold) return;
    const now = e.timeStamp || performance.now(), gap = now - wLast, d = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * 800 : e.deltaY;
    wLast = now;
    if (wSpent) { if (run || gap < WHEEL_QUIET) return; wSpent = false; wAcc = 0; }   // still the same gesture (or its tail)
    if (run) return;
    if (gap > 180) wAcc = 0;
    wAcc += d;
    if (Math.abs(wAcc) >= 40) { step(Math.sign(wAcc)); wAcc = 0; wSpent = true; }
  }, { passive: false });
  // touch: one swipe = one step, decided at touchend; a touch that starts during a switch does nothing
  let ty = null, tyNow = null;
  addEventListener('touchstart', (e) => { pressStart(e.touches[0].clientX, e.touches[0].clientY); if (run) { ty = null; return; } ty = tyNow = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => { if (pressMove(e.touches[0].clientX, e.touches[0].clientY)) { e.preventDefault(); return; }
    if (ty === null) return; tyNow = e.touches[0].clientY;
    if (cat && !run && (ty > tyNow || CAT.scrollTop > 0)) return;   // the catalogue scrolls as a page
    e.preventDefault(); }, { passive: false });
  addEventListener('touchend', () => {
    if (pressEnd()) { ty = tyNow = null; return; }
    if (ty !== null && tyNow !== null && !run) { const dy = ty - tyNow;
      if (Math.abs(dy) > 44 && !(cat && (dy > 0 || CAT.scrollTop > 0))) step(Math.sign(dy)); }
    ty = tyNow = null; });
  addEventListener('touchcancel', () => { pressEnd(); ty = tyNow = null; });
  // On a computer (David, 10 Nov, "Follow the mouse (hover)"): the light, and with it the hoodie's shadow, follows the
  // mouse. Its x across the window swings the softbox from -HOV_AZ (left edge) through its rest (the middle) to +HOV_AZ,
  // the real room's swing (its mirrored right side and radius clamp are in the captures: placeK). It eases toward the
  // mouse (time constant HOV_TAU) so a flick never jumps frames, and back to rest over BACK_T once the mouse leaves the
  // window. A click on the piece opens it. Phones (and a mouse on a touch screen) keep press, hold and drag.
  const FINE = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  const HOV_AZ = 60, HOV_TAU = 0.12;
  const hov = { a: 0, x: null, back: null, t: 0 };
  const hovering = () => FINE && !phone && K && K.light && K.light[0].az0 <= -HOV_AZ;
  function hoverStep(now) {   // true when the light moved this frame
    const dt = Math.min(0.1, Math.max(0, now - (hov.t || now))); hov.t = now;
    if (!hovering() || intro || run || cat) return false;
    const a0 = hov.a;
    if (hov.x === null) {   // the mouse has left: back to rest, eased out, over BACK_T
      if (!hov.a) return false;
      if (!hov.back) hov.back = { t0: now, from: hov.a };
      const u = Math.min(1, (now - hov.back.t0) / BACK_T); hov.a = hov.back.from * (1 - (1 - Math.pow(1 - u, 3))); if (u >= 1) { hov.a = 0; hov.back = null; }
    } else {
      hov.back = null; const tgt = Math.max(-HOV_AZ, Math.min(HOV_AZ, (hov.x / innerWidth * 2 - 1) * HOV_AZ));
      hov.a += (tgt - hov.a) * (1 - Math.exp(-dt / HOV_TAU)); if (Math.abs(tgt - hov.a) < 0.02) hov.a = tgt;
    }
    return hov.a !== a0;
  }
  addEventListener('mousemove', (e) => { if (!FINE) return; hov.x = e.clientX;
    if (!phone && !run && !cat && !intro) css(stage, 'cursor', onHero(e.clientX, e.clientY) ? 'pointer' : 'default'); }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { hov.x = null; });
  addEventListener('blur', () => { hov.x = null; });
  // the mouse where it cannot hover (or on a phone frame): press, hold, drag
  stage.addEventListener('mousedown', (e) => { if (e.button === 0 && !hovering()) pressStart(e.clientX, e.clientY); });
  addEventListener('mousemove', (e) => { if (pressMove(e.clientX, e.clientY)) e.preventDefault(); });
  addEventListener('mouseup', () => { pressEnd(); });
  stage.addEventListener('contextmenu', (e) => { if (hold || press) e.preventDefault(); });
  // keys: one press = one step; key repeat and presses during a switch are ignored
  addEventListener('keydown', (e) => {
    const dn = ['ArrowDown', 'PageDown', ' '].includes(e.key), up = ['ArrowUp', 'PageUp'].includes(e.key);
    if (!dn && !up) return; e.preventDefault();
    if (e.repeat || run || hold) return;
    step(dn ? 1 : -1);
  });
  // touching the piece at rest opens its page
  stage.addEventListener('click', (e) => {
    if (run || intro || cat || hold || performance.now() < suppressClick) return;
    const pc = PIECES[cur], hw = GH * pc.aspect / 2;
    const x0 = offX + S * wx(-hw), x1 = offX + S * wx(hw), y0 = offY + S * wy(PY + GH / 2), y1 = offY + S * wy(PY - GH / 2);
    if (e.clientX > x0 && e.clientX < x1 && e.clientY > y0 && e.clientY < y1) location.href = pc.page;
  });
  stage.style.cursor = FINE ? 'default' : 'pointer';

  function frame() {
    const now = clock();
    if (intro) introFrame(now);
    if (hold) {
      if (hold.back) { const u = (now - hold.back.t0) / BACK_T; if (u >= 1) { hold = null; dirty = true; } else drawHold(hold.back.from * (1 - easeIO(u))); }
      else drawHold(hold.a);
    }
    if (run) {
      const t = now - run.t0;
      if (run.open) {
        if (t >= OPEN_T) { cat = !run.reverse; drawOpen(run, cat ? OPEN_T : 0); const was = run; run = null; if (!cat) { dirty = true; catalogue(null, 0); } void was; }
        else drawOpen(run, run.reverse ? OPEN_T - t : t);
      } else {
        if (run.tv === undefined) { run.tv = t; run.tl = now; run.stall = 0; }
        const t1 = run.tv + (now - run.tl); run.tl = now;
        if (spinReadyAt(run, t1)) run.tv = t1; else run.stall += t1 - run.tv;   // not decoded yet: this frame holds the turn's clock, not a frame
        STALL = run.stall;
        if (run.tv >= TS0 + TSD + 0.35) { cur = run.to; run = null; dirty = true; }
        else drawSwitch(run, run.tv);
      }
    }
    if (hoverStep(now) && !run && !hold && !cat && !dirty) { const L = []; restShadow(L, cur, 1); sPool.show(L); }   // only the shadow changes
    if (!run && !hold && !cat && !dirty && window.__pending() > 0) dirty = true;   // a still frame not decoded at first: shown as soon as it is
    if (!run && !hold && dirty && !cat) { drawRest(cur); dirty = false; }
    requestAnimationFrame(frame);
  }
  // ---- one page, no reloads (David, 10 Nov; one motion, David, 12 Nov: "one animation when clicking the product from
  // catalogue to be slid up to its product page photo and sit there and all writing changes as it motions"). Touching a
  // cell: its picture (the same file as the page's hero, build_line.py) glides, eased, from the cell to the hero's place
  // and stays; in the same movement the catalogue's other cells, names and headings fade out, then the page's writing
  // (CHAPTER I, the name, the line, the specs, the buttons), its views column and its wall fade in. Never both at once in
  // one place (no ghosting) and never a second copy of the piece on screen: the cell's picture is hidden as the glide
  // takes it, the page's hero shows only where the glide lands. The address becomes the piece's page (pushState); back
  // plays the same in reverse, to the catalogue at the same scroll. The page is the real one (its row, views, close-ups,
  // sizes), kept loaded in a layer from the moment the catalogue can open. Direct links to a page still load that page.
  // Reduced motion: a crossfade only.
  const DUR = 1000, EASE = 'cubic-bezier(.45,0,.55,1)', reduceM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pf = null, pfReady = false, pfOn = false, pfBusy = false, pfWant = null, pfHome = null;
  window.__pvHost = {   // what the page in the layer calls (site.js, embedded)
    push: (id, page) => { try { history.pushState({ pv: 'piece', id }, '', page); } catch (e) {} },
    back: () => { if (pfOn) { if (history.state && history.state.pv === 'piece') history.back(); else closePiece(); } },
    ready: () => { pfReady = true; if (pfWant) { const w = pfWant; pfWant = null; openPiece(w.id, w.push); } },
    home: () => { if (!pfOn) return; const toRoom = () => { CAT.scrollTop = 0; step(-1); };   // the lettering: back through the catalogue into the room
      if (history.state && history.state.pv === 'piece') { pfHome = toRoom; history.back(); } else closePiece().then(toRoom); },
  };
  function piecePage() {   // the layer, loaded once (any piece's page carries the whole row and switches in place)
    if (pf) return pf;
    pf = document.createElement('iframe'); pf.id = 'pieceF'; pf.title = 'Piece'; pf.setAttribute('aria-hidden', 'true'); pf.tabIndex = -1;
    pf.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;border:0;z-index:20;opacity:0;pointer-events:none;visibility:hidden;background:transparent;will-change:opacity';
    pf.src = (CATALOGUE.find(p => p.id === PIECES[PIECES.length - 1].id) || CATALOGUE[0]).page + '?embed=1';
    document.body.appendChild(pf); return pf;
  }
  const cellOf = (id) => CAT.querySelector(`.ci[data-id="${id}"]`);
  function flyer(src, a, b) {   // the cell's picture, moving from rect a to rect b (placed at b, transformed from a: FLIP), on the compositor
    const el = new Image(); el.src = src; el.alt = ''; el.className = 'pv-fly';
    el.style.cssText = `position:fixed;left:${b.left}px;top:${b.top}px;width:${b.width}px;height:${b.height}px;z-index:30;pointer-events:none;will-change:transform;object-fit:contain`;
    document.body.appendChild(el);
    const tr = (r) => `translate(${(r.left - b.left).toFixed(2)}px, ${(r.top - b.top).toFixed(2)}px) scale(${(r.width / b.width).toFixed(5)}, ${(r.height / b.height).toFixed(5)})`;
    return { el, run: (back) => el.animate([{ transform: back ? 'none' : tr(a) }, { transform: back ? tr(a) : 'none' }], { duration: DUR, easing: EASE, fill: 'forwards' }).finished };
  }
  // what fades on each side: the catalogue's own (every cell but the touched one's picture, the headings, the lettering)
  // and the page's own (its wall, its writing, its views); the page's wall is its background, faded in as one layer
  function catParts(cell) {
    const L = [...CAT.querySelectorAll('.ci, .cgh')].filter(e => e !== cell);
    if (cell) L.push(...cell.querySelectorAll('.nm, .pr, .rest'));
    const logo = document.getElementById('logo'); if (logo) L.push(logo);
    return L;
  }
  function pageParts(W) {
    const d = W.document, out = [];
    // a box laid out with display: contents (the phone's .left and .info) takes no opacity: its children fade instead
    const add = (e) => { if (W.getComputedStyle(e).display === 'contents') [...e.children].forEach(c => { if (!c.classList.contains('piece')) add(c); }); else if (!out.includes(e)) out.push(e); };
    d.querySelectorAll('header.top, .left, .info, .views, .design, .craft, .wheel, .packaging, .piece .fs, .piece .hz, .piece .rest').forEach(e => { if (!e.classList.contains('left') || W.getComputedStyle(e).display === 'contents') add(e); });
    return out;
  }
  // a fade over part of the movement (from f0 to f1 of DUR), its value held before and after
  const fade = (el, from, to, f0, f1) => el.animate([{ opacity: from }, { opacity: to }], { duration: Math.max(1, (f1 - f0) * DUR), delay: f0 * DUR, easing: EASE, fill: 'both' });
  function wall(W, from, to, f0, f1) {   // the page's ground (its wall's gradient), as one layer: transparent over the catalogue, then its own
    const d = W.document; let w = d.getElementById('pvWall');
    if (!w) { const cs = W.getComputedStyle(d.body); w = d.createElement('div'); w.id = 'pvWall'; w.setAttribute('aria-hidden', 'true');
      w.style.cssText = `position:fixed;inset:0;z-index:-1;pointer-events:none;background-color:${cs.backgroundColor};background-image:${cs.backgroundImage}`; d.body.prepend(w); }
    [d.documentElement, d.body].forEach(e => { e.style.background = 'transparent'; });   // the layer stands in for it while the catalogue shows through
    const an = fade(w, from ? 1 : 0, to ? 1 : 0, f0, f1);
    an.finished.then(() => { if (to) requestAnimationFrame(() => { [d.documentElement, d.body].forEach(e => { e.style.background = ''; }); }); }, () => {});
    return [an];
  }
  const settle = (anims) => anims.forEach(a => { try { a.cancel(); } catch (e) {} });
  async function openPiece(id, push = true) {
    if (pfBusy || pfOn) return;
    piecePage(); if (!pfReady) { pfWant = { id, push }; return; }   // the layer still loading: it opens as soon as it is in
    pfBusy = true;
    const W = pf.contentWindow, cell = cellOf(id), g = cell && cell.querySelector('.g');
    let hero = null; try { hero = await W.__pvShow(id, g ? (g.currentSrc || g.src) : null); } catch (e) {}
    if (!hero || !g) { pfBusy = false; location.href = (CATALOGUE.find(p => p.id === id) || {}).page; return; }
    if (push) try { history.pushState({ pv: 'piece', id }, '', hero.page); } catch (e) {}
    const cp = catParts(cell), pp = pageParts(W), anims = [];
    if (reduceM) {   // a crossfade only
      pf.style.visibility = 'visible'; pf.style.pointerEvents = 'auto'; pf.removeAttribute('aria-hidden');
      await pf.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' }).finished;
    } else {
      const f = flyer(g.currentSrc || g.src, g.getBoundingClientRect(), hero.rect);
      await (f.el.decode ? f.el.decode().catch(() => {}) : null);
      W.__pvHeroVis(false);
      const held = pp.concat([...wall(W, false, true, 0.2, 0.9).map(a => (anims.push(a), a.effect.target))]);
      held.forEach(e => { e.style.opacity = '0'; });   // from the very first frame the layer shows (an animation is pending until then)
      pp.forEach(e => anims.push(fade(e, 0, 1, 0.42, 1)));
      pf.style.opacity = '1'; pf.style.visibility = 'visible'; pf.style.pointerEvents = 'auto'; pf.removeAttribute('aria-hidden');
      g.style.visibility = 'hidden';   // the glide has it now: one picture on screen
      cp.forEach(e => anims.push(fade(e, 1, 0, 0, 0.5)));
      await Promise.all([f.run(false), ...anims.map(a => a.finished)]);
      W.__pvHeroVis(true);
      held.forEach(e => { e.style.opacity = e.id === 'pvWall' ? '1' : ''; });
      requestAnimationFrame(() => { f.el.remove(); g.style.visibility = ''; settle(anims); cp.forEach(e => { e.style.opacity = ''; }); });
      CAT.style.visibility = 'hidden';   // under the page's wall: nothing of it is seen until the way back
    }
    pfOn = true; pfBusy = false; document.title = hero.title || document.title; try { pf.focus(); } catch (e) {}
  }
  async function closePiece() {
    if (pfBusy || !pfOn) return;
    pfBusy = true;
    const W = pf.contentWindow, hero = W.__pvHero(), cell = cellOf(hero.id), g = cell && cell.querySelector('.g');
    CAT.style.visibility = '';
    if (cell) { const r = cell.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) CAT.scrollTop += r.top - innerHeight * 0.2; }   // its cell in view (under the layer)
    if (reduceM || !g) {
      await pf.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished;
    } else {
      const cp = catParts(cell), pp = pageParts(W), anims = [];
      const f = flyer(hero.src, g.getBoundingClientRect(), hero.rect);
      await (f.el.decode ? f.el.decode().catch(() => {}) : null);
      cp.forEach(e => anims.push(fade(e, 0, 1, 0.5, 1)));
      g.style.visibility = 'hidden'; W.__pvHeroVis(false);
      pp.forEach(e => anims.push(fade(e, 1, 0, 0, 0.58))); anims.push(...wall(W, true, false, 0.1, 0.8));
      await Promise.all([f.run(true), ...anims.map(a => a.finished)]);
      g.style.visibility = '';
      requestAnimationFrame(() => { f.el.remove(); settle(anims); cp.forEach(e => { e.style.opacity = ''; }); });
      pf.style.opacity = '0';
    }
    pf.style.visibility = 'hidden'; pf.style.pointerEvents = 'none'; pf.setAttribute('aria-hidden', 'true');
    pf.getAnimations().forEach(a => a.cancel()); pf.style.opacity = '0';
    W.__pvHeroVis(true); requestAnimationFrame(() => settle(pageParts(W).flatMap(e => e.getAnimations()).concat(W.document.body.getAnimations(), W.document.documentElement.getAnimations())));
    pfOn = false; pfBusy = false; document.title = DOC_TITLE;
    if (pfHome) { const h = pfHome; pfHome = null; h(); }
  }
  const DOC_TITLE = document.title;
  CAT.addEventListener('click', (e) => {
    const a = e.target.closest('a.ci'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault(); openPiece(a.dataset.id);
  });
  addEventListener('popstate', (e) => {
    const st = e.state;
    if (st && st.pv === 'piece') { if (!pfOn) openPiece(st.id, false); else if (pf.contentWindow.__pvSelect) pf.contentWindow.__pvSelect(st.id); }
    else if (pfOn) closePiece();
  });
  function openCatalogueNow(piece) {
    cur = PIECES.length - 1; run = null; cat = true; dirty = false;
    drawOpen({ open: true }, OPEN_T); piecePage();
    const cell = piece && CAT.querySelector(`.ci[data-id="${piece.replace(/-/g, '_')}"]`) || piece && CAT.querySelector(`.ci[href="${piece}.html"]`);
    if (cell) CAT.scrollTop = Math.max(0, cell.offsetTop - innerHeight * 0.12);
  }
  addEventListener('resize', () => { layout(); if (cat) drawOpen({ open: true }, OPEN_T); });
  if (window.visualViewport) visualViewport.addEventListener('resize', () => { if (phone) { layout(); if (cat) drawOpen({ open: true }, OPEN_T); } });   // Safari's toolbar
  addEventListener('hashchange', () => { const m = /^#catalogue(?:=([\w-]+))?$/.exec(location.hash); if (m && !cat) openCatalogueNow(m[1] || null); });

  layout();
  queueBlobs();
  if (intro) for (let i = 0; i < PV.kinds[IKIND].introParts; i++) { const p = window['__PVI_' + IKIND + '_' + i]; if (p) blobs(p.u); }   // the intro's first keys are already decoding as data: URIs
  if (intro) { introEl.hidden = false; LOGO.style.opacity = '0'; uiEl.style.opacity = '0'; uiEl.__css = { opacity: '0' };
    const I0 = window['__PVI_' + IKIND + '_0']; if (I0) for (let j = 0; j < 4; j++) iPool.want(I0.u[j], K.frame[0], K.frame[1]); }
  else introEl.hidden = true;
  drawRest(0); dirty = false;
  if (intro) { op(uiEl, 0); }
  if (window.CAT_LINK) openCatalogueNow(window.CAT_LINK.piece);
  window.__state = () => ({ cur, run: !!run, cat, intro: !!intro, phone, kind: phone ? 'phone' : 'desk' });
  window.ready = true;
  requestAnimationFrame(frame);
})();
