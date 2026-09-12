/**
 * What makes thirteen town pages thirteen pages instead of one page thirteen
 * times.
 *
 * THE PROBLEM THIS SOLVES, STATED PLAINLY
 * ---------------------------------------------------------------------------
 * The generator produced thirteen 29KB pages that were about 3% their own words
 * once the town, county and neighbour names were blanked. That is the duplicate
 * content Google penalises, and no amount of gating fixes it — a gate decides
 * whether a page publishes, it does not make the page different. The fix for
 * "these are identical" is to make them not identical.
 *
 * WHAT IS IN HERE, AND WHY IT IS SAFE TO PUBLISH
 * ---------------------------------------------------------------------------
 * One long technical section per town, on a different subject each. Every word
 * of it is about **the craft** — base depths, frost, drainage, jointing, stone
 * — and none of it is a claim about the town. That distinction is the whole
 * reason this file can exist under `CLAUDE.md` rule 5:
 *
 *   "Never invent a town, date, price, square footage or credential on anything
 *    that gets published."
 *
 * "Concord's frost depth is 48 inches" is a claim about Concord and needs a
 * source; it belongs in `towns.json` `facts[]` and nothing here writes one.
 * "A wall footing is poured below the frost line because saturated soil expands
 * about nine percent when it freezes" is a fact about masonry, true in every one
 * of these towns, and putting a different one of those on each page is honest
 * differentiation rather than padding.
 *
 * So this file changes what the pages *are*, and changes nothing about what
 * they *claim*. The town-specific fact requirement is untouched: a page with no
 * sourced fact still says nothing town-specific. It just no longer says the
 * same nothing as twelve others.
 *
 * WHY IT IS ASSIGNED BY SLUG AND NOT ROTATED
 * ---------------------------------------------------------------------------
 * A page's subject has to be stable. A build that reshuffled which town got
 * which section would rewrite thirteen live URLs every run, and a page whose
 * body changes every Tuesday is a page Google stops trusting. The mapping is
 * explicit, one line per town, and moving one is a deliberate edit.
 */

/**
 * The deep section for each town.
 *
 *   heading — the H2, different on every page
 *   lede    — replaces the shared hero line, so the top of the page differs too
 *   summary — the meta description, so the SERP snippet differs too
 *   body    — the section itself. Paragraphs, no shared sentences between towns.
 *
 * Length is deliberate: this is the largest text block on the page, so the
 * shared service grid stops being the bulk of it.
 */
