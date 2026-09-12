/* ============================================================================
 * PHAÖRA — sculpture journal copy
 *
 * Every word the journal publishes lives here, so a change to what the shop
 * says to a customer shows up as a diff and gets read before it ships.
 * build-shop.js renders these into /shop/journal/.
 *
 * Rules this file keeps:
 *   - No invented place, date, price or credential. The mineralogy below is
 *     general and checkable; nothing claims a mine, a supplier, a trip or a
 *     qualification that has not been stated elsewhere on the site.
 *   - `pictured` must be a slug that exists in assets/sculptures/, because the
 *     builder reads the photograph off disk.
 *   - `date` is the day the post is published. Change it when you publish.
 *
 * Fields: slug, title, standfirst, date, pictured, body[]
 *   body entries are either a string (a paragraph) or { h: 'Subhead' }.
 * ========================================================================== */

module.exports = [

  {
    slug: 'why-there-is-only-one',
    title: 'Why there is only one',
    standfirst: 'A mould makes the second one possible. There is no mould.',
    date: '2026-09-12',
    pictured: 'seraph',
    body: [
      'Most things that look like this are cast. A master is sculpted once, a mould is taken from it, and the mould yields as many copies as the market wants. It is a good process. It is how a foundry makes an edition of twelve bronzes, each one honest about being the eighth or the eleventh.',
      'Carving does not work that way. The block is the piece. What comes off cannot go back on, and the block is not a neutral material waiting to be told what to be — it has a direction, a set of inclusions, and a place where it will break if the cut goes there.',
      { h: 'The stone argues' },
      'Quartz has no cleavage. It does not split along flat internal planes the way calcite or fluorite do, which is the reason it can be carved into a wing three millimetres thick instead of shearing in half. Instead it fractures conchoidally — in smooth, shell-like curves — and it does that wherever it wants, along a healed fracture or a veil of fluid inclusions left over from the stone growing.',
      'So the carver reads the block before starting, and keeps reading it. A vein running the wrong way through what was going to be a tail means the tail changes. A cloud of inclusions surfacing where a face was planned means the head turns. The drawing is a proposal; the stone answers.',
      { h: 'What that means when you buy' },
      'The piece in the photograph is the piece that ships. Not one from the same run, not the next one off the same pattern — that one. If it sells, the answer to "can I have another" is no, and the honest version of that answer is that no one could make another, including the person who made this one.',
      'It also means the flaws are not defects. A veil, a colour zone that stops halfway, a patch where the purple runs out into grey — those are the parts of the object that could not have been designed. They are the evidence it came out of the ground rather than out of a tool.'
    ]
  },

  {
    slug: 'inside-a-geode',
    title: 'Inside a geode',
    standfirst: 'A bubble in cooling lava, filled slowly with purple, and then cut open.',
    date: '2026-09-12',
    pictured: 'sanctum',
    body: [
      'An amethyst geode starts as nothing — a gas bubble trapped in a basalt flow as it cools. The rock sets around the void and the void stays, a sealed cavity with a rough skin, buried under whatever lands on top of it over the next hundred million years.',
      'Then water gets in. Silica-bearing groundwater moves through the rock, seeps into the cavity, and leaves quartz behind on the walls, layer by layer, crystal by crystal, growing inward. If iron is present in the right trace amounts and the surrounding rock supplies enough natural radiation, colour centres form and the quartz comes up purple instead of clear. That is all amethyst is: quartz with an iron impurity that has been irradiated slowly enough, for long enough, to hold a colour.',
      { h: 'Why the inside is the point' },
      'The crystals grow from the wall toward the middle, so they point inward, and they stop when the cavity runs out of room or the water runs out of silica. Nothing about that process is tidy. A cavity can be half-filled with agate banding before the amethyst starts. It can have a floor of white quartz and a ceiling of deep purple. It can be hollow in the centre or solid through.',
      'None of which is visible until it is opened. The outside of a geode is a grey lump. Deciding where to cut is the decision that makes or wastes it, and it is made once.',
      { h: 'What a carver looks for' },
      'For a piece that sets carved figures on a geode, the cavity has to do two jobs: hold the colour, and hold the weight. A mouth that opens too wide gives a dramatic face of crystal and almost nowhere sound to seat a mount. A mouth that barely opens is stable and dull.',
      'The stones that work are the ones where the opening frames the interior and the shoulders are thick enough to carry what stands on them. That is a narrow window, and it is the reason a geode piece is not simply a bigger version of a small one.'
    ]
  },

  {
    slug: 'one-mineral-three-ways',
    title: 'One mineral, three ways',
    standfirst: 'Amethyst, rose quartz and clear quartz are the same compound. The difference is contamination.',
    date: '2026-09-12',
    pictured: 'beacon',
    body: [
      'Silicon dioxide. SiO₂. One silicon atom, two oxygen, repeated in a hexagonal lattice — that is quartz, and it is one of the most common minerals in the crust. Pure, it is colourless and transparent. Everything else in the case is the same compound with something small gone slightly wrong.',
      { h: 'Amethyst' },
      'Iron substitutes for silicon in a few sites in the lattice. Natural radiation from the surrounding rock knocks an electron loose and leaves a colour centre that absorbs in the yellow-green, which the eye reads as violet. The concentration of iron and the dose of radiation set the depth of colour, which is why a single crystal can run from near-white at the base to dark purple at the tip.',
      'Heat undoes it. Take amethyst past roughly 470°C and the colour centres break down; the stone turns yellow-orange. Most commercial citrine is amethyst that has been through an oven.',
      { h: 'Rose quartz' },
      'The usual pink is not an impurity dissolved in the lattice but billions of microscopic mineral fibres grown through it, scattering light. That is why ordinary rose quartz is cloudy rather than transparent, and why it comes in masses rather than well-formed crystals. Clear pink quartz in distinct crystals is a different and much rarer thing, coloured by aluminium and phosphorus.',
      { h: 'Smoky, milky, and the rest' },
      'Smoky quartz is aluminium plus irradiation, the same mechanism as amethyst with a different impurity. Milky quartz is clear quartz packed with fluid inclusions — water, trapped as the crystal grew, in bubbles too small to see individually.',
      { h: 'Why it matters to a carving' },
      'All of them are hardness 7 on the Mohs scale, which means all of them will scratch window glass and a steel blade, and all of them will be scratched by topaz, corundum and diamond. They cut the same way and they take the same polish.',
      'What differs is what the light does once it is inside. A clear quartz wing carries light through its whole length and glows at the edge. A rose quartz wing scatters it and goes soft and even. An amethyst body holds the light in a thin shell near the surface and stays dark in the middle. A carver choosing between them is choosing how the finished object will behave in a room, not just what colour it will be.'
    ]
  },

  {
    slug: 'keep-it-out-of-the-sun',
    title: 'Keep it out of the sun',
    standfirst: 'Everything a crystal sculpture needs, and the one thing that will ruin it.',
    date: '2026-09-12',
    pictured: 'amethyst-crown',
    body: [
      'Quartz is hard, chemically inert and older than anything else in the house. It does not tarnish, oxidise, dry out or need feeding. The care it wants is close to none. There is one exception, and it is permanent.',
      { h: 'Sunlight fades amethyst' },
      'The colour centres that make amethyst purple are broken by ultraviolet light. A window seat in direct sun will pull the colour out over months and years, and it does not come back. The same is true of rose quartz and of smoky quartz. Choose a wall away from the south-facing glass, or a spot the sun crosses but never sits on.',
      'Artificial light is not the problem. Ordinary interior lighting, including the spot most of these pieces are lit with, carries nowhere near the ultraviolet to matter.',
      { h: 'Heat and shock' },
      'Keep it off a mantel that runs hot and away from a radiator. Quartz handles heat poorly when it arrives suddenly: a crystal with fluid inclusions in it can fracture when the trapped water expands faster than the stone around it. Room temperature, changing slowly, is all it asks.',
      { h: 'Cleaning' },
      'Dust with a soft dry brush — a clean make-up brush or a photographer\'s blower does the whole job. Between carved feathers a brush reaches what a cloth cannot, and a cloth will catch on a thin edge.',
      'If something needs more than dust, a barely damp cotton swab on the stone itself, then dry immediately. Keep water away from mounts and joins. Do not use an ultrasonic cleaner, household cleaning sprays, or solvents of any kind: the stone would survive all three, and the assembly might not.',
      { h: 'Moving it' },
      'Lift from the base, never by a wing, a tail or a neck. Those are the thinnest sections and they are carrying the least support. Two hands under the mass, and set it down before you adjust your grip.',
      'If it has to travel, it travels the way it arrived. Keep the crate.'
    ]
  },

  {
    slug: 'minas-gerais',
    title: 'Minas Gerais',
    standfirst: 'A Brazilian state named for its mines, and still the reason a piece like this can exist.',
    date: '2026-09-12',
    pictured: 'solara',
    body: [
      'Minas Gerais means general mines. The Portuguese named it in the seventeenth century for what came out of the ground there, and what came out first was gold, in quantities that moved the centre of colonial Brazil inland and built a run of baroque towns in the middle of nowhere to spend it in.',
      'The gold thinned. The geology did not.',
      { h: 'Why the stone is there' },
      'Much of the state sits on very old rock, intruded by pegmatites — the last, slowest part of a granite body to cool. Because they cool slowly and because the leftover fluid is loaded with water and rare elements, pegmatites grow crystals to sizes that do not happen elsewhere. Quartz, tourmaline, topaz, beryl and aquamarine all come out of them, and out of Minas Gerais in particular, in quality and quantity that made the state a name in mineralogy long before it was a name in decoration.',
      'The rose quartz is from the same source. So is the clear quartz clean enough to carve thin and still see through.',
      { h: 'The other half of the trade' },
      'Where there is stone there are cutters. Lapidary in Minas is not a heritage craft kept alive by grants; it is an ordinary local industry with its own supply chain, its own tooling and several generations of people who grew up around it. Carving is a specialism within it — a different set of hands from the ones who facet gems, working larger, slower and with more to lose per block.',
      'That combination is the actual scarcity. Fine rough turns up in a number of places. Fine rough within reach of people who have been carving it for a living long enough to be good at it is a much shorter list.',
      { h: 'What it does not mean' },
      'Provenance is not a grade. A stone from a famous region can be mediocre and a stone from nowhere in particular can be superb, and no origin story improves a badly chosen block or a clumsy cut. Where the material comes from explains why this work is possible. Whether a given piece is any good is decided afterwards, by the person holding the tool.'
    ]
  }

];
