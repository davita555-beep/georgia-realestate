"use client";
import { useState, useEffect } from 'react';

export default function TickerBar() {
  const [parts, setParts] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [fxResult, pricesResult, rentsResult] = await Promise.allSettled([
          fetch('https://api.frankfurter.app/latest?from=USD&to=GEL').then(r => r.json()),
          fetch('/data/prices.json').then(r => r.json()),
          fetch('/data/rents.json').then(r => r.json()),
        ]);

        const fx     = fxResult.status     === 'fulfilled' ? fxResult.value     : null;
        const prices = pricesResult.status === 'fulfilled' ? pricesResult.value : null;
        const rents  = rentsResult.status  === 'fulfilled' ? rentsResult.value  : null;

        const rate = fx?.rates?.GEL != null ? Number(fx.rates.GEL).toFixed(2) : null;

        let avgSale = null;
        if (prices) {
          const vals = Object.values(prices).map(v => v.price_per_sqm).filter(v => v > 0);
          if (vals.length) avgSale = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        }

        let cheapest = null;
        if (rents) {
          const sorted = Object.values(rents)
            .filter(v => (v.median_usd ?? v.price_per_sqm) > 0)
            .sort((a, b) => (a.median_usd ?? a.price_per_sqm) - (b.median_usd ?? b.price_per_sqm));
          if (sorted.length) cheapest = sorted[0];
        }

        const built = [
          rate     && { label: 'USD/GEL:',       value: rate },
          avgSale  && { label: 'საშუალო გასაყიდი ფასი:',  value: `$${avgSale.toLocaleString()}/მ²` },
          cheapest && { label: 'დაბალი ქირა:',     value: `${cheapest.name_ka} ₾${Number(cheapest.median_usd ?? cheapest.price_per_sqm).toFixed(2)}/მ²` },
        ].filter(Boolean);

        if (built.length) setParts(built);
      } catch (_) {
        // hide gracefully
      }
    }
    load();
  }, []);

  if (!parts) return null;

  const segment = (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {parts.map((p, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {i > 0 && <span style={{ color: '#334155', margin: '0 18px' }}>•</span>}
          <span style={{ color: '#64748B', fontSize: 13 }}>{p.label}&nbsp;</span>
          <span style={{ color: '#FFB81C', fontSize: 13, fontWeight: 600 }}>{p.value}</span>
        </span>
      ))}
      <span style={{ color: '#334155', margin: '0 18px' }}>•</span>
    </span>
  );

  return (
    <>
      <style>{`@keyframes tbTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <div style={{ background: '#0f1829', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', width: '100%', flexShrink: 0 }}>
        <div style={{ display: 'inline-flex', whiteSpace: 'nowrap', animation: 'tbTicker 28s linear infinite' }}>
          {segment}{segment}
        </div>
      </div>
    </>
  );
}
