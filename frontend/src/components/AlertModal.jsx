import React, { useState } from 'react';
import { X, Bell, CheckCircle2 } from 'lucide-react';

export default function AlertModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Rohini, Delhi');
  const [threshold, setThreshold] = useState('90');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
            <h4 style={{ color: '#10B981', margin: '0 0 6px 0' }}>Subscription Active</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{status.message}</p>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ marginTop: '16px', width: '100%' }}
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

            {status && !status.success && (
              <span style={{ fontSize: '0.8rem', color: '#EF4444' }}>{status.message}</span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Registering with AWS SNS...' : 'Activate Alerts'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
