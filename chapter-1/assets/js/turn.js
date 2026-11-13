// The turning room (home): the three pieces that lead the house turn as you scroll past them. With its 72 frames in
// the slot (img/home/turn-<page>/f000.webp to f071.webp, one turn), the scroll scrubs them. Until then the page
// turns the views it has (front, three-quarter, back): each turns away edge-on and the next turns in.
(function () {
  var secs = [].slice.call(document.querySelectorAll('.turn')); if (!secs.length) return;
  var ease = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  var T = secs.map(function (s) {
    var n = +s.dataset.frames, o = { s: s, stage: s.querySelector('.turn-stage'), n: n, tv: {} };
    s.querySelectorAll('.tv').forEach(function (el) { o.tv[el.dataset.v] = el; });
    if (n >= 72) {   // the frames: drawn on a canvas in the first view's box
      var box = s.querySelector('.tv'), cv = document.createElement('canvas'); box.innerHTML = ''; box.appendChild(cv);
      o.cv = cv; o.fr = [];
      for (var k = 0; k < n; k++) { var im = new Image(); im.src = s.dataset.seq + '/f' + String(k).padStart(3, '0') + '.webp'; o.fr.push(im); }
    } else {
      // the keys round one turn: front 0, three-quarter 60, back 180, the three-quarter seen from the other side 300
      var k2 = [['front', 0, 1]];
      if (o.tv['three-quarter']) k2.push(['three-quarter', 60, 1]);
      if (o.tv.back) k2.push(['back', 180, 1]);
      if (o.tv['three-quarter']) k2.push(['three-quarter', 300, -1]);
      k2.push(['front', 360, 1]);
      o.keys = k2.filter(function (k) { return o.tv[k[0]]; });
    }
    return o;
  });
  function draw(o) {
    var r = o.s.getBoundingClientRect(), H = innerHeight, span = o.s.offsetHeight - H;
    var q = Math.max(0, Math.min(1, -r.top / Math.max(1, span)));
    if (r.bottom < 0 || r.top > H) return;
    if (o.cv) {
      var c = o.cv, dpr = Math.min(2, devicePixelRatio || 1), w = c.clientWidth * dpr, h = c.clientHeight * dpr;
      if (c.width !== w) { c.width = w; c.height = h; }
      var im = o.fr[Math.min(o.n - 1, Math.floor(q * o.n))], x = c.getContext('2d');
      if (im && im.complete && im.naturalWidth) { var s = Math.min(w / im.naturalWidth, h / im.naturalHeight); x.clearRect(0, 0, w, h);
        x.drawImage(im, (w - im.naturalWidth * s) / 2, (h - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s); }
      return;
    }
    var deg = q * 360, K = o.keys, i = 0;
    while (i < K.length - 2 && deg >= K[i + 1][1]) i++;
    var a = K[i], b = K[i + 1], u = (deg - a[1]) / Math.max(1, b[1] - a[1]);
    Object.keys(o.tv).forEach(function (v) { o.tv[v].style.visibility = 'hidden'; });
    var hold = .72, t = ease((u - hold * .5) / (1 - hold));   // each view holds, then turns
    if (a[0] === b[0] && a[2] === b[2]) t = 0;
    var el, yaw, mir;
    if (t < .5) { el = o.tv[a[0]]; yaw = t * 180; mir = a[2]; } else { el = o.tv[b[0]]; yaw = -(1 - t) * 180; mir = b[2]; }
    el.style.visibility = 'visible';
    el.style.transform = 'rotateY(' + yaw + 'deg) scaleX(' + mir + ')';
  }
  var raf = 0;
  function all() { raf = 0; T.forEach(draw); }
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(all); }, { passive: true });
  addEventListener('resize', all); all();
})();
