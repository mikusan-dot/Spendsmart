import { CATEGORIES } from "./categories";

// XP values for actions
export const XP_VALUES = {
  ADD_EXPENSE: 10,
  DAILY_LOGIN: 15,
  UNDER_BUDGET: 50,
  EXPORT_PDF: 20,
  CHECK_AI: 15,
  STREAK_BONUS: 25,
  FIRST_EXPENSE: 100,
  FIVE_EXPENSES: 50,
  TEN_EXPENSES: 75,
};

// Levels
export const LEVELS = [
  { level: 1, name: "Penny Saver", minXP: 0, maxXP: 100, icon: "🌱" },
  { level: 2, name: "Budget Rookie", minXP: 100, maxXP: 250, icon: "💰" },
  { level: 3, name: "Smart Spender", minXP: 250, maxXP: 500, icon: "📊" },
  { level: 4, name: "Finance Pro", minXP: 500, maxXP: 1000, icon: "🏆" },
  { level: 5, name: "Money Master", minXP: 1000, maxXP: 2000, icon: "👑" },
  { level: 6, name: "Wealth Wizard", minXP: 2000, maxXP: 4000, icon: "🧙" },
  { level: 7, name: "Financial Legend", minXP: 4000, maxXP: 999999, icon: "⭐" },
];

export function getLevelFromXP(xp) {
  return LEVELS.slice().reverse().find(l => xp >= l.minXP) || LEVELS[0];
}

export function getProgressToNextLevel(xp) {
  const current = getLevelFromXP(xp);
  const next = LEVELS.find(l => l.level === current.level + 1);
  if (!next) return 100;
  const progress = ((xp - current.minXP) / (next.minXP - current.minXP)) * 100;
  return Math.min(Math.round(progress), 100);
}

// Achievements
export const ACHIEVEMENTS = [
  {
    id: "first_expense",
    name: "First Step",
    description: "Add your first expense",
    icon: "👣",
    xp: 100,
    condition: (stats) => stats.totalExpenses >= 1,
  },
  {
    id: "five_expenses",
    name: "Getting Started",
    description: "Add 5 expenses",
    icon: "✋",
    xp: 50,
    condition: (stats) => stats.totalExpenses >= 5,
  },
  {
    id: "ten_expenses",
    name: "Tracking Pro",
    description: "Add 10 expenses",
    icon: "🔟",
    xp: 75,
    condition: (stats) => stats.totalExpenses >= 10,
  },
  {
    id: "fifty_expenses",
    name: "Data Nerd",
    description: "Add 50 expenses",
    icon: "🤓",
    xp: 150,
    condition: (stats) => stats.totalExpenses >= 50,
  },
  {
    id: "streak_3",
    name: "3 Day Streak",
    description: "Track expenses 3 days in a row",
    icon: "🔥",
    xp: 75,
    condition: (stats) => stats.streak >= 3,
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Track expenses 7 days in a row",
    icon: "⚡",
    xp: 150,
    condition: (stats) => stats.streak >= 7,
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    description: "30 day tracking streak",
    icon: "🏅",
    xp: 500,
    condition: (stats) => stats.streak >= 30,
  },
  {
    id: "all_categories",
    name: "Category Explorer",
    description: `Use all ${CATEGORIES.length} expense categories`,
    icon: "🗂️",
    xp: 100,
    condition: (stats) => stats.categoriesUsed >= CATEGORIES.length,
  },
  {
    id: "budget_setter",
    name: "Budget Boss",
    description: "Set a budget for any category",
    icon: "🎯",
    xp: 50,
    condition: (stats) => stats.budgetsSet >= 1,
  },
  {
    id: "pdf_export",
    name: "Report Ready",
    description: "Export your first PDF report",
    icon: "📄",
    xp: 75,
    condition: (stats) => stats.pdfExports >= 1,
  },
  {
    id: "ai_user",
    name: "AI Explorer",
    description: "Use AI Insights feature",
    icon: "🤖",
    xp: 50,
    condition: (stats) => stats.aiUsed >= 1,
  },
  {
    id: "big_saver",
    name: "Big Saver",
    description: "Stay under budget for a full month",
    icon: "💎",
    xp: 300,
    condition: (stats) => stats.underBudgetMonths >= 1,
  },
];

export function checkAchievements(stats, unlockedIds) {
  return ACHIEVEMENTS.filter(
    a => !unlockedIds.includes(a.id) && a.condition(stats)
  );
}