"""Re-run Phase 4 aggregation over the current listings.json without scraping.

Rebuilds by_condition, by_project, renovation_premium_pct, and dom for every
district that already exists in prices.json, then writes prices.json and
public/data/prices.json in-place. Protected fields (name_ka, price_per_sqm,
price_per_sqm_new_build, price_per_sqm_resale, sample_size, updated) are
never touched.
"""
import json, pathlib, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import importlib.util

spec = importlib.util.spec_from_file_location(
    "scrape_prices",
    pathlib.Path(__file__).parent / "scrape_prices.py",
)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

ROOT = pathlib.Path(__file__).resolve().parent.parent
PRICES_FILE      = ROOT / "data" / "prices.json"
PUBLIC_PRICES    = ROOT / "public" / "data" / "prices.json"
LISTINGS_FILE    = ROOT / "data" / "listings.json"

PROTECTED = {"name_ka", "price_per_sqm", "price_per_sqm_new_build",
             "price_per_sqm_resale", "sample_size", "updated"}

prices   = mod.load_json(PRICES_FILE, {})
listings_store = mod.load_json(LISTINGS_FILE, {"listings": {}})
db       = listings_store.get("listings", {})
db_index = mod.build_subdistrict_index(db)

print(f"prices.json   : {len(prices)} districts")
print(f"listings.json : {len(db)} total, "
      f"{sum(1 for e in db.values() if e.get('status')=='active')} active, "
      f"{len(db_index)} named subdistricts")

updated = {}
for district, entry in prices.items():
    if not isinstance(entry, dict):
        updated[district] = entry
        continue
    extras = mod.compute_aggregation_extras(district, db_index)
    new_entry = {**entry}
    # strip old stale aggregation keys before re-applying
    for k in ("by_condition", "by_project", "renovation_premium_pct", "dom"):
        new_entry.pop(k, None)
    new_entry.update(extras)
    updated[district] = new_entry

    bc_keys = list(new_entry.get("by_condition", {}).keys())
    bp_keys = list(new_entry.get("by_project", {}).keys())
    print(f"  {district}: by_condition={bc_keys}  by_project={bp_keys}")

out = json.dumps(updated, ensure_ascii=False, indent=2)
PRICES_FILE.write_text(out, encoding="utf-8")
PUBLIC_PRICES.parent.mkdir(parents=True, exist_ok=True)
PUBLIC_PRICES.write_text(out, encoding="utf-8")
print(f"\nDone. Wrote {len(updated)} districts to prices.json and public/data/prices.json")
