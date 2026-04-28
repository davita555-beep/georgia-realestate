"use client";
import { useState } from "react";

const BANKS = [
  { id: "tbc",     name: "TBC Bank",         rate: 10.5 },
  { id: "bog",     name: "Bank of Georgia",   rate: 11.0 },
  { id: "credo",   name: "Credo Bank",        rate: 12.5 },
  { id: "liberty", name: "Liberty Bank",      rate: 11.5 },
];

const GEL_RATE = 2.69;

const T = {
  ka: {
    title: "იპოთეკის კალკულატორი", subtitle: "გამოთვალე თვიური გადასახადი ქართული ბანკებისთვის",
    details: "ბინის დეტალები", purchasePrice: "ბინის ფასი ($)", downPayment: "პირველი შენატანი (%)",
    loanTerm: "სესხის ვადა (წლები)", bank: "ბანკი", calculate: "გამოთვლა",
    monthlyPayment: "თვიური გადასახადი", downPaymentAmt: "პირველი შენატანი",
    loanAmount: "სესხის თანხა", totalInterest: "სულ პროცენტი", totalCost: "სულ გადახდა",
    findApt: "ბინის მოძებნა ბიუჯეტის ფარგლებში",
    warning: "ეს მხოლოდ სავარაუდო გათვლებია. რეალური განაკვეთები განსხვავდება.",
    back: "← უკან", mainPage: "მთავარი", rental: "იჯარის კალკულატორი",
    yr: "წ", month: "/ თვე", year: "წელი", enterDetails: "შეიყვანეთ ბინის დეტალები",
    perYear: "/ წელი", tagline: "ბინის ფასების შემოწმება — თბილისი 2026",
  },
  en: {
    title: "Mortgage Calculator", subtitle: "Calculate your monthly payments for Georgian banks",
    details: "Property Details", purchasePrice: "Property Price ($)", downPayment: "Down Payment (%)",
    loanTerm: "Loan Term (years)", bank: "Bank", calculate: "Calculate",
    monthlyPayment: "Monthly Payment", downPaymentAmt: "Down payment",
    loanAmount: "Loan amount", totalInterest: "Total interest paid", totalCost: "Total cost",
    findApt: "Find apartments in my budget",
    warning: "Estimates only. Actual rates vary by bank, credit score, and property type.",
    back: "← Back", mainPage: "Home", rental: "Rental Calculator",
    yr: "yr", month: "/ mo", year: "year", enterDetails: "Enter property details to calculate",
    perYear: "/ yr", tagline: "Apartment Price Checker — Tbilisi 2026",
  }
};

