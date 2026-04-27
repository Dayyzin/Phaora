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