const SECTIONS = {
  "masonry-weston-ma": {
    heading: "The base is the job",
    lede: "Patios, walkways, retaining walls and drainage — built from the base up, by our own crews.",
    summary:
      "Masonry and hardscape built on a compacted base rather than a levelled one. Patios, walkways, retaining walls, steps and drainage, by our own crews.",
    body: [
      "Almost every failed patio we have taken apart failed underneath. The stone was fine. The pattern was fine. What moved was the eight inches nobody sees, and once that moves there is no repair that holds — the surface gets reset onto the same problem and fails again on the same schedule.",
      "A base is built in lifts. Processed gravel goes down in layers of three to four inches and each layer is compacted before the next one arrives, because a plate compactor transmits its energy a few inches down and no further. Twelve inches placed at once and run over twice is twelve inches of loose stone with a hard crust on top. It will feel solid to stand on and it will settle for three years.",
      "Depth comes from what is underneath, not from a number in a catalogue. Sand and gravel subsoil takes less. Clay takes more, and takes a separation fabric under it so the gravel does not migrate down into it over a decade of freeze and thaw until the base is half its original thickness. Driveways take more than walkways because the load is a vehicle rather than a person.",
      "Compaction is checked by watching the machine, not by counting passes. A plate on a properly compacted lift stops sinking and starts bouncing, and the sound changes. That is the moment the next lift goes down. Anyone who tells you a base is done after a set number of passes is describing a schedule, not a condition.",
      "The reason we lead with this on a page about finished stone is that the stone is the part you choose and the base is the part that decides. Two identical bluestone terraces, same stone, same mason, one built on six inches placed in two lifts and one built on twelve placed in four — at twenty years they are not the same patio.",
    ],
  },

  "masonry-wellesley-ma": {
    heading: "Where the water goes",
    lede: "Patios, walls and walkways built with somewhere for the water to go — the part that decides the rest.",
    summary:
      "Hardscape drainage done properly: free-draining backfill, filter fabric, and a pipe run out to daylight. Patios, retaining walls, steps and walkways by our own crews.",
    body: [
      "Water is the whole argument. Saturated soil expands roughly nine percent when it freezes, and if it is trapped behind a wall or under a slab with nowhere to go, that expansion has to move something. It moves the thing you paid for.",
      "Behind a retaining wall the answer is a drainage zone rather than a pipe. Twelve inches of clean, angular three-quarter stone against the back of the wall, wrapped in a non-woven filter fabric so the surrounding soil cannot silt it up, with a perforated pipe at the bottom of it. The stone is what does the work; the pipe only carries away what the stone delivers.",
      "That pipe has to end somewhere lower than it starts, and it has to end in daylight or in something that actually accepts water. A pipe that runs twenty feet and stops in the same soil it started in is a decoration. We would rather run it thirty feet further to a spot where you can see it discharge, because a drain you can watch working is a drain you will know about when it stops.",
      "Under a patio the same principle applies with less ceremony. The base is free-draining by construction, the surface is pitched a minimum of about an eighth of an inch per foot away from the house, and the pitch is set before a single stone is laid rather than corrected at the end. A terrace pitched back toward a foundation will find its way into a basement, and it will do it in the first heavy autumn rain rather than politely waiting.",
      "The unglamorous consequence: on a lot of jobs the drainage costs more than the stone. It is also the line item that decides whether anyone is calling us back in five years, so it is not one we shorten.",
    ],
  },

  "masonry-sudbury-ma": {
    heading: "Retaining walls, and what actually holds them up",
    lede: "Retaining walls, block and natural stone — drained behind, footed below the frost line, built to the load.",
    summary:
      "Retaining walls built to the load they carry: gravity below about four feet, geogrid reinforcement above it. Drainage, footings and batter explained. Free on-site estimate.",
    body: [
      "A retaining wall is holding back a wedge of soil that wants to slide, and the force it is holding grows with the square of the height. That is why a three-foot wall and a six-foot wall are not the same wall built twice as tall. The six-foot wall carries roughly four times the load.",
      "Below about four feet, a properly built wall usually holds itself by mass and geometry. The block or stone is heavy, it sits on a compacted leveling pad below the frost line, and it leans back into the hill — the batter. An inch of setback per course is common; the wall is deliberately not plumb, and a wall that looks perfectly vertical from the side is often one that has already started to rotate forward.",
      "Above that height, mass alone stops being enough and the wall needs the soil behind it to be part of the structure. Geogrid does that: layers of engineered mesh laid back into the compacted fill at set intervals, so the wall and the block of earth behind it move as one thing instead of two. The grid lengths and spacings come from the engineering, not from habit, and a wall over four feet in Massachusetts generally wants a design stamped by somebody who carries the liability for it.",
      "Natural stone changes the method and not the physics. A dry-laid fieldstone wall gets its strength from the same three things a New England farmer used: every stone touching at least two below it, the long dimension running back into the wall rather than along its face, and through-stones tying front to back at intervals. A wall built of stones laid flat and pretty on the face with rubble behind them is a facade, and it comes down.",
      "What we will not do is build a tall wall without the drainage behind it. It is the cheapest thing to skip and the only failure that is unrecoverable — a hydrostatically loaded wall does not lean, it comes apart.",
    ],
  },

  "masonry-wayland-ma": {
    heading: "Dry-laid or mortar-set, and how to choose",
    lede: "Patios and walls in stone — dry-laid or mortared, chosen for the ground and how you want it to age.",
    summary:
      "Dry-laid versus mortar-set masonry: how each fails, what each costs to maintain, and which suits ground that freezes. Patios, walls, steps and walkways.",
    body: [
      "Two ways to build in stone, and the choice is usually made for the wrong reason. Mortar looks more finished, so it gets picked on appearance. What it actually does is change how the thing behaves when the ground moves, which in New England it will.",
      "A dry-laid patio or wall is flexible by design. Every joint is a hinge. When the ground heaves in February the whole assembly rises slightly and settles back, and the damage is distributed across a hundred joints instead of concentrated in one. When something does go wrong you lift the affected stones, correct the base underneath, and set them back. Nothing is destroyed to make the repair.",
      "A mortared assembly is rigid, and rigid means the movement has to break something. It breaks the weakest line, which is usually the mortar joint, and once a joint is cracked it takes on water, and water that gets into a rigid assembly and freezes opens it further every winter. Mortared work therefore lives or dies on two things: a footing genuinely below the frost line, and joints that are tooled rather than struck flush so they shed water off the face instead of holding it against the stone.",
      "Cost runs the other way from what people expect. Dry-laid is more labour on the base and less on the setting; mortared is less on the base and much more on the finish work, plus a real footing. Over twenty years dry-laid usually costs less in total because its maintenance is a morning with a pry bar rather than a repoint.",
      "Where mortar earns its place: steps and treads that have to stay exactly where they are, veneer on a structure, caps that people sit on, and anywhere the joint has to be watertight. Where dry-laid earns its place: almost every terrace, path and garden wall on ground that freezes.",
    ],
  },

  "masonry-concord-ma": {
    heading: "Steps: the geometry people feel before they see",
    lede: "Steps, treads and landings in granite and bluestone — set to a rhythm that your feet do not have to think about.",
    summary:
      "Steps built to consistent riser and tread geometry, set solid and pitched to shed. Granite, bluestone and built treads for entries, terraces and garden runs.",
    body: [
      "A flight of steps is the one piece of hardscape that people judge with their body rather than their eyes. If it is right, nobody notices it. If one riser is three-quarters of an inch off, everybody stumbles on that step, every time, for as long as the steps exist.",
      "The rule is consistency before dimension. Within a single flight, risers should not vary by more than about three-eighths of an inch between the tallest and the shortest — that is the Massachusetts building code limit for a reason, and the reason is that a person climbing a flight learns the rhythm on the first two steps and then stops looking. Exterior steps are typically laid out around a six to seven inch riser with a tread of thirteen to seventeen inches, deliberately shallower and deeper than an interior stair because the approach is slower and the surface may be wet.",
      "Getting that consistency means the layout happens before anything is dug. Total rise is measured from finished grade to finished grade, divided into equal risers, and the number of risers decides where the flight starts and ends — not the other way around. Steps laid out from the top down and made to work at the bottom are how you get one short riser at the base, which is exactly where somebody is stepping off at speed.",
      "Each tread pitches forward, very slightly — an eighth of an inch or so across its depth — so it sheds rather than ponds. A dead level tread holds a film of water, and in January that film is the reason somebody falls. Granite treads get set on a compacted base and bedded solid across their whole footprint rather than shimmed at the corners; a tread carried on four points rocks, and a rocking tread works itself loose.",
      "The last detail is the one that dates a job: the nosing. A tread that projects an inch or so past the riser below it throws a shadow line that reads as a step from across a garden, and it keeps runoff off the face of the riser. Flush treads look flat and stain in a band.",
    ],
  },

  "masonry-lincoln-ma": {
    heading: "Edges, and why patios creep",
    lede: "Paver and stone terraces built with a perimeter that holds — the detail that decides whether the field stays tight.",
    summary:
      "Why paver patios spread at the edges and how a proper restraint stops it. Terraces, walkways and driveways edged to hold their line.",
    body: [
      "A paver field is a set of loose pieces held in compression against each other. Every load that crosses it pushes outward, and the only thing resisting that push is whatever is at the perimeter. Take the perimeter away and the field creeps: joints open, sand escapes, individual pavers start to rock, and it works inward from the edge over about three to five years.",
      "This is why the edge is not trim. It is structure, and it is the single most common thing left out of a cheap installation because it is buried and nobody inspects it.",
      "Done properly, the compacted base extends past the finished paver line — six inches or so beyond it — so the restraint is spiked into compacted material rather than into the loose soil at the trench wall. A spike driven into the shoulder of the excavation has nothing to hold. Rigid plastic or aluminium restraint sits on that shelf, hard against the outside face of the last course, and is pinned with ten-inch spikes at close centres, tighter still on curves where the outward force concentrates.",
      "On natural stone terraces the same job is often done with a soldier course set in a concrete haunch, or with a granite curb — heavier, more expensive, and visible, which is a reason people choose it. What matters is that whatever it is, it is continuous. A restraint that stops at a step or a garden bed leaves a gap, and the field will find it.",
      "The tell for an edge that was skipped: run your eye along the outside line of a patio five years old. If it bows outward between fixed points, or if the outermost course sits a little lower than the one inside it, that is not settlement. That is the field spreading, and the repair is to take up the perimeter and build the shelf that should have been there.",
    ],
  },

  "masonry-lexington-ma": {
    heading: "Joints: the smallest detail that decides the most",
    lede: "Stone and paver work jointed to shed water rather than hold it — the difference between five years and twenty.",
    summary:
      "Polymeric sand, stone dust and mortar joints compared: how each behaves in a freeze-thaw climate, and how a tooled joint sheds water off the face.",
    body: [
      "The joint is perhaps two percent of the surface area and most of the failure mode. Water gets into an assembly at the joint, and everything that goes wrong in a freezing climate starts with water getting in and not getting out.",
      "On paver work the modern default is polymeric sand — graded sand with a binder that sets when wetted. Done right it locks the field, resists ants and washout, and stays put on a slope. Done wrong it is a persistent nuisance: it hazes the surface if the pavers are not swept genuinely clean before wetting, it fails to set if it is applied to damp joints or rained on within a few hours, and it cracks out in sheets if the joint is too narrow or too shallow to hold enough of it. It wants a joint filled to within about an eighth of an inch of the surface and a full, gentle soak rather than a blast.",
      "Stone dust and washed sand are the older answer and still the right one for a dry-laid terrace that is meant to move — a flexible joint on a flexible assembly. It washes out on a slope and it grows weeds, and both of those are maintenance rather than failure. Some people want the moss.",
      "On mortared work the shape of the joint matters more than the mix. A joint tooled to a concave profile is compressed at its surface by the tool, which closes the pores and pushes water off the face of the stone. A joint struck flush, or worse, one left proud and rough, holds a bead of water against the masonry. That water freezes, and it takes the face of the joint with it, a millimetre a winter, until the joint is open and the wall is drinking.",
      "None of this can be corrected later without taking the assembly apart, which is why a job that runs long gets its joints done properly and its schedule pushed rather than the other way around.",
    ],
  },

  "masonry-newton-ma": {
    heading: "Choosing the stone",
    lede: "Bluestone, granite, fieldstone and paver — chosen for how it wears here, not just how it looks in a yard.",
    summary:
      "How bluestone, granite, fieldstone and concrete paver differ in a freeze-thaw climate: absorption, traction, thermal behaviour and how each ages.",
    body: [
      "Stone selection usually happens in a supplier's yard on a dry afternoon, which is the least informative possible condition for judging how something will behave in February.",
      "Bluestone is the regional default for a reason: dense, hard-wearing, comfortable underfoot, and it takes a thermal finish that stays grippy when wet. Its weakness is that not all of it is equal — the lower-absorption select material handles freeze-thaw well, while softer, more porous lots will spall at the surface after a few winters of de-icing salt. It also gets genuinely hot in full sun, which matters around a pool.",
      "Granite is the most durable thing you can put outside and the least forgiving to work. It is the right answer for treads, curbs, caps and anything that takes a structural or repeated load. Thermal or flamed finishes give traction; a polished granite step outdoors in New England is a hazard and should not be specified.",
      "New England fieldstone is what the walls here were built from, and it is still the right material for a wall meant to look like it has always been there. It is slow to lay — every stone is a decision — and that labour is most of the cost. It is not a surface material; a fieldstone terrace is uncomfortable to walk on and impossible to furnish.",
      "Concrete pavers get dismissed and should not be. A quality paver is manufactured to a known compressive strength and a known absorption rate, it is dimensionally consistent so the joints stay tight, and the good ones now weather convincingly. On a driveway, where the load is a vehicle and the geometry has to be exact, a paver often outperforms natural stone.",
      "The one thing we will push back on: sealing. Most terraces do not need it, a sealed surface can trap moisture in the stone, and once a patio has been sealed it has to be resealed on a cycle forever. If you want the wet look, choose a stone that already has it.",
    ],
  },

  "masonry-dover-ma": {
    heading: "Reading a wall that is failing",
    lede: "Repairs and rebuilds — we start by working out what actually moved, because the crack is rarely the problem.",
    summary:
      "How to read a failing retaining wall or terrace: bulge, lean, stepped cracking and settlement, and what each one tells you about the cause underneath.",
    body: [
      "Most repair calls describe a symptom — a crack, a bulge, a step that has dropped. The symptom is almost never the thing that needs fixing, and a repair aimed at it buys a season.",
      "A wall that leans uniformly outward from the base has usually lost its footing: either it was never below the frost line, or the ground under it was not compacted and has consolidated under the load. The wall is intact and the thing under it moved. That is a rebuild from the bottom, and pointing the joints achieves nothing.",
      "A wall that bulges in the middle while the top and bottom stay put is a drainage failure. Water is loading the back of it hydrostatically, and the wall is deforming where it is least restrained. This one is urgent in a way the lean is not — a bulging wall is losing its internal geometry and can go from bulge to collapse in a single wet spring.",
      "Stepped cracking that runs diagonally through mortar joints, wider at one end than the other, is differential settlement: one part of the foundation is going down faster than the rest. Common causes are a section built over disturbed backfill from an old excavation, or a downspout discharging beside the footing for fifteen years. Fix the water first; the crack is the record, not the cause.",
      "Surface spalling — the face of stone or block flaking off — is freeze-thaw acting on saturated material, and it is often the first visible sign that something above is dumping water down the face. A cap that no longer sheds, a failed joint at the top course, a missing drip edge.",
      "What we do on a repair call is dig one hole. It is not a courtesy; you cannot diagnose a wall from its face, and quoting a rebuild without knowing whether there is a footing under it is a guess with a number attached.",
    ],
  },

  "masonry-sherborn-ma": {
    heading: "Permeable paving and where the rain ends up",
    lede: "Permeable terraces and drives that take the rain into the ground instead of sending it down the driveway.",
    summary:
      "How permeable paving works, what subgrade it needs, and where it makes sense: open-graded base, no fines, and a reservoir sized for the storm.",
    body: [
      "A conventional patio sheds. A permeable one absorbs, and the difference is not the surface — it is everything under it.",
      "Permeable construction replaces the graded base, which contains fines deliberately so it locks up when compacted, with an open-graded one that has the fines screened out. Typically a choker course of small clean stone directly under the pavers, over a thick reservoir of clean angular stone with something like forty percent void space, over an uncompacted or lightly compacted subgrade that can actually accept water. The joints between the pavers are filled with clean chip rather than sand, so they stay open.",
      "The result is a surface that takes rainfall straight down into a stone reservoir and lets it infiltrate into the soil over the following hours. Nothing runs off, so nothing carries silt and oil into a stream, and there is no downstream volume to manage.",
      "It only works if the ground underneath will take water. A percolation test decides that before anything is designed. On sandy or gravelly subsoil it works well. On heavy clay it does not infiltrate meaningfully and the reservoir just fills up, at which point the design needs an underdrain and becomes a detention system rather than an infiltration one — still useful, but a different thing, and it should be called by its right name in the quote.",
      "The maintenance is real and worth knowing before you choose it: the open joints silt up over years, particularly under trees, and the surface needs vacuuming periodically to restore infiltration. A permeable drive that has never been maintained behaves like an ordinary one after about a decade.",
      "Where it earns its keep is a lot with nowhere to send water, or a project where impervious area is the constraint. Both are common enough that it is worth putting on the table rather than defaulting past it.",
    ],
  },

  "masonry-carlisle-ma": {
    heading: "Frost, and the number everything else follows from",
    lede: "Built for ground that freezes — footings below the frost line, and backfill that cannot hold water against them.",
    summary:
      "Why frost depth governs every footing, what frost-susceptible soil actually does, and how backfill choice decides whether a structure moves in winter.",
    body: [
      "Frost is the governing condition for masonry in this climate, and almost every structural decision in a hardscape job traces back to it.",
      "What happens is not simply that water in the soil expands. The more damaging mechanism is ice lensing: in frost-susceptible soil — silts and clayey silts are the worst — water is drawn up toward the freezing front by capillary action and accumulates there as a growing lens of ice. That lens can lift far more than the nine percent expansion of the water already present, and it lifts unevenly, because soil moisture and shade are never uniform across a site.",
      "Which is why a footing goes below the frost line rather than merely deep. Below that depth the soil does not freeze, no lens forms, and the structure is not part of the seasonal cycle. The depth that satisfies this is set by the building code for the specific municipality — it is a published figure per town, it varies across Massachusetts, and it is one of the few numbers on a job that should never be estimated from experience.",
      "The second half of the answer is what goes back into the hole. Frost-susceptible soil next to a footing is a liability even when the footing itself is deep enough, because that soil will heave against the sides of whatever is buried in it and can lift a structure by friction on its faces. Replacing it with clean, free-draining granular backfill removes both the water and the capillary path, and it is the reason we haul material away from a job rather than putting the excavated clay back in.",
      "The failure signature is distinctive and it is why this matters: frost damage almost never shows in the first winter. The structure lifts and comes back down slightly out of position, and does it again the next year, and the year after. Somewhere around the third or fourth cycle the accumulated displacement becomes a crack. By then the person who built it has been gone for years.",
    ],
  },

  "masonry-southborough-ma": {
    heading: "The driveway apron and the transition nobody plans",
    lede: "Driveways, aprons and the join at the street — built for the loads that actually cross them.",
    summary:
      "Why driveway aprons fail first: turning loads, the transition to the public way, and the base depth a vehicle actually needs.",
    body: [
      "The apron — the first several feet of a driveway where it meets the public way — takes more punishment than the rest of the drive combined, and it is routinely built to the same specification as the part nobody drives on hard.",
      "Three things concentrate there. Every vehicle that enters or leaves crosses it, so the traffic count is the highest on the property. Vehicles turn on it rather than tracking straight, and a turning tyre applies a horizontal scuffing force that a rolling one does not — that force is what shifts pavers sideways and opens joints. And it is where the heaviest vehicles that ever visit, including municipal and delivery trucks, put their weight while manoeuvring.",
      "So the apron gets a deeper base than the driveway behind it, compacted in more lifts, and a heavier edge restraint or a concrete haunch on both sides. On paver work, herringbone at forty-five degrees is used here specifically because the interlock resists the turning force in a way a running bond or a stack pattern does not. Pattern is a structural choice at the apron and an aesthetic one further up.",
      "The transition itself is its own problem. The public way and your driveway are two separately built structures, moving independently, with a joint between them that gets ploughed in winter. It has to be flush enough that a plough blade does not catch it, pitched so runoff from the street does not turn down the drive, and detailed so the two surfaces can move without shearing. This is also generally where a permit and a municipal specification apply, because the apron sits partly in the public right of way — that specification is set per town and is read before the work is quoted, not after.",
      "The practical consequence: if a driveway is going to be rebuilt in sections over time, the apron is the section to do first and to do heaviest. It is the part that fails, and it is the part everybody sees from the road.",
    ],
  },

  "masonry-hopkinton-ma": {
    heading: "Terraces around water, and the details that change",
    lede: "Pool decks, coping and terraces near water — surfaces chosen for bare feet, and drainage that assumes it will get wet.",
    summary:
      "How a pool deck differs from a patio: coping, traction when wet, thermal behaviour underfoot, drainage away from the shell, and expansion joints.",
    body: [
      "A pool deck is not a patio that happens to be near water. Four things change, and each of them changes the specification.",
      "Traction changes first. The surface will be walked on wet, by bare feet, by people who are not being careful. That rules out anything polished and most things smooth, and it argues for thermal-finished bluestone, flamed granite or a textured paver. The relevant property is how it behaves wet, which is not how a sample behaves dry on a counter.",
      "Temperature changes second, and it is the complaint that arrives in July. Dark, dense stone in full sun becomes genuinely painful underfoot. Lighter tones and materials with some surface texture run cooler. It is worth deciding this with a sample left in the sun for an hour rather than from a photograph.",
      "Drainage reverses. An ordinary terrace sheds away from the house; a pool deck sheds away from the pool, on every side, and the water it is shedding is chlorinated and continuous rather than occasional. That runoff has to be collected and taken somewhere — commonly a strip drain at the outer edge — because a deck that drains back toward the shell puts water behind the pool structure, and water behind a shell is the most expensive problem on the property.",
      "And the coping is a structural element, not trim. It caps the edge of the shell, it takes the load of everyone who sits on it and pushes off it, and it is the joint between two structures that move differently. It gets bedded solid, set to a consistent overhang so the drip line clears the tile, and separated from the deck by an expansion joint that is maintained rather than mortared solid. A coping mortared rigidly to the deck transmits every bit of deck movement into the pool edge.",
      "None of this is exotic. It is a different checklist from a terrace, and the failures come from running the terrace checklist next to water.",
    ],
  },
};


