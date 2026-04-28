import { useState, useEffect } from 'react';

const GROUP_MAP = {
  'ვაკე': 'vake_saburtalo',
  'საბურთალო': 'vake_saburtalo',
  'ბაგები': 'vake_saburtalo',
  'ლისის ტბა': 'vake_saburtalo',
  'ვეძისი': 'vake_saburtalo',
  'ვაჟა-ფშაველას კვარტლები': 'vake_saburtalo',
  'ნუცუბიძის ფერდობი': 'vake_saburtalo',
  'ლისი': 'vake_saburtalo',
  'მთაწმინდა': 'old_tbilisi',
  'ვერა': 'old_tbilisi',
  'სოლოლაკი': 'old_tbilisi',
  'აბანოთუბანი': 'old_tbilisi',
  'ავლაბარი': 'old_tbilisi',
  'ორთაჭალა': 'old_tbilisi',
  'ისანი': 'isani_samgori',
  'სამგორი': 'isani_samgori',
  'ვარკეთილი': 'isani_samgori',
  'თემქა': 'isani_samgori',
  'ელია': 'isani_samgori',
  'ვაზისუბანი': 'isani_samgori',
  'ნავთლუღი': 'isani_samgori',
  'ორხევი': 'isani_samgori',
  'კონიაკის დასახლება': 'isani_samgori',
  'ლილო': 'isani_samgori',
  'ივერთუბანი': 'isani_samgori',
  'კუკია': 'isani_samgori',
  'სვანეთის უბანი': 'isani_samgori',
  'აეროპორტის დასახლება': 'isani_samgori',
  'აეროპორტის გზატკეცილი': 'isani_samgori',
  'ზაჰესი': 'isani_samgori',
  'ავჭალა': 'isani_samgori',
  'ფონიჭალა': 'isani_samgori',
  'აფრიკის დასახლება': 'isani_samgori',
  'ლოქინი': 'isani_samgori',
  'დიდუბე': 'didube_chughureti',
  'ჩუღურეთი': 'didube_chughureti',
  'ვაშლიჯვარი': 'didube_chughureti',
  'გლდანი': 'gldani_nadzaladevi',
  'ნაძალადევი': 'gldani_nadzaladevi',
  'დიღომი': 'gldani_nadzaladevi',
  'დიღმის მასივი': 'gldani_nadzaladevi',
  'სანზონა': 'gldani_nadzaladevi',
  'მუხიანი': 'gldani_nadzaladevi',
  'გლდანული': 'gldani_nadzaladevi',
  'მესამე მასივი': 'gldani_nadzaladevi',
  'ტყინვალი': 'gldani_nadzaladevi',
};

const GROUP_CONFIG = [
  { id: 'vake_saburtalo',      color: '#2D5299', en: 'Vake–Saburtalo',      ka: 'ვაკე–საბურთალო' },
  { id: 'old_tbilisi',         color: '#7C3AED', en: 'Old Tbilisi',          ka: 'ძველი თბილისი' },
  { id: 'isani_samgori',       color: '#059669', en: 'Isani–Samgori',        ka: 'ისანი–სამგორი' },
  { id: 'didube_chughureti',   color: '#E05B2B', en: 'Didube–Chughureti',   ka: 'დიდუბე–ჩუღურეთი' },
  { id: 'gldani_nadzaladevi',  color: '#D97706', en: 'Gldani–Nadzaladevi',  ka: 'გლდანი–ნაძალადევი' },
];

