"use client";
import { useState, useEffect } from "react";

const FACTORS = [
  { key: "floor", label: { en: "Floor", ka: "სართული" }, opts: [{ label: { en: "1st", ka: "1-ლი" }, mult: 0.90 }, { label: { en: "2–4", ka: "2–4" }, mult: 0.97 }, { label: { en: "5–9", ka: "5–9" }, mult: 1.00 }, { label: { en: "10+", ka: "10+" }, mult: 1.08 }] },
  { key: "reno", label: { en: "Renovation", ka: "რემონტი" }, opts: [{ label: { en: "No reno", ka: "რემონტის გარეშე" }, mult: 0.80 }, { label: { en: "Old", ka: "ძველი" }, mult: 0.90 }, { label: { en: "Good", ka: "კარგი" }, mult: 1.00 }, { label: { en: "Euro", ka: "ევრო" }, mult: 1.25 }] },
  { key: "building", label: { en: "Building type", ka: "შენობის ტიპი" }, opts: [{ label: { en: "Soviet", ka: "საბჭოური" }, mult: 0.88 }, { label: { en: "Panel", ka: "პანელი" }, mult: 0.93 }, { label: { en: "Brick", ka: "აგური" }, mult: 1.00 }, { label: { en: "New build", ka: "ახალი" }, mult: 1.12 }] },
  { key: "view", label: { en: "View & extras", ka: "ხედი და დამატებები" }, opts: [{ label: { en: "Courtyard", ka: "ეზო" }, mult: 0.97 }, { label: { en: "Street", ka: "ქუჩა" }, mult: 1.00 }, { label: { en: "Mountain", ka: "მთა" }, mult: 1.10 }, { label: { en: "+ Parking", ka: "+ პარკინგი" }, mult: 1.07 }] },
];

const T = {
  en: { title: "Apartment Estimator", sub: "Instant price range based on real market data · Updated weekly from ss.ge", district: "Choose district", size: "Apartment size", details: "Apartment details", selectFirst: "Select a district above to see your estimate", estimated: "estimated average", ctaBtn: "Get exact valuation from an agent →", formTitle: "Leave your details — our agent will call you with a free exact valuation.", namePlaceholder: "Your name", phonePlaceholder: "Phone number (+995...)", callBtn: "Call me back →", sending: "Sending...", thankYou: "Thank you", agentCall: "Our agent will call you shortly.", disclaimer: "Estimate based on ss.ge market data. TbilisiPrice.ge", weeklyUpdate: "Prices updated this week", updated: "Updated" },
  ka: { title: "ბინის ფასის კალკულატორი", sub: "სწრაფი ფასის შეფასება ss.ge-ის რეალური მონაცემებზე დაყრდნობით · ყოველკვირეული განახლება", district: "აირჩიეთ რაიონი", size: "ფართი", details: "ბინის დეტალები", selectFirst: "ფასის სანახავად აირჩიეთ რაიონი", estimated: "სავარაუდო საშუალო", ctaBtn: "მიიღეთ ზუსტი შეფასება აგენტისგან →", formTitle: "დატოვეთ კონტაქტი — ჩვენი აგენტი დაგიკავშირდება უფასო შეფასებისთვის.", namePlaceholder: "თქვენი სახელი", phonePlaceholder: "ტელეფონის ნომერი (+995...)", callBtn: "დამირეკეთ →", sending: "იგზავნება...", thankYou: "გმადლობთ", agentCall: "ჩვენი აგენტი მალე დაგიკავშირდებათ.", disclaimer: "შეფასება ss.ge-ის მონაცემებზეა დაფუძნებული. TbilisiPrice.ge", weeklyUpdate: "ფასები განახლებულია ამ კვირაში", updated: "განახლდა" },
};

