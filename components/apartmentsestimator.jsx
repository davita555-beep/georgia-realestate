"use client";
import { useState } from "react";

const DISTRICTS = [
  { name: "Vake",        nameGe: "ვაკე",         price: 2850 },
  { name: "Mtatsminda",  nameGe: "მთაწმინდა",    price: 2400 },
  { name: "Vera",        nameGe: "ვერა",          price: 2100 },
  { name: "Saburtalo",   nameGe: "საბურთალო",    price: 1950 },
  { name: "Chughureti",  nameGe: "ჩუღურეთი",     price: 1750 },
  { name: "Didube",      nameGe: "დიდუბე",        price: 1600 },
  { name: "Isani",       nameGe: "ისანი",         price: 1450 },
  { name: "Nadzaladevi", nameGe: "ნაძალადევი",   price: 1150 },
  { name: "Samgori",     nameGe: "სამგორი",      price: 980  },
  { name: "Gldani",      nameGe: "გლდანი",        price: 850  },
];

const FACTORS = [
  { key: "floor", label: "Floor", opts: [{ label: "1st", mult: 0.90 }, { label: "2–4", mult: 0.97 }, { label: "5–9", mult: 1.00 }, { label: "10+", mult: 1.08 }] },
  { key: "reno", label: "Renovation", opts: [{ label: "No reno", mult: 0.80 }, { label: "Old", mult: 0.90 }, { label: "Good", mult: 1.00 }, { label: "Euro", mult: 1.25 }] },
  { key: "building", label: "Building type", opts: [{ label: "Soviet", mult: 0.88 }, { label: "Panel", mult: 0.93 }, { label: "Brick", mult: 1.00 }, { label: "New build", mult: 1.12 }] },
  { key: "view", label: "View & extras", opts: [{ label: "Courtyard", mult: 0.97 }, { label: "Street", mult: 1.00 }, { label: "Mountain", mult: 1.10 }, { label: "+ Parking", mult: 1.07 }] },
];

