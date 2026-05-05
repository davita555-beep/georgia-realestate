#!/usr/bin/env python3
"""
ss.ge per-listing scraper for tbilisiprice.ge.

Scrapes individual sale and rental listings across all Tbilisi subdistricts.
Upserts into data/listings.json keyed by "{sale|rent}_{listing_id}":
  new listing  → first_seen = today, price_history initialized
  seen before  → last_seen updated; price appended to price_history if changed
  was active, now missing → status set to "delisted"
"""

import json
import os
import re
import random
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
LISTINGS_FILE = DATA_DIR / "listings.json"

SUBDISTRICT_IDS = [
     1,  2,  3,  4,  5,  6,  7,  8,  9, 10,
    11, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 26, 27, 28, 29, 30, 31, 32,
    33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
]

SALE_SEARCH_URL = (
    "https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba"
    "?cityIdList=95&currencyId=1&subdistrictIds={}"
)
RENT_SEARCH_URL = (
    "https://home.ss.ge/en/real-estate/l/Flat/For-Rent"
    "?cityIdList=95&currencyId=1&subdistrictIds={}"
)

MAX_PAGES = 16
MIN_AREA_SQM = 10
MAX_AREA_SQM = 500
REQUEST_DELAY = (2.0, 4.0)
RETRY_WAIT    = 10          # seconds to wait before a single retry on 522 / timeout

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ka-GE,ka;q=0.9,en-US;q=0.8,en;q=0.7",
}

# ---------- District slug maps ----------

