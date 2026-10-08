import React from 'react';
import { Shield, AlertTriangle, Fan, Sun, Users } from 'lucide-react';

export default function SchoolAdvisoryCard({ advisoryData }) {
  if (!advisoryData?.advisory) return null;

  const { assembly, sports_and_recess, classroom_purifiers, optimal_air_exchange_window, vulnerable_students_alert } =
    advisoryData.advisory;
  const current = advisoryData.current_air;

  const getStatusColor = (severity) => {
    if (severity === 'low') return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' };
    if (severity === 'medium') return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' };
    return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' };
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '8px', color: '#F59E0B' }}>
            <Shield size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>School & Student Air Advisory</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              {advisoryData.school_name} • Live Air Safety Protocol
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: current?.color || '#F59E0B' }}>
            {current?.pm2_5} µg/m³
          </span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {current?.cpcb_category} Category
          </span>
        </div>
      </div>

      {/* Operational Directives Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {/* Morning Assembly */}
        <div style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: getStatusColor(assembly.severity).bg,
          border: `1px solid ${getStatusColor(assembly.severity).border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Morning Assembly</span>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: getStatusColor(assembly.severity).text }}>
              {assembly.status}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', marginTop: '6px', color: 'var(--text-primary)' }}>
            {assembly.recommendation}
          </p>
        </div>

        {/* Sports & Physical Recess */}
        <div style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: getStatusColor(sports_and_recess.severity).bg,
          border: `1px solid ${getStatusColor(sports_and_recess.severity).border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Outdoor Sports</span>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: getStatusColor(sports_and_recess.severity).text }}>
              {sports_and_recess.status}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', marginTop: '6px', color: 'var(--text-primary)' }}>
            {sports_and_recess.recommendation}
          </p>
        </div>

        {/* Classroom HEPA Air Purifier */}
        <div style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: getStatusColor(classroom_purifiers.severity).bg,
          border: `1px solid ${getStatusColor(classroom_purifiers.severity).border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>HEPA Filtration</span>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: getStatusColor(classroom_purifiers.severity).text }}>
              {classroom_purifiers.mode}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', marginTop: '6px', color: 'var(--text-primary)' }}>
            {classroom_purifiers.guidance}
          </p>
        </div>
      </div>

      {/* Safe Mid-Day Ventilation Window */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(6, 182, 212, 0.08)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <Sun size={24} color="#06B6D4" style={{ flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#06B6D4' }}>
            Optimal Air Exchange Window: {optimal_air_exchange_window.window}
          </span>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            {optimal_air_exchange_window.reason}
          </p>
        </div>
      </div>

      {/* Asthmatic / Vulnerable Alert */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.82rem', color: '#EF4444', fontWeight: '500' }}>
          {vulnerable_students_alert}
        </span>
      </div>
    </div>
  );
}
