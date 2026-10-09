import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AQIMap from './components/AQIMap';
import CommuteWidget from './components/CommuteWidget';
import GlobalCitySearch from './components/GlobalCitySearch';
import { POPULAR_WORLD_CITIES, GLOBAL_CITY_HUBS } from './data/locations';
import SchoolAdvisoryCard from './components/SchoolAdvisoryCard';
import IndoorPurifierCard from './components/IndoorPurifierCard';
import StubblePanel from './components/StubblePanel';
import AlertModal from './components/AlertModal';
import { Gauge } from 'lucide-react';

function getHubsForCity(city) {
  if (GLOBAL_CITY_HUBS[city.id]) {
    return GLOBAL_CITY_HUBS[city.id];
  }
  const lat = city.lat;
  const lon = city.lon;
  const name = city.name || 'Metropolis';
  return [
    { id: 'downtown', name: `${name} Downtown Center`, lat: lat, lon: lon },
    { id: 'north_corridor', name: `${name} North District`, lat: Number((lat + 0.045).toFixed(4)), lon: Number((lon + 0.025).toFixed(4)) },
    { id: 'financial_hub', name: `${name} Financial Quarter`, lat: Number((lat - 0.038).toFixed(4)), lon: Number((lon + 0.048).toFixed(4)) },
    { id: 'airport_west', name: `${name} International Airport`, lat: Number((lat - 0.035).toFixed(4)), lon: Number((lon - 0.052).toFixed(4)) },
  ];
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTransitMode, setSelectedTransitMode] = useState('two_wheeler');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Active Worldwide City State
  const [activeCity, setActiveCity] = useState(POPULAR_WORLD_CITIES[0]); // Defaults to Delhi NCR

  // GPS Geolocation State
  const [userLocation, setUserLocation] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Commute Origin & Destination State
  const [originHubId, setOriginHubId] = useState('connaught_place');
  const [destinationHubId, setDestinationHubId] = useState('dtu_campus');

  // Telemetry States
  const [aqiData, setAqiData] = useState(null);
  const [commuteData, setCommuteData] = useState(null);
  const [schoolData, setSchoolData] = useState(null);
  const [stubbleData, setStubbleData] = useState(null);

  const currentHubs = getHubsForCity(activeCity);

  // Fetch telemetry whenever activeCity changes
  useEffect(() => {
    async function loadCityTelemetry() {
      try {
        const [aqiRes, schoolRes, stubbleRes] = await Promise.all([
          fetch(`/api/aqi/live?lat=${activeCity.lat}&lon=${activeCity.lon}`),
          fetch(`/api/advisory/school?lat=${activeCity.lat}&lon=${activeCity.lon}&school_name=${encodeURIComponent(activeCity.name + ' Central Academy')}`),
          fetch('/api/stubble/hotspots'),
        ]);

        if (aqiRes.ok) setAqiData(await aqiRes.json());
        if (schoolRes.ok) setSchoolData(await schoolRes.json());
        if (stubbleRes.ok) setStubbleData(await stubbleRes.json());
      } catch (err) {
        console.error('Error fetching planetary telemetry:', err);
      }
    }
    loadCityTelemetry();
  }, [activeCity]);

  // Handle switching to a new world city
  const handleCitySelect = (city) => {
    setActiveCity(city);
    const hubs = getHubsForCity(city);
    setOriginHubId(hubs[0]?.id || 'downtown');
    setDestinationHubId(hubs[1]?.id || 'north_corridor');
  };

  // Detect HTML5 Geolocation Position anywhere in the world
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          id: 'current_gps',
          name: 'My GPS Location',
          country: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setUserLocation(loc);
        setIsDetectingLocation(false);
        handleCitySelect(loc);
      },
      (err) => {
        setIsDetectingLocation(false);
        console.warn('Geolocation detection notice:', err.message);
        alert(`Location notice: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Fetch commute when transit mode, city, or endpoints change
  useEffect(() => {
    async function loadCommute() {
      const hubs = getHubsForCity(activeCity);
      let startLat = hubs[0]?.lat || activeCity.lat;
      let startLon = hubs[0]?.lon || activeCity.lon;
      let endLat = hubs[1]?.lat || (activeCity.lat + 0.05);
      let endLon = hubs[1]?.lon || (activeCity.lon + 0.03);

      if (originHubId === 'current_location' && userLocation) {
        startLat = userLocation.lat;
        startLon = userLocation.lon;
      } else {
        const startHub = hubs.find((h) => h.id === originHubId);
        if (startHub) {
          startLat = startHub.lat;
          startLon = startHub.lon;
        }
      }

      const endHub = hubs.find((h) => h.id === destinationHubId);
      if (endHub) {
        endLat = endHub.lat;
        endLon = endHub.lon;
      }

      try {
        const res = await fetch(
          `/api/exposure/commute?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}&transit_mode=${selectedTransitMode}`
        );
        if (res.ok) {
          setCommuteData(await res.json());
        }
      } catch (err) {
        console.error('Error fetching commute:', err);
      }
    }
    loadCommute();
  }, [selectedTransitMode, originHubId, destinationHubId, userLocation, activeCity]);

  const current = aqiData?.current;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
        userLocation={userLocation}
        isDetectingLocation={isDetectingLocation}
        onDetectLocation={handleDetectLocation}
      />

      {/* Main Workspace Layout */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '24px 28px',
        maxWidth: '1680px',
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Worldwide Global City Search & Quick Select Bar */}
        <GlobalCitySearch
          activeCity={activeCity}
          onCitySelect={handleCitySelect}
        />

        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: '24px',
        }}>
          {/* Left Column: Interactive Map */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
                  {activeCity.name} Real-Time Air Matrix
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Open-Meteo Global Planetary Telemetry • Ground Monitors • NASA Fire Thermal Ingestion
                </p>
              </div>
              {current && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    background: `${current.color}22`,
                    color: current.color,
                    border: `1px solid ${current.color}55`,
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}>
                    {current.cpcb_category} (PM2.5: {current.pm2_5})
                  </span>
                </div>
              )}
            </div>

            <div style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <AQIMap
                center={[activeCity.lat, activeCity.lon]}
                aqiData={aqiData}
                stubbleData={stubbleData}
                commuteData={commuteData}
                userLocation={userLocation}
                selectedLayer={activeTab === 'stubble' ? 'stubble' : (activeTab === 'commute' ? 'commute' : 'all')}
              />
            </div>
          </section>

          {/* Right Column: Dynamic Interactive Feature Panels */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Primary Air Quality Card */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                        Ambient Air Quality Index (NAAQS / WHO Standard)
                      </span>
                      <h3 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '4px 0', color: current?.color || '#F59E0B' }}>
                        {current?.pm2_5 ?? '...'} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>µg/m³</span>
                      </h3>
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: current?.color || '#F59E0B' }}>
                        {current?.cpcb_category || 'Loading'} Air Quality
                      </span>
                    </div>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: `${current?.color || '#F59E0B'}22`,
                      border: `1px solid ${current?.color || '#F59E0B'}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Gauge size={32} color={current?.color || '#F59E0B'} />
                    </div>
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}>
                    {current?.health_risk || 'Calculating real-time respiratory vulnerability metrics...'}
                  </div>

                  {/* Pollutant Matrix Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
                    {[
                      { label: 'PM10', val: current?.pm10, unit: 'µg' },
                      { label: 'Nitrogen (NO₂)', val: current?.no2, unit: 'µg' },
                      { label: 'Ozone (O₃)', val: current?.o3, unit: 'µg' },
                      { label: 'Sulphur (SO₂)', val: current?.so2, unit: 'µg' },
                      { label: 'Carbon (CO)', val: current?.co, unit: 'µg' },
                      { label: 'US AQI', val: current?.us_aqi, unit: 'idx' },
                    ].map((p, idx) => (
                      <div key={idx} style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{p.label}</span>
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {p.val ?? '--'} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.unit}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Jump Previews */}
                <SchoolAdvisoryCard advisoryData={schoolData} />
              </div>
            )}

            {activeTab === 'commute' && (
              <CommuteWidget
                commuteData={commuteData}
                selectedMode={selectedTransitMode}
                onModeChange={setSelectedTransitMode}
                originId={originHubId}
                destinationId={destinationHubId}
                userLocation={userLocation}
                availableHubs={currentHubs}
                onEndpointsChange={({ originId, destinationId }) => {
                  setOriginHubId(originId);
                  setDestinationHubId(destinationId);
                }}
              />
            )}

            {activeTab === 'school' && (
              <SchoolAdvisoryCard advisoryData={schoolData} />
            )}

            {activeTab === 'indoor' && (
              <IndoorPurifierCard />
            )}

            {activeTab === 'stubble' && (
              <StubblePanel stubbleData={stubbleData} />
            )}
          </section>
        </div>
      </main>

      {/* Cloud Alert Modal */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </div>
  );
}
