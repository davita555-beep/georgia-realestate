"use client";
import { useState, useEffect } from "react";

const CONDITION_LABELS = {
  black_frame:        { ka: "შავი კარკასი",      en: "Black Frame" },
  white_frame:        { ka: "თეთრი კარკასი",     en: "White Frame" },
  green_frame:        { ka: "მწვანე კარკასი",    en: "Green Frame" },
  renovated:          { ka: "გარემონტებული",     en: "Renovated" },
  old_renovation:     { ka: "ძველი რემონტი",     en: "Old Renovation" },
  needs_renovation:   { ka: "სარემონტო",         en: "Needs Renovation" },
  ongoing_renovation: { ka: "მიმდინარე რემონტი", en: "Ongoing Reno" },
};

const T = {
  ka: {
    tagline:      "ბინის ფასების შემოწმება — თბილისი 2026",
    hero:         "იპოვე ფასდაკლებული ბინა თბილისში",
    heroSub:      "გრძელი ლოდინის ბინები — ყველაზე ხელსაყრელი მოლაპარაკების შანსი",
    heroDesc:     "ბაზარზე დიდი ხნის განვლობილი ბინა ნიშნავს მოტივირებულ გამყიდველს. ჩვენ ვთვალყურს ვადებს ყველა რაიონში — ასე ხვდები, სად ღირს მოლაპარაკება.",
    liveData:     "ლაივ მონაცემები",
    domSectionLabel: "Market Intelligence",
    domTitle:     "DOM — ბაზარზე ყოფნის დრო, რაიონების მიხედვით",
    domSub:       "საშუალო დღეები ბაზარზე — გაყიდვა და იჯარა. რაც მეტია, მით მეტია ფასდაკლების შანსი.",
    district:     "რაიონი",
    saleAvg:      "გაყიდვა — საშ. DOM",
    saleN:        "განცხ.",
    rentAvg:      "იჯარა — საშ. DOM",
    rentN:        "განცხ.",
    days:         "დღე",
    updated:      "განახლდა",
    gatedLabel:   "High DOM Listings",
    gatedTitle:   "მაღალი DOM — ინდივიდუალური განცხადებები",
    gatedSub:     "ბინები, სადაც ყველაზე მეტი შანსია ფასდაკლებისთვის. დალაგებულია ბაზარზე ყოფნის ვადით.",
    unlockTitle:  "სრული სიის სანახავად შეავსე ფორმა",
    unlockSub:    "შეავსე ფორმა და იხილე სრული სია — ჩვენ WhatsApp-ზე გამოგიგზავნით შეთავაზებასაც.",
    nameLabel:    "სახელი",
    waLabel:      "WhatsApp ნომერი",
    submitBtn:    "გახსნა →",
    sending:      "იგზავნება...",
    rooms:        "ოთახი",
    sqm:          "კვ.მ",
    floorOf:      "სართ.",
    domLabel:     "ბაზარზე",
    aboveAvg:     "საშ.-ზე მეტი",
    vsAvg:        "რაიონის საშ.",
    priceDrops:   "ფასი",
    noDrop:       "ფასი არ შეცვლილა",
    newBuild:     "ახალი",
    resale:       "მეორადი",
    owner:        "მფლობელი",
    agency:       "სააგენტო",
    viewDetails:  "დეტალების ნახვა",
    noListings:   "განახლება მალე...",
    loadingText:  "იტვირთება...",
    activeListings: "აქტიური განცხ.",
    districtsTracked: "რაიონი",
    priceReduced: "ფასი შეამცირა",
    mortgage:     "იპოთეკა",
    rental:       "იჯარა",
    findApt:      "ბინის მოძებნა",
    backHome:     "← მთავარი",
  },
  en: {
    tagline:      "Apartment Price Checker — Tbilisi 2026",
    hero:         "Find Discounted Apartments in Tbilisi",
    heroSub:      "Long-listed properties — your best negotiation leverage",
    heroDesc:     "Apartments sitting on the market signal motivated sellers. We track days on market across all districts so you know where to negotiate hardest.",
    liveData:     "Live Data",
    domSectionLabel: "Market Intelligence",
    domTitle:     "Days on Market by District",
    domSub:       "Average days listed — sale and rental. Higher DOM = better negotiation position.",
    district:     "District",
    saleAvg:      "Sale — Avg DOM",
    saleN:        "listings",
    rentAvg:      "Rent — Avg DOM",
    rentN:        "listings",
    days:         "days",
    updated:      "Updated",
    gatedLabel:   "High DOM Listings",
    gatedTitle:   "High DOM — Individual Listings",
    gatedSub:     "Properties with the most negotiation potential, sorted by days on market.",
    unlockTitle:  "Unlock the full listing feed",
    unlockSub:    "Fill the form to see the full list — we'll also send you matching deals on WhatsApp.",
    nameLabel:    "Your name",
    waLabel:      "WhatsApp number",
    submitBtn:    "Unlock →",
    sending:      "Sending...",
    rooms:        "rooms",
    sqm:          "m²",
    floorOf:      "fl.",
    domLabel:     "on market",
    aboveAvg:     "above avg",
    vsAvg:        "district avg",
    priceDrops:   "price",
    noDrop:       "No price change",
    newBuild:     "New build",
    resale:       "Resale",
    owner:        "Owner",
    agency:       "Agency",
    viewDetails:  "View Details",
    noListings:   "Updating soon...",
    loadingText:  "Loading...",
    activeListings: "Active listings",
    districtsTracked: "Districts",
    priceReduced: "Price reduced",
    mortgage:     "Mortgage",
    rental:       "Rental",
    findApt:      "Find my apartment",
    backHome:     "← Home",
  },
};

