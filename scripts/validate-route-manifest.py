#!/usr/bin/env python3
from pathlib import Path
import json, sys
root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "route-manifest.json").read_text(encoding="utf-8"))
known = set(manifest["indexable_core"] + manifest["legal_noindex"] + manifest["technical_noindex"])
for p in (root / "materialy").glob("*.html"): known.add(p.relative_to(root).as_posix())
html = {p.relative_to(root).as_posix() for p in root.rglob("*.html") if ".git" not in p.parts}
unknown = sorted(html - known)
missing = sorted(known - html)
if unknown: print("unclassified HTML:", ", ".join(unknown))
if missing: print("missing classified HTML:", ", ".join(missing))
if unknown or missing: sys.exit(1)
print(f"route manifest valid: {len(html)} HTML routes classified")
