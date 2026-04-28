"use client";
import { useState } from "react";

const T = {
  ka: {
    title: "იჯარის შემოსავლის კალკულატორი", subtitle: "გამოთვალე იჯარის შემოსავალი თბილისის ბინებისთვის",
    hero: "ყიდვა vs იჯარის კალკულატორი", details: "ბინის დეტალები",
    purchasePrice: "შეძენის ფასი ($)", monthlyRent: "მოსალოდნელი თვიური იჯარა ($)",
    expenses: "წლიური ხარჯები (იჯარის %)", expensesNote: "მოვლა, დაუკავებლობა, გადასახადები",
    calculate: "გამოთვლა", results: "შედეგები",
    grossYield: "მთლიანი შემოსავალი", netYield: "წმინდა შემოსავალი",
    annualIncome: "წლიური შემოსავალი", netAnnualIncome: "წმინდა წლიური შემოსავალი",
    breakEven: "ინვესტიციის ამოღების ვადა", years: "წელი",
    mortgageNote: "იპოთეკით (TBC 10.5%, 20 წელი)", monthlyMortgage: "თვიური იპოთეკა",
    monthlyCashflow: "თვიური ფულადი ნაკადი",
    goodInvestment: "კარგი ინვესტიცია", averageInvestment: "საშუალო ინვესტიცია", badInvestment: "საშუალოზე დაბალი",
    goodNote: "6%-ზე მეტი წმინდა შემოსავალი კარგია თბილისისთვის",
    averageNote: "ზომიერი შემოსავალი — შეამოწმე ფასების ზრდის პოტენციალი",
    badNote: "განიხილე შეძენის ფასის შემცირება",
    warning: "ეს მხოლოდ სავარაუდო გათვლებია. რეალური შემოსავალი დამოკიდებულია დაკავებლობის მაჩვენებელზე.",
    enter: "შეიყვანე ბინის დეტალები და დააჭირე გამოთვლას",
    back: "← უკან", mainPage: "მთავარი", mortgage: "იპოთეკის კალკულატორი",
    tagline: "ბინის ფასების შემოწმება — თბილისი 2026",
  },
  en: {
    title: "Rental Yield Calculator", subtitle: "Calculate rental yield and ROI for Tbilisi apartments",
    hero: "Buy vs Rent Calculator", details: "Apartment Details",
    purchasePrice: "Purchase Price ($)", monthlyRent: "Expected Monthly Rent ($)",
    expenses: "Annual Expenses (% of rent)", expensesNote: "Maintenance, vacancy, taxes etc.",
    calculate: "Calculate", results: "Results",
    grossYield: "Gross Yield", netYield: "Net Yield",
    annualIncome: "Annual rental income", netAnnualIncome: "Net annual income",
    breakEven: "Break-even period", years: "years",
    mortgageNote: "If financed with mortgage (TBC 10.5%, 20yr)", monthlyMortgage: "Monthly mortgage",
    monthlyCashflow: "Monthly cashflow",
    goodInvestment: "Good Investment", averageInvestment: "Average Investment", badInvestment: "Below Average",
    goodNote: "Net yield above 6% is considered strong for Tbilisi",
    averageNote: "Yield is moderate — check if price appreciation offsets",
    badNote: "Consider negotiating a lower purchase price",
    warning: "Estimates only. Actual returns depend on occupancy rate, management costs, taxes, and market conditions.",
    enter: "Enter apartment details and click Calculate",
    back: "← Back", mainPage: "Home", mortgage: "Mortgage Calculator",
    tagline: "Apartment Price Checker — Tbilisi 2026",
  }
};

