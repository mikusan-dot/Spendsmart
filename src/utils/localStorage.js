// Local storage database for offline support
const KEYS = {
  EXPENSES: "ss_expenses",
  BUDGETS: "ss_budgets",
  GAMIFICATION: "ss_gamification",
  LAST_SYNC: "ss_last_sync",
};

export const localDB = {
  // Expenses
  getExpenses: (uid) => {
    try {
      const data = localStorage.getItem(`${KEYS.EXPENSES}_${uid}`);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveExpenses: (uid, expenses) => {
    try {
      localStorage.setItem(`${KEYS.EXPENSES}_${uid}`, JSON.stringify(expenses));
    } catch (e) { console.error("Storage full:", e); }
  },

  addExpense: (uid, expense) => {
    const expenses = localDB.getExpenses(uid);
    const updated = [expense, ...expenses];
    localDB.saveExpenses(uid, updated);
    return updated;
  },

  updateExpense: (uid, id, data) => {
    const expenses = localDB.getExpenses(uid);
    const updated = expenses.map(e => e.id === id ? { ...e, ...data } : e);
    localDB.saveExpenses(uid, updated);
    return updated;
  },

  deleteExpense: (uid, id) => {
    const expenses = localDB.getExpenses(uid);
    const updated = expenses.filter(e => e.id !== id);
    localDB.saveExpenses(uid, updated);
    return updated;
  },

  // Budgets
  getBudgets: (uid) => {
    try {
      const data = localStorage.getItem(`${KEYS.BUDGETS}_${uid}`);
      return data ? JSON.parse(data) : {};
    } catch { return {}; }
  },

  saveBudgets: (uid, budgets) => {
    try {
      localStorage.setItem(`${KEYS.BUDGETS}_${uid}`, JSON.stringify(budgets));
    } catch (e) { console.error(e); }
  },

  // Gamification
  getGameData: (uid) => {
    try {
      const data = localStorage.getItem(`${KEYS.GAMIFICATION}_${uid}`);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  saveGameData: (uid, data) => {
    try {
      localStorage.setItem(`${KEYS.GAMIFICATION}_${uid}`, JSON.stringify(data));
    } catch (e) { console.error(e); }
  },

  // Sync tracking
  getLastSync: (uid) => {
    return localStorage.getItem(`${KEYS.LAST_SYNC}_${uid}`);
  },

  setLastSync: (uid) => {
    localStorage.setItem(`${KEYS.LAST_SYNC}_${uid}`, new Date().toISOString());
  },

  // Export all data
  exportAll: (uid) => {
    return {
      expenses: localDB.getExpenses(uid),
      budgets: localDB.getBudgets(uid),
      gameData: localDB.getGameData(uid),
      exportedAt: new Date().toISOString(),
    };
  },

  // Clear all data
  clearAll: (uid) => {
    Object.values(KEYS).forEach(key => {
      localStorage.removeItem(`${key}_${uid}`);
    });
  },
};