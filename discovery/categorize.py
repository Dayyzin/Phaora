#!/usr/bin/env python3
"""Categorize 148 hardscape photos using Claude vision API."""

import anthropic
import base64
import json
import os
import sys
import time
import glob

THUMB_DIR = os.path.expanduser("~/Phaora/assets/PHAORA IMAGES/Hardscape/portfolio-thumbs")
OUT_JSON = os.path.expanduser("~/Phaora/discovery/hardscape-categories.json")
ERR_LOG = os.path.expanduser("~/Phaora/discovery/categorize-errors.log")
VALID_CATS = {"pool", "patios", "walls", "outdoor"}
BATCH_SIZE = 5
BATCH_DELAY = 0.2

PROMPT = (
    "Categorize this hardscape (outdoor construction) photo into exactly ONE "
    "of these 4 categories. Reply with only the category name, lowercase, no punctuation:\n"
    "- pool (pool decks, pool coping, pool surrounds)\n"
    "- patios (patios, paver patios, fire pits, fire features, dining patios)\n"
    "- walls (retaining walls, garden walls, entry walls, columns, driveway entries, gates)\n"
    "- outdoor (outdoor kitchens, BBQ areas, pergolas, covered structures, anything else)\n"
    "Reply with one word."
)

client = anthropic.Anthropic()
results = {}
errors = []

files = sorted(glob.glob(os.path.join(THUMB_DIR, "phaora-hardscape-*.jpg")))
total = len(files)
print(f"Found {total} thumbnails to categorize")

total_input_tokens = 0
total_output_tokens = 0

for batch_start in range(0, total, BATCH_SIZE):
    batch = files[batch_start:batch_start + BATCH_SIZE]
    for fpath in batch:
        fname = os.path.basename(fpath)
        num = fname.replace("phaora-hardscape-", "").replace(".jpg", "")
        try:
            with open(fpath, "rb") as f:
                img_data = base64.standard_b64encode(f.read()).decode("utf-8")

            resp = client.messages.create(
                model="claude-sonnet-4-5-20241022",
                max_tokens=10,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": img_data,
                            },
                        },
                        {"type": "text", "text": PROMPT},
                    ],
                }],
            )

            total_input_tokens += resp.usage.input_tokens
            total_output_tokens += resp.usage.output_tokens

            cat = resp.content[0].text.strip().lower().rstrip(".")
            if cat not in VALID_CATS:
                err = f"{fname}: unexpected response '{cat}', defaulting to outdoor"
                errors.append(err)
                print(f"  WARN: {err}")
                cat = "outdoor"

            results[fname] = cat
            idx = batch_start + batch.index(fpath) + 1
            print(f"  [{idx}/{total}] {fname} -> {cat}")

        except Exception as e:
            err = f"{fname}: API error: {e}, defaulting to outdoor"
            errors.append(err)
            print(f"  ERR: {err}")
            results[fname] = "outdoor"

    if batch_start + BATCH_SIZE < total:
        time.sleep(BATCH_DELAY)

# Write results
with open(OUT_JSON, "w") as f:
    json.dump(results, f, indent=2)
print(f"\nWrote {len(results)} categories to {OUT_JSON}")

# Write errors
if errors:
    with open(ERR_LOG, "w") as f:
        f.write("\n".join(errors) + "\n")
    print(f"Logged {len(errors)} errors to {ERR_LOG}")
else:
    print("No errors.")

# Token summary
print(f"\nTokens — input: {total_input_tokens:,} | output: {total_output_tokens:,}")
# Sonnet pricing: $3/M input, $15/M output
cost_in = total_input_tokens * 3.0 / 1_000_000
cost_out = total_output_tokens * 15.0 / 1_000_000
print(f"Estimated cost — input: ${cost_in:.4f} | output: ${cost_out:.4f} | total: ${cost_in + cost_out:.4f}")

# Distribution
from collections import Counter
dist = Counter(results.values())
print(f"\nDistribution: {dict(dist)}")
print(f"Total: {sum(dist.values())}")
