/**
 * The anti-thin gate for town pages.
 *
 * Stage 7 of the growth-engine spec (canon:
 * docs/strategy/GROWTH_ENGINE_BUILD.md §12) states the rule and says where it
 * belongs: "a town page does not publish until it has at least one real
 * project and one town-specific fact — frost depth, the DPW apron standard,
 * the permit counter. Thin duplicated town pages are actively penalised; real
 * ones win the map-adjacent organic."
 *
 * That rule was written down in three places in this repo and enforced in
 * none. `towns.json` carried the honest version of it in a `_note` — that a
 * town's `local` line "stays EMPTY until David gives it" — while every one of
 * the thirteen `local` lines held a restatement of the county and the border
 * list, and the generator wrote every page regardless and reported them all
 * "complete". This module is the rule as code.
 *
 * WHAT COUNTS AS A TOWN-SPECIFIC FACT
 * ---------------------------------------------------------------------------
 * A `facts[]` entry with a `claim` and a `source`. Not the free-text `local`
 * line, for a reason worth stating: no program can look at a sentence and
 * decide whether it is knowledge or filler, and the sentences that were there
 * proved the point — "Weston sits in Middlesex County between Wayland and
 * Newton" is the `county` field and the `borders` array read back as prose. A
 * typed field with a source next to it can be checked by a person in seconds
 * and cannot be padded.
 *
 * Three things explicitly do NOT count, each because it once looked like it
 * might:
 *
 *  - **`frostNote`.** It is one string on the root of `towns.json`, rendered
 *    identically on all thirteen pages. A fact shared by every page is the
 *    opposite of the thing being measured, however true and however useful.
 *  - **The `local` line**, per above.
 *  - **Anything reconstructible from `town`, `county` and `borders`.** Those
 *    three fields are already on the page in their own right. Saying them
 *    again in a paragraph adds words, not information, and word count is not
 *    what the penalty measures.
 *
 * A fact with no source is refused too. `CLAUDE.md` rule 5: never invent a
 * town, date, price, square footage or credential on anything published —
 * leave the field blank and mark it. A sourceless claim on a public page is
 * that rule's failure mode, and the source is what makes the claim auditable
 * a year from now when nobody remembers where it came from.
 */
const { projectsIn } = require("./lib-projects");

/**
 * The share of a page's sentences that must appear on no other town page.
 *
 * 55%. It is a chosen number and here is the choosing: below about half, the
 * page is mostly the shared chrome — the service grid, the assurances, the
 * closing ask — and a crawler comparing thirteen of those is looking at one
 * page thirteen times, which is the state that produced this rule. Above about
 * two-thirds would refuse pages that are genuinely differentiated but share a
 * site's own furniture, which every site has and none is penalised for.
 *
 * It is deliberately measured on the *rendered* page with place names blanked,
 * so a page cannot pass by swapping a town name through shared paragraphs.
 */
const MIN_UNIQUE_SHARE = 55;

/** Words that carry no information about a town, for the overlap read. */
const STOP = new Set(
  ("a an and are as at be been but by for from had has have he her his in into is it its of on or " +
    "our she that the their them there they this to was we were what when where which who will with " +
    "you your us not no do does did can could would should may might must if then than so").split(" "),
);

/**
 * Is this `facts[]` entry usable?
 *
 * Returns null when it is, or the reason it is not.
 */
function factProblem(f) {
  if (!f || typeof f !== "object") return "not an object";
  const claim = typeof f.claim === "string" ? f.claim.trim() : "";
  const source = typeof f.source === "string" ? f.source.trim() : "";
  if (!claim) return "no claim";
  if (!source) return `no source for "${claim.slice(0, 40)}"`;
  return null;
}

/**
 * Of the sentences on this page, how many appear on no other town page.
 *
 * Measured over the **rendered** page, because that is what a crawler compares.
 * An earlier version of this measured the `local` line alone and reported
 * Lincoln at 100% — true of that one sentence, worthless as a description of a
 * 29KB page that is otherwise identical to twelve others.
 *
 * Sentences, not words: two pages made of the same paragraphs with the town
 * name swapped share every sentence, and a word-level read scores them apart
 * on the swapped nouns alone — which is exactly the illusion of distinctness
 * that produced thirteen of these.
 *
 * The town's own name, its county and its neighbours are blanked before
 * comparison. Otherwise every shared paragraph that mentions the town counts
 * as unique on all thirteen pages, and the number reports the opposite of what
 * it is for.
 *
 * **This is now the gate.** It used to be a read, on the reasoning that any
 * threshold would be a number nobody had justified. That was the wrong call and
 * David said so: the problem the penalty measures is duplication, so the thing
 * that decides whether a page publishes has to be whether the page is its own.
 * A page with a sourced town fact and no other original sentence is still
 * thirteen copies of one page; a page with three hundred words nobody else has
 * is not, fact or no fact.
 *
 * The threshold is stated below with its reasoning rather than being pretended
 * away. What did not change: nothing here permits an unsourced claim about a
 * town. Sourced facts are still required before a page says anything
 * town-specific — that requirement moved from "may this page exist" to "may
 * this page make this claim", which is where it always belonged.
 */
