#!/usr/bin/env python3
from pathlib import Path
import json
import sys

root = Path(__file__).resolve().parents[1]
offer = json.loads((root / 'content/offer.json').read_text(encoding='utf-8'))
display = offer['display']
required = ['index.html', 'format.html', 'diagnostic.html', 'contact.html']
errors=[]
for name in required:
    text=(root/name).read_text(encoding='utf-8')
    if display not in text:
        errors.append(f'{name}: missing canonical offer string')
for path in sorted((root/'materialy').glob('*.html')):
    text=path.read_text(encoding='utf-8')
    if 'class="hero-cta' not in text or 'diagnostic.html' not in text:
        errors.append(f'{path.relative_to(root)}: missing article hero conversion action')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'offer contract passed: {display}; {len(required)} commercial routes and {len(list((root / "materialy").glob("*.html")))} articles checked')
