# PHAÖRA Visual Patio Check

Automated screenshot + Claude Vision verification that the patio visualization reads as a **rectangle** (10ft × 12ft), not a square.

## One-time setup

```bash
cd tools/visual-check
npm install
npx playwright install chromium
cp .env.example .env
# Edit .env and add your Anthropic API key
```

## Usage

Start the local server from repo root (if not already running):
```bash
cd /path/to/Phaora
python3 -m http.server 8000
```

Then run the check:
```bash
cd tools/visual-check
node check-patio.js
# or with a custom URL:
node check-patio.js http://localhost:8000/projects/patio-v2/
```

## What it does

1. Opens Chromium headless at 1440×900
2. Loads the patio page, waits for the 3D scene to render
3. Clicks through **Top-down**, **Hero**, and **Eye-level** camera presets
4. Screenshots each view
5. Sends each screenshot to Claude Vision (claude-opus-4-5)
6. Asks: "Does this patio read as a rectangle or a square?"
7. Reports pass/fail

## Pass / Fail criteria

- **Pass:** All 3 presets return `"verdict": "rectangle"`
- **Fail:** Any preset returns `"square"`, or `"unclear"` with confidence > 60%

## Cost

~$0.05 per run (3 vision API calls with screenshots).

## Example output

```
Loading http://localhost:8000/projects/patio-v2/ …
[top-down] Screenshot captured — sending to Claude Vision …
[top-down] rectangle (92%) — The patio is visibly longer in one dimension than the other
[hero] Screenshot captured — sending to Claude Vision …
[hero] rectangle (78%) — Depth perspective shows the patio extending noticeably further than its width
[eye-level] Screenshot captured — sending to Claude Vision …
[eye-level] rectangle (71%) — The patio surface recedes well past its lateral extent

✅ VISUAL CHECK PASSED — all 3 angles read as rectangle
```
