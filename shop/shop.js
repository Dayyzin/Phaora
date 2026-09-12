/* ==========================================================================
   PHAÖRA — Shop behaviour
   Two things: the bag and the chrome (search panel, mobile drawer).
   The gold flake field is CSS — a seamless tile on body, built by
   build-flake-tile.js from the studio plate.
   No framework, no build step. The shop is static files on a CDN.
   ========================================================================== */
(function () {
  'use strict';

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

  /* ---------------------------------------------------------------- search */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-search-open]');
    if (!btn) return;
    var bar = document.getElementById('searchbar');
    if (!bar) return;
    var open = bar.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      var input = document.getElementById('searchInput');
      if (input) input.focus();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var bar = document.getElementById('searchbar');
    if (!bar || !bar.classList.contains('open')) return;
    bar.classList.remove('open');
    var btn = document.querySelector('[data-search-open]');
    if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
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
  function boot() { paint(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
