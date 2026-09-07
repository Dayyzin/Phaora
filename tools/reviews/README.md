# The review push

Reviews decide who sits in the map box above the search results. For a
masonry contractor that box is where the phone calls come from — more than
the website, more than the ads. Review count and recency are most of what
decides who is in it.

This is the whole play.

---

## 1. Get the link — do this first

Everything below needs one link, the one that opens the review box directly.

1. Open the Google Business Profile for PHAÖRA (search "phaora" while
   signed in as the owner, or open the Google Business Profile app)
2. Find **Ask for reviews** or **Get more reviews**
3. Copy the short link. It looks like `https://g.page/r/…/review`

Paste it into `card.html` where the file says to, and into the text
scripts below. One link, used everywhere.

## 2. The rule that keeps the reviews from being deleted

Google's policy is explicit: nothing of value may be offered in exchange
for a review. A gift card handed over *for a review* gets the review
removed and the profile flagged — and a flagged profile is worse than no
reviews at all.

The gift card is not banned. Tying it to the review is.

| Do | Don't |
|---|---|
| "Thanks for having us out — pick a gift card, on us." | "Leave us a review and get $15." |
| Card given whether or not they review | Card given after checking they reviewed |
| Ask for the review as a separate, unconditional favor | Ask in the same breath as the offer |

Give the card because they hired us. Ask for the review because we did
good work. Two separate things, and both are true.

## 3. Who to ask, in order

Ask in this order. Early reviews carry more weight than late ones because
they are what makes the next person's review land on a profile that is
already credible.

1. **Anyone who has already said something nice out loud.** They have
   written the review in their head. They just need the link.
2. **Jobs finished in the last 60 days.** The work is still visible from
   their kitchen window.
3. **Repeat customers.** They have the most to say.
4. **Builders and trade contacts.** A builder's review reads differently
   to a homeowner than another homeowner's does.
5. **Everyone else, oldest last.**

## 4. Pace: two or three a week. Not ten in a day.

Ten reviews landing on a young profile in one afternoon is the exact
pattern Google's spam systems look for. They get held, sometimes dropped,
and the profile carries a mark.

Two or three a week, for a month, is invisible and permanent.

## 5. The asks

### At the door, with the card

> "Wanted to drop this off — pick whatever gift card you want, on us, for
> having us out. And if you've got two minutes sometime this week, a review
> on Google genuinely helps us. That's the QR on the back, it opens right
> to it."

Hand the card. Do not stand there while they do it. Walking away is what
makes it a favor instead of a transaction.

### By text, day after completion

> Hi [Name], David from PHAORA. Wanted to make sure you're happy with how
> the [walkway] came out.
>
> If you've got a minute, a quick review on Google is the single biggest
> help you could give us: [link]

Send it the day after the job closes, not the day of. They have had one
evening to look at it.

### To someone who already said something nice

> That means a lot. Any chance you'd put that in a Google review? It's
> about thirty seconds and it's the thing that gets us found: [link]

Quote their own words back to them and they will usually reuse them.

## 6. When the reviews come in

Add each one to `tools/testimonials.json` — the quote, their name as they
want to be credited, the town, and the job. Then run:

    node tools/build-town-pages.js

The town's own reviews lead its page. A Weston review appears at the top of
the Weston page. That is most of the reason the town is recorded at all.

## 7. Reply to every one

A reply is a ranking signal and it is visible to the next person reading.
Two sentences. Name the job, thank them, no marketing language.

> "Thanks Linda — that bluestone walk came out well. Glad you're happy
> with it."
