/* ═══════════════════════════════════════════════════════════════
   PHAORA — Prompt Builder
   Builds img2img prompts from job spec fields.
   ═══════════════════════════════════════════════════════════════ */

const PROMPT_TEMPLATE = (spec) => {
  const jobType = spec.job_type || 'patio';
  const dims = spec.dimensions
    ? `${spec.dimensions.width_ft}ft x ${spec.dimensions.depth_ft}ft ${spec.dimensions.shape || ''}`
    : '';
  const paverColor = spec.paver?.color || 'grey';
  const paverPattern = spec.paver?.pattern || 'stack-bond';
  const surfaceArea = spec.surface_area || jobType;
  const styleDesc = spec.style_description || 'modern Florida coastal home';
  const lightingDesc = spec.lighting_description || 'natural daylight, clear sky';

  return `Photorealistic architectural photography of a residential ${jobType} installation. ${dims} ${paverColor} ${paverPattern} pavers covering the ${surfaceArea}. ${styleDesc}. ${lightingDesc}. Professional luxury real estate listing photography, magazine quality, sharp focus, natural daylight, accurate materials. South Florida coastal residential setting.`;
};

const NEGATIVE_TEMPLATE = (spec) => {
  const pattern = spec.paver?.pattern || '';
  // Only exclude herringbone if it's NOT the specified pattern
  const herringboneClause = pattern.toLowerCase().includes('herringbone')
    ? ''
    : 'herringbone, ';

  return `3D render, video game, illustration, cartoon, oversaturated, HDR look, fish-eye distortion, small pavers, brick pattern, ${herringboneClause}people, text, watermark, fantasy elements, plastic look, CGI artifacts, european architecture, software interface, browser window`;
};

function buildPrompt(spec) {
  return PROMPT_TEMPLATE(spec).replace(/\s+/g, ' ').trim();
}

function buildNegativePrompt(spec) {
  return NEGATIVE_TEMPLATE(spec).replace(/\s+/g, ' ').trim();
}

module.exports = { buildPrompt, buildNegativePrompt };
