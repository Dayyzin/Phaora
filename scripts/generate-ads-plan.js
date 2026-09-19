#!/usr/bin/env node
/**
 * The Google Ads build, generated from the seven service pages.
 *
 * Paid search is the stated eighty percent of spend and it is the one thing on
 * the list with no build behind it. phaora-ads talks to Meta; there is nothing
 * for Google, and the campaign has been "next" for months because writing four
 * hundred headlines by hand is a day nobody has.
 *
 * Output is a Google Ads Editor import CSV — the real format, so this is
 * pasted into Editor and posted, not retyped.
 *
 * WHAT THIS REFUSES TO WRITE. No price, no year, no square footage, no
 * credential, no "licensed and insured", no "family owned since". Every one of
 * those is a fact about the company that this script does not know, and ad copy
 * is published the moment it is approved. Copy here is built from two things
 * only: the name of the work, and the condition the household is already in.
 *
 * CHARACTER LIMITS ARE ENFORCED, NOT TRUSTED. Google rejects the whole import
 * on a headline of 31 characters and tells you which row afterwards. Everything
 * is measured here and the script exits non-zero rather than emitting a file
 * that fails at 2am.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
// .private/ rather than the repo root. Everything else in this repo is served
// verbatim by Vercel, so an ads/ directory here would publish the entire
// keyword and negative list at phaora.com/ads/ — including the negatives,
// which is the half a competitor would actually want.
const OUT = path.join(ROOT, '.private', 'ads')

const HEADLINE_MAX = 30
const DESC_MAX = 90
const PATH_MAX = 15

/**
 * The seven services, each with the words people actually type.
 *
 * Keywords are phrase and exact only. Broad match on 'patio' against a national
 * corpus spends the budget on above-ground pool liners and patio furniture
 * inside a week — and on a budget this size, a week is the test.
 */