function calcDOM(firstSeen, finalDom) {
  if (finalDom != null && finalDom > 0) return finalDom;
  return Math.floor((Date.now() - new Date(firstSeen).getTime()) / 86400000);
}

function calcPriceDrops(history) {
  if (!history || history.length < 2) return 0;
  let drops = 0;
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1].price_usd ?? history[i - 1].price ?? 0;
    const curr = history[i].price_usd ?? history[i].price ?? 0;
    if (prev > 0 && curr < prev) drops++;
  }
  return drops;
}

function DOMBadge({ days, t }) {
  const color = days > 30 ? "#DC2626" : days > 14 ? "#D97706" : "#059669";
  const bg    = days > 30 ? "rgba(239,68,68,0.08)" : days > 14 ? "rgba(217,119,6,0.08)" : "rgba(5,150,105,0.08)";
  return (
    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: bg, color }}>
      {days} {t.days}
    </span>
  );
}

export default function DOMPage() {
  const [lang, setLang] = useState("ka");
  const t = T[lang];

  const [domData, setDomData]       = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading]       = useState(true);

  const [unlocked, setUnlocked]     = useState(false);
  const [name, setName]             = useState("");
  const [whatsapp, setWhatsapp]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState(false);

  useEffect(() => {
    async function load() {
      const [domRes, listRes] = await Promise.allSettled([
        fetch("/data/dom_summary.json").then(r => r.json()),
        fetch("/data/listings.json").then(r => r.json()),
      ]);
      if (domRes.status === "fulfilled") setDomData(domRes.value);
      if (listRes.status === "fulfilled") {
        const raw = listRes.value?.listings ?? {};
        const processed = Object.values(raw)
          .filter(l => l.status === "active" && l.current_price_usd > 0)
          .map(l => ({
            ...l,
            domDays:    calcDOM(l.first_seen, l.final_dom_days),
            priceDrops: calcPriceDrops(l.price_history),
          }))
          .sort((a, b) => b.domDays - a.domDays);
        setAllListings(processed);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleUnlock() {
    if (!name.trim() || !whatsapp.trim()) { setFormError(true); return; }
    setFormError(false);
    setSubmitting(true);
    try {
      await fetch("https://sheetdb.io/api/v1/4953u0ddyx7rn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            Date: new Date().toLocaleDateString(),
            Name: name,
            WhatsApp: whatsapp,
            Source: "DOM Page Unlock",
            Budget: "",
            Purpose: "",
            District: "",
            "Property Type": "",
            Timeline: "",
            Financing: "",
            Score: 3,
            Priority: "MEDIUM",
          },
        }),
      });
    } catch (_) {}
    setUnlocked(true);
    setSubmitting(false);
  }

  const districtAvgs = {};
  if (domData?.districts) {
    Object.entries(domData.districts).forEach(([name, d]) => {
      districtAvgs[name] = d.sale?.avg_dom ?? null;
    });
  }

  const districtRows = domData?.districts
    ? Object.entries(domData.districts).sort((a, b) => (b[1].sale?.avg_dom ?? 0) - (a[1].sale?.avg_dom ?? 0))
    : [];

  const highDomListings = allListings.slice(0, 60);
  const reducedCount    = allListings.filter(l => l.priceDrops > 0).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
      <div className="text-center">
        <div style={{ width: 40, height: 40, border: "2px solid #C9A84C", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#64748B", fontSize: 14 }}>{t.loadingText}</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <main className="min-h-screen" style={{ background: "#FAFAF8" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "rgba(11,28,61,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,168,76,0.2)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#C9A84C,#A8863A)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>TP</span>
            </div>
            <div>
              <a href="/" style={{ fontWeight: 700, color: "#fff", fontSize: 18, textDecoration: "none" }}>TbilisiPrice.ge</a>
              <span className="hidden sm:block text-xs" style={{ color: "rgba(201,168,76,0.8)", display: "block" }}>{t.tagline}</span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setLang(lang === "ka" ? "en" : "ka")}
              style={{ touchAction: "manipulation", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", background: "transparent", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 500 }}>
              {lang === "ka" ? "EN" : "GE"}
            </button>
            <a href="/mortgage"
              style={{ border: "1px solid rgba(201,168,76,0.5)", color: "#C9A84C", background: "transparent", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
              className="hidden sm:block">
              {t.mortgage}
            </a>
            <a href="/"
              style={{ touchAction: "manipulation", background: "linear-gradient(135deg,#C9A84C,#A8863A)", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              {t.findApt}
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(135deg,#0B1C3D 0%,#1E3A6E 55%,#0B2A4A 100%)", padding: "96px 24px 80px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.35)" }}>
            <span className="pulse-dot" />
            <span style={{ color: "#C9A84C", fontSize: 13, fontWeight: 500 }}>{t.liveData} — May 2026</span>
          </div>
          <h1 className="font-bold leading-tight mb-4" style={{ fontSize: "clamp(32px,5vw,58px)", color: "#fff", letterSpacing: "-0.02em", maxWidth: 680 }}>
            {t.hero}
          </h1>
          <p className="mb-3 font-semibold" style={{ color: "#C9A84C", fontSize: "clamp(15px,2vw,20px)" }}>
            {t.heroSub}
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 580, lineHeight: 1.7 }}>
            {t.heroDesc}
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            {[
              { val: allListings.length.toLocaleString(), label: t.activeListings },
              { val: districtRows.length,                 label: t.districtsTracked },
              { val: reducedCount,                        label: t.priceReduced },
            ].map(s => (
              <div key={s.label} className="stat-card px-6 py-4 text-center" style={{ minWidth: 120 }}>
                <div className="font-bold text-white" style={{ fontSize: 26 }}>{s.val}</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREE: DOM TABLE ── */}
      <section style={{ background: "#fff", padding: "80px 24px", borderBottom: "1px solid #E2E8F0" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C9A84C" }}>{t.domSectionLabel}</p>
            <h2 className="font-bold mb-1" style={{ fontSize: 28, color: "#0B1C3D", letterSpacing: "-0.01em" }}>{t.domTitle}</h2>
            <div className="divider-gold" />
            <p style={{ color: "#64748B", fontSize: 15 }}>{t.domSub}</p>
          </div>

          {districtRows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 24px", border: "1.5px dashed #E2E8F0", borderRadius: 16 }}>
              <p style={{ color: "#94A3B8", fontSize: 15 }}>{lang === "ka" ? "მონაცემები მუშავდება — მალე განახლდება" : "Data is being processed — updating soon"}</p>
            </div>
          ) : (
            <div style={{ border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(11,28,61,0.06)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {[
                        { label: t.district,  align: "left"  },
                        { label: t.saleAvg,   align: "right" },
                        { label: t.saleN,     align: "right" },
                        { label: t.rentAvg,   align: "right" },
                        { label: t.rentN,     align: "right" },
                      ].map(h => (
                        <th key={h.label} style={{ padding: "12px 18px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#64748B", textAlign: h.align, borderBottom: "2px solid #E2E8F0", whiteSpace: "nowrap" }}>
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {districtRows.map(([distName, d], idx) => {
                      const saleAvg = d.sale?.avg_dom;
                      const rentAvg = d.rent?.avg_dom;
                      const hot     = (saleAvg ?? 0) > 20;
                      return (
                        <tr key={distName} style={{ background: idx % 2 === 0 ? "#fff" : "#FAFAF8" }}>
                          <td style={{ padding: "14px 18px", fontWeight: 600, color: "#0B1C3D", fontSize: 14, borderBottom: "1px solid #F1F5F9" }}>
                            {distName}
                            {hot && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "rgba(201,168,76,0.12)", color: "#A8863A" }}>high DOM</span>}
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: 700, color: saleAvg > 20 ? "#DC2626" : "#1E3A6E", fontSize: 15, borderBottom: "1px solid #F1F5F9" }}>
                            {saleAvg != null ? <>{Math.round(saleAvg)} <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>{t.days}</span></> : "—"}
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "right", color: "#94A3B8", fontSize: 13, borderBottom: "1px solid #F1F5F9" }}>
                            {d.sale?.sample_size ?? "—"}
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: 700, color: "#1E3A6E", fontSize: 15, borderBottom: "1px solid #F1F5F9" }}>
                            {rentAvg != null ? <>{Math.round(rentAvg)} <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>{t.days}</span></> : "—"}
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "right", color: "#94A3B8", fontSize: 13, borderBottom: "1px solid #F1F5F9" }}>
                            {d.rent?.sample_size ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {domData?.updated && (
            <p className="text-xs mt-4" style={{ color: "#94A3B8" }}>
              {t.updated}: {new Date(domData.updated).toLocaleDateString(lang === "ka" ? "ka-GE" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </section>

      {/* ── GATED: HIGH-DOM LISTINGS ── */}
      <section style={{ background: "linear-gradient(180deg,#F0F4FA 0%,#FAFAF8 100%)", padding: "80px 24px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C9A84C" }}>{t.gatedLabel}</p>
            <h2 className="font-bold mb-1" style={{ fontSize: 28, color: "#0B1C3D", letterSpacing: "-0.01em" }}>{t.gatedTitle}</h2>
            <div className="divider-gold" />
            <p style={{ color: "#64748B", fontSize: 15 }}>{t.gatedSub}</p>
          </div>

          {/* ── Unlock form (shown only when locked) ── */}
          {!unlocked && (
            <div className="bg-white rounded-2xl p-8 mb-6" style={{ boxShadow: "0 8px 40px rgba(11,28,61,0.12)", border: "1px solid rgba(201,168,76,0.25)", maxWidth: 480 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#C9A84C,#A8863A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 22 }}>🔍</span>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, color: "#0B1C3D", marginBottom: 2 }}>{t.unlockTitle}</p>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{t.unlockSub}</p>
                </div>
              </div>
              <input
                type="text"
                placeholder={t.nameLabel}
                value={name}
                onChange={e => { setName(e.target.value); setFormError(false); }}
                style={{ width: "100%", border: `1.5px solid ${formError && !name.trim() ? "#DC2626" : "#E2E8F0"}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0B1C3D", outline: "none", marginBottom: 10, boxSizing: "border-box" }}
              />
              <input
                type="tel"
                placeholder={t.waLabel}
                value={whatsapp}
                onChange={e => { setWhatsapp(e.target.value); setFormError(false); }}
                style={{ width: "100%", border: `1.5px solid ${formError && !whatsapp.trim() ? "#DC2626" : "#E2E8F0"}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0B1C3D", outline: "none", marginBottom: 14, boxSizing: "border-box" }}
              />
              <button
                onClick={handleUnlock}
                disabled={submitting}
                style={{ touchAction: "manipulation", width: "100%", background: "linear-gradient(135deg,#C9A84C,#A8863A)", border: "none", color: "#fff", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? t.sending : t.submitBtn}
              </button>
            </div>
          )}

          {/* ── Listing cards ── */}
          <div style={{ position: "relative" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))",
              gap: 16,
              filter: unlocked ? "none" : "blur(6px)",
              userSelect: unlocked ? "auto" : "none",
              pointerEvents: unlocked ? "auto" : "none",
              transition: "filter 0.5s ease",
              maxHeight: unlocked ? "none" : 480,
              overflow: "hidden",
            }}>
              {highDomListings.length === 0 ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 24px", color: "#94A3B8", fontSize: 15 }}>
                  {t.noListings}
                </div>
              ) : highDomListings.map(l => {
                const distAvg   = districtAvgs[l.subdistrict_name_ka] ?? null;
                const aboveAvg  = distAvg != null && l.domDays > distAvg ? Math.round(l.domDays - distAvg) : null;
                const condLabel = CONDITION_LABELS[l.condition]?.[lang] ?? l.condition ?? "—";
                const ssHref    = l.href ? `https://ss.ge${l.href}` : null;

                return (
                  <div key={l.listing_id} style={{
                    background: "#fff", borderRadius: 16, padding: "20px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 20px rgba(11,28,61,0.07)",
                    display: "flex", flexDirection: "column", gap: 14,
                  }}>
                    {/* District + badges */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <p style={{ fontWeight: 700, color: "#0B1C3D", fontSize: 14, lineHeight: 1.3 }}>
                          {l.subdistrict_name_ka ?? "—"}
                        </p>
                        <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{condLabel}</p>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {l.new_build === true && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "rgba(45,82,153,0.1)", color: "#2D5299", whiteSpace: "nowrap" }}>{t.newBuild}</span>
                        )}
                        {l.new_build === false && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "rgba(100,116,139,0.08)", color: "#475569", whiteSpace: "nowrap" }}>{t.resale}</span>
                        )}
                        {l.seller_name ? (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "rgba(5,150,105,0.08)", color: "#059669", whiteSpace: "nowrap" }}>{t.owner}</span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "rgba(100,116,139,0.07)", color: "#94A3B8", whiteSpace: "nowrap" }}>{t.agency}</span>
                        )}
                      </div>
                    </div>

                    {/* Specs row */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      {l.total_rooms > 0 && (
                        <span style={{ fontSize: 13, color: "#64748B" }}>🛏 {l.total_rooms} {t.rooms}</span>
                      )}
                      {l.area_m2 > 0 && (
                        <span style={{ fontSize: 13, color: "#64748B" }}>📐 {Math.round(l.area_m2)} {t.sqm}</span>
                      )}
                      {l.floor > 0 && l.total_floors > 0 && (
                        <span style={{ fontSize: 13, color: "#64748B" }}>🏢 {l.floor}/{l.total_floors} {t.floorOf}</span>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <p style={{ fontWeight: 800, color: "#0B1C3D", fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                        ${l.current_price_usd?.toLocaleString()}
                      </p>
                      {l.price_per_sqm > 0 && (
                        <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>
                          ${Math.round(l.price_per_sqm).toLocaleString()}/{lang === "ka" ? "კვ.მ" : "m²"}
                        </p>
                      )}
                    </div>

                    {/* DOM + price drop info */}
                    <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#64748B" }}>{t.domLabel}</span>
                        <DOMBadge days={l.domDays} t={t} />
                      </div>
                      {aboveAvg != null && aboveAvg > 0 && (
                        <p style={{ fontSize: 11, color: "#94A3B8" }}>
                          +{aboveAvg} {t.aboveAvg} ({Math.round(distAvg)} {t.days} {t.vsAvg})
                        </p>
                      )}
                      {l.priceDrops > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                            ↓ {l.priceDrops}× {t.priceDrops}
                          </span>
                        </div>
                      ) : (
                        <p style={{ fontSize: 11, color: "#CBD5E1" }}>{t.noDrop}</p>
                      )}
                    </div>

                    {/* CTA */}
                    <a
                      href={ssHref ?? "#"}
                      target={ssHref ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      style={{
                        display: "block", textAlign: "center",
                        background: "linear-gradient(135deg,#0B1C3D,#1E3A6E)",
                        color: "#fff", borderRadius: 10, padding: "11px 16px",
                        fontSize: 13, fontWeight: 600, textDecoration: "none",
                        touchAction: "manipulation",
                      }}>
                      {t.viewDetails}
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Gradient fade-out at bottom when locked */}
            {!unlocked && highDomListings.length > 0 && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 160,
                background: "linear-gradient(to bottom, transparent, #F0F4FA)",
                pointerEvents: "none",
              }} />
            )}
          </div>

          {/* Unlock CTA below grid (when locked) */}
          {!unlocked && highDomListings.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <p style={{ color: "#64748B", fontSize: 14, marginBottom: 12 }}>
                {lang === "ka"
                  ? `${highDomListings.length} განცხადება ნაჩვენებია — შეავსე ფორმა სრული სიის სანახავად`
                  : `${highDomListings.length} listings available — fill the form to see the full list`}
              </p>
              <button
                onClick={() => { const el = document.querySelector("input[placeholder]"); el?.focus(); el?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                style={{ touchAction: "manipulation", background: "linear-gradient(135deg,#C9A84C,#A8863A)", border: "none", color: "#fff", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                {lang === "ka" ? "შეავსე ფორმა და იხილე სრული სია" : "Fill form to unlock"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0B1C3D", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#C9A84C,#A8863A)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 12 }}>TP</span>
              </div>
              <span style={{ fontWeight: 700, color: "#fff" }}>TbilisiPrice.ge</span>
            </div>
            <div className="flex gap-6">
              <a href="/"             style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{lang === "ka" ? "მთავარი" : "Home"}</a>
              <a href="/mortgage"     style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{t.mortgage}</a>
              <a href="/rental-yield" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{t.rental}</a>
            </div>
          </div>
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
              {lang === "ka" ? "მონაცემები: ss.ge · განახლება ყოველკვირა" : "Data: ss.ge · Updated weekly"}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
