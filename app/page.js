"use client";
import SubdistrictPriceChart from '@/components/SubdistrictPriceChart';
import ApartmentEstimator from "@/components/ApartmentEstimator";
import TickerBar from "@/components/TickerBar";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

const FINISH_TYPES = [
  { id: "black",     ka: "შავი კარკასი",    en: "Black Frame",  desc_ka: "მხოლოდ კონსტრუქცია",        desc_en: "Bare concrete shell",             multiplier: 0.85 },
  { id: "white",     ka: "თეთრი კარკასი",   en: "White Frame",  desc_ka: "შელესილი, კომუნიკაციები",    desc_en: "Plastered, utilities installed",   multiplier: 0.97 },
  { id: "green",     ka: "მწვანე კარკასი",  en: "Green Frame",  desc_ka: "ნახევრად დამთავრებული",       desc_en: "Semi-finished, flooring included", multiplier: 1.02 },
  { id: "renovated", ka: "გარემონტებული",   en: "Renovated",    desc_ka: "სრულად მოწყობილი",           desc_en: "Fully finished, move-in ready",    multiplier: 1.15 },
];

const DISTRICTS_STATIC = [
  {slug:"vake",        ka:"ვაკე",          en:"Vake",         price:2380, yoy:"+20%", type:"Premium"},
  {slug:"mtatsminda",  ka:"მთაწმინდა",     en:"Mtatsminda",   price:2293, yoy:"+7%",  type:"Premium"},
  {slug:"vera",        ka:"ვერა",          en:"Vera",         price:1950, yoy:"+8%",  type:"Premium"},
  {slug:"saburtalo",   ka:"საბურთალო",     en:"Saburtalo",    price:1602, yoy:"+5%",  type:"Mid-range"},
  {slug:"chughureti",  ka:"ჩუღურეთი",      en:"Chughureti",   price:1455, yoy:"+7%",  type:"Mid-range"},
  {slug:"krtsanisi",   ka:"კრწანისი",      en:"Krtsanisi",    price:1451, yoy:"+3%",  type:"Mid-range"},
  {slug:"didube",      ka:"დიდუბე",        en:"Didube",       price:1236, yoy:"-1%",  type:"Mid-range"},
  {slug:"isani",       ka:"ისანი",         en:"Isani",        price:1195, yoy:"+2%",  type:"Mid-range"},
  {slug:"nadzaladevi", ka:"ნაძალადევი",    en:"Nadzaladevi",  price:1123, yoy:"-3%",  type:"Affordable"},
  {slug:"avlabari",    ka:"ავლაბარი",      en:"Avlabari",     price:1150, yoy:"+6%",  type:"Mid-range"},
  {slug:"didi-dighomi",ka:"დიდი დიღომი",   en:"Didi Dighomi", price:1142, yoy:"+3%",  type:"Affordable"},
  {slug:"samgori",     ka:"სამგორი",       en:"Samgori",      price:1138, yoy:"+12%", type:"Affordable"},
  {slug:"gldani",      ka:"გლდანი",        en:"Gldani",       price:1134, yoy:"+1%",  type:"Affordable"},
  {slug:"vashlijvari", ka:"ვაშლიჯვარი",   en:"Vashlijvari",  price:1050, yoy:"+5%",  type:"Affordable"},
  {slug:"ortachala",   ka:"ორთაჭალა",     en:"Ortachala",    price:980,  yoy:"+4%",  type:"Affordable"},
  {slug:"vazisubani",  ka:"ვაზისუბანი",   en:"Vazisubani",   price:920,  yoy:"+2%",  type:"Affordable"},
  {slug:"varketili",   ka:"ვარკეთილი",    en:"Varketili",    price:900,  yoy:"+3%",  type:"Affordable"},
  {slug:"tskneti",     ka:"წყნეთი",        en:"Tskneti",      price:850,  yoy:"+3%",  type:"Affordable"},
  {slug:"lilo",        ka:"ლილო",          en:"Lilo",         price:800,  yoy:"+2%",  type:"Affordable"},
  {slug:"ponichala",   ka:"პონიჭალა",     en:"Ponichala",    price:750,  yoy:"+1%",  type:"Affordable"},
];

