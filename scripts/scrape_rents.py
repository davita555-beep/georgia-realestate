#!/usr/bin/env python3
"""
ss.ge rental scraper for tbilisiprice.ge - same 46 subdistricts as sales scraper.

Scrapes each subdistrict's rental listings via the English ss.ge endpoint
(home.ss.ge/en/real-estate/l/Flat/For-Rent), computes median rent per m²/month
in USD by dividing total USD price by the apartment's area. Output structure
mirrors prices.json so the frontend can consume it without changes.
"""

import json
import re
import random
import statistics
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ---------- Config ----------

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
RENTS_FILE = DATA_DIR / "rents.json"
RENT_HISTORY_FILE = DATA_DIR / "rent_history.json"
PUBLIC_RENTS_FILE = ROOT / "public" / "data" / "rents.json"

SUBDISTRICT_IDS = [
     1,  2,  3,  4,  5,  6,  7,  8,  9, 10,
    11, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 26, 27, 28, 29, 30, 31, 32,
    33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
]

BASE_SEARCH_URL = (
    "https://home.ss.ge/en/real-estate/l/Flat/For-Rent"
    "?cityIdList=95&currencyId=1&subdistrictIds={}"
)

# English URL slug → Georgian nominative name.
# Slugs come from the href pattern: /en/real-estate/N-room-Flat-For-Rent-{Slug}-{id}
ENGLISH_SLUG_TO_GEORGIAN: dict[str, str] = {
    # Vake-Saburtalo
    "vake": "ვაკე",
    "bagebi": "ბაგები",
    "kus-tba": "კუს ტბა",
    "lisis-tba": "ლისის ტბა",
    "nutsubidze": "ნუცუბიძის ფერდობი",
    "nutsubidze-slope": "ნუცუბიძის ფერდობი",
    "saburtalo": "საბურთალო",
    "vedzisi": "ვეძისი",
    "delisi": "დელისი",
    "dighomi": "დიღომი",
    "didi-dighomi": "დიდი დიღომი",
    "sanakhi": "სანახი",
    "avchala": "ავჭალა",
    "lisi": "ლისი",
    "vazisubani": "ვაზისუბანი",
    "vazha-pshavela-quarters": "ვაჟა-ფშაველას კვარტლები",
    "vazha-pshavela": "ვაჟა-ფშაველას კვარტლები",
    "districts-of-vazha-pshavela": "ვაჟა-ფშაველას კვარტლები",  # ss.ge actual slug (ID 5)
    "vashlijvari": "ვაშლიჯვარი",
    "tskhinvali-settlement": "ტყინვალი",
    "tkhinvala": "ტყინვალი",                    # ss.ge actual slug (ID 50)
    # Isani-Samgori
    "isani": "ისანი",
    "samgori": "სამგორი",
    "varketili": "ვარკეთილი",
    "lilo": "ლილო",
    "ortachala": "ორთაჭალა",
    "ponichala": "ფონიჭალა",
    "navtlughi": "ნავთლუღი",
    "okroqana": "ოქროყანა",
    "tabakhmela": "ტაბახმელა",
    "elbakyiani": "ელბაქიანი",
    "krtsanisi": "კრწანისი",
    "third-massif": "მესამე მასივი",
    "orkhevi": "ორხევი",
    "airport-settlement": "აეროპორტის დასახლება",
    "airport-village": "აეროპორტის დასახლება",  # ss.ge actual slug (ID 6)
    "airport-highway": "აეროპორტის გზატკეცილი",
    "africa-settlement": "აფრიკის დასახლება",
    "afrika": "აფრიკის დასახლება",              # ss.ge actual slug (ID 19)
    "mesame-masivi": "მესამე მასივი",            # ss.ge actual slug (ID 13)
    "navtlugi": "ნავთლუღი",                      # ss.ge actual slug (ID 24)
    # Gldani-Nadzaladevi
    "gldani": "გლდანი",
    "nadzaladevi": "ნაძალადევი",
    "mukhiani": "მუხიანი",
    "temka": "თემქა",
    "zahesi": "ზაჰესი",
    "lochini": "ლოჩინი",
    "lokhini": "ლოქინი",
    "varazi": "ვარაზი",
    "msakhuri": "მსახური",
    "gldani-half": "გლდანის ნახევარი",
    "dighomi-massif": "დიღმის მასივი",
    "gldanula": "გლდანული",
    "konyaki-settlement": "კონიაკის დასახლება",
    "koniaki-village": "კონიაკის დასახლება",   # ss.ge actual slug
    "sanzona": "სანზონა",
    "gldani-village": "სოფელი გლდანი",
    "digomi": "დიღომი",                          # ss.ge actual slug (IDs 28, 46)
    "digomi-village": "სოფელი დიღომი",          # ss.ge actual slug (ID 4)
    "didi-digomi": "დიდი დიღომი",               # ss.ge actual slug (ID 45)
    "tbilisi-sea": "თბილისის ზღვა",             # ss.ge actual slug (ID 36)
    "temqa": "თემქა",                            # ss.ge actual slug (ID 37)
    "lotkini": "ლოქინი",                         # ss.ge actual slug (ID 39)
    # Didube-Chugureti
    "didube": "დიდუბე",
    "chugureti": "ჩუღურეთი",
    "kukia": "კუკია",
    "svaneti-district": "სვანეთის უბანი",
    "svanetis-ubani": "სვანეთის უბანი",         # ss.ge actual slug (ID 30)
    "narikala": "ნარიყალა",
    # Dzveli Tbilisi / Old Town
    "vera": "ვერა",
    "mtatsminda": "მთაწმინდა",
    "sololaki": "სოლოლაკი",
    "avlabari": "ავლაბარი",
    "abanotubani": "აბანოთუბანი",
    "elia": "ელია",
    "metekhi": "მეტეხი",
    "ivertubani": "ივერთუბანი",
}

