#!/usr/bin/env node
/**
 * The journal is an extension of phaora.com, not a second website. So its
 * header, footer, fonts and colour tokens are not written twice — they are
 * lifted out of index.html by this script and written into the CRM, which is
 * what serves /blog under a rewrite.
 *
 * Re-run it whenever the site's nav or footer changes:
 *
 *   node tools/extract-site-chrome.js
 *
 * It writes ../canon/apps/crm/app/blog/site-chrome.generated.ts. Nothing in
 * that file is typed by hand, so the two cannot drift.
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "..", "canon", "apps", "crm", "app",
                      "blog", "site-chrome.generated.ts");

const { chrome } = require("./lib-chrome");
const { fonts, css, nav, mobile, foot, nav_js } = chrome();

/* ---------- write ---------- */
const q = (s) => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

fs.writeFileSync(OUT, `// GENERATED — do not edit.
// Lifted from phaora.com/index.html by Phaora/tools/extract-site-chrome.js.
// The journal wears the site's chrome so the two are one website; edit the
// site, then re-run that script.

export const SITE_FONTS = ${q(fonts)};

export const SITE_CSS = ${q(css)};

export const NAV_HTML = ${q(nav)};

export const MOBILE_MENU_HTML = ${q(mobile)};

export const FOOTER_HTML = ${q(foot)};

export const NAV_JS = ${q(nav_js)};
`);

console.log(`css   ${css.length} bytes`);
console.log(`nav   ${nav.length}\nmenu  ${mobile.length}\nfoot  ${foot.length}\njs    ${nav_js.length}`);
console.log(`-> ${OUT}`);
