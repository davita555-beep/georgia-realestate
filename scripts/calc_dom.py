#!/usr/bin/env python3
"""
Reads data/listings.json and writes data/dom_summary.json.

Output: per-district average, median, and sample-size for days-on-market,
split by listing_type (sale / rent). Only active listings are included —
their DOM clock is still ticking so they represent the current market.
"""

import json
import statistics
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
LISTINGS_FILE = DATA_DIR / "listings.json"
DOM_SUMMARY_FILE = DATA_DIR / "dom_summary.json"


def main() -> None:
    if not LISTINGS_FILE.exists():
        print(f"listings.json not found at {LISTINGS_FILE}")
        return

    store = json.loads(LISTINGS_FILE.read_text(encoding="utf-8"))
    listings = store.get("listings", {})

    today = datetime.now(timezone.utc).date()

    # Collect DOM grouped by (district, listing_type) for active listings.
    # Use stored dom_days when present; fall back to computing from first_seen
    # so entries written before this field was added are still included.
    groups: dict[tuple[str, str], list[int]] = defaultdict(list)
    skipped = 0

    for key, entry in listings.items():
        if entry.get("status") != "active":
            continue
        # New schema uses subdistrict_name_ka; old schema uses district
        district = entry.get("subdistrict_name_ka") or entry.get("district")
        # New schema: derive from href (iyideba=sale, iqiraveba=rent)
        # Old schema: listing_type field, or key prefix (sale_/rent_)
        lt = entry.get("listing_type")
        if not lt:
            href = entry.get("href") or ""
            if "iyideba" in href:
                lt = "sale"
            elif "iqiraveba" in href:
                lt = "rent"
            elif isinstance(key, str) and key.startswith("sale_"):
                lt = "sale"
            elif isinstance(key, str) and key.startswith("rent_"):
                lt = "rent"
        if not district or not lt or district.startswith("#ID-"):
            skipped += 1
            continue
        dom = entry.get("dom_days")
        if dom is None:
            try:
                first = datetime.strptime(entry["first_seen"], "%Y-%m-%d").date()
                dom = (today - first).days
            except (KeyError, ValueError):
                skipped += 1
                continue
        groups[(district, lt)].append(dom)

    # Build summary sorted alphabetically by district name.
    districts: dict[str, dict] = {}
    for (district, lt), days in sorted(groups.items(), key=lambda x: x[0][0]):
        if district not in districts:
            districts[district] = {}
        districts[district][lt] = {
            "avg_dom": round(sum(days) / len(days), 1),
            "median_dom": int(statistics.median(days)),
            "sample_size": len(days),
        }

    payload = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "total_active_listings": sum(len(v) for v in groups.values()),
        "districts": districts,
    }

    DOM_SUMMARY_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    n_sale = sum(1 for (_, lt) in groups if lt == "sale")
    n_rent = sum(1 for (_, lt) in groups if lt == "rent")
    print(
        f"Wrote {len(districts)} districts ({n_sale} with sale data, "
        f"{n_rent} with rent data) to {DOM_SUMMARY_FILE.name}"
    )
    if skipped:
        print(f"  Skipped {skipped} active listings missing district/dom_days")


if __name__ == "__main__":
    main()
