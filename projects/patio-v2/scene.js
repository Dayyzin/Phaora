/* ═══════════════════════════════════════════════════════════════
   PHAÖRA — Patio v2 · Clean rebuild
   All geometry procedural. Sky procedural. Zero network loads.
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { OrbitControls }  from 'three/addons/controls/OrbitControls.js';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass }      from 'three/addons/postprocessing/ShaderPass.js';
import { Sky }             from 'three/addons/objects/Sky.js';

/* ══════════════════════════════════════════════════════════════
   0.  Single source of truth — ALL dimensions
   ══════════════════════════════════════════════════════════════ */

const PATIO_WIDTH   = 10;     // ft — parallel to porch facade
const PATIO_DEPTH   = 16;     // ft — rendered depth (stretched for visual clarity; quoted as 12)
const PORCH_WIDTH   = 12;     // ft — 1 ft overhang each side
const PORCH_DEPTH   = 6;      // ft
const PORCH_HEIGHT  = 0.75;   // ft — 9-inch step
const COLUMN_HEIGHT = 8;      // ft
const COLUMN_SIZE   = 0.83;   // ft — 10 inches
const SOFFIT_THICK  = 0.5;    // ft
const PAVER_SIZE    = 1.92;   // ft — visible 1-inch grout gap as ruler cue
const PAVER_HEIGHT  = 0.15;   // ft — ~1.8 in thick
const PAVER_SPACING = 2.0;    // ft — center-to-center

/* Derived (computed once, used everywhere) */
const PATIO_COLS     = Math.round(PATIO_WIDTH / PAVER_SPACING);   // 5
const PATIO_ROWS     = Math.round(PATIO_DEPTH / PAVER_SPACING);   // 6
const PORCH_COLS     = Math.round(PORCH_WIDTH / PAVER_SPACING);   // 6
const PORCH_ROWS     = Math.round(PORCH_DEPTH / PAVER_SPACING);   // 3

/* Layout anchors (patio centered at origin on XZ) */
const PATIO_HALF_W   = PATIO_WIDTH / 2;       // 5
const PATIO_HALF_D   = PATIO_DEPTH / 2;       // 6
const PORCH_Z_FRONT  = PATIO_HALF_D;          // 6  — where patio meets porch
const PORCH_Z_CENTER = PORCH_Z_FRONT + PORCH_DEPTH / 2;  // 9

/* Paver grid origins (first paver center) */
const PATIO_X0 = -(PATIO_COLS - 1) * PAVER_SPACING / 2;  // -4
const PATIO_Z0 = -(PATIO_ROWS - 1) * PAVER_SPACING / 2;  // -5
const PORCH_X0 = -(PORCH_COLS - 1) * PAVER_SPACING / 2;  // -5
const PORCH_Z0 = PORCH_Z_FRONT + PAVER_SPACING / 2;      //  7

/* ── Colours ──────────────────────────────────────────────── */

const C_PAVER    = 0x8A8B8D;
const C_GROUT    = 0x6E6F71;   // darker than paver — visible grid lines
const C_STUCCO   = 0xD9D2C6;
const C_TERRA    = 0xC26E4A;
const C_FOLIAGE  = 0x2D5F3F;
const C_EDGE     = 0x5A5B5D;
const C_SUN      = 0xFFE4B5;
const C_SKY      = 0x87CEEB;
const C_GND      = 0x8B7355;

/* ══════════════════════════════════════════════════════════════
   1.  Procedural textures
   ══════════════════════════════════════════════════════════════ */

function hashNoise (x, y) {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
}

