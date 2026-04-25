/* ═══════════════════════════════════════════════════════════════
   PHAÖRA — 10 × 12 Patio Visualization  ·  scene.js
   All geometry is procedural (no external GLB loads).
   HDRI lazy-loaded for environment lighting; fallback sky while
   it streams in.
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { OrbitControls }  from 'three/addons/controls/OrbitControls.js';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass }      from 'three/addons/postprocessing/ShaderPass.js';
import { Sky }             from 'three/addons/objects/Sky.js';

/* ── Constants (all measurements in feet) ──────────────────── */

const PAVER_SIZE     = 1.98;   // 2 ft minus grout gap (~1/4″ visible joint)
const PAVER_HEIGHT   = 0.08;   // ~1″ thick
const PAVER_SPACING  = 2.0;    // center-to-center
const PATIO_COLS     = 5;      // 10 ft / 2 ft
const PATIO_ROWS     = 6;      // 12 ft / 2 ft
const PORCH_COLS     = 6;      // 12 ft / 2 ft
const PORCH_ROWS     = 3;      // 6 ft / 2 ft
const PORCH_ELEV     = 0.75;   // 9 in
const COL_W          = 10 / 12; // 10 in
const COL_H          = 8.0;

/* ── Colour palette ────────────────────────────────────────── */

const C_PAVER    = 0x8A8B8D;
const C_GROUT    = 0x6E6F71;
const C_STUCCO   = 0xD9D2C6;
const C_TERRA    = 0xCC6B3D;
const C_FOLIAGE  = 0x2D6B2D;
const C_EDGE     = 0x7E7E7E;
const C_SUN      = 0xFFE4B5;
const C_SKY_FILL = 0x87CEEB;
const C_GND_FILL = 0x8B7355;

/* ══════════════════════════════════════════════════════════════
   1.  Procedural texture helpers
   ══════════════════════════════════════════════════════════════ */

/* Integer-hash noise in [0,1] */
function hash (x, y) {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
}

/* Bilinear smooth noise */
function snoise (x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy),     b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/* Fractal Brownian motion */
function fbm (x, y, oct = 5) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += a * snoise(x * f, y * f); a *= 0.5; f *= 2.17; }
  return v;
}

/* ─── Grass diffuse texture (canvas) ─────────────────────── */

