import { useTheme, themes } from "../context/ThemeContext";

export default function ThemeEngine() {
  const { theme, themeName, setThemeName } = useTheme();

  const handleThemeChange = (name) => {
    setThemeName(name);
  };

  return (
    <div className="space-y-4 fade-in">
      <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
        🎨 Theme Engine
      </h2>

      {/* Current Theme Banner */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{ background: theme.heroGradient, boxShadow: `0 20px 60px ${theme.cardGlow}` }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <p className="text-white/70 text-xs mb-1">Current Theme</p>
        <h3 className="text-white text-2xl font-bold">{theme.icon} {theme.name}</h3>
        <p className="text-white/60 text-xs mt-1">Tap any theme below to switch instantly</p>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(themes).map(([key, t]) => (
          <button
            key={key}
            onClick={() => handleThemeChange(key)}
            className={`relative rounded-2xl p-4 text-left transition-all press overflow-hidden`}
            style={{
              background: t.heroGradient,
              boxShadow: themeName === key ? `0 0 20px ${t.cardGlow}` : "none",
              border: themeName === key ? `2px solid ${t.accent}` : "2px solid transparent"
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <p className="text-2xl mb-1">{t.icon}</p>
            <p className="text-white font-semibold text-sm">{t.name}</p>
            <div className="flex gap-1 mt-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accentSecondary }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.bgSecondary }} />
            </div>
            {themeName === key && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Color Info */}
      <div
        className="glass rounded-2xl p-4 space-y-3"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          🎨 Current Colors
        </h3>
        {[
          { label: "Background", color: theme.bg },
          { label: "Accent", color: theme.accent },
          { label: "Secondary", color: theme.accentSecondary },
          { label: "Card", color: theme.bgSecondary },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                {item.color}
              </span>
              <div
                className="w-6 h-6 rounded-lg border border-white/10"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Theme Tips */}
      <div
        className="glass rounded-2xl p-4"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
          💡 Theme Tips
        </h3>
        {[
          { icon: "🌿", tip: "Sage green is easy on the eyes and calming" },
          { icon: "⬛", tip: "AMOLED saves battery on OLED screens" },
          { icon: "⚡", tip: "Neon mode looks amazing in dark rooms" },
          { icon: "🌅", tip: "Sunset is great for evening use" },
        ].map((item) => (
          <div key={item.icon} className="flex items-center gap-3 py-1.5">
            <span>{item.icon}</span>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}