# Georgian (locative) slugs → Georgian nominative name, for sale listing URLs.
# Pattern: /udzravi-qoneba/iyideba-{N}-otaxiani-bina-{SLUG}-{ID}
SALE_SLUG_TO_DISTRICT: dict[str, str] = {
    "vakeshi": "ვაკე",              "vake": "ვაკე",
    "bagebshi": "ბაგები",           "bagebi": "ბაგები",
    "kus-tbaze": "კუს ტბა",         "kus-tba": "კუს ტბა",
    "lisis-tbaze": "ლისის ტბა",     "lisis-tba": "ლისის ტბა",
    "nutsubidze": "ნუცუბიძის ფერდობი", "nucubidz": "ნუცუბიძის ფერდობი",
    "saburtalo": "საბურთალო",       "saburtaloze": "საბურთალო",
    "vedzisi": "ვეძისი",            "vedzisshi": "ვეძისი",
    "delisi": "დელისი",             "delisshi": "დელისი",
    "dighomi": "დიღომი",            "dighomshi": "დიღომი",
    "didi-dighomi": "დიდი დიღომი",  "didi-dighomshi": "დიდი დიღომი",
    "sanakhi": "სანახი",            "sanakhshi": "სანახი",
    "avchala": "ავჭალა",            "avchalashi": "ავჭალა",
    "avtchala": "ავჭალა",           "avtchalashi": "ავჭალა",
    "lisi": "ლისი",                 "lisshi": "ლისი",
    "vazisubani": "ვაზისუბანი",     "vazisubanshi": "ვაზისუბანი",
    "vazha-fshavel": "ვაჟა-ფშაველას კვარტლები",
    "vashlijvar": "ვაშლიჯვარი",     "vashlijvarshi": "ვაშლიჯვარი",
    "txinval": "ტყინვალი",
    "isani": "ისანი",               "isanshi": "ისანი",            "isanze": "ისანი",
    "samgori": "სამგორი",           "samgorshi": "სამგორი",        "samgorze": "სამგორი",
    "varketili": "ვარკეთილი",       "varketilshi": "ვარკეთილი",    "varketilze": "ვარკეთილი",
    "lilo": "ლილო",                 "liloze": "ლილო",
    "ortachala": "ორთაჭალა",        "ortachalaze": "ორთაჭალა",
    "ortatchala": "ორთაჭალა",       "ortatchalashi": "ორთაჭალა",
    "ponichala": "ფონიჭალა",        "ponichalaze": "ფონიჭალა",
    "fonitchala": "ფონიჭალა",       "fonitchalashi": "ფონიჭალა",
    "navtlughi": "ნავთლუღი",        "navtlughshi": "ნავთლუღი",
    "okroqana": "ოქროყანა",         "okroyanashi": "ოქროყანა",
    "tabakhmela": "ტაბახმელა",      "tabakmela": "ტაბახმელა",
    "elbakyiani": "ელბაქიანი",      "elbakyani": "ელბაქიანი",
    "krtsanisi": "კრწანისი",        "krtsanisshi": "კრწანისი",
    "mesame-masiv": "მესამე მასივი",
    "orxev": "ორხევი",              "orxevshi": "ორხევი",
    "gldani": "გლდანი",             "gldanshi": "გლდანი",          "gldanze": "გლდანი",
    "nadzaladevi": "ნაძალადევი",    "nadzaladevshi": "ნაძალადევი", "nadzaladevze": "ნაძალადევი",
    "mukhiani": "მუხიანი",          "muxianshi": "მუხიანი",        "mukhanze": "მუხიანი",
    "temka": "თემქა",               "temkaze": "თემქა",
    "temqa": "თემქა",               "temqaze": "თემქა",
    "zahesi": "ზაჰესი",             "zahesshi": "ზაჰესი",
    "lochini": "ლოჩინი",            "lochinshi": "ლოჩინი",
    "lokini": "ლოქინი",             "lokinshi": "ლოქინი",
    "lotkin": "ლოქინი",
    "varazi": "ვარაზი",             "varazshi": "ვარაზი",
    "msakhuri": "მსახური",
    "gldanis-nakhevari": "გლდანის ნახევარი",
    "dighmis-masiv": "დიღმის მასივი",
    "gldanula": "გლდანული",         "gldanulashi": "გლდანული",
    "koniakis-dasaxleba": "კონიაკის დასახლება",
    "sanzona": "სანზონა",           "sanzonashi": "სანზონა",
    "sofel-gldan": "სოფელი გლდანი",
    "didube": "დიდუბე",             "didubeze": "დიდუბე",
    "chugureti": "ჩუღურეთი",        "chuguretze": "ჩუღურეთი",
    "chughureti": "ჩუღურეთი",       "chughuretshi": "ჩუღურეთი",
    "kukia": "კუკია",               "kukiaze": "კუკია",
    "svaneti": "სვანეთის უბანი",    "svanetis-ubani": "სვანეთის უბანი",
    "narikala": "ნარიყალა",         "nariqala": "ნარიყალა",
    "vera": "ვერა",                 "veraze": "ვერა",
    "mtatsminda": "მთაწმინდა",      "mtatsmindaze": "მთაწმინდა",
    "sololaki": "სოლოლაკი",         "sololakze": "სოლოლაკი",       "sololakshi": "სოლოლაკი",
    "avlabari": "ავლაბარი",         "avlabarze": "ავლაბარი",       "avlabarshi": "ავლაბარი",
    "abanotubani": "აბანოთუბანი",   "abanotubanze": "აბანოთუბანი", "abanotubanshi": "აბანოთუბანი",
    "elia": "ელია",                 "eliaze": "ელია",
    "metekhi": "მეტეხი",            "mtekhze": "მეტეხი",
    "ivertuba": "ივერთუბანი",       "ivertubanshi": "ივერთუბანი",
}

