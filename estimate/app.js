/* PHAÖRA instant estimate.
 *
 * The page is phaora.com's. Three things it cannot hold live behind the API on
 * crm.phaora.com: the Maps key (billable), the rate card (every number PHAÖRA
 * quotes from — not something to publish in view-source), and the database.
 * Everything else — the geometry, the drag, the arithmetic of feet — happens
 * here, so the page answers instantly and works if the network hiccups.
 */
"use strict";

const API = "https://crm.phaora.com/api/estimate";
const BOX = 640;                    // the tile proxy always returns 640×640 at scale 2
const ZMIN = 17, ZMAX = 21;
const FT_PER_M = 3.280839895;
const M_PER_DEG_LAT = 110574;
const mPerDegLng = (lat) => 111320 * Math.cos((lat * Math.PI) / 180);

/* ── Surfaces ─────────────────────────────────────────────────────────────
 * Labels and photographs only. The prices these map to never leave the API. */
const SURFACES = [
  {
    id: "patio", label: "Patio", photo: "../portfolio/images/patio-firepit-lit.jpg",
    bills: "sqft", defaultFt: [24, 18],
    noun: "patio",
    materials: [
      { id: "pavers_concrete", label: "Concrete paver" },
      { id: "bluestone", label: "Bluestone" },
      { id: "flagstone", label: "Flagstone" },
      { id: "brick", label: "Brick" },
    ],
    conditions: [
      { id: "demo_required", label: "There is a patio or slab there now" },
      { id: "drainage_required", label: "Water pools or runs toward the house" },
      { id: "difficult_access", label: "No machine access — gate, steps or slope" },
    ],
    drivers: [
      "Base depth — six inches compacted is the difference between flat in ten years and heaved in two",
      "Whether the ground drains or has to be made to",
      "Material: concrete paver, bluestone, granite",
      "Cuts — curves and angles cost more than a rectangle",
      "Access: can a machine reach it, or is it wheelbarrows",
    ],
  },
  {
    id: "driveway", label: "Driveway", photo: "../portfolio/images/paver-driveway.jpg",
    bills: "sqft", defaultFt: [42, 16],
    noun: "driveway",
    materials: [
      { id: "pavers_concrete", label: "Concrete paver" },
      { id: "granite_cobble_running", label: "Granite cobble, running bond" },
      { id: "granite_cobble_fan", label: "Granite cobble, fan pattern" },
      { id: "bluestone", label: "Bluestone" },
    ],
    conditions: [
      { id: "demo_required", label: "The old driveway has to come out" },
      { id: "base_failure_present", label: "It is sunken, cracked or heaved" },
      { id: "drainage_required", label: "Water pools or runs toward the house" },
      { id: "difficult_access", label: "Tight or steep access for equipment" },
    ],
    drivers: [
      "Base depth, heavier than a patio because it carries vehicles",
      "Drainage and where the water goes at the street",
      "Edge restraint and the border course",
      "Removal and disposal of what is there now",
      "Apron work where it meets the road",
    ],
  },
  {
    id: "walkway", label: "Walkway", photo: "../portfolio/images/paver-walkway.jpg",
    bills: "sqft", defaultFt: [28, 4],
    noun: "walkway",
    materials: [
      { id: "bluestone", label: "Bluestone" },
      { id: "pavers_concrete", label: "Concrete paver" },
      { id: "flagstone", label: "Flagstone" },
      { id: "brick", label: "Brick" },
    ],
    conditions: [
      { id: "demo_required", label: "There is a walk there now" },
      { id: "difficult_access", label: "Tight or steep access for equipment" },
    ],
    drivers: [
      "Length and width, and how many turns",
      "Steps or landings anywhere along it",
      "Material and whether it matches existing stone",
      "Lighting, if it is going in at the same time",
    ],
  },
  {
    id: "wall", label: "Retaining wall", photo: "../portfolio/images/retaining-wall-lit.jpg",
    bills: "linear_ft", defaultFt: [26, 0],
    noun: "wall",
    materials: [
      { id: "fieldstone_wall", label: "Natural fieldstone" },
      { id: "belgian_block", label: "Belgian block" },
    ],
    conditions: [
      { id: "drainage_required", label: "Water comes down at it, or it holds a wet bank" },
      { id: "difficult_access", label: "Tight or steep access for equipment" },
    ],
    drivers: [
      "Height — the single biggest driver, and over four feet usually needs an engineer",
      "What is behind it: drainage stone, filter fabric, and where the water leaves",
      "Geogrid, on anything holding real load",
      "Block, or natural stone laid dry",
      "Whether the failing wall has to come out first",
    ],
  },
];

/* ── Geometry ─────────────────────────────────────────────────────────────
 * Corners are latitude and longitude, never screen pixels. Pan or zoom and
 * the picture moves; the measurement never does. */
const toM = (p, o) => ({
  x: (p.lng - o.lng) * mPerDegLng(o.lat),
  y: (o.lat - p.lat) * M_PER_DEG_LAT,
});
const fromM = (m, o) => ({
  lat: o.lat - m.y / M_PER_DEG_LAT,
  lng: o.lng + m.x / mPerDegLng(o.lat),
});
const metresPerPixel = (lat, zoom) => (156543.03392 * Math.cos((lat * Math.PI) / 180)) / (2 ** zoom * 2);

