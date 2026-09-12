#!/usr/bin/env python3
from pathlib import Path
import json
from xml.sax.saxutils import escape

root = Path(__file__).resolve().parents[1]
config = json.loads((root / "site-seo.json").read_text(encoding="utf-8"))
base = config["canonical_host"].rstrip("/")
core = ['index.html', 'entrepreneurs.html', 'individual.html', 'approach.html', 'about.html', 'kasuti.html', 'video.html', 'cases.html', 'diagnostic.html', 'contact.html', 'materialy.html', 'online.html']
urls = []
for name in core:
    path = root / name
    text = path.read_text(encoding="utf-8", errors="ignore")
    if 'name="robots" content="noindex' in text:
        continue
    rel = "/" if name == "index.html" else f"/{name}"
    urls.append(base + rel)
lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for url in urls:
    lines.append(f"  <url><loc>{escape(url)}</loc></url>")
lines.append('</urlset>')
(root / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"generated {len(urls)} URLs")
