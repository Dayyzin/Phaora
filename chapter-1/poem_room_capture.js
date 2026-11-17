// The projector poem's room (SCENES.md): the room as room.js draws it (?empty=1, the live camera, so it matches
// assets/room/stage-*.webp to the pixel), with each chapter's pin figure, and the pins' own morph from one chapter's
// figure to the next. Nothing is drawn here but by room.js.
// Usage: python3 -m http.server 8765 (in chapter-1), then
//   node poem_room_capture.js <desktop|phone> <outdir> [fps]
// Writes <outdir>/<device>/still-<chapter>.png and <outdir>/<device>/<from>-<to>/f0000.png ... (the morph frames).
const { chromium } = require('playwright');
const fs = require('fs');
const [device, out, fpsArg] = process.argv.slice(2);
const FPS = +(fpsArg || 12);
// chapter -> its pin figure (build_poem.py PINS), added to room.js's list as poem_<ch>
const CH = ['prologue', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'coda'].map(c => [c, 'poem_' + c]);   // assets/poem/h_<ch>_*.png (build_poem.py --pins)
const RUN_END = 4.1;   // room.js: TM1 + 0.35 (the morph's window and the walls settling)
(async () => {
  const vp = device === 'phone' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 } : { viewport: { width: 1440, height: 900 } };
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(vp);
  // each chapter's pin figure joins the list (room.js reads PIECES once, at load)
  await p.addInitScript(() => {
    let v; Object.defineProperty(window, 'PIECES', { configurable: true, get: () => v, set: (x) => {
      const m = x.find(q => q.id === 'card_holder');
      v = x.concat(['prologue', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'coda'].map(c =>
        ({ ...m, id: 'poem_' + c, pinsL: `assets/poem/h_${c}_L.png`, pinsR: `assets/poem/h_${c}_R.png` }))); } });
  });
  p.on('pageerror', e => console.error('pageerror', e.message));
  await p.goto('http://localhost:8765/room.html?empty=1&intro=0');
  await p.waitForFunction(() => window.ready === true, null, { timeout: 300000 });
  await p.addStyleTag({ content: '#logo,#sitenav,#ui,#cat,#intro{display:none!important}' });
  await p.waitForTimeout(12000);   // the live camera and the shadows settle, as the stage stills were taken
  const ids = await p.evaluate(() => window.PIECES.map(q => q.id));
  const ix = id => { const i = ids.indexOf(id); if (i < 0) throw new Error('no piece ' + id); return i; };
  await p.evaluate(() => { window.CAPTURE = true; window.CAPTURE_T = 0; });
  const dir = `${out}/${device}`; fs.mkdirSync(dir, { recursive: true });
  const shot = async (path, a, bb, t) => { await p.evaluate(([a, bb, t]) => window.renderRun([a, bb], 1, 1, t), [a, bb, t]); await p.screenshot({ path }); };
  for (const [c, id] of CH) { const f = `${dir}/still-${c}.png`; if (!fs.existsSync(f)) await shot(f, ix(id), ix(id), 0); console.log('still', c); }
  // POEM_PAIRS=ii-iv,vi-viii captures only those morphs (the film's order skips the chapters it has no voice for)
  const PAIRS = (process.env.POEM_PAIRS || '').split(',').filter(Boolean).map(x => x.split('-'));
  const plan = PAIRS.length ? PAIRS.map(([a, b]) => [CH.find(c => c[0] === a), CH.find(c => c[0] === b)]) : CH.slice(0, -1).map((c, k) => [c, CH[k + 1]]);
  for (const [[ca, a], [cb, bb]] of plan) {
    const d = `${dir}/${ca}-${cb}`; fs.mkdirSync(d, { recursive: true });
    const n = Math.round(RUN_END * FPS);
    for (let i = 0; i <= n; i++) { const f = `${d}/f${String(i).padStart(4, '0')}.png`; if (!fs.existsSync(f)) await shot(f, ix(a), ix(bb), i / FPS); }
    console.log('morph', ca, cb);
  }
  await b.close();
})();
