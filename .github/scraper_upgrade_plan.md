# Tbilisiprice.ge — Scraper Upgrade Plan

**Goal:** Build a listing-level database (`listings.json`) with DoM, condition, project type, and price-history tracking — without breaking the live site.

**Karpathy principles:** surgical, minimal, goal-driven. One phase at a time. Test between each.

**Frontend safety contract:** `prices.json` must keep these 6 fields exactly:
`name_ka`, `price_per_sqm`, `price_per_sqm_new_build`, `price_per_sqm_resale`, `sample_size`, `updated`

Any new fields are **additive only**.

---

## PHASE 1 — Owner-only filter

**Why:** ss.ge's `individualEntityOnly` filter eliminates agent reposts at the source. Drastically cleaner data, no dedup logic needed.

### Prompt for Claude Code:

```
Phase 1 of a multi-phase scraper upgrade. Surgical change only.

Task: Modify scripts/scrape_prices.py to add the ss.ge "owner only" 
(individualEntityOnly) filter to all listing search URLs.

Reference URL with the filter applied (verified working on ss.ge):
https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba?cityIdList=95&currencyId=1&advancedSearch=%7B%22individualEntityOnly%22%3Atrue%7D

The filter is encoded as a JSON object in the advancedSearch query parameter:
  advancedSearch={"individualEntityOnly":true}
URL-encoded form: advancedSearch=%7B%22individualEntityOnly%22%3Atrue%7D

Required changes:
1. Update BASE_SEARCH_URL (around line 51-54) to include the 
   advancedSearch parameter with individualEntityOnly:true.
2. Use Python's urllib.parse.quote or json.dumps + urlencode so the 
   JSON is properly encoded — do NOT hardcode the %7B%22 string, 
   build it programmatically so it stays maintainable.
3. Verify the URL still includes cityIdList=95, currencyId=1, 
   subdistrictIds={id}, and page={n} — these must all coexist.

Do NOT touch:
- The field extraction logic
- The aggregation logic
- prices.json or history.json schema
- scrape_rents.py (separate phase)

After the edit:
- Print the final composed URL for subdistrict_id=3, page=1 so I can 
  verify it manually.
- Show me the diff of what changed.
```

### Test checkpoint:

```bash
# Run a small test scrape (limit to 1-2 subdistricts for speed)
python scripts/scrape_prices.py
```

