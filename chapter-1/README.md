# The Chapter I site (static, not deployed)

David, 13 Nov: "Can we build a full website with all that we have available? Later we just add the photos."

Every page of Chapter I, built by `build.py` from `content.py`. Each image and film is a named slot (`SLOTS.md`).
To add a photo: drop it in its slot's folder as `master.<ext>` and run `python3 build.py`.

Open it through any static server from this folder. Nothing here goes to phaora.com.

## The site rebuild (claude/site-rebuild, 14 Nov)
David approved the structure; nothing goes to main or live until he has seen the screenshots (`review/site-rebuild/`).
- `index.html`: the intro, then the pin room as the catalogue's front door: chapter2's `assets/room.js` (WebGL, with
  `three.module.js`), its scene, light, pin walls, pin waves and dissolve unchanged (three small changes, each marked
  "Chapter I site:"). Heliodora first, Gelosia second, then the line; one piece a gesture; a tap opens the piece's page;
  after the last piece the room opens into the catalogue. Built from `room_page.html` by `build.py`; the pieces' room
  inputs (cut-outs, pin art, shadow casters) by `build_room.py`. `nogl_room.js` and `assets/pv/` are copied from chapter2
  but not used (they hold chapter2's two pieces only).
- Each piece's page, top to bottom: its world (the director's signature shot), its views beside the name, specs, price,
  made to order and sizes; close-ups at 100%; its scene from the book with its short; the pieces in the same scene; the
  rest of the line.
- `line.html` is the catalogue (image and name, by category); `book.html` is the book's home (the cover, the chapters),
  each chapter its own page set as verse from `POEM.md` (the book as a poem, phaora-ops ee289bad), with its plate; `film.html` opens on Short 2 (the Reel down the aisle), then the film.
- The register stays phaora.com's own (`/`).

## Pages (26)
- `index.html`: the opening (the Veil Coat's shadow, one turn, 9 s, frames from the shadows branch d22dd59f), the
  live register's intro film, then the house: the lettering, the line, and the turning room (Gelosia, Heliodora, Ödara).
- `line.html` and the 15 piece pages (line.json; the crystal Ö is a gift and gets no page).
- `film.html`, `book.html` (BOOK.md, two reels, with its plates), `register.html` (the kept seat and its reward).
- `house.html`, `care.html`, `sizes.html`, `returns.html`, `contact.html`, `privacy.html`, `terms.html`.

## The piece pages: a walk around the piece
The scroll is the camera. Each stop (in `content.py`) is a view, a focus on the piece's own box and a zoom; between two
stops on one view the camera travels, and between two views it goes round the piece. The notes (the specs and the
book's maker's notes) are engraved beside the part they describe, outside the silhouette where there is room. The
camera and the notes are placed on the piece's box, which the build measures in each picture, so a new render keeps
them on their parts. After the last stop the camera pulls back and the piece's world (SHORTS.md) comes up round it.

## Decisions taken in this build
- The lettering is fetched from `assets/brand/` and inlined on each page by `site.js` (as the register prototype does),
  not pasted into every page: each file is 800 KB. The mark is David's 10 Nov drawing, its light made the ink or kept
  cream; it is not redrawn. No panda anywhere. No typed logo.
- Prices (David, 14 Nov: "real prices on every piece except Lustre"): `content.PRICES`, from pricing/CHAPTER-I-PRICING.md
  (Öitava at USD 3,800). Lustre shows none. Nothing reads PRICE ON REQUEST.
- No date anywhere: the register's "opens Christmas Eve" lines are left out. The book's story keeps its Christmas Eve.
- The register sends nothing except on phaora.com (canon's route); here it plays the reward and stores nothing.
- Buy buttons lead to the register ("Keep a seat"), as REGISTER.md has it before the pre-order opens.
- Itaoca's views are the 1600 previews with the PÖ on the flap only (the older line picture had it all over).
- The site serves images up to 7680 wide; the 16K master stays in its slot as the source.
- Unconfirmed care lines and legal pages carry a preview-only label or a "For David" line; no legal terms invented.