const T = {
  ka: {
    tagline: "ბინის ფასების შემოწმება - თბილისი 2026",
    findApt: "ბინის მოძებნა",
    domAnalysis: "DOM ანალიზი",
    mortgage: "იპოთეკა",
    rental: "იჯარა",
    hero: "ბინის ყიდვა თბილისში?",
    heroSub: "საქართველოს #1 უძრავი ქონების ანალიტიკის პლატფორმა",
    heroDesc: "რეალური საბაზრო ფასები 20+ რაიონში — განახლება ყოველთვიურად",
    checkPriceBtn: "ფასის შემოწმება",
    viewDistricts: "რაიონების ნახვა",
    fairPrice: "ფასების შემოწმება",
    finishType: "კარკასის ტიპი",
    selectDistrict: "აირჩიეთ რაიონი",
    sizeSqm: "ფართი (კვ.მ)",
    totalPrice: "სრული ფასი ($)",
    check: "შემოწმება",
    source: "წყარო: TBC Capital, თებერვალი 2026",
    aboveMarket: "საბაზრო ფასზე მაღალი",
    belowMarket: "საბაზრო ფასზე დაბალი",
    fairMarket: "სამართლიანი ფასი",
    expected: "მოსალოდნელი",
    listingIs: "ეს განცხადება არის",
    above: "მეტი",
    below: "ნაკლები",
    priceNote: "ფასი შეცვლილია ფართისა და კარკასის ტიპის მიხედვით.",
    avgPrices: "ფასები რაიონების მიხედვით",
    premium: "პრემიუმი",
    mid: "საშუალო",
    affordable: "ხელმისაწვდომი",
    yoy: "წლიდან წლამდე",
    ctaTitle: "ეძებთ ბინას?",
    ctaSub: "გვითხარით რა გჭირდებათ და ჩვენ მოვძებნით საუკეთესო ვარიანტებს.",
    ctaBtn: "ბინის მოძებნა →",
    footerNote: "ფასები ასახავს მეორადი ბაზრის საშუალო მაჩვენებლებს.",
    budget: "რა არის თქვენი ბიუჯეტი?",
    purpose: "საკუთარი გამოყენება თუ ინვესტიცია?",
    ownUse: "საკუთარი გამოყენება",
    investment: "ინვესტიცია / იჯარა",
    both: "ორივე",
    next: "შემდეგი →",
    back: "← უკან",
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
    submit: "გაგზავნა →",
    sending: "იგზავნება...",
    thankYou: "გმადლობთ!",
    thankYouSub: "ჩვენ დაგიკავშირდებით WhatsApp-ზე 24 საათში.",
    backToPrices: "ფასებზე დაბრუნება",
    step: "ნაბიჯი",
    of: "-დან",
    findMyApt: "ბინის მოძებნა",
    answerBoth: "გთხოვთ, უპასუხოთ ორივე კითხვას",
    answerAll: "გთხოვთ, უპასუხოთ ყველა კითხვას",
    enterName: "გთხოვთ, შეიყვანოთ სახელი და WhatsApp ნომერი",
    errorMsg: "შეცდომა, სცადეთ თავიდან",
    districtsTitle: "ყველა რაიონი",
    districtsSub: "დაწვრილებითი ინფორმაცია ყოველი რაიონის შესახებ",
    chartTitle: "2025 vs 2026 — ფასების ცვლილება",
    chartSub: "რაიონების მიხედვით, შავი კარკასი ($/კვ.მ)",
    chartNote: "* 2025 წლის მონაცემები გამოთვლილია TBC Capital-ის ზრდის მაჩვენებლების საფუძველზე",
    perSqm: "კვ.მ",
    segment: "სეგმენტი",
    liveData: "ლაივ მონაცემები",
    stats1: "20+ რაიონი",
    stats2: "ლაივ ფასები",
    stats3: "ყოველთვიური განახლება",
  },
  en: {
    tagline: "Apartment Price Checker - Tbilisi 2026",
    findApt: "Find my apartment",
    domAnalysis: "DOM Analysis",
    mortgage: "Mortgage",
    rental: "Rental",
    hero: "Buying property in Tbilisi?",
    heroSub: "Georgia's #1 Real Estate Intelligence Platform",
    heroDesc: "Real market prices across 20+ districts — updated monthly",
    checkPriceBtn: "Check a Price",
    viewDistricts: "View Districts",
    fairPrice: "Price Checker",
    finishType: "Finish type / კარკასი",
    selectDistrict: "Select district",
    sizeSqm: "Size (sqm)",
    totalPrice: "Total price ($)",
    check: "Check Price",
    source: "Source: TBC Capital, February 2026",
    aboveMarket: "Above market",
    belowMarket: "Below market",
    fairMarket: "Fair market price",
    expected: "Expected for",
    listingIs: "This listing is",
    above: "above",
    below: "below",
    priceNote: "Adjusted for apartment size and finish type.",
    avgPrices: "Prices by district",
    premium: "Premium",
    mid: "Mid-range",
    affordable: "Affordable",
    yoy: "year over year",
    ctaTitle: "Looking for an apartment?",
    ctaSub: "Tell us what you need and we'll find the best options for your budget.",
    ctaBtn: "Find my apartment →",
    footerNote: "Prices are averages for the secondary market. Individual prices vary.",
    budget: "What is your budget?",
    purpose: "Own use or investment?",
    ownUse: "Own use",
    investment: "Investment / rental",
    both: "Both",
    next: "Next →",
    back: "← Back",
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
    submit: "Submit →",
    sending: "Sending...",
    thankYou: "Thank you!",
    thankYouSub: "We'll contact you on WhatsApp within 24 hours with matching apartments.",
    backToPrices: "Back to prices",
    step: "Step",
    of: "of",
    findMyApt: "Find my apartment",
    answerBoth: "Please answer both questions",
    answerAll: "Please answer all questions",
    enterName: "Please enter your name and WhatsApp number",
    errorMsg: "Something went wrong, please try again",
    districtsTitle: "All Districts",
    districtsSub: "Detailed pricing information for each Tbilisi district",
    chartTitle: "2025 vs 2026 — Price Changes",
    chartSub: "By district, black frame ($/sqm)",
    chartNote: "* 2025 data estimated from TBC Capital year-over-year growth rates",
    perSqm: "sqm",
    segment: "Segment",
    liveData: "Live Data",
    stats1: "20+ Districts",
    stats2: "Live Prices",
    stats3: "Monthly Updates",
  }
};

