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

---

# Rebuild, 18 Nov (fixes 1 to 9, the corrections, and David's "Remove")

## Removed

The book (`poem.html`, `poem-room.html`, `media/poem/`, `poem.js`, `poem.css`, `room.css`, `room.js`): David marked it
"Remove" on the audit screenshot. The menu's THE HOUSE entry went with it, because no chapter or story page is left.
`vercel.json` still has a redirect from `/salon/r0r7lx/poem.html` to `/salon/r0r7lx/poem`. That redirect now leads to a 404; I didn't change it.

## Piece → side (no catalogue field gives a side; all are my call)

| Piece | Side | Source |
|---|---|---|
| Gelosia, leather coat | women | your call (belted, waisted cut in the render) |
| Öitava, pendant | both | your call |
| Ödara, leather bomber | both | your call |
| Itaoca, top-handle bag | women | your call |
| Coema, mini duffel | both | your call |
| Voluta, round bag | women | your call |
| Ritornelo, opera gloves | women | your call |
| Alvor, silk slip | women | your call |
| Cantilena, knit hoodie | both | your call |
| Coaraci, belt | both | your call |
| Öfusca, cat-eye sunglasses | women | your call |
| Heliodora, knit hoodie | both | your call |
| Cordel, silk scarf | both | your call |
| Carbonado, trousers | both | your call |
| Öbolo, card holder | both | your call |
| Lustre, necklace | both | your call |

## Piece → category (the type line is data; the grouping is my call)

| Piece | Category | Also under Accessories |
|---|---|---|
| Gelosia, Ödara | outerwear | no |
| Alvor | dresses | no |
| Cantilena, Heliodora, Carbonado | knitwear (all three are the same double-jacquard knit, from data) | no |
| Itaoca, Coema, Voluta | bags | yes |
| Öbolo | small leather goods | yes |
| Coaraci | belts | yes |
| Ritornelo | gloves | yes |
| Cordel | scarves | yes |
| Öfusca | eyewear | no (not in David's Accessories list) |
| Öitava, Lustre | jewellery | yes |

The YOU MAY ALSO LIKE rule is the same category, and the related piece must be on every side the piece is on. A row
appears only where such a piece exists:
Gelosia → Ödara · Öitava ↔ Lustre · Itaoca → Coema, Voluta · Voluta → Itaoca, Coema · Cantilena, Heliodora, Carbonado →
the other two. The other pieces have no row: Ödara, Coema, Ritornelo, Alvor, Coaraci, Öfusca, Cordel, Öbolo.

## Walkaround (WALKAROUND_MIN_USD = 3000, in `assets/shop/shop.js`)

| Piece | Price | Has walkaround | Shown |
|---|---|---|---|
| Gelosia | USD 5,400 | yes | yes |
| Öitava | USD 3,800 | no | no: over the line, no frames, so the page falls back to the images |
| Ödara | USD 3,200 | yes | yes |
| Itaoca | USD 2,900 | yes | no |
| Coema | USD 2,600 | yes | no |
| Voluta | USD 2,200 | yes | no |
| All others | under 3,000 | no | no |
| Lustre | no price | no | no |

The walkaround uses the room's own frames, lines, ink and blur (`assets/world/<id>/walk.json`). The frames are 256×144
on desk and 108×192 on phone, so they are soft at full screen, as they were in the room. On phone, one line ("Behind it:
opaque cream silk…") crosses the piece for a few frames. That comes from the line positions in walk.json, which I
didn't change.

## Seams (fix 8)

The page ground is #ffffff. Every whole-piece render's border pixels measure (255,255,255), and the cut-outs are
transparent, so no tile has an edge. Pixels sampled at 100% across tile edges:

| Shot | Pixels sampled | Values |
|---|---|---|
| Desktop grid, 1440×900 | x 600, 601, 1036–1039 at y 200, 500, 800 | all (255,255,255) |
| Desktop related row | x 479–481, 959–961 at y 300, 600 | all (255,255,255) |
| Phone grid, 390×844 | x 1, 195, 388 at y 100, 700 | all (255,255,255) |

The close-up photographs are full-frame (dark grounds) and are shown full column width, edge to edge, with no white
margin around them.

## Image sizes: re-exports wanted

No source in the repo is 2400 px wide, so srcset carries a 1200w copy (`assets/shop/1200/`) plus each source at its own
width. Nothing is shown larger than its native size. These sources are under 1000 px:

| Piece | Picture | Width |
|---|---|---|
| Coaraci | the room's cut-out `disc_belt_zoom.webp` | 305 (no longer used: the 1375 px render is used instead) |
| Carbonado | the only picture | 700 |
| Öitava | three-quarter, back | 280, 336 |
| Gelosia | three-quarter, back | 526, 597 |
| Ritornelo | three-quarter | 352 |
| Heliodora | three-quarter, back | 804, 930 |

## Facts missing (left out, not invented)

- Terms: no text exists ("Nothing is written here until counsel drafts them"). The Terms section of `service.html` is
  empty. For the same reason, the line "By pre-ordering you accept the Conditions of sale and the Privacy policy" is
  left off the piece page.
- Privacy: the only existing line is "What the register keeps today: a name and an email address, for word of Chapter
  I." It is there word for word.
- Social: the salon links no social accounts, so the footer has no Social column.
- Delivering to: no region line exists, so that column is left out too.
- New: no piece is marked new, so there is no NEW entry and no New badge.
- Search: the site has none.
- Short description: no description copy exists for any piece. The piece page shows its type line instead.
- Lustre: no price, so it has no price line, and its sticky bar shows the button only. Delivery and returns text
  doesn't exist for Lustre; Carbonado has no delivery text. The service page states each text only for the pieces it
  was written for.
- Carbonado's spec reads SIZE XS–XL, but the measurements page says its block grades to S–XXL. Both are shown word for
  word. Which is right?
- Fit text comes from `maison/rhztw6/sizes.html`, word for word, on the seven pieces that have sizes.

## Newsletter

The panel posts the email to the register the site already has: `crm.phaora.com/api/public/waitlist`, list
`chapter-1`, the same list the home page's Keep a seat card uses, with no name. Sign-ups land in the same CRM list as
the register and can't be told apart from it, except that they have no name. It sends only from phaora.com. Elsewhere
it says it is the preview. It shows once, after 8 s or half a screen of scrolling. It never shows on the first screen
of the opening grid, and never again after Close or a sign-up (`localStorage` key `phaora-newsletter`).

## On hold (orchestrator)

#1 logo file (still `assets/logo/wordmark-dark.svg`), #3 Lustre price, #5 where Pre-order points (still
`https://www.phaora.com/`).
