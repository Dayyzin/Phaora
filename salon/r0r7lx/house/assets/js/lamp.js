// The lamp (home, the landing): a dark room, the Voluta still, and the visitor holds the one lamp.
// 24 renders in the slot: 12 azimuths (-75 to +75 degrees) at 25 and at 50 degrees elevation, l01-l24.webp.
// The pointer (desk), a held finger dragged across it, or the phone's tilt moves the lamp: x is the azimuth, y the elevation. The frame shown is the
// four nearest renders blended by weight on a canvas, eased. With no hand on it for 3 s the lamp drifts on its own.
// The front frame is in the page as an <img> (first paint); the rest stream in behind it.
(function () {
  var sec = document.getElementById('lamp'); if (!sec) return;
  var dir = sec.dataset.frames, AZ = JSON.parse(sec.dataset.az), EL = JSON.parse(sec.dataset.el);
  var stage = sec.querySelector('.lamp-stage'), cv = stage.querySelector('canvas'), first = stage.querySelector('.lamp-first');
  var ctx = cv.getContext('2d'), N = AZ.length * EL.length;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var frames = [], loaded = [];
  function name(i) { return dir + '/l' + String(i + 1).padStart(2, '0') + '.webp'; }
  // the front first, then outward from it, the low ring before the high one
  var mid = (AZ.length - 1) / 2, order = [];
  for (var k = 0; k < N; k++) order.push(k);
  order.sort(function (a, b) {
    var da = Math.abs(a % AZ.length - mid) + (a >= AZ.length ? .5 : 0), db = Math.abs(b % AZ.length - mid) + (b >= AZ.length ? .5 : 0);
    return da - db;
  });
  if (still) return;   // the front, still: nothing else is loaded
  order.forEach(function (i, n) {
    var im = new Image(); im.decoding = 'async';
    im.onload = function () { loaded[i] = true; if (!started) start(); };
    setTimeout(function () { im.src = name(i); }, n < 2 ? 0 : 60 * n);   // the nearest two at once, the rest streamed
    frames[i] = im;
  });

  // the lamp's place, as fractions: u (azimuth, 0 left .. 1 right), v (elevation, 0 low .. 1 high)
  var u0 = 6 / (AZ.length - 1), cur = { u: u0, v: 0 }, tgt = { u: u0, v: 0 }, lastInput = -1e9, started = false, t0 = performance.now();
  function size() {
    var r = stage.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
  }
  addEventListener('resize', size);

  function input(u, v) { tgt.u = Math.max(0, Math.min(1, u)); tgt.v = Math.max(0, Math.min(1, v)); lastInput = performance.now(); }
  addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = stage.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    input(e.clientX / innerWidth, 1 - (e.clientY - r.top) / r.height);
  }, { passive: true });
  // the phone: HOLD and DRAG (David, 18 Nov: "Must work on phone too the light hold and drag action"). A finger held still
  // on the lamp for 180 ms takes the lamp (a short buzz where the phone has one); from then on the finger IS the lamp,
  // x the azimuth, y the elevation, and the page does not scroll under it. A finger that moves first is a scroll, as
  // always. Let go and the lamp stays where it was put; it drifts again after 4 s.
  if (matchMedia('(pointer: coarse)').matches) {   // a phone: say once how the lamp is held
    var hint = document.createElement('p'); hint.className = 'lamp-hint'; hint.textContent = 'hold and drag to move the lamp'; sec.appendChild(hint);
  }
  var HOLD_MS = 180, SLOP = 10, holdT = 0, holding = false, sx = 0, sy = 0, lastTouch = -1e9;
  function fromFinger(x, y) { var r = stage.getBoundingClientRect(); input((x - r.left) / r.width, 1 - (y - r.top) / r.height); }
  stage.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { clearTimeout(holdT); return; }
    var t = e.touches[0]; sx = t.clientX; sy = t.clientY; clearTimeout(holdT);
    holdT = setTimeout(function () {
      holding = true; stage.classList.add('held'); sec.classList.add('held-once');
      if (navigator.vibrate) navigator.vibrate(8);
      fromFinger(sx, sy);
    }, HOLD_MS);
  }, { passive: true });
  stage.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    if (!holding) { if (Math.abs(t.clientX - sx) + Math.abs(t.clientY - sy) > SLOP) clearTimeout(holdT); return; }   // a scroll
    if (e.cancelable) e.preventDefault();   // held: the finger moves the lamp, not the page
    fromFinger(t.clientX, t.clientY);
  }, { passive: false });
  function release() {
    clearTimeout(holdT); lastTouch = performance.now();
    if (holding) { holding = false; stage.classList.remove('held'); lastInput = performance.now() + 1000; }
    askTilt();
  }
  stage.addEventListener('touchend', release, { passive: true });
  stage.addEventListener('touchcancel', release, { passive: true });
  stage.addEventListener('contextmenu', function (e) { e.preventDefault(); });   // a long press is the lamp, not a menu

  // the phone's tilt: left-right (gamma, -35..35) is the azimuth, the tilt toward you (beta, 20..70) the elevation.
  // A held finger always wins: the tilt is ignored while holding and for 4 s after.
  function tilt(e) {
    if (e.gamma == null || holding || performance.now() - lastTouch < 4000) return;
    input((e.gamma + 35) / 70, (e.beta - 20) / 50);
  }
  var asked = false;
  function listenTilt() { addEventListener('deviceorientation', tilt); }
  function askTilt() {   // iOS asks once, inside a touch (touchend or click count as the gesture)
    if (asked || !(window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function')) return;
    asked = true;
    DeviceOrientationEvent.requestPermission().then(function (s) { if (s === 'granted') listenTilt(); }).catch(function () {});
  }
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') stage.addEventListener('click', askTilt);
  else if (window.DeviceOrientationEvent) listenTilt();

  // the four nearest renders and their weights (bilinear in azimuth and elevation), over the ones loaded so far
  function blend(u, v) {
    var x = u * (AZ.length - 1), i0 = Math.min(AZ.length - 2, Math.floor(x)), fx = x - i0;
    var y = v * (EL.length - 1), j0 = Math.min(EL.length - 2, Math.floor(y)), fy = y - j0;
    var c = [[i0, j0, (1 - fx) * (1 - fy)], [i0 + 1, j0, fx * (1 - fy)], [i0, j0 + 1, (1 - fx) * fy], [i0 + 1, j0 + 1, fx * fy]]
      .map(function (q) { return [q[1] * AZ.length + q[0], q[2]]; })
      .filter(function (q) { return q[1] > .002 && loaded[q[0]]; });
    if (!c.length) {   // none of the four yet: the nearest loaded frame
      var best = -1, bd = 1e9;
      for (var k = 0; k < N; k++) if (loaded[k]) { var d = Math.abs(k % AZ.length - x) + Math.abs(Math.floor(k / AZ.length) - y) * 2; if (d < bd) { bd = d; best = k; } }
      return best < 0 ? [] : [[best, 1]];
    }
    c.sort(function (a, b) { return b[1] - a[1]; });
    return c;
  }
  function draw() {
    var c = blend(cur.u, cur.v); if (!c.length) return;
    var W = cv.width, H = cv.height, s = Math.min(W, H), x = (W - s) / 2, y = (H - s) / 2, acc = 0;
    ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    // a running blend: each frame laid over the sum so far with its share of the weight
    c.forEach(function (q) { acc += q[1]; ctx.globalAlpha = q[1] / acc; ctx.drawImage(frames[q[0]], x, y, s, s); });
    ctx.globalAlpha = 1;
  }
  function tick(now) {
    if (holding) lastInput = now;
    if (now - lastInput > 3000) {   // nobody holds it: it drifts, slowly
      var t = (now - t0) / 1000;
      tgt.u = .5 + .3 * Math.sin(t * .23); tgt.v = .3 + .25 * Math.sin(t * .11 + 1.2);
    }
    var k = now - lastInput > 3000 ? .02 : .09;
    cur.u += (tgt.u - cur.u) * k; cur.v += (tgt.v - cur.v) * k;
    var r = stage.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) draw();
    requestAnimationFrame(tick);
  }
  function start() {
    started = true; size(); draw();
    stage.classList.add('live');   // the canvas takes over from the first <img>, frame for frame the same picture
    requestAnimationFrame(tick);
  }

  // sound: off until asked for; the room tone, looped
  var sb = sec.querySelector('.sound'), au = null;
  if (sb) {
    if (!sb.dataset.src) sb.hidden = true;
    sb.addEventListener('click', function () {
      if (!au) { au = new Audio(sb.dataset.src); au.loop = true; au.volume = .5; }
      var on = sb.getAttribute('aria-pressed') !== 'true';
      sb.setAttribute('aria-pressed', on);
      if (on) { var p = au.play(); if (p && p.catch) p.catch(function () {}); } else au.pause();
    });
  }
})();
