import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AQIMap from './components/AQIMap';
import CommuteWidget from './components/CommuteWidget';
import GlobalCitySearch from './components/GlobalCitySearch';
import { POPULAR_WORLD_CITIES, GLOBAL_CITY_HUBS } from './data/locations';
import SchoolAdvisoryCard from './components/SchoolAdvisoryCard';
import IndoorPurifierCard from './components/IndoorPurifierCard';
import StubblePanel from './components/StubblePanel';
import CitizenResponsibilityCard from './components/CitizenResponsibilityCard';
import AlertModal from './components/AlertModal';
import { Gauge, HeartHandshake } from 'lucide-react';

function getHubsForCity(city) {
  if (!city) return [];
  const cityKey = (city.id || city.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (GLOBAL_CITY_HUBS[city.id] || GLOBAL_CITY_HUBS[cityKey]) {
    return GLOBAL_CITY_HUBS[city.id] || GLOBAL_CITY_HUBS[cityKey];
  }

  const lat = city.lat || 26.9124;
  const lon = city.lon || 75.7873;
  const rawName = city.name || 'Location';
  const name = rawName.split(',')[0].trim();
  const lowerName = name.toLowerCase();
  const country = (city.country || '').toLowerCase();
  const placeType = (city.type || '').toLowerCase();

  // 1. Universities, Colleges, Campuses, Institutes
  const isEdu = placeType.includes('university') || placeType.includes('college') ||
    lowerName.includes('university') || lowerName.includes('college') ||
    lowerName.includes('campus') || lowerName.includes('institute') ||
    lowerName.includes('iit') || lowerName.includes('bits') || lowerName.includes('nit') || lowerName.includes('dtu');

  if (isEdu) {
    return [
      { id: 'main_gate', name: `${name} Main Gate & Reception`, lat: lat, lon: lon },
      { id: 'admin_block', name: `${name} Central Administrative Block`, lat: Number((lat + 0.003).toFixed(4)), lon: Number((lon + 0.002).toFixed(4)) },
      { id: 'library', name: `${name} Central Library & Academic Hub`, lat: Number((lat - 0.003).toFixed(4)), lon: Number((lon + 0.004).toFixed(4)) },
      { id: 'hostel_block', name: `${name} Student Hostels & Residential Zone`, lat: Number((lat + 0.005).toFixed(4)), lon: Number((lon - 0.003).toFixed(4)) },
      { id: 'sports_arena', name: `${name} Sports Ground & Campus Arena`, lat: Number((lat - 0.004).toFixed(4)), lon: Number((lon - 0.004).toFixed(4)) },
    ];
  }

  // 2. Villages, Rural Panchayats, Hamlets (Culturally tailored like Google Maps)
  const isVillage = placeType.includes('village') || placeType.includes('hamlet') ||
    lowerName.includes('village') || lowerName.includes('gram') || lowerName.includes('panchayat') ||
    ['kukas', 'kookas', 'achrol', 'chandwaji', 'bagru', 'khori', 'naila', 'samode', 'kanota', 'bhanpur', 'dharampur', 'rampur'].some(v => lowerName.includes(v));

  if (isVillage) {
    return [
      { id: 'main_chowk', name: `${name} Main Chowk / Bus Stand`, lat: lat, lon: lon },
      { id: 'panchayat_bhawan', name: `${name} Gram Panchayat Bhawan`, lat: Number((lat + 0.004).toFixed(4)), lon: Number((lon + 0.003).toFixed(4)) },
      { id: 'phc_hospital', name: `${name} Primary Health Centre (PHC)`, lat: Number((lat - 0.004).toFixed(4)), lon: Number((lon + 0.004).toFixed(4)) },
      { id: 'highway_bypass', name: `${name} Highway Bypass Circle`, lat: Number((lat + 0.006).toFixed(4)), lon: Number((lon - 0.004).toFixed(4)) },
      { id: 'main_market', name: `${name} Main Bazaar / Mandi`, lat: Number((lat - 0.003).toFixed(4)), lon: Number((lon - 0.003).toFixed(4)) },
    ];
  }

  // 3. Indian Cities / Towns (Station, ISBT, Civil Lines, Old City)
  if (country.includes('india') || country === '' || ['delhi', 'rajasthan', 'mumbai', 'jaipur', 'up', 'punjab', 'gujarat', 'haryana'].some(r => (city.admin1 || '').toLowerCase().includes(r))) {
    return [
      { id: 'railway_junction', name: `${name} Railway Station / Junction`, lat: lat, lon: lon },
      { id: 'bus_terminal', name: `${name} Central Bus Stand (ISBT)`, lat: Number((lat + 0.025).toFixed(4)), lon: Number((lon + 0.018).toFixed(4)) },
      { id: 'civil_lines', name: `${name} Civil Lines / Main Market`, lat: Number((lat - 0.022).toFixed(4)), lon: Number((lon + 0.028).toFixed(4)) },
      { id: 'old_city', name: `${name} Old City / Heritage Circle`, lat: Number((lat + 0.018).toFixed(4)), lon: Number((lon - 0.022).toFixed(4)) },
      { id: 'ring_road', name: `${name} Ring Road / Highway Bypass`, lat: Number((lat - 0.030).toFixed(4)), lon: Number((lon - 0.025).toFixed(4)) },
    ];
  }

  // 4. United Kingdom & Commonwealth (City Centre, High Street, Central Rail)
  if (country.includes('united kingdom') || country.includes('uk') || country.includes('england') || country.includes('scotland')) {
    return [
      { id: 'high_street', name: `${name} City Centre / High Street`, lat: lat, lon: lon },
      { id: 'central_rail', name: `${name} Central Railway Station`, lat: Number((lat + 0.015).toFixed(4)), lon: Number((lon + 0.012).toFixed(4)) },
      { id: 'market_sq', name: `${name} Market Square & Cathedral Quarter`, lat: Number((lat - 0.012).toFixed(4)), lon: Number((lon + 0.015).toFixed(4)) },
      { id: 'west_end', name: `${name} West End / Riverside Promenade`, lat: Number((lat - 0.018).toFixed(4)), lon: Number((lon - 0.015).toFixed(4)) },
    ];
  }

  // 5. France & Francophone (Centre-Ville, Gare Centrale)
  if (country.includes('france') || country.includes('belgium') || country.includes('switzerland')) {
    return [
      { id: 'centre_ville', name: `${name} Centre-Ville / Place Centrale`, lat: lat, lon: lon },
      { id: 'gare_centrale', name: `${name} Gare Centrale (Station)`, lat: Number((lat + 0.015).toFixed(4)), lon: Number((lon + 0.012).toFixed(4)) },
      { id: 'vieux_quartier', name: `${name} Quartier Historique`, lat: Number((lat - 0.012).toFixed(4)), lon: Number((lon + 0.015).toFixed(4)) },
      { id: 'grand_boulevard', name: `${name} Boulevard Commercial`, lat: Number((lat - 0.018).toFixed(4)), lon: Number((lon - 0.015).toFixed(4)) },
    ];
  }

  // 6. Germany & Central Europe (Stadtmitte, Hauptbahnhof)
  if (country.includes('germany') || country.includes('austria')) {
    return [
      { id: 'stadtmitte', name: `${name} Stadtmitte / Marktplatz`, lat: lat, lon: lon },
      { id: 'hauptbahnhof', name: `${name} Hauptbahnhof (Central Station)`, lat: Number((lat + 0.015).toFixed(4)), lon: Number((lon + 0.012).toFixed(4)) },
      { id: 'altstadt', name: `${name} Altstadt (Historic Old Town)`, lat: Number((lat - 0.012).toFixed(4)), lon: Number((lon + 0.015).toFixed(4)) },
      { id: 'ring_nord', name: `${name} Nordring / Gewerbegebiet`, lat: Number((lat - 0.018).toFixed(4)), lon: Number((lon - 0.015).toFixed(4)) },
    ];
  }

  // 7. Japan & East Asia (Chuo, Dori, Civic Center)
  if (country.includes('japan') || country.includes('korea')) {
    return [
      { id: 'chuo_station', name: `${name} Chuo / Central Station Terminal`, lat: lat, lon: lon },
      { id: 'dori_crossing', name: `${name} Main Commercial Crossing`, lat: Number((lat + 0.015).toFixed(4)), lon: Number((lon + 0.012).toFixed(4)) },
      { id: 'civic_center', name: `${name} Civic Center & Ward Office`, lat: Number((lat - 0.012).toFixed(4)), lon: Number((lon + 0.015).toFixed(4)) },
      { id: 'garden_district', name: `${name} Koen / Garden Promenade`, lat: Number((lat - 0.018).toFixed(4)), lon: Number((lon - 0.015).toFixed(4)) },
    ];
  }

  // 8. Middle East / UAE (Corniche, Old Souk, Marina)
  if (country.includes('uae') || country.includes('saudi') || country.includes('qatar') || country.includes('dubai')) {
    return [
      { id: 'corniche', name: `${name} Corniche / Waterfront Walk`, lat: lat, lon: lon },
      { id: 'financial_hub', name: `${name} Financial District / Trade Center`, lat: Number((lat + 0.015).toFixed(4)), lon: Number((lon + 0.012).toFixed(4)) },
      { id: 'old_souk', name: `${name} Old Souk Heritage Quarter`, lat: Number((lat - 0.012).toFixed(4)), lon: Number((lon + 0.015).toFixed(4)) },
      { id: 'grand_boulevard', name: `${name} Grand Avenue / Marina Mall`, lat: Number((lat - 0.018).toFixed(4)), lon: Number((lon - 0.015).toFixed(4)) },
    ];
  }

  // 9. North America / USA (Downtown, Financial District, Midtown)
  return [
    { id: 'downtown', name: `${name} Downtown / City Center`, lat: lat, lon: lon },
    { id: 'financial_district', name: `${name} Financial District / Metro Hub`, lat: Number((lat + 0.025).toFixed(4)), lon: Number((lon + 0.018).toFixed(4)) },
    { id: 'midtown', name: `${name} Midtown / Arts Quarter`, lat: Number((lat - 0.022).toFixed(4)), lon: Number((lon + 0.028).toFixed(4)) },
    { id: 'airport_west', name: `${name} International Airport Terminal`, lat: Number((lat - 0.030).toFixed(4)), lon: Number((lon - 0.025).toFixed(4)) },
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
  const [customOrigin, setCustomOrigin] = useState(null);
  const [customDestination, setCustomDestination] = useState(null);

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
    const origin = hubs[0] || { id: 'downtown', name: `${city.name} Downtown`, lat: city.lat, lon: city.lon };
    const dest = hubs[1] || { id: 'north_corridor', name: `${city.name} North`, lat: Number((city.lat + 0.045).toFixed(4)), lon: Number((city.lon + 0.025).toFixed(4)) };
    setOriginHubId(origin.id);
    setDestinationHubId(dest.id);
    setCustomOrigin(origin);
    setCustomDestination(dest);
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
      let startLat = customOrigin?.lat;
      let startLon = customOrigin?.lon;
      let endLat = customDestination?.lat;
      let endLon = customDestination?.lon;

      if (!startLat || !startLon) {
        if (originHubId === 'current_location' && userLocation) {
          startLat = userLocation.lat;
          startLon = userLocation.lon;
        } else {
          const startHub = hubs.find((h) => h.id === originHubId) || hubs[0];
          startLat = startHub?.lat || activeCity.lat;
          startLon = startHub?.lon || activeCity.lon;
        }
      }

      if (!endLat || !endLon) {
        const endHub = hubs.find((h) => h.id === destinationHubId) || hubs[1];
        endLat = endHub?.lat || Number((activeCity.lat + 0.045).toFixed(4));
        endLon = endHub?.lon || Number((activeCity.lon + 0.025).toFixed(4));
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
  }, [selectedTransitMode, originHubId, destinationHubId, customOrigin, customDestination, userLocation, activeCity]);

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

                {/* Citizen Responsibility Callout */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '10px', color: '#10B981' }}>
                      <HeartHandshake size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.94rem', margin: 0, color: 'var(--text-primary)' }}>
                        Citizen Responsibility & Action Pledge
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                        Civic actions prevent up to 30% of hyper-local PM2.5 spikes. Check your daily impact.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('citizen')}
                    className="btn-primary"
                    style={{ padding: '7px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>View Citizen Actions</span>
                    <span>→</span>
                  </button>
                </div>
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
                activeCity={activeCity}
                customOrigin={customOrigin}
                customDestination={customDestination}
                onDetectLocation={handleDetectLocation}
                onEndpointsChange={({ originId, destinationId, originLocation, destinationLocation }) => {
                  if (originId) setOriginHubId(originId);
                  if (destinationId) setDestinationHubId(destinationId);
                  if (originLocation !== undefined) setCustomOrigin(originLocation);
                  if (destinationLocation !== undefined) setCustomDestination(destinationLocation);
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

            {activeTab === 'citizen' && (
              <CitizenResponsibilityCard />
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
