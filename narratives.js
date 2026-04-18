/*
 * PHAÖRA — per-piece narratives.
 * One short passage per sculpture. Tied to the specific material,
 * not generic brand copy. Quiet register. 2–3 sentences maximum.
 * Displayed on piece.html between the image and the details table.
 */

const NARRATIVES = {
  // I — Blue Macaws
  'the-dynasty':
    'Four sodalite macaws rise in tiered arrangement on a single amethyst tower — the deepest violet Fabiano has extracted in two decades. The quartet reads like a lineage: elders below, descendants above, each carved from a matched vein so the blue carries through. Among the most ambitious compositions in the collection.',
  'the-portal':
    'Two sodalite macaws perch on opposite edges of a ring geode — the stone hollowed by nature, not by hand. Fabiano chose the geode for its aperture, then carved the birds to face inward through it. The composition reads as a frame; the light passing through the hollow is the subject.',
  'the-sliced':
    'A pair of sodalite macaws set against a geode cut cleanly in two, polished on the face, raw at the break. The birds lean toward the section as though reading it. The cut is the storyteller — Fabiano left it unadorned on purpose.',
  'the-indigos':
    'Two sodalite macaws on a raw stone base Fabiano refused to polish. The contrast is the point: the birds are smooth, the mountain beneath them is not. What separates a living thing from the rock it landed on.',
  'the-grotto':
    'A duo of blue quartz macaws set inside the mouth of an amethyst cave — the cave itself a single formation, unbroken. The amethyst deepens from pale violet at the edges to near-black at the interior. The birds look out, not in.',
  'the-eclipse':
    'Two sodalite macaws face each other across a thin geode slice, the crystalline interior exposed in both directions. Seen from the front, the birds frame the light. Seen from behind, they frame the shadow.',
  'the-hyacinths':
    'A paired sodalite macaw duo, no base, no theater — the birds alone. The most distilled work in Collection I. Named for the hyacinth macaws of the Pantanal, the largest flying parrots on earth, all of which are cobalt blue.',
  'the-sentinels':
    'Two blue quartz macaws on a serpentine plinth. The serpentine reads almost black beside the quartz, and the contrast gives the birds their weight. Fabiano carved them in opposing postures — one attentive, one at rest.',
  'the-soloist':
    'A single sodalite macaw. No companion, no flock. The stone was taken from a vein that produced only enough material for one bird; Fabiano chose not to divide it. The result is the smallest piece in the collection that commands a room.',

  // II — Crimson Duo
  'the-scarlets':
    'A trio of red jasper macaws on a clear quartz cathedral — the cathedral itself a formation Fabiano removed intact from a cavity fifteen meters deep. Jasper of this saturation is encountered perhaps once a decade. The birds were carved in sequence, from the same block, to preserve the color match.',
  'the-parliament':
    'Three red jasper macaws on a serpentine base, arranged in conversation. Fabiano named the work after the collective noun for owls, not parrots — an intentional slip. The birds are in counsel. What they are deciding, only the room will know.',
  'the-crimson-duo':
    'A pair of red jasper macaws on clear quartz, the most concentrated color-contrast in the collection. The stone for both birds came from a single nodule no larger than a fist. What the nodule yielded, the pair fully uses.',
  'the-smoke':
    'Smoky jasper macaws — brown verging toward oxblood — on a base of white quartz. The palette is unusual for Phaöra; most of the collection trends bright. Fabiano kept this pair dark on purpose. Quieter than the scarlets, harder to photograph, better in person.',

  // III — White Cockatoos
  'the-cluster':
    'Four white quartz cockatoos arranged around a raw amethyst cluster, each bird cut from the same vein so the white reads uniform under any light. The cluster beneath them was left unpolished — the only flourish is in the birds themselves. Among the largest compositions in the collection.',
  'the-twins':
    'Two white quartz cockatoos, identical in posture, set on a matched amethyst base. Fabiano carved them from a single stone and split the resulting pair before polishing, so the crystalline structure is continuous between them. The only true twins in the collection.',
  'the-cathedral':
    'A duo of clear quartz cockatoos on an amethyst cathedral — the cathedral formation rising nearly to the birds\' own height. The composition emphasizes the architecture beneath; the birds are the inhabitants, not the subject.',
  'the-radiance':
    'A single clear quartz cockatoo with ruby eyes — the rubies set by hand into chambers carved for them. The body reads white at a distance and clear in the hand. Fabiano rarely sets stones into his work. This is one of three pieces in the collection that carry a second material.',
  'the-ethereals':
    'Two clear quartz cockatoos on an amethyst tower, carved to read nearly transparent. At the edges the birds vanish into the light behind them. The illusion is the work.',
  'the-violet':
    'A solo parrot cut directly from amethyst — no pairing, no flock, no counterpoint. The violet carries through the entire body of the bird. The closest Phaöra comes to a self-portrait: one stone, one bird, no set piece.',
  'the-guardians':
    'A clear quartz duo on a geode base, the birds carved in watchful posture on either side of the opening. The geode itself was cut to present its interior forward. The pair guards what the stone is hiding.',
  'the-perch':
    'A white quartz cockatoo duo on a compact base — the smallest of the larger cockatoo works. Designed to sit at eye level on a shelf or mantle rather than a plinth. Intimate scale, full presence.',
  'the-devotion':
    'A clear quartz duo, no base. Two birds leaning toward each other, their wings almost touching. The piece is defined by the inch of air between them.',
  'the-grace':
    'Two clear quartz cockatoos in vertical arrangement — one perched, one descending. The composition traces a line the eye follows from top to bottom and back. A study in posture.',
  'the-orbit':
    'A compact clear quartz duo, the birds arranged in a tight circular composition as though captured mid-pivot. The smallest work in Collection III. The entry point for collectors new to Phaöra.',

  // IV — The Canopy
  'the-canopy':
    'A full flock of white quartz doves set on Brazilian driftwood — the driftwood itself a single root mass Fabiano sourced from the Rio São Francisco. The birds perch along its length at varying heights, suggesting the canopy of a tree caught in low light. The flagship of the collection.',
  'the-driftwood':
    'White quartz cockatoos on a vertical driftwood piece — the wood standing where the birds once would have. A companion work to The Canopy, but narrower in footprint and composition. Both works share their source tree.',
  'the-aerie':
    'Fabiano calls this piece "the family." A white quartz eagle with fully extended wings presides over three smaller birds that cling to the face of an amethyst cathedral. The eagle was carved from a single quartz formation extracted from thirty meters deep in Serra da Canastra — two weeks on the wings alone.',
  'the-monolith':
    'Green aventurine, carved as a single towering crystal formation. No birds, no flock — the stone itself is the subject. Among the largest pieces in the collection, and the only work in which the stone outranks the figure. One remains.',
  'the-raptor':
    'A labradorite eagle on an amethyst plinth, wings fully extended. The labradorite carries its characteristic flash — blue-green depending on the light angle — across the wingspan. The amethyst below is deliberately dark, so the bird reads against it.',
  'the-vessel':
    'An aquamarine basin — the only vessel in the collection. Fabiano carved it from a single aquamarine crystal that refused to yield a bird; he read the stone\'s shape and made the vessel instead. Intended as a piece for holding other small stones, or nothing at all. One remains.',
  'the-sovereign':
    'A rose quartz eagle on a compact base, wings folded. The posture is seated, regal, uninterested in flight. Among the most self-contained pieces in the collection.',
  'the-ascent':
    'A rose quartz eagle on a serpentine base, wings beginning their opening. The moment before lift. The serpentine beneath reads green-black, which frames the pink without interrupting it.',
  'the-eden':
    'A trio of rose quartz birds arranged around a carved fountain of the same stone, with a small flower detail at the base in stone inlay. The one piece in the collection that holds a color other than its primary palette. Fabiano added the flower without saying why.',
  'the-gathering':
    'A green aventurine trio, no amethyst, no quartz — aventurine throughout. The only single-stone composition in Collection IV. Quieter than the rose quartz works, harder to photograph, distinct in person.',
  'the-companions':
    'A rose quartz parrot duo. Two birds, no base, carved to stand on their own feet. The scale is intimate. The absence of a plinth is the choice.',
  'the-lovers':
    'A rose quartz duo carved as mirrors of each other, facing inward. Where The Companions share posture, The Lovers share orientation. The pair reads differently from every angle.',
  'the-duet':
    'A rose quartz pair on a serpentine base. The lower bird stands, the upper perches; the serpentine reads as the branch they found. The piece in the collection most suggestive of a single moment.',
  'the-courtship':
    'A rose quartz parrot duo in active posture — one leaning toward the other, the other beginning to turn away. The tension is the composition. The result of reading the same scene in two stones.',
  'the-pair':
    'A rose quartz duo on serpentine, quieter than The Duet and The Courtship both. Designed to be lived with, not performed for. The everyday work, if such a thing exists at this register.',
  'the-herald':
    'A single rose quartz eagle, wings partially spread, on a compact base. The solo entry in the eagle family of Collection IV. The announcement before the arrival.',
  'the-whisper':
    'A rose quartz piece with gold leaf detailing at the wing tips — the second piece in the collection to carry a second material. The gold is applied sparingly; what the wings catch, the room reflects.',
  'the-nest':
    'A green aventurine duo at nest-scale — small, low, horizontal. The piece reads across a surface rather than up from one. The counterpart to the vertical works in the collection.',
  'the-embrace':
    'A rose quartz chalice duo — the birds carved to lean into a shared carved chalice at the center of the composition. An architectural piece, read from above as often as from the side.',
  'the-tenderness':
    'The softest work in Collection IV — a rose quartz duo carved in muted posture, no flourish, no fanfare. The piece Fabiano finishes last when a batch is ready. The one that takes longest to let go of.',
};
