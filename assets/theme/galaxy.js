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
    var orbMark = oMark(orb.querySelector('.gx-orb-cv'), { fit: 12, dust: 60 });
    var bigMark = oMark(menu.querySelector('.gx-mark-cv'), { fit: 8.6, dust: 200, lazy: true });

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
     The Ö in three dimensions, cut like a crystal and drawn on a 2D canvas.
     No tubes and no spheres: every surface is a flat cut.
       The ring — 24 straight segments. In section each is a six-sided cut:
         a flat table facing you, a bevel either side of it, and the same
         again on the back, so the ring is a thin, sharp-edged band.
       The dots — two small gems: an octagonal table, eight crown facets and
         eight pavilion facets running to a point behind.
     Each face is flat-shaded from a light above and to the left, with a
     specular flash and a cool rim light from behind, so as the Ö turns the
     cuts catch and lose the light one at a time. Its glow breathes, and
     now and then stutters like a tube light. Sky dust, sharp single points,
     orbits it on tilted paths and swirls a little as the page turns.
     Units: the ring's radius is 1. `fit` is how many units span the canvas.
     ====================================================================== */
  function oMark(cv, opt) {
    var ctx = cv.getContext('2d');
    var dead = { start: noop, stop: noop, turn: noop, kick: noop, angle: function () { return 0 } };
    if (!ctx) return dead;
    var SEG = 24, HW = 0.082, HZ = 0.05, DOTX = 0.4, DOTY = -1.45, DR = 0.17, LIFT = 0.27, CAM = 7;
    var W = 0, H = 0, dpr = 1, U = 1, running = false, raf = 0, last = 0;
    var target = 0, turn = 0, kickAt = -1;
    var flick = [], nextFlick = 0;

    /* ---- the solid: a list of flat faces, each with its outward normal ---- */
    var faces = [];
    function face(pts, out) {
      // normal from the winding, turned to point away from `out`'s inside
      var a = pts[0], b = pts[1], c = pts[pts.length - 1];
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      var cx = 0, cy = 0, cz = 0;
      for (var i = 0; i < pts.length; i++) { cx += pts[i][0]; cy += pts[i][1]; cz += pts[i][2] }
      cx /= pts.length; cy /= pts.length; cz /= pts.length;
      if (nx * (cx - out[0]) + ny * (cy - out[1]) + nz * (cz - out[2]) < 0) { nx = -nx; ny = -ny; nz = -nz }
      var l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      faces.push({ p: pts, n: [nx / l, ny / l, nz / l], c: [cx, cy, cz] });
    }
    // the ring's section, as (radius offset, depth) pairs round the band
    var SECT = [[HW, 0], [HW * 0.42, HZ], [-HW * 0.42, HZ], [-HW, 0], [-HW * 0.42, -HZ], [HW * 0.42, -HZ]];
    for (var s = 0; s < SEG; s++) {
      var a0 = (s / SEG) * 6.2832, a1 = ((s + 1) / SEG) * 6.2832, am = (a0 + a1) / 2;
      for (var k = 0; k < SECT.length; k++) {
        var p = SECT[k], q = SECT[(k + 1) % SECT.length];
        face([
          [(1 + p[0]) * Math.cos(a0), (1 + p[0]) * Math.sin(a0), p[1]],
          [(1 + p[0]) * Math.cos(a1), (1 + p[0]) * Math.sin(a1), p[1]],
          [(1 + q[0]) * Math.cos(a1), (1 + q[0]) * Math.sin(a1), q[1]],
          [(1 + q[0]) * Math.cos(a0), (1 + q[0]) * Math.sin(a0), q[1]]
        ], [Math.cos(am), Math.sin(am), 0]);
      }
    }
    // a gem: octagonal table, crown, pavilion to a culet
    function gem(gx, gy) {
      var girdle = [], table = [], o = [gx, gy, 0];
      for (var i = 0; i < 8; i++) {
        var t = (i / 8) * 6.2832 + 0.3927;
        girdle.push([gx + DR * Math.cos(t), gy + DR * Math.sin(t), 0]);
        table.push([gx + DR * 0.52 * Math.cos(t), gy + DR * 0.52 * Math.sin(t), DR * 0.42]);
      }
      face(table.slice(), o);
      for (var j = 0; j < 8; j++) {
        var n = (j + 1) % 8;
        face([girdle[j], girdle[n], table[n], table[j]], o);
        face([girdle[j], girdle[n], [gx, gy, -DR * 0.95]], o);
      }
    }
    gem(-DOTX, DOTY); gem(DOTX, DOTY);
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
        spinIn = -300 * Math.pow(1 - pk, 3);
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

      /* glow: the ring's mid-line and the two gems, blurred, in light only */
      ctx.globalCompositeOperation = 'lighter';
      var cc = proj(rot([0, -0.25, 0])), aura = ctx.createRadialGradient(cc[0], cc[1], U * 0.4, cc[0], cc[1], U * 2.3);
      aura.addColorStop(0, 'rgba(60,190,205,' + (0.16 * I).toFixed(3) + ')'); aura.addColorStop(1, 'rgba(60,190,205,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(cc[0], cc[1], U * 2.3, 0, 6.2832); ctx.fill();
      ctx.beginPath();
      for (var g = 0; g < MID.length; g++) { var mp = proj(rot(MID[g])); if (g) ctx.lineTo(mp[0], mp[1]); else ctx.moveTo(mp[0], mp[1]) }
      ctx.closePath();
      ctx.lineWidth = HW * U;
      ctx.strokeStyle = 'rgba(110,222,232,' + (0.6 * I).toFixed(3) + ')';
      ctx.shadowColor = 'rgba(95,211,222,' + Math.min(1, I).toFixed(3) + ')';
      ctx.shadowBlur = U * 1.1 * dpr; ctx.stroke();
      ctx.shadowBlur = U * 0.45 * dpr; ctx.stroke();
      ctx.shadowBlur = U * 0.15 * dpr; ctx.stroke();
      var g1 = proj(rot([-DOTX, DOTY, 0])), g2 = proj(rot([DOTX, DOTY, 0]));
      ctx.fillStyle = 'rgba(110,222,232,' + (0.6 * I).toFixed(3) + ')';
      ctx.shadowBlur = U * 0.6 * dpr;
      ctx.beginPath(); ctx.arc(g1[0], g1[1], DR * U * 0.8, 0, 6.2832); ctx.arc(g2[0], g2[1], DR * U * 0.8, 0, 6.2832); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      ctx.globalCompositeOperation = 'source-over';

      /* the cuts: front-facing faces, far to near, flat-shaded */
      var vis = [];
      for (var f = 0; f < faces.length; f++) {
        var F = faces[f], n = rot(F.n), c = rot(F.c);
        // facing the camera, allowing for perspective
        if (n[0] * -c[0] + n[1] * -c[1] + n[2] * (CAM - c[2]) <= 0) continue;
        vis.push({ F: F, n: n, z: c[2] });
      }
      vis.sort(function (a, b) { return a.z - b.z });
      var edge = Math.max(0.5, U * 0.012), glints = [];
      ctx.lineJoin = 'round';
      for (var vi = 0; vi < vis.length; vi++) {
        var it = vis[vi], N = it.n;
        // crystal: hard contrast between cuts — some deep, some near white —
        // and two lights, so as it turns a different cut flashes
        var dif = Math.max(0, N[0] * KEY[0] + N[1] * KEY[1] + N[2] * KEY[2]);
        var dif2 = Math.max(0, N[0] * KEY2[0] + N[1] * KEY2[1] + N[2] * KEY2[2]);
        var spec = Math.pow(Math.max(0, N[0] * HALF[0] + N[1] * HALF[1] + N[2] * HALF[2]), 22)
          + 0.8 * Math.pow(Math.max(0, N[0] * HALF2[0] + N[1] * HALF2[1] + N[2] * HALF2[2]), 22);
        var rim = Math.pow(Math.max(0, N[0] * RIM[0] + N[1] * RIM[1] + N[2] * RIM[2]), 2);
        var lum = Math.min(1, 0.1 + 0.62 * Math.pow(dif, 1.6) + 0.38 * dif2 * dif2);
        var r = (16 + 196 * lum + 30 * rim) * B + 255 * spec;
        var gg = (70 + 176 * lum + 80 * rim) * B + 255 * spec;
        var bb = (90 + 162 * lum + 80 * rim) * B + 255 * spec;
        var col = 'rgb(' + Math.min(255, r | 0) + ',' + Math.min(255, gg | 0) + ',' + Math.min(255, bb | 0) + ')';
        ctx.beginPath();
        var P0;
        for (var pi = 0; pi < it.F.p.length; pi++) {
          var pp = proj(rot(it.F.p[pi]));
          if (pi) ctx.lineTo(pp[0], pp[1]); else { ctx.moveTo(pp[0], pp[1]); P0 = pp }
        }
        ctx.closePath();
        ctx.fillStyle = col; ctx.fill();
        // the cut line: a hair of light along each edge
        ctx.strokeStyle = 'rgba(236,252,255,' + Math.min(1, 0.26 + 0.6 * spec + 0.2 * lum).toFixed(3) + ')';
        ctx.lineWidth = edge; ctx.stroke();
        if (spec > 0.55) glints.push([P0, spec]);
      }

      /* where a cut catches the light full on, a pin of white */
      ctx.globalCompositeOperation = 'lighter';
      for (var gi = 0; gi < glints.length && gi < 6; gi++) {
        var gp = glints[gi][0], ga = Math.min(1, (glints[gi][1] - 0.55) * 2.2) * I, L = U * 0.16;
        ctx.fillStyle = 'rgba(255,255,255,' + ga.toFixed(3) + ')';
        ctx.fillRect(gp[0] - L, gp[1] - 0.4, L * 2, 0.8);
        ctx.fillRect(gp[0] - 0.4, gp[1] - L, 0.8, L * 2);
      }
      ctx.globalCompositeOperation = 'source-over';

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
        var rg = g.createRadialGradient(x, y, 0, x, y, s.r * 2);
        rg.addColorStop(0, 'rgba(' + s.c + ',' + (a * 0.2).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(' + s.c + ',0)');
        g.fillStyle = rg; g.beginPath(); g.arc(x, y, s.r * 2, 0, 6.2832); g.fill();
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
