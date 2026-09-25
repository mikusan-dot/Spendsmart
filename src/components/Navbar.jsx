import { useTheme } from "../context/ThemeContext";
import CurrencySelector from "./CurrencySelector";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Navbar({ activeTab }) {
  const { theme } = useTheme();
  const isHome = activeTab === "home";

  const tabTitles = {
    home: null,
    transactions: "Transactions",
    budget: "Budget",
    analytics: "Analytics",
    profile: "Profile",
  };

  return (
    <nav className="sticky top-0 z-40 pt-3 pb-3 md:hidden" style={{ backgroundColor: theme.bg }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {isHome ? (
            <div>
              <p className="text-xs" style={{ color: theme.textMuted }}>{getGreeting()}</p>
              <h1 className="text-lg font-bold" style={{ color: theme.text }}>SpendSmart</h1>
            </div>
          ) : (
            <h1 className="text-lg font-bold" style={{ color: theme.text }}>
              {tabTitles[activeTab] || "SpendSmart"}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CurrencySelector />
        </div>
      </div>
    </nav>
  );
}
