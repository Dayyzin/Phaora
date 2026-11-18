// The grid and the piece page, from assets/shop/catalogue.json (built by build_catalogue.py from the salon's own data).
//   ./                      every piece
//   ./?side=women|men       that side (a piece on both sides is in both)
//   ./?cat=<category>       one category; ./?cat=accessories the accessories together
//   ./?piece=<id>           the piece: the walkaround first where it has one and is priced at WALKAROUND_MIN_USD or
//                           more, then its pictures stacked on the left, the details sticky on the right
var WALKAROUND_MIN_USD = 0;   // David, 18 Nov: "Walkaround needs to be ADDED" - every piece that has one
var V = '?v=1118n';   // a new picture set: phones and the CDN fetch it fresh   // David, 18 Nov: final
var WALKAROUND_ENABLED = false;   // David, 18 Nov: "Sharp yes" - every piece walks around on its own sharp views, never the 144p world walk   // David, 18 Nov: "Walkaround comes back, it's too strong and worked on to throw away"
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
    var ss = v.s1200 ? ' srcset="' + E(v.s1200 + V) + ' 1200w, ' + E(v.src + V) + ' ' + v.w + 'w" sizes="' + sizes + '"' : '';
    return '<img src="' + E(v.src + V) + '"' + ss + ' width="' + v.w + '" height="' + v.h + '" alt="' + E(alt) + '"' +
      (lazy ? ' loading="lazy"' : ' fetchpriority="high"') + ' decoding="async"' + (v.blend ? ' class="bl"' : '') + (extra || '') + ' style="max-width:min(100%,' + v.w + 'px);max-height:min(100%,' + v.h + 'px)">';
  };
  // a piece without a price (Lustre): one Request button, a letter to the house (David, 18 Nov)
  var cta = function (p, cls) {
    if (!p.price) return '<a class="' + cls + '" href="mailto:hello@phaora.com?subject=' + encodeURIComponent('Request: ' + p.name) + '">Request</a>';
    return '<a class="' + cls + '" href="' + E(p.href) + '">Pre-order</a>';
  };
  var tile = function (p, k) {
    return '<li class="tl"><a class="im" data-cy="' + E(JSON.stringify(p.stack.filter(function (x) { return x.w >= 600 && / view$/i.test(x.label) && x.blend !== false; }).map(function (x) { return x.src + V; }))) + '" href="' + HOME + '?piece=' + encodeURIComponent(p.id) + '">' +
      img(p.tile, p.name + ', ' + p.type.toLowerCase(), '(max-width: 820px) 45vw, 20vw', k > 2) + '</a>' +
      '<div class="cap"><a href="' + HOME + '?piece=' + encodeURIComponent(p.id) + '"><span class="nm">' + E(p.name) + '</span>' +
      (p.price ? '<span class="pr">' + E(p.price) + '</span>' : '') + '</a>' +
      cta(p, 'btn ol') + '</div></li>';
  };
  fetch('assets/shop/catalogue.json' + V).then(function (r) { return r.json(); }).then(function (C) {
    var byId = {}; C.forEach(function (p) { byId[p.id] = p; });
    var p = pid && byId[pid];
    if (p) return piecePage(p, C);
    var list = C, head = '';
    if (side === 'women' || side === 'men') { list = C.filter(function (x) { return sides(x).indexOf(side) >= 0; }); head = side; }
    else if (cat && CAT[cat]) { list = C.filter(function (x) { return CAT[cat].has(x.category); }); head = CAT[cat].label; }
    if (head) document.title = head.charAt(0).toUpperCase() + head.slice(1) + ' · ' + title0;
    if (head) { app.innerHTML = '<h1 class="vh">' + E(head) + '</h1><ul class="grid">' + list.map(tile).join('') + '</ul>'; return; }
    // the front page (David, 18 Nov): one long page - the 360 opening, catalogue, a detail, catalogue, the film, details in
    // three squares, then the footer
    var find = function (id, lab) { var q = byId[id]; if (!q) return null; for (var i = 0; i < q.stack.length; i++) if (q.stack[i].label === lab) return { p: q, v: q.stack[i] }; return null; };
    // every detail is a door (David, 18 Nov, after dior.com): its picture, and one word over it, underlined, to where it leads
    var det = function (d, cls, lab, cat) { if (!d) return ''; var href = cat ? HOME + '?cat=' + encodeURIComponent(cat) : HOME + '?piece=' + encodeURIComponent(d.p.id);
      return '<a class="dl ' + cls + '" href="' + href + '">' + img(d.v, d.p.name + ', ' + d.v.label.toLowerCase(), cls === 'one' ? '100vw' : '(max-width: 820px) 34vw, 33vw', true) + '<span class="lb">' + E(lab || d.p.name) + '</span></a>'; };
    var big = find('itaoca', 'The PÖ on the flap');
    var GIFTS = ['oitava', 'lustre', 'cordel', 'obolo'];   // the gift suggestions, first, before the catalogue (David, 18 Nov)
    var three = [[find('gelosia', 'The belt and its holes'), 'Outerwear', 'outerwear'], [find('coema', 'The charm'), 'Bags', 'bags'], [find('ofusca', 'The brass plate'), 'Eyewear', 'eyewear']];
    var last = find('heliodora', 'The kiss on the back');   // the page ends on one landscape, edge to edge (David, 18 Nov)
    var phone = matchMedia('(max-width: 820px)').matches;
    app.innerHTML = '<h1 class="vh">Chapter I</h1>' +
      (byId.itaoca ? '<section class="op2" aria-label="Itaoca"><nav class="mn opm" aria-label="Menu"></nav>' +
        '<a class="pic" href="' + HOME + '?piece=itaoca"><img class="turn" src="assets/turn/' + (phone ? 'itaoca-g8' : 'itaoca-g') + '/f000.webp' + V + '" width="1200" height="1200" alt="Itaoca, the top-handle bag, turning" fetchpriority="high"></a>' +
        '<div class="tx"><p class="k">Chapter I</p><h2>Itaoca</h2><p class="ty">Top-handle bag</p>' +
        '<p class="d">Black calfskin, the PÖ pressed into the flap, a rolled handle and the house disc in brass. Inside, cream suede.</p>' +
        '<p class="pr">' + E(byId.itaoca.price || '') + '</p>' +
        '<div class="ac"><a class="b1" href="' + E(byId.itaoca.href) + '">Pre-order</a><a class="b2" href="' + HOME + '?piece=itaoca">Discover</a></div></div></section>' : '') +
      '<section class="gifts" id="gifts"><a class="gb" href="#gifts-list"><img src="assets/shop/img/gift_box_open.webp' + V + '" srcset="assets/shop/1200/gift_box_open.webp' + V + ' 800w, assets/shop/img/gift_box_open.webp' + V + ' 1000w" sizes="(max-width: 820px) 100vw, 50vw" width="1000" height="1050" alt="The house box, open: black, the cream tissue, the brass Ö" loading="lazy">' +
        '<span class="gt"><span class="k">Chapter I</span><span class="h">Gifts</span><span class="s">Every piece arrives in the house box: black, the cream band and the brass Ö.</span></span></a><ul class="grid" id="gifts-list">' + GIFTS.map(function (id) { return byId[id]; }).filter(Boolean).map(tile).join('') + '</ul></section>' +
      '<ul class="grid">' + C.slice(0, 8).map(tile).join('') + '</ul>' +
      '<section class="dets">' + det(big, 'one', 'Itaoca') + '</section>' +
      '<ul class="grid">' + C.slice(8).map(function (x, k) { return tile(x, 9); }).join('') + '</ul>' +
      '<section class="fm" aria-label="The film"><iframe src="film.html?embed=1&baked=1" title="A seat is kept for you, the film" loading="lazy" tabindex="-1"></iframe>' +
        '<button class="snd sc" type="button" aria-pressed="false">Sound</button></section>' +
      '<section class="sh" aria-label="Voluta, the short"><a href="' + HOME + '?piece=voluta"><video src="assets/film/voluta-reel-2k.mp4' + V + '" poster="assets/film/voluta-reel-2k.jpg' + V + '" muted playsinline loop autoplay preload="metadata"></video><span class="lb">Voluta</span></a></section>' +
      '<section class="dets three">' + three.map(function (d) { return det(d[0], 'sq3', d[1], d[2]); }).join('') + '</section>' +
      '<section class="dets end">' + det(last, 'one', 'Knitwear', 'knit') + '</section>';
    // the opening (David, 18 Nov): the menu stays open down the left of it, and slides back out to the left as you scroll on
    (function () { var op = app.querySelector('.op2'), om = op && op.querySelector('.opm'), src = document.querySelector('.wrap>.mn');
      if (om && src) om.innerHTML = src.innerHTML;
      var go = function () { if (!om) return; var k = Math.min(1, Math.max(0, scrollY / (op.offsetHeight * 0.45))); om.style.transform = 'translateX(' + (-110 * k) + '%)'; om.style.opacity = String(1 - k); };
      addEventListener('scroll', go, { passive: true }); go();
      // the turn: Itaoca's 72 views, cut onto the green, once all are in
      var im = op && op.querySelector('img.turn'); if (!im) return; var dir = 'assets/turn/' + (phone ? 'itaoca-g8' : 'itaoca-g') + '/', F = [], n = 0, i = 0;
      for (var k = 0; k < 72; k++) { var u = dir + 'f' + ('00' + k).slice(-3) + '.webp' + V; F.push(u); var pre = new Image(); pre.onload = pre.onerror = function () { if (++n === 72) start(); }; pre.src = u; }
      function start() { setInterval(function () { var r = im.getBoundingClientRect(); if (r.bottom < 0 || document.hidden) return; i = (i + 1) % 72; im.src = F[i]; }, 90); }
    })();
    // the film: stay on it a second or two and the room dims and it plays; leave and it pauses, the room comes back
    (function () { var fm = app.querySelector('.fm'), fr = fm.querySelector('iframe'), sb = fm.querySelector('.snd'), t = null;
      var say = function (m) { try { fr.contentWindow.postMessage(m, '*'); } catch (e) {} };
      var v = { play: function () { say('play'); return { catch: function () {} }; }, pause: function () { say('pause'); }, paused: false };
      addEventListener('message', function (e) { if (e.data && e.data.film) { sb.setAttribute('aria-pressed', e.data.muted ? 'false' : 'true'); sb.textContent = e.data.muted ? 'Sound' : 'Sound off'; } });
      sb.addEventListener('click', function () { say('sound'); });
      new IntersectionObserver(function (es) { es.forEach(function (e) {
        if (e.intersectionRatio > 0.6) { clearTimeout(t); t = setTimeout(function () { document.body.classList.add('dim'); v.play().catch(function () {}); }, 1500); }
        else { clearTimeout(t); document.body.classList.remove('dim'); if (!v.paused) v.pause(); } }); }, { threshold: [0, 0.6] }).observe(fm);
    })();
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
    // the walk around from the piece's own sharp views, where it has no world walk: front, three-quarter, back, turning slowly
    var views = p.stack.filter(function (x) { return / view$/i.test(x.label) && x.w >= 600; });
    // David, 18 Nov: big pictures, scrolled, seamless (as dior.com and celine.com), specs and Pre-order sticky on the right;
    // only real pictures (no 144p, no numbered-marker sheets); under it the rest of the line as a sideways carousel
    var pics = p.stack.filter(function (x) { return x.w >= 600 && !/marker|numbered/i.test(x.label); }); if (!pics.length) pics = p.stack.slice(0, 1);
    var at = C.indexOf(p), line = C.slice(at + 1).concat(C.slice(0, at));
    // you may also like (David, 18 Nov, as celine.com): four, seamless on the page - same category first, then the next pieces
    var also = C.filter(function (x) { return x.id !== p.id && x.category === p.category; });
    line.forEach(function (x) { if (also.length < 4 && also.indexOf(x) < 0) also.push(x); }); also = also.slice(0, 4);
    var paid = /buy\.stripe\.com/.test(p.href || '');
    var APPLE = '<svg viewBox="0 0 17 20" width="15" height="18" aria-hidden="true"><path fill="currentColor" d="M14.1 10.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8C4.6 5.4 3.1 6.3 2.3 7.8c-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.1.8 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.6-1-2.8-4.2zM11.8 3.8c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3z"/></svg>';
    var buy = (paid ? '<a class="btn ap" href="' + E(p.href) + '" aria-label="Pre-order with Apple Pay">' + APPLE + '<span>Pay</span></a>' : '') +
      cta(p, 'btn') +
      (paid ? '<p class="tc">Pre-order: made to order. We email your delivery date once production is confirmed. Cancel for a full refund before production starts.</p>' : '');
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
      (!walk && views.length > 1 ? '<section class="vw" aria-label="' + E(p.name) + ', walk around">' + views.map(function (v, k) { return '<img class="' + (k ? '' : 'on') + '" src="' + E(v.src + V) + '" alt="' + E(p.name + ', ' + v.label) + '"' + (k ? ' loading="lazy"' : '') + '>'; }).join('') + '<p class="sc">' + E(p.name) + '</p></section>' : '') +
      (walk ? '<section class="wa" data-src="' + E(p.walkaround) + '" aria-label="' + E(p.name) + ', the walkaround"><div class="wa-in"><canvas aria-hidden="true"></canvas><div class="wn"></div><p class="wa-nm sc">' + E(p.name) + '</p></div></section>' : '') +
      '<article class="pc">' +
        '<ul class="st">' + pics.map(function (v, k) {
          var close = !/ view$/i.test(v.label);
          return '<li' + (close ? ' class="cu"' : '') + '>' + img(v, p.name + ', ' + v.label, '(max-width: 820px) 100vw, 66vw', k > 0) + '</li>'; }).join('') + '</ul>' +
        '<div class="dt">' +
          '<h1>' + E(p.name) + '</h1>' +
          (p.price ? '<p class="pr">' + E(p.price) + '</p>' : '') +
          buy + rows +
        '</div>' +
      '</article>' +
      '<section class="ml"><h2>You may also like</h2><ul class="grid also">' + also.map(function (x) { return '<li class="tl"><a class="im" href="' + HOME + '?piece=' + encodeURIComponent(x.id) + '">' + img(x.tile, x.name, '(max-width: 820px) 45vw, 22vw', true) + '</a><div class="cap"><a href="' + HOME + '?piece=' + encodeURIComponent(x.id) + '"><span class="nm">' + E(x.name) + '</span>' + (x.price ? '<span class="pr">' + E(x.price) + '</span>' : '') + '</a></div></li>'; }).join('') + '</ul></section>' +
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
    (function () { var vw = app.querySelector('.vw'); if (!vw) return; var L = vw.querySelectorAll('img'), i = 0;
      setInterval(function () { L[i].classList.remove('on'); i = (i + 1) % L.length; L[i].classList.add('on'); }, 3200); })();
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
    // phones (David, 18 Nov): press and hold a piece and its pictures play; let go and they keep playing, until the next
    // press and hold on another piece, or until it is scrolled away. A plain tap still opens the piece.
    if (matchMedia('(hover: none)').matches) {
      var hold = null, held = false;
      document.addEventListener('touchstart', function (e) { var a = e.target.closest('.tl .im[data-cy]'); if (!a) return; held = false;
        clearTimeout(hold); hold = setTimeout(function () { held = true; play(a); }, 350); }, { passive: true });
      document.addEventListener('touchmove', function () { clearTimeout(hold); }, { passive: true });
      document.addEventListener('touchend', function () { clearTimeout(hold); }, { passive: true });
      document.addEventListener('click', function (e) { if (held && e.target.closest('.tl .im')) { e.preventDefault(); held = false; } }, true);
      document.addEventListener('contextmenu', function (e) { if (e.target.closest('.tl .im')) e.preventDefault(); });
      addEventListener('scroll', function () { if (!cur) return; var r = cur.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) stop(); }, { passive: true });
    }
  })();
})();
