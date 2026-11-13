// The film page: the film waits for Play, with its sound.
(function () {
  var s = document.querySelector('.screen'); if (!s) return;
  var v = s.querySelector('video'), b = s.querySelector('.play');
  if (!v) { if (b) b.remove(); return; }
  v.loop = false; v.controls = false;
  b.addEventListener('click', function () { v.muted = false; v.controls = true; s.classList.add('playing'); var p = v.play(); if (p && p.catch) p.catch(function () {}); });
})();
