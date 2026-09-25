import { useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ACHIEVEMENTS, LEVELS } from "../utils/gamification";

export default function Gamification({ user, gameData, level, progress, updateStats }) {
  useEffect(() => {
    const syncStats = async () => {
      try {
        const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
        const snap = await getDocs(q);
        const expenses = snap.docs.map(d => d.data());
        const categories = new Set(expenses.map(e => e.category));
        await updateStats({
          totalExpenses: expenses.length,
          categoriesUsed: categories.size,
        });
      } catch (err) {
        console.error(err);
      }
    };
    if (gameData) syncStats();
  }, [user.uid, gameData, updateStats]);

  if (!gameData || !level) return (
    <div className="space-y-4 pt-2">
      {[1,2,3].map(i => <div key={i} className="skeleton rounded-2xl h-24 w-full" />)}
    </div>
  );

  const xp = gameData.xp || 0;
  const streak = gameData.streak || 0;
  const achievements = gameData.achievements || [];
  const nextLevel = LEVELS.find(l => l.level === level.level + 1);

  return (
    <div className="space-y-4 fade-in">
      <h2 className="text-xl font-bold">🎮 Progress</h2>

      {/* Level Card */}
      <div
        className="relative overflow-hidden rounded-3xl p-5"
        style={{
          background: "linear-gradient(135deg, #2a3a22 0%, #3d4a35 50%, #5a6b4f 100%)",
          boxShadow: "0 20px 60px rgba(156,175,136,0.4)"
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[#b5c99a] text-xs mb-1">Current Level</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl">{level.icon}</span>
              <div>
                <h3 className="text-white text-xl font-bold">{level.name}</h3>
                <p className="text-[#b5c99a] text-xs">Level {level.level}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#b5c99a] text-xs">Total XP</p>
            <p className="text-white text-2xl font-bold">{xp.toLocaleString()}</p>
            <p className="text-[#b5c99a] text-xs">points</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-[#b5c99a] mb-1">
            <span>{xp} XP</span>
            <span>{nextLevel ? `${nextLevel.minXP} XP for ${nextLevel.icon} ${nextLevel.name}` : "MAX LEVEL! 🎉"}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-700 relative overflow-hidden"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #9CAF88, #7A9470)"
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>
          <p className="text-[#b5c99a] text-xs mt-1 text-right">{progress}% to next level</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-3 text-center">
          <p className="text-2xl mb-1">🔥</p>
          <p className="text-white font-bold text-xl">{streak}</p>
          <p className="text-gray-400 text-xs">Day Streak</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <p className="text-2xl mb-1">🏆</p>
          <p className="text-white font-bold text-xl">{achievements.length}</p>
          <p className="text-gray-400 text-xs">Badges</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <p className="text-2xl mb-1">📝</p>
          <p className="text-white font-bold text-xl">{gameData.stats?.totalExpenses || 0}</p>
          <p className="text-gray-400 text-xs">Tracked</p>
        </div>
      </div>

      {/* All Levels */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">🗺️ Level Roadmap</h3>
        <div className="space-y-2">
          {LEVELS.map((l) => {
            const isCurrentLevel = l.level === level.level;
            const isUnlocked = xp >= l.minXP;
            return (
              <div
                key={l.level}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isCurrentLevel ? "bg-[#4a5d3e]/20 border border-[#6b7f5a]/30" :
                  isUnlocked ? "bg-white/5" : "opacity-40"
                }`}
              >
                <span className="text-2xl">{l.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isCurrentLevel ? "text-[#b5c99a]" : "text-white"}`}>
                      {l.name}
                    </p>
                    {isCurrentLevel && (
                      <span className="text-xs bg-[#4a5d3e] text-white px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{l.minXP} - {l.maxXP === 999999 ? "∞" : l.maxXP} XP</p>
                </div>
                {isUnlocked ? (
                  <span className="text-[#a3b899] text-lg">✅</span>
                ) : (
                  <span className="text-gray-600 text-lg">🔒</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">
          🏅 Achievements ({achievements.length}/{ACHIEVEMENTS.length})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-xl border transition-all ${
                  unlocked
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-white/5 border-white/5 opacity-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xl ${!unlocked ? "grayscale" : ""}`}>
                    {achievement.icon}
                  </span>
                  {unlocked && <span className="text-yellow-400 text-xs">+{achievement.xp}xp</span>}
                </div>
                <p className={`text-xs font-semibold ${unlocked ? "text-white" : "text-gray-500"}`}>
                  {achievement.name}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{achievement.description}</p>
                {!unlocked && <p className="text-xs text-gray-700 mt-1">🔒 Locked</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* How to earn XP */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">⚡ Earn XP By</h3>
        <div className="space-y-2">
          {[
            { action: "Adding an expense", xp: 10, icon: "➕" },
            { action: "Daily login", xp: 15, icon: "📅" },
            { action: "Using AI Insights", xp: 15, icon: "🤖" },
            { action: "Exporting PDF", xp: 20, icon: "📄" },
            { action: "Staying under budget", xp: 50, icon: "🎯" },
            { action: "Streak bonus", xp: 25, icon: "🔥" },
          ].map(item => (
            <div key={item.action} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span className="text-xs text-gray-300">{item.action}</span>
              </div>
              <span className="text-xs font-bold text-[#a3b899]">+{item.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}