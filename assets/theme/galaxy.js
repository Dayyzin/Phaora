/* PHAÖRA — the galaxy theme. See galaxy.css for what it is.
   Self-contained: it writes its own markup, so a page needs only the two tags
   in its <head>. Reduced motion gets still stars, an unturned Ö, no flicker
   and no drifting dust. */
(function () {
  if (window.__gx) return; window.__gx = 1;
  var doc = document, root = doc.documentElement;
  var still = false;
  try { still = matchMedia('(prefers-reduced-motion: reduce)').matches } catch (e) {}

  // How far the Ö turns: one full turn every 2,400px of scroll.
  var DEG_PER_PX = 360 / 2400;

  var LINKS = [
    ['/', 'Home'],
    ['/portfolio/', 'Our Work'],
    ['/hardscape-gallery.html', 'Hardscape'],
    ['/blog', 'Journal'],
    ['/service-area/', 'Service Area'],
    ['/contact.html', 'Contact']
  ];

  function here(href) {
    var p = location.pathname.replace(/index\.html$/, '');
    return p === href || (href !== '/' && p.indexOf(href) === 0);
  }
  function clear(c) { return /rgba\(0, 0, 0, 0\)|transparent/.test(c) }

  function build() {
    var body = doc.body; if (!body) return;

    // Let the stars show through: move the page's ground colour from <body>
    // to <html>, where it paints under the sky instead of over it.
    var cs = getComputedStyle(body), hs = getComputedStyle(root);
    if (cs.backgroundImage === 'none' && !clear(cs.backgroundColor)) {
      if (clear(hs.backgroundColor) && hs.backgroundImage === 'none') root.style.backgroundColor = cs.backgroundColor;
      body.style.backgroundColor = 'transparent';
    }
    hs = getComputedStyle(root);
    if (clear(hs.backgroundColor) && hs.backgroundImage === 'none') root.style.backgroundColor = '#020610';

    // the old bar, for browsers without :has()
    var navs = doc.querySelectorAll('body > nav');
    for (var i = 0; i < navs.length; i++)
      if (navs[i].querySelector('.nav-wm, .wm')) navs[i].classList.add('gx-old-nav');

    var sky = doc.createElement('canvas');
    sky.className = 'gx-sky'; sky.setAttribute('aria-hidden', 'true');
    body.insertBefore(sky, body.firstChild);

    var onEstimate = /^\/estimate\//.test(location.pathname);
    var items = '';
    for (var j = 0; j < LINKS.length; j++)
      items += '<li style="transition-delay:' + (160 + j * 55) + 'ms"><a href="' + LINKS[j][0] + '"' +
        (here(LINKS[j][0]) ? ' aria-current="page"' : '') + '>' + LINKS[j][1] + '</a></li>';
    var wrap = doc.createElement('div');
    wrap.innerHTML =
      '<button type="button" class="gx-orb" id="gxOrb" aria-label="Menu" aria-expanded="false" aria-controls="gxMenu">' +
        '<canvas class="gx-orb-cv" aria-hidden="true"></canvas>' +
        '<svg class="gx-x" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<a class="gx-wm" href="/" aria-label="PHAÖRA home">PHA<span class="o">Ö</span>RA</a>' +
      (onEstimate ? '' : '<a class="gx-cta" href="/estimate/">Price it now</a>') +
      '<div class="gx-menu" id="gxMenu" role="dialog" aria-modal="true" aria-label="Menu">' +
        '<canvas class="gx-menu-sky" aria-hidden="true"></canvas><div class="gx-beam" aria-hidden="true"></div>' +
        '<div class="gx-menu-inner">' +
          '<div class="gx-mark" aria-hidden="true"><canvas class="gx-mark-cv"></canvas><span class="gx-flare"></span></div>' +
          '<div class="gx-name" aria-hidden="true">PHA<span class="o">Ö</span>RA</div>' +
          '<div class="gx-sub" aria-hidden="true"><span>New England</span></div>' +
          '<nav aria-label="Site"><ul class="gx-links">' + items + '</ul></nav>' +
          '<div class="gx-menu-foot">' +
            '<a class="gx-menu-cta" href="/estimate/">Price your project &rarr;</a>' +
            '<a class="gx-menu-line" href="tel:+15612991261">(561) 299-1261</a>' +
            '<a class="gx-menu-line" href="mailto:phaoraco@gmail.com">phaoraco@gmail.com</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    while (wrap.firstChild) body.appendChild(wrap.firstChild);

    var orb = doc.getElementById('gxOrb'), menu = doc.getElementById('gxMenu');
    var wm = doc.querySelector('.gx-wm');

    // the corner Ö, and the big one inside the menu
    var orbMark = oMark(orb.querySelector('.gx-orb-cv'), { fit: 12, dust: 70, glitter: 220 });
    var bigMark = oMark(menu.querySelector('.gx-mark-cv'), { fit: 8.6, dust: 240, glitter: 700, lazy: true });

    /* ---------- the turn ---------- */
    function aim() {
      var y = window.scrollY || root.scrollTop || 0;
      orbMark.turn(still ? 0 : y * DEG_PER_PX);
      wm.classList.toggle('gx-away', y > 60);
    }
    addEventListener('scroll', aim, { passive: true });
    aim();
    orbMark.start();

    /* ---------- the menu ---------- */
    var open = false, lastFocus = null;
    function setOpen(v) {
      open = v;
      orb.setAttribute('aria-expanded', String(v));
      orb.setAttribute('aria-label', v ? 'Close menu' : 'Menu');
      root.classList.toggle('gx-open', v);
      if (v) {
        lastFocus = doc.activeElement;
        menu.classList.add('gx-on');
        bigMark.turn(orbMark.angle()); bigMark.kick(); bigMark.start(); menuSky.start(); orbMark.stop();
        setTimeout(function () { var a = menu.querySelector('.gx-links a'); a && a.focus({ preventScroll: true }) }, 60);
      } else {
        menu.classList.remove('gx-on');
        bigMark.stop(); menuSky.stop(); orbMark.start();
        (lastFocus && lastFocus.focus ? lastFocus : orb).focus({ preventScroll: true });
      }
    }
    orb.addEventListener('click', function () { setOpen(!open) });
    menu.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (a || e.target === menu) setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return }
      if (e.key !== 'Tab') return;
      var f = [orb].concat([].slice.call(menu.querySelectorAll('a')));
      var k = f.indexOf(doc.activeElement);
      if (e.shiftKey && k <= 0) { e.preventDefault(); f[f.length - 1].focus() }
      else if (!e.shiftKey && k === f.length - 1) { e.preventDefault(); f[0].focus() }
    });

    /* ---------- the stars ---------- */
    var mainSky = starfield(sky, { parallax: true });
    mainSky.start(function () { sky.classList.add('gx-lit') });
    var menuSky = starfield(menu.querySelector('.gx-menu-sky'), { parallax: false, dust: 1.3, lazy: true });
  }

  /* ======================================================================
     The Ö in three dimensions, drawn on a 2D canvas.
     A torus (the ring) and two spheres (the dots), lit from the front, with
     a glitter of points on the ring's surface like the lockup's crushed-ice
     texture. Its glow breathes, and now and then flickers like a tube light.
     Sky dust orbits it on tilted paths and swirls a little as the page turns.
     Units: the ring's radius is 1. `fit` is how many units span the canvas.
     ====================================================================== */
  function oMark(cv, opt) {
    var ctx = cv.getContext('2d');
    var dead = { start: noop, stop: noop, turn: noop, kick: noop, angle: function () { return 0 } };
    if (!ctx) return dead;
    var TUBE = 0.1, DOTX = 0.4, DOTY = -1.45, DOTR = 0.19, LIFT = 0.27, CAM = 7, SEG = 84;
    var W = 0, H = 0, dpr = 1, U = 1, running = false, raf = 0;
    var target = 0, turn = 0, kickAt = -1;
    var glit = [], dust = [];
    var flick = [], nextFlick = 0;

    for (var i = 0; i < opt.glitter; i++)
      glit.push({ u: Math.random() * 6.2832, v: Math.random() * 6.2832, p: Math.random() * 6.28, s: 1.5 + Math.random() * 5, b: 0.35 + Math.random() * 0.65 });
    for (var d = 0; d < opt.dust; d++) {
      var q = 1.55 + Math.pow(Math.random(), 0.8) * 2.9;
      dust.push({
        q: q, a: Math.random() * 6.2832, w: (0.08 + Math.random() * 0.22) / Math.sqrt(q) * (Math.random() < 0.85 ? 1 : -1),
        tx: (Math.random() - 0.5) * 1.6, tz: (Math.random() - 0.5) * 0.9,
        bob: 0.05 + Math.random() * 0.22, bs: 0.2 + Math.random() * 0.5, p: Math.random() * 6.28,
        r: 0.18 + Math.pow(Math.random(), 3) * 0.75, tw: 0.6 + Math.random() * 2.2, g: Math.random() < 0.18 ? 1.6 : 0.85,
        c: Math.random() < 0.3 ? '120,220,232' : (Math.random() < 0.5 ? '214,240,248' : '255,255,255')
      });
    }

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      if (!W || !H) return false;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      U = Math.min(W, H) / opt.fit;
      return true;
    }

    // rotate about Y (the scroll), then X (a slow sway), then project
    function P(x, y, z, cy_, sy_, cx_, sx_) {
      var x1 = x * cy_ + z * sy_, z1 = -x * sy_ + z * cy_;
      var y1 = y * cx_ - z1 * sx_, z2 = y * sx_ + z1 * cx_;
      var k = CAM / (CAM - z2);
      return [W / 2 + x1 * k * U, H / 2 + (y1 * k + LIFT) * U, z2, k];
    }

    function glowLevel(t) {
      if (still) return 1;
      var g = 0.9 + 0.07 * Math.sin(t * 1.15) + 0.03 * Math.sin(t * 2.9 + 1.3);
      if (t > nextFlick) {
        // a tube-light stutter: two or three quick dips, then steady again
        var n = 2 + (Math.random() < 0.4 ? 1 : 0), at = t;
        flick = [];
        for (var i = 0; i < n; i++) {
          var len = 0.04 + Math.random() * 0.07;
          flick.push([at, at + len, 0.3 + Math.random() * 0.35]);
          at += len + 0.04 + Math.random() * 0.1;
        }
        nextFlick = t + 4 + Math.random() * 7;
      }
      for (var j = 0; j < flick.length; j++) if (t >= flick[j][0] && t < flick[j][1]) return g * flick[j][2];
      return g;
    }

    function draw(now) {
      var t = now / 1000;
      turn += (target - turn) * 0.14;                  // a little inertia, so it glides
      if (Math.abs(target - turn) < 0.02) turn = target;
      var spinIn = 0;
      if (kickAt >= 0) {
        var pk = Math.min(1, (now - kickAt) / 1300);
        spinIn = -300 * Math.pow(1 - pk, 3);
        if (pk >= 1) kickAt = -1;
      }
      var ry = (turn + spinIn + (still ? 0 : 7 * Math.sin(t * 0.33))) * Math.PI / 180;
      var rx = (still ? 0 : 6 * Math.sin(t * 0.27 + 0.8)) * Math.PI / 180;
      var cY = Math.cos(ry), sY = Math.sin(ry), cX = Math.cos(rx), sX = Math.sin(rx);
      var I = glowLevel(t);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      /* sky dust behind the Ö */
      var swirl = turn * Math.PI / 180 * 0.4;
      var front = [];
      ctx.globalCompositeOperation = 'lighter';
      for (var di = 0; di < dust.length; di++) {
        var o = dust[di];
        var A = o.a + (still ? 0 : o.w * t) + swirl;
        var px = o.q * Math.cos(A), pz = o.q * Math.sin(A), py = o.bob * Math.sin(t * o.bs + o.p);
        // tilt the orbit's plane
        var cy1 = Math.cos(o.tx), sy1 = Math.sin(o.tx);
        var y2 = py * cy1 - pz * sy1, z2 = py * sy1 + pz * cy1;
        var cz = Math.cos(o.tz), sz = Math.sin(o.tz);
        var x3 = px * cz - y2 * sz, y3 = px * sz + y2 * cz;
        var pr = P(x3, y3, z2, 1, 0, 1, 0);
        if (pr[2] > 0.2) { front.push([o, pr]); continue }
        dustDot(o, pr, t, 0.55);
      }
      ctx.globalCompositeOperation = 'source-over';

      /* the ring as depth-sorted tube segments, and the two dots, back to front */
      var items = [];
      var prev = P(1, 0, 0, cY, sY, cX, sX);
      for (var s = 1; s <= SEG; s++) {
        var a = s / SEG * 6.2832;
        var cur = P(Math.cos(a), Math.sin(a), 0, cY, sY, cX, sX);
        items.push({ z: (prev[2] + cur[2]) / 2, a: prev, b: cur });
        prev = cur;
      }
      var d1 = P(-DOTX, DOTY, 0, cY, sY, cX, sX), d2 = P(DOTX, DOTY, 0, cY, sY, cX, sX);
      items.push({ z: d1[2], dot: d1 }, { z: d2[2], dot: d2 });
      items.sort(function (m, n) { return m.z - n.z });

      // glow, under everything
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (var g = 0; g < SEG; g++) {
        var gp = P(Math.cos(g / SEG * 6.2832), Math.sin(g / SEG * 6.2832), 0, cY, sY, cX, sX);
        if (g) ctx.lineTo(gp[0], gp[1]); else ctx.moveTo(gp[0], gp[1]);
      }
      ctx.closePath();
      // a soft glow: the ring's own path, blurred, twice over
      var w = 2 * TUBE * U;
      ctx.lineWidth = w * 1.4;
      ctx.shadowColor = 'rgba(95,211,222,' + Math.min(1, 0.95 * I).toFixed(3) + ')';
      ctx.strokeStyle = 'rgba(95,211,222,' + (0.5 * I).toFixed(3) + ')';
      ctx.shadowBlur = U * 0.9 * dpr; ctx.stroke();
      ctx.shadowBlur = U * 0.35 * dpr; ctx.stroke();
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      halo(d1, I); halo(d2, I);
      ctx.globalCompositeOperation = 'source-over';

      // body
      var B = 0.72 + 0.28 * I;
      for (var m = 0; m < items.length; m++) {
        var it2 = items[m];
        if (it2.dot) { sphere(it2.dot, B); continue }
        // ice where it faces you, deeper teal as it turns away
        var depth = Math.max(0, Math.min(1, 0.72 + it2.z * 0.28));
        var r = Math.round((60 + 180 * depth) * B), gg = Math.round((150 + 102 * depth) * B), bb = Math.round((165 + 90 * depth) * B);
        ctx.strokeStyle = 'rgb(' + r + ',' + gg + ',' + bb + ')';
        ctx.lineWidth = 2 * TUBE * U * it2.a[3];
        seg(it2);
        // a thin bright line along the tube where the light catches it
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 * depth * I).toFixed(3) + ')';
        ctx.lineWidth = TUBE * U * 0.55 * it2.a[3];
        seg(it2);
      }

      // glitter: points on the torus that face the viewer
      ctx.globalCompositeOperation = 'lighter';
      for (var gi = 0; gi < glit.length; gi++) {
        var p = glit[gi];
        var cu = Math.cos(p.u), su = Math.sin(p.u), cv_ = Math.cos(p.v), sv = Math.sin(p.v);
        var nx = cv_ * cu, ny = cv_ * su, nz = sv;
        // the normal's z after rotation: only lit facets sparkle
        var nz1 = -nx * sY + nz * cY, nzz = ny * sX + nz1 * cX;
        if (nzz < 0.05) continue;
        var R = 1 + TUBE * cv_;
        var pg = P(R * cu, R * su, TUBE * sv, cY, sY, cX, sX);
        var tw = still ? 0.6 : 0.5 + 0.5 * Math.sin(t * p.s + p.p);
        var al = p.b * tw * tw * nzz * I;
        if (al < 0.04) continue;
        ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, al).toFixed(3) + ')';
        var sz = Math.max(0.5, U * 0.022) * (0.6 + tw * 0.8);
        ctx.fillRect(pg[0] - sz / 2, pg[1] - sz / 2, sz, sz);
      }

      /* sky dust in front of the Ö */
      for (var fi = 0; fi < front.length; fi++) dustDot(front[fi][0], front[fi][1], t, 1);
      ctx.globalCompositeOperation = 'source-over';
    }

    function seg(it) { ctx.beginPath(); ctx.moveTo(it.a[0], it.a[1]); ctx.lineTo(it.b[0], it.b[1]); ctx.stroke() }
    function halo(pt, I) {
      var r = DOTR * U * pt[3] * 3.6;
      var g = ctx.createRadialGradient(pt[0], pt[1], 0, pt[0], pt[1], r);
      g.addColorStop(0, 'rgba(95,211,222,' + (0.45 * I).toFixed(3) + ')'); g.addColorStop(1, 'rgba(95,211,222,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pt[0], pt[1], r, 0, 6.2832); ctx.fill();
    }
    function sphere(pt, B) {
      var r = DOTR * U * pt[3];
      var g = ctx.createRadialGradient(pt[0] - r * 0.3, pt[1] - r * 0.35, r * 0.05, pt[0], pt[1], r);
      g.addColorStop(0, 'rgb(255,255,255)');
      g.addColorStop(0.55, 'rgb(' + Math.round(236 * B) + ',' + Math.round(251 * B) + ',' + Math.round(253 * B) + ')');
      g.addColorStop(1, 'rgb(' + Math.round(140 * B) + ',' + Math.round(216 * B) + ',' + Math.round(226 * B) + ')');
      ctx.shadowColor = 'rgba(95,211,222,' + Math.min(1, 0.9 * B).toFixed(3) + ')'; ctx.shadowBlur = r * 1.6 * dpr;
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pt[0], pt[1], r, 0, 6.2832); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
    }
    function dustDot(o, pr, t, dim) {
      var x = pr[0], y = pr[1];
      var dx = (x - W / 2) / (W / 2), dy = (y - H / 2) / (H / 2);
      var edge = 1 - Math.min(1, Math.max(0, (Math.sqrt(dx * dx + dy * dy) - 0.62) / 0.36));  // fade before the canvas edge
      if (edge <= 0) return;
      var tw = still ? 0.7 : 0.55 + 0.45 * Math.sin(t * o.tw + o.p);
      var al = Math.min(1, tw * edge * dim * (0.55 + 0.45 * pr[3]) * o.g);
      var r = o.r * pr[3] * Math.sqrt(U / 14) + 0.15;
      if (r > 0.75) {
        var g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
        g.addColorStop(0, 'rgba(' + o.c + ',' + al.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + o.c + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, 6.2832); ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(' + o.c + ',' + al.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      }
    }

    function loop(now) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      draw(now);
    }
    var sized = false;
    addEventListener('resize', function () { if (sized) { size(); if (!running) draw(performance.now()) } });
    return {
      start: function () {
        if (running) return;
        sized = size(); if (!sized) return;
        if (still) { turn = target; draw(performance.now()); return }
        running = true; raf = requestAnimationFrame(loop);
      },
      stop: function () { running = false; cancelAnimationFrame(raf) },
      turn: function (deg) { target = deg; if (still) { turn = deg; if (sized) draw(performance.now()) } },
      kick: function () { if (!still) kickAt = performance.now() },
      angle: function () { return turn }
    };
  }
  function noop() {}

  /* ======================================================================
     The sky, made to read as a photograph rather than a pattern.
     Painted once per screen size into two layers, then only moved:
       deep  — a teal haze in a column down the middle, thousands of
               one-pixel grains of star dust packed into that column, and
               the faint field stars, which thin out towards the edges;
       near  — the brighter stars, a few with a soft halo, a rare one with
               the four-point diffraction cross of a real lens.
     Over them, every frame: a hundred of the brightest scintillating, and a
     fixed overlay — the column's glow, a hairline of light down the middle
     and a lens vignette. The two layers drift at different speeds as the
     page scrolls; both wrap top to bottom without a seam.
     ====================================================================== */
  function starfield(cv, opt) {
    var ctx = cv.getContext('2d'); if (!ctx) return { start: noop, stop: noop };
    var W = 0, H = 0, dpr = 1, deep = null, near = null, over = null, twinkles = [];
    var running = false, raf = 0, last = 0, lastScroll = -1e9, seeded = false, jobs = [], working = false;

    function canvas() {
      var c = doc.createElement('canvas');
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      var g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { c: c, g: g };
    }
    function gauss() {                                   // Box–Muller
      var u = 1 - Math.random(), v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v);
    }
    // how much of the sky's matter sits at this x: a column in the middle,
    // never quite nothing at the edges
    function column(x) { var d = (x / W - 0.5) / 0.2; return 0.22 + 0.78 * Math.exp(-d * d) }

    // value noise, periodic in y so the haze wraps without a seam
    function hash(x, y) { var s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
    function vnoise(x, y, py) {
      var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      var y0 = ((iy % py) + py) % py, y1 = (y0 + 1) % py;
      var a = hash(ix, y0), b = hash(ix + 1, y0), c = hash(ix, y1), d = hash(ix + 1, y1);
      var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    }
    function haze(g) {
      var nw = Math.max(8, Math.ceil(W / 9)), nh = Math.max(8, Math.ceil(H / 9));
      var nc = doc.createElement('canvas'); nc.width = nw; nc.height = nh;
      var nx = nc.getContext('2d'), img = nx.createImageData(nw, nh), px = img.data;
      var cells = Math.max(2, Math.round(nh / 27)), ox = Math.random() * 100;
      for (var y = 0; y < nh; y++) for (var x = 0; x < nw; x++) {
        var n = 0, amp = 0.55, f = 1;
        for (var o = 0; o < 4; o++) {
          var p = cells * f;
          n += amp * vnoise(ox + x / nh * p, y / nh * p, p);
          amp *= 0.5; f *= 2;
        }
        var a = Math.max(0, n - 0.42) * 1.9 * column(x / nw * W);
        var i = (y * nw + x) * 4;
        px[i] = 22; px[i + 1] = 112 + 60 * a; px[i + 2] = 140 + 60 * a; px[i + 3] = Math.min(255, a * 110);
      }
      nx.putImageData(img, 0, 0);
      g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.globalAlpha = 0.32; g.drawImage(nc, 0, 0, W, H); g.restore();
    }

    // draw at y, and again across the wrap if it hangs over an edge
    function wrapped(y, pad, fn) { fn(y); if (y < pad) fn(y + H); else if (y > H - pad) fn(y - H) }

    // Builds a new sky as a queue of small jobs (see work()), into fresh
    // canvases: whatever is on screen keeps drawing until the last job swaps
    // the new layers in, so a resize never flashes an empty sky.
    function seed() {
      var D = Math.min(window.devicePixelRatio || 1, 2);
      var w = cv.clientWidth || innerWidth, ht = cv.clientHeight || innerHeight;
      var area = w * ht * (1 + 0.4 * (D - 1)), px1 = 1 / D, grain = Math.max(px1, 0.5);
      var sig = Math.max(w * 0.12, 70);
      var nd, nn, no, tw = [];
      // the helpers read W, H and dpr: point them at the new size while building
      function at(f) { return function () { var s0 = W, s1 = H, s2 = dpr; W = w; H = ht; dpr = D; try { f() } finally { W = s0; H = s1; dpr = s2 } } }

      jobs = [
        /* deep: haze, dust, field stars */
        at(function () { nd = canvas(); haze(nd.g) }),
        at(function () {
          var g = nd.g, i, x, y;
          // tens of thousands of grains: grouped by colour and strength, so the
          // canvas parses a colour twenty times, not twenty thousand
          var bins = {};
          function grainAt(rgb, a, x, y, s) {
            var k = rgb + ',' + (Math.round(Math.min(1, a) * 20) / 20);
            (bins[k] || (bins[k] = [])).push(x, y, s);
          }
          var dust = Math.round(area / 70 * (opt.dust || 1));
          for (i = 0; i < dust; i++) {
            x = Math.random() < 0.82 ? W / 2 + gauss() * sig : Math.random() * W;
            if (x < 0 || x > W) continue;
            y = Math.random() * H;
            grainAt(Math.random() < 0.8 ? '110,222,234' : '225,246,250', (0.2 + Math.pow(Math.random(), 2) * 0.85) * column(x),
              x, y, Math.random() < 0.88 ? grain : grain * 1.6);
          }
          var field = Math.round(area / 190);
          for (i = 0; i < field; i++) {
            x = Math.random() * W; y = Math.random() * H;
            if (Math.random() > column(x) * 0.45 + 0.55) continue;   // a little thinner towards the edges
            var m = Math.pow(Math.random(), 3.2);
            var r = 0.3 + m * 0.65, al = 0.3 + m * 0.7;
            if (r < 0.55) { grainAt(tint(), al, x, y, Math.max(grain, r * 1.4)); continue }
            g.fillStyle = 'rgba(' + tint() + ',' + al.toFixed(3) + ')';
            g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
          }
          var slices = [];
          Object.keys(bins).forEach(function (k) {
            var b = bins[k];
            for (var from = 0; from < b.length; from += 3 * 2500) (function (from) {
              slices.push(function () {
                g.fillStyle = 'rgba(' + k + ')';
                for (var j = from, end = Math.min(b.length, from + 3 * 2500); j < end; j += 3) g.fillRect(b[j], b[j + 1], b[j + 2], b[j + 2]);
              });
            })(from);
          });
          jobs = slices.concat(jobs);
        }),

        /* near: the bright stars */
        at(function () {
          nn = canvas(); var h = nn.g, i, x, y;
          var bright = Math.round(area / 6000);
          for (i = 0; i < bright; i++) {
            x = Math.random() * W; y = Math.random() * H;
            var mb = Math.pow(Math.random(), 2.2);
            var star = { x: x, y: y, r: 0.65 + mb * 0.9, a: 0.55 + mb * 0.45, c: tint(), f: 0.8 + Math.random() * 2.6, p: Math.random() * 6.28 };
            if (tw.length < 110 && Math.random() < 0.6) { tw.push(star); continue }
            (function (star) { wrapped(star.y, 12, function (yy) { glowStar(h, star, star.x, yy, star.a) }) })(star);
          }
          var crosses = Math.max(2, Math.round(area / 420000));
          for (i = 0; i < crosses; i++) {
            x = W / 2 + gauss() * W * 0.22; y = Math.random() * H;
            var L = 7 + Math.random() * 10;
            (function (x, L) { wrapped(y, L * 2, function (yy) { crossStar(h, x, yy, L, 0.85) }) })(x, L);
          }
        }),

        /* fixed overlay: the column's glow, the hairline, the vignette */
        at(function () {
          no = canvas(); var v = no.g;
          var cg = v.createLinearGradient(0, 0, W, 0);
          cg.addColorStop(0, 'rgba(20,110,128,0)'); cg.addColorStop(0.32, 'rgba(20,110,128,0.035)');
          cg.addColorStop(0.5, 'rgba(48,170,186,0.09)'); cg.addColorStop(0.68, 'rgba(20,110,128,0.035)'); cg.addColorStop(1, 'rgba(20,110,128,0)');
          v.fillStyle = cg; v.fillRect(0, 0, W, H);
          var lg = v.createLinearGradient(0, 0, 0, H);
          lg.addColorStop(0, 'rgba(120,226,236,0)'); lg.addColorStop(0.18, 'rgba(120,226,236,0.32)');
          lg.addColorStop(0.5, 'rgba(160,236,244,0.4)'); lg.addColorStop(0.82, 'rgba(120,226,236,0.32)'); lg.addColorStop(1, 'rgba(120,226,236,0)');
          v.fillStyle = lg; v.fillRect(W / 2 - px1 / 2, 0, Math.max(px1, 0.75), H);
          v.globalAlpha = 0.18; v.fillRect(W / 2 - 2, 0, 4, H); v.globalAlpha = 1;
          var vg = v.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.62);
          vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,2,5,0.55)');
          v.fillStyle = vg; v.fillRect(0, 0, W, H);
        }),

        /* swap the finished sky in */
        function () {
          W = w; H = ht; dpr = D;
          cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
          deep = nd; near = nn; over = no; twinkles = tw; seeded = true;
        }
      ];
    }
    function tint() {
      var k = Math.random();
      return k < 0.18 ? '150,228,238' : k < 0.55 ? '214,236,250' : k < 0.97 ? '255,255,255' : '255,240,222';
    }
    function glowStar(g, s, x, y, a) {
      if (s.r > 1.05) {
        var rg = g.createRadialGradient(x, y, 0, x, y, s.r * 2.8);
        rg.addColorStop(0, 'rgba(' + s.c + ',' + (a * 0.28).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(' + s.c + ',0)');
        g.fillStyle = rg; g.beginPath(); g.arc(x, y, s.r * 2.8, 0, 6.2832); g.fill();
      }
      g.fillStyle = 'rgba(255,255,255,' + Math.min(1, a * 1.15).toFixed(3) + ')';
      g.beginPath(); g.arc(x, y, s.r * 0.55, 0, 6.2832); g.fill();
    }
    function crossStar(g, x, y, L, a) {
      var rg = g.createRadialGradient(x, y, 0, x, y, L * 0.9);
      rg.addColorStop(0, 'rgba(170,240,248,' + (a * 0.55).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(95,211,222,0)');
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, L * 0.9, 0, 6.2832); g.fill();
      var hz = g.createLinearGradient(x - L, 0, x + L, 0), vt = g.createLinearGradient(0, y - L, 0, y + L);
      [hz, vt].forEach(function (gr) {
        gr.addColorStop(0, 'rgba(200,246,250,0)'); gr.addColorStop(0.5, 'rgba(245,255,255,' + a + ')'); gr.addColorStop(1, 'rgba(200,246,250,0)');
      });
      g.fillStyle = hz; g.fillRect(x - L, y - 0.5, L * 2, 1);
      g.fillStyle = vt; g.fillRect(x - 0.5, y - L, 1, L * 2);
      g.fillStyle = 'rgba(255,255,255,' + a + ')'; g.beginPath(); g.arc(x, y, 1.1, 0, 6.2832); g.fill();
    }

    var idle = window.requestIdleCallback || function (f) { return setTimeout(function () { f({ timeRemaining: function () { return 8 } }) }, 16) };
    var waiting = [];
    function work(done) {
      if (done) waiting.push(done);
      if (working) return; working = true;
      idle(function tick(dl) {
        var t0 = performance.now();
        while (jobs.length && (dl.timeRemaining() > 2 || performance.now() - t0 < 4)) jobs.shift()();
        if (jobs.length) return idle(tick);
        working = false;
        var w = waiting; waiting = [];
        for (var i = 0; i < w.length; i++) w[i]();
      });
    }
    function blit(layer, off) {
      var o = ((off % H) + H) % H;
      ctx.drawImage(layer.c, 0, -o, W, H);
      if (o) ctx.drawImage(layer.c, 0, H - o, W, H);
    }
    function draw(now) {
      var sc = opt.parallax && !still ? (window.scrollY || 0) : 0;
      var t = still ? 0 : now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      blit(deep, sc * 0.03);
      blit(near, sc * 0.08);
      var o = ((sc * 0.08 % H) + H) % H;
      for (var i = 0; i < twinkles.length; i++) {
        var s = twinkles[i], y = s.y - o; if (y < -12) y += H;
        // scintillation: a slow swell and a fast shiver, as air does to starlight
        var a = s.a * (0.62 + 0.28 * Math.sin(t * s.f + s.p) + 0.1 * Math.sin(t * s.f * 4.3 + s.p * 2));
        glowStar(ctx, s, s.x, y, Math.max(0, a));
      }
      ctx.drawImage(over.c, 0, 0, W, H);
    }
    function loop(now) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      // smooth while the page is moving, light on the battery when it is not
      var gap = now - lastScroll < 400 ? 0 : 45;
      if (now - last < gap) return;
      last = now; draw(now);
    }
    if (opt.parallax) addEventListener('scroll', function () { lastScroll = performance.now() }, { passive: true });
    var resizeT, lastW = 0;
    addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () {
        // a phone's toolbar sliding away changes the height, not the width: keep the sky
        if (!(running || !opt.lazy) || (cv.clientWidth === lastW && Math.abs(cv.clientHeight - H) < 140)) return;
        lastW = cv.clientWidth; seed(); work(function () { draw(performance.now()) });
      }, 150);
    });
    return {
      start: function (ready) {
        if (running) return;
        running = !still;
        if (!working && (!seeded || cv.clientWidth !== lastW)) { lastW = cv.clientWidth; seed() }
        work(function () {
          draw(performance.now()); ready && ready();
          if (running) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop) }
        });
      },
      stop: function () { running = false; cancelAnimationFrame(raf) }
    };
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', build);
  else build();
})();
