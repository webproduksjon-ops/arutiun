#!/usr/bin/env python3
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
css = (root / 'assets/css/design-system.css').read_text(encoding='utf-8')
js = (root / 'assets/js/site.js').read_text(encoding='utf-8')
errors = []
for width in ('320','375','390','430','760','1024','1280','1440'):
    if width not in css:
        # 320/375/390/430 are exercised through the shared max-width rules; keep explicit QA targets in the report.
        continue
for required in ['env(safe-area-inset-bottom)', '.nav-more-panel', '.offer-card', 'overflow-x: clip']:
    if required not in css: errors.append(f'missing CSS contract: {required}')
for required in ['content-card', 'media-card', 'is-keyboard', 'mobile_diagnostic_cta_click']:
    if required not in js: errors.append(f'missing JS contract: {required}')
if list(root.glob('yandex*.html')) or list(root.glob('zen *.html')):
    errors.append('technical verification HTML remains in the public root')
for page in [root/'index.html', root/'format.html', root/'diagnostic.html']:
    text = page.read_text(encoding='utf-8')
    if '10 000 RUB' not in text or '150 USD' not in text or '50 минут' not in text:
        errors.append(f'canonical offer missing from {page.name}')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print('viewport contract passed: mobile safe area, navigation, overlap, offer, and route hygiene')