function areaSqFt(pts) {
  if (pts.length < 3) return 0;
  const o = pts[0], m = pts.map((p) => toM(p, o));
  let a = 0;
  for (let i = 0; i < m.length; i++) {
    const p = m[i], q = m[(i + 1) % m.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2 / 0.09290304;
}
function runFt(pts, closed) {
  if (pts.length < 2) return 0;
  const o = pts[0], m = pts.map((p) => toM(p, o));
  let t = 0;
  const last = closed ? m.length : m.length - 1;
  for (let i = 0; i < last; i++) {
    const p = m[i], q = m[(i + 1) % m.length];
    t += Math.hypot(q.x - p.x, q.y - p.y);
  }
  return t * FT_PER_M;
}
const edgeFt = (a, b) => { const m = toM(b, a); return Math.hypot(m.x, m.y) * FT_PER_M; };
const midpoint = (a, b) => ({ lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 });
const centroid = (pts) => ({
  lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
  lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
});

/** A rectangle of the given size on the property, or a line for a wall. */
function startingShape(c, lengthFt, widthFt, closed) {
  const l = (lengthFt * 0.3048) / 2;
  if (!closed) return [fromM({ x: -l, y: 0 }, c), fromM({ x: l, y: 0 }, c)];
  const w = (widthFt * 0.3048) / 2;
  return [
    fromM({ x: -l, y: -w }, c), fromM({ x: l, y: -w }, c),
    fromM({ x: l, y: w }, c), fromM({ x: -l, y: w }, c),
  ];
}

/* ── State ────────────────────────────────────────────────────────────── */
const S = {
  surface: SURFACES[0],
  material: SURFACES[0].materials[0].id,
  conds: {},
  mode: "type",
  place: null,
  centre: null,
  zoom: 20,
  pts: [],
  quote: null,
  src: new URLSearchParams(location.search).get("src") || "",
};

const $ = (id) => document.getElementById(id);
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const isWall = () => S.surface.bills === "linear_ft";

function measured() {
  if (S.mode === "trace") {
    if (isWall()) return { sqft: 0, linearFt: runFt(S.pts, false) };
    if (S.pts.length < 3) return { sqft: 0, linearFt: 0 };
    return { sqft: areaSqFt(S.pts), linearFt: runFt(S.pts, true) };
  }
  const l = parseFloat($("len").value) || 0;
  if (isWall()) return { sqft: 0, linearFt: l };
  const w = parseFloat($("wid").value) || 0;
  return { sqft: l * w, linearFt: 2 * (l + w) };
}
const sized = (m) => (isWall() ? m.linearFt > 0 : m.sqft > 0);

/* ── Rendering ────────────────────────────────────────────────────────── */
function renderTiles() {
  $("tiles").innerHTML = SURFACES.map((s) => `
    <button class="tile" data-id="${s.id}" aria-pressed="${s.id === S.surface.id}">
      <img src="${s.photo}" alt="${s.label} built by PHAÖRA" loading="lazy">
      <span class="cap">${s.label}</span>
    </button>`).join("");
  $("tiles").querySelectorAll(".tile").forEach((b) =>
    b.addEventListener("click", () => pickSurface(b.dataset.id)));
}

function renderMats() {
  $("mats").innerHTML = S.surface.materials.map((m) => `
    <button class="mat" data-id="${m.id}" aria-pressed="${m.id === S.material}">${m.label}</button>`).join("");
  $("mats").querySelectorAll(".mat").forEach((b) =>
    b.addEventListener("click", () => { S.material = b.dataset.id; renderMats(); refresh(); }));
}

function renderConds() {
  $("conds").innerHTML = S.surface.conditions.map((c) => `
    <label class="cond"><input type="checkbox" data-id="${c.id}"${S.conds[c.id] ? " checked" : ""}><span>${c.label}</span></label>`).join("");
  $("conds").querySelectorAll("input").forEach((i) =>
    i.addEventListener("change", () => { S.conds[i.dataset.id] = i.checked; refresh(); }));
}

function renderStatic() {
  $("drivers").innerHTML = S.surface.drivers.map((d) => `<li>${d}</li>`).join("");
  $("wid-wrap").hidden = isWall();
  $("type-hint").textContent = isWall()
    ? "How far does the wall run? Pace it if you have to — a stride is about three feet."
    : "Rough outside dimensions. Pacing it off is close enough; the visit is what makes it exact.";
  $("trace-hint").textContent = isWall()
    ? "Drag each end to where the wall starts and finishes. Drag the map to look around."
    : `Drag the corners to the edges of your ${S.surface.noun}. Drag the middle to move the whole shape, or the map to look around.`;
}

function pickSurface(id) {
  S.surface = SURFACES.find((s) => s.id === id) || SURFACES[0];
  S.material = S.surface.materials[0].id;
  S.conds = {};
  S.pts = S.centre ? startingShape(S.centre, S.surface.defaultFt[0], S.surface.defaultFt[1], !isWall()) : [];
  renderTiles(); renderMats(); renderConds(); renderStatic(); drawShape(); refresh();
}

function renderReadout(m) {
  const el = $("readout");
  if (!sized(m)) { el.hidden = true; return; }
  el.hidden = false;
  const area = `<div class="big"><div class="n serif">${Math.round(m.sqft).toLocaleString()}</div><div class="l">square feet</div></div>`;
  const run = `<div class="${isWall() ? "big" : "sm"}"><div class="n serif">${Math.round(m.linearFt).toLocaleString()}</div><div class="l">${isWall() ? "feet of wall" : "feet around"}</div></div>`;
  el.innerHTML = (isWall() ? "" : area) + run;
}

function renderRange() {
  const el = $("range");
  const q = S.quote;
  if (!q) { el.hidden = true; return; }
  el.hidden = false;
  const mat = S.surface.materials.find((m) => m.id === S.material);
  const adds = (q.adds || []).map((a) => `
    <div><span>${a.label}</span><b>${a.usd != null ? "+ " + money(a.usd) : "+ " + Math.round(a.pct * 100) + "%"}</b></div>`).join("");
  el.innerHTML = `
    <p class="fig serif">${money(q.low)}<i>–</i>${money(q.high)}</p>
    <p class="note">${mat ? mat.label : ""} at ${q.quantity.toLocaleString()} ${q.unit === "lf" ? "ft" : "sq ft"} — our own pricing, not an internet average.</p>
    ${adds ? `<div class="adds">${adds}</div>` : ""}`;
}

/* ── Pricing ──────────────────────────────────────────────────────────────
 * Debounced: dragging a corner changes the size on every frame, and the rate
 * card is not worth a request per frame. */
let quoteTimer = null;
let quoteSeq = 0;
function refresh() {
  const m = measured();
  renderReadout(m);
  if (!sized(m)) { S.quote = null; renderRange(); return; }
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(() => askForPrice(m), 260);
}

async function askForPrice(m) {
  const seq = ++quoteSeq;
  try {
    const r = await fetch(`${API}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surfaceId: S.surface.id, material: S.material,
        sqft: m.sqft, linearFt: m.linearFt, conditions: S.conds,
      }),
    });
    const j = await r.json();
    if (seq !== quoteSeq) return;             // a later drag already won
    S.quote = j && j.ok ? j : null;
  } catch {
    if (seq === quoteSeq) S.quote = null;     // the measurement still stands
  }
  renderRange();
}

/* ── The satellite tracer ─────────────────────────────────────────────────
 * It opens with a shape already on the property and asks for an adjustment.
 * Creating a shape by tapping corners is the wrong task on a phone: the target
 * is under your own fingertip and nothing responds until the third tap. */
const project = (p) => {
  if (!S.centre) return { left: 50, top: 50 };
  const mpp = metresPerPixel(S.centre.lat, S.zoom);
  const m = toM(p, S.centre);
  return { left: 50 + (m.x / mpp / BOX) * 100, top: 50 + (m.y / mpp / BOX) * 100 };
};

function unproject(clientX, clientY) {
  const el = $("map");
  if (!S.centre) return null;
  const r = el.getBoundingClientRect();
  const k = BOX / r.width;                    // display px → image px
  const mpp = metresPerPixel(S.centre.lat, S.zoom);
  return fromM({
    x: (clientX - (r.left + r.width / 2)) * k * mpp,
    y: (clientY - (r.top + r.height / 2)) * k * mpp,
  }, S.centre);
}

let grab = null;

function drawShape() {
  if (!S.centre || !S.pts.length) return;
  const closed = !isWall();
  const pt = S.pts.map(project);
  const coords = pt.map((q) => `${q.left},${q.top}`).join(" ");
  $("shape").innerHTML = closed
    ? `<polygon points="${coords}"></polygon>`
    : `<polyline points="${coords}"></polyline>`;

  const grabEl = $("grab");
  grabEl.hidden = !closed;
  if (closed) grabEl.style.clipPath = `polygon(${pt.map((q) => `${q.left}% ${q.top}%`).join(", ")})`;

  // Labels and handles are rebuilt each frame; at four to eight of each the
  // cost is nothing and the alternative is bookkeeping that can go stale.
  $("map").querySelectorAll(".edge-ft,.area-ft,.handle").forEach((n) => n.remove());
  const frag = document.createDocumentFragment();

  const last = closed ? S.pts.length : S.pts.length - 1;
  for (let i = 0; i < last; i++) {
    const a = S.pts[i], b = S.pts[(i + 1) % S.pts.length];
    const q = project(midpoint(a, b));
    const s = document.createElement("span");
    s.className = "edge-ft";
    s.style.left = q.left + "%"; s.style.top = q.top + "%";
    s.textContent = Math.round(edgeFt(a, b)) + " ft";
    frag.appendChild(s);
  }

  const m = measured();
  if (sized(m)) {
    const q = project(centroid(S.pts));
    const s = document.createElement("span");
    s.className = "area-ft";
    s.style.left = q.left + "%"; s.style.top = q.top + "%";
    s.innerHTML = closed
      ? `${Math.round(m.sqft).toLocaleString()}<em>sq ft</em>`
      : `${Math.round(m.linearFt).toLocaleString()}<em>ft</em>`;
    frag.appendChild(s);
  }

  S.pts.forEach((p, i) => {
    const q = project(p);
    const b = document.createElement("button");
    b.className = "handle"; b.type = "button";
    b.setAttribute("aria-label", "Corner " + (i + 1));
    b.style.left = q.left + "%"; b.style.top = q.top + "%";
    b.addEventListener("pointerdown", (e) => {
      e.stopPropagation(); e.preventDefault();
      b.setPointerCapture(e.pointerId);
      grab = { kind: "corner", i };
    });
    b.addEventListener("pointermove", onMove);
    b.addEventListener("pointerup", endDrag);
    b.addEventListener("pointercancel", endDrag);
    frag.appendChild(b);
  });

  $("map").appendChild(frag);
}

function onMove(e) {
  if (!grab) return;
  const here = unproject(e.clientX, e.clientY);
  if (!here) return;
  e.preventDefault();

  if (grab.kind === "corner") {
    S.pts = S.pts.map((p, i) => (i === grab.i ? here : p));
  } else {
    // Resolved against where the drag began rather than accumulated frame to
    // frame, so a fast finger cannot make the shape drift.
    const d = toM(here, grab.from);
    if (grab.kind === "shape") S.pts = grab.original.map((p) => fromM({ x: d.x, y: d.y }, p));
    else { S.centre = fromM({ x: -d.x, y: -d.y }, grab.original); paintTile(); }
  }
  drawShape();
  refresh();
}
function endDrag() { grab = null; }

const paintTile = () => {
  if (S.centre) $("tile").src = `${API}/map?lat=${S.centre.lat}&lng=${S.centre.lng}&z=${S.zoom}`;
};

async function findProperty() {
  const q = $("addr").value.trim();
  const err = $("find-err");
  err.hidden = true;
  const btn = $("find-btn");
  btn.disabled = true; btn.textContent = "Finding…";
  try {
    const r = await fetch(`${API}/geocode?q=${encodeURIComponent(q)}`);
    const j = await r.json();
    if (!j.ok) { err.textContent = j.error || "Couldn't find that address."; err.hidden = false; return; }
    S.place = { lat: j.lat, lng: j.lng, formatted: j.formatted };
    S.centre = { lat: j.lat, lng: j.lng };
    S.zoom = 20;
    S.pts = startingShape(S.centre, S.surface.defaultFt[0], S.surface.defaultFt[1], !isWall());
    if (!$("b-addr").value) $("b-addr").value = j.formatted;
    $("find").hidden = true;
    $("canvas").hidden = false;
    paintTile(); drawShape(); refresh();
  } catch {
    err.textContent = "Couldn't reach the lookup. Type the size instead — it works just as well.";
    err.hidden = false;
  } finally {
    btn.disabled = false; btn.textContent = "Show my property";
  }
}

/* ── Photos ────────────────────────────────────────────────────────────────
 *
 * The measuring flow only covers flat ground — a patio, a drive, a walk, a
 * wall's run. Everything else the company does has no shape to trace: a
 * fireplace, a set of steps, a veneer, a wall that has started to lean. A
 * photograph is how those get priced, and without one this page quietly told
 * anyone whose job was not a rectangle that it was not for them.
 *
 * Shrunk here before it leaves. A photograph off a phone is four megabytes and
 * eight times more pixels than anyone needs to see a wall; at 1600px it is a
 * couple of hundred kilobytes, which matters on a phone standing in a yard.
 * Then it goes straight to storage on a signed URL — never through the API,
 * whose request body is capped well below one untouched photo.
 */
const MAX_PHOTOS = 8;
const shots = [];                       // { id, path, el }

function shrink(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const max = 1600;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * k), h = Math.round(img.height * k);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      c.toBlob((blob) => blob ? resolve(blob) : reject(new Error("encode")), "image/jpeg", 0.82);
    };
    // HEIC off an iPhone can refuse to decode. Send the original rather than
    // nothing — the bucket takes it and it is still a photograph of the job.
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

function note(msg, bad) {
  const el = $("shots-note");
  el.textContent = msg || "";
  el.hidden = !msg;
  el.classList.toggle("err", !!bad);
}

async function addPhoto(file) {
  if (shots.length >= MAX_PHOTOS) { note(`That is ${MAX_PHOTOS} — plenty to go on.`); return; }
  const id = Math.random().toString(36).slice(2);
  const tile = document.createElement("div");
  tile.className = "shot busy";
  tile.innerHTML = `<img alt=""><span class="spin">…</span>`;
  tile.querySelector("img").src = URL.createObjectURL(file);
  $("shots-grid").appendChild(tile);
  const rec = { id, path: null, el: tile };
  shots.push(rec);

  try {
    const small = await shrink(file);
    const r = await fetch(`${API}/photo-url`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name || "photo.jpg" }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "no url");
    const put = await fetch(j.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": small.type || "image/jpeg" },
      body: small,
    });
    if (!put.ok) throw new Error("upload " + put.status);
    rec.path = j.path;
    rec.url = URL.createObjectURL(small);
    tile.classList.remove("busy");
    tile.querySelector(".spin")?.remove();
    // Tapping the picture is how you measure it. The pins are the same gesture
    // as the demo above, on something the satellite could never show.
    tile.addEventListener("click", (ev) => {
      if (ev.target.classList.contains("x")) return;
      if (window.__openMeasure) window.__openMeasure(rec, rec.url);
    });
    tile.title = "Tap to measure this";
    const x = document.createElement("button");
    x.type = "button"; x.className = "x"; x.setAttribute("aria-label", "Remove photo");
    x.textContent = "×";
    x.addEventListener("click", () => {
      const i = shots.indexOf(rec);
      if (i >= 0) shots.splice(i, 1);
      tile.remove();
      note(shots.length ? "" : null);
    });
    tile.appendChild(x);
    note("");
  } catch (err) {
    tile.classList.remove("busy");
    tile.classList.add("bad");
    const sp = tile.querySelector(".spin");
    if (sp) sp.textContent = "failed";
    const i = shots.indexOf(rec);
    if (i >= 0) shots.splice(i, 1);
    note("A photo did not go through. The rest of the form still works — send it and we will ask.", true);
  }
}

$("b-photos").addEventListener("change", (e) => {
  const files = [...(e.target.files || [])];
  e.target.value = "";                  // so the same file can be picked again
  files.forEach(addPhoto);
});

/* ── Booking ──────────────────────────────────────────────────────────── */
async function send() {
  const m = measured();
  const err = $("send-err");
  err.hidden = true;
  if (!$("b-phone").value.trim() && !$("b-email").value.trim()) {
    err.textContent = "Leave a phone or an email so we can reach you."; err.hidden = false; return;
  }
  // A size is no longer the price of entry. Someone whose job is a fireplace
  // has nothing to trace, and turning them away at the last field was the
  // whole reason this page only ever heard about driveways.
  if (!sized(m) && shots.length === 0) {
    err.textContent = "Give us a size up in step two, or add a photo of the job.";
    err.hidden = false; return;
  }
  const btn = $("send");
  btn.disabled = true; btn.textContent = "Sending…";
  try {
    const r = await fetch(`${API}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: $("b-name").value, phone: $("b-phone").value, email: $("b-email").value,
        address: $("b-addr").value || (S.place ? S.place.formatted : ""),
        website: $("website").value,
        surfaceId: S.surface.id, material: S.material, conditions: S.conds,
        sqft: m.sqft, linearFt: m.linearFt, method: S.mode, src: S.src,
        photos: shots.map((p) => p.path).filter(Boolean),
        photo_measures: shots.filter((p) => p.path && p.measure)
          .map((p) => ({ path: p.path, ...p.measure })),
      }),
    });
    const j = await r.json();
    if (!j.ok) { err.textContent = j.error || "Something went wrong."; err.hidden = false; return; }
    const sentPhotos = shots.length;
    $("book-done").textContent = sized(m)
      ? "Got it. Your measurement came with it, so the size is known before the call."
      : sentPhotos
        ? `Got it — ${sentPhotos} photo${sentPhotos === 1 ? "" : "s"} came with it. We will look and come back to you.`
        : "Got it. Expect to hear back shortly.";
    $("book-form").hidden = true;
    $("book-done").hidden = false;
  } catch {
    err.textContent = "We couldn't send that through. Please call (561) 299-1261 — we don't want to lose your project.";
    err.hidden = false;
  } finally {
    btn.disabled = false; btn.textContent = "Book the free visit";
  }
}

