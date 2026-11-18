// The salon's entrance (build_salon.py): the Voluta turning, lit from the first paint; a tap, a key, a scroll or a swipe
// enters the room. With its 72 frames it plays them (a turn in 6 s); until then its views, each turning away edge-on
// and the next turning in. And the menu: the colophon.
(function () {
  var ent = document.getElementById('entrance'), T = window.SALON_TURN || { kind: 'views', frames: [] };
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ent) {
    var stage = ent.querySelector('.e-stage'), ims = [].slice.call(ent.querySelectorAll('.ev')), t0 = performance.now(), live = true;
    if (T.kind === 'frames') {   // the real turn: one <img>, its source stepped through the 72 frames
      var fr = T.frames.map(function (s) { var i = new Image(); i.src = s; return i; }), im = ims[0];
      var tickF = function (now) { if (!live) return; if (!still) { var k = Math.floor(((now - t0) / 6000 * 72)) % 72; if (fr[k].complete) im.src = fr[k].src; } requestAnimationFrame(tickF); };
      requestAnimationFrame(tickF);
    } else if (ims.length > 1 && !still) {   // the stand-in: the views, turned
      var HOLD = 1600, TURN = 900, n = ims.length;
      var tickV = function (now) {
        if (!live) return;
        var per = HOLD + TURN, t = (now - t0) % (per * n), k = Math.floor(t / per), u = t - k * per;
        ims.forEach(function (e) { e.style.opacity = 0; });
        var a = ims[k], b = ims[(k + 1) % n];
        if (u < HOLD) { a.style.opacity = 1; a.style.transform = 'none'; }
        else { var f = (u - HOLD) / TURN, e2 = f * f * (3 - 2 * f);
          if (e2 < .5) { a.style.opacity = 1; a.style.transform = 'rotateY(' + (e2 * 180) + 'deg)'; }
          else { b.style.opacity = 1; b.style.transform = 'rotateY(' + (-(1 - e2) * 180) + 'deg)'; } }
        requestAnimationFrame(tickV);
      };
      requestAnimationFrame(tickV);
    }
    var enter = function () { if (!live) return; live = false; ent.classList.add('gone'); setTimeout(function () { ent.remove(); }, 900); };
    ent.addEventListener('click', enter);
    ent.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); } });
    ent.addEventListener('wheel', function (e) { e.preventDefault(); enter(); }, { passive: false });
    var y0 = null;
    ent.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    ent.addEventListener('touchmove', function (e) { if (y0 !== null && Math.abs(e.touches[0].clientY - y0) > 30) { y0 = null; enter(); } }, { passive: true });
  }
  var mb = document.getElementById('menuB'), sh = document.getElementById('sheet');
  if (mb && sh) mb.addEventListener('click', function () { var open = sh.hidden; sh.hidden = !open; mb.setAttribute('aria-expanded', open); mb.textContent = open ? 'Close' : 'Menu'; });
  // the room's logo is the site's wordmark: the room inlines it; the room's lettering colour does not apply to it
})();
