// Every page: David's lettering inlined from his own SVG files (never typed), the menu, the preview labels.
(function () {
  var d = document, b = d.body;
  // the slot labels (STAND-IN, WAITS FOR) show everywhere but phaora.com
  if (!/(^|\.)phaora\.com$/.test(location.hostname) || /[?&]labels/.test(location.search)) b.classList.add('preview');
  if (/[?&]clean/.test(location.search)) b.classList.remove('preview');

  // the lettering: assets/brand/lettering-ink.svg (packaging/artwork/PHAORA-lettering.svg, solid, in the page's ink) and
  // lettering-offwhite.svg (labels/lettering-offwhite.svg, for a dark ground), inlined at their own proportions
  var cache = {};
  function lettering(kind) {
    if (!cache[kind]) cache[kind] = fetch('assets/brand/lettering-' + kind + '.svg').then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); });
    return cache[kind];
  }
  d.querySelectorAll('[data-lettering]').forEach(function (el) {
    lettering(el.getAttribute('data-lettering')).then(function (t) {
      el.innerHTML = t;
      var s = el.querySelector('svg');
      if (!s) return;
      s.removeAttribute('width'); s.removeAttribute('height');
      s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
      s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }).catch(function () {});
  });

  // the menu (phone)
  var mb = d.querySelector('.menu'), sh = d.getElementById('menu');
  if (mb && sh) mb.addEventListener('click', function () {
    var open = sh.hidden; sh.hidden = !open; mb.setAttribute('aria-expanded', open); b.classList.toggle('menu-open', open);
    mb.textContent = open ? 'Close' : 'Menu';
  });

  // the header steps aside while scrolling down, back on the way up
  var last = 0;
  addEventListener('scroll', function () {
    var y = scrollY; if (b.classList.contains('menu-open')) return;
    b.classList.toggle('scrolled-down', y > 120 && y > last + 2); if (y < last - 2) b.classList.remove('scrolled-down'); last = y;
  }, { passive: true });

  // a size is a choice, nothing more (the register keeps the seat)
  d.querySelectorAll('.sizes').forEach(function (g) {
    g.addEventListener('click', function (e) { var t = e.target.closest('.sz'); if (!t) return;
      g.querySelectorAll('.sz').forEach(function (x) { x.setAttribute('aria-pressed', x === t); }); });
  });

  // the films in slots play, muted, while they are on the screen (the film itself waits for Play)
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target;
      if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }); }, { threshold: .25 });
    d.querySelectorAll('.slot video').forEach(function (v) { if (!v.closest('.filmslot') && !v.closest('#reward')) io.observe(v); });
  }
})();
