import React, { useState } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Bike,
  Flame,
  Droplets,
  Zap,
  Sparkles,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';

const CITIZEN_ACTIONS = [
  {
    id: 'transit',
    title: 'Clean Mobility & Public Transit',
    desc: 'Shifted travel to Metro, bus, bicycle, walking (<2km), or carpooling today',
    credits: 25,
    pm25SavedGrams: 42,
    co2SavedKg: 2.1,
    icon: Bike,
    color: '#10B981',
  },
  {
    id: 'idling',
    title: 'Strict Zero-Idling at Signals',
    desc: 'Switched off vehicle ignition at red lights and railway crossings (>15s rule)',
    credits: 15,
    pm25SavedGrams: 14,
    co2SavedKg: 0.6,
    icon: Zap,
    color: '#06B6D4',
  },
  {
    id: 'no_burning',
    title: 'Zero Open Burning & Leaf Composting',
    desc: 'Never burn dry leaves, trash, or plastic waste; mulch or compost garden debris instead',
    credits: 30,
    pm25SavedGrams: 110,
    co2SavedKg: 4.8,
    icon: Flame,
    color: '#F59E0B',
  },
  {
    id: 'dust_control',
    title: 'Moist Dust Suppression',
    desc: 'Wet-mopped or lightly sprinkled water on dusty pavement/balcony instead of dry sweeping',
    credits: 15,
    pm25SavedGrams: 35,
    co2SavedKg: 0.1,
    icon: Droplets,
    color: '#3B82F6',
  },
  {
    id: 'energy_saving',
    title: 'Domestic Power Conservation',
    desc: 'Set AC thermostat to 24°C+, turned off standby appliances to reduce power plant load',
    credits: 20,
    pm25SavedGrams: 28,
    co2SavedKg: 1.8,
    icon: Zap,
    color: '#8B5CF6',
  },
  {
    id: 'urban_greening',
    title: 'Green Buffer & Plant Care',
    desc: 'Nurtured or watered air-purifying plants (Neem, Snake Plant, Areca Palm, Tulsi)',
    credits: 15,
    pm25SavedGrams: 18,
    co2SavedKg: 0.4,
    icon: Leaf,
    color: '#10B981',
  },
];

const FIVE_PILLARS = [
  {
    title: '1. Active & Low-Emission Travel',
    icon: Bike,
    color: '#10B981',
    doList: [
      'Prioritize Metro, electric buses, shared transit, or cycling for short errands.',
      'Maintain periodic PUC (Pollution Under Control) validation every 6 months.',
      'Check tire pressure weekly: saves up to 5-8% fuel and reduces exhaust emissions.',
    ],
    dontList: [
      'Avoid driving solo in large personal SUVs for single-occupancy commutes.',
      'Never leave engine running while idling outside schools, shops, or signals.',
    ],
  },
  {
    title: '2. Zero Waste Burning & Composting',
    icon: Flame,
    color: '#F59E0B',
    doList: [
      'Mulch dry fallen leaves or mix them into community soil composting pits.',
      'Segregate recyclable plastics, e-waste, and dry refuse for authorized pick-up.',
      'Report open municipal garbage fires immediately via official pollution hotlines.',
    ],
    dontList: [
      'Never burn plastic wrappers, styrofoam, or tires (releases toxic dioxins & furans).',
      'Never sweep autumn garden leaves into curbside bonfire piles.',
    ],
  },
  {
    title: '3. Particulate Dust Mitigation',
    icon: Droplets,
    color: '#06B6D4',
    doList: [
      'Keep construction sand, cement, and demolition rubble shielded under tarpaulins.',
      'Sprinkle recycled water over bare unpaved driveways and pedestrian paths.',
      'Wet-mop tiled patios and balconies; dry brooms kick fine PM10 back into breathing zone.',
    ],
    dontList: [
      'Avoid carrying uncovered sand/gravel in open trucks or trolleys.',
      'Never blow leaf-blowers or dry sweepers during morning high-inversion hours.',
    ],
  },
  {
    title: '4. Energy Efficiency & Clean Cooking',
    icon: Zap,
    color: '#8B5CF6',
    doList: [
      'Use LPG or electric induction cooktops instead of solid biomass/charcoal stoves.',
      'Maintain domestic air conditioners and clean reusable air filters every month.',
      'Adopt 5-star BEE energy-rated appliances and energy-efficient LED fixtures.',
    ],
    dontList: [
      'Avoid running diesel generator sets (DG sets) when grid electricity is available.',
      'Never use unvented coal heaters inside poorly aerated living quarters.',
    ],
  },
  {
    title: '5. Urban Vegetation & Neighborhood Greenery',
    icon: Leaf,
    color: '#10B981',
    doList: [
      'Plant dense canopy trees (Peepal, Neem, Jamun, Banyan) that trap particulate matter.',
      'Cultivate balcony oxygenators: Snake Plant (Sansevieria), Areca Palm, Money Plant, Tulsi.',
      'Support neighborhood park preservation and green belt plantation drives.',
    ],
    dontList: [
      'Avoid paving over open natural soil patches with impermeable concrete.',
      'Do not cut mature neighborhood branches without municipal forestry permission.',
    ],
  },
];

