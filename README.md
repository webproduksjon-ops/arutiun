# arutiun.ru

Source code and assets for the **arutiun.ru** website.

## Hosting requirements

The site contains PHP handlers for consultation and review forms, so it must be hosted on a PHP-capable web server. GitHub Pages can serve the static files but cannot execute the PHP handlers.

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

## Security

Do not commit `.env` files, bot tokens, reCAPTCHA secrets, or production credentials. If credentials have previously been shared or published, rotate them with the relevant provider before deploying.
