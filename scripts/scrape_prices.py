#!/usr/bin/env python3
"""
Smart ss.ge scraper for tbilisiprice.ge - captures ~50 individual subdistricts.

Scrapes each subdistrict by its numeric subdistrictId instead of bundled groups,
so name attribution is reliable: all listings on a given ID query belong to that
one subdistrict. Name is resolved via page breadcrumb first, then majority vote
on listing URL slugs, then #ID-{n} fallback for unmapped areas.
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

# Windows terminals default to cp1251 which can't encode Georgian — force UTF-8.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ---------- Config ----------

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PRICES_FILE = DATA_DIR / "prices.json"
HISTORY_FILE = DATA_DIR / "history.json"

# All confirmed Tbilisi subdistrict IDs on ss.ge (1-53, IDs 12 and 25 absent from all groups).
# Source groups (for reference):
#   Vake-Saburtalo:      2,3,4,5,26,27,44,45,46,47,48,49,50
#   Isani-Samgori:       6,7,8,9,10,11,13,14,15,16,17,18,19,24
#   Gldani-Nadzaladevi:  32,33,34,35,36,37,38,39,40,41,42,43,53
#   Didube-Chugureti:    1,28,29,30,31
#   Dzveli Tbilisi:      20,21,22,23,51,52
SUBDISTRICT_IDS = [
     1,  2,  3,  4,  5,  6,  7,  8,  9, 10,
    11, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 26, 27, 28, 29, 30, 31, 32,
    33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
]

BASE_SEARCH_URL = (
    "https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba"
    "?cityIdList=95&currencyId=1&subdistrictIds={}"
)

# URL slug → Georgian nominative name.
# Used both for per-listing subdistrict identification (existing logic) and for
# normalising names extracted from page HTML (which may be in locative case).
URL_TO_SUBDISTRICT: dict[str, str] = {
    # Vake-Saburtalo
    "vakeshi": "ვაკე",             "vake": "ვაკე",
    "bagebshi": "ბაგები",          "bagebi": "ბაგები",
    "kus-tbaze": "კუს ტბა",        "kus-tba": "კუს ტბა",
    "lisis-tbaze": "ლისის ტბა",    "lisis-tba": "ლისის ტბა",
    "nutsubidze": "ნუცუბიძის ფერდობი",
    "nutsubidzes-ferdob": "ნუცუბიძის ფერდობი",
    "nucubidz": "ნუცუბიძის ფერდობი",           # ss.ge alt transliteration
    "saburtalo": "საბურთალო",      "saburtaloze": "საბურთალო",
    "vedzisi": "ვეძისი",           "vedzisshi": "ვეძისი",
    "delisi": "დელისი",            "delisshi": "დელისი",
    "dighomi": "დიღომი",           "dighomshi": "დიღომი",
    "didi-dighomi": "დიდი დიღომი", "didi-dighomshi": "დიდი დიღომი",
    "sanakhi": "სანახი",           "sanakhshi": "სანახი",
    "avchala": "ავჭალა",           "avchalashi": "ავჭალა",
    "avtchala": "ავჭალა",          "avtchalashi": "ავჭალა",  # alt transliteration
    "lisi": "ლისი",                "lisshi": "ლისი",
    "tsikhedze": "ციხედიდი",       "cikhe": "ციხედიდი",
    "vazisubani": "ვაზისუბანი",    "vazisabanshi": "ვაზისუბანი",
    "vazisubanshi": "ვაზისუბანი",                            # locative -shi form
    "vazha-fshavel": "ვაჟა-ფშაველას კვარტლები",             # Vazha-Pshavela quarters
    "vashlijvar": "ვაშლიჯვარი",    "vashlijvarshi": "ვაშლიჯვარი",
    "txinval": "ტყინვალი",         "txinvalshi": "ტყინვალი", # Tskhinvali settlement
    # Isani-Samgori
    "isani": "ისანი",              "isanze": "ისანი",
    "isanshi": "ისანი",                                      # locative -shi form
    "samgori": "სამგორი",          "samgorze": "სამგორი",
    "samgorshi": "სამგორი",                                  # locative -shi form
    "varketili": "ვარკეთილი",      "varketilze": "ვარკეთილი",
    "varketilshi": "ვარკეთილი",                              # locative -shi form
    "lilo": "ლილო",                "liloze": "ლილო",
    "ortachala": "ორთაჭალა",       "ortachalaze": "ორთაჭალა",
    "ortatchala": "ორთაჭალა",      "ortatchalashi": "ორთაჭალა", # alt transliteration
    "ponichala": "ფონიჭალა",       "ponichalaze": "ფონიჭალა",
    "fonitchala": "ფონიჭალა",      "fonitchalashi": "ფონიჭალა", # alt transliteration
    "navtlughi": "ნავთლუღი",       "navtlughshi": "ნავთლუღი",
    "okroqana": "ოქროყანა",        "okroyanashi": "ოქროყანა",
    "tabakhmela": "ტაბახმელა",     "tabakmela": "ტაბახმელა",
    "elbakyiani": "ელბაქიანი",     "elbakyani": "ელბაქიანი",
    "krtsanisi": "კრწანისი",       "krtsanisshi": "კრწანისი",
    "mesame-masiv": "მესამე მასივი",                          # Third Massif
    "orxev": "ორხევი",             "orxevshi": "ორხევი",
    "aeroportis-dasaxleba": "აეროპორტის დასახლება",          # Airport Settlement
    "aeroportis-gzatkecil": "აეროპორტის გზატკეცილი",        # Airport Highway
    "afrikis-dasaxleba": "აფრიკის დასახლება",               # Africa Settlement
    # Gldani-Nadzaladevi
    "gldani": "გლდანი",            "gldanze": "გლდანი",
    "gldanshi": "გლდანი",                                    # locative -shi form
    "nadzaladevi": "ნაძალადევი",   "nadzaladevze": "ნაძალადევი",
    "nadzaladevshi": "ნაძალადევი",                           # locative -shi form
    "mukhiani": "მუხიანი",         "mukhanze": "მუხიანი",
    "muxianshi": "მუხიანი",                                  # alt transliteration
    "temka": "თემქა",              "temkaze": "თემქა",
    "temqa": "თემქა",              "temqaze": "თემქა",       # alt transliteration
    "zahesi": "ზაჰესი",            "zahesshi": "ზაჰესი",
    "lochini": "ლოჩინი",           "lochinshi": "ლოჩინი",
    "lokini": "ლოქინი",            "lokinshi": "ლოქინი",
    "lotkin": "ლოქინი",            "lotkinze": "ლოქინი",     # alt transliteration
    "varazi": "ვარაზი",            "varazshi": "ვარაზი",
    "msakhuri": "მსახური",
    "gldanis-nakhevari": "გლდანის ნახევარი",
    "dighmis-masiv": "დიღმის მასივი",                        # Dighomi Massif
    "gldanula": "გლდანული",        "gldanulashi": "გლდანული",
    "koniakis-dasaxleba": "კონიაკის დასახლება",
    "sanzona": "სანზონა",          "sanzonashi": "სანზონა",
    "sofel-gldan": "სოფელი გლდანი",                         # Village Gldani
    # Didube-Chugureti
    "didube": "დიდუბე",            "didubeze": "დიდუბე",
    "chugureti": "ჩუღურეთი",       "chuguretze": "ჩუღურეთი",
    "chughureti": "ჩუღურეთი",      "chughuretshi": "ჩუღურეთი", # alt transliteration
    "kukia": "კუკია",              "kukiaze": "კუკია",
    "svaneti": "სვანეთის უბანი",   "svanetis-ubani": "სვანეთის უბანი",
    "narikala": "ნარიყალა",        "nariqala": "ნარიყალა",
    # Dzveli Tbilisi / Old Town
    "vera": "ვერა",                "veraze": "ვერა",
    "mtatsminda": "მთაწმინდა",     "mtatsmindaze": "მთაწმინდა",
    "sololaki": "სოლოლაკი",        "sololakze": "სოლოლაკი",
    "sololakshi": "სოლოლაკი",                               # locative -shi form
    "avlabari": "ავლაბარი",        "avlabarze": "ავლაბარი",
    "avlabarshi": "ავლაბარი",                               # locative -shi form
    "abanotubani": "აბანოთუბანი",  "abanotubanze": "აბანოთუბანი",
    "abanotubanshi": "აბანოთუბანი",                         # locative -shi form
    "elia": "ელია",                "eliaze": "ელია",
    "metekhi": "მეტეხი",           "mtekhze": "მეტეხი",
    "ivertuba": "ივერთუბანი",      "ivertubanshi": "ივერთუბანი",
}

_KNOWN_NAMES: frozenset[str] = frozenset(URL_TO_SUBDISTRICT.values())

# Sanity bounds in USD/sqm
MIN_PRICE_PER_SQM = 500
MAX_PRICE_PER_SQM = 10_000

MIN_LISTINGS_PER_SUBDISTRICT = 5
MAX_WEEK_OVER_WEEK_SWING = 0.25  # 25%

MAX_PAGES_PER_SUBDISTRICT = 8
REQUEST_DELAY_RANGE = (1.0, 2.5)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ka-GE,ka;q=0.9,en-US;q=0.8,en;q=0.7",
}


# ---------- Name resolution ----------

def extract_subdistrict_from_url(href: str) -> str:
    """Extract subdistrict name from a single listing URL slug."""
    if not href:
        return "უცნობი"
    path = href.split("/")[-1].split("?")[0].lower()
    for key, name in URL_TO_SUBDISTRICT.items():
        if key in path:
            return name
    for part in path.split("-"):
        if part in URL_TO_SUBDISTRICT:
            return URL_TO_SUBDISTRICT[part]
    return "უცნობი"


def _normalize_to_nominative(raw: str) -> str:
    """Strip common Georgian locative suffixes to get the nominative form."""
    raw = raw.strip()
    if raw in _KNOWN_NAMES:
        return raw
    for suffix in ("ებზე", "ებში", "ზე", "ში", "ად"):
        if raw.endswith(suffix) and len(raw) > len(suffix) + 2:
            stem = raw[: -len(suffix)]
            if stem in _KNOWN_NAMES:
                return stem
            if (stem + "ი") in _KNOWN_NAMES:
                return stem + "ი"
    return raw


def extract_name_from_page(soup: BeautifulSoup) -> str | None:
    """Try to pull a subdistrict name from breadcrumb or h1 of the search page."""
    # Breadcrumb: try several common selector patterns
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
                    return _normalize_to_nominative(text)

    # h1 as fallback (sometimes shows "ბინები ვაკეში")
    h1 = soup.select_one("h1")
    if h1:
        text = h1.get_text(strip=True)
        if text:
            return _normalize_to_nominative(text)

    return None


def infer_name_from_listings(listings: list[dict]) -> str | None:
    """Majority vote on subdistrict names derived from listing URL slugs."""
    names = [extract_subdistrict_from_url(l.get("href", "")) for l in listings]
    known = [n for n in names if n != "უცნობი"]
    if not known:
        return None
    name, count = Counter(known).most_common(1)[0]
    return name if count >= 3 else None


# ---------- Scraping ----------

def scrape_subdistrict(subdistrict_id: int) -> tuple[str, list[dict]]:
    """Fetch all listing pages for one subdistrictId; return (name, listings)."""
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
    """Parse listings page; extract price-per-sqm, new-build flag, and URL slug."""
    soup = BeautifulSoup(html, "html.parser")
    results: list[dict] = []

    candidate_links = soup.select('a[href*="/udzravi-qoneba/iyideba-"]')
    cards = [a for a in candidate_links if a.select_one(".listing-detailed-item-price")]

    for card in cards:
        price = extract_number(card.select_one(".listing-detailed-item-price"))
        if not price:
            continue

        price_per_sqm: float | None = None
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

        href = card.get("href", "")
        title_el = card.select_one(".listing-detailed-item-title")
        desc_el = card.select_one(".listing-detailed-item-desc")
        full_text = (
            (title_el.get_text(" ", strip=True) if title_el else "")
            + " "
            + (desc_el.get_text(" ", strip=True) if desc_el else "")
        ).lower()
        is_new_build = any(
            k in full_text
            for k in ["ახალაშენ", "new build", "newly built", "new construction", "ახალ აშენ"]
        )

        results.append({
            "price_usd": price,
            "price_per_sqm": round(price_per_sqm, 2),
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


# ---------- Stats ----------

def robust_median(values: list[float]) -> float | None:
    """Median after sanity-bound filtering and 5% trim on each end."""
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

    # Collect listings keyed by resolved subdistrict name.
    # If two IDs resolve to the same name, their listings are merged.
    subdistrict_listings: dict[str, list[dict]] = defaultdict(list)

    for sid in SUBDISTRICT_IDS:
        print(f"Scraping subdistrict ID {sid}...")
        name, listings = scrape_subdistrict(sid)
        if not listings:
            print(f"  ~ ID {sid}: no listings found")
            continue
        subdistrict_listings[name].extend(listings)
        tag = "(merged)" if name in subdistrict_listings and len(subdistrict_listings[name]) > len(listings) else ""
        print(f"  -> ID {sid} = {name}: {len(listings)} listings {tag}")

    print(f"\nSubdistricts identified: {len(subdistrict_listings)}")

    new_prices: dict = {}
    run_log = {"date": timestamp, "subdistricts": {}}

    for subdistrict, listings in subdistrict_listings.items():
        if subdistrict.startswith("#ID-"):
            print(f"  ~ {subdistrict}: name unknown ({len(listings)} listings) — add slug to URL_TO_SUBDISTRICT")
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

    sorted_prices = dict(
        sorted(new_prices.items(), key=lambda x: x[1].get("price_per_sqm", 0), reverse=True)
    )

    PRICES_FILE.write_text(
        json.dumps(sorted_prices, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    history.append(run_log)
    history = history[-52:]
    HISTORY_FILE.write_text(
        json.dumps(history, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Done. Wrote {len(sorted_prices)} subdistricts to {PRICES_FILE.name}")


if __name__ == "__main__":
    main()