# English slugs → Georgian nominative name, for rent listing URLs.
# Pattern: /en/real-estate/{N}-room-Flat-For-Rent-{SLUG}-{ID}
RENT_SLUG_TO_DISTRICT: dict[str, str] = {
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
    "digomi": "დიღომი",
    "didi-dighomi": "დიდი დიღომი",
    "didi-digomi": "დიდი დიღომი",
    "sanakhi": "სანახი",
    "avchala": "ავჭალა",
    "lisi": "ლისი",
    "vazisubani": "ვაზისუბანი",
    "vazha-pshavela-quarters": "ვაჟა-ფშაველას კვარტლები",
    "vazha-pshavela": "ვაჟა-ფშაველას კვარტლები",
    "districts-of-vazha-pshavela": "ვაჟა-ფშაველას კვარტლები",
    "vashlijvari": "ვაშლიჯვარი",
    "tskhinvali-settlement": "ტყინვალი",
    "tkhinvala": "ტყინვალი",
    "isani": "ისანი",
    "samgori": "სამგორი",
    "varketili": "ვარკეთილი",
    "lilo": "ლილო",
    "ortachala": "ორთაჭალა",
    "ponichala": "ფონიჭალა",
    "navtlughi": "ნავთლუღი",
    "navtlugi": "ნავთლუღი",
    "okroqana": "ოქროყანა",
    "tabakhmela": "ტაბახმელა",
    "elbakyiani": "ელბაქიანი",
    "krtsanisi": "კრწანისი",
    "third-massif": "მესამე მასივი",
    "mesame-masivi": "მესამე მასივი",
    "orkhevi": "ორხევი",
    "airport-settlement": "აეროპორტის დასახლება",
    "airport-village": "აეროპორტის დასახლება",
    "airport-highway": "აეროპორტის გზატკეცილი",
    "africa-settlement": "აფრიკის დასახლება",
    "afrika": "აფრიკის დასახლება",
    "gldani": "გლდანი",
    "nadzaladevi": "ნაძალადევი",
    "mukhiani": "მუხიანი",
    "temka": "თემქა",
    "temqa": "თემქა",
    "zahesi": "ზაჰესი",
    "lochini": "ლოჩინი",
    "lokhini": "ლოქინი",
    "lotkini": "ლოქინი",
    "varazi": "ვარაზი",
    "msakhuri": "მსახური",
    "gldani-half": "გლდანის ნახევარი",
    "dighomi-massif": "დიღმის მასივი",
    "gldanula": "გლდანი",
    "konyaki-settlement": "კონიაკის დასახლება",
    "koniaki-village": "კონიაკის დასახლება",
    "sanzona": "სანზონა",
    "gldani-village": "სოფელი გლდანი",
    "digomi-village": "სოფელი დიღომი",
    "tbilisi-sea": "თბილისის ზღვა",
    "didube": "დიდუბე",
    "chugureti": "ჩუღურეთი",
    "kukia": "კუკია",
    "svaneti-district": "სვანეთის უბანი",
    "svanetis-ubani": "სვანეთის უბანი",
    "narikala": "ნარიყალა",
    "vera": "ვერა",
    "mtatsminda": "მთაწმინდა",
    "sololaki": "სოლოლაკი",
    "avlabari": "ავლაბარი",
    "abanotubani": "აბანოთუბანი",
    "elia": "ელია",
    "metekhi": "მეტეხი",
    "ivertubani": "ივერთუბანი",
}

# Text patterns that indicate owner type inside a card's text content.
_AGENCY_SIGNALS = frozenset(["სააგენტო", "agency", "broker", "realtor", "რეალტ"])
_OWNER_SIGNALS  = frozenset(["მეპატრონე", "პირდაპირ", "direct", "private owner", "owner"])


# ---------- Helpers ----------

def fetch_with_retry(url: str) -> requests.Response | None:
    """GET url; on 522 or timeout wait RETRY_WAIT seconds and try once more.
    Returns the Response on success, None if both attempts fail."""
    for attempt in range(2):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=25)
            resp.raise_for_status()
            return resp
        except (requests.Timeout, requests.ConnectionError) as e:
            if attempt == 0:
                print(f"    ! timeout/conn ({e.__class__.__name__}), retrying in {RETRY_WAIT}s…")
                time.sleep(RETRY_WAIT)
            else:
                print(f"    ! retry failed ({e.__class__.__name__}), skipping")
                return None
        except requests.HTTPError as e:
            if attempt == 0 and e.response is not None and e.response.status_code == 522:
                print(f"    ! 522 error, retrying in {RETRY_WAIT}s…")
                time.sleep(RETRY_WAIT)
            else:
                print(f"    ! HTTP error ({e}), skipping")
                return None
    return None