export default function CitizenResponsibilityCard() {
  const [completedActions, setCompletedActions] = useState(['transit', 'idling']);
  const [pledgeSubmitted, setPledgeSubmitted] = useState(false);
  const [transitKm, setTransitKm] = useState(12);

  const toggleAction = (id) => {
    setCompletedActions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setPledgeSubmitted(false);
  };

  const totalPossibleCredits = CITIZEN_ACTIONS.reduce((sum, a) => sum + a.credits, 0);
  const earnedCredits = CITIZEN_ACTIONS.filter((a) => completedActions.includes(a.id)).reduce(
    (sum, a) => sum + a.credits,
    0
  );
  const progressPercent = Math.round((earnedCredits / totalPossibleCredits) * 100);

  const totalPm25Saved = CITIZEN_ACTIONS.filter((a) => completedActions.includes(a.id)).reduce(
    (sum, a) => sum + a.pm25SavedGrams,
    0
  );

  const totalCo2Saved = CITIZEN_ACTIONS.filter((a) => completedActions.includes(a.id)).reduce(
    (sum, a) => sum + a.co2SavedKg,
    0
  );

  // Dynamic status tier
  let rankBadge = { title: 'Awakening Citizen 🌤️', color: '#9CA3AF' };
  if (progressPercent >= 80) {
    rankBadge = { title: 'Master Air Guardian 🛡️ (Top 5% Eco Impact)', color: '#10B981' };
  } else if (progressPercent >= 50) {
    rankBadge = { title: 'Clean Air Champion 🌿', color: '#06B6D4' };
  } else if (progressPercent >= 25) {
    rankBadge = { title: 'Eco Conscious Commuter 🚲', color: '#F59E0B' };
  }

  // Transit calculator metrics: ~3.5g PM2.5 and 0.19kg CO2 per solo vehicle km eliminated
  const calculatedPm25 = (transitKm * 3.6).toFixed(1);
  const calculatedCo2 = (transitKm * 0.19).toFixed(2);
  const cigaretteEquivalentSaved = (transitKm * 0.15).toFixed(1);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '10px',
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '12px',
            color: '#10B981',
          }}>
            <HeartHandshake size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
                Citizen Responsibility for Clean Air
              </h3>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.18)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                Community Action
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
              Collective civic actions maintain healthy air quality and prevent localized pollution spikes.
            </p>
          </div>
        </div>

        {/* Live Score Badge */}
        <div style={{
          padding: '8px 14px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-color)',
          textAlign: 'right',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
            Daily Citizen Score
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: rankBadge.color }}>
            {earnedCredits} / {totalPossibleCredits} pts
          </span>
        </div>
      </div>

      {/* Interactive Daily Action Checklist & Pledge */}
      <div style={{
        background: 'rgba(6, 18, 28, 0.7)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ fontSize: '0.96rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#10B981" />
              <span>Daily Clean Air Action Checklist</span>
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Check off your sustainable habits today to calculate your community emission savings
            </span>
          </div>

          <div style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: rankBadge.color,
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            {rankBadge.title}
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
            <span>Civic Engagement Level: {progressPercent}% Completed</span>
            <span>Est. Saved Today: <b>{totalPm25Saved}g PM2.5</b> • <b>{totalCo2Saved.toFixed(1)}kg CO₂</b></span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #059669 0%, #10B981 60%, #06B6D4 100%)',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Action Checkboxes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {CITIZEN_ACTIONS.map((action) => {
            const isDone = completedActions.includes(action.id);
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => toggleAction(action.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  background: isDone ? '#10B981' : 'transparent',
                  border: `2px solid ${isDone ? '#10B981' : 'var(--text-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                  flexShrink: 0,
                }}>
                  {isDone && <CheckCircle2 size={14} color="#0B192C" />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: isDone ? '#10B981' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon size={14} color={isDone ? '#10B981' : action.color} />
                      <span>{action.title}</span>
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: '700', color: action.color }}>
                      +{action.credits} pts
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: 1.3 }}>
                    {action.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Pledge Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '6px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Every habit counts toward lowering neighborhood particulate concentrations.
          </span>
          <button
            type="button"
            onClick={() => setPledgeSubmitted(true)}
            className="btn-primary"
            style={{
              padding: '7px 16px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={14} />
            <span>{pledgeSubmitted ? 'Pledge Recorded! 🎉' : 'Record Daily Civic Pledge'}</span>
          </button>
        </div>

        {pledgeSubmitted && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34D399',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <CheckCircle2 size={14} />
            <span>Thank you for being an active air quality steward! Your actions spared your neighborhood <b>{totalPm25Saved}g of PM2.5</b> today.</span>
          </div>
        )}
      </div>

      {/* Micro-Action Emission Savings Calculator */}
      <div style={{
        background: 'rgba(6, 18, 28, 0.55)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingDown size={18} color="#06B6D4" />
          <h4 style={{ fontSize: '0.92rem', margin: 0, color: 'var(--text-primary)' }}>
            Personal Commute Shift Calculator
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Daily distance switched from solo petrol/diesel car to Metro, bus, or bicycle:
          </label>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#06B6D4' }}>
            {transitKm} km / day
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="50"
          value={transitKm}
          onChange={(e) => setTransitKm(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#06B6D4' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '4px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>PM2.5 Prevented</span>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#10B981' }}>{calculatedPm25} g</span>
          </div>

          <div style={{
            padding: '10px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>CO₂ Emissions Sunk</span>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#06B6D4' }}>{calculatedCo2} kg</span>
          </div>

          <div style={{
            padding: '10px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Passive Smoke Shield</span>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#F59E0B' }}>≈ {cigaretteEquivalentSaved} cigs</span>
          </div>
        </div>
      </div>

      {/* 5 Pillars of Clean Air Maintenance */}
      <div>
        <h4 style={{ fontSize: '0.96rem', margin: '0 0 12px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Leaf size={16} color="#10B981" />
          <span>The 5 Pillars of Community Air Quality Stewardship</span>
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
          {FIVE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(6, 18, 28, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    padding: '6px',
                    borderRadius: '6px',
                    background: `${pillar.color}22`,
                    color: pillar.color,
                  }}>
                    <Icon size={16} />
                  </div>
                  <h5 style={{ fontSize: '0.86rem', margin: 0, color: 'var(--text-primary)' }}>
                    {pillar.title}
                  </h5>
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: '600', color: '#10B981', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>✓ Effective Practices (Do's):</span>
                  </div>
                  <ul style={{ paddingLeft: '16px', margin: '0 0 6px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {pillar.doList.map((item, dIdx) => (
                      <li key={dIdx}>{item}</li>
                    ))}
                  </ul>

                  <div style={{ fontWeight: '600', color: '#EF4444', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>✕ Critical Hazards (Don'ts):</span>
                  </div>
                  <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {pillar.dontList.map((item, dnIdx) => (
                      <li key={dnIdx} style={{ color: 'var(--text-muted)' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Citizen Watchdog & Grievance Reporting Directory */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} color="#EF4444" />
          <h4 style={{ fontSize: '0.92rem', margin: 0, color: '#F87171' }}>
            Report Illegal Open Burning & Hazardous Dust Violations
          </h4>
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
          If you observe open garbage combustion, burning leaves, or unshielded construction dust clouds, citizen alerts trigger immediate municipal enforcement:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          <div style={{
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Central Pollution Control Board (CPCB)</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>SAMEER App & Toll-Free 1800-180-1717</span>
          </div>

          <div style={{
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Municipal Grievance Helpline</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>Dial 311 or 1916 (Open Fire Complaint)</span>
          </div>

          <div style={{
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Citizen Reporting Tip</span>
            <span style={{ fontSize: '0.78rem', color: '#FCD34D' }}>Include a clear timestamped, geo-tagged photo with road landmark</span>
          </div>
        </div>
      </div>
    </div>
  );
}
