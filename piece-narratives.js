/**
 * PHAÖRA — one written narrative per sculpture.
 *
 * WHY THIS FILE EXISTS
 * ---------------------------------------------------------------------------
 * All thirty-four piece pages carried the same sentence where the writing
 * should be: "Full piece narrative forthcoming." Measured over the rendered
 * set, they were 0-12% their own words. Thirty-four pages selling one-of-one
 * work at five figures each, and a crawler comparing them sees one page
 * thirty-four times.
 *
 * WHERE THE WORDS COME FROM, AND WHY THEY ARE NOT INVENTED
 * ---------------------------------------------------------------------------
 * `assets/sculptures/catalog.json` carries a species and a price and nothing
 * else: `base_material`, `wingspan_inches`, `carve_hours`, `specs.finish` and
 * `description` are empty on all thirty-four, and every page repeats the same
 * three facts — Brazilian crystal, Minas Gerais, one of one. There was no data
 * to write thirty-four different pages from.
 *
 * There were, however, the photographs. Each entry below was written from the
 * piece's own hero plate: how many birds, what stone they are cut from, what
 * they are standing on, how the wings are held, where the gold is. That is
 * **observation, not invention**, which is the distinction `CLAUDE.md` rule 5
 * turns on — never invent a town, date, price, square footage or credential.
 *
 * So nothing here states a dimension, a weight, a carving time, a mine, a
 * date or a claim about provenance. Where a stone is named it is named from
 * what the photograph plainly shows — amethyst druze is not mistakable for
 * rose quartz — and where the identification would be a guess, the sentence
 * describes the colour and the surface instead of asserting a mineral. Add
 * real specs to `catalog.json` and they should be rendered as specs; they do
 * not belong in prose written from a picture.
 *
 * The general remarks about how a stone behaves under a tool are true of the
 * material rather than of the individual piece, which is the same standard the
 * town pages hold: real knowledge, no local claim.
 */

