// The objects' reveals (David, 10 Nov night; new-pieces-2026-11/BRIEF.md): the Reel's lid lifting to the cream suede and
// the Ö, the Matinee unzipping, the top-handle's flap opening, the sunglasses folding into their case. Each is its own
// frames from Blender at 24 fps (assets/reveal/<id>/reveal.json: { fps, w, h, frames: [...] }, the last frame the object
// at rest). The same rules as the room: every frame decoded before it shows, two neighbouring frames crossfaded by the
// clock (plus-lighter inside an isolated group: an exact blend, alpha included), opacity and transform only, and the
// clock waits for a frame that is not decoded yet instead of showing a held one.
//   const r = PhReveal(box, spec, { onEnd });   r.play(); r.rest(); r.ready() (its first frames decoded)
// box: a positioned element the frames fill (object-fit: contain inside it). Nothing is laid out while it plays.
(function () {
  'use strict';
  const AHEAD = 8, LAYERS = AHEAD + 4;
  window.PhReveal = function (box, spec, opts) {
    opts = opts || {};
    const F = spec.frames, N = F.length, fps = spec.fps || 24, DUR = (N - 1) / fps;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const g = document.createElement('div');
    g.className = 'reveal';
    g.style.cssText = 'position:absolute;inset:0;isolation:isolate;pointer-events:none';
    box.appendChild(g);
    const L = [];
    for (let i = 0; i < LAYERS; i++) {
      const im = new Image(); im.alt = ''; im.decoding = 'async'; im.draggable = false;
      im.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0;mix-blend-mode:plus-lighter;will-change:opacity';
      g.appendChild(im); L.push({ im, u: null, ready: false, on: false, used: 0 });
    }
    let clk = 0;
    function want(u) {
      for (const s of L) if (s.u === u) { s.used = ++clk; return s; }
      let v = null; for (const s of L) if (!s.on && (!v || s.used < v.used)) v = s;
      if (!v) return null;
      v.u = u; v.ready = false; v.used = ++clk; v.im.src = u; const me = v;
      (v.im.decode ? v.im.decode() : Promise.resolve()).catch(() => {}).then(() => { if (me.u === u) me.ready = true; });
      return v;
    }
    const ready = (u) => L.some(s => s.u === u && s.ready);
    const op = (s, a) => { const v = a <= 0.0005 ? '0' : a >= 0.9995 ? '1' : a.toFixed(4); if (s.im.style.opacity !== v) s.im.style.opacity = v; };
    function show(k, f) {   // frame k at 1 - f, k + 1 at f
      const k2 = Math.min(N - 1, k + 1), A = want(F[k]), B = f > 0 ? want(F[k2]) : null;
      L.forEach(s => { s.on = false; });
      if (A) { A.on = true; op(A, 1 - f); }
      if (B) { B.on = true; op(B, f); }
      L.forEach(s => { if (!s.on) op(s, 0); });
      for (let j = 1; j <= AHEAD; j++) if (k + j < N) want(F[k + j]);
    }
    let t = 0, last = null, raf = 0, playing = false;
    function frame(now) {
      raf = 0; if (!playing) return;
      if (last === null) last = now;
      const t1 = Math.min(DUR, t + (now - last) / 1000); last = now;
      const x = t1 * fps, k = Math.min(N - 1, Math.floor(x)), k2 = Math.min(N - 1, k + 1);
      if (ready(F[k]) && ready(F[k2])) t = t1;   // the clock waits for frames that are not decoded yet
      else { want(F[k]); want(F[k2]); }
      const xs = t * fps, ks = Math.min(N - 1, Math.floor(xs));
      show(ks, Math.min(1, xs - ks));
      if (t >= DUR) { playing = false; show(N - 1, 0); if (opts.onEnd) opts.onEnd(); return; }
      raf = requestAnimationFrame(frame);
    }
    for (let j = 0; j < AHEAD; j++) want(F[Math.min(N - 1, j)]);
    want(F[N - 1]);
    return {
      ready: () => ready(F[0]) && ready(F[Math.min(N - 1, 1)]),
      play() { if (reduce) return this.rest(); t = 0; last = null; playing = true; show(0, 0); if (!raf) raf = requestAnimationFrame(frame); },
      rest() { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; show(N - 1, 0); },
      el: g,
    };
  };
})();
