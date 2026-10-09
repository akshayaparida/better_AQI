import React from 'react';
import { Navigation, Bike, Car, Footprints, ShieldCheck, Clock, Zap, ArrowLeftRight } from 'lucide-react';

import { POPULAR_HUBS } from '../data/locations';

export default function CommuteWidget({
  commuteData,
  onModeChange,
  selectedMode = 'two_wheeler',
  originId = 'connaught_place',
  destinationId = 'dtu_campus',
  onEndpointsChange,
  userLocation = null,
  availableHubs = POPULAR_HUBS,
}) {
  const modes = [
    { id: 'cycling', label: 'Bicycle', icon: Bike },
    { id: 'two_wheeler', label: 'Two-Wheeler / Auto', icon: Zap },
    { id: 'car_ac', label: 'Car (AC / Cabin Filter)', icon: Car },
    { id: 'walking', label: 'Walking', icon: Footprints },
  ];

  const analysis = commuteData?.analysis;
  const routes = analysis?.routes || [];
  const hubs = availableHubs && availableHubs.length > 0 ? availableHubs : POPULAR_HUBS;

  const originName = originId === 'current_location'
    ? '📍 My Current Location'
    : (hubs.find((h) => h.id === originId)?.name || originId);

  const destinationName = hubs.find((h) => h.id === destinationId)?.name || destinationId;

  const handleSwap = () => {
    if (onEndpointsChange) {
      const fallbackOrigin = hubs[0]?.id || 'connaught_place';
      onEndpointsChange({
        originId: destinationId,
        destinationId: originId === 'current_location' ? fallbackOrigin : originId,
      });
    }
  };

  const handleOriginChange = (e) => {
    if (onEndpointsChange) {
      onEndpointsChange({
        originId: e.target.value,
        destinationId,
      });
    }
  };

  const handleDestinationChange = (e) => {
    if (onEndpointsChange) {
      onEndpointsChange({
        originId,
        destinationId: e.target.value,
      });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: '#10B981' }}>
            <Navigation size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Cleanest Commute Planner</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {originName} ➔ {destinationName}
            </p>
          </div>
        </div>
        {analysis?.percent_inhalation_reduction > 0 && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          }}>
            -{analysis.percent_inhalation_reduction}% Toxic Inhalation
          </span>
        )}
      </div>

      {/* Origin & Destination Route Selector */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
            Origin & Destination Points
          </span>
          <button
            type="button"
            id="btn-swap-endpoints"
            onClick={handleSwap}
            aria-label="Swap Origin and Destination"
            className="btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeftRight size={13} />
            <span>Swap</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label
              htmlFor="commute-origin-select"
              style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}
            >
              Start Origin:
            </label>
            <select
              id="commute-origin-select"
              value={originId}
              onChange={handleOriginChange}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              {userLocation && (
                <option value="current_location">
                  📍 My Current Location ({userLocation.lat.toFixed(3)}, {userLocation.lon.toFixed(3)})
                </option>
              )}
              {hubs.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="commute-destination-select"
              style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}
            >
              Target Destination:
            </label>
            <select
              id="commute-destination-select"
              value={destinationId}
              onChange={handleDestinationChange}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              {hubs.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transit Mode Selector */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
          Select Transit Mode:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`btn-secondary ${isSelected ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '10px 6px',
                  fontSize: '0.75rem',
                }}
              >
                <Icon size={18} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Health Impact Summary Card */}
      {analysis && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <ShieldCheck size={28} color="#10B981" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '0.92rem', color: '#10B981', margin: 0 }}>
              {analysis.summary}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Spares your lungs from inhaling the equivalent of <b>{analysis.cigarettes_saved} passively smoked cigarettes</b>.
            </p>
          </div>
        </div>
      )}

      {/* Route Cards Comparison */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {routes.map((route, idx) => {
          const isCleanest = route.color === '#10B981';
          return (
            <div
              key={idx}
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: isCleanest ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${isCleanest ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: route.color,
                  }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {route.name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />{route.duration_minutes} min</span>
                  <span>{route.distance_km} km</span>
                  <span>Avg PM2.5: {route.avg_pm25} µg/m³</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: '700', color: route.color }}>
                  {route.inhaled_pm25_micrograms} µg
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ≈ {route.cigarette_smoke_equivalent} cigs
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
