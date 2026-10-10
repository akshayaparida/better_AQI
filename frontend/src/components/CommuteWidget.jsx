import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Bike,
  Car,
  Footprints,
  ShieldCheck,
  Clock,
  Zap,
  ArrowLeftRight,
  MapPin,
  Loader2,
  ExternalLink,
  Check,
} from 'lucide-react';

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
  activeCity = null,
  customOrigin = null,
  customDestination = null,
  onDetectLocation = null,
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
    : (customOrigin?.name || hubs.find((h) => h.id === originId)?.name || originId);

  const destinationName = customDestination?.name || hubs.find((h) => h.id === destinationId)?.name || destinationId;

  // Uber-Style Type-Ahead Input States
  const [prevOriginKey, setPrevOriginKey] = useState(originId);
  const [originQuery, setOriginQuery] = useState(originName);
  if (originId !== prevOriginKey) {
    setPrevOriginKey(originId);
    setOriginQuery(originName);
  }

  const [prevDestKey, setPrevDestKey] = useState(destinationId);
  const [destinationQuery, setDestinationQuery] = useState(destinationName);
  if (destinationId !== prevDestKey) {
    setPrevDestKey(destinationId);
    setDestinationQuery(destinationName);
  }

  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [isRouteApplied, setIsRouteApplied] = useState(false);

  const searchCardRef = useRef(null);

  // Close suggestion dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchCardRef.current && !searchCardRef.current.contains(event.target)) {
        setIsOriginOpen(false);
        setIsDestOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for Origin suggestions
  useEffect(() => {
    if (!originQuery || originQuery.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOrigin(true);
      try {
        const qClean = originQuery.trim().toLowerCase();
        const localMatches = hubs.filter(
          (h) => h.name.toLowerCase().includes(qClean) || h.id.toLowerCase().includes(qClean)
        );

        let apiResults = [];
        const res = await fetch(`/api/geo/search?q=${encodeURIComponent(originQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          apiResults = data.results || [];
        }

        const seen = new Set();
        const combined = [];
        for (const item of [...localMatches, ...apiResults]) {
          const key = (item.name || '').toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
          }
        }
        setOriginSuggestions(combined);
        setIsOriginOpen(true);
        setIsDestOpen(false);
      } catch (err) {
        console.error('Failed to search origin suggestions:', err);
      } finally {
        setIsSearchingOrigin(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [originQuery, hubs]);

  // Debounced search for Destination suggestions
  useEffect(() => {
    if (!destinationQuery || destinationQuery.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDestination(true);
      try {
        const qClean = destinationQuery.trim().toLowerCase();
        const localMatches = hubs.filter(
          (h) => h.name.toLowerCase().includes(qClean) || h.id.toLowerCase().includes(qClean)
        );

        let apiResults = [];
        const res = await fetch(`/api/geo/search?q=${encodeURIComponent(destinationQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          apiResults = data.results || [];
        }

        const seen = new Set();
        const combined = [];
        for (const item of [...localMatches, ...apiResults]) {
          const key = (item.name || '').toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
          }
        }
        setDestinationSuggestions(combined);
        setIsDestOpen(true);
        setIsOriginOpen(false);
      } catch (err) {
        console.error('Failed to search destination suggestions:', err);
      } finally {
        setIsSearchingDestination(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [destinationQuery, hubs]);

  const handleSelectOriginSuggestion = (item) => {
    setOriginQuery(item.name);
    setIsOriginOpen(false);
    const existingHub = hubs.find((h) => h.id === item.id || h.name.toLowerCase() === item.name.toLowerCase());
    const newId = existingHub ? existingHub.id : (item.id || item.name.toLowerCase().replace(/\s+/g, '_'));
    if (onEndpointsChange) {
      onEndpointsChange({
        originId: newId,
        destinationId,
        originLocation: item,
        destinationLocation: customDestination,
      });
    }
  };

  const handleSelectDestSuggestion = (item) => {
    setDestinationQuery(item.name);
    setIsDestOpen(false);
    const existingHub = hubs.find((h) => h.id === item.id || h.name.toLowerCase() === item.name.toLowerCase());
    const newId = existingHub ? existingHub.id : (item.id || item.name.toLowerCase().replace(/\s+/g, '_'));
    if (onEndpointsChange) {
      onEndpointsChange({
        originId,
        destinationId: newId,
        originLocation: customOrigin,
        destinationLocation: item,
      });
    }
  };

  // Normal typing submit for Origin (Enter or Blur)
  const handleOriginSubmit = async () => {
    const trimmed = (originQuery || '').trim();
    if (!trimmed) return;
    setIsOriginOpen(false);

    // 1. If suggestion dropdown already has matching item
    if (originSuggestions.length > 0) {
      handleSelectOriginSuggestion(originSuggestions[0]);
      return;
    }

    // 2. Check local catalog
    const localMatch = hubs.find((h) => h.name.toLowerCase().includes(trimmed.toLowerCase()));
    if (localMatch) {
      handleSelectOriginSuggestion(localMatch);
      return;
    }

    // 3. Immediate geocoding lookup
    try {
      const res = await fetch(`/api/geo/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          handleSelectOriginSuggestion(data.results[0]);
          return;
        }
      }
    } catch (err) {
      console.warn('Geocoding notice for origin:', err);
    }

    // 4. Custom fallback coordinate
    handleSelectOriginSuggestion({
      id: trimmed.toLowerCase().replace(/\s+/g, '_'),
      name: trimmed,
      lat: activeCity?.lat || 28.6139,
      lon: activeCity?.lon || 77.2090,
    });
  };

  // Normal typing submit for Destination (Enter or Blur)
  const handleDestSubmit = async () => {
    const trimmed = (destinationQuery || '').trim();
    if (!trimmed) return;
    setIsDestOpen(false);

    // 1. If suggestion dropdown already has matching item
    if (destinationSuggestions.length > 0) {
      handleSelectDestSuggestion(destinationSuggestions[0]);
      return;
    }

    // 2. Check local catalog
    const localMatch = hubs.find((h) => h.name.toLowerCase().includes(trimmed.toLowerCase()));
    if (localMatch) {
      handleSelectDestSuggestion(localMatch);
      return;
    }

    // 3. Immediate geocoding lookup
    try {
      const res = await fetch(`/api/geo/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          handleSelectDestSuggestion(data.results[0]);
          return;
        }
      }
    } catch (err) {
      console.warn('Geocoding notice for destination:', err);
    }

    // 4. Custom fallback coordinate
    handleSelectDestSuggestion({
      id: trimmed.toLowerCase().replace(/\s+/g, '_'),
      name: trimmed,
      lat: (activeCity?.lat || 28.6139) + 0.045,
      lon: (activeCity?.lon || 77.2090) + 0.025,
    });
  };

  const handleApplyBoth = async () => {
    await Promise.all([handleOriginSubmit(), handleDestSubmit()]);
    setIsRouteApplied(true);
    setTimeout(() => setIsRouteApplied(false), 2000);
  };

  // Google Maps Export Action
  const handleOpenGoogleMaps = () => {
    let startLat = customOrigin?.lat;
    let startLon = customOrigin?.lon;
    if (!startLat || !startLon) {
      if (originId === 'current_location' && userLocation) {
        startLat = userLocation.lat;
        startLon = userLocation.lon;
      } else {
        const h = hubs.find((hub) => hub.id === originId) || hubs[0];
        startLat = h?.lat || activeCity?.lat || 28.6139;
        startLon = h?.lon || activeCity?.lon || 77.2090;
      }
    }

    let endLat = customDestination?.lat;
    let endLon = customDestination?.lon;
    if (!endLat || !endLon) {
      const h = hubs.find((hub) => hub.id === destinationId) || hubs[1];
      endLat = h?.lat || (activeCity?.lat || 28.6139) + 0.045;
      endLon = h?.lon || (activeCity?.lon || 77.2090) + 0.025;
    }

    let travelMode = 'driving';
    if (selectedMode === 'cycling') travelMode = 'bicycling';
    else if (selectedMode === 'walking') travelMode = 'walking';
    else if (selectedMode === 'two_wheeler' || selectedMode === 'car_ac') travelMode = 'driving';

    const originParam = (originQuery && originQuery.trim() && !originQuery.includes('My Current Location'))
      ? encodeURIComponent(originQuery.trim())
      : `${startLat},${startLon}`;
    const destParam = (destinationQuery && destinationQuery.trim())
      ? encodeURIComponent(destinationQuery.trim())
      : `${endLat},${endLon}`;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=${travelMode}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleUseCurrentGps = () => {
    if (userLocation) {
      setOriginQuery('📍 My Current Location');
      if (onEndpointsChange) {
        onEndpointsChange({
          originId: 'current_location',
          destinationId,
          originLocation: userLocation,
          destinationLocation: customDestination,
        });
      }
    } else if (onDetectLocation) {
      onDetectLocation();
    } else {
      alert('Please click the "Detect GPS" button in the top navigation bar.');
    }
  };

  const handleSwap = () => {
    setIsOriginOpen(false);
    setIsDestOpen(false);
    if (onEndpointsChange) {
      const fallbackOrigin = hubs[0]?.id || 'connaught_place';
      const newOriginId = destinationId;
      const newDestId = originId === 'current_location' ? fallbackOrigin : originId;

      setOriginQuery(destinationQuery);
      setDestinationQuery(originQuery);

      onEndpointsChange({
        originId: newOriginId,
        destinationId: newDestId,
      });
    }
  };

  const handleOriginChange = (e) => {
    const val = e.target.value;
    const hub = hubs.find((h) => h.id === val);
    if (hub) setOriginQuery(hub.name);
    if (onEndpointsChange) {
      onEndpointsChange({
        originId: val,
        destinationId,
      });
    }
  };

  const handleDestinationChange = (e) => {
    const val = e.target.value;
    const hub = hubs.find((h) => h.id === val);
    if (hub) setDestinationQuery(hub.name);
    if (onEndpointsChange) {
      onEndpointsChange({
        originId,
        destinationId: val,
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
            background: 'rgba(16, 185, 129, 0.18)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}>
            <span>🛡️</span>
            <span>{analysis.percent_inhalation_reduction}% Cleaner Air Exposure</span>
          </span>
        )}
      </div>

      {/* Uber-Style Route Search Interface */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🚗 Uber-Style Commute Search
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              (Type any city, street, or landmark & hit Enter)
            </span>
          </div>
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
              borderRadius: '8px',
            }}
          >
            <ArrowLeftRight size={13} />
            <span>Swap</span>
          </button>
        </div>

        {/* Dual Type-Ahead Inputs with Visual Connector Line & Clean Non-Overlapping Suggestions */}
        <div style={{ position: 'relative' }} ref={searchCardRef}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Left Ride Connector Visual Dots */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '84px',
              padding: '6px 0',
              flexShrink: 0,
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
              <div style={{ width: '2px', flex: 1, margin: '4px 0', background: 'repeating-linear-gradient(to bottom, #6B7280, #6B7280 3px, transparent 3px, transparent 6px)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#EF4444', boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }} />
            </div>

            {/* Inputs Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Origin Type-Ahead Search Input */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      id="commute-origin-input"
                      value={originQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOriginQuery(val);
                        setIsDestOpen(false);
                        if (!val || val.trim().length < 2) {
                          setOriginSuggestions([]);
                          setIsOriginOpen(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsOriginOpen(false);
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          handleOriginSubmit();
                        }
                      }}
                      onBlur={handleOriginSubmit}
                      onFocus={() => {
                        setIsDestOpen(false);
                        if (originSuggestions.length > 0) setIsOriginOpen(true);
                      }}
                      placeholder="Pickup location, university, or village (e.g. DTU, BITS, Kukas, Hawa Mahal)..."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.84rem',
                        outline: 'none',
                      }}
                    />
                    {isSearchingOrigin && (
                      <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: '10px', top: '11px', color: 'var(--text-muted)' }} />
                    )}
                  </div>

                  <button
                    type="button"
                    id="btn-use-gps-origin"
                    onClick={() => {
                      setIsOriginOpen(false);
                      setIsDestOpen(false);
                      handleUseCurrentGps();
                    }}
                    className="btn-secondary"
                    title="Use current GPS position"
                    style={{
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      background: originId === 'current_location' ? 'rgba(16, 185, 129, 0.2)' : undefined,
                      borderColor: originId === 'current_location' ? '#10B981' : undefined,
                      color: originId === 'current_location' ? '#10B981' : undefined,
                    }}
                  >
                    <Navigation size={12} />
                    <span>GPS</span>
                  </button>
                </div>
              </div>

              {/* Destination Type-Ahead Search Input */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      id="commute-destination-input"
                      value={destinationQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDestinationQuery(val);
                        setIsOriginOpen(false);
                        if (!val || val.trim().length < 2) {
                          setDestinationSuggestions([]);
                          setIsDestOpen(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsDestOpen(false);
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          handleDestSubmit();
                        }
                      }}
                      onBlur={handleDestSubmit}
                      onFocus={() => {
                        setIsOriginOpen(false);
                        if (destinationSuggestions.length > 0) setIsDestOpen(true);
                      }}
                      placeholder="Drop-off destination, university, or village (e.g. Amer Fort, Airport, DTU)..."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.84rem',
                        outline: 'none',
                      }}
                    />
                    {isSearchingDestination && (
                      <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: '10px', top: '11px', color: 'var(--text-muted)' }} />
                    )}
                  </div>

                  <button
                    type="button"
                    id="btn-apply-route"
                    onClick={() => {
                      setIsOriginOpen(false);
                      setIsDestOpen(false);
                      handleApplyBoth();
                    }}
                    className="btn-primary"
                    title="Apply typed route"
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isRouteApplied ? <Check size={13} /> : <Navigation size={13} />}
                    <span>{isRouteApplied ? 'Applied' : 'Apply'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Non-Overlapping Suggestions Dropdown Panel - Anchored cleanly below BOTH inputs */}
          {((isOriginOpen && originSuggestions.length > 0) || (isDestOpen && destinationSuggestions.length > 0)) && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'rgba(15, 23, 42, 0.96)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '6px',
              zIndex: 200,
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
              maxHeight: '220px',
              overflowY: 'auto',
            }}>
              {/* Friendly Header with Instant Dismiss */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '4px',
              }}>
                <span style={{
                  fontSize: '0.74rem',
                  color: isOriginOpen ? '#10B981' : '#F87171',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <MapPin size={13} />
                  <span>
                    {isOriginOpen ? 'Suggested Pickup Locations' : 'Suggested Destination Locations'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsOriginOpen(false);
                    setIsDestOpen(false);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'var(--text-muted)',
                    fontSize: '0.7rem',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Close suggestions"
                >
                  ✕ Close (Esc)
                </button>
              </div>

              {/* Suggestions List */}
              {(isOriginOpen ? originSuggestions : destinationSuggestions).map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  className="commute-suggestion-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (isOriginOpen) handleSelectOriginSuggestion(sug);
                    else handleSelectDestSuggestion(sug);
                  }}
                  onClick={() => {
                    if (isOriginOpen) handleSelectOriginSuggestion(sug);
                    else handleSelectDestSuggestion(sug);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <MapPin size={13} color={isOriginOpen ? '#10B981' : '#EF4444'} style={{ flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    <span style={{ fontWeight: '600' }}>{sug.name}</span>
                    {sug.type && (
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '1px 6px',
                        marginLeft: '6px',
                        borderRadius: '4px',
                        background: isOriginOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: isOriginOpen ? '#10B981' : '#F87171',
                        border: `1px solid ${isOriginOpen ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      }}>
                        {sug.type}
                      </span>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginLeft: '6px' }}>
                      {sug.admin1 ? `${sug.admin1}, ` : ''}{sug.country || ''}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    Select
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Landmark Chips for Active City */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
            ⚡ Popular {activeCity?.name || 'Local'} Spots:
          </span>
          {hubs.map((hub) => (
            <button
              key={hub.id}
              type="button"
              id={`chip-landmark-${hub.id}`}
              onClick={() => handleSelectDestSuggestion(hub)}
              className="btn-secondary"
              style={{
                padding: '3px 9px',
                fontSize: '0.73rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: destinationId === hub.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                borderColor: destinationId === hub.id ? '#6366F1' : 'var(--border-color)',
                color: destinationId === hub.id ? '#818CF8' : 'var(--text-primary)',
              }}
              title="Click to set destination"
            >
              <MapPin size={10} color="#818CF8" />
              <span>{hub.name.split('(')[0].split('/')[0].trim()}</span>
            </button>
          ))}
        </div>

        {/* Accessible Synchronized Hub Selectors */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginTop: '6px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <div>
            <label
              htmlFor="commute-origin-select"
              style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}
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
                padding: '7px 8px',
                fontSize: '0.78rem',
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
              style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}
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
                padding: '7px 8px',
                fontSize: '0.78rem',
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

      {/* Google Maps GPS Turn-by-Turn Navigation Action Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(16, 185, 129, 0.15))',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(37, 99, 235, 0.25)', borderRadius: '8px', color: '#60A5FA' }}>
            <ExternalLink size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.92rem', margin: 0, color: 'var(--text-primary)' }}>
              Ready to Navigate in Google Maps?
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Launch live GPS directions for <b>{originName}</b> ➔ <b>{destinationName}</b>
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-open-google-maps"
          onClick={handleOpenGoogleMaps}
          className="btn-primary"
          style={{
            padding: '9px 18px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563EB, #10B981)',
            border: 'none',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            cursor: 'pointer',
          }}
        >
          <ExternalLink size={15} />
          <span>Open in Google Maps</span>
        </button>
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
            <h4 style={{ fontSize: '0.92rem', color: '#10B981', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🌿</span>
              <span>{analysis.summary.replace(/toxic PM2\.5 exposure/i, 'fine dust (PM2.5) exposure')}</span>
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Health benefit: Spares your lungs from inhaling the equivalent of <b>{analysis.cigarettes_saved} passively smoked cigarettes</b>.
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: route.color,
                  }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {route.name}
                  </span>
                  {isCleanest ? (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                    }}>
                      🌿 Clean Air Path (Recommended)
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#F87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}>
                      ⚠️ High Traffic Corridor (Heavier Dust Exposure)
                    </span>
                  )}
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
                  ≈ {route.cigarette_smoke_equivalent} cigs equiv. fine dust
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
