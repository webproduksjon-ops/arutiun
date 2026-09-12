# Conversion measurement plan

The static site now emits conversion events into `window.dataLayer` and as `arutiun:conversion` browser events. A future analytics provider can consume these events without changing the page markup.

| Event | Meaning | Main decision |
| --- | --- | --- |
| `arutiun_diagnostic_cta_click` | Visitor clicks a diagnostic-meeting link | Which page creates intent? |
| `arutiun_mobile_diagnostic_cta_click` | Visitor clicks the mobile sticky CTA | Does persistent mobile access improve conversion? |
| `arutiun_telegram_click` | Visitor opens Telegram | How many visitors prefer direct messaging? |
| `arutiun_form_start` | Visitor focuses the first form field | How many visitors begin the form? |
| `arutiun_form_error` | Browser validation blocks submission | Which fields create friction? |
| `arutiun_form_submit` | Visitor submits the form | Which page and device produced a lead? |

The site does not currently send these events to an external analytics vendor. Connect them only after choosing a privacy-appropriate analytics setup and documenting the corresponding privacy notice. A qualified lead remains a business outcome that should be reconciled with actual messages or submissions, not inferred from clicks alone.
