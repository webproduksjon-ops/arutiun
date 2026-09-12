# arutiun.ru

Source code and assets for the **arutiun.ru** website. The current public build is a static multi-page site published at https://webproduksjon-ops.github.io/arutiun/.

## Page architecture

The site is organized into focused page-level routes rather than one long page:

| Page | File |
|---|---|
| Home | `index.html` |
| Entrepreneurs and leaders | `entrepreneurs.html` |
| Individual psychotherapy | `individual.html` |
| Approach and methods | `approach.html` |
| About and qualifications | `about.html` |
| “К СУТИ” program | `kasuti.html` |
| Video and ideas | `video.html` |
| Reviews and cases | `cases.html` |
| Diagnostic meeting | `diagnostic.html` |
| Contacts | `contact.html` |

The original dark-green/neon-green palette, Gilroy font files, corner treatments, image library, legal pages, and legacy form handlers are retained. `assets/css/multipage.css` adds only the layout and responsive behavior needed by the new page architecture.

## Hosting requirements

The site contains PHP handlers for consultation and review forms, so it must be hosted on a PHP-capable web server for those forms to submit successfully. GitHub Pages serves the static multi-page UI but cannot execute the PHP handlers.

## Server configuration

Set these environment variables in the hosting environment rather than committing credentials to Git:

| Variable | Required | Purpose |
|---|---:|---|
| `ARUTIUN_RECAPTCHA_SECRET` | Yes | Server-side Google reCAPTCHA verification |
| `ARUTIUN_TELEGRAM_TOKEN` | No | Telegram bot token for notifications |
| `ARUTIUN_TELEGRAM_CHAT_ID` | No | Destination chat for Telegram notifications |
| `ARUTIUN_ENABLE_EMAIL` | No | Allows email notifications; defaults to `true` |
| `ARUTIUN_EMAIL_TO` | No | Notification recipient; required to activate email |
| `ARUTIUN_EMAIL_FROM` | No | Sender address; required to activate email |

Email and Telegram notifications are disabled automatically unless their required variables are set.

## SEO and future text pages

The repository now keeps site-wide SEO settings in `site-seo.json`, future editorial source files in `content/pages/`, and migration mappings in `redirects.json`. Use `python3 scripts/create-text-page.py <slug> <title> <description>` to scaffold a new Markdown page without copying a full HTML document. The scaffold is intentionally unpublished until its content, author, links, and ethical review are complete.

Run `python3 scripts/generate-sitemap.py` after approving indexable routes. Run `python3 scripts/validate-seo.py` before deployment; it checks the ten approved core routes for titles, descriptions, canonicals, one H1, local link targets, and valid sitemap XML. The current build also supplies Open Graph metadata, Twitter Card metadata, Person/Breadcrumb JSON-LD, and crawl policies for legal and error pages.

The current GitHub Pages hostname remains the canonical origin in `site-seo.json` until the production domain is configured. Before moving to `arutiun.ru`, change the canonical origin, regenerate the sitemap, update robots and social URLs, preserve existing paths, and implement direct server-side redirects for any changed URLs.

## Security

Do not commit `.env` files, bot tokens, reCAPTCHA secrets, or production credentials. If credentials have previously been shared or published, rotate them with the relevant provider before deploying.