const SERVICES = [
  {
    slug: 'paver-driveways',
    name: 'Paver Driveways',
    // Headlines: the work, the material, the failure it fixes. No claims.
    headlines: [
      'Paver Driveway Installers',
      'Cobblestone Driveways',
      'Belgian Block Driveways',
      'Driveway Rebuilt, Not Paved',
      'Cracked Drive? Fix The Base',
      'Frost-Depth Driveway Base',
      'Paver Driveway Estimate',
      'New England Paver Drives',
      'Apron, Drive And Border',
      'Driveway Base Done Right',
      'Stone Driveway Specialists',
    ],
    descriptions: [
      'Paver and cobblestone driveways built on a base sized for vehicle load and frost.',
      'An overlay on a failed base cracks again. We rebuild what is under it.',
      'Belgian block borders, cobble aprons, full driveway replacement. Instant estimate online.',
      'Serving the Massachusetts, Rhode Island, Connecticut, New Hampshire and Maine coast.',
    ],
    keywords: [
      'paver driveway', 'paver driveway installation', 'cobblestone driveway',
      'belgian block driveway', 'driveway pavers', 'paver driveway contractor',
      'brick driveway', 'driveway replacement', 'stone driveway',
      'cobblestone apron', 'paver driveway cost',
    ],
  },
  {
    slug: 'retaining-walls',
    name: 'Retaining Walls',
    headlines: [
      'Retaining Wall Builders',
      'Stone Retaining Walls',
      'Segmental Block Walls',
      'Failing Wall? Rebuild It',
      'Engineered Retaining Walls',
      'Retaining Wall Estimate',
      'Bulging Wall Replacement',
      'Drainage Behind The Wall',
      'Dry Stack Stone Walls',
      'Wall And Grade Together',
      'New England Wall Builders',
    ],
    descriptions: [
      'Retaining walls built with the drainage and base a New England winter demands.',
      'A wall that leans or bulges has failed behind it. We rebuild, not reface.',
      'Natural stone, segmental block and poured wall construction. Instant estimate online.',
      'Serving the Massachusetts, Rhode Island, Connecticut, New Hampshire and Maine coast.',
    ],
    keywords: [
      'retaining wall', 'retaining wall contractor', 'retaining wall installation',
      'stone retaining wall', 'block retaining wall', 'retaining wall repair',
      'segmental retaining wall', 'retaining wall builder', 'garden wall',
      'retaining wall cost',
    ],
  },
  {
    slug: 'patios',
    name: 'Patios',
    headlines: [
      'Paver Patio Installers',
      'Bluestone Patios',
      'Natural Stone Patios',
      'Patio Design And Build',
      'Patio Around The Pool',
      'Paver Patio Estimate',
      'Fire Pit And Sitting Wall',
      'Travertine Pool Decks',
      'Patio Built On A Real Base',
      'New England Patio Builders',
      'Outdoor Living Masonry',
    ],
    descriptions: [
      'Paver, bluestone and natural stone patios built on a base that holds through frost.',
      'Pool coping, aprons and decks. The work that finishes a pool installation.',
      'Sitting walls, fire pits, steps and grading, designed as one. Instant estimate online.',
      'Serving the Massachusetts, Rhode Island, Connecticut, New Hampshire and Maine coast.',
    ],
    keywords: [
      'paver patio', 'patio installation', 'bluestone patio', 'stone patio',
      'patio contractor', 'paver patio installer', 'backyard patio',
      'pool patio', 'pool deck pavers', 'travertine patio', 'patio builder',
      'outdoor patio contractor',
    ],
  },
  {
    slug: 'walkways-and-steps',
    name: 'Walkways & Steps',
    headlines: [
      'Walkway And Step Builders',
      'Granite Steps Installed',
      'Bluestone Front Steps',
      'Settled Steps Rebuilt',
      'Front Walk Replacement',
      'Walkway Estimate Online',
      'Stone Steps And Landings',
      'Paver Walkway Installers',
      'Steps That Stop Moving',
      'Entry Walk And Stair Work',
      'Cobble And Bluestone Walks',
    ],
    descriptions: [
      'Granite and bluestone steps set on a base that stops the settling from returning.',
      'Front walks, entry landings and stairs rebuilt to a proper depth and pitch.',
      'Paver, cobble and natural stone walkways. Instant estimate online.',
      'Serving the Massachusetts, Rhode Island, Connecticut, New Hampshire and Maine coast.',
    ],
    keywords: [
      'walkway installation', 'paver walkway', 'stone walkway', 'granite steps',
      'bluestone steps', 'front steps replacement', 'stone steps contractor',
      'walkway contractor', 'front walkway pavers', 'step repair masonry',
    ],
  },
  {
    slug: 'stone-veneer',
    name: 'Stone Veneer',
    headlines: [
      'Stone Veneer Masons',
      'Natural Stone Veneer',
      'Foundation Veneer Work',
      'Chimney And Column Stone',
      'Veneer Over Block Or Brick',
      'Stone Veneer Estimate',
      'Fieldstone Veneer Facing',
      'Pillar And Post Stonework',
      'Exterior Stone Facing',
      'New England Stone Masons',
      'Full Bed Stone Veneer',
    ],
    descriptions: [
      'Natural and full bed stone veneer over foundations, chimneys, columns and piers.',
      'Fieldstone, granite and ledgestone facing laid by hand, not stuck to a panel.',
      'Foundation skirts, entry columns and chimney rebuilds. Instant estimate online.',
      'Serving the Massachusetts, Rhode Island, Connecticut, New Hampshire and Maine coast.',
    ],
    keywords: [
      'stone veneer', 'stone veneer installation', 'natural stone veneer',
      'stone veneer contractor', 'foundation stone veneer', 'chimney stone veneer',
      'fieldstone veneer', 'stone mason', 'exterior stone veneer',
      'ledgestone veneer',
    ],
  },
  {
    slug: 'drainage',
    name: 'Drainage',
    headlines: [
      'Yard Drainage Contractors',
      'French Drain Installation',
      'Wet Yard? Drain It',
      'Standing Water Solutions',
      'Regrade And Drain To Daylight',
      'Drainage Estimate Online',
      'Swale And Catch Basin Work',
      'Water Away From The House',
      'Soggy Lawn Drainage Fix',
      'Driveway Runoff Control',
      'Drainage And Grading',
    ],
    descriptions: [
      'French drains, swales, catch basins and regrading that move water to daylight.',
      'A corner of the lawn that never dries is a grade and soil problem, and it is fixable.',
      'Water off the drive, away from the foundation and out of the yard. Instant estimate.',
      'Serving the Massachusetts, Rhode Island, Connecticut, New Hampshire and Maine coast.',
    ],
    keywords: [
      'yard drainage', 'french drain', 'french drain installation',
      'drainage contractor', 'standing water in yard', 'yard regrading',
      'catch basin installation', 'lawn drainage', 'drainage solutions',
      'wet yard fix', 'downspout drainage',
    ],
  },
  {
    slug: 'seawalls-and-shore-protection',
    name: 'Seawalls & Shore Protection',
    headlines: [
      'Seawall Builders',
      'Seawall Repair And Rebuild',
      'Stone Revetment Work',
      'Riprap And Toe Armour',
      'Coastal Bank Stabilization',
      'Shoreline Protection Work',
      'Bulkhead Replacement',
      'Erosion Behind The Wall',
      'Waterfront Stone Work',
      'Seawall Estimate Online',
      'Storm Damage Shore Repair',
    ],
    descriptions: [
      'Seawall rebuild, stone revetment, toe armour and bulkhead replacement.',
      'When the ground behind the wall goes first, the wall is already failing.',
      'Coastal bank stabilization and shoreline protection on the New England coast.',
      'Serving the Massachusetts, Rhode Island, Connecticut, New Hampshire and Maine coast.',
    ],
    keywords: [
      'seawall contractor', 'seawall repair', 'seawall construction',
      'stone revetment', 'riprap installation', 'shoreline stabilization',
      'coastal erosion repair', 'bulkhead replacement', 'waterfront masonry',
      'sea wall builder', 'shore protection contractor',
    ],
  },
]

/**
 * Negative keywords, shared across every campaign.
 *
 * This list is the difference between a working budget and a burned one. 'Patio
 * furniture' and 'patio heater' will outbid everything on volume; 'diy',
 * 'how to' and 'jobs' are people who will never buy; 'cost calculator' is
 * research traffic that clicks and leaves.
 */
