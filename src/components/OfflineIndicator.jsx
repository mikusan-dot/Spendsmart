import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Wifi, WifiOff } from "lucide-react";

export default function OfflineIndicator() {
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner && isOnline) return null;

  const color = isOnline ? theme.income : theme.danger;

  return (
    <div className="fixed top-0 left-0 right-0 z-[300] flex justify-center px-4 pointer-events-none" style={{ paddingTop: "calc(8px + var(--safe-top, 0px))" }}>
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium shadow-xl slide-up"
        style={{
          backgroundColor: color,
          color: theme.bg,
          boxShadow: `0 4px 20px ${color}40`,
        }}
      >
        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        <span>{isOnline ? "Back online! Syncing..." : "Offline — data saved locally"}</span>
      </div>
    </div>
  );
}
