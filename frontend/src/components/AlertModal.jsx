import React, { useState } from 'react';
import { X, Bell, CheckCircle2, Volume2 } from 'lucide-react';

export function playAlertSiren() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First alert beep (880 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.22);

    // Second higher alert beep (1046 Hz - C6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046, ctx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (err) {
    console.warn('Web Audio playback error:', err);
  }
}

export function triggerBrowserNotification(title, body) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body, tag: 'better-aqi-spike' });
    } catch {}
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        try {
          new Notification(title, { body, tag: 'better-aqi-spike' });
        } catch {}
      }
    });
  }
}

export default function AlertModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Rohini, Delhi');
  const [threshold, setThreshold] = useState('90');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testedAudio, setTestedAudio] = useState(false);

  if (!isOpen) return null;

  const handleTestSiren = () => {
    playAlertSiren();
    triggerBrowserNotification(
      '🚨 better_AQI Emergency Air Alert',
      `PM2.5 spike detected in ${location}! Hazardous air levels breach threshold (${threshold} µg/m³).`
    );
    setTestedAudio(true);
    setTimeout(() => setTestedAudio(false), 3000);
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
        // Play siren and trigger push notification
        playAlertSiren();
        triggerBrowserNotification(
          '🚨 better_AQI Alert Protocol Activated',
          `Automated monitoring active for ${location} (PM2.5 > ${threshold} µg/m³).`
        );
        setStatus({ success: true, message: data.message });
      } else {
        setStatus({ success: false, message: 'Failed to subscribe. Please verify your email.' });
      }
    } catch {
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
              onClick={handleTestSiren}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginBottom: '10px',
              }}
            >
              <Volume2 size={14} color="#10B981" /> Replay Emergency Siren
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
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Audio & Push Verification</span>
                <span style={{ fontSize: '0.7rem', color: '#10B981' }}>Web Audio API</span>
              </div>
              <button
                type="button"
                onClick={handleTestSiren}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  background: testedAudio ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.12)',
                  border: testedAudio ? '1px solid #10B981' : '1px solid rgba(239, 68, 68, 0.35)',
                  color: testedAudio ? '#10B981' : '#F87171',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
              >
                <Volume2 size={16} />
                {testedAudio ? '🔊 Siren & Notification Triggered!' : '🔊 Test Emergency Siren & Sound Alert'}
              </button>
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
