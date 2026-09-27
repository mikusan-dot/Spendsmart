import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, query, where, onSnapshot,
  orderBy, doc, setDoc
} from "firebase/firestore";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import { CATEGORIES, CAT_COLORS, CAT_ICON } from "../utils/categories";
import { Wallet, Pencil, X, Check } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

function getStatusLabel(pct) {
  if (pct > 100) return "Over Budget";
  if (pct >= 86) return "Near Limit";
  if (pct >= 61) return "Approaching";
  return "On Track";
}

export default function Budget({ user }) {
  const theme = useTheme();
  const [budgets, setBudgets] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const [saving, setSaving] = useState(false);
  const { format } = useCurrency();

  useEffect(() => {
    const ref = doc(db, "budgets", user.uid);
    return onSnapshot(ref,
      (snap) => {
        if (snap.exists()) setBudgets(snap.data());
      },
      (err) => {
        console.error("Budget snapshot error:", err);
      }
    );
  }, [user.uid]);

  useEffect(() => {
    const q = query(
      collection(db, "expenses"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q,
      (snap) => {
        setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error("Budget expenses snapshot error:", err);
      }
    );
  }, [user.uid]);

  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = e.createdAt?.toDate?.();
    return d && d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      (e.type || "expense") === "expense";
  });

  const spentByCategory = thisMonth.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const totalBudget = Object.values(budgets).reduce((s, v) => s + Number(v || 0), 0);
  const totalSpent = Object.values(spentByCategory).reduce((s, v) => s + v, 0);
  const remaining = Math.max(totalBudget - totalSpent, 0);
  const isOver = totalSpent > totalBudget;
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const saveBudget = async (cat, val) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 0) return alert("Please enter a valid positive amount");
    setSaving(true);
    const updated = { ...budgets, [cat]: parsed };
    setBudgets(updated);
    await setDoc(doc(db, "budgets", user.uid), updated);
    setSaving(false);
    setEditing(null);
  };

  const getBarColor = (pct) => {
    if (pct > 100) return theme.danger;
    if (pct >= 86) return theme.warning;
    if (pct >= 61) return theme.warning;
    return theme.text;
  };

  const statusColor = isOver ? theme.danger : overallPct >= 86 ? theme.warning : theme.text;

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: theme.accent + "15" }}
          >
            <Wallet size={20} style={{ color: theme.accent }} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: theme.text }}>Budget</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {MONTHS[now.getMonth()]} {now.getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Hero — Monthly Budget Overview */}
      <div
        className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{
          background: theme.heroGradient || `linear-gradient(135deg, ${theme.bgSecondary}, ${theme.bgTertiary})`,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>
              Monthly Budget
            </p>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {MONTHS[now.getMonth()]} {now.getFullYear()}
            </p>
          </div>
          {totalBudget > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: statusColor }}
              >
                {getStatusLabel(overallPct)}
              </span>
            </div>
          )}
        </div>

        <p
          className="text-4xl md:text-5xl font-bold tabular-nums mt-4 mb-2"
          style={{ color: theme.text }}
        >
          {format(totalBudget.toFixed(0))}
        </p>
        <p className="text-sm mb-5" style={{ color: theme.textMuted }}>
          Total budget
        </p>

        {/* Progress bar */}
        {totalBudget > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm tabular-nums" style={{ color: theme.textMuted }}>
                {format(totalSpent.toFixed(0))} spent
              </span>
              <span className="text-sm tabular-nums" style={{ color: theme.textMuted }}>
                {format(remaining.toFixed(0))} remaining
              </span>
            </div>
            <div
              className="w-full rounded-full h-2.5 md:h-3"
              style={{ backgroundColor: `${theme.text}10` }}
            >
              <div
                className="h-2.5 md:h-3 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(overallPct, 100)}%`,
                  backgroundColor: getBarColor(overallPct),
                }}
              />
            </div>
            <p
              className="text-sm tabular-nums mt-2 font-medium"
              style={{ color: statusColor }}
            >
              {Math.round(overallPct)}% used
            </p>
          </div>
        )}

        {totalBudget === 0 && (
          <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
            No budgets set yet
          </p>
        )}
      </div>

      {/* Summary Row — 3 stat cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          { label: "Total Budget", value: format(totalBudget.toFixed(0)), color: theme.text },
          { label: "Spent", value: format(totalSpent.toFixed(0)), color: isOver ? theme.danger : theme.text },
          { label: "Remaining", value: isOver ? `-${format((totalSpent - totalBudget).toFixed(0))}` : format(remaining.toFixed(0)), color: isOver ? theme.danger : theme.income },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 md:p-5"
            style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
          >
            <p className="text-xs md:text-sm font-medium uppercase tracking-wider mb-1.5" style={{ color: theme.textMuted }}>
              {stat.label}
            </p>
            <p
              className="text-lg md:text-xl font-bold tabular-nums"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Category Budgets */}
      <div>
        <h2 className="text-base md:text-lg font-semibold mb-4" style={{ color: theme.text }}>
          Category Budgets
        </h2>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}>
          <div className="divide-y" style={{ borderColor: theme.border }}>
            {CATEGORIES.map((cat) => {
              const spent = spentByCategory[cat] || 0;
              const budget = budgets[cat] || 0;
              const hasBudget = budget > 0;
              const pct = hasBudget ? (spent / budget) * 100 : 0;
              const barColor = hasBudget ? getBarColor(pct) : theme.textMuted;
              const isOverBudget = spent > budget && hasBudget;
              const Icon = CAT_ICON[cat] || Wallet;
              const catColor = CAT_COLORS[cat] || theme.accent;
              const isEditing = editing === cat;

              return (
                <div
                  key={cat}
                  className="p-4 md:p-5 transition-colors"
                  style={{ borderColor: theme.border }}
                >
                  {/* Top row: icon + name + status + edit */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${catColor}18` }}
                      >
                        <Icon size={18} style={{ color: catColor }} />
                      </div>
                      <div>
                        <p className="text-base font-medium" style={{ color: theme.text }}>
                          {cat}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOverBudget && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-lg"
                          style={{ backgroundColor: `${theme.danger}18`, color: theme.danger }}
                        >
                          Over
                        </span>
                      )}
                      {!isOverBudget && hasBudget && pct >= 86 && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-lg"
                          style={{ backgroundColor: `${theme.warning}18`, color: theme.warning }}
                        >
                          {Math.round(pct)}%
                        </span>
                      )}
                      <button
                        onClick={() => { setEditing(isEditing ? null : cat); setInputVal(budget || ""); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                        style={{
                          backgroundColor: isEditing ? theme.accent + "20" : `${theme.text}08`,
                          color: isEditing ? theme.accent : theme.textMuted,
                        }}
                        aria-label={`Edit ${cat} budget`}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Spent / Budget info + progress bar */}
                  {hasBudget ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm tabular-nums" style={{ color: theme.textMuted }}>
                          <span style={{ color: theme.text, fontWeight: 500 }}>{format(spent.toFixed(0))}</span>
                          {" "}of {format(budget.toFixed(0))}
                        </p>
                        <p
                          className="text-sm tabular-nums font-medium"
                          style={{ color: isOverBudget ? theme.danger : theme.textMuted }}
                        >
                          {Math.round(pct)}%
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div
                        className="w-full rounded-full h-2"
                        style={{ backgroundColor: `${theme.text}08` }}
                      >
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        {spent > 0 ? (
                          <>{format(spent.toFixed(0))} spent</>
                        ) : (
                          "No spending yet"
                        )}
                      </p>
                      <p className="text-sm font-medium" style={{ color: theme.textMuted }}>
                        No budget set
                      </p>
                    </div>
                  )}

                  {/* Inline Edit */}
                  {isEditing && (
                    <div className="mt-3 flex gap-2 fade-in">
                      <input
                        type="number"
                        min="0"
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm tabular-nums focus:outline-none"
                        style={{
                          backgroundColor: "#101A15",
                          color: "#F5F7F5",
                          border: "1px solid #26382F",
                        }}
                        placeholder="Set budget amount..."
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveBudget(cat, inputVal);
                          if (e.key === "Escape") setEditing(null);
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => saveBudget(cat, inputVal)}
                        disabled={saving}
                        className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl transition font-medium"
                        style={{ backgroundColor: theme.accent, color: theme.bg }}
                      >
                        <Check size={14} />
                        {saving ? "..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition"
                        style={{ backgroundColor: `${theme.text}08`, color: theme.textMuted }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