export default function ApartmentEstimator() {
  const [district, setDistrict]     = useState(null);
  const [size, setSize]             = useState(60);
  const [selections, setSelections] = useState({});
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ name: "", phone: "" });
  const [submitted, setSubmitted]   = useState(false);
  const [loading, setLoading]       = useState(false);

  let mult = 1.0;
  FACTORS.forEach((f) => { if (selections[f.key]) mult *= selections[f.key].mult; });
  const base     = district ? district.price * size : 0;
  const low      = Math.round((base * mult * 0.93) / 1000) * 1000;
  const high     = Math.round((base * mult * 1.07) / 1000) * 1000;
  const perSqm   = district ? Math.round((low + high) / 2 / size) : 0;
  const filledCount = Object.keys(selections).length;
  const confidence  = Math.round(50 + (filledCount / FACTORS.length) * 50);
  const activePills = FACTORS.filter((f) => selections[f.key]).map((f) => selections[f.key].label);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  const S = {
    wrap:       { fontFamily: "sans-serif", maxWidth: 640, margin: "0 auto", padding: "2rem 1rem" },
    title:      { fontSize: 28, margin: "0 0 4px", color: "#111" },
    sub:        { fontSize: 14, color: "#888", margin: "0 0 1.5rem" },
    sectionLbl: { fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#999", display: "block", marginBottom: 8 },
    distGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6, marginBottom: "1.25rem" },
    factGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.25rem" },
    factCard:   { border: "0.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "#fff" },
    factName:   { fontSize: 12, color: "#999", marginBottom: 6, display: "block" },
    factOpts:   { display: "flex", gap: 4, flexWrap: "wrap" },
    resultBox:  { borderRadius: 14, background: "#1a1a2e", padding: "1.5rem", marginTop: "1.5rem", color: "#fff" },
    barWrap:    { height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: "1rem", overflow: "hidden" },
    barFill:    { height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#4ade80,#facc15)", transition: "width 0.4s" },
    ctaBtn:     { background: "#fff", color: "#1a1a2e", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", width: "100%", fontFamily: "inherit" },
    formInput:  { width: "100%", padding: "10px 12px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box", outline: "none" },
    submitBtn:  { background: "#4ade80", color: "#111", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", width: "100%", fontFamily: "inherit" },
  };

  const dBtnStyle = (active) => ({ padding: "8px 6px", border: active ? "none" : "0.5px solid #e5e7eb", borderRadius: 8, background: active ? "#1a1a2e" : "#f9fafb", cursor: "pointer", textAlign: "center" });
  const fOptStyle = (active) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 20, border: active ? "none" : "0.5px solid #e5e7eb", background: active ? "#1a1a2e" : "#f9fafb", color: active ? "#fff" : "#666", cursor: "pointer", whiteSpace: "nowrap" });

  return (
    <div style={S.wrap}>
      <p style={S.title}>Apartment Estimator</p>
      <p style={S.sub}>Instant price range based on real market data · Updated monthly from ss.ge</p>

      <span style={S.sectionLbl}>Choose district</span>
      <div style={S.distGrid}>
        {DISTRICTS.map((d) => (
          <div key={d.name} style={dBtnStyle(district?.name === d.name)} onClick={() => { setDistrict(d); setShowForm(false); setSubmitted(false); }}>
            <span style={{ fontSize: 12, fontWeight: 500, display: "block", color: district?.name === d.name ? "#fff" : "#111" }}>{d.name}</span>
            <span style={{ fontSize: 11, display: "block", marginTop: 2, color: district?.name === d.name ? "#aaa" : "#999" }}>{d.price.toLocaleString()} ₾/m²</span>
          </div>
        ))}
      </div>

      <span style={S.sectionLbl}>Apartment size</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
        <input type="range" min={20} max={200} step={5} value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ flex: 1 }} />
        <span style={{ fontSize: 22, fontWeight: 300, color: "#111", minWidth: 70 }}>{size} m²</span>
      </div>

      <span style={S.sectionLbl}>Apartment details</span>
      <div style={S.factGrid}>
        {FACTORS.map((f) => (
          <div key={f.key} style={S.factCard}>
            <span style={S.factName}>{f.label}</span>
            <div style={S.factOpts}>
              {f.opts.map((o) => (
                <span key={o.label} style={fOptStyle(selections[f.key]?.label === o.label)} onClick={() => setSelections((prev) => ({ ...prev, [f.key]: o }))}>
                  {o.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!district ? (
        <div style={{ fontSize: 14, color: "#bbb", textAlign: "center", padding: "2rem", border: "0.5px dashed #e5e7eb", borderRadius: 12, marginTop: "1.5rem" }}>
          Select a district above to see your estimate
        </div>
      ) : (
        <div style={S.resultBox}>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8888aa", marginBottom: 6 }}>{district.name} · {size} m²</div>
          <div style={{ fontSize: 32, color: "#fff", margin: "0 0 4px" }}>₾{low.toLocaleString()} – ₾{high.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: "#6666aa", marginBottom: "1rem" }}>{perSqm.toLocaleString()} ₾/m² estimated average</div>
          {activePills.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" }}>{activePills.map((p) => <span key={p} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.08)", color: "#ccc" }}>{p}</span>)}</div>}
          <div style={S.barWrap}><div style={{ ...S.barFill, width: `${confidence}%` }} /></div>
          {!showForm ? (
            <button style={S.ctaBtn} onClick={() => setShowForm(true)}>Get exact valuation from an agent →</button>
          ) : submitted ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>✓ Thank you, {form.name}!</div>
              <div style={{ fontSize: 13, color: "#8888aa", marginTop: 4 }}>Our agent will call you shortly.</div>
            </div>
          ) : (
            <div style={{ marginTop: "1rem", borderTop: "0.5px solid rgba(255,255,255,0.12)", paddingTop: "1rem" }}>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12 }}>Leave your details — our agent will call you with a free exact valuation.</div>
              <input style={S.formInput} type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              <input style={S.formInput} type="tel" placeholder="Phone number (+995...)" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <button style={{ ...S.submitBtn, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>{loading ? "Sending..." : "Call me back →"}</button>
            </div>
          )}
          <div style={{ fontSize: 11, color: "#6666aa", marginTop: "0.75rem", textAlign: "center" }}>Estimate based on ss.ge market data. TbilisiPrice.ge</div>
        </div>
      )}
    </div>
  );
}