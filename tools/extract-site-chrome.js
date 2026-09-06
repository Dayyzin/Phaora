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

const SRC = path.join(__dirname, "..", "index.html");
const OUT = path.join(__dirname, "..", "..", "canon", "apps", "crm", "app",
                      "blog", "site-chrome.generated.ts");

const html = fs.readFileSync(SRC, "utf8");

/* ---------- the fonts the site loads ---------- */
const fonts = (html.match(/<link href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/) || [])[1];
if (!fonts) throw new Error("no google-fonts link in index.html");

/* ---------- the stylesheet ---------- */
const style = html.slice(html.indexOf("<style>") + 7, html.indexOf("</style>"));

/**
 * Selectors that make up the chrome. A rule survives if ANY selector in its
 * list starts with one of these — so `.nav-right .enquire:hover` comes along
 * with `.nav-right`, and the homepage's hero, gallery and winter sections do
 * not.
 */
const KEEP = [
  "*", ":root", "html", "body", "a{", "a,", "a ",
  ".serif", ".eyebrow", ".rule-h",
  "nav", ".nav-", ".mobile-menu", ".m-", "footer", ".footer-",
];
const keep = (sel) =>
  sel.split(",").some((s) => {
    const t = s.trim();
    return KEEP.some((k) =>
      k.endsWith("{") ? t === k.slice(0, -1)
      : k === "*" ? t === "*" || t.startsWith("*::")
      : t === k || t.startsWith(k));
  });

/**
 * A tiny rule walker. `css-tree` is not a dependency of a static site, and
 * this stylesheet is plain CSS: rules, one level of @media, comments.
 */
function rules(css) {
  const out = [];
  let i = 0;
  while (i < css.length) {
    if (css.startsWith("/*", i)) { i = css.indexOf("*/", i) + 2; continue; }
    if (/\s/.test(css[i])) { i++; continue; }
    const brace = css.indexOf("{", i);
    if (brace < 0) break;
    const head = css.slice(i, brace).trim();
    // walk to the matching close brace, so @media keeps its whole body
    let depth = 0, j = brace;
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") { depth--; if (!depth) break; }
    }
    out.push({ head, body: css.slice(brace + 1, j), end: j });
    i = j + 1;
  }
  return out;
}

const parts = [];
for (const r of rules(style)) {
  if (r.head.startsWith("@media")) {
    const inner = rules(r.body).filter((x) => !x.head.startsWith("@") && keep(x.head));
    if (inner.length) {
      parts.push(`${r.head}{${inner.map((x) => `${x.head}{${x.body.trim()}}`).join("")}}`);
    }
  } else if (!r.head.startsWith("@") && keep(r.head)) {
    parts.push(`${r.head}{${r.body.trim()}}`);
  }
}
/**
 * The footer's slate texture is written relative to the site root. These pages
 * are also reachable at crm.phaora.com/blog, where that path does not exist,
 * so it is pinned to the site's own host.
 */
const css = parts.join("\n").replace(/url\('(?!https?:|\/|data:)([^']+)'\)/g,
                                     "url('https://phaora.com/$1')");

/* ---------- the markup ---------- */
const cut = (open, close) => {
  const a = html.indexOf(open);
  const b = html.indexOf(close, a);
  if (a < 0 || b < 0) throw new Error(`missing ${open}`);
  return html.slice(a, b + close.length);
};

/**
 * Links on the homepage are relative to the site root. These pages serve from
 * /blog and /blog/<slug>, where a relative href resolves inside the journal —
 * so every one of them is made root-relative here, and the journal's own link
 * stops being an absolute jump to another host.
 */
const absolute = (s) =>
  s.replace(/href="https:\/\/crm\.phaora\.com\/blog"/g, 'href="/blog"')
   .replace(/href="index\.html"/g, 'href="/"')
   .replace(/href="(?!https?:|mailto:|tel:|\/|#)([^"]+)"/g, 'href="/$1"');

const nav    = absolute(cut("<nav>", "</nav>"));
const mobile = absolute(cut('<div class="mobile-menu"', "</div>\n</div>"));
const foot   = absolute(cut("<footer>", "</footer>"));

/**
 * The burger's script, whole — including the two body-scroll functions the
 * open state depends on. Taking it verbatim is the point: the menu on a guide
 * page behaves the same as the menu on the homepage because it IS the same
 * code, not a second implementation of it.
 */
const js = html.slice(html.indexOf("// MOBILE NAV"));
const nav_js = js.slice(0, js.indexOf("})();") + 5).trim();

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

console.log(`css   ${css.length} bytes, ${parts.length} rules`);
console.log(`nav   ${nav.length}\nmenu  ${mobile.length}\nfoot  ${foot.length}\njs    ${nav_js.length}`);
console.log(`-> ${OUT}`);
