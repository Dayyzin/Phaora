# The projector poem: scenes

`poem.html`: the poem in the room, each chapter's scene thrown onto the back wall and the cove by a projector behind
the viewer. Every scene is cut from real render pixels already in the house; nothing is painted, patched or generated.

## Chapter → scene → why

`film` is the Chapter I film, "A seat is kept for you" (phaora-ops `marketing/ads/veil-coat-film`,
`veil-coat-film_christmas_16x9_144p.mp4`, here `media/film/film/video.mp4`); seconds are its own clock. The poem
retells that film, so its shots are the poem's scenes, in order.

| Ch. | Scene source | Loop | Why | Pin figure |
|---|---|---|---|---|
| Prologue | film 28.0–38.0: the house waiting, the screen lit, the crane over the row to the kept seat | 10 s | "a cinema in snow ... a little card upon its seat" | the screen lit (film 31.0) |
| I. Snow | film 0.0–10.0: the net on the shoulder, the hem, in falling snow under the bulbs | 10 s | "the bulbs burned gold ... a coat that took its time" | the net (film 2.0) |
| II. The doors | film 20.0–28.0: the mark at its back; the brass doors, the wreath, one door opens | 8 s | "the door swung open wide without a key" | the solo Ö (house pin art) |
| III. The aisle | film 38.0–46.0: down the aisle, the count on the screen | 8 s | "the screen began, and counted down" | Ödara (house pin art) |
| IV. The front row | film 58.0–68.0: the row in the screen's light, every seat taken | 10 s | "still, faces to the screen's warm glow" | the row and the card (film 37.5) |
| V. The kept seat | film 46.0–53.0: into the row, the coat sits in L2 | 7 s | "the coat sat down ... all at once, then settled right" | the coat seated (film 66.0) |
| VI. Reel one | 8K plate-vi (`img/book/plate-vi`, ca-01 the Muse, 5760 × 7680): Heliodora by the curtain, the kiss on its back; push-in on the still | 10 s | "Heliodora's silhouette ... a cream kiss knitted" | Heliodora (house pin art) |
| VII. Reel two | film 68.0–72.5: the suite on the screen, the push into it; held on its last frame | 8 s | "a suite by day ... one lamp left alight" | the suite (film 71.5) |
| VIII. House lights | film 72.5–77.5: the house lights up, the box where the card was; held on its last frame | 8 s | "where the coat had sat ... a box, black, square" | the box on the seat (film 75.0) |
| IX. The morning | film 77.5–82.5: the suite in the morning, the coat on its rail, the fir; held on its last frame | 8 s | "the coat hung on the rail, complete, a small fir green" | the coat on its rail (film 80.0) |
| Coda | film 87.5–98.0: the booth's changeover, the leader's "II" in red | 10.5 s | "reel one came free ... in red, a II" | the red II (film 95.0) |

The film's end card (82.5–87.5) is not used: the lettering is already the page's own.

## Resolution: 144p now, the 4K swaps in

The film exists at 144p only (`RENDER-4K.md`: 144p until David says yes to each piece's 4K). Each chapter is its own slot
(`media/poem/<chapter>/`, built by `build_poem.py`), so when a 4K clip lands it replaces the 144p one and the warp is
rebuilt; nothing else changes. VI is real 8K now.

## How it plays

- Pins: the house has three pin figures (the solo Ö, Ödara's and Heliodora's prints); every other piece's pins are the Ö.
  So a chapter without its own uses one frame of its scene, sampled into the 84 x 100 pin grid as the Muse's pins are
  sampled from its print (`build_poem.py --pins`, `assets/poem/h_<ch>_*.png`).
- Room: the fixed stage stills (`assets/room/stage-*.webp`) are the room's shape; per chapter the room is re-captured
  from `room.js` itself with that chapter's pin figure (`?empty=1&capture=1`), and the pins' ripple from one figure to
  the next is the room's own morph, captured as a short clip. Pins are the face, their cast shadows the reverse.
- Projection: each scene is warped onto the back wall and the cove (the curve baked in), then laid onto the dimmed room
  so the wall's own light multiplies it: the pins stay visible through the picture and it bends where the wall curves.
  Phone and desktop both use the pre-warped clips: one path, 60 fps everywhere.
- Light: the poem page at its dimmest (the film page darker still). The beam from behind the viewer, faint dust in it,
  a flicker on the projector's start only.
- Chapter change: the projector clicks, the picture cuts to dark, the pins ripple and re-form into the next figure, the
  next scene fades up. The next chapter's clip is preloaded.
- Lines: in the room's type over the lower part of the projection, one line a scroll step.
