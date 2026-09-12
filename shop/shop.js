/* ==========================================================================
   PHAÖRA — Shop behaviour
   Three things: the gold fleck field, the bag, and the mobile drawer.
   No framework, no build step. The shop is static files on a CDN.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- flecks */
  /* The photography sits on a black field with gold flake suspended in it.
     The page repeats that so the product images sit *in* the page rather than
     on top of it. Drawn once to a fixed canvas — no animation loop, because a
     60fps particle field on a product page is a battery bill, not a feature. */
  function drawFlecks() {
    var c = document.getElementById('fleck');
    if (!c) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    /* innerWidth/innerHeight rather than clientWidth: the canvas is fixed to
       the viewport, and reading its own box before the first paint has settled
       gives a collapsed size and a field crammed into one corner. */
    var w = window.innerWidth || c.clientWidth;
    var h = window.innerHeight || c.clientHeight;
    if (!w || !h) return;
    c.style.width = w + 'px'; c.style.height = h + 'px';
    c.width = w * dpr; c.height = h * dpr;
    var x = c.getContext('2d');
    x.scale(dpr, dpr);
    x.clearRect(0, 0, w, h);

    /* the soft light from above */
    var glow = x.createRadialGradient(w * 0.5, -h * 0.08, 0, w * 0.5, -h * 0.08, h * 0.55);
    glow.addColorStop(0, 'rgba(201,167,106,0.13)');
    glow.addColorStop(0.5, 'rgba(201,167,106,0.035)');
    glow.addColorStop(1, 'rgba(201,167,106,0)');
    x.fillStyle = glow;
    x.fillRect(0, 0, w, h);

    /* density scales with area so a phone is not carpeted */
    var n = Math.round((w * h) / 5200);
    n = Math.max(90, Math.min(n, 520));

    for (var i = 0; i < n; i++) {
      var px = Math.random() * w;
      var py = Math.random() * h;
      var r = Math.random();

      if (r > 0.955) {
        /* a flake — an irregular blob with a bloom, the ones you actually see */
        var s = 3 + Math.random() * 5;
        var b = x.createRadialGradient(px, py, 0, px, py, s * 2.6);
        b.addColorStop(0, 'rgba(232,205,143,0.55)');
        b.addColorStop(1, 'rgba(232,205,143,0)');
        x.fillStyle = b;
        x.beginPath(); x.arc(px, py, s * 2.6, 0, 6.283); x.fill();

        x.fillStyle = 'rgba(227,201,139,' + (0.55 + Math.random() * 0.35).toFixed(2) + ')';
        x.beginPath();
        var pts = 5 + Math.floor(Math.random() * 3);
        for (var p = 0; p < pts; p++) {
          var a = (p / pts) * 6.283 + Math.random() * 0.6;
          var rr = s * (0.55 + Math.random() * 0.75);
          var vx = px + Math.cos(a) * rr, vy = py + Math.sin(a) * rr;
          if (p === 0) x.moveTo(vx, vy); else x.lineTo(vx, vy);
        }
        x.closePath(); x.fill();
      } else {
        /* dust */
        var d = 0.4 + Math.random() * 1.1;
        x.fillStyle = 'rgba(201,167,106,' + (0.16 + Math.random() * 0.5).toFixed(2) + ')';
        x.beginPath(); x.arc(px, py, d, 0, 6.283); x.fill();
      }
    }
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(drawFlecks, 220);
  });

  /* ------------------------------------------------------------------- bag */
  var KEY = 'phaora_bag';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
    paint();
  }
  function paint() {
    var n = read().length;
    var badges = document.querySelectorAll('.bag-count');
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = n;
      badges[i].classList.toggle('on', n > 0);
    }
    /* a piece already in the bag reads as in the bag wherever it appears */
    var have = {};
    read().forEach(function (it) { have[it.slug] = 1; });
    var btns = document.querySelectorAll('[data-add]');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('in', !!have[btns[j].getAttribute('data-add')]);
    }
  }

  var Bag = {
    all: read,
    has: function (slug) { return read().some(function (i) { return i.slug === slug; }); },
    add: function (item) {
      var list = read();
      /* every piece is one of one — it is in the bag or it is not, never twice */
      if (list.some(function (i) { return i.slug === item.slug; })) return false;
      list.push(item);
      write(list);
      return true;
    },
    remove: function (slug) {
      write(read().filter(function (i) { return i.slug !== slug; }));
    },
    clear: function () { write([]); }
  };
  window.PhaoraBag = Bag;

  /* delegate every add button on the page */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    var slug = btn.getAttribute('data-add');
    if (Bag.has(slug)) { Bag.remove(slug); return; }
    Bag.add({
      slug: slug,
      name: btn.getAttribute('data-name') || slug,
      price: parseInt(btn.getAttribute('data-price'), 10) || 0,
      img: btn.getAttribute('data-img') || '',
      sub: btn.getAttribute('data-sub') || ''
    });
  });

  /* ---------------------------------------------------------------- drawer */
  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-drawer-open]');
    var shut = e.target.closest('[data-drawer-close]');
    var d = document.getElementById('drawer');
    if (!d) return;
    if (open) { d.classList.add('open'); document.body.style.overflow = 'hidden'; }
    if (shut) { d.classList.remove('open'); document.body.style.overflow = ''; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var d = document.getElementById('drawer');
    if (d && d.classList.contains('open')) {
      d.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ------------------------------------------------------------------ boot */
  function boot() { drawFlecks(); paint(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  /* redraw once more after webfonts and images settle, in case the first pass
     measured a viewport that was still being laid out */
  window.addEventListener('load', drawFlecks);
})();
