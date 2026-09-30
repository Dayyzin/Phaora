/* What's under a PHAÖRA patio — the pinned section under the homepage reel.
   Loaded only when the section nears the viewport (see the boot script after
   the section in index.html). Raw WebGL2, no library: one instanced draw for
   every paver, joint strip and layer block, one for the ground.
   Every pixel is a point on the scanner ramp — there is no other colour.
   Proportions are schematic. No depth or spec is drawn or written here. */

// geometry, in model units. Patio top sits at y=0.
const P = 0.11, B = 0.047, G = 0.28, S = 0.42; // pavers, bedding, base, subgrade (schematic)
const U = 0.125, J = 0.012, F = 1.0, IN = 0.75; // paver width, joint, half field, half inner field
const TOPS = [0, -0.012, -P, -P - B, -P - B - G]; // top of each layer, assembled
const BOTS = [-P, -P, -P - B, -P - B - G, -P - B - G - S];
const BOT = BOTS[4];

const VS = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in vec3 aN;
layout(location=2) in vec3 iC; layout(location=3) in vec3 iS; layout(location=4) in vec2 iL;
uniform mat4 uVP; uniform vec2 uYaw; uniform float uOff[5]; uniform vec3 uFit;
out vec3 vM; out vec3 vN; out vec3 vNm; out vec3 vL; flat out vec3 vS; flat out int vLy; out float vVar;
void main(){
  int L=int(iL.x+.5); vec3 m=iC+aP*iS; m.y+=uOff[L];
  float c=uYaw.x,s=uYaw.y;
  vec3 w=vec3(c*m.x+s*m.z,m.y,-s*m.x+c*m.z);
  vN=vec3(c*aN.x+s*aN.z,aN.y,-s*aN.x+c*aN.z);
  gl_Position=uVP*vec4(w,1.); gl_Position.xy=gl_Position.xy*uFit.x+uFit.yz*gl_Position.w;
  vM=m; vNm=aN; vL=aP*iS; vS=iS; vLy=L; vVar=iL.y;
}`;

const RAMP = `
vec3 ramp(float t){ t=clamp(t,0.,1.);
  const vec3 c0=vec3(0.,6.,12.)/255., c1=vec3(5.,32.,42.)/255., c2=vec3(31.,110.,120.)/255., c3=vec3(108.,195.,202.)/255., c4=vec3(214.,240.,243.)/255.;
  if(t<.5) return mix(c0,c1,t/.5); if(t<.76) return mix(c1,c2,(t-.5)/.26); if(t<.92) return mix(c2,c3,(t-.76)/.16); return mix(c3,c4,(t-.92)/.08); }
const vec3 BG=vec3(3.,8.,13.)/255.;
float h13(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(mix(h13(i),h13(i+vec3(1,0,0)),f.x),mix(h13(i+vec3(0,1,0)),h13(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h13(i+vec3(0,0,1)),h13(i+vec3(1,0,1)),f.x),mix(h13(i+vec3(0,1,1)),h13(i+vec3(1,1,1)),f.x),f.y),f.z);}
float scanT(float s,float at,float px){ if(at<-50.) return 0.; float d=s-at;
  return (1.-smoothstep(px*.5,px*1.7,abs(d)))*.42 + (d<0.?exp(d*7.)*.13:0.); }
`;

const FS = `#version 300 es
precision highp float;
in vec3 vM; in vec3 vN; in vec3 vNm; in vec3 vL; flat in vec3 vS; flat in int vLy; in float vVar;
uniform float uScan[5]; uniform float uAct[5]; uniform float uG;
out vec4 o;
${RAMP}
vec2 worley(vec3 p){vec3 i=floor(p),f=fract(p);float d1=9.,d2=9.,id=0.;
  for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){vec3 g=vec3(x,y,z);
    vec3 r=g+vec3(h13(i+g),h13(i+g+17.1),h13(i+g+41.7))-f;float d=dot(r,r);
    if(d<d1){d2=d1;d1=d;id=h13(i+g+7.7);}else if(d<d2)d2=d;}
  return vec2(sqrt(d2)-sqrt(d1),id);}
