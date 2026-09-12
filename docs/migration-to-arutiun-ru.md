# Migration checklist: GitHub Pages to arutiun.ru

The current public site uses `https://webproduksjon-ops.github.io/arutiun` as its canonical host. The future production host is configured in `site-seo.json` as `https://arutiun.ru`. The migration must preserve the existing paths wherever possible.

## Required order

1. Deploy the same HTML paths on `arutiun.ru`, including the root page, core service pages, `materialy.html`, and `materialy/*.html` articles.
2. Change `canonical_host` in `site-seo.json` to `https://arutiun.ru`.
3. Regenerate `sitemap.xml` and update `robots.txt` so the sitemap points to `https://arutiun.ru/sitemap.xml`.
4. Keep the old GitHub Pages URLs reachable long enough to return permanent redirects to the matching production URLs.
5. Submit the new sitemap in Google Search Console and inspect the homepage, service pages, and every article with URL Inspection.
6. Confirm that the new pages use the production canonical URL, the production Open Graph URL, and the production structured-data URLs.
7. Keep the GitHub Pages repository as the deployment source until Search Console shows the new URLs indexed and the old URLs replaced.

## Route map

The route map is intentionally one-to-one. No page should be renamed during the domain move unless a redirect is added at the same time.

| Current path | Production path | Action |
| --- | --- | --- |
| `/arutiun/` | `/` | Permanent redirect |
| `/arutiun/entrepreneurs.html` | `/entrepreneurs.html` | Preserve path |
| `/arutiun/individual.html` | `/individual.html` | Preserve path |
| `/arutiun/approach.html` | `/approach.html` | Preserve path |
| `/arutiun/about.html` | `/about.html` | Preserve path |
| `/arutiun/diagnostic.html` | `/diagnostic.html` | Preserve path |
| `/arutiun/format.html` | `/format.html` | Preserve path |
| `/arutiun/online.html` | `/online.html` | Preserve path |
| `/arutiun/materialy.html` | `/materialy.html` | Preserve path |
| `/arutiun/materialy/{slug}.html` | `/materialy/{slug}.html` | Preserve path |

The migration is not complete until forms, Telegram links, robots, sitemap, canonical tags, structured data, and analytics all refer to the production environment.