/* ── Wiring ───────────────────────────────────────────────────────────── */
function setMode(mode) {
  S.mode = mode;
  $("m-type").setAttribute("aria-pressed", String(mode === "type"));
  $("m-trace").setAttribute("aria-pressed", String(mode === "trace"));
  $("pane-type").hidden = mode !== "type";
  $("pane-trace").hidden = mode !== "trace";
  refresh();
}

$("m-type").addEventListener("click", () => setMode("type"));
$("m-trace").addEventListener("click", () => setMode("trace"));
$("len").addEventListener("input", refresh);
$("wid").addEventListener("input", refresh);
$("find-btn").addEventListener("click", findProperty);
$("addr").addEventListener("keydown", (e) => { if (e.key === "Enter") findProperty(); });
$("send").addEventListener("click", send);

$("map").addEventListener("pointerdown", (e) => {
  const from = unproject(e.clientX, e.clientY);
  if (!from || !S.centre) return;
  $("map").setPointerCapture(e.pointerId);
  grab = { kind: "map", from, original: S.centre };
});
$("map").addEventListener("pointermove", onMove);
$("map").addEventListener("pointerup", endDrag);
$("map").addEventListener("pointercancel", endDrag);

$("grab").addEventListener("pointerdown", (e) => {
  const from = unproject(e.clientX, e.clientY);
  if (!from) return;
  e.stopPropagation();
  $("grab").setPointerCapture(e.pointerId);
  grab = { kind: "shape", from, original: S.pts.slice() };
});
$("grab").addEventListener("pointermove", onMove);
$("grab").addEventListener("pointerup", endDrag);
$("grab").addEventListener("pointercancel", endDrag);

