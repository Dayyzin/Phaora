// Chapter I site (David, 14 Nov: the pin room is the catalogue's front door): chapter2's room.js, its scene, light, mirrored
// pin walls, pin waves and dissolve unchanged. Only these, each marked "Chapter I site:" where it is:
//   - CASTER_FIT takes the fits of the casters build_room.py makes (window.CASTER_FIT_EXTRA), for the rest of the line;
//   - the links under the specs are the piece's own (PIECES[i].links), not chapter2's cart and pre-sale;
//   - the intro writes the page's own line (window.INTRO_LINES_SITE), one line centred where the three were;
//   - on a computer the name and its line sit window.NAME_CLEAR frame px higher, clear of the piece.
// The room: the browsing page of Chapter I, one piece per scroll.
// Ported from ../studio-mock/concepts/room-preview/index.html (David's approved preview). The scene, the light, the
// mirrored pin walls, the pin waves and the dissolve are that file's code, unchanged; what is new here is only:
//   - the pieces come from a list (PIECES), so the dissolve and the pins run between any two of them;
//   - scroll drives it: one step per scroll gesture; down = nearest pins first, up = farthest first;
//   - the fast-scroll rule: a step taken while the pins are still in the wall chains on; the pins stay in and come out
//     only as the piece you land on;
//   - the frame is drawn at the window's size (desktop: the preview's 16:9 frame, scaled to cover the window).
// At 1280x720, renderAt(t) draws the preview's own frame at the same t (one scroll down, the Muse to the PÖ).
import * as THREE from './three.module.js';

const PIECES = window.PIECES;
// The test walk-through (David: "Work that in the new test renders until perfection"): ?test=1 turns on all of it; each
// part has its own flag too. Without them the room is exactly the approved one.
const QS = new URLSearchParams(location.search), TEST = QS.has('test');
const WHITE = TEST || QS.get('white') === '1';   // the side walls' lit ground white, every cast shadow kept (9e5ee24)
// the switch (David: "Use it", on the preview's soft fade C, 345a105): wherever both neighbours have full turntable
// sets the piece spins and fades into the next while it turns (C: an eased crossfade over 60-220 degrees, both frames in
// one opaque pass through matched outlines, the shadow crossfading with it); everywhere else the same soft fade with no
// turn. A pair takes the spin by itself as its sets land. ?dissolve=1 keeps the approved grain dissolve (and no spin).
const SPIN = QS.get('dissolve') !== '1';
const SOFT = QS.get('dissolve') !== '1';
const BARE = QS.get('empty') === '1';   // the room alone, no piece, its shadow or its carved lines (the catalogue's stage)
// the switch while it turns (David: "Back to soft fade", C at 345a105): the piece fades into the next over 60-220 degrees.
// C exactly as approved: one smooth eased crossfade, both frames mixed in one opaque pass (its midpoint is the two
// garments' colours mixed; David: "Back to soft fade", C over B)
const SEAM_D0 = 60, SEAM_D1 = 220;
const seamP = (deg) => { const u = Math.min(1, Math.max(0, (deg - SEAM_D0) / (SEAM_D1 - SEAM_D0))); return u * u * (3 - 2 * u); };
const INTRO = !!window.INTRO_ON;                 // the intro before the room (?intro=1), once per browser
const FW = 1280, FH = 720, H0 = 720;   // the preview's frame: every screen measure in the scene is in these units
const COLS = 84, ROWS = 100;
const stage = document.getElementById('stage'), uiEl = document.getElementById('ui');
const nmEl = document.getElementById('nm'), subEl = document.getElementById('sub');
// ?catalogue=1 (a concept): the catalogue after the last hero (see step())
const CAT = window.CATALOGUE_ON ? document.getElementById('cat') : null, catEl = CAT; let cat = false;
// the lettering (the piece pages' own SVG file, inlined, in the room's dark ink)
const LOGO = document.getElementById('logo');
const LOGO_CALM = [136, 16];   // the logo's top-left on big screens, in frame units (layout())
LOGO.innerHTML = (await (await fetch('assets/lettering-solo-offwhite.svg')).text()).replace(/<!--[\s\S]*?-->/g, '').replace(/fill="#E2DDD2"/g, 'fill="currentColor"').replace(/\s(width|height)="[^"]*"/, '').replace(/\s(width|height)="[^"]*"/, '');
// a touch device (David's iPhone: "Something went wrong", then the room never started): iOS Safari caps a page's GPU
// memory and, after a page runs out, refuses it WebGL. On touch devices the room keeps no 4x multisample copies of its
// full-frame passes, a 2048 key shadow map (was 4096), no preserved drawing buffer and no canvas antialias.
const TOUCH = (navigator.maxTouchPoints || 0) > 0 && !window.CAPTURE;
// an integrated, mobile or software GPU (David on his Chromebook, desktop: "Can you fix the speed of the site on a desktop?
// It's a fucking shit show"): a lighter room from the first frame instead of after the adaptive scale has caught up: no 4x
// multisample copies of the full-frame passes, no canvas antialias, the room's passes at fewer pixels (ROOM_PX)
const WEAK = !window.CAPTURE && (TOUCH || (() => { try {
  const c = document.createElement('canvas'), g = c.getContext('webgl2') || c.getContext('webgl'), e = g && g.getExtension('WEBGL_debug_renderer_info');
  const r = e ? String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)) : ''; const lc = g && g.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext();
  return /Intel|Mali|PowerVR|Adreno|llvmpipe|SwiftShader|Basic Render|Mesa|Chromium/i.test(r) && !/Apple M\d|Apple GPU/i.test(r); } catch (e) { return false; } })());
window.__weak = WEAK;
let RS = 1, rsN = 0, rsSum = 0, rsLast = 0; window.__rs = () => RS;   // the adaptive render scale (see loop)
const ROOM_PX = 1.6e6, ROOM_PX_WEAK = 0.9e6;   // the room's passes at most this many pixels (layout); a 1600x1000 or a 1270x710 frame
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: !TOUCH && !WEAK, preserveDrawingBuffer: !TOUCH && !WEAK }); }
catch (e) {   // no WebGL (or the browser refused it): the catalogue, which needs none, instead of an empty room
  document.documentElement.classList.add('cat-link');
  const grid = document.querySelector('#cat .grid'); if (grid && window.catalogueHTML) grid.innerHTML = window.catalogueHTML(null);
  if (grid) fetch('assets/shadow/shadow.json').then(r => r.json()).then(sh => { grid.innerHTML = window.catalogueHTML(sh); }).catch(() => {});
  throw e;
}
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.insertBefore(renderer.domElement, uiEl);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e2e2e4');
const cam = new THREE.PerspectiveCamera(40, FW / FH, 0.1, 50);
cam.position.set(0, 1.45, 5.4); cam.lookAt(0, 1.45, 0);
const refCam = cam.clone();   // the preview's camera, fixed: the specs are placed with it, whatever the window

const RW = 2.2, DEPTH = 3.2, TOP = 4.2;
// a studio cyclorama: one surface, every join between walls and floor rounded into a soft cove (no sharp corners)
const COVE = 1.25, ZB = 9.0; let ROOM;
// the side walls' lift while their pins are in: one value per pin column (0 = pins out, 1 = all in)
const Z0_ = '0.04', Z1_ = '3.4', Y0_ = '0.03', Y1_ = '3.9';   // the pin field (as Z0, Z1, Y0, Y1 below)
// the near floor on a phone (David: "fix the grey floor when it gets closer to you. Add real lighting there"): the main
// spot's cone stops short of the floor in front of the piece, so it went grey under the buttons. The floor is brought up
// to the back wall's lit level from where the cove meets the floor toward the camera, as a lit studio floor reads; the cove,
// the carved specs, the pins and every shadow are untouched. Phone only (layout sets it; the desktop frame keeps 0).
const FLOOR = { value: 0 }, DROPZ = { value: -1 }, DROPZ2 = { value: -1 }; window.FLOOR_WASH = window.FLOOR_WASH ?? 1;
const LIFT = { data: new Uint8Array(COLS * 4), gain: 1.0, fall: 0.45, white: WHITE ? 1 : 0 }   // the back wall's lit level (linear, before tone mapping) and how much it eases off toward the camera;
LIFT.tex = new THREE.DataTexture(LIFT.data, COLS, 1, THREE.RGBAFormat); LIFT.tex.magFilter = LIFT.tex.minFilter = THREE.LinearFilter; LIFT.tex.needsUpdate = true;
{
  const g = new THREE.BoxGeometry(RW * 2, TOP * 2, ZB, 96, 180, 200);  // twice as tall: the ceiling is far out of frame
  const P = g.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  const hx = RW - COVE, hy = TOP - COVE, hz = ZB / 2 - COVE;
  for (let i = 0; i < P.count; i++) {
    v.fromBufferAttribute(P, i);
    c.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z)));
    n.subVectors(v, c); if (n.lengthSq() > 0) n.normalize().multiplyScalar(COVE);
    v.copy(c).add(n); P.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  const room = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#e3e3e5', roughness: 0.93, side: THREE.BackSide }));
  room.position.set(0, TOP, ZB / 2); room.receiveShadow = true; scene.add(room); ROOM = room;
  // David, mid-switch: "it needs to load all room as same studio lighting, the dark color should be almost as a shadow",
  // then "Unless you transition that white wall onto the corners and walls too". With the pins in, the bare side walls
  // only take the main spot and key at a graze and drop to a flat grey. So while a column's pins are in, the back wall's
  // lit white carries on through the corner cove and along the side wall, easing off gently toward the camera, by how
  // far that column's pins are in (the same wave). Only surfaces facing sideways: never the back wall, the floor or the
  // cove under the piece. With the pins out it is 0 and the room is exactly as it was. It is not a light.
  room.material.onBeforeCompile = (sh) => {
    sh.uniforms.floorK = FLOOR; sh.uniforms.dropZ = DROPZ; sh.uniforms.dropZ2 = DROPZ2; sh.uniforms.liftTex = { value: LIFT.tex }; sh.uniforms.liftG = LIFT.uG = { value: LIFT.gain }; sh.uniforms.liftF = { value: LIFT.fall }; sh.uniforms.liftW = { value: LIFT.white };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLW; varying vec3 vLN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLW = (modelMatrix * vec4(transformed, 1.0)).xyz; vLN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLW; varying vec3 vLN; uniform sampler2D liftTex; uniform float liftG; uniform float liftF; uniform float floorK; uniform float dropZ; uniform float dropZ2;' + (LIFT.white ? ' uniform float liftW;' : ''))
      // the test with white side walls (?white=1) needs the wall's light before shadows, so the pins' shadows keep their
      // contrast. Compiled in only for the test: without the flag the shader is exactly as it was.
      // It also keeps the light after shadows (irrS): their ratio is how lit the point is, weighted by what each light
      // brings, so the white goes only on wall the lights actually reach and every cast shadow keeps its exact value.
      .replace('#include <lights_fragment_begin>', !LIFT.white ? '#include <lights_fragment_begin>' : 'vec3 irrNS = vec3(0.0); vec3 irrS = vec3(0.0);\n' + THREE.ShaderChunk.lights_fragment_begin.replace(
        /directLight\.color \*= \( directLight\.visible && receiveShadow \) \? ([^;]*);/g,
        'irrNS += saturate( dot( geometryNormal, directLight.direction ) ) * directLight.color; { vec3 preC_ = directLight.color; directLight.color *= ( directLight.visible && receiveShadow ) ? $1; irrS += saturate( dot( geometryNormal, directLight.direction ) ) * directLight.color; }'))
      .replace('#include <opaque_fragment>', `{
        // the pin column this point belongs to (u: 0 nearest the camera, 1 at the back corner), and how far its pins are in
        float u = vLW.x < 0.0 ? (${Z1_} - vLW.z) / (${Z1_} - ${Z0_}) : (vLW.z - ${Z0_}) / (${Z1_} - ${Z0_});
        float k = texture2D(liftTex, vec2(clamp(u, 0.0, 1.0), 0.5)).r;
        // the back wall's lit white, carried out through the corner and along the wall, easing off gently toward the camera
        float tgt = liftG * (1.0 - liftF * smoothstep(0.0, 5.0, vLW.z));
        // the side walls and their coves (facing sideways), fading in from the back wall with no edge; never the back
        // wall itself, the floor or the cove under the piece
        float side = smoothstep(0.02, 0.6, abs(vLN.x)) * (1.0 - smoothstep(${Y1_}, ${Y1_} + 1.2, vLW.y));
        vec3 white = tgt * diffuseColor.rgb / diffuseColor.g;
${LIFT.white ? `
          // test (?white=1): the side walls' lit ground is the back wall's lit white all the time. The wall's light,
          // before shadows, is scaled up to that white only where the lights reach it (lit): every cast shadow on it,
          // the art shadow, the pins' own and the hoodie's, keeps its exact value, and only the grey ground goes white
          vec3 unsh = irrNS * BRDF_Lambert(diffuseColor.rgb) + reflectedLight.indirectDiffuse;
          float gain = max(1.0, tgt / max(unsh.g, 1e-3));   // the white target in green is tgt
          float lit = irrS.g / max(irrNS.g, 1e-5);   // 1 where every light reaches, 0 in full shadow
          outgoingLight *= mix(1.0, gain, side * smoothstep(0.92, 1.0, lit));   // fully lit wall only: shadow interiors and their soft edges stay exact
` : `
          outgoingLight = mix(outgoingLight, max(outgoingLight, white), k * side);
`}
        // the phone's near floor, lit: floor-facing only (the room is drawn from inside: the floor's normal points down), from where the cove meets the floor, eased in
        float fl = floorK * smoothstep(0.9, 0.995, -vLN.y) * smoothstep(0.35, 1.1, vLW.z);
        // a touch darker very close to the camera, so the floor still reads as floor (David: "a bit dark very close to me for distinction")
        float nearDim = 1.0 - 0.3 * smoothstep(1.0, 4.5, vLW.z);
        outgoingLight = mix(outgoingLight, max(outgoingLight, nearDim * liftG * diffuseColor.rgb / diffuseColor.g), fl);
        if (dropZ > 0.0 && fl > 0.5) {   // the phone's step down (David: "Use this one"): a lit lip, its short face in soft shade,
          // the lower floor a touch darker and easing back; ADD TO CART and PRE-SALE are cut into the lower floor under it
          float dz = vLW.z - dropZ;
          float lip = smoothstep(-0.004, 0.0, dz) * (1.0 - smoothstep(0.004, 0.008, dz));
          float riser = smoothstep(0.006, 0.01, dz) * (1.0 - smoothstep(0.10, 0.12, dz));
          float below = smoothstep(0.10, 0.12, dz);
          outgoingLight *= 1.0 + 0.06 * lip;
          outgoingLight *= 1.0 - riser * mix(0.16, 0.08, smoothstep(0.01, 0.11, dz));
          outgoingLight *= 1.0 - 0.05 * below * (1.0 - 0.6 * smoothstep(0.12, 0.6, dz));
        }
      }
      #include <opaque_fragment>`);
  };
  // the intro (0bc08de): the wall's own surface, a fine plaster grain (bump and a faint tone), so the uplit wash reads as
  // a wall; GRAIN is 1 only in the intro and 0 everywhere else, where the room is exactly as approved
  { const base = room.material.onBeforeCompile;
    room.material.onBeforeCompile = (sh) => { base(sh); sh.uniforms.grainK = GRAIN;
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      uniform float grainK;
      float gh3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float gvn3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(gh3(i), gh3(i + vec3(1,0,0)), f.x), mix(gh3(i + vec3(0,1,0)), gh3(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(gh3(i + vec3(0,0,1)), gh3(i + vec3(1,0,1)), f.x), mix(gh3(i + vec3(0,1,1)), gh3(i + vec3(1,1,1)), f.x), f.y), f.z); }
      float grain(vec3 p){ return 0.55 * gvn3(p * 260.0) + 0.3 * gvn3(p * 75.0) + 0.15 * gvn3(p * 18.0); }`)
        .replace('#include <color_fragment>', '#include <color_fragment>\n if (grainK > 0.0) diffuseColor.rgb *= mix(1.0, 0.93 + 0.07 * grain(vLW * 0.7), grainK);')
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      if (grainK > 0.0) { float e = 0.0012, g0 = grain(vLW);
        vec3 gw = vec3(grain(vLW + vec3(e,0,0)) - g0, grain(vLW + vec3(0,e,0)) - g0, grain(vLW + vec3(0,0,e)) - g0) / e;
        vec3 gv = (viewMatrix * vec4(gw, 0.0)).xyz; gv -= dot(gv, normal) * normal;
        normal = normalize(normal - 0.0009 * grainK * gv); }`); };
  }
}

const hemi = new THREE.HemisphereLight('#ffffff', '#cfcfd3', 1.05); scene.add(hemi);
// the studio's main light: a big soft spot from behind the camera, aimed at the back wall
const main = new THREE.SpotLight('#ffffff', 2.4, 0, 0.62, 1.0, 0);
main.position.set(-1.1, 2.6, 7.6); main.target.position.set(0, 1.5, 0); scene.add(main); scene.add(main.target);
main.castShadow = true; main.shadow.mapSize.set(2048, 2048); main.shadow.bias = -0.0003; main.shadow.normalBias = 0.008; main.shadow.radius = 2;
main.shadow.camera.near = 1; main.shadow.camera.far = 16;
// the left key, from outside the left wall: it throws the left wall's pin art across the back wall
const key = new THREE.DirectionalLight('#ffffff', 1.9);
key.position.set(-1.6, 3.6, 4.2); key.target.position.set(0, 1.4, 1.2);
key.castShadow = true; key.shadow.mapSize.set(TOUCH ? 2048 : 4096, TOUCH ? 2048 : 4096);
const sc = key.shadow.camera; sc.left = -6; sc.right = 6; sc.top = 6; sc.bottom = -6; sc.near = 0.5; sc.far = 25;
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.01; key.shadow.radius = 3;
scene.add(key); scene.add(key.target);

