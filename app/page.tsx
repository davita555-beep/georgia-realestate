"use client";
import { useState } from "react";

export default function Home() {
  const districts = [
    { name: "Mtatsminda", nameKa: "მთაწმინდა", avgPrice: 2459, change: 4, type: "premium" },
    { name: "Vake", nameKa: "ვაკე", avgPrice: 2143, change: 13, type: "premium" },
    { name: "Vera", nameKa: "ვერა", avgPrice: 1950, change: 8, type: "premium" },
    { name: "Saburtalo", nameKa: "საბურთალო", avgPrice: 1573, change: 4, type: "mid" },
    { name: "Chughureti", nameKa: "ჩუღურეთი", avgPrice: 1588, change: 5, type: "mid" },
    { name: "Krtsanisi", nameKa: "კრწანისი", avgPrice: 1525, change: -2, type: "mid" },
    { name: "Didube", nameKa: "დიდუბე", avgPrice: 1478, change: 8, type: "mid" },
    { name: "Avlabari", nameKa: "ავლაბარი", avgPrice: 1350, change: 6, type: "mid" },
    { name: "Isani", nameKa: "ისანი", avgPrice: 1406, change: 3, type: "mid" },
    { name: "Nadzaladevi", nameKa: "ნაძალადევი", avgPrice: 1451, change: 4, type: "mid" },
    { name: "Didi Dighomi", nameKa: "დიდი დიღომი", avgPrice: 1100, change: -1, type: "affordable" },
    { name: "Gldani", nameKa: "გლდანი", avgPrice: 1361, change: 7, type: "affordable" },
    { name: "Samgori", nameKa: "სამგორი", avgPrice: 1179, change: -1, type: "affordable" },
    { name: "Varketili", nameKa: "ვარკეთილი", avgPrice: 950, change: 3, type: "affordable" },
    { name: "Vazisubani", nameKa: "ვაზისუბანი", avgPrice: 980, change: 2, type: "affordable" },
    { name: "Lilo", nameKa: "ლილო", avgPrice: 850, change: 2, type: "affordable" },
    { name: "Ponichala", nameKa: "პონიჭალა", avgPrice: 780, change: 1, type: "affordable" },
    { name: "Vashlijvari", nameKa: "ვაშლიჯვარი", avgPrice: 1100, change: 5, type: "affordable" },
    { name: "Tskneti", nameKa: "წყნეთი", avgPrice: 900, change: 3, type: "affordable" },
    { name: "Ortachala", nameKa: "ორთაჭალა", avgPrice: 1050, change: 4, type: "affordable" },
  ];

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState(null);

  function checkPrice() {
    const district = districts.find(function(d) { return d.name === selectedDistrict; });
    if (!district) { alert("Please select a district"); return; }
    if (!size) { alert("Please enter size"); return; }
    if (!price) { alert("Please enter price"); return; }
    const pricePerSqm = Math.round(parseInt(price) / parseInt(size));
    const diff = Math.round(((pricePerSqm - district.avgPrice) / district.avgPrice) * 100);
    setResult({ pricePerSqm: pricePerSqm, diff: diff, district: district });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TbilisiPrice.ge</h1>
            <p className="text-sm text-gray-500">Real estate prices based on actual transactions</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Find my apartment
          </button>
        </div>
      </header>

      <section className="bg-blue-700 text-white px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">What are apartments actually selling for in Tbilisi?</h2>
          <p className="text-blue-200 text-lg mb-8">Real prices from NAPR transaction records — not asking prices, not estimates.</p>

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
              <input
                type="text"
                placeholder="Size (sqm)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm w-32"
                onChange={function(e) { setSize(e.target.value); }}
              />
              <input
                type="text"
                placeholder="Total price ($)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm w-36"
                onChange={function(e) { setPrice(e.target.value); }}
              />
              <button
                onClick={checkPrice}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
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
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Average prices by district</h3>
          <p className="text-gray-500 mb-8 text-sm">Source: GeoStat & NAPR transaction data — Q4 2025</p>
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

      <footer className="border-t border-gray-200 px-6 py-8 mt-8">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>Data source: GeoStat (National Statistics Office of Georgia) & NAPR transaction records.</p>
          <p className="mt-1">Prices shown are averages for all apartment types. Individual prices vary by floor, condition, and building age.</p>
        </div>
      </footer>
    </main>
  );
}