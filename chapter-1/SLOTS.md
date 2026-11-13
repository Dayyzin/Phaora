# SLOTS: every image and film on the Chapter I site

Built by `build.py`. 118 slots: **5 final**, **90 holding a stand-in** (the best approved
render or still we have, at 144p or 1600), **23 waiting** (a quiet placeholder of the right ratio, labelled
with what it waits for).

**To add a photo:** put the file in the slot's folder as `master.png` (or `.jpg`, `.webp`, `.tif`; a film: `master.mp4`),
then run `python3 build.py`. The build makes the web sizes (480, 960, 1600, 2560, 3840 and 7680 wide, WebP) and the
srcset, and every page that uses the slot shows it. A turning-room slot takes its 72 frames as `f000.webp` to
`f071.webp` instead.

The first image on each piece page is its 16K front; every other image is 8K. The site serves them up to 7680 wide;
the 16K master stays in the slot as the source.

Stand-ins and placeholders carry a small label on the preview (any host but phaora.com): STAND-IN or WAITS FOR, and the
path. On phaora.com the labels never show.

| page | slot | the file it wants | what’s there now |
|---|---|---|---|
| shared | `img/shared/pack-closed/` | packaging/chapter1/renders: closed (the approved final, 3840 px) (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/packaging/closed-1920.webp (1920 × 1440) |
| shared | `img/shared/pack-open/` | packaging/chapter1/renders: open (the approved final, 3840 px) (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/packaging/open-1920.webp (1920 × 1440) |
| shared | `img/shared/pack-disc/` | packaging/chapter1/renders: disc (the approved final, 3840 px) (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/packaging/disc-1920.webp (1920 × 1920) |
| shared | `img/shared/pack-shopping/` | packaging/chapter1/renders: shopping (the approved final, 3840 px) (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/packaging/shopping-1920.webp (1920 × 1440) |
| shared | `img/shared/pack-trims/` | packaging/chapter1/renders: trims (the approved final, 3840 px) (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/packaging/trims-1920.webp (1920 × 1440) |
| film | `media/film/film/` | the film, "A Seat Is Kept for You", the final cut (16:9, 3840 × 2160 MP4) | stand-in: departments/apparel/marketing/ads/veil-coat-film/preview/veil-coat-film_christmas_16x9_144p.mp4 |
| film | `media/film/vertical/` | the 15 s vertical (9:16, 2160 × 3840 MP4) | stand-in: departments/apparel/marketing/ads/veil-coat-film/preview/veil-coat-film_15s_9x16_144p.mp4 |
| film | `img/film/poster/` | clip 8: the row from behind and above, the kept seat on the left third (8K, 7680 × 4320) | stand-in: departments/apparel/marketing/story/stills/b2_the-front-row-and-the-kept-seat_256x144.png (256 × 144) |
| film | `media/film/next-reel/` | the next reel: the leader, II in red (16:9, 3840 × 2160 MP4) | stand-in: departments/apparel/marketing/ads/next-reel/preview/next_reel_3_leader_II_144p_red.mp4 |
| film | `img/film/short-c1/` | C1, Heliodora: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | stand-in: departments/apparel/marketing/story/stills/ca-01-the-muse_108x144.png (108 × 144) |
| film | `img/film/short-c3/` | C3, Ritornelo: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | stand-in: departments/apparel/marketing/story/stills/ca-03-the-opera-gloves_108x144.png (108 × 144) |
| film | `img/film/short-c4/` | C4, Cordel: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | stand-in: departments/apparel/marketing/story/stills/ca-04-the-silk-scarf_108x144.png (108 × 144) |
| film | `img/film/short-c5/` | C5, Öbolo: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | stand-in: departments/apparel/marketing/story/stills/ca-05-the-card-holder_108x144.png (108 × 144) |
| film | `img/film/short-c6/` | C6, Öfusca: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | stand-in: departments/apparel/marketing/story/stills/ca-06-star-in-shades_108x144.png (108 × 144) |
| film | `img/film/short-c8/` | C8, Itaoca: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | stand-in: departments/apparel/marketing/story/stills/ca-08-the-po-top-handle_108x144.png (108 × 144) |
| film | `img/film/short-c9/` | C9, Cantilena: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | WAITING: a placeholder of the right ratio |
| film | `img/film/short-c10/` | C10, Ödara: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | stand-in: departments/apparel/marketing/story/stills/ca-10-the-muse-bomber_108x144.png (108 × 144) |
| film | `img/film/short-c11/` | C11, Alvor: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | stand-in: departments/apparel/marketing/story/stills/ca-11-the-silk-slip_108x144.png (108 × 144) |
| film | `img/film/short-c12/` | C12, Coaraci: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | stand-in: departments/apparel/marketing/story/stills/ca-12-the-disc-belt_108x144.png (108 × 144) |
| film | `img/film/short-c13/` | C13, Voluta: the coming attraction (until it lands, its last frame) (16:9, 3840 × 2160 MP4 or 8K still) | stand-in: departments/apparel/marketing/story/stills/ca-13-the-reel_108x144.png (108 × 144) |
| film | `media/film/short-c14/` | C14, Coema: the coming attraction (16:9, 3840 × 2160 MP4) | stand-in: departments/apparel/marketing/story/preview/60_the-matinee_suite-bench_16x9_144p.mp4 |
| book | `img/book/plate-prologue/` | the plate for Prologue: The front row from behind, house dark, the screen glowing. (8K, 7680 × 4320) | stand-in: departments/apparel/marketing/story/stills/b2_the-front-row-and-the-kept-seat_256x144.png (256 × 144) |
| book | `img/book/plate-i/` | the plate for I. Snow: Under the marquee in falling snow: the net on the coat’s shoulder, close, the bulbs behind. (8K, 5760 × 7680) | WAITING: a placeholder of the right ratio |
| book | `img/book/plate-ii/` | the plate for II. The Doors: The brass doors and the wreath, the coat’s cuff at the edge of the frame. (8K, 7680 × 4320) | stand-in: departments/apparel/marketing/story/stills/b1_the-doors-in-the-snow_256x144.png (256 × 144) |
| book | `img/book/plate-iii/` | the plate for III. The Aisle: Down the centre aisle toward the screen, “3” on it, seat backs passing. (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| book | `img/book/plate-iv/` | the plate for IV. The Front Row: The whole row from in front, every piece in its seat, the screen’s light on them. (8K, 7680 × 4320) | stand-in: departments/apparel/marketing/story/stills/b4_the-row-from-the-screen_256x144.png (256 × 144) |
| book | `img/book/plate-v/` | the plate for V. The Kept Seat: Seat L2 from above the seat in front, close. (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/8k/b5_seat-L2_the-card_5760x7680.png (5760 × 7680) |
| book | `img/book/plate-vi/` | the plate for VI. Reel One: The lobby outside the house: Heliodora on its form by the curtain, the kiss on its back. (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/8k/ca-01-the-muse_5760x7680.png (5760 × 7680) |
| book | `img/book/plate-vii/` | the plate for VII. Reel Two: The suite at midnight: Alvor on the wardrobe door. (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/ca-11-the-silk-slip_108x144.png (108 × 144) |
| book | `img/book/plate-viii/` | the plate for VIII. House Lights: The row with the lights up, every piece in its seat. (8K, 7680 × 4320) | stand-in: departments/apparel/marketing/story/stills/b6_house-lights_256x144.png (256 × 144) |
| book | `img/book/plate-ix/` | the plate for IX. The Morning: The suite on Christmas morning: the coat on its rail by the window, the fir in the corner. (8K, 7680 × 4320) | stand-in: departments/apparel/marketing/story/stills/b7_morning_256x144.png (256 × 144) |
| book | `img/book/plate-coda/` | the plate for the coda: The booth: one reel off the projector, another on. (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/b8_the-next-reel_108x144.png (108 × 144) |
| register | `media/register/reward-desk/` | the kept seat’s film: the cushion folds down, the card lands (desk) (16:9 MP4) | FINAL: departments/apparel/website/chapter2/assets/register/reward_desk.mp4 |
| register | `media/register/reward-phone/` | the kept seat’s film (phone) (9:16 MP4) | FINAL: departments/apparel/website/chapter2/assets/register/reward_phone.mp4 |
| heliodora | `img/heliodora/front/` | departments/apparel/new-pieces-2026-11/build/muse-allover/site/muse_front_16k.png (16K, 8640 × 15360) | stand-in: departments/apparel/website/chapter2/assets/line/muse_allover/muse-front.webp (1116 × 1136) |
| heliodora | `img/heliodora/three-quarter/` | three-quarter view, 8K (8K, 4320 × 7680) | stand-in: departments/apparel/website/chapter2/assets/line/muse_allover/muse-three-quarter.webp (972 × 1186) |
| heliodora | `img/heliodora/back/` | back view, 8K (8K, 4320 × 7680) | stand-in: departments/apparel/website/chapter2/assets/line/muse_allover/muse-back.webp (1104 × 1135) |
| heliodora | `img/heliodora/detail-kiss/` | the kiss on the back, 8K close-up (8K, 7680 × 4320) | FINAL: departments/apparel/new-pieces-2026-11/build/muse-allover/site/muse_kiss_8k.png (7680 × 4320) |
| heliodora | `img/heliodora/detail-material/` | the knit at stitch scale, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/muse-allover/site/preview_16k_material.png (1600 × 900) |
| heliodora | `img/heliodora/detail-cuff/` | the cuff, where her hair thins to single dots, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| heliodora | `img/heliodora/world/` | C1: the last frame, the world plate (the lobby) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/8k/ca-01-the-muse_5760x7680.png (5760 × 7680) |
| cantilena | `img/cantilena/front/` | departments/apparel/new-pieces-2026-11/build/cantilena/site/cantilena_front_16k.png (16K, 8640 × 15360) | stand-in: departments/apparel/new-pieces-2026-11/build/cantilena/real/cantilena_front_1600_black_cream.png (1600 × 1600) |
| cantilena | `img/cantilena/three-quarter/` | three-quarter view, 8K (8K, 4320 × 7680) | WAITING: a placeholder of the right ratio |
| cantilena | `img/cantilena/back/` | back view, 8K (8K, 4320 × 7680) | WAITING: a placeholder of the right ratio |
| cantilena | `img/cantilena/detail-material/` | the checker at stitch scale, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| cantilena | `img/cantilena/detail-cream/` | cream on cream, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/cantilena/real/cantilena_front_144_cream.png (144 × 144) |
| cantilena | `img/cantilena/detail-eyelet/` | the gold eyelet and tip, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| cantilena | `img/cantilena/world/` | C9: the last frame, the world plate (the suite, by day) (8K, 5760 × 7680) | WAITING: a placeholder of the right ratio |
| odara | `img/odara/front/` | departments/apparel/new-pieces-2026-11/build/muse-bomber/site/muse_bomber_front_16k.png (16K, 8640 × 15360) | stand-in: departments/apparel/website/chapter2/assets/line/muse_bomber/muse-bomber-front.webp (1350 × 1380) |
| odara | `img/odara/three-quarter/` | three-quarter view, 8K (8K, 4320 × 7680) | stand-in: departments/apparel/website/chapter2/assets/line/muse_bomber/muse-bomber-three-quarter.webp (1355 × 1392) |
| odara | `img/odara/back/` | back view, 8K (8K, 4320 × 7680) | stand-in: departments/apparel/website/chapter2/assets/line/muse_bomber/muse-bomber-back.webp (1372 × 1383) |
| odara | `img/odara/open/` | the open view, 8K, the lining and the kiss, after the satin pass (open8k, 19c6ef39, is a stand-in: its satin is being redone) (8K, 4320 × 7680) | stand-in: departments/apparel/new-pieces-2026-11/build/muse-bomber/renders/open8k/muse_bomber_open_8k.jpg (7680 × 4320) |
| odara | `img/odara/detail-holes/` | the holes and the silk, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/muse-bomber/site/check/closeup16k_100_holes_silk.png (799 × 801) |
| odara | `img/odara/detail-mark/` | the mark on her cheek, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/muse-bomber/site/check/closeup16k_100_cut_o_holes_silk.png (799 × 801) |
| odara | `img/odara/detail-pull/` | the gold pull, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/muse-bomber/site/check/front16k_100_gold_pull.png (801 × 799) |
| odara | `img/odara/world/` | C10: the last frame, the world plate (the suite, at dusk) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/ca-10-the-muse-bomber_108x144.png (108 × 144) |
| gelosia | `img/gelosia/front/` | departments/apparel/new-pieces-2026-11/build/veil-coat/site/veil_coat_front_16k.png (16K, 8640 × 15360) | stand-in: departments/apparel/website/chapter2/assets/line/veil_coat/veil-coat-front.webp (658 × 1261) |
| gelosia | `img/gelosia/three-quarter/` | three-quarter view, 8K (8K, 4320 × 7680) | stand-in: departments/apparel/website/chapter2/assets/line/veil_coat/veil-coat-three-quarter.webp (563 × 1283) |
| gelosia | `img/gelosia/back/` | back view, 8K (8K, 4320 × 7680) | stand-in: departments/apparel/website/chapter2/assets/line/veil_coat/veil-coat-back.webp (641 × 1241) |
| gelosia | `img/gelosia/detail-net/` | the net closing to solid leather, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/veil-coat/site/preview_16k_net-fade.png (1600 × 900) |
| gelosia | `img/gelosia/detail-button/` | a button and the belt, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| gelosia | `img/gelosia/detail-cuff/` | the cuff strap, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| gelosia | `img/gelosia/world/` | the film: the last frame, the world plate (the doors, in the snow) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/b1_the-doors-in-the-snow_108x144.png (108 × 144) |
| alvor | `img/alvor/front/` | departments/apparel/new-pieces-2026-11/build/silk-slip/site/silk_slip_front_16k.png (16K, 8640 × 15360) | stand-in: departments/apparel/website/chapter2/assets/line/silk_slip/silk-slip-front.webp (487 × 1180) |
| alvor | `img/alvor/three-quarter/` | three-quarter view, 8K (8K, 4320 × 7680) | WAITING: a placeholder of the right ratio |
| alvor | `img/alvor/back/` | back view, 8K (8K, 4320 × 7680) | WAITING: a placeholder of the right ratio |
| alvor | `img/alvor/detail-sheen/` | the sheen, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/silk_slip/silk-slip-closeup-sheen.webp (1600 × 1600) |
| alvor | `img/alvor/detail-strap/` | a strap, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| alvor | `img/alvor/world/` | C11: the last frame, the world plate (the suite, at midnight) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/ca-11-the-silk-slip_108x144.png (108 × 144) |
| voluta | `img/voluta/front/` | departments/apparel/new-pieces-2026-11/build/the-reel/site/reel_front_16k.png (16K, 15360 × 8640) | FINAL: departments/apparel/new-pieces-2026-11/build/the-reel/site/reel_front_16k.png (8640 × 15360) |
| voluta | `img/voluta/three-quarter/` | three-quarter view, 8K (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/the-reel/site/reel_threequarter_cream_1600.png (1600 × 1600) |
| voluta | `img/voluta/open/` | open view, 8K (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/the_reel/reel-open.webp (998 × 1311) |
| voluta | `img/voluta/detail-material/` | the calfskin, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/the-reel/site/preview_16k_material.png (1600 × 900) |
| voluta | `img/voluta/detail-clasp/` | the clasp, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/the-reel/site/gate/reel_threequarter_cream_win100_clasp.png (480 × 480) |
| voluta | `img/voluta/detail-band/` | the pressed band, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/the-reel/site/gate/reel_threequarter_cream_win100_deboss_band.png (480 × 480) |
| voluta | `img/voluta/world/` | C13: the last frame, the world plate (the suite’s vanity, morning) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/ca-13-the-reel_108x144.png (108 × 144) |
| itaoca | `img/itaoca/front/` | departments/apparel/new-pieces-2026-11/build/po-tophandle/site/po_tophandle_front_16k.png (16K, 15360 × 8640) | stand-in: departments/apparel/new-pieces-2026-11/build/po-tophandle/site/preview_1600/po_tophandle_front.png (1600 × 1600) |
| itaoca | `img/itaoca/three-quarter/` | three-quarter view, 8K (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/po-tophandle/site/preview_1600/po_tophandle_threequarter.png (1600 × 1600) |
| itaoca | `img/itaoca/open/` | open view, 8K (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/po-tophandle/site/preview_1600/po_tophandle_open.png (1600 × 1600) |
| itaoca | `img/itaoca/detail-flap/` | the pö on the flap, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| itaoca | `img/itaoca/detail-clasp/` | the clasp, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| itaoca | `img/itaoca/detail-handle/` | the rolled handle, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| itaoca | `img/itaoca/world/` | C8: the last frame, the world plate (the dressing table) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/ca-08-the-po-top-handle_108x144.png (108 × 144) |
| coema | `img/coema/front/` | departments/apparel/new-pieces-2026-11/build/weekender/site/matinee_front_16k.png (16K, 15360 × 8640) | stand-in: departments/apparel/website/chapter2/assets/line/matinee/matinee-front.webp (1274 × 1021) |
| coema | `img/coema/open/` | open view, 8K (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| coema | `img/coema/detail-closeup/` | the pressed row, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/weekender/site/preview_16k_closeup.png (1600 × 900) |
| coema | `img/coema/detail-charm/` | the charm, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| coema | `img/coema/detail-lining/` | the couple on the suede, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| coema | `img/coema/world/` | C14: the last frame, the world plate (the suite’s bench, morning) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/preview/60_the-matinee_suite-bench_last_256x144.png (256 × 144) |
| ofusca | `img/ofusca/front/` | departments/apparel/new-pieces-2026-11/build/sunglasses/site/sunglasses_front_16k.png (16K, 15360 × 8640) | stand-in: departments/apparel/website/chapter2/assets/line/sunglasses/star-in-shades-sunglasses-front.webp (1332 × 638) |
| ofusca | `img/ofusca/flat/` | flat view, 8K (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/sunglasses/star-in-shades-sunglasses-flat.webp (1467 × 596) |
| ofusca | `img/ofusca/detail-plate/` | the gold plate, 8K close-up (8K, 7680 × 4320) | FINAL: departments/apparel/new-pieces-2026-11/build/sunglasses/site/sunglasses_plate_8k.jpg (7680 × 4320) |
| ofusca | `img/ofusca/detail-case/` | the case, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| ofusca | `img/ofusca/world/` | C6: the last frame, the world plate (the car, at night) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/ca-06-star-in-shades_108x144.png (108 × 144) |
| cordel | `img/cordel/front/` | departments/apparel/new-pieces-2026-11/build/silk-scarf/site/silk_scarf_front_16k.png (16K, 15360 × 8640) | stand-in: departments/apparel/website/chapter2/assets/line/silk_scarf/silk-scarf-front.webp (1597 × 1335) |
| cordel | `img/cordel/knot/` | knot view, 8K (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/silk_scarf/silk-scarf-knot.webp (839 × 1455) |
| cordel | `img/cordel/detail-print/` | the print, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/silk_scarf/silk-scarf-closeup-print.webp (1600 × 1600) |
| cordel | `img/cordel/detail-hem/` | the rolled hem, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/silk_scarf/silk-scarf-closeup-hem.webp (1600 × 1600) |
| cordel | `img/cordel/world/` | C4: the last frame, the world plate (the café) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/ca-04-the-silk-scarf_108x144.png (108 × 144) |
| obolo | `img/obolo/front/` | departments/apparel/new-pieces-2026-11/build/card-holder/site/card_holder_front_16k.png (16K, 15360 × 8640) | stand-in: departments/apparel/website/chapter2/assets/line/card_holder/card-holder-front.webp (1786 × 830) |
| obolo | `img/obolo/back/` | back view, 8K (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/card_holder/card-holder-back.webp (1383 × 578) |
| obolo | `img/obolo/detail-edge/` | the painted edge, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/card_holder/card-holder-closeup-edge.webp (1600 × 1200) |
| obolo | `img/obolo/detail-disc/` | the disc, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/card_holder/card-holder-closeup-disc.webp (800 × 600) |
| obolo | `img/obolo/detail-material/` | the pebble, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/card-holder/site/preview_16k_card_holder_material.png (1600 × 900) |
| obolo | `img/obolo/world/` | C5: the last frame, the world plate (the box office) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/ca-05-the-card-holder_108x144.png (108 × 144) |
| ritornelo | `img/ritornelo/front/` | departments/apparel/new-pieces-2026-11/build/opera-gloves/site/opera_gloves_front_16k.png (16K, 15360 × 8640) | stand-in: departments/apparel/website/chapter2/assets/line/opera_gloves/opera-gloves-front.webp (1375 × 1164) |
| ritornelo | `img/ritornelo/three-quarter/` | three-quarter view, 8K (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/opera_gloves/opera-gloves-three-quarter.webp (389 × 1480) |
| ritornelo | `img/ritornelo/detail-net/` | the net opening up the arm, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/new-pieces-2026-11/build/opera-gloves/site/preview_16k_net.png (1600 × 900) |
| ritornelo | `img/ritornelo/detail-snap/` | the snap, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| ritornelo | `img/ritornelo/world/` | C3: the last frame, the world plate (the café) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/8k/ca-03-the-opera-gloves_5760x7680.png (5760 × 7680) |
| coaraci | `img/coaraci/front/` | departments/apparel/new-pieces-2026-11/build/disc-belt/site/disc_belt_front_16k.png (16K, 15360 × 8640) | stand-in: departments/apparel/website/chapter2/assets/line/disc_belt/disc-belt-front.webp (1375 × 751) |
| coaraci | `img/coaraci/straight/` | straight view, 8K (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/disc_belt/disc-belt-straight.webp (1563 × 1084) |
| coaraci | `img/coaraci/detail-disc/` | the disc, 8K close-up (8K, 7680 × 4320) | stand-in: departments/apparel/website/chapter2/assets/line/disc_belt/disc-belt-closeup-disc.webp (800 × 600) |
| coaraci | `img/coaraci/detail-edge/` | the painted edge, 8K close-up (8K, 7680 × 4320) | WAITING: a placeholder of the right ratio |
| coaraci | `img/coaraci/world/` | C12: the last frame, the world plate (the suite, at first light) (8K, 5760 × 7680) | stand-in: departments/apparel/marketing/story/stills/ca-12-the-disc-belt_108x144.png (108 × 144) |
| home | `img/home/turn-gelosia/` | Gelosia: one turn, 72 frames, f000-f071.webp (72 frames, 2160 px tall) | stand-in: its views (front, three-quarter, back) turned by the page |
| home | `img/home/turn-heliodora/` | Heliodora: one turn, 72 frames, f000-f071.webp (72 frames, 2160 px tall) | stand-in: its views (front, three-quarter, back) turned by the page |
| home | `img/home/turn-odara/` | Ödara: one turn, 72 frames, f000-f071.webp (72 frames, 2160 px tall) | stand-in: its views (front, three-quarter, back, open) turned by the page |
