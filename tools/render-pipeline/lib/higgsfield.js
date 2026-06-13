/* ═══════════════════════════════════════════════════════════════
   PHAORA — Higgsfield REST API Wrapper
   Minimal wrapper for the Higgsfield Soul img2img model.
   Uses direct fetch() calls — no SDK dependency.

   Auth: HF_API_KEY + HF_API_SECRET (or combined HF_KEY=key:secret)
   Base: https://platform.higgsfield.ai
   Docs: https://cloud.higgsfield.ai/

   Flow:
     1. Upload source image → get public URL
     2. POST /v1/text2image/soul with prompt + image_url
     3. Poll /requests/{id}/status until completed
     4. Download result image from images[].url
   ═══════════════════════════════════════════════════════════════ */

const fs = require('fs');

const DEFAULT_BASE_URL = 'https://platform.higgsfield.ai';

function getCredentials() {
  // Option A: combined key:secret
  if (process.env.HF_KEY) {
    const parts = process.env.HF_KEY.split(':');
    if (parts.length < 2) {
      throw new Error('HF_KEY must be in "key:secret" format');
    }
    return { apiKey: parts[0], apiSecret: parts.slice(1).join(':') };
  }

  // Option B: separate env vars
  const apiKey = process.env.HF_API_KEY;
  const apiSecret = process.env.HF_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error(
      'Missing Higgsfield credentials.\n' +
      'Set HF_API_KEY + HF_API_SECRET, or HF_KEY=key:secret in .env\n' +
      'Get credentials at https://cloud.higgsfield.ai/'
    );
  }
  return { apiKey, apiSecret };
}

function getBaseUrl() {
  return (process.env.HF_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

function buildHeaders() {
  const { apiKey, apiSecret } = getCredentials();
  return {
    'Authorization': `Key ${apiKey}:${apiSecret}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

/**
 * Upload a source image to Higgsfield's file storage.
 * Returns a public URL that can be referenced in generation requests.
 *
 * Step 1: POST /files/generate-upload-url → { upload_url, public_url }
 * Step 2: PUT image bytes to upload_url
 *
 * @param {Buffer} imageBuffer - Source image
 * @param {string} contentType - MIME type (default 'image/jpeg')
 * @returns {Promise<string>} public URL of the uploaded image
 */
async function uploadImage(imageBuffer, contentType = 'image/jpeg') {
  const base = getBaseUrl();
  const headers = buildHeaders();

  // Step 1: Get a presigned upload URL
  const urlRes = await fetch(`${base}/files/generate-upload-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content_type: contentType }),
  });

  if (!urlRes.ok) {
    const body = await urlRes.text();
    throw new Error(`Higgsfield upload-url failed (${urlRes.status}): ${body}`);
  }

  const { upload_url, public_url } = await urlRes.json();
  if (!upload_url || !public_url) {
    throw new Error('Higgsfield upload-url response missing upload_url or public_url');
  }

  // Step 2: PUT the image bytes to the presigned URL
  const putRes = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: imageBuffer,
  });

  if (!putRes.ok) {
    const body = await putRes.text();
    throw new Error(`Image upload PUT failed (${putRes.status}): ${body}`);
  }

  return public_url;
}

/**
 * Submit a Soul generation job with a reference image.
 *
 * @param {string} imageUrl - Public URL of the uploaded source image
 * @param {string} prompt - Positive prompt
 * @param {object} opts
 * @param {number} opts.seed - Random seed (omit for random)
 * @param {string} opts.resolution - e.g. '1536x1536' (default '1536x1536')
 * @param {string} opts.quality - e.g. '1080p' (default '1080p')
 * @param {boolean} opts.promptEnhancement - Let Soul enhance the prompt (default true)
 * @returns {Promise<{requestId: string, statusUrl: string}>}
 */