const TYPE_COLORS = {
  Premium:    { bg: "rgba(201,168,76,0.12)",  text: "#A8863A", border: "rgba(201,168,76,0.35)" },
  "Mid-range":{ bg: "rgba(45,82,153,0.08)",   text: "#1E3A6E", border: "rgba(45,82,153,0.25)" },
  Affordable: { bg: "rgba(16,185,129,0.08)",  text: "#065F46", border: "rgba(16,185,129,0.25)" },
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
  const [chartTab, setChartTab] = useState("sale");
  const [formData, setFormData] = useState({
    budget: "", purpose: "", district: "", propertyType: "",
    timeline: "", financing: "", whatsapp: "", name: "",
  });

  useEffect(() => {
    async function fetchPrices() {
      const { data } = await getSupabase()
        .from("prices")
        .select("*")
        .order("recorded_at", { ascending: false });
      if (data) {
        const latest = {};
        const byDistrict = {};
        data.forEach((row) => {
          if (!latest[row.name]) {
            latest[row.name] = {
              name: row.name, nameKa: row.name_ka,
              avgPrice: row.avg_price, change: row.change_yoy, type: row.type,
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
  function checkPrice() {
    const district = districts.find(d => d.name === selectedDistrict);
    if (!district || !size || !price) return;
    const sqm = parseFloat(size);
    const totalPrice = parseFloat(price);
    const pricePerSqm = totalPrice / sqm;
    const sizeAdj = getSizeAdjustment(sqm);
    const finishMult = FINISH_TYPES.find(f => f.id === selectedFinish)?.multiplier || 1.0;
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
    <div className="min-h-screen hero-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/70 text-sm">{lang === "ka" ? "იტვირთება..." : "Loading prices..."}</p>
      </div>
    </div>
  );

  /* ── LEAD FORM ── */
  if (showForm) {
    return (
      <main className="min-h-screen" style={{background:"linear-gradient(135deg,#0B1C3D 0%,#1E3A6E 100%)"}}>
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8" style={{boxShadow:"0 24px 80px rgba(11,28,61,0.35)"}}>
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{background:"linear-gradient(135deg,#C9A84C,#A8863A)"}}>
                  <span className="text-white text-2xl">✓</span>
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{color:"#0B1C3D"}}>{t.thankYou}</h2>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">{t.thankYouSub}</p>
                <button onClick={() => { setShowForm(false); setSubmitted(false); setFormStep(1); }}
                  style={{touchAction:"manipulation",background:"linear-gradient(135deg,#0B1C3D,#1E3A6E)"}}
                  className="text-white px-8 py-3 rounded-xl font-semibold w-full text-sm">
                  {t.backToPrices}
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold" style={{color:"#0B1C3D"}}>{t.findMyApt}</h2>
                  <span className="text-xs text-slate-400 font-medium">{t.step} {formStep} {t.of} 3</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1 mb-8">
                  <div className="h-1 rounded-full transition-all duration-500" style={{width:`${(formStep/3)*100}%`,background:"linear-gradient(90deg,#C9A84C,#A8863A)"}}></div>
                </div>

                {formStep === 1 && (
                  <div>
                    <p className="font-semibold text-slate-800 mb-3 text-sm">{t.budget}</p>
                    {["$40,000-მდე","$40,000 - $80,000","$80,000 - $150,000","$150,000+"].map(opt => (
                      <button key={opt} onClick={() => setFormData({...formData,budget:opt})}
                        style={{touchAction:"manipulation",borderColor:formData.budget===opt?"#C9A84C":"#E2E8F0",background:formData.budget===opt?"rgba(201,168,76,0.08)":"#fff"}}
                        className="w-full text-left px-4 py-3 rounded-xl border mb-2 text-sm font-medium text-slate-700 transition-all">
                        {opt}
                      </button>
                    ))}
                    <p className="font-semibold text-slate-800 mb-3 mt-5 text-sm">{t.purpose}</p>
                    {[t.ownUse,t.investment,t.both].map(opt => (
                      <button key={opt} onClick={() => setFormData({...formData,purpose:opt})}
                        style={{touchAction:"manipulation",borderColor:formData.purpose===opt?"#C9A84C":"#E2E8F0",background:formData.purpose===opt?"rgba(201,168,76,0.08)":"#fff"}}
                        className="w-full text-left px-4 py-3 rounded-xl border mb-2 text-sm font-medium text-slate-700 transition-all">
                        {opt}
                      </button>
                    ))}
                    <button onClick={() => { if(!formData.budget||!formData.purpose){alert(t.answerBoth);return;} setFormStep(2); }}
                      style={{touchAction:"manipulation",background:"linear-gradient(135deg,#0B1C3D,#1E3A6E)"}}
                      className="w-full text-white py-3 rounded-xl font-semibold mt-4 text-sm">
                      {t.next}
                    </button>
                  </div>
                )}

                {formStep === 2 && (
                  <div>
                    <p className="font-semibold text-slate-800 mb-3 text-sm">{t.preferredDistrict}</p>
                    <select onChange={e => setFormData({...formData,district:e.target.value})}
                      className="w-full border rounded-xl px-3 py-3 text-slate-700 text-sm mb-5 outline-none"
                      style={{borderColor:"#E2E8F0"}}>
                      <option value="">{t.selectDistrict}</option>
                      {districts.map(d => <option key={d.name} value={d.name}>{d.nameKa} — {d.name}</option>)}
                      <option value="Open to suggestions">{t.openToSuggestions}</option>
                    </select>
                    <p className="font-semibold text-slate-800 mb-3 text-sm">{t.newOrResale}</p>
                    {[t.newBuild,t.resale,t.noPreference].map(opt => (
                      <button key={opt} onClick={() => setFormData({...formData,propertyType:opt})}
                        style={{touchAction:"manipulation",borderColor:formData.propertyType===opt?"#C9A84C":"#E2E8F0",background:formData.propertyType===opt?"rgba(201,168,76,0.08)":"#fff"}}
                        className="w-full text-left px-4 py-3 rounded-xl border mb-2 text-sm font-medium text-slate-700 transition-all">
                        {opt}
                      </button>
                    ))}
                    <p className="font-semibold text-slate-800 mb-3 mt-5 text-sm">{t.howSoon}</p>
                    {[t.within1,t.oneToThree,t.threeToSix,t.justBrowsing].map(opt => (
                      <button key={opt} onClick={() => setFormData({...formData,timeline:opt})}
                        style={{touchAction:"manipulation",borderColor:formData.timeline===opt?"#C9A84C":"#E2E8F0",background:formData.timeline===opt?"rgba(201,168,76,0.08)":"#fff"}}
                        className="w-full text-left px-4 py-3 rounded-xl border mb-2 text-sm font-medium text-slate-700 transition-all">
                        {opt}
                      </button>
                    ))}
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => setFormStep(1)} style={{touchAction:"manipulation",borderColor:"#E2E8F0"}}
                        className="flex-1 border text-slate-700 py-3 rounded-xl font-medium text-sm">{t.back}</button>
                      <button onClick={() => { if(!formData.district||!formData.propertyType||!formData.timeline){alert(t.answerAll);return;} setFormStep(3); }}
                        style={{touchAction:"manipulation",background:"linear-gradient(135deg,#0B1C3D,#1E3A6E)"}}
                        className="flex-1 text-white py-3 rounded-xl font-semibold text-sm">{t.next}</button>
                    </div>
                  </div>
                )}

                {formStep === 3 && (
                  <div>
                    <p className="font-semibold text-slate-800 mb-3 text-sm">{t.financing}</p>
                    {[t.cash,t.mortgageApproved,t.mortgageNotYet,t.undecided].map(opt => (
                      <button key={opt} onClick={() => setFormData({...formData,financing:opt})}
                        style={{touchAction:"manipulation",borderColor:formData.financing===opt?"#C9A84C":"#E2E8F0",background:formData.financing===opt?"rgba(201,168,76,0.08)":"#fff"}}
                        className="w-full text-left px-4 py-3 rounded-xl border mb-2 text-sm font-medium text-slate-700 transition-all">
                        {opt}
                      </button>
                    ))}
                    <p className="font-semibold text-slate-800 mb-2 mt-5 text-sm">{t.yourName}</p>
                    <input type="text" placeholder={t.firstName}
                      className="w-full border rounded-xl px-4 py-3 text-slate-700 text-sm mb-3 outline-none"
                      style={{borderColor:"#E2E8F0"}}
                      onChange={e => setFormData({...formData,name:e.target.value})} />
                    <p className="font-semibold text-slate-800 mb-2 text-sm">{t.whatsapp}</p>
                    <input type="tel" placeholder="+995 5XX XXX XXX"
                      className="w-full border rounded-xl px-4 py-3 text-slate-700 text-sm mb-5 outline-none"
                      style={{borderColor:"#E2E8F0"}}
                      onChange={e => setFormData({...formData,whatsapp:e.target.value})} />
                    <div className="flex gap-3">
                      <button onClick={() => setFormStep(2)} style={{touchAction:"manipulation",borderColor:"#E2E8F0"}}
                        className="flex-1 border text-slate-700 py-3 rounded-xl font-medium text-sm">{t.back}</button>
                      <button onClick={submitForm} disabled={submitting}
                        style={{touchAction:"manipulation",background:"linear-gradient(135deg,#C9A84C,#A8863A)",opacity:submitting?0.7:1}}
                        className="flex-1 text-white py-3 rounded-xl font-semibold text-sm">
                        {submitting ? t.sending : t.submit}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  /* ── MAIN PAGE ── */
  const maxChart = chartData.length ? Math.max(...chartData.map(d => d[2026])) : 3000;

  return (
    <main className="min-h-screen" style={{background:"#FAFAF8"}}>
      <TickerBar />

      {/* ── STICKY HEADER ── */}
      <header style={{background:"rgba(11,28,61,0.97)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(201,168,76,0.2)",position:"sticky",top:0,zIndex:50}}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div style={{width:36,height:36,background:"linear-gradient(135deg,#C9A84C,#A8863A)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontWeight:800,fontSize:14}}>TP</span>
            </div>
            <div>
              <span className="font-bold text-white text-lg">TbilisiPrice.ge</span>
              <span className="hidden sm:block text-xs" style={{color:"rgba(201,168,76,0.8)"}}>{t.tagline}</span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setLang(lang==="ka"?"en":"ka")}
              style={{touchAction:"manipulation",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.8)",background:"transparent",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:500}}
              className="transition-all hover:border-white/40">
              {lang==="ka"?"EN":"GE"}
            </button>
            <a href="/mortgage"
              style={{border:"1px solid rgba(201,168,76,0.5)",color:"#C9A84C",background:"transparent",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:500}}
              className="hidden sm:block transition-all hover:bg-yellow-500/10">
              {t.mortgage}
            </a>
            <a href="/rental-yield"
              style={{border:"1px solid rgba(201,168,76,0.5)",color:"#C9A84C",background:"transparent",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:500}}
              className="hidden sm:block transition-all hover:bg-yellow-500/10">
              {t.rental}
            </a>
            <a href="/dom"
              style={{border:"1px solid rgba(201,168,76,0.5)",color:"#C9A84C",background:"transparent",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:500}}
              className="hidden sm:block transition-all hover:bg-yellow-500/10">
              {t.domAnalysis}
            </a>
            <button onClick={openForm}
              style={{touchAction:"manipulation",minHeight:40,background:"linear-gradient(135deg,#C9A84C,#A8863A)",border:"none",color:"#fff",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:600}}
              className="transition-all hover:opacity-90">
              {t.findApt}
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{background:"linear-gradient(135deg,#0B1C3D 0%,#1E3A6E 55%,#0B2A4A 100%)",padding:"96px 24px 80px"}}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.35)"}}>
              <span className="pulse-dot"></span>
              <span style={{color:"#C9A84C",fontSize:13,fontWeight:500}}>{t.liveData} — April 2026</span>
            </div>
            <h1 className="font-bold leading-tight mb-4" style={{fontSize:"clamp(40px,6vw,68px)",color:"#fff",letterSpacing:"-0.02em"}}>
              {t.hero}
            </h1>
            <p className="mb-2 font-semibold" style={{color:"#C9A84C",fontSize:"clamp(16px,2vw,22px)",letterSpacing:"0.01em"}}>
              {t.heroSub}
            </p>
            <p className="mb-10" style={{color:"rgba(255,255,255,0.6)",fontSize:16}}>
              {t.heroDesc}
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => document.getElementById('price-checker')?.scrollIntoView({behavior:'smooth'})}
                style={{touchAction:"manipulation",background:"linear-gradient(135deg,#C9A84C,#A8863A)",border:"none",color:"#fff",borderRadius:12,padding:"15px 32px",fontSize:15,fontWeight:600,minHeight:52}}>
                {t.checkPriceBtn}
              </button>
              <button onClick={() => document.getElementById('districts')?.scrollIntoView({behavior:'smooth'})}
                style={{touchAction:"manipulation",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",borderRadius:12,padding:"15px 32px",fontSize:15,fontWeight:500,minHeight:52}}>
                {t.viewDistricts}
              </button>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              {[{tab:"sale",label:"იყიდება ფასები"},{tab:"rent",label:"ქირავდება ფასები"}].map(b => (
                <button key={b.tab} onClick={() => { setChartTab(b.tab); document.getElementById('subdistrict-chart')?.scrollIntoView({behavior:'smooth'}); }}
                  style={{touchAction:"manipulation",background:"transparent",border:"1px solid rgba(255,255,255,0.3)",color:"rgba(255,255,255,0.85)",borderRadius:20,padding:"9px 22px",fontSize:14,fontWeight:500,cursor:"pointer"}}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-2xl">
            {[
              {label:t.stats1, icon:"🏙"},
              {label:t.stats2, icon:"📊"},
              {label:t.stats3, icon:"🔄"},
            ].map(s => (
              <div key={s.label} className="stat-card p-4 text-center" onClick={() => document.getElementById('subdistrict-chart')?.scrollIntoView({behavior:'smooth'})} style={{cursor:"pointer"}}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div style={{color:"#fff",fontSize:13,fontWeight:500}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APARTMENT ESTIMATOR ── */}
      <section style={{background:"#fff",padding:"72px 24px",borderBottom:"1px solid #E2E8F0"}}>
        <div className="max-w-4xl mx-auto">
          <ApartmentEstimator lang={lang} />
        </div>
      </section>

      {/* ── PRICE CHECKER ── */}
      <section id="price-checker" style={{background:"linear-gradient(180deg,#F0F4FA 0%,#FAFAF8 100%)",padding:"80px 24px"}}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"#C9A84C"}}>Market Intelligence</p>
            <h2 className="font-bold mb-1" style={{fontSize:32,color:"#0B1C3D",letterSpacing:"-0.01em"}}>{t.fairPrice}</h2>
            <div className="divider-gold"></div>
            <p style={{color:"#64748B",fontSize:15}}>{lang==="ka" ? "შეიყვანეთ ბინის დეტალები სამართლიანი ფასის დასადგენად" : "Enter property details to check if the asking price is fair"}</p>
          </div>

          <div className="bg-white rounded-2xl p-8" style={{boxShadow:"0 8px 40px rgba(11,28,61,0.10)",border:"1px solid #E2E8F0"}}>
            {/* Finish type selector */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"#64748B"}}>{t.finishType}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {FINISH_TYPES.map(f => (
                <button key={f.id} onClick={() => { setSelectedFinish(f.id); setResult(null); }}
                  style={{touchAction:"manipulation",borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:500,transition:"all 0.2s",
                    border: selectedFinish===f.id ? "2px solid #C9A84C" : "1.5px solid #E2E8F0",
                    background: selectedFinish===f.id ? "rgba(201,168,76,0.12)" : "#F8FAFC",
                    color: selectedFinish===f.id ? "#A8863A" : "#64748B",
                  }}>
                  {lang==="ka" ? f.ka : f.en}
                </button>
              ))}
            </div>
            <p className="text-xs mb-6 italic" style={{color:"#94A3B8"}}>
              {FINISH_TYPES.find(f=>f.id===selectedFinish)?.[lang==="ka"?"desc_ka":"desc_en"]}
            </p>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <select className="input-luxury"
                onChange={e => { setSelectedDistrict(e.target.value); setResult(null); }}>
                <option value="">{t.selectDistrict}</option>
                {districts.map(d => <option key={d.name} value={d.name}>{d.nameKa} — {d.name}</option>)}
              </select>
              <input type="text" placeholder={t.sizeSqm} className="input-luxury"
                onChange={e => { setSize(e.target.value); setResult(null); }} />
              <input type="text" placeholder={t.totalPrice} className="input-luxury"
                onChange={e => { setPrice(e.target.value); setResult(null); }} />
            </div>
            <button onClick={checkPrice} style={{touchAction:"manipulation",background:"linear-gradient(135deg,#0B1C3D,#1E3A6E)",color:"#fff",border:"none",borderRadius:12,padding:"13px 32px",fontSize:14,fontWeight:600,width:"100%"}}>
              {t.check}
            </button>

            {/* Result */}
            {result && (
              <div className="mt-6 rounded-xl p-6" style={{
                background: result.diff > 15 ? "rgba(239,68,68,0.05)" : result.diff < -10 ? "rgba(16,185,129,0.05)" : "rgba(201,168,76,0.07)",
                border: `1.5px solid ${result.diff > 15 ? "rgba(239,68,68,0.3)" : result.diff < -10 ? "rgba(16,185,129,0.3)" : "rgba(201,168,76,0.4)"}`,
              }}>
                <div className="flex items-start gap-3 flex-wrap">
                  <div style={{
                    fontSize:28, fontWeight:700,
                    color: result.diff > 15 ? "#DC2626" : result.diff < -10 ? "#059669" : "#A8863A"
                  }}>
                    ${result.pricePerSqm.toLocaleString()}/{lang==="ka"?"კვ.მ":"m²"}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold" style={{color: result.diff > 15 ? "#DC2626" : result.diff < -10 ? "#059669" : "#A8863A", fontSize:15}}>
                      {result.diff > 15 ? "⚠️ "+t.aboveMarket : result.diff < -10 ? "✅ "+t.belowMarket : "✓ "+t.fairMarket}
                    </p>
                    <p className="text-sm mt-1" style={{color:"#64748B"}}>
                      {t.expected} {result.sqm} {t.perSqm} {lang==="ka"?"•":""} {result.district.nameKa}: ${result.adjustedAvg}/{lang==="ka"?"კვ.მ":"m²"}
                      {" "}— {t.listingIs} {Math.abs(result.diff)}% {result.diff > 0 ? t.above : t.below}
                    </p>
                    <p className="text-xs mt-2" style={{color:"#94A3B8"}}>{t.priceNote}</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs mt-4" style={{color:"#94A3B8"}}>{t.source}</p>
          </div>
        </div>
      </section>

      {/* ── 2025 vs 2026 CHART ── */}
      {chartData.length > 0 && (
        <section style={{background:"#fff",padding:"56px 24px",borderTop:"1px solid #E2E8F0"}}>
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setChartOpen(!chartOpen)}
              style={{touchAction:"manipulation",width:"100%",textAlign:"left",background:"none",border:"none",cursor:"pointer"}}
              className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{color:"#C9A84C"}}>Price Trends</p>
                <h3 className="font-bold" style={{fontSize:26,color:"#0B1C3D",letterSpacing:"-0.01em"}}>{t.chartTitle}</h3>
              </div>
              <div style={{width:40,height:40,borderRadius:10,background:"#F0F4FA",border:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",color:"#0B1C3D",fontSize:18,flexShrink:0}}>
                {chartOpen ? "▲" : "▼"}
              </div>
            </button>

            {chartOpen && (
              <div className="mt-8">
                <p className="text-sm mb-8" style={{color:"#64748B"}}>{t.chartSub}</p>
                <div className="space-y-5">
                  {chartData.map(d => (
                    <div key={d.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium" style={{color:"#0B1C3D"}}>{lang==="ka" ? d.nameKa : d.name}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:"rgba(16,185,129,0.1)",color:"#059669"}}>
                          +{Math.round(((d[2026]-d[2025])/d[2025])*100)}%
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs w-10" style={{color:"#94A3B8"}}>2025</span>
                          <div style={{flex:1,height:8,background:"#F0F4FA",borderRadius:4,overflow:"hidden"}}>
                            <div style={{width:`${(d[2025]/maxChart)*100}%`,height:"100%",background:"rgba(30,58,110,0.35)",borderRadius:4}}></div>
                          </div>
                          <span className="text-xs font-medium w-20 text-right" style={{color:"#64748B"}}>${d[2025].toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs w-10" style={{color:"#C9A84C",fontWeight:600}}>2026</span>
                          <div style={{flex:1,height:8,background:"#F0F4FA",borderRadius:4,overflow:"hidden"}}>
                            <div style={{width:`${(d[2026]/maxChart)*100}%`,height:"100%",background:"linear-gradient(90deg,#1E3A6E,#2D5299)",borderRadius:4}}></div>
                          </div>
                          <span className="text-xs font-bold w-20 text-right" style={{color:"#0B1C3D"}}>${d[2026].toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-8" style={{color:"#94A3B8"}}>{t.chartNote}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SUBDISTRICT CHART ── */}
      <section id="subdistrict-chart" style={{background:"linear-gradient(180deg,#F0F4FA 0%,#FAFAF8 100%)",padding:"72px 24px"}}>
        <div className="max-w-4xl mx-auto">
          <div style={{display:"flex",gap:4,background:"#E2E8F0",borderRadius:12,padding:4,width:"fit-content",marginBottom:28}}>
            {[{id:"sale",label:"იყიდება"},{id:"rent",label:"ქირავდება"}].map(tab => (
              <button key={tab.id} onClick={() => setChartTab(tab.id)}
                style={{touchAction:"manipulation",padding:"8px 22px",borderRadius:9,fontSize:14,fontWeight:600,border:"none",cursor:"pointer",transition:"all 0.2s",
                  background: chartTab===tab.id ? "#1E3A6E" : "transparent",
                  color: chartTab===tab.id ? "#fff" : "#64748B"}}>
                {tab.label}
              </button>
            ))}
          </div>
          <SubdistrictPriceChart lang={lang} dataSource={chartTab==="rent" ? "/data/rents.json" : "/data/prices.json"} />
        </div>
      </section>

      {/* ── DISTRICTS GRID ── */}
      <section id="districts" style={{background:"#fff",padding:"80px 24px",borderTop:"1px solid #E2E8F0"}}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"#C9A84C"}}>Explore</p>
            <h2 className="font-bold mb-1" style={{fontSize:32,color:"#0B1C3D",letterSpacing:"-0.01em"}}>{t.districtsTitle}</h2>
            <div className="divider-gold"></div>
            <p style={{color:"#64748B",fontSize:15}}>{t.districtsSub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DISTRICTS_STATIC.map(d => {
              const tc = TYPE_COLORS[d.type] || TYPE_COLORS["Affordable"];
              const isPos = !d.yoy.startsWith("-");
              return (
                <a key={d.slug} href={`/${d.slug}`}
                  className="card-luxury block p-5 group"
                  style={{textDecoration:"none"}}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-base" style={{color:"#0B1C3D"}}>{d.ka}</p>
                      <p className="text-xs" style={{color:"#94A3B8"}}>{d.en}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{background:tc.bg,color:tc.text,border:`1px solid ${tc.border}`}}>
                      {lang==="ka" ? (d.type==="Premium"?"პრემიუმი":d.type==="Mid-range"?"საშუალო":"ხელმისაწვდომი") : d.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-bold" style={{fontSize:22,color:"#0B1C3D",letterSpacing:"-0.02em"}}>${d.price.toLocaleString()}</p>
                      <p className="text-xs" style={{color:"#94A3B8"}}>/{lang==="ka"?"კვ.მ":"m²"}</p>
                    </div>
                    <span className="text-sm font-bold" style={{color:isPos?"#059669":"#DC2626"}}>
                      {d.yoy} YoY
                    </span>
                  </div>
                  <div className="mt-3 pt-3" style={{borderTop:"1px solid #F1F5F9"}}>
                    <span className="text-xs font-medium" style={{color:"#C9A84C",letterSpacing:"0.02em"}}>
                      {lang==="ka"?"დეტალების ნახვა →":"View details →"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{background:"linear-gradient(135deg,#0B1C3D 0%,#1E3A6E 60%,#0B2A4A 100%)",padding:"96px 24px",textAlign:"center"}}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.35)"}}>
            <span style={{color:"#C9A84C",fontSize:13,fontWeight:500}}>Free Consultation</span>
          </div>
          <h3 className="font-bold mb-4" style={{fontSize:"clamp(28px,4vw,44px)",color:"#fff",letterSpacing:"-0.02em"}}>{t.ctaTitle}</h3>
          <p className="mb-10" style={{color:"rgba(255,255,255,0.6)",fontSize:17,lineHeight:1.6}}>{t.ctaSub}</p>
          <button onClick={openForm}
            style={{touchAction:"manipulation",minHeight:56,background:"linear-gradient(135deg,#C9A84C,#A8863A)",border:"none",color:"#fff",borderRadius:14,padding:"16px 40px",fontSize:16,fontWeight:700,display:"inline-block"}}>
            {t.ctaBtn}
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:"#0B1C3D",padding:"40px 24px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div style={{width:32,height:32,background:"linear-gradient(135deg,#C9A84C,#A8863A)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:"#fff",fontWeight:800,fontSize:12}}>TP</span>
              </div>
              <span className="font-bold" style={{color:"#fff"}}>TbilisiPrice.ge</span>
            </div>
            <div className="flex gap-6">
              <a href="/mortgage" style={{color:"rgba(255,255,255,0.5)",fontSize:13,textDecoration:"none"}} className="hover:text-white transition-colors">{t.mortgage}</a>
              <a href="/rental-yield" style={{color:"rgba(255,255,255,0.5)",fontSize:13,textDecoration:"none"}} className="hover:text-white transition-colors">{t.rental}</a>
            </div>
          </div>
          <div className="mt-6 pt-6" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            <p style={{color:"rgba(255,255,255,0.3)",fontSize:12,textAlign:"center"}}>{t.source} &nbsp;·&nbsp; {t.footerNote}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
