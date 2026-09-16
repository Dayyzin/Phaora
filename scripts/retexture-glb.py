"""Swap a scan's baked atlas and give its material the physics of the stone.

The scan arrives as one colour map and nothing else: no roughness, no
transmission, no environment. Rendered from that, clear quartz looks like
chalk, and the dealer's price labels are printed on the bird. Both are fixed in
the file rather than in the viewer, so every consumer of the model — the shop
hero, a render, anything later — gets the corrected piece.

Only the texture buffer view and the material are touched. The Draco-compressed
mesh is copied through byte for byte, so the geometry never round-trips.

Usage: retexture-glb.py <in.glb> <texture.jpg> <out.glb> [atlas-px] [webp|jpeg]

On atlas size, measured rather than assumed: the hero renders at 704px with
zoom disabled, so nothing on any screen can resolve more than about a thousand
texels. Against the 8192 original, a 4096 WebP differs by 0.19 on a 0-255 scale
and is six and a half times smaller. 8192 was eight times finer than anything
that reaches a display.

WebP goes in through EXT_texture_webp, declared required — a browser is fine,
but a marketplace viewer that does not implement it will refuse the file. Pass
'jpeg' for anything leaving the site.
"""
import json, struct, sys, io
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
pad4 = lambda n: (4 - n % 4) % 4

# Measured on the render, then carried into the file. Transmission is what
# stops the quartz reading as chalk; ior 1.55 is quartz; the clearcoat is the
# polish. Declared used, never required — a viewer that ignores them still
# gets a correct opaque model rather than nothing.
# One material covers the whole scan — the polished bird and the druzy pocket
# of the geode both. Tuned for the bird alone (roughness 0.06, full clearcoat)
# the amethyst goes glassy and its crystal face disappears under the specular,
# so this sits deliberately short of the glossiest setting that flattered the
# quartz. Splitting them would need the scan segmented into two materials.
CRYSTAL = {
    'KHR_materials_transmission': {'transmissionFactor': 0.30},
    'KHR_materials_ior':          {'ior': 1.55},
    'KHR_materials_volume':       {'thicknessFactor': 0.09,
                                   'attenuationDistance': 0.55,
                                   'attenuationColor': [0.965, 0.933, 0.941]},
    'KHR_materials_clearcoat':    {'clearcoatFactor': 0.45,
                                   'clearcoatRoughnessFactor': 0.12},
    'KHR_materials_specular':     {'specularFactor': 1.0},
}


def read_glb(path):
    d = open(path, 'rb').read()
    _, _, total = struct.unpack('<4sII', d[:12])
    off, js, binv = 12, None, None
    while off < total:
        clen, ctype = struct.unpack('<I4s', d[off:off + 8])
        if ctype == b'JSON':   js = json.loads(d[off + 8: off + 8 + clen])
        if ctype == b'BIN\x00': binv = d[off + 8: off + 8 + clen]
        off += 8 + clen
    return js, binv


def write_glb(path, js, binv):
    jb = json.dumps(js, separators=(',', ':')).encode()
    jb += b' ' * pad4(len(jb))
    bb = binv + b'\x00' * pad4(len(binv))
    total = 12 + 8 + len(jb) + 8 + len(bb)
    with open(path, 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, total))
        f.write(struct.pack('<I4s', len(jb), b'JSON')); f.write(jb)
        f.write(struct.pack('<I4s', len(bb), b'BIN\x00')); f.write(bb)
    return total


def main(src, tex_path, out, atlas=None, fmt='jpeg', quality=None):
    js, binv = read_glb(src)
    img_bv = js['bufferViews'][js['images'][0]['bufferView']]
    mesh_bv = next(bv for i, bv in enumerate(js['bufferViews'])
                   if i != js['images'][0]['bufferView'])

    tex = Image.open(tex_path).convert('RGB')
    if atlas and tex.width != atlas:
        tex = tex.resize((atlas, atlas), Image.LANCZOS)
    buf = io.BytesIO()
    if fmt == 'webp':
        tex.save(buf, 'WEBP', quality=quality or 82, method=6)
        mime = 'image/webp'
    else:
        tex.save(buf, 'JPEG', quality=quality or 88, subsampling=0, optimize=True)
        mime = 'image/jpeg'
    new_img = buf.getvalue()

    mesh_bytes = binv[mesh_bv.get('byteOffset', 0):
                      mesh_bv.get('byteOffset', 0) + mesh_bv['byteLength']]
    mesh_off = 0
    img_off = len(mesh_bytes) + pad4(len(mesh_bytes))
    new_bin = mesh_bytes + b'\x00' * pad4(len(mesh_bytes)) + new_img

    mesh_bv['byteOffset'] = mesh_off
    img_bv['byteOffset'], img_bv['byteLength'] = img_off, len(new_img)
    js['buffers'][0]['byteLength'] = len(new_bin)

    js['images'][0]['mimeType'] = mime
    if fmt == 'webp':
        tx = js['textures'][0]
        tx.setdefault('extensions', {})['EXT_texture_webp'] = {'source': tx.pop('source')}
        js['extensionsRequired'] = sorted(set(js.get('extensionsRequired', [])) | {'EXT_texture_webp'})

    m = js['materials'][0]
    m.setdefault('pbrMetallicRoughness', {})['roughnessFactor'] = 0.16
    m['pbrMetallicRoughness']['metallicFactor'] = 0.0
    m['extensions'] = CRYSTAL
    used = set(js.get('extensionsUsed', [])) | set(CRYSTAL) | set(js.get('extensionsRequired', []))
    js['extensionsUsed'] = sorted(used)

    total = write_glb(out, js, new_bin)
    print(f'{out}: {tex.width}px {fmt} / texture {len(new_img)/1e6:.2f} MB, file {total/1e6:.2f} MB')


if __name__ == '__main__':
    a = sys.argv
    main(a[1], a[2], a[3],
         int(a[4]) if len(a) > 4 else None,
         a[5] if len(a) > 5 else 'jpeg')
