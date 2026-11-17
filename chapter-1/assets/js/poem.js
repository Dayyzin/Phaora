// The poem in the room (SCENES.md). The projector plays the film with its voice (David, 17 Nov: "Put this instead.
// Match the poem writing with the dialogue"); the words on the wall are the lines the voice reads, each up while it is
// spoken. The film is the clock: its time sets the line, the chapter's name and the pins, which re-form into each
// chapter's motif as the film crosses into it. It plays by itself; a scroll takes the lead (the film goes to that line
// and plays on from there). A computer runs the room itself (room.js, live) under the projector's light; a phone plays
// the room baked into the film.
(() => {
  const D = JSON.parse(document.getElementById('poem').textContent), S = D.sections, Q = D.cues;
  const room = document.querySelector('.room'), dark = room.querySelector('.dark'), film = room.querySelector('.film');
  const beam = room.querySelector('.beam'), dust = room.querySelector('.dust');
  const text = document.querySelector('.poemtext'), chapEl = text.querySelector('.chap'), sub = text.querySelector('.sub');
  const track = document.querySelector('.track');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const devOf = () => (innerWidth / innerHeight < 1 ? 'phone' : 'desktop');
  let DEV = devOf();
  const filmSrc = () => DEV === 'desktop' ? 'media/poem/film-desktop-light.mp4' : 'media/poem/film-phone.mp4';
  const darkSrc = k => `media/poem/${S[k].id}-${DEV}.webp`;
  const sectionAt = t => { let k = 0; S.forEach((s, i) => { if (t >= s.from) k = i; }); return k; };
  const cueAt = t => { for (let i = Q.length - 1; i >= 0; i--) { const q = Q[i], next = Q[i + 1]; if (t >= q.from - 0.15 && t < Math.min(q.to + 1.4, next ? next.from - 0.15 : 1e9)) return i; } return -1; };

  // ---- the live room (a computer with WebGL): room.js itself, dimmed; its pins step a chapter as the film turns one
  const glOK = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  let LIVE = DEV === 'desktop' && glOK && !(navigator.maxTouchPoints > 0) && !/[?&]baked=1/.test(location.search);
  let live = null, liveReady = false, liveAt = 0;
  if (LIVE) {
    live = document.createElement('iframe'); live.className = 'live'; live.setAttribute('aria-hidden', 'true'); live.tabIndex = -1;
    live.src = 'poem-room.html?empty=1&intro=0&dissolve=1';   // dissolve=1: no turntable to fetch (the room is empty)
    room.insertBefore(live, room.firstChild); room.classList.add('is-live');
    const t0 = Date.now(), wait = setInterval(() => {
      let ok = false; try { ok = live.contentWindow.ready === true; } catch (e) {}
      if (ok) { clearInterval(wait); liveReady = true; room.classList.add('live-on'); roomTo(sec, true); }
      else if (Date.now() - t0 > 15000) { clearInterval(wait); LIVE = false; live.remove(); room.classList.remove('is-live'); }
    }, 120);
  }
  let liftT = 0;
  function roomTo(k, quiet) {   // the pins (or the baked room's still) to chapter k
    if (DEV === 'desktop') {
      if (LIVE && liveReady) {
        if (k === liveAt) return;
        try { const w = live.contentWindow, d = k > liveAt ? 1 : -1; for (let j = liveAt; j !== k; j += d) w.step(d); } catch (e) {}
        liveAt = k; if (!quiet) { room.classList.add('lift'); clearTimeout(liftT); liftT = setTimeout(() => room.classList.remove('lift'), 3300); }
      } else dark.src = darkSrc(k);
    }
  }

  // ---- the steps: one a line of the voice; scrolling to one takes the film there
  let STEP = 0;
  const size = () => { STEP = Math.round(innerHeight * 0.5); track.style.paddingBottom = Math.max(0, innerHeight - STEP) + 'px';
    if (track.children.length !== Q.length) { track.innerHTML = ''; Q.forEach(() => { const d = document.createElement('div'); d.className = 'snap'; track.appendChild(d); }); }
    [...track.children].forEach(d => { d.style.height = STEP + 'px'; }); };

  // ---- where the picture falls on this screen: the words under it, overlapping its lower edge a little
  function place() {
    const [W, H] = D.size[DEV], r = D.rect[DEV], vw = innerWidth, vh = innerHeight, s = Math.max(vw / W, vh / H);
    const ox = (vw - W * s) / 2, oy = (vh - H * s) / 2, X = x => ox + x * W * s, Y = y => oy + y * H * s;
    const x0 = X(r[0]), x1 = X(r[2]), y0 = Y(r[1]), y1 = Y(r[3]);
    const tw = Math.min(DEV === 'phone' ? vw * 0.9 : (x1 - x0) * 0.6, 640);
    text.style.setProperty('--tx', ((vw - tw) / 2) + 'px'); text.style.setProperty('--tw', tw + 'px');
    text.style.setProperty('--ty', (y1 - (DEV === 'phone' ? 30 : 46)) + 'px'); text.style.setProperty('--tb', 'auto');
    beam.style.setProperty('--b0', (-0.15 * vw) + 'px'); beam.style.setProperty('--b1', (1.15 * vw) + 'px');
    beam.style.setProperty('--r0', x0 + 'px'); beam.style.setProperty('--r2', x1 + 'px'); beam.style.setProperty('--rb', y1 + 'px');
    DUST.box = { x0, x1, y0, y1, vw, vh };
    dust.width = Math.round(vw * Math.min(2, devicePixelRatio || 1)); dust.height = Math.round(vh * Math.min(2, devicePixelRatio || 1));
    snow.width = dust.width; snow.height = dust.height;
  }

  // ---- dust in the beam, only while the projector runs
  const DUST = { box: null, p: [] };
  for (let i = 0; i < 70; i++) DUST.p.push({ u: Math.random(), v: Math.random(), s: 0.4 + Math.random() * 1.1, a: Math.random() * 6.28, w: 0.3 + Math.random() * 0.9,
    du: (Math.random() - 0.5) * 0.004, dv: (Math.random() - 0.3) * 0.003 });
  const dx = dust.getContext('2d'); let lit = 0;
  function drawDust(t) {
    const b = DUST.box; if (!b) return;
    lit += ((room.classList.contains('lit') ? 1 : 0) - lit) * 0.06;
    const k = dust.width / b.vw; dx.clearRect(0, 0, dust.width, dust.height); if (lit < 0.01) return;
    for (const p of DUST.p) {
      p.u += p.du / 60; p.v += p.dv / 60; if (p.u < 0) p.u += 1; if (p.u > 1) p.u -= 1; if (p.v < 0) p.v += 1; if (p.v > 1) p.v -= 1;
      const y = b.y1 * p.v * 0.98, wl = -0.15 * b.vw + (b.x0 + 0.15 * b.vw) * (y / b.y1), wr = 1.15 * b.vw + (b.x1 - 1.15 * b.vw) * (y / b.y1);
      const x = wl + (wr - wl) * p.u, tw = 0.5 + 0.5 * Math.sin(t * 0.0012 * p.w + p.a);
      dx.globalAlpha = lit * 0.32 * tw * (1 - 0.6 * p.v); dx.fillStyle = '#fff3dc';
      dx.beginPath(); dx.arc(x * k, y * k, p.s * k, 0, 6.283); dx.fill();
    }
  }

  // ---- the room snows while the film does (David, 17 Nov: "Where it snows on the film, snows in the room"): from the
  // street to the brass doors (film 0-24 s), flakes fall through the room between you and the wall, faint in the dark,
  // bright where they cross the projector's beam; near ones large and soft, far ones small. The film's clock sets it:
  // paused, they hang; scrolled away, they go.
  const snow = room.querySelector('.snow'), sx = snow.getContext('2d');
  const SNOW = [[0, 24.0]];   // when it snows in the film (s)
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const snowAt = t => Math.max(0, ...SNOW.map(([a, b]) => (a <= 0 ? 1 : smooth(a - 0.5, a + 1.2, t)) * (1 - smooth(b - 1.5, b + 1.0, t))));
  const sprite = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,252,246,1)'); r.addColorStop(0.35, 'rgba(255,250,242,.75)'); r.addColorStop(1, 'rgba(255,248,238,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c; })();
  const FL = []; const NF = () => (DEV === 'phone' ? 120 : 230);
  const flake = (top) => { const z = Math.pow(Math.random(), 0.7); return { x: Math.random(), y: top ? -0.05 - Math.random() * 0.1 : Math.random(), z,
    s: 1.2 + (1 - z) * (1 - z) * 7, v: 0.035 + (1 - z) * 0.11, w: 0.3 + Math.random() * 0.8, ph: Math.random() * 6.28, sw: 0.004 + (1 - z) * 0.01 }; };
  let snowLast = 0, snowK = 0;
  function drawSnow(ts) {
    const dt = Math.min(0.05, (ts - (snowLast || ts)) / 1000); snowLast = ts;
    const want = snowAt(film.currentTime || 0); snowK += (want - snowK) * Math.min(1, dt * 3);
    const W = snow.width, H = snow.height, b = DUST.box; sx.clearRect(0, 0, W, H);
    if (snowK < 0.005 || !b) return;
    while (FL.length < NF()) FL.push(flake(false));
    const run = !film.paused, k = W / b.vw;
    for (const f of FL) {
      if (run) { f.y += f.v * dt; f.ph += f.w * dt; if (f.y > 1.05) Object.assign(f, flake(true)); }
      const x = (f.x + Math.sin(f.ph) * f.sw) * b.vw, y = f.y * b.vh;
      // lit where the beam crosses it: inside the wedge from the top edge down to the picture, brightest near the picture
      const wl = -0.15 * b.vw + (b.x0 + 0.15 * b.vw) * Math.min(1, y / b.y1), wr = 1.15 * b.vw + (b.x1 - 1.15 * b.vw) * Math.min(1, y / b.y1);
      const inBeam = y <= b.y1 && x >= wl && x <= wr ? 0.55 + 0.45 * (y / b.y1) : 0;
      const a = snowK * (0.16 + 0.7 * inBeam) * (0.55 + 0.45 * (1 - f.z));
      const r = f.s * k * (1 + (1 - f.z) * 0.6);
      sx.globalAlpha = Math.min(1, a); sx.drawImage(sprite, x * k - r, y * k - r, r * 2, r * 2);
    }
  }

  // ---- the words: one cue up at a time, the chapter's name above it
  const lines = Q.map((q, i) => { const p = document.createElement('p'); p.className = 'st gone'; p.dataset.i = i;
    p.innerHTML = q.lines.map(l => `<span class="l">${l}</span>`).join(''); sub.appendChild(p); return p; });
  let shownCue = -2, shownSec = -1;
  function showCue(i) {
    if (i === shownCue) return; shownCue = i;
    lines.forEach((p, j) => { const on = j === i; p.classList.toggle('gone', !on); [...p.children].forEach(l => l.classList.toggle('on', on)); });
  }
  function showSec(k) {
    if (k === shownSec) return; shownSec = k;
    chapEl.classList.remove('on');
    setTimeout(() => { chapEl.querySelector('.n').textContent = S[k].num; chapEl.querySelector('.t').textContent = S[k].title; chapEl.classList.add('on'); }, 350);
  }

  // ---- the film is the clock; a hand on the scroll takes the lead
  let sec = 0, userAt = -1e9, seeking = false, autoScroll = false;
  const user = () => { userAt = performance.now(); };
  ['wheel', 'touchstart', 'keydown'].forEach(e => addEventListener(e, ev => { if (!(ev.target.closest && ev.target.closest('.ctl'))) user(); }, { passive: true }));
  function sync() {   // the words, the chapter and the pins, from the film's time (also on its own time events, so a busy
    const t = film.currentTime || 0, k = sectionAt(t), c = cueAt(t);   // page never lets the words fall behind the voice)
    if (k !== sec) { sec = k; roomTo(k); }
    showSec(k); showCue(c); return c;
  }
  ['timeupdate', 'seeked'].forEach(e => film.addEventListener(e, sync));
  function frame(ts) {
    const c = sync();
    // the page follows the film, unless a hand is on it
    if (c >= 0 && performance.now() - userAt > 1500 && !seeking) {
      const y = c * STEP; if (Math.abs(scrollY - y) > 2 && !autoScroll) { autoScroll = true; scrollTo({ top: y, behavior: 'smooth' }); setTimeout(() => { autoScroll = false; }, 900); }
    }
    room.classList.toggle('lit', !film.paused);
    drawDust(ts); if (!reduce) drawSnow(ts); requestAnimationFrame(frame);
  }
  let settle = 0;
  addEventListener('scroll', () => {
    document.body.classList.toggle('scrolled', scrollY > 8);
    if (performance.now() - userAt > 1200) return;   // the page moved for the film, not for a hand
    clearTimeout(settle); settle = setTimeout(() => {   // the hand let go: the film goes to that line and plays on
      const i = Math.max(0, Math.min(Q.length - 1, Math.round(scrollY / STEP)));
      seeking = true; film.currentTime = Math.max(0, Q[i].from - 0.35);
      if (!userPaused) film.play().catch(() => {});
      setTimeout(() => { seeking = false; }, 400);
    }, 220);
  }, { passive: true });

  // ---- pause / play, and the sound (a browser starts a film silent until it is asked)
  let userPaused = false;
  const ctl = document.createElement('div'); ctl.className = 'ctl';
  ctl.innerHTML = '<button class="snd" type="button" aria-label="Sound on"><span>Sound</span></button><button class="auto" type="button" aria-label="Pause"><i></i><i></i></button>';
  document.body.appendChild(ctl);
  const snd = ctl.querySelector('.snd'), pp = ctl.querySelector('.auto');
  const syncCtl = () => { snd.classList.toggle('on', !film.muted); snd.setAttribute('aria-label', film.muted ? 'Sound on' : 'Sound off');
    pp.classList.toggle('paused', film.paused); pp.setAttribute('aria-label', film.paused ? 'Play' : 'Pause'); };
  snd.addEventListener('click', () => { film.muted = !film.muted; if (film.paused && !userPaused) film.play().catch(() => {}); syncCtl(); });
  pp.addEventListener('click', () => { if (film.paused) { userPaused = false; if (film.ended) film.currentTime = 0; film.play().catch(() => {}); } else { userPaused = true; film.pause(); } syncCtl(); });
  ['play', 'pause', 'volumechange', 'ended'].forEach(e => film.addEventListener(e, syncCtl));
  document.addEventListener('visibilitychange', () => { if (document.hidden) film.pause(); else if (!userPaused) film.play().catch(() => {}); });

  // ---- the lettering (never typed): David's off-white file, inlined
  fetch('assets/brand/lettering-offwhite.svg').then(r => r.text()).then(t => { const svg = t.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(width|height)="[^"]*"/, '').replace(/\s(width|height)="[^"]*"/, '');
    document.querySelectorAll('.navband .logo').forEach(l => { l.innerHTML = svg; }); }).catch(() => {});

  addEventListener('resize', () => { const d = devOf(); size(); place();
    if (d !== DEV) { const t = film.currentTime; DEV = d; film.src = filmSrc(); film.currentTime = t; film.play().catch(() => {}); dark.src = darkSrc(sec); } });

  // ---- start: the dark room, then the projector strikes (one flicker), the film running from its first frame
  size(); place();
  room.classList.toggle('baked', DEV === 'phone');
  dark.src = darkSrc(0);
  film.muted = true; film.src = filmSrc();
  const h = location.hash.slice(1), hk = S.findIndex(s => s.id === h);
  film.addEventListener('loadedmetadata', () => { if (hk > 0) film.currentTime = S[hk].from; }, { once: true });
  film.addEventListener('playing', () => { if (!film.dataset.struck) { film.dataset.struck = '1'; film.classList.add('flick'); setTimeout(() => film.classList.remove('flick'), 700); } });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) film.play().catch(() => {}); else { userPaused = true; }
  syncCtl(); requestAnimationFrame(frame);
})();
