# Shop image prompts — GPT Image

Eight images for `shop.html`. Generate each at **1536 × 1024 (landscape)**, save as PNG,
drop into `assets/shop/` under the exact filename listed.

Until a file is there the page falls back: product cards show the catalogue photo, the hero
and the band show their gradient. Nothing breaks while you work through the list.

| Filename | Slot | Piece |
|---|---|---|
| `hero.png` | Hero, right side | The Cluster |
| `card-the-cluster.png` | Card 1 | The Cluster — $44,000 |
| `card-the-dynasty.png` | Card 2 | The Dynasty — $52,000 |
| `card-the-canopy.png` | Card 3 | The Canopy — $68,000 |
| `card-the-scarlets.png` | Card 4 | The Scarlets — $42,000 |
| `card-the-portal.png` | Card 5 | The Portal — $35,000 |
| `card-the-raptor.png` | Card 6 | The Raptor — $36,000 |
| `difference.png` | Authenticity band | Amethyst macro |

---

## The house style block

Paste this at the end of **every** prompt below. It is what makes the eight images read as
one set instead of eight separate pictures.

```
House style, apply exactly: luxury product photography, single soft key light from high
front-left, deep falloff into shadow. Background is a seamless deep navy-black studio void,
roughly #04091A, unlit at the edges. Fine gold dust motes drift in the air, catching the
light, sparse and small. Subject is sharply focused; background falls off soft. Cool blue
shadows, warm gold highlights, no other colour cast. Shot on a medium-format camera,
85mm-equivalent, shallow depth of field, subtle specular glints on every polished facet.
Museum-quiet mood. No text, no watermark, no logo, no signature, no people, no hands,
no price tag, no plaque, no visible label. Photographic realism, not illustration,
not CGI-looking, not a render.
```

---

## 1 — `hero.png`

```
A carved white quartz cockatoo with both wings fully open, perched on top of a large raw
amethyst geode boulder, deep violet crystal points catching the light. Two smaller white
quartz cockatoos rest lower on the geode, one on each side, heads turned outward. The whole
group sits on a low black stone plinth with a polished top that throws a soft reflection.
A thin gold ring of light arcs behind the sculpture like a halo, not touching it. Centred,
full sculpture in frame, generous empty space above and to the sides.
```
*then the house style block*

**Note:** the hero sits on a starfield with a gold ring drawn in CSS behind it. Keep the
background flat and dark so the two layers blend — no horizon, no landscape, no mountains.

---

## 2 — `card-the-cluster.png`

```
Two carved white quartz cockatoos perched together on a large raw amethyst cluster, the
crystal points jagged and deep violet with lighter lavender tips. The birds are translucent
milky quartz with fine carved feather detail, small gold claws gripping the stone, tiny dark
polished eyes. The cluster sits on a black slate base. Three-quarter view, the sculpture
filling most of the frame.
```
*then the house style block*

---

## 3 — `card-the-dynasty.png`

```
Four carved sodalite macaws — deep denim-blue stone marbled with white veining — arranged at
four heights on a tall raw amethyst tower, the tower standing roughly two feet high with
violet crystal faces. Long tapered tail feathers hang down past the stone. Gold claws, gold
beak detailing. The tower is set on a dark polished stone base. Vertical sculpture, shot
slightly below eye level so it reads tall, centred in frame.
```
*then the house style block*

---

## 4 — `card-the-canopy.png`

```
A flock of six carved white quartz cockatoos arranged along the branches of a piece of
weathered grey driftwood mounted upright, the wood pale and wind-scoured with a twisting
grain. The birds are at different heights and angles, two with wings half-open, the others
settled. Milky translucent quartz, fine carved feathering, small gold feet. The driftwood is
socketed into a black stone base. Wide horizontal composition.
```
*then the house style block*

---

## 5 — `card-the-scarlets.png`

```
Three carved red jasper macaws, the stone a deep brick red with darker oxblood mottling,
perched on a cluster of clear quartz points that are bright and glassy with internal
rainbows. One bird has wings spread, two are settled beside it. Gold beak and claw detail
against the red stone. Warm red against cold clear crystal is the whole point of the shot.
Black stone base, three-quarter view.
```
*then the house style block*

---

## 6 — `card-the-portal.png`

```
Two carved sodalite macaws — deep blue stone with white marbling — perched on the outer rim
of a large ring-shaped geode, a sliced agate hoop with a hollow open centre and a band of
violet crystal lining the inner edge. The birds face each other across the opening. The empty
ring centre is the focal point and the light glows faintly through it. Gold claws. Mounted on
a black stone base, shot straight on so the ring reads as a perfect circle.
```
*then the house style block*

---

## 7 — `card-the-raptor.png`

```
A single carved labradorite eagle with wings mantled wide, the stone flashing iridescent
peacock blue and gold as the light crosses it, dark grey-green where it does not. The eagle
grips the summit of a raw amethyst formation, violet points below its talons. Hooked gold
beak, sharp carved primary feathers. Powerful and still. Black stone base, three-quarter
view from slightly below.
```
*then the house style block*

---

## 8 — `difference.png`

```
Extreme macro of a raw amethyst cluster filling the entire frame, violet crystal points at
many angles, some deep purple in shadow and some near-clear where the light enters them.
Fine gold dust settled in the crevices between points. No object, no bird, no base — only the
crystal, read as texture. Light rakes across from the upper left so the points throw long
shadows onto each other.
```
*then the house style block*

**Note:** the right third of this image is covered by a dark gradient in CSS, so keep the
interesting crystal on the left and centre.

---

## If a generation comes back wrong

| Problem | Add to the prompt |
|---|---|
| Background too light or grey | `The background must be nearly black, unlit, with no gradient and no visible backdrop seam.` |
| Bird looks like a real bird | `The bird is a solid carved stone object, not a live animal — visible tool facets, stone grain running through the body, no soft feathers.` |
| Looks like a 3D render | `Real studio photograph, faint sensor grain, imperfect dust on the base, slight lens vignette.` |
| Too much gold dust | `Only a dozen or so dust motes, very small, near the light source only.` |
| Text appearing | `Absolutely no text, letters, numerals or symbols anywhere in the image.` |

## Before you publish

Check each generated image against the real piece — the catalogue entry in `pieces-data.js`
gives the true material for every work. A generated image that shows the wrong stone is a
product photo that misrepresents what ships, so swap it for the real photograph rather than
letting it stand.