# Sanity bounds in USD/m²/month for Tbilisi rentals
MIN_RENT_PER_SQM = 1
MAX_RENT_PER_SQM = 80

# Sanity bounds on apartment area (m²)
MIN_AREA_SQM = 10
MAX_AREA_SQM = 500

MIN_LISTINGS_PER_SUBDISTRICT = 5
MAX_WEEK_OVER_WEEK_SWING = 0.25

MAX_PAGES_PER_SUBDISTRICT = 8
REQUEST_DELAY_RANGE = (1.0, 2.5)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


# ---------- Name resolution ----------

def extract_subdistrict_from_url(href: str) -> str:
    """Extract Georgian subdistrict name from an English listing URL slug.

    URL pattern: /en/real-estate/{N}-room-Flat-For-Rent-{Slug}-{id}
    """
    m = re.search(r"For-Rent-(.+?)-(\d+)$", href, re.IGNORECASE)
    if m:
        slug = m.group(1).lower()
        if slug in ENGLISH_SLUG_TO_GEORGIAN:
            return ENGLISH_SLUG_TO_GEORGIAN[slug]
        # Try stripping common suffixes / partial matches
        for key, name in ENGLISH_SLUG_TO_GEORGIAN.items():
            if slug.startswith(key) or key.startswith(slug):
                return name
    return "უცნობი"


def infer_name_from_listings(listings: list[dict]) -> str | None:
    names = [extract_subdistrict_from_url(l.get("href", "")) for l in listings]
    known = [n for n in names if n != "უცნობი"]
    if not known:
        return None
    name, count = Counter(known).most_common(1)[0]
    return name if count >= 3 else None


def extract_name_from_page(soup: BeautifulSoup) -> str | None:
    """Try breadcrumb / h1 on the English search results page."""
    for selector in (
        "nav ol li",
        "nav ul li",
        "ol.breadcrumb li",
        "ul.breadcrumb li",
        "[aria-label='breadcrumb'] li",
        ".breadcrumbs span",
    ):
        items = soup.select(selector)
        if items:
            for el in reversed(items):
                text = el.get_text(strip=True)
                if text and len(text) > 2 and text not in ("ss.ge", ">", "›", "/", "..."):
                    slug = text.lower().replace(" ", "-")
                    if slug in ENGLISH_SLUG_TO_GEORGIAN:
                        return ENGLISH_SLUG_TO_GEORGIAN[slug]
    return None


