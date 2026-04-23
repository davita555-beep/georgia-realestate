"use client"; 
import SubdistrictPriceChart from '@/components/SubdistrictPriceChart';
import ApartmentEstimator from "@/components/ApartmentEstimator";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const FINISH_TYPES = [
  { id: "black", ka: "შავი კარკასი", en: "Black Frame", desc_ka: "მხოლოდ კონსტრუქცია", desc_en: "Bare concrete shell", multiplier: 1.0, color: "bg-gray-100 text-gray-700 border-gray-300" },
  { id: "white", ka: "თეთრი კარკასი", en: "White Frame", desc_ka: "შელესილი, კომუნიკაციები", desc_en: "Plastered, utilities installed", multiplier: 1.13, color: "bg-blue-50 text-blue-700 border-blue-300" },
  { id: "green", ka: "მწვანე კარკასი", en: "Green Frame", desc_ka: "ნახევრად დამთავრებული", desc_en: "Semi-finished, flooring included", multiplier: 1.18, color: "bg-green-50 text-green-700 border-green-300" },
  { id: "renovated", ka: "გარემონტებული", en: "Renovated", desc_ka: "სრულად მოწყობილი", desc_en: "Fully finished, move-in ready", multiplier: 1.32, color: "bg-amber-50 text-amber-700 border-amber-300" },
];
const T = {
  ka: {
    tagline: "ბინის ფასების შემოწმება - თბილისი 2026",
    findApt: "ბინის მოძებნა",
    mortgage: "იპოთეკის კალკულატორი",
    hero: "რეალურად რა ღირს ბინები თბილისში?",
    heroSub: "რეალური საბაზრო ფასები - 2026 წლის აპრილი",
    fairPrice: "თბილისის ბინების ფასები - განახლებული ყოველთვიურად",
    finishType: "კარკასის ტიპი",
    selectDistrict: "აირჩიეთ რაიონი",
    sizeSqm: "ფართი (კვ.მ)",
    totalPrice: "სრული ფასი ($)",
    check: "შემოწმება",
    source: "წყარო: TBC Capital თბილისის საცხოვრებელი ბაზრის ანგარიში - 2026 წლის თებერვალი",
    aboveMarket: "საბაზრო ფასზე მაღალი ⚠️",
    belowMarket: "საბაზრო ფასზე დაბალი ✅",
    fairMarket: "სამართლიანი საბაზრო ფასი ✓",
    expected: "მოსალოდნელი",
    forSqm: "კვ.მ-ისთვის",
    in: "",
    listingIs: "ეს განცხადება არის",
    above: "მეტი",
    below: "ნაკლები",
    priceNote: "ფასი შეცვლილია ფართისა და კარკასის ტიპის მიხედვით. ხედი, სართული და შენობის ასაკი ასევე მოქმედებს ფასზე.",
    avgPrices: "საშუალო ფასები რაიონების მიხედვით",
    showFor: "ფასების ჩვენება:",
    premium: "პრემიუმი",
    mid: "საშუალო",
    affordable: "ხელმისაწვდომი",
    yoy: "წლიდან წლამდე",
    ctaTitle: "ეძებთ ბინას?",
    ctaSub: "გვითხარით რა გჭირდებათ და ჩვენ მოვძებნით საუკეთესო ვარიანტებს.",
    ctaBtn: "ბინის მოძებნა →",
    footerNote: "ფასები ასახავს მეორადი ბაზრის საშუალო მაჩვენებლებს. ინდივიდუალური ფასები განსხვავდება.",
    budget: "რა არის თქვენი ბიუჯეტი?",
    purpose: "საკუთარი გამოყენება თუ ინვესტიცია?",
    ownUse: "საკუთარი გამოყენება",
    investment: "ინვესტიცია / იჯარა",
    both: "ორივე",
    next: "შემდეგი >",
    back: "< უკან",
    preferredDistrict: "სასურველი რაიონი?",
    openToSuggestions: "ღია წინადადებებისთვის",
    newOrResale: "ახალი თუ მეორადი?",
    newBuild: "ახალი აშენებული",
    resale: "მეორადი",
    noPreference: "სასურველი არ არის",
    howSoon: "როდის აპირებთ ყიდვას?",
    within1: "1 თვეში",
    oneToThree: "1-3 თვეში",
    threeToSix: "3-6 თვეში",
    justBrowsing: "მხოლოდ ვათვალიერებ",
    financing: "როგორ დააფინანსებთ?",
    cash: "ნაღდი ფული",
    mortgageApproved: "იპოთეკა - დამტკიცებული",
    mortgageNotYet: "იპოთეკა - ჯერ არა",
    undecided: "გადაუწყვეტელია",
    yourName: "თქვენი სახელი",
    firstName: "სახელი",
    whatsapp: "WhatsApp ნომერი",
    submit: "გაგზავნა >",
    sending: "იგზავნება...",
    thankYou: "გმადლობთ!",
    thankYouSub: "ჩვენ დაგიკავშირდებით WhatsApp-ზე 24 საათში თქვენი კრიტერიუმების შესაბამისი ბინებით.",
    backToPrices: "ფასებზე დაბრუნება",
    step: "ნაბიჯი",
    of: "-დან",
    findMyApt: "ბინის მოძებნა",
    answerBoth: "გთხოვთ, უპასუხოთ ორივე კითხვას",
    answerAll: "გთხოვთ, უპასუხოთ ყველა კითხვას",
    enterName: "გთხოვთ, შეიყვანოთ სახელი და WhatsApp ნომერი",
    errorMsg: "შეცდომა, სცადეთ თავიდან",
  },
  en: {
    tagline: "Apartment Price Checker - Tbilisi 2026",
    findApt: "Find my apartment",
    mortgage: "Mortgage Calculator",
    hero: "What are apartments actually selling for in Tbilisi?",
    heroSub: "Real market prices - April 2026 data.",
    fairPrice: "Tbilisi Apartment Prices - Updated Monthly",
    finishType: "Finish type / კარკასი",
    selectDistrict: "Select district",
    sizeSqm: "Size (sqm)",
    totalPrice: "Total price ($)",
    check: "Check",
    source: "Source: TBC Capital Tbilisi Residential Market Report, February 2026.",
    aboveMarket: "Above market ⚠️",
    belowMarket: "Below market ✅",
    fairMarket: "Fair market price ✓",
    expected: "Expected for",
    forSqm: "sqm in",
    in: "in",
    listingIs: "This listing is",
    above: "above",
    below: "below",
    priceNote: "Price adjusted for apartment size and finish type. Views, floor, and building age also affect price.",
    avgPrices: "Average prices by district",
    showFor: "Show prices for:",
    premium: "Premium",
    mid: "Mid-range",
    affordable: "Affordable",
    yoy: "year over year",
    ctaTitle: "Looking for an apartment?",
    ctaSub: "Tell us what you need and we will find the best options for your budget and district.",
    ctaBtn: "Find my apartment →",
    footerNote: "Prices are averages for the secondary market. Individual prices vary by size, floor, condition, and building age.",
    budget: "What is your budget?",
    purpose: "Own use or investment?",
    ownUse: "Own use",
    investment: "Investment / rental",
    both: "Both",
    next: "Next >",
    back: "< Back",
    preferredDistrict: "Preferred district?",
    openToSuggestions: "Open to suggestions",
    newOrResale: "New build or resale?",
    newBuild: "New build",
    resale: "Resale",
    noPreference: "No preference",
    howSoon: "How soon are you buying?",
    within1: "Within 1 month",
    oneToThree: "1-3 months",
    threeToSix: "3-6 months",
    justBrowsing: "Just browsing",
    financing: "How will you finance?",
    cash: "Cash",
    mortgageApproved: "Mortgage - approved",
    mortgageNotYet: "Mortgage - not yet",
    undecided: "Undecided",
    yourName: "Your name",
    firstName: "First name",
    whatsapp: "WhatsApp number",
    submit: "Submit >",
    sending: "Sending...",
    thankYou: "Thank you!",
    thankYouSub: "We will contact you on WhatsApp within 24 hours with apartments matching your criteria.",
    backToPrices: "Back to prices",
    step: "Step",
    of: "of",
    findMyApt: "Find my apartment",
    answerBoth: "Please answer both questions",
    answerAll: "Please answer all questions",
    enterName: "Please enter your name and WhatsApp number",
    errorMsg: "Something went wrong, please try again",
  }
};

