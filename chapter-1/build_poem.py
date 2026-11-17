#!/usr/bin/env python3
"""The projector poem (SCENES.md): each chapter's scene thrown onto the room's back wall and cove, baked per device.

Inputs
- poem/camera.json: the room's camera per device (poem_room_camera.js).
- the room per chapter (poem_room_capture.js): <ROOMCAP>/<device>/still-<ch>.png and the pins' morphs <from>-<to>/f*.png.
- the scenes (SCENES.md): the film, media/film/film/video.mp4, and the 8K plate img/book/plate-vi.

Outputs (media/poem/)
- <ch>-<device>.mp4: the room with the chapter's pins, dimmed to the poem's light, the scene projected on it.
- <ch>-<device>.webp: the same room, the projector off (the cut to dark, and the poster).
- morph-<from>-<to>-<device>.mp4: the pins rippling into the next figure, in the dark.

The projection: a projector behind and above the viewer throws a 16:9 frame at the back wall; each pixel the room's camera
sees is traced onto the room's own surface (the rounded box of room.js: RW 2.2, TOP 4.2, ZB 9, COVE 1.25) and back to the
projector, so the frame bends over the cove exactly as the room curves. The light is multiplied by the wall (its pins and
their shadows show through), falls off with distance and angle, and the room keeps a little light of its own (AMB).
Every pixel is the room's render or the scene's own; nothing is drawn.

Usage: python3 build_poem.py <ROOMCAP> [chapters ...] [--device desktop|phone]
"""
import json, os, subprocess, sys
import numpy as np, cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get('POEM_OUT') or os.path.join(HERE, 'media', 'poem')   # POEM_OUT: build elsewhere, copy in when done
FILM = os.path.join(HERE, 'media', 'film', 'film', 'video.mp4')
PLATE_VI = os.path.join(HERE, 'img', 'book', 'plate-vi', 'w5760.webp')
SIZE = {'desktop': (1440, 900), 'phone': (780, 1688)}
DPR = {'desktop': 1, 'phone': 2}
# the projector: behind and above the viewer (the camera is at 0, 1.45, 5.4), its frame laid on the plane of the back wall
PROJ = np.array([0.0, 3.6, 8.4])
FRAME = {'desktop': (-2.15, 2.15, 0.68, 2.72), 'phone': (-1.22, 1.22, 0.15, 1.98)}   # the phone's frame is 4:3, taken from the middle of the scene   # x0, x1, y0 (low), y1 on z = 0
AMB = 0.065    # the room's own light in the poem, linear (the stage is ~0.85 at its whitest): near-cinema
MORPH_LIFT = 1.6   # while the pins ripple, the room's light rises this much (x AMB) and falls back, so the ripple reads
HARD = 1.8     # the dim room's light is harder than the studio's: its tones are taken to this power (pins and their shadows read)
GAIN = 2.6     # the projector, linear: the film is a night film, mostly black; its bulbs, snow and screen carry the light
FPS = 24
PUSH = 0.07    # the slow push-in over a loop

# chapter: (source, start s, length s, hold s at the end, push-in centre on the source frame)
SCENES = {
    'prologue': ('film', 28.0, 10.0, 0.0, (0.5, 0.55)),
    'i':        ('film', 0.0, 10.0, 0.0, (0.5, 0.5)),
    'ii':       ('film', 20.0, 8.0, 0.0, (0.5, 0.45)),
    'iii':      ('film', 38.0, 8.0, 0.0, (0.5, 0.5)),
    'iv':       ('film', 58.0, 10.0, 0.0, (0.5, 0.7)),
    'v':        ('film', 46.0, 7.0, 0.0, (0.45, 0.6)),
    'vi':       ('plate-vi', 0.0, 10.0, 0.0, (0.80, 0.45)),
    'vii':      ('film', 68.0, 4.5, 3.5, (0.5, 0.5)),
    'viii':     ('film', 72.5, 5.0, 3.0, (0.5, 0.6)),
    'ix':       ('film', 77.5, 5.0, 3.0, (0.45, 0.5)),
    'coda':     ('film', 87.5, 10.5, 0.0, (0.5, 0.5)),
}
ORDER = list(SCENES)
# the pins' motif per chapter (SCENES.md "Pins", approved by David 15 Nov; 84 x 100, white = a pin standing out, the right
# wall the left's mirror, as room.js reads them). Each is one real frame of the chapter's scene, or its render, sampled
# into the pin grid as the Muse's pins are sampled from its print: (film second, crop centre) or (image, crop box, invert).
PINS = {'prologue': (31.0, 0.5), 'i': (12.0, 0.0), 'ii': (22.5, 0.55), 'iii': (40.0, 0.5), 'iv': (36.0, 0.5),
        'v': ('img/book/plate-v/w960.webp', None, False), 'vi': ('assets/h_muse_allover_L.png', 'pins', False),
        'vii': ('assets/poem/src/oitava_catalogue_2048.png', (0.06, 0.22, 0.94, 0.90), True),   # phaora-ops site480/oitava
        'viii': (75.0, 0.5), 'ix': (80.0, 0.62), 'coda': (95.0, 0.5)}

