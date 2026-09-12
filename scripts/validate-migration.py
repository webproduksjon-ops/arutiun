#!/usr/bin/env python3
from pathlib import Path
import json
import re
import sys

root = Path(__file__).resolve().parents[1]
config = json.loads((root / 'site-seo.json').read_text(encoding='utf-8'))
current = config['canonical_host'].rstrip('/')
future = config['future_host'].rstrip('/')
errors = []

if not current.startswith('https://') or not future.startswith('https://'):
    errors.append('canonical_host and future_host must use HTTPS')
if current == future:
    errors.append('canonical_host and future_host must remain distinct until migration')

approved = {'index.html', 'entrepreneurs.html', 'individual.html', 'approach.html', 'about.html', 'kasuti.html', 'video.html', 'cases.html', 'diagnostic.html', 'contact.html', 'materialy.html', 'online.html', 'format.html'}
for page in sorted(root / name for name in approved):
    text = page.read_text(encoding='utf-8', errors='ignore')
    if 'noindex' in text:
        continue
    canonical = re.search(r'<link rel="canonical" href="([^"]+)"', text)
    if not canonical:
        errors.append(f'{page.name}: missing canonical URL')
    elif not canonical.group(1).startswith(current):
        errors.append(f'{page.name}: canonical does not use current canonical_host')

robots = (root / 'robots.txt').read_text(encoding='utf-8')
if f'Sitemap: {current}/sitemap.xml' not in robots:
    errors.append('robots.txt sitemap does not match canonical_host')

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'migration configuration passed: current={current}, future={future}')