const zoomBy = (d) => {
  S.zoom = Math.min(ZMAX, Math.max(ZMIN, S.zoom + d));
  paintTile(); drawShape();
};
$("zin").addEventListener("click", (e) => { e.stopPropagation(); zoomBy(1); });
$("zout").addEventListener("click", (e) => { e.stopPropagation(); zoomBy(-1); });
["zin", "zout"].forEach((id) => $(id).addEventListener("pointerdown", (e) => e.stopPropagation()));

$("add-corner").addEventListener("click", () => {
  const closed = !isWall();
  const last = closed ? S.pts.length : S.pts.length - 1;
  let best = 0, bestLen = -1;
  for (let i = 0; i < last; i++) {
    const len = edgeFt(S.pts[i], S.pts[(i + 1) % S.pts.length]);
    if (len > bestLen) { bestLen = len; best = i; }
  }
  S.pts.splice(best + 1, 0, midpoint(S.pts[best], S.pts[(best + 1) % S.pts.length]));
  drawShape(); refresh();
});
$("rm-corner").addEventListener("click", () => {
  if (S.pts.length <= (isWall() ? 2 : 3)) return;
  S.pts.pop(); drawShape(); refresh();
});
$("reset-shape").addEventListener("click", () => {
  if (!S.centre) return;
  S.pts = startingShape(S.centre, S.surface.defaultFt[0], S.surface.defaultFt[1], !isWall());
  drawShape(); refresh();
});
$("new-addr").addEventListener("click", () => {
  S.place = null; S.centre = null; S.pts = [];
  $("canvas").hidden = true; $("find").hidden = false;
  refresh();
});

