import json, csv, os

CAMPAIGN = "Search-1"   # the live campaign name, off David's account screenshot
towns = json.load(open('tools/towns.json'))['towns']
H_MAX, D_MAX, P_MAX = 30, 90, 15

def headlines(t):
    town = t['town']
    return [h for h in [
        f"Masonry in {town}, MA",
        f"{town} Stone & Hardscape",
        f"Masonry Crew in {town}",
        "Patios, Walkways, Walls",
        "Stone Veneer & Fireplaces",
        "Retaining Walls Built Right",
        "Free On-Site Estimate",
        "A Price Before Anyone Visits",
        "1-Year Workmanship Warranty",
        "Insured, Our Own Crew",
        "Built to Your Frost Depth",
        "Masonry & Whole-Home Work",
    ] if len(h) <= H_MAX]

def descriptions(t):
    town = t['town']
    return [d for d in [
        f"Patios, walkways, retaining walls and stone veneer in {town}. Built by our own crew.",
        "One-year workmanship warranty. If it moves because of how we built it, we come back.",
        "Get a real number before anyone visits. Then book a free on-site estimate.",
        "Masonry is our flagship and we take on the rest of the home. Insured, our own crew.",
    ] if len(d) <= D_MAX]

STEMS = ["masonry", "mason", "masonry contractor", "stone mason", "patio builder",
         "paver patio", "walkway", "retaining wall", "stone veneer", "stone steps",
         "chimney repair", "hardscaping"]

def keywords(t):
    town = t['town'].lower()
    out = []
    for s in STEMS:
        out.append((f'"{s} {town} ma"', "Phrase"))
        out.append((f'"{s} in {town}"', "Phrase"))
    out.append((f"[{town} ma masonry contractor]", "Exact"))
    out.append((f"[masonry contractor {town} ma]", "Exact"))
    return out

# Waste we are not paying for. Campaign-level shared list.
NEGATIVES = [
    "jobs", "hiring", "career", "salary", "apprentice", "apprenticeship", "union",
    "how to", "diy", "tutorial", "youtube", "course", "class", "training", "school",
    "certification", "license", "licensing", "exam",
    "free", "cheap", "cheapest", "discount", "coupon",
    "supply", "supplies", "wholesale", "supplier", "yard", "depot", "lowes",
    "home depot", "for sale", "rental", "rent", "used",
    "software", "estimating software", "takeoff", "insurance", "lawsuit",
    "salary", "resume", "indeed", "craigslist",
]

kw_rows, ad_rows, neg_rows = [], [], []
problems = []

for t in towns:
    ag = f"{t['town']} - Masonry"
    url = f"https://phaora.com/{t['slug']}/"
    p2 = t['town'].lower().replace(' ', '-')
    if len(p2) > P_MAX:
        problems.append(f"path2 too long for {t['town']}")
        p2 = p2[:P_MAX]

    for kw, mt in keywords(t):
        kw_rows.append({"Campaign": CAMPAIGN, "Ad Group": ag, "Keyword": kw, "Match Type": mt})

    hs, ds = headlines(t), descriptions(t)
    if len(hs) < 3: problems.append(f"{t['town']}: {len(hs)} headlines")
    if len(ds) < 2: problems.append(f"{t['town']}: {len(ds)} descriptions")

    row = {"Campaign": CAMPAIGN, "Ad Group": ag, "Ad type": "Responsive search ad",
           "Final URL": url, "Path 1": "masonry", "Path 2": p2}
    for i, h in enumerate(hs[:15], 1): row[f"Headline {i}"] = h
    for i, d in enumerate(ds[:4], 1):  row[f"Description {i}"] = d
    ad_rows.append(row)

for n in sorted(set(NEGATIVES)):
    neg_rows.append({"Campaign": CAMPAIGN, "Keyword": n, "Match Type": "Broad"})

os.makedirs('tools/ads', exist_ok=True)
with open('tools/ads/town-keywords.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=["Campaign", "Ad Group", "Keyword", "Match Type"])
    w.writeheader(); w.writerows(kw_rows)

adcols = ["Campaign", "Ad Group", "Ad type", "Final URL", "Path 1", "Path 2"]
adcols += [f"Headline {i}" for i in range(1, 13)] + [f"Description {i}" for i in range(1, 5)]
with open('tools/ads/town-ads.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=adcols, extrasaction='ignore')
    w.writeheader(); w.writerows(ad_rows)

with open('tools/ads/negatives.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=["Campaign", "Keyword", "Match Type"])
    w.writeheader(); w.writerows(neg_rows)

print("ad groups:", len(ad_rows), "| keywords:", len(kw_rows), "| negatives:", len(neg_rows))
print("headlines/group:", [len(headlines(t)) for t in towns])
print("descriptions/group:", [len(descriptions(t)) for t in towns])
print("max headline:", max(len(h) for t in towns for h in headlines(t)),
      "max desc:", max(len(d) for t in towns for d in descriptions(t)))
print("problems:", problems or "none")
