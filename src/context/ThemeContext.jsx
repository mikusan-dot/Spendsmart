import { createContext, useContext, useState, useEffect } from "react";

const themes = {
  dark: {
    name: "Spend",
    icon: "S",
    bg: "#061522",
    bgSecondary: "#0A1F33",
    bgTertiary: "#0F2A40",
    accent: "#67E8A5",
    accentSecondary: "#8B7CFF",
    text: "#F3F4F6",
    textMuted: "#8FA9B8",
    border: "rgba(255,255,255,0.06)",
    glass: "rgba(255,255,255,0.03)",
    cardGlow: "rgba(103,232,165,0.08)",
    navBg: "rgba(6,21,34,0.95)",
    income: "#34D399",
    expense: "#D9DEE3",
    expenseMuted: "#D98F8F",
    warning: "#EAB308",
    danger: "#EF6A6A",
    surface: "#0A1F33",
    surface2: "#0F2A40",
    heroGradient: "linear-gradient(160deg, #061522 0%, #0A1F33 40%, #0F2A40 100%)",
    blob1: "rgba(103,232,165,0.04)",
    blob2: "rgba(139,124,255,0.03)",
    blob3: "rgba(103,232,165,0.01)",
  },
  amoled: {
    name: "AMOLED",
    icon: "B",
    bg: "#000000",
    bgSecondary: "#0a0a0a",
    bgTertiary: "#111111",
    accent: "#67E8A5",
    accentSecondary: "#8B7CFF",
    text: "#F3F4F6",
    textMuted: "#8FA9B8",
    border: "rgba(255,255,255,0.06)",
    glass: "rgba(255,255,255,0.02)",
    cardGlow: "rgba(103,232,165,0.06)",
    navBg: "rgba(0,0,0,0.98)",
    income: "#34D399",
    expense: "#D9DEE3",
    expenseMuted: "#D98F8F",
    warning: "#EAB308",
    danger: "#EF6A6A",
    surface: "#0a0a0a",
    surface2: "#111111",
    heroGradient: "linear-gradient(160deg, #0a0a0a 0%, #111111 40%, #1a1a1a 100%)",
    blob1: "rgba(103,232,165,0.03)",
    blob2: "rgba(139,124,255,0.02)",
    blob3: "rgba(103,232,165,0.01)",
  },
  neon: {
    name: "Neon",
    icon: "N",
    bg: "#020010",
    bgSecondary: "#080820",
    bgTertiary: "#0f0f30",
    accent: "#00f5ff",
    accentSecondary: "#8B7CFF",
    text: "#F3F4F6",
    textMuted: "#8FA9B8",
    border: "rgba(0,245,255,0.1)",
    glass: "rgba(0,245,255,0.03)",
    cardGlow: "rgba(0,245,255,0.12)",
    navBg: "rgba(2,0,16,0.95)",
    income: "#34D399",
    expense: "#D9DEE3",
    expenseMuted: "#D98F8F",
    warning: "#EAB308",
    danger: "#EF6A6A",
    surface: "#080820",
    surface2: "#0f0f30",
    heroGradient: "linear-gradient(160deg, #080820 0%, #0f0f30 40%, #1a1a40 100%)",
    blob1: "rgba(0,245,255,0.06)",
    blob2: "rgba(139,124,255,0.04)",
    blob3: "rgba(0,255,128,0.02)",
  },
  sunset: {
    name: "Sunset",
    icon: "S",
    bg: "#0f0508",
    bgSecondary: "#1a0a10",
    bgTertiary: "#2a1020",
    accent: "#f97316",
    accentSecondary: "#ec4899",
    text: "#F3F4F6",
    textMuted: "#8FA9B8",
    border: "rgba(249,115,22,0.1)",
    glass: "rgba(249,115,22,0.03)",
    cardGlow: "rgba(249,115,22,0.12)",
    navBg: "rgba(15,5,8,0.95)",
    income: "#34D399",
    expense: "#D9DEE3",
    expenseMuted: "#D98F8F",
    warning: "#EAB308",
    danger: "#EF6A6A",
    surface: "#1a0a10",
    surface2: "#2a1020",
    heroGradient: "linear-gradient(160deg, #1a0a10 0%, #2a1020 40%, #3a1530 100%)",
    blob1: "rgba(249,115,22,0.06)",
    blob2: "rgba(236,72,153,0.04)",
    blob3: "rgba(239,68,68,0.02)",
  },
  ocean: {
    name: "Ocean",
    icon: "O",
    bg: "#020f1a",
    bgSecondary: "#051525",
    bgTertiary: "#0a2035",
    accent: "#06b6d4",
    accentSecondary: "#8B7CFF",
    text: "#F3F4F6",
    textMuted: "#8FA9B8",
    border: "rgba(6,182,212,0.1)",
    glass: "rgba(6,182,212,0.03)",
    cardGlow: "rgba(6,182,212,0.12)",
    navBg: "rgba(2,15,26,0.95)",
    income: "#34D399",
    expense: "#D9DEE3",
    expenseMuted: "#D98F8F",
    warning: "#EAB308",
    danger: "#EF6A6A",
    surface: "#051525",
    surface2: "#0a2035",
    heroGradient: "linear-gradient(160deg, #051525 0%, #0a2035 40%, #102a45 100%)",
    blob1: "rgba(6,182,212,0.06)",
    blob2: "rgba(2,132,199,0.04)",
    blob3: "rgba(16,185,129,0.02)",
  },
  forest: {
    name: "Forest",
    icon: "F",
    bg: "#020f05",
    bgSecondary: "#051508",
    bgTertiary: "#0a2010",
    accent: "#10b981",
    accentSecondary: "#059669",
    text: "#F3F4F6",
    textMuted: "#8FA9B8",
    border: "rgba(16,185,129,0.1)",
    glass: "rgba(16,185,129,0.03)",
    cardGlow: "rgba(16,185,129,0.12)",
    navBg: "rgba(2,15,5,0.95)",
    income: "#34D399",
    expense: "#D9DEE3",
    expenseMuted: "#D98F8F",
    warning: "#EAB308",
    danger: "#EF6A6A",
    surface: "#051508",
    surface2: "#0a2010",
    heroGradient: "linear-gradient(160deg, #051508 0%, #0a2010 40%, #103018 100%)",
    blob1: "rgba(16,185,129,0.06)",
    blob2: "rgba(5,150,105,0.04)",
    blob3: "rgba(52,211,153,0.02)",
  },
  citrus: {
    name: "Citrus",
    icon: "C",
    bg: "#FFFFFF",
    bgSecondary: "#FFF5E6",
    bgTertiary: "#FFE8CC",
    accent: "#FFA500",
    accentSecondary: "#FF8C00",
    text: "#1A1A1A",
    textMuted: "#8B6914",
    border: "rgba(255,165,0,0.15)",
    glass: "rgba(255,165,0,0.05)",
    cardGlow: "rgba(255,165,0,0.12)",
    navBg: "rgba(255,255,255,0.98)",
    income: "#228B22",
    expense: "#D9DEE3",
    expenseMuted: "#D98F8F",
    warning: "#FFA500",
    danger: "#EF6A6A",
    surface: "#FFF5E6",
    surface2: "#FFE8CC",
    heroGradient: "linear-gradient(160deg, #FFF5E6 0%, #FFE8CC 40%, #FFD6A5 100%)",
    blob1: "rgba(255,165,0,0.08)",
    blob2: "rgba(255,140,0,0.06)",
    blob3: "rgba(255,165,0,0.04)",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() =>
    localStorage.getItem("spendsmart_theme") || "dark"
  );

  const theme = themes[themeName] || themes.dark;

  useEffect(() => {
    localStorage.setItem("spendsmart_theme", themeName);
    const root = document.documentElement;
    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--bg-secondary", theme.bgSecondary);
    root.style.setProperty("--bg-tertiary", theme.bgTertiary);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-secondary", theme.accentSecondary);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--text-muted", theme.textMuted);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--glass", theme.glass);
    root.style.setProperty("--card-glow", theme.cardGlow);
    root.style.setProperty("--nav-bg", theme.navBg);
    root.style.setProperty("--income", theme.income || "#34D399");
    root.style.setProperty("--expense", theme.expense || "#D9DEE3");
    root.style.setProperty("--expense-muted", theme.expenseMuted || "#D98F8F");
    root.style.setProperty("--warning", theme.warning || "#EAB308");
    root.style.setProperty("--danger", theme.danger || "#EF6A6A");
    root.style.setProperty("--surface", theme.surface || theme.bgSecondary);
    root.style.setProperty("--surface-2", theme.surface2 || theme.bgTertiary);
    document.body.style.backgroundColor = theme.bg;
  }, [themeName, theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { themes };
