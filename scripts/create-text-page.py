#!/usr/bin/env python3
from pathlib import Path
import re, sys

if len(sys.argv) != 4:
    raise SystemExit("usage: create-text-page.py SLUG TITLE DESCRIPTION")
slug, title, description = sys.argv[1:]
if not re.fullmatch(r"[a-z0-9-]+", slug):
    raise SystemExit("slug must use lowercase latin letters, digits, and hyphens")
path = Path("content/pages") / f"{slug}.md"
if path.exists():
    raise SystemExit(f"already exists: {path}")
path.write_text(f"---\nslug: {slug}\ntitle: {title}\ndescription: {description}\nsection: Работа и лидерство\nroute: entrepreneurs.html\nupdated: 2026-09-12\nindex: false\n---\n\n# {title}\n\nКому посвящён этот материал и какой вопрос он помогает прояснить.\n\n## Основной вопрос\n\nТекст материала.\n\n## Что можно сделать дальше\n\nСсылка на релевантную услугу и диагностическую встречу.\n", encoding="utf-8")
print(path)