function uniqueShare(slug, rendered, towns) {
  // One blanking list, applied to every page. Symmetric on purpose: blanking
  // only the page under test would leave the town's name standing in the other
  // twelve, so the same shared paragraph would not match itself and every page
  // would score as unique.
  const names = placeNames(towns);

  const mine = sentencesOf(rendered.get(slug), names);
  if (!mine.size) return 0;

  const others = new Set();
  for (const [otherSlug, html] of rendered) {
    if (otherSlug === slug) continue;
    for (const s of sentencesOf(html, names)) others.add(s);
  }

  let own = 0;
  for (const s of mine) if (!others.has(s)) own++;
  return Math.round((own / mine.size) * 1000) / 10;
}

/** Every town, county and neighbour named anywhere in the set, longest first. */
function placeNames(towns) {
  const set = new Set();
  for (const t of towns || []) {
    for (const n of [t.town, t.county, ...(t.borders || [])]) {
      if (n) set.add(String(n).toLowerCase());
    }
  }
  // Longest first so "Southborough" is blanked before a shorter substring of it
  // can be.
  return [...set].sort((a, b) => b.length - a.length);
}

/** Visible sentences of a rendered page, normalised for comparison. */
function sentencesOf(html, names) {
  if (!html) return new Set();

  let text = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .toLowerCase();

  for (const name of names || []) text = text.split(name).join(" ");

  const out = new Set();
  for (const raw of text.split(/(?<=[.!?])\s+|\n+/)) {
    const words = raw
      .split(/[^a-z0-9'-]+/)
      .map((w) => w.replace(/^['-]+|['-]+$/g, ""))
      .filter((w) => w.length > 2 && !STOP.has(w));
    // Fragments shorter than this are nav labels and button text, shared by
    // every page on the site and not what the measure is about.
    if (words.length < 5) continue;
    out.add(words.join(" "));
  }
  return out;
}

/**
 * Assess one town against §12.
 *
 * `{ ok, projects, facts, missing }`. `missing` names what would have to arrive
 * for the page to publish, in the words of the thing needed, so the report is a
 * to-do list rather than a verdict.
 *
 * Uniqueness is deliberately not here: it is measured over the rendered page,
 * and the page cannot be rendered until this has run. `uniqueShare()` is a
 * second pass over the output.
 */
function assess(town, projects) {
  const mine = projectsIn(town.town, projects);

  const facts = [];
  const factIssues = [];
  for (const f of Array.isArray(town.facts) ? town.facts : []) {
    const problem = factProblem(f);
    if (problem) factIssues.push(problem);
    else facts.push(f);
  }

  // Reported every run, and no longer a publish condition. A page without
  // either of these is a page with less to say, not a duplicate — and the
  // penalty this whole module exists to avoid is for duplication.
  const debt = [];
  if (!mine.length) debt.push(`no project in ${town.town}`);
  if (!facts.length) {
    debt.push(
      factIssues.length
        ? `no usable town-specific fact (${factIssues.join("; ")})`
        : "no town-specific fact",
    );
  }

  return { projects: mine, facts, debt, missing: debt };
}

/**
 * The publish decision, made after render because it needs the rendered set.
 *
 * `{ ok, unique, reason }`. One condition, and it is the one the penalty is
 * about: is this page substantially its own words.
 */
function publishable(slug, rendered, towns) {
  const unique = uniqueShare(slug, rendered, towns);
  if (unique >= MIN_UNIQUE_SHARE) return { ok: true, unique, reason: null };
  return {
    ok: false,
    unique,
    reason: `${unique}% of its sentences are its own, against a floor of ${MIN_UNIQUE_SHARE}% — it is substantially the same page as the others`,
  };
}

module.exports = { assess, factProblem, uniqueShare, publishable, MIN_UNIQUE_SHARE };
