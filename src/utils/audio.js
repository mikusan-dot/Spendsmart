let ctx = null;
let soundEnabled = localStorage.getItem("ss_sound_enabled") !== "false";

export function setSoundEnabled(v) {
  soundEnabled = v;
  localStorage.setItem("ss_sound_enabled", v);
}

export function isSoundEnabled() {
  return soundEnabled;
}

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function play(freq, duration, type = "sine", volume = 0.15) {
  if (!soundEnabled) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export const audio = {
  tap: () => play(800, 0.05, "square", 0.06),

  light: () => play(600, 0.08, "sine", 0.08),

  success: () => {
    play(523, 0.12, "sine", 0.1);
    setTimeout(() => play(659, 0.12, "sine", 0.1), 80);
    setTimeout(() => play(784, 0.2, "sine", 0.1), 160);
  },

  achievement: () => {
    play(523, 0.1, "sine", 0.12);
    setTimeout(() => play(659, 0.1, "sine", 0.12), 100);
    setTimeout(() => play(784, 0.1, "sine", 0.12), 200);
    setTimeout(() => play(1047, 0.3, "sine", 0.12), 300);
  },

  error: () => {
    play(200, 0.15, "sawtooth", 0.08);
    setTimeout(() => play(150, 0.2, "sawtooth", 0.08), 150);
  },
};
