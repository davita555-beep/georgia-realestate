#!/usr/bin/env python3
"""
Smart ss.ge scraper for tbilisiprice.ge - captures ~50 individual subdistricts
Extracts precise subdistrict location from each listing URL and breadcrumb.

Example output:
{
  "ვაკე": {"price_per_sqm": 2400, "sample_size": 45, "updated": "..."},
  "ბაგები": {"price_per_sqm": 2800, "sample_size": 23, "updated": "..."},
  "კუს ტბა": {"price_per_sqm": 2900, "sample_size": 18, "updated": "..."},
  ...
}
"""

import json
import re
import random
import statistics
import time
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict

import requests
from bs4 import BeautifulSoup

# ---------- Config ----------

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PRICES_FILE = DATA_DIR / "prices.json"
HISTORY_FILE = DATA_DIR / "history.json"

# Use the same 5 group URLs to get comprehensive coverage
DISTRICT_GROUPS = {
    "vake_saburtalo": {
        "name_ka": "ვაკე-საბურთალო",
        "url": "https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba?cityIdList=95&subdistrictIds=2%2C3%2C4%2C5%2C26%2C27%2C44%2C45%2C46%2C47%2C48%2C49%2C50&currencyId=1",
    },
    "isani_samgori": {
        "name_ka": "ისანი-სამგორი",
        "url": "https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba?cityIdList=95&subdistrictIds=6%2C7%2C8%2C9%2C10%2C11%2C13%2C14%2C15%2C16%2C17%2C18%2C19%2C24&currencyId=1",
    },
    "gldani_nadzaladevi": {
        "name_ka": "გლდანი-ნაძალადევი",
        "url": "https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba?cityIdList=95&subdistrictIds=32%2C33%2C34%2C35%2C36%2C37%2C38%2C39%2C40%2C41%2C42%2C43%2C53&currencyId=1",
    },
    "didube_chugureti": {
        "name_ka": "დიდუბე-ჩუღურეთი",
        "url": "https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba?cityIdList=95&subdistrictIds=1%2C28%2C29%2C30%2C31&currencyId=1",
    },
    "dzveli_tbilisi": {
        "name_ka": "ძველი თბილისი",
        "url": "https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba?cityIdList=95&subdistrictIds=20%2C21%2C22%2C23%2C51%2C52&currencyId=1",
    },
}

# URL to Georgian subdistrict name mapping (add more as we discover them)
URL_TO_SUBDISTRICT = {
    # Vake-Saburtalo
    'vakeshi': 'ვაკე',
    'vake': 'ვაკე',
    'bagebshi': 'ბაგები',
    'bagebi': 'ბაგები',
    'kus-tbaze': 'კუს ტბა',
    'kus-tba': 'კუს ტბა',
    'lisis-tbaze': 'ლისის ტბა',
    'lisis-tba': 'ლისის ტბა',
    'nutsubidze': 'ნუცუბიძის ფერდობი',
    'nutsubidzes-ferdob': 'ნუცუბიძის ფერდობი',
    'saburtalo': 'საბურთალო',
    'saburtaloze': 'საბურთალო',
    'vedzisi': 'ვეძისი',
    'delisi': 'დელისი',
    'dighomi': 'დიღომი',
    
    # Isani-Samgori  
    'isani': 'ისანი',
    'isanze': 'ისანი',
    'samgori': 'სამგორი',
    'samgorze': 'სამგორი',
    'varketili': 'ვარკეთილი',
    'varketilze': 'ვარკეთილი',
    'vazisubani': 'ვაზისუბანი',
    'vazisabanze': 'ვაზისუბანი',
    'lilo': 'ლილო',
    'liloze': 'ლილო',
    'ortachala': 'ორთაჭალა',
    'ortachalaze': 'ორთაჭალა',
    'ponichala': 'ფონიჭალა',
    'ponichalaze': 'ფონიჭალა',
    
    # Gldani-Nadzaladevi
    'gldani': 'გლდანი',
    'gldanze': 'გლდანი',
    'nadzaladevi': 'ნაძალადევი',
    'nadzaladevze': 'ნაძალადევი',
    'mukhiani': 'მუხიანი',
    'mukhanze': 'მუხიანი',
    'temka': 'თემქა',
    'temkaze': 'თემქა',
    'zahesi': 'ზაჰესი',
    'zahesshi': 'ზაჰესი',
    
    # Didube-Chugureti
    'didube': 'დიდუბე',
    'didubeze': 'დიდუბე',
    'chugureti': 'ჩუღურეთი',
    'chuguretze': 'ჩუღურეთი',
    'kukia': 'კუკია',
    'kukiaze': 'კუკია',
    'svaneti': 'სვანეთის უბანი',
    
    # Dzveli Tbilisi
    'vera': 'ვერა',
    'veraze': 'ვერა', 
    'mtatsminda': 'მთაწმინდა',
    'mtatsmindaze': 'მთაწმინდა',
    'sololaki': 'სოლოლაკი',
    'sololakze': 'სოლოლაკი',
    'avlabari': 'ავლაბარი',
    'avlabarze': 'ავლაბარი',
    'abanotubani': 'აბანოთუბანი',
    'elia': 'ელია',
    'eliaze': 'ელია'
}

