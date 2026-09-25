import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { haptics } from "../utils/haptics";
import { audio } from "../utils/audio";
import { Home, Receipt, Target, BarChart3, User, Plus, Wallet, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Home" },
  { id: "transactions", icon: Receipt, label: "Transactions" },
  { id: "budget", icon: Target, label: "Budget" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
  { id: "profile", icon: User, label: "Profile" },
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export default function AppLayout({ activeTab, onTabChange, children, onAddPress, user, avatar, userInitials, userLevel }) {
  const { theme } = useTheme();
  const isDesktop = useIsDesktop();

  const switchTab = (tabId) => {
    if (tabId === activeTab) return;
    haptics.tap();
    audio.tap();
    onTabChange(tabId);
  };

  // Desktop: sidebar layout
  if (isDesktop) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: theme.bg }}>
        <aside
          className="w-60 flex-shrink-0 flex flex-col"
          style={{
            backgroundColor: theme.bgSecondary,
            borderRight: `1px solid ${theme.border}`,
          }}
        >
          <div className="px-5 pt-7 pb-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme.accent + "15" }}
              >
                <Wallet size={18} style={{ color: theme.accent }} />
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: theme.text }}>
                SpendSmart
              </span>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
                  style={{
                    backgroundColor: isActive ? theme.accent + "10" : "transparent",
                    color: isActive ? theme.accent : theme.textMuted,
                  }}
                >
                  <div className="relative">
                    <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                    {isActive && (
                      <div
                        className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mx-5 my-2" style={{ borderTop: `1px solid ${theme.border}` }} />

          <div className="px-3 pb-4">
            <button
              onClick={() => switchTab("profile")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group"
              style={{
                backgroundColor: "transparent",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bgTertiary;
                e.currentTarget.style.borderColor = theme.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: theme.accent + "18", color: theme.accent }}
              >
                {avatar ? (
                  <img src={avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                ) : (
                  userInitials || "A"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: theme.text }}>
                  {user?.displayName && user.displayName !== "User"
                    ? user.displayName
                    : "Account"}
                </p>
                <p className="text-xs truncate" style={{ color: theme.textMuted }}>
                  {userLevel ? `${userLevel.icon} ${userLevel.name}` : "Local account"}
                </p>
              </div>
              <ChevronRight
                size={14}
                className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: theme.textMuted }}
              />
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Mobile: bottom nav layout
  return (
    <div
      className="min-h-screen max-w-md mx-auto relative theme-transition"
      style={{ backgroundColor: theme.bg }}
    >
      <main className="pb-28 px-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div
          className="mx-3 mb-2 rounded-2xl py-2 px-2 backdrop-blur-xl"
          style={{
            backgroundColor: theme.navBg,
            border: `1px solid ${theme.border}`,
            boxShadow: "0 -4px 30px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex justify-around items-center">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative"
                  style={{
                    backgroundColor: isActive ? theme.accent + "12" : "transparent",
                  }}
                >
                  <item.icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.5}
                    style={{ color: isActive ? theme.accent : theme.textMuted }}
                  />
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: isActive ? theme.accent : theme.textMuted }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* FAB — above bottom nav */}
      <button
        onClick={() => { haptics.medium(); audio.light(); onAddPress(); }}
        className="fixed right-4 w-12 h-12 rounded-2xl flex items-center justify-center z-50 shadow-lg press"
        style={{
          bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
          backgroundColor: theme.accent,
          boxShadow: `0 8px 24px ${theme.accent}30`,
        }}
      >
        <Plus size={22} style={{ color: theme.bg }} strokeWidth={2.5} />
      </button>
    </div>
  );
}