function UpdateBadge({ lang = "en" }) {
  const [updateDate, setUpdateDate] = useState(null);
  const t = T[lang] || T.en;

  useEffect(() => {
    // Try to fetch the actual update timestamp from the scraped data
    async function fetchUpdateDate() {
      try {
        const response = await fetch('/data/prices.json');
        const data = await response.json();
        // Get the most recent update date from any district
        const dates = Object.values(data)
          .map(d => d.updated)
          .filter(Boolean)
          .sort()
          .reverse();
        
        if (dates.length > 0) {
          const date = new Date(dates[0]);
          const formatted = date.toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US', {
            month: 'long',
            day: 'numeric'
          });
          setUpdateDate(formatted);
        }
      } catch (error) {
        // Fallback to current week if fetch fails
        console.log('Could not fetch update date, using fallback');
        const now = new Date();
        const formatted = now.toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US', {
          month: 'long',
          day: 'numeric'
        });
        setUpdateDate(formatted);
      }
    }

    fetchUpdateDate();
  }, [lang]);

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: 20,
    marginBottom: 16,
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
  };

  const dotStyle = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#34d399',
    boxShadow: '0 0 6px rgba(52, 211, 153, 0.8)',
  };

  return (
    <div style={badgeStyle}>
      <div style={dotStyle}></div>
      <span>
        {t.weeklyUpdate}
        {updateDate && (
          <span style={{ marginLeft: 6, opacity: 0.9 }}>
            • {t.updated} {updateDate}
          </span>
        )}
      </span>
    </div>
  );
}

