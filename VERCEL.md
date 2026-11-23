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

These pages once loaded their photos by relative path (`images/…`), which needs the slash, so `/portfolio`,
`/portfolio/<job>` and `/estimate` were redirected to the slash form. phaoralandscape.com strips the trailing slash
before the site sees it, so the two redirected each other forever (23 Nov 2026). The pages now use root paths
(`/portfolio/images/…`), the redirects are gone, and rewrites serve each folder's `index.html` with or without the
slash. `trailingSlash` is still not set site-wide: it would add a slash to the paths rewritten to crm.phaora.com.
