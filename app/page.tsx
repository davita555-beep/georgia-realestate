"use client";
import { useState } from "react";

export default function Home() {
  const districts = [
    { name: "Mtatsminda", nameKa: "მთაწმინდა", avgPrice: 2007, change: 2, type: "premium" },
    { name: "Vake", nameKa: "ვაკე", avgPrice: 2170, change: 13, type: "premium" },
    { name: "Vera", nameKa: "ვერა", avgPrice: 1900, change: 8, type: "premium" },
    { name: "Chughureti", nameKa: "ჩუღურეთი", avgPrice: 1275, change: 0, type: "mid" },
    { name: "Saburtalo", nameKa: "საბურთალო", avgPrice: 1583, change: 4, type: "mid" },
    { name: "Krtsanisi", nameKa: "კრწანისი", avgPrice: 1334, change: -9, type: "mid" },
    { name: "Didube", nameKa: "დიდუბე", avgPrice: 1297, change: 8, type: "mid" },
    { name: "Nadzaladevi", nameKa: "ნაძალადევი", avgPrice: 1116, change: 4, type: "mid" },
    { name: "Isani", nameKa: "ისანი", avgPrice: 1175, change: 3, type: "mid" },
    { name: "Avlabari", nameKa: "ავლაბარი", avgPrice: 1150, change: 6, type: "mid" },
    { name: "Gldani", nameKa: "გლდანი", avgPrice: 1092, change: 7, type: "affordable" },
    { name: "Samgori", nameKa: "სამგორი", avgPrice: 1027, change: -1, type: "affordable" },
    { name: "Didi Dighomi", nameKa: "დიდი დიღომი", avgPrice: 1129, change: -1, type: "affordable" },
    { name: "Vashlijvari", nameKa: "ვაშლიჯვარი", avgPrice: 1050, change: 5, type: "affordable" },
    { name: "Varketili", nameKa: "ვარკეთილი", avgPrice: 900, change: 3, type: "affordable" },
    { name: "Vazisubani", nameKa: "ვაზისუბანი", avgPrice: 920, change: 2, type: "affordable" },
    { name: "Ortachala", nameKa: "ორთაჭალა", avgPrice: 980, change: 4, type: "affordable" },
    { name: "Lilo", nameKa: "ლილო", avgPrice: 800, change: 2, type: "affordable" },
    { name: "Ponichala", nameKa: "პონიჭალა", avgPrice: 750, change: 1, type: "affordable" },
    { name: "Tskneti", nameKa: "წყნეთი", avgPrice: 850, change: 3, type: "affordable" },
  ];

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    budget: "",
    purpose: "",
    district: "",
    propertyType: "",
    timeline: "",
    financing: "",
    whatsapp: "",
    name: "",
  });

  function checkPrice() {
    const district = districts.find(function(d) { return d.name === selectedDistrict; });
    if (!district) { alert("Please select a district"); return; }
    if (!size) { alert("Please enter size"); return; }
    if (!price) { alert("Please enter price"); return; }
    const pricePerSqm = Math.round(parseInt(price) / parseInt(size));
    const diff = Math.round(((pricePerSqm - district.avgPrice) / district.avgPrice) * 100);
    setResult({ pricePerSqm: pricePerSqm, diff: diff, district: district });
  }

  function calcScore() {
    let score = 0;
    if (formData.financing === "Cash") score += 4;
    if (formData.financing === "Mortgage - approved") score += 3;
    if (formData.financing === "Mortgage - not yet") score += 1;
    if (formData.timeline === "Within 1 month") score += 4;
    if (formData.timeline === "1-3 months") score += 3;
    if (formData.timeline === "3-6 months") score += 2;
    if (formData.timeline === "Just browsing") score += 0;
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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg p-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
              <p className="text-gray-600 mb-6">We will contact you on WhatsApp within 24 hours with apartments matching your criteria.</p>
              <button onClick={() => { setShowForm(false); setSubmitted(false); setFormStep(1); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
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
                  {["Under $40,000", "$40,000 - $80,000", "$80,000 - $150,000", "$150,000+"].map(function(opt) {
                    return (
                      <button key={opt} onClick={() => setFormData({...formData, budget: opt})}
                        className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium transition-colors ${formData.budget === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                        {opt}
                      </button>
                    );
                  })}

                  <p className="font-semibold text-gray-800 mb-4 mt-6">Own use or investment?</p>
                  {["Own use", "Investment / rental", "Both"].map(function(opt) {
                    return (
                      <button key={opt} onClick={() => setFormData({...formData, purpose: opt})}
                        className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium transition-colors ${formData.purpose === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                        {opt}
                      </button>
                    );
                  })}

                  <button onClick={() => { if(!formData.budget || !formData.purpose) { alert("Please answer both questions"); return; } setFormStep(2); }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mt-4 hover:bg-blue-700">
                    Next →
                  </button>
                </div>
              )}

              {formStep === 2 && (
                <div>
                  <p className="font-semibold text-gray-800 mb-4">Preferred district?</p>
                  <select onChange={e => setFormData({...formData, district: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-700 text-sm mb-6">
                    <option value="">Select district</option>
                    {districts.map(function(d) {
                      return <option key={d.name} value={d.name}>{d.name} — {d.nameKa}</option>;
                    })}
                    <option value="Open to suggestions">Open to suggestions</option>
                  </select>

                  <p className="font-semibold text-gray-800 mb-4">New build or resale?</p>
                  {["New build", "Resale", "No preference"].map(function(opt) {
                    return (
                      <button key={opt} onClick={() => setFormData({...formData, propertyType: opt})}
                        className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium transition-colors ${formData.propertyType === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                        {opt}
                      </button>
                    );
                  })}

                  <p className="font-semibold text-gray-800 mb-4 mt-6">How soon are you buying?</p>
                  {["Within 1 month", "1-3 months", "3-6 months", "Just browsing"].map(function(opt) {
                    return (
                      <button key={opt} onClick={() => setFormData({...formData, timeline: opt})}
                        className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium transition-colors ${formData.timeline === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                        {opt}
                      </button>
                    );
                  })}

                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setFormStep(1)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50">
                      ← Back
                    </button>
                    <button onClick={() => { if(!formData.district || !formData.propertyType || !formData.timeline) { alert("Please answer all questions"); return; } setFormStep(3); }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div>
                  <p className="font-semibold text-gray-800 mb-4">How will you finance?</p>
                  {["Cash", "Mortgage - approved", "Mortgage - not yet", "Undecided"].map(function(opt) {
                    return (
                      <button key={opt} onClick={() => setFormData({...formData, financing: opt})}
                        className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium transition-colors ${formData.financing === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                        {opt}
                      </button>
                    );
                  })}

                  <p className="font-semibold text-gray-800 mb-3 mt-6">Your name</p>
                  <input type="text" placeholder="First name" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-700 text-sm mb-4"
                    onChange={e => setFormData({...formData, name: e.target.value})} />

                  <p className="font-semibold text-gray-800 mb-3">WhatsApp number</p>
                  <input type="text" placeholder="+995 5XX XXX XXX"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-700 text-sm mb-6"
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})} />

                  <div className="flex gap-3">
                    <button onClick={() => setFormStep(2)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50">
                      ← Back
                    </button>
                    <button onClick={submitForm} disabled={submitting}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                      {submitting ? "Sending..." : "Find my apartment →"}
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
          <button onClick={() => setShowForm(true)} onTouchEnd={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Find my apart>ment
          </button>
        </div>
      </header>

      <section className="bg-blue-700 text-white px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">What are apartments actually selling for in Tbilisi?</h2>
          <p className="text-blue-200 text-lg mb-8">Real market prices covering all apartment types — new builds and resale.</p>

          <div className="bg-white rounded-xl p-6 max-w-2xl">
            <p className="text-gray-700 font-semibold mb-3 text-lg">Is this listing fairly priced?</p>
            <div className="flex gap-3 flex-wrap">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm flex-1 min-w-32"
                onChange={function(e) { setSelectedDistrict(e.target.value); }}
              >
                <option value="">Select district</option>
                {districts.map(function(d) {
                  return <option key={d.name} value={d.name}>{d.name} — {d.nameKa}</option>;
                })}
              </select>
              <input type="text" placeholder="Size (sqm)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm w-32"
                onChange={function(e) { setSize(e.target.value); }} />
              <input type="text" placeholder="Total price ($)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm w-36"
                onChange={function(e) { setPrice(e.target.value); }} />
              <button onClick={checkPrice} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Check
              </button>
            </div>

            {result && (
              <div className={result.diff > 15 ? "mt-4 p-4 rounded-lg bg-red-50 border border-red-200" : result.diff < -10 ? "mt-4 p-4 rounded-lg bg-green-50 border border-green-200" : "mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200"}>
                <p className="font-bold text-gray-800 text-lg">
                  ${result.pricePerSqm}/sqm — {result.diff > 15 ? "Overpriced ⚠️" : result.diff < -10 ? "Good deal ✅" : "Fair price ✓"}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Average in {result.district.name} is ${result.district.avgPrice}/sqm. This listing is {Math.abs(result.diff)}% {result.diff > 0 ? "above" : "below"} market average.
                </p>
              </div>
            )}
            <p className="text-gray-400 text-xs mt-3">Source: TBC Capital Tbilisi Residential Market Report, September 2025. Covers all apartment types.</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Average prices by district</h3>
          <p className="text-gray-500 mb-8 text-sm">Source: TBC Capital Tbilisi Residential Market Report — September 2025</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {districts.map(function(district) {
              return (
                <div key={district.name} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{district.name}</h4>
                      <p className="text-gray-400 text-sm">{district.nameKa}</p>
                    </div>
                    <span className={district.type === "premium" ? "text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700" : district.type === "mid" ? "text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700" : "text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700"}>
                      {district.type === "premium" ? "Premium" : district.type === "mid" ? "Mid-range" : "Affordable"}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    ${district.avgPrice}<span className="text-base font-normal text-gray-500">/sqm</span>
                  </p>
                  <p className={district.change > 0 ? "text-sm mt-2 font-medium text-green-600" : district.change < 0 ? "text-sm mt-2 font-medium text-red-500" : "text-sm mt-2 font-medium text-gray-400"}>
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
          <button onClick={() => setShowForm(true)} onTouchEnd={() => setShowForm(true)} className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 text-lg">
            Find my apartment →
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-200 px-6 py-8 mt-0">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>Data source: TBC Capital Tbilisi Residential Market Report, September 2025.</p>
          <p className="mt-1">Prices are averages covering all apartment types. Individual prices vary by floor, condition, and building age.</p>
        </div>
      </footer>
    </main>
  );
}