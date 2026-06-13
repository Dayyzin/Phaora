#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   PHAORA CLI
   Usage: phaora render <client-slug>
   ═══════════════════════════════════════════════════════════════ */

const path = require('path');

const [,, command, ...args] = process.argv;

if (!command || command === '--help' || command === '-h') {
  console.log(`
  PHAORA CLI

  Commands:
    render <client-slug>   Generate 4 render variations from a project spec
                           Reads /projects/<slug>/spec.json + source.jpg
                           Outputs to /projects/<slug>/renders/

  Options:
    --strength <0-1>       Denoising strength (default: 0.65)
    --count <n>            Number of variations (default: 4)
    --skip-check           Skip Claude Vision scoring

  Examples:
    phaora render smith-front-entry-2026-04
    phaora render smith-front-entry-2026-04 --strength 0.7
  `);
  process.exit(0);
}

if (command === 'render') {
  // Delegate to render.js with the same args
  const renderScript = path.join(__dirname, '..', 'render.js');
  process.argv = [process.argv[0], renderScript, ...args];
  require(renderScript);
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Run "phaora --help" for usage.');
  process.exit(1);
}