# ---------- Scraping ----------

def scrape_subdistrict(subdistrict_id: int) -> tuple[str, list[dict]]:
    url = BASE_SEARCH_URL.format(subdistrict_id)
    listings: list[dict] = []
    name: str | None = None

    for page in range(1, MAX_PAGES_PER_SUBDISTRICT + 1):
        page_url = f"{url}&page={page}"
        try:
            resp = requests.get(page_url, headers=HEADERS, timeout=25)
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"    ! ID {subdistrict_id} page {page} failed: {e}")
            break

        soup = BeautifulSoup(resp.text, "html.parser")

        if page == 1 and name is None:
            name = extract_name_from_page(soup)

        page_listings = parse_listings_page(resp.text)
        if not page_listings:
            break
        listings.extend(page_listings)
        time.sleep(random.uniform(*REQUEST_DELAY_RANGE))

    if not name:
        name = infer_name_from_listings(listings)
    if not name:
        name = f"#ID-{subdistrict_id}"

    return name, listings


def parse_listings_page(html: str) -> list[dict]:
    """Parse English rental listings page.

    Price per m² is computed as total USD rent / apartment area,
    since the English ss.ge card doesn't show a pre-computed per-m² figure.
    """
    soup = BeautifulSoup(html, "html.parser")
    results: list[dict] = []

    candidate_links = soup.select('a[href*="For-Rent"]')
    cards = [a for a in candidate_links if a.select_one(".listing-detailed-item-price")]

    for card in cards:
        price_el = card.select_one(".listing-detailed-item-price")
        if not price_el:
            continue

        price_text = price_el.get_text(" ", strip=True)
        # Skip GEL listings (₾); only process USD ($)
        if "$" not in price_text:
            continue

        price = extract_number(price_el)
        if not price:
            continue

        # Area is in the div that contains an icon-crop_free span
        area: float | None = None
        for span in card.find_all("span"):
            cls = " ".join(span.get("class", []))
            if "icon-crop_free" in cls:
                parent = span.find_parent("div")
                if parent:
                    area = extract_number_from_text(parent.get_text())
                break

        if not area or not (MIN_AREA_SQM <= area <= MAX_AREA_SQM):
            continue

        price_per_sqm = round(price / area, 2)

        href = card.get("href", "")
        title_el = card.select_one(".listing-detailed-item-title")
        desc_el = card.select_one(".listing-detailed-item-desc")
        full_text = (
            (title_el.get_text(" ", strip=True) if title_el else "")
            + " "
            + (desc_el.get_text(" ", strip=True) if desc_el else "")
        ).lower()
        is_new_build = any(
            k in full_text for k in ["newly built", "new build", "new construction"]
        )

        results.append({
            "price_usd": price,
            "area_sqm": area,
            "price_per_sqm": price_per_sqm,
            "new_build": is_new_build,
            "href": href,
        })

    return results


def extract_number(el) -> float | None:
    if not el:
        return None
    text = el.get_text(" ", strip=True).replace(",", "").replace(" ", "")
    m = re.search(r"\d+(?:\.\d+)?", text)
    return float(m.group()) if m else None


def extract_number_from_text(text: str) -> float | None:
    text = text.replace(",", "").replace("\xa0", "").strip()
    m = re.search(r"\d+(?:\.\d+)?", text)
    return float(m.group()) if m else None


# ---------- Stats ----------

