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
