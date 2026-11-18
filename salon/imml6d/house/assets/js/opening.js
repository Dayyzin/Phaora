// The opening (home). First the shadow opening (David, 12 Nov, the shadows branch, ?shadows=1, d22dd59f): the Veil
// Coat, unseen, turns once on its own axis in 9 s under one low side key, and only its real cast shadow (path-traced
// in Cycles from its own mesh, 72 frames a turn) is in the frame; the light comes up over its first 1.2 s and goes down
// over its last 1.2 s. Then the house's intro (the live register's: the uplight and the card), then the house.
// Once a visit; ?opening plays it again, ?skip leaves it out. A tap, a key or a scroll ends it early.
(function () {
  var ov = document.getElementById('opening'); if (!ov) return;
  var b = document.body, q = new URLSearchParams(location.search);
  var seen = false; try { seen = sessionStorage.getItem('opened') === '1'; } catch (e) {}
  function done() {
    if (b.classList.contains('opened')) return;
    b.classList.add('opened'); ov.classList.add('gone'); try { sessionStorage.setItem('opened', '1'); } catch (e) {}
    setTimeout(function () { ov.remove(); }, 1000);
    ['wheel', 'touchmove', 'keydown'].forEach(function (e) { removeEventListener(e, block, true); });
    document.documentElement.style.overflow = '';
  }
  if (q.has('skip') || (seen && !q.has('opening')) || matchMedia('(prefers-reduced-motion: reduce)').matches) { ov.remove(); b.classList.add('opened'); return; }
  document.documentElement.style.overflow = 'hidden';
  var stage = 0;   // 0 the shadow, 1 the intro film
  function block(e) { if (e.cancelable) e.preventDefault(); skip(); }
  ['wheel', 'touchmove', 'keydown'].forEach(function (e) { addEventListener(e, block, { capture: true, passive: false }); });
  ov.querySelector('.skip').addEventListener('click', function (e) { e.stopPropagation(); done(); });
  ov.addEventListener('click', skip);

  // 1. the shadow
  var N = 72, TURN = 9.0, IN = 1.2, OUT = 1.2;
  var kind = innerWidth / innerHeight < 1 ? 'phone' : 'desk', base = 'assets/shadows/' + kind + '/veil_coat/f';
  var cv = ov.querySelector('canvas'), cx = cv.getContext('2d'), F = [], ready = 0;
  function size() { var dp = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(innerWidth * dp); cv.height = Math.round(innerHeight * dp); }
  size(); addEventListener('resize', size);
  for (var k = 0; k < N; k++) { var im = new Image(); im.decoding = 'async'; im.src = base + String(k).padStart(3, '0') + '.webp';
    (im.decode ? im.decode() : Promise.resolve()).then(function () { ready++; }, function () { ready++; }); F.push(im); }
  function cover(im, a) {
    if (!im.naturalWidth || a <= 0) return;
    var W = cv.width, H = cv.height, s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
    cx.globalAlpha = Math.min(1, a); cx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); cx.globalAlpha = 1;
  }
  var ease = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  var t0 = null, skipAt = null, waited = performance.now();
  function draw(t) {
    cx.fillStyle = '#000'; cx.fillRect(0, 0, cv.width, cv.height);
    var x = Math.max(0, t) / TURN * N, k = Math.floor(x), f = x - k;
    cover(F[k % N], 1); cover(F[(k + 1) % N], f);
    var dark = t < IN ? 1 - ease(t / IN) : t > TURN - OUT ? ease((t - (TURN - OUT)) / OUT) : 0;
    if (dark > 0) { cx.fillStyle = 'rgba(0,0,0,' + dark + ')'; cx.fillRect(0, 0, cv.width, cv.height); }
  }
  function skip() {
    if (stage === 0) { if (t0 !== null && skipAt === null) skipAt = performance.now() / 1000; else if (t0 === null) intro(); }
    else done();
  }
  function tick() {
    if (stage !== 0) return;
    var now = performance.now() / 1000;
    if (t0 === null) {
      if (ready < N && performance.now() - waited < 6000) { requestAnimationFrame(tick); return; }
      t0 = now;
    }
    var t = now - t0;
    if (skipAt !== null) {
      var g = (now - skipAt) / (OUT / 2); draw(Math.min(t, TURN)); cx.fillStyle = 'rgba(0,0,0,' + ease(g) + ')'; cx.fillRect(0, 0, cv.width, cv.height);
      if (g >= 1) { intro(); return; }
    } else { draw(t); if (t >= TURN) { intro(); return; } }
    requestAnimationFrame(tick);
  }
  // 2. the house's intro: the uplight and its card, once
  function intro() {
    if (stage !== 0) return; stage = 1;
    var v = ov.querySelector('video');
    v.src = 'assets/intro/intro-' + (innerWidth / innerHeight < 1 ? 'phone' : 'desk') + '.mp4';
    ov.classList.add('vid');
    var p = v.play(); if (p && p.catch) p.catch(done);
    v.addEventListener('ended', done, { once: true });
    v.addEventListener('error', done, { once: true });
    setTimeout(done, 9000);
  }
  requestAnimationFrame(tick);
})();
