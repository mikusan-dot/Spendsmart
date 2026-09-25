import { useState, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { CURRENCIES } from "../utils/currencies";
import { haptics } from "../utils/haptics";
import { useTheme } from "../context/ThemeContext";
import { Search, X, ChevronDown } from "lucide-react";

export default function CurrencySelector() {
  const { currency, setCurrencyCode } = useCurrency();
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e) => { if (e.key === "Escape") { setShowPicker(false); setSearch(""); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showPicker]);

  const filtered = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.includes(search)
  );

  const handleSelect = (code) => {
    haptics.success();
    setCurrencyCode(code);
    setShowPicker(false);
    setSearch("");
  };

  return (
    <>
      <button
        onClick={() => { haptics.light(); setShowPicker(true); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl press transition"
        style={{
          backgroundColor: theme.accent + "15",
          border: `1px solid ${theme.accent}30`,
        }}
      >
        <span className="text-sm">{currency.flag}</span>
        <span className="text-xs font-bold" style={{ color: theme.accent }}>{currency.code}</span>
        <ChevronDown size={10} style={{ color: theme.textMuted }} />
      </button>

      {showPicker && (
        <div className="fixed inset-0 z-[200] flex flex-col" style={{ backgroundColor: theme.bg }}>
          <div className="px-4 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.border}` }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: theme.text }}>Select Currency</h2>
              <p className="text-xs" style={{ color: theme.textMuted }}>{CURRENCIES.length} currencies available</p>
            </div>
            <button
              onClick={() => { haptics.light(); setShowPicker(false); setSearch(""); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center press"
              style={{ backgroundColor: theme.bgSecondary, color: theme.textMuted }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-4 py-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
              <input
                autoFocus
                className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
                placeholder="Search currency or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="px-4 pb-2">
            <p className="text-xs mb-2" style={{ color: theme.textMuted }}>Currently selected</p>
            <div
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ backgroundColor: theme.accent + "15", border: `1px solid ${theme.accent}30` }}
            >
              <span className="text-2xl">{currency.flag}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: theme.text }}>{currency.name}</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>{currency.code} · {currency.symbol}</p>
              </div>
              <span style={{ color: theme.accent }}>✓</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8">
            <p className="text-xs mb-2" style={{ color: theme.textMuted }}>All currencies ({filtered.length})</p>
            <div className="space-y-1.5">
              {filtered.map((c) => {
                const isSelected = c.code === currency.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => handleSelect(c.code)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl press transition-all"
                    style={{
                      backgroundColor: isSelected ? theme.accent + "15" : "transparent",
                      border: `1px solid ${isSelected ? theme.accent + "30" : "transparent"}`,
                    }}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm" style={{ color: theme.text }}>{c.name}</p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>{c.code}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums" style={{ color: isSelected ? theme.accent : theme.textMuted }}>
                      {c.symbol}
                    </span>
                    {isSelected && <span style={{ color: theme.accent }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
