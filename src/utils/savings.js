import { db } from "../firebase";
import {
  doc, getDoc, setDoc
} from "firebase/firestore";

const SAVINGS_KEY = "ss_savings";

function getLocalSavings(uid) {
  try {
    const data = localStorage.getItem(`${SAVINGS_KEY}_${uid}`);
    return data ? JSON.parse(data) : { balance: 0, history: [] };
  } catch {
    return { balance: 0, history: [] };
  }
}

function saveLocalSavings(uid, data) {
  localStorage.setItem(`${SAVINGS_KEY}_${uid}`, JSON.stringify(data));
}

export async function getSavings(uid) {
  try {
    const ref = doc(db, "savings", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      saveLocalSavings(uid, data);
      return data;
    }
  } catch (err) {
    console.error("getSavings error:", err);
  }
  return getLocalSavings(uid);
}

export async function addSavingsEntry(uid, entry) {
  const existing = await getSavings(uid);
  const newBalance = existing.balance + entry.amount;
  const newData = {
    balance: newBalance,
    history: [entry, ...(existing.history || [])],
  };

  try {
    await setDoc(doc(db, "savings", uid), newData);
  } catch (err) {
    console.error("addSavingsEntry Firestore error:", err);
  }
  saveLocalSavings(uid, newData);
  return newData;
}

export async function getSavingsHistory(uid) {
  const data = await getSavings(uid);
  return data.history || [];
}

export async function checkAndAutoSave(uid, expenses, budgets) {
  if (!uid || !expenses?.length) return null;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  const existing = await getSavings(uid);
  const alreadySavedThisMonth = (existing.history || []).some(
    (h) => h.monthKey === monthKey
  );
  if (alreadySavedThisMonth) return null;

  const totalBudget = Object.values(budgets).reduce(
    (s, v) => s + Number(v || 0), 0
  );
  if (totalBudget <= 0) return null;

  const thisMonthExpenses = expenses.filter((e) => {
    const d = e.createdAt?.toDate?.();
    return (
      d &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      (e.type || "expense") === "expense"
    );
  });

  const totalSpent = thisMonthExpenses.reduce(
    (s, e) => s + Number(e.amount), 0
  );

  const surplus = totalBudget - totalSpent;
  if (surplus <= 0) return null;

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const entry = {
    date: new Date().toISOString(),
    amount: Math.round(surplus * 100) / 100,
    monthKey,
    month: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
    budgetTotal: totalBudget,
    spentTotal: totalSpent,
  };

  return addSavingsEntry(uid, entry);
}