def robust_median(values: list[float]) -> float | None:
    cleaned = [v for v in values if MIN_RENT_PER_SQM <= v <= MAX_RENT_PER_SQM]
    if len(cleaned) < MIN_LISTINGS_PER_SUBDISTRICT:
        return None
    cleaned.sort()
    trim = max(1, len(cleaned) // 20)
    trimmed = cleaned[trim:-trim] if len(cleaned) > 2 * trim else cleaned
    return round(statistics.median(trimmed), 2)


# ---------- Main ----------

def load_json(path: Path, default):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return default


def main(test_id: int | None = None):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    previous = load_json(RENTS_FILE, {})
    history = load_json(RENT_HISTORY_FILE, [])
    timestamp = datetime.now(timezone.utc).isoformat()

    ids_to_scrape = [test_id] if test_id is not None else SUBDISTRICT_IDS
    subdistrict_listings: dict[str, list[dict]] = defaultdict(list)

    for sid in ids_to_scrape:
        print(f"Scraping subdistrict ID {sid}...")
        name, listings = scrape_subdistrict(sid)
        if not listings:
            print(f"  ~ ID {sid}: no listings found")
            continue
        subdistrict_listings[name].extend(listings)
        tag = "(merged)" if len(subdistrict_listings[name]) > len(listings) else ""
        print(f"  -> ID {sid} = {name}: {len(listings)} listings {tag}")

    if test_id is not None:
        print("\n--- TEST MODE: sample listings ---")
        for name, listings in subdistrict_listings.items():
            print(f"District: {name} ({len(listings)} USD listings)")
            for l in listings[:5]:
                print(f"  ${l['price_usd']}/mo, {l['area_sqm']}m², ${l['price_per_sqm']}/m²  {l['href']}")
        return

    print(f"\nSubdistricts identified: {len(subdistrict_listings)}")

    new_rents: dict = {}
    run_log = {"date": timestamp, "subdistricts": {}}

    for subdistrict, listings in subdistrict_listings.items():
        if subdistrict.startswith("#ID-"):
            print(f"  ~ {subdistrict}: name unknown ({len(listings)} listings) — add slug to ENGLISH_SLUG_TO_GEORGIAN")
            continue

        all_prices = [l["price_per_sqm"] for l in listings]
        new_build_prices = [l["price_per_sqm"] for l in listings if l["new_build"]]
        resale_prices = [l["price_per_sqm"] for l in listings if not l["new_build"]]

        median_all = robust_median(all_prices)
        median_new = robust_median(new_build_prices) if new_build_prices else None
        median_resale = robust_median(resale_prices) if resale_prices else None

        prev = previous.get(subdistrict, {})
        prev_median = prev.get("price_per_sqm") if isinstance(prev, dict) else None

        if median_all is None:
            print(f"  ~ {subdistrict}: only {len(all_prices)} valid listings — skipping")
            continue
        elif prev_median and abs(median_all - prev_median) / prev_median > MAX_WEEK_OVER_WEEK_SWING:
            swing_pct = (median_all - prev_median) / prev_median
            print(f"  ! {subdistrict}: swing {swing_pct:.1%} — keeping previous")
            new_rents[subdistrict] = {**prev, "flag": f"swing_blocked:{median_all}:{swing_pct:.3f}"}
        else:
            new_rents[subdistrict] = {
                "name_ka": subdistrict,
                "price_per_sqm": median_all,
                "price_per_sqm_new_build": median_new,
                "price_per_sqm_resale": median_resale,
                "sample_size": len(all_prices),
                "updated": timestamp,
            }
            print(f"  ✓ {subdistrict}: ${median_all}/m²/mo ({len(all_prices)} listings)")

        run_log["subdistricts"][subdistrict] = {
            "sample_size": len(all_prices),
            "median": median_all,
            "median_new_build": median_new,
            "median_resale": median_resale,
        }

    print(f"\nProcessed {len(new_rents)} subdistricts")

    sorted_rents = dict(
        sorted(new_rents.items(), key=lambda x: x[1].get("price_per_sqm", 0), reverse=True)
    )

    rents_json = json.dumps(sorted_rents, ensure_ascii=False, indent=2)
    RENTS_FILE.write_text(rents_json, encoding="utf-8")
    PUBLIC_RENTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_RENTS_FILE.write_text(rents_json, encoding="utf-8")
    history.append(run_log)
    history = history[-52:]
    RENT_HISTORY_FILE.write_text(
        json.dumps(history, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Done. Wrote {len(sorted_rents)} subdistricts to {RENTS_FILE.name} and {PUBLIC_RENTS_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", type=int, metavar="ID", help="Scrape only this subdistrict ID and print results")
    args = parser.parse_args()
    main(test_id=args.test)
