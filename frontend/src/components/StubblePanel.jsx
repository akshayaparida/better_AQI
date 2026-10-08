import React from 'react';
import { Flame, Compass, Wind, AlertCircle } from 'lucide-react';

export default function StubblePanel({ stubbleData }) {
  if (!stubbleData?.summary) return null;

  const { summary, meteorology, hotspot_clusters } = stubbleData;

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(234, 88, 12, 0.15)', borderRadius: '8px', color: '#EA580C' }}>
            <Flame size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Stubble Burning & Smoke Tracker</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Punjab & Haryana Farm Fires • Satellite Thermal Detection
            </p>
          </div>
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '9999px',
          background: 'rgba(234, 88, 12, 0.15)',
          color: '#EA580C',
          border: '1px solid rgba(234, 88, 12, 0.3)',
        }}>
          {summary.smoke_transport_risk}
        </span>
      </div>

      {/* Advisory Message */}
      <div style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(234, 88, 12, 0.08)',
        border: '1px solid rgba(234, 88, 12, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <AlertCircle size={22} color="#EA580C" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>
          {summary.advisory}
        </p>
      </div>

      {/* Meteorology & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
        <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Active Farm Fires</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#EA580C' }}>
            {summary.total_monitored_fires}
          </span>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Wind Speed</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#06B6D4' }}>
            {meteorology.wind_speed_kmh} km/h
          </span>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>NCR PM2.5 Inflow</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F59E0B' }}>
            {summary.stubble_contribution_to_ncr}
          </span>
        </div>
      </div>

      {/* Hotspots District List */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
          Monitored District Clusters:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {hotspot_clusters.map((c, i) => (
            <div key={i} style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>{c.district}</span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.intensity} Density</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#EA580C' }}>
                {c.active_fires} 🔥
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
