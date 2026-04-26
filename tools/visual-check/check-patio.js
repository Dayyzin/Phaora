#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   PHAÖRA — Visual Patio Check
   Screenshots the patio scene from 3 camera presets and asks
   Claude Vision whether the patio reads as a rectangle.
   Exit 0 = pass, Exit 1 = fail.
   ═══════════════════════════════════════════════════════════════ */

const { chromium } = require('playwright');
const Anthropic = require('@anthropic-ai/sdk').default;
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const PRESETS = [
  { key: 'topdown',  label: 'Top-down'  },
  { key: 'hero',     label: 'Hero'      },
  { key: 'eyelevel', label: 'Eye-level' },
];

const VISION_PROMPT = `This is a rendered view of a residential patio. The patio surface (paved area) is supposed to be 10ft wide by 12ft deep — clearly RECTANGULAR with depth being the longer dimension.

Look ONLY at the patio surface (the grey paved area in front of any porch/columns). Ignore everything else.

Question: Is the depth dimension of the patio CLEARLY longer than its width?

- If yes (depth visibly > width): verdict = "rectangle"
- If the patio appears square or the depth is not clearly longer: verdict = "square"
- Use "unclear" ONLY if the patio surface is not visible at all in the image

Be decisive. Most renders should be "rectangle" or "square," not "unclear."

Answer ONLY in valid JSON:
{ "verdict": "rectangle" | "square" | "unclear", "confidence": 0-100, "reasoning": "<one sentence>" }`;

async function capturePreset (page, cdp, key, outPath) {
  await page.evaluate(k => {
    if (typeof window.setCameraPreset === 'function') window.setCameraPreset(k);
  }, key);
  await page.waitForTimeout(2000);

  /* Use CDP Page.captureScreenshot — instant capture, no stability wait.
     This is the only reliable way to screenshot a page with requestAnimationFrame. */
  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    fromSurface: true,
  });
  fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
  return data;
}

async function main () {
  const url = process.argv[2] || 'http://localhost:8000/projects/patio-v2/';

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY. Copy .env.example → .env and add your key.');
    process.exit(1);
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.log(`\nLoading ${url} …`);
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-gpu',
      '--ignore-gpu-blocklist',
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=metal',
      '--no-sandbox',
    ],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });

  try {
    await page.goto(url, { timeout: 20000 });
  } catch {
    console.error(`Could not load ${url} — is the local server running?\n  python3 -m http.server 8000`);
    await browser.close();
    process.exit(1);
  }

  /* Let Three.js init + first frames render (Metal GPU should be fast) */
  console.log('Waiting for scene render (Metal GPU) …');
  await page.waitForTimeout(6000);

  /* Verify Three.js loaded */
  const hasCanvas = await page.evaluate(() => !!document.querySelector('#scene-container canvas'));
  if (!hasCanvas) {
    console.error('No WebGL canvas found — Three.js may have failed to initialize.');
    await browser.close();
    process.exit(1);
  }
  console.log('WebGL canvas found');

  /* Open CDP session for instant screenshots (bypasses RAF stability wait) */
  const cdp = await page.context().newCDPSession(page);

  const results = [];
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

  for (const preset of PRESETS) {
    const outPath = path.join(screenshotDir, `${preset.key}.png`);
    const base64 = await capturePreset(page, cdp, preset.key, outPath);

    if (!base64) {
      console.log(`[${preset.label}] Could not capture — skipping`);
      results.push({ preset: preset.label, verdict: 'unclear', confidence: 0, reasoning: 'Capture failed' });
      continue;
    }

    console.log(`[${preset.label}] Screenshot saved → screenshots/${preset.key}.png`);

    /* Send to Claude Vision */
    console.log(`[${preset.label}] Sending to Claude Vision …`);
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64 } },
          { type: 'text', text: VISION_PROMPT },
        ],
      }],
    });

    const raw = response.content[0].text.trim();
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/^```json\n?|\n?```$/g, ''));
    } catch {
      parsed = { verdict: 'unclear', confidence: 0, reasoning: 'Parse error: ' + raw.slice(0, 200) };
    }

    results.push({ preset: preset.label, ...parsed });
    console.log(`[${preset.label}] ${parsed.verdict} (${parsed.confidence}%) — ${parsed.reasoning}`);
  }

  await browser.close();

  const failed = results.filter(
    r => r.verdict === 'square' || (r.verdict === 'unclear' && r.confidence > 60)
  );

  console.log('');
  if (failed.length > 0) {
    console.log('❌ VISUAL CHECK FAILED');
    console.log(`${failed.length} of ${PRESETS.length} camera angles read as square/unclear:`);
    failed.forEach(r => console.log(`  - ${r.preset}: ${r.reasoning}`));
    process.exit(1);
  } else {
    console.log('✅ VISUAL CHECK PASSED — all 3 angles read as rectangle');
    process.exit(0);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
