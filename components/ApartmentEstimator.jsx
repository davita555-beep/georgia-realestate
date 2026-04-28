"use client";
import { useState, useEffect } from "react";

const FACTORS = [
  { key: "floor",    label: { en: "Floor",         ka: "სართული"          }, opts: [{ label: { en: "1st",      ka: "1-ლი"             }, mult: 0.90 }, { label: { en: "2–4",     ka: "2–4"   }, mult: 0.97 }, { label: { en: "5–9",     ka: "5–9"  }, mult: 1.00 }, { label: { en: "10+",     ka: "10+"  }, mult: 1.08 }] },
  { key: "reno",     label: { en: "Renovation",    ka: "რემონტი"           }, opts: [{ label: { en: "No reno",  ka: "რემონტის გარეშე"  }, mult: 0.80 }, { label: { en: "Old",     ka: "ძველი" }, mult: 0.90 }, { label: { en: "Good",    ka: "კარგი"}, mult: 1.00 }, { label: { en: "Euro",    ka: "ევრო" }, mult: 1.25 }] },
  { key: "building", label: { en: "Building type", ka: "შენობის ტიპი"      }, opts: [{ label: { en: "Soviet",  ka: "საბჭოური"         }, mult: 0.88 }, { label: { en: "Panel",   ka: "პანელი"}, mult: 0.93 }, { label: { en: "Brick",   ka: "აგური"}, mult: 1.00 }, { label: { en: "New build",ka:"ახალი"}, mult: 1.12 }] },
  { key: "view",     label: { en: "View & extras", ka: "ხედი და დამატებები"}, opts: [{ label: { en: "Courtyard",ka:"ეზო"              }, mult: 0.97 }, { label: { en: "Street",  ka: "ქუჩა" }, mult: 1.00 }, { label: { en: "Mountain",ka: "მთა" }, mult: 1.10 }, { label: { en: "+ Parking",ka:"+ პარკინგი"}, mult: 1.07 }] },
];

const T = {
  en: { title: "Apartment Price Estimator", sub: "Instant range based on live ss.ge data · Updated weekly", district: "Choose district", size: "Apartment size", details: "Apartment details", selectFirst: "Select a district above to see your estimate", estimated: "estimated avg", ctaBtn: "Get exact valuation from an agent →", formTitle: "Leave your details — our agent will call you with a free valuation.", namePlaceholder: "Your name", phonePlaceholder: "Phone (+995...)", callBtn: "Call me back →", sending: "Sending...", thankYou: "Thank you", agentCall: "Our agent will call you shortly.", disclaimer: "Based on ss.ge data · TbilisiPrice.ge", weeklyUpdate: "Prices updated this week", updated: "Updated", loading: "Loading prices..." },
  ka: { title: "ბინის ფასის კალკულატორი", sub: "სწრაფი შეფასება ss.ge-ის მონაცემებზე · ყოველკვირეული განახლება", district: "აირჩიეთ რაიონი", size: "ფართი", details: "ბინის დეტალები", selectFirst: "ფასის სანახავად აირჩიეთ რაიონი", estimated: "სავარაუდო საშუალო", ctaBtn: "მიიღეთ ზუსტი შეფასება →", formTitle: "დატოვეთ კონტაქტი — ჩვენი აგენტი დაგიკავშირდება.", namePlaceholder: "თქვენი სახელი", phonePlaceholder: "ტელეფონი (+995...)", callBtn: "დამირეკეთ →", sending: "იგზავნება...", thankYou: "გმადლობთ", agentCall: "ჩვენი აგენტი მალე დაგიკავშირდება.", disclaimer: "ss.ge-ის მონაცემებზე · TbilisiPrice.ge", weeklyUpdate: "ფასები განახლდა ამ კვირაში", updated: "განახლდა", loading: "იტვირთება..." },
};