# Sanity bounds in USD/sqm
MIN_PRICE_PER_SQM = 500
MAX_PRICE_PER_SQM = 10_000

# Guards
MIN_LISTINGS_PER_SUBDISTRICT = 5  # Lower threshold since we have more granular areas
MAX_WEEK_OVER_WEEK_SWING = 0.25  # 25% (allow slightly more variance for smaller areas)

# Polite scraping
MAX_PAGES_PER_DISTRICT = 20  # Increase to get more subdistricts
REQUEST_DELAY_RANGE = (1.0, 2.5)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ka-GE,ka;q=0.9,en-US;q=0.8,en;q=0.7",
}


# ---------- Subdistrict Extraction ----------

def extract_subdistrict_from_url(href: str) -> str:
    """Extract subdistrict name from listing URL."""
    if not href:
        return "უცნობი"
    
    # Remove domain and parameters
    path = href.split('/')[-1].split('?')[0]
    
    # Look for subdistrict patterns in URL
    for url_key, georgian_name in URL_TO_SUBDISTRICT.items():
        if url_key in path.lower():
            return georgian_name
    
    # Fallback: try to extract from URL structure
    parts = path.lower().split('-')
    for part in parts:
        if part in URL_TO_SUBDISTRICT:
            return URL_TO_SUBDISTRICT[part]
    
    return "უცნობი"


# ---------- Scraping ----------

def fetch_listings(url: str) -> list[dict]:
    """Fetch paginated listings with subdistrict extraction."""
    listings: list[dict] = []
    for page in range(1, MAX_PAGES_PER_DISTRICT + 1):
        sep = "&" if "?" in url else "?"
        page_url = f"{url}{sep}page={page}"
        try:
            resp = requests.get(page_url, headers=HEADERS, timeout=25)
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"  ! page {page} failed: {e}")
            break

        page_listings = parse_listings_page(resp.text)
        if not page_listings:
            break
        listings.extend(page_listings)
        time.sleep(random.uniform(*REQUEST_DELAY_RANGE))

    return listings


def parse_listings_page(html: str) -> list[dict]:
    """Parse listings page and extract subdistrict from each listing."""
    soup = BeautifulSoup(html, "html.parser")
    results: list[dict] = []

    # Find all listing links
    candidate_links = soup.select('a[href*="/udzravi-qoneba/iyideba-"]')
    cards = [a for a in candidate_links if a.select_one(".listing-detailed-item-price")]

    for card in cards:
        # Extract price
        price = extract_number(card.select_one(".listing-detailed-item-price"))
        if not price:
            continue

        # Extract price per sqm
        price_per_sqm = None
        for span in card.find_all("span"):
            text = span.get_text(" ", strip=True)
            m = re.search(r"m[²2]\s*[-–—]\s*([\d,]+)", text, re.IGNORECASE)
            if not m:
                m = re.search(r"მ[²2]\s*[-–—]\s*([\d,]+)", text)
            if m:
                try:
                    price_per_sqm = float(m.group(1).replace(",", ""))
                    break
                except ValueError:
                    continue

        if not price_per_sqm:
            continue

        # Extract subdistrict from URL
        href = card.get("href", "")
        subdistrict = extract_subdistrict_from_url(href)

        # New-build heuristic
        title_el = card.select_one(".listing-detailed-item-title")
        desc_el = card.select_one(".listing-detailed-item-desc")
        title_text = title_el.get_text(" ", strip=True) if title_el else ""
        desc_text = desc_el.get_text(" ", strip=True) if desc_el else ""
        full_text = (title_text + " " + desc_text).lower()
        is_new_build = any(
            k in full_text
            for k in ["ახალაშენ", "new build", "newly built", "new construction", "ახალ აშენ"]
        )

        results.append({
            "price_usd": price,
            "price_per_sqm": round(price_per_sqm, 2),
            "new_build": is_new_build,
            "subdistrict": subdistrict,
            "href": href,
            "title": title_text,
        })

    return results