def extract_number(el) -> float | None:
    if not el:
        return None
    text = el.get_text(" ", strip=True).replace(",", "").replace("\xa0", "").replace(" ", "")
    m = re.search(r"\d+(?:\.\d+)?", text)
    return float(m.group()) if m else None


def extract_id_from_href(href: str) -> int | None:
    m = re.search(r"-(\d{5,})$", href)
    if m:
        try:
            return int(m.group(1))
        except ValueError:
            pass
    return None


def district_from_sale_href(href: str) -> str | None:
    """Resolve Georgian district name from a sale listing href slug."""
    path = href.split("/")[-1].split("?")[0].lower()
    for key, name in SALE_SLUG_TO_DISTRICT.items():
        if key in path:
            return name
    return None


def district_from_rent_href(href: str) -> str | None:
    """Resolve Georgian district name from a rent listing href slug.
    Pattern: /en/real-estate/{N}-room-Flat-For-Rent-{SLUG}-{ID}
    """
    m = re.search(r"For-Rent-(.+?)-(\d+)$", href, re.IGNORECASE)
    if m:
        slug = m.group(1).lower()
        if slug in RENT_SLUG_TO_DISTRICT:
            return RENT_SLUG_TO_DISTRICT[slug]
        for key, name in RENT_SLUG_TO_DISTRICT.items():
            if slug.startswith(key) or key.startswith(slug):
                return name
    return None


def detect_owner_type(card) -> str | None:
    """Best-effort: returns 'owner', 'agency', or None from card HTML."""
    text_lower = card.get_text(" ", strip=True).lower()
    for sig in _AGENCY_SIGNALS:
        if sig in text_lower:
            return "agency"
    for sig in _OWNER_SIGNALS:
        if sig in text_lower:
            return "owner"
    # Class-name heuristic on child elements
    for el in card.find_all(True):
        cls = " ".join(el.get("class", [])).lower()
        if any(s in cls for s in ("agency", "agent", "broker")):
            return "agency"
        if any(s in cls for s in ("owner", "private")):
            return "owner"
    return None


def infer_district_from_cards(cards: list[dict], listing_type: str) -> str | None:
    resolver = district_from_sale_href if listing_type == "sale" else district_from_rent_href
    names = [resolver(c.get("href", "")) for c in cards]
    known = [n for n in names if n]
    if not known:
        return None
    name, count = Counter(known).most_common(1)[0]
    return name if count >= 2 else None


# ---------- Page parsers ----------

def parse_sale_page(html: str, subdistrict_id: int) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    results: list[dict] = []

    candidate_links = soup.select('a[href*="/udzravi-qoneba/iyideba-"]')
    cards = [a for a in candidate_links if a.select_one(".listing-detailed-item-price")]

    for card in cards:
        price = extract_number(card.select_one(".listing-detailed-item-price"))
        if not price:
            continue

        href = card.get("href", "")
        listing_id = extract_id_from_href(href)
        if not listing_id:
            continue

        area: float | None = None
        crop = card.select_one("span.icon-crop_free")
        if crop:
            area = extract_number(crop.find_parent("div"))

        rooms: int | None = None
        m = re.search(r"iyideba-(\d+)-otaxiani", href)
        if m:
            rooms = int(m.group(1))

        district = district_from_sale_href(href)
        owner_type = detect_owner_type(card)

        results.append({
            "listing_id": listing_id,
            "href": href,
            "url": f"https://home.ss.ge{href}",
            "price": price,
            "size_m2": area,
            "rooms": rooms,
            "district": district,
            "subdistrict_id": subdistrict_id,
            "owner_type": owner_type,
        })

    return results