**Expected outcome:**
- Scraper runs without errors
- `sample_size` per district will **drop** (because we're filtering out agent reposts) — this is correct
- Listing counts roughly 30-60% lower than before — confirms filter works
- `prices.json` regenerates with same shape, just lower sample sizes

**If sample_size doesn't drop:** filter isn't working. Check URL encoding.

### Commit:
```
git add scripts/scrape_prices.py
git commit -m "scraper: add ss.ge owner-only filter (individualEntityOnly)"
git push
```

---

## PHASE 2 — Extract new fields (in-memory only)

**Why:** Before we persist to disk, make sure we can reliably extract the new fields from ss.ge's HTML. No file writes yet — just print samples.

### Prompt for Claude Code:

```
Phase 2 of scraper upgrade. Still surgical — no persistence changes.

Task: Extend the parsing in scripts/scrape_prices.py to extract NEW 
fields per listing, but DO NOT persist them yet. Just print samples 
so we verify extraction works.

New fields to extract per listing (add to the dict around line 315-320):
  - listing_id        (int — parse from the trailing number in href, 
                       e.g. ".../iyideba-...-30122549" → 30122549)
  - subdistrict_id    (int — pass it through from the outer loop)
  - subdistrict_name_ka (str — pass through if available, else None)
  - area_m2           (float — from "საერთო ფართი 93 მ²" or similar)
  - rooms             (int — from "ოთახი 3")
  - floor             (int — from "სართული 2/11" → 2)
  - total_floors      (int — from "სართული 2/11" → 11)
  - project_type      (str | None — Khrushchovi/Czech/etc; may not be 
                       on every listing card — None is fine)
  - condition         (str | None — black_frame / white_frame / 
                       renovated; from ss.ge's structured field)
  - seller_name       (str | None — for analytics, NOT for dedup)
  - price_assessment  (str | None — ss.ge's "მაღალი ფასი" / "low 
                       price" / "average" badge if present)

Approach:
1. First, INSPECT the HTML structure of ss.ge listing cards. Fetch one 
   page and identify the CSS selectors / patterns for each new field. 
   You may need to fetch a listing detail page if some fields aren't 
   on the search result card.
2. Add extraction logic with try/except around each new field — if 
   extraction fails, set the field to None. NEVER let a missing field 
   crash the scraper.
3. Modify scrape_subdistrict() to pass subdistrict_id and 
   subdistrict_name_ka through to parse_listings_page().
4. After scraping ONE subdistrict (id=3 = Vake), print the first 5 
   listings as JSON so I can see the extracted fields.

Do NOT:
- Write to listings.json (Phase 3)
- Modify prices.json schema (Phase 4)
- Touch scrape_rents.py (Phase 5)

Output: print 5 sample listings + report which fields were 
successfully extracted vs. which returned None for most listings.
```

### Test checkpoint:

Run the scraper. Inspect the printed samples. Look for:
- ✅ `listing_id` populated for all listings
- ✅ `area_m2`, `rooms`, `floor`, `total_floors` populated for most
- ⚠️ `project_type`, `condition` may be None for many listings (those fields aren't always set by sellers — that's OK)
- ✅ `seller_name` populated for most

**If a critical field (area, floor, rooms) returns None for >30% of listings:** the selector is wrong. Iterate.

### Commit:
```
git add scripts/scrape_prices.py
git commit -m "scraper: extract listing-level fields (in-memory only)"
git push
```

---

## PHASE 3 — Introduce listings.json + DoM tracking

**Why:** This is the core architectural change. The scraper goes from stateless to stateful. Every listing ever seen is remembered.

### Prompt for Claude Code:

```
Phase 3 of scraper upgrade. THE BIG ONE.

Task: Add persistent listing-level memory at data/listings.json 
with DoM tracking and price history.

Schema for data/listings.json:
{
  "meta": {
    "last_run": "ISO-8601 datetime",
    "total_listings_ever": int,
    "active_count": int
  },
  "listings": {
    "<listing_id>": {
      "listing_id": int,
      "subdistrict_id": int,
      "subdistrict_name_ka": str,
      "first_seen": "YYYY-MM-DD",
      "last_seen": "YYYY-MM-DD",
      "status": "active" | "delisted",
      "final_dom_days": int | null,   // set when delisted
      "current_price_usd": float,
      "area_m2": float,
      "rooms": int,
      "floor": int,
      "total_floors": int,
      "project_type": str | null,
      "condition": str | null,
      "new_build": bool,
      "seller_name": str | null,
      "price_assessment": str | null,
      "href": str,
      "price_per_sqm": float,
      "price_history": [
        {"date": "YYYY-MM-DD", "price_usd": float}
      ]
    }
  }
}

Logic at end of every scrape run:

1. Load existing data/listings.json if it exists, else start with empty.

2. For each listing scraped this run:
   IF listing_id is NEW (not in listings.json):
     - Add new entry with first_seen=today, last_seen=today, 
       status="active"
     - price_history = [{"date": today, "price_usd": <current_price>}]
   ELSE (listing_id exists):
     - Update last_seen = today
     - status = "active" (in case it was previously delisted and reappeared)
     - IF current_price_usd != stored current_price_usd:
         Append {"date": today, "price_usd": <new_price>} to price_history
         Update current_price_usd
     - Update mutable fields (condition might have changed if seller 
       updated, etc.) — overwrite area_m2, rooms, floor, total_floors, 
       project_type, condition, seller_name, price_assessment

3. For each listing in listings.json that was NOT seen this run:
   IF status == "active":
     - Set status = "delisted"
     - Set final_dom_days = (last_seen - first_seen).days
   IF status == "delisted":
     - Leave it alone (already finalized)

4. Update meta:
   - last_run = now (ISO-8601 UTC)
   - total_listings_ever = len(listings)
   - active_count = count where status == "active"

5. Save data/listings.json (pretty-printed, UTF-8, ensure_ascii=False).

Important details:
- Never delete entries. listings.json grows forever.
- Use atomic write (write to .tmp, then os.replace) to avoid 
  corruption if the scraper crashes mid-write.
- Dates: store as YYYY-MM-DD strings (not full timestamps) for 
  price_history and first/last_seen — this keeps the file compact 
  and human-readable.

Do NOT modify prices.json or history.json this phase. Aggregation 
extension is Phase 4.

After the edit, run the scraper once and report:
- How many new listings were added
- How many were updated
- How many were marked delisted
- Final size of listings.json (in KB)
```

### Test checkpoint:

```bash
# Run scraper
python scripts/scrape_prices.py

# Inspect listings.json
ls -lh data/listings.json
python -c "import json; d=json.load(open('data/listings.json',encoding='utf-8')); print('Total:', len(d['listings'])); print('Active:', d['meta']['active_count']); print('Sample:', list(d['listings'].items())[0])"
```

**Expected outcome:**
- File created
- Total listings = roughly 1000-3000 active (post-filter)
- All listings status="active" on first run (nothing to delist yet)
- File size: probably 2-5 MB

**Run the scraper a SECOND time** (or wait a week and let GitHub Actions run). Verify:
- Same listings: `last_seen` updated, no new price_history entries
- Disappeared listings: `status="delisted"`, `final_dom_days` set
- Truly new listings: appear with `first_seen=today`

### Commit:
```
git add scripts/scrape_prices.py data/listings.json
git commit -m "scraper: persist listing-level memory with DoM + price history"
git push
```

**Note:** The first commit of `listings.json` will be the genesis dataset. From this moment, your DoM clock starts ticking.

---

## PHASE 4 — Extend prices.json additively

**Why:** Surface the new dimensions (condition, project type, DoM, renovation premium) in the aggregated file, WITHOUT breaking the 6 existing fields the live site depends on.

### Prompt for Claude Code:

```
Phase 4 of scraper upgrade. CRITICAL: do not break the live site.

Task: Extend the aggregation in scripts/scrape_prices.py to add new 
fields to prices.json, while keeping all existing fields unchanged.

EXISTING FIELDS THAT MUST STAY (live site reads these):
  name_ka, price_per_sqm, price_per_sqm_new_build, 
  price_per_sqm_resale, sample_size, updated

These fields keep their exact names, types, and meaning. Do not rename, 
do not change formulas, do not remove. The live site has 3 components 
reading them: TickerBar.jsx, SubdistrictPriceChart.jsx, 
ApartmentEstimator.jsx.

NEW FIELDS to ADD per district entry:

  "by_condition": {
    "renovated":   {"price_per_sqm": float, "sample_size": int},
    "white_frame": {"price_per_sqm": float, "sample_size": int},
    "black_frame": {"price_per_sqm": float, "sample_size": int}
  },
  "by_project": {
    "<project_type_slug>": {"price_per_sqm": float, "sample_size": int},
    ...
  },
  "renovation_premium_pct": float | null,
    // = (renovated_avg / non_renovated_avg - 1) * 100, where 
    //   non_renovated_avg averages white_frame + black_frame.
    // null if either side has < 5 listings.
  "dom": {
    "avg_days": float | null,
    "median_days": float | null,
    "sample_size": int
    // computed from active listings in this district read from 
    // listings.json: today - first_seen
  }

Rules:
- Only include "by_condition" entries where sample_size >= 5 (same 
  threshold as elsewhere). If under 5, omit that entry — don't put 
  zeros or nulls.
- Same for "by_project".
- "dom" requires reading listings.json — load it once at start of 
  aggregation.
- If listings.json doesn't exist yet (first run before Phase 3 ran), 
  skip the "dom" field gracefully.
- Use median for "by_condition" / "by_project" prices (consistent 
  with existing scraper behavior).

After the edit, run the scraper and:
1. Diff old prices.json vs new — confirm the 6 existing fields 
   are unchanged in name and value formula.
2. Show 2 sample district entries with the new structure.
3. Confirm the 6 existing fields are at the SAME nesting level as 
   before (top-level inside the district entry, NOT nested under a 
   new key).
```

### Test checkpoint — THIS IS THE RISKY ONE:

```bash
# Backup current prices.json before running
cp data/prices.json data/prices.json.backup

# Run scraper
python scripts/scrape_prices.py

# Compare structure
python -c "
import json
old = json.load(open('data/prices.json.backup', encoding='utf-8'))
new = json.load(open('data/prices.json', encoding='utf-8'))
sample_district = list(new.keys())[0]
print('OLD keys:', sorted(old[sample_district].keys()))
print('NEW keys:', sorted(new[sample_district].keys()))
print('All old keys present in new:', all(k in new[sample_district] for k in old[sample_district].keys()))
"
```

**Critical: All 6 old keys must still be present at the top level.** If not, the live site will break.

**Then test the live site locally:**
```bash
npm run dev
# Open http://localhost:3000
# Verify: TickerBar shows prices, SubdistrictPriceChart renders, 
#         ApartmentEstimator works
```

If anything looks broken, **DO NOT PUSH.** Restore the backup:
```bash
cp data/prices.json.backup data/prices.json
```

### Commit (only after local test passes):
```
git add scripts/scrape_prices.py data/prices.json
git rm data/prices.json.backup  # cleanup
git commit -m "scraper: extend prices.json with by_condition, by_project, dom (additive)"
git push
```

---

## PHASE 5 — Replicate to scrape_rents.py

**Why:** Keep sales and rents data layers consistent. Without this, rentals stay primitive while sales data is rich.

### Prompt for Claude Code:

```
Phase 5 of scraper upgrade. Replicate Phases 1-4 changes to 
scripts/scrape_rents.py.

scrape_rents.py is structurally identical to scrape_prices.py but 
hits the rentals endpoint. Apply the SAME upgrades:

1. Add owner-only filter (individualEntityOnly:true) to BASE_SEARCH_URL.
2. Extract the same new fields: listing_id, subdistrict_id, 
   subdistrict_name_ka, area_m2, rooms, floor, total_floors, 
   project_type, condition, seller_name, price_assessment.
3. Persist listing-level memory at data/rent_listings.json 
   (separate file — sales and rentals are different markets and 
   shouldn't share listing memory).
4. Extend data/rents.json additively with by_condition, by_project, 
   dom fields. The existing fields in rents.json must stay unchanged 
   — TickerBar.jsx reads it.

Note: rentals already extract area_m2 (since the rental page doesn't 
pre-compute price_per_sqm), so that part is already there. Don't 
duplicate.

Same testing protocol:
- Backup rents.json before running
- Verify existing fields preserved
- Test live site locally
- Commit only after pass
```

### Test checkpoint:

Same as Phase 4 but for `rents.json` and TickerBar's "cheapest rent" ticker.

### Commit:
```
git add scripts/scrape_rents.py data/rents.json data/rent_listings.json
git commit -m "scraper: apply listing-level upgrade to rents pipeline"
git push
```

---

## After all 5 phases

You now have:
- ✅ Owner-only data (no agent repost noise)
- ✅ Full listing-level history in `listings.json` + `rent_listings.json`
- ✅ DoM tracking starts accumulating from this moment
- ✅ Condition + project type + price assessment captured
- ✅ Price change history per listing
- ✅ Renovation premium per district
- ✅ Live site untouched
- ✅ Foundation for "Bloomberg of Tbilisi real estate" content

## What you can publish in 30-60 days

After ~1 month of weekly scrapes accumulating DoM + price history data:

> "Average days on market in Vake: 47 days. In Saburtalo: 32 days. Cheaper districts move faster."

> "23% of Tbilisi apartments dropped their asking price in April. Average drop: 6.2%."

> "Renovated apartments in Khrushchovka buildings cost 28% more than white-frame. In new builds: only 12% more. Renovation pays off more in old buildings."

This is content nobody else has. That's your moat.

---

## Troubleshooting

**Scraper crashes mid-run:**
- listings.json uses atomic write (.tmp + os.replace), so the existing file is safe.
- Re-run the scraper — it'll pick up where it left off conceptually (just won't have this run's deltas).

**Live site broken after Phase 4:**
- Restore `data/prices.json.backup` and revert the scraper changes.
- Diagnose what changed in the schema before retrying.

**Field extraction inconsistent (Phase 2):**
- ss.ge may render some fields client-side via JS. If so, you may need to fetch each listing's detail page (slower but more reliable) instead of relying on search result cards.
- Trade-off: more requests = slower scrape, but cleaner data. Worth it.

---

## Notes for future phases (not now)

- Building-level matching (using project_type + address fuzzy match) for tighter renovation premium
- Time-to-sale prediction model (use historical delisted listings + final price)
- Yield calculation (rent vs. sale per district — needs both pipelines mature)
- Public API endpoint for the database (when ready to monetize)