export default function MortgagePage() {
  const [lang, setLang] = useState("ka");
  const t = T[lang];
  const [price, setPrice] = useState("");
  const [downPayment, setDownPayment] = useState("20");
  const [term, setTerm] = useState("20");
  const [selectedBank, setSelectedBank] = useState("tbc");
  const [result, setResult] = useState(null);

  function calculate() {
    const p = parseFloat(price);
    const dp = parseFloat(downPayment);
    const years = parseFloat(term);
    if (!p || !dp || !years) return;
    const bank = BANKS.find(b => b.id === selectedBank);
    const loanAmount = p * (1 - dp / 100);
    const monthlyRate = bank.rate / 100 / 12;
    const n = years * 12;
    const monthly = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - loanAmount;
    setResult({
      monthly: Math.round(monthly), monthlyGel: Math.round(monthly * GEL_RATE),
      loanAmount: Math.round(loanAmount), totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest), bank,
      downPaymentAmount: Math.round(p * dp / 100),
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
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"rgba(201,168,76,0.8)"}}>Financial Tools</p>
          <h1 className="font-bold mb-3" style={{fontSize:"clamp(32px,5vw,52px)",color:"#fff",letterSpacing:"-0.02em"}}>{t.title}</h1>
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
              <input type="number" placeholder="e.g. 80000"
                className="w-full border rounded-xl px-4 py-3 text-sm mb-6 outline-none transition-all"
                style={{borderColor:"#E2E8F0",color:"#0B1C3D"}}
                onFocus={e=>e.target.style.borderColor="#2D5299"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}
                onChange={e => { setPrice(e.target.value); setResult(null); }} />

              <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"#64748B"}}>{t.downPayment}</label>
              <div className="flex gap-2 mb-6">
                {["10","20","30","40"].map(opt => (
                  <button key={opt} onClick={() => { setDownPayment(opt); setResult(null); }}
                    style={{touchAction:"manipulation",flex:1,padding:"10px 0",borderRadius:10,fontSize:13,fontWeight:600,transition:"all 0.2s",
                      background:downPayment===opt?"linear-gradient(135deg,#0B1C3D,#1E3A6E)":"#F8FAFC",
                      color:downPayment===opt?"#fff":"#64748B",
                      border:downPayment===opt?"none":"1.5px solid #E2E8F0"}}>
                    {opt}%
                  </button>
                ))}
              </div>

              <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"#64748B"}}>{t.loanTerm}</label>
              <div className="flex gap-2 mb-6">
                {["10","15","20","25"].map(opt => (
                  <button key={opt} onClick={() => { setTerm(opt); setResult(null); }}
                    style={{touchAction:"manipulation",flex:1,padding:"10px 0",borderRadius:10,fontSize:13,fontWeight:600,transition:"all 0.2s",
                      background:term===opt?"linear-gradient(135deg,#0B1C3D,#1E3A6E)":"#F8FAFC",
                      color:term===opt?"#fff":"#64748B",
                      border:term===opt?"none":"1.5px solid #E2E8F0"}}>
                    {opt}{t.yr}
                  </button>
                ))}
              </div>

              <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"#64748B"}}>{t.bank}</label>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {BANKS.map(bank => (
                  <button key={bank.id} onClick={() => { setSelectedBank(bank.id); setResult(null); }}
                    style={{touchAction:"manipulation",padding:"12px 16px",borderRadius:12,fontSize:13,fontWeight:500,textAlign:"left",transition:"all 0.2s",
                      background:selectedBank===bank.id?"linear-gradient(135deg,#0B1C3D,#1E3A6E)":"#F8FAFC",
                      color:selectedBank===bank.id?"#fff":"#64748B",
                      border:selectedBank===bank.id?"none":"1.5px solid #E2E8F0"}}>
                    <span className="block font-semibold">{bank.name}</span>
                    <span className="text-xs" style={{opacity:0.75}}>{bank.rate}%{t.perYear}</span>
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
                  <p className="font-bold text-lg mb-6" style={{color:"#0B1C3D"}}>{t.monthlyPayment}</p>

                  {/* Monthly highlight */}
                  <div className="rounded-2xl p-8 text-center mb-8" style={{background:"linear-gradient(135deg,#0B1C3D,#1E3A6E)"}}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"rgba(201,168,76,0.8)"}}>USD</p>
                    <p className="font-bold" style={{fontSize:52,color:"#fff",letterSpacing:"-0.03em",lineHeight:1}}>${result.monthly.toLocaleString()}</p>
                    <p className="mt-2 font-medium" style={{color:"rgba(255,255,255,0.5)",fontSize:15}}>{t.month}</p>
                    <div className="mt-4 pt-4" style={{borderTop:"1px solid rgba(255,255,255,0.1)"}}>
                      <p style={{color:"rgba(201,168,76,0.9)",fontSize:22,fontWeight:600}}>₾ {result.monthlyGel.toLocaleString()}{t.month}</p>
                      <p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.35)"}}>{result.bank.name} · {result.bank.rate}%/{t.year}</p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-4 mb-8">
                    {[
                      {label:t.downPaymentAmt, val:`$${result.downPaymentAmount.toLocaleString()}`, color:"#0B1C3D"},
                      {label:t.loanAmount,      val:`$${result.loanAmount.toLocaleString()}`,      color:"#0B1C3D"},
                      {label:t.totalInterest,   val:`$${result.totalInterest.toLocaleString()}`,   color:"#DC2626"},
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center py-3" style={{borderBottom:"1px solid #F1F5F9"}}>
                        <span className="text-sm" style={{color:"#64748B"}}>{row.label}</span>
                        <span className="font-semibold text-sm" style={{color:row.color}}>{row.val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold" style={{color:"#0B1C3D"}}>{t.totalCost}</span>
                      <span className="font-bold text-lg" style={{color:"#0B1C3D"}}>${result.totalPaid.toLocaleString()}</span>
                    </div>
                  </div>

                  <a href="/"
                    style={{display:"block",textAlign:"center",background:"rgba(201,168,76,0.1)",border:"1.5px solid rgba(201,168,76,0.4)",color:"#A8863A",borderRadius:12,padding:"13px",fontSize:14,fontWeight:600,textDecoration:"none"}}>
                    {t.findApt}
                  </a>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 flex items-center justify-center" style={{boxShadow:"0 8px 40px rgba(11,28,61,0.08)",border:"1px solid #E2E8F0",minHeight:320}}>
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏦</div>
                    <p style={{color:"#94A3B8",fontSize:15}}>{t.enterDetails}</p>
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
            <a href="/rental-yield" style={{color:"rgba(255,255,255,0.5)",fontSize:13,textDecoration:"none"}}>{t.rental}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
