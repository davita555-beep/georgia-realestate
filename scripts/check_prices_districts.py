import json, pathlib, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = pathlib.Path(__file__).resolve().parent.parent
prices = json.loads((ROOT / "data" / "prices.json").read_text(encoding="utf-8"))

for name in ("საბურთალო", "ვაკე"):
    entry = prices.get(name)
    if not entry:
        print(f"{name}: NOT FOUND in prices.json")
        continue
    print(f"\n=== {name} ===")
    print(f"  sample_size : {entry.get('sample_size')}")
    print(f"  price_per_sqm: {entry.get('price_per_sqm')}")
    bc = entry.get("by_condition", {})
    print(f"  by_condition ({len(bc)} keys):")
    for k, v in bc.items():
        print(f"    {k}: ${v['price_per_sqm']}/m²  n={v['sample_size']}")
    bp = entry.get("by_project", {})
    print(f"  by_project ({len(bp)} keys):")
    for k, v in bp.items():
        print(f"    {k}: ${v['price_per_sqm']}/m²  n={v['sample_size']}")
