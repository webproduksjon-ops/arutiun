#!/usr/bin/env python3
from pathlib import Path
import re, sys
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
failures = []
core = ['index.html', 'entrepreneurs.html', 'individual.html', 'approach.html', 'about.html', 'kasuti.html', 'video.html', 'cases.html', 'diagnostic.html', 'contact.html', 'materialy.html', 'online.html']
pages = [root / name for name in core]
for page in pages:
    text = page.read_text(encoding="utf-8", errors="ignore")
    if not re.search(r"<title>[^<]+</title>", text): failures.append(f"{page.name}: missing title")
    if not re.search(r'<meta name="description" content="[^"]+"', text): failures.append(f"{page.name}: missing description")
    if not re.search(r'<link rel="canonical" href="https://[^"]+"', text): failures.append(f"{page.name}: missing canonical")
    if len(re.findall(r"<h1(?:\s[^>]*)?>", text)) != 1: failures.append(f"{page.name}: expected exactly one h1")
    for href in re.findall(r'href="([^"]+)"', text):
        if href.startswith(("http://", "https://", "#", "mailto:", "tel:", "javascript:")): continue
        target = (page.parent / href.split("#", 1)[0].split("?", 1)[0]).resolve()
        if href and not target.exists(): failures.append(f"{page.name}: missing link target {href}")
try:
    ET.parse(root / "sitemap.xml")
except Exception as exc:
    failures.append(f"sitemap.xml: invalid XML: {exc}")
if failures:
    print("\n".join(failures)); sys.exit(1)
print(f"SEO validation passed for {len(pages)} HTML pages")
