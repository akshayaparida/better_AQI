/**
 * High-Rise Emergency Air Quality Siren Audio Synthesizer (Web Audio API)
 *
 * Implements a continuous rising-falling emergency acoustic alarm sweep (600 Hz to 1250 Hz)
 * with dual-oscillator harmonics, dynamic compression for maximum speaker loudness,
 * and robust user-gesture unlocking so the siren outputs clearly on all devices.
 */

let sharedCtx = null;
let activeInterval = null;
let activeOsc1 = null;
let activeOsc2 = null;
let activeGain = null;
let isSirenPlaying = false;

export function isSirenActive() {
  return isSirenPlaying;
}

export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContextClass();
  }
  return sharedCtx;
}

/**
 * Proactively unlocks the AudioContext on any user interaction (click/touch/keypress)
 * and warms up audio hardware using a 1-sample silent buffer.
 */
export function unlockAudioContext() {
  if (typeof window === 'undefined') return null;
  try {
    const ctx = getAudioContext();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    // Play a microscopic silent buffer to clear mobile/desktop browser autoplay blocks
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    return ctx;
  } catch {
    return null;
  }
}

// Global user-gesture unlock listener
if (typeof window !== 'undefined') {
  const handleUserGesture = () => {
    unlockAudioContext();
  };
  window.addEventListener('click', handleUserGesture, { capture: true, passive: true });
  window.addEventListener('pointerdown', handleUserGesture, { capture: true, passive: true });
  window.addEventListener('touchstart', handleUserGesture, { capture: true, passive: true });
  window.addEventListener('keydown', handleUserGesture, { capture: true, passive: true });
}

export function startContinuousHighRiseSiren() {
  if (isSirenPlaying) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Dynamics compressor to boost loudness and eliminate speaker distortion
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, ctx.currentTime);
    compressor.knee.setValueAtTime(30, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);
    compressor.connect(ctx.destination);

    // Master Gain (loud, high-penetration alarm volume: 0.75)
    activeGain = ctx.createGain();
    activeGain.gain.setValueAtTime(0.75, ctx.currentTime);
    activeGain.connect(compressor);

    // Primary piercing sawtooth oscillator
    activeOsc1 = ctx.createOscillator();
    activeOsc1.type = 'sawtooth';

    // Resonant harmonic triangle oscillator with slight pitch detune for acoustic siren beat
    activeOsc2 = ctx.createOscillator();
    activeOsc2.type = 'triangle';
    activeOsc2.detune.setValueAtTime(15, ctx.currentTime);

    activeOsc1.connect(activeGain);
    activeOsc2.connect(activeGain);

    const now = ctx.currentTime;
    activeOsc1.frequency.setValueAtTime(600, now);
    activeOsc2.frequency.setValueAtTime(600, now);

    activeOsc1.start(now);
    activeOsc2.start(now);
    isSirenPlaying = true;

    // Siren sweep cycle: rise 600 -> 1250 Hz in 0.65s, fall 1250 -> 600 Hz in 0.65s (1.3s cycle)
    const sweep = () => {
      if (!isSirenPlaying || !sharedCtx || sharedCtx.state === 'closed') return;
      const t = sharedCtx.currentTime;
      activeOsc1.frequency.cancelScheduledValues(t);
      activeOsc2.frequency.cancelScheduledValues(t);

      // High-rise up
      activeOsc1.frequency.setValueAtTime(600, t);
      activeOsc1.frequency.exponentialRampToValueAtTime(1250, t + 0.65);
      activeOsc2.frequency.setValueAtTime(600, t);
      activeOsc2.frequency.exponentialRampToValueAtTime(1250, t + 0.65);

      // High-rise down
      activeOsc1.frequency.exponentialRampToValueAtTime(600, t + 1.3);
      activeOsc2.frequency.exponentialRampToValueAtTime(600, t + 1.3);
    };

    sweep();
    activeInterval = setInterval(sweep, 1300);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aqi-siren-state-change', { detail: { active: true } }));
    }
  } catch (err) {
    console.warn('Failed to start high-rise siren:', err);
    isSirenPlaying = false;
  }
}

export function stopAlertSiren() {
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
  }

  if (activeGain && sharedCtx && sharedCtx.state !== 'closed') {
    try {
      activeGain.gain.setValueAtTime(activeGain.gain.value, sharedCtx.currentTime);
      activeGain.gain.linearRampToValueAtTime(0.001, sharedCtx.currentTime + 0.08);
    } catch {}
  }

  setTimeout(() => {
    if (activeOsc1) {
      try { activeOsc1.stop(); activeOsc1.disconnect(); } catch {}
      activeOsc1 = null;
    }
    if (activeOsc2) {
      try { activeOsc2.stop(); activeOsc2.disconnect(); } catch {}
      activeOsc2 = null;
    }
    // We intentionally keep sharedCtx alive and running so next siren can sound instantly!
    isSirenPlaying = false;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aqi-siren-state-change', { detail: { active: false } }));
    }
  }, 90);
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
