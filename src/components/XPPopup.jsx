import { useRef, useEffect } from "react";
import { audio } from "../utils/audio";
import { useTheme } from "../context/ThemeContext";
import { Zap, Trophy } from "lucide-react";

export default function XPPopup({ xpPopup, newAchievements, onAchievement }) {
  const firedAchievement = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (xpPopup) audio.success();
  }, [xpPopup]);

  useEffect(() => {
    if (newAchievements.length > 0 && firedAchievement.current !== newAchievements) {
      firedAchievement.current = newAchievements;
      audio.achievement();
      onAchievement?.();
    }
  }, [newAchievements, onAchievement]);

  return (
    <>
      {xpPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl shadow-2xl fade-in"
            style={{ backgroundColor: theme.accent, color: theme.bg, boxShadow: `0 8px 32px ${theme.accent}40` }}
          >
            <Zap size={14} />
            <span className="font-bold text-sm">+{xpPopup.amount} XP</span>
            {xpPopup.reason && <span className="text-xs opacity-80">{xpPopup.reason}</span>}
          </div>
        </div>
      )}

      {newAchievements.slice(0, 3).map((achievement, i) => (
        <div
          key={achievement.id}
          className="fixed z-[100] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ top: `${80 + i * 72}px` }}
        >
          <div
            className="px-4 py-3 rounded-2xl shadow-2xl slide-up flex items-center gap-3"
            style={{ backgroundColor: theme.accent, color: theme.bg, boxShadow: `0 8px 32px ${theme.accent}40`, minWidth: "220px" }}
          >
            <Trophy size={20} />
            <div>
              <p className="text-xs font-bold opacity-80">Achievement Unlocked!</p>
              <p className="font-bold text-sm">{achievement.name}</p>
              <p className="text-xs opacity-70">+{achievement.xp} XP</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
