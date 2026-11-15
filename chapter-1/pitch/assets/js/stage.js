// The catalogue in the room (David, 15 Nov): the pieces in sets (8 on a computer, 6 on a phone), one set a screen,
// rising out of the top as the next set comes up from the floor; the nav goes on the first scroll.
(() => {
  const main = document.getElementById('sets'); if (!main) return;
  const items = [...main.querySelectorAll('.it')];
  let per = 0, sets = [];
  const io = new IntersectionObserver(es => es.forEach(e => {
    const s = e.target;
    if (e.isIntersecting && e.intersectionRatio > 0.55) { s.classList.add('on'); s.classList.remove('past'); }
    else if (!e.isIntersecting || e.intersectionRatio < 0.45) { s.classList.remove('on'); s.classList.toggle('past', e.boundingClientRect.top < 0); }
  }), { threshold: [0, 0.45, 0.55, 1] });
  const group = () => {   // sets of 8 (4 x 2), or 6 on a phone (2 x 3); each piece a little after the one before
    const n = matchMedia('(max-width: 820px)').matches ? 6 : 8; if (n === per) return; per = n;
    sets.forEach(s => io.unobserve(s)); main.innerHTML = ''; sets = [];
    for (let i = 0; i < items.length; i += n) {
      const s = document.createElement('section'); s.className = 'set';
      items.slice(i, i + n).forEach((it, j) => { it.style.transitionDelay = (j * 0.06) + 's'; s.appendChild(it); });
      main.appendChild(s); sets.push(s); io.observe(s);
    }
    if (sets[0]) sets[0].classList.add('on');
  };
  group(); addEventListener('resize', group);
  addEventListener('scroll', () => document.body.classList.toggle('scrolled', scrollY > 8), { passive: true });
  // David's lettering with the solo Ö, inlined in the room's dark ink (never typed)
  fetch('assets/lettering-solo-offwhite.svg').then(r => r.text()).then(t => { const svg = t.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/fill="#E2DDD2"/g, 'fill="currentColor"').replace(/\s(width|height)="[^"]*"/, '').replace(/\s(width|height)="[^"]*"/, '');
    document.querySelectorAll('.logo').forEach(l => { l.innerHTML = svg; }); });
})();