renderTiles(); renderMats(); renderConds(); renderStatic(); refresh();

/* ── The demo, made playable ───────────────────────────────────────────────
 *
 * The same four corners as the real tracer, on a photograph of a patio we
 * built, so somebody can feel what the tool does before typing an address.
 *
 * The hard part is that a photograph is in perspective and a satellite view is
 * not. A flat pixels-to-feet scale would make the far edge cost fewer feet
 * than the near one, and the demo would quietly teach that dragging away from
 * the camera is cheap. So the four starting corners are declared to be a real
 * 24 x 18 rectangle on the ground, a homography is solved from that, and every
 * dragged corner is mapped back onto the ground plane before anything is
 * measured. Drag a corner into the distance and it adds the feet it should.
 */
(function demo() {
  const frame = document.getElementById("demo");
  if (!frame) return;
  const svg = frame.querySelector("svg polygon");
  const dots = [...frame.querySelectorAll(".demo-dot")];
  const edges = [...frame.querySelectorAll(".demo-e")];
  const areaEl = frame.querySelector(".demo-a b");
  const perimEl = frame.querySelector(".demo-p b");
  if (!svg || dots.length !== 4 || !areaEl || !perimEl) return;

  // Set inside the paver field, clear of the fire pit, roughly symmetric so it
  // reads as a shape somebody placed rather than one that fell there. It does
  // not sit on the patio's own edges because this photograph only contains one
  // of them — the other three run out of frame.
  const START = [[12, 44], [74, 42], [96, 95], [4, 90]];   // percent of the frame
  const PLANE = [[0, 0], [24, 0], [24, 18], [0, 18]];      // the feet they stand for

  /** Solve the 8x8 system for the image→ground homography, once. */
  function homography(src, dst) {
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [u, v] = src[i], [x, y] = dst[i];
      A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]); b.push(x);
      A.push([0, 0, 0, u, v, 1, -u * y, -v * y]); b.push(y);
    }
    // Gaussian elimination with partial pivoting. Eight unknowns, so the cost
    // is nothing and the clarity is worth more than a clever method.
    for (let c = 0; c < 8; c++) {
      let piv = c;
      for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]]; [b[c], b[piv]] = [b[piv], b[c]];
      const d = A[c][c];
      if (Math.abs(d) < 1e-12) return null;
      for (let k = c; k < 8; k++) A[c][k] /= d;
      b[c] /= d;
      for (let r = 0; r < 8; r++) {
        if (r === c) continue;
        const f = A[r][c];
        if (!f) continue;
        for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
        b[r] -= f * b[c];
      }
    }
    return b;
  }

  const H = homography(START, PLANE);
  if (!H) return;                                   // leave the static picture alone

  /** A point on the frame, in feet on the ground. */
  const toGround = ([u, v]) => {
    const w = H[6] * u + H[7] * v + 1;
    return [(H[0] * u + H[1] * v + H[2]) / w, (H[3] * u + H[4] * v + H[5]) / w];
  };

  let pts = START.map((p) => [...p]);

  function draw() {
    const g = pts.map(toGround);
    svg.setAttribute("points", pts.map((p) => `${p[0]},${p[1]}`).join(" "));
    dots.forEach((d, i) => { d.style.left = pts[i][0] + "%"; d.style.top = pts[i][1] + "%"; });

    let area = 0, perim = 0;
    for (let i = 0; i < 4; i++) {
      const a = g[i], b2 = g[(i + 1) % 4];
      area += a[0] * b2[1] - b2[0] * a[1];
      const len = Math.hypot(b2[0] - a[0], b2[1] - a[1]);
      perim += len;
      const m = [(pts[i][0] + pts[(i + 1) % 4][0]) / 2, (pts[i][1] + pts[(i + 1) % 4][1]) / 2];
      edges[i].style.left = m[0] + "%";
      edges[i].style.top = m[1] + "%";
      edges[i].textContent = Math.round(len) + " ft";
    }
    areaEl.textContent = Math.round(Math.abs(area) / 2).toLocaleString();
    perimEl.textContent = Math.round(perim).toLocaleString();

    const c = pts.reduce((s2, p) => [s2[0] + p[0] / 4, s2[1] + p[1] / 4], [0, 0]);
    frame.querySelector(".demo-a").style.left = c[0] + "%";
    frame.querySelector(".demo-a").style.top = (c[1] - 4) + "%";
    frame.querySelector(".demo-p").style.left = c[0] + "%";
    frame.querySelector(".demo-p").style.top = (c[1] + 5) + "%";
  }

  let held = -1;
  const clamp = (n) => Math.max(1, Math.min(99, n));

  function move(e) {
    if (held < 0) return;
    e.preventDefault();
    const r = frame.getBoundingClientRect();
    pts[held] = [clamp(((e.clientX - r.left) / r.width) * 100),
                 clamp(((e.clientY - r.top) / r.height) * 100)];
    draw();
  }

  dots.forEach((d, i) => {
    d.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      d.setPointerCapture(e.pointerId);
      held = i;
    });
    d.addEventListener("pointermove", move);
    const up = () => { held = -1; };
    d.addEventListener("pointerup", up);
    d.addEventListener("pointercancel", up);
  });

  const reset = document.getElementById("demo-reset");
  if (reset) reset.addEventListener("click", () => { pts = START.map((p) => [...p]); draw(); });

  draw();
})();

