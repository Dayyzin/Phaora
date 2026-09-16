/**
 * The capture time out of a JPEG, with no dependencies.
 *
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------
 * A camera roll dumped to a folder arrives in whatever order the filesystem
 * feels like, and IMG_4471 is not necessarily before IMG_4472 once a counter
 * has rolled over or two devices are involved. The order the photographs were
 * actually taken in is the only order that matches the order the piece was
 * turned on the table, and that order is in the file.
 *
 * Reads EXIF DateTimeOriginal (0x9003), falling back to DateTime (0x0132).
 * Everything is bounds-checked: a truncated or odd file returns null rather
 * than throwing, and the caller falls back to mtime.
 */
const fs = require('fs');

function exifDate(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    /* 128KB is far past where APP1 lives in any camera JPEG. */
    const buf = Buffer.alloc(Math.min(131072, fs.fstatSync(fd).size));
    fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd); fd = null;

    if (buf.readUInt16BE(0) !== 0xFFD8) return null;   // not a JPEG

    /* walk the marker segments to APP1/Exif */
    let p = 2;
    while (p + 4 <= buf.length) {
      if (buf[p] !== 0xFF) return null;
      const marker = buf[p + 1];
      if (marker === 0xDA) return null;                // start of scan, no EXIF
      const len = buf.readUInt16BE(p + 2);
      if (len < 2) return null;
      if (marker === 0xE1 && buf.slice(p + 4, p + 10).toString('latin1') === 'Exif\0\0') {
        return readTiff(buf, p + 10, p + 2 + len);
      }
      p += 2 + len;
    }
    return null;
  } catch (e) {
    return null;
  } finally {
    if (fd !== null && fd !== undefined) { try { fs.closeSync(fd); } catch (e) {} }
  }
}

function readTiff(buf, base, end) {
  if (base + 8 > end || base + 8 > buf.length) return null;
  const bom = buf.slice(base, base + 2).toString('latin1');
  const le = bom === 'II';
  if (!le && bom !== 'MM') return null;
  const u16 = o => (o + 2 <= buf.length ? (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o)) : 0);
  const u32 = o => (o + 4 <= buf.length ? (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o)) : 0);

  const ifd0 = base + u32(base + 4);
  const want = { 0x9003: 'original', 0x0132: 'modified' };
  const found = {};

  /* IFD0, then the Exif sub-IFD that 0x8769 points at */
  for (const start of [ifd0, null]) {
    let at = start;
    if (at === null) {
      if (!found.__exifIfd) break;
      at = found.__exifIfd;
    }
    if (at < base || at + 2 > buf.length) break;
    const n = u16(at);
    if (n > 512) break;                                 // nonsense count
    for (let i = 0; i < n; i++) {
      const e = at + 2 + i * 12;
      if (e + 12 > buf.length) break;
      const tag = u16(e), type = u16(e + 2), count = u32(e + 4);
      if (tag === 0x8769) { found.__exifIfd = base + u32(e + 8); continue; }
      if (!want[tag] || type !== 2 || count < 19 || count > 64) continue;
      const off = base + u32(e + 8);
      if (off < base || off + count > buf.length) continue;
      const s = buf.slice(off, off + 19).toString('latin1');
      /* "YYYY:MM:DD HH:MM:SS" */
      const m = s.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
      if (m) found[want[tag]] = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
    }
  }
  return found.original || found.modified || null;
}

module.exports = { exifDate };
