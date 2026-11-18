# Salon r0r7lx: live audit, 18 Nov 2026

Live page: https://www.phaora.com/salon/r0r7lx/ (served file matches `main`, 33,729 bytes).
Playwright, Chromium, phone 390x844 (touch) and desktop 1440x900. Grid scrolled top to bottom;
all 16 piece views opened via `?piece=<id>`; `poem` and `poem-room.html` loaded.

## Clean

| Check | Phone | Desktop |
|---|---|---|
| Console errors / page errors | 0 | 0 |
| HTTP 4xx/5xx, failed requests | 0 | 0 |
| Horizontal overflow (scrollWidth) | 390 = 390 | 1440 = 1440 |
| Broken images (grid, 16 pieces) | 0 | 0 |
| Broken images (piece views, 16) | 0 | 0 |
| Page load (`load` event) | 1.6 s | 1.1 s |
| Any single request over 1.5 s | none | none |
| Missing local asset paths in HTML | none | none |
| "pre-sale" / "presale" | none | none |
| Exclamation marks, hype words | none | none |
| `noindex, nofollow, noarchive` | on all three pages | |

"Gold" appears only on the two jewellery pieces: Öitava (solid 18K yellow gold, 18K chain) and
Lustre (18K gold, polished; hotspot "GOLD · 18K, POLISHED"). All other hardware is written
"brass". Not changed; the materials need confirming against the spec, which I can't check from here.

## Found, not changed (needs a decision)

| # | Item | Where |
|---|---|---|
| 1 | Logo is `assets/logo/wordmark-dark.svg` ("casino wordmark", commit 60eb6e2, today), not the lettering in `assets/brand/`. It is outlines, not a typed font, but it is not the lettering CLAUDE.md names. `assets/brand/lettering-offwhite.svg` is light-on-dark; the solid dark version (`PHAORA-lettering.svg`) lives in phaora-ops and is not in this repo. | `assets/js/stage.js:26-29` |
| 2 | Four of six nav links point to `#top`: The line, The film, The room, The house. Only The book (`poem`) and Register go somewhere. | `index.html:15` |
| 3 | Lustre has no price: no USD line in the grid, no "Keep a seat" link, and the piece view button reads "Reserve" with no price. Price missing from source; not invented. | `index.html` `#lustre` |
| 4 | Call to action wording differs: grid says "Keep a seat", piece view button says "Reserve", piece view section says "Pre-order". | `index.html`, `assets/js/piece.js` |
| 5 | Every "Keep a seat" and price link goes to `https://www.phaora.com/` (home), not a piece or pre-order page. | `index.html` |
| 6 | No Open Graph / Twitter tags, so a link pasted into email or chat shows no preview card. | `index.html` `<head>` |
| 7 | Phone piece view: the Reserve button text wraps onto two lines ("RESERVE · USD / 5,400") in the narrow right column. | `assets/css/piece.css` |
| 8 | Coaraci grid and piece image is 305 px wide (`disc_belt_zoom.webp`); every other piece is 700–1600 px. Looks fine at current sizes. | `assets/catalogue/shadowed/` |
| 9 | Coaraci piece view: two of the side thumbnails render as near-empty grey squares. | piece view thumbs |
| 10 | `poem-room` without `.html` returns 404. Nothing links to it that way (poem.js uses `poem-room.html`). | — |

## Fixed

Nothing. No item above is plainly broken in a way I can fix without a decision or a missing fact.
