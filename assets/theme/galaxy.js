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
        '<canvas class="gx-menu-sky" aria-hidden="true"></canvas>' +
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
    var orbMark = oMark(orb.querySelector('.gx-orb-cv'), { fit: 12, dust: 60, inner: 70 });
    var bigMark = oMark(menu.querySelector('.gx-mark-cv'), { fit: 7.2, dust: 200, inner: 300, lazy: true });

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
        bigMark.settle(orbMark.angle()); bigMark.start(); menuSky.start(); orbMark.stop();
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

  /* The Ö's material: crushed ice, one texture shared by every Ö on the page.
     Cells of frosted crystal, each its own layer of colour — deep teal-blue,
     cyan, ice, a pale blue-violet, near white — in a cloud that brightens
     and dims them, whiter along the cracks between cells, thinner (more
     see-through) in the deeper cells, and a scatter of specks, most white,
     a few with a diamond's fire. Made once, on first use. */
  var FROST = null;
  function frost() {
    if (FROST) return FROST;
    var N = 256, G = 9, cells = Math.ceil(N / G), c = doc.createElement('canvas');
    c.width = c.height = N;
    var x = c.getContext('2d'), img = x.createImageData(N, N), d = img.data, i, j;
    var pts = [];
    var PAL = [[38, 124, 168], [96, 206, 228], [178, 236, 246], [160, 184, 250], [236, 250, 255]], CUM = [0.16, 0.5, 0.82, 0.92, 1];
    function pick() { var r = Math.random(), q = 0; while (r > CUM[q]) q++; return PAL[q] }
    for (j = 0; j < cells; j++) for (i = 0; i < cells; i++) pts.push([(i + Math.random()) * G, (j + Math.random()) * G, pick()]);
    var L = 32, lat = [];
    for (i = 0; i < L * L; i++) lat.push(Math.random());
    function sstep(a, b, v) { var q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) }
    function vn(px, py) {
      var ix = Math.floor(px), iy = Math.floor(py), fx = px - ix, fy = py - iy;
      var a = lat[((iy % L) + L) % L * L + ((ix % L) + L) % L], b = lat[((iy % L) + L) % L * L + (((ix + 1) % L) + L) % L];
      var cc = lat[(((iy + 1) % L) + L) % L * L + ((ix % L) + L) % L], dd = lat[(((iy + 1) % L) + L) % L * L + (((ix + 1) % L) + L) % L];
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      return a + (b - a) * fx + (cc - a) * fy + (a - b - cc + dd) * fx * fy;
    }
    for (var py = 0; py < N; py++) for (var px = 0; px < N; px++) {
      var gx = Math.floor(px / G), gy = Math.floor(py / G), f1 = 1e9, f2 = 1e9, tone = PAL[1];
      for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) {
        var cx = gx + ox, cy = gy + oy;
        if (cx < 0 || cy < 0 || cx >= cells || cy >= cells) continue;
        var p = pts[cy * cells + cx], dx = p[0] - px, dy = p[1] - py, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < f1) { f2 = f1; f1 = dist; tone = p[2] } else if (dist < f2) f2 = dist;
      }
      var crack = Math.max(0, 1 - (f2 - f1) / 1.8);
      var cloud = 0.6 * vn(px / 18, py / 18) + 0.4 * vn(px / 6, py / 6);
      // colour in soft layers rather than tiles: cyan to ice by the cloud, with
      // drifts of deep teal-blue and pale violet through it; the cell's own
      // colour only tints it, and the cracks are faint
      var deep = sstep(0.6, 0.86, vn(px / 26 + 7.3, py / 26 + 3.1)), viol = sstep(0.66, 0.92, vn(px / 30 + 13.7, py / 30 + 21.2));
      var r0 = 96 + 100 * cloud, g0 = 206 + 34 * cloud, b0 = 228 + 20 * cloud;
      r0 += (44 - r0) * deep * 0.7; g0 += (130 - g0) * deep * 0.7; b0 += (176 - b0) * deep * 0.7;
      r0 += (170 - r0) * viol * 0.6; g0 += (190 - g0) * viol * 0.6; b0 += (250 - b0) * viol * 0.6;
      r0 += (tone[0] - r0) * 0.2; g0 += (tone[1] - g0) * 0.2; b0 += (tone[2] - b0) * 0.2;
      var wh = Math.min(1, 0.16 + 0.32 * crack + 0.22 * cloud);
      var k = (py * N + px) * 4;
      d[k] = r0 + (252 - r0) * wh; d[k + 1] = g0 + (255 - g0) * wh; d[k + 2] = b0 + (255 - b0) * wh;
      var lum = (0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2]) / 255;
      d[k + 3] = 255 * Math.min(1, 0.5 + 0.55 * lum);
    }
    var FIRE = [[255, 214, 236], [255, 240, 196], [206, 190, 255], [190, 255, 236]];
    for (i = 0; i < 300; i++) {                        // specks: most white, a few with a diamond's fire
      var s = (Math.floor(Math.random() * N) * N + Math.floor(Math.random() * N)) * 4;
      var fc = Math.random() < 0.15 ? FIRE[i % 4] : [255, 255, 255];
      d[s] = fc[0]; d[s + 1] = fc[1]; d[s + 2] = fc[2]; d[s + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return (FROST = c);
  }

  /* ======================================================================
     The Ö in three dimensions, drawn on a 2D canvas, made to read as the
     lockup does: a flat band of crushed diamond, not a modelled object.
       The ring — a round band with four faces: a flat front, a flat back,
         the outer edge and the inner edge. The face is crushed ice you can
         half see through (frost()), with crisp near-white edges, and
         particles suspended inside it at their own depths, drifting and
         twinkling, so they shift against one another as it turns.
       The dots — spheres of the same ice, with their own life inside.
     The glow is a soft base all round plus patches that swell and fade on
     their own, so it is never even and never still; it breathes, and now
     and then stutters like a tube light. Sky dust, sharp single points,
     orbits it on tilted paths and swirls a little as the page turns.
     Units: the ring's radius is 1. `fit` is how many units span the canvas.
     ====================================================================== */
  function oMark(cv, opt) {
    var ctx = cv.getContext('2d');
    var dead = { start: noop, stop: noop, turn: noop, kick: noop, settle: noop, angle: function () { return 0 } };
    if (!ctx) return dead;
    var NS = 120, HW = 0.105, HZ = 0.04, DOTX = 0.41, DOTY = -1.38, DR = 0.18, LIFT = 0.23, CAM = 7;
    var W = 0, H = 0, dpr = 1, U = 1, running = false, raf = 0, last = 0;
    var target = 0, turn = 0, kickAt = -1, kickBy = -300;
    var flick = [], nextFlick = 0;

    /* ---- the solid: the band's outer and inner circle, sampled finely ---- */
    var RO = 1 + HW, RI = 1 - HW, COS = [], SIN = [];
    for (var ci = 0; ci <= NS; ci++) { COS.push(Math.cos(ci / NS * 6.2832)); SIN.push(Math.sin(ci / NS * 6.2832)) }
    // what lives in and around the band
    var LIVE = [];                                       // particles suspended inside the crystal
    for (var li = 0; li < (opt.inner || 80); li++) LIVE.push({
      a: Math.random() * 6.2832, r: (Math.random() * 2 - 1) * HW * 0.82, z: (Math.random() * 2 - 1) * HZ * 0.9,
      w: (Math.random() - 0.5) * 0.06, s: Math.random() < 0.18 ? 1.8 : 1, tw: 0.8 + Math.random() * 3, p: Math.random() * 6.28,
      c: (function (r) { return r < 0.68 ? '255,255,255' : r < 0.84 ? '170,240,250' : r < 0.95 ? '190,205,255' : '255,226,240' })(Math.random())
    });
    var DOTLIVE = [];                                    // and inside each dot
    for (var dl = 0; dl < (opt.inner || 80) / 6; dl++) DOTLIVE.push({
      d: dl % 2, rr: Math.sqrt(Math.random()) * 0.8, a: Math.random() * 6.2832, w: (Math.random() - 0.5) * 0.4,
      s: Math.random() < 0.2 ? 1.8 : 1, tw: 0.8 + Math.random() * 3, p: Math.random() * 6.28
    });
    var BLOOM = [];                                      // the glow: patches that swell and fade on their own
    var HUES = ['120,230,240', '70,160,230', '110,236,214', '150,200,255'];
    for (var bi = 0; bi < 26; bi++) BLOOM.push({ h: HUES[bi % 4],
      a: (bi + Math.random() * 0.6) / 26 * 6.2832, amp: 0.35 + Math.random() * 0.65,
      f: 0.35 + Math.random() * 1.1, p: Math.random() * 6.28, f2: 1.7 + Math.random() * 2.4
    });
    var DOTBLOOM = [0, 1].map(function () { return { f: 0.4 + Math.random() * 0.9, p: Math.random() * 6.28 } });
    // the ring's mid-line, for the glow under it
    var MID = [];
    for (var m = 0; m < 48; m++) MID.push([Math.cos(m / 48 * 6.2832), Math.sin(m / 48 * 6.2832), 0]);

    /* ---- light: a key from above left, a cool rim from behind right ---- */
    function norm(v) { var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); return [v[0] / l, v[1] / l, v[2] / l] }
    var KEY = norm([-0.42, -0.6, 0.68]), KEY2 = norm([0.6, -0.3, 0.74]), RIM = norm([0.7, 0.35, -0.2]);
    var HALF = norm([KEY[0], KEY[1], KEY[2] + 1]), HALF2 = norm([KEY2[0], KEY2[1], KEY2[2] + 1]);

    /* ---- sky dust ---- */
    var dust = [];
    for (var d = 0; d < opt.dust; d++) {
      var qd = 1.55 + Math.pow(Math.random(), 0.8) * 2.9;
      dust.push({
        q: qd, a: Math.random() * 6.2832, w: (0.08 + Math.random() * 0.22) / Math.sqrt(qd) * (Math.random() < 0.85 ? 1 : -1),
        tx: (Math.random() - 0.5) * 1.6, tz: (Math.random() - 0.5) * 0.9,
        bob: 0.05 + Math.random() * 0.22, bs: 0.2 + Math.random() * 0.5, p: Math.random() * 6.28,
        big: Math.random() < 0.14, tw: 0.4 + Math.random() * 1.4,
        c: Math.random() < 0.3 ? '150,232,240' : (Math.random() < 0.5 ? '222,244,250' : '255,255,255')
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

    var cY = 1, sY = 0, cX = 1, sX = 0;
    function rot(v) {                                   // about Y (the scroll), then X (a slow sway)
      var x1 = v[0] * cY + v[2] * sY, z1 = -v[0] * sY + v[2] * cY;
      return [x1, v[1] * cX - z1 * sX, v[1] * sX + z1 * cX];
    }
    function proj(v) {
      var k = CAM / (CAM - v[2]);
      return [W / 2 + v[0] * k * U, H / 2 + (v[1] * k + LIFT) * U, v[2]];
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
        spinIn = kickBy * Math.pow(1 - pk, 3);
        if (pk >= 1) kickAt = -1;
      }
      var ry = (turn + spinIn + (still ? 0 : 7 * Math.sin(t * 0.33))) * Math.PI / 180;
      var rx = (still ? 0 : 6 * Math.sin(t * 0.27 + 0.8)) * Math.PI / 180;
      cY = Math.cos(ry); sY = Math.sin(ry); cX = Math.cos(rx); sX = Math.sin(rx);
      var I = glowLevel(t), B = 0.78 + 0.22 * I;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      /* dust behind */
      var swirl = turn * Math.PI / 180 * 0.4, front = [];
      for (var di = 0; di < dust.length; di++) {
        var o = dust[di];
        var A = o.a + (still ? 0 : o.w * t) + swirl;
        var px = o.q * Math.cos(A), pz = o.q * Math.sin(A), py = o.bob * Math.sin(t * o.bs + o.p);
        var c1 = Math.cos(o.tx), s1 = Math.sin(o.tx), y2 = py * c1 - pz * s1, z2 = py * s1 + pz * c1;
        var c2 = Math.cos(o.tz), s2 = Math.sin(o.tz);
        var pr = proj([px * c2 - y2 * s2, px * s2 + y2 * c2, z2]);
        if (pr[2] > 0.2) front.push([o, pr]); else mote(o, pr, t, 0.6);
      }

      /* the glow, in light only: a soft base all round, then patches that
         swell and fade on their own, so it is never even and never still */
      ctx.globalCompositeOperation = 'lighter';
      var cc = proj(rot([0, -0.2, 0])), aura = ctx.createRadialGradient(cc[0], cc[1], U * 0.5, cc[0], cc[1], U * 2.4);
      aura.addColorStop(0, 'rgba(50,180,198,' + (0.15 * I).toFixed(3) + ')'); aura.addColorStop(1, 'rgba(50,180,198,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(cc[0], cc[1], U * 2.4, 0, 6.2832); ctx.fill();
      ctx.beginPath();
      for (var g = 0; g < MID.length; g++) { var mp = proj(rot(MID[g])); if (g) ctx.lineTo(mp[0], mp[1]); else ctx.moveTo(mp[0], mp[1]) }
      ctx.closePath();
      ctx.lineWidth = 2 * HW * U;
      ctx.strokeStyle = 'rgba(40,110,210,' + (0.22 * I).toFixed(3) + ')';    // the outermost layer: blue
      ctx.shadowColor = 'rgba(40,110,210,' + (0.6 * I).toFixed(3) + ')';
      ctx.shadowBlur = U * 1.4 * dpr; ctx.stroke();
      ctx.strokeStyle = 'rgba(80,204,218,' + (0.5 * I).toFixed(3) + ')';
      ctx.shadowColor = 'rgba(80,204,218,' + Math.min(1, 0.85 * I).toFixed(3) + ')';
      ctx.shadowBlur = U * 0.8 * dpr; ctx.stroke();
      ctx.shadowBlur = U * 0.3 * dpr; ctx.stroke();
      ctx.shadowColor = 'rgba(160,238,246,' + Math.min(1, 0.9 * I).toFixed(3) + ')';
      ctx.shadowBlur = U * 0.12 * dpr; ctx.stroke();
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      for (var bl = 0; bl < BLOOM.length; bl++) {
        var bo = BLOOM[bl], pulse = still ? 0.6 : 0.5 + 0.5 * Math.sin(t * bo.f + bo.p);
        pulse = pulse * pulse * (0.75 + 0.25 * Math.sin(t * bo.f2 + bo.p * 3));
        var wgt = I * bo.amp * pulse; if (wgt < 0.04) continue;
        var bp = proj(rot([Math.cos(bo.a) * (1 + HW * 0.9), Math.sin(bo.a) * (1 + HW * 0.9), 0])), br = U * (0.32 + 0.38 * pulse * bo.amp);
        var bg = ctx.createRadialGradient(bp[0], bp[1], 0, bp[0], bp[1], br);
        bg.addColorStop(0, 'rgba(' + bo.h + ',' + (0.55 * wgt).toFixed(3) + ')'); bg.addColorStop(1, 'rgba(' + bo.h + ',0)');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bp[0], bp[1], br, 0, 6.2832); ctx.fill();
      }
      var dots = [proj(rot([-DOTX, DOTY, 0])), proj(rot([DOTX, DOTY, 0]))];
      for (var dg = 0; dg < 2; dg++) {
        var db = DOTBLOOM[dg], dpul = still ? 0.6 : 0.55 + 0.45 * Math.sin(t * db.f + db.p);
        var dr0 = DR * U * (1.9 + 0.8 * dpul), dgr = ctx.createRadialGradient(dots[dg][0], dots[dg][1], DR * U * 0.6, dots[dg][0], dots[dg][1], dr0);
        dgr.addColorStop(0, 'rgba(110,226,236,' + (0.5 * I * (0.6 + 0.4 * dpul)).toFixed(3) + ')'); dgr.addColorStop(1, 'rgba(60,190,205,0)');
        ctx.fillStyle = dgr; ctx.beginPath(); ctx.arc(dots[dg][0], dots[dg][1], dr0, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      /* the band */
      function seen(n, c) { return n[0] * -c[0] + n[1] * -c[1] + n[2] * (CAM - c[2]) > 0 }
      // the face towards you: the front, or once it has turned past edge-on, the back
      var fn = rot([0, 0, 1]), fz = HZ;
      if (!seen(fn, rot([0, 0, HZ]))) { fn = [-fn[0], -fn[1], -fn[2]]; fz = -HZ }
      // the outer and inner edges, pale ice, only where they face you
      var strips = [];
      for (var e = 0; e < NS; e++) {
        var cm = (COS[e] + COS[e + 1]) / 2, sm = (SIN[e] + SIN[e + 1]) / 2;
        for (var side = 0; side < 2; side++) {
          var R = side ? RI : RO, sg = side ? -1 : 1;
          var n = rot([cm * sg, sm * sg, 0]), c = rot([cm * R, sm * R, 0]);
          if (!seen(n, c)) continue;
          strips.push({ z: c[2], n: n, q: [
            proj(rot([COS[e] * R, SIN[e] * R, HZ])), proj(rot([COS[e + 1] * R, SIN[e + 1] * R, HZ])),
            proj(rot([COS[e + 1] * R, SIN[e + 1] * R, -HZ])), proj(rot([COS[e] * R, SIN[e] * R, -HZ]))] });
        }
      }
      strips.sort(function (a, b) { return a.z - b.z });
      ctx.lineJoin = 'round'; ctx.lineWidth = 0.6;
      for (var si = 0; si < strips.length; si++) {
        var st = strips[si], N = st.n;
        var l2 = 0.75 + 0.25 * Math.max(0, N[0] * KEY[0] + N[1] * KEY[1] + N[2] * KEY[2]);
        var col = 'rgba(' + (190 * l2 * B | 0) + ',' + (238 * l2 * B | 0) + ',' + (246 * l2 * B | 0) + ',0.9)';
        ctx.beginPath(); ctx.moveTo(st.q[0][0], st.q[0][1]);
        for (var qi = 1; qi < 4; qi++) ctx.lineTo(st.q[qi][0], st.q[qi][1]);
        ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = col; ctx.stroke();
      }
      // the face: crushed ice you can half see through, with life inside it
      var outer = [], inner = [];
      for (var k = 0; k <= NS; k++) {
        outer.push(proj(rot([COS[k] * RO, SIN[k] * RO, fz])));
        inner.push(proj(rot([COS[k] * RI, SIN[k] * RI, fz])));
      }
      ctx.beginPath();
      ctx.moveTo(outer[0][0], outer[0][1]); for (k = 1; k <= NS; k++) ctx.lineTo(outer[k][0], outer[k][1]);
      ctx.moveTo(inner[NS][0], inner[NS][1]); for (k = NS - 1; k >= 0; k--) ctx.lineTo(inner[k][0], inner[k][1]);
      ctx.closePath();
      ctx.save(); ctx.clip('evenodd');
      var o0 = proj(rot([0, 0, fz])), ox = proj(rot([1, 0, fz])), oy = proj(rot([0, 1, fz]));
      ctx.globalAlpha = 0.72 + 0.2 * B;
      ctx.setTransform(dpr * (ox[0] - o0[0]), dpr * (ox[1] - o0[1]), dpr * (oy[0] - o0[0]), dpr * (oy[1] - o0[1]), dpr * o0[0], dpr * o0[1]);
      ctx.drawImage(frost(), -RO, -RO, 2 * RO, 2 * RO);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      // a sheen that slides across as it turns
      var cx0 = proj(rot([-RO, 0, fz]))[0], cx1 = proj(rot([RO, 0, fz]))[0];
      if (Math.abs(cx1 - cx0) > 1) {
        var at = 0.5 + 0.42 * Math.sin(ry * 1.3 + 0.9 + (still ? 0 : 0.15 * Math.sin(t * 0.5)));
        var sh = ctx.createLinearGradient(cx0, 0, cx1, 0);
        sh.addColorStop(Math.max(0, at - 0.22), 'rgba(255,255,255,0)');
        sh.addColorStop(at, 'rgba(255,255,255,' + (0.22 * B).toFixed(3) + ')');
        sh.addColorStop(Math.min(1, at + 0.22), 'rgba(255,255,255,0)');
        ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
      }
      // the particles inside: at their own depths, so they shift against one another as it turns
      ctx.globalCompositeOperation = 'lighter';
      for (var pi2 = 0; pi2 < LIVE.length; pi2++) {
        var lp = LIVE[pi2], la = lp.a + (still ? 0 : lp.w * t), lr = 1 + lp.r;
        var pp = proj(rot([Math.cos(la) * lr, Math.sin(la) * lr, lp.z]));
        var ltw = still ? 0.8 : 0.5 + 0.5 * Math.sin(t * lp.tw + lp.p);
        var lal = Math.min(1, (0.35 + 0.75 * ltw * ltw) * B), lsz = lp.s / dpr * (dpr > 1 ? 1.3 : 1);
        ctx.fillStyle = 'rgba(' + lp.c + ',' + lal.toFixed(3) + ')';
        ctx.fillRect(pp[0] - lsz / 2, pp[1] - lsz / 2, lsz, lsz);
        if (lp.s > 1 && ltw > 0.85) {                  // the brightest catch the light like a cut stone
          var Lx = U * 0.045 * (ltw - 0.85) / 0.15;
          ctx.fillStyle = 'rgba(255,255,255,' + (0.7 * lal).toFixed(3) + ')';
          ctx.fillRect(pp[0] - Lx, pp[1] - 0.3, Lx * 2, 0.6); ctx.fillRect(pp[0] - 0.3, pp[1] - Lx, 0.6, Lx * 2);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      // the face's two edges: crisp, near white, lit from within
      ctx.strokeStyle = 'rgba(238,253,255,' + (0.88 * B).toFixed(3) + ')'; ctx.lineWidth = Math.max(0.6, U * 0.022);
      ctx.shadowColor = 'rgba(120,230,240,' + (0.9 * I).toFixed(3) + ')'; ctx.shadowBlur = U * 0.12 * dpr;
      ctx.stroke();
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

      /* the dots: spheres of the same ice, with their own life inside */
      for (var dd = 0; dd < 2; dd++) {
        var dp = dots[dd], r0 = DR * U * (CAM / (CAM - dp[2]));
        ctx.save();
        ctx.beginPath(); ctx.arc(dp[0], dp[1], r0, 0, 6.2832); ctx.clip();
        ctx.globalAlpha = 0.74 + 0.2 * B;
        var F = frost(), sz = F.width * (2 * DR) / (2 * RO);
        ctx.drawImage(F, dd ? F.width * 0.62 : F.width * 0.18, F.height * 0.2, sz, sz, dp[0] - r0, dp[1] - r0, r0 * 2, r0 * 2);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'lighter';
        for (var dq = 0; dq < DOTLIVE.length; dq++) {
          var dlp = DOTLIVE[dq]; if (dlp.d !== dd) continue;
          var dla = dlp.a + (still ? 0 : dlp.w * t), dtw = still ? 0.8 : 0.5 + 0.5 * Math.sin(t * dlp.tw + dlp.p);
          var dsz = dlp.s / dpr * (dpr > 1 ? 1.3 : 1);
          ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, (0.35 + 0.75 * dtw * dtw) * B).toFixed(3) + ')';
          ctx.fillRect(dp[0] + Math.cos(dla) * dlp.rr * r0 - dsz / 2, dp[1] + Math.sin(dla) * dlp.rr * r0 - dsz / 2, dsz, dsz);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        ctx.beginPath(); ctx.arc(dp[0], dp[1], r0, 0, 6.2832);
        ctx.strokeStyle = 'rgba(238,253,255,' + (0.88 * B).toFixed(3) + ')'; ctx.lineWidth = Math.max(0.6, U * 0.022);
        ctx.shadowColor = 'rgba(120,230,240,' + (0.9 * I).toFixed(3) + ')'; ctx.shadowBlur = U * 0.12 * dpr;
        ctx.stroke(); ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      }

      /* dust in front */
      for (var fi = 0; fi < front.length; fi++) mote(front[fi][0], front[fi][1], t, 1);
    }

    // one grain of dust: a sharp point, no bloom
    function mote(o, pr, t, dim) {
      var x = pr[0], y = pr[1];
      var dx = (x - W / 2) / (W / 2), dy = (y - H / 2) / (H / 2);
      var edgeF = 1 - Math.min(1, Math.max(0, (Math.sqrt(dx * dx + dy * dy) - 0.62) / 0.36));  // fade before the canvas edge
      if (edgeF <= 0) return;
      var tw = still ? 0.9 : 0.78 + 0.22 * Math.sin(t * o.tw + o.p);
      var a = Math.min(1, tw * edgeF * dim * (o.big ? 1 : 0.8));
      var s = (o.big ? 1.5 : 1) / dpr * (dpr > 1 ? 1.2 : 1);
      ctx.fillStyle = 'rgba(' + o.c + ',' + a.toFixed(3) + ')';
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }

    function loop(now) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      // full rate while it is turning, half rate at rest
      if (turn === target && kickAt < 0 && now - last < 30) return;
      last = now; draw(now);
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
      kick: function () { if (!still) { kickBy = -300; kickAt = performance.now() } },
      // spin in from an angle and come to rest facing front, the way the lockup reads
      settle: function (from) {
        var front = 360 * Math.ceil(from / 360);
        if (front - from < 60) front += 360;              // always at least a short turn
        target = turn = still ? 0 : front;
        if (!still) { kickBy = from - front; kickAt = performance.now() }
      },
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
     fixed overlay — the column's glow and a lens vignette. The two layers drift at different speeds as the
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
      // a phone gets the same sky as a desktop, fitted to its screen: as many
      // stars per screen, each a little finer — not a sparse cut-out of it
      var fill = Math.max(1, 1.5e6 / (w * ht)), f = Math.max(0.68, 1 / Math.sqrt(fill)), fb = Math.max(0.72, f);
      var area = w * ht * fill, px1 = 1 / D, grain = Math.max(px1, 0.5);
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
            var r = (0.3 + m * 0.65) * f, al = 0.3 + m * 0.7;
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
            var star = { x: x, y: y, r: (0.65 + mb * 0.9) * fb, a: 0.55 + mb * 0.45, c: tint(), f: 0.8 + Math.random() * 2.6, p: Math.random() * 6.28 };
            if (tw.length < 110 && Math.random() < 0.6) { tw.push(star); continue }
            (function (star) { wrapped(star.y, 12, function (yy) { glowStar(h, star, star.x, yy, star.a) }) })(star);
          }
          var crosses = Math.max(2, Math.round(area / 420000));
          for (i = 0; i < crosses; i++) {
            x = W / 2 + gauss() * W * 0.22; y = Math.random() * H;
            var L = (7 + Math.random() * 10) * fb;
            (function (x, L) { wrapped(y, L * 2, function (yy) { crossStar(h, x, yy, L, 0.85) }) })(x, L);
          }
        }),

        /* fixed overlay: the column's glow and the vignette */
        at(function () {
          no = canvas(); var v = no.g;
          var cg = v.createLinearGradient(0, 0, W, 0);
          cg.addColorStop(0, 'rgba(20,110,128,0)'); cg.addColorStop(0.32, 'rgba(20,110,128,0.035)');
          cg.addColorStop(0.5, 'rgba(48,170,186,0.09)'); cg.addColorStop(0.68, 'rgba(20,110,128,0.035)'); cg.addColorStop(1, 'rgba(20,110,128,0)');
          v.fillStyle = cg; v.fillRect(0, 0, W, H);
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
        var rg = g.createRadialGradient(x, y, 0, x, y, s.r * 1.5);
        rg.addColorStop(0, 'rgba(' + s.c + ',' + (a * 0.14).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(' + s.c + ',0)');
        g.fillStyle = rg; g.beginPath(); g.arc(x, y, s.r * 1.5, 0, 6.2832); g.fill();
      }
      g.fillStyle = 'rgba(255,255,255,' + Math.min(1, a * 1.15).toFixed(3) + ')';
      g.beginPath(); g.arc(x, y, s.r * 0.55, 0, 6.2832); g.fill();
    }
    // a lens's diffraction cross: a pin-sharp core and four thin spikes that
    // taper to nothing — white at the heart, then ice, cyan and blue to the tips
    function crossStar(g, x, y, L, a) {
      var core = g.createRadialGradient(x, y, 0, x, y, 2.4);
      core.addColorStop(0, 'rgba(255,255,255,' + a + ')');
      core.addColorStop(0.45, 'rgba(220,244,255,' + (a * 0.45).toFixed(3) + ')');
      core.addColorStop(1, 'rgba(150,210,255,0)');
      g.fillStyle = core; g.beginPath(); g.arc(x, y, 2.4, 0, 6.2832); g.fill();
      var DX = [1, -1, 0, 0], DY = [0, 0, 1, -1], w0 = 0.7;
      for (var k = 0; k < 4; k++) {
        var dx = DX[k], dy = DY[k], gr = g.createLinearGradient(x, y, x + dx * L, y + dy * L);
        gr.addColorStop(0, 'rgba(255,255,255,' + a + ')');
        gr.addColorStop(0.22, 'rgba(214,240,255,' + (a * 0.8).toFixed(3) + ')');
        gr.addColorStop(0.6, 'rgba(120,206,240,' + (a * 0.42).toFixed(3) + ')');
        gr.addColorStop(1, 'rgba(90,140,255,0)');
        g.fillStyle = gr; g.beginPath();
        if (dx) { g.moveTo(x, y - w0); g.lineTo(x + dx * L, y); g.lineTo(x, y + w0) }
        else { g.moveTo(x - w0, y); g.lineTo(x, y + dy * L); g.lineTo(x + w0, y) }
        g.closePath(); g.fill();
      }
      g.fillStyle = 'rgba(255,255,255,' + a + ')'; g.beginPath(); g.arc(x, y, 0.8, 0, 6.2832); g.fill();
    }

    // between frames when the browser is idle, and within 100ms regardless —
    // the Ö animating can keep a slow phone from ever being idle
    var idle = window.requestIdleCallback
      ? function (f) { return requestIdleCallback(f, { timeout: 100 }) }
      : function (f) { return setTimeout(function () { f({ timeRemaining: function () { return 8 } }) }, 16) };
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
