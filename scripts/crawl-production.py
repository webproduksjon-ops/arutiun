#!/usr/bin/env python3
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin
import json, re, sys
root=Path(__file__).resolve().parents[1]
base=(sys.argv[1].rstrip('/') if len(sys.argv)>1 else 'https://arutiun.ru')+'/'
manifest=json.loads((root/'route-manifest.json').read_text(encoding='utf-8'))
routes=list(manifest['indexable_core'])+list(manifest['legal_noindex'])
articles=sorted(p.name for p in (root/'materialy').glob('*.html')); routes += [f'materialy/{x}' for x in articles]
errors=[]
for route in routes:
    url=urljoin(base,route)
    try:
        body=urlopen(Request(url,headers={'User-Agent':'Arutiun-Release-E-Crawler'}),timeout=20).read().decode('utf-8','ignore')
    except Exception as exc: errors.append(f'{route}: {exc}'); continue
    if not re.search(r'<title>\s*[^<]+</title>',body,re.I): errors.append(f'{route}: missing title')
    if not re.search(r'<h1\b[^>]*>.*?</h1>',body,re.I|re.S): errors.append(f'{route}: missing H1')
    if route in manifest['indexable_core'] or route.startswith('materialy/'):
        canonical=re.search(r'<link rel="canonical" href="([^"]+)"',body)
        if not canonical or not canonical.group(1).startswith(base.rstrip('/')): errors.append(f'{route}: canonical host mismatch')
        if route.startswith('materialy/') and 'BreadcrumbList' not in body: errors.append(f'{route}: missing breadcrumbs')
if errors: print('\n'.join(errors)); raise SystemExit(1)
print(f'production crawl passed: {len(routes)} routes checked at {base}')
