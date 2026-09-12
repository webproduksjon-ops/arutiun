#!/usr/bin/env python3
from pathlib import Path
import re, sys
root=Path(__file__).resolve().parents[1]
site=(root/'assets/js/site.js').read_text(encoding='utf-8')
reviews=(root/'assets/js/reviews.js').read_text(encoding='utf-8')
doc=(root/'docs/measurement-plan.md').read_text(encoding='utf-8')
required=['menu_open','menu_close_outside','menu_close_escape','diagnostic_cta_click','telegram_click','form_start','form_error','form_submit','form_success','form_server_error','form_network_error']
errors=[]
for event in required:
    if event not in site and event not in reviews: errors.append(f'missing event hook: {event}')
if 'window.location.pathname' not in site or 'device:' not in site: errors.append('event payload lacks route/device dimensions')
if 'userName' in site or 'userProblem' in site or 'whatsappPhone' in site or 'telegramUsername' in site: errors.append('site.js must not send personal form values')
for event in required:
    if event not in doc: errors.append(f'measurement plan missing {event}')
if 'Qualified contacts' not in doc: errors.append('measurement plan lacks qualified-contact reconciliation')
if errors: print('\n'.join(errors)); sys.exit(1)
print('measurement contract passed: required events, dimensions, and privacy guardrails present')