function makeGrassMap (sz = 2048) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = sz;
  const ctx = cv.getContext('2d');
  const id  = ctx.createImageData(sz, sz);
  const d   = id.data;
  for (let py = 0; py < sz; py++) {
    for (let px = 0; px < sz; px++) {
      const i  = (py * sz + px) * 4;
      const nx = px / sz;
      const ny = py / sz;

      /* large-scale colour shift  (yellow-green ↔ deep green) */
      const lo = fbm(nx * 5 + 7.1, ny * 5 + 2.3, 3);

      /* fine-scale brightness speckle */
      const hi = fbm(nx * 40 + 1.5, ny * 40 + 9.7, 2);

      const br = 0.78 + hi * 0.44;                       // 0.78 – 1.22
      d[i]     = Math.min(255, (32 + lo * 50) * br) | 0; // R  32-82
      d[i + 1] = Math.min(255, (70 + lo * 90) * br) | 0; // G  70-160
      d[i + 2] = Math.min(255, (18 + lo * 35) * br) | 0; // B  18-53
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ─── Paver normal map (canvas): surface noise + edge bevel ─ */

function makePaverNormal (sz = 512) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = sz;
  const ctx = cv.getContext('2d');
  const id  = ctx.createImageData(sz, sz);
  const d   = id.data;
  const bw  = sz * 0.035 | 0;                        // bevel zone ~3.5 %

  for (let py = 0; py < sz; py++) {
    for (let px = 0; px < sz; px++) {
      const i = (py * sz + px) * 4;

      /* surface micro-bump */
      const n = (snoise(px / sz * 48, py / sz * 48) - 0.5) * 7;

      /* edge chamfer */
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
const camera   = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 500);
camera.position.set(9, 5.5, -9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.toneMapping        = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.outputColorSpace    = THREE.SRGBColorSpace;
// physicallyCorrectLights is default-on in r155+; no setter needed.
document.getElementById('scene-container').appendChild(renderer.domElement);

/* ── OrbitControls ─────────────────────────────────────────── */

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping  = true;
controls.dampingFactor  = 0.07;
controls.target.set(0, 0.5, 4);
controls.minDistance     = 8;
controls.maxDistance     = 40;
controls.maxPolarAngle  = Math.PI / 2.1;

/* mobile: rotate + zoom only, softer damping */
if (matchMedia('(max-width: 768px)').matches) {
  controls.enablePan    = false;
  controls.dampingFactor = 0.05;
}

controls.update();

/* ══════════════════════════════════════════════════════════════
   3.  Lighting — procedural sky (zero external loads)
   ══════════════════════════════════════════════════════════════ */

/* ── Procedural sky → baked env-map texture ───────────────── */

const sky = new Sky();
sky.scale.setScalar(450000);

const skyU = sky.material.uniforms;
skyU.turbidity.value       = 6;          // clear Florida day
skyU.rayleigh.value        = 2;          // warm atmospheric scatter
skyU.mieCoefficient.value  = 0.005;
skyU.mieDirectionalG.value = 0.8;

/* Sun direction: elevation 25°, azimuth –45° (camera-left golden-hour rake) */
const sunPhi   = THREE.MathUtils.degToRad(90 - 25);
const sunTheta = THREE.MathUtils.degToRad(-45);
const sunDir   = new THREE.Vector3().setFromSphericalCoords(1, sunPhi, sunTheta);
skyU.sunPosition.value.copy(sunDir);

/* Bake sky into a cubemap texture inside an isolated throw-away scene.
   This avoids far-plane clipping (sky mesh never enters the real scene)
   and keeps geometry out of the env-map. */
{
  const _s = new THREE.Scene();
  _s.add(sky);
  const pmrem  = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(_s).texture;
  scene.background  = envTex;
  scene.environment = envTex;
  pmrem.dispose();
}
console.log('[PHAÖRA] Sky source: procedural Sky shader (turbidity 6, rayleigh 2, elev 25°, az –45°)');

/* Atmospheric perspective — distant grass fades toward horizon haze */
scene.fog = new THREE.Fog(0xC5DDE8, 35, 90);

/* Sun — directional light aligned with sky sun for consistent shadows */
const sun = new THREE.DirectionalLight(C_SUN, 1.5);
sun.position.copy(sunDir).multiplyScalar(25);
sun.castShadow              = true;
sun.shadow.mapSize.width    = 2048;
sun.shadow.mapSize.height   = 2048;
sun.shadow.camera.near      = 0.5;
sun.shadow.camera.far       = 60;
sun.shadow.camera.left      = -20;
sun.shadow.camera.right     =  20;
sun.shadow.camera.top       =  20;
sun.shadow.camera.bottom    = -20;
sun.shadow.bias              = -0.0004;
sun.shadow.normalBias        = 0.02;
scene.add(sun);

/* Hemisphere fill */
scene.add(new THREE.HemisphereLight(C_SKY_FILL, C_GND_FILL, 0.4));

/* ══════════════════════════════════════════════════════════════
   4.  Materials
   ══════════════════════════════════════════════════════════════ */

const paverNormal = makePaverNormal();

const matPaver = new THREE.MeshStandardMaterial({
  color: C_PAVER, roughness: 0.85, metalness: 0,
  normalMap: paverNormal,
  normalScale: new THREE.Vector2(0.35, 0.35),
});

const matGrout  = new THREE.MeshStandardMaterial({ color: C_GROUT,  roughness: 0.95 });
const matStucco = new THREE.MeshStandardMaterial({ color: C_STUCCO, roughness: 0.95, emissive: 0x000000 });
const matGrass  = new THREE.MeshStandardMaterial({ map: makeGrassMap(), roughness: 0.92 });
const matTerra  = new THREE.MeshStandardMaterial({ color: C_TERRA,   roughness: 0.75 });
const matLeaf   = new THREE.MeshStandardMaterial({ color: C_FOLIAGE, roughness: 0.8 });
const matEdge   = new THREE.MeshStandardMaterial({ color: C_EDGE,    roughness: 0.85 });

/* ══════════════════════════════════════════════════════════════
   5.  Scene construction
   ══════════════════════════════════════════════════════════════ */

/* helper: shadow-ready mesh */
function sm (geo, mat, { cast = true, recv = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow    = cast;
  m.receiveShadow = recv;
  return m;
}

/* ─── 5a. Patio grout base ────────────────────────────────── */

const patioBase = sm(new THREE.BoxGeometry(10, 0.02, 12), matGrout, { cast: false });
patioBase.position.set(0, -0.005, 0);
scene.add(patioBase);

/* ─── 5b. Patio pavers (InstancedMesh, 5 × 6 = 30) ──────── */

const paverGeo = new THREE.BoxGeometry(PAVER_SIZE, PAVER_HEIGHT, PAVER_SIZE);

function layPavers (cols, rows, x0, z0, baseY) {
  const count = cols * rows;
  const im = new THREE.InstancedMesh(paverGeo, matPaver, count);
  im.castShadow    = true;
  im.receiveShadow = true;
  const mtx = new THREE.Matrix4();
  const col = new THREE.Color();
  let idx = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      mtx.makeTranslation(x0 + c * PAVER_SPACING, baseY + PAVER_HEIGHT / 2, z0 + r * PAVER_SPACING);
      im.setMatrixAt(idx, mtx);
      /* ±3 % lightness jitter — breaks the single-tone flat read */
      const v = 1.0 + (hash(c * 17 + r * 31, r * 13 + c * 7) - 0.5) * 0.06;
      col.setRGB(v, v, v);
      im.setColorAt(idx, col);
      idx++;
    }
  im.instanceMatrix.needsUpdate = true;
  im.instanceColor.needsUpdate  = true;
  return im;
}

const patioPavers = layPavers(PATIO_COLS, PATIO_ROWS, -4, -5, 0);
console.log(`[PHAÖRA] Patio paver count: ${PATIO_COLS} cols × ${PATIO_ROWS} rows = ${PATIO_COLS * PATIO_ROWS} instances`);
scene.add(patioPavers);

/* ─── 5c. Porch slab ─────────────────────────────────────── */

const porchSlab = sm(new THREE.BoxGeometry(12, PORCH_ELEV, 6), matGrout);
porchSlab.position.set(0, PORCH_ELEV / 2, 9);    // z  6 → 12
scene.add(porchSlab);

/* ─── 5d. Porch pavers (6 × 3 = 18) ──────────────────────── */

scene.add(layPavers(PORCH_COLS, PORCH_ROWS, -5, 7, PORCH_ELEV));

/* ─── 5e. Columns ─────────────────────────────────────────── */

function addColumn (x, z) {
  const col = sm(new THREE.BoxGeometry(COL_W, COL_H, COL_W), matStucco);
  col.position.set(x, PORCH_ELEV + COL_H / 2, z);
  scene.add(col);
}

const colInset = COL_W / 2;
addColumn(-6 + colInset, 6 + colInset);
addColumn( 6 - colInset, 6 + colInset);

/* ─── 5f. Soffit / roof overhang ──────────────────────────── */

const soffitThk = 0.35;
const soffitY   = PORCH_ELEV + COL_H;                  // top of columns
const soffit = sm(new THREE.BoxGeometry(12.4, soffitThk, 6.8), matStucco);
soffit.position.set(0, soffitY + soffitThk / 2, 9);    // covers porch footprint
scene.add(soffit);

/* ─── 5g. Grass plane ─────────────────────────────────────── */

const grass = sm(new THREE.PlaneGeometry(80, 80), matGrass, { cast: false });
grass.rotation.x = -Math.PI / 2;
grass.position.y = -0.015;
scene.add(grass);

/* ─── 5i. Edge restraint (3 sides of patio) ───────────────── */

(function addEdge () {
  const ew = 0.25, eh = 0.15;
  const halfX = 5, halfZ = 6;

  const front = sm(new THREE.BoxGeometry(10 + ew * 2, eh, ew), matEdge);
  front.position.set(0, eh / 2, -halfZ - ew / 2);
  scene.add(front);

  [[-1, 'left'], [1, 'right']].forEach(([sign]) => {
    const side = sm(new THREE.BoxGeometry(ew, eh, 12), matEdge);
    side.position.set(sign * (halfX + ew / 2), eh / 2, 0);
    scene.add(side);
  });
})();

/* ─── 5j. Terracotta planters + foliage ───────────────────── */

function addPlanter (x, z) {
  // pot — tapered cylinder
  const pot = sm(new THREE.CylinderGeometry(0.55, 0.45, 2, 20), matTerra);
  pot.position.set(x, 1, z);
  scene.add(pot);

  // soil disc
  const soil = sm(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 20), matGrout, { cast: false });
  soil.position.set(x, 2.01, z);
  scene.add(soil);

  // foliage — two offset icospheres for volume
  const addBall = (ox, oy, oz, r) => {
    const ball = sm(new THREE.IcosahedronGeometry(r, 1), matLeaf);
    ball.position.set(x + ox, oy, z + oz);
    scene.add(ball);
  };
  addBall(0, 2.65, 0, 0.65);
  addBall(0.18, 2.9, -0.12, 0.45);
}

addPlanter(-5.5, 5.3);
addPlanter( 5.5, 5.3);

/* ─── 5k. Furniture (lifestyle dressing) ─────────────────── */

const matFrame = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.6, metalness: 0.3 });
const matCush  = new THREE.MeshStandardMaterial({ color: 0xE8E2D5, roughness: 0.9 });

(function addFurniture () {

  /* ── A. Lounge chair — center-right of patio, 3 ft from porch step ── */
  const chair = new THREE.Group();

  /* seat cushion  (2.5 W × 0.4 H × 2 D) */
  const seat = sm(new THREE.BoxGeometry(2.5, 0.4, 2), matCush);
  seat.position.y = 1.2;
  chair.add(seat);

  /* thin frame plate under cushion */
  const seatPlate = sm(new THREE.BoxGeometry(2.5, 0.06, 2), matFrame);
  seatPlate.position.y = 0.97;
  chair.add(seatPlate);

  /* backrest cushion  (2.5 W × 2.2 H × 0.3 D, tilted 15° back) */
  const back = sm(new THREE.BoxGeometry(2.5, 2.2, 0.3), matCush);
  back.position.set(0, 2.35, 1.12);
  back.rotation.x = Math.PI / 12;            // 15 °
  chair.add(back);

  /* armrests  (0.3 W × 0.4 H × 2 D at 1.6 ft) */
  [-1.1, 1.1].forEach(ax => {
    const arm = sm(new THREE.BoxGeometry(0.3, 0.4, 2), matFrame);
    arm.position.set(ax, 1.6, 0);
    chair.add(arm);
  });

  /* four legs  (r 0.1, h 1.0) */
  const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 8);
  [[-1.0, -0.8], [-1.0, 0.8], [1.0, -0.8], [1.0, 0.8]].forEach(([lx, lz]) => {
    const leg = sm(legGeo, matFrame);
    leg.position.set(lx, 0.5, lz);
    chair.add(leg);
  });

  chair.position.set(2, 0, 0.5);
  chair.rotation.y = THREE.MathUtils.degToRad(-20);   // faces diag outward
  scene.add(chair);

  /* ── B. Side table — 1.5 ft to the left of chair ── */
  const table = new THREE.Group();

  /* tabletop  (r 0.6, h 0.08) */
  const tabletop = sm(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 20), matFrame);
  tabletop.position.y = 1.6;
  table.add(tabletop);

  /* stem */
  const stem = sm(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 10), matFrame);
  stem.position.y = 0.8;
  table.add(stem);

  /* weighted base */
  const tBase = sm(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16), matFrame);
  tBase.position.y = 0.02;
  table.add(tBase);

  table.position.set(0.4, 0, 0.7);
  scene.add(table);

  /* ── C. Ceramic mug / candle on table ── */
  const mug = sm(
    new THREE.CylinderGeometry(0.08, 0.07, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0xC26E4A, roughness: 0.7 })
  );
  mug.position.set(0.5, 1.74, 0.55);
  scene.add(mug);

})();