export default function ApartmentEstimator({ lang = "en" }) {
  const t = T[lang] || T.en;
  const [districts, setDistricts] = useState([]);
  const [updateDate, setUpdateDate] = useState(null);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [district, setDistrict] = useState(null);
  const [size, setSize] = useState(60);
  const [selections, setSelections] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch('/data/prices.json');
        const data = await response.json();
        const loaded = Object.entries(data)
          .filter(([, v]) => v.price_per_sqm > 0 && (v.sample_size || 0) >= 5)
          .map(([key, v]) => ({ name: key, nameKa: v.name_ka || key, avgPrice: v.price_per_sqm }))
          .sort((a, b) => b.avgPrice - a.avgPrice);
        setDistricts(loaded);
        const dates = Object.values(data).map(d => d.updated).filter(Boolean).sort().reverse();
        if (dates.length > 0) {
          setUpdateDate(new Date(dates[0]).toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US', { month: 'long', day: 'numeric' }));
        }
      } catch (e) { console.error(e); }
      finally { setLoadingDistricts(false); }
    }
    fetchPrices();
  }, [lang]);

  let mult = 1.0;
  FACTORS.forEach(f => { if (selections[f.key]) mult *= selections[f.key].mult; });
  const base = district ? district.avgPrice * size : 0;
  const low  = Math.round((base * mult * 0.93) / 1000) * 1000;
  const high = Math.round((base * mult * 1.07) / 1000) * 1000;
  const perSqm = district ? Math.round((low + high) / 2 / size) : 0;
  const filledCount = Object.keys(selections).length;
  const confidence = Math.round(50 + (filledCount / FACTORS.length) * 50);
  const activePills = FACTORS.filter(f => selections[f.key]).map(f => selections[f.key].label[lang] || selections[f.key].label.en);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div style={{maxWidth:680,margin:"0 auto",fontFamily:"inherit"}}>
      {/* Live badge */}
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"linear-gradient(135deg,#059669,#047857)",color:"#fff",fontSize:12,fontWeight:500,padding:"6px 14px",borderRadius:20,marginBottom:20,boxShadow:"0 2px 8px rgba(5,150,105,0.25)"}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:"#34d399",boxShadow:"0 0 6px rgba(52,211,153,0.8)",display:"inline-block"}}></span>
        {t.weeklyUpdate}{updateDate && <span style={{opacity:0.85,marginLeft:4}}>· {t.updated} {updateDate}</span>}
      </div>

      <h2 style={{fontSize:26,fontWeight:700,color:"#0B1C3D",margin:"0 0 4px",letterSpacing:"-0.01em"}}>{t.title}</h2>
      <p style={{fontSize:13,color:"#94A3B8",margin:"0 0 24px"}}>{t.sub}</p>

      {/* District label */}
      <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#64748B",marginBottom:10}}>{t.district}</p>

      {loadingDistricts ? (
        <div style={{fontSize:14,color:"#94A3B8",padding:"16px 0"}}>{t.loading}</div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,marginBottom:24}}>
          {districts.map(d => (
            <button key={d.name}
              onClick={() => { setDistrict(d); setShowForm(false); setSubmitted(false); }}
              style={{padding:"10px 8px",border:`1.5px solid ${district?.name===d.name ? "#C9A84C" : "#E2E8F0"}`,borderRadius:10,background:district?.name===d.name ? "rgba(201,168,76,0.1)" : "#F8FAFC",cursor:"pointer",textAlign:"center",transition:"all 0.2s",touchAction:"manipulation"}}>
              <span style={{fontSize:12,fontWeight:600,display:"block",color:district?.name===d.name ? "#A8863A" : "#0B1C3D"}}>{lang==="ka" ? d.nameKa : d.name}</span>
              <span style={{fontSize:11,display:"block",marginTop:2,color:"#94A3B8"}}>${d.avgPrice.toLocaleString()}/m²</span>
            </button>
          ))}
        </div>
      )}

      {/* Size slider */}
      <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#64748B",marginBottom:10}}>{t.size}</p>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
        <input type="range" min={20} max={10000} step={10} value={size}
          onChange={e => setSize(Number(e.target.value))}
          style={{flex:1,accentColor:"#C9A84C"}} />
        <span style={{fontSize:20,fontWeight:600,color:"#0B1C3D",minWidth:72}}>{size} m²</span>
      </div>

      {/* Factor grid */}
      <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#64748B",marginBottom:12}}>{t.details}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
        {FACTORS.map(f => (
          <div key={f.key} style={{border:"1px solid #E2E8F0",borderRadius:12,padding:"14px 16px",background:"#fff"}}>
            <span style={{fontSize:11,color:"#94A3B8",marginBottom:8,display:"block",fontWeight:500}}>{f.label[lang] || f.label.en}</span>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {f.opts.map(o => (
                <button key={o.label.en}
                  onClick={() => setSelections(prev => ({ ...prev, [f.key]: o }))}
                  style={{fontSize:11,padding:"5px 10px",borderRadius:20,border:`1.5px solid ${selections[f.key]?.label.en===o.label.en ? "#C9A84C" : "#E2E8F0"}`,background:selections[f.key]?.label.en===o.label.en ? "rgba(201,168,76,0.12)" : "#F8FAFC",color:selections[f.key]?.label.en===o.label.en ? "#A8863A" : "#64748B",cursor:"pointer",whiteSpace:"nowrap",fontWeight:500,transition:"all 0.15s",touchAction:"manipulation"}}>
                  {o.label[lang] || o.label.en}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Result box */}
      {!district ? (
        <div style={{fontSize:14,color:"#94A3B8",textAlign:"center",padding:"32px",border:"1.5px dashed #E2E8F0",borderRadius:16}}>{t.selectFirst}</div>
      ) : (
        <div style={{borderRadius:20,background:"linear-gradient(135deg,#0B1C3D 0%,#1A2F5A 100%)",padding:"28px",color:"#fff",boxShadow:"0 12px 40px rgba(11,28,61,0.25)"}}>
          <div style={{fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(201,168,76,0.7)",marginBottom:8}}>{lang==="ka" ? district.nameKa : district.name} · {size} m²</div>
          <div style={{fontSize:38,color:"#fff",margin:"0 0 4px",fontWeight:700,letterSpacing:"-0.02em"}}>${low.toLocaleString()} – ${high.toLocaleString()}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:16}}>${perSqm.toLocaleString()}/m² {t.estimated}</div>

          {activePills.length > 0 && (
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {activePills.map(p => <span key={p} style={{fontSize:11,padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.6)"}}>{p}</span>)}
            </div>
          )}

          {/* Confidence bar */}
          <div style={{height:4,background:"rgba(255,255,255,0.08)",borderRadius:2,marginBottom:20,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:2,background:"linear-gradient(90deg,#C9A84C,#E8D5A3)",transition:"width 0.4s",width:`${confidence}%`}} />
          </div>

          {!showForm ? (
            <button style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.4)",color:"#E8D5A3",borderRadius:10,padding:"13px 20px",fontSize:14,fontWeight:500,cursor:"pointer",width:"100%",fontFamily:"inherit",touchAction:"manipulation"}}
              onClick={() => setShowForm(true)}>{t.ctaBtn}</button>
          ) : submitted ? (
            <div style={{textAlign:"center",padding:"12px 0"}}>
              <div style={{fontSize:15,fontWeight:600,color:"#fff"}}>✓ {t.thankYou}, {form.name}!</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginTop:4}}>{t.agentCall}</div>
            </div>
          ) : (
            <div style={{marginTop:4,borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:20}}>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:12}}>{t.formTitle}</div>
              {[{ph:t.namePlaceholder, key:"name", type:"text"},{ph:t.phonePlaceholder,key:"phone",type:"tel"}].map(inp => (
                <input key={inp.key} type={inp.type} placeholder={inp.ph} value={form[inp.key]}
                  onChange={e => setForm(p => ({...p,[inp.key]:e.target.value}))}
                  style={{width:"100%",padding:"11px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:14,fontFamily:"inherit",marginBottom:8,boxSizing:"border-box",outline:"none"}} />
              ))}
              <button style={{background:"linear-gradient(135deg,#C9A84C,#A8863A)",color:"#fff",border:"none",borderRadius:10,padding:"12px 20px",fontSize:14,fontWeight:600,cursor:"pointer",width:"100%",fontFamily:"inherit",opacity:loading?0.6:1,touchAction:"manipulation"}}
                onClick={handleSubmit} disabled={loading}>
                {loading ? t.sending : t.callBtn}
              </button>
            </div>
          )}
          <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:12,textAlign:"center"}}>{t.disclaimer}</div>
        </div>
      )}
    </div>
  );
}
