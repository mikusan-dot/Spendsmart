import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  getLevelFromXP,
  getProgressToNextLevel,
  checkAchievements,
} from "../utils/gamification";

export default function useGamification(userId) {
  const [gameData, setGameData] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [xpPopup, setXpPopup] = useState(null);

  const loadGameData = useCallback(async () => {
    try {
      const ref = doc(db, "gamification", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setGameData(snap.data());
      } else {
        const initial = {
          xp: 0,
          lastActiveDate: new Date().toDateString(),
          achievements: [],
          stats: {
            totalExpenses: 0,
            categoriesUsed: 0,
            budgetsSet: 0,
            pdfExports: 0,
            aiUsed: 0,
            underBudgetMonths: 0,
            streak: 1,
          },
        };
        await setDoc(ref, initial);
        setGameData(initial);
      }
    } catch (err) {
      console.error("Gamification load error:", err);
      setGameData({
        xp: 0,
        lastActiveDate: new Date().toDateString(),
        achievements: [],
        stats: {
          totalExpenses: 0,
          categoriesUsed: 0,
          budgetsSet: 0,
          pdfExports: 0,
          aiUsed: 0,
          underBudgetMonths: 0,
          streak: 1,
        },
      });
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    loadGameData();
  }, [userId, loadGameData]);

  const addXP = async (amount, reason = "") => {
    if (!userId || !gameData) return;
    try {
      const newXP = (gameData.xp || 0) + amount;
      const updated = { ...gameData, xp: newXP };
      setGameData(updated);
      await updateDoc(doc(db, "gamification", userId), { xp: newXP });
      setXpPopup({ amount, reason });
      setTimeout(() => setXpPopup(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStats = async (newStats) => {
    if (!userId || !gameData) return;
    try {
      const updated = {
        ...gameData,
        stats: { ...gameData.stats, ...newStats },
      };

      // Check streak
      const today = new Date().toDateString();
      const lastDate = gameData.lastActiveDate;
      let newStreak = gameData.streak || 0;

      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
        updated.lastActiveDate = today;
        updated.stats = { ...updated.stats, streak: newStreak };
      }

      // Check new achievements
      const allStats = updated.stats;
      const newlyUnlocked = checkAchievements(
        allStats,
        gameData.achievements || []
      );

      if (newlyUnlocked.length > 0) {
        const newAchievementIds = newlyUnlocked.map((a) => a.id);
        updated.achievements = [
          ...(gameData.achievements || []),
          ...newAchievementIds,
        ];
        setNewAchievements(newlyUnlocked);
        setTimeout(() => setNewAchievements([]), 4000);

        const bonusXP = newlyUnlocked.reduce((s, a) => s + a.xp, 0);
        updated.xp = (updated.xp || 0) + bonusXP;
      }

      setGameData(updated);
      const { xp, stats, lastActiveDate, achievements } = updated;
      await updateDoc(doc(db, "gamification", userId), { xp, stats, lastActiveDate, achievements });
    } catch (err) {
      console.error(err);
    }
  };

  const level = gameData ? getLevelFromXP(gameData.xp || 0) : null;
  const progress = gameData ? getProgressToNextLevel(gameData.xp || 0) : 0;

  return {
    gameData,
    level,
    progress,
    addXP,
    updateStats,
    newAchievements,
    xpPopup,
    reload: loadGameData,
  };
}