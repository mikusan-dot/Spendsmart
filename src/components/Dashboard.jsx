import { useEffect, useState, useRef, useCallback } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import { useSavings } from "../context/SavingsContext";
import { checkAndAutoSave } from "../utils/savings";
import { CAT_COLORS, CAT_ICON, INC_COLORS, INC_ICON } from "../utils/categories";
import { ArrowDownLeft, ArrowUpRight, Wallet, ChevronRight, Receipt, PiggyBank, Tag, Calendar } from "lucide-react";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function SkeletonCard({ h = "h-24", className = "" }) {
  return <div className={`skeleton w-full ${h} ${className}`} />;
}

export default function Dashboard({ user, onAddPress, onTabChange }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const unsubRef = useRef(null);
  const { format } = useCurrency();
  const { theme } = useTheme();
  const { refresh: refreshSavings } = useSavings();

  const subscribe = useCallback(() => {
    if (!user?.uid) return;
    if (unsubRef.current) unsubRef.current();
    const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
    unsubRef.current = onSnapshot(q,
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const da = a.createdAt?.toDate?.() || new Date(0);
            const db2 = b.createdAt?.toDate?.() || new Date(0);
            return db2 - da;
          });
        setExpenses(data);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      },
      (err) => {
        console.error("Dashboard snapshot error:", err);
        setError("Failed to load expenses. Check your connection.");
        setLoading(false);
        setRefreshing(false);
      }
    );
  }, [user.uid]);

  useEffect(() => {
    subscribe();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [subscribe]);

  useEffect(() => {
    if (!user?.uid || loading || expenses.length === 0) return;
    const loadBudgetsAndCheck = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const budgetRef = doc(db, "budgets", user.uid);
        const budgetSnap = await getDoc(budgetRef);
        const budgets = budgetSnap.exists() ? budgetSnap.data() : {};
        await checkAndAutoSave(user.uid, expenses, budgets);
        await refreshSavings(user.uid);
      } catch (err) {
        console.error("Auto-save check error:", err);
      }
    };
    loadBudgetsAndCheck();
  }, [user?.uid, loading, expenses.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientY);
  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const dist = e.touches[0].clientY - touchStart;
    if (dist > 0 && window.scrollY === 0) setPullDistance(Math.min(dist, 80));
  };
  const handleTouchEnd = () => {
    if (pullDistance > 60) { setRefreshing(true); subscribe(); }
    setPullDistance(0);
    setTouchStart(null);
  };

  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = e.createdAt?.toDate?.();
    return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthExpenses = thisMonth.filter((e) => (e.type || "expense") === "expense");
  const thisMonthIncome = thisMonth.filter((e) => e.type === "income");
  const totalExpense = thisMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalIncome = thisMonthIncome.reduce((s, e) => s + Number(e.amount), 0);
  const netFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netFlow / totalIncome) * 100) : 0;

  const byCategory = thisMonthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const topCatEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const topCatName = topCatEntry?.[0] || "—";
  const topCatAmount = topCatEntry?.[1] || 0;
  const topCatPct = totalExpense > 0 ? ((topCatAmount / totalExpense) * 100).toFixed(0) : 0;
  const topCatColor = CAT_COLORS[topCatName] || theme.accentSecondary;

  if (error) return (
    <div className="space-y-4 pt-2">
      <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}>
        <p className="text-sm font-medium mb-2" style={{ color: theme.danger }}>Connection Issue</p>
        <p className="text-xs mb-4" style={{ color: theme.textMuted }}>{error}</p>
        <button onClick={() => { setError(null); setLoading(true); subscribe(); }} className="text-xs font-medium" style={{ color: theme.accent }}>
          Try again
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="space-y-4 pt-1">
      <SkeletonCard h="h-44" />
      <div className="grid grid-cols-3 gap-3">
        <SkeletonCard h="h-20" />
        <SkeletonCard h="h-20" />
        <SkeletonCard h="h-20" />
      </div>
      <SkeletonCard h="h-56" />
      <SkeletonCard h="h-48" />
    </div>
  );

  return (
    <div
      className="space-y-5 pt-1"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(pullDistance > 0 || refreshing) && (
        <div className="flex justify-center py-2 transition-all" style={{ height: refreshing ? 40 : pullDistance * 0.5 }}>
          <div
            className={`w-5 h-5 border-2 border-t-transparent rounded-full ${refreshing ? "spinning" : ""}`}
            style={{ borderColor: theme.accent, borderTopColor: "transparent", transform: refreshing ? undefined : `rotate(${pullDistance * 3}deg)` }}
          />
        </div>
      )}

      {/* Hero Balance Card */}
      <div
        className="fade-in-1 rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{
          background: theme.heroGradient,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="relative">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>Net Cash Flow</p>
              <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{MONTH_NAMES[now.getMonth()]} {now.getFullYear()}</p>
            </div>
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px]"
              style={{ backgroundColor: theme.accent + "10", color: theme.accent }}
            >
              <Calendar size={10} />
              <span>{thisMonth.length} {thisMonth.length === 1 ? "transaction" : "transactions"}</span>
            </div>
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight mt-3 mb-5 tabular-nums"
            style={{
              color: netFlow > 0
                ? theme.income
                : netFlow === 0
                ? theme.expense
                : "#E0A458"
            }}
          >
            {netFlow >= 0 ? "+" : ""}{format(Math.abs(netFlow))}
          </h2>
          <div className="flex gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.income + "12" }}>
                <ArrowDownLeft size={15} style={{ color: theme.income }} />
              </div>
              <div>
                <p className="text-[11px]" style={{ color: theme.textMuted }}>Income</p>
                <p className="text-sm font-semibold tabular-nums" style={{ color: theme.text }}>{format(totalIncome)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.expenseMuted + "12" }}>
                <ArrowUpRight size={15} style={{ color: theme.expenseMuted }} />
              </div>
              <div>
                <p className="text-[11px]" style={{ color: theme.textMuted }}>Expenses</p>
                <p className="text-sm font-semibold tabular-nums" style={{ color: theme.expense }}>{format(totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats — 3 cards */}
      <div className="grid grid-cols-3 gap-3 fade-in-2">
        {/* Saved */}
        <div
          className="rounded-2xl p-3.5 hover-lift"
          style={{ backgroundColor: theme.bgSecondary }}
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent + "12" }}>
              <PiggyBank size={13} style={{ color: theme.accent }} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>Saved</span>
          </div>
          <p className="text-lg font-bold tabular-nums" style={{ color: theme.text }}>
            {savingsRate > 0 ? `${savingsRate.toFixed(0)}%` : "—"}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: theme.textMuted }}>
            {netFlow >= 0 ? `${format(Math.abs(netFlow))} saved` : "over budget"}
          </p>
        </div>

        {/* Top Category */}
        <div
          className="rounded-2xl p-3.5 hover-lift"
          style={{ backgroundColor: theme.bgSecondary }}
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: topCatColor + "12" }}>
              <Tag size={13} style={{ color: topCatColor }} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>Top Cat.</span>
          </div>
          <p className="text-sm font-bold truncate" style={{ color: theme.text }}>{topCatName}</p>
          <p className="text-[10px] mt-0.5 tabular-nums" style={{ color: theme.textMuted }}>
            {topCatAmount > 0 ? `${format(topCatAmount)} · ${topCatPct}%` : "—"}
          </p>
        </div>

        {/* Transactions */}
        <div
          className="rounded-2xl p-3.5 hover-lift"
          style={{ backgroundColor: theme.bgSecondary }}
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accentSecondary + "12" }}>
              <Receipt size={13} style={{ color: theme.accentSecondary }} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>Txns</span>
          </div>
          <p className="text-lg font-bold tabular-nums" style={{ color: theme.text }}>{thisMonth.length}</p>
          <p className="text-[10px] mt-0.5" style={{ color: theme.textMuted }}>
            {thisMonthIncome.length} income · {thisMonthExpenses.length} expense
          </p>
        </div>
      </div>

      {/* This Month Summary */}
      <div
        className="rounded-2xl p-5 fade-in-3"
        style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: theme.text }}>This Month</h3>
