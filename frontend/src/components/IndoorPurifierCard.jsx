import React, { useState, useEffect } from 'react';
import { Home, Timer } from 'lucide-react';

export default function IndoorPurifierCard() {
  const [areaSqft, setAreaSqft] = useState(240);
  const [cadr, setCadr] = useState(320);
  const [sealing, setSealing] = useState('standard');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchIndoor() {
      try {
        const res = await fetch('/api/indoor/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room_area_sqft: Number(areaSqft),
            ceiling_height_ft: 10.0,
            window_sealing: sealing,
            has_air_purifier: true,
            purifier_cadr_m3h: Number(cadr),
          }),
        });
        if (res.ok && !ignore) {
          const data = await res.json();
          setResult(data);
        }
      } catch (err) {
        console.error('Failed to calculate indoor air quality', err);
      }
    }

    fetchIndoor();
    return () => {
      ignore = true;
    };
  }, [areaSqft, cadr, sealing]);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '8px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '8px', color: '#06B6D4' }}>
          <Home size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Indoor Air & Purifier Calculator</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Simulate classroom or living room particulate reduction
          </p>
        </div>
      </div>

      {/* Interactive Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Room Area</span>
            <span style={{ fontWeight: '700', color: '#06B6D4' }}>{areaSqft} sq.ft</span>
          </div>
          <input
            type="range"
            min="100"
            max="800"
            step="20"
            value={areaSqft}
            onChange={(e) => setAreaSqft(e.target.value)}
            style={{ width: '100%', accentColor: '#06B6D4' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Purifier CADR Rating</span>
            <span style={{ fontWeight: '700', color: '#10B981' }}>{cadr} m³/h</span>
          </div>
          <input
            type="range"
            min="120"
            max="600"
            step="20"
            value={cadr}
            onChange={(e) => setCadr(e.target.value)}
            style={{ width: '100%', accentColor: '#10B981' }}
          />
        </div>
      </div>

      {/* Sealing Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Window Sealing:</span>
        {['airtight', 'standard', 'poor'].map((s) => (
          <button
            key={s}
            onClick={() => setSealing(s)}
            className={`btn-secondary ${sealing === s ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize' }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results Box */}
      {result && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {/* Comparison Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Outdoor Air</span>
              <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#EF4444' }}>
                {result.air_metrics.outdoor_pm25} µg
              </span>
            </div>
            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Without Filter</span>
              <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#F59E0B' }}>
                {result.air_metrics.indoor_pm25_without_purifier} µg
              </span>
            </div>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>With HEPA Filter</span>
              <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#10B981' }}>
                {result.air_metrics.indoor_pm25_with_purifier} µg
              </span>
            </div>
          </div>

          {/* Action Countdown Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
          }}>
            <Timer size={24} color="#10B981" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#10B981' }}>
                {result.purifier_performance.minutes_to_reach_safe_air} Minutes to Safe Air
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                {result.action_advisory}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
