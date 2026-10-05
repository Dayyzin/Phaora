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
    sky.style.background =
      'radial-gradient(ellipse 22% 70% at 50% 18%,rgba(40,150,170,.10) 0%,transparent 70%),' +
      'radial-gradient(ellipse 70% 40% at 50% 100%,rgba(16,90,108,.12) 0%,transparent 70%)';
    starfield(sky, { parallax: true, density: 2600 }).start();
    var menuSky = starfield(menu.querySelector('.gx-menu-sky'), { parallax: false, density: 1500, lazy: true });
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
     A canvas of stars: most still, some breathing, a few cross-shaped
     flares like the lockup's. Two depths drift at different speeds on scroll.
     ====================================================================== */
  function starfield(cv, opt) {
    var ctx = cv.getContext('2d'); if (!ctx) return { start: noop, stop: noop };
    var W = 0, H = 0, dpr = 1, stars = [], flares = [], running = false, last = 0, raf = 0;
    function seed() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var n = Math.min(900, Math.round(W * H / opt.density));
      stars = [];
      for (var i = 0; i < n; i++) {
        var deep = Math.random() < 0.72;
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: deep ? 0.35 + Math.random() * 0.55 : 0.7 + Math.random() * 0.9,
          a: deep ? 0.25 + Math.random() * 0.45 : 0.5 + Math.random() * 0.5,
          d: deep ? 0.035 : 0.09,
          t: Math.random() < 0.35 ? 0.6 + Math.random() * 1.8 : 0,
          p: Math.random() * 6.28,
          c: Math.random() < 0.22 ? '120,220,232' : (Math.random() < 0.5 ? '214,236,246' : '255,255,255')
        });
      }
      flares = [];
      var nf = Math.max(2, Math.round(W * H / 380000));
      for (var k = 0; k < nf; k++) flares.push({ x: Math.random() * W, y: Math.random() * H, s: 7 + Math.random() * 9, p: Math.random() * 6.28 });
    }
    function draw(now) {
      var sc = opt.parallax && !still ? (window.scrollY || 0) : 0;
      var t = still ? 0 : now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var y = (s.y - sc * s.d) % H; if (y < 0) y += H;
        var a = s.t ? s.a * (0.55 + 0.45 * Math.sin(t * s.t + s.p)) : s.a;
        ctx.fillStyle = 'rgba(' + s.c + ',' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.2832); ctx.fill();
      }
      for (var k = 0; k < flares.length; k++) {
        var f = flares[k], fy = (f.y - sc * 0.09) % H; if (fy < 0) fy += H;
        var fa = 0.55 + 0.45 * Math.sin(t * 0.7 + f.p), L = f.s * (0.8 + 0.2 * fa);
        var g = ctx.createRadialGradient(f.x, fy, 0, f.x, fy, L * 1.6);
        g.addColorStop(0, 'rgba(160,236,244,' + (0.5 * fa).toFixed(3) + ')'); g.addColorStop(1, 'rgba(95,211,222,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, fy, L * 1.6, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(240,255,255,' + (0.85 * fa).toFixed(3) + ')';
        ctx.fillRect(f.x - L, fy - 0.6, L * 2, 1.2);
        ctx.fillRect(f.x - 0.6, fy - L, 1.2, L * 2);
      }
    }
    function loop(now) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;                   // ~30 frames a second is plenty for stars
      last = now; draw(now);
    }
    var resizeT;
    addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () { if (running || !opt.lazy) { seed(); draw(performance.now()) } }, 150);
    });
    return {
      start: function () {
        if (running) return; seed(); draw(performance.now());
        if (still) return;
        running = true; raf = requestAnimationFrame(loop);
      },
      stop: function () { running = false; cancelAnimationFrame(raf) }
    };
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', build);
  else build();
})();