async function submitJob(imageUrl, prompt, opts = {}) {
  const base = getBaseUrl();
  const headers = buildHeaders();

  const params = {
    prompt,
    image_url: imageUrl,
    width_and_height: opts.resolution || '1536x1536',
    quality: opts.quality || '1080p',
    batch_size: 1,
    prompt_enhancement: opts.promptEnhancement !== false,
  };

  if (opts.seed !== undefined) {
    params.seed = opts.seed;
  }

  const res = await fetch(`${base}/v1/text2image/soul`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ params }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Higgsfield submit failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const requestId = data.request_id;
  if (!requestId) {
    throw new Error('No request_id in Higgsfield response: ' + JSON.stringify(data));
  }

  return {
    requestId,
    statusUrl: data.status_url || `${base}/requests/${requestId}/status`,
    cancelUrl: data.cancel_url || `${base}/requests/${requestId}/cancel`,
    raw: data,
  };
}

/**
 * Poll a request until it completes or fails.
 *
 * @param {string} requestId
 * @param {object} opts
 * @param {number} opts.intervalMs - Poll interval (default 3000)
 * @param {number} opts.timeoutMs - Max wait (default 300000 = 5 min)
 * @param {function} opts.onPoll - Callback on each poll (status, elapsed)
 * @returns {Promise<{status: string, imageUrl: string, raw: object}>}
 */
async function pollJob(requestId, opts = {}) {
  const base = getBaseUrl();
  const headers = buildHeaders();
  const interval = opts.intervalMs || 3000;
  const timeout = opts.timeoutMs || 300000;
  const onPoll = opts.onPoll || (() => {});

  const start = Date.now();

  while (true) {
    const elapsed = Date.now() - start;
    if (elapsed > timeout) {
      throw new Error(`Higgsfield request ${requestId} timed out after ${timeout / 1000}s`);
    }

    const res = await fetch(`${base}/requests/${requestId}/status`, { headers });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Higgsfield poll failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    const status = (data.status || '').toLowerCase();
    onPoll(status, elapsed);

    if (status === 'completed') {
      // Result images are in data.images[]
      const imageUrl = Array.isArray(data.images) && data.images.length > 0
        ? data.images[0].url
        : null;

      if (!imageUrl) {
        throw new Error('Request completed but no image URL found: ' + JSON.stringify(data));
      }
      return { status: 'completed', imageUrl, images: data.images, raw: data };
    }

    if (status === 'failed' || status === 'nsfw' || status === 'canceled') {
      const msg = data.detail || data.error || data.message || JSON.stringify(data);
      throw new Error(`Higgsfield request ${requestId} ${status}: ${msg}`);
    }

    // queued / in_progress — wait and retry
    await new Promise(r => setTimeout(r, interval));
  }
}

/**
 * Download an image from a URL and save it to disk.
 *
 * @param {string} url - Image URL from Higgsfield
 * @param {string} outPath - Local file path to save to
 * @returns {Promise<void>}
 */
async function downloadResult(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
}

/**
 * Full pipeline: upload image, then submit N variations in parallel.
 * Uses different seeds to get distinct outputs.
 *
 * @param {Buffer} imageBuffer - Source image
 * @param {string} prompt - Positive prompt
 * @param {number} count - Number of variations (default 4)
 * @param {object} opts - Options passed to submitJob
 * @returns {Promise<Array<{index, seed, requestId, statusUrl}>>}
 */
async function generateVariations(imageBuffer, prompt, count = 4, opts = {}) {
  // Upload source image once, reuse the URL for all variations
  const contentType = opts.contentType || 'image/jpeg';
  const imageUrl = await uploadImage(imageBuffer, contentType);

  const baseSeed = opts.seed ?? Math.floor(Math.random() * 999999);
  const jobs = [];

  for (let i = 0; i < count; i++) {
    const seed = baseSeed + i;
    jobs.push(
      submitJob(imageUrl, prompt, { ...opts, seed })
        .then(result => ({ index: i, seed, ...result }))
    );
  }

  return Promise.all(jobs);
}

module.exports = {
  getCredentials,
  uploadImage,
  submitJob,
  pollJob,
  downloadResult,
  generateVariations,
};
