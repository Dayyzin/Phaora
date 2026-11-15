// The walk-around as rendered stops: one shot a stop, crossfaded by the scroll, each pushing in slowly; the stop's
// note engraved over it while it holds.
(function () {
  var root = document.querySelector('.walk.frames'); if (!root) return;
  var F = [].slice.call(root.querySelectorAll('.wf')), N = [].slice.call(root.querySelectorAll('.wfn')),
      hud = root.querySelector('.hud'), bar = root.querySelector('.prog i'), n = F.length, raf = 0;
  var sm = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  function frame() {
    raf = 0;
    var r = root.getBoundingClientRect(), H = innerHeight, span = Math.max(1, r.height - H);
    var P = Math.max(0, Math.min(n - 1, (-r.top / span) * (n - 1 + .6) - .3));   // 0 .. n-1, a hold at each stop
    if (P > .02) root.classList.add('moved');
    F.forEach(function (el, i) { var d = P - i, a = sm(1 - Math.abs(d) * 1.6);
      el.style.opacity = i === 0 && d < 0 ? 1 : a; el.style.transform = 'scale(' + (1.02 + .05 * sm((d + 1) / 2)) + ')'; });
    N.forEach(function (el, i) { var a = sm(1 - Math.abs(P - i) * 2.6); el.style.opacity = a; el.style.transform = 'translateY(' + (1 - a) * 14 + 'px)'; });
    if (hud) hud.style.opacity = Math.max(0, 1 - P * 2.2);
    if (bar) bar.style.transform = 'scaleX(' + (n > 1 ? P / (n - 1) : 1) + ')';
    if (root.classList.contains('band')) document.body.classList.toggle('overwalk', r.top < 70 && r.bottom > 70);
  }
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  addEventListener('resize', frame); frame();
})();
