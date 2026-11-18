// The piece pages' gallery (David, 18 Nov: "add tiny squares instead to scroll through them. Scroll is too silly for
// fashion house"): one large frame and a row of small squares. A square shows its picture in the frame with a quick
// crossfade; on a phone a swipe across the frame moves to the next or the one before. The current square is marked
// only by its full opacity.
(function () {
  document.querySelectorAll('.gallery').forEach(function (g) {
    var main = g.querySelector('.gal-main'), items = [].slice.call(g.querySelectorAll('.gi')), th = [].slice.call(g.querySelectorAll('.gt'));
    var cur = 0, n = items.length;
    function show(i) {
      i = (i + n) % n; if (i === cur) return;
      var im = items[i].querySelector('img'); if (im && im.loading === 'lazy') im.loading = 'eager';
      items[cur].classList.remove('on'); th[cur].classList.remove('on'); th[cur].setAttribute('aria-selected', 'false');
      cur = i;
      items[cur].classList.add('on'); th[cur].classList.add('on'); th[cur].setAttribute('aria-selected', 'true');
    }
    th.forEach(function (t, i) { t.addEventListener('click', function () { show(i); }); });
    main.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
    var x0 = null, y0 = 0;
    main.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; } }, { passive: true });
    main.addEventListener('touchend', function (e) {
      if (x0 === null) return; var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) show(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    // the next picture is loaded once the page is idle, so the first tap is quick
    setTimeout(function () { items.slice(1, 3).forEach(function (it) { var im = it.querySelector('img'); if (im) im.loading = 'eager'; }); }, 1500);
  });
})();
