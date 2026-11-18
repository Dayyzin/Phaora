// A walk around the piece. Scrolling is a camera move, not a fade: between two stops on one view the camera travels
// (it pans and pushs in to the part); between two views it goes round the piece (the view turns away edge-on and the
// next turns in, while the world behind it pans the other way). Each stop's notes are engraved small beside the part
// they describe, on a leader from a pin on the part itself. The camera and the notes are placed on the piece's own box
// (build.py measures it in each picture), so a new render dropped into a slot keeps them on their parts.
(function () {
  var root = document.querySelector('.walk'); if (!root) return;
  var D = JSON.parse(root.querySelector('.walkdata').textContent);
  var stage = root.querySelector('.stage'), track = root.querySelector('.track'), bg = root.querySelector('.worldbg'),
      hud = root.querySelector('.hud'), bar = root.querySelector('.prog i');
  var V = {}; root.querySelectorAll('.view').forEach(function (el) { V[el.dataset.v] = el; });
  var S = D.stops, N = S.length;
  var notes = [].slice.call(root.querySelectorAll('.note')).map(function (el) {
    var s = +el.dataset.s, n = +el.dataset.n; return { el: el, s: s, d: S[s].n[n], side: null };
  });
  var W = 0, H = 0, phone = false, base = {}, C = [0, 0], LEAD = 56, top0 = 0;

  function layout() {
    W = stage.clientWidth; H = stage.clientHeight; phone = W < 821;
    LEAD = phone ? 26 : 56;
    C = [W * .5, H * (phone ? .56 : .5)];
    var bw = W * (phone ? .84 : .5), bh = H * (phone ? .58 : .78);
    Object.keys(D.views).forEach(function (v) {
      var m = D.views[v], b = m.bbox, pw = (b[2] - b[0]) * m.w, ph = (b[3] - b[1]) * m.h;
      var s = Math.min(bw / pw, bh / ph), el = V[v];
      base[v] = { s: s, w: m.w * s, h: m.h * s, b: b };
      if (el) { el.style.width = m.w * s + 'px'; el.style.height = m.h * s + 'px'; }
    });
    var r = root.getBoundingClientRect(); top0 = r.top + scrollY;
    frame();
  }
  // a point of the piece's box (fractions) -> px on the view at its base size
  function pt(v, f) { var B = base[v], b = B.b; return [(b[0] + f[0] * (b[2] - b[0])) * B.w, (b[1] + f[1] * (b[3] - b[1])) * B.h]; }
  function cam(v, f, z) { var F = pt(v, f); return { v: v, z: z, tx: C[0] - F[0] * z, ty: C[1] - F[1] * z }; }
  function screen(c, at) { var A = pt(c.v, at); return [c.tx + A[0] * c.z, c.ty + A[1] * c.z]; }
  var ease = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  function place(el, c, yaw, dx) {
    var t = 'translate3d(' + (C[0] + (dx || 0)) + 'px,' + C[1] + 'px,0) rotateY(' + (yaw || 0) + 'deg) translate3d(' + (-C[0]) + 'px,' + (-C[1]) + 'px,0) ' +
            'translate3d(' + c.tx + 'px,' + c.ty + 'px,0) scale(' + c.z + ')';
    el.style.transform = t; el.style.visibility = 'visible';
  }

  var tags = {}; root.querySelectorAll('.vtag').forEach(function (el) { tags[el.dataset.v] = el; });
  var wcap = root.querySelector('.wcap');
  function frame() {
    // the walk runs over N stops; one more segment past the last pulls back into the piece's world
    var P = Math.max(0, Math.min(N, (scrollY - top0) / (H * .85))), p = Math.min(N - 1, P), wv = ease(P - (N - 1));
    if (P > .02) root.classList.add('moved');
    var i = Math.min(N - 2, Math.floor(p)), t = N > 1 ? ease(p - i) : 0;
    if (N === 1) i = 0;
    var a = S[i], b = S[Math.min(N - 1, i + 1)], cams = {}, shown = null;
    Object.keys(V).forEach(function (v) { V[v].style.visibility = 'hidden'; });
    var yawBg = 0;
    if (a.v === b.v || t === 0 || t === 1) {
      var st = t === 1 ? b : a, z = a.v === b.v ? Math.exp(lerp(Math.log(a.z), Math.log(b.z), t)) : st.z;
      var f = a.v === b.v ? [lerp(a.f[0], b.f[0], t), lerp(a.f[1], b.f[1], t)] : st.f;
      if (wv > 0) { z = lerp(z, .62, wv); f = [lerp(f[0], .5, wv), lerp(f[1], .5, wv)]; }
      var c = cam(st.v, f, z); if (wv > 0) c.tx += W * (phone ? 0 : .18) * wv, c.ty += H * (phone ? -.08 : 0) * wv;
      place(V[st.v], c); cams[st.v] = c; shown = st.v;
    } else {   // round the piece: the one view turns away edge-on, the next turns in
      var sw = W * (phone ? .1 : .14);
      if (t < .5) { var u = t / .5, ca = cam(a.v, a.f, lerp(a.z, 1, u * .5)); place(V[a.v], ca, u * 90, -u * sw); shown = a.v; }
      else { var w = (1 - t) / .5, cb = cam(b.v, b.f, lerp(b.z, 1, w * .5)); place(V[b.v], cb, -w * 90, w * sw); shown = b.v; }
      yawBg = (t < .5 ? t : t - 1) * 2;
    }
    Object.keys(tags).forEach(function (v) { tags[v].classList.toggle('on', v === shown && wv < .5); });
    if (bg) { bg.style.opacity = wv; bg.style.transform = 'scale(' + (1.12 - .08 * wv) + ')'; }
    if (wcap) wcap.style.opacity = Math.max(0, wv * 1.4 - .4);
    if (hud) hud.style.opacity = Math.max(0, 1 - P * (phone ? 3 : 2.2));
    if (bar) bar.style.transform = 'scaleX(' + (P / N) + ')';
    // the notes: engraved beside their parts, outside the piece where there is room, on a small plate where there is not
    var used = { l: [], r: [] };
    notes.forEach(function (o) {
      var st = S[o.s], c = cams[st.v], al = Math.max(0, Math.min(1, 1 - Math.abs(p - o.s) * 2.6)) * (1 - wv);
      if (!c || al <= 0.01) { o.el.style.opacity = 0; return; }
      var q = screen(c, o.d.at), lo = screen(c, [0, 0]), hi = screen(c, [1, 1]);
      var tw = Math.min(270, W * (phone ? .46 : .4)), m = phone ? 12 : 24;
      var room = { r: W - m - Math.max(q[0] + LEAD, hi[0] + 16), l: Math.min(q[0] - LEAD, lo[0] - 16) - m };
      var side = room.r >= tw ? 'r' : room.l >= tw ? 'l' : (q[0] > W / 2 ? 'l' : 'r'), plaque = room[side] < tw;
      var lead = plaque ? LEAD : (side === 'r' ? Math.max(q[0] + LEAD, hi[0] + 16) - q[0] : q[0] - Math.min(q[0] - LEAD, lo[0] - 16));
      if (plaque) { // keep the plate on the screen
        if (side === 'r' && q[0] + lead + tw > W - m) lead = Math.max(14, W - m - tw - q[0]);
        if (side === 'l' && q[0] - lead - tw < m) lead = Math.max(14, q[0] - m - tw);
      }
      var y = q[1], dy = 0;
      var list = phone ? used.l.concat(used.r) : used[side], gap = phone && plaque ? 120 : 70;
      list.forEach(function (yy) { if (Math.abs(y + dy - yy) < gap) dy += gap; });
      if (y + dy > H - 120) dy = H - 120 - y;
      if (y + dy < 112) dy = 112 - y;   // clear of the header
      used[side].push(y + dy);
      o.el.className = 'note ' + side + (plaque ? ' plaque' : '');
      o.el.style.setProperty('--lead', Math.round(lead) + 'px');
      o.el.querySelector('.txt').style.marginTop = dy + 'px';
      o.el.style.transform = 'translate3d(' + q[0] + 'px,' + q[1] + 'px,0)';
      o.el.style.opacity = al;
    });
  }
  var raf = 0;
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; frame(); }); }, { passive: true });
  addEventListener('resize', layout);
  addEventListener('load', layout);
  layout();
})();