export default function SubdistrictPriceChart({ lang = 'en' }) {
  const [allData, setAllData] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeGroup, setActiveGroup] = useState('all');
  const [updateDate, setUpdateDate] = useState(null);

  const t = {
    en: {
      title: 'Live Subdistrict Prices',
      subtitle: 'Updated weekly from ss.ge · All 46 subdistricts',
      sortBy: 'Sort',
      highToLow: 'High → Low',
      lowToHigh: 'Low → High',
      allAreas: 'All Districts',
      perSqm: 'per m²',
      listings: 'listings',
      updated: 'Updated',
      loading: 'Loading prices…',
      subdistricts: 'Subdistricts',
      average: 'Average',
      highest: 'Highest',
      totalListings: 'Listings',
      newBuild: 'New',
      resale: 'Resale',
    },
    ka: {
      title: 'ლაივ ფასები ქვე-რაიონების მიხედვით',
      subtitle: 'განახლება ყოველკვირა ss.ge-დან · ყველა 46 უბანი',
      sortBy: 'დალაგება',
      highToLow: 'ძვირიდან →',
      lowToHigh: 'იაფიდან →',
      allAreas: 'ყველა რაიონი',
      perSqm: 'კვ.მ-ზე',
      listings: 'განცხ.',
      updated: 'განახლდა',
      loading: 'იტვირთება…',
      subdistricts: 'უბნები',
      average: 'საშუალო',
      highest: 'მაქსიმუმი',
      totalListings: 'განცხადებები',
      newBuild: 'ახალი',
      resale: 'მეორადი',
    },
  };
  const text = t[lang] || t.en;

  useEffect(() => {
    async function load() {
      try {
        const data = await fetch('/data/prices.json').then(r => r.json());
        const items = Object.entries(data)
          .map(([key, v]) => ({
            name: v.name_ka || key,
            price: v.price_per_sqm || 0,
            sampleSize: v.sample_size || 0,
            updated: v.updated,
            newBuild: v.price_per_sqm_new_build,
            resale: v.price_per_sqm_resale,
            group: GROUP_MAP[v.name_ka || key] || 'gldani_nadzaladevi',
          }))
          .filter(d => d.price > 0 && d.sampleSize >= 5);

        const dates = items.map(d => d.updated).filter(Boolean).sort().reverse();
        if (dates.length) {
          setUpdateDate(new Date(dates[0]).toLocaleDateString(
            lang === 'ka' ? 'ka-GE' : 'en-US',
            { month: 'long', day: 'numeric' }
          ));
        }
        setAllData(items);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [lang]);

  const maxPrice = allData.length ? Math.max(...allData.map(d => d.price)) : 1;

  const visibleGroups = activeGroup === 'all'
    ? GROUP_CONFIG
    : GROUP_CONFIG.filter(g => g.id === activeGroup);

  const getGroupItems = (groupId) =>
    allData
      .filter(d => d.group === groupId)
      .sort((a, b) => sortOrder === 'desc' ? b.price - a.price : a.price - b.price);

  const flatVisible = visibleGroups.flatMap(g => getGroupItems(g.id));
  const totalListings = flatVisible.reduce((s, d) => s + d.sampleSize, 0);
  const avgPrice = flatVisible.length
    ? Math.round(flatVisible.reduce((s, d) => s + d.price, 0) / flatVisible.length)
    : 0;
  const topPrice = flatVisible.length ? Math.max(...flatVisible.map(d => d.price)) : 0;

  if (!allData.length) {
    return <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>{text.loading}</div>;
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0B1C3D', margin: 0, letterSpacing: '-0.01em' }}>
            {text.title}
          </h2>
          {updateDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)', color: '#059669', fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite', display: 'inline-block' }} />
              {text.updated} {updateDate}
            </span>
          )}
        </div>
        <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>{text.subtitle}</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{text.sortBy}:</span>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
            style={{ border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#0B1C3D', background: '#fff', outline: 'none', cursor: 'pointer' }}>
            <option value="desc">{text.highToLow}</option>
            <option value="asc">{text.lowToHigh}</option>
          </select>
        </div>

        {/* Group filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveGroup('all')}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1.5px solid', borderColor: activeGroup === 'all' ? '#0B1C3D' : '#E2E8F0', background: activeGroup === 'all' ? '#0B1C3D' : '#fff', color: activeGroup === 'all' ? '#fff' : '#64748B', transition: 'all 0.15s' }}>
            {text.allAreas}
          </button>
          {GROUP_CONFIG.map(g => (
            <button key={g.id} onClick={() => setActiveGroup(g.id)}
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1.5px solid', borderColor: activeGroup === g.id ? g.color : '#E2E8F0', background: activeGroup === g.id ? g.color : '#fff', color: activeGroup === g.id ? '#fff' : '#64748B', transition: 'all 0.15s' }}>
              {lang === 'ka' ? g.ka : g.en}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {visibleGroups.map(group => {
          const items = getGroupItems(group.id);
          if (!items.length) return null;
          const groupAvg = Math.round(items.reduce((s, d) => s + d.price, 0) / items.length);

          return (
            <div key={group.id}>
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${group.color}20` }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: group.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 17, color: '#0B1C3D' }}>{lang === 'ka' ? group.ka : group.en}</span>
                <span style={{ fontSize: 13, color: '#94A3B8' }}>·</span>
                <span style={{ fontSize: 13, color: '#64748B' }}>{items.length} {text.subdistricts}</span>
                <span style={{ fontSize: 13, color: '#94A3B8' }}>·</span>
                <span style={{ fontSize: 13, color: group.color, fontWeight: 600 }}>${groupAvg.toLocaleString()} avg</span>
              </div>

              {/* Subdistrict rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {items.map(item => {
                  const barW = (item.price / maxPrice) * 100;
                  return (
                    <div key={item.name}
                      style={{ position: 'relative', background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(11,28,61,0.04)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(11,28,61,0.10)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(11,28,61,0.04)'}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${barW}%`, background: group.color, opacity: 0.06, borderRadius: 12, pointerEvents: 'none' }} />
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: '#0B1C3D', fontSize: 14 }}>{item.name}</span>
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>({item.sampleSize} {text.listings})</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, fontSize: 17, color: '#0B1C3D' }}>${item.price.toLocaleString()}</span>
                          <span style={{ color: '#94A3B8', fontSize: 12, marginLeft: 4 }}>{text.perSqm}</span>
                          {item.newBuild && item.resale && (
                            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                              {text.newBuild}: ${Math.round(item.newBuild).toLocaleString()} &nbsp;·&nbsp; {text.resale}: ${Math.round(item.resale).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid #E2E8F0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, textAlign: 'center' }}>
          {[
            { val: flatVisible.length,                  label: text.subdistricts,   color: '#2D5299' },
            { val: `$${avgPrice.toLocaleString()}`,     label: text.average,        color: '#059669' },
            { val: `$${topPrice.toLocaleString()}`,     label: text.highest,        color: '#7C3AED' },
            { val: totalListings.toLocaleString(),      label: text.totalListings,  color: '#D97706' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(11,28,61,0.04)' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