// pins: domes, height from the art
const pinGeo = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2); // hemisphere, pole +y
pinGeo.rotateZ(-Math.PI / 2); // pole -> +x (wall normal for the left wall)
const pinMat = new THREE.MeshStandardMaterial({ color: '#efeff1', roughness: 0.8 });
const N = COLS * ROWS;
function makeWall(side) {
  const mesh = new THREE.InstancedMesh(pinGeo, pinMat, N);
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh); return { mesh, side };
}
const walls = [makeWall(-1), makeWall(1)];
const Z0 = 0.04, Z1 = 3.4, Y0 = 0.03, Y1 = 3.9;
const dy = (Y1 - Y0) / ROWS;
function flatPos(side, c, r) {
  const u = (c + 0.5) / COLS;
  const z = side < 0 ? Z1 - u * (Z1 - Z0) : Z0 + u * (Z1 - Z0);
  const y = Y1 - (r + 0.5) * dy;
  return [side * RW, y, z];
}
// each pin sits on the studio surface itself, standing along the surface normal; the field fades out at its edges
const PINPOS = [new Float32Array(N * 3), new Float32Array(N * 3)], PINQ = [[], []], TAPER = [new Float32Array(N), new Float32Array(N)];
function pinPos(side, c, r) { const wi = side < 0 ? 0 : 1, i = r * COLS + c; return [PINPOS[wi][i * 3], PINPOS[wi][i * 3 + 1], PINPOS[wi][i * 3 + 2]]; }
{
  const ctr = new THREE.Vector3(0, TOP, ZB / 2), h = new THREE.Vector3(RW - COVE, TOP - COVE, ZB / 2 - COVE);
  const p = new THREE.Vector3(), cc = new THREE.Vector3(), n = new THREE.Vector3(), X = new THREE.Vector3(1, 0, 0);
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (const side of [-1, 1]) { const wi = side < 0 ? 0 : 1;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const i = r * COLS + c;
      const [x, y, z] = flatPos(side, c, r); p.set(x, y, z).sub(ctr);
      cc.set(Math.max(-h.x, Math.min(h.x, p.x)), Math.max(-h.y, Math.min(h.y, p.y)), Math.max(-h.z, Math.min(h.z, p.z)));
      n.subVectors(p, cc).normalize(); const sp = cc.clone().addScaledVector(n, COVE).add(ctr);
      PINPOS[wi][i * 3] = sp.x; PINPOS[wi][i * 3 + 1] = sp.y; PINPOS[wi][i * 3 + 2] = sp.z;
      PINQ[wi][i] = new THREE.Quaternion().setFromUnitVectors(X, n.clone().negate());
      const u = (c + 0.5) / COLS, v = (r + 0.5) / ROWS;
      TAPER[wi][i] = sm(0, 0.16, u) * sm(0, 0.16, 1 - u) * sm(0, 0.12, v) * sm(0, 0.16, 1 - v);
    } }
}
async function loadH(src) {
  const img = new Image(); img.src = src; await img.decode();
  const cv = document.createElement('canvas'); cv.width = COLS; cv.height = ROWS;
  const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0, COLS, ROWS);
  const d = cx.getImageData(0, 0, COLS, ROWS).data; const a = new Float32Array(N);
  for (let i = 0; i < N; i++) a[i] = d[i * 4] / 255; return a;
}
const tl = new THREE.TextureLoader();
async function tex(src) { const t = await tl.loadAsync(src); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
// the solo Ö on both pin walls in the intro (26beb9a: PHAORA-logo-o.png sampled as the pins' heights, not redrawn)
const LOGOH = INTRO ? { L: await loadH('assets/h_logo_L.png'), R: await loadH('assets/h_logo_R.png') } : null;
await Promise.all(PIECES.map(async (pc) => {
  [pc.hL, pc.hR, pc.tex] = await Promise.all([loadH(pc.pinsL), loadH(pc.pinsR), tex(pc.img)]);
}));

const TM0 = 1.3, DIS = 2.4, TM1 = 1.3 + 2.4;
const GH = 1.95;
// seamless dissolve: one flat plane, front facing; the whole piece melts into the next at once through a fine grain.
// No pixels, no movement, no warping. (The preview's shader, unchanged.)
const dMat = new THREE.ShaderMaterial({ transparent: true,
  uniforms: { A: { value: PIECES[0].tex }, B: { value: PIECES[0].tex }, p: { value: 0 }, sA: { value: 1 }, sB: { value: 1 }, lit: { value: 1 }, op: { value: 1 }, soft: { value: SOFT ? 1 : 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D A; uniform sampler2D B; uniform float p; uniform float sA; uniform float sB; uniform float lit; uniform float op; uniform float soft; varying vec2 vUv;
float h(vec2 c){ return fract(sin(dot(c, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
// sampled in uniform control flow, then masked: a sample inside the branch left the quad's edge pixels without mip
// derivatives on a real GPU (David's two thin dark lines at the hero's left and right edges; SwiftShader never shows it)
vec4 tap(sampler2D T, float s){ vec2 u = vec2((vUv.x - 0.5) * s + 0.5, vUv.y); vec4 c = texture2D(T, clamp(u, 0.0, 1.0)); return (u.x < 0.0 || u.x > 1.0) ? vec4(0.0) : c; }
void main(){
  vec4 a = tap(A, sA), b = tap(B, sB);
  float n = 0.6 * vn(vUv * vec2(150.0, 170.0)) + 0.4 * vn(vUv * vec2(38.0, 44.0));
  float k = n;   // all at once: no sweep, the whole piece melts together through a fine grain
  float m = soft > 0.5 ? smoothstep(0.0, 1.0, p) : smoothstep(0.0, 0.16, p * 1.22 - k);   // the soft fade: the whole piece at once, eased
  float al = mix(a.a, b.a, m);
  vec3 rgb = mix(a.rgb * a.a, b.rgb * b.a, m) / max(al, 1e-4);
  if (al < 0.01) discard;
  gl_FragColor = vec4(rgb * lit, al * op);
  #include <colorspace_fragment>
}` });
// the plane is as wide as the wider of the two pieces it passes between (the preview: DW = GH * max of the two aspects)
const dis = new THREE.Mesh(new THREE.PlaneGeometry(1, GH), dMat); dis.position.set(0, 1.62, 0.9);
const EMPTY = new THREE.DataTexture(new Uint8Array(4), 1, 1); EMPTY.needsUpdate = true;   // b < 0: nothing (the room opening)
function setPair(a, b) {
  const A = PIECES[a], B = b < 0 ? A : PIECES[b], DW = GH * Math.max(A.aspect, B.aspect);
  dis.scale.x = DW; dMat.uniforms.A.value = A.tex; dMat.uniforms.B.value = b < 0 ? EMPTY : B.tex;
  dMat.uniforms.sA.value = DW / (GH * A.aspect); dMat.uniforms.sB.value = DW / (GH * B.aspect);
}
// the garment's real shadow (David: "Use real life shadow effect on it, no more guess artificial shadows"). No more
// painted blob: the real hoodie, model A (assets/shadow/po-black-cream-caster.bin, 24k triangles), stands where the
// cut-out is and casts with the room's own lights and shadow maps (the main spot and the key). Nothing sees it: it only
// writes into the shadow maps. Fitted through the room's camera to each cut-out (fit_caster.html, caster-fit.json,
// caster-align-*.png). The Muse has her own: the corrected model (drop003/portrait/hoodie_portrait_web.glb, the cuff patch
// and the all-black hood, 515ad1a9), decimated by studio-mock/shadow_study.py to assets/caster-muse.bin, fitted to her
// new cut-out (build_cuts.py) at IoU 0.981. The PÖ: its corrected model (46340bf7), IoU 0.994. The Noir: its own mesh
// (crewneck/real/noir_crewneck_crewc-3f6984a8.glb at a2d41bd), IoU 0.982. The tee: its settled mesh (e84a93a3), IoU 0.996.
// The starlets are the Muse's mesh, so they use hers.
const CASTER_FIT = {"muse": {"scale": 2.62025, "x": 0.00294, "y": 1.69199, "z": 0.9, "tilt": 0.03496, "widthFactor": 0.99, "iou": 0.9809, "geo": "caster-muse"}, "po": {"scale": 2.6137, "x": 0.00007, "y": 1.69176, "z": 0.9, "tilt": 0.03625, "widthFactor": 1.0025, "iou": 0.9937, "geo": "caster-po"}, "noir": {"scale": 2.658, "x": 0.0053, "y": 1.64825, "z": 0.9, "tilt": 0.03406, "widthFactor": 0.99873, "iou": 0.9823, "geo": "caster-noir"}, "tee": {"scale": 2.60967, "x": 0.00038, "y": 1.65944, "z": 0.9, "tilt": 0.05906, "widthFactor": 1.00156, "iou": 0.9961, "geo": "caster-tee"}, "muse_allover": {"scale": 2.53477, "x": 0.00295, "y": 1.66996, "z": 0.9, "tilt": -0.01352, "widthFactor": 1.02063, "iou": 0.9681, "geo": "caster-muse"}, "veil_coat": {"scale": 2.80886, "x": 0.00015, "y": 1.6822, "z": 0.9, "tilt": 0.00016, "widthFactor": 1.01125, "iou": 0.988, "geo": "caster-veil_coat"}, "muse_bomber": {"scale": 2.83027, "x": 7e-05, "y": 1.68717, "z": 0.9, "tilt": -0.01656, "widthFactor": 1, "iou": 0.9899, "geo": "caster-muse_bomber"}};
Object.assign(CASTER_FIT, window.CASTER_FIT_EXTRA || {});   // Chapter I site: the rest of the line's casters (build_room.py)
const CASTER_GEO = {};
for (const name of new Set(Object.values(CASTER_FIT).map(f => f.geo))) CASTER_GEO[name] = await (async () => {
  const meta = await (await fetch(`assets/${name}.json`)).json(), buf = await (await fetch(`assets/${name}.bin`)).arrayBuffer();
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buf, 0, meta.vertices * 3), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(buf, meta.vertices * 12, meta.triangles * 3), 1));
  geo.computeBoundingBox(); const c0 = geo.boundingBox.getCenter(new THREE.Vector3()); geo.translate(-c0.x, -c0.y, -c0.z); return geo;
})();
// the casters' shadow depth, with a fade: CAST.value of their depth texels are kept (an ordered dither the shadows' soft
// filter blurs into an even fade). 1 everywhere but the intro's end, where her shadow comes in just behind her.
const CAST = { value: 1 };
const casterDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
casterDepth.onBeforeCompile = (s) => { s.uniforms.castK = CAST;
  s.fragmentShader = 'uniform float castK;\n' + s.fragmentShader.replace('void main() {', `void main() {
    if (castK < 0.999) { ivec2 q = ivec2(mod(gl_FragCoord.xy, 4.0)); int i = q.x + 4 * q.y;
      float b = float(i == 0 ? 0 : i == 1 ? 8 : i == 2 ? 2 : i == 3 ? 10 : i == 4 ? 12 : i == 5 ? 4 : i == 6 ? 14 : i == 7 ? 6 : i == 8 ? 3 : i == 9 ? 11 : i == 10 ? 1 : i == 11 ? 9 : i == 12 ? 15 : i == 13 ? 7 : i == 14 ? 13 : 5);
      if ((b + 0.5) / 16.0 >= castK) discard; }`); };
casterDepth.customProgramCacheKey = () => 'caster-depth-fade';
const casterMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
function caster(f) {
  const m = new THREE.Mesh(CASTER_GEO[f.geo], casterMat); m.castShadow = false; m.receiveShadow = false; m.visible = false;   // its shadow is the softbox's (svUpdate), not a three.js light's
  // its shadow is the studio lights' only (main, key): the intro's uplights are still fading out as the Muse comes in, and
  // their shadow of her was a second, larger Muse on the wall. In an uplight's shadow map she collapses to a point.
  m.customDepthMaterial = casterDepth;
  m.onBeforeShadow = (r, o, c, sc) => { if (sc === up.shadow.camera || sc === sideUp[0].shadow.camera || sc === sideUp[1].shadow.camera) o.modelViewMatrix.makeScale(0, 0, 0); };
  m.position.set(f.x, f.y, f.z); m.rotation.set(f.tilt, 0, 0); m.scale.set(f.scale * (f.widthFactor ?? 1), f.scale, f.scale); scene.add(m); return m;
}
// one caster per piece in the room, from its fit (PIECES[i].caster names it)
const CASTERS = PIECES.map(pc => caster(CASTER_FIT[pc.caster]));

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const M = new THREE.Matrix4(), S = new THREE.Vector3(), Pv = new THREE.Vector3();
const PIN_R = 0.0135, PIN_H = 0.026;
const T0 = 1.0, WAVE_R = 1.6, DUR_R = 0.2, T_E = 2.9, WAVE_E = 1.6, DUR_E = 0.34, JIT = 0.14;
// each pin keeps its head and only travels: down into the wall, then out as the new design. A short travel per pin,
// a small fixed offset per pin on top of the near-to-far wave, so single pins are seen dropping, not the image fading.
const PJ = new Float32Array(N); for (let i = 0; i < N; i++) { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; PJ[i] = s - Math.floor(s); }
const easeIO = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const outSoft = (x) => { const c1 = 0.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const PS = [0, 0];   // [height, head]: the head is the pin's own size, held while it travels
// One morph, all pins at once (the preview at a4cc8f6; David: "As they wave away, the other ones interchangeably come out
// ... Otherwise they will stop casting shadow and shadow is the whole picture", then "Not nearest first, all at once,
// no?"). The walls never go bare: every pin goes straight from the old design's height to the new one's, eased, in one
// window (the dissolve's 2.4 s; the spin's whole turn), each with its small fixed offset (up to 0.4 s, the same on both
// walls, so the mirror holds), so pins are seen moving one by one, not fading.
const MORPH_OFF = 0.4;
function pinState(t, a, b, j, x0, W) {
  const tx0 = x0 + j * MORPH_OFF, D = W - MORPH_OFF;
  if (t <= tx0) { PS[0] = a; PS[1] = a; return PS; }
  if (t >= tx0 + D) { PS[0] = b; PS[1] = b; return PS; }
  { const e = easeIO((t - tx0) / D), h = a + (b - a) * e; PS[0] = h; PS[1] = h; return PS; }
}
function pinStateTwoWaves(t, a, b, dnIn, dnOut, j, tE) {   // the earlier rule (all in, then out), kept for reference
  const tr0 = T0 + dnIn * WAVE_R + j * JIT, tr1 = tr0 + DUR_R;
  const te0 = tE + dnOut * WAVE_E + j * JIT, te1 = te0 + DUR_E;
  if (t <= tr0) { PS[0] = a; PS[1] = a; return PS; }
  if (t < tr1) { PS[0] = a * (1 - easeIO((t - tr0) / DUR_R)); PS[1] = a; return PS; }
  if (t < te0) { PS[0] = 0; PS[1] = a; return PS; }
  if (t < te1) { PS[0] = b * Math.max(0, outSoft((t - te0) / DUR_E)); PS[1] = b; return PS; }
  PS[0] = b; PS[1] = b; return PS;
}
// Exact mirror (David): the left half of the room is rendered exactly as approved. The right half is the same room,
// lit the same way, rendered with the right wall's own pins placed on the left wall, then flipped horizontally.
const rtOpts = { type: THREE.HalfFloatType, samples: TOUCH || WEAK ? 0 : 4 };
const rtA = new THREE.WebGLRenderTarget(FW, FH, rtOpts), rtB = new THREE.WebGLRenderTarget(FW, FH, rtOpts), rtA0 = new THREE.WebGLRenderTarget(FW, FH, rtOpts), rtA2 = new THREE.WebGLRenderTarget(FW, FH, rtOpts);
const compMat = new THREE.ShaderMaterial({ uniforms: { A: { value: rtA.texture }, B: { value: rtB.texture }, A0: { value: rtA0.texture }, A2: { value: rtA2.texture }, cw: { value: 0 }, E0: { value: null }, E1: { value: null }, eR: { value: new THREE.Vector4() }, eSS: { value: 1 }, eK: { value: 0 }, fr: { value: new THREE.Vector2(1280, 720) }, wh: { value: 0 }, sk: { value: 1 }, E2: { value: null }, E3: { value: null }, eR2: { value: new THREE.Vector4(0, 0, 1, 1) }, eK2: { value: 0 }, SV: { value: null }, HH: { value: null }, gS: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `uniform sampler2D A; uniform sampler2D B; uniform sampler2D A0; uniform sampler2D A2; uniform float cw; uniform sampler2D E0; uniform sampler2D E1; uniform vec4 eR; uniform float eSS; uniform float eK; uniform vec2 fr; uniform float wh; uniform float sk; uniform sampler2D E2; uniform sampler2D E3; uniform vec4 eR2; uniform float eK2; uniform sampler2D SV; uniform sampler2D HH; uniform float gS; varying vec2 vUv;
#define SV_AO 0.2    // the bounce the piece blocks (sv.b): GT's darkening over the carved specs is ~0.07
#define SV_KC 0.08   // extra key share where the cloth hangs close (contact)
void main(){
  vec4 c = vUv.x < 0.5 ? texture2D(A0, vUv) : texture2D(B, vec2(1.0 - vUv.x, vUv.y));   // the room, no garment shadow in it
  vec3 rG = vec3(1.0);   // the garment's own cast shadow (kept when the room floods to white)
  // the carving: cut minus uncut, from the real camera and the real lights, added unflipped to both halves
  vec2 q = (vec2(vUv.x * fr.x, (1.0 - vUv.y) * fr.y) - eR.xy) / eR.zw;
  if (eK > 0.0 && q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) {
    vec2 u0 = vec2(q.x, 1.0 - q.y), st = 1.0 / (eR.zw * eSS); vec3 dl = vec3(0.0);
    for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) { vec2 u = u0 + vec2(float(i), float(j)) * st; dl += texture2D(E1, u).rgb - texture2D(E0, u).rgb; }
    c.rgb += eK * dl / 9.0;
  }
  // the intro's lines on the back wall: the same, in their own window
  vec2 q2 = (vec2(vUv.x * fr.x, (1.0 - vUv.y) * fr.y) - eR2.xy) / eR2.zw;
  if (eK2 > 0.0 && q2.x > 0.0 && q2.x < 1.0 && q2.y > 0.0 && q2.y < 1.0) {
    vec2 u0 = vec2(q2.x, 1.0 - q2.y), st = 1.0 / (eR2.zw * eSS); vec3 dl = vec3(0.0);
    for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) { vec2 u = u0 + vec2(float(i), float(j)) * st; dl += texture2D(E3, u).rgb - texture2D(E2, u).rgb; }
    c.rgb += eK2 * dl / 9.0;
  }
  // the garment's shadow (STUDY.md §3.3, §5 S4): the softbox's visibility V and the bounce halo Hh, one f for both halves,
  // unflipped, on the room and its carving alike (the cuts darken exactly as the cove around them), in linear light.
  // Through a crossfade the two pieces' shadows mix by cw.
  { vec4 sv = texture2D(SV, vUv); vec2 hh = texture2D(HH, vUv).rg;
    float Vv = mix(sv.r, sv.g, cw), Hh = mix(hh.r, hh.g, cw);
    // no screen-space halo (STUDY.md §8.2: its blur of 1 - V, centred behind the piece, is what made the blob). The cast
    // shape alone, darker where the cloth hangs close to the surface (contact: the hem over the cove) and lighter where it
    // hangs far (the back wall), from d_ro, the blocked samples' distance (V's alpha)
    float near = min(pow(0.9 / max(sv.a, 0.3), 1.5), 1.0);
    float f = 1.0 - (0.26 + SV_KC * near) * (1.0 - Vv) - SV_AO * sv.b * (1.0 - cw);
    f = mix(1.0, f, gS); rG = vec3(f); }
  gl_FragColor = vec4(c.rgb, 1.0);
  #include <tonemapping_fragment>
  // applied on screen as the ground truth's photograph shows it: f taken through the tone curve at the ground truth's lit-wall
  // level (1.46 before tone mapping; the room's wall sits at 1.02, where the same f reads about three times as dark)
  // f through this room's own tone curve at its own lit-wall level (1.02 before tone mapping)
  gl_FragColor.rgb *= NeutralToneMapping(vec3(1.02 * rG.r)).r / NeutralToneMapping(vec3(1.02)).r;
  #include <colorspace_fragment>
  // the room opening (David: "The white out is just to hide all walls floor"): the studio light floods the room's own
  // surfaces (walls, coves, floor, pins and their shadows) to one even white; the garment's real shadow stays on it.
  // The pieces are drawn after this, so they keep their own exposure.
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.957, 0.957, 0.965) * pow(mix(vec3(1.0), rG, sk), vec3(1.0 / 2.2)), wh);
}`, depthTest: false, depthWrite: false, toneMapped: true });
const compScene = new THREE.Scene(); compScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compMat));
const compCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const overlay = new THREE.Scene(); overlay.add(dis);
// ---- the garment's shadow, from the shadow study (review/shadow-study/STUDY.md §5; David: "You must do studies of real
// shadows", "just hoodie gets realistic"). One 60 x 45 cm softbox, K, at the key's place facing the piece, casts it and
// nothing else does (the caster is in no three.js shadow map; the pins keep their approved stylised shadows). V(x) is the
// share of K each visible point sees past the caster: 16 jittered points on K, each a caster-only distance map, tested
// from every pixel's world position (rebuilt from pass A's depth). The halo Hh is the bounce the piece also blocks, a
// wide Gaussian of 1 - V. The composite multiplies the room, carving included, by f = 1 - sk (1 - V) - 0.23 Hh in
// linear light (§3.3).
const PC = new THREE.Vector3(0, 1.62, 0.9);   // the piece's centre
const K0 = key.position.clone(), K_D = K0.distanceTo(PC), K_W = 0.3, K_H = 0.22;   // a gridded 60 x 45 box: half the apparent size, so the outline (sleeves, cuffs, hem) reads on the wall
// the box at rest: 45 degrees round to the left and 40 up, high and in front, so the cast runs down the wall beside the specs,
// round the cove and onto the floor (David, 9 Nov: the shadow must warp round the cove; the specs stay clean)
const K_AZ0 = -45 * Math.PI / 180, K_EL0 = 40 * Math.PI / 180;   // -25.9 degrees round; 45 up (David, 9 Nov: high and in front, so the cast runs down the wall, round the cove and onto the floor)
const Kpos = K0.clone();
function placeK(azDeg, elDeg) {   // swung about PC; its horizontal radius kept 35 cm inside the side walls (§5 S1)
  // the drag swings the box from its rest (45 degrees left) to about 86 degrees either side (David, 9 Nov: both ends throw the long shadow)
  const a = K_AZ0 + (azDeg > 0 ? azDeg * 2.1 : azDeg * 0.66) * Math.PI / 180, e = K_EL0 + elDeg * Math.PI / 180;
  const rh = Math.min(K_D * Math.cos(e), 1.85 / Math.max(Math.abs(Math.sin(a)), 1e-6));
  Kpos.set(PC.x + rh * Math.sin(a), PC.y + K_D * Math.sin(e), PC.z + rh * Math.cos(a));
}
const SV_TILE = 384, SV_N = 16, SV_ROUNDS = 4;
// the halo's weight falls with the cloth's distance to the surface (d_ro, the blocked samples' mean): the piece blocks more of
// the cyc's bounce where it hangs close (STUDY.md §3.1, §3.3); w = min((1.2 m / d_ro)^SV_HP, SV_HW), fitted against check.py
const SV_HP = 0.875, SV_HW = 1.6;   // with h = 0.28 in compMat
const svAtlas = [0, 1].map(() => new THREE.WebGLRenderTarget(SV_TILE * 4, SV_TILE * 4, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false }));
const svDist = new THREE.ShaderMaterial({ side: THREE.DoubleSide,   // 1 / distance from the sample point (0: no caster)
  vertexShader: 'varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = mv.xyz; gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'varying vec3 vV; void main(){ gl_FragColor = vec4(1.0 / length(vV), 0.0, 0.0, 1.0); }' });
const svCam = new THREE.PerspectiveCamera(30, 1, 0.1, 20), svM = [...Array(SV_N)].map(() => new THREE.Matrix4()), svS = [...Array(SV_N)].map(() => new THREE.Vector3());
const svRnd = (s) => () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const svSphere = new THREE.Sphere(), SV_UP = new THREE.Vector3(0, 1, 0);
function svMaps(cs, round) {   // the caster(s) from 16 stratified, jittered points on K
  let R = 0.3;
  for (const c of cs) { if (!c) continue; c.updateMatrixWorld(true); if (!c.geometry.boundingSphere) c.geometry.computeBoundingSphere();
    svSphere.copy(c.geometry.boundingSphere).applyMatrix4(c.matrixWorld); R = Math.max(R, svSphere.center.distanceTo(PC) + svSphere.radius); }
  const fw = PC.clone().sub(Kpos).normalize(), rt = new THREE.Vector3().crossVectors(fw, SV_UP).normalize(), up = new THREE.Vector3().crossVectors(rt, fw), rnd = svRnd(round * 7919 + 17);
  const cc = renderer.getClearColor(new THREE.Color()), ca = renderer.getClearAlpha(), ac = renderer.autoClear; renderer.setClearColor(0x000000, 0);
  cs.forEach((c, j) => { if (c) { renderer.setRenderTarget(svAtlas[j]); svAtlas[j].viewport.set(0, 0, SV_TILE * 4, SV_TILE * 4); renderer.clear(); } });
  renderer.autoClear = false;   // a clear ignores the viewport: each tile would wipe the others
  for (let i = 0; i < SV_N; i++) {
    const u = ((i % 4) + rnd()) / 4 - 0.5, v = (((i / 4) | 0) + rnd()) / 4 - 0.5;
    const P = Kpos.clone().addScaledVector(rt, u * K_W).addScaledVector(up, v * K_H), d = P.distanceTo(PC);
    svCam.position.copy(P); svCam.up.set(0, 1, 0); svCam.lookAt(PC);
    svCam.fov = 2 * Math.asin(Math.min(0.98, R / d)) * 180 / Math.PI * 1.04; svCam.near = Math.max(0.05, d - R - 0.2); svCam.far = d + R + 0.2;
    svCam.updateProjectionMatrix(); svCam.updateMatrixWorld(); svM[i].multiplyMatrices(svCam.projectionMatrix, svCam.matrixWorldInverse); svS[i].copy(P);
    cs.forEach((c, j) => { if (!c) return; const was = [c.material, c.visible]; c.material = svDist; c.visible = true;
      svAtlas[j].viewport.set((i % 4) * SV_TILE, ((i / 4) | 0) * SV_TILE, SV_TILE, SV_TILE); renderer.setRenderTarget(svAtlas[j]); renderer.render(c, svCam);
      [c.material, c.visible] = was; });
  }
  cs.forEach((c, j) => { if (c) svAtlas[j].viewport.set(0, 0, SV_TILE * 4, SV_TILE * 4); });
  renderer.setClearColor(cc, ca); renderer.autoClear = ac;
}
// V for each pixel (R: the caster, G: the second caster in a crossfade; B: how much the surface is wall rather than cove),
// accumulated over rounds of fresh jitter while nothing changes
const svDepth = new THREE.DepthTexture(FW, FH); rtA0.depthTexture = svDepth;
const svOpt = { type: THREE.HalfFloatType, depthBuffer: false, generateMipmaps: false };
const svV = [0, 1].map(() => new THREE.WebGLRenderTarget(FW, FH, svOpt));
const svVMat = new THREE.ShaderMaterial({ uniforms: { Dp: { value: svDepth }, iPV: { value: new THREE.Matrix4() }, eye: { value: new THREE.Vector3() }, M: { value: svM }, S: { value: svS },
    At0: { value: svAtlas[0].texture }, At1: { value: svAtlas[1].texture }, two: { value: 0 }, Pv: { value: null }, wp: { value: 1 }, AOS: { value: [...Array(12)].map(() => new THREE.Vector4()) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `uniform sampler2D Dp; uniform mat4 iPV; uniform vec3 eye; uniform mat4 M[${SV_N}]; uniform vec3 S[${SV_N}]; uniform sampler2D At0; uniform sampler2D At1;
uniform float two; uniform sampler2D Pv; uniform float wp; uniform vec4 AOS[12]; varying vec2 vUv;
float occ(sampler2D At, ivec2 p, float dr){ float id = texelFetch(At, p, 0).r; return (id > 0.0 && 1.0 / id < dr - 0.02) ? 1.0 : 0.0; }
float gD, gN;
float vis(sampler2D At, vec3 P){ float o = 0.0; gD = 0.0; gN = 0.0;
  for (int i = 0; i < ${SV_N}; i++) {
    vec4 cl = M[i] * vec4(P, 1.0); if (cl.w <= 0.0) continue;
    vec2 uv = cl.xy / cl.w * 0.5 + 0.5; if (uv.x <= 0.0 || uv.y <= 0.0 || uv.x >= 1.0 || uv.y >= 1.0) continue;
    float dr = length(P - S[i]); vec2 tp = uv * ${SV_TILE}.0 - 0.5; vec2 b = floor(tp), fr = tp - b;
    ivec2 o0 = ivec2(i - (i / 4) * 4, i / 4) * ${SV_TILE}, lo = o0, hi = o0 + ${SV_TILE - 1};
    ivec2 p00 = clamp(o0 + ivec2(b), lo, hi), p11 = clamp(o0 + ivec2(b) + 1, lo, hi);
    float a = mix(occ(At, p00, dr), occ(At, ivec2(p11.x, p00.y), dr), fr.x), c = mix(occ(At, ivec2(p00.x, p11.y), dr), occ(At, p11, dr), fr.x);
    o += mix(a, c, fr.y);
    { float id = texelFetch(At, clamp(o0 + ivec2(floor(tp + 0.5)), lo, hi), 0).r; if (id > 0.0 && 1.0 / id < dr - 0.02) { gD += dr - 1.0 / id; gN += 1.0; } }
  }
  return 1.0 - o / ${SV_N}.0; }
void main(){
  float z = texture2D(Dp, vUv).r; vec4 w = iPV * vec4(vUv * 2.0 - 1.0, z * 2.0 - 1.0, 1.0); vec3 P = w.xyz / w.w;
  vec3 n = normalize(cross(dFdx(P), dFdy(P))); if (dot(n, eye - P) < 0.0) n = -n;
  vec3 Q = P + n * 0.01;
  float v0 = vis(At0, Q), dro = gN > 0.0 ? gD / gN : 0.0;
  // B: the bounce the piece blocks, in the room's own space (STUDY.md §3.3's H, measured on the surface itself, not blurred on
  // the screen): the piece as 12 spheres, each hiding r^2 / d^2 of the cyc's light, by its cosine. It falls off with the distance
  // from the cloth, so it reaches the cove and the floor under and in front of the piece, where V cannot (the key is in front)
  float ao = 0.0; for (int i = 0; i < 12; i++) { vec3 d = AOS[i].xyz - P; float l2 = dot(d, d); ao += max(dot(n, d) * inversesqrt(l2), 0.0) * AOS[i].w * AOS[i].w / l2; }
  vec4 r = vec4(v0, two > 0.5 ? vis(At1, Q) : 1.0, min(ao, 1.0), dro);
  gl_FragColor = wp >= 1.0 ? r : mix(texture2D(Pv, vUv), r, wp);
}`, depthTest: false, depthWrite: false });
// the halo: 1 - V at a quarter of the frame, blurred by a Gaussian of 0.52 m on the back wall (96 px at 1280 x 720)
const svH = [0, 1].map(() => new THREE.WebGLRenderTarget(FW / 4, FH / 4, { ...svOpt, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }));
const svHMat = new THREE.ShaderMaterial({ uniforms: { T: { value: null }, st: { value: new THREE.Vector2() }, sg: { value: 24 }, down: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `#define HP ${SV_HP.toFixed(3)}
#define HW ${SV_HW.toFixed(3)}
uniform sampler2D T; uniform vec2 st; uniform float sg; uniform float down; varying vec2 vUv;
void main(){
  if (down > 0.5) { vec2 a = vec2(0.0); for (int i = 0; i < 4; i++) for (int j = 0; j < 4; j++) { vec4 t = texture2D(T, vUv + (vec2(float(i), float(j)) - 1.5) * st);
      a += (1.0 - t.rg) * min(pow(1.2 / max(t.a, 0.3), HP), HW); }
    gl_FragColor = vec4(a / 16.0, 0.0, 1.0); return; }
  vec2 s = vec2(0.0); float ws = 0.0; int R = int(ceil(3.0 * sg));
  for (int i = -96; i <= 96; i++) { if (i < -R || i > R) continue; float wi = exp(-float(i * i) / (2.0 * sg * sg)); s += wi * texture2D(T, clamp(vUv + float(i) * st, 0.0, 1.0)).rg; ws += wi; }
  gl_FragColor = vec4(s / ws, 0.0, 1.0);
}`, depthTest: false, depthWrite: false });
const svScene = new THREE.Scene(), svQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), svVMat); svScene.add(svQuad);
let svPing = 0, svCount = 0, svKey = '', svMore = false;
window.__svDbg = { svAtlas, svM, svS, renderer };
function svResize(bw, bh) { svDepth.image.width = bw; svDepth.image.height = bh; svV.forEach(r => r.setSize(bw, bh)); svH.forEach(r => r.setSize(Math.ceil(bw / 4), Math.ceil(bh / 4))); svCount = 0; svKey = ''; }
// V and the halo for this frame: cs = [the caster, the next one in a crossfade or null]; after pass A (its depth)
const svBox = new THREE.Box3();
function svAO(c) {   // the piece's world box, filled with 4 rows x 3 columns of spheres (its depth as their radius)
  const A = svVMat.uniforms.AOS.value; if (!c) { A.forEach(v => v.set(0, -50, 0, 0)); return; }
  if (!c.geometry.boundingBox) c.geometry.computeBoundingBox(); svBox.copy(c.geometry.boundingBox).applyMatrix4(c.matrixWorld);
  const mn = svBox.min, mx = svBox.max, w = (mx.x - mn.x) / 3, h = (mx.y - mn.y) / 4, rr = 0.5 * Math.min(w, h) * 1.1;
  for (let i = 0; i < 12; i++) A[i].set(mn.x + w * (i % 3 + 0.5), mn.y + h * (((i / 3) | 0) + 0.5), (mn.z + mx.z) / 2, rr);
}
function svUpdate(cs) {
  const bw = rtA0.width, bh = rtA0.height;
  const keyNow = [cs.map(c => c ? CASTERS.indexOf(c) + ':' + c.rotation.y.toFixed(5) + ':' + c.scale.x.toFixed(6) : '-').join(), Kpos.toArray().map(v => v.toFixed(4)).join(), bw, bh, cam.fov, camOffY].join('|');
  if (keyNow !== svKey) { svKey = keyNow; svCount = 0; }
  const rounds = window.CAPTURE ? SV_ROUNDS : 1;
  for (let k = 0; k < rounds && svCount < SV_ROUNDS; k++) {
    svMaps(cs, svCount);
    cam.updateMatrixWorld(); svVMat.uniforms.iPV.value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).invert(); svVMat.uniforms.eye.value.copy(cam.position);
    svAO(cs[0]); svVMat.uniforms.two.value = cs[1] ? 1 : 0; svVMat.uniforms.Pv.value = svV[svPing].texture; svVMat.uniforms.wp.value = 1 / (svCount + 1);
    svQuad.material = svVMat; renderer.setRenderTarget(svV[1 - svPing]); renderer.render(svScene, compCam); svPing = 1 - svPing; svCount++;
  }
  svMore = !window.CAPTURE && svCount < SV_ROUNDS;   // idle: keep refining while nothing moves
  // the halo is not drawn: the composite no longer uses it (STUDY.md §8.2, wip11: no screen-space halo), and its two
  // 190-tap blurs were a third of a turn's frame on a laptop's GPU (svHMat kept for the study's tools)
  compMat.uniforms.SV.value = svV[svPing].texture; compMat.uniforms.HH.value = svH[0].texture;
}
// for checking (STUDY.md §5 S6): V as a grayscale PNG of the frame (the caster's channel), as a data URL
const svOut = new THREE.WebGLRenderTarget(16, 16, { depthBuffer: false });
const svCopy = new THREE.ShaderMaterial({ uniforms: { T: { value: null }, ch: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: 'uniform sampler2D T; uniform float ch; varying vec2 vUv; void main(){ vec4 t4 = texture2D(T, vUv); float v = ch > 0.5 ? t4.a / 4.0 : t4.r; gl_FragColor = vec4(v, v, v, 1.0); }', depthTest: false, depthWrite: false });
window.__shadowV = (chn) => { svCopy.uniforms.ch.value = chn ? 1 : 0;
  const w = rtA0.width, h = rtA0.height; svOut.setSize(w, h); svCopy.uniforms.T.value = svV[svPing].texture; svQuad.material = svCopy;
  renderer.setRenderTarget(svOut); renderer.render(svScene, compCam); renderer.setRenderTarget(null);
  const px = new Uint8Array(w * h * 4); renderer.readRenderTargetPixels(svOut, 0, 0, w, h, px);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'), im = g.createImageData(w, h);
  for (let y = 0; y < h; y++) im.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
  g.putImageData(im, 0, 0); return cv.toDataURL('image/png');
};
// ---- ?spin=1 (the preview's spin test, 4172652): David: "No dissolve. The hoodie spins". One scroll turns the piece a
// full circle about its vertical axis (half-cosine ease, 3.3 s). At 270 degrees, exactly side-on, it swaps unseen to the
// next piece (both model A), and at 360 the new piece faces front. spin/spin.json: rotation.y = -angle. The turntable
// frames are used only when both pieces' full sets are in; until then a stand-in: the model A caster as a flat grey
// silhouette, turning. At rest the piece is its cut-out.
const TS0 = 0.05, TSD = 2.0;   // the turn starts on the gesture; a full turn in 2 s (David: "too laggy"; were 1.0 and 3.3)
const spinDegU = (u) => 360 * (0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u))));
const SPIN_DIR = '../studio-mock/concepts/room-preview/spin/';
const spinView = (() => {
  if (!SPIN) return null;
  const grey = new THREE.MeshBasicMaterial({ color: '#7d7d82', side: THREE.DoubleSide, transparent: true });
  const stand = PIECES.map(pc => { const f = CASTER_FIT[pc.caster], m = new THREE.Mesh(CASTER_GEO[f.geo], grey);
    m.position.set(f.x, f.y, f.z); m.rotation.order = 'YXZ'; m.scale.set(f.scale * (f.widthFactor ?? 1), f.scale, f.scale);
    m.visible = false; m.renderOrder = 2; overlay.add(m); return m; });
  const fr = { ready: false, cache: new Map(), loading: new Set(), fit: {}, n: 72 };
  fr.load = async () => {
    try { const r = await fetch(SPIN_DIR + 'spin.json'); if (!r.ok) return; fr.meta = await r.json(); } catch (e) { return; }
    fr.n = fr.meta.frames?.count ?? 72;
    fr.full = {};   // the pieces with a full set (a pair spins only when both have one)
    for (const pc of PIECES) { if (fr.full[pc.caster] !== undefined) continue; let ok = true;
      for (const i of [0, Math.round(fr.n / 4), Math.round(fr.n / 2), fr.n - 1]) {
        const r = await fetch(`${SPIN_DIR}${pc.caster}/f${String(i).padStart(3, '0')}.webp`, { method: 'HEAD' }).catch(() => null); if (!r || !r.ok) { ok = false; break; } }
      fr.full[pc.caster] = ok; }
    if (!Object.values(fr.full).some(Boolean)) return;
    const bbox = (img) => { const cv = document.createElement('canvas'); const w = 256, h = Math.round(256 * img.height / img.width); cv.width = w; cv.height = h;
      const g2 = cv.getContext('2d'); g2.drawImage(img, 0, 0, w, h); const d = g2.getImageData(0, 0, w, h).data; let x0 = w, x1 = 0, y0 = h, y1 = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 127) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      return [x0 / w, x1 / w, y0 / h, y1 / h, img.width / img.height]; };
    for (const pc of PIECES) {   // frame 0's silhouette fitted onto the cut-out's (the preview's fit)
      if (!fr.full[pc.caster] || fr.fit[pc.caster]) continue;
      const a = new Image(); a.src = pc.img; await a.decode(); const b = new Image(); b.src = `${SPIN_DIR}${pc.caster}/f000.webp`; await b.decode();
      const A = bbox(a), B = bbox(b);
      const cw = GH * pc.aspect, wx0 = -cw / 2 + A[0] * cw, wy0 = 1.62 + GH / 2 - A[2] * GH, wy1 = 1.62 + GH / 2 - A[3] * GH;
      const ph = (wy0 - wy1) / (B[3] - B[2]), pw = ph * B[4];
      fr.fit[pc.caster] = { w: pw, h: ph, x: (wx0 - B[0] * pw) + pw / 2, y: (wy0 + B[2] * ph) - ph / 2, B, box: [wx0, wx0 + (A[1] - A[0]) * cw, wy0, wy1] };
    }
    fr.mat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, uniforms: { A: { value: null }, B: { value: null }, f: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D A; uniform sampler2D B; uniform float f; varying vec2 vUv;
void main(){ vec4 a = texture2D(A, vUv), b = texture2D(B, vUv); float al = mix(a.a, b.a, f);
  vec3 rgb = mix(a.rgb * a.a, b.rgb * b.a, f) / max(al, 1e-4); if (al < 0.01) discard; gl_FragColor = vec4(rgb, al);
  #include <colorspace_fragment>
}` });
    fr.plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fr.mat); fr.plane.position.z = 0.9; fr.plane.visible = false; fr.plane.renderOrder = 2; overlay.add(fr.plane);
    // C: the new frame on its plane, the old one sampled at the same world point through its own plane, one opaque pass
    fr.cMat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, uniforms: { T: { value: null }, T2: { value: null }, Tb: { value: null }, T2b: { value: null }, ff: { value: 0 }, m2: { value: new THREE.Vector4() }, p: { value: 0 } },
      vertexShader: 'varying vec2 vUv; varying vec2 vW; void main(){ vUv = uv; vW = (modelMatrix * vec4(position, 1.0)).xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D T; uniform sampler2D T2; uniform sampler2D Tb; uniform sampler2D T2b; uniform float ff; uniform vec4 m2; uniform float p; varying vec2 vUv; varying vec2 vW;
vec4 pm(vec4 a, vec4 b, float f){ return vec4(mix(a.rgb * a.a, b.rgb * b.a, f), mix(a.a, b.a, f)); }   // two neighbouring frames, premultiplied
float h(vec2 c){ return fract(sin(dot(c, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){ vec4 tx = pm(texture2D(T, vUv), texture2D(Tb, vUv), ff); vec2 u2 = (vW - m2.xy) / m2.zw + 0.5; vec2 uc = clamp(u2, 0.0, 1.0);
  vec4 o2 = pm(texture2D(T2, uc), texture2D(T2b, uc), ff), o = (u2.x < 0.0 || u2.x > 1.0 || u2.y < 0.0 || u2.y > 1.0) ? vec4(0.0) : o2;   // sampled first (see tap)
  vec4 c = mix(o, tx, p); if (c.a < 0.01) discard; gl_FragColor = vec4(c.rgb / c.a, c.a);   // premultiplied all through: no halo
  #include <colorspace_fragment>
}` });
    fr.cPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fr.cMat); fr.cPlane.position.z = 0.9; fr.cPlane.visible = false; fr.cPlane.renderOrder = 2; overlay.add(fr.cPlane);
    fr.ready = true;
    if (window.CAPTURE) {   // a capture never waits on a frame: every full set loaded before the clock starts
      const L = new THREE.TextureLoader(), jobs = [];
      for (const id of Object.keys(fr.full).filter(k => fr.full[k])) for (let i = 0; i < fr.n; i++)
        jobs.push(L.loadAsync(`${SPIN_DIR}${id}/f${String(i).padStart(3, '0')}.webp`).then(tx => { tx.colorSpace = THREE.SRGBColorSpace; fr.cache.set(id + i, tx); }));
      await Promise.all(jobs);
    }
    window.__spinFull = fr.full;
  };
  fr.get = (id, i) => {   // a turntable frame's texture, loaded on first ask (null until it is in)
    const key = id + i; if (fr.cache.has(key)) return fr.cache.get(key);
    if (!fr.loading.has(key)) { fr.loading.add(key); new THREE.TextureLoader().loadAsync(`${SPIN_DIR}${id}/f${String(i).padStart(3, '0')}.webp`).then(t => {
      t.colorSpace = THREE.SRGBColorSpace; fr.cache.set(key, t); fr.loading.delete(key); idleDirty = true; }); }
    return null;
  };
  return { stand, fr };
})();
if (spinView) await spinView.fr.load();
// show the turning piece i at deg (signed: + turns the wearer's left toward the camera first, as spin.json; scrolling up turns back)
function showSpin(i, deg, j = -1, s = 0) {   // j, s: the next piece and the C fade's progress (0 to 1) while it turns
  // as the preview (487d217): facing front (within 0.01 degrees) the piece is its own cut-out; turning, its frames
  const sv = spinView, turning = Math.abs(deg) >= 0.01 && Math.abs(deg) <= 359.99;
  dis.visible = !turning; dMat.uniforms.op.value = 1; sv.stand.forEach(m => { m.visible = false; m.material.opacity = 1; });
  if (sv.fr.plane) sv.fr.plane.visible = false; if (sv.fr.cPlane) sv.fr.cPlane.visible = false;
  if (!turning) return;
  const a = ((deg % 360) + 360) % 360, fr = sv.fr;
  if (fr.ready && j >= 0 && s > 0 && s < 1) {   // C, as the preview (345a105): the two neighbouring 5-degree frames crossfaded, outlines on one box
    // David: a smoother turn: the two neighbouring 5-degree frames crossfaded by the angle between them (was the nearest)
    const io = PIECES[i].caster, inw = PIECES[j].caster, u = a / (360 / fr.n), k = Math.floor(u) % fr.n, k2 = (k + 1) % fr.n, ff = u - Math.floor(u);
    const To = fr.get(io, k), Tn = fr.get(inw, k), To2 = fr.get(io, k2) || To, Tn2 = fr.get(inw, k2) || Tn;
    if (To && Tn) {
      const fo = fr.fit[io], fn = fr.fit[inw], bx = [0, 1, 2, 3].map(q => fo.box[q] + (fn.box[q] - fo.box[q]) * s);
      const onto = (f) => { const ph = (bx[2] - bx[3]) / (f.B[3] - f.B[2]), pw = ph * f.B[4]; return { w: pw, h: ph, x: bx[0] - f.B[0] * pw + pw / 2, y: bx[2] + f.B[2] * ph - ph / 2 }; };
      const po = onto(fo), pn = onto(fn);
      fr.cMat.uniforms.T.value = Tn; fr.cMat.uniforms.T2.value = To; fr.cMat.uniforms.Tb.value = Tn2; fr.cMat.uniforms.T2b.value = To2; fr.cMat.uniforms.ff.value = ff; fr.cMat.uniforms.m2.value.set(po.x, po.y, po.w, po.h); fr.cMat.uniforms.p.value = s;
      fr.cPlane.scale.set(pn.w, pn.h, 1); fr.cPlane.position.set(pn.x, pn.y, 0.9); fr.cPlane.visible = true; return;
    }
  }
  const id = PIECES[s >= 1 && j >= 0 ? j : i].caster;
  if (fr.ready && fr.full[id]) {
    const u = a / (360 / fr.n), k = Math.floor(u) % fr.n, A = fr.get(id, k), B = fr.get(id, (k + 1) % fr.n);
    if (A) { const f = fr.fit[id]; fr.mat.uniforms.A.value = A; fr.mat.uniforms.B.value = B || A; fr.mat.uniforms.f.value = B ? u - Math.floor(u) : 0;
      fr.plane.scale.set(f.w, f.h, 1); fr.plane.position.set(f.x, f.y, 0.9); fr.plane.visible = true; return; }
  }
  const m = sv.stand[PIECES.indexOf(PIECES[s >= 1 && j >= 0 ? j : i])]; m.rotation.y = -THREE.MathUtils.degToRad(deg); m.visible = true;
}

// ---- specs: carved into the cove, v2 (David's pick), ported from the preview's `carve` exactly (2a789a0) ----
// The specs, CARVED into the rounded corner where the back wall turns into the floor, under the piece (David: "Give it
// depth", "It's flat", "make it 3d"). An inscription cut into the cove itself: the room's own material, its own curve,
// lit by the room's own lights (main spot, key, hemisphere). Each letter is a cut about 2 cm deep with near-vertical
// walls and a softened rim. Its floor sits below the surface (the view ray marches into the relief), the walls take
// their light from their own slope, the rims throw shadows from the room's lights into the cut (the key, from the
// upper left, darkens the left and upper walls) and the cavity sees less of the sky.
// How it stays true across the mirror: the cut is rendered from the real camera into a small, 3x supersampled window
// around the lines, twice (surface uncut, surface cut). Their difference is the carving, with the real lighting, and
// the composite adds it to both halves after the flip, so the letters read the right way and the light on the cuts
// is the same either side of x = 640.
const SPEC_LINES = ['28-GAUGE DOUBLE JACQUARD', '300 GSM', '30S COMBED COTTON', 'BLACK / CREAM', 'SIZE  S · M · L · XL · XXL'];
const SPEC_Y = [532, 557, 582, 607, 632];   // screen rows at 1280x720, from David's red lines
const covePt = (x, th, off) => new THREE.Vector3(x, COVE - COVE * Math.cos(th) + off * Math.cos(th), COVE - COVE * Math.sin(th) + off * Math.sin(th));
const screenY = (th) => { const v = covePt(0, th, 0).project(refCam); return (1 - v.y) / 2 * H0; };
const thAt = (Y) => { let lo = 0.02, hi = 1.55; for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (screenY(m) > Y) lo = m; else hi = m; } return (lo + hi) / 2; };
const TA = thAt(668), TB = thAt(506), XS = 0.56, PXM = 2600;   // arc range (rad, 0 = floor, pi/2 = wall), texels per metre, half width (m)
const ARC = COVE * (TB - TA), CUT_D = 0.022, CUT_RIM = 0.0006;   // arc length of the patch; depth of the cut and the width of its rounded rim (m)
let ER = { x: 430, y: 500, w: 420, h: 170, ss: 3 };   // the window rendered for the carving, screen px at 1280x720
// a piece's spec lines as the cut's height map (each piece carries its own: PIECES[i].specs); the letter size is
// always the approved one, set by the first default line
// the site's faces (the piece pages': Cormorant Garamond and Jost, index.html loads them): the carved specs are cut in
// Jost, so the room's writing matches the pages'; nothing is drawn before the faces are in (DejaVu if they never come)
const SPEC_FONT = '"Jost", "DejaVu Sans"';
// the carved specs read against the wall (QA H3, "Cant read that": the lower lines were 2.5-3.6:1): the cut and its
// shading as approved; the letters' own face inside the cut is darker (SPEC_FACE)
const SPEC_INK = 1;   // the approved carve's shading, as printed (H3b: scaling it made hollow, aliased letters)
const SPEC_FACE = 0.3;   // the letters' face inside the cut, darkened to this share of its light: solid, readable letters (QA H3)
try { await Promise.race([Promise.all([document.fonts.load('300 100px Jost'), document.fonts.load('500 100px "Cormorant Garamond"'), document.fonts.load('400 100px "Cormorant Garamond"'), document.fonts.load('100px "DejaVu Serif"'), document.fonts.load('100px "DejaVu Sans"')]), new Promise(r => setTimeout(r, 4000))]); await document.fonts.ready; } catch (e) {}
function specHMap(LINES, DY = 0) {   // DY: the rows moved down by this many preview px (a piece whose hem sits lower)
  const cw = Math.round(2 * XS * PXM), ch = Math.round(ARC * PXM);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d', { willReadFrequently: true });
  // size: the first line as wide on screen as it was on the wall (9.5px DejaVu Sans, .16em spacing: 182px)
  const th0 = thAt(SPEC_Y[0]), p0 = covePt(0, th0, 0), d0 = Math.hypot(5.4 - p0.z, 1.45 - p0.y), f = (H0 / 2) / Math.tan(THREE.MathUtils.degToRad(refCam.fov / 2));
  const setFont = (fs) => { g.font = fs + 'px ' + SPEC_FONT; g.letterSpacing = (0.16 * fs) + 'px'; };
  setFont(100); const w100 = g.measureText(SPEC_LINES[0]).width;
  const fs = 100 * (182 / (f / d0)) * PXM / w100; setFont(fs);
  g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  // the strokes as DejaVu Sans draws them: no widening
  LINES.forEach((t, i) => {
    // rows follow the arc: each line is placed where the cove crosses its screen row, so the spacing foreshortens
    const row = (TB - thAt(SPEC_Y[i] + DY)) / (TB - TA) * ch, x = cw / 2 + 0.08 * fs;
    g.fillText(t, x, row);
  });
  // the profile: depth grows with the distance from the rim (an exact distance transform), to the floor of the cut
  const im = g.getImageData(0, 0, cw, ch), D = im.data, n = cw * ch, INF = 1e12;
  const f2 = new Float64Array(n);
  for (let i = 0; i < n; i++) f2[i] = D[i * 4] > 127 ? INF : 0;   // distance to the nearest uncut texel
  const edt1 = (get, set, len, buf, v, z, dd) => {
    for (let q = 0; q < len; q++) buf[q] = get(q);
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < len; q++) { let s; do { const r = v[k]; s = ((buf[q] + q * q) - (buf[r] + r * r)) / (2 * q - 2 * r); if (s <= z[k]) k--; else break; } while (k >= 0);
      k++; v[k] = q; z[k] = s; z[k + 1] = INF; }
    k = 0; for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; const r = v[k]; dd[q] = (q - r) * (q - r) + buf[r]; }
    for (let q = 0; q < len; q++) set(q, dd[q]);
  };
  const L = Math.max(cw, ch), buf = new Float64Array(L), vv = new Int32Array(L), zz = new Float64Array(L + 1), dd = new Float64Array(L);
  for (let x = 0; x < cw; x++) edt1(q => f2[q * cw + x], (q, val) => { f2[q * cw + x] = val; }, ch, buf, vv, zz, dd);
  for (let y = 0; y < ch; y++) edt1(q => f2[y * cw + q], (q, val) => { f2[y * cw + q] = val; }, cw, buf, vv, zz, dd);
  const half = CUT_RIM * PXM;   // the rim of the cut: from the surface down to the floor over 0.6 mm, near vertical
  const hd = new Uint8Array(n);
  for (let i = 0; i < n; i++) { const d = Math.sqrt(f2[i]); const u = Math.min(1, d / half); hd[i] = Math.round(255 * u * u * (3 - 2 * u)); }
  const tex = new THREE.DataTexture(hd, cw, ch, THREE.RedFormat, THREE.UnsignedByteType);
  tex.flipY = false; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = true;
  tex.anisotropy = 16; tex.needsUpdate = true;
  return tex;
}
const carve = (() => {
  const cw = Math.round(2 * XS * PXM), ch = Math.round(ARC * PXM);
  const tex = specHMap(SPEC_LINES);
  // canvas row 0 is the top line (toward the wall, theta TB): v runs from TB at 0 down to TA at 1
  // the patch: the cove's own surface, dense along the arc so the curve is exact
  const NX = 64, NT = 96, pos = [], uv = [], nrm = [], idx = [];
  for (let j = 0; j <= NT; j++) for (let i = 0; i <= NX; i++) {
    const x = -XS + 2 * XS * i / NX, th = TB - (TB - TA) * j / NT, p = covePt(x, th, 0);
    pos.push(p.x, p.y, p.z); uv.push(i / NX, j / NT); nrm.push(0, Math.cos(th), Math.sin(th));
  }
  for (let j = 0; j < NT; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, e = c + 1; idx.push(a, c, e, a, e, b); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); geo.setIndex(idx);
  // the room's own material, with the relief cut into it
  const mat = new THREE.MeshStandardMaterial({ color: '#e3e3e5', roughness: 0.93 });
  const U = { pxV: { value: new THREE.Vector2((TB - thAt(SPEC_Y[0])) / (TB - TA), (TB - thAt(SPEC_Y[4])) / (TB - TA)) }, pxK: { value: 0.2 }, hMap: { value: tex }, cutD: { value: 0 }, mPerUv: { value: new THREE.Vector2(2 * XS, ARC) }, texel: { value: new THREE.Vector2(1 / cw, 1 / ch) } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vCu; varying vec3 vTv; varying vec3 vBv;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vCu = uv; vTv = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
        vBv = normalize(normalMatrix * vec3(0.0, -objectNormal.z, objectNormal.y));`);   // down the arc, toward the floor: +v
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec2 vCu; varying vec3 vTv; varying vec3 vBv;
      uniform sampler2D hMap; uniform float cutD; uniform float pxK; uniform vec2 pxV; uniform vec2 mPerUv; uniform vec2 texel;
      vec2 cUv; vec3 cT, cB, cN; float cH;
      float hgt(vec2 u){ return texture2D(hMap, u).r; }
      // depth below the surface (m) at a uv
      float dep(vec2 u){ return cutD * hgt(u); }
      // a light's rays into the cut: march from the point toward the light; if the uncut rim stands above the ray, it is in shade
      float skyVis(){
        float d0 = dep(cUv); if (d0 < 1e-5) return 1.0;
        float vis = 0.0;
        for (int k = 0; k < 8; k++) {
          float ph = 6.2831853 * (float(k) + 0.5) / 8.0; vec2 dir = vec2(cos(ph), sin(ph));
          float t2 = 0.0;   // tan^2 of the highest rim's elevation
          for (int i = 1; i <= 12; i++) { float r = 0.012 * float(i) / 12.0; float rise = d0 - dep(cUv + dir * r / mPerUv);
            if (rise > 0.0) t2 = max(t2, (rise * rise) / (r * r)); }
          vis += 1.0 / (1.0 + t2);
        }
        return vis / 8.0;
      }
      float relShadow(vec3 L){
        if (cutD <= 0.0) return 1.0;
        vec3 l = vec3(dot(L, cT), dot(L, cB), dot(L, cN)); if (l.z <= 0.0) return 1.0;
        float d0 = dep(cUv); if (d0 < 1e-5) return 1.0;
        float s = d0 / l.z; vec2 stepUv = l.xy * s / mPerUv / 12.0; float sh = 1.0;
        for (int i = 1; i <= 12; i++) { float fi = float(i) / 12.0; float dr = d0 * (1.0 - fi); float ds = dep(cUv + stepUv * float(i));
          sh = min(sh, clamp(1.0 - (dr - ds) / (0.05 * cutD), 0.0, 1.0)); }
        return sh;
      }`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
      {
        cN = normalize(normal); cT = normalize(vTv - dot(vTv, cN) * cN); cB = normalize(cross(cT, cN));   // cB: down the arc, +v
        vec3 V = normalize(vViewPosition);
        vec3 vt = vec3(dot(V, cT), dot(V, cB), dot(V, cN));
        cUv = vCu;
        if (cutD > 0.0) {
          // the floor of the cut sits below the surface: march the view ray into the relief (parallax occlusion).
          // The march is short (pxK) and eases out toward the floor-facing bottom line, where the cove turns away and a
          // full-depth march would hide whole horizontal strokes behind their lower rims at 100%.
          vec2 dirUv = -vt.xy / max(vt.z, 0.2) / mPerUv * pxK * (1.0 - smoothstep(pxV.x, pxV.y, vCu.y)); float dPrev = 0.0, hPrev = 0.0; vec2 uPrev = vCu;
          for (int i = 1; i <= 64; i++) { float d = cutD * float(i) / 64.0; vec2 u = vCu + dirUv * d; float hs = dep(u);
            if (d >= hs) { float a = (hPrev - dPrev) / ((hPrev - dPrev) - (hs - d)); cUv = mix(uPrev, u, clamp(a, 0.0, 1.0)); break; }
            dPrev = d; hPrev = hs; uPrev = u; }
          // facet normals from the cut's slope, sampled at the screen footprint
          vec2 fw = max(fwidth(cUv), texel);
          vec2 e = vec2(max(fw.x, texel.x), 0.0), e2 = vec2(0.0, max(fw.y, texel.y));
          float gx = (dep(cUv + e) - dep(cUv - e)) / (2.0 * e.x * mPerUv.x), gy = (dep(cUv + e2) - dep(cUv - e2)) / (2.0 * e2.y * mPerUv.y);
          normal = normalize(cN * 1.0 + cT * gx + cB * gy);
        }
        cH = hgt(cUv);
      }`)
      .replace(/RE_Direct\( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight \);/g,
        'directLight.color *= relShadow(directLight.direction); RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );')
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        // the hemisphere light reaches into the cut only through the opening: its real occlusion, from the cut's own
        // geometry. For 8 directions around the point, march the relief to find the highest rim (its elevation a); a
        // cosine-weighted sky above elevation a is cos^2(a) of the whole, so the visible share is the mean of cos^2(a)
        if (cutD > 0.0) reflectedLight.indirectDiffuse *= skyVis();
        // the letters' own face darkened inside the cut (QA H3, then H3b): solid, dark, cut letters that read, with the
        // approved cut and its shading as they were; it deepens with the cut, so it comes and goes with the carving
        if (cutD > 0.0) { float ink = mix(1.0, ${SPEC_FACE.toFixed(3)}, smoothstep(0.15, 0.6, cH) * min(1.0, cutD / ${CUT_D.toFixed(4)}));
          reflectedLight.directDiffuse *= ink; reflectedLight.indirectDiffuse *= ink; reflectedLight.directSpecular *= ink; }`);
  };
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.visible = false; scene.add(m);
  const rtOpt = { type: THREE.HalfFloatType, samples: TOUCH ? 0 : 4 };
  const rt0 = new THREE.WebGLRenderTarget(ER.w * ER.ss, ER.h * ER.ss, rtOpt), rt1 = new THREE.WebGLRenderTarget(ER.w * ER.ss, ER.h * ER.ss, rtOpt);
  const camE = refCam.clone(); camE.setViewOffset(FW * ER.ss, FH * ER.ss, ER.x * ER.ss, ER.y * ER.ss, ER.w * ER.ss, ER.h * ER.ss);
  return { mesh: m, U, rt0, rt1, camE, room: null };
})();
function makeCarve(LINES, ROWS_, P) {   // the specs' carve, reused for the intro's lines (same cut, same light)
  const cw = Math.round(P.w * P.pxm), ch = Math.round(P.h * P.pxm);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d', { willReadFrequently: true });
  const setFont = (fs) => { g.font = (P.weight ? P.weight + ' ' : '') + fs + 'px ' + P.font; g.letterSpacing = (0.16 * fs) + 'px'; };
  const fs = P.capM * P.pxm; setFont(fs);
  const order = new Float32Array(cw * ch);   // the write order of each texel: line by line, left to right (0 to 1)
  g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  // the strokes as DejaVu Sans draws them: no widening
  LINES.forEach((t, i) => {
    const row = ROWS_[i] * ch, x = cw / 2 + 0.08 * fs; g.fillText(t, x, row);
    const w = g.measureText(t).width, x0 = x - w / 2, x1 = x + w / 2, y0 = Math.max(0, Math.floor(row - fs)), y1 = Math.min(ch, Math.ceil(row + fs));
    for (let y = y0; y < y1; y++) for (let xx = Math.max(0, Math.floor(x0)); xx < Math.min(cw, Math.ceil(x1)); xx++) order[y * cw + xx] = (i + (xx - x0) / (x1 - x0)) / LINES.length;
  });
  // the profile: depth grows with the distance from the rim (an exact distance transform), to the floor of the cut
  const im = g.getImageData(0, 0, cw, ch), D = im.data, n = cw * ch, INF = 1e12;
  const f2 = new Float64Array(n);
  for (let i = 0; i < n; i++) f2[i] = D[i * 4] > 127 ? INF : 0;   // distance to the nearest uncut texel
  const edt1 = (get, set, len, buf, v, z, dd) => {
    for (let q = 0; q < len; q++) buf[q] = get(q);
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < len; q++) { let s; do { const r = v[k]; s = ((buf[q] + q * q) - (buf[r] + r * r)) / (2 * q - 2 * r); if (s <= z[k]) k--; else break; } while (k >= 0);
      k++; v[k] = q; z[k] = s; z[k + 1] = INF; }
    k = 0; for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; const r = v[k]; dd[q] = (q - r) * (q - r) + buf[r]; }
    for (let q = 0; q < len; q++) set(q, dd[q]);
  };
  const L = Math.max(cw, ch), buf = new Float64Array(L), vv = new Int32Array(L), zz = new Float64Array(L + 1), dd = new Float64Array(L);
  for (let x = 0; x < cw; x++) edt1(q => f2[q * cw + x], (q, val) => { f2[q * cw + x] = val; }, ch, buf, vv, zz, dd);
  for (let y = 0; y < ch; y++) edt1(q => f2[y * cw + q], (q, val) => { f2[y * cw + q] = val; }, cw, buf, vv, zz, dd);
  const half = CUT_RIM * P.pxm;   // the rim of the cut: from the surface down to the floor over 0.6 mm, near vertical
  const hd = new Uint8Array(n);
  for (let i = 0; i < n; i++) { const d = Math.sqrt(f2[i]); const u = Math.min(1, d / half); hd[i] = Math.round(255 * u * u * (3 - 2 * u)); }
  const tex = new THREE.DataTexture(hd, cw, ch, THREE.RedFormat, THREE.UnsignedByteType);
  tex.flipY = false; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = true;
  tex.anisotropy = 16; tex.needsUpdate = true;
  // canvas row 0 is the top line (toward the wall, theta TB): v runs from TB at 0 down to TA at 1
  // the patch: the cove's own surface, dense along the arc so the curve is exact
  const NX = 64, NT = 96, pos = [], uv = [], nrm = [], idx = [];
  for (let j = 0; j <= NT; j++) for (let i = 0; i <= NX; i++) { const [p, nn] = P.at(i / NX, j / NT); pos.push(p.x, p.y, p.z); uv.push(i / NX, j / NT); nrm.push(nn[0], nn[1], nn[2]); }
  for (let j = 0; j < NT; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, e = c + 1; idx.push(a, c, e, a, e, b); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); geo.setIndex(idx);
  // the room's own material, with the relief cut into it
  const mat = new THREE.MeshStandardMaterial({ color: '#e3e3e5', roughness: 0.93 });
  const wTex = new THREE.DataTexture(new Uint8Array(Array.from(order, v => Math.round(v * 255))), cw, ch, THREE.RedFormat, THREE.UnsignedByteType);
  wTex.flipY = false; wTex.minFilter = THREE.NearestFilter; wTex.magFilter = THREE.NearestFilter; wTex.needsUpdate = true;
  if (P.texOnly) return { tex, wTex };   // another piece's lines for an existing carve (its hMap swapped in)
  const U = { pxV: { value: P.pxV || new THREE.Vector2(2, 3) }, pxK: { value: 0.2 }, hMap: { value: tex }, wMap: { value: wTex }, wr: { value: 1 }, cutD: { value: 0 }, mPerUv: { value: new THREE.Vector2(P.w, P.h) }, texel: { value: new THREE.Vector2(1 / cw, 1 / ch) } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vCu; varying vec3 vTv; varying vec3 vBv;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vCu = uv; vTv = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
        vBv = normalize(normalMatrix * vec3(0.0, -objectNormal.z, objectNormal.y));`);   // down the arc, toward the floor: +v
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec2 vCu; varying vec3 vTv; varying vec3 vBv;
      uniform sampler2D hMap; uniform sampler2D wMap; uniform float wr; uniform float cutD; uniform float pxK; uniform vec2 pxV; uniform vec2 mPerUv; uniform vec2 texel;
      vec2 cUv; vec3 cT, cB, cN; float cH;
      float hgt(vec2 u){ return texture2D(hMap, u).r; }
      // depth below the surface (m) at a uv
      float dep(vec2 u){ return cutD * hgt(u) * clamp((wr - texture2D(wMap, u).r) * 60.0, 0.0, 1.0); }   // cut only as far as it is written
      // a light's rays into the cut: march from the point toward the light; if the uncut rim stands above the ray, it is in shade
      float skyVis(){
        float d0 = dep(cUv); if (d0 < 1e-5) return 1.0;
        float vis = 0.0;
        for (int k = 0; k < 8; k++) {
          float ph = 6.2831853 * (float(k) + 0.5) / 8.0; vec2 dir = vec2(cos(ph), sin(ph));
          float t2 = 0.0;   // tan^2 of the highest rim's elevation
          for (int i = 1; i <= 12; i++) { float r = 0.012 * float(i) / 12.0; float rise = d0 - dep(cUv + dir * r / mPerUv);
            if (rise > 0.0) t2 = max(t2, (rise * rise) / (r * r)); }
          vis += 1.0 / (1.0 + t2);
        }
        return vis / 8.0;
      }
      float relShadow(vec3 L){
        if (cutD <= 0.0) return 1.0;
        vec3 l = vec3(dot(L, cT), dot(L, cB), dot(L, cN)); if (l.z <= 0.0) return 1.0;
        float d0 = dep(cUv); if (d0 < 1e-5) return 1.0;
        float s = d0 / l.z; vec2 stepUv = l.xy * s / mPerUv / 12.0; float sh = 1.0;
        for (int i = 1; i <= 12; i++) { float fi = float(i) / 12.0; float dr = d0 * (1.0 - fi); float ds = dep(cUv + stepUv * float(i));
          sh = min(sh, clamp(1.0 - (dr - ds) / (0.05 * cutD), 0.0, 1.0)); }
        return sh;
      }`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
      {
        cN = normalize(normal); cT = normalize(vTv - dot(vTv, cN) * cN); cB = normalize(cross(cT, cN));   // cB: down the arc, +v
        vec3 V = normalize(vViewPosition);
        vec3 vt = vec3(dot(V, cT), dot(V, cB), dot(V, cN));
        cUv = vCu;
        if (cutD > 0.0) {
          // the floor of the cut sits below the surface: march the view ray into the relief (parallax occlusion).
          // The march is short (pxK) and eases out toward the floor-facing bottom line, where the cove turns away and a
          // full-depth march would hide whole horizontal strokes behind their lower rims at 100%.
          vec2 dirUv = -vt.xy / max(vt.z, 0.2) / mPerUv * pxK * (1.0 - smoothstep(pxV.x, pxV.y, vCu.y)); float dPrev = 0.0, hPrev = 0.0; vec2 uPrev = vCu;
          for (int i = 1; i <= 64; i++) { float d = cutD * float(i) / 64.0; vec2 u = vCu + dirUv * d; float hs = dep(u);
            if (d >= hs) { float a = (hPrev - dPrev) / ((hPrev - dPrev) - (hs - d)); cUv = mix(uPrev, u, clamp(a, 0.0, 1.0)); break; }
            dPrev = d; hPrev = hs; uPrev = u; }
          // facet normals from the cut's slope, sampled at the screen footprint
          vec2 fw = max(fwidth(cUv), texel);
          vec2 e = vec2(max(fw.x, texel.x), 0.0), e2 = vec2(0.0, max(fw.y, texel.y));
          float gx = (dep(cUv + e) - dep(cUv - e)) / (2.0 * e.x * mPerUv.x), gy = (dep(cUv + e2) - dep(cUv - e2)) / (2.0 * e2.y * mPerUv.y);
          normal = normalize(cN * 1.0 + cT * gx + cB * gy);
        }
        cH = hgt(cUv);
      }`)
      .replace(/RE_Direct\( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight \);/g,
        'directLight.color *= relShadow(directLight.direction); RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );')
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        // the hemisphere light reaches into the cut only through the opening: its real occlusion, from the cut's own
        // geometry. For 8 directions around the point, march the relief to find the highest rim (its elevation a); a
        // cosine-weighted sky above elevation a is cos^2(a) of the whole, so the visible share is the mean of cos^2(a)
        if (cutD > 0.0) reflectedLight.indirectDiffuse *= skyVis();
        // the letters' own face darkened inside the cut (QA H3, then H3b): solid, dark, cut letters that read, with the
        // approved cut and its shading as they were; it deepens with the cut, so it comes and goes with the carving
        if (cutD > 0.0) { float ink = mix(1.0, ${SPEC_FACE.toFixed(3)}, smoothstep(0.15, 0.6, cH) * min(1.0, cutD / ${CUT_D.toFixed(4)}));
          reflectedLight.directDiffuse *= ink; reflectedLight.indirectDiffuse *= ink; reflectedLight.directSpecular *= ink; }`);
  };
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.visible = false; scene.add(m);
  const rtOpt = { type: THREE.HalfFloatType, samples: TOUCH ? 0 : 4 };
  const rt0 = new THREE.WebGLRenderTarget(16, 16, rtOpt), rt1 = new THREE.WebGLRenderTarget(16, 16, rtOpt);
  return { mesh: m, U, rt0, rt1, camE: cam.clone(), ER: { x: 0, y: 0, w: 1, h: 1, ss: 3 }, corners: P.corners };
}
Object.assign(compMat.uniforms, { E0: { value: carve.rt0.texture }, E1: { value: carve.rt1.texture }, eR: { value: new THREE.Vector4(ER.x, ER.y, ER.w, ER.h) }, eSS: { value: ER.ss }, eK: { value: 1 } });
// ---- the specs on a phone: the same five lines and the same v2 cut on the cove under the hem, 1.15x the desktop's letters
// in Jost 300, the rows 25 apart (David: "Make this engraved writing smaller and more delicate"; they were 1.6x, 33 apart,
// at 400); the desktop keeps the approved carve above. Built on first phone layout.
const SPEC_Y_PH = [540, 574, 608, 642, 676];   // rows in the preview's frame (as SPEC_Y), the first as before, clear of the hem; 31 apart for the larger letters (David: "Make these larger")
const specFontM = (() => {   // the desktop specs' font size in metres, as the carve computes it
  const g = document.createElement('canvas').getContext('2d'); g.font = '100px ' + SPEC_FONT; g.letterSpacing = '16px';
  const w100 = g.measureText(SPEC_LINES[0]).width, th0 = thAt(SPEC_Y[0]), p0 = covePt(0, th0, 0);
  const d0 = Math.hypot(5.4 - p0.z, 1.45 - p0.y), f = (H0 / 2) / Math.tan(THREE.MathUtils.degToRad(refCam.fov / 2));
  return 100 * (182 / (f / d0)) / w100;
})();
let carvePh = null, phP = null, phRows = null, phVOf = null;
function phoneSpecs() {
  if (carvePh) return carvePh;
  const TA2 = thAt(734), TB2 = thAt(520), XS2 = 1.35, vOf = (Y) => (TB2 - thAt(Y)) / (TB2 - TA2), corners = [];
  for (const sx of [-1, 1]) for (let k = 0; k <= 16; k++) { const p = covePt(sx * XS2, TA2 + (TB2 - TA2) * k / 16, 0); corners.push([p.x, p.y, p.z]); }
  phRows = SPEC_Y_PH.map(vOf); phVOf = vOf;
  phP = { w: 2 * XS2, h: COVE * (TB2 - TA2), pxm: 2600, capM: 1.85 * specFontM, font: SPEC_FONT, weight: 300,
    pxV: new THREE.Vector2(vOf(SPEC_Y_PH[0]), vOf(SPEC_Y_PH[4])),
    at: (u, v) => { const th = TB2 - (TB2 - TA2) * v; return [covePt(-XS2 + 2 * XS2 * u, th, 0), [0, Math.cos(th), Math.sin(th)]]; }, corners };
  carvePh = makeCarve(SPEC_LINES, phRows, phP);
  carvePh.U.wr.value = 1.02;   // fully cut (the write order only animates the intro's lines)
  return carvePh;
}
// each piece's own spec lines (PIECES[i].specs, the approved SPEC_LINES when it has none), as height maps for the carve
// in use, built once per set of lines and swapped in where the cut depth is 0 (at a switch it goes to 0 and back)
const SPEC_TEX = { desk: new Map(), phone: new Map() };
function specTexFor(pc) {
  const lines = pc.specs || SPEC_LINES, dy = phone ? 0 : (pc.specDy || 0), key = lines.join('|') + '@' + dy, base = SPEC_LINES.join('|') + '@0';
  if (!phone) { if (!SPEC_TEX.desk.has(key)) SPEC_TEX.desk.set(key, key === base ? carve.U.hMap.value : specHMap(lines, dy)); return SPEC_TEX.desk.get(key); }
  phoneSpecs();
  if (!SPEC_TEX.phone.has(key)) SPEC_TEX.phone.set(key, key === base ? carvePh.U.hMap.value : makeCarve(lines, phRows, { ...phP, texOnly: true }).tex);   // a phone keeps its own rows (specDy is the desktop's)
  return SPEC_TEX.phone.get(key);
}
let SPC = carve;   // the specs' carve in use: the approved one on desktop, the larger one on a phone
// ---- the intro (David approved the room preview's intro-light.html at 26beb9a, "That's good"): black, his three lines cut
// into the back wall letter by letter, 2.5 m wide and wrapping onto the coves, the room lit from below with the solo Ö on
// both pin walls, hold; then the studio lights come up on the Muse. Ported from 26beb9a as it is: its camera (the room's
// distance, both Ö walls in view), its carve, its uplights and their levels, the plaster grain. ----
const INTRO_LINES_ALL = ['A house told in chapters.', 'Knitted at twenty-eight gauge.', 'Chapter I.'];
// ?introLines=launch: the launch page's card (the orchestrator for David, 11 Nov: without the gauge line), the same letter
// size (set by the full card's widest line), the two lines centred where the three were; the site keeps all three
const INTRO_LAUNCH = QS.get('introLines') === 'launch';
const SITE_LINES = window.INTRO_LINES_SITE || null;   // Chapter I site: the page's own line, at David's letter size
const INTRO_LINES = SITE_LINES || (INTRO_LAUNCH ? [INTRO_LINES_ALL[0], INTRO_LINES_ALL[2]] : INTRO_LINES_ALL);
// on the back wall: three lines centred above the eye line, as wide as the flat wall allows (2.5 m), wrapping a few
// centimetres onto each corner cove
const I_LINE_Y = SITE_LINES ? (SITE_LINES.length === 1 ? [2.08] : [2.25, 1.91]) : INTRO_LAUNCH ? [2.25, 1.91] : [2.42, 2.08, 1.74], I_WY0 = 2.7, I_WY1 = 1.48, I_LINE_W = 2.5, I_PAUSE = 4;   // I_PAUSE: letters' worth of pause between lines
const I_XS = 1.3, I_PXM = 2600, I_ARC = I_WY0 - I_WY1, I_CUT_D = 0.03, I_CUT_RIM = 0.0004;   // deeper, crisper cuts for the uplight
// its camera: at the room's own distance (5.4 m), so both pin walls and their Ö are in view, a little higher and looking
// a little up; landscape 46 degrees, portrait wide enough for the lines with a margin
const I_CAM = { d: 5.4, eye: 1.8, look: 1.72 };
// (a phone: the 2.5 m lines with a margin either side; 26beb9a's 1.3 m half-width left them about 4 px from the edges, QA H2)
const introFov = (aspect) => aspect >= 1 ? 46 : 2 * THREE.MathUtils.radToDeg(Math.atan(1.48 / I_CAM.d / aspect));
// the intro's timeline (seconds): 0bc08de's (the dim uplight, the writing, the uplight coming on), then the hold, the
// lines rising flush, the studio lights, the camera easing back to the room's, the specs cutting in
// 8 s in all (David: "The intro you made it so fucking long", "About 8 seconds"; 26beb9a's was 19.4 s): the same stages in
// the same order, on a faster clock. Each line writes in about 1 s in the dim light (as 26beb9a, barely seen); the uplight
// comes on as the last line is written, so the lines read lit for about 2 s (fully lit 1.1 s) before they go flush.
const T_DIM0 = 0.3, T_DIM1 = 1.0, T_TYPE0 = 1.2, T_TYPE1 = 4.4, T_SW0 = 3.8, T_ON = 0.9;
const T_FLUSH0 = 5.8, T_FLUSH1 = 6.3, T_STUDIO0 = 5.8, T_STUDIO1 = 6.8, T_CAM0 = 6.3, T_CAM1 = 7.3, T_SPECS0 = 7.3, T_SPECS1 = 7.9;
const I_MUSE = 0.5, I_MORPH = 1.4;   // the Muse's fade in; the pins' Ö into her art
const carveI = !INTRO ? null : (() => {
  const cw = Math.round(2 * I_XS * I_PXM), ch = Math.round(I_ARC * I_PXM);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d', { willReadFrequently: true });
  // size: the first line as wide on screen as it was on the wall (9.5px DejaVu Sans, .16em spacing: 182px)
  // the intro in the name's face (DejaVu Serif), the widest line I_LINE_W metres across
  const setFont = (fs) => { g.font = fs + 'px "DejaVu Serif"'; g.letterSpacing = (0.04 * fs) + 'px'; };
  setFont(100); const w100 = Math.max(...INTRO_LINES_ALL.map(t => g.measureText(t).width));
  const fs = 100 * I_LINE_W * I_PXM / w100; setFont(fs);
  g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  // the strokes as DejaVu Sans draws them: no widening
  const rowOf = (i) => (I_WY0 - I_LINE_Y[i]) / I_ARC * ch;
  INTRO_LINES.forEach((t, i) => g.fillText(t, cw / 2, rowOf(i)));
  // the order each letter is cut in (letter by letter, as typed): a second channel, each glyph holding its own index
  const oc = document.createElement('canvas'); oc.width = cw; oc.height = ch; const og = oc.getContext('2d', { willReadFrequently: true });
  og.fillStyle = '#fff'; og.fillRect(0, 0, cw, ch);   // the bare wall is never written: its edges must not reveal a letter early
  og.font = g.font; og.letterSpacing = g.letterSpacing; og.textAlign = 'left'; og.textBaseline = 'middle'; og.lineWidth = 0.05 * fs; og.lineJoin = 'round';
  let off = 0; const total = INTRO_LINES.reduce((a, t) => a + t.length, 0) + I_PAUSE * (INTRO_LINES.length - 1);
  INTRO_LINES.forEach((t, i) => { const left = cw / 2 - og.measureText(t).width / 2;
    for (let k = t.length; k >= 1; k--) { const v = Math.round(255 * (off + k) / total); og.fillStyle = og.strokeStyle = `rgb(${v},${v},${v})`;
      const pre = t.slice(0, k); og.fillText(pre, left, rowOf(i)); og.strokeText(pre, left, rowOf(i)); }
    off += t.length + I_PAUSE; });
  const ord = og.getImageData(0, 0, cw, ch).data; const REV_N = total;
  // the profile: depth grows with the distance from the rim (an exact distance transform), to the floor of the cut
  const im = g.getImageData(0, 0, cw, ch), D = im.data, n = cw * ch, INF = 1e12;
  const f2 = new Float64Array(n);
  for (let i = 0; i < n; i++) f2[i] = D[i * 4] > 127 ? INF : 0;   // distance to the nearest uncut texel
  const edt1 = (get, set, len, buf, v, z, dd) => {
    for (let q = 0; q < len; q++) buf[q] = get(q);
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < len; q++) { let s; do { const r = v[k]; s = ((buf[q] + q * q) - (buf[r] + r * r)) / (2 * q - 2 * r); if (s <= z[k]) k--; else break; } while (k >= 0);
      k++; v[k] = q; z[k] = s; z[k + 1] = INF; }
    k = 0; for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; const r = v[k]; dd[q] = (q - r) * (q - r) + buf[r]; }
    for (let q = 0; q < len; q++) set(q, dd[q]);
  };
  const L = Math.max(cw, ch), buf = new Float64Array(L), vv = new Int32Array(L), zz = new Float64Array(L + 1), dd = new Float64Array(L);
  for (let x = 0; x < cw; x++) edt1(q => f2[q * cw + x], (q, val) => { f2[q * cw + x] = val; }, ch, buf, vv, zz, dd);
  for (let y = 0; y < ch; y++) edt1(q => f2[y * cw + q], (q, val) => { f2[y * cw + q] = val; }, cw, buf, vv, zz, dd);
  const half = I_CUT_RIM * I_PXM;   // the rim of the cut: from the surface down to the floor over 0.6 mm, near vertical
  const hd = new Uint8Array(n * 2);
  for (let i = 0; i < n; i++) { const d = Math.sqrt(f2[i]); const u = Math.min(1, d / half); hd[i * 2] = Math.round(255 * u * u * (3 - 2 * u)); hd[i * 2 + 1] = ord[i * 4]; }
  const tex = new THREE.DataTexture(hd, cw, ch, THREE.RGFormat, THREE.UnsignedByteType);
  tex.flipY = false; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = true;
  tex.anisotropy = 16; tex.needsUpdate = true;
  // canvas row 0 is the top line (toward the wall, theta TB): v runs from TB at 0 down to TA at 1
  // the patch: the cove's own surface, dense along the arc so the curve is exact
  const NX = 64, NT = 96, pos = [], uv = [], nrm = [], idx = [];
  for (let j = 0; j <= NT; j++) for (let i = 0; i <= NX; i++) {
    // the back wall's surface: flat for |x| < 0.95, then turning into the side coves (radius COVE); the lines are
    // laid along it by arc length, so the widest line wraps a few centimetres onto each corner
    const sx = -I_XS + 2 * I_XS * i / NX, y = I_WY0 - I_ARC * j / NT, FL = 0.95;
    let x = sx, z = 0, nx = 0, nz = 1;
    if (Math.abs(sx) > FL) { const ph = (Math.abs(sx) - FL) / COVE, sg = Math.sign(sx); x = sg * (FL + COVE * Math.sin(ph)); z = COVE * (1 - Math.cos(ph)); nx = -sg * Math.sin(ph); nz = Math.cos(ph); }
    pos.push(x, y, z); uv.push(i / NX, j / NT); nrm.push(nx, 0, nz);
  }
  for (let j = 0; j < NT; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, e = c + 1; idx.push(a, c, e, a, e, b); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); geo.setIndex(idx);
  // the room's own material, with the relief cut into it
  const mat = new THREE.MeshStandardMaterial({ color: '#e3e3e5', roughness: 0.93 });
  const U = { reveal: { value: 0 }, revN: { value: REV_N }, pxV: { value: new THREE.Vector2(2, 3) }, pxK: { value: 0.2 }, hMap: { value: tex }, cutD: { value: 0 }, mPerUv: { value: new THREE.Vector2(2 * I_XS, I_ARC) }, texel: { value: new THREE.Vector2(1 / cw, 1 / ch) } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vCu; varying vec3 vTv; varying vec3 vBv;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vCu = uv; vTv = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
        vBv = normalize(normalMatrix * vec3(0.0, -objectNormal.z, objectNormal.y));`);   // down the arc, toward the floor: +v
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec2 vCu; varying vec3 vTv; varying vec3 vBv;
      uniform sampler2D hMap; uniform float cutD; uniform float reveal; uniform float revN; uniform float pxK; uniform vec2 pxV; uniform vec2 mPerUv; uniform vec2 texel;
      vec2 cUv; vec3 cT, cB, cN; float cH;
      float hgt(vec2 u){ return texture2D(hMap, u).r; }
      // depth below the surface (m) at a uv
      // each letter deepens from the moment it is written, over about two letters' time: cut in, never faded
      float dep(vec2 u){ vec2 hr = texture2D(hMap, u).rg; return cutD * hr.r * clamp((reveal - hr.g) * revN / 2.0, 0.0, 1.0); }
      // a light's rays into the cut: march from the point toward the light; if the uncut rim stands above the ray, it is in shade
      float skyVis(){
        float d0 = dep(cUv); if (d0 < 1e-5) return 1.0;
        float vis = 0.0;
        for (int k = 0; k < 8; k++) {
          float ph = 6.2831853 * (float(k) + 0.5) / 8.0; vec2 dir = vec2(cos(ph), sin(ph));
          float t2 = 0.0;   // tan^2 of the highest rim's elevation
          for (int i = 1; i <= 12; i++) { float r = 0.012 * float(i) / 12.0; float rise = d0 - dep(cUv + dir * r / mPerUv);
            if (rise > 0.0) t2 = max(t2, (rise * rise) / (r * r)); }
          vis += 1.0 / (1.0 + t2);
        }
        return vis / 8.0;
      }
      float relShadow(vec3 L){
        if (cutD <= 0.0) return 1.0;
        vec3 l = vec3(dot(L, cT), dot(L, cB), dot(L, cN)); if (l.z <= 0.0) return 1.0;
        float d0 = dep(cUv); if (d0 < 1e-5) return 1.0;
        float s = d0 / l.z; vec2 stepUv = l.xy * s / mPerUv / 12.0; float sh = 1.0;
        for (int i = 1; i <= 12; i++) { float fi = float(i) / 12.0; float dr = d0 * (1.0 - fi); float ds = dep(cUv + stepUv * float(i));
          sh = min(sh, clamp(1.0 - (dr - ds) / (0.05 * cutD), 0.0, 1.0)); }
        return sh;
      }`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
      {
        cN = normalize(normal); cT = normalize(vTv - dot(vTv, cN) * cN); cB = normalize(cross(cT, cN));   // cB: down the arc, +v
        vec3 V = normalize(vViewPosition);
        vec3 vt = vec3(dot(V, cT), dot(V, cB), dot(V, cN));
        cUv = vCu;
        if (cutD > 0.0) {
          // the floor of the cut sits below the surface: march the view ray into the relief (parallax occlusion).
          // The march is short (pxK) and eases out toward the floor-facing bottom line, where the cove turns away and a
          // full-depth march would hide whole horizontal strokes behind their lower rims at 100%.
          vec2 dirUv = -vt.xy / max(vt.z, 0.2) / mPerUv * pxK * (1.0 - smoothstep(pxV.x, pxV.y, vCu.y)); float dPrev = 0.0, hPrev = 0.0; vec2 uPrev = vCu;
          for (int i = 1; i <= 64; i++) { float d = cutD * float(i) / 64.0; vec2 u = vCu + dirUv * d; float hs = dep(u);
            if (d >= hs) { float a = (hPrev - dPrev) / ((hPrev - dPrev) - (hs - d)); cUv = mix(uPrev, u, clamp(a, 0.0, 1.0)); break; }
            dPrev = d; hPrev = hs; uPrev = u; }
          // facet normals from the cut's slope, sampled at the screen footprint
          vec2 fw = max(fwidth(cUv), texel);
          vec2 e = vec2(max(fw.x, texel.x), 0.0), e2 = vec2(0.0, max(fw.y, texel.y));
          float gx = (dep(cUv + e) - dep(cUv - e)) / (2.0 * e.x * mPerUv.x), gy = (dep(cUv + e2) - dep(cUv - e2)) / (2.0 * e2.y * mPerUv.y);
          normal = normalize(cN * 1.0 + cT * gx + cB * gy);
        }
        cH = hgt(cUv);
      }`)
      .replace(/RE_Direct\( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight \);/g,
        'directLight.color *= relShadow(directLight.direction); RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );')
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        // the hemisphere light reaches into the cut only through the opening: its real occlusion, from the cut's own
        // geometry. For 8 directions around the point, march the relief to find the highest rim (its elevation a); a
        // cosine-weighted sky above elevation a is cos^2(a) of the whole, so the visible share is the mean of cos^2(a)
        if (cutD > 0.0) reflectedLight.indirectDiffuse *= skyVis();`);
  };
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.visible = false; scene.add(m);
  const rtOpt = { type: THREE.HalfFloatType, samples: TOUCH ? 0 : 4 };
  const rt0 = new THREE.WebGLRenderTarget(4, 4, rtOpt), rt1 = new THREE.WebGLRenderTarget(4, 4, rtOpt);   // sized for the window in carveView
  const corners = []; for (const sx of [-I_XS, -0.95, 0.95, I_XS]) for (const y of [I_WY0, I_WY1]) {   // the wrapped ends included
    const ph = Math.max(0, Math.abs(sx) - 0.95) / COVE; corners.push([Math.sign(sx) * (0.95 + COVE * Math.sin(ph)), y, COVE * (1 - Math.cos(ph))]); }
  return { mesh: m, U, rt0, rt1, camE: null, corners };
})();
// the uplights (0bc08de): the uplight at the foot of the back wall (a spot just above the cove, aimed up, its wash
// brightest above it and fading as it climbs; it grazes the cuts from below), its fixture's small light, glow and faint
// spill, and an uplight at the foot of each pin wall (the pins lit on their undersides, their shadows thrown upward).
const up = new THREE.SpotLight('#ffffff', 0, 0, 0.6, 0.8, 1.2);
up.position.set(0, 0.16, 0.95); up.target.position.set(0, 1.3, 0); scene.add(up); scene.add(up.target);
up.castShadow = true; up.shadow.mapSize.set(2048, 2048); up.shadow.bias = -0.0003; up.shadow.normalBias = 0.008; up.shadow.radius = 2;
up.shadow.camera.near = 1; up.shadow.camera.far = 16;
const fixLight = new THREE.PointLight('#fff4e8', 0, 1.6, 2); fixLight.position.set(0, 0.22, 1.02); scene.add(fixLight);
const spill = new THREE.SpotLight('#fff4e8', 0, 0, 1.25, 1.0, 1.2); spill.position.set(0, 0.16, 0.95); spill.target.position.set(0, 2.0, 0); scene.add(spill); scene.add(spill.target);
const sideUp = [-1, 1].map(sx => { const l = new THREE.SpotLight('#fff4e8', 0, 0, 1.15, 1.0, 1.7);
  l.position.set(sx * 1.55, 0.1, 2.5); l.target.position.set(sx * 2.2, 1.5, 1.6); l.castShadow = true; l.shadow.mapSize.set(1024, 1024);
  l.shadow.bias = -0.0004; l.shadow.normalBias = 0.01; l.shadow.radius = 2; l.shadow.camera.near = 0.2; l.shadow.camera.far = 10;
  scene.add(l); scene.add(l.target); return l; });
const UPS = [up, fixLight, spill, ...sideUp];
UPS.forEach(l => { l.visible = false; });
const ease = (x) => x * x * (3 - 2 * x), segT = (a, b, t) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const GRAIN = { value: 0 };   // the plaster grain on the room's surfaces: the intro's only (0 everywhere else)
function introLights(t, live) {   // 0bc08de's introLights, faded out as the studio lights come up
  const typing = 0.05 * ease(segT(T_DIM0, T_DIM1, t)), on = ease(segT(T_SW0, T_SW0 + T_ON, t));
  const lvl = (typing + (1 - 0.05) * on) * (1 - smooth(T_STUDIO0, T_STUDIO1, t));
  up.intensity = 2.8 * lvl; fixLight.intensity = 0.3 * lvl; spill.intensity = 0.25 * lvl; sideUp.forEach(l => { l.intensity = 1.8 * lvl; });
  UPS.forEach(l => { l.visible = live && lvl > 0; });
  return { lvl, glow: 0.3 * on * (1 - smooth(T_STUDIO0, T_STUDIO1, t)) };
}
// the fixture's glow (0bc08de): a faint warm point at the foot of the wall
const glow = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,244,232,1)'); gr.addColorStop(0.25, 'rgba(255,244,232,0.35)'); gr.addColorStop(1, 'rgba(255,244,232,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, blending: THREE.AdditiveBlending, depthTest: false, opacity: 0 }));
  sp.position.set(0, 0.17, 0.96); sp.scale.set(0.22, 0.22, 1); sp.visible = false; overlay.add(sp); return sp; })();
// the camera through the intro: 0bc08de's, easing back to the room's (k 0 to 1); the room's is restored exactly after
function introCam(k) {
  const a = LAYC.aspect, fov0 = introFov(a), e = ease(k);
  cam.position.set(0, I_CAM.eye + (1.45 - I_CAM.eye) * e, I_CAM.d + (5.4 - I_CAM.d) * e); cam.lookAt(0, I_CAM.look + (1.45 - I_CAM.look) * e, 0);
  cam.fov = fov0 + (LAYC.fov - fov0) * e;
  if (LAYC.phone) cam.setViewOffset(LAYC.vw, LAYC.vh, 0, LAYC.offY * e, LAYC.vw, LAYC.vh); else cam.clearViewOffset();
  cam.updateProjectionMatrix();
}
let LAYC = { aspect: FW / FH, fov: 40, phone: false, vw: FW, vh: FH, offY: 0 };
// ---- end of specs ----
dis.renderOrder = 1;

const ZERO = new Float32Array(COLS * ROWS);   // the room opening: no design comes out
function setLeftWall(t, src, run) {   // src 0: the left wall's own pins; src 1: the right wall's pins, mirrored onto the left
  const w = walls[0], [X0, W] = morphW(run), n = Math.max(1, steps(run));
  const seg = Math.min(n - 1, Math.max(0, Math.floor((t - X0) / W))), x0 = X0 + seg * W;
  const hs = (i) => i < 0 ? ZERO : src ? PIECES[i].hR : PIECES[i].hL;
  const a = run.intro && seg === 0 && LOGOH ? (src ? LOGOH.R : LOGOH.L) : run.aZero && seg === 0 ? ZERO : hs(run.path[seg]), b = hs(run.path[Math.min(seg + 1, run.path.length - 1)]);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c, j = src ? r * COLS + (COLS - 1 - c) : i;
    const [x, y, z] = pinPos(-1, c, r);
    const tp = TAPER[0][i]; const st = pinState(t, a[j], b[j], PJ[i], x0, W);
    const v = st[0] * tp, u = st[1] * tp;
    const sunk = u > 1e-4 ? Math.min(1, (v / u) / 0.22) : 1;   // the head closes into its hole only in the last part of the travel
    const rad = PIN_R * (0.45 * tp + 0.55 * Math.sqrt(Math.min(1.2, u))) * (st[0] === st[1] ? 1 : sunk);
    const hh = Math.max(0.0002, PIN_H * v);
    S.set(hh, Math.max(1e-5, rad), Math.max(1e-5, rad)); Pv.set(x, y, z);
    M.compose(Pv, PINQ[0][i], S); w.mesh.setMatrixAt(i, M);
  }
  w.mesh.instanceMatrix.needsUpdate = true;
}

// A run: one scroll from path[0] to path[last]. path has two pieces for a single step, more in a fast scroll.
// Its clock t is the preview's: the pins go in from T0, piece i dissolves into piece i+1 over [TM0 + i DIS, TM0 + (i+1) DIS],
// and the pins come out as the last piece from T_E + (steps - 1) DIS.
const steps = (run) => run.path.length - 1;
// the run's morph windows: window i runs from X0 + i W for W, from piece path[i]'s design to path[i + 1]'s
const morphW = (run) => run.intro ? [INTRO_TE, I_MORPH] : isSpin(run) ? [TS0, TSD] : [TM0, DIS];
const hasSet = (i) => !!(spinView && spinView.fr.ready && spinView.fr.full[PIECES[i].caster]);
const isSpin = (run) => SPIN && !run.open && !run.intro && run.path[0] !== run.path[1] && run.path.every(hasSet);   // only where every piece passed has its full set
// when the wave out starts: the dissolve's T_E, the spin's last swap (270 degrees of the last turn), never for the opening
const INTRO_TE = T_STUDIO0, INTRO_END = 8.0;   // the intro: the pins stand in the solo Ö (26beb9a), and morph into the Muse's art with the studio lights
const outStart = (run) => run.open ? 1e9 : run.intro ? INTRO_TE : isSpin(run) ? TS0 + (steps(run) - 1) * TSD + TSD * 2 / 3 : TM0 + steps(run) * DIS;   // the spin's last swap; the dissolve's last window's end
const OPEN_T = 2.4, HAND = 0.45;   // the opening's length; the hand-off from the room's hero to its catalogue place (were 5.2 and 3.4)
const O_FADE0 = 0.05, O_FADE1 = 1.3, O_CUT1 = 1.1, O_GLIDE = 1.2, O_CELL0 = 0.15, O_CELLK = 0.08, O_CELL = 1.1;   // the room goes white while the hero already glides; the cells follow
const CLOSE_FROM = 1.7;   // the close: every cell moves at once (no stagger) from where they are last still, the captions fading with them
const runEnd = (run) => run.open ? (run.reverse ? CLOSE_FROM : OPEN_T) : run.intro ? INTRO_END : isSpin(run) ? TS0 + steps(run) * TSD + 0.35
  : TM1 + (steps(run) - 1) * DIS + 0.35;
// the intro's light: the room's own lights, from dark to the approved look
const LIGHTS0 = { hemi: 1.05, main: 2.4, key: 1.9 };
function setLight(L) { if (LIFT.uG) LIFT.uG.value = LIFT.gain * L;   // the walls' lit white rises with the lights, never ahead of them
  hemi.intensity = LIGHTS0.hemi * L; main.intensity = LIGHTS0.main * L; key.intensity = LIGHTS0.key * L; dMat.uniforms.lit.value = L; }
function draw(run, t) {
  const n = Math.max(1, steps(run)), sp = isSpin(run);
  walls[1].mesh.visible = false;
  setLight(run.intro ? smooth(T_STUDIO0, T_STUDIO1, t) : 1);
  LOGO.style.opacity = run.intro ? smooth(T_STUDIO0, T_STUDIO1, t) : 1;   // hidden in the intro's dark, up with the studio lights
  // the intro (0bc08de): the uplights, the plaster grain, its camera easing back to the room's
  const iL = introLights(run.intro ? t : 1e9, !!run.intro); glow.material.opacity = iL.glow; glow.visible = iL.glow > 0.001;
  GRAIN.value = run.intro ? 1 - smooth(T_STUDIO0, T_STUDIO1, t) : 0;
  if (run.intro) introCam(segT(T_CAM0, T_CAM1, t));
  let seg, mid, k, k2, spinI = -1, spinD = 0, spinFrom = -1, spinTo = -1, spinS = 0;
  if (sp) {   // the spin: turn seg over [TS0 + seg TSD, TS0 + (seg + 1) TSD], the swap at 270
    seg = Math.min(n - 1, Math.max(0, Math.floor((t - TS0) / TSD)));
    const deg = spinDegU((t - TS0 - seg * TSD) / TSD); spinI = run.path[deg < 270 ? seg : seg + 1]; spinD = run.dIn * deg;
    spinFrom = run.path[seg]; spinTo = run.path[seg + 1]; spinS = seamP(deg);   // C: the garment and its shadow fade over 60-220
    setPair(run.path[seg], run.path[seg + 1]); dMat.uniforms.p.value = deg >= 270 ? 1 : 0;   // as the preview: the pair's plane, the piece facing front
    k = smooth(TS0 - 0.1, TS0 + 0.25, t); k2 = smooth(TS0 + n * TSD - 0.2, TS0 + n * TSD + 0.3, t); mid = outStart(run);
  } else {
    const tm1 = TM1 + (n - 1) * DIS;
    seg = Math.min(n - 1, Math.max(0, Math.floor((t - TM0) / DIS)));
    setPair(run.path[seg], run.path[seg + 1]);
    if (run.open) setPair(run.path[0], run.path[0]);   // the opening: the hero never dissolves
    dMat.uniforms.p.value = run.intro || run.open ? 0 : smooth(TM0 + seg * DIS, TM0 + (seg + 1) * DIS, t);   // slow, like slow motion
    k = run.open ? smooth(0, 0.3, t) : smooth(TM0 - 0.1, TM0 + 0.25, t); k2 = smooth(tm1 - 0.2, tm1 + 0.3, t); mid = (TM0 + tm1) / 2;   // the opening: the title goes at once
  }
  if (spinView) { if (sp) showSpin(spinFrom, spinD, spinTo, spinS); else showSpin(run.path[0], 0); }
  if (run.open && t >= HAND) dis.visible = false;   // the catalogue has taken the hero: the room's plane stays hidden
  if (run.intro) dMat.uniforms.op.value = smooth(T_FLUSH1, T_FLUSH1 + I_MUSE, t);   // the Muse comes in once the lines are flush, with the studio lights
  const uiA = run.intro ? smooth(T_SPECS0 + 0.1, T_SPECS1, t) : run.open ? 1 - k : t < mid ? 1 - k : k2;
  // the room opening (?catalogue=1): the walls and floor go to a seamless white and the camera eases back
  const op = run.open ? Math.pow(smooth(O_FADE0, O_FADE1, t), 1.6) : 0;   // the studio lights coming up, together
  compMat.uniforms.sk.value = run.open ? 1 - smooth(HAND, HAND + 0.3, t) : 1;
  compMat.uniforms.wh.value = op;
  const cutK = run.open ? 1 - smooth(O_FADE0, O_CUT1, t) : 1;   // the engraved letters lift until they are flush
  for (let c = 0; c < COLS; c++) {   // how far each column's pins are in, with the same wave and offsets as the pins
    let sIn = 0; for (let r = 0; r < ROWS; r++) { const st = pinState(t, 1, 1, PJ[r * COLS + c], ...morphW(run)); sIn += 1 - Math.min(1, Math.max(0, st[0])); }   // never bare now: 0
    // the left wall's columns run far to near in u; pass B uses the same wave, so both halves lift alike
    LIFT.data[c * 4] = Math.round(255 * sIn / ROWS);
  }
  LIFT.tex.needsUpdate = true;
  setLeftWall(t, 0, run);
  // pass A without the garment's caster (the ground for its shadow on the right half), then with it. Through the
  // dissolve both pieces cast and their shadows crossfade at the dissolve's own pace (cw); outside it, one caster.
  const cA = CASTERS[sp ? spinFrom : run.path[seg]], cB = run.path[seg + 1] < 0 ? null : CASTERS[sp ? spinTo : run.path[seg + 1]];
  // the spin: both real shadows turn with the piece, about the same axis, and crossfade with the C fade's progress
  CASTERS.forEach(c => { c.rotation.order = 'YXZ'; c.rotation.y = 0; }); if (sp) { cA.rotation.y = -THREE.MathUtils.degToRad(spinD); if (cB) cB.rotation.y = cA.rotation.y; }
  const cwN = sp ? spinS : dMat.uniforms.p.value; compMat.uniforms.cw.value = cwN > 0 && cwN < 1 ? cwN : 0;
  CASTERS.forEach(c => { c.visible = false; }); renderer.setRenderTarget(rtA0); renderer.clear(); renderer.render(scene, cam);   // the room (and its depth)
  svUpdate(BARE ? [null, null] : [cA, cwN > 0 && cwN < 1 ? cB : null]);   // the garment's shadow from the softbox
  // the intro: no garment shadow before the Muse is there, then hers just behind her (D1)
  compMat.uniforms.gS.value = run.intro ? (t < T_FLUSH1 ? 0 : smooth(T_FLUSH1 + 0.3, T_FLUSH1 + 0.85, t)) : 1;
  // the carving is cut, not faded (the preview at a4cc8f6; David: "Can you carve the wall in, instead of just fading it
  // into a picture of it carved"): at a switch the cut depth itself goes to 0 and back; at the opening it rises flush
  // on the spin (the preview at 487d217): the old writing fills flush over the first half of the turn, the new one cuts
  // in from the 270-degree swap as the new piece comes round to face front (turn by turn in a fast scroll)
  const tl = sp ? t - seg * TSD : 0, cutSpin = tl < TS0 + TSD * 2 / 3 ? 1 - smooth(TS0, TS0 + TSD / 2, tl) : smooth(TS0 + TSD * 2 / 3, TS0 + TSD, tl);
  const cutS = BARE ? 0 : run.open ? cutK : run.intro ? smooth(T_SPECS0, T_SPECS1, t) : sp ? cutSpin : uiA;   // the intro: the specs stay flush until the room's camera is back, then cut in
  SPC.U.hMap.value = specTexFor(PIECES[sp ? spinI : run.open || run.intro || t < mid ? run.path[0] : run.path[n]]);   // this piece's own lines
  if (cutS > 0.001) {   // the carving, in the window around the lines: the same room and lights, uncut then cut
    renderer.shadowMap.autoUpdate = false; ROOM.visible = false; SPC.mesh.visible = true;
    SPC.U.cutD.value = 0; renderer.setRenderTarget(SPC.rt0); renderer.clear(); renderer.render(scene, SPC.camE);
    SPC.U.cutD.value = CUT_D * cutS; renderer.setRenderTarget(SPC.rt1); renderer.clear(); renderer.render(scene, SPC.camE);
    renderer.shadowMap.autoUpdate = true; ROOM.visible = true; SPC.mesh.visible = false;
  }
  compMat.uniforms.eK.value = cutS > 0.001 ? SPEC_INK : 0;   // the carving at its own depth, never faded; its shading deepened to read (QA H3)
  const revI = run.intro ? segT(T_TYPE0, T_TYPE1, t) * (1 + 2.0 / (carveI ? carveI.U.revN.value : 1)) : 0;   // written letter by letter (0bc08de)
  const cutI = run.intro && revI > 0 ? 1 - smooth(T_FLUSH0, T_FLUSH1, t) : 0;   // then rising flush before the camera moves
  if (carveI && cutI > 0.001) {
    carveI.U.reveal.value = revI;
    renderer.shadowMap.autoUpdate = false; ROOM.visible = false; carveI.mesh.visible = true;
    carveI.U.cutD.value = 0; renderer.setRenderTarget(carveI.rt0); renderer.clear(); renderer.render(scene, carveI.camE);
    carveI.U.cutD.value = I_CUT_D * cutI; renderer.setRenderTarget(carveI.rt1); renderer.clear(); renderer.render(scene, carveI.camE);
    renderer.shadowMap.autoUpdate = true; ROOM.visible = true; carveI.mesh.visible = false;
  }
  compMat.uniforms.eK2.value = cutI > 0.001 ? 1 : 0;   // the same fade as the other writing; opening: no fade, the cut rises
  setLeftWall(t, 1, run); renderer.setRenderTarget(rtB); renderer.clear(); renderer.render(scene, cam);
  renderer.setRenderTarget(null); renderer.autoClear = false; renderer.clear();
  renderer.render(compScene, compCam); if (!BARE) renderer.render(overlay, cam); renderer.autoClear = true;
  const pc = PIECES[sp ? spinI : run.open || run.intro || t < mid ? run.path[0] : run.path[n]];
  if (catEl) catalogue(run, t);
  if (nmEl.textContent !== pc.name) { nmEl.textContent = pc.name; subEl.innerHTML = pc.sub; nmEl.classList.toggle('long', pc.name.length > 10); }
  uiEl.style.opacity = String(sp ? cutSpin : uiA);   // on the spin the HTML writing goes with the carving
  if (stage.dataset.piece !== pc.id) { stage.dataset.piece = pc.id;   // Chapter I site: the piece's own links
    document.getElementById('btn').innerHTML = (pc.links || []).map(l => `<a href="${l[1]}">${l[0]}</a>`).join(''); }   // David: "Add to cart and next to it the price"   // the presale (site.js opens the size pop, then checkout)
}

// ---- the frame: the preview's 16:9 frame scaled to cover the window; on a phone, the same room in portrait ----
let phone = false, camOffY = 0;
const ER0 = { ...ER };
function carveView(fw, fh) {
  if (!phone) { SPC = carve; ER = { ...ER0 }; carve.camE = refCam.clone(); carve.camE.setViewOffset(FW * ER.ss, FH * ER.ss, ER.x * ER.ss, ER.y * ER.ss, ER.w * ER.ss, ER.h * ER.ss); }
  else {   // a phone: the larger carve; its window is a box round its lines in the phone's frame
    SPC = phoneSpecs();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const v = new THREE.Vector3();
    for (const c of SPC.corners) { v.set(...c).project(cam);
      const X = (v.x + 1) / 2 * fw, Y = (1 - v.y) / 2 * fh; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
    ER = { x: Math.floor(x0) - 2, y: Math.floor(y0) - 2, w: Math.ceil(x1 - x0) + 4, h: Math.ceil(y1 - y0) + 4, ss: 3 };
    SPC.camE = cam.clone(); SPC.camE.clearViewOffset(); SPC.camE.setViewOffset(fw * ER.ss, fh * ER.ss, ER.x * ER.ss, (ER.y + camOffY) * ER.ss, ER.w * ER.ss, ER.h * ER.ss);
  }
  SPC.rt0.setSize(ER.w * ER.ss, ER.h * ER.ss); SPC.rt1.setSize(ER.w * ER.ss, ER.h * ER.ss);
  compMat.uniforms.E0.value = SPC.rt0.texture; compMat.uniforms.E1.value = SPC.rt1.texture;
  compMat.uniforms.eR.value.set(ER.x, ER.y, ER.w, ER.h); compMat.uniforms.fr.value.set(fw, fh);
  if (carveI) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const v = new THREE.Vector3();
    // the intro's lines are cut while the intro's own camera holds (0bc08de's), so their window is taken through it
    const ic = new THREE.PerspectiveCamera(introFov(fw / fh), fw / fh, 0.1, 50); ic.position.set(0, I_CAM.eye, I_CAM.d); ic.lookAt(0, I_CAM.look, 0); ic.updateMatrixWorld(true); ic.updateProjectionMatrix();
    for (const c of carveI.corners) { v.set(...c).project(ic); const X = (v.x + 1) / 2 * fw, Y = (1 - v.y) / 2 * fh; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(fw, x1); y1 = Math.min(fh, y1);
    const E = carveI.ER = { x: Math.floor(x0) - 2, y: Math.floor(y0) - 2, w: Math.ceil(x1 - x0) + 4, h: Math.ceil(y1 - y0) + 4, ss: 3 };
    carveI.camE = ic.clone(); carveI.camE.setViewOffset(fw * E.ss, fh * E.ss, E.x * E.ss, E.y * E.ss, E.w * E.ss, E.h * E.ss);
    carveI.rt0.setSize(E.w * E.ss, E.h * E.ss); carveI.rt1.setSize(E.w * E.ss, E.h * E.ss);
    compMat.uniforms.E2.value = carveI.rt0.texture; compMat.uniforms.E3.value = carveI.rt1.texture; compMat.uniforms.eR2.value.set(E.x, E.y, E.w, E.h);
  }
}
function layout() {
  // a touch device renders at 1.5x at most (was 2x): every pass is full frame, and a phone's GPU stuttered at 2x (David: "the laggiest website")
  // the canvas at the screen's own density (a phone up to 3x), so the carved letters and the garment are as sharp as the
  // screen (David: "Make this high resolution too tho the engraved letters. Thats important for the eyes"); the room's
  // heavy passes keep their own pixel budget (ROOM_PX, below), so only the composite and the garment cost more
  const vw = window.innerWidth, vh = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, (navigator.maxTouchPoints || 0) > 0 ? 3 : 2);
  phone = vw / vh < 1;
  document.body.classList.toggle('phone', phone);
  FLOOR.value = phone ? window.FLOOR_WASH : 0;
  let cssW, cssH;
  if (!phone) {
    const s = Math.max(vw / FW, vh / FH); cssW = FW; cssH = FH;
    stage.style.width = FW + 'px'; stage.style.height = FH + 'px';
    stage.style.transform = `translate(${(vw - FW * s) / 2}px, ${(vh - FH * s) / 2}px) scale(${s})`;
    // big screens (David, on the 1920 read: "Nudge into calm wall"): the room scales up and the corner's pins break up
    // the lettering, so it moves onto the calm wall between the second pin column and the dotted arc (frame point
    // LOGO_CALM, measured at 1680x1050, 1920x1080 and 2560x1440). Same size; 1440 and below keep the CSS corner.
    // also where the frame's left edge is in the window (16:9 or wider: 1280x720 put the lettering on the pin art, QA H4)
    if (vw >= 1600 || (vw - FW * s) / 2 >= -1) { LOGO.style.left = ((vw - FW * s) / 2 + LOGO_CALM[0] * s).toFixed(1) + 'px'; LOGO.style.top = ((vh - FH * s) / 2 + LOGO_CALM[1] * s).toFixed(1) + 'px'; }
    else { LOGO.style.left = ''; LOGO.style.top = ''; }
    cam.fov = 40; cam.aspect = FW / FH;
    var bw = Math.round(FW * s * dpr), bh = Math.round(FH * s * dpr);
    const cap = Math.min(1, Math.sqrt((2560 * 1440) / (bw * bh))); bw = Math.round(bw * cap); bh = Math.round(bh * cap);
  } else {
    LOGO.style.left = ''; LOGO.style.top = '';
    cssW = vw; cssH = vh;
    stage.style.width = vw + 'px'; stage.style.height = vh + 'px'; stage.style.transform = 'none';
    // the same camera and room, framed for a phone: PHONE_HTAN sets how much of the room shows across (the piece's
    // share of the width), and the frame is shifted (not tilted) so the piece's centre sits at PHONE_CY of the height
    // The buttons clear the visible bottom by PH_CLEAR (David: nothing tappable in the bottom 120 px; Safari's toolbar and
    // in-app viewers cover about 150 px, so it is measured live, see phoneFit): the name, the piece and the specs move up
    // together; on a short screen the room also scales down a little, and the buttons never sink.
    const fit = phoneFit(vw, vh);
    nameShift = fit.shift; nameGapK = fit.k; window.__phoneFit = { scale: fit.scale, gap: fit.k / fit.scale, shift: fit.shift };
    cam.aspect = vw / vh; cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(fit.htan / cam.aspect));
    cam.clearViewOffset(); cam.updateProjectionMatrix();
    camOffY = fit.offY;
    cam.setViewOffset(vw, vh, 0, camOffY, vw, vh);
    var bw = Math.round(vw * dpr), bh = Math.round(vh * dpr);
  }
  if (!phone) { cam.clearViewOffset(); camOffY = 0; }
  LAYC = { aspect: phone ? vw / vh : FW / FH, fov: cam.fov, phone, vw, vh, offY: camOffY };   // the room's camera, for the intro's ease back to it
  cam.updateProjectionMatrix();
  carveView(cssW, cssH);
  // the name sits just above the piece (David, 8 Nov: "The muse needs to come down more"): the bottom of its second
  // line about 15 px above the top of the piece's frame, on desktop and phone alike
  { const v = new THREE.Vector3(0, 1.62 + GH / 2, 0.9).project(cam), top = (1 - v.y) / 2 * cssH;
    const nameEl = document.getElementById('name'); nameEl.style.top = '0px';
    const hgt = nameEl.getBoundingClientRect().height / (phone ? 1 : stage.getBoundingClientRect().height / FH);
    // phone (David, refs/room-phone-name-position.jpg: "The muse goes in the place circle suggests"): centred at 20% of
    // the screen's height, with clear air above the hood
    // when the composition moves up (phoneFit) the name moves with it, its gap to the hood scaled with the room
    nameEl.style.top = Math.round(phone ? (nameGapK === 1 ? 0.20 * cssH - hgt / 2 - nameShift : top - nameGapK * nameGap0(cssH, hgt) - hgt) : top - 15 - hgt - (window.NAME_CLEAR || 0)) + 'px'; }   // Chapter I site: on a computer, NAME_CLEAR more air between the name and the piece
  // phone: ADD TO CART / BUY NOW right under the specs; desktop keeps them on the right, as in the preview
  { const btn = document.getElementById('btn');
    if (phone) { const v = covePt(0, thAt(SPEC_Y_PH[4]), 0).project(cam); btn.style.top = Math.round((1 - v.y) / 2 * cssH + 20 + 60 + PH_STEP) + 'px'; }
    else btn.style.top = ''; }
  // the step: 25 px under where the buttons sat; ADD TO CART and PRE-SALE under it, where David drew them; phone only
  if (phone) { const b = document.getElementById('btn');
    const zAt = (yPx) => { const d = new THREE.Vector3(0, 1 - 2 * yPx / cssH, 0.5).unproject(cam).sub(cam.position).normalize(); return cam.position.z + d.z * (-cam.position.y / d.y); };
    DROPZ.value = zAt(b.offsetTop - 25); } else DROPZ.value = -1;   // the lip 25 px over ADD TO CART (David's lines)
  bw = Math.max(2, Math.round(bw * RS)); bh = Math.max(2, Math.round(bh * RS));   // the adaptive render scale (see loop)
  renderer.setSize(bw, bh, false);
  renderer.domElement.style.width = cssW + 'px'; renderer.domElement.style.height = cssH + 'px';
  // the carving's 3x window is filtered down to one canvas pixel, not one CSS pixel: at the canvas's density the letters
  // keep every pixel the screen has
  compMat.uniforms.eSS.value = (ER ? ER.ss : 3) * Math.max(1, bw / cssW);
  // the room's own passes (walls, pins, carving, the garment's shadow) at no more than ROOM_PX pixels, filtered up in the
  // composite; the canvas keeps its size, so the garment drawn over them stays sharp (desktop speed, David: "shit show")
  const rk = window.CAPTURE ? 1 : Math.min(1, Math.sqrt((WEAK ? ROOM_PX_WEAK : ROOM_PX) / (bw * bh))), rw = Math.max(2, Math.round(bw * rk)), rh = Math.max(2, Math.round(bh * rk));
  rtA.setSize(1, 1); rtB.setSize(rw, rh); rtA0.setSize(rw, rh); rtA2.setSize(1, 1); svResize(rw, rh);
}
// ---- phone fit: how far the name, the piece and the specs move up, and how much the room scales, so ADD TO CART and the
// presale (and the size row that opens under them) end at least PH_CLEAR above the bottom of what is actually visible ----
const PH_CLEAR = 120, PH_POP = 38, PH_NAME_MIN = 72, PH_STEP = 40;   // PH_STEP: the buttons drop this far under the step, where David drew them   // PH_POP: the size row under the buttons (8 + its 30 px line); PH_NAME_MIN: the name's top stays clear of the logo
let nameShift = 0, nameGapK = 1;   // nameGapK: the name's gap to the hood as a share of David's (1 at rest)
function visibleH() {   // the visible viewport: the smaller of the layout and visual viewports, less the bottom safe area
  let h = window.innerHeight;
  if (window.visualViewport) h = Math.min(h, window.visualViewport.height);
  return h - safeBottom();
}
let SAFE_PROBE = null;
function safeBottom() {
  if (!SAFE_PROBE) { SAFE_PROBE = document.createElement('div'); SAFE_PROBE.style.cssText = 'position:fixed;left:0;bottom:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)'; document.body.appendChild(SAFE_PROBE); }
  return parseFloat(getComputedStyle(SAFE_PROBE).paddingBottom) || 0;
}
// where the hood's top, the piece's centre and the last spec row land for a given width share, with no offset
function phoneProbe(vw, vh, htan) {
  const c = cam.clone(); c.aspect = vw / vh; c.fov = THREE.MathUtils.radToDeg(2 * Math.atan(htan / c.aspect)); c.clearViewOffset(); c.updateProjectionMatrix();
  const y = (p) => (1 - p.project(c).y) / 2 * vh;
  return { hood: y(new THREE.Vector3(0, 1.62 + GH / 2, 0.9)), mid: y(new THREE.Vector3(0, 1.62, 0.9)), spec: y(covePt(0, thAt(SPEC_Y_PH[4]), 0)) };
}
const nameHgt = () => document.getElementById('name').getBoundingClientRect().height;
// the name's gap to the hood as David placed it (centred at 20% of the height, the room at PHONE_HTAN / PHONE_CY)
function nameGap0(vh, hgt) { const P = phoneProbe(window.innerWidth, vh, window.PHONE_HTAN), off = P.mid - window.PHONE_CY * vh; return (P.hood - off) - (0.20 * vh + hgt / 2); }
function phoneFit(vw, vh) {
  const btnH = 60, hgt = nameHgt(), floor = visibleH() - PH_CLEAR - PH_POP;
  const gap0 = nameGap0(vh, hgt);
  // first the whole composition moves up; then the air between the name and the hood closes, down to half; only then does
  // the room scale, a step at a time (the name's gap with it)
  for (let k = 1; k >= 0.6 - 1e-9; k -= 0.01) {
    const htan = window.PHONE_HTAN / k, P = phoneProbe(vw, vh, htan);
    const off0 = Math.round(P.mid - window.PHONE_CY * vh), blockBot0 = (P.spec - off0) + 20 + btnH;   // the composition as David placed the step against (the buttons under the step lie lower, as he drew)
    const d = Math.max(0, Math.ceil(blockBot0 - floor));   // at rest the piece's centre sits at PHONE_CY; moving up by d shifts it all
    for (let g = 1; g >= 0.5 - 1e-9; g -= 0.05) {
      const nameTop0 = k === 1 && g === 1 ? 0.20 * vh - hgt / 2 : (P.hood - off0) - k * g * gap0 - hgt;
      if (nameTop0 - d >= PH_NAME_MIN || k <= 0.6 + 1e-9) return { k: k * g, scale: k, htan, shift: d, offY: off0 + d };
    }
  }
}
window.PHONE_HTAN = window.PHONE_HTAN || 0.27;   // David's pick: the piece about 70% of the width
window.PHONE_CY = window.PHONE_CY || 0.56;
layout();

// the piece at rest (David: "Can you add so you can play with the shadow by holding finger on the hoodie? Make it so you can
// select the hoodie tho", then "Move the light"): a tap on it opens its page; a press held still for 300 ms picks up the
// room's main light (the one that casts the garment's shadow), and dragging moves it: sideways swings it round the piece,
// up and down raises and lowers it, and the room and the shadow follow (it is the real light). On release the light eases
// back to its approved place over 0.6 s; nothing steps and no page opens. While it is held, the wheel, swipes and keys do nothing.
renderer.domElement.style.cursor = 'pointer';
const onHero = (cx, cy) => {
  const r = renderer.domElement.getBoundingClientRect(), pc = PIECES[cur], hw = GH * pc.aspect / 2;
  const a = new THREE.Vector3(-hw, 1.62 + GH / 2, 0.9).project(cam), b = new THREE.Vector3(hw, 1.62 - GH / 2, 0.9).project(cam);
  const x = (cx - r.left) / r.width * 2 - 1, y = 1 - (cy - r.top) / r.height * 2;
  return x > a.x && x < b.x && y < a.y && y > b.y;
};
const MAIN_P0 = main.position.clone(), MAIN_AT = main.target.position.clone();
const L0 = (() => { const v = MAIN_P0.clone().sub(MAIN_AT), r = v.length(); return { r, az: Math.atan2(v.x, v.z), el: Math.asin(v.y / r) }; })();
const D2R = Math.PI / 180;
// the ranges, in degrees from the softbox's rest (-25.9 degrees round, 28.4 up): sideways -62 to +62 (the study's
// +-60 inside them; at -62 it is about 88 degrees round, still in front of the piece, its radius clamped inside the side
// walls), up and down -20 to +25 (8 to 53 degrees above level): the shadow stays on the wall and floor
const LIGHT_AZ = [-62, 62], LIGHT_EL = [-20, 25], LIGHT_BACK = 0.6;
let lightAz = 0, lightEl = 0, lightBack = null;
function placeLight(az, el) {   // the softbox K, swung about the piece (STUDY.md §5 S1); the room's own lights never move
  lightAz = az; lightEl = el; placeK(az, el); idleDirty = true;
}
const HOLD_MS = 300, SLOP = 10;
let hold = null, lightGesture = false;   // lightGesture: this touch moved the light, so its touchend is no swipe
const clampv = (v, [a, b]) => Math.min(b, Math.max(a, v));
renderer.domElement.addEventListener('pointerdown', (e) => {
  lightGesture = false;
  if (run || cat || intro || hold || (e.pointerType === 'mouse' && e.button !== 0) || !onHero(e.clientX, e.clientY)) return;
  hold = { id: e.pointerId, x0: e.clientX, y0: e.clientY, held: false, moved: false };
  hold.timer = setTimeout(() => { if (hold && !hold.moved && !run) { hold.held = true; lightGesture = true; lightBack = null;
    hold.az0 = lightAz; hold.el0 = lightEl; renderer.domElement.style.cursor = 'grabbing'; } }, HOLD_MS);
  try { renderer.domElement.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }
});
renderer.domElement.addEventListener('pointermove', (e) => {
  if (!hold || e.pointerId !== hold.id) return;
  const dx = e.clientX - hold.x0, dy = e.clientY - hold.y0;
  if (!hold.held) { if (Math.hypot(dx, dy) > SLOP) { hold.moved = true; clearTimeout(hold.timer); } return; }
  const span = phone ? innerWidth : 700, k = 160 / span;   // 80 degrees per half a phone's width, or per 350 px with a mouse
  placeLight(clampv(hold.az0 + dx * k, LIGHT_AZ), clampv(hold.el0 - dy * k, LIGHT_EL));
});
const release = (e, open) => {
  if (!hold || e.pointerId !== hold.id) return;
  clearTimeout(hold.timer);
  if (hold.held) { lightBack = { az: lightAz, el: lightEl, t0: clock() }; renderer.domElement.style.cursor = 'pointer'; }
  else if (open && !hold.moved && !run && onHero(e.clientX, e.clientY)) location.href = PIECES[cur].page;   // a tap: select the piece
  hold = null;
};
renderer.domElement.addEventListener('pointerup', (e) => release(e, true));
renderer.domElement.addEventListener('pointercancel', (e) => release(e, false));
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());   // no menu on a long press
addEventListener('selectstart', (e) => { if (hold) e.preventDefault(); }, { capture: true });   // iOS: no selection or magnifier while a press is live
const lightHeld = () => !!(hold && hold.held);
// the light easing back to its approved place, by the frame clock
function lightStep() {
  if (!lightBack) return;
  const u = Math.min(1, (clock() - lightBack.t0) / LIGHT_BACK), e = 1 - Math.pow(1 - u, 3);
  placeLight(lightBack.az * (1 - e), lightBack.el * (1 - e)); if (u >= 1) lightBack = null;
}
// capture hook: window.__lightAt = { az, el } (degrees from the approved place) renders the room with the light there on the
// next tick(); null puts it back
Object.defineProperty(window, '__lightAt', { configurable: true, get: () => ({ az: lightAz, el: lightEl }),
  set: (v) => { lightBack = null; placeLight(v ? +v.az || 0 : 0, v ? +v.el || 0 : 0); } });

// ---- the catalogue (?catalogue=1) ----
if (CAT) {
  const sh = await (await fetch('assets/shadow/shadow.json')).json();
  CAT.querySelector('.grid').innerHTML = window.catalogueHTML(sh);   // index.html's: the same cells as the #catalogue first paint
}

// the catalogue's arrival (David: "the more seamless the best"): the hero never vanishes. Until the room is white it is
// the room's own cut-out over its real cast shadow; at the hand-off the same image, at the same place on screen, becomes
// its catalogue cell and glides (eased) into its place in the grid, its shadow handed from the room's cast shadow to the
// page's baked one. The other pieces rise into their places from below the screen at full opacity. Played backwards
// when the catalogue closes.
const easeIOs = (x) => { x = Math.min(1, Math.max(0, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
function catalogue(run, t) {
  if (!run.open) { CAT.style.visibility = 'hidden'; CAT.style.pointerEvents = 'none'; return; }
  const on = t >= HAND; CAT.style.visibility = on ? 'visible' : 'hidden'; CAT.style.opacity = 1; CAT.style.transform = 'none';
  CAT.style.pointerEvents = t >= OPEN_T - 0.05 ? 'auto' : 'none';
  dis.visible = !on;
  const hero = PIECES[run.path[0]].id, cv = renderer.domElement.getBoundingClientRect();
  // the hero's rectangle on screen, in the room (the dissolve plane, one piece wide)
  const hw = GH * PIECES[run.path[0]].aspect / 2, a = new THREE.Vector3(-hw, 1.62 + GH / 2, 0.9).project(cam), b = new THREE.Vector3(hw, 1.62 - GH / 2, 0.9).project(cam);
  const rx = cv.left + (a.x + 1) / 2 * cv.width, ry = cv.top + (1 - a.y) / 2 * cv.height, rw = (b.x - a.x) / 2 * cv.width;
  let k = 0;
  // the hero's cell below the fold (a narrow window puts it in a later row): the grid is scrolled to it from the
  // hand-off, as #catalogue=<piece> opens it, so the hero glides to a place on screen and nothing rises across it
  if (on && t < OPEN_T && !run.reverse && !run.scrolled) { run.scrolled = true; const hc = CAT.querySelector(`.ci[data-id="${hero}"]`);
    if (hc) { const hb = hc.querySelector('.ph'); hb.style.transform = 'none'; const hr = hb.getBoundingClientRect();
      if (hr.bottom > innerHeight - 8) CAT.scrollTop = Math.max(0, hc.offsetTop - innerHeight * 0.12); } }
  const hph = CAT.querySelector(`.ci[data-id="${hero}"] .ph`); if (hph) hph.style.transform = 'none';
  const heroTop = hph ? hph.getBoundingClientRect().top : 0;   // the hero's own place: cells above it come down to theirs, so none crosses it
  CAT.querySelectorAll('.ci').forEach((ci) => {
    const ph = ci.querySelector('.ph'), cap = ci.querySelectorAll('.nm, .pr'), rest = ph.querySelector('.rest');
    ph.style.transform = 'none'; const r = ph.getBoundingClientRect();
    if (ci.dataset.id === hero) {
      const g = easeIOs((t - HAND) / O_GLIDE), s0 = rw / r.width;
      const dx = (rx - r.left) * (1 - g), dy = (ry - r.top) * (1 - g), sc = s0 + (1 - s0) * g;
      ph.style.transformOrigin = '0 0'; ph.style.transform = `translate(${dx}px, ${dy}px) scale(${sc})`;
      rest.style.opacity = smooth(HAND, HAND + 0.3, t);
    } else {
      const g = easeIOs((t - HAND - O_CELL0 - (run.reverse ? 0 : O_CELLK * k++)) / O_CELL);   // cells above the screen (the grid scrolled to the hero) stay put
      ph.style.transform = r.bottom <= 0 ? 'none' : r.bottom <= heroTop ? `translateY(${-(1 - g) * (r.bottom + 40)}px)` : `translateY(${(1 - g) * (innerHeight - r.top + 40)}px)`; rest.style.opacity = 1;
    }
    cap.forEach(c => { c.style.opacity = run.reverse ? 1 - smooth(0, 0.25, CLOSE_FROM - t) : smooth(OPEN_T - 0.6, OPEN_T - 0.1, t); });
  });
}

// ---- scroll drives it ----
let cur = 0, run = null, pending = 0, idleDirty = true;
const clock = () => (window.CAPTURE ? window.CAPTURE_T : performance.now() / 1000);

// ---- the intro (?intro=1; David: "Fire."), before the room, once per browser ----
// David: "The all black screen but what shows is only a dimmed light showing the engravings on the wall as they write our
// writing ... and then the logo in the black part of the screen somewhere like top middle. Then it turns on the lights
// with hoodie." The room, unlit. A dim spot grazes the back wall, and the three lines are carved into it as they are
// written (the v2 cut, deepening along the writing). The panda Ö glows top middle, in the dark (its own light parts,
// a bloom from its own brightness). Then the studio lights come up to the approved look, the Muse is there, the pins
// rise into her art, and the carved lines rise flush into the wall, as in the catalogue. One dark-to-light breath: no
// text fades, no flashes. Nothing skips it while it is dark (David: "Don't let anyone skip the intro while it's black ...
// Only once it lights up"): from the studio lights (INTRO_LIT) a tap, a scroll or a key skips to the room.
const INTRO_EL = INTRO ? document.getElementById('intro') : null;
let intro = INTRO ? { t0: null, last: -1e9, t: 0, prev: null } : null;
const INTRO_LIT = T_STUDIO0 + 0.2;   // 6.0 s: the studio lights are up
const introLit = () => !!intro && intro.t0 !== null && intro.t >= INTRO_LIT;
if (INTRO_EL) {
  INTRO_EL.hidden = false;
  INTRO_EL.addEventListener('click', () => { if (introLit()) endIntro(); });
}
const fade = (t, a0, a1, b0, b1) => Math.min(smooth(a0, a1, t), 1 - smooth(b0, b1, t));
function introUI(t) {   // 0bc08de has no panda glow: nothing is drawn over the room (the overlay only takes a tap to skip)
  INTRO_EL.querySelector('.panda').style.opacity = 0;
}
function endIntro() {
  if (!intro) return;
  intro = null; INTRO_EL.hidden = true; setLight(1); introLights(1e9, false); GRAIN.value = 0; glow.visible = false; introCam(1); cur = 0; run = null; idleDirty = true;
  try { localStorage.setItem('phaora-ch2-intro-seen', '1'); } catch (e) {}
}
// ?catalogue=1 (a concept for David): after the last hero, one more scroll opens the room into the catalogue; scrolling
// up at its top closes it again (the same opening, played backwards)
function step(dir) {
  if (intro) {   // the intro: nothing while it is dark; once the studio lights are up, a scroll or a key skips to the room
    if (introLit()) endIntro(); return;
  }
  if (CAT && !run) {
    if (!cat && dir > 0 && cur === PIECES.length - 1) { run = { open: true, path: [cur, -1], dIn: 1, dOut: 1, t0: clock() }; return; }
    if (cat) { if (dir < 0 && CAT.scrollTop <= 0) run = { open: true, reverse: true, path: [cur, -1], dIn: 1, dOut: 1, t0: clock() }; return; }
  }
  if (run && run.open) return;
  const last = run ? run.path[run.path.length - 1] : cur, next = last + dir;
  if (next < 0 || next >= PIECES.length) return;
  const now = clock();
  if (!run) { run = { path: [cur, next], dIn: dir, dOut: dir, t0: now }; return; }
  // fast-scroll rule: while the pins are still in the wall the run goes on to the next piece; they come out only as
  // the piece you land on
  if (now - run.t0 < outStart(run)) { run.path.push(next); run.dOut = dir; return; }
  pending = dir;   // the pins are already coming out: this step starts as soon as they are out
}
function frame() {
  const now = clock();
  lightStep();
  if (intro) {
    if (intro.t0 === null) { intro.t0 = now; intro.prev = now; }
    // the intro's own clock advances by what was shown, at most 1/20 s a frame: a slow machine's first frames (compiling
    // the room's shaders can take seconds) pause it instead of running past its 8 s (David's Chromebook: "No intro")
    intro.t += window.CAPTURE ? now - intro.prev : Math.min(now - intro.prev, 0.05); intro.prev = now;
    const t = intro.t; introUI(t);
    if (t >= INTRO_END) endIntro();
    else { draw({ intro: true, aZero: true, path: [0, 0], dIn: 1, dOut: 1 }, t); return; }
  }
  if (run) {
    const t = now - run.t0;
    if (t >= runEnd(run)) {
      if (run.open) { cat = !run.reverse; draw(run, cat ? OPEN_T : 0); run = null; idleDirty = !cat; }
      else { cur = run.path[run.path.length - 1]; run = null; idleDirty = true; }
      if (pending) { const d = pending; pending = 0; step(d); } }
    else draw(run, run.reverse ? CLOSE_FROM - t : t);
  }
  if (!run && (idleDirty || svMore) && !cat) { draw({ path: [cur, cur], dIn: 1, dOut: 1 }, 0); idleDirty = false; }   // svMore: the shadow still refining
}
// adaptive render scale (David on a Chromebook: "super laggy"): while the room animates (the intro, a turn, the light),
// frame times are averaged over 24 drawn frames; above 24 ms the room renders at 0.8x the pixels it did, down to 0.5x.
// Only ever down, so a fast machine never changes; the canvas keeps its CSS size, so nothing moves on screen.
function loop(ts) {
  const busy = !!(intro || run || hold), dt = rsLast ? ts - rsLast : 0; rsLast = ts;
  if (!window.CAPTURE) frame();
  if (busy && dt > 0 && dt < 1000 && RS > 0.5 && !window.CAPTURE) { rsSum += dt; if (++rsN >= 12) {
    if (rsSum / rsN > 24) { RS = Math.max(0.5, RS * 0.8); layout(); idleDirty = true; }
    rsN = 0; rsSum = 0; } }
  requestAnimationFrame(loop);
}
// index.html#catalogue (or #catalogue=<piece id>): straight onto the opened catalogue, as the room's opening leaves it,
// scrolled to that piece
function openCatalogueNow(piece) {
  if (!CAT) return;
  cur = PIECES.length - 1; run = null; cat = true; idleDirty = false;
  draw({ open: true, path: [cur, -1], dIn: 1, dOut: 1 }, OPEN_T);
  const cell = piece && CAT.querySelector(`.ci[data-id="${piece.replace(/-/g, '_')}"]`) || piece && CAT.querySelector(`.ci[href="${piece}.html"]`);
  if (cell) CAT.scrollTop = Math.max(0, cell.offsetTop - innerHeight * 0.12);
  document.documentElement.classList.remove('cat-link');   // the room has taken over, as it was: no change on screen
}
if (window.CAT_LINK) openCatalogueNow(window.CAT_LINK.piece);
addEventListener('hashchange', () => { const m = /^#catalogue(?:=([\w-]+))?$/.exec(location.hash); if (m && !cat && !intro) openCatalogueNow(m[1] || null); });
// the catalogue scrolls as a page: the lettering top left eases out as the grid passes under it, and back at the top
if (CAT) CAT.addEventListener('scroll', () => { LOGO.style.opacity = String(1 - smooth(0, 90, CAT.scrollTop)); LOGO.style.pointerEvents = CAT.scrollTop > 60 ? 'none' : ''; }, { passive: true });

// one gesture = exactly one step (David: "scrolling once skips the PÖ always"): input never steps while a switch runs
// (no queue, no extending the run), and a gesture that has stepped stays spent until the switch is over AND its stream
// has been quiet; so a trackpad's momentum tail or a swipe's inertia can never carry on to the next piece
const WHEEL_QUIET = 300;   // ms of no wheel events that end a gesture
let wAcc = 0, wLast = -1e9, wSpent = false;
addEventListener('wheel', (e) => {
  if (cat && !run && (e.deltaY > 0 || CAT.scrollTop > 0)) return;   // the catalogue scrolls as a page
  e.preventDefault();
  if (lightHeld()) return;   // the light is held: the wheel does nothing
  const now = e.__t ?? (e.timeStamp || performance.now()), gap = now - wLast, d = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * 800 : e.deltaY;
  wLast = now;
  if (wSpent) { if (run || gap < WHEEL_QUIET) return; wSpent = false; wAcc = 0; }   // still the same gesture (or its tail)
  if (run) return;
  if (gap > 180) wAcc = 0;
  wAcc += d;
  if (Math.abs(wAcc) >= 40) { step(Math.sign(wAcc)); wAcc = 0; wSpent = true; }
}, { passive: false });
// touch: one swipe = one step, decided at touchend; a touch that starts during a switch does nothing
let ty = null, tyNow = null;
addEventListener('touchstart', (e) => { if (run) { ty = null; return; } ty = tyNow = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', (e) => { if (ty === null) return; tyNow = e.touches[0].clientY;
  if (cat && !run && (ty > tyNow || CAT.scrollTop > 0)) return;   // the catalogue scrolls as a page
  e.preventDefault(); }, { passive: false });
addEventListener('touchend', () => {
  if (ty !== null && tyNow !== null && !run && !lightGesture && !lightHeld()) { const dy = ty - tyNow;
    if (Math.abs(dy) > 44 && !(cat && (dy > 0 || CAT.scrollTop > 0))) step(Math.sign(dy)); }
  ty = tyNow = null; });
addEventListener('touchcancel', () => { ty = tyNow = null; });
// keys: one press = one step; key repeat and presses during a switch are ignored
addEventListener('keydown', (e) => {
  const dn = ['ArrowDown', 'PageDown', ' '].includes(e.key), up = ['ArrowUp', 'PageUp'].includes(e.key);
  if (!dn && !up) return; e.preventDefault();
  if (e.repeat || run || lightHeld()) return;
  step(dn ? 1 : -1);
});
const onResize = () => { layout(); idleDirty = true; if (cat) draw({ open: true, path: [cur, -1], dIn: 1, dOut: 1 }, OPEN_T); if (window.CAPTURE) frame(); };
addEventListener('resize', onResize);
// Safari's toolbar coming and going changes only the visual viewport on some versions: the phone fit follows it
if (window.visualViewport) { let lastVH = visualViewport.height; visualViewport.addEventListener('resize', () => { if (phone && Math.abs(visualViewport.height - lastVH) >= 1) { lastVH = visualViewport.height; onResize(); } }); }

// for review: renderAt(t) is the preview's own timeline (one scroll down, the first piece into the second);
// renderRun(path, dIn, dOut, t) any run; tick() advances one frame on the capture clock (?capture)
window.renderAt = (t) => draw({ path: [0, 1], dIn: 1, dOut: 1 }, t);
window.introNow = () => intro ? intro.t : null;
window.renderRun = (path, dIn, dOut, t) => draw({ path, dIn, dOut }, t);
window.tick = frame;
window.step = step;
window.relayout = layout;
frame();
window.ready = true;
requestAnimationFrame(loop);