export default function ApartmentEstimator({ districts = [], lang = "en" }) {
  const t = T[lang] || T.en;
  const [district, setDistrict] = useState(null);
  const [size, setSize] = useState(60);
  const [selections, setSelections] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  let mult = 1.0;
  FACTORS.forEach((f) => { if (selections[f.key]) mult *= selections[f.key].mult; });
  const base = district ? district.avgPrice * size : 0;
  const low = Math.round((base * mult * 0.93) / 1000) * 1000;
  const high = Math.round((base * mult * 1.07) / 1000) * 1000;
  const perSqm = district ? Math.round((low + high) / 2 / size) : 0;
  const filledCount = Object.keys(selections).length;
  const confidence = Math.round(50 + (filledCount / FACTORS.length) * 50);
  const activePills = FACTORS.filter((f) => selections[f.key]).map((f) => selections[f.key].label[lang] || selections[f.key].label.en);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  const S = {
    wrap: { fontFamily: "sans-serif", maxWidth: 640, margin: "0 auto", padding: "1rem 0" },
    title: { fontSize: 26, margin: "0 0 4px", color: "#111", fontWeight: 600 },
    sub: { fontSize: 13, color: "#888", margin: "0 0 1.5rem" },
    lbl: { fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#999", display: "block", marginBottom: 8 },
    distGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6, marginBottom: "1.25rem" },
    factGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.25rem" },
    factCard: { border: "0.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "#fff" },
    factName: { fontSize: 12, color: "#999", marginBottom: 6, display: "block" },
    factOpts: { display: "flex", gap: 4, flexWrap: "wrap" },
    resultBox: { borderRadius: 14, background: "#1a1a2e", padding: "1.5rem", marginTop: "1.5rem", color: "#fff" },
    barWrap: { height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: "1rem", overflow: "hidden" },
    barFill: { height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#4ade80,#facc15)", transition: "width 0.4s" },
    ctaBtn: { background: "#fff", color: "#1a1a2e", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", width: "100%", fontFamily: "inherit" },
    formInput: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box", outline: "none" },
    submitBtn: { background: "#4ade80", color: "#111", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", width: "100%", fontFamily: "inherit" },
  };

  const dBtnStyle = (active) => ({ padding: "8px 6px", border: active ? "none" : "0.5px solid #e5e7eb", borderRadius: 8, background: active ? "#1a1a2e" : "#f9fafb", cursor: "pointer", textAlign: "center" });
  const fOptStyle = (active) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 20, border: active ? "none" : "0.5px solid #e5e7eb", background: active ? "#1a1a2e" : "#f9fafb", color: active ? "#fff" : "#666", cursor: "pointer", whiteSpace: "nowrap" });

  return (
    <div style={S.wrap}>
      <UpdateBadge lang={lang} />
      <p style={S.title}>{t.title}</p>
      <p style={S.sub}>{t.sub}</p>
      <span style={S.lbl}>{t.district}</span>
      <div style={S.distGrid}>
        {districts.map((d) => (
          <div key={d.name} style={dBtnStyle(district?.name === d.name)} onClick={() => { setDistrict(d); setShowForm(false); setSubmitted(false); }}>
            <span style={{ fontSize: 12, fontWeight: 500, display: "block", color: district?.name === d.name ? "#fff" : "#111" }}>{lang === "ka" ? d.nameKa : d.name}</span>
            <span style={{ fontSize: 11, display: "block", marginTop: 2, color: district?.name === d.name ? "#aaa" : "#999" }}>${d.avgPrice.toLocaleString()}/m²</span>
          </div>
        ))}
      </div>
      <span style={S.lbl}>{t.size}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
        <input type="range" min={20} max={10000} step={10} value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ flex: 1 }} />
        <span style={{ fontSize: 22, fontWeight: 300, color: "#111", minWidth: 70 }}>{size} m²</span>
      </div>
      <span style={S.lbl}>{t.details}</span>
      <div style={S.factGrid}>
        {FACTORS.map((f) => (
          <div key={f.key} style={S.factCard}>
            <span style={S.factName}>{f.label[lang] || f.label.en}</span>
            <div style={S.factOpts}>
              {f.opts.map((o) => (
                <span key={o.label.en} style={fOptStyle(selections[f.key]?.label.en === o.label.en)} onClick={() => setSelections((prev) => ({ ...prev, [f.key]: o }))}>
                  {o.label[lang] || o.label.en}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!district ? (
        <div style={{ fontSize: 14, color: "#bbb", textAlign: "center", padding: "2rem", border: "0.5px dashed #e5e7eb", borderRadius: 12, marginTop: "1.5rem" }}>{t.selectFirst}</div>
      ) : (
        <div style={S.resultBox}>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8888aa", marginBottom: 6 }}>{lang === "ka" ? district.nameKa : district.name} · {size} m²</div>
          <div style={{ fontSize: 32, color: "#fff", margin: "0 0 4px", fontWeight: 600 }}>${low.toLocaleString()} – ${high.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: "#6666aa", marginBottom: "1rem" }}>${perSqm.toLocaleString()}/m² {t.estimated}</div>
          {activePills.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" }}>{activePills.map((p) => <span key={p} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.08)", color: "#ccc" }}>{p}</span>)}</div>}
          <div style={S.barWrap}><div style={{ ...S.barFill, width: `${confidence}%` }} /></div>
          {!showForm ? (
            <button style={S.ctaBtn} onClick={() => setShowForm(true)}>{t.ctaBtn}</button>
          ) : submitted ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>✓ {t.thankYou}, {form.name}!</div>
              <div style={{ fontSize: 13, color: "#8888aa", marginTop: 4 }}>{t.agentCall}</div>
            </div>
          ) : (
            <div style={{ marginTop: "1rem", borderTop: "0.5px solid rgba(255,255,255,0.12)", paddingTop: "1rem" }}>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12 }}>{t.formTitle}</div>
              <input style={S.formInput} type="text" placeholder={t.namePlaceholder} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              <input style={S.formInput} type="tel" placeholder={t.phonePlaceholder} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <button style={{ ...S.submitBtn, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>{loading ? t.sending : t.callBtn}</button>
            </div>
          )}
          <div style={{ fontSize: 11, color: "#6666aa", marginTop: "0.75rem", textAlign: "center" }}>{t.disclaimer}</div>
        </div>
      )}
    </div>
  );
}