def extract_number(el) -> float | None:
    if not el:
        return None
    text = el.get_text(" ", strip=True).replace(",", "").replace(" ", "")
    m = re.search(r"\d+(?:\.\d+)?", text)
    return float(m.group()) if m else None


# ---------- Stats ----------

def robust_median(values: list[float]) -> float | None:
    """Median after sanity bounds and 5% trim on each end."""
    cleaned = [v for v in values if MIN_PRICE_PER_SQM <= v <= MAX_PRICE_PER_SQM]
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


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    previous = load_json(PRICES_FILE, {})
    history = load_json(HISTORY_FILE, [])

    timestamp = datetime.now(timezone.utc).isoformat()
    
    # Collect all listings from all groups
    all_listings = []
    
    for group_key, cfg in DISTRICT_GROUPS.items():
        print(f"Scraping {group_key}...")
        group_listings = fetch_listings(cfg["url"])
        all_listings.extend(group_listings)
        print(f"  Found {len(group_listings)} listings in {group_key}")

    print(f"\nTotal listings collected: {len(all_listings)}")

    # Group by subdistrict
    subdistrict_data = defaultdict(list)
    for listing in all_listings:
        subdistrict_data[listing["subdistrict"]].append(listing)

    # Calculate prices for each subdistrict
    new_prices = {}
    run_log = {"date": timestamp, "subdistricts": {}}

    for subdistrict, listings in subdistrict_data.items():
        if subdistrict == "უცნობი":  # Skip unknown locations
            continue
            
        all_prices = [l["price_per_sqm"] for l in listings]
        new_prices_list = [l["price_per_sqm"] for l in listings if l["new_build"]]
        resale_prices = [l["price_per_sqm"] for l in listings if not l["new_build"]]

        median_all = robust_median(all_prices)
        median_new = robust_median(new_prices_list) if new_prices_list else None
        median_resale = robust_median(resale_prices) if resale_prices else None

        # Check for swing guard
        prev = previous.get(subdistrict, {})
        prev_median = prev.get("price_per_sqm") if isinstance(prev, dict) else None

        if median_all is None:
            print(f"  ~ {subdistrict}: only {len(all_prices)} listings — skipping")
            continue
        elif prev_median and abs(median_all - prev_median) / prev_median > MAX_WEEK_OVER_WEEK_SWING:
            swing_pct = (median_all - prev_median) / prev_median
            print(f"  ! {subdistrict}: swing {swing_pct:.1%} — keeping previous")
            new_prices[subdistrict] = {**prev, "flag": f"swing_blocked:{median_all}:{swing_pct:.3f}"}
        else:
            new_prices[subdistrict] = {
                "name_ka": subdistrict,
                "price_per_sqm": median_all,
                "price_per_sqm_new_build": median_new,
                "price_per_sqm_resale": median_resale,
                "sample_size": len(all_prices),
                "updated": timestamp,
            }
            print(f"  ✓ {subdistrict}: ${median_all}/m² ({len(all_prices)} listings)")

        run_log["subdistricts"][subdistrict] = {
            "sample_size": len(all_prices),
            "median": median_all,
            "median_new_build": median_new,
            "median_resale": median_resale,
        }

    print(f"\nProcessed {len(new_prices)} subdistricts")
    
    # Sort by price for easier reading
    sorted_prices = dict(sorted(new_prices.items(), 
                                key=lambda x: x[1].get("price_per_sqm", 0), 
                                reverse=True))

    PRICES_FILE.write_text(
        json.dumps(sorted_prices, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    
    history.append(run_log)
    history = history[-52:]  # Keep last year of weekly runs
    HISTORY_FILE.write_text(
        json.dumps(history, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    
    print(f"Done. Wrote {len(sorted_prices)} subdistricts to {PRICES_FILE.name}")


if __name__ == "__main__":
    main()
