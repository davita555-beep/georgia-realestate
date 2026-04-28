import os

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "app")

districts = [
    ("mtatsminda", "Mtatsminda", "მთაწმინდა", 2293, "+7%",  "Premium",   "#C9A84C", "#059669"),
    ("vera",        "Vera",        "ვერა",      1950, "+8%",  "Premium",   "#C9A84C", "#059669"),
    ("saburtalo",   "Saburtalo",   "საბურთალო", 1602, "+5%",  "Mid-range", "#2D5299", "#059669"),
    ("chughureti",  "Chughureti",  "ჩუღურეთი",  1455, "+7%",  "Mid-range", "#2D5299", "#059669"),
    ("krtsanisi",   "Krtsanisi",   "კრწანისი",  1451, "+3%",  "Mid-range", "#2D5299", "#059669"),
    ("didube",      "Didube",      "დიდუბე",    1236, "-1%",  "Mid-range", "#2D5299", "#DC2626"),
    ("isani",       "Isani",       "ისანი",     1195, "+2%",  "Mid-range", "#2D5299", "#059669"),
    ("nadzaladevi", "Nadzaladevi", "ნაძალადევი",1123, "-3%",  "Affordable","#059669", "#DC2626"),
    ("avlabari",    "Avlabari",    "ავლაბარი",  1150, "+6%",  "Mid-range", "#2D5299", "#059669"),
    ("didi-dighomi","Didi Dighomi","დიდი დიღომი",1142,"+3%",  "Affordable","#059669", "#059669"),
    ("samgori",     "Samgori",     "სამგორი",   1138, "+12%", "Affordable","#059669", "#059669"),
    ("gldani",      "Gldani",      "გლდანი",    1134, "+1%",  "Affordable","#059669", "#059669"),
    ("vashlijvari", "Vashlijvari", "ვაშლიჯვარი",1050, "+5%",  "Affordable","#059669", "#059669"),
    ("ortachala",   "Ortachala",   "ორთაჭალა",  980,  "+4%",  "Affordable","#059669", "#059669"),
    ("vazisubani",  "Vazisubani",  "ვაზისუბანი",920,  "+2%",  "Affordable","#059669", "#059669"),
    ("varketili",   "Varketili",   "ვარკეთილი", 900,  "+3%",  "Affordable","#059669", "#059669"),
    ("tskneti",     "Tskneti",     "წყნეთი",    850,  "+3%",  "Affordable","#059669", "#059669"),
    ("lilo",        "Lilo",        "ლილო",      800,  "+2%",  "Affordable","#059669", "#059669"),
    ("ponichala",   "Ponichala",   "პონიჭალა",  750,  "+1%",  "Affordable","#059669", "#059669"),
]