/* ── Measuring on a photograph they took ───────────────────────────────────
 *
 * A satellite tile has a known ground resolution, so pins on it convert
 * straight to feet. A photograph from a phone has nothing of the kind: the
 * same patio fills the frame from six feet away or from the far side of the
 * garden, and no pixel count distinguishes them. So the pins alone cannot
 * produce a number, and any tool that pretends otherwise is guessing.
 *
 * What the pins DO carry is the shape. Four corners of something rectangular,
 * seen in perspective, determine that rectangle's proportions exactly — the
 * two vanishing points fix the camera's focal length, and the focal length
 * turns the traced quadrilateral back into the rectangle it was. That gives
 * the ratio of the sides but not their size.
 *
 * One real length supplies the size. Pace one edge, or use a door, and every
 * other dimension follows from the geometry rather than from a guess.
 *
 * Straight-on photographs make the vanishing points run to infinity and the
 * focal length undefined — which is exactly the case where the picture is
 * already flat and the proportions can be read off the pixels. That is the
 * fallback, and it is right precisely where it is used.
 */
(function photoMeasure() {
  const panel = $("pmeasure"), frame = $("pm-frame"), img = $("pm-img");
  if (!panel || !frame || !img) return;
  const poly = frame.querySelector("svg polygon");
  const dots = [...frame.querySelectorAll("[data-p]")];
  const elabels = [...frame.querySelectorAll("[data-pe]")];
  const EDGE_NAMES = ["top", "right", "bottom", "left"];

  let open = null;                       // the shot being measured
  let pts = [];
  let edge = 0;                          // which edge they are giving us

  const DEFAULT = () => [[18, 30], [82, 30], [92, 82], [8, 82]];

  /** Homography from the unit square to four image points, in pixels. */
  function unitTo(quad) {
    const src = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [u, v] = src[i], [x, y] = quad[i];
      A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]); b.push(x);
      A.push([0, 0, 0, u, v, 1, -u * y, -v * y]); b.push(y);
    }
    for (let c = 0; c < 8; c++) {
      let piv = c;
      for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]]; [b[c], b[piv]] = [b[piv], b[c]];
      const d = A[c][c];
      if (Math.abs(d) < 1e-12) return null;
      for (let k = c; k < 8; k++) A[c][k] /= d;
      b[c] /= d;
      for (let r = 0; r < 8; r++) {
        if (r === c) continue;
        const f = A[r][c];
        if (!f) continue;
        for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
        b[r] -= f * b[c];
      }
    }
    return b;                            // [a,b,c,d,e,f,g,h]
  }

  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];

  /** Is the quad wound cleanly, without a crossed pair of pins? */
  function convex(q) {
    let sign = 0;
    for (let i = 0; i < 4; i++) {
      const a = q[i], b = q[(i + 1) % 4], c = q[(i + 2) % 4];
      const z = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
      if (Math.abs(z) < 1e-9) continue;
      const s = z > 0 ? 1 : -1;
      if (sign && s !== sign) return false;
      sign = s;
    }
    return sign !== 0;
  }

  /** Side ratio of the rectangle the four pins are standing on. */
  function sideRatio(quad) {
    if (!convex(quad)) return null;
    const W = img.naturalWidth || frame.clientWidth;
    const Hh = img.naturalHeight || frame.clientHeight;
    if (!(W > 0) || !(Hh > 0)) return null;
    const px = quad.map(([x, y]) => [x / 100 * W, y / 100 * Hh, 1]);
    const u0 = W / 2, v0 = Hh / 2;
    const long = Math.max(W, Hh);

    // Where the two edge directions run off to. If both land somewhere finite
    // the lens itself falls out of them: the sides are at right angles on the
    // ground, so (v1-c)·(v2-c) = -f².
    const v1 = cross(cross(px[0], px[1]), cross(px[3], px[2]));
    const v2 = cross(cross(px[1], px[2]), cross(px[0], px[3]));
    const flat = (v) => Math.abs(v[2]) < 1e-9
      ? null : [v[0] / v[2] - u0, v[1] / v[2] - v0];
    const a1 = flat(v1), a2 = flat(v2);

    let f = 0, exact = false;
    if (a1 && a2) {
      const f2 = -(a1[0] * a2[0] + a1[1] * a2[1]);
      const cand = Math.sqrt(f2);
      if (isFinite(cand) && cand > 0.3 * long && cand < 3 * long) { f = cand; exact = true; }
    }
    // One direction square to the camera sends its vanishing point to
    // infinity and the lens no longer falls out. Stand in an ordinary phone
    // camera: still far closer than reading the flat pixels, which ignores
    // the foreshortening altogether.
    if (!f) f = 0.9 * long;

    const H = unitTo(px.map((p) => [p[0], p[1]]));
    if (!H) return null;
    // K⁻¹ applied to the first two columns of H. Their lengths are the
    // rectangle's own sides, in one shared unknown unit.
    const col = (a, b2, z) => Math.hypot((a - u0 * z) / f, (b2 - v0 * z) / f, z);
    const A = col(H[0], H[3], H[6]);
    const B = col(H[1], H[4], H[7]);
    if (!(A > 0) || !(B > 0) || !isFinite(A) || !isFinite(B)) return null;
    return { ratio: A / B, exact };
  }

  function drawP() {
    poly.setAttribute("points", pts.map((p) => `${p[0]},${p[1]}`).join(" "));
    dots.forEach((d, i) => { d.style.left = pts[i][0] + "%"; d.style.top = pts[i][1] + "%"; });
    for (let i = 0; i < 4; i++) {
      const m = [(pts[i][0] + pts[(i + 1) % 4][0]) / 2, (pts[i][1] + pts[(i + 1) % 4][1]) / 2];
      elabels[i].style.left = m[0] + "%";
      elabels[i].style.top = m[1] + "%";
      elabels[i].textContent = i === edge ? "this one" : "";
      elabels[i].hidden = i !== edge;
    }
    compute();
  }

  function compute() {
    const known = parseFloat($("pm-known").value) || 0;
    const r = sideRatio(pts);
    const out = $("pm-out");
    if (!r || known <= 0) { out.hidden = true; if (open) open.measure = null; return; }
    // edges 0 and 2 run along the rectangle's first side, 1 and 3 the second.
    const along = edge % 2 === 0;
    const a = along ? known : known * r.ratio;
    const b = along ? known / r.ratio : known;
    if (!isFinite(a) || !isFinite(b) || a <= 0 || b <= 0) { out.hidden = true; return; }
    const area = a * b, perim = 2 * (a + b);
    $("pm-area").textContent = Math.round(area).toLocaleString();
    $("pm-perim").textContent = Math.round(perim).toLocaleString();
    out.hidden = false;
    $("pm-hint").textContent = r.exact
      ? "Corrected for the angle the photo was taken at."
      : "Pace it, or use something you know — a door is about three feet.";
    if (open) open.measure = { sqft: Math.round(area), perimeter: Math.round(perim) };
    const tile = open && open.el;
    if (tile) {
      let tag = tile.querySelector(".tag");
      if (!tag) { tag = document.createElement("span"); tag.className = "tag"; tile.appendChild(tag); }
      tag.textContent = Math.round(area).toLocaleString() + " sq ft";
    }
  }

  let grip = -1;
  const clampP = (n) => Math.max(1, Math.min(99, n));
  function moveP(e) {
    if (grip < 0) return;
    e.preventDefault();
    const r = frame.getBoundingClientRect();
    pts[grip] = [clampP(((e.clientX - r.left) / r.width) * 100),
                 clampP(((e.clientY - r.top) / r.height) * 100)];
    drawP();
  }
  dots.forEach((d, i) => {
    d.addEventListener("pointerdown", (e) => { e.preventDefault(); d.setPointerCapture(e.pointerId); grip = i; });
    d.addEventListener("pointermove", moveP);
    const up = () => { grip = -1; };
    d.addEventListener("pointerup", up);
    d.addEventListener("pointercancel", up);
  });

  $("pm-known").addEventListener("input", compute);
  $("pm-flip").addEventListener("click", () => {
    edge = (edge + 1) % 4;
    $("pm-edge").textContent = EDGE_NAMES[edge];
    drawP();
  });
  $("pm-close").addEventListener("click", () => { panel.hidden = true; open = null; });

  /** Opened from a thumbnail. */
  window.__openMeasure = (rec, srcUrl) => {
    open = rec;
    img.onload = () => { pts = rec.pts ? rec.pts.map((p) => [...p]) : DEFAULT(); edge = 0;
      $("pm-edge").textContent = EDGE_NAMES[0];
      $("pm-known").value = rec.known || ""; drawP(); };
    img.src = srcUrl;
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  // Remember what was pinned, so reopening a photo does not start again.
  panel.addEventListener("pointerup", () => { if (open) { open.pts = pts.map((p) => [...p]); open.known = $("pm-known").value; } });
  $("pm-known").addEventListener("change", () => { if (open) open.known = $("pm-known").value; });
})();
