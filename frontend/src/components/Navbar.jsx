import React from 'react';
import { Wind, Bell, Shield, Navigation, Home, Flame } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAlertModal }) {
  const tabs = [
    { id: 'overview', label: 'Live AQI & Map', icon: Wind },
    { id: 'commute', label: 'Cleanest Commute', icon: Navigation },
    { id: 'school', label: 'School Advisory', icon: Shield },
    { id: 'indoor', label: 'Indoor Purifier', icon: Home },
    { id: 'stubble', label: 'Stubble Fires', icon: Flame },
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 28px',
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
        }}>
          <Wind size={22} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              better_<span style={{ color: '#10B981' }}>AQI</span>
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textTransform: 'uppercase',
            }}>
              AWS Tour
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span className="pulse-live"></span>
            <span>Live Satellite & Ground Sensors</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '6px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn-secondary ${isActive ? 'active' : ''}`}
              id={`nav-tab-${tab.id}`}
              style={{
                fontSize: '0.85rem',
                padding: '8px 14px',
                borderRadius: '8px',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Cloud Alert Button */}
      <button
        onClick={onOpenAlertModal}
        className="btn-primary"
        id="btn-open-alerts"
        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
      >
        <Bell size={16} />
        <span>Spike Alerts</span>
      </button>
    </header>
  );
}
