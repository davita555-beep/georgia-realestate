#!/usr/bin/env python3
"""
Smart ss.ge scraper for tbilisiprice.ge - captures ~50 individual subdistricts.

Scrapes each subdistrict by its numeric subdistrictId instead of bundled groups,
so name attribution is reliable: all listings on a given ID query belong to that
one subdistrict. Name is resolved via page breadcrumb first, then majority vote
on listing URL slugs, then #ID-{n} fallback for unmapped areas.
"""

import json
import os
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
LISTINGS_FILE = DATA_DIR / "listings.json"
PUBLIC_PRICES_FILE = ROOT / "public" / "data" / "prices.json"
PRICES_BY_CONDITION_FILE = DATA_DIR / "prices_by_condition.json"
PUBLIC_PRICES_BY_CONDITION_FILE = ROOT / "public" / "data" / "prices_by_condition.json"

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

# conditionIds as used by the ss.ge search API
CONDITION_IDS: dict[str, int] = {
    "black":     1,
    "white":     2,
    "green":     3,
    "renovated": 4,
}

CONDITION_SEARCH_URL = (
    "https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba"
    "?cityIdList=95&currencyId=1&subdistrictIds={subdistrict_id}&conditionIds={condition_id}"
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

MAX_PAGES_PER_SUBDISTRICT = 16
REQUEST_DELAY_RANGE = (1.0, 2.5)

# Known ss.ge price-assessment labels (appear in the "ღირებულების შეფასება" section).
ASSESSMENT_LABELS = (
    "TOP შეთავაზება",
    "საშუალოზე იაფი",
    "საშუალო ფასი",
    "საშუალოზე მაღალი",
    "მაღალი ფასი",
)

# Georgian → English slug mappings applied at enrichment time and in the migration.
CONDITION_MAP: dict[str, str] = {
    "ახალი რემონტით":      "renovated",
    "გარემონტებული":       "renovated",        # synonym for ახალი რემონტით
    "თეთრი კარკასი":       "white_frame",
    "მწვანე კარკასი":      "green_frame",
    "შავი კარკასი":        "black_frame",
    "ძველი რემონტით":      "old_renovation",
    "სარემონტო":           "needs_renovation",
    "მიმდინარე რემონტი":   "ongoing_renovation",
    "კოსმეტიკური რემონტი": "cosmetic_renovation",
}

# ss.ge detail pages emit project-type proper nouns in the Georgian genitive case
# (e.g. "მოსკოვის" not "მოსკოვი"), so map keys must use the genitive form.
PROJECT_TYPE_MAP: dict[str, str] = {
    "არასტანდარტული": "non_standard",
    "ხრუშჩოვის":      "khrushchev",       # was "ხრუშჩოვი" (nominative)
    "ლვოვის":         "lvov",              # was "ლვოვი"
    "მოსკოვის":       "moscow",            # was "მოსკოვი"
    "ლენინგრადის":    "leningrad",         # was "ლენინგრადი"
    "გაუმჯობესებული": "improved",
    "ქართული":        "georgian",
    "ახალი პროექტი":  "new_project",
    "საავიაციო":      "aviation",
    "ქალაქური":       "urban",
    "ჩეხური":         "czech",
    "თბილისური ეზო":  "tbilisian_courtyard",
    "ყავლაშვილის":    "kavlashvili",
    "თუხარელის":      "tukhareli",
    "კიევი":          "kyiv",
    "კიევის":         "kyiv",              # genitive variant; both forms seen
    "მეტრომშენის":    "metro_construction",
}

# Condition buckets for renovation_premium_pct (English slugs post-mapping).
CONDITION_RENOVATED  = frozenset({"renovated"})
CONDITION_UNFINISHED = frozenset({"white_frame", "black_frame"})

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

        page_listings = parse_listings_page(resp.text, subdistrict_id=subdistrict_id)
        if not page_listings:
            break
        listings.extend(page_listings)
        time.sleep(random.uniform(*REQUEST_DELAY_RANGE))

    if not name:
        name = infer_name_from_listings(listings)
    if not name:
        name = f"#ID-{subdistrict_id}"

    # Stamp resolved name onto every listing now that we know it.
    for l in listings:
        l["subdistrict_name_ka"] = name

    return name, listings


def parse_listings_page(html: str, subdistrict_id: int | None = None) -> list[dict]:
    """Parse listings page; extract price-per-sqm, new-build flag, URL slug, and
    listing-level fields (Phase 2). subdistrict_name_ka is stamped later by
    scrape_subdistrict once the name is resolved."""
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

        # --- Phase 2: listing-level fields ---

        # listing_id: trailing integer in the href slug
        listing_id: int | None = None
        try:
            m2 = re.search(r"-(\d+)$", href)
            if m2:
                listing_id = int(m2.group(1))
        except Exception:
            pass

        # area_m2: div containing icon-crop_free span
        area_m2: float | None = None
        try:
            crop = card.select_one("span.icon-crop_free")
            if crop:
                area_m2 = extract_number(crop.find_parent("div"))
        except Exception:
            pass

        # bedrooms: div containing icon-bed span (bed count, not total rooms)
        bedrooms: int | None = None
        try:
            bed = card.select_one("span.icon-bed")
            if bed:
                val = extract_number(bed.find_parent("div"))
                if val is not None:
                    bedrooms = int(val)
        except Exception:
            pass

        # total_rooms: from href slug "iyideba-{N}-otaxiani-bina"
        total_rooms: int | None = None
        try:
            m3 = re.search(r"iyideba-(\d+)-otaxiani-bina", href)
            if m3:
                total_rooms = int(m3.group(1))
        except Exception:
            pass

        # floor / total_floors: div containing icon-stairs span, text "N / M"
        floor: int | None = None
        total_floors: int | None = None
        try:
            stairs = card.select_one("span.icon-stairs")
            if stairs:
                text = stairs.find_parent("div").get_text(" ", strip=True)
                mf = re.search(r"(\d+)\s*/\s*(\d+)", text)
                if mf:
                    floor = int(mf.group(1))
                    total_floors = int(mf.group(2))
        except Exception:
            pass

        # seller_name: not in card HTML (JS tooltip); None until Phase 3 / detail fetch
        seller_name: str | None = None

        # project_type, condition, price_assessment: detail-page only; None for now
        project_type: str | None = None
        condition: str | None = None
        price_assessment: str | None = None

        results.append({
            # --- existing fields (unchanged) ---
            "price_usd": price,
            "price_per_sqm": round(price_per_sqm, 2),
            "new_build": is_new_build,
            "href": href,
            # --- Phase 2 additions ---
            "listing_id": listing_id,
            "subdistrict_id": subdistrict_id,
            "subdistrict_name_ka": None,   # filled in by scrape_subdistrict
            "area_m2": area_m2,
            "total_rooms": total_rooms,
            "bedrooms": bedrooms,
            "floor": floor,
            "total_floors": total_floors,
            "project_type": project_type,
            "condition": condition,
            "seller_name": seller_name,
            "price_assessment": price_assessment,
        })

    return results


def extract_number(el) -> float | None:
    if not el:
        return None
    text = el.get_text(" ", strip=True).replace(",", "").replace(" ", "")
    m = re.search(r"\d+(?:\.\d+)?", text)
    return float(m.group()) if m else None


# ---------- Detail-page enrichment ----------

def enrich_from_detail_page(listing: dict) -> dict:
    """Fetch the listing detail page; fill condition, project_type, price_assessment.
    seller_name is absent from SSR HTML and stays None.
    Mutates the listing dict in-place; returns it for convenience."""
    listing["enrichment_attempts"] = listing.get("enrichment_attempts", 0) + 1
    href = listing.get("href", "")
    if not href:
        listing["enrichment_status"] = "no_href"
        return listing
    try:
        resp = requests.get(f"https://home.ss.ge{href}", headers=HEADERS, timeout=25)
        resp.raise_for_status()
    except requests.RequestException:
        listing["enrichment_status"] = "fetch_error"
        return listing

    soup = BeautifulSoup(resp.text, "html.parser")

    # Spec rows are elements whose text is exactly "LABEL VALUE".
    # Robust: no dependency on styled-component class names.
    condition: str | None = None
    project_type: str | None = None
    for el in soup.find_all(True):
        text = el.get_text(" ", strip=True)
        if condition is None and text.startswith("მდგომარეობა ") and len(text) < 80:
            condition = text[len("მდგომარეობა "):].strip()
        if project_type is None and text.startswith("პროექტი ") and len(text) < 80:
            project_type = text[len("პროექტი "):].strip()
        if condition is not None and project_type is not None:
            break
    if condition is not None:
        if condition in CONDITION_MAP:
            condition = CONDITION_MAP[condition]
        elif condition not in CONDITION_MAP.values():
            print(f"  WARNING: unmapped condition '{condition}' (listing {listing.get('listing_id')})")
    listing["condition"] = condition

    if project_type is not None:
        if project_type in PROJECT_TYPE_MAP:
            project_type = PROJECT_TYPE_MAP[project_type]
        elif project_type not in PROJECT_TYPE_MAP.values():
            print(f"  WARNING: unmapped project_type '{project_type}' (listing {listing.get('listing_id')})")
    listing["project_type"] = project_type

    # Price assessment: the active label is the first ASSESSMENT_LABELS entry that
    # appears in the assessment section text before the listing price number.
    price_assessment: str | None = None
    for el in soup.find_all(True):
        text = el.get_text(" ", strip=True)
        if "ღირებულების შეფასება" in text and len(text) < 600:
            before_price = re.split(r"\d{2,3},\d{3}", text)[0]
            for label in ASSESSMENT_LABELS:
                if label in before_price:
                    price_assessment = label
                    break
            break
    listing["price_assessment"] = price_assessment

    listing["seller_name"] = None   # not in SSR HTML
    listing["enrichment_status"] = "complete"
    return listing


# ---------- listings.json persistence ----------

def _save_listings(db: dict[str, dict], timestamp: str) -> None:
    """Atomic write of listings.json (.tmp → os.replace)."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    active_count = sum(1 for e in db.values() if e.get("status") == "active")
    payload = {
        "meta": {
            "last_run": timestamp,
            "total_listings_ever": len(db),
            "active_count": active_count,
        },
        "listings": db,
    }
    tmp = LISTINGS_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp, LISTINGS_FILE)


def persist_listings(scraped: list[dict], today: str) -> tuple[dict, dict]:
    """Merge scraped listings into listings.json.
    NEW → add with enrichment_status='pending'.
    EXISTING → update last_seen, track price changes.
    MISSING active → mark 'delisted', compute final_dom_days.
    Returns (db, summary)."""
    store = load_json(LISTINGS_FILE, {"meta": {}, "listings": {}})
    db: dict[str, dict] = store.get("listings", {})

    seen_ids: set[str] = set()
    n_new = n_updated = n_price_changed = n_delisted = 0

    for l in scraped:
        lid = l.get("listing_id")
        if lid is None:
            continue
        key = str(lid)
        seen_ids.add(key)

        if key not in db:
            db[key] = {
                "listing_id": lid,
                "subdistrict_id": l.get("subdistrict_id"),
                "subdistrict_name_ka": l.get("subdistrict_name_ka"),
                "first_seen": today,
                "last_seen": today,
                "status": "active",
                "final_dom_days": None,
                "current_price_usd": l.get("price_usd"),
                "area_m2": l.get("area_m2"),
                "total_rooms": l.get("total_rooms"),
                "bedrooms": l.get("bedrooms"),
                "floor": l.get("floor"),
                "total_floors": l.get("total_floors"),
                "project_type": None,
                "condition": None,
                "new_build": l.get("new_build"),
                "seller_name": None,
                "price_assessment": None,
                "enrichment_status": "pending",
                "enrichment_attempts": 0,
                "href": l.get("href"),
                "price_per_sqm": l.get("price_per_sqm"),
                "price_history": [{"date": today, "price_usd": l.get("price_usd")}],
            }
            n_new += 1
        else:
            entry = db[key]
            entry["last_seen"] = today
            entry["status"] = "active"
            cur_price = l.get("price_usd")
            if cur_price is not None and cur_price != entry.get("current_price_usd"):
                entry["price_history"].append({"date": today, "price_usd": cur_price})
                entry["current_price_usd"] = cur_price
                n_price_changed += 1
            for field in ("area_m2", "total_rooms", "bedrooms", "floor",
                          "total_floors", "new_build", "price_per_sqm"):
                entry[field] = l.get(field)
            n_updated += 1

    for key, entry in db.items():
        if key not in seen_ids and entry.get("status") == "active":
            entry["status"] = "delisted"
            try:
                first = datetime.strptime(entry["first_seen"], "%Y-%m-%d").date()
                last  = datetime.strptime(entry["last_seen"],  "%Y-%m-%d").date()
                entry["final_dom_days"] = (last - first).days
            except Exception:
                entry["final_dom_days"] = None
            n_delisted += 1

    _save_listings(db, datetime.now(timezone.utc).isoformat())
    summary = {
        "new": n_new, "updated": n_updated,
        "price_changed": n_price_changed, "delisted": n_delisted,
        "total": len(db),
        "active": sum(1 for e in db.values() if e.get("status") == "active"),
    }
    return db, summary


def run_enrichment(db: dict[str, dict], max_enrich: int | None = None,
                   save_every: int = 50, log_every: int = 25) -> dict[str, dict]:
    """Fetch detail pages for listings where enrichment_status != 'complete'
    and enrichment_attempts < 3. Saves listings.json every save_every fetches.
    Logs listing_id progress every log_every fetches."""
    pending = [
        e for e in db.values()
        if e.get("enrichment_status") != "complete"
        and e.get("enrichment_attempts", 0) < 3
    ]
    if max_enrich is not None:
        pending = pending[:max_enrich]

    total = len(pending)
    print(f"  Enriching {total} listings from detail pages...")
    timestamp = datetime.now(timezone.utc).isoformat()

    for i, entry in enumerate(pending, 1):
        enrich_from_detail_page(entry)
        if i % log_every == 0 or i == total:
            print(f"  [{i}/{total}] {entry['listing_id']} → {entry['enrichment_status']}")
        if i % save_every == 0:
            _save_listings(db, timestamp)
            print(f"  checkpoint saved ({i} enriched)")
        time.sleep(random.uniform(*REQUEST_DELAY_RANGE))

    _save_listings(db, datetime.now(timezone.utc).isoformat())
    return db


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


# ---------- Phase 4 aggregation extras ----------

def build_subdistrict_index(db: dict) -> dict[str, list]:
    """Group listings.json entries by subdistrict_name_ka."""
    idx: dict[str, list] = defaultdict(list)
    for entry in db.values():
        name = entry.get("subdistrict_name_ka")
        if name:
            idx[name].append(entry)
    return idx


def compute_aggregation_extras(subdistrict_name: str, db_index: dict[str, list]) -> dict:
    """Compute by_condition, by_project, renovation_premium_pct, dom for one subdistrict.
    Returns only keys that have meaningful data; callers .update() this into the entry."""
    entries = db_index.get(subdistrict_name, [])

    # --- by_condition ---
    condition_prices: dict[str, list[float]] = defaultdict(list)
    for e in entries:
        cond = e.get("condition")
        ppsm = e.get("price_per_sqm")
        if cond and ppsm is not None:
            condition_prices[cond].append(ppsm)

    by_condition: dict = {}
    for cond, prices in condition_prices.items():
        if len(prices) >= MIN_LISTINGS_PER_SUBDISTRICT:
            m = robust_median(prices)
            if m is not None:
                by_condition[cond] = {"price_per_sqm": m, "sample_size": len(prices)}

    # --- by_project ---
    project_prices: dict[str, list[float]] = defaultdict(list)
    for e in entries:
        proj = e.get("project_type")
        ppsm = e.get("price_per_sqm")
        if proj and ppsm is not None:
            project_prices[proj].append(ppsm)

    by_project: dict = {}
    for proj, prices in project_prices.items():
        if len(prices) >= MIN_LISTINGS_PER_SUBDISTRICT:
            m = robust_median(prices)
            if m is not None:
                by_project[proj] = {"price_per_sqm": m, "sample_size": len(prices)}

    # --- renovation_premium_pct ---
    renovated: list[float] = []
    for cond in CONDITION_RENOVATED:
        renovated.extend(condition_prices.get(cond, []))
    unfinished: list[float] = []
    for cond in CONDITION_UNFINISHED:
        unfinished.extend(condition_prices.get(cond, []))

    renovation_premium_pct: float | None = None
    if len(renovated) >= 5 and len(unfinished) >= 5:
        r_med = robust_median(renovated)
        u_med = robust_median(unfinished)
        if r_med and u_med:
            renovation_premium_pct = round((r_med / u_med - 1) * 100, 1)

    # --- dom ---
    today_date = datetime.now(timezone.utc).date()
    dom_days: list[int] = []
    for e in entries:
        if e.get("status") == "active":
            try:
                first = datetime.strptime(e["first_seen"], "%Y-%m-%d").date()
                dom_days.append((today_date - first).days)
            except Exception:
                pass

    dom: dict | None = None
    if dom_days:
        dom_days.sort()
        dom = {
            "avg_days": round(sum(dom_days) / len(dom_days), 1),
            "median_days": float(statistics.median(dom_days)),
            "sample_size": len(dom_days),
        }

    extras: dict = {}
    if by_condition:
        extras["by_condition"] = by_condition
    if by_project:
        extras["by_project"] = by_project
    extras["renovation_premium_pct"] = renovation_premium_pct
    extras["dom"] = dom
    return extras


def migrate_to_slugs() -> None:
    """One-time backfill: replace raw Georgian condition/project_type values with English slugs."""
    store = load_json(LISTINGS_FILE, {"meta": {}, "listings": {}})
    db: dict = store.get("listings", {})
    original_ts: str = store.get("meta", {}).get("last_run", datetime.now(timezone.utc).isoformat())

    n_cond = n_proj = n_warn = 0
    slug_values_cond = set(CONDITION_MAP.values())
    slug_values_proj = set(PROJECT_TYPE_MAP.values())

    for entry in db.values():
        raw_cond = entry.get("condition")
        if raw_cond is not None:
            if raw_cond in CONDITION_MAP:
                entry["condition"] = CONDITION_MAP[raw_cond]
                n_cond += 1
            elif raw_cond not in slug_values_cond:
                print(f"  WARNING: unmapped condition '{raw_cond}' (listing {entry.get('listing_id')})")
                n_warn += 1

        raw_proj = entry.get("project_type")
        if raw_proj is not None:
            if raw_proj in PROJECT_TYPE_MAP:
                entry["project_type"] = PROJECT_TYPE_MAP[raw_proj]
                n_proj += 1
            elif raw_proj not in slug_values_proj:
                print(f"  WARNING: unmapped project_type '{raw_proj}' (listing {entry.get('listing_id')})")
                n_warn += 1

    _save_listings(db, original_ts)
    print(f"Migration done: {n_cond} condition remapped, {n_proj} project_type remapped, {n_warn} warnings.")


# ---------- Per-condition scraping ----------

def scrape_subdistrict_by_condition(subdistrict_id: int) -> tuple[str, dict[str, list[float]]]:
    """Scrape one subdistrict 4 times, once per conditionId.
    Returns (resolved_name, {slug: [price_per_sqm, ...]}).
    Name is resolved from the first breadcrumb found across condition passes."""
    prices_by_cond: dict[str, list[float]] = {slug: [] for slug in CONDITION_IDS}
    name: str | None = None
    all_listings_for_vote: list[dict] = []

    for cond_slug, cond_id in CONDITION_IDS.items():
        url = CONDITION_SEARCH_URL.format(
            subdistrict_id=subdistrict_id, condition_id=cond_id
        )
        cond_prices: list[float] = []

        for page in range(1, MAX_PAGES_PER_SUBDISTRICT + 1):
            page_url = f"{url}&page={page}"
            try:
                resp = requests.get(page_url, headers=HEADERS, timeout=25)
                resp.raise_for_status()
            except requests.RequestException as e:
                print(f"    ! ID {subdistrict_id}/{cond_slug} page {page}: {e}")
                break

            soup = BeautifulSoup(resp.text, "html.parser")

            if page == 1 and name is None:
                name = extract_name_from_page(soup)

            page_listings = parse_listings_page(resp.text, subdistrict_id=subdistrict_id)
            if not page_listings:
                break
            cond_prices.extend(l["price_per_sqm"] for l in page_listings)
            all_listings_for_vote.extend(page_listings)
            time.sleep(random.uniform(*REQUEST_DELAY_RANGE))

        prices_by_cond[cond_slug] = cond_prices
        print(f"    ID {subdistrict_id}/{cond_slug}: {len(cond_prices)} listings")

    if not name:
        name = infer_name_from_listings(all_listings_for_vote)
    if not name:
        name = f"#ID-{subdistrict_id}"

    return name, prices_by_cond


def run_by_condition_scrape() -> None:
    """Scrape every subdistrict × condition, compute medians, write prices_by_condition.json."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Accumulate prices keyed by resolved name so duplicate IDs that share a name merge.
    district_prices: dict[str, dict[str, list[float]]] = {}

    for sid in SUBDISTRICT_IDS:
        print(f"\nSubdistrict ID {sid}...")
        name, by_cond = scrape_subdistrict_by_condition(sid)

        if name.startswith("#ID-"):
            print(f"  ~ ID {sid}: name unknown — skipping")
            continue

        if name not in district_prices:
            district_prices[name] = {slug: [] for slug in CONDITION_IDS}
        for slug, prices in by_cond.items():
            district_prices[name][slug].extend(prices)

        summary = ", ".join(f"{s}={len(by_cond[s])}" for s in CONDITION_IDS)
        print(f"  -> {name}: {summary}")

    print(f"\nComputing medians for {len(district_prices)} districts...")
    result: dict[str, dict[str, float | None]] = {}
    for name in sorted(district_prices):
        by_cond = district_prices[name]
        entry: dict[str, float | None] = {
            slug: robust_median(by_cond[slug]) for slug in CONDITION_IDS
        }
        if any(v is not None for v in entry.values()):
            result[name] = entry
            filled = {s: f"${v}" for s, v in entry.items() if v is not None}
            print(f"  {name}: {filled}")

    payload = json.dumps(result, ensure_ascii=False, indent=2)
    PRICES_BY_CONDITION_FILE.write_text(payload, encoding="utf-8")
    PUBLIC_PRICES_BY_CONDITION_FILE.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_PRICES_BY_CONDITION_FILE.write_text(payload, encoding="utf-8")
    print(
        f"\nWrote {len(result)} districts to "
        f"{PRICES_BY_CONDITION_FILE.name} and "
        f"{PUBLIC_PRICES_BY_CONDITION_FILE.relative_to(ROOT)}"
    )


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
    today = datetime.now(timezone.utc).date().isoformat()

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

    # Persist all scraped listings and run enrichment before aggregation so
    # compute_aggregation_extras works against fresh data.
    all_scraped = [l for listings in subdistrict_listings.values() for l in listings]
    db, persist_summary = persist_listings(all_scraped, today)
    print(f"\nListings persist: new={persist_summary['new']} updated={persist_summary['updated']} "
          f"price_changed={persist_summary['price_changed']} delisted={persist_summary['delisted']} "
          f"total={persist_summary['total']}")

    db = run_enrichment(db)
    db_index = build_subdistrict_index(db)

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
            new_prices[subdistrict].update(compute_aggregation_extras(subdistrict, db_index))
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

    prices_json = json.dumps(sorted_prices, ensure_ascii=False, indent=2)
    PRICES_FILE.write_text(prices_json, encoding="utf-8")
    PUBLIC_PRICES_FILE.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_PRICES_FILE.write_text(prices_json, encoding="utf-8")
    history.append(run_log)
    history = history[-52:]
    HISTORY_FILE.write_text(
        json.dumps(history, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Done. Wrote {len(sorted_prices)} subdistricts to {PRICES_FILE.name} and {PUBLIC_PRICES_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", type=int, metavar="ID",
                        help="Scrape only this subdistrict ID, print 5 samples + coverage. No file writes.")
    parser.add_argument("--test-listings", action="store_true",
                        help="Scrape subdistrict 3, persist + enrich first 10 listings. Writes listings.json only.")
    parser.add_argument("--test-aggregation", action="store_true",
                        help="Verify Phase 4 extras against existing prices.json + listings.json. No scrape, no writes.")
    parser.add_argument("--migrate-slugs", action="store_true",
                        help="One-time backfill: replace raw Georgian strings with English slugs in listings.json.")
    parser.add_argument("--by-condition", action="store_true",
                        help="Scrape per-condition prices and write prices_by_condition.json.")
    args = parser.parse_args()

    if args.by_condition:
        run_by_condition_scrape()

    elif args.migrate_slugs:
        migrate_to_slugs()

    elif args.test_aggregation:
        PROTECTED = {"name_ka", "price_per_sqm", "price_per_sqm_new_build",
                     "price_per_sqm_resale", "sample_size", "updated"}
        existing_prices = load_json(PRICES_FILE, {})
        if not existing_prices:
            print("No prices.json found — run the full scraper first.")
            sys.exit(1)
        listings_store = load_json(LISTINGS_FILE, {"listings": {}})
        db_index = build_subdistrict_index(listings_store.get("listings", {}))
        active_in_db = sum(1 for e in listings_store["listings"].values() if e.get("status") == "active")
        print(f"prices.json:   {len(existing_prices)} subdistricts")
        print(f"listings.json: {len(listings_store['listings'])} total entries, "
              f"{active_in_db} active, across {len(db_index)} named subdistricts")

        augmented: dict = {}
        for subdistrict, entry in existing_prices.items():
            if not isinstance(entry, dict):
                continue
            new_entry = {**entry}
            new_entry.update(compute_aggregation_extras(subdistrict, db_index))
            augmented[subdistrict] = new_entry

        # Verify all 6 protected fields present in every entry
        violations = [
            f"  {sd}: missing {PROTECTED - e.keys()}"
            for sd, e in augmented.items()
            if PROTECTED - e.keys()
        ]
        if violations:
            print("\n!!! PROTECTED FIELD VIOLATIONS !!!")
            for v in violations:
                print(v)
        else:
            print(f"\nAll 6 protected fields confirmed present in all {len(augmented)} entries.")

        # Pick 2 sample districts: prefer one with listings.json data, then any other
        with_data = [sd for sd in augmented if sd in db_index]
        without_data = [sd for sd in augmented if sd not in db_index]
        samples = (with_data[:1] + without_data[:1]) or list(augmented.keys())[:2]
        print("\n=== 2 sample district entries ===")
        for sd in samples:
            print(f"\n--- {sd} ---")
            print(json.dumps(augmented[sd], ensure_ascii=False, indent=2))

    elif args.test_listings:
        print("--- TEST-LISTINGS MODE: subdistrict 3, first 10 listings ---")
        name, listings = scrape_subdistrict(3)
        subset = [l for l in listings if l.get("listing_id")][:10]
        print(f"Scraped {len(subset)} listings from {name}")

        today = datetime.now(timezone.utc).date().isoformat()
        db, s = persist_listings(subset, today)
        print(f"\nPersist: new={s['new']} updated={s['updated']} "
              f"price_changed={s['price_changed']} delisted={s['delisted']} total={s['total']}")

        db = run_enrichment(db, max_enrich=10)

        data = load_json(LISTINGS_FILE, {})
        entries = list(data["listings"].values())

        print("\n=== 3 sample listings ===")
        for e in entries[:3]:
            print(json.dumps(e, ensure_ascii=False, indent=2))

        print("\n=== Enrichment status — all 10 ===")
        for e in entries:
            print(f"  {e['listing_id']}  {e['enrichment_status']:<12}  attempts={e['enrichment_attempts']}")

        conditions = Counter(e["condition"] for e in entries if e.get("condition"))
        projects   = Counter(e["project_type"] for e in entries if e.get("project_type"))
        print(f"\ncondition values:    {conditions.most_common()}")
        print(f"project_type values: {projects.most_common()}")

    elif args.test is not None:
        print(f"--- TEST MODE: subdistrict ID {args.test} ---")
        name, listings = scrape_subdistrict(args.test)
        print(f"Resolved name : {name}")
        print(f"Total listings: {len(listings)}")

        print("\n=== 5 sample listings ===")
        for l in listings[:5]:
            print(json.dumps(l, ensure_ascii=False, indent=2))

        NEW_FIELDS = [
            "listing_id", "subdistrict_id", "subdistrict_name_ka",
            "area_m2", "total_rooms", "bedrooms", "floor", "total_floors",
            "project_type", "condition", "seller_name", "price_assessment",
        ]
        CRITICAL = {"listing_id", "area_m2", "total_rooms", "bedrooms", "floor", "total_floors"}
        print("\n=== Coverage report (new fields) ===")
        for field in NEW_FIELDS:
            populated = sum(1 for l in listings if l.get(field) is not None)
            pct = populated / len(listings) * 100 if listings else 0
            flag = "  *** CRITICAL — check selector ***" if field in CRITICAL and pct < 70 else ""
            print(f"  {field:<22} {populated:>4}/{len(listings)}  ({pct:5.1f}%){flag}")
    else:
        main()
