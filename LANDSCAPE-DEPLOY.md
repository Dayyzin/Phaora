# Putting phaoralandscape.com live

This branch (`landscape-site`) is the landscaping site as it stood on 1 Nov
2026 (commit `2040bad`, the last version before phaora.com became the
clothing site). Every `phaora.com` page link now points at
`phaoralandscape.com`. The CRM links (`crm.phaora.com`, `admin.phaora.com`)
are unchanged on purpose: those servers stay where they are.

## 1. Vercel: a new project

1. vercel.com → **Add New… → Project** → import **Dayyzin/Phaora**.
2. Project name:
   ```
   phaora-landscape
   ```
3. Framework preset: **Other**. Leave Build Command, Output Directory and
   Install Command empty (it is a plain static site).
4. Deploy. Then **Settings → Git → Production Branch**, set it to:
   ```
   landscape-site
   ```
   and redeploy from that branch (Deployments → the latest `landscape-site`
   deployment → **Promote to Production**).
5. **Settings → Domains → Add**:
   ```
   phaoralandscape.com
   ```
   and then:
   ```
   www.phaoralandscape.com
   ```
   Choose to redirect www to the bare domain.
6. Leave the existing phaora.com project alone. If `phaoralandscape.com` was
   ever added to it, remove it there first: a domain can sit on one project
   only.

## 2. domain.com: DNS

Pick **one** of the two ways.

### Way A: two records (keeps DNS at domain.com)

domain.com → **Domains → phaoralandscape.com → DNS & Nameservers → DNS
Records**. Delete any existing `@` A record and `www` CNAME (domain.com's
parking ones), then add:

A record. Name:
```
@
```
Value:
```
76.76.21.21
```

CNAME record. Name:
```
www
```
Value:
```
cname.vercel-dns.com
```

TTL: the default (1 hour) is fine.

If Vercel's Domains page shows a different value next to the domain (it
sometimes gives a project-specific one), use what Vercel shows.

### Way B: hand DNS to Vercel

domain.com → **DNS & Nameservers → Nameservers** → custom, set to:
```
ns1.vercel-dns.com
```
```
ns2.vercel-dns.com
```
Only do this if no email is set up on phaoralandscape.com yet; any mail
records would have to be re-added in Vercel.

Either way, Vercel's Domains page turns green within minutes to a few hours,
and it issues the HTTPS certificate itself.

## 3. Everything else

1. **Contact form.** `contact.html` posts to
   `crm.phaora.com/api/public/contact`, and the estimator and partner pages
   call the CRM too. If the CRM only accepts requests from `phaora.com`
   (CORS), add this origin to its allowed list:
   ```
   https://phaoralandscape.com
   ```
   Test: send the contact form once on the live site and check the lead lands
   in the CRM.
2. **Email address.** The patio quote page (`projects/patio-v2/`) now emails:
   ```
   hello@phaoralandscape.com
   ```
   Set that up as a forward at domain.com (Email → Forwarding) to your inbox,
   or tell me which address to use instead. The header's "Email us" goes to
   `phaoraco@gmail.com` and needs nothing.
3. **Google.** Add `phaoralandscape.com` in Search Console and submit:
   ```
   https://phaoralandscape.com/sitemap.xml
   ```
   Any Google Ads or Google Business Profile still pointing at phaora.com
   pages should get the phaoralandscape.com address. The ad sheet in
   `tools/ads/town-ads.csv` already uses it.
4. **CRM emails and links.** Portfolio, review and estimate emails sent from
   the CRM (crm.phaora.com, a separate repo) may still link to phaora.com
   pages, which now show the clothing site. Those links live in the CRM's
   code, not here.
5. **The old pages on phaora.com.** The hardscape pages (portfolio, town
   pages, estimate) are still on phaora.com's main branch. Once
   phaoralandscape.com is live you can decide whether phaora.com should
   redirect them here; nothing on main was changed.
