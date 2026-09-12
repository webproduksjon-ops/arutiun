#!/usr/bin/env python3
from pathlib import Path
import json
from xml.sax.saxutils import escape
root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "route-manifest.json").read_text(encoding="utf-8"))
base = manifest["canonical_host"].rstrip("/")
urls = []
for name in manifest["indexable_core"]:
    path = root / name
    if not path.exists(): raise SystemExit(f"missing indexable route: {name}")
    urls.append(base + ("/" if name == "index.html" else f"/{name}"))
for article in sorted((root / "materialy").glob("*.html")):
    urls.append(base + "/materialy/" + article.name)
lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
lines += [f"  <url><loc>{escape(url)}</loc></url>" for url in urls]
lines.append('</urlset>')
(root / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"generated {len(urls)} URLs")
