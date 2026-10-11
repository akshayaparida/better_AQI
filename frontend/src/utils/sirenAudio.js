/**
 * High-Rise Emergency Air Quality Siren Audio Synthesizer (Web Audio API)
 *
 * Implements a continuous rising-falling emergency acoustic alarm sweep (550 Hz to 1150 Hz)
 * with dual-oscillator harmonics, running uninterrupted until the user silences it.
 */

let activeCtx = null;
let activeInterval = null;
let activeOsc1 = null;
let activeOsc2 = null;
let activeGain = null;
let isSirenPlaying = false;

export function isSirenActive() {
  return isSirenPlaying;
}

export function startContinuousHighRiseSiren() {
  if (isSirenPlaying) return;

  try {
    const AudioContextClass = typeof window !== 'undefined'
      ? (window.AudioContext || window.webkitAudioContext)
      : null;
    if (!AudioContextClass) return;

    activeCtx = new AudioContextClass();
    if (activeCtx.state === 'suspended') {
      activeCtx.resume();
    }

    activeGain = activeCtx.createGain();
    activeGain.gain.setValueAtTime(0.28, activeCtx.currentTime);
    activeGain.connect(activeCtx.destination);

    // Primary piercing oscillator
    activeOsc1 = activeCtx.createOscillator();
    activeOsc1.type = 'sawtooth';

    // Resonant harmonic oscillator
    activeOsc2 = activeCtx.createOscillator();
    activeOsc2.type = 'triangle';
    activeOsc2.detune.setValueAtTime(10, activeCtx.currentTime);

    activeOsc1.connect(activeGain);
    activeOsc2.connect(activeGain);

    const now = activeCtx.currentTime;
    activeOsc1.frequency.setValueAtTime(550, now);
    activeOsc2.frequency.setValueAtTime(550, now);

    activeOsc1.start(now);
    activeOsc2.start(now);
    isSirenPlaying = true;

    // Siren sweep cycle: rise 550 -> 1150 in 0.7s, fall 1150 -> 550 in 0.7s
    const sweep = () => {
      if (!isSirenPlaying || !activeCtx || activeCtx.state === 'closed') return;
      const t = activeCtx.currentTime;
      activeOsc1.frequency.cancelScheduledValues(t);
      activeOsc2.frequency.cancelScheduledValues(t);

      // High-rise up
      activeOsc1.frequency.setValueAtTime(550, t);
      activeOsc1.frequency.exponentialRampToValueAtTime(1150, t + 0.7);
      activeOsc2.frequency.setValueAtTime(550, t);
      activeOsc2.frequency.exponentialRampToValueAtTime(1150, t + 0.7);

      // Down
      activeOsc1.frequency.exponentialRampToValueAtTime(550, t + 1.4);
      activeOsc2.frequency.exponentialRampToValueAtTime(550, t + 1.4);
    };

    sweep();
    activeInterval = setInterval(sweep, 1400);

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

  if (activeGain && activeCtx) {
    try {
      activeGain.gain.setValueAtTime(activeGain.gain.value, activeCtx.currentTime);
      activeGain.gain.linearRampToValueAtTime(0.001, activeCtx.currentTime + 0.1);
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
    if (activeCtx) {
      try { activeCtx.close(); } catch {}
      activeCtx = null;
    }
    isSirenPlaying = false;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aqi-siren-state-change', { detail: { active: false } }));
    }
  }, 120);
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
