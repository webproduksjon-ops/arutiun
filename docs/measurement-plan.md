# Conversion measurement plan

The static site emits privacy-safe events into `window.dataLayer` and as `arutiun:conversion` browser events. The site does not send names, contact details, form text, ages, cities, or issue selections to analytics.

| Event | Meaning | Dimensions |
| --- | --- | --- |
| `arutiun_diagnostic_cta_click` | Visitor clicks a diagnostic-meeting link | route, device |
| `arutiun_mobile_diagnostic_cta_click` | Visitor clicks the mobile sticky CTA | route, device |
| `arutiun_telegram_click` | Visitor opens Telegram | route, device |
| `arutiun_form_start` | Visitor focuses the first form field | route, device |
| `arutiun_form_error` | Browser validation blocks submission | route, device, field name only |
| `arutiun_form_submit` | Visitor submits the form to the server | route, device |
| `arutiun_form_success` | The server returns the exact success response | route, device |
| `arutiun_form_server_error` | The server returns a non-success response | route, device |
| `arutiun_form_network_error` | The submission request fails at the network layer | route, device |
| `arutiun_menu_open` | Visitor opens the navigation | route, device |
| `arutiun_menu_close`, `arutiun_menu_close_outside`, `arutiun_menu_close_escape` | Visitor dismisses navigation | route, device |

## Qualified contacts

A qualified contact is a business outcome, not something the public browser can infer safely. Reconcile successful form submissions and Telegram conversations in the private operational record. If a future analytics system needs a qualified-contact count, import an aggregate weekly number or fire a manually controlled event without personal identifiers.

## Responsible system and retention

The site currently provides the event layer only. The future analytics destination must be selected by the owner, configured with IP anonymization where available, and documented in the privacy policy before activation. Retain aggregate conversion data only as long as it supports business decisions; do not retain raw form content in analytics.

## QA

Events must fire once per meaningful action. Before connecting an analytics vendor, inspect the browser event stream on the diagnostic page and confirm that no payload contains personal form values.