<div className="space-y-3">
            {[
              { label: "Spent", value: format(totalExpense), color: theme.expense },
              { label: "Earned", value: format(totalIncome), color: theme.income },
              {
                label: "Net Savings",
                value: netFlow >= 0 ? format(netFlow) : `-${format(Math.abs(netFlow))}`,
                color: netFlow > 0 ? theme.income : netFlow === 0 ? theme.expense : "#E0A458"
              },
              { label: "Savings Rate", value: totalIncome > 0 ? `${savingsRate.toFixed(0)}%` : "—", color: savingsRate >= 20 ? theme.income : savingsRate >= 0 ? theme.warning : theme.danger },
            ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <span className="text-xs" style={{ color: theme.textMuted }}>{item.label}</span>
              <span className="text-sm font-semibold tabular-nums" style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="fade-in-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold" style={{ color: theme.text }}>Recent Transactions</h3>
          {expenses.length > 0 && (
            <button
              onClick={() => onTabChange?.("transactions")}
              className="flex items-center gap-1 text-xs font-medium transition press"
              style={{ color: theme.accent }}
            >
              View all <ChevronRight size={12} />
            </button>
          )}
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
        >
          {expenses.length > 0 ? (
            expenses.slice(0, 5).map((e, i) => {
              const isIncome = e.type === "income";
              const Icon = isIncome ? (INC_ICON[e.category] || Wallet) : (CAT_ICON[e.category] || Wallet);
              const iconColor = isIncome ? (INC_COLORS[e.category] || theme.income) : (CAT_COLORS[e.category] || theme.accentSecondary);
              const d = e.createdAt?.toDate?.();
              const dateStr = d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-4 py-3 transition cursor-pointer"
                  style={{
                    borderBottom: i < Math.min(expenses.length, 5) - 1 ? `1px solid ${theme.border}` : "none",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(ev) => ev.currentTarget.style.backgroundColor = theme.glass}
                  onMouseLeave={(ev) => ev.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconColor + "15" }}
                    >
                      <Icon size={15} style={{ color: iconColor }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: theme.text }}>{e.title}</p>
                      <p className="text-[11px] truncate" style={{ color: theme.textMuted }}>{e.category} · {dateStr}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold tabular-nums flex-shrink-0 ml-3" style={{ color: isIncome ? theme.income : theme.expense }}>
                    {isIncome ? "+" : "-"}{format(e.amount)}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 px-4">
              <Wallet size={36} className="mx-auto mb-3" style={{ color: theme.textMuted, opacity: 0.4 }} />
              <p className="text-sm mb-1" style={{ color: theme.textMuted }}>No transactions yet</p>
              <button onClick={onAddPress} className="text-xs font-medium" style={{ color: theme.accent }}>
                Add your first transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
