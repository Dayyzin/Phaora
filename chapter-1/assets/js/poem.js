// The poem in the room (SCENES.md). The room is the stage's own (room.js, captured per chapter with that chapter's pins),
// dimmed to near-cinema. Each chapter's scene plays as a projection on its back wall and cove (baked by build_poem.py,
// the curve in it). Scroll: a chapter's first step brings its picture up and its name; each step after reveals one line,
// carved in light over the lower part of the picture. Between chapters: the projector clicks, the picture cuts to dark,
// the pins ripple and re-form into the next chapter's figure (the room's own morph), and the next scene fades up.
(() => {
  const D = JSON.parse(document.getElementById('poem').textContent), C = D.chapters;
  const room = document.querySelector('.room'), dark = room.querySelector('.dark'), morph = room.querySelector('.morph');
  const vids = [...room.querySelectorAll('.scene')], beam = room.querySelector('.beam'), dust = room.querySelector('.dust');
  const text = document.querySelector('.poemtext'), chapEl = text.querySelector('.chap'), sub = text.querySelector('.sub');
  const track = document.querySelector('.track');
  const devOf = () => (innerWidth / innerHeight < 1 ? 'phone' : 'desktop');
  let DEV = devOf();
  const src = (i, k) => k === 'dark' ? `media/poem/${C[i].id}-${DEV}.webp` : k === 'morph' ? `media/poem/morph-${C[i].id}-${C[i + 1].id}-${DEV}.mp4`
    : `media/poem/${C[i].id}-${DEV}.mp4`;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ready = v => new Promise(r => { if (v.readyState >= 3) return r(); const f = () => { v.removeEventListener('canplay', f); r(); }; v.addEventListener('canplay', f); setTimeout(r, 4000); });
  const imgReady = (s) => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = s; });

  // ---- the steps: per chapter, its name (the picture comes up), then one line a step
  const steps = [];
  C.forEach((c, ci) => { steps.push({ ci, si: -1, li: -1 }); c.stanzas.forEach((st, si) => st.forEach((_, li) => steps.push({ ci, si, li }))); });
  const firstStep = ci => steps.findIndex(s => s.ci === ci);
  let STEP = 0;
  const size = () => { STEP = Math.round(innerHeight * 0.5); track.style.paddingBottom = Math.max(0, innerHeight - STEP) + 'px';
    if (track.children.length !== steps.length) { track.innerHTML = ''; steps.forEach(() => { const d = document.createElement('div'); d.className = 'snap'; track.appendChild(d); }); }
    [...track.children].forEach(d => { d.style.height = STEP + 'px'; }); };

  // ---- where the projection falls on this screen (the room is drawn to cover the window, as the stage is)
  function place() {
    const [W, H] = D.size[DEV], r = D.rect[DEV], vw = innerWidth, vh = innerHeight, s = Math.max(vw / W, vh / H);
    const ox = (vw - W * s) / 2, oy = (vh - H * s) / 2, X = x => ox + x * W * s, Y = y => oy + y * H * s;
    const x0 = X(r[0]), x1 = X(r[2]), y0 = Y(r[1]), y1 = Y(r[3]);
    // the lines sit as subtitles do: centred on the picture, their last line just above its lower edge (on a phone,
    // where the picture is small, just under it)
    const tw = Math.min(DEV === 'phone' ? vw * 0.9 : (x1 - x0) * 0.8, 760);
    text.style.setProperty('--tx', ((vw - tw) / 2) + 'px'); text.style.setProperty('--tw', tw + 'px');
    if (DEV === 'phone') { text.style.setProperty('--ty', (y1 + 16) + 'px'); text.style.setProperty('--tb', 'auto'); }
    else { text.style.setProperty('--ty', 'auto'); text.style.setProperty('--tb', (vh - (y0 + (y1 - y0) * 0.93)) + 'px'); }
    beam.style.setProperty('--b0', (-0.15 * vw) + 'px'); beam.style.setProperty('--b1', (1.15 * vw) + 'px');
    beam.style.setProperty('--r0', x0 + 'px'); beam.style.setProperty('--r2', x1 + 'px'); beam.style.setProperty('--rb', y1 + 'px');
    DUST.box = { x0, x1, y0, y1, vw, vh };
    dust.width = Math.round(vw * Math.min(2, devicePixelRatio || 1)); dust.height = Math.round(vh * Math.min(2, devicePixelRatio || 1));
  }

  // ---- dust in the beam: a few motes drifting through the light, only while the projector runs
  const DUST = { box: null, p: [] };
  for (let i = 0; i < 70; i++) DUST.p.push({ u: Math.random(), v: Math.random(), s: 0.4 + Math.random() * 1.1, a: Math.random() * 6.28, w: 0.3 + Math.random() * 0.9,
    du: (Math.random() - 0.5) * 0.004, dv: (Math.random() - 0.3) * 0.003 });
  const dx = dust.getContext('2d');
  let lit = 0, litT = 0;
  function drawDust(t) {
    const b = DUST.box; if (!b) return;
    lit += ((room.classList.contains('lit') ? 1 : 0) - lit) * 0.06;
    const k = dust.width / b.vw; dx.clearRect(0, 0, dust.width, dust.height); if (lit < 0.01) return;
    for (const p of DUST.p) {
      p.u += p.du / 60; p.v += p.dv / 60; if (p.u < 0) p.u += 1; if (p.u > 1) p.u -= 1; if (p.v < 0) p.v += 1; if (p.v > 1) p.v -= 1;
      // a mote at depth v: high and wide near you, closing in on the picture as it goes
      const y = b.y1 * p.v * 0.98, wl = -0.15 * b.vw + (b.x0 + 0.15 * b.vw) * (y / b.y1), wr = 1.15 * b.vw + (b.x1 - 1.15 * b.vw) * (y / b.y1);
      const x = wl + (wr - wl) * p.u, tw = 0.5 + 0.5 * Math.sin(t * 0.0012 * p.w + p.a);
      dx.globalAlpha = lit * 0.32 * tw * (1 - 0.6 * p.v); dx.fillStyle = '#fff3dc';
      dx.beginPath(); dx.arc(x * k, y * k, p.s * k, 0, 6.283); dx.fill();
    }
  }
  const loop = t => { drawDust(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop);

  // ---- the click: a projector's gate, heard once a gesture has let the page make a sound
  let AC = null;
  const wake = () => { if (AC) return; try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} };
  ['pointerdown', 'keydown', 'touchend'].forEach(e => addEventListener(e, wake, { once: true, passive: true }));
  function click() {
    room.classList.remove('click'); void room.offsetWidth; room.classList.add('click');
    if (!AC) return; const t = AC.currentTime, n = Math.round(AC.sampleRate * 0.035), buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 1.4;
    g.gain.setValueAtTime(0.22, t); s.connect(f).connect(g).connect(AC.destination); s.start(t);
  }

  // ---- the lines
  let textCh = -1, textSt = -2;
  function showText(s) {
    const c = C[s.ci];
    if (textCh !== s.ci) {
      textCh = s.ci; textSt = -2; sub.innerHTML = '';
      chapEl.querySelector('.n').textContent = c.num; chapEl.querySelector('.t').textContent = c.title;
      c.stanzas.forEach((st, si) => { const p = document.createElement('p'); p.className = 'st gone'; p.dataset.si = si;
        p.innerHTML = st.map(l => `<span class="l">${l}</span>`).join(''); sub.appendChild(p); });
    }
    chapEl.classList.add('on');
    [...sub.children].forEach(p => { const si = +p.dataset.si; p.classList.toggle('gone', si !== s.si);
      [...p.children].forEach((l, li) => l.classList.toggle('on', si === s.si && li <= s.li)); });
  }
  function hideText() { chapEl.classList.remove('on'); [...sub.children].forEach(p => p.classList.add('gone')); }

  // ---- the projector
  let cur = -1, busy = false, want = null, front = 0, first = true;
  const back = () => vids[1 - front];
  function preload(i) {   // the next chapter's picture and its dark room, ready before it is asked for
    if (i < 0 || i >= C.length) return; const v = back(), s = src(i, 'scene');
    if (!v.src.endsWith(s)) { v.src = s; v.load(); }
    imgReady(src(i, 'dark'));
    if (i - 1 >= 0 && C[i - 1].morph && !morph.src.endsWith(src(i - 1, 'morph'))) { morph.src = src(i - 1, 'morph'); morph.load(); }
  }
  async function up(i) {   // the scene fades up (the first one flickers on: the projector starting)
    let v = back(); const s = src(i, 'scene');
    if (!v.src.endsWith(s)) { v.src = s; v.load(); }
    await ready(v); try { v.currentTime = 0; } catch (e) {}
    v.play().catch(() => {});
    vids[front].classList.remove('on'); vids[front].classList.add('cut'); vids[front].pause();
    front = 1 - front; v.classList.remove('cut');
    if (first) { first = false; v.classList.add('flick', 'on'); setTimeout(() => v.classList.remove('flick'), 700); }
    else v.classList.add('on');
    room.classList.add('lit');
  }
  async function go(to) {
    if (busy) { want = to; return; }
    busy = true; want = null;
    const from = cur;
    if (from >= 0) {
      click();   // the cut to dark: the picture is gone in one frame
      const v = vids[front]; v.classList.add('cut'); v.classList.remove('on'); v.pause(); room.classList.remove('lit'); hideText();
      await sleep(260);
      if (to === from + 1 && C[from].morph) {   // the pins ripple out of this chapter's figure and re-form as the next
        const m = src(from, 'morph'); if (!morph.src.endsWith(m)) { morph.src = m; morph.load(); }
        await ready(morph); try { morph.currentTime = 0; } catch (e) {}
        morph.playbackRate = 1.25; morph.classList.add('on');
        await Promise.race([morph.play().then(() => new Promise(r => morph.addEventListener('ended', r, { once: true }))).catch(() => {}), sleep(4200)]);
        await imgReady(src(to, 'dark')); dark.src = src(to, 'dark'); await sleep(40); morph.classList.remove('on');
      } else { await imgReady(src(to, 'dark')); dark.src = src(to, 'dark'); await sleep(220); }
    } else { await imgReady(src(to, 'dark')); dark.src = src(to, 'dark'); }
    cur = to;
    await up(to);
    busy = false;
    preload(to + 1);
    onScroll();
    if (want !== null && want !== cur) go(want);
  }

  // ---- scroll
  let lastIdx = -1;
  function onScroll() {
    document.body.classList.toggle('scrolled', scrollY > 8);
    const idx = Math.max(0, Math.min(steps.length - 1, Math.round(scrollY / STEP))), s = steps[idx];
    if (s.ci !== cur) { go(s.ci); return; }
    if (busy) return;
    if (idx !== lastIdx) { lastIdx = idx; showText(s); }
  }
  addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  addEventListener('resize', () => { const d = devOf(); size(); place();
    if (d !== DEV) { DEV = d; if (cur >= 0) { dark.src = src(cur, 'dark'); const v = vids[front]; v.src = src(cur, 'scene'); v.load(); v.play().catch(() => {}); back().removeAttribute('src'); } }
    onScroll(); });
  document.addEventListener('visibilitychange', () => { const v = vids[front]; if (document.hidden) v.pause(); else if (v.classList.contains('on')) v.play().catch(() => {}); });

  // ---- the lettering (never typed): David's off-white file, inlined
  fetch('assets/brand/lettering-offwhite.svg').then(r => r.text()).then(t => { const svg = t.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(width|height)="[^"]*"/, '').replace(/\s(width|height)="[^"]*"/, '');
    document.querySelectorAll('.navband .logo').forEach(l => { l.innerHTML = svg; }); }).catch(() => {});

  size(); place();
  const h = location.hash.slice(1), hc = C.findIndex(c => c.id === h);
  if (hc > 0) scrollTo(0, firstStep(hc) * STEP);
  dark.src = src(hc > 0 ? hc : 0, 'dark');
  onScroll();
})();
