# vercel.json

Inert until phaora.com's DNS points at Vercel — the site is served by GitHub Pages today, which cannot proxy, so the homepage links to crm.phaora.com directly. On the day the domain moves, these rewrites put every public surface on one hostname and those absolute links become relative paths in one commit.

## Why the explanation lives here and not in the file

`vercel.json` is validated against Vercel's own schema, which rejects any
property it does not define. The `"//"` key that used to hold this note is the
usual JSON comment trick, and it failed every deploy of this project with:

    The `vercel.json` schema validation failed with the following message:
    should NOT have additional property `//`

That did not matter while phaora.com was served by GitHub Pages — but it would
have, on the day the domain moved and this file finally had a job to do.

## Trailing slashes on /portfolio and /estimate

GitHub Pages sent `/portfolio` to `/portfolio/` on its own; Vercel serves the
folder's `index.html` at `/portfolio` as is. Those pages load their photos by
relative path (`images/…`), which from `/portfolio` resolves to `/images/…` and
404s: every photo in the portfolio emails went blank. The redirects send
`/portfolio`, `/portfolio/<job>` and `/estimate` to the slash form, which is
the URL the pages were written for. `trailingSlash` is not set site-wide
because it would also add a slash to the paths rewritten to crm.phaora.com,
whose Next.js app strips it again.

## phaora.com is the house; the landscaping site is phaoralandscape.com

phaoralandscape.com is attached to the canon-crm project, which proxies every
path to this deployment. Its origin must be **https://phaora.vercel.app** (this
project's production alias), not www.phaora.com: every landscaping path on host
`(www.)?phaora.com` now 308s to the same path on https://phaoralandscape.com, so
a proxy reading from www.phaora.com would loop.

- Redirected (host phaora.com only): `/home-landscape.html` and
  `/index.newdesign.html` (to the landscape root), `/masonry-*`, the service
  folders, `/service-area`, `/estimate`, `/hardscape-index`, `/portfolio`,
  `/projects`, `/hs`, `/uploads`, `/partners`, `/blog`, `/journal`, the old
  `/quote` and referral aliases, `gallery.html`, `hardscape-gallery.html`,
  `contact.html`, `llms.txt`.
- Not redirected: `/assets`, `/tag.js`, `/api/*`, `/_next/*` and the CRM short
  links (`/l /a /r /rate /p /m`) — shared or not indexed, and redirecting a POST
  to another host breaks forms.
- Sitemaps: Vercel serves a file on disk before any rewrite, so there is no
  `sitemap.xml` or `robots.txt` file. `/sitemap.xml` and `/robots.txt` rewrite
  by host: phaoralandscape.com and phaora.vercel.app get
  `landscape-sitemap.xml` / `robots-landscape.txt`; everything else gets
  `sitemap-house.xml` / `robots-house.txt`. The town and service generators
  write to `landscape-sitemap.xml`.