function smoothNoise (x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hashNoise(ix, iy),     b = hashNoise(ix + 1, iy);
  const c = hashNoise(ix, iy + 1), d = hashNoise(ix + 1, iy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/* Grass — single octave smooth noise, NOT FBM */
function makeGrassMap (sz = 1024) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = sz;
  const ctx = cv.getContext('2d');
  const id  = ctx.createImageData(sz, sz);
  const d   = id.data;
  for (let py = 0; py < sz; py++) {
    for (let px = 0; px < sz; px++) {
      const i  = (py * sz + px) * 4;
      const n  = smoothNoise(px / sz * 16 + 3.7, py / sz * 16 + 1.3);
      d[i]     = (74 + n * 16) | 0;    // R: #4a–#5a  (0x4a=74, 0x5a=90)
      d[i + 1] = (107 + n * 17) | 0;   // G: #6b–#7c
      d[i + 2] = (50 + n * 12) | 0;    // B: #32–#3e
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Paver normal map — surface micro-bump + edge bevel */
function makePaverNormal (sz = 512) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = sz;
  const ctx = cv.getContext('2d');
  const id  = ctx.createImageData(sz, sz);
  const d   = id.data;
  const bw  = (sz * 0.035) | 0;
  for (let py = 0; py < sz; py++) {
    for (let px = 0; px < sz; px++) {
      const i = (py * sz + px) * 4;
      const n = (smoothNoise(px / sz * 48, py / sz * 48) - 0.5) * 7;
      let bx = 0, by = 0;
      const dl = px, dr = sz - 1 - px, dt = py, db = sz - 1 - py;
      if (dl < bw) bx = -(bw - dl) / bw * 28;
      if (dr < bw) bx =  (bw - dr) / bw * 28;
      if (dt < bw) by = -(bw - dt) / bw * 28;
      if (db < bw) by =  (bw - db) / bw * 28;
      d[i]     = Math.max(0, Math.min(255, 128 + n + bx));
      d[i + 1] = Math.max(0, Math.min(255, 128 + n + by));
      d[i + 2] = 255;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return new THREE.CanvasTexture(cv);
}

/* ══════════════════════════════════════════════════════════════
   2.  Renderer, Scene, Camera
   ══════════════════════════════════════════════════════════════ */

const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 500);

/* Default opening view: TOP-DOWN (money shot for rectangular shape) */
camera.position.set(0, 42, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.toneMapping        = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.outputColorSpace    = THREE.SRGBColorSpace;
document.getElementById('scene-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping  = true;
controls.dampingFactor  = 0.05;
controls.enablePan      = false;
controls.target.set(0, 0, 0);
controls.minDistance     = 8;
controls.maxDistance     = 70;
controls.maxPolarAngle  = Math.PI / 2.1;
controls.update();

/* ══════════════════════════════════════════════════════════════
   3.  Sky (procedural — zero network loads)
   ══════════════════════════════════════════════════════════════ */

const sky = new Sky();
sky.scale.setScalar(450000);
const skyU = sky.material.uniforms;
skyU.turbidity.value       = 6;
skyU.rayleigh.value        = 2;
skyU.mieCoefficient.value  = 0.005;
skyU.mieDirectionalG.value = 0.8;

const SUN_ELEV = 60;
const SUN_AZ   = -45;
const sunPhi   = THREE.MathUtils.degToRad(90 - SUN_ELEV);
const sunTheta = THREE.MathUtils.degToRad(SUN_AZ);
const sunDir   = new THREE.Vector3().setFromSphericalCoords(1, sunPhi, sunTheta);
skyU.sunPosition.value.copy(sunDir);

{
  const _s = new THREE.Scene();
  _s.add(sky);
  const pmrem  = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(_s).texture;
  scene.background  = envTex;
  scene.environment = envTex;
  pmrem.dispose();
}
console.log('[PHAÖRA] Sky: procedural THREE.Sky with PMREM env');

/* ══════════════════════════════════════════════════════════════
   4.  Lighting
   ══════════════════════════════════════════════════════════════ */

scene.fog = new THREE.Fog(0xC5DDE8, 35, 90);

const sun = new THREE.DirectionalLight(C_SUN, 1.0);
sun.position.copy(sunDir).multiplyScalar(50);
sun.castShadow            = true;
sun.shadow.mapSize.width  = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.near    = 0.5;
sun.shadow.camera.far     = 100;
sun.shadow.camera.left    = -20;
sun.shadow.camera.right   =  20;
sun.shadow.camera.top     =  20;
sun.shadow.camera.bottom  = -20;
sun.shadow.bias            = -0.0005;
sun.shadow.normalBias      = 0.02;
sun.shadow.radius          = 8;           // soft penumbra
sun.shadow.blurSamples     = 25;          // smooth shadow edge
scene.add(sun);

scene.add(new THREE.HemisphereLight(C_SKY, C_GND, 0.7));
console.log(`[PHAÖRA] Sun elevation: ${SUN_ELEV}°, shadow softness: radius 8, blur 25`);

/* ══════════════════════════════════════════════════════════════
   5.  Materials
   ══════════════════════════════════════════════════════════════ */

const paverNorm = makePaverNormal();
const matPaver  = new THREE.MeshStandardMaterial({
  color: C_PAVER, roughness: 0.85, metalness: 0, emissive: 0x000000,
  normalMap: paverNorm, normalScale: new THREE.Vector2(0.35, 0.35),
});
const matGrout  = new THREE.MeshStandardMaterial({ color: C_GROUT,  roughness: 0.95 });
const matStucco = new THREE.MeshStandardMaterial({ color: C_STUCCO, roughness: 0.95, metalness: 0, emissive: 0x000000 });
const matGrass  = new THREE.MeshStandardMaterial({ map: makeGrassMap(), roughness: 0.92 });
const matTerra  = new THREE.MeshStandardMaterial({ color: C_TERRA,  roughness: 0.7 });
const matLeaf   = new THREE.MeshStandardMaterial({ color: C_FOLIAGE, roughness: 0.9 });
const matEdge   = new THREE.MeshStandardMaterial({ color: C_EDGE,   roughness: 0.95 });
const matFrame  = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.6, metalness: 0.3 });
const matCush   = new THREE.MeshStandardMaterial({ color: 0xE8E2D5, roughness: 0.9 });

/* ══════════════════════════════════════════════════════════════
   6.  Scene construction
   ══════════════════════════════════════════════════════════════ */

function sm (geo, mat, { cast = true, recv = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast; m.receiveShadow = recv;
  return m;
}

/* ─── 6a. Patio grout base ───────────────────────────────── */

const patioBase = sm(
  new THREE.BoxGeometry(PATIO_WIDTH, 0.02, PATIO_DEPTH), matGrout, { cast: false }
);
patioBase.position.set(0, -0.02, 0);   // top at y = –0.01, BELOW paver bottoms at y = 0
scene.add(patioBase);

/* ─── 6b. Patio pavers — single InstancedMesh ───────────── */

const paverGeo = new THREE.BoxGeometry(PAVER_SIZE, PAVER_HEIGHT, PAVER_SIZE);

function layPavers (cols, rows, x0, z0, baseY) {
  const count = cols * rows;
  const im    = new THREE.InstancedMesh(paverGeo, matPaver, count);
  im.castShadow = true; im.receiveShadow = true;
  const mtx = new THREE.Matrix4();
  const clr = new THREE.Color();
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = x0 + c * PAVER_SPACING;
      const pz = z0 + r * PAVER_SPACING;
      mtx.makeTranslation(px, baseY + PAVER_HEIGHT / 2, pz);
      im.setMatrixAt(idx, mtx);
      const v = 1.0 + (hashNoise(c * 17 + r * 31, r * 13 + c * 7) - 0.5) * 0.06;
      clr.setRGB(v, v, v);
      im.setColorAt(idx, clr);
      idx++;
    }
  }
  im.instanceMatrix.needsUpdate = true;
  im.instanceColor.needsUpdate  = true;
  return im;
}

const patioPavers = layPavers(PATIO_COLS, PATIO_ROWS, PATIO_X0, PATIO_Z0, 0);
scene.add(patioPavers);

/* diagnostic */
{
  const zArr = Array.from({ length: PATIO_ROWS }, (_, r) => PATIO_Z0 + r * PAVER_SPACING);
  console.log(`[PHAÖRA] Patio: ${PATIO_WIDTH}ft × ${PATIO_DEPTH}ft`);
  console.log(`[PHAÖRA] Patio paver count: ${PATIO_COLS} × ${PATIO_ROWS} = ${patioPavers.count} instances`);
  console.log('[PHAÖRA] Paver Z-positions:', zArr.join(', '));
  console.log(`[PHAÖRA] Grout base top: y=${(-0.02 + 0.01).toFixed(3)}, paver bottom: y=0 → clearance ${(0 - (-0.02 + 0.01)).toFixed(3)}ft`);
  console.log(`[PHAÖRA] Grout visibility: invisible (paver size ${PAVER_SIZE.toFixed(2)}, grout color matches paver)`);
}

/* ─── 6c. Porch slab ────────────────────────────────────── */

const porchSlab = sm(
  new THREE.BoxGeometry(PORCH_WIDTH, PORCH_HEIGHT, PORCH_DEPTH), matGrout
);
porchSlab.castShadow = false;              // don't cast shadow line on patio
porchSlab.position.set(0, PORCH_HEIGHT / 2, PORCH_Z_CENTER);
scene.add(porchSlab);

/* ─── 6d. Porch pavers ──────────────────────────────────── */

const porchPavers = layPavers(PORCH_COLS, PORCH_ROWS, PORCH_X0, PORCH_Z0, PORCH_HEIGHT);
porchPavers.castShadow = false;
scene.add(porchPavers);
console.log(`[PHAÖRA] Porch paver count: ${PORCH_COLS} × ${PORCH_ROWS} = ${porchPavers.count} instances`);

/* ─── 6e. Columns ────────────────────────────────────────── */

const colHalfW = COLUMN_SIZE / 2;
const porchHalfW = PORCH_WIDTH / 2;

function addColumn (x, z) {
  const col = sm(new THREE.BoxGeometry(COLUMN_SIZE, COLUMN_HEIGHT, COLUMN_SIZE), matStucco);
  col.castShadow = false;
  col.position.set(x, PORCH_HEIGHT + COLUMN_HEIGHT / 2, z);
  scene.add(col);
}
addColumn(-porchHalfW + colHalfW, PORCH_Z_FRONT + colHalfW);
addColumn( porchHalfW - colHalfW, PORCH_Z_FRONT + colHalfW);

/* ─── 6f. Soffit ─────────────────────────────────────────── */

const soffitY = PORCH_HEIGHT + COLUMN_HEIGHT;
const soffit = sm(
  new THREE.BoxGeometry(PORCH_WIDTH + 0.4, SOFFIT_THICK, PORCH_DEPTH), matStucco
);
soffit.castShadow = false;
soffit.position.set(0, soffitY + SOFFIT_THICK / 2, PORCH_Z_CENTER);
scene.add(soffit);
console.log('[PHAÖRA] Porch elements no longer cast shadows on patio');

/* ─── 6g. Grass ──────────────────────────────────────────── */

const grass = sm(new THREE.PlaneGeometry(80, 80), matGrass, { cast: false });
grass.rotation.x = -Math.PI / 2;
grass.position.y = -0.04;    // well below grout base — no Z-fight
scene.add(grass);

/* ─── 6h. Edge restraint (3 sides of patio) ──────────────── */

{
  const ew = 0.25, eh = 0.15;
  const front = sm(new THREE.BoxGeometry(PATIO_WIDTH + ew * 2, eh, ew), matEdge);
  front.position.set(0, eh / 2, -PATIO_HALF_D - ew / 2);
  scene.add(front);

  [-1, 1].forEach(sign => {
    const side = sm(new THREE.BoxGeometry(ew, eh, PATIO_DEPTH), matEdge);
    side.position.set(sign * (PATIO_HALF_W + ew / 2), eh / 2, 0);
    scene.add(side);
  });
}

/* ─── 6i. Planters + shrubs ──────────────────────────────── */

function addPlanter (x, z) {
  const pot = sm(new THREE.CylinderGeometry(0.55, 0.45, 2, 20), matTerra);
  pot.position.set(x, 1, z);
  scene.add(pot);
  const soil = sm(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 20), matGrout, { cast: false });
  soil.position.set(x, 2.01, z);
  scene.add(soil);
  const shrub = sm(new THREE.IcosahedronGeometry(0.65, 1), matLeaf);
  shrub.position.set(x, 2.65, z);
  scene.add(shrub);
  const top = sm(new THREE.IcosahedronGeometry(0.45, 1), matLeaf);
  top.position.set(x + 0.18, 2.9, z - 0.12);
  scene.add(top);
}
addPlanter(-porchHalfW + 0.5, PORCH_Z_FRONT - 0.7);
addPlanter( porchHalfW - 0.5, PORCH_Z_FRONT - 0.7);

/* ─── 6j. Furniture ──────────────────────────────────────── */

{
  const chair = new THREE.Group();

  const seat = sm(new THREE.BoxGeometry(2.5, 0.4, 2), matCush);
  seat.position.y = 1.2;
  chair.add(seat);

  const seatPlate = sm(new THREE.BoxGeometry(2.5, 0.06, 2), matFrame);
  seatPlate.position.y = 0.97;
  chair.add(seatPlate);

  const back = sm(new THREE.BoxGeometry(2.5, 2.2, 0.3), matCush);
  back.position.set(0, 2.35, 1.12);
  back.rotation.x = Math.PI / 12;
  chair.add(back);

  [-1.1, 1.1].forEach(ax => {
    const arm = sm(new THREE.BoxGeometry(0.3, 0.4, 2), matFrame);
    arm.position.set(ax, 1.6, 0);
    chair.add(arm);
  });

  const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 8);
  [[-1, -0.8], [-1, 0.8], [1, -0.8], [1, 0.8]].forEach(([lx, lz]) => {
    const leg = sm(legGeo, matFrame);
    leg.position.set(lx, 0.5, lz);
    chair.add(leg);
  });

  chair.position.set(2, 0, PORCH_Z_FRONT - 3);
  chair.rotation.y = THREE.MathUtils.degToRad(-20);
  scene.add(chair);

  /* side table */
  const table = new THREE.Group();
  const tabletop = sm(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 20), matFrame);
  tabletop.position.y = 1.6;
  table.add(tabletop);
  const stem = sm(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 10), matFrame);
  stem.position.y = 0.8;
  table.add(stem);
  const tBase = sm(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16), matFrame);
  tBase.position.y = 0.02;
  table.add(tBase);
  table.position.set(0.4, 0, PORCH_Z_FRONT - 3.2);
  scene.add(table);

  /* mug */
  const mug = sm(
    new THREE.CylinderGeometry(0.08, 0.07, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: C_TERRA, roughness: 0.7 })
  );
  mug.position.set(0.5, 1.74, PORCH_Z_FRONT - 3.35);
  scene.add(mug);
}

