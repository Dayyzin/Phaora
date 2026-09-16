# Sculpture Photo Upload Guide

## Folder naming

Each piece gets its own folder under `/assets/sculptures/`. Use kebab-case for the slug:

```
the-amethyst-crown  (not "The Amethyst Crown" or "amethyst_crown")
```

## Photo naming convention

Each folder should contain up to 12 photos, named sequentially:

| File               | Purpose                          |
|--------------------|----------------------------------|
| 01-hero.jpg        | Primary marketing shot           |
| 02-front.jpg       | Straight-on front view           |
| 03-side-left.jpg   | Left profile                     |
| 04-side-right.jpg  | Right profile                    |
| 05-back.jpg        | Rear view                        |
| 06-detail-face.jpg | Close-up of face/head            |
| 07-detail-feathers.jpg | Close-up of feather/wing detail |
| 08-base-stone.jpg  | Base material full view          |
| 09-base-detail.jpg | Base material close-up           |
| 10-scale-context.jpg | Piece shown with scale reference |
| 11-lifestyle.jpg   | Styled/lifestyle setting         |
| 12-editorial.jpg   | Editorial/artistic angle         |

## Image requirements

- Format: JPEG (.jpg)
- Long edge: 2400px maximum
- Color space: sRGB
- Quality: 85% JPEG compression
- No EXIF metadata (strip before upload, or run the optimize script)

## How to add a new piece

1. Create a new folder: `/assets/sculptures/<piece-slug>/`
2. Drop 6-12 photos using the naming convention above
3. Add a new entry to `/assets/sculptures/catalog.json` (copy any existing entry as a template, fill in the real values)
4. Run image optimization: `node scripts/optimize-sculpture-images.js`
5. Commit and push to git

## How to mark a piece as sold

1. Open `/assets/sculptures/catalog.json`
2. Find the piece by slug
3. Change `"is_sold": false` to `"is_sold": true`
4. Commit and push

The piece page will automatically show a SOLD badge and disable the buy button.

## How to feature a piece

Set `"is_featured": true` in the catalog entry. Featured pieces appear first in the index grid and in the "related pieces" section of other piece pages.

---

## Measurements

Everything below is optional and everything below is printed only if it is
filled in. A blank stays off the page rather than turning into a guess — so a
half-measured piece is safe to ship, it just says less.

Open `/assets/sculptures/catalog.json`, find the piece by slug, and fill in:

```json
{
  "slug": "beacon",
  "base_material": "Rose quartz on serpentine",
  "wingspan_inches": 18,
  "specs": {
    "total_height_inches": 14,
    "total_width_inches": 18,
    "total_depth_inches": 7,
    "weight_lbs_total": 22,
    "finish": "Hand-polished, unwaxed"
  }
}
```

Then rebuild:

```
node build-shop.js
```

### What to take, in the order it is quickest to take it

| Field | What it means |
|---|---|
| `total_height_inches` | Floor of the base to the highest point of the piece as it stands |
| `total_width_inches` | Widest point across, wingtip to wingtip if the wings are out |
| `total_depth_inches` | Front to back at the deepest point, usually the base |
| `weight_lbs_total` | The whole object, base included — what a courier will bill on |
| `wingspan_inches` | Only if it differs from the overall width |
| `base_material` | The stone, in plain words: "Amethyst geode", "Rose quartz on serpentine" |
| `finish` | How the surface was left: polished, matte, hand-polished, waxed |

Inches and pounds. The page prints centimetres and kilograms next to them
automatically — that is arithmetic, not a second measurement, so do not record
both.

Round to the nearest inch and the nearest pound. A buyer is deciding whether it
fits on a console table, not machining a part.

### Where each one shows up

The spec table on `/shop/p/<slug>.html`. `base_material` also joins the line
under the name on every card in the shop, so it is the one worth doing first —
it is the only one that changes what the grid says.
