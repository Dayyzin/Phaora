// A piece, opened from the room (David, 18 Nov, his sketch: "Boxes for tiny preview vertically placed not bottom. And
// right side of it specs and purchase"): on the one white ground, the whole piece on the left, its pictures as tiny
// squares in a column beside it, the name, specs and Reserve on the right. A square shows its picture (a crossfade); a
// swipe across the picture moves on. No spin, no turn, no walk. Built from the room's own article (name, specs, price,
// its link) and assets/pieces/pieces.json (the latest renders, site/build_salon_old.py).
(function () {
  var main = document.getElementById('sets'); if (!main) return;
  var DATA = null, cur = null;
  var P = fetch('assets/pieces/pieces.json').then(function (r) { return r.json(); }).then(function (d) { DATA = d; return d; });
  var E = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var box = document.createElement('div'); box.className = 'pp'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<header class="pp-top"><a class="pp-logo logo" href="#top" aria-label="PHAÖRA"></a><button class="pp-x" type="button">Close</button></header>' +
    '<div class="pp-cols"><div class="pp-main"></div><div class="pp-sq" role="tablist" aria-label="Choose a picture"></div><div class="pp-buy"></div></div>' +
    '<div class="pp-more"></div>';
  document.body.appendChild(box);
  // the logo in the room's ink (the room's own script fills every .logo; this one is made after it)
  fetch('assets/logo/wordmark-dark.svg').then(function (r) { return r.text(); }).then(function (t) {
    box.querySelector('.pp-logo').innerHTML = t.replace(/<!--[\s\S]*?-->/g, '').replace(/fill="#000000"/g, 'fill="currentColor"').replace(/\s(width|height)="[^"]*"/g, ''); });
  var mainEl = box.querySelector('.pp-main'), sq = box.querySelector('.pp-sq'), buy = box.querySelector('.pp-buy'), more = box.querySelector('.pp-more'), at = 0;
  function show(i) {
    var ims = mainEl.querySelectorAll('img'), bs = sq.querySelectorAll('button'); if (!ims.length) return;
    i = (i + ims.length) % ims.length;
    ims[at].classList.remove('on'); bs[at].classList.remove('on'); bs[at].setAttribute('aria-selected', 'false');
    at = i; ims[at].classList.add('on'); bs[at].classList.add('on'); bs[at].setAttribute('aria-selected', 'true');
  }
  function open(it) {
    var id = it.id, d = (DATA || {})[id]; if (!d) return false;
    cur = it; at = 0;
    var name = it.querySelector('.t').textContent, sub = (it.querySelector('.s') || { textContent: '' }).textContent.replace(/\s*·\s*CHAPTER\s*I\s*$/i, '');
    var specs = [].map.call(it.querySelectorAll('.specs.full li'), function (li) { return li.textContent.replace(/\s+/g, ' ').trim(); });
    var price = (it.querySelector('.price') || { textContent: '' }).textContent.trim();
    var href = (it.querySelector('.price') || it.querySelector('.links a') || { getAttribute: function () { return 'https://www.phaora.com/'; } }).getAttribute('href');
    mainEl.innerHTML = d.pics.map(function (p, k) { return '<img' + (k ? '' : ' class="on"') + ' src="' + E(p.src) + '" alt="' + E(name + ', ' + p.label) + '" decoding="async">'; }).join('');
    sq.innerHTML = d.pics.map(function (p, k) { return '<button type="button" role="tab" aria-selected="' + (k ? 'false' : 'true') + '"' + (k ? '' : ' class="on"') + ' aria-label="' + E(p.label) + '"><img src="' + E(p.src) + '" alt=""></button>'; }).join('');
    buy.innerHTML = '<p class="e">Chapter I</p><h1 class="nm">' + E(name) + '</h1><p class="pl">' + E(sub) + '</p>' +
      '<ul class="sp">' + specs.map(function (s) { return '<li>' + E(s) + '</li>'; }).join('') + '</ul>' +
      '<a class="rs" href="' + E(href) + '">Reserve' + (price ? ' · ' + E(price) : '') + '</a>' +
      '<p class="nt">Delivery date confirmed by email.<br>Delivered in the house box.</p>';
    more.innerHTML = d.details.length ? '<dl>' + d.details.map(function (x) { return '<dt>' + E(x[0]) + '</dt><dd>' + E(x[1]) + '</dd>'; }).join('') + '</dl>' : '';
    box.hidden = false; box.scrollTop = 0; document.documentElement.classList.add('pp-open');
    try { history.pushState({ pp: id }, '', '?piece=' + id); } catch (e) {}
    return true;
  }
  function close(fromPop) {
    if (box.hidden) return; box.hidden = true; document.documentElement.classList.remove('pp-open'); cur = null;
    if (!fromPop) try { history.pushState(null, '', location.pathname); } catch (e) {}
  }
  // the room's pieces open here, before the room's own view (capture: it never sees the click)
  main.addEventListener('click', function (e) {
    var it = e.target.closest('.it'); if (!it || e.target.closest('a[href]')) return;
    if (!e.target.closest('.ph, .t, .links span')) return;
    if (!DATA) { e.preventDefault(); e.stopPropagation(); P.then(function () { open(it); }); return; }
    if (open(it)) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  sq.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show([].indexOf.call(sq.children, b)); });
  box.querySelector('.pp-x').addEventListener('click', function () { close(); });
  box.querySelector('.pp-logo').addEventListener('click', function (e) { e.preventDefault(); close(); });
  addEventListener('keydown', function (e) { if (box.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowDown' || e.key === 'ArrowRight') show(at + 1); if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') show(at - 1); });
  addEventListener('popstate', function () { if (!box.hidden) close(true); });
  var x0 = null, y0 = 0;
  mainEl.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  mainEl.addEventListener('touchend', function (e) { if (x0 === null) return; var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) show(at + (dx < 0 ? 1 : -1)); }, { passive: true });
  // a link to ?piece=<id> opens it here
  var q = new URLSearchParams(location.search).get('piece');
  if (q) P.then(function () { var it = document.getElementById(q); if (it) { document.documentElement.classList.remove('viewing'); open(it); } });
})();