def make(slug, en, ka, base, yoy, segment, pc, yc):
    w = round(base * 1.13)
    g = round(base * 1.18)
    r = round(base * 1.32)
    return (
        'export const metadata = {\n'
        f'  title: "{en} Apartment Prices 2026 | TbilisiPrice.ge",\n'
        f'  description: "{en} district apartment prices in Tbilisi. Average ${base:,}/sqm. Updated April 2026.",\n'
        '};\n'
        'export default function DistrictPage() {\n'
        '  return (\n'
        '    <main className="min-h-screen" style={{background:"#FAFAF8"}}>\n'
        '      <header style={{background:"rgba(11,28,61,0.97)",borderBottom:"1px solid rgba(201,168,76,0.2)"}}>\n'
        '        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">\n'
        '          <div className="flex items-center gap-3">\n'
        '            <div style={{width:34,height:34,background:"linear-gradient(135deg,#C9A84C,#A8863A)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontWeight:800,fontSize:13}}>TP</span></div>\n'
        '            <a href="/" style={{fontWeight:700,color:"#fff",fontSize:17,textDecoration:"none"}}>TbilisiPrice.ge</a>\n'
        '          </div>\n'
        '          <a href="/" style={{color:"#C9A84C",fontSize:13,fontWeight:500,textDecoration:"none",border:"1px solid rgba(201,168,76,0.4)",borderRadius:8,padding:"6px 14px"}}>&#8592; Back</a>\n'
        '        </div>\n'
        '      </header>\n'
        '      <section style={{background:"linear-gradient(135deg,#0B1C3D 0%,#1E3A6E 55%,#0B2A4A 100%)",padding:"72px 24px 64px"}}>\n'
        '        <div className="max-w-5xl mx-auto">\n'
        f'          <p style={{{{color:"rgba(201,168,76,0.7)",fontSize:13,fontWeight:500,marginBottom:10}}}}>Tbilisi / {en}</p>\n'
        f'          <h1 style={{{{fontSize:"clamp(36px,5vw,56px)",fontWeight:800,color:"#fff",letterSpacing:"-0.02em",marginBottom:8}}}}>{ka} &#8212; {en}</h1>\n'
        '          <p style={{color:"rgba(255,255,255,0.5)",fontSize:16}}>Apartment prices &#183; April 2026</p>\n'
        '        </div>\n'
        '      </section>\n'
        '      <section style={{padding:"64px 24px"}}>\n'
        '        <div className="max-w-5xl mx-auto">\n'
        '          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">\n'
        '            <div style={{background:"#fff",borderRadius:16,padding:"28px 24px",textAlign:"center",boxShadow:"0 4px 24px rgba(11,28,61,0.08)",border:"1px solid #E2E8F0"}}>\n'
        f'              <p style={{{{fontSize:36,fontWeight:800,color:"{pc}",letterSpacing:"-0.02em"}}}}>${base:,}</p>\n'
        '              <p style={{color:"#94A3B8",fontSize:13,marginTop:6,fontWeight:500}}>Average / m&#178;</p>\n'
        '            </div>\n'
        '            <div style={{background:"#fff",borderRadius:16,padding:"28px 24px",textAlign:"center",boxShadow:"0 4px 24px rgba(11,28,61,0.08)",border:"1px solid #E2E8F0"}}>\n'
        f'              <p style={{{{fontSize:36,fontWeight:800,color:"{yc}",letterSpacing:"-0.02em"}}}}>{yoy}</p>\n'
        '              <p style={{color:"#94A3B8",fontSize:13,marginTop:6,fontWeight:500}}>Year over year</p>\n'
        '            </div>\n'
        '            <div style={{background:"#fff",borderRadius:16,padding:"28px 24px",textAlign:"center",boxShadow:"0 4px 24px rgba(11,28,61,0.08)",border:"1px solid #E2E8F0"}}>\n'
        f'              <p style={{{{fontSize:36,fontWeight:800,color:"{pc}",letterSpacing:"-0.02em"}}}}>{segment}</p>\n'
        '              <p style={{color:"#94A3B8",fontSize:13,marginTop:6,fontWeight:500}}>Segment</p>\n'
        '            </div>\n'
        '          </div>\n'
        '          <div style={{background:"#fff",borderRadius:20,padding:"40px",boxShadow:"0 4px 24px rgba(11,28,61,0.08)",border:"1px solid #E2E8F0",marginBottom:24}}>\n'
        '            <h2 style={{fontSize:22,fontWeight:700,color:"#0B1C3D",marginBottom:24}}>Prices by finish type</h2>\n'
        '            <div style={{display:"flex",flexDirection:"column",gap:10}}>\n'
        '              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#F8FAFC",borderRadius:12,padding:"14px 20px"}}>\n'
        '                <div><span style={{fontWeight:600,color:"#0B1C3D",fontSize:14}}>Black Frame</span><span style={{color:"#94A3B8",fontSize:12,marginLeft:10}}>Bare concrete</span></div>\n'
        f'                <span style={{{{fontWeight:700,fontSize:16,color:"#64748B"}}}}>${base:,}/m&#178;</span>\n'
        '              </div>\n'
        '              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(45,82,153,0.05)",borderRadius:12,padding:"14px 20px"}}>\n'
        '                <div><span style={{fontWeight:600,color:"#0B1C3D",fontSize:14}}>White Frame</span><span style={{color:"#94A3B8",fontSize:12,marginLeft:10}}>Plastered, utilities</span></div>\n'
        f'                <span style={{{{fontWeight:700,fontSize:16,color:"#2D5299"}}}}>${w:,}/m&#178;</span>\n'
        '              </div>\n'
        '              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(16,185,129,0.05)",borderRadius:12,padding:"14px 20px"}}>\n'
        '                <div><span style={{fontWeight:600,color:"#0B1C3D",fontSize:14}}>Green Frame</span><span style={{color:"#94A3B8",fontSize:12,marginLeft:10}}>Semi-finished</span></div>\n'
        f'                <span style={{{{fontWeight:700,fontSize:16,color:"#059669"}}}}>${g:,}/m&#178;</span>\n'
        '              </div>\n'
        '              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(201,168,76,0.07)",borderRadius:12,padding:"14px 20px"}}>\n'
        '                <div><span style={{fontWeight:600,color:"#0B1C3D",fontSize:14}}>Renovated</span><span style={{color:"#94A3B8",fontSize:12,marginLeft:10}}>Move-in ready</span></div>\n'
        f'                <span style={{{{fontWeight:700,fontSize:16,color:"#A8863A"}}}}>${r:,}/m&#178;</span>\n'
        '              </div>\n'
        '            </div>\n'
        '          </div>\n'
        '          <div style={{background:"linear-gradient(135deg,#0B1C3D,#1E3A6E)",borderRadius:20,padding:"40px",textAlign:"center",marginBottom:32}}>\n'
        '            <h2 style={{fontSize:22,fontWeight:700,color:"#fff",marginBottom:10}}>Check if a listing is fairly priced</h2>\n'
        '            <p style={{color:"rgba(255,255,255,0.55)",fontSize:15,marginBottom:24}}>Enter the apartment size and price to see if it matches the market.</p>\n'
        '            <a href="/" style={{display:"inline-block",background:"linear-gradient(135deg,#C9A84C,#A8863A)",color:"#fff",borderRadius:12,padding:"14px 32px",fontWeight:700,fontSize:15,textDecoration:"none"}}>Check price on main page</a>\n'
        '          </div>\n'
        '          <div>\n'
        '            <h2 style={{fontSize:20,fontWeight:700,color:"#0B1C3D",marginBottom:16}}>Other districts</h2>\n'
        '            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>\n'
        '              {[{h:"vake",l:"Vake"},{h:"saburtalo",l:"Saburtalo"},{h:"mtatsminda",l:"Mtatsminda"},{h:"gldani",l:"Gldani"},{h:"isani",l:"Isani"},{h:"samgori",l:"Samgori"}].map(d => (\n'
        '                <a key={d.h} href={`/${d.h}`} style={{padding:"8px 16px",background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:10,fontSize:13,color:"#1E3A6E",fontWeight:500,textDecoration:"none"}}>{d.l}</a>\n'
        '              ))}\n'
        '            </div>\n'
        '          </div>\n'
        '        </div>\n'
        '      </section>\n'
        '      <footer style={{background:"#0B1C3D",padding:"32px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",textAlign:"center"}}>\n'
        '        <p style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>Source: TBC Capital Tbilisi Residential Market Report, February 2026.</p>\n'
        '      </footer>\n'
        '    </main>\n'
        '  );\n'
        '}\n'
    )

for slug, en, ka, base, yoy, segment, pc, yc in districts:
    content = make(slug, en, ka, base, yoy, segment, pc, yc)
    path = os.path.join(BASE_DIR, slug, "page.jsx")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"OK: {slug}")

print("All done!")
