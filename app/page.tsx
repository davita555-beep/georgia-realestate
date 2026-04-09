"use client";
import { useState, useEffect } from "react";

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    budget: "",
    purpose: "",
    district: "",
    propertyType: "",
    timeline: "",
    financing: "",
    name: "",
    whatsapp: ""
  });

  // --- ACTIONS ---
  const startSearch = () => {
    setShowForm(true);
    setStep(1);
    setSubmitted(false);
  };

  const nextStep = () => setStep((s) => s + 1);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Connects to your SheetDB to save the lead
      await fetch("https://sheetdb.io/api/v1/4953u0ddyx7rn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          data: { ...formData, date: new Date().toLocaleString() } 
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const districts = ["Vake", "Saburtalo", "Mtatsminda", "Vera", "Didi Dighomi", "Isani", "Gldani", "Krtsanisi", "Didube", "Chughureti"];

  // --- MULTI-STEP FORM COMPONENT ---
  if (showForm) {
    return (
      <div className="fixed inset-0 bg-white z-[10000] overflow-y-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-md">
          {/* Progress Header */}
          <div className="flex justify-between items-center mb-8 pt-4">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
              Question {step} of 7
            </span>
            <button onClick={() => setShowForm(false)} className="text-3xl text-gray-300 hover:text-black">&times;</button>
          </div>

          {submitted ? (
            <div className="text-center py-20 animate-in fade-in duration-500">
              <h2 className="text-4xl font-black mb-4 text-gray-900">Success! ✅</h2>
              <p className="text-gray-500 text-lg mb-10">We are analyzing the market and will contact you on WhatsApp shortly.</p>
              <button onClick={() => setShowForm(false)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl">Back to Website</button>
            </div>
          ) : (
            <div className="space-y-6">
              {step === 1 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6">What is your budget?</h2>
                  {["Under $40k", "$40k - $80k", "$80k - $150k", "$150k+"].map((opt) => (
                    <button key={opt} onClick={() => { setFormData({ ...formData, budget: opt }); nextStep(); }} className="w-full p-5 mb-3 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50 transition-all font-bold">{opt}</button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6">Purpose of purchase?</h2>
                  {["Living", "Investment", "Both"].map((opt) => (
                    <button key={opt} onClick={() => { setFormData({ ...formData, purpose: opt }); nextStep(); }} className="w-full p-5 mb-3 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50 transition-all font-bold">{opt}</button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6">Preferred district?</h2>
                  <div className="grid grid-cols-1 gap-2">
                    {districts.map((d) => (
                      <button key={d} onClick={() => { setFormData({ ...formData, district: d }); nextStep(); }} className="w-full p-4 text-left border-2 border-gray-100 rounded-xl hover:border-blue-600 font-medium">{d}</button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6">Property type?</h2>
                  {["New Build (White/Green Frame)", "Resale Apartment"].map((opt) => (
                    <button key={opt} onClick={() => { setFormData({ ...formData, propertyType: opt }); nextStep(); }} className="w-full p-5 mb-3 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-600 transition-all font-bold">{opt}</button>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6">When do you want to buy?</h2>
                  {["Immediately", "In 1-3 Months", "Just Researching"].map((opt) => (
                    <button key={opt} onClick={() => { setFormData({ ...formData, timeline: opt }); nextStep(); }} className="w-full p-5 mb-3 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-600 transition-all font-bold">{opt}</button>
                  ))}
                </div>
              )}

              {step === 6 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6">Planned financing?</h2>
                  {["Full Cash", "Bank Mortgage", "Installment Plan"].map((opt) => (
                    <button key={opt} onClick={() => { setFormData({ ...formData, financing: opt }); nextStep(); }} className="w-full p-5 mb-3 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-600 transition-all font-bold">{opt}</button>
                  ))}
                </div>
              )}

              {step === 7 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6">Final Step: Contact Info</h2>
                  <p className="text-gray-500 mb-6">We will send you a list of matching properties.</p>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full p-5 border-2 border-gray-100 rounded-2xl mb-4 focus:border-blue-600 outline-none"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="tel" 
                    placeholder="WhatsApp Number (e.g. +995...)" 
                    className="w-full p-5 border-2 border-gray-100 rounded-2xl mb-8 focus:border-blue-600 outline-none"
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  />
                  <button 
                    onClick={handleFinish} 
                    disabled={loading || !formData.whatsapp}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Find My Apartment"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- MAIN LANDING PAGE ---
  return (
    <main className="min-h-screen bg-white">
      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 h-20 bg-white/90 backdrop-blur-md border-b z-[500] px-6 flex justify-between items-center">
        <h1 className="text-xl font-black tracking-tighter text-blue-600">TBILISIPRICE.GE</h1>
        <button 
          onClick={startSearch} 
          className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors z-[1000]"
        >
          Find Apartment
        </button>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight text-gray-900">
          Tbilisi Real Estate <br/>
          <span className="text-blue-600 text-4xl md:text-6xl italic">Simplified.</span>
        </h2>
        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium">
          Stop searching. Tell us what you want, and we'll send the best off-market deals directly to your WhatsApp.
        </p>
        
        <button 
          onClick={startSearch}
          className="bg-blue-600 text-white px-12 py-6 rounded-3xl font-black text-2xl shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
        >
          Start Search 🏠
        </button>
      </section>

      {/* Footer / Mobile Sticky */}
      <div className="fixed bottom-8 left-6 right-6 md:hidden z-[1000]">
        <button 
          onClick={startSearch}
          className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg shadow-2xl active:scale-95 transition-all"
        >
          Find My Apartment
        </button>
      </div>
    </main>
  );
}