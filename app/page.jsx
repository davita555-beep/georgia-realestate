"use client";
import { useState } from "react";

const FINISH_TYPES = [
  { id: "black", ka: "შავი კარკასი", en: "Black Frame", desc: "Bare concrete shell", multiplier: 1.0, color: "bg-gray-100 text-gray-700 border-gray-300" },
  { id: "white", ka: "თეთრი კარკასი", en: "White Frame", desc: "Plastered, utilities installed", multiplier: 1.13, color: "bg-blue-50 text-blue-700 border-blue-300" },
  { id: "green", ka: "მწვანე კარკასი", en: "Green Frame", desc: "Semi-finished, flooring included", multiplier: 1.18, color: "bg-green-50 text-green-700 border-green-300" },
  { id: "renovated", ka: "გარემონტებული", en: "Renovated", desc: "Fully finished, move-in ready", multiplier: 1.32, color: "bg-amber-50 text-amber-700 border-amber-300" },
];

export default function Home() {
  const districts = [
    { name: "Vake", nameKa: "ვაკე", avgPrice: 2380, change: 20, type: "premium" },
    { name: "Mtatsminda", nameKa: "მთაწმინდა", avgPrice: 2293, change: 7, type: "premium" },
    { name: "Vera", nameKa: "ვერა", avgPrice: 1950, change: 8, type: "premium" },
    { name: "Saburtalo", nameKa: "საბურთალო", avgPrice: 1602, change: 5, type: "mid" },
    { name: "Chughureti", nameKa: "ჩუღურეთი", avgPrice: 1455, change: 7, type: "mid" },
    { name: "Krtsanisi", nameKa: "კრწანისი", avgPrice: 1451, change: 3, type: "mid" },
    { name: "Didube", nameKa: "დიდუბე", avgPrice: 1236, change: -1, type: "mid" },
    { name: "Isani", nameKa: "ისანი", avgPrice: 1195, change: 2, type: "mid" },
    { name: "Nadzaladevi", nameKa: "ნაძალადევი", avgPrice: 1123, change: -3, type: "mid" },
    { name: "Avlabari", nameKa: "ავლაბარი", avgPrice: 1150, change: 6, type: "mid" },
    { name: "Didi Dighomi", nameKa: "დიდი დიღომი", avgPrice: 1142, change: 3, type: "affordable" },
    { name: "Samgori", nameKa: "სამგორი", avgPrice: 1138, change: 12, type: "affordable" },
    { name: "Gldani", nameKa: "გლდანი", avgPrice: 1134, change: 1, type: "affordable" },
    { name: "Vashlijvari", nameKa: "ვაშლიჯვარი", avgPrice: 1050, change: 5, type: "affordable" },
    { name: "Ortachala", nameKa: "ორთაჭალა", avgPrice: 980, change: 4, type: "affordable" },
    { name: "Vazisubani", nameKa: "ვაზისუბანი", avgPrice: 920, change: 2, type: "affordable" },
    { name: "Varketili", nameKa: "ვარკეთილი", avgPrice: 900, change: 3, type: "affordable" },
    { name: "Tskneti", nameKa: "წყნეთი", avgPrice: 850, change: 3, type: "affordable" },
    { name: "Lilo", nameKa: "ლილო", avgPrice: 800, change: 2, type: "affordable" },
    { name: "Ponichala", nameKa: "პონიჭალა", avgPrice: 750, change: 1, type: "affordable" },
  ];

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFinish, setSelectedFinish] = useState("black");
  const [gridFinish, setGridFinish] = useState("black");

  const [formData, setFormData] = useState({
    budget: "", purpose: "", district: "", propertyType: "",
    timeline: "", financing: "", whatsapp: "", name: "",
  });

  function openForm() {
    setShowForm(true);
    setFormStep(1);
    setSubmitted(false);
  }

  function getSizeAdjustment(sqm) {
    if (sqm < 35) return 1.35;
    if (sqm < 50) return 1.20;
    if (sqm < 75) return 1.00;
    if (sqm < 125) return 0.90;
    return 0.80;
  }

  function getFinishMultiplier(id) {
    return FINISH_TYPES.find(f => f.id === id)?.multiplier || 1.0;
  }

  function checkPrice() {
    const districts = [
  { name: "Vake", nameKa: "ვაკე", avgPrice: 2860, change: 20, type: "premium" },
  { name: "Mtatsminda", nameKa: "მთაწმინდა", avgPrice: 2400, change: 7, type: "premium" },
  { name: "Vera", nameKa: "ვერა", avgPrice: 2200, change: 8, type: "premium" },
  { name: "Saburtalo", nameKa: "საბურთალო", avgPrice: 1850, change: 5, type: "mid" },
  { name: "Chughureti", nameKa: "ჩუღურეთი", avgPrice: 1700, change: 7, type: "mid" },
  { name: "Krtsanisi", nameKa: "კრწანისი", avgPrice: 1805, change: 3, type: "mid" },
  { name: "Didube", nameKa: "დიდუბე", avgPrice: 1600, change: -1, type: "mid" },
  { name: "Isani", nameKa: "ისანი", avgPrice: 1510, change: 2, type: "mid" },
  { name: "Nadzaladevi", nameKa: "ნაძალადევი", avgPrice: 1760, change: -3, type: "mid" },
  { name: "Avlabari", nameKa: "ავლაბარი", avgPrice: 1500, change: 6, type: "mid" },
  { name: "Didi Dighomi", nameKa: "დიდი დიღომი", avgPrice: 1390, change: 3, type: "affordable" },
  { name: "Samgori", nameKa: "სამგორი", avgPrice: 1450, change: 12, type: "affordable" },
  { name: "Gldani", nameKa: "გლდანი", avgPrice: 1370, change: 1, type: "affordable" },
  { name: "Vashlijvari", nameKa: "ვაშლიჯვარი", avgPrice: 1200, change: 5, type: "affordable" },
  { name: "Ortachala", nameKa: "ორთაჭალა", avgPrice: 1805, change: 4, type: "affordable" },
  { name: "Vazisubani", nameKa: "ვაზისუბანი", avgPrice: 1110, change: 2, type: "affordable" },
  { name: "Varketili", nameKa: "ვარკეთილი", avgPrice: 1315, change: 3, type: "affordable" },
  { name: "Tskneti", nameKa: "წყნეთი", avgPrice: 1250, change: 3, type: "affordable" },
  { name: "Lilo", nameKa: "ლილო", avgPrice: 2080, change: 2, type: "affordable" },
  { name: "Ponichala", nameKa: "პონიჭალა", avgPrice: 848, change: 1, type: "affordable" },
];

  function calcScore() {
    let score = 0;
    if (formData.financing === "Cash") score += 4;
    if (formData.financing === "Mortgage - approved") score += 3;
    if (formData.financing === "Mortgage - not yet") score += 1;
    if (formData.timeline === "Within 1 month") score += 4;
    if (formData.timeline === "1-3 months") score += 3;
    if (formData.timeline === "3-6 months") score += 2;
    if (formData.budget === "$150,000+") score += 3;
    if (formData.budget === "$80,000 - $150,000") score += 2;
    if (formData.budget === "$40,000 - $80,000") score += 1;
    return score;
  }

  async function submitForm() {
    if (!formData.whatsapp || !formData.name) {
      alert("Please enter your name and WhatsApp number");
      return;
    }
    setSubmitting(true);
    const score = calcScore();
    const priority = score >= 7 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW";
    try {
      await fetch("https://sheetdb.io/api/v1/4953u0ddyx7rn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            Date: new Date().toLocaleDateString(),
            Name: formData.name,
            WhatsApp: formData.whatsapp,
            Budget: formData.budget,
            Purpose: formData.purpose,
            District: formData.district,
            "Property Type": formData.propertyType,
            Timeline: formData.timeline,
            Financing: formData.financing,
            Score: score,
            Priority: priority,
          }
        }),
      });
      setSubmitted(true);
    } catch(e) {
      alert("Something went wrong, please try again");
    }
    setSubmitting(false);
  }

  if (showForm) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg mx-auto p-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
              <p className="text-gray-600 mb-6">We will contact you on WhatsApp within 24 hours with apartments matching your criteria.</p>
              <button onClick={() => { setShowForm(false); setSubmitted(false); setFormStep(1); }}
                style={{touchAction: "manipulation"}}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium w-full">
                Back to prices
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Find my apartment</h2>
                <span className="text-sm text-gray-400">Step {formStep} of 3</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{width: `${(formStep/3)*100}%`}}></div>
              </div>

              {formStep === 1 && (
                <div>
                  <p className="font-semibold text-gray-800 mb-4">What is your budget?</p>
                  {["Under $40,000", "$40,000 - $80,000", "$80,000 - $150,000", "$150,000+"].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, budget: opt})}
                      style={{touchAction: "manipulation"}}
                      className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium ${formData.budget === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>
                      {opt}
                    </button>
                  ))}
                  <p className="font-semibold text-gray-800 mb-4 mt-6">Own use or investment?</p>
                  {["Own use", "Investment / rental", "Both"].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, purpose: opt})}
                      style={{touchAction: "manipulation"}}
                      className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium ${formData.purpose === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>
                      {opt}
                    </button>
                  ))}
                  <button onClick={() => { if(!formData.budget || !formData.purpose) { alert("Please answer both questions"); return; } setFormStep(2); }}
                    style={{touchAction: "manipulation"}}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mt-4">
                    Next &gt;
                  </button>
                </div>
              )}

              {formStep === 2 && (
                <div>
                  <p className="font-semibold text-gray-800 mb-4">Preferred district?</p>
                  <select onChange={e => setFormData({...formData, district: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-700 text-sm mb-6">
                    <option value="">Select district</option>
                    {districts.map(d => (
                      <option key={d.name} value={d.name}>{d.name} — {d.nameKa}</option>
                    ))}
                    <option value="Open to suggestions">Open to suggestions</option>
                  </select>
                  <p className="font-semibold text-gray-800 mb-4">New build or resale?</p>
                  {["New build", "Resale", "No preference"].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, propertyType: opt})}
                      style={{touchAction: "manipulation"}}
                      className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium ${formData.propertyType === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>
                      {opt}
                    </button>
                  ))}
                  <p className="font-semibold text-gray-800 mb-4 mt-6">How soon are you buying?</p>
                  {["Within 1 month", "1-3 months", "3-6 months", "Just browsing"].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, timeline: opt})}
                      style={{touchAction: "manipulation"}}
                      className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium ${formData.timeline === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>
                      {opt}
                    </button>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setFormStep(1)} style={{touchAction: "manipulation"}}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium">&lt; Back</button>
                    <button onClick={() => { if(!formData.district || !formData.propertyType || !formData.timeline) { alert("Please answer all questions"); return; } setFormStep(3); }}
                      style={{touchAction: "manipulation"}}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium">Next &gt;</button>
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div>
                  <p className="font-semibold text-gray-800 mb-4">How will you finance?</p>
                  {["Cash", "Mortgage - approved", "Mortgage - not yet", "Undecided"].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, financing: opt})}
                      style={{touchAction: "manipulation"}}
                      className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium ${formData.financing === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>
                      {opt}
                    </button>
                  ))}
                  <p className="font-semibold text-gray-800 mb-3 mt-6">Your name</p>
                  <input type="text" placeholder="First name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-700 text-sm mb-4"
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                  <p className="font-semibold text-gray-800 mb-3">WhatsApp number</p>
                  <input type="tel" placeholder="+995 5XX XXX XXX"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-700 text-sm mb-6"
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                  <div className="flex gap-3">
                    <button onClick={() => setFormStep(2)} style={{touchAction: "manipulation"}}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium">&lt; Back</button>
                    <button onClick={submitForm} disabled={submitting} style={{touchAction: "manipulation"}}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50">
                      {submitting ? "Sending..." : "Submit >"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TbilisiPrice.ge</h1>
            <p className="text-sm text-gray-500">Real estate prices based on actual market transactions</p>
          </div>
          <button onClick={openForm} style={{touchAction: "manipulation", minHeight: "44px"}}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium">
            Find my apartment
          </button>
        </div>
      </header>

      <section className="bg-blue-700 text-white px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">What are apartments actually selling for in Tbilisi?</h2>
          <p className="text-blue-200 text-lg mb-8">Real market prices — February 2026 data.</p>

          <div className="bg-white rounded-xl p-6 max-w-2xl">
            <p className="text-gray-700 font-semibold mb-3 text-lg">Is this listing fairly priced?</p>

            {/* Finish type selector */}
            <p className="text-gray-500 text-xs mb-2 font-medium uppercase tracking-wide">Finish type / კარკასი</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {FINISH_TYPES.map(f => (
                <button key={f.id} onClick={() => { setSelectedFinish(f.id); setResult(null); }}
                  style={{touchAction: "manipulation"}}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${selectedFinish === f.id ? f.color + " border-2" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {f.ka}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-4 italic">
              {FINISH_TYPES.find(f => f.id === selectedFinish)?.en} — {FINISH_TYPES.find(f => f.id === selectedFinish)?.desc}
            </p>

            <div className="flex gap-3 flex-wrap">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm flex-1 min-w-32"
                onChange={e => { setSelectedDistrict(e.target.value); setResult(null); }}>
                <option value="">Select district</option>
                {districts.map(d => (
                  <option key={d.name} value={d.name}>{d.name} — {d.nameKa}</option>
                ))}
              </select>
              <input type="text" placeholder="Size (sqm)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm w-32"
                onChange={e => { setSize(e.target.value); setResult(null); }} />
              <input type="text" placeholder="Total price ($)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm w-36"
                onChange={e => { setPrice(e.target.value); setResult(null); }} />
              <button onClick={checkPrice} style={{touchAction: "manipulation"}}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium">
                Check
              </button>
            </div>

            {result && (
              <div className={`mt-4 p-4 rounded-lg border ${result.diff > 15 ? "bg-red-50 border-red-200" : result.diff < -10 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                <p className="font-bold text-gray-800 text-lg">
                  ${result.pricePerSqm}/sqm — {result.diff > 15 ? "Above market ⚠️" : result.diff < -10 ? "Below market ✅" : "Fair market price ✓"}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Expected for {result.sqm}sqm in {result.district.name} ({result.finish.ka}): ${result.adjustedAvg}/sqm.
                  This listing is {Math.abs(result.diff)}% {result.diff > 0 ? "above" : "below"} that.
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Price adjusted for apartment size and finish type. Views, floor, and building age also affect price.
                </p>
              </div>
            )}
            <p className="text-gray-400 text-xs mt-3">Source: TBC Capital Tbilisi Residential Market Report, February 2026.</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Average prices by district</h3>
          <p className="text-gray-500 mb-4 text-sm">Source: TBC Capital Tbilisi Residential Market Report — February 2026</p>

          {/* Finish filter for grid */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-500 font-medium">Show prices for:</span>
            {FINISH_TYPES.map(f => (
              <button key={f.id} onClick={() => setGridFinish(f.id)}
                style={{touchAction: "manipulation"}}
                className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${gridFinish === f.id ? f.color + " border-2" : "bg-white text-gray-500 border-gray-200"}`}>
                {f.ka}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {districts.map(district => {
              const finishMult = getFinishMultiplier(gridFinish);
              const adjustedPrice = Math.round(district.avgPrice * finishMult);
              const finish = FINISH_TYPES.find(f => f.id === gridFinish);
              return (
                <div key={district.name} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{district.name}</h4>
                      <p className="text-gray-400 text-sm">{district.nameKa}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${district.type === "premium" ? "bg-purple-100 text-purple-700" : district.type === "mid" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {district.type === "premium" ? "Premium" : district.type === "mid" ? "Mid-range" : "Affordable"}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    ${adjustedPrice.toLocaleString()}<span className="text-base font-normal text-gray-500">/sqm</span>
                  </p>
                  <span className={`text-xs mt-2 px-2 py-0.5 rounded-full inline-block border ${finish.color}`}>
                    {finish.ka}
                  </span>
                  <p className={`text-sm mt-2 font-medium ${district.change > 0 ? "text-green-600" : district.change < 0 ? "text-red-500" : "text-gray-400"}`}>
                    {district.change > 0 ? "↑" : district.change < 0 ? "↓" : "→"} {Math.abs(district.change)}% year over year
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-blue-700 text-white px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold mb-4">Looking for an apartment?</h3>
          <p className="text-blue-200 text-lg mb-8">Tell us what you need and we will find the best options for your budget and district.</p>
          <button onClick={openForm} style={{touchAction: "manipulation", minHeight: "52px"}}
            className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold text-lg w-full sm:w-auto">
            Find my apartment →
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>Data source: TBC Capital Tbilisi Residential Market Report, February 2026.</p>
          <p className="mt-1">Prices are averages for the secondary market. Individual prices vary by size, floor, condition, and building age.</p>
        </div>
      </footer>
    </main>
  );
}