/**
 * The service grid, in each town's own words.
 *
 * Seven services, described thirteen different ways. This is not padding: the
 * seven shared lines were the single largest block of duplicated text on the
 * set — seventeen of thirty-four sentences per page were shared, and seven of
 * those seventeen were these. Rewriting them through each page's own subject
 * removes the biggest duplicate block and puts distinct copy high on the page,
 * where a crawler weights it.
 *
 * Same seven services on every page, because they are the same seven services.
 * Only the description changes, and none of it claims anything about the town.
 */
const TRADES_BY_TOWN = {
  "masonry-weston-ma": [
    [
      "Patios",
      "Bluestone, paver or flagstone, set on a base built in compacted lifts rather than one dumped and levelled."
    ],
    [
      "Walkways",
      "Front walks and garden paths, excavated to the depth the soil under them actually calls for."
    ],
    [
      "Retaining walls",
      "Block or natural stone on a leveling pad that was compacted before a course went on it."
    ],
    [
      "Driveways",
      "Paver and cobblestone over a base proportioned to a vehicle load, not a footpath one."
    ],
    [
      "Steps and landings",
      "Granite and bluestone treads bedded solid across their whole footprint, never shimmed at the corners."
    ],
    [
      "Stone veneer",
      "Columns, chimneys and facades, over a substrate prepared before the first stone is buttered."
    ],
    [
      "Drainage",
      "Built into the base rather than added to it, because you cannot retrofit what is underneath."
    ]
  ],
  "masonry-wellesley-ma": [
    [
      "Patios",
      "Terraces pitched to shed before a stone is laid, at an eighth of an inch per foot away from the house."
    ],
    [
      "Walkways",
      "Paths that carry water off them instead of holding it in the joints through February."
    ],
    [
      "Retaining walls",
      "Twelve inches of clean stone behind the wall, wrapped in fabric, with a pipe that ends where you can see it."
    ],
    [
      "Driveways",
      "Graded so runoff leaves at the sides rather than collecting at the garage door."
    ],
    [
      "Steps and landings",
      "Treads pitched forward an eighth of an inch so nothing ponds and freezes on the walking surface."
    ],
    [
      "Stone veneer",
      "Flashed and drained behind, because veneer that traps water against a structure is worse than no veneer."
    ],
    [
      "Drainage",
      "Trenches, dry wells and daylight outlets — usually the biggest line on the quote and the reason for the rest."
    ]
  ],
  "masonry-sudbury-ma": [
    [
      "Patios",
      "Terraces on ground that had to be cut and held, built with the wall and the surface designed together."
    ],
    [
      "Walkways",
      "Runs across a grade, stepped or ramped, held by whatever the slope needs rather than what is quickest."
    ],
    [
      "Retaining walls",
      "Gravity built below about four feet, geogrid-reinforced above it, and an engineer's stamp where the height calls for one."
    ],
    [
      "Driveways",
      "Edged with a restraint or a curb that can take the sideways load a turning vehicle puts on it."
    ],
    [
      "Steps and landings",
      "Runs built into a wall face, tied back into the same reinforced mass rather than sitting in front of it."
    ],
    [
      "Stone veneer",
      "Facing over structure, where the structure is doing the work and the stone is doing the looking."
    ],
    [
      "Drainage",
      "The drainage zone behind a wall is the wall. Skipped, the wall does not lean — it comes apart."
    ]
  ],
  "masonry-wayland-ma": [
    [
      "Patios",
      "Dry-laid where the ground moves and you want it repairable, mortared where the joint has to stay shut."
    ],
    [
      "Walkways",
      "Flexible construction on paths, so a February heave distributes across a hundred joints instead of cracking one."
    ],
    [
      "Retaining walls",
      "Dry-stacked fieldstone or mortared block, chosen for how you want it to age rather than how it looks new."
    ],
    [
      "Driveways",
      "Set dry and restrained, because a mortared drive has nowhere to put the movement a vehicle puts into it."
    ],
    [
      "Steps and landings",
      "Mortared, generally — a tread has to stay exactly where it is, which is what rigidity is good at."
    ],
    [
      "Stone veneer",
      "Mortared by nature, and standing or failing on a footing that genuinely reaches below the frost line."
    ],
    [
      "Drainage",
      "Under both methods, and more important under the rigid one, which has no way to absorb what water does."
    ]
  ],
  "masonry-concord-ma": [
    [
      "Patios",
      "Terraces set at a height that meets the door and the garden without an awkward step at either end."
    ],
    [
      "Walkways",
      "Front runs laid out from total rise first, so no flight ends on a short riser at the bottom."
    ],
    [
      "Retaining walls",
      "Walls with steps built through them, where the flight and the wall are one layout and not two."
    ],
    [
      "Driveways",
      "Aprons and thresholds detailed so the change in level is deliberate rather than whatever the grade left."
    ],
    [
      "Steps and landings",
      "Risers within three-eighths of an inch of each other across a flight, which is the code limit and the reason it exists."
    ],
    [
      "Stone veneer",
      "Riser faces and cheek walls, scribed to the treads rather than the treads cut to fit the stone."
    ],
    [
      "Drainage",
      "Every tread pitched forward slightly, because a level tread holds the film of water somebody slips on."
    ]
  ],
  "masonry-lincoln-ma": [
    [
      "Patios",
      "Paver fields with the base carried six inches past the last course, so the restraint has something to hold."
    ],
    [
      "Walkways",
      "Narrow runs, where the perimeter is most of the structure and a missing edge shows within three years."
    ],
    [
      "Retaining walls",
      "Walls that double as the edge of a terrace, taking the outward load the field puts into them."
    ],
    [
      "Driveways",
      "Restraint spiked at close centres and tighter on curves, where the spreading force concentrates."
    ],
    [
      "Steps and landings",
      "Landings edged as carefully as the field, because a loose perimeter course under a step is a trip hazard."
    ],
    [
      "Stone veneer",
      "Soldier courses and curbs set in a haunch, where you want the edge to be visible and heavy."
    ],
    [
      "Drainage",
      "Free-draining base out to the shelf, so the perimeter is not sitting in the water the field sheds."
    ]
  ],
  "masonry-lexington-ma": [
    [
      "Patios",
      "Joints filled to within an eighth of an inch of the surface, swept genuinely clean, and soaked rather than blasted."
    ],
    [
      "Walkways",
      "Polymeric on a slope where washout matters, stone dust where you would rather have the moss."
    ],
    [
      "Retaining walls",
      "Caps jointed tight and tooled, because the top course is where water gets into everything below it."
    ],
    [
      "Driveways",
      "Wide joints properly charged, since a driveway joint that empties lets the paver beside it start rocking."
    ],
    [
      "Steps and landings",
      "Tooled concave joints on risers, which push water off the face instead of holding a bead against the stone."
    ],
    [
      "Stone veneer",
      "Joint profile chosen before the mix is, because the shape of it decides where the water goes."
    ],
    [
      "Drainage",
      "A joint is a drain or it is a reservoir, and which one is decided by how it was struck."
    ]
  ],
  "masonry-newton-ma": [
    [
      "Patios",
      "Thermal bluestone, granite or a quality paver, chosen for how it behaves wet and in full sun."
    ],
    [
      "Walkways",
      "Surfaces with traction that survives a wet January, which rules out anything with a polish on it."
    ],
    [
      "Retaining walls",
      "New England fieldstone where it should look like it has always been there; block where it should not be noticed."
    ],
    [
      "Driveways",
      "Manufactured pavers, usually — dimensionally consistent, known compressive strength, tight joints under a car."
    ],
    [
      "Steps and landings",
      "Granite for anything structural or repeatedly loaded, flamed or thermal so it grips."
    ],
    [
      "Stone veneer",
      "Natural and manufactured both, weighed on absorption and on how the lot will weather rather than the sample."
    ],
    [
      "Drainage",
      "Selected with the stone: absorption rate is a drainage decision as much as an appearance one."
    ]
  ],
  "masonry-dover-ma": [
    [
      "Patios",
      "Resets and rebuilds, starting with why the surface moved rather than with putting it back."
    ],
    [
      "Walkways",
      "Lifted, the base corrected, and relaid — which is the repair a dry-laid path was built to allow."
    ],
    [
      "Retaining walls",
      "A bulge, a lean and a stepped crack are three different failures, and we dig before quoting any of them."
    ],
    [
      "Driveways",
      "Sections rebuilt from the apron back, because the apron is where the load and the damage concentrate."
    ],
    [
      "Steps and landings",
      "Treads reset on a corrected bed, or rebuilt where the footing under them was never deep enough."
    ],
    [
      "Stone veneer",
      "Spalling faces traced back to whatever above them stopped shedding, then repaired at the cause."
    ],
    [
      "Drainage",
      "On a repair call this is usually the finding. The crack is the record; the water is the reason."
    ]
  ],
  "masonry-sherborn-ma": [
    [
      "Patios",
      "Permeable construction where the ground will take water, on an open-graded reservoir with the fines screened out."
    ],
    [
      "Walkways",
      "Paths that infiltrate rather than shed, so nothing is routed toward a neighbour or a stream."
    ],
    [
      "Retaining walls",
      "Walls detailed to work with an infiltration system rather than to dam it."
    ],
    [
      "Driveways",
      "Permeable drives where impervious area is the constraint, sized off a percolation test and not a rule of thumb."
    ],
    [
      "Steps and landings",
      "Set on the same open-graded structure, which needs its own bearing detail to stay put."
    ],
    [
      "Stone veneer",
      "Conventional here — veneer is vertical and the infiltration argument is about horizontal surfaces."
    ],
    [
      "Drainage",
      "An underdrain where the clay will not accept water, and we call that detention rather than infiltration on the quote."
    ]
  ],
  "masonry-carlisle-ma": [
    [
      "Patios",
      "Built on granular fill rather than the excavated silt, because the silt is what forms the ice lens."
    ],
    [
      "Walkways",
      "Shallow structures, so the material under them matters more than the depth does."
    ],
    [
      "Retaining walls",
      "Footings to the published frost depth for the municipality, which is looked up and never estimated."
    ],
    [
      "Driveways",
      "Deep bases in free-draining material, since a heaved drive telegraphs every inch of movement."
    ],
    [
      "Steps and landings",
      "Set below the frost line or set on the structure that is, never on grade and hoped for."
    ],
    [
      "Stone veneer",
      "On a foundation that goes deep enough, because veneer cracks where the thing behind it lifted."
    ],
    [
      "Drainage",
      "Removing the water removes the capillary path, and the capillary path is what actually grows the ice."
    ]
  ],
  "masonry-southborough-ma": [
    [
      "Patios",
      "Terraces set back from vehicle areas, with the transition between the two detailed rather than left to meet."
    ],
    [
      "Walkways",
      "Runs crossing a drive, built to the drive's specification where they do, not the path's."
    ],
    [
      "Retaining walls",
      "Walls flanking an apron, haunched to take the scuff of a turning wheel against them."
    ],
    [
      "Driveways",
      "Herringbone at forty-five degrees at the apron, where interlock is structural and not decorative."
    ],
    [
      "Steps and landings",
      "Entry runs off a drive, set clear of the plough line and the wheel path."
    ],
    [
      "Stone veneer",
      "Pillars and returns at the street, built to survive being clipped rather than to look delicate."
    ],
    [
      "Drainage",
      "Pitched so the public way does not send its runoff down your drive, which is a grading decision at the join."
    ]
  ],
  "masonry-hopkinton-ma": [
    [
      "Patios",
      "Pool surrounds finished for bare feet, judged wet and judged after an hour in the sun."
    ],
    [
      "Walkways",
      "Wet-traffic routes, textured, because this is the surface people cross without looking down."
    ],
    [
      "Retaining walls",
      "Walls around a shell, drained so nothing puts water behind the most expensive structure on the property."
    ],
    [
      "Driveways",
      "Conventional, and kept well clear of the deck drainage so the two systems do not meet."
    ],
    [
      "Steps and landings",
      "Entry steps and benches, set with the overhang consistent so the drip line clears the tile."
    ],
    [
      "Stone veneer",
      "Raised walls and water features, coped and capped to shed away from the shell."
    ],
    [
      "Drainage",
      "A deck sheds away from the pool on every side, into a strip drain that goes somewhere."
    ]
  ]
};

/** The seven service lines for a town, or null to use the shared set. */
function tradesFor(slug) {
  return TRADES_BY_TOWN[slug] || null;
}

/** The section for a town, or null. A town with no section renders without one. */
function sectionFor(slug) {
  return SECTIONS[slug] || null;
}

/** How many towns are covered. Used by the report so a gap is visible. */
function coverage(slugs) {
  const missing = slugs.filter((s) => !SECTIONS[s]);
  return { total: slugs.length, covered: slugs.length - missing.length, missing };
}

module.exports = { sectionFor, tradesFor, coverage, SECTIONS, TRADES_BY_TOWN };
