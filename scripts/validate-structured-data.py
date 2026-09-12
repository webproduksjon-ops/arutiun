#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
import json, re, sys

root=Path(__file__).resolve().parents[1]
class TextParser(HTMLParser):
    def __init__(self): super().__init__(); self.text=[]
    def handle_data(self,data): self.text.append(data)

errors=[]
for path in sorted((root/'materialy').glob('*.html')):
    raw=path.read_text(encoding='utf-8')
    scripts=re.findall(r'<script type="application/ld\+json">(.*?)</script>', raw, re.S)
    data=[]
    for item in scripts:
        try: data.append(json.loads(item))
        except Exception as exc: errors.append(f'{path.name}: invalid JSON-LD: {exc}')
    article=next((x for x in data if x.get('@type')=='Article'),None)
    crumb=next((x for x in data if x.get('@type')=='BreadcrumbList'),None)
    parser=TextParser(); parser.feed(raw); visible=' '.join(parser.text)
    if not article: errors.append(f'{path.name}: missing Article schema')
    else:
        if article.get('headline') not in visible: errors.append(f'{path.name}: Article headline not visible')
        if article.get('description') not in visible: errors.append(f'{path.name}: Article description not visible')
        if article.get('mainEntityOfPage','').rstrip('/') not in raw: errors.append(f'{path.name}: Article canonical mismatch')
    if not crumb: errors.append(f'{path.name}: missing BreadcrumbList schema')
    elif len(crumb.get('itemListElement',[])) < 3: errors.append(f'{path.name}: incomplete breadcrumbs')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print(f'structured data passed: {len(list((root / "materialy").glob("*.html")))} editorial pages checked')
