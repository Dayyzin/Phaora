// The grid and the piece page, from assets/shop/catalogue.json (built by build_catalogue.py from the salon's own data).
//   ./                      every piece
//   ./?side=women|men       that side (a piece on both sides is in both)
//   ./?cat=<category>       one category; ./?cat=accessories the accessories together
//   ./?piece=<id>           the piece: the walkaround first where it has one and is priced at WALKAROUND_MIN_USD or
//                           more, then its pictures stacked on the left, the details sticky on the right
var WALKAROUND_MIN_USD = 3000;   // David, 18 Nov: final
var WALKAROUND_ENABLED = true;   // David, 18 Nov: "Walkaround comes back, it's too strong and worked on to throw away"
(function () {
  var app = document.getElementById('app'); if (!app) return;
  var q = new URLSearchParams(location.search), side = q.get('side'), cat = q.get('cat'), pid = q.get('piece');
  var E = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var HOME = (document.querySelector('meta[name="salon-home"]') || { content: './' }).content;
  var title0 = document.title, CAT = window.SALON_CATS || {};
  var usd = function (p) { return +String(p.price).replace(/[^\d]/g, '') || 0; };
  var sides = function (p) { return p.side === 'both' ? ['women', 'men'] : [p.side]; };
  // an image at its own size or smaller, never larger: srcset 1200 and the source's own width
  var img = function (v, alt, sizes, lazy, extra) {
    var ss = v.s1200 ? ' srcset="' + E(v.s1200) + ' 1200w, ' + E(v.src) + ' ' + v.w + 'w" sizes="' + sizes + '"' : '';
    return '<img src="' + E(v.src) + '"' + ss + ' width="' + v.w + '" height="' + v.h + '" alt="' + E(alt) + '"' +
      (lazy ? ' loading="lazy"' : ' fetchpriority="high"') + ' decoding="async"' + (v.blend ? ' class="bl"' : '') + (extra || '') + ' style="max-width:min(100%,' + v.w + 'px);max-height:min(100%,' + v.h + 'px)">';
  };
  var tile = function (p, k) {
    return '<li class="tl"><a class="im" data-cy="' + E(JSON.stringify(p.stack.filter(function (x) { return x.w >= 600 && / view$/i.test(x.label) && x.blend !== false; }).map(function (x) { return x.src; }))) + '" href="' + HOME + '?piece=' + encodeURIComponent(p.id) + '">' +
      img(p.tile, p.name + ', ' + p.type.toLowerCase(), '(max-width: 820px) 45vw, 20vw', k > 2) + '</a>' +
      '<div class="cap"><a href="' + HOME + '?piece=' + encodeURIComponent(p.id) + '"><span class="nm">' + E(p.name) + '</span>' +
      (p.price ? '<span class="pr">' + E(p.price) + '</span>' : '') + '</a>' +
      '<a class="btn ol" href="' + E(p.href) + '">Pre-order</a></div></li>';
  };
  fetch('assets/shop/catalogue.json').then(function (r) { return r.json(); }).then(function (C) {
    var byId = {}; C.forEach(function (p) { byId[p.id] = p; });
    var p = pid && byId[pid];
    if (p) return piecePage(p, C);
    var list = C, head = '';
    if (side === 'women' || side === 'men') { list = C.filter(function (x) { return sides(x).indexOf(side) >= 0; }); head = side; }
    else if (cat && CAT[cat]) { list = C.filter(function (x) { return CAT[cat].has(x.category); }); head = CAT[cat].label; }
    if (head) document.title = head.charAt(0).toUpperCase() + head.slice(1) + ' · ' + title0;
    app.innerHTML = '<h1 class="vh">' + E(head || 'Chapter I') + '</h1>' +
      '<ul class="grid">' + list.map(tile).join('') + '</ul>';
  }).catch(function () { app.innerHTML = '<p class="gh">The pieces did not load. <a href="' + HOME + '">Try again</a>.</p>'; });

  function fold(id, label, body) {
    return '<div class="fd"><button type="button" aria-expanded="false" aria-controls="fd-' + id + '" id="fb-' + id + '"><span class="sc">' + label + '</span><i aria-hidden="true">+</i></button>' +
      '<div class="fb" id="fd-' + id + '" role="region" aria-labelledby="fb-' + id + '" hidden>' + body + '</div></div>';
  }
  function piecePage(p, C) {
    document.title = p.name.charAt(0) + p.name.slice(1).toLowerCase() + ' · ' + title0;
    var wrap = app.closest('.wrap'); if (wrap) wrap.classList.add('full');
    var hd = document.querySelector('.hd'); if (hd) hd.classList.add('burgered');
    var mine = sides(p);
    var rel = C.filter(function (x) { return x.id !== p.id && x.category === p.category && mine.every(function (s) { return sides(x).indexOf(s) >= 0; }); }).slice(0, 3);
    var walk = WALKAROUND_ENABLED && p.walkaround && usd(p) >= WALKAROUND_MIN_USD;
    // David, 18 Nov: the whole piece big, its pictures as tiny squares in a column beside it, specs and Pre-order on the right;
    // only real pictures (no 144p, no numbered-marker sheets); under it the rest of the line as a sideways carousel
    var pics = p.stack.filter(function (x) { return x.w >= 600 && !/marker|numbered/i.test(x.label); }); if (!pics.length) pics = p.stack.slice(0, 1);
    var at = C.indexOf(p), line = C.slice(at + 1).concat(C.slice(0, at));
    var buy = '<a class="btn" href="' + E(p.href) + '">Pre-order</a>';
    var care = p.details.Care ? '<p>' + E(p.details.Care) + '</p>' : '';
    var fit = p.fit ? '<p class="sz sc">' + E(p.fit.sizes) + '</p>' + p.fit.p.map(function (x) { return '<p>' + E(x) + '</p>'; }).join('') +
      (p.fit.m ? '<table><thead><tr><th></th><th class="sc">M</th></tr></thead><tbody>' + p.fit.m.map(function (r) { return '<tr><td>' + E(r[0]) + '</td><td>' + E(r[1]) + '</td></tr>'; }).join('') + '</tbody></table><p>' + E(p.fit.e) + '</p>' : '') : '';
    var rows = '<div class="rows">' +
      fold('details', 'Details', '<ul class="sp">' + p.specs.map(function (s) { return '<li>' + E(s) + '</li>'; }).join('') + '</ul>') +
      (care ? fold('care', 'Care and maintenance', care) : '') +
      (fit ? fold('fit', 'Size and fit', fit) : '') +
      '<a class="ln" href="service.html#delivery"><span class="sc">Delivery</span><i aria-hidden="true">&gt;</i></a>' +
      '<a class="ln" href="service.html#returns"><span class="sc">Returns</span><i aria-hidden="true">&gt;</i></a></div>';
    app.innerHTML =
      (walk ? '<section class="wa" data-src="' + E(p.walkaround) + '" aria-label="' + E(p.name) + ', the walkaround"><div class="wa-in"><canvas aria-hidden="true"></canvas><div class="wn"></div><p class="wa-nm sc">' + E(p.name) + '</p></div></section>' : '') +
      '<article class="pc gal">' +
        '<div class="big">' + img(pics[0], p.name + ', ' + pics[0].label, '(max-width: 820px) 80vw, 58vw', false) + '</div>' +
        '<ul class="sq" role="tablist" aria-label="' + E(p.name) + ', pictures">' + pics.map(function (s, k) {
          return '<li><button type="button" role="tab" aria-selected="' + (k ? 'false' : 'true') + '" data-k="' + k + '" aria-label="' + E(s.label) + '">' + img(s, '', '72px', k > 3) + '</button></li>'; }).join('') + '</ul>' +
        '<div class="dt">' +
          '<h1>' + E(p.name) + '</h1>' +
          (p.price ? '<p class="pr">' + E(p.price) + '</p>' : '') +
          buy + rows +
        '</div>' +
      '</article>' +
      '<section class="ml"><h2>The line</h2><ul class="car">' + line.map(function (x) { return tile(x, 9); }).join('') + '</ul></section>' +
      '<div class="bar">' + '<span class="pr">' + E(p.price || '') + '</span>' + buy + '</div>';
    document.body.classList.add('has-bar');
    // the folding rows: one open at a time, closed by default
    app.addEventListener('click', function (e) {
      var b = e.target.closest('.fd > button'); if (!b) return;
      var open = b.getAttribute('aria-expanded') !== 'true';
      [].forEach.call(app.querySelectorAll('.fd > button'), function (x) {
        var on = x === b && open; x.setAttribute('aria-expanded', on ? 'true' : 'false');
        x.querySelector('i').textContent = on ? '−' : '+'; document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
    });
    app.addEventListener('click', function (e) {
      var b = e.target.closest('.sq button'); if (!b) return;
      var k = +b.getAttribute('data-k'), v = pics[k];
      app.querySelector('.gal .big').innerHTML = img(v, p.name + ', ' + v.label, '(max-width: 820px) 80vw, 58vw', false);
      [].forEach.call(app.querySelectorAll('.sq button'), function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    });
    if (walk && window.SalonWalkaround) window.SalonWalkaround(app.querySelector('.wa'));
  }
  // hover a piece and its pictures play (David, 18 Nov); on a phone, the card in the middle of the screen plays
  (function () {
    var timer = null, cur = null;
    function play(a) {
      if (cur === a) return; stop(); var L; try { L = JSON.parse(a.getAttribute('data-cy') || '[]'); } catch (e) { L = []; }
      var im = a.querySelector('img'); if (!im || L.length < 2) return; cur = a; var first = im.getAttribute('src'), ss = im.getAttribute('srcset'), i = 0;
      a._reset = function () { im.setAttribute('src', first); if (ss) im.setAttribute('srcset', ss); };
      im.removeAttribute('srcset');
      timer = setInterval(function () { i = (i + 1) % L.length; im.setAttribute('src', L[i]); }, 900);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; if (cur && cur._reset) cur._reset(); cur = null; }
    document.addEventListener('mouseover', function (e) { var a = e.target.closest('.tl .im[data-cy]'); if (a) play(a); else if (cur && !e.target.closest('.tl')) stop(); });
    document.addEventListener('mouseleave', stop);
    if (matchMedia('(hover: none)').matches) {
      var tick = function () { var best = null, d = 1e9, mid = innerHeight / 2;
        [].forEach.call(document.querySelectorAll('.tl .im[data-cy]'), function (a) { var r = a.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < d && r.bottom > 0 && r.top < innerHeight) { d = c; best = a; } });
        if (best && d < innerHeight * 0.25) play(best); else stop(); };
      addEventListener('scroll', function () { clearTimeout(tick.t); tick.t = setTimeout(tick, 150); }, { passive: true });
    }
  })();
})();
