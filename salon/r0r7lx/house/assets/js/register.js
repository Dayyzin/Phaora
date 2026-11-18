// The register: the kept seat (marketing/story/REGISTER.md and its prototype). The front row from above, real cinema
// seats, the kept seat the only red one. A touch on a seat shows who is in it (the book's maker's notes); the red one
// turns the card. A name and an address keep the seat; then the seat folds down and the film's card lands on it, and
// their name comes up under it, in David's face.
// It sends nothing anywhere but phaora.com (the live register's own route, as canon has it); this build never goes
// live, so here the card plays the reward and nothing leaves the page. No date is shown.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var house = $('#house'), row = $('#row'), scrim = $('#scrim'), piece = $('#piece'), card = $('#cardsheet'), flip = $('#flip'),
      nm = $('#nm'), em = $('#em'), keep = $('#keep'), err = $('#err'), after = $('#after'), hint = $('#hint'), turn = $('#turn');
  var ROW = JSON.parse($('#rowdata').textContent), kept = false, T = [];
  var later = function (f, ms) { T.push(setTimeout(f, ms)); };
  // where each seat's cushion and the aisle-end arm land in the picture (seats/row_above.py), as fractions
  var POS = { L2: { x: .1139, y: .4998 }, L1: { x: .2097, y: .4999 }, L0: { x: .3081, y: .4996 }, R0: { x: .6917, y: .4996 }, R1: { x: .7904, y: .4994 },
              R2: { x: .8857, y: .4995 }, ARM: { x: .6311, y: .4938 }, card: { x: .124, y: .4895 } };
  function layRow() {   // the picture is 390 x 844 (a phone); on any frame it covers it, centred
    var fw = house.clientWidth, fh = house.clientHeight, s = Math.max(fw / 390, fh / 844), w = 390 * s, h = 844 * s;
    Object.assign(row.style, { width: w + 'px', height: h + 'px', left: (fw - w) / 2 + 'px', top: (fh - h) / 2 + 'px' });
  }
  function seats() {
    var sw = Math.abs(POS.R1.x - POS.R0.x) * .96, sh = .045;
    function add(p, w, label, go) { var b = document.createElement('button'); b.className = 'hit'; b.type = 'button'; b.setAttribute('aria-label', label);
      Object.assign(b.style, { left: p.x * 100 + '%', top: p.y * 100 + '%', width: w * 100 + '%', height: sh * 100 + '%' }); b.addEventListener('click', go); row.appendChild(b); }
    add(POS.L2, sw, 'The kept seat', showCard);
    Object.keys(ROW).forEach(function (code) { var d = ROW[code]; add(POS[code], code === 'ARM' ? sw * .55 : sw, d.name, function () { showPiece(d); }); });
    Object.assign($('#warm').style, { left: POS.card.x * 100 + '%', top: POS.card.y * 100 + '%' });
  }
  function showPiece(d) {
    $('#pimg').src = d.img; $('#pimg').alt = d.name; $('#pname').textContent = d.name; $('#plink').href = d.page + '.html';
    $('#pnotes').innerHTML = d.notes.map(function (n) { return '<li><span>' + n + '</span></li>'; }).join('');
    card.classList.remove('on'); scrim.classList.remove('on', 'deep'); piece.classList.add('on');
  }
  function showCard() {
    piece.classList.remove('on'); card.classList.add('on'); scrim.classList.add('on', 'deep');
    if (!kept) later(function () { flip.classList.add('back'); later(function () { nm.focus({ preventScroll: true }); }, 750); }, 700);
  }
  function close() {
    nm.blur(); em.blur(); piece.classList.remove('on'); card.classList.remove('on'); scrim.classList.remove('on', 'deep');
    if (!kept) later(function () { flip.classList.remove('back'); }, 500);
  }
  scrim.addEventListener('click', close); $('#px').addEventListener('click', close); $('#cx').addEventListener('click', close);
  card.addEventListener('click', function (e) { if (e.target === card) close(); });
  turn.addEventListener('click', showCard);

  var LIVE = /(^|\.)phaora\.com$/.test(location.hostname), sending = false, ref = '';
  try { var r = new URLSearchParams(location.search).get('ref') || ''; if (/^[a-z0-9-]{1,40}$/.test(r)) ref = r; } catch (x) {}
  async function keepSeat() {
    if (kept) return close();
    if (sending || !flip.classList.contains('back')) return;
    var n = nm.value.trim(), e = em.value.trim();
    if (!n) { err.textContent = 'The card needs a name.'; nm.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) { err.textContent = 'And an address to send word to.'; em.focus(); return; }
    var ok = !LIVE;   // the preview: nothing is sent, the reward plays
    if (LIVE) {
      sending = true; keep.disabled = true; err.textContent = 'Keeping your seat…';
      var body = { email: e, name: n, list: 'chapter-1', website: $('#hp').value || '' }; if (ref) body.ref = ref;
      try {
        var res = await fetch('https://crm.phaora.com/api/public/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        var j = await res.json().catch(function () { return null; }); ok = !!(j && j.ok);
        if (!ok) err.textContent = (j && j.error) || "That address didn't take. Try it once more.";
      } catch (x) { err.textContent = "The register didn't answer. Try it once more."; }
      sending = false; keep.disabled = false;
    }
    if (!ok) return;
    err.textContent = ''; kept = true; nm.readOnly = em.readOnly = true; nm.blur(); em.blur();
    card.classList.add('kept-card'); keep.textContent = 'return to the row'; after.classList.add('on'); house.classList.add('done');
    hint.innerHTML = 'Your seat is kept.<br>Touch the others to see who sits beside you.'; turn.textContent = 'see your card';
    reward(n);
  }
  // the reward: the kept seat's film (the cushion folds down, the film's card settles on it), then their name
  function reward(name) {
    var R = $('#reward'), desk = innerWidth / innerHeight >= 1, v = R.querySelector(desk ? '.rv.desk video' : '.rv.phone video'), who = R.querySelector('.who');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !v) return;
    var gone = false; function end() { if (gone) return; gone = true; R.classList.remove('on'); setTimeout(function () { v.pause(); who.classList.remove('on'); }, 900); }
    who.textContent = name; R.classList.add('on'); v.loop = false; v.currentTime = 0;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    setTimeout(function () { who.classList.add('on'); }, 2600);
    v.addEventListener('ended', function () { setTimeout(end, 1800); }, { once: true });
    setTimeout(end, 9000); R.addEventListener('click', end, { once: true });
  }
  function fit() { var fs = 30; nm.style.fontSize = fs + 'px'; while (nm.scrollWidth > nm.clientWidth + 1 && fs > 15) nm.style.fontSize = (--fs) + 'px'; }
  nm.addEventListener('input', fit);
  keep.addEventListener('click', keepSeat);
  $('#form').addEventListener('submit', function (ev) { ev.preventDefault(); keepSeat(); });
  [nm, em].forEach(function (i) { i.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); i === nm ? em.focus() : keepSeat(); } });
    i.addEventListener('input', function () { err.textContent = ''; }); });
  addEventListener('resize', layRow);
  seats(); layRow();
  // ?kept shows the reward's after-state (for review): the card kept, the row lit
  if (/[?&]kept/.test(location.search)) { showCard(); setTimeout(function () { nm.value = 'kept'; em.value = 'a@b.cd'; keepSeat(); }, 1500); }
})();