/* ══════════════════════════════════════════════════════════════
   7.  Post-processing
   ══════════════════════════════════════════════════════════════ */

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight), 0.04, 0.4, 1.0
));

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null }, offset: { value: 1.0 }, darkness: { value: 1.1 },
  },
  vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float offset; uniform float darkness; varying vec2 vUv;
    void main(){vec4 t=texture2D(tDiffuse,vUv);vec2 u=(vUv-0.5)*vec2(offset);t.rgb*=mix(1.0,1.0-dot(u,u),darkness);gl_FragColor=t;}
  `,
};
composer.addPass(new ShaderPass(VignetteShader));

/* ══════════════════════════════════════════════════════════════
   8.  Camera presets
   ══════════════════════════════════════════════════════════════ */

const PRESETS = {
  topdown:  { pos: [0, 42, 0],      tgt: [0, 0, 0]   },
  hero:     { pos: [14, 4, -5],     tgt: [0, 0.5, 4]  },
  eyelevel: { pos: [0, 5.5, -20],   tgt: [0, 1.5, 8]  },
};

function flyTo (name, dur = 1200) {
  const p = PRESETS[name]; if (!p) return;
  if (name === 'topdown') console.log('[PHAÖRA] Top-down camera: pos (0, 42, 0), target (0, 0, 0)');
  const sp = camera.position.clone(), st = controls.target.clone();
  const ep = new THREE.Vector3(...p.pos), et = new THREE.Vector3(...p.tgt);
  const t0 = performance.now();
  controls.enabled = false;

  /* highlight active button */
  document.querySelectorAll('.cam-btns button').forEach(b => b.classList.remove('active'));
  const btn = [...document.querySelectorAll('.cam-btns button')].find(b =>
    b.textContent.toLowerCase().replace(/[^a-z]/g, '').includes(name.replace('-', ''))
  );
  if (btn) btn.classList.add('active');

  (function tick () {
    const t = Math.min((performance.now() - t0) / dur, 1);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    camera.position.lerpVectors(sp, ep, e);
    controls.target.lerpVectors(st, et, e);
    controls.update();
    if (t < 1) requestAnimationFrame(tick);
    else controls.enabled = true;
  })();
}

window.setCameraPreset = flyTo;
console.log('[PHAÖRA] Default camera preset: TOP-DOWN');

/* ══════════════════════════════════════════════════════════════
   9.  Resize, animate, loading gate
   ══════════════════════════════════════════════════════════════ */

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

(function animate () {
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
})();

requestAnimationFrame(() => {
  const el = document.getElementById('loading');
  if (el) el.classList.add('done');
  setTimeout(() => el && el.remove(), 800);
});
