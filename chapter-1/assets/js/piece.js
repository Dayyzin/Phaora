// A piece's page: its short (or the film) plays inline, muted, while it is on screen.
(function () {
  var vs = document.querySelectorAll('.playin video'); if (!vs.length || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target;
    if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }); }, { threshold: 0.35 });
  vs.forEach(function (v) { v.muted = true; v.setAttribute('playsinline', ''); io.observe(v); });
})();
// the header in cream over the hero, in the page's ink below it
(function () {
  var h = document.querySelector('.pp .hero'); if (!h) return;
  var f = function () { document.body.classList.toggle('past-hero', h.getBoundingClientRect().bottom < 70); };
  addEventListener('scroll', f, { passive: true }); f();
})();
