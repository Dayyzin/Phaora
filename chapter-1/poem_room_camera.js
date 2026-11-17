// The projector poem: the room's camera as room.js sets it for a window (assets/room.js exposes it as __roomCam), so
// build_poem.py can bake each scene's projection onto the room's own back wall and cove.
// Usage (server on 8765, in chapter-1): node poem_room_camera.js > poem/camera.json
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const out = {};
  for (const [dev, vp] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }]]) {
    const p = await b.newPage(vp);
    await p.goto('http://localhost:8765/room.html?empty=1&intro=0');
    await p.waitForFunction(() => window.ready === true && window.__roomCam, null, { timeout: 300000 });
    await p.waitForTimeout(3000);
    out[dev] = await p.evaluate(() => { const c = window.__roomCam; c.updateMatrixWorld(); c.updateProjectionMatrix();
      const st = document.getElementById('stage'), r = st.getBoundingClientRect(), cv = st.querySelector('canvas').getBoundingClientRect();
      return { win: [innerWidth, innerHeight], canvas: [cv.left, cv.top, cv.width, cv.height],
        proj: c.projectionMatrix.elements, world: c.matrixWorld.elements, pos: c.position.toArray(), fov: c.fov, aspect: c.aspect, view: c.view }; });
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
