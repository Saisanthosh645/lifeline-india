/**
 * Web Audio API synthesizer for realistic emergency alerts and notifications.
 * Self-contained, standard JS, safe for browser-use.
 */

let audioCtx: AudioContext | null = null;
let sirenInterval: any = null;
let currentOscillators: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode }[] = [];

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // Standard and prefixed AudioContext support
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

export function playEmergencySiren() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  // Prevent duplicate sirens
  if (sirenInterval) return;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  // Dual tone siren setting
  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.setValueAtTime(440, ctx.currentTime); // Low freq
  osc2.frequency.setValueAtTime(460, ctx.currentTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1); // Safe low volume

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start();
  osc2.start();

  currentOscillators.push({ osc1, osc2, gain: gainNode });

  // Modulate frequency up and down like a real siren
  let high = false;
  sirenInterval = setInterval(() => {
    const time = ctx.currentTime;
    if (high) {
      osc1.frequency.exponentialRampToValueAtTime(440, time + 0.4);
      osc2.frequency.exponentialRampToValueAtTime(460, time + 0.4);
    } else {
      osc1.frequency.exponentialRampToValueAtTime(780, time + 0.4);
      osc2.frequency.exponentialRampToValueAtTime(800, time + 0.4);
    }
    high = !high;
  }, 500);
}

export function stopEmergencySiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }

  currentOscillators.forEach(({ osc1, osc2, gain }) => {
    try {
      osc1.stop();
      osc2.stop();
      gain.disconnect();
    } catch (e) {
      // Safe guard
    }
  });
  currentOscillators = [];
}

export function playSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
  osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
  osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
  osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.36); // C6

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.8);
}

export function playDigitalBeep() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime); // High standard beep

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}