def parse_rent_page(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    results: list[dict] = []

    candidate_links = soup.select('a[href*="For-Rent"]')
    cards = [a for a in candidate_links if a.select_one(".listing-detailed-item-price")]

    for card in cards:
        price_el = card.select_one(".listing-detailed-item-price")
        if not price_el or "$" not in price_el.get_text():
            continue

        price = extract_number(price_el)
        if not price:
            continue

        href = card.get("href", "")
        listing_id = extract_id_from_href(href)
        if not listing_id:
            continue

        area: float | None = None
        for span in card.find_all("span"):
            if "icon-crop_free" in " ".join(span.get("class", [])):
                parent = span.find_parent("div")
                if parent:
                    area = extract_number(parent)
                break

        if area is not None and not (MIN_AREA_SQM <= area <= MAX_AREA_SQM):
            area = None

        rooms: int | None = None
        m = re.search(r"/(\d+)-room-Flat-For-Rent", href, re.IGNORECASE)
        if m:
            rooms = int(m.group(1))

        district = district_from_rent_href(href)
        owner_type = detect_owner_type(card)

        results.append({
            "listing_id": listing_id,
            "href": href,
            "url": f"https://home.ss.ge{href}",
            "price": price,
            "size_m2": area,
            "rooms": rooms,
            "district": district,
            "owner_type": owner_type,
        })

    return results


# ---------- District-level scrapers ----------

def scrape_district_sale(subdistrict_id: int) -> list[dict]:
    url = SALE_SEARCH_URL.format(subdistrict_id)
    listings: list[dict] = []

    for page in range(1, MAX_PAGES + 1):
        resp = fetch_with_retry(f"{url}&page={page}")
        if resp is None:
            print(f"    ! sale ID {subdistrict_id} page {page}: giving up")
            break

        page_listings = parse_sale_page(resp.text, subdistrict_id)
        if not page_listings:
            break
        listings.extend(page_listings)
        time.sleep(random.uniform(*REQUEST_DELAY))

    # Backfill district for cards that had unrecognised slugs using majority vote.
    majority = infer_district_from_cards(listings, "sale")
    if majority:
        for l in listings:
            if not l["district"]:
                l["district"] = majority

    return listings


def scrape_district_rent(subdistrict_id: int) -> list[dict]:
    url = RENT_SEARCH_URL.format(subdistrict_id)
    listings: list[dict] = []

    for page in range(1, MAX_PAGES + 1):
        resp = fetch_with_retry(f"{url}&page={page}")
        if resp is None:
            print(f"    ! rent ID {subdistrict_id} page {page}: giving up")
            break

        page_listings = parse_rent_page(resp.text)
        if not page_listings:
            break
        listings.extend(page_listings)
        time.sleep(random.uniform(*REQUEST_DELAY))

    majority = infer_district_from_cards(listings, "rent")
    if majority:
        for l in listings:
            if not l["district"]:
                l["district"] = majority

    return listings


# ---------- Persistence ----------

def load_db() -> dict[str, dict]:
    if LISTINGS_FILE.exists():
        store = json.loads(LISTINGS_FILE.read_text(encoding="utf-8"))
        return store.get("listings", {})
    return {}


def save_db(db: dict[str, dict], timestamp: str) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    active_sale  = sum(1 for e in db.values() if e.get("status") == "active" and e.get("listing_type") == "sale")
    active_rent  = sum(1 for e in db.values() if e.get("status") == "active" and e.get("listing_type") == "rent")
    payload = {
        "meta": {
            "last_run": timestamp,
            "total_listings_ever": len(db),
            "active_sale": active_sale,
            "active_rent": active_rent,
        },
        "listings": db,
    }
    tmp = LISTINGS_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp, LISTINGS_FILE)


