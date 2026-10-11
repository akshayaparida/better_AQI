import React, { useState, useEffect } from 'react';
import { VolumeX, AlertTriangle } from 'lucide-react';
import { isSirenActive, stopAlertSiren } from '../utils/sirenAudio';

export default function EmergencySirenBanner({ activeCity, currentPm25 }) {
  const [active, setActive] = useState(isSirenActive);

  useEffect(() => {
    const handleSirenChange = (e) => {
      setActive(Boolean(e.detail?.active));
    };

    window.addEventListener('aqi-siren-state-change', handleSirenChange);
    return () => {
      window.removeEventListener('aqi-siren-state-change', handleSirenChange);
    };
  }, []);

  if (!active) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'linear-gradient(90deg, #991B1B, #DC2626, #B91C1C)',
      color: '#FFFFFF',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      boxShadow: '0 4px 24px rgba(220, 38, 38, 0.6)',
      animation: 'pulse 1.2s infinite ease-in-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '50%',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AlertTriangle size={20} color="#FBBF24" />
        </div>
        <div>
          <strong style={{ fontSize: '0.92rem', letterSpacing: '0.5px' }}>
            🚨 EMERGENCY AIR POLLUTION ALARM ACTIVE!
          </strong>
          <span style={{ fontSize: '0.8rem', opacity: 0.9, marginLeft: '8px', display: 'inline-block' }}>
            {activeCity ? `PM2.5 in ${activeCity.name} is ${currentPm25 ? `${currentPm25} µg/m³` : 'hazardous'}.` : 'Hazardous particulate levels detected.'} Close windows & turn on HEPA filtration.
          </span>
        </div>
      </div>

      <button
        onClick={stopAlertSiren}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: '8px',
          background: '#FFFFFF',
          color: '#991B1B',
          border: 'none',
          fontWeight: '700',
          fontSize: '0.85rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <VolumeX size={18} /> STOP / SILENCE ALARM
      </button>
    </div>
  );
}
