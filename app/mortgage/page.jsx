"use client";
import { useState } from "react";

const BANKS = [
  { id: "tbc", name: "TBC Bank", rate: 10.5 },
  { id: "bog", name: "Bank of Georgia", rate: 11.0 },
  { id: "credo", name: "Credo Bank", rate: 12.5 },
  { id: "liberty", name: "Liberty Bank", rate: 11.5 },
];

const GEL_RATE = 2.69;

const T = {
  ka: {
    title: "იპოთეკის კალკულატორი",
    subtitle: "გამოთვალე თვიური გადასახადი ქართული ბანკებისთვის",
    details: "ბინის დეტალები",
    purchasePrice: "ბინის ფასი ($)",
    downPayment: "პირველი შენატანი (%)",
    loanTerm: "სესხის ვადა (წლები)",
    bank: "ბანკი",
    calculate: "გამოთვლა",
    monthlyPayment: "თვიური გადასახადი",
    downPaymentAmt: "პირველი შენატანი",
    loanAmount: "სესხის თანხა",
    totalInterest: "სულ პროცენტი",
    totalCost: "სულ გადახდა",
    findApt: "ბინას მოძებნა ბიუჯეტის ფარგლებში",
    warning: "ეს მხოლოდ სავარაუდო გათვლებია.",
    back: "← უკან",
    mainPage: "მთავარი გვერდი",
    rental: "იჯარის კალკულატორი",
    yr: "წ",
    month: "თვე",
    year: "წელი",
    enterDetails: "ბინის დეტალები შეიყვანე და დააჩირე გამოთვლას",
  },
  en: {
    title: "Mortgage Calculator",
    subtitle: "Calculate your monthly payments for Georgian banks",
    details: "Property Details",
    purchasePrice: "Property Price ($)",
    downPayment: "Down Payment (%)",
    loanTerm: "Loan Term (years)",
    bank: "Bank",
    calculate: "Calculate",
    monthlyPayment: "Your Monthly Payment",
    downPaymentAmt: "Down payment",
    loanAmount: "Loan amount",
    totalInterest: "Total interest paid",
    totalCost: "Total cost",
    findApt: "Find apartments in my budget",
    warning: "These are estimates only. Actual rates vary by bank, credit score, and property type.",
    back: "Back",
    mainPage: "Main page",
    rental: "Rental Calculator",
    yr: "yr",
    month: "month",
    year: "year",
    enterDetails: "Enter property details and click Calculate",
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
      monthly: Math.round(monthly),
      monthlyGel: Math.round(monthly * GEL_RATE),
      loanAmount: Math.round(loanAmount),
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest),
      bank,
      downPaymentAmount: Math.round(p * dp / 100),
    });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <a href="/" className="text-2xl font-bold text-gray-900">TbilisiPrice.ge</a>
            <p className="text-sm text-gray-500">{t.title}</p>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => setLang(lang === "ka" ? "en" : "ka")}
              style={{touchAction: "manipulation"}}
              className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium">
              {lang === "ka" ? "EN" : "GE"}
            </button>
            <a href="/" className="text-blue-600 text-sm font-medium">{t.back}</a>
          </div>
        </div>
      </header>
      <section className="bg-blue-700 text-white px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-blue-200">{t.subtitle}</p>
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <p className="font-semibold text-gray-800 mb-4">{t.details}</p>
              <label className="block text-sm text-gray-600 mb-1">{t.purchasePrice}</label>
              <input type="number" placeholder="e.g. 80000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm mb-4"
                onChange={e => { setPrice(e.target.value); setResult(null); }} />
              <label className="block text-sm text-gray-600 mb-1">{t.downPayment}</label>
              <div className="flex gap-2 mb-4">
                {["10", "20", "30", "40"].map(opt => (
                  <button key={opt} onClick={() => { setDownPayment(opt); setResult(null); }}
                    style={{touchAction: "manipulation"}}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium ${downPayment === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}>
                    {opt}%
                  </button>
                ))}
              </div>
              <label className="block text-sm text-gray-600 mb-1">{t.loanTerm}</label>
              <div className="flex gap-2 mb-4">
                {["10", "15", "20", "25"].map(opt => (
                  <button key={opt} onClick={() => { setTerm(opt); setResult(null); }}
                    style={{touchAction: "manipulation"}}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium ${term === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}>
                    {opt}{t.yr}
                  </button>
                ))}
              </div>
              <label className="block text-sm text-gray-600 mb-1">{t.bank}</label>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {BANKS.map(bank => (
                  <button key={bank.id} onClick={() => { setSelectedBank(bank.id); setResult(null); }}
                    style={{touchAction: "manipulation"}}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium text-left ${selectedBank === bank.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}>
                    {bank.name}
                    <span className="block text-xs opacity-75">{bank.rate}% / {t.year}</span>
                  </button>
                ))}
              </div>
              <button onClick={calculate} style={{touchAction: "manipulation"}}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg">
                {t.calculate}
              </button>
            </div>
            <div>
              {result ? (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-6">{t.monthlyPayment}</p>
                  <div className="bg-blue-50 rounded-xl p-6 text-center mb-6">
                    <p className="text-5xl font-bold text-blue-700">${result.monthly.toLocaleString()}</p>
                    <p className="text-blue-500 text-lg mt-1">GEL {result.monthlyGel.toLocaleString()} / {t.month}</p>
                    <p className="text-gray-500 text-sm mt-2">{result.bank.name} - {result.bank.rate}%/{t.year}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t.downPaymentAmt}</span>
                      <span className="font-medium">${result.downPaymentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t.loanAmount}</span>
                      <span className="font-medium">${result.loanAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t.totalInterest}</span>
                      <span className="font-medium text-red-500">${result.totalInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-3">
                      <span className="text-gray-500">{t.totalCost}</span>
                      <span className="font-bold">${result.totalPaid.toLocaleString()}</span>
                    </div>
                  </div>
                  <a href="/" className="block text-center mt-6 bg-green-600 text-white py-3 rounded-lg font-medium">
                    {t.findApt}
                  </a>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-center h-64">
                  <p className="text-gray-400 text-center">{t.enterDetails}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-800 text-sm">{t.warning}</p>
          </div>
        </div>
      </section>
      <footer className="border-t border-gray-200 px-6 py-8 mt-12">
        <div className="max-w-4xl mx-auto text-center text-gray-400 text-sm">
          <p>TbilisiPrice.ge</p>
          <div className="mt-3 flex justify-center gap-4">
            <a href="/" className="text-blue-500">{t.mainPage}</a>
            <a href="/rental-yield" className="text-blue-500">{t.rental}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
