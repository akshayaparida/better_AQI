import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AQIMap from './components/AQIMap';
import CommuteWidget from './components/CommuteWidget';
import SchoolAdvisoryCard from './components/SchoolAdvisoryCard';
import IndoorPurifierCard from './components/IndoorPurifierCard';
import StubblePanel from './components/StubblePanel';
import AlertModal from './components/AlertModal';
import { Gauge } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTransitMode, setSelectedTransitMode] = useState('two_wheeler');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Telemetry States
  const [aqiData, setAqiData] = useState(null);
  const [commuteData, setCommuteData] = useState(null);
  const [schoolData, setSchoolData] = useState(null);
  const [stubbleData, setStubbleData] = useState(null);

  // Fetch all initial data from backend
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [aqiRes, schoolRes, stubbleRes] = await Promise.all([
          fetch('/api/aqi/live'),
          fetch('/api/advisory/school'),
          fetch('/api/stubble/hotspots'),
        ]);

        if (aqiRes.ok) setAqiData(await aqiRes.json());
        if (schoolRes.ok) setSchoolData(await schoolRes.json());
        if (stubbleRes.ok) setStubbleData(await stubbleRes.json());
      } catch (err) {
        console.error('Error fetching backend telemetry:', err);
      }
    }
    loadInitialData();
  }, []);

  // Fetch commute when transit mode changes
  useEffect(() => {
    async function loadCommute() {
      try {
        const res = await fetch(`/api/exposure/commute?transit_mode=${selectedTransitMode}`);
        if (res.ok) {
          setCommuteData(await res.json());
        }
      } catch (err) {
        console.error('Error fetching commute:', err);
      }
    }
    loadCommute();
  }, [selectedTransitMode]);

  const current = aqiData?.current;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1.15fr 0.85fr',
        gap: '24px',
        padding: '24px 28px',
        maxWidth: '1680px',
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Left Column: Interactive Map */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '620px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Delhi NCR Regional Air Matrix</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Open-Meteo Telemetry • Ground Monitors • NASA Fire Thermal Ingestion
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
              aqiData={aqiData}
              stubbleData={stubbleData}
              commuteData={commuteData}
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
                      National Ambient Air Quality Index (NAAQS)
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
      </main>

      {/* Cloud Alert Modal */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </div>
  );
}