def build_pins():
    d = os.path.join(HERE, 'assets', 'poem'); os.makedirs(d, exist_ok=True)
    norm = lambda g: np.clip((g - np.percentile(g, 2)) / (np.percentile(g, 99.5) - np.percentile(g, 2) + 1e-6), 0, 1)
    for ch, spec in PINS.items():
        if isinstance(spec[0], str):
            path, box, inv = spec; im = Image.open(os.path.join(HERE, path)).convert('L')
            if box == 'pins': out = im   # the piece's own pin art, as it is
            else:
                if box: W, H = im.size; im = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
                W, H = im.size; a = 0.84   # the pin grid's shape, from the middle
                if W / H > a: cw = int(H * a); im = im.crop(((W - cw) // 2, 0, (W - cw) // 2 + cw, H))
                else: chh = int(W / a); im = im.crop((0, (H - chh) // 2, W, (H - chh) // 2 + chh))
                g = norm(np.asarray(im.resize((84, 100), Image.LANCZOS), np.float32))
                out = Image.fromarray(((1 - g if inv else g) * 255).astype(np.uint8))
        else:
            t, cx = spec
            raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', FILM, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                                 capture_output=True, check=True).stdout
            g = np.frombuffer(raw, np.uint8).reshape(144, 256).astype(np.float32); x0 = int(round((256 - 121) * cx)); g = norm(g[:, x0:x0 + 121])
            out = Image.fromarray((g * 255).astype(np.uint8)).resize((84, 100), Image.LANCZOS)
        out.save(f'{d}/h_{ch}_L.png'); out.transpose(Image.FLIP_LEFT_RIGHT).save(f'{d}/h_{ch}_R.png')
    print('pins', len(PINS))

TITLES = {'prologue': ('', 'prologue'), 'i': ('I', 'snow'), 'ii': ('II', 'the doors'), 'iii': ('III', 'the aisle'),
          'iv': ('IV', 'the front row'), 'v': ('V', 'the kept seat'), 'vi': ('VI', 'reel one'), 'vii': ('VII', 'reel two'),
          'viii': ('VIII', 'house lights'), 'ix': ('IX', 'the morning'), 'coda': ('', 'coda')}

def srgb2lin(a): return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
def lin2srgb(a): a = np.clip(a, 0, 1); return np.where(a <= 0.0031308, a * 12.92, 1.055 * a ** (1 / 2.4) - 0.055)

def room_sdf(p):   # room.js: a box RW*2 x TOP*2 x ZB centred at (0, TOP, ZB/2), every edge rounded by COVE
    c = np.array([0.0, 4.2, 4.5]); h = np.array([2.2 - 1.25, 4.2 - 1.25, 4.5 - 1.25])
    q = np.abs(p - c) - h
    return np.linalg.norm(np.maximum(q, 0), axis=-1) + np.minimum(q.max(-1), 0) - 1.25

def projection_map(dev):
    cam = json.load(open(os.path.join(HERE, 'poem', 'camera.json')))[dev]
    W, H = SIZE[dev]; dpr = DPR[dev]
    P = np.array(cam['proj']).reshape(4, 4).T; M = np.array(cam['world']).reshape(4, 4).T
    iP = np.linalg.inv(P)
    cl, ct, cw, ch = cam['canvas']
    xs = (np.arange(W) + 0.5) / dpr; ys = (np.arange(H) + 0.5) / dpr
    X, Y = np.meshgrid(xs, ys)
    nx = (X - cl) / cw * 2 - 1; ny = 1 - (Y - ct) / ch * 2
    def unp(z):
        v = np.stack([nx, ny, np.full_like(nx, z), np.ones_like(nx)], -1) @ iP.T
        v = v[..., :3] / v[..., 3:]
        v = np.concatenate([v, np.ones_like(v[..., :1])], -1) @ M.T
        return v[..., :3]
    a, b = unp(-1), unp(1)
    d = b - a; d /= np.linalg.norm(d, axis=-1, keepdims=True)
    o = np.array(cam['pos']); p = np.broadcast_to(o, d.shape).copy(); t = np.zeros(d.shape[:2])
    for _ in range(96):   # sphere trace from inside the room to its surface
        s = -room_sdf(p); t += s; p = o + d * t[..., None]
    e = 1e-3; n = np.stack([room_sdf(p + np.array(v)) - room_sdf(p - np.array(v)) for v in ([e, 0, 0], [0, e, 0], [0, 0, e])], -1)
    n = -n / np.linalg.norm(n, axis=-1, keepdims=True)    # into the room
    L = PROJ - p; dist = np.linalg.norm(L, axis=-1); L /= dist[..., None]
    k = PROJ[2] / (PROJ[2] - p[..., 2])                    # the projector's ray through p, carried on to the back wall's plane
    vx = PROJ[0] + (p[..., 0] - PROJ[0]) * k; vy = PROJ[1] + (p[..., 1] - PROJ[1]) * k
    x0, x1, y0, y1 = FRAME[dev]
    u = (vx - x0) / (x1 - x0); v = (y1 - vy) / (y1 - y0)
    ok = (p[..., 2] < PROJ[2] - 0.5) & (k > 0)
    cosi = np.clip((n * L).sum(-1), 0, 1)
    fall = cosi / dist ** 2
    c = np.unravel_index(np.argmin(np.where(ok, np.abs(u - 0.5) + np.abs(v - 0.5), 9)), u.shape); c0 = fall[c]
    fall = np.clip(fall / c0, 0.35, 1.35) ** 0.6
    sm = lambda a, w: np.clip(a / w, 0, 1) ** 2 * (3 - 2 * np.clip(a / w, 0, 1))
    edge = sm(u, 0.004) * sm(1 - u, 0.004) * sm(v, 0.006) * sm(1 - v, 0.006)
    mask = np.where(ok & (u >= 0) & (u <= 1) & (v >= 0) & (v <= 1), edge * fall, 0).astype(np.float32)
    return u.astype(np.float32), v.astype(np.float32), mask

def film_frames(start, length):
    w, h = 256, 144
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{start}', '-t', f'{length}', '-i', FILM, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-r', str(FPS), '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return list(np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3))

def plate_frames(length):
    im = np.asarray(Image.open(PLATE_VI).convert('RGB'))
    H, W = im.shape[:2]; ch = int(W * 9 / 16); y0 = int(H * 0.47 - ch / 2)
    crop = im[y0:y0 + ch]
    base = cv2.resize(crop, (2560, 1440), interpolation=cv2.INTER_AREA)
    return [base] * int(round(length * FPS))

def pushed(src, i, n, centre):   # the slow push-in: a crop that closes in on the centre, eased
    h, w = src.shape[:2]; k = i / max(1, n - 1); k = k * k * (3 - 2 * k)
    z = 1 + PUSH * k; cw, ch = w / z, h / z
    cx = w * (0.5 + (centre[0] - 0.5) * k); cy = h * (0.5 + (centre[1] - 0.5) * k)
    x0 = np.clip(cx - cw / 2, 0, w - cw); y0 = np.clip(cy - ch / 2, 0, h - ch)
    Mx = np.array([[cw / w, 0, x0], [0, ch / h, y0]], np.float32)
    return Mx

def encoder(path, W, H, crf=21):
    return subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-tune', 'film', '-movflags', '+faststart', '-an', path],
        stdin=subprocess.PIPE)

def build_chapter(ch, dev, roomcap, pmap):
    u, v, mask = pmap; W, H = SIZE[dev]
    still = np.asarray(Image.open(f'{roomcap}/{dev}/still-{ch}.png').convert('RGB').resize((W, H), Image.LANCZOS), np.float32) / 255
    room = srgb2lin(still); albedo = np.clip(room / 0.85, 0, 1.1); amb = albedo ** HARD * 0.85
    dark = (lin2srgb(amb * AMB) * 255 + 0.5).astype(np.uint8)
    Image.fromarray(dark).save(f'{OUT}/{ch}-{dev}.webp', quality=88)
    kind, start, length, hold, centre = SCENES[ch]
    frames = film_frames(start, length) if kind == 'film' else plate_frames(length)
    frames += [frames[-1]] * int(round(hold * FPS))
    n = len(frames); enc = encoder(f'{OUT}/{ch}-{dev}.mp4', W, H)
    # a computer runs the room live (room.js) and lays only the projector's light over it: <ch>-desktop-light.mp4
    enc2 = encoder(f'{OUT}/{ch}-{dev}-light.mp4', W, H) if dev == 'desktop' else None
    base = (amb * AMB).astype(np.float32); lit = (albedo * mask[..., None] * GAIN).astype(np.float32)
    for i, f in enumerate(frames):
        if f.shape[1] < 1024: f = cv2.resize(f, (1024, 576), interpolation=cv2.INTER_LANCZOS4)
        x0, x1, y0, y1 = FRAME[dev]; fa = (x1 - x0) / (y1 - y0)
        if f.shape[1] / f.shape[0] > fa + 0.01:   # the frame is narrower than the scene: its middle, toward the push-in's centre
            cw = int(round(f.shape[0] * fa)); cx = int(np.clip(f.shape[1] * centre[0] - cw / 2, 0, f.shape[1] - cw)); f = f[:, cx:cx + cw]
        elif f.shape[1] / f.shape[0] < fa - 0.01:   # wider than the scene: its middle band, toward the push-in's centre
            bh = int(round(f.shape[1] / fa)); cy = int(np.clip(f.shape[0] * centre[1] - bh / 2, 0, f.shape[0] - bh)); f = f[cy:cy + bh]
        h, w = f.shape[:2]; A = pushed(f, i, n, centre)
        mx = (A[0, 0] * u * w + A[0, 2]).astype(np.float32); my = (A[1, 1] * v * h + A[1, 2]).astype(np.float32)
        s = cv2.remap(f, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT).astype(np.float32) / 255
        light = lit * srgb2lin(s); out = lin2srgb(base + light)
        enc.stdin.write((out * 255 + 0.5).astype(np.uint8).tobytes())
        if enc2: enc2.stdin.write((lin2srgb(light) * 255 + 0.5).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait()
    if enc2: enc2.stdin.close(); enc2.wait()
    print('scene', ch, dev, n, 'frames', flush=True)

def build_morph(a, b, dev, roomcap):
    W, H = SIZE[dev]; d = f'{roomcap}/{dev}/{a}-{b}'
    fs = sorted(x for x in os.listdir(d) if x.endswith('.png'))
    tmp = f'{OUT}/.morph'; os.makedirs(tmp, exist_ok=True)
    for i, x in enumerate(fs):
        lift = 1 + MORPH_LIFT * np.sin(np.pi * i / (len(fs) - 1)) ** 2   # the pins glimmer as they move, and settle back to dark
        im = lift * np.clip(srgb2lin(np.asarray(Image.open(f'{d}/{x}').convert('RGB').resize((W, H), Image.LANCZOS), np.float32) / 255) / 0.85, 0, 1.1) ** HARD * 0.85 * AMB
        Image.fromarray((lin2srgb(im) * 255 + 0.5).astype(np.uint8)).save(f'{tmp}/{i:04d}.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '12', '-i', f'{tmp}/%04d.png', '-vf', 'minterpolate=fps=24:mi_mode=blend',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
        f'{OUT}/morph-{a}-{b}-{dev}.mp4'], check=True)
    for x in os.listdir(tmp): os.remove(f'{tmp}/{x}')
    print('morph', a, b, dev, flush=True)

TITLES = {'prologue': ('', 'prologue'), 'i': ('I', 'snow'), 'ii': ('II', 'the doors'), 'iii': ('III', 'the aisle'),
          'iv': ('IV', 'the front row'), 'v': ('V', 'the kept seat'), 'vi': ('VI', 'reel one'), 'vii': ('VII', 'reel two'),
          'viii': ('VIII', 'house lights'), 'ix': ('IX', 'the morning'), 'coda': ('', 'coda')}

def build_page():
    """poem.html from poem_page.html: the verse of each chapter (book-<ch>.html, POEM.md as built), where the projection
    falls on the screen for each device (the subtitles sit over its lower part), and the morphs on hand."""
    import re, html
    chapters = []
    for ch in ORDER:
        src = open(os.path.join(HERE, f'book-{ch}.html'), encoding='utf-8').read()
        verse = re.search(r'<div class="verse">(.*?)</div>', src, re.S).group(1)
        sts = [[html.unescape(re.sub(r'<[^>]+>', '', l)) for l in re.findall(r'<span class="l">(.*?)</span>', st, re.S)]
               for st in re.findall(r'<p class="st">(.*?)</p>', verse, re.S)]
        verse_em = re.findall(r'<p class="st">(.*?)</p>', verse, re.S)
        lines = [[re.sub(r'<(?!/?em>)[^>]+>', '', l) for l in re.findall(r'<span class="l">(.*?)</span>', st, re.S)] for st in verse_em]
        chapters.append({'id': ch, 'num': TITLES[ch][0], 'title': TITLES[ch][1], 'stanzas': lines,
                         'morph': ch != ORDER[-1] and os.path.exists(f'{OUT}/morph-{ch}-{ORDER[ORDER.index(ch) + 1]}-desktop.mp4')})
        coda = re.search(r'<p class="bcoda[^"]*">(.*?)</p>', src, re.S)
        if coda: chapters[-1]['after'] = re.sub(r'<(?!/?em>)[^>]+>', '', coda.group(1))
    rect = {}
    for dev in SIZE:
        u, v, m = projection_map(dev); W, H = SIZE[dev]
        ys, xs = np.nonzero(m > 0.3)
        rect[dev] = [round(xs.min() / W, 4), round(ys.min() / H, 4), round(xs.max() / W, 4), round(ys.max() / H, 4)]
    data = {'rect': rect, 'size': SIZE, 'len': FILM_LEN,
            'sections': [{'id': ch, 'num': TITLES[ch][0], 'title': TITLES[ch][1], 'from': a, 'to': b} for ch, a, b in SECTIONS],
            'cues': [{'from': a, 'to': b, 'lines': ls} for a, b, ls in CUES]}
    build_room_page()
    t = open(os.path.join(HERE, 'poem_page.html'), encoding='utf-8').read()
    open(os.path.join(HERE, 'poem.html'), 'w', encoding='utf-8').write(t.replace('/*POEM*/{}', json.dumps(data, ensure_ascii=False)))
    print('poem.html', rect)

def build_room_page():
    """poem-room.html: the room as room.html runs it, live (room.js), empty, its pins the chapters' motifs in order, no
    intro, no catalogue, no words; loaded as poem-room.html?empty=1. The poem page holds it behind the projection on a computer and steps it a chapter."""
    import re
    src = open(os.path.join(HERE, 'room.html'), encoding='utf-8').read()
    pieces = json.loads(re.search(r'window\.PIECES = (\[.*?\]);\n', src).group(1))
    base = next(q for q in pieces if q['id'] == 'card_holder')
    poem = [{**base, 'id': 'poem_' + ch, 'name': '', 'sub': '', 'links': [], 'pinsL': f'assets/poem/h_{ch}_L.png', 'pinsR': f'assets/poem/h_{ch}_R.png'} for ch in [x[0] for x in SECTIONS]]   # the film's chapters, in its order
    src = re.sub(r'window\.PIECES = \[.*?\];\n', lambda m: 'window.PIECES = ' + json.dumps(poem) + ';\n', src, count=1)
    src = src.replace('window.CATALOGUE_ON = true;', 'window.CATALOGUE_ON = false;')
    src = re.sub(r'window\.INTRO_ON = \(\(\) => \{.*?\}\)\(\);', 'window.INTRO_ON = false;', src, count=1, flags=re.S)
    src = src.replace('<title>PHAÖRA · Chapter I</title>', '<title>The room · the poem</title>')
    src = src.replace('<body>', '<body class="poemroom"><style>#logo,#sitenav,#ui,#cat,#intro{display:none!important}html,body{background:#0b0b0b}</style>', 1)
    open(os.path.join(HERE, 'poem-room.html'), 'w', encoding='utf-8').write(src)

# ---- the film with its voice (David, 17 Nov: "Put this instead. Match the poem writing with the dialogue") ----
# veil-coat-film_103s_musicVO_v5_sfx.mp4: the same picture as the film, 103.5 s, with music, sound and a voice reading
# nineteen of the poem's lines. The projector plays it through, with its sound; the words on the wall are the lines the
# voice reads, in the poem's own spelling (book-*.html), each up while it is spoken. Times are the voice's own, read off
# the track (whisper small.en, word timestamps), checked against POEM.md.
FILM_VO = os.path.join(HERE, 'media', 'film', 'film-vo', 'video.mp4')
FILM_LEN = 103.5
# the film's chapters, by where the voice turns (the film has no voice for III and VII): (chapter, from s, to s)
SECTIONS = [('prologue', 0.0, 6.4), ('i', 6.4, 19.7), ('ii', 19.7, 30.65), ('iv', 30.65, 38.9), ('v', 38.9, 53.5),
            ('vi', 53.5, 69.7), ('viii', 69.7, 76.0), ('ix', 76.0, 87.45), ('coda', 87.45, FILM_LEN)]
CUES = [  # (from s, to s, the lines as the poem writes them)
    (0.88, 5.12, ['There is a cinema in snow', 'that plays one reel on Christmas Eve.']),
    (7.60, 12.28, ['when down it came, ignoring cold,', 'a coat that took its time tonight.']),
    (13.24, 19.32, ['Eight buttons, belt, a strap each cuff,', 'a hem that swung to mid-calf, black;']),
    (20.10, 24.54, ['A single mark, cut through to cream,', 'low on its back began to glow']),
    (25.34, 30.24, ['the coat walked up, and then the door', 'swung open wide without a key.']),
    (31.06, 35.10, ['The front row&#x27;s full but for a chair,', 'a little card upon its seat:']),
    (35.78, 38.52, ['no name, one mark, and waiting there']),
    (39.24, 44.84, ['The count went three, then two, then stopped.', 'The screen would never say the one,']),
    (47.10, 52.16, ['The coat sat down, the way coats do,', 'all at once, then settled right.']),
    (54.76, 61.12, ['Then on the screen, a picture, new,', 'so new it hadn&#x27;t happened yet:']),
    (63.12, 67.66, ['the screen&#x27;s light found the silk below,', 'the warmest thing the night had met.']),
    (71.84, 75.38, ['The house lights rose, too soon, as they do.']),
    (76.70, 81.34, ['the coat hung on the rail, complete,', 'a small fir green beside the door.']),
    (81.34, 84.20, ['The seat was kept for the coat, it&#x27;s true.']),
    (84.70, 87.20, ['The coat was kept, all along, for you.']),
    (87.72, 92.42, ['Up in the booth, reel one came free,', 'another threaded, wound and spun;']),
    (93.02, 98.12, ['and on the screen, for none to see,', 'in red, a II, where there&#x27;d been one.']),
    (99.16, 102.26, ['<em>Thank you for the pleasure of your company.</em>']),
]
MORPH_S = 4.1   # the room's morph (poem_room_capture.js RUN_END), played as the film crosses into a chapter

def build_film(dev, roomcap, pmap):
    """film-<dev>.mp4: the whole film projected on the room with its sound. A computer gets the projector's light alone
    (film-desktop-light.mp4, laid over the live room); a phone gets the room baked under it, its pins re-forming at each
    chapter's turn (the room's own captured morph) while the picture runs on."""
    u, v, mask = pmap; W, H = SIZE[dev]; light_only = dev == 'desktop'
    load = lambda f: np.clip(srgb2lin(np.asarray(Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS), np.float32) / 255) / 0.85, 0, 1.1)
    stills = {ch: load(f'{roomcap}/{dev}/still-{ch}.png') for ch, _, _ in SECTIONS}
    lit_of = lambda alb: (alb * mask[..., None] * GAIN).astype(np.float32)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', FILM_VO, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-r', str(FPS), '-'], capture_output=True, check=True).stdout
    fw, fh = 854, 480; frames = np.frombuffer(raw, np.uint8).reshape(-1, fh, fw, 3)
    x0, x1, y0, y1 = FRAME[dev]; fa = (x1 - x0) / (y1 - y0)
    if fw / fh > fa: cw = int(round(fh * fa)); cx = (fw - cw) // 2; crop = (cx, 0, cw, fh)
    else: bh = int(round(fw / fa)); cy = (fh - bh) // 2; crop = (0, cy, fw, bh)
    mx = (crop[0] + u * crop[2]).astype(np.float32); my = (crop[1] + v * crop[3]).astype(np.float32)
    tmp = f'{OUT}/.film-{dev}.mp4'; enc = encoder(tmp, W, H, crf=22)
    for i, f in enumerate(frames):
        t = i / FPS; k = max(j for j, (_, a, _) in enumerate(SECTIONS) if t >= a); ch, a, _ = SECTIONS[k]
        room = stills[ch]
        if k > 0 and t - a < MORPH_S:   # the pins travel from the last chapter's motif to this one's
            prev = SECTIONS[k - 1][0]; d = f'{roomcap}/{dev}/{prev}-{ch}'; fs = sorted(x for x in os.listdir(d) if x.endswith('.png'))
            j = min(len(fs) - 1, int((t - a) * 12)); room = load(f'{d}/{fs[j]}')
            lift = 1 + 0.8 * np.sin(np.pi * (t - a) / MORPH_S) ** 2
        else: lift = 1
        s_ = cv2.remap(f, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT).astype(np.float32) / 255
        light = lit_of(room) * srgb2lin(s_)
        out = light if light_only else (room ** HARD * 0.85) * AMB * lift + light
        enc.stdin.write((lin2srgb(out) * 255 + 0.5).astype(np.uint8).tobytes())
        if i % 240 == 0: print('film', dev, f'{t:.0f}s', flush=True)
    enc.stdin.close(); enc.wait()
    name = f'{OUT}/film-{dev}' + ('-light' if light_only else '') + '.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-i', FILM_VO, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
                    '-ar', '48000', '-movflags', '+faststart', '-shortest', name], check=True)
    os.remove(tmp); print('film', dev, 'done', flush=True)

if __name__ == '__main__':
    args = sys.argv[1:]; roomcap = args.pop(0)
    devs = ['desktop', 'phone']
    if '--device' in args: i = args.index('--device'); devs = [args[i + 1]]; del args[i:i + 2]
    if '--pins' in args: build_pins(); sys.exit(0)
    if '--page' in args: build_page(); sys.exit(0)
    if '--film' in args:   # the film with its voice, projected (build_film)
        os.makedirs(OUT, exist_ok=True)
        for dev in devs: build_film(dev, roomcap, projection_map(dev))
        sys.exit(0)
    only = '--only-morphs' in args; morphs = only or '--morphs' in args; args = [a for a in args if a not in ('--morphs', '--only-morphs')]
    chs = args or ORDER
    os.makedirs(OUT, exist_ok=True)
    for dev in devs:
        pmap = None if only else projection_map(dev)
        for ch in ([] if only else chs): build_chapter(ch, dev, roomcap, pmap)
        if morphs:
            for k in range(len(ORDER) - 1):
                a, b = ORDER[k], ORDER[k + 1]
                if (a in chs or b in chs) and os.path.isdir(f'{roomcap}/{dev}/{a}-{b}'): build_morph(a, b, dev, roomcap)
