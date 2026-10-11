import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import {
  startContinuousHighRiseSiren,
  stopAlertSiren,
  isSirenActive,
  triggerBrowserNotification,
} from '../utils/sirenAudio';

export default function AlertModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Rohini, Delhi');
  const [threshold, setThreshold] = useState('90');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(isSirenActive);
  const [autoAlarmArmed, setAutoAlarmArmed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auto_siren_enabled') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleState = (e) => setIsAlarmPlaying(Boolean(e.detail?.active));
      window.addEventListener('aqi-siren-state-change', handleState);
      return () => window.removeEventListener('aqi-siren-state-change', handleState);
    }
  }, []);

  if (!isOpen) return null;

  const handleToggleSiren = () => {
    if (isAlarmPlaying) {
      stopAlertSiren();
    } else {
      startContinuousHighRiseSiren();
      triggerBrowserNotification(
        '🚨 better_AQI Hazardous Air Alarm Active',
        `Continuous emergency siren sounding for ${location}! Threshold: ${threshold} µg/m³.`
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          phone: phone || null,
          location_name: location,
          threshold_pm25: Number(threshold),
          alert_type: 'spike_alert',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (autoAlarmArmed) {
          startContinuousHighRiseSiren();
        }
        triggerBrowserNotification(
          '🚨 better_AQI Alert Protocol Activated',
          `Automated monitoring active for ${location} (PM2.5 > ${threshold} µg/m³).`
        );
        setStatus({ success: true, message: data?.message || 'Subscription active.' });
      } else {
        setStatus({ success: false, message: 'Failed to subscribe. Please verify your email.' });
      }
    } catch (err) {
      console.error('handleSubmit error:', err);
      setStatus({ success: false, message: 'Server communication error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '28px',
        position: 'relative',
        background: '#111827',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Modal"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', color: '#10B981' }}>
            <Bell size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Automated Spike Alerts</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Powered by AWS SNS & EventBridge
            </p>
          </div>
        </div>

        {status?.success ? (
          <div style={{
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            textAlign: 'center',
          }}>
            <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ color: '#10B981', margin: '0 0 6px 0' }}>Alert Protocol Active</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{status.message}</p>

            <div style={{
              margin: '14px 0',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.3)',
              textAlign: 'left',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div>
                <strong style={{ color: '#10B981' }}>🔊 On this Machine:</strong> Audio siren & browser push alerts trigger automatically.
              </div>
              <div>
                <strong style={{ color: '#F59E0B' }}>☁️ On Mobile (AWS SNS):</strong> SMS text messages and Emails require deploying to AWS (`sam deploy`) where Amazon SNS dispatches over cellular networks.
              </div>
            </div>

            <button
              onClick={handleToggleSiren}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                background: isAlarmPlaying ? '#DC2626' : 'rgba(255, 255, 255, 0.08)',
                border: isAlarmPlaying ? '1px solid #EF4444' : '1px solid var(--border-color)',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: isAlarmPlaying ? '700' : '500',
                cursor: 'pointer',
                marginBottom: '10px',
              }}
            >
              {isAlarmPlaying ? (
                <>
                  <VolumeX size={16} /> ⏹️ STOP / SILENCE ALARM
                </>
              ) : (
                <>
                  <Volume2 size={16} color="#10B981" /> 🚨 Test High-Rise Siren
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Get automated notifications whenever air pollution spikes in your area without needing to check the website.
            </p>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Email Address *</label>
              <input
                type="email"
                required
                placeholder="name@school.edu or user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: '#FFFFFF',
                  marginTop: '4px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Mobile Number (SMS Alerts, Optional)</label>
              <input
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: '#FFFFFF',
                  marginTop: '4px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: '#FFFFFF',
                    marginTop: '4px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>PM2.5 Alert Threshold</label>
                <select
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#1F2937',
                    border: '1px solid var(--border-color)',
                    color: '#FFFFFF',
                    marginTop: '4px',
                    outline: 'none',
                  }}
                >
                  <option value="60">PM2.5 &gt; 60 (Moderate)</option>
                  <option value="90">PM2.5 &gt; 90 (Poor)</option>
                  <option value="120">PM2.5 &gt; 120 (Very Poor)</option>
                  <option value="250">PM2.5 &gt; 250 (Severe / Hazardous)</option>
                </select>
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '8px',
              background: isAlarmPlaying ? 'rgba(220, 38, 38, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: isAlarmPlaying ? '1px solid rgba(220, 38, 38, 0.5)' : '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: '600' }}>
                  Emergency High-Rise Siren Alarm
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  color: isAlarmPlaying ? '#EF4444' : '#10B981',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}>
                  {isAlarmPlaying ? '● SIREN SOUNDING' : 'Web Audio API'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleSiren}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px 14px',
                  borderRadius: '6px',
                  background: isAlarmPlaying ? '#DC2626' : 'rgba(239, 68, 68, 0.15)',
                  border: isAlarmPlaying ? '2px solid #EF4444' : '1px solid rgba(239, 68, 68, 0.4)',
                  color: isAlarmPlaying ? '#FFFFFF' : '#F87171',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  transition: 'all 0.2s ease',
                  boxShadow: isAlarmPlaying ? '0 0 16px rgba(220, 38, 38, 0.5)' : 'none',
                }}
              >
                {isAlarmPlaying ? (
                  <>
                    <VolumeX size={18} /> ⏹️ STOP / SILENCE SIREN
                  </>
                ) : (
                  <>
                    <Volume2 size={18} /> 🚨 Start Continuous High-Rise Siren
                  </>
                )}
              </button>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginTop: '2px',
              }}>
                <input
                  type="checkbox"
                  checked={autoAlarmArmed}
                  onChange={(e) => {
                    setAutoAlarmArmed(e.target.checked);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('auto_siren_enabled', e.target.checked ? 'true' : 'false');
                      localStorage.setItem('auto_siren_threshold', threshold);
                    }
                  }}
                  style={{ accentColor: '#EF4444', cursor: 'pointer' }}
                />
                Sound alarm automatically until stopped when live AQI breaches threshold
              </label>
            </div>

            {status && !status.success && (
              <span style={{ fontSize: '0.8rem', color: '#EF4444' }}>{status.message}</span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '4px' }}
            >
              {loading ? 'Registering with AWS SNS...' : 'Activate Alerts'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