export default function RentalYieldPage() {
  const [lang, setLang] = useState("ka");
  const t = T[lang];
  const [purchasePrice, setPurchasePrice] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [expenses, setExpenses] = useState("10");
  const [result, setResult] = useState(null);

  function calculate() {
    const price = parseFloat(purchasePrice);
    const rent = parseFloat(monthlyRent);
    const exp = parseFloat(expenses) / 100;
    if (!price || !rent) return;
    const annualRent = rent * 12;
    const annualExpenses = annualRent * exp;
    const netAnnualRent = annualRent - annualExpenses;
    const grossYield = (annualRent / price) * 100;
    const netYield = (netAnnualRent / price) * 100;
    const breakEvenYears = price / netAnnualRent;
    const monthlyMortgage = (price * 0.8 * (0.105/12) * Math.pow(1+0.105/12,240)) / (Math.pow(1+0.105/12,240)-1);
    const cashflow = rent - monthlyMortgage;
    setResult({
      grossYield: grossYield.toFixed(1), netYield: netYield.toFixed(1),
      breakEvenYears: breakEvenYears.toFixed(1), annualRent: Math.round(annualRent),
      netAnnualRent: Math.round(netAnnualRent), monthlyMortgage: Math.round(monthlyMortgage),
      cashflow: Math.round(cashflow),
    });
  }

  return (
    <main className="min-h-screen" style={{background:"#FAFAF8"}}>

      {/* Header */}
      <header style={{background:"rgba(11,28,61,0.97)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(201,168,76,0.2)",position:"sticky",top:0,zIndex:50}}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div style={{width:36,height:36,background:"linear-gradient(135deg,#C9A84C,#A8863A)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontWeight:800,fontSize:14}}>TP</span>
            </div>
            <div>
              <a href="/" className="font-bold text-white text-lg" style={{textDecoration:"none"}}>TbilisiPrice.ge</a>
              <p className="text-xs hidden sm:block" style={{color:"rgba(201,168,76,0.8)"}}>{t.tagline}</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => setLang(lang==="ka"?"en":"ka")}
              style={{touchAction:"manipulation",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.8)",background:"transparent",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:500}}>
              {lang==="ka"?"EN":"GE"}
            </button>
            <a href="/" style={{color:"#C9A84C",fontSize:13,fontWeight:500,textDecoration:"none"}}>{t.back}</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#0B1C3D 0%,#1E3A6E 55%,#0B2A4A 100%)",padding:"72px 24px 64px"}}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"rgba(201,168,76,0.8)"}}>Investment Analysis</p>
          <h1 className="font-bold mb-3" style={{fontSize:"clamp(32px,5vw,52px)",color:"#fff",letterSpacing:"-0.02em"}}>{t.hero}</h1>
          <p style={{color:"rgba(255,255,255,0.55)",fontSize:16}}>{t.subtitle}</p>
        </div>
      </section>

      {/* Calculator */}
      <section style={{padding:"64px 24px"}}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Input card */}
            <div className="bg-white rounded-2xl p-8" style={{boxShadow:"0 8px 40px rgba(11,28,61,0.08)",border:"1px solid #E2E8F0"}}>
              <p className="font-bold text-lg mb-6" style={{color:"#0B1C3D"}}>{t.details}</p>

              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"#64748B"}}>{t.purchasePrice}</label>
              <input type="number" placeholder="e.g. 120000"
                className="w-full border rounded-xl px-4 py-3 text-sm mb-6 outline-none transition-all"
                style={{borderColor:"#E2E8F0",color:"#0B1C3D"}}
                onFocus={e=>e.target.style.borderColor="#2D5299"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}
                onChange={e => { setPurchasePrice(e.target.value); setResult(null); }} />

              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"#64748B"}}>{t.monthlyRent}</label>
              <input type="number" placeholder="e.g. 700"
                className="w-full border rounded-xl px-4 py-3 text-sm mb-6 outline-none transition-all"
                style={{borderColor:"#E2E8F0",color:"#0B1C3D"}}
                onFocus={e=>e.target.style.borderColor="#2D5299"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}
                onChange={e => { setMonthlyRent(e.target.value); setResult(null); }} />

              <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{color:"#64748B"}}>{t.expenses}</label>
              <p className="text-xs mb-3" style={{color:"#94A3B8"}}>{t.expensesNote}</p>
              <div className="flex gap-2 mb-8">
                {["5","10","15","20"].map(opt => (
                  <button key={opt} onClick={() => { setExpenses(opt); setResult(null); }}
                    style={{touchAction:"manipulation",flex:1,padding:"10px 0",borderRadius:10,fontSize:13,fontWeight:600,transition:"all 0.2s",
                      background:expenses===opt?"linear-gradient(135deg,#0B1C3D,#1E3A6E)":"#F8FAFC",
                      color:expenses===opt?"#fff":"#64748B",
                      border:expenses===opt?"none":"1.5px solid #E2E8F0"}}>
                    {opt}%
                  </button>
                ))}
              </div>

              <button onClick={calculate} style={{touchAction:"manipulation",width:"100%",background:"linear-gradient(135deg,#C9A84C,#A8863A)",border:"none",color:"#fff",borderRadius:12,padding:"15px",fontSize:15,fontWeight:700}}>
                {t.calculate}
              </button>
            </div>

            {/* Result card */}
            <div>
              {result ? (
                <div className="bg-white rounded-2xl p-8" style={{boxShadow:"0 8px 40px rgba(11,28,61,0.08)",border:"1px solid #E2E8F0"}}>
                  <p className="font-bold text-lg mb-6" style={{color:"#0B1C3D"}}>{t.results}</p>

                  {/* Yield cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-2xl p-5 text-center" style={{background:"rgba(16,185,129,0.07)",border:"1.5px solid rgba(16,185,129,0.25)"}}>
                      <p className="font-bold" style={{fontSize:36,color:"#059669",letterSpacing:"-0.02em"}}>{result.grossYield}%</p>
                      <p className="text-xs font-semibold uppercase tracking-widest mt-1" style={{color:"#059669"}}>{t.grossYield}</p>
                    </div>
                    <div className="rounded-2xl p-5 text-center" style={{background:"rgba(11,28,61,0.05)",border:"1.5px solid rgba(11,28,61,0.15)"}}>
                      <p className="font-bold" style={{fontSize:36,color:"#0B1C3D",letterSpacing:"-0.02em"}}>{result.netYield}%</p>
                      <p className="text-xs font-semibold uppercase tracking-widest mt-1" style={{color:"#64748B"}}>{t.netYield}</p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3 mb-6">
                    {[
                      {label:t.annualIncome,    val:`$${result.annualRent.toLocaleString()}`},
                      {label:t.netAnnualIncome, val:`$${result.netAnnualRent.toLocaleString()}`},
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center py-2" style={{borderBottom:"1px solid #F1F5F9"}}>
                        <span className="text-sm" style={{color:"#64748B"}}>{row.label}</span>
                        <span className="font-semibold text-sm" style={{color:"#0B1C3D"}}>{row.val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-semibold text-sm" style={{color:"#0B1C3D"}}>{t.breakEven}</span>
                      <span className="font-bold" style={{color:"#0B1C3D"}}>{result.breakEvenYears} {t.years}</span>
                    </div>
                  </div>

                  {/* Mortgage comparison */}
                  <div className="rounded-xl p-5 mb-5" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{color:"#64748B"}}>{t.mortgageNote}</p>
                    {[
                      {label:t.monthlyMortgage, val:`$${result.monthlyMortgage.toLocaleString()}`, color:"#0B1C3D"},
                      {label:t.monthlyCashflow, val:`${result.cashflow>=0?"+":""}$${result.cashflow.toLocaleString()}`, color:result.cashflow>=0?"#059669":"#DC2626"},
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center py-2" style={{borderBottom:"1px solid #E2E8F0"}}>
                        <span className="text-sm" style={{color:"#64748B"}}>{row.label}</span>
                        <span className="font-bold text-sm" style={{color:row.color}}>{row.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Verdict */}
                  {(() => {
                    const n = parseFloat(result.netYield);
                    const isGood = n >= 6, isAvg = n >= 4;
                    return (
                      <div className="rounded-xl p-5 text-center" style={{
                        background: isGood ? "rgba(16,185,129,0.07)" : isAvg ? "rgba(201,168,76,0.08)" : "rgba(239,68,68,0.06)",
                        border: `1.5px solid ${isGood ? "rgba(16,185,129,0.3)" : isAvg ? "rgba(201,168,76,0.35)" : "rgba(239,68,68,0.25)"}`,
                      }}>
                        <p className="font-bold text-base" style={{color: isGood?"#059669":isAvg?"#A8863A":"#DC2626"}}>
                          {isGood ? "✅ "+t.goodInvestment : isAvg ? "⚠️ "+t.averageInvestment : "❌ "+t.badInvestment}
                        </p>
                        <p className="text-xs mt-1" style={{color:"#64748B"}}>
                          {isGood ? t.goodNote : isAvg ? t.averageNote : t.badNote}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 flex items-center justify-center" style={{boxShadow:"0 8px 40px rgba(11,28,61,0.08)",border:"1px solid #E2E8F0",minHeight:320}}>
                  <div className="text-center">
                    <div className="text-4xl mb-4">📈</div>
                    <p style={{color:"#94A3B8",fontSize:15}}>{t.enter}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 rounded-xl p-5" style={{background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.25)"}}>
            <p className="text-sm" style={{color:"#A8863A"}}>⚠️ {t.warning}</p>
          </div>
        </div>
      </section>

      <footer style={{background:"#0B1C3D",padding:"40px 24px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-bold text-white">TbilisiPrice.ge</span>
          <div className="flex gap-6">
            <a href="/" style={{color:"rgba(255,255,255,0.5)",fontSize:13,textDecoration:"none"}}>{t.mainPage}</a>
            <a href="/mortgage" style={{color:"rgba(255,255,255,0.5)",fontSize:13,textDecoration:"none"}}>{t.mortgage}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
