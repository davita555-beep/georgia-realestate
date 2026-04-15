export const metadata = {
  title: "Isani Apartment Prices 2026 | TbilisiPrice.ge",
  description: "Isani district apartment prices in Tbilisi. Average 1195$/sqm. Updated April 2026.",
};

export default function DistrictPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <a href="/" className="text-2xl font-bold text-gray-900">TbilisiPrice.ge</a>
            <p className="text-sm text-gray-500">Apartment Price Checker - Tbilisi 2026</p>
          </div>
          <a href="/" className="text-blue-600 text-sm font-medium">Back to main</a>
        </div>
      </header>
      <section className="bg-blue-700 text-white px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-blue-300 text-sm mb-2">Tbilisi / Isani</p>
          <h1 className="text-4xl font-bold mb-2">ისანი — Isani</h1>
          <p className="text-blue-200 text-lg">Apartment prices - April 2026</p>
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <p className="text-4xl font-bold text-blue-700">$1,195</p>
              <p className="text-gray-500 text-sm mt-1">Average price / sqm</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <p className="text-4xl font-bold text-green-600">+2%</p>
              <p className="text-gray-500 text-sm mt-1">Year over year</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <p className="text-4xl font-bold text-purple-700">Mid-range</p>
              <p className="text-gray-500 text-sm mt-1">Segment</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Prices by finish type</h2>
            <div className="space-y-3">
              <div className="bg-gray-100 rounded-lg px-4 py-3 flex justify-between">
                <span className="font-medium text-gray-700">Black Frame</span>
                <span className="font-bold">$1,195/sqm</span>
              </div>
              <div className="bg-blue-50 rounded-lg px-4 py-3 flex justify-between">
                <span className="font-medium text-gray-700">White Frame</span>
                <span className="font-bold">$1,350/sqm</span>
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-3 flex justify-between">
                <span className="font-medium text-gray-700">Green Frame</span>
                <span className="font-bold">$1,410/sqm</span>
              </div>
              <div className="bg-amber-50 rounded-lg px-4 py-3 flex justify-between">
                <span className="font-medium text-gray-700">Renovated</span>
                <span className="font-bold">$1,577/sqm</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-200 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Check if a listing is fairly priced</h2>
            <p className="text-gray-600 mb-6">Enter the apartment size and price to see if it matches the market.</p>
            <a href="/" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold inline-block">
              Check price on main page
            </a>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Other districts</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/vake" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600">Vake</a>
              <a href="/saburtalo" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600">Saburtalo</a>
              <a href="/mtatsminda" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600">Mtatsminda</a>
              <a href="/gldani" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600">Gldani</a>
              <a href="/isani" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600">Isani</a>
              <a href="/samgori" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600">Samgori</a>
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-gray-200 px-6 py-8 mt-8">
        <div className="max-w-4xl mx-auto text-center text-gray-400 text-sm">
          <p>Source: TBC Capital Tbilisi Residential Market Report, February 2026.</p>
        </div>
      </footer>
    </main>
  );
}
