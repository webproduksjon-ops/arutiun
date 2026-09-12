#!/usr/bin/env python3
"""Switch all generated canonical/social/sitemap/robots URLs to a target host."""
from pathlib import Path
import json, sys
root=Path(__file__).resolve().parents[1]
if len(sys.argv) != 2 or not sys.argv[1].startswith('https://'):
    raise SystemExit('usage: switch-canonical-host.py https://arutiun.ru')
host=sys.argv[1].rstrip('/')
config=json.loads((root/'site-seo.json').read_text(encoding='utf-8'))
config['canonical_host']=host
(root/'site-seo.json').write_text(json.dumps(config, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
for name in ('route-manifest.json',):
    p=root/name; data=json.loads(p.read_text(encoding='utf-8')); data['canonical_host']=host; p.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
print(f'canonical host switched to {host}; run build-content.py and generate-sitemap.py next')
