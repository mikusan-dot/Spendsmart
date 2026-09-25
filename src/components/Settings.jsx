import { useState } from "react";
import SyncSetup from "./SyncSetup";
import ThemeEngine from "./ThemeEngine";
import { setSoundEnabled, isSoundEnabled } from "../utils/audio";
import { setHapticsEnabled, isHapticsEnabled } from "../utils/haptics";
import { useTheme } from "../context/ThemeContext";

function Toggle({ label, desc, enabled, onToggle }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{label}</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className="w-12 h-7 rounded-full p-0.5 transition-all flex-shrink-0"
        style={{
          backgroundColor: enabled ? theme.accent : "var(--border)",
          border: `1px solid ${enabled ? theme.accent : "var(--border)"}`,
        }}
      >
        <div
          className="w-[22px] h-[22px] rounded-full shadow-md transition-transform duration-200"
          style={{
            backgroundColor: "white",
            transform: enabled ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </button>
    </div>
  );
}

export default function Settings({ user, onSync }) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [hapticsOn, setHapticsOn] = useState(isHapticsEnabled());

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>⚙️ Settings</h2>

      {/* Theme Engine */}
      <ThemeEngine />

      {/* Sound & Haptics */}
      <div className="glass rounded-2xl p-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🔊</span>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Sound & Haptics</h3>
        </div>
        <Toggle
          label="Sound Effects"
          desc="Play sounds on actions"
          enabled={soundOn}
          onToggle={() => { setSoundEnabled(!soundOn); setSoundOn(!soundOn); }}
        />
        <div className="border-b my-1" style={{ borderColor: "var(--border)" }} />
        <Toggle
          label="Haptic Feedback"
          desc="Vibration on interactions"
          enabled={hapticsOn}
          onToggle={() => { setHapticsEnabled(!hapticsOn); setHapticsOn(!hapticsOn); }}
        />
      </div>

      {/* Sync Section */}
      <SyncSetup currentUID={user.uid} onSync={onSync} />

      {/* App Info */}
      <div className="glass rounded-2xl p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">ℹ️</span>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>About</h3>
        </div>
        {[
          { label: "App Name", value: "SpendSmart" },
          { label: "Version", value: "2.0.0" },
          { label: "Database", value: "Firebase Firestore" },
          { label: "Sync", value: "Real-time ☁️" },
        ].map(item => (
          <div key={item.label} className="flex justify-between items-center py-1 border-b"
            style={{ borderColor: "var(--border)" }}>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</span>
            <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Reset */}
      <div className="glass rounded-2xl p-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">⚠️</span>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Danger Zone</h3>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset your sync code?")) {
              localStorage.removeItem("spendsmart_uid");
              window.location.reload();
            }
          }}
          className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm py-2.5 rounded-xl transition press"
        >
          🔄 Reset Sync Code
        </button>
      </div>
    </div>
  );
}