void main(){
  vec3 n=normalize(vN); float lam=max(dot(n,normalize(vec3(-.55,.9,.25))),0.);
  vec3 a=abs(vNm), d=vS*.5-abs(vL);
  float e=a.x>.5?min(d.y,d.z):(a.y>.5?min(d.x,d.z):min(d.x,d.y));
  float px=length(fwidth(vM));
  float edge=1.-smoothstep(px*.5,px*1.5,e);
  bool top=vNm.y>.5;
  float sl=clamp(dot(n.xz,vec2(-.8,.6))*.5+.5,0.,1.);           // which side face, lit or shaded
  float yl=clamp(vL.y/vS.y+.5,0.,1.);                            // 0 at the bottom of a box, 1 at its top
  float t;
  if(vLy==0){ t=top? .872+vVar*.04+(vn(vM*70.)-.5)*.03+.05*(1.-smoothstep(px*1.5,.016,e))-.13*(1.-smoothstep(px*.3,px*1.1,e))
                   : mix(.52,.68,sl)-(1.-yl)*.08;
    t+=(top?0.:edge*.04); }
  else if(vLy==1){ t=top? .935 : mix(.6,.74,sl)-(1.-yl)*.08; }
  else if(vLy==2){ t=top? .8+(vn(vM*150.)-.5)*.06 : mix(.6,.7,sl); t+=edge*.16; }
  else if(vLy==3){ vec2 w=worley(vM*24.);
    t=(top? .73 : mix(.56,.66,sl)-(1.-yl)*.06)+(w.y-.5)*.11-(1.-smoothstep(0.,.13,w.x))*.12+edge*.2; }
  else { float f=vn(vM*vec3(5.,16.,5.))*.6+vn(vM*vec3(22.,55.,22.))*.4;
    t=(top? .67 : mix(.5,.62,sl))+(f-.5)*.1+sin(vM.y*80.+f*7.)*.012+edge*.18; }
  t+=uAct[vLy]*.03;
  t+=scanT(vM.x,uScan[vLy],px)+scanT(vM.x,uG,px)*.5;
  vec3 col=ramp(t);
  float al=vLy==4?smoothstep(${BOT.toFixed(3)},${(BOT + 0.3).toFixed(3)},vM.y):1.;
  o=vec4(col*al,al);   // premultiplied: the subgrade fades into whatever is behind the canvas
}`;

const GVS = `#version 300 es
layout(location=0) in vec2 aP;
uniform mat4 uVP; uniform vec2 uYaw; uniform vec3 uFit;
out vec2 vP;
void main(){ vec3 m=vec3(aP.x,-.0015,aP.y); float c=uYaw.x,s=uYaw.y;
  vec3 w=vec3(c*m.x+s*m.z,m.y,-s*m.x+c*m.z);
  gl_Position=uVP*vec4(w,1.); gl_Position.xy=gl_Position.xy*uFit.x+uFit.yz*gl_Position.w; vP=aP; }`;

const GFS = `#version 300 es
precision highp float;
in vec2 vP; uniform float uA; uniform float uG; out vec4 o;
${RAMP}
void main(){
  vec2 p=vP; float ed=max(abs(p.x),abs(p.y))-${F.toFixed(3)};
  if(ed<0.) discard;
  float fw=fwidth(p.x)+fwidth(p.y);
  float fade=1.-smoothstep(1.2,4.2,length(p));
  vec2 g=abs(fract(p/.25+.5)-.5)*.25;
  float gl=1.-smoothstep(fw*.25,fw*.8,min(g.x,g.y));
  float ol=1.-smoothstep(fw*.3,fw*1.1,ed);
  float sc=scanT(p.x,uG,fw);
  vec3 c=mix(BG,ramp(.8),gl*fade*.3);
  c=mix(c,ramp(.78+sc*.3),min(1.,sc*1.3)*fade*(.35+.65*gl));
  c=mix(c,vec3(90.,191.,198.)/255.,ol*.85);
  o=vec4(c*uA,uA);
}`;

/* ---------- patio build ---------- */
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function buildInstances() {
  const out = [], r = rng(20260930), rects = [];
  const box = (x0, z0, x1, z1, y0, y1, L, v) => out.push((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, L, v);
  // 90° herringbone, lattice (1,1),(2,-2) in paver widths; clipped to the inner field
  const ox = -0.0625, oz = 0.0625;
  for (let i = -24; i <= 24; i++) for (let j = -12; j <= 12; j++) {
    const dx = i + 2 * j, dy = i - 2 * j;
    for (const [a, b, c, e] of [[dx, dy, dx + 2, dy + 1], [dx, dy + 1, dx + 1, dy + 3]]) {
      const x0 = Math.max(-IN, ox + a * U), x1 = Math.min(IN, ox + c * U);
      const z0 = Math.max(-IN, oz + b * U), z1 = Math.min(IN, oz + e * U);
      if (x1 - x0 > 0.004 && z1 - z0 > 0.004) rects.push([x0, z0, x1, z1]);
    }
  }
  // soldier course: long side across the border, and a pair of pavers in each corner
  for (let k = 0; k < 12; k++) {
    const a = -IN + k * U;
    rects.push([a, IN, a + U, F], [a, -F, a + U, -IN], [IN, a, F, a + U], [-F, a, -IN, a + U]);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x0 = sx > 0 ? IN : -F, z0 = sz > 0 ? IN : -F;
    rects.push([x0, z0, x0 + U, z0 + 0.25], [x0 + U, z0, x0 + 0.25, z0 + 0.25]);
  }
  const h = J / 2;
  for (const [x0, z0, x1, z1] of rects) {
    box(x0 + h, z0 + h, x1 - h, z1 - h, -P, 0, 0, r() * 2 - 1);
    box(x0, z0, x0 + h, z1, -P, TOPS[1], 1, 0); box(x1 - h, z0, x1, z1, -P, TOPS[1], 1, 0);
    box(x0 + h, z0, x1 - h, z0 + h, -P, TOPS[1], 1, 0); box(x0 + h, z1 - h, x1 - h, z1, -P, TOPS[1], 1, 0);
  }
  for (let L = 2; L < 5; L++) box(-F, -F, F, F, BOTS[L], TOPS[L], L, 0);
  return new Float32Array(out);
}

function cube() {
  const v = [], idx = [];
  const faces = [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];
  for (const n of faces) {
    const a = n[0] ? [0, 1, 0] : [1, 0, 0], b = [n[1] * a[2] - n[2] * a[1], n[2] * a[0] - n[0] * a[2], n[0] * a[1] - n[1] * a[0]];
    const base = v.length / 6;
    for (const [s, t] of [[-1, -1], [1, -1], [1, 1], [-1, 1]])
      v.push(0.5 * (n[0] + s * a[0] + t * b[0]), 0.5 * (n[1] + s * a[1] + t * b[1]), 0.5 * (n[2] + s * a[2] + t * b[2]), ...n);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return [new Float32Array(v), new Uint16Array(idx)];
}

/* ---------- maths ---------- */
function persp(f, a, n, fa) { const t = 1 / Math.tan(f / 2); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, 2 * fa * n / (n - fa), 0]; }
function lookAt(e, c) {
  let z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]], l = Math.hypot(...z); z = z.map(q => q / l);
  let x = [z[2], 0, -z[0]]; l = Math.hypot(...x); x = x.map(q => q / l);
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  const d = (u) => -(u[0] * e[0] + u[1] * e[1] + u[2] * e[2]);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, d(x), d(y), d(z), 1];
}
function mul(a, b) { const o = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
const ss = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- the timeline: q is progress through the pin, pre is the approach ---------- */
function timeline(q, pre) {
  const close = (k) => 1 - ss(0.70 + 0.035 * (3 - k), 0.80 + 0.035 * (3 - k), q); // bottom gap closes first
  const sep = [0, 1, 2, 3].map(k => ss(0.05 + 0.13 * k, 0.16 + 0.13 * k, q) * close(k));
  let act = -1;
  if (q >= 0.035 && q < 0.70) act = Math.min(4, Math.floor((q - 0.035) / 0.13));
  return {
    sep, act,
    ground: Math.min(1, 1 - ss(0, 0.06, q) + ss(0.86, 0.93, q)),
    labels: ss(0.025, 0.08, q) * (1 - ss(0.68, 0.74, q)),
    yaw: (28 + 14 * pre + 8 * ss(0, 0.62, q) + 90 * ss(0.70, 0.90, q)) * Math.PI / 180,
    wm: ss(0.86, 0.95, q),
    explode: ss(0.03, 0.12, q) * (1 - ss(0.74, 0.9, q)),
  };
}

export function renderer(canvas, opts = {}) {
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const prog = (v, f) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; };
  const pB = prog(VS, FS), pG = prog(GVS, GFS);
  const U_ = (p, n) => gl.getUniformLocation(p, n);
  const ub = { vp: U_(pB, 'uVP'), yaw: U_(pB, 'uYaw'), off: U_(pB, 'uOff'), fit: U_(pB, 'uFit'), scan: U_(pB, 'uScan'), act: U_(pB, 'uAct'), g: U_(pB, 'uG') };
  const ug = { vp: U_(pG, 'uVP'), yaw: U_(pG, 'uYaw'), fit: U_(pG, 'uFit'), a: U_(pG, 'uA'), g: U_(pG, 'uG') };

  const [cv, ci] = cube(), inst = buildInstances(), count = inst.length / 8;
  const vaoB = gl.createVertexArray(); gl.bindVertexArray(vaoB);
  let b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, cv, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
  b = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ci, gl.STATIC_DRAW);
  b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW);
  [[2, 3, 0], [3, 3, 12], [4, 2, 24]].forEach(([l, n, o]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 32, o); gl.vertexAttribDivisor(l, 1); });
  const vaoG = gl.createVertexArray(); gl.bindVertexArray(vaoG);
  b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-6, -6, 6, -6, 6, 6, -6, -6, 6, 6, -6, 6]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
  gl.bindVertexArray(null);

  const EL = 30 * Math.PI / 180, FOV = 11 * Math.PI / 180, DIST = 26;
  let W = 1, H = 1, VP = null, PR = null, aimY = NaN;
  function aim(y) {
    if (Math.abs(y - aimY) < 1e-5) return; aimY = y;
    VP = mul(PR, lookAt([0, y + DIST * Math.sin(EL), DIST * Math.cos(EL)], [0, y, 0]));
  }
  function size(w, h, dpr) {
    W = w; H = h; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    PR = persp(FOV, w / h, 4, 60); aimY = NaN; aim(-0.4);
  }
  // project a model-space point at a yaw: NDC before the fit
  function pr(x, y, z, c, s) {
    const wx = c * x + s * z, wz = -s * x + c * z, m = VP;
    const X = m[0] * wx + m[4] * y + m[8] * wz + m[12], Y = m[1] * wx + m[5] * y + m[9] * wz + m[13], Wc = m[3] * wx + m[7] * y + m[11] * wz + m[15];
    return [X / Wc, Y / Wc];
  }
  const offsets = (sep, g) => [g * (sep[0] + sep[1] + sep[2] + sep[3]), g * (sep[1] + sep[2] + sep[3]), g * (sep[2] + sep[3]), g * sep[3], 0];
  function bbox(off, yaw) {
    aim((TOPS[0] + off[0] + BOT) / 2);
    const c = Math.cos(yaw), s = Math.sin(yaw); let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
    for (let L = 0; L < 5; L++) for (const y of [TOPS[L] + off[L], (L === 4 ? BOT + 0.22 : BOTS[L]) + off[L]])
      for (const [x, z] of [[-F, -F], [F, -F], [F, F], [-F, F]]) { const p = pr(x, y, z, c, s); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    return [x0, y0, x1, y1];
  }
  // fit a bbox (NDC) into a rect (CSS px, y down): returns [scale, shiftX, shiftY]
  function fitTo(bb, r, maxScale = 99) {
    const nx0 = r[0] / W * 2 - 1, nx1 = r[2] / W * 2 - 1, ny0 = 1 - r[3] / H * 2, ny1 = 1 - r[1] / H * 2;
    const k = Math.min(maxScale, (nx1 - nx0) / (bb[2] - bb[0]), (ny1 - ny0) / (bb[3] - bb[1]));
    return [k, (nx0 + nx1) / 2 - k * (bb[0] + bb[2]) / 2, (ny0 + ny1) / 2 - k * (bb[1] + bb[3]) / 2];
  }
  // pick the explode gap so the fully separated stack fills the rect's shape
  function gapFor(rect, yaw) {
    const ra = (rect[2] - rect[0]) / (rect[3] - rect[1]) * (H / W);
    let lo = 0.3, hi = 2.4;
    for (let i = 0; i < 24; i++) { const g = (lo + hi) / 2, bb = bbox(offsets([1, 1, 1, 1], g), yaw); ((bb[2] - bb[0]) / (bb[3] - bb[1]) > ra) ? (lo = g) : (hi = g); }
    aimY = NaN;
    return (lo + hi) / 2;
  }

  function draw(st, fit, off, scan, gscan) {
    const c = Math.cos(st.yaw), s = Math.sin(st.yaw);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(pB); gl.bindVertexArray(vaoB);
    gl.uniformMatrix4fv(ub.vp, false, VP); gl.uniform2f(ub.yaw, c, s); gl.uniform3f(ub.fit, ...fit);
    gl.uniform1fv(ub.off, off); gl.uniform1fv(ub.scan, scan);
    gl.uniform1fv(ub.act, [0, 1, 2, 3, 4].map(L => L === st.act ? 1 : 0)); gl.uniform1f(ub.g, gscan);
    gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, count);
    if (st.ground > 0.002) {
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      gl.useProgram(pG); gl.bindVertexArray(vaoG);
      gl.uniformMatrix4fv(ug.vp, false, VP); gl.uniform2f(ug.yaw, c, s); gl.uniform3f(ug.fit, ...fit);
      gl.uniform1f(ug.a, st.ground); gl.uniform1f(ug.g, gscan);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.bindVertexArray(null);
  }
  // screen-space anchor (CSS px) for each layer: the right-hand corner of its top face
  function anchors(yaw, off, fit) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return [0, 1, 2, 3, 4].map(L => {
      let best = null;
      for (const [x, z] of [[-F, -F], [F, -F], [F, F], [-F, F]]) { const p = pr(x, TOPS[L] + off[L], z, c, s); if (!best || p[0] > best[0]) best = p; }
      const nx = best[0] * fit[0] + fit[1], ny = best[1] * fit[0] + fit[2];
      return [(nx + 1) / 2 * W, (1 - ny) / 2 * H];
    });
  }
  return { gl, size, draw, bbox, aim, fitTo, gapFor, offsets, anchors, count };
}

/* ---------- the live section ---------- */
export function start(section) {
  const stage = section.querySelector('.sub-stage'), canvas = section.querySelector('.sub-cv');
  const head = section.querySelector('.sub-head'), foot = section.querySelector('.sub-foot'), wm = section.querySelector('.sub-wm');
  const items = [...section.querySelectorAll('.sub-list li')], count = section.querySelector('.sub-count');
  const lead = section.querySelector('.sub-lead');
  let R;
  try { R = renderer(canvas); } catch (e) { R = null; }
  if (!R) { section.setAttribute('data-mode', 'static'); return; }

  const NS = 'http://www.w3.org/2000/svg';
  const lines = items.map(() => { const l = document.createElementNS(NS, 'line'); lead.appendChild(l); return l; });
  const dots = items.map(() => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '2.5'); lead.appendChild(c); return c; });

  let dprCap = 2, slow = 0; // drops to 1.5, then 1, if a phone can't hold the frame rate
  let W = 0, H = 0, narrow = true, fullR, leftR, gap = 0.5, colW = 150, hFull = [], hMin = [];
  function layout() {
    const r = stage.getBoundingClientRect(); W = r.width; H = r.height;
    R.size(W, H, Math.min(dprCap, window.devicePixelRatio || 1));
    narrow = W < 760;
    const top = head.getBoundingClientRect().bottom - r.top + (narrow ? 18 : 28);
    const bot = foot.getBoundingClientRect().top - r.top - (narrow ? 14 : 24);
    const wmH = wm.offsetHeight + (narrow ? 14 : 22);
    colW = narrow ? Math.min(158, W * 0.4) : 300;
    section.style.setProperty('--sub-col', colW + 'px');
    const pad = narrow ? 16 : 40;
    const fw = narrow ? W - 2 * pad : Math.min(W * 0.52, 680);
    fullR = [(W - fw) / 2, top, (W + fw) / 2, bot - wmH];
    const lw = narrow ? W - 2 * pad - colW - 26 : Math.min(W * 0.27, 400, (bot - top) * 0.5);
    const lx = narrow ? pad : Math.max(pad, W / 2 - lw * 0.92);
    leftR = [lx, top + (narrow ? 4 : 0), lx + lw, bot - (narrow ? 4 : 0)];
    gap = R.gapFor(leftR, 50 * Math.PI / 180);
    lead.setAttribute('viewBox', `0 0 ${W} ${H}`);
    // label heights, with and without the line of text
    items.forEach((li, i) => { li.classList.add('on'); hFull[i] = li.offsetHeight; li.classList.remove('on'); hMin[i] = narrow ? li.offsetHeight : hFull[i]; });
    items.forEach(li => li.classList.toggle('on', false));
    lastAct = -2;
  }

  // scroll → target progress; the drawn state eases after it
  let q = 0, pre = 0, qs = -1, pres = 0;
  function measure() {
    const r = section.getBoundingClientRect(), vh = window.innerHeight;
    const D = section.offsetHeight - stage.offsetHeight;
    q = Math.min(1, Math.max(0, -r.top / D));
    pre = Math.min(1, Math.max(0, 1 - r.top / vh));
  }

  let lastAct = -2, tNow = 0;
  function frame(dt) {
    measure();
    if (qs < 0) { qs = q; pres = pre; }
    const k = 1 - Math.exp(-dt * 9);
    qs += (q - qs) * k; pres += (pre - pres) * k;
    const st = timeline(qs, pres);
    const off = R.offsets(st.sep, gap);
    // framing: whole stage when assembled, left column when apart
    const e = st.explode, rect = fullR.map((v, i) => lerp(v, leftR[i], e));
    const fit = R.fitTo(R.bbox(off, st.yaw), rect, narrow ? 99 : 99);
    // the scan line: sweeps the layer in focus; the hero gets a slower sweep over the ground
    const period = 2.3, ph = (tNow / period) % 1;
    const scan = [0, 1, 2, 3, 4].map(L => (L === st.act ? lerp(-1.25, 1.25, ph) : -99));
    const gph = (tNow / 5.2) % 1, gscan = st.ground > 0.4 ? lerp(-4, 4, gph) : -99;
    R.draw(st, fit, off, scan, gscan);

    // labels
    const an = R.anchors(st.yaw, off, fit);
    if (st.act !== lastAct) {
      items.forEach((li, i) => { li.classList.toggle('on', i === st.act || !narrow); li.classList.toggle('cur', i === st.act); });
      if (count) count.textContent = st.act >= 0 ? String(st.act + 1).padStart(2, '0') + ' / 05' : '';
      lastAct = st.act;
    }
    const reached = (i) => st.act >= i || (st.act === -1 && qs > 0.5 && qs < 0.7);
    let x = Math.max(...an.map(a => a[0])) + (narrow ? 18 : 30);
    x = Math.min(x, W - colW - (narrow ? 12 : 40));
    let y = [], prevBottom = -1e9;
    items.forEach((li, i) => {
      const h = (i === st.act || !narrow) ? hFull[i] : hMin[i];
      let yi = an[i][1] - 11; yi = Math.max(yi, prevBottom + (narrow ? 8 : 14)); y[i] = yi; prevBottom = yi + h;
    });
    const maxB = leftR[3] + 10;
    if (prevBottom > maxB) { let shift = prevBottom - maxB; for (let i = 4; i >= 0; i--) { y[i] -= shift; if (i > 0) { const h = (i - 1 === st.act || !narrow) ? hFull[i - 1] : hMin[i - 1]; const room = y[i] - (y[i - 1] + h + 8); shift = room < 0 ? -room : 0; } } }
    items.forEach((li, i) => {
      const vis = reached(i) ? st.labels : 0;
      li.style.transform = `translate3d(${x.toFixed(1)}px,${(y[i] + (1 - vis) * 8).toFixed(1)}px,0)`;
      li.style.opacity = vis.toFixed(3);
      const l = lines[i], d = dots[i];
      l.setAttribute('x1', an[i][0].toFixed(1)); l.setAttribute('y1', an[i][1].toFixed(1));
      l.setAttribute('x2', (x - 6).toFixed(1)); l.setAttribute('y2', (y[i] + 11).toFixed(1));
      l.style.opacity = d.style.opacity = vis.toFixed(3);
      d.setAttribute('cx', an[i][0].toFixed(1)); d.setAttribute('cy', an[i][1].toFixed(1));
    });
    wm.style.opacity = st.wm.toFixed(3);
    wm.style.transform = `translate3d(-50%,${((1 - st.wm) * 10).toFixed(1)}px,0)`;
  }

  // run only while the section is on screen
  let on = false, raf = 0, last = 0, manual = false;
  const loop = (t) => { raf = 0; if (!on || manual) return; const dt = last ? Math.min(0.1, (t - last) / 1000) : 1 / 60; last = t; tNow += dt; frame(dt);
    slow = dt > 1 / 40 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 45 && dprCap > 1) { dprCap = dprCap > 1.5 ? 1.5 : 1; slow = 0; layout(); } raf = requestAnimationFrame(loop); };
  const kick = () => { if (on && !raf && !manual && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } };
  new IntersectionObserver(es => { on = es[0].isIntersecting; kick(); }).observe(section);
  document.addEventListener('visibilitychange', kick);
  new ResizeObserver(() => { layout(); if (!raf) frame(0); }).observe(stage);
  layout(); frame(0);
  section.setAttribute('data-mode', 'live');
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); section.setAttribute('data-mode', 'static'); on = false; });

  // hook for the recording script only (?substrate-debug): step time by hand
  if (/substrate-debug/.test(location.search)) {
    window.__substrate = {
      manual(v) { manual = v; if (!v) kick(); },
      step(dt) { tNow += dt; frame(dt); },
      time(dt, n) { // ms per frame: JS alone, then JS + GPU (a 1px read forces each frame to finish)
        const px = new Uint8Array(4), g = R.gl; let t0 = performance.now();
        for (let i = 0; i < n; i++) { tNow += dt; frame(dt); }
        const js = (performance.now() - t0) / n; t0 = performance.now();
        for (let i = 0; i < n; i++) { tNow += dt; frame(dt); g.readPixels(0, 0, 1, 1, g.RGBA, g.UNSIGNED_BYTE, px); }
        return { js, full: (performance.now() - t0) / n };
      },
      count: R.count,
    };
  }
}

/* ---------- poster: the exploded section on its own, for the static fallback ---------- */
export function poster(canvas, w, h, dpr) {
  const R = renderer(canvas); R.size(w, h, dpr);
  const yaw = 48 * Math.PI / 180, rect = [10, 10, w - 10, h - 10];
  const g = R.gapFor(rect, yaw), off = R.offsets([1, 1, 1, 1], g);
  const fit = R.fitTo(R.bbox(off, yaw), rect);
  R.draw({ yaw, act: -1, ground: 0 }, fit, off, [-99, -99, -99, -99, -99], -99);
  R.gl.finish();
  return R.anchors(yaw, off, fit).map(([x, y]) => [x / w * 100, y / h * 100]);
}
