// Every page: the wordmark (the logo) inlined from its own SVG files (never typed), the menu, the preview labels.
(function () {
  var d = document, b = d.body;
  // the slot labels (STAND-IN, WAITS FOR) show everywhere but phaora.com
  /* the salon: no preview labels, ever */
  if (/[?&]clean/.test(location.search)) b.classList.remove('preview');

  // the logo: assets/logo/wordmark-dark.svg (data-lettering="ink", on a light ground) and wordmark-light.svg
  // ("offwhite", on a dark one), inlined at their own proportions; one file per colour, used everywhere
  var cache = {};
  function lettering(kind) {
    if (!cache[kind]) cache[kind] = fetch('assets/logo/wordmark-' + ({ ink: 'dark', offwhite: 'light' })[kind] + '.svg').then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); });
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

  // leaving a page: the lamp goes out, a cut to black (about 0.6 s), then the next page
  var veil = d.createElement('div'); veil.className = 'leave'; b.appendChild(veil);
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self' || a.hasAttribute('download')) return;
    var u = new URL(a.href, location.href);
    if (u.origin !== location.origin || /^(mailto|tel):/.test(a.href)) return;
    if (u.pathname === location.pathname && u.hash) return;   // a link within the page
    // the dimmer runs only where a dark page is involved (the lamp's home, the film, the register): light to light is a
    // plain page turn
    var dark = function (p) { return /(^|\/)(index\.html|film\.html|register\.html)?$/.test(p); };
    var from = b.classList.contains('dark'), to = dark(u.pathname);
    if (!from && !to) return;
    try { sessionStorage.setItem('hl', to ? 'dark' : 'up'); } catch (x) {}
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    b.classList.add('leaving');
    setTimeout(function () { location.href = u.href; }, 600);
  });
  addEventListener('pageshow', function () { b.classList.remove('leaving'); });
  // home: once the cream ground is under the header, the header takes the ink
  var lit = d.getElementById('lit');
  if (lit) {
    var onLit = function () { b.classList.toggle('on-lit', lit.getBoundingClientRect().top < 70); };
    addEventListener('scroll', onLit, { passive: true }); onLit();
  }

  // the films in slots play, muted, while they are on the screen (the film itself waits for Play)
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target;
      if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }); }, { threshold: .25 });
    d.querySelectorAll('.slot video').forEach(function (v) { if (!v.closest('.filmslot') && !v.closest('#reward')) io.observe(v); });
  }
})();