export default function Home() {
  const [lang, setLang] = useState("ka");
  const t = T[lang];
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [chartOpen, setChartOpen] = useState(false);
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

  useEffect(() => {
    async function fetchPrices() {
      const { data } = await supabase
        .from("prices")
        .select("*")
        .order("recorded_at", { ascending: false });
      if (data) {
        const latest = {};
        const byDistrict = {};
        data.forEach((row) => {
          if (!latest[row.name]) {
            latest[row.name] = {
              name: row.name,
              nameKa: row.name_ka,
              avgPrice: row.avg_price,
              change: row.change_yoy,
              type: row.type,
            };
          }
          if (!byDistrict[row.name]) byDistrict[row.name] = { name: row.name, nameKa: row.name_ka };
          const year = new Date(row.recorded_at).getFullYear();
          byDistrict[row.name][year] = row.avg_price;
        });
        setDistricts(Object.values(latest));
        setChartData(Object.values(byDistrict).filter(d => d[2025] && d[2026]).sort((a,b) => b[2026] - a[2026]));
      }
      setLoading(false);
    }
    fetchPrices();
  }, []);

  function openForm() { setShowForm(true); setFormStep(1); setSubmitted(false); }
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
    const district = districts.find(d => d.name === selectedDistrict);
    if (!district || !size || !price) return;
    const sqm = parseFloat(size);
    const totalPrice = parseFloat(price);
    const pricePerSqm = totalPrice / sqm;
    const sizeAdj = getSizeAdjustment(sqm);
    const finishMult = getFinishMultiplier(selectedFinish);
    const adjustedAvg = Math.round(district.avgPrice * sizeAdj * finishMult);
    const diff = Math.round(((pricePerSqm - adjustedAvg) / adjustedAvg) * 100);
    const finish = FINISH_TYPES.find(f => f.id === selectedFinish);
    setResult({ pricePerSqm: Math.round(pricePerSqm), adjustedAvg, diff, sqm, district, finish });
  }
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
    if (!formData.whatsapp || !formData.name) { alert(t.enterName); return; }
    setSubmitting(true);
    const score = calcScore();
    const priority = score >= 7 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW";
    try {
      await fetch("https://sheetdb.io/api/v1/4953u0ddyx7rn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { Date: new Date().toLocaleDateString(), Name: formData.name, WhatsApp: formData.whatsapp, Budget: formData.budget, Purpose: formData.purpose, District: formData.district, "Property Type": formData.propertyType, Timeline: formData.timeline, Financing: formData.financing, Score: score, Priority: priority } }),
      });
      setSubmitted(true);
    } catch(e) { alert(t.errorMsg); }
    setSubmitting(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
      {lang === "ka" ? "იტვირთება..." : "Loading prices..."}
    </div>
  );

  if (showForm) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg mx-auto p-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.thankYou}</h2>
              <p className="text-gray-600 mb-6">{t.thankYouSub}</p>
              <button onClick={() => { setShowForm(false); setSubmitted(false); setFormStep(1); }}
                style={{touchAction: "manipulation"}}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium w-full">
                {t.backToPrices}
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t.findMyApt}</h2>
                <span className="text-sm text-gray-400">{t.step} {formStep} {t.of} 3</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{width: `${(formStep/3)*100}%`}}></div>
              </div>
              {formStep === 1 && (
                <div>
                  <p className="font-semibold text-gray-800 mb-4">{t.budget}</p>
                  {["$40,000-მდე", "$40,000 - $80,000", "$80,000 - $150,000", "$150,000+"].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, budget: opt})}
                      style={{touchAction: "manipulation"}}
                      className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium ${formData.budget === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>
                      {opt}
                    </button>
                  ))}
                  <p className="font-semibold text-gray-800 mb-4 mt-6">{t.purpose}</p>
                  {[t.ownUse, t.investment, t.both].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, purpose: opt})}
                      style={{touchAction: "manipulation"}}
                      className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium ${formData.purpose === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>
                      {opt}
                    </button>
                  ))}
                  <button onClick={() => { if(!formData.budget || !formData.purpose) { alert(t.answerBoth); return; } setFormStep(2); }}
                    style={{touchAction: "manipulation"}}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mt-4">
                    {t.next}
                  </button>
                </div>
              )}
              {formStep === 2 && (
                <div>
                  <p className="font-semibold text-gray-800 mb-4">{t.preferredDistrict}</p>
                  <select onChange={e => setFormData({...formData, district: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-700 text-sm mb-6">
                    <option value="">{t.selectDistrict}</option>
                    {districts.map(d => (
                      <option key={d.name} value={d.name}>{d.nameKa} — {d.name}</option>
                    ))}
                    <option value="Open to suggestions">{t.openToSuggestions}</option>
                  </select>
                  <p className="font-semibold text-gray-800 mb-4">{t.newOrResale}</p>
                  {[t.newBuild, t.resale, t.noPreference].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, propertyType: opt})}
                      style={{touchAction: "manipulation"}}
                      className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium ${formData.propertyType === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>
                      {opt}
                    </button>
                  ))}
                  <p className="font-semibold text-gray-800 mb-4 mt-6">{t.howSoon}</p>
                  {[t.within1, t.oneToThree, t.threeToSix, t.justBrowsing].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, timeline: opt})}
                      style={{touchAction: "manipulation"}}
                      className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium ${formData.timeline === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>
                      {opt}
                    </button>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setFormStep(1)} style={{touchAction: "manipulation"}}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium">{t.back}</button>
                    <button onClick={() => { if(!formData.district || !formData.propertyType || !formData.timeline) { alert(t.answerAll); return; } setFormStep(3); }}
                      style={{touchAction: "manipulation"}}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium">{t.next}</button>
                  </div>
                </div>
              )}
              {formStep === 3 && (
                <div>
                  <p className="font-semibold text-gray-800 mb-4">{t.financing}</p>
                  {[t.cash, t.mortgageApproved, t.mortgageNotYet, t.undecided].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, financing: opt})}
                      style={{touchAction: "manipulation"}}
                      className={`w-full text-left px-4 py-3 rounded-lg border mb-2 text-sm font-medium ${formData.financing === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>
                      {opt}
                    </button>
                  ))}
                  <p className="font-semibold text-gray-800 mb-3 mt-6">{t.yourName}</p>
                  <input type="text" placeholder={t.firstName}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-700 text-sm mb-4"
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                  <p className="font-semibold text-gray-800 mb-3">{t.whatsapp}</p>
                  <input type="tel" placeholder="+995 5XX XXX XXX"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-700 text-sm mb-6"
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                  <div className="flex gap-3">
                    <button onClick={() => setFormStep(2)} style={{touchAction: "manipulation"}}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium">{t.back}</button>
                    <button onClick={submitForm} disabled={submitting} style={{touchAction: "manipulation"}}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50">
                      {submitting ? t.sending : t.submit}
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
            <p className="text-sm text-gray-500">{t.tagline}</p>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => setLang(lang === "ka" ? "en" : "ka")}
              style={{touchAction: "manipulation"}}
              className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium">
              {lang === "ka" ? "EN" : "GE"}
            </button>
            <a href="/mortgage"
  className="bg-white text-blue-600 border border-blue-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center">
  {t.mortgage}
</a>
<a href="/rental-yield"
  className="bg-white text-green-600 border border-green-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center">
  {lang === "ka" ? "იჯარა" : "Rental"}
</a>
            <button onClick={openForm} style={{touchAction: "manipulation", minHeight: "44px"}}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium">
              {t.findApt}
            </button>
          </div>
        </div>
      </header>
<ApartmentEstimator lang={lang} />
      <section className="text-white px-6 py-16" style={{background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #0f766e 100%)"}}>
        <section className="px-6 py-12 bg-white border-t border-gray-100">
  <div className="max-w-6xl mx-auto">
    
  </div>
</section>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">{t.hero}</h2>
          <p className="text-blue-200 text-lg mb-8">{t.heroSub}</p>
          <div className="bg-white rounded-xl p-6 max-w-2xl">
            <p className="text-gray-700 font-semibold mb-3 text-lg">{t.fairPrice}</p>
            <p className="text-gray-500 text-xs mb-2 font-medium uppercase tracking-wide">{t.finishType}</p>
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
              {FINISH_TYPES.find(f => f.id === selectedFinish)?.[lang === "ka" ? "desc_ka" : "desc_en"]}
            </p>
            <div className="flex gap-3 flex-wrap">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm flex-1 min-w-32"
                onChange={e => { setSelectedDistrict(e.target.value); setResult(null); }}>
                <option value="">{t.selectDistrict}</option>
                {districts.map(d => (
                  <option key={d.name} value={d.name}>{d.nameKa} - {d.name}</option>
                ))}
              </select>
              <input type="text" placeholder={t.sizeSqm}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm w-32"
                onChange={e => { setSize(e.target.value); setResult(null); }} />
              <input type="text" placeholder={t.totalPrice}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm w-36"
                onChange={e => { setPrice(e.target.value); setResult(null); }} />
              <button onClick={checkPrice} style={{touchAction: "manipulation"}}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium">
                {t.check}
              </button>
            </div>
            {result && (
              <div className={`mt-4 p-4 rounded-lg border ${result.diff > 15 ? "bg-red-50 border-red-200" : result.diff < -10 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                <p className="font-bold text-gray-800 text-lg">
                  ${result.pricePerSqm}/კვ.მ - {result.diff > 15 ? t.aboveMarket : result.diff < -10 ? t.belowMarket : t.fairMarket}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {t.expected} {result.sqm}კვ.მ {result.district.nameKa}-ში ({result.finish.ka}): ${result.adjustedAvg}/კვ.მ. {t.listingIs} {Math.abs(result.diff)}% {result.diff > 0 ? t.above : t.below}.
                </p>
                <p className="text-gray-400 text-xs mt-2">{t.priceNote}</p>
              </div>
            )}
            <p className="text-gray-400 text-xs mt-3">{t.source}</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => setChartOpen(!chartOpen)}
            style={{touchAction: "manipulation"}}
            className="flex items-center justify-between w-full text-left">
            <h3 className="text-2xl font-bold text-gray-900">{lang === "ka" ? "2025 vs 2026 - ფასების ცვლილება" : "2025 vs 2026 - Price Changes"}</h3>
            <span className="text-2xl text-gray-400">{chartOpen ? "▲" : "▼"}</span>
          </button>
          {chartOpen && <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 hidden">placeholder</h3>
          <p className="text-gray-500 mb-8 text-sm">{lang === "ka" ? "რაიონების მიხედვით, შავი კარკასი ($/" + "კვ.მ)" : "By district, black frame ($/sqm)"}</p>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-3 mb-3">
                  <div className="w-28 text-right text-sm text-gray-600 shrink-0">{lang === "ka" ? d.nameKa : d.name}</div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-200 rounded h-6 flex items-center px-2 text-xs text-blue-800 font-medium" style={{width: `${(d[2025]/3000)*400}px`, minWidth: '60px'}}>
                        2025: ${d[2025].toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 rounded h-6 flex items-center px-2 text-xs text-white font-medium" style={{width: `${(d[2026]/3000)*400}px`, minWidth: '60px'}}>
                        2026: ${d[2026].toLocaleString()}
                      </div>
                      <span className="text-xs text-green-600 font-medium">+{Math.round(((d[2026]-d[2025])/d[2025])*100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">{lang === "ka" ? "* 2025 წლის მონაცემები გამოთვლილია TBC Capital-ის წლიური ზრდის მაჩვენებლების საფუძველზე" : "* 2025 data estimated from TBC Capital year-over-year growth rates"}</p>
          </div>}
        </div>
      </section>
<section className="px-6 py-12" style={{background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)"}}>
  <div className="max-w-6xl mx-auto">
    <SubdistrictPriceChart lang={lang} />
  </div>
</section><section className="px-6 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{lang === "ka" ? "რაიონები" : "Districts"}</h3>
          <p className="text-gray-500 mb-6 text-sm">{lang === "ka" ? "დაწვრილებითი ინფორმაცია თითოეული რაიონის შესახებ" : "Detailed information about each district"}</p>
          <div className="flex flex-wrap gap-2">
            {[
              {slug:"vake", ka:"ვაკე", en:"Vake"},
              {slug:"mtatsminda", ka:"მთაწმინდა", en:"Mtatsminda"},
              {slug:"vera", ka:"ვერა", en:"Vera"},
              {slug:"saburtalo", ka:"საბურთალო", en:"Saburtalo"},
              {slug:"chughureti", ka:"ჩუღურეთი", en:"Chughureti"},
              {slug:"krtsanisi", ka:"კრწანისი", en:"Krtsanisi"},
              {slug:"didube", ka:"დიდუბე", en:"Didube"},
              {slug:"isani", ka:"ისანი", en:"Isani"},
              {slug:"nadzaladevi", ka:"ნაძალადევი", en:"Nadzaladevi"},
              {slug:"avlabari", ka:"ავლაბარი", en:"Avlabari"},
              {slug:"didi-dighomi", ka:"დიდი დიღომი", en:"Didi Dighomi"},
              {slug:"samgori", ka:"სამგორი", en:"Samgori"},
              {slug:"gldani", ka:"გლდანი", en:"Gldani"},
              {slug:"vashlijvari", ka:"ვაშლიჯვარი", en:"Vashlijvari"},
              {slug:"ortachala", ka:"ორთაჭალა", en:"Ortachala"},
              {slug:"vazisubani", ka:"ვაზისუბანი", en:"Vazisubani"},
              {slug:"varketili", ka:"ვარკეთილი", en:"Varketili"},
              {slug:"tskneti", ka:"წყნეთი", en:"Tskneti"},
              {slug:"lilo", ka:"ლილო", en:"Lilo"},
              {slug:"ponichala", ka:"პონიჭალა", en:"Ponichala"},
            ].map(d => (
              <a key={d.slug} href={`/${d.slug}`}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                {lang === "ka" ? d.ka : d.en}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="text-white px-6 py-16 text-center" style={{background: "linear-gradient(135deg, #0f766e 0%, #1d4ed8 50%, #1e3a8a 100%)"}}>
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold mb-4">{t.ctaTitle}</h3>
          <p className="text-blue-200 text-lg mb-8">{t.ctaSub}</p>
          <button onClick={openForm} style={{touchAction: "manipulation", minHeight: "52px"}}
            className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold text-lg w-full sm:w-auto">
            {t.ctaBtn}
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>{t.source}</p>
          <p className="mt-1">{t.footerNote}</p>
        </div>
      </footer>
    </main>
  );
}
