#!/usr/bin/env python3
"""
ss.ge price scraper for tbilisiprice.ge
Runs weekly via GitHub Actions, updates data/prices.json and data/history.json.

Strategy:
- Scrape each district group's listings
- Filter outliers (sanity bounds + trim top/bottom 5%)
- Compute median price-per-sqm (overall, new-build, resale)
- Guards: if sample < 30 listings OR median swings > 20% vs last week,
  keep previous value and flag. Protects against ss.ge DOM changes silently
  breaking parsing.
"""

import json
import re
import random
import statistics
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ---------- Config ----------

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PRICES_FILE = DATA_DIR / "prices.json"
HISTORY_FILE = DATA_DIR / "history.json"

# Plug in your actual ss.ge filter URLs for each of the five district groups.
# Use the filter URL that ss.ge shows after you select the districts in its UI.
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

# Sanity bounds in USD/sqm — drop anything outside as junk/typos.
MIN_PRICE_PER_SQM = 500
MAX_PRICE_PER_SQM = 10_000

# Guards
MIN_LISTINGS_PER_DISTRICT = 30
MAX_WEEK_OVER_WEEK_SWING = 0.20  # 20%

# Polite scraping
MAX_PAGES_PER_DISTRICT = 15
REQUEST_DELAY_RANGE = (1.0, 2.5)  # seconds between pages
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ka-GE,ka;q=0.9,en-US;q=0.8,en;q=0.7",
}


# ---------- Scraping ----------

def fetch_listings(url: str) -> list[dict]:
    """Fetch paginated listings; stop when a page returns nothing."""
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
    """
    Parse one ss.ge listings page.

    Selectors based on ss.ge markup (as of April 2026):
    - Each listing card is an <a> tag linking to /udzravi-qoneba/iyideba-...
    - Stable class names we use: listing-detailed-item-price,
      listing-detailed-item-title, listing-detailed-item-desc.
    - Price-per-sqm is pre-computed on each card, format: "1 m² - 1,930 $"
    """
    soup = BeautifulSoup(html, "html.parser")
    results: list[dict] = []

    # Cards are <a> tags linking to listing detail pages. We require a price
    # element inside to filter out any unrelated links.
    candidate_links = soup.select('a[href*="/udzravi-qoneba/iyideba-"]')
    cards = [a for a in candidate_links if a.select_one(".listing-detailed-item-price")]

    for card in cards:
        # Headline price (e.g. "98,000 $")
        price = extract_number(card.select_one(".listing-detailed-item-price"))
        if not price:
            continue

        # Pre-computed price per sqm. Look for any span matching "X m² - Y $"
        # (also handles Georgian "მ²" and en-dash variants).
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

        # New-build heuristic from title + description text
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
            "href": card.get("href", ""),
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
    if len(cleaned) < MIN_LISTINGS_PER_DISTRICT:
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
    new_prices: dict = {}
    run_log = {"date": timestamp, "districts": {}}

    for key, cfg in DISTRICT_GROUPS.items():
        print(f"Scraping {key}...")
        listings = fetch_listings(cfg["url"])
        all_prices = [l["price_per_sqm"] for l in listings]
        new_prices_list = [l["price_per_sqm"] for l in listings if l["new_build"]]
        resale_prices = [l["price_per_sqm"] for l in listings if not l["new_build"]]

        median_all = robust_median(all_prices)
        median_new = robust_median(new_prices_list)
        median_resale = robust_median(resale_prices)

        prev = previous.get(key, {})
        prev_median = prev.get("price_per_sqm") if isinstance(prev, dict) else None

        if median_all is None:
            print(f"  ~ only {len(all_prices)} listings — keeping previous")
            new_prices[key] = prev if prev else {
                "name_ka": cfg["name_ka"],
                "price_per_sqm": None,
                "sample_size": len(all_prices),
                "updated": None,
                "flag": "insufficient_sample",
            }
        elif prev_median and abs(median_all - prev_median) / prev_median > MAX_WEEK_OVER_WEEK_SWING:
            swing_pct = (median_all - prev_median) / prev_median
            print(f"  ! {key} swung {swing_pct:.1%} — keeping previous, flagged")
            new_prices[key] = {**prev, "flag": f"swing_blocked:{median_all}:{swing_pct:.3f}"}
        else:
            new_prices[key] = {
                "name_ka": cfg["name_ka"],
                "price_per_sqm": median_all,
                "price_per_sqm_new_build": median_new,
                "price_per_sqm_resale": median_resale,
                "sample_size": len(all_prices),
                "updated": timestamp,
            }

        run_log["districts"][key] = {
            "sample_size": len(all_prices),
            "median": median_all,
            "median_new_build": median_new,
            "median_resale": median_resale,
        }

    PRICES_FILE.write_text(
        json.dumps(new_prices, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    history.append(run_log)
    history = history[-52:]  # last year of weekly runs
    HISTORY_FILE.write_text(
        json.dumps(history, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Done. Wrote {PRICES_FILE.name} and {HISTORY_FILE.name}")


if __name__ == "__main__":
    main()