def upsert_listings(
    scraped: list[dict],
    listing_type: str,
    db: dict[str, dict],
    today: str,
) -> dict[str, int]:
    """Upsert scraped listings into db (mutates in-place). Returns counts."""
    seen: set[str] = set()
    n_new = n_updated = n_price_changed = 0

    for raw in scraped:
        lid = raw.get("listing_id")
        if lid is None:
            continue

        key = f"{listing_type}_{lid}"
        seen.add(key)

        if key not in db:
            db[key] = {
                "listing_id": lid,
                "url": raw["url"],
                "price": raw["price"],
                "size_m2": raw.get("size_m2"),
                "rooms": raw.get("rooms"),
                "district": raw.get("district"),
                "listing_type": listing_type,
                "owner_type": raw.get("owner_type"),
                "first_seen": today,
                "last_seen": today,
                "status": "active",
                "price_history": [{"date": today, "price": raw["price"]}],
            }
            n_new += 1
        else:
            entry = db[key]
            entry["last_seen"] = today
            entry["status"] = "active"
            new_price = raw.get("price")
            if new_price is not None and new_price != entry.get("price"):
                entry["price_history"].append({"date": today, "price": new_price})
                entry["price"] = new_price
                n_price_changed += 1
            # Refresh mutable fields that can change between runs.
            for field in ("size_m2", "rooms", "district", "owner_type", "url"):
                if raw.get(field) is not None:
                    entry[field] = raw[field]
            n_updated += 1

    # Mark active listings not seen this run as delisted.
    n_delisted = 0
    for key, entry in db.items():
        if (
            key not in seen
            and entry.get("listing_type") == listing_type
            and entry.get("status") == "active"
        ):
            entry["status"] = "delisted"
            n_delisted += 1

    return {"new": n_new, "updated": n_updated, "price_changed": n_price_changed, "delisted": n_delisted}


# ---------- Main ----------

def main(test_id: int | None = None, listing_type: str | None = None) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    today = datetime.now(timezone.utc).date().isoformat()
    timestamp = datetime.now(timezone.utc).isoformat()

    db = load_db()

    ids = [test_id] if test_id is not None else SUBDISTRICT_IDS
    types = [listing_type] if listing_type else ["sale", "rent"]

    all_scraped: dict[str, list[dict]] = {"sale": [], "rent": []}

    for sid in ids:
        if "sale" in types:
            print(f"  [sale] subdistrict ID {sid}...")
            sale_listings = scrape_district_sale(sid)
            all_scraped["sale"].extend(sale_listings)
            print(f"    -> {len(sale_listings)} listings")

        if "rent" in types:
            print(f"  [rent] subdistrict ID {sid}...")
            rent_listings = scrape_district_rent(sid)
            all_scraped["rent"].extend(rent_listings)
            print(f"    -> {len(rent_listings)} listings")

    if test_id is not None:
        print("\n--- TEST MODE: sample listings ---")
        for lt in types:
            items = all_scraped[lt][:5]
            print(f"\n[{lt}] {len(all_scraped[lt])} total, showing first {len(items)}:")
            for item in items:
                print(
                    f"  id={item['listing_id']}  ${item['price']}  "
                    f"{item['size_m2']}m²  rooms={item['rooms']}  "
                    f"district={item['district']}  owner={item['owner_type']}  "
                    f"{item['url']}"
                )
        return

    for lt in types:
        counts = upsert_listings(all_scraped[lt], lt, db, today)
        print(
            f"[{lt}] new={counts['new']} updated={counts['updated']} "
            f"price_changed={counts['price_changed']} delisted={counts['delisted']}"
        )

    save_db(db, timestamp)
    active_sale = sum(1 for e in db.values() if e.get("status") == "active" and e.get("listing_type") == "sale")
    active_rent = sum(1 for e in db.values() if e.get("status") == "active" and e.get("listing_type") == "rent")
    print(
        f"\nDone. total={len(db)}  active_sale={active_sale}  active_rent={active_rent}"
        f"\nWrote {LISTINGS_FILE}"
    )


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="ss.ge per-listing scraper")
    parser.add_argument("--test", type=int, metavar="ID",
                        help="Scrape only this subdistrict ID and print samples; no file writes")
    parser.add_argument("--type", choices=["sale", "rent"],
                        help="Limit to one listing type (default: both)")
    args = parser.parse_args()
    main(test_id=args.test, listing_type=args.type)
