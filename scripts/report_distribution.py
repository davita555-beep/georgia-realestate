"""Print post-migration condition + project_type distribution from listings.json."""
import json, collections, sys, io, pathlib
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((ROOT / "data" / "listings.json").read_text(encoding="utf-8"))
listings = data["listings"]
if isinstance(listings, dict):
    listings = list(listings.values())

total = len(listings)
conditions = collections.Counter(l.get("condition")    for l in listings)
proj_types = collections.Counter(l.get("project_type") for l in listings)

SLUG_COND = {
    "renovated", "white_frame", "green_frame", "black_frame",
    "old_renovation", "needs_renovation", "ongoing_renovation", "cosmetic_renovation",
}
SLUG_PROJ = {
    "non_standard", "khrushchev", "lvov", "moscow", "leningrad", "improved",
    "georgian", "new_project", "aviation", "urban", "czech",
    "tbilisian_courtyard", "kavlashvili", "tukhareli", "kyiv", "metro_construction",
}

def report(label, counter, slug_set):
    print(f"\n=== {label} (post-migration, n={total}) ===")
    for k, v in counter.most_common():
        if k is None:
            tag = "[null] "
        elif k in slug_set:
            tag = "[slug] "
        else:
            tag = "[RAW]  "
        print(f"  {tag} {repr(k)}: {v}")
    slug_n = sum(v for k, v in counter.items() if k in slug_set)
    null_n = counter[None]
    raw_n  = total - slug_n - null_n
    print(f"\n  Slugs : {slug_n:>5}  ({slug_n/total*100:.1f}%)")
    print(f"  Null  : {null_n:>5}  ({null_n/total*100:.1f}%)")
    print(f"  Raw   : {raw_n:>5}  ({raw_n/total*100:.1f}%)")

report("CONDITION",    conditions, SLUG_COND)
report("PROJECT_TYPE", proj_types, SLUG_PROJ)
