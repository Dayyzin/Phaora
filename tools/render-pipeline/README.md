# PHAORA Render Pipeline

Generates photorealistic paver installation renders from a site photo and job spec using Higgsfield Soul img2img, then scores each with Claude Vision.

## Setup

```bash
cd tools/render-pipeline
npm install
cp .env.example .env
# Add your Higgsfield + Anthropic keys to .env
```

### Global CLI (optional)

```bash
cd tools/render-pipeline
npm link
# Now use from anywhere in the repo:
phaora render <client-slug>
```

## Usage

### Direct

```bash
node tools/render-pipeline/render.js smith-front-entry-2026-04
```

### Via phaora CLI

```bash
phaora render smith-front-entry-2026-04
phaora render smith-front-entry-2026-04 --strength 0.7
phaora render smith-front-entry-2026-04 --count 6
phaora render smith-front-entry-2026-04 --skip-check
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--strength <0-1>` | `0.65` | Denoising strength — lower preserves more of the source photo |
| `--count <n>` | `4` | Number of render variations |
| `--skip-check` | `false` | Skip Claude Vision scoring |

## Project Structure

Each project lives in `/projects/<client-slug>/`:

```
projects/smith-front-entry-2026-04/
  source.jpg          ← Site photo (any angle)
  spec.json           ← Job parameters
  renders/
    v1-1.png          ← Generation 1, variation 1
    v1-2.png
    v1-3.png
    v1-4.png
  README.md           ← Auto-generated job summary + scores
```

Running the pipeline again creates `v2-*` renders (auto-increments).

## Creating a New Project

1. Create the project folder:
   ```bash
   mkdir -p projects/client-slug-here
   ```

2. Add the site photo as `source.jpg`

3. Create `spec.json` (see sample below)

4. Run:
   ```bash
   phaora render client-slug-here
   ```

### Sample spec.json

```json
{
  "client_slug": "smith-front-entry-2026-04",
  "client_name": "Smith Residence",
  "job_type": "patio",
  "dimensions": {
    "width_ft": 10,
    "depth_ft": 12,
    "shape": "rectangle"
  },
  "paver": {
    "size_inches": 24,
    "color": "grey",
    "pattern": "stack-bond grid",
    "supplier": "Tremron",
    "product_name": "Mega Olde Towne Slab"
  },
  "surface_area": "patio in front of covered porch",
  "style_description": "modern Florida coastal home with white stucco walls",
  "lighting_description": "late afternoon golden hour, warm raking sunlight from camera-left, clear blue Florida sky with light cumulus clouds",
  "source_photo": "./source.jpg"
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HF_API_KEY` | Yes* | Higgsfield API key |
| `HF_API_SECRET` | Yes* | Higgsfield API secret |
| `HF_KEY` | Alt* | Combined format: `key:secret` |
| `ANTHROPIC_API_KEY` | For scoring | Claude Vision API key (falls back to visual-check/.env) |
| `HF_BASE_URL` | No | Override API base URL |

*Either `HF_API_KEY` + `HF_API_SECRET` or `HF_KEY` is required.

## Higgsfield API Details

Verified against the official Higgsfield Python SDK (`higgsfield-client`) and JS SDK.

| Item | Value |
|------|-------|
| **Base URL** | `https://platform.higgsfield.ai` |
| **Auth header** | `Authorization: Key <api_key>:<api_secret>` |
| **Upload** | `POST /files/generate-upload-url` then PUT to presigned URL |
| **Submit** | `POST /v1/text2image/soul` (JSON body with `image_url` reference) |
| **Poll** | `GET /requests/{request_id}/status` |
| **Statuses** | `queued`, `in_progress`, `completed`, `failed`, `nsfw`, `canceled` |
| **Result** | `images[0].url` in the completed status response |

## Cost Estimate

- **Higgsfield**: ~4 img2img calls per run (varies by plan)
- **Claude Vision**: ~4 API calls for scoring (~$0.04 per run at current rates)
