# The crest

The primary PHAÖRA crest from the brand board David approved 2026-10-25. The board
render was the concept; these are the production redraws — real vector, reproducible
at any size.

| File | What it is |
|---|---|
| `phaora-crest-primary.svg` | Silver on obsidian, teal Ö, tagline. The top-left board panel |
| `phaora-crest-editorial.svg` | Black on bone |
| `phaora-crest-mark.svg` | The ornament alone, transparent, one colour — hangtags, embroidery, foil |
| `phaora-crest-primary-1200.png`, `-2400.png` | Raster exports of the primary |
| `phaora-crest-editorial-1200.png` | Raster export of the editorial |
| `ornament-source.png` | The cleaned raster the vector was traced from. Re-trace from this |

Palette, from the board:

```
obsidian  #111114
silver    #BFC0C4
bone      #F0EEE8
pewter    #77777D
ice teal  #5ABFC6
```

- The wordmark is set from real glyph outlines of `assets/fonts/PhaoraFable-Wordmark.woff2`
  in a lens warp David sketched 2026-10-25: each letter scales with the envelope (small at
  the ends, swelled at the centre) and its cap line and baseline bend along the arcs; the
  band mask follows the same curves. The Ö is ice teal and glows in both colourways. No live text in the files — everything is paths, nothing depends on a font.
- The tagline is Inter 500 capitals, 0.50em tracking, also outlined.
- A cut gem (David's sketch, 2026-10-25) frames the crest: apex at the top star, girdle
  at the wordmark, culet at the bottom star. The facets are filled tonal planes behind
  the engraving — adjacent faces differ in value, so the edges come from contrast, not
  strokes — fading under the lettering with the same lens mask.
- The ornament engraving was generated 2026-10-25 (gpt-image-2.5-sunburst, Figma file
  "PHAÖRA Logo — Crest"), its cartouche box removed, then vectorized with vtracer
  (binary, cutout) from a 2x upscale, in two tonal layers: strong ink as the bright
  layer, midtone hatching as a dim layer beneath it. The mark variant carries the
  bright layer only, for flat reproduction.
- The wordmark band is a feathered SVG `mask` on the ornament group. Mask coordinates
  are in the ornament's native 1920×2560 space, not the document's.
