"use client";
import { useState } from "react";

const T = {
  ka: {
    title: "იჯარის შემოსავლის კალკულატორი",
    subtitle: "გამოთვალე იჯარის შემოსავალი თბილისის ბინებისთვის",
    hero: "🏠 ყიდვა vs იჯარის კალკულატორი",
    details: "ბინის დეტალები",
    purchasePrice: "შეძენის ფასი ($)",
    monthlyRent: "მოსალოდნელი თვიური იჯარა ($)",
    expenses: "წლიური ხარჯები (იჯარის %)",
    expensesNote: "მოვლა, დაუკავებლობა, გადასახადები და სხვა",
    calculate: "გამოთვლა",
    results: "შედეგები",
    grossYield: "მთლიანი შემოსავალი",
    netYield: "წმინდა შემოსავალი",
    annualIncome: "წლიური შემოსავალი",
    netAnnualIncome: "წმინდა წლიური შემოსავალი",
    breakEven: "ინვესტიციის ამოღების ვადა",
    years: "წელი",
    mortgageNote: "იპოთეკით დაფინანსების შემთხვევაში (TBC 10.5%, 20 წელი)",
    monthlyMortgage: "თვიური იპოთეკა",
    monthlyCashflow: "თვიური ფულადი ნაკადი",
    goodInvestment: "✅ კარგი ინვესტიცია",
    averageInvestment: "⚠️ საშუალო ინვესტიცია",
    badInvestment: "❌ საშუალოზე დაბალი",
    goodNote: "6%-ზე მეტი წმინდა შემოსავალი კარგად ითვლება თბილისისთვის",
    averageNote: "შემოსავალი ზომიერია — შეამოწმე ფასების ზრდის პოტენციალი",
    badNote: "განიხილე შეძენის ფასის შემცირება",
    warning: "⚠️ ეს მხოლოდ სავარაუდო გათვლებია. რეალური შემოსავალი დამოკიდებულია დაკავებლობის მაჩვენებელზე, მართვის ხარჯებზე და საბაზრო პირობებზე.",
    enter: "შეიყვანე ბინის დეტალები და დააჭირე გამოთვლას",
    back: "← უკან",
    mainPage: "მთავარი გვერდი",
    mortgage: "იპოთეკის კალკულატორი",
  },
  en: {
    title: "Rental Yield Calculator",
    subtitle: "Calculate rental yield and return on investment for Tbilisi apartments",
    hero: "🏠 Buy vs Rent Calculator",
    details: "Apartment Details",
    purchasePrice: "Purchase Price ($)",
    monthlyRent: "Expected Monthly Rent ($)",
    expenses: "Annual Expenses (% of rent)",
    expensesNote: "Maintenance, vacancy, taxes etc.",
    calculate: "Calculate",
    results: "Results",
    grossYield: "Gross Yield",
    netYield: "Net Yield",
    annualIncome: "Annual rental income",
    netAnnualIncome: "Net annual income",
    breakEven: "Break-even period",
    years: "years",
    mortgageNote: "If financed with mortgage (TBC 10.5%, 20yr)",
    monthlyMortgage: "Monthly mortgage",
    monthlyCashflow: "Monthly cashflow",
    goodInvestment: "✅ Good investment",
    averageInvestment: "⚠️ Average investment",
    badInvestment: "❌ Below average",
    goodNote: "Net yield above 6% is considered strong for Tbilisi",
    averageNote: "Yield is moderate — check if price appreciation offsets",
    badNote: "Consider negotiating a lower purchase price",
    warning: "⚠️ These are estimates only. Actual returns depend on occupancy rate, management costs, taxes, and market conditions.",
    enter: "Enter apartment details and click Calculate",
    back: "← Back",
    mainPage: "Main page",
    mortgage: "Mortgage Calculator",
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
    const monthlyMortgage = (price * 0.8 * (0.105 / 12) * Math.pow(1 + 0.105 / 12, 240)) / (Math.pow(1 + 0.105 / 12, 240) - 1);
    const cashflow = rent - monthlyMortgage;
    setResult({
      grossYield: grossYield.toFixed(1),
      netYield: netYield.toFixed(1),
      breakEvenYears: breakEvenYears.toFixed(1),
      annualRent: Math.round(annualRent),
      netAnnualRent: Math.round(netAnnualRent),
      monthlyMortgage: Math.round(monthlyMortgage),
      cashflow: Math.round(cashflow),
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
          <h1 className="text-3xl font-bold mb-2">{t.hero}</h1>
          <p className="text-blue-200">{t.subtitle}</p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <p className="font-semibold text-gray-800 mb-6 text-lg">{t.details}</p>
              <label className="block text-sm text-gray-600 mb-1">{t.purchasePrice}</label>
              <input type="number" placeholder="e.g. 120000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm mb-4"
                onChange={e => { setPurchasePrice(e.target.value); setResult(null); }} />
              <label className="block text-sm text-gray-600 mb-1">{t.monthlyRent}</label>
              <input type="number" placeholder="e.g. 700"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm mb-4"
                onChange={e => { setMonthlyRent(e.target.value); setResult(null); }} />
              <label className="block text-sm text-gray-600 mb-1">{t.expenses}</label>
              <p className="text-xs text-gray-400 mb-2">{t.expensesNote}</p>
              <div className="flex gap-2 mb-6">
                {["5", "10", "15", "20"].map(opt => (
                  <button key={opt} onClick={() => { setExpenses(opt); setResult(null); }}
                    style={{touchAction: "manipulation"}}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium ${expenses === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}>
                    {opt}%
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
                  <p className="font-semibold text-gray-800 mb-6 text-lg">{t.results}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-green-700">{result.grossYield}%</p>
                      <p className="text-green-600 text-sm mt-1">{t.grossYield}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-blue-700">{result.netYield}%</p>
                      <p className="text-blue-600 text-sm mt-1">{t.netYield}</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t.annualIncome}</span>
                      <span className="font-medium">${result.annualRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t.netAnnualIncome}</span>
                      <span className="font-medium">${result.netAnnualRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-3">
                      <span className="text-gray-500">{t.breakEven}</span>
                      <span className="font-bold text-gray-800">{result.breakEvenYears} {t.years}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="font-semibold text-gray-700 mb-3 text-sm">{t.mortgageNote}</p>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">{t.monthlyMortgage}</span>
                      <span className="font-medium">${result.monthlyMortgage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t.monthlyCashflow}</span>
                      <span className={`font-bold ${result.cashflow >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {result.cashflow >= 0 ? "+" : ""}${result.cashflow.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${parseFloat(result.netYield) >= 6 ? "bg-green-50 border border-green-200" : parseFloat(result.netYield) >= 4 ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"}`}>
                    <p className="font-bold text-lg">
                      {parseFloat(result.netYield) >= 6 ? t.goodInvestment : parseFloat(result.netYield) >= 4 ? t.averageInvestment : t.badInvestment}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {parseFloat(result.netYield) >= 6 ? t.goodNote : parseFloat(result.netYield) >= 4 ? t.averageNote : t.badNote}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-center h-64">
                  <p className="text-gray-400 text-center">{t.enter}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-800 text-sm">{t.warning}</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 px-6 py-8 mt-8">
        <div className="max-w-4xl mx-auto text-center text-gray-400 text-sm">
          <p>TbilisiPrice.ge</p>
          <div className="mt-3 flex justify-center gap-4">
            <a href="/" className="text-blue-500">{t.mainPage}</a>
            <a href="/mortgage" className="text-blue-500">{t.mortgage}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}