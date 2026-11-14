// The film page: the film waits for Play, with its sound.
(function () {
  document.querySelectorAll('.screen').forEach(function (s) {   // each screen (Short 02 first, then the film) waits for its Play
    var v = s.querySelector('video'), b = s.querySelector('.play');
    if (!v) { if (b) b.remove(); return; }
    v.loop = false; v.controls = false;
    b.addEventListener('click', function () { v.muted = false; v.controls = true; s.classList.add('playing'); var p = v.play(); if (p && p.catch) p.catch(function () {}); });
  });
})();