/* ══════════════════════════════════════════════════════════════
   6.  Post-processing
   ══════════════════════════════════════════════════════════════ */

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

/* Bloom — subtle glow on bright areas */
const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  0.05,   // strength  (was 0.15 — stucco was glowing)
  0.5,    // radius
  1.0     // threshold (was 0.9 — raised to avoid hitting bright surfaces)
);
composer.addPass(bloom);

/* Vignette — custom shader pass */
const VignetteShader = {
  uniforms: {
    tDiffuse:  { value: null },
    offset:    { value: 1.0 },
    darkness:  { value: 1.1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main () { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main () {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * vec2(offset);
      texel.rgb *= mix(1.0, 1.0 - dot(uv, uv), darkness);
      gl_FragColor = texel;
    }
  `,
};
composer.addPass(new ShaderPass(VignetteShader));

/* ══════════════════════════════════════════════════════════════
   7.  Camera presets + smooth flight
   ══════════════════════════════════════════════════════════════ */

const PRESETS = {
  hero:     { pos: [9, 5.5, -9],    tgt: [0, 0.5, 4]  },
  topdown:  { pos: [0, 28, 3],      tgt: [0, 0, 3]     },
  eyelevel: { pos: [0, 5.5, -14],   tgt: [0, 1.5, 8]   },
};

function flyTo (preset, dur = 1200) {
  const sp = camera.position.clone();
  const st = controls.target.clone();
  const ep = new THREE.Vector3(...preset.pos);
  const et = new THREE.Vector3(...preset.tgt);
  const t0 = performance.now();
  controls.enabled = false;

  (function tick () {
    const t = Math.min((performance.now() - t0) / dur, 1);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // ease-in-out cubic
    camera.position.lerpVectors(sp, ep, e);
    controls.target.lerpVectors(st, et, e);
    controls.update();
    if (t < 1) requestAnimationFrame(tick);
    else controls.enabled = true;
  })();
}

window.setCameraPreset = name => { if (PRESETS[name]) flyTo(PRESETS[name]); };

/* ══════════════════════════════════════════════════════════════
   8.  Resize, animate, loading gate
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

/* Dismiss loading overlay (600 ms CSS transition) */
requestAnimationFrame(() => {
  const el = document.getElementById('loading');
  if (el) el.classList.add('done');
  setTimeout(() => el && el.remove(), 800);
});
