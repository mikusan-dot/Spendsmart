let hapticsEnabled = localStorage.getItem("ss_haptics_enabled") !== "false";

export function setHapticsEnabled(v) {
  hapticsEnabled = v;
  localStorage.setItem("ss_haptics_enabled", v);
}

export function isHapticsEnabled() {
  return hapticsEnabled;
}

const vibrate = (pattern) => {
  if (!hapticsEnabled) return;
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    // Vibration not supported
  }
};

export const haptics = {
  light: () => vibrate(10),
  medium: () => vibrate(25),
  heavy: () => vibrate([30, 10, 30]),
  success: () => vibrate([10, 50, 10]),
  error: () => vibrate([50, 30, 50, 30, 50]),
  tap: () => vibrate(5),
};
