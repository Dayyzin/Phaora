#!/usr/bin/env node
/**
 * Check every town page before it goes out.
 *
 * Forty-eight of these were generated in one pass from bench data. A template
 * bug does not show up on one page, it shows up on forty-eight, and the way it
 * usually shows up is a canonical URL pointing at the town the template was
 * copied from — which quietly tells Google the other forty-seven are duplicates
 * of it.
 *
 * So this checks the things that are silently wrong rather than visibly broken:
 * the canonical, the title, the internal links, and any placeholder that
 * survived. Exits non-zero, so it can gate a deploy.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

/**
 * Text that means a field was left for somebody to fill in.
 *
 * The house rule is that an unknown town, date, price or credential is left
 * blank and marked rather than guessed. This is the other half of that rule:
 * catching the marker before it ships.
 */
const PLACEHOLDERS = [
  'TODO', 'FIXME', 'Lorem ipsum', 'undefined', 'NaN', '[object Object]',
  'COUNTY UNRESOLVED',
]

/** An unfilled template variable: {{ town }}, ${town}, %TOWN%. */
const TEMPLATE_MARKER = /\{\{\s*\w|\$\{\s*\w+\s*\}|%[A-Z_]{3,}%/

/**
 * The page with script and style stripped.
 *
 * Checking the raw file flagged all 104 pages for '}}' — which was a closing
 * media query in the minified CSS, not an unfilled variable. A checker that
 * cries wolf on every page is one nobody runs twice.
 */
function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
}

function main() {
  const dirs = fs
    .readdirSync(ROOT)
    .filter((d) => /^masonry-[a-z-]+-(ma|ri|nh|me|ct)$/.test(d))
    .filter((d) => fs.existsSync(path.join(ROOT, d, 'index.html')))
    .sort()

  const onDisk = new Set(dirs)
  const problems = []
  let checked = 0

  for (const dir of dirs) {
    const file = path.join(ROOT, dir, 'index.html')
    const html = fs.readFileSync(file, 'utf8')
    const say = (msg) => problems.push(`${dir}: ${msg}`)
    checked++

    // The canonical is the one that costs traffic when it is wrong, because
    // nothing about the page looks broken.
    const canon = /<link rel="canonical" href="([^"]+)"/.exec(html)
    if (!canon) say('no canonical')
    else if (canon[1] !== `https://phaora.com/${dir}/`) {
      say(`canonical points at ${canon[1]}, not /${dir}/`)
    }

    const title = /<title>([^<]*)<\/title>/.exec(html)
    if (!title || !title[1].trim()) say('no title')

    const desc = /<meta name="description" content="([^"]*)"/.exec(html)
    if (!desc || desc[1].trim().length < 50) say('description missing or too short')

    // A link to a directory that does not exist is a 404 that only shows up
    // when somebody clicks it.
    for (const m of html.matchAll(/href="\/(masonry-[a-z-]+-(?:ma|ri|nh|me|ct))\//g)) {
      if (!onDisk.has(m[1])) say(`links to /${m[1]}/ which does not exist`)
    }

    // The town page's whole job is to deliver somebody into the estimate flow.
    if (!/href="\/estimate\//.test(html)) say('no link to /estimate/')

    const text = visibleText(html)
    for (const p of PLACEHOLDERS) {
      if (text.includes(p)) say(`contains placeholder text "${p}"`)
    }
    const tm = TEMPLATE_MARKER.exec(text)
    if (tm) say(`unfilled template variable near "${tm[0]}"`)

    // The nearby block is written as 'slug|state' in the data and must be
    // resolved by the generator. A pipe reaching the HTML means it was not.
    if (/href="\/masonry-[^"]*\|/.test(html)) say('unresolved slug|state in a link')

    // Lowercase link text is the raw slug leaking through where a town has a
    // page but no entry in the generator's list.
    for (const m of html.matchAll(/<a href="\/masonry-[^"]+\/">([a-z][^<]*)<\/a>/g)) {
      say(`link text "${m[1]}" is a raw slug, not a town name`)
    }
  }

  // Every page on disk should be in the sitemap, and nothing should be in the
  // sitemap that is not on disk.
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8')
  const listed = new Set(
    [...sitemap.matchAll(/phaora\.com\/(masonry-[a-z-]+-(?:ma|ri|nh|me|ct))\//g)].map((m) => m[1]),
  )
  for (const d of onDisk) if (!listed.has(d)) problems.push(`sitemap: /${d}/ is missing`)
  for (const d of listed) if (!onDisk.has(d)) problems.push(`sitemap: /${d}/ has no directory`)

  // And every page should be reachable from the service-area page, or it is an
  // orphan whatever the sitemap says.
  const sa = fs.readFileSync(path.join(ROOT, 'service-area', 'index.html'), 'utf8')
  const linked = new Set(
    [...sa.matchAll(/href="\/(masonry-[a-z-]+-(?:ma|ri|nh|me|ct))\//g)].map((m) => m[1]),
  )
  for (const d of onDisk) {
    if (!linked.has(d)) problems.push(`service-area: /${d}/ is not linked — orphan`)
  }

  console.log(`${checked} town pages checked`)
  if (!problems.length) {
    console.log('clean')
    return
  }
  console.log(`${problems.length} problem(s):`)
  for (const p of problems) console.log(`  ${p}`)
  process.exit(1)
}

main()
