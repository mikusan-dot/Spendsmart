import { createContext, useContext, useState, useCallback } from "react";
import { getSavings } from "../utils/savings";

const SavingsContext = createContext(null);

export function SavingsProvider({ children }) {
  const [savings, setSavings] = useState({ balance: 0, history: [] });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (uid) => {
    if (!uid) return;
    setLoading(true);
    try {
      const data = await getSavings(uid);
      setSavings(data || { balance: 0, history: [] });
    } catch (err) {
      console.error("Savings refresh error:", err);
    }
    setLoading(false);
  }, []);

  return (
    <SavingsContext.Provider value={{ savings, setSavings, refresh, loading }}>
      {children}
    </SavingsContext.Provider>
  );
}

export function useSavings() {
  return useContext(SavingsContext);
}