const NARRATIVES = {
  "amethyst-crown": {
    heading: "Two macaws on an amethyst crown",
    body: [
      "Two birds share a single amethyst seat, and the composition puts them on different levels: the upper one stands clear with its tail thrown up behind it, the lower one settles across the front of the stone with a wing laid open. The pair reads as one animal seen twice rather than two objects placed side by side.",
      "The plumage is cut in graded blues over a soft gold breast, feather by feather, with the tail barring worked in as separate incisions rather than suggested by polish. The beaks are a dense black stone against pale cheeks, and a fine gold chain runs across the upper bird's shoulder.",
      "Under them the amethyst has been left as it came out of the ground on one face — a crust of small violet points — and cut back to white quartz on the other, so the seat is half raw and half sectioned. That contrast is a decision, not a saving: a fully polished base would have made the birds look placed rather than landed.",
    ],
  },

  "aurora": {
    heading: "One bird, one point of stone",
    body: [
      "A single parrot in the palest blue, wings half open and swept back, gripping the shoulder of a broken amethyst point with gilt claws. Everything in the piece runs diagonally — the stone rises left to right, the bird leans against it, the long tail carries the line off the bottom of the frame.",
      "The face is where the work is. A red eye, a gold cere, a black beak polished to a mirror while the head immediately behind it is left with tooling still visible in the feather barbs. Two finishes, a few millimetres apart, and the beak reads as horn because of it.",
      "Amethyst is quartz coloured by iron and irradiation, and its violet sits in bands that follow the crystal's growth. This base has been cut across those bands rather than along them, which is why the colour deepens toward the bottom instead of pooling in patches.",
    ],
  },

  "beacon": {
    heading: "Wings open, rose over green",
    body: [
      "An eagle with both wings thrown fully open, cut from rose quartz that runs near-white at the head and deepens to a dusty pink through the body. The wings are the widest gesture in the collection: each primary feather is separated to its own edge, so light passes through the thin trailing sections and stops in the thicker leading ones.",
      "The head is left almost colourless and the beak is a warm gold, which is the piece's only strong hue and sits exactly where the eye lands first. A single red eye holds the whole face together.",
      "It stands on a block of deep green stone, and the choice matters: rose quartz photographed against pink or white loses its edges, while a dark complementary base gives the bird a horizon to stand on. The talons are gold and grip over the front lip of the block rather than sitting on top of it.",
    ],
  },

  "consort": {
    heading: "A pair, and the space between them",
    body: [
      "Two rose quartz macaws face one another across the top of a black block, one calling upward with its tail hanging in a long arc, the other leaning in with a wing spread wide. The subject of the piece is the gap between their heads.",
      "Both birds are cut from the same warm pink stone but read differently under the light — the left one is lit from behind and glows through the tail, the right one takes the light on its back and stays denser. That is the same material doing two things because of how each was oriented in the block.",
      "The base is a stack of dark rectangular slabs with a gilded seam, deliberately architectural against the softness above it. The long tails cross down the front of it on both sides, which is what keeps the composition from splitting into two separate birds on one plinth.",
    ],
  },

  "covenant": {
    heading: "Three over white quartz",
    body: [
      "Three deep red macaws arranged around a raw white quartz cluster: one high with wings fully open, one on the left with its tail dropping the full height of the piece, one settled low across the front. The white is the loudest thing in the composition and the birds are placed to frame it rather than cover it.",
      "The red is worked with blue and yellow wing panels laid in as separate inserts, so the tri-colour of a scarlet macaw is carried in stone rather than paint. Each feather shaft is incised individually along the long tail feathers.",
      "The quartz cluster underneath has been left entirely uncut — every terminated point is as it grew — and the whole thing sits on a flat oval of deep blue stone with white veining. Three levels: rough crystal, carved bird, polished plinth, each finished a different way on purpose.",
    ],
  },

  "diviner": {
    heading: "Cut from one graded amethyst",
    body: [
      "A single parrot cut from amethyst that runs almost white at the crown and deepens to full violet through the wing. The colour was not applied; it is the natural zoning of the crystal, and the carver has oriented the bird so the palest part of the stone lands on the head where a real parrot's face would be lightest.",
      "The head is turned down and to the side, the classic parrot attitude, with a black beak and a gold cere against the pale face. Tail feathers in red and green are set in separately beneath the amethyst body.",
      "The perch is a rough smoky quartz mass with a white crust along one edge, left unpolished so the bird is the only smooth thing in the piece. Gilt feet close over the top of it. Amethyst is hard enough to hold a crisp feather edge and brittle enough to lose one in a moment, which is why so few carvers attempt a whole bird in it.",
    ],
  },

  "ember": {
    heading: "Three copper birds on a green block",
    body: [
      "Three macaws in a warm copper-brown, worked in a heavy scaled feather pattern that reads more like chainmail than down. They are arranged around a squared green block — two on the crown, one dropping off the right-hand side with its wings out to balance.",
      "The scaling is the distinguishing work here. Each body feather is a separate raised lozenge with a dark line cut around it, which catches light in a completely different way from the smooth flight feathers on the same bird.",
      "Green tail panels are inlaid into the lower birds, and gold flecks are scattered across the face of the block. The base is stepped and blocky, closer to masonry than to a naturalistic perch, and the group is composed as a descending diagonal from the top-left bird to the one hanging off the right.",
    ],
  },

  "emissary": {
    heading: "Pale green over an amethyst heart",
    body: [
      "Two birds in a soft grey-green stone, one large with a wing raised high and a tail falling the whole height of the piece, one small and upright on the right. Between them an amethyst cluster opens like a split heart, pale grey at the outside and vivid violet at the centre.",
      "The green carving is unusually flat in finish — matte, almost soapy, with the feather work cut shallow. Set against faceted crystal it looks like cloth beside glass, and that contrast is the point of the pairing.",
      "Warm brown veining runs through the green stone and has been allowed to fall where it falls, crossing a wing and a tail without being carved around. Working with the flaw rather than hiding it is the older tradition in stone carving, and it is visible here in the base as well, a pale layered slab left with its own banding showing.",
    ],
  },

  "ezio-e-presa": {
    heading: "Two dark birds and a hollow stone",
    body: [
      "The base is the subject: an amethyst geode cut clean through so the hollow shows, a thick violet crust surrounding an empty dark centre. Two birds in a deep blue-grey stone sit on its shoulders and lean inward over the opening.",
      "Both are carved with heavy shoulder feathering and long primaries that reach well past the stone on either side, giving the piece a span far wider than its base. The beaks are black and highly polished; the faces are pale and lined.",
      "A geode is a gas bubble in cooled lava that filled with silica over a very long time, and cutting one open is irreversible — the carver has one attempt to choose the plane. This one has been opened to show the fullest ring of crystal, and everything above it is arranged so nothing blocks the view into the cavity.",
    ],
  },

  "garnet": {
    heading: "Clear quartz, copper flights",
    body: [
      "Two birds cut from near-transparent quartz face each other across the top of an amethyst block. Because the bodies are clear, what you actually see is the feather carving itself — the incised lines catch light and the smooth areas disappear.",
      "Copper-toned flight and tail feathers are set into both birds, and they are the only solid colour in the upper half of the piece. Against clear stone they read as strongly as a brushstroke on white paper.",
      "The amethyst below is dense and evenly coloured, cut to a wedge with the crystal faces intact on the top surface. Gold claws close over the edge. Clear quartz is the hardest material here to carve convincingly: any internal fracture shows straight through the finished piece, so a flawless bird of this size starts from an exceptional block.",
    ],
  },

  "gilded-pair": {
    heading: "Seen from behind, wings up",
    body: [
      "The only piece in the collection composed from the back. A pale rose bird stands with both wings lifted in a shallow V, tail spread flat below, and the viewer is placed behind and slightly beneath it. There is no face in the photograph at all.",
      "That decision puts every bit of the work into the wing carving. Each feather is scalloped at the tip and the whole underside is finished as carefully as the top, because from this angle the underside is what shows.",
      "It stands on an egg-shaped stone split down its length: one half a dark shell with a fine tan web across it, the other half opened to a bank of amethyst points. Two very different surfaces held in one silhouette, and the bird bridges them.",
    ],
  },

  "harvest": {
    heading: "Three around a bowl of crystal",
    body: [
      "Three pale blue-grey birds gather around a white quartz bowl filled with amethyst chips. One leans in from the left, one reaches across the rim with a wing thrown right out of frame, one hangs below with its wings dropped. It is the most kinetic arrangement in the set.",
      "The stone is a soft chalky blue with white mottling, and the carving leans into that — the feather work is fine and close, so the surface reads as down rather than as plate. Small red marks are set at the wing shoulders.",
      "Gilt bands wrap the rim of the bowl and each bird's feet lock over them. The whole group is lit from within the bowl in this plate, which throws the birds' faces into shadow and their wing edges into light.",
    ],
  },

  "lapis": {
    heading: "Five birds, one cluster",
    body: [
      "Five macaws are arranged around a single large amethyst cluster — one above with wings fully open, two at the left, one at the right, one small bird tucked at the top edge. It is the largest population of any piece here and the composition is a rough spiral.",
      "The blues are not uniform. Some birds are a flat denim, others a lighter steel with white barring at the throat, and the tail feathers run through orange, green and deep red. Set against one continuous violet crystal, that variation is what stops five birds reading as five copies.",
      "The cluster itself is left rough across its whole face, a bank of terminated points with a pale agate rind at the base, and the mount below is plain black. Nothing competes with the crystal except the birds.",
    ],
  },

  "luminary": {
    heading: "Two cockatoos, crowned",
    body: [
      "Two cockatoos in translucent quartz, both looking upward and outward, each with a crest of small violet crystal set into the crown of the head. The amethyst crown against the clear body is the piece's whole idea.",
      "The bodies are carved with a rippled, almost frosted surface that scatters light, while the beaks are jet black and mirror-polished. Wings are held half open and the long tails run down either side of the base.",
      "Below them a deep amethyst geode wall rises with gold fittings at the perches. The stone here is at the dark end of the amethyst range — nearly black in the recesses, throwing violet only where the light catches a face — and the pale birds are placed against it for exactly that reason.",
    ],
  },

  "maresia": {
    heading: "No bird — the stone alone",
    body: [
      "This piece carries no carved figure. It is a cluster of faceted green points, each cut with flat planes and a terminated tip, built up into a single mass on a dark base. Loose smoky and clear crystals are scattered around its foot.",
      "The green runs from a deep bottle tone through to pale sea-glass, crossed by white and tan veining that continues from one facet to the next — evidence that the points were cut from a single body of stone rather than assembled from separates.",
      "Faceting a soft green stone at this scale is unforgiving work: every plane has to meet its neighbour cleanly, and a chipped edge cannot be polished out without re-cutting the whole face. The finish here is high enough that the flats behave like mirrors and the piece changes completely as you move around it.",
    ],
  },

  "mariner": {
    heading: "An eagle in labradorite",
    body: [
      "A bald eagle with both wings raised, head turned and beak open. The body and wings are cut from a dark iridescent stone shot through with blue, gold and brown flashes; the head and tail are white quartz, and the join between the two materials falls exactly where the plumage changes on the living bird.",
      "That is the piece's central move. Instead of carving one stone and colouring it, the carver has used two stones whose natural colours do the work, and the seam is a species marking rather than a repair.",
      "The talons are gold and grip a polished amethyst geode with a thick white rind. Labradorescence — the flash in the wing stone — comes from light interfering inside microscopic layers within the crystal, which means the wings only ignite from certain angles and go nearly black from others.",
    ],
  },

  "meridian": {
    heading: "Two on a dark pillar",
    body: [
      "Two macaws on a stepped black pillar: the left bird upright with a wing raised, the right bird hunched and turned inward. The pillar is roughly finished with visible fracture planes, and it does most of the compositional work by holding the two birds at different heights.",
      "The plumage runs blue through gold with fine dark barring across the wing coverts, and the tails are unusually long — both fall well past the base, and the piece is taller than it is wide because of them.",
      "It stands on a blue banded agate foot, polished flat and left broad, and one bird carries a pale inset panel at the flank. Gold appears only at the feet and in a thin line along one wing edge.",
    ],
  },

  "obsidian": {
    heading: "Rose against a deep geode",
    body: [
      "Two rose quartz birds, one above with wings spread and one below and to the right, on either side of a large amethyst geode. The stone is cut so the crystal-lined interior faces the viewer directly and reads almost black at the centre.",
      "The rose quartz is at the pale end — milky, close to white in the wings, warming through the breast — and it is carved thin enough at the wing tips to pass light. Against a near-black interior that translucency is the entire effect.",
      "Both birds have jet beaks and dark blue tail feathers set in below. The mount is a polished slab with blue and gold banding, and the whole arrangement is lit from above so the geode's mouth stays in shadow.",
    ],
  },

  "onyx-pair": {
    heading: "Two blues, unequal",
    body: [
      "The two birds here are deliberately not a matched pair. The upper one is a deep slate blue with a heavy wing thrown open; the lower one is a much paler sky blue with red and gold tail feathers and a longer, finer profile.",
      "They sit on an amethyst geode with a pale pink and white quartz core, and the colour runs violet at the rim into cream at the centre — an unusual section, and the birds are placed to leave it visible between them.",
      "Both beaks are black and polished. The gilt perches are worked as small claw settings rather than simple pins, so each foot closes on a fitting made for it. The whole is lit from the upper right, which puts the dark bird in relief and lets the pale one go nearly translucent.",
    ],
  },

  "opal": {
    heading: "Head to head in milk quartz",
    body: [
      "Two birds in a milky, semi-opaque quartz lean in until their heads almost touch. The composition is symmetrical and close: it reads as a single mass from a distance and separates into two animals as you approach.",
      "The stone is the interest here — a cloudy white with internal veils that shift as the light moves, so the bodies never look flat. Beaks are black and glossy, and green-blue flashes are set into the tails below.",
      "The base is an amethyst column, dense and evenly coloured, running to the bottom of the frame. It has been left fully crystalline on its faces so there is no polished surface anywhere below the birds, which keeps the smooth quartz above it reading as the finished thing.",
    ],
  },

  "oracle": {
    heading: "Two over a lit geode",
    body: [
      "Two frosted quartz birds face each other on the crown of an amethyst geode that is lit from inside. The light comes up through the crystal and through the thin parts of the carving, so the wing edges and the tails glow while the bodies stay solid.",
      "The wings are held wide and low and the feather work is cut deep enough to throw its own shadows. Black beaks and gold claws are the only hard, dark elements in an otherwise pale piece.",
      "The amethyst underneath is a rough druze face over a smooth cut back, and the illumination behind it is what turns the stone from purple to violet-white at the top. Frosted quartz is worked to that surface by abrasion rather than polish, and it is the finish that makes internal light behave this way.",
    ],
  },

  "orchid": {
    heading: "A family on an open cave",
    body: [
      "The most populated piece in the set: a large white quartz bird stands at the summit with both wings spread, and three smaller birds are placed down the sides and front of an opened amethyst cave beneath it. Two small quartz eggs sit in the floor of the cavity.",
      "All four birds are cut from the same white stone with gold beaks and gold talons, which unifies them, while the size difference does the narrative work — the arrangement is unmistakably one adult and three young without a word of explanation.",
      "The geode has been opened wide and shallow rather than deep, so the whole interior is visible at once, and it sits on a broad clear quartz slab cut in an irregular outline. The base is left with facet marks visible around the rim.",
    ],
  },

  "pilgrim": {
    heading: "Two travellers in clear stone",
    body: [
      "Two clear quartz birds on an amethyst crest, one perched low and looking back, one above with a wing swept out. Both have long tails that fall past the bottom of the stone, and the piece is composed on a strong diagonal from lower left to upper right.",
      "Deep blue feathers are set into both tails and one shoulder, and they are the only saturated colour in the piece. Gold leaf is scattered across the background and caught in the crystal, which reads as motion around otherwise still figures.",
      "The amethyst is a tall irregular mass with a well-formed druze face, and the birds are pinned at its two highest points. Because the quartz is genuinely transparent in places, the violet of the stone shows faintly through the nearer bird's body.",
    ],
  },

  "quartz-twin": {
    heading: "Three on a gilded ledge",
    body: [
      "Three rose quartz birds along a horizontal amethyst ledge, the outer two turned in toward a smaller central bird. It is the only composition in the set built on a straight line rather than a peak.",
      "The stone is a clean pale pink, and the carving keeps the bodies broad and simple so the material reads first. Blue and gold tail feathers hang below the ledge from all three, and the beaks are heavy, black and strongly hooked.",
      "Gold leaf is laid into the amethyst along the top of the ledge itself, filling the gaps between crystal points rather than covering them. Below the perch line the stone darkens quickly to near-black, so the three pale birds sit on what looks like the lit edge of something much deeper.",
    ],
  },

  "reverie": {
    heading: "Two cockatoos, wings low",
    body: [
      "Two rose quartz cockatoos on a large amethyst mass, the right bird higher with wings held in a shallow lift, the left lower and turned away. Both keep their wings close and low, which makes this the quietest arrangement in the collection.",
      "The quartz is warm and quite saturated for rose quartz, and it has been left with a soft matte surface across the bodies while the beaks are cut in a black stone and polished hard. The tails are long, straight and fall almost to the base.",
      "The amethyst is a single tall block, crystal-faced across its whole front, with the colour running deep violet through to grey at the edges. The foot is a banded blue and cream slab left broad enough to give the piece a visible ground.",
    ],
  },

  "rose-duet": {
    heading: "Facing, on violet",
    body: [
      "Two rose quartz birds turned to face each other across the top of an amethyst block, one with a wing lifted and open, the other settled with wings closed. The heads are level and close, and the beaks nearly meet.",
      "Both beaks are cut from a grey-blue stone rather than black, which softens the faces considerably — the usual jet beak in this collection reads as sharp, and this one does not. Brilliant blue and gold tail feathers hang below on both sides.",
      "The amethyst is coarse-crystalled, with individual points large enough to read as separate facets, and it runs to a paler lilac at the bottom. Gold fittings hold both birds at the crest.",
    ],
  },

  "rose-oracle": {
    heading: "Over an open bowl",
    body: [
      "Two rose quartz birds lean in over an amethyst bowl, heads almost touching above the opening. The bowl is the focal point and the birds arch around it rather than sitting on top of it.",
      "The plumage carving is loose and rounded here, closer to a bird fluffed against cold than to a bird in display, and the crests are worked as separate raised feathers on the crown. Olive-gold accents run along the upper beak.",
      "Teal, gold and dark green feathers are set into both tails, and the amethyst inside the bowl is cut into large triangular faces that catch light individually. The whole sits on a plain dark disc, and the background is scattered with warm gold flecks.",
    ],
  },

  "rose-solo": {
    heading: "One eagle, wings back",
    body: [
      "A single eagle with wings swept up and back rather than out to the sides, which gives the bird a forward-leaning line as though it has just landed. The head is white, the body warms to rose through the breast, and the wings run to near-transparent at the tips.",
      "The beak is a warm amber-gold with a dark eye set close behind it, and the head carving is finer than anywhere else on the piece — individual crown feathers, cut short and overlapping.",
      "It stands on a rough smoky quartz boulder with gold talons wrapped over the front edge. The boulder is left entirely uncut and its glassy irregular surface throws light back up into the underside of the bird.",
    ],
  },

  "sanctum": {
    heading: "Two crowned, on a split sphere",
    body: [
      "Two clear quartz cockatoos stand at either shoulder of a large rounded stone that has been opened across its face. Both have violet crystal crests set into the crown and both hold their wings out in a shallow, symmetrical lift.",
      "The near-perfect mirroring of the two birds is the composition — same posture, same wing angle, turned toward each other. Anything less exact would read as a mistake at this scale.",
      "The stone below is the most complex material in the collection: grey and white agate banding on the left, a broad field of amethyst druze through the centre, and dark matrix at the edges, all in one continuous body. It is held on a low black mount with gold claw fittings at both perches.",
    ],
  },

  "seraph": {
    heading: "Five, and a flower in the rock",
    body: [
      "Five rose quartz birds are arranged up and around a tall amethyst geode — two at the crown, one out to the left, one dropping down the front, one at the right with wings spread. The geode is lit from within and glows blue-violet through its centre.",
      "Every bird carries deep blue wing and tail feathers set into the pink, and the repetition of that one colour across five separate figures is what binds the group together.",
      "Set into the lower cavity of the stone is a small carved flower in yellow and green — the only botanical element in the collection, and easy to miss. It is placed where the light is strongest, at the base of the opening, so it reads last rather than first.",
    ],
  },

  "sky-pair": {
    heading: "Crested in violet, cut from clear",
    body: [
      "Two transparent quartz birds on an amethyst crest, both looking upward, each with a band of small violet crystals worked across the crown. The left bird holds one wing wide; the right sits closed and upright.",
      "Because the stone is genuinely clear rather than milky, the carving is visible from both sides at once — the far wing's feather cuts show through the near one. That is a quality of the material the carver has chosen to leave working rather than to mask with a frosted finish.",
      "The beaks are black and disproportionately large, which is true to a cockatoo and gives the pale bodies something to be measured against. Below, the amethyst runs dark and dense with heavy crystal faces, and the mount is left plain.",
    ],
  },

  "solara": {
    heading: "Blue birds on a rough grey rock",
    body: [
      "Two macaws in a strong royal blue with red foreheads, one above with wings fully extended and one below and behind. This is the only piece in the collection mounted on a plain grey stone rather than crystal or a polished plinth.",
      "The colour is much more saturated than anywhere else here, and the wing carving is broad and flat, with the primaries cut as long unbroken blades rather than separated feather by feather. The result is closer to a painting than to a study.",
      "The rock is a rough grey and buff mass with a heavily pitted surface, unpolished and uncut. Against it the birds look genuinely wild rather than displayed, which is the reason for choosing it.",
    ],
  },

  "vigil": {
    heading: "No bird — a carved basin",
    body: [
      "The second piece in the collection with no figure. A shallow basin has been hollowed from a single block of pale blue-green stone, with one side rising into a raised lip and the other cut away low, so the form is asymmetric from every angle.",
      "The stone is a soft aqua crossed by warm tan veining, and the veins have been allowed to run through both the inside and the outside of the bowl rather than being oriented to hide them. The interior is polished; the outer wall keeps a slightly softer finish.",
      "Hollowing a basin is subtractive work with no second chance — the wall has to stay even in thickness all the way round, and a thin spot will not survive the final polish. That the rim holds a consistent line through an irregular outline is the whole demonstration.",
    ],
  },

  "violet": {
    heading: "A pair on green steps",
    body: [
      "Two rose quartz birds on a stepped plinth of dark green stone, one upright and looking away, the other leaning down with a wing spread wide. The green base is cut into hard rectangular steps and is the most architectural mount in the set.",
      "The pink of the birds is very pale — near white through the wings, warming only slightly at the shoulders — and against dark green it reads much cleaner than rose quartz usually does. Blue tail feathers hang below both.",
      "The beaks are heavy, black and turned down sharply. Both birds are set on gilt claw fittings at the top of separate steps, so they occupy different heights on the same structure rather than sharing one perch.",
    ],
  },
};

/** The narrative for a piece slug, or null if none is written. */
function narrativeFor(slug) {
  return NARRATIVES[slug] || null;
}

function coverage(slugs) {
  const missing = slugs.filter((s) => !NARRATIVES[s]);
  return { total: slugs.length, covered: slugs.length - missing.length, missing };
}

module.exports = { narrativeFor, coverage, NARRATIVES };