const NEGATIVES = [
  'furniture', 'heater', 'umbrella', 'cushions', 'set', 'chairs', 'table',
  'diy', 'how to', 'do it yourself', 'tutorial', 'youtube', 'video',
  'jobs', 'hiring', 'salary', 'career', 'apprentice', 'union',
  'free', 'cheap', 'used', 'rental', 'rent',
  'home depot', 'lowes', 'menards', 'amazon',
  'calculator', 'software', 'course', 'school', 'certification', 'license test',
  'pool installation', 'above ground pool', 'pool liner',
  'asphalt', 'blacktop', 'sealcoating', 'concrete pouring',
  'insurance', 'lawsuit', 'permit application',
  'wikipedia', 'definition', 'meaning',
]

/** Sitewide keywords that should never be paired with a location we do not serve. */
const STATES = ['Massachusetts', 'Rhode Island', 'Connecticut', 'New Hampshire', 'Maine']

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function csv(rows) {
  return rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n'
}

/** Every limit Google enforces, enforced here instead of at import time. */
function validate() {
  const problems = []
  for (const s of SERVICES) {
    if (s.headlines.length < 3) problems.push(`${s.slug}: needs at least 3 headlines`)
    if (s.descriptions.length < 2) problems.push(`${s.slug}: needs at least 2 descriptions`)
    for (const h of s.headlines) {
      if (h.length > HEADLINE_MAX) problems.push(`${s.slug}: headline ${h.length} chars — "${h}"`)
    }
    for (const d of s.descriptions) {
      if (d.length > DESC_MAX) problems.push(`${s.slug}: description ${d.length} chars — "${d}"`)
    }
    // Path fields are the display URL crumbs; they truncate silently rather
    // than erroring, which is worse.
    const p1 = s.slug.split('-')[0]
    if (p1.length > PATH_MAX) problems.push(`${s.slug}: path1 too long`)
  }
  return problems
}

function build() {
  // Google Ads Editor accepts one wide sheet with a Row Type column. One file
  // rather than six keeps the import a single paste.
  const header = [
    'Campaign', 'Ad Group', 'Keyword', 'Criterion Type', 'Max CPC',
    'Ad Type', 'Headline 1', 'Headline 2', 'Headline 3', 'Headline 4',
    'Headline 5', 'Headline 6', 'Headline 7', 'Headline 8', 'Headline 9',
    'Headline 10', 'Headline 11',
    'Description 1', 'Description 2', 'Description 3', 'Description 4',
    'Final URL', 'Path 1', 'Path 2', 'Campaign Status', 'Ad Group Status', 'Status',
  ]
  const rows = [header]
  const blank = (n) => Array(n).fill('')

  for (const s of SERVICES) {
    const campaign = `Phaora – ${s.name}`
    const group = s.name
    const url = `https://phaora.com/${s.slug}/`

    // Keywords: phrase and exact for each. Broad is left out on purpose — on a
    // starting budget, broad match is a donation.
    for (const k of s.keywords) {
      rows.push([campaign, group, `"${k}"`, 'Phrase', '', ...blank(22)])
      rows.push([campaign, group, `[${k}]`, 'Exact', '', ...blank(22)])
    }

    // Negatives, campaign level.
    for (const n of NEGATIVES) {
      rows.push([campaign, '', n, 'Campaign Negative Broad', '', ...blank(22)])
    }

    // One responsive search ad per group.
    const h = [...s.headlines]
    while (h.length < 11) h.push('')
    const d = [...s.descriptions]
    while (d.length < 4) d.push('')

    rows.push([
      campaign, group, '', '', '',
      'Responsive search ad',
      ...h.slice(0, 11),
      ...d.slice(0, 4),
      url,
      s.slug.split('-')[0].slice(0, PATH_MAX),
      (s.slug.split('-')[1] ?? '').slice(0, PATH_MAX),
      // PAUSED. Nothing this script writes starts spend — the same rule the
      // Meta toolkit runs on, for the same reason.
      'Paused', 'Enabled', 'Enabled',
    ])
  }
  return rows
}

function main() {
  const problems = validate()
  if (problems.length) {
    console.error('Refusing to write — Google would reject the import:')
    for (const p of problems) console.error('  ' + p)
    process.exit(1)
  }

  fs.mkdirSync(OUT, { recursive: true })
  const rows = build()
  const file = path.join(OUT, 'google-ads-import.csv')
  fs.writeFileSync(file, csv(rows))

  const kw = rows.filter((r) => r[3] === 'Phrase' || r[3] === 'Exact').length
  const ads = rows.filter((r) => r[5] === 'Responsive search ad').length
  const negs = rows.filter((r) => r[3] === 'Campaign Negative Broad').length

  console.log(`${file}`)
  console.log(`  ${SERVICES.length} campaigns, ${ads} responsive search ads`)
  console.log(`  ${kw} keywords (phrase + exact), ${negs} negative rows`)
  console.log(`  all campaigns PAUSED — nothing here starts spend`)
  console.log(`  states named in copy: ${STATES.join(', ')}`)
}

main()
