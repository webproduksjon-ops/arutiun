#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "route-manifest.json").read_text(encoding="utf-8"))
known = set(manifest["indexable_core"] + manifest["legal_noindex"] + manifest["technical_noindex"])
for p in (root / "materialy").glob("*.html"): known.add(p.relative_to(root).as_posix())
html = {p.relative_to(root).as_posix() for p in root.rglob("*.html") if ".git" not in p.parts}
errors=[]
for name in sorted(set(manifest["legal_noindex"] + manifest["technical_noindex"])):
    text=(root/name).read_text(encoding="utf-8",errors="ignore")
    if not re.search(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\'][^"\']*noindex', text, re.I): errors.append(f"{name}: missing intentional noindex directive")
for name in manifest["indexable_core"]:
    text=(root/name).read_text(encoding="utf-8",errors="ignore")
    if 'noindex' in text.lower(): errors.append(f"{name}: indexable route contains noindex")
unknown=sorted(html-known); missing=sorted(known-html)
if unknown: errors.append('unclassified HTML: '+', '.join(unknown))
if missing: errors.append('missing classified HTML: '+', '.join(missing))
if errors: print('\n'.join(errors)); sys.exit(1)
print(f'route manifest valid: {len(html)} HTML routes classified with explicit crawl policy')
