export const metadata = {
  title: "Vake Apartment Prices 2026 | TbilisiPrice.ge",
  description: "Vake district apartment prices in Tbilisi. Average $2,380/sqm. Updated April 2026.",
};

export default function DistrictPage() {
  const base = 2380;
  return (
    <main className="min-h-screen" style={{background:"#FAFAF8"}}>
      <header style={{background:"rgba(11,28,61,0.97)",borderBottom:"1px solid rgba(201,168,76,0.2)"}}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div style={{width:34,height:34,background:"linear-gradient(135deg,#C9A84C,#A8863A)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontWeight:800,fontSize:13}}>TP</span>
            </div>
            <a href="/" style={{fontWeight:700,color:"#fff",fontSize:17,textDecoration:"none"}}>TbilisiPrice.ge</a>
          </div>
          <a href="/" style={{color:"#C9A84C",fontSize:13,fontWeight:500,textDecoration:"none",border:"1px solid rgba(201,168,76,0.4)",borderRadius:8,padding:"6px 14px"}}>← Back</a>
        </div>
      </header>

      <section style={{background:"linear-gradient(135deg,#0B1C3D 0%,#1E3A6E 55%,#0B2A4A 100%)",padding:"72px 24px 64px"}}>
        <div className="max-w-5xl mx-auto">
          <p style={{color:"rgba(201,168,76,0.7)",fontSize:13,fontWeight:500,marginBottom:10}}>Tbilisi / Vake</p>
          <h1 style={{fontSize:"clamp(36px,5vw,56px)",fontWeight:800,color:"#fff",letterSpacing:"-0.02em",marginBottom:8}}>ვაკე — Vake</h1>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:16}}>Apartment prices · April 2026</p>
        </div>
      </section>

      <section style={{padding:"64px 24px"}}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {[
              {val:"$2,380",label:"Average / m²",color:"#C9A84C"},
              {val:"+20%",label:"Year over year",color:"#059669"},
              {val:"Premium",label:"Segment",color:"#2D5299"},
            ].map(s => (
              <div key={s.label} style={{background:"#fff",borderRadius:16,padding:"28px 24px",textAlign:"center",boxShadow:"0 4px 24px rgba(11,28,61,0.08)",border:"1px solid #E2E8F0"}}>
                <p style={{fontSize:36,fontWeight:800,color:s.color,letterSpacing:"-0.02em"}}>{s.val}</p>
                <p style={{color:"#94A3B8",fontSize:13,marginTop:6,fontWeight:500}}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{background:"#fff",borderRadius:20,padding:"40px",boxShadow:"0 4px 24px rgba(11,28,61,0.08)",border:"1px solid #E2E8F0",marginBottom:24}}>
            <h2 style={{fontSize:22,fontWeight:700,color:"#0B1C3D",marginBottom:24,letterSpacing:"-0.01em"}}>Prices by finish type</h2>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {label:"Black Frame",   desc:"Bare concrete",          price:`$${base.toLocaleString()}/m²`,         bg:"#F8FAFC", accent:"#64748B"},
                {label:"White Frame",   desc:"Plastered, utilities",   price:`$${Math.round(base*1.13).toLocaleString()}/m²`, bg:"rgba(45,82,153,0.05)", accent:"#2D5299"},
                {label:"Green Frame",   desc:"Semi-finished",          price:`$${Math.round(base*1.18).toLocaleString()}/m²`, bg:"rgba(16,185,129,0.05)", accent:"#059669"},
                {label:"Renovated",     desc:"Move-in ready",          price:`$${Math.round(base*1.32).toLocaleString()}/m²`, bg:"rgba(201,168,76,0.07)", accent:"#A8863A"},
              ].map(row => (
                <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:row.bg,borderRadius:12,padding:"14px 20px",border:`1px solid ${row.bg}`}}>
                  <div>
                    <span style={{fontWeight:600,color:"#0B1C3D",fontSize:14}}>{row.label}</span>
                    <span style={{color:"#94A3B8",fontSize:12,marginLeft:10}}>{row.desc}</span>
                  </div>
                  <span style={{fontWeight:700,fontSize:16,color:row.accent}}>{row.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:"linear-gradient(135deg,#0B1C3D,#1E3A6E)",borderRadius:20,padding:"40px",textAlign:"center",marginBottom:32}}>
            <h2 style={{fontSize:22,fontWeight:700,color:"#fff",marginBottom:10}}>Check if a listing is fairly priced</h2>
            <p style={{color:"rgba(255,255,255,0.55)",fontSize:15,marginBottom:24}}>Enter the apartment size and price to see if it matches the market.</p>
            <a href="/" style={{display:"inline-block",background:"linear-gradient(135deg,#C9A84C,#A8863A)",color:"#fff",borderRadius:12,padding:"14px 32px",fontWeight:700,fontSize:15,textDecoration:"none"}}>
              Check price on main page
            </a>
          </div>

          <div>
            <h2 style={{fontSize:20,fontWeight:700,color:"#0B1C3D",marginBottom:16}}>Other districts</h2>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {[{h:"vake",l:"Vake"},{h:"saburtalo",l:"Saburtalo"},{h:"mtatsminda",l:"Mtatsminda"},{h:"gldani",l:"Gldani"},{h:"isani",l:"Isani"},{h:"samgori",l:"Samgori"}].map(d => (
                <a key={d.h} href={`/${d.h}`} style={{padding:"8px 16px",background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:10,fontSize:13,color:"#1E3A6E",fontWeight:500,textDecoration:"none"}}>{d.l}</a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer style={{background:"#0B1C3D",padding:"32px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",textAlign:"center"}}>
        <p style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>Source: TBC Capital Tbilisi Residential Market Report, February 2026.</p>
      </footer>
    </main>
  );
}
