import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, MapPin, Loader2, X } from 'lucide-react';
import { POPULAR_WORLD_CITIES } from '../data/locations';

export default function GlobalCitySearch({ activeCity, onCitySelect }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search for global cities
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geo/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to search worldwide cities:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    onCitySelect(city);
    setQuery(`${city.name}${city.country ? ', ' + city.country : ''}`);
    setIsOpen(false);
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // 1. If dropdown already has results, select first match
    if (searchResults.length > 0) {
      const top = searchResults[0];
      handleSelect({
        id: top.name.toLowerCase().replace(/\s+/g, '_'),
        name: top.name,
        country: top.country,
        lat: top.lat,
        lon: top.lon,
      });
      return;
    }

    // 2. Check local catalog first (e.g. jaipur, mumbai, etc.)
    const localMatch = POPULAR_WORLD_CITIES.find(
      (c) => c.name.toLowerCase().includes(trimmed.toLowerCase()) || c.id.toLowerCase().includes(trimmed.toLowerCase())
    );
    if (localMatch) {
      handleSelect(localMatch);
      return;
    }

    // 3. Perform immediate fetch
    setIsSearching(true);
    try {
      const res = await fetch(`/api/geo/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const top = data.results[0];
          handleSelect({
            id: top.name.toLowerCase().replace(/\s+/g, '_'),
            name: top.name,
            country: top.country,
            lat: top.lat,
            lon: top.lon,
          });
          return;
        }
      }
    } catch (err) {
      console.error('Failed to search city:', err);
    } finally {
      setIsSearching(false);
    }

    // 4. Universal Free-Text Fallback (Google Maps behavior)
    handleSelect({
      id: trimmed.toLowerCase().replace(/\s+/g, '_'),
      name: trimmed,
      country: 'India',
      lat: activeCity?.lat || 26.9124,
      lon: activeCity?.lon || 75.7873,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} ref={dropdownRef}>
      {/* Worldwide Search Input Bar with Enter Key & Search Button */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}>
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </div>

          <input
            type="text"
            id="global-city-search-input"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val || val.trim().length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                setIsOpen(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit(e);
              }
            }}
            onFocus={() => { if (searchResults.length > 0) setIsOpen(true); }}
            placeholder="🌍 Search any city or location worldwide — universities, villages, landmarks (e.g. DTU, IIT, BITS, Kukas, Ajmer, Jaipur)..."
            style={{
              width: '100%',
              padding: '10px 40px 10px 38px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              backdropFilter: 'blur(10px)',
            }}
          />

          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setIsOpen(false); }}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}

          {/* Autocomplete Results Dropdown */}
          {isOpen && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '6px',
              zIndex: 200,
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
              maxHeight: '260px',
              overflowY: 'auto',
            }}>
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  id={`search-result-${idx}`}
                  className="search-result-item"
                  type="button"
                  onClick={() => handleSelect({
                    id: res.name.toLowerCase().replace(/\s+/g, '_'),
                    name: res.name,
                    country: res.country,
                    lat: res.lat,
                    lon: res.lon,
                  })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <MapPin size={14} color="#10B981" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '600' }}>{res.name}</span>
                      {res.type && (
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60A5FA',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          textTransform: 'capitalize',
                        }}>
                          {res.type}
                        </span>
                      )}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                      {res.admin1 ? `${res.admin1}, ` : ''}{res.country} ({res.lat.toFixed(2)}, {res.lon.toFixed(2)})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          className="btn-primary"
          id="btn-global-city-search"
          style={{ padding: '9px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Search size={15} />
          <span>Search</span>
        </button>

        {/* Global Active Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          fontSize: '0.82rem',
          fontWeight: '600',
        }}>
          <Globe size={15} />
          <span>Active: {activeCity.name}{activeCity.country ? `, ${activeCity.country}` : ''}</span>
        </div>
      </form>

      {/* Quick Select Popular World Capitals & Metropolises */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', whiteSpace: 'nowrap', marginRight: '4px' }}>
          Global Hubs:
        </span>
        {POPULAR_WORLD_CITIES.map((c) => {
          const isSelected = activeCity.id === c.id || (Math.abs(activeCity.lat - c.lat) < 0.05 && Math.abs(activeCity.lon - c.lon) < 0.05);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onCitySelect(c)}
              className={`btn-secondary ${isSelected ? 'active' : ''}`}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: isSelected ? 'rgba(16, 185, 129, 0.25)' : undefined,
                borderColor: isSelected ? '#10B981' : undefined,
                color: isSelected ? '#10B981' : undefined,
              }}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
