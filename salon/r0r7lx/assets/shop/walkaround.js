// The walkaround (the room's world, from assets/js/stage.js, 15 Nov), on the piece page: the same frames and the same lines,
// full screen, pinned while the page scrolls through it; when it ends, the page carries on into the pictures. The frames,
// the notes, their planes, blur and ink are the world's own walk.json; nothing is redrawn.
window.SalonWalkaround = function (sec) {
  if (!sec) return;
  var cv = sec.querySelector('canvas'), ctx = cv.getContext('2d'), wn = sec.querySelector('.wn');
  var E = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var WD = null, WS = null, kind = '', imgs = [], f = 0, raf = 0;
  function pick() {
    if (!WD) return; var k = innerWidth / innerHeight < 1 ? 'phone' : 'desk'; if (k === kind) return; kind = k; WS = WD[k];
    imgs = WS.src.map(function (src, i) { var im = new Image(); im.decoding = 'async'; im.src = src; im.onload = function () { if (i === Math.round(f)) draw(i); }; return im; });
    wn.innerHTML = WD.notes.map(function (t, i) { return '<div class="note ' + WS.ink[i] + (k === 'phone' ? ' ph' : '') + '" style="width:' + WS.box[0] + 'px;height:' + WS.box[1] + 'px"><p>' + E(t) + '</p></div>'; }).join('');
  }
  function solve(A, b) {
    var n = 8, c, r, k, p, t;
    for (c = 0; c < n; c++) {
      p = c; for (r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      t = A[c]; A[c] = A[p]; A[p] = t; t = b[c]; b[c] = b[p]; b[p] = t;
      for (r = c + 1; r < n; r++) { var q = A[r][c] / A[c][c]; for (k = c; k < n; k++) A[r][k] -= q * A[c][k]; b[r] -= q * b[c]; }
    }
    var x = new Array(n).fill(0);
    for (r = n - 1; r >= 0; r--) { t = b[r]; for (k = r + 1; k < n; k++) t -= A[r][k] * x[k]; x[r] = t / A[r][r]; }
    return x;
  }
  function homography(w, h, Q) {
    var src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], b = [];
    for (var i = 0; i < 4; i++) { var x = src[i][0], y = src[i][1], X = Q[i][0], Y = Q[i][1];
      A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); b.push(X); A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); b.push(Y); }
    var s = solve(A, b);
    return 'matrix3d(' + s[0] + ',' + s[3] + ',0,' + s[6] + ',' + s[1] + ',' + s[4] + ',0,' + s[7] + ',0,0,1,0,' + s[2] + ',' + s[5] + ',0,1)';
  }
  function draw(i) {
    if (!WS) return; var ok = function (j) { var m = imgs[j]; return m && m.complete && m.naturalWidth; };
    if (!ok(i)) { for (var d = 1; d < imgs.length; d++) { if (ok(i - d)) { i = i - d; break; } if (ok(i + d)) { i = i + d; break; } } }   // never a blank screen: the nearest frame that has loaded
    var im = imgs[i]; if (!ok(i)) return;
    var dpr = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var sc = Math.max(W / WS.w, H / WS.h), ox = (W - WS.w * sc) / 2, oy = (H - WS.h * sc) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, ox, oy, WS.w * sc, WS.h * sc);
    [].forEach.call(wn.children, function (n, k) {
      var a = WS.a[i][k]; if (!(a > 0.001)) { n.style.visibility = 'hidden'; return; }
      var Q = WS.q[i][k].map(function (uv) { return [ox + uv[0] * WS.w * sc, oy + uv[1] * WS.h * sc]; });
      n.style.transform = homography(WS.box[0], WS.box[1], Q);
      var s2 = Math.hypot(Q[1][0] - Q[0][0], Q[1][1] - Q[0][1]) / WS.box[0], bl = WS.blur[i][k] * WS.w * sc * .5 / Math.max(s2, .05);
      n.style.filter = bl > .35 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none'; n.style.opacity = a.toFixed(3); n.style.visibility = 'visible';
    });
  }
  // the scroll walks the frames: the section is the frames' length (7 screens, as in the room) plus the pinned screen
  function onScroll() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      if (!WS) return; pick();
      var r = sec.getBoundingClientRect(), span = Math.max(1, sec.offsetHeight - innerHeight);
      var t = Math.max(0, Math.min(1, -r.top / span)); f = t * (WS.n - 1); draw(Math.round(f));
      sec.classList.toggle('done', t >= 1);
    });
  }
  fetch(sec.dataset.src).then(function (r) { return r.json(); }).then(function (d) { WD = d; pick(); onScroll(); });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { pick(); onScroll(); });
};
