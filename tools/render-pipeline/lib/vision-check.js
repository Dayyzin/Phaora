/* ═══════════════════════════════════════════════════════════════
   PHAORA — Vision Check (shared module)
   Sends rendered images to Claude Vision for quality scoring.
   Extracted from tools/visual-check for reuse across pipeline.
   ═══════════════════════════════════════════════════════════════ */

const Anthropic = require('@anthropic-ai/sdk').default;

const RENDER_CHECK_PROMPT = `This image is a render of a hardscape patio installation. Evaluate it on three criteria: (1) Does it look like a REAL PHOTOGRAPH or like a 3D render/CGI? (2) Are the pavers correctly sized and laid in the specified pattern? (3) Is the composition usable as a client proposal cover image? Answer in JSON: { "photoreal": "photo"|"cgi"|"mixed", "pattern_correct": true|false, "usable": true|false, "score": 0-100, "notes": "<one sentence>" }`;

let _client = null;

function getClient() {
  if (_client) return _client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing ANTHROPIC_API_KEY.\n' +
      'Copy .env.example -> .env and add your Anthropic key.'
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

/**
 * Run Claude Vision check on a single render image.
 *
 * @param {Buffer} imageBuffer - PNG/JPEG image buffer
 * @param {string} mediaType - e.g. 'image/png' or 'image/jpeg'
 * @param {object} opts
 * @param {string} opts.prompt - Override the default check prompt
 * @returns {Promise<{photoreal: string, pattern_correct: boolean, usable: boolean, score: number, notes: string}>}
 */
async function checkRender(imageBuffer, mediaType = 'image/png', opts = {}) {
  const client = getClient();
  const prompt = opts.prompt || RENDER_CHECK_PROMPT;
  const base64 = imageBuffer.toString('base64');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: prompt },
      ],
    }],
  });

  const raw = response.content[0].text.trim();
  try {
    return JSON.parse(raw.replace(/^```json\n?|\n?```$/g, ''));
  } catch {
    return {
      photoreal: 'unknown',
      pattern_correct: false,
      usable: false,
      score: 0,
      notes: 'Vision parse error: ' + raw.slice(0, 200),
    };
  }
}

/**
 * Check multiple renders and return results sorted by score (highest first).
 *
 * @param {Array<{path: string, buffer: Buffer, label: string}>} renders
 * @returns {Promise<Array<{label: string, path: string, ...checkResult}>>}
 */
async function checkAllRenders(renders) {
  const results = [];

  for (const render of renders) {
    const mediaType = render.path.endsWith('.jpg') || render.path.endsWith('.jpeg')
      ? 'image/jpeg'
      : 'image/png';

    const check = await checkRender(render.buffer, mediaType);
    results.push({ label: render.label, path: render.path, ...check });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results;
}

module.exports = { checkRender, checkAllRenders, RENDER_CHECK_PROMPT };
