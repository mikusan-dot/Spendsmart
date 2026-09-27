import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { db } from "../firebase";
import {
  collection, query, where, onSnapshot, deleteDoc, doc, setDoc
} from "firebase/firestore";
import AddExpense from "./AddExpense";
import UndoToast from "./UndoToast";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import {
  Search, X, ChevronDown, ChevronUp, Trash2, Receipt, AlertTriangle, Wallet, Clock
} from "lucide-react";

const SWIPE_THRESHOLD = -100;

const UNIFIED_FILTERS = [
  { key: "all", label: "All", icon: null },
  { key: "time", label: "Time", icon: Clock },
  { key: "expense", label: "Expense", icon: null },
  { key: "income", label: "Income", icon: null },
];

function formatDate(date) {
  if (!date) return "";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (target.getTime() === today.getTime()) return `Today at ${timeStr}`;
  if (target.getTime() === yesterday.getTime()) return `Yesterday at ${timeStr}`;

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
  if (target >= weekStart) {
    return date.toLocaleDateString([], { weekday: "short" }) + " " + timeStr;
  }

  return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

function getDateKey(date) {
  if (!date) return "unknown";
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return d.toISOString().split("T")[0];
}

function getDateLabel(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return "Today";
  if (target.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" });
}

function SkeletonItem({ theme }) {
  return (
    <div className="flex items-center gap-3 px-1 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
      <div className="w-10 h-10 rounded-xl flex-shrink-0 animate-pulse" style={{ backgroundColor: theme.bgTertiary }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded animate-pulse" style={{ backgroundColor: theme.bgTertiary }} />
        <div className="h-2 w-20 rounded animate-pulse" style={{ backgroundColor: theme.bgTertiary }} />
      </div>
      <div className="h-4 w-14 rounded animate-pulse" style={{ backgroundColor: theme.bgTertiary }} />
    </div>
  );
}

function SwipeableItem({ expense, onEdit, onDeleted }) {
  const [swipeX, setSwipeX] = useState(0);
  const [startX, setStartX] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { format } = useCurrency();
  const theme = useTheme();
  const isIncome = expense.type === "income";
  const colorMap = isIncome ? INC_COLORS : CAT_COLORS;
  const iconMap = isIncome ? INC_ICON : CAT_ICON;
  const catColor = colorMap[expense.category] || theme.accent;

  const handleTouchStart = (e) => setStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => {
    if (startX === null) return;
    const diff = e.touches[0].clientX - startX;
    if (diff < 0) setSwipeX(Math.max(diff, SWIPE_THRESHOLD));
    else setSwipeX(0);
  };
  const handleDelete = async () => {
    setDeleting(true);
    setSwipeX(SWIPE_THRESHOLD);
    setTimeout(async () => {
      try {
        await deleteDoc(doc(db, "expenses", expense.id));
        onDeleted?.(expense);
      } catch (err) {
        console.error("Delete failed:", err);
        setDeleting(false);
      }
    }, 300);
  };

  const handleTouchEnd = () => {
    if (swipeX < -60) {
      handleDelete();
    } else {
      setSwipeX(0);
    }
    setStartX(null);
  };

  return (
    <div className={`relative overflow-hidden ${deleting ? "swipe-item swiped" : ""}`} style={{ borderBottom: `1px solid ${theme.border}` }}>
      <div
        className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-1 py-3.5 relative cursor-pointer"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: startX !== null ? "none" : "transform 0.3s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => onEdit(expense)}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${catColor}20` }}
        >
          {(() => { const Icon = iconMap[expense.category] || Wallet; return <Icon size={16} style={{ color: catColor }} />; })()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: theme.text }}>{expense.title}</p>
          <p className="text-xs" style={{ color: theme.textMuted }}>
            {expense.category}
            <span className="mx-1.5">·</span>
            {formatDate(expense.createdAt?.toDate?.())}
            {isIncome && <span className="ml-1.5" style={{ color: theme.income }}>· Income</span>}
          </p>
        </div>
        <p
          className="text-sm font-semibold flex-shrink-0 tabular-nums whitespace-nowrap"
          style={{ color: isIncome ? theme.income : theme.expense }}
        >
          {isIncome ? "+" : "-"}{format(Number(expense.amount))}
        </p>
        <button
          type="button"
          className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 press"
          style={{
            backgroundColor: isIncome ? `${theme.income}15` : `${theme.expense}15`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          aria-label="Delete transaction"
        >
          <Trash2 size={18} style={{ color: isIncome ? theme.income : theme.expense }} />
        </button>
      </div>
    </div>
  );
}

function DayGroup({ dateStr, items, isExpanded, onToggle, onEdit, onDeleted, format }) {
  const theme = useTheme();
  const incomeItems = items.filter((e) => e.type === "income");
  const expenseItems = items.filter((e) => (e.type || "expense") === "expense");
  const dayIncome = incomeItems.reduce((s, e) => s + Number(e.amount), 0);
  const dayExpense = expenseItems.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full px-1 py-3 flex items-center justify-between press"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: theme.text }}>{getDateLabel(dateStr)}</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            {dayExpense > 0 && (
              <p className="text-sm font-semibold tabular-nums" style={{ color: theme.expense }}>-{format(dayExpense)}</p>
            )}
            {dayIncome > 0 && (
              <p className="text-xs font-medium tabular-nums" style={{ color: theme.income }}>+{format(dayIncome)}</p>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp size={16} style={{ color: theme.textMuted }} />
          ) : (
            <ChevronDown size={16} style={{ color: theme.textMuted }} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div>
          {items.map((e) => (
            <SwipeableItem key={e.id} expense={e} onEdit={onEdit} onDeleted={onDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}



export default function ExpenseList({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [unifiedFilter, setUnifiedFilter] = useState("all");
  const [editItem, setEditItem] = useState(null);
  const [deletedExpense, setDeletedExpense] = useState(null);
  const [expandedDays, setExpandedDays] = useState(new Set());
  const undoTimeoutRef = useRef(null);
  const { format } = useCurrency();
  const theme = useTheme();

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const q = query(
      collection(db, "expenses"),
      where("uid", "==", user.uid)
    );
    const unsub = onSnapshot(q,
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
        setError(null);
      },
      (err) => {
        console.error("ExpenseList snapshot error:", err);
        setError("Failed to load expenses.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user.uid]);

  const handleDeleted = useCallback((expense) => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setDeletedExpense(expense);
    undoTimeoutRef.current = setTimeout(() => {
      setDeletedExpense(null);
      undoTimeoutRef.current = null;
    }, 5000);
  }, []);

  const handleUndo = useCallback(async () => {
    if (!deletedExpense) return;
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = null;
    const { id, ...rest } = deletedExpense;
    try {
      await setDoc(doc(db, "expenses", id), rest);
    } catch (err) {
      console.error("Undo failed:", err);
    }
    setDeletedExpense(null);
  }, [deletedExpense]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const toggleDay = useCallback((dayKey) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) next.delete(dayKey);
      else next.add(dayKey);
      return next;
    });
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const expType = e.type || "expense";
      const queryText = search.toLowerCase();
      const matchSearch = !queryText ||
        e.title?.toLowerCase().includes(queryText) ||
        e.note?.toLowerCase().includes(queryText);

      let matchFilter = true;
      if (unifiedFilter === "time") {
        const d = e.createdAt?.toDate?.();
        matchFilter = d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      } else if (unifiedFilter === "expense") {
        matchFilter = expType === "expense";
      } else if (unifiedFilter === "income") {
        matchFilter = expType === "income";
      }

      return matchSearch && matchFilter;
    });
  }, [expenses, unifiedFilter, search]);

  const grouped = useMemo(() => {
    const sections = {};
    for (const e of filtered) {
      const key = getDateKey(e.createdAt?.toDate?.());
      if (!sections[key]) sections[key] = { items: [], total: 0 };
      sections[key].items.push(e);
      sections[key].total += Number(e.amount);
    }
    return sections;
  }, [filtered]);

  const sortedDays = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  }, [grouped]);

  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (sortedDays.length > 0 && !initialLoadDone.current) {
      initialLoadDone.current = true;
      const today = new Date().toISOString().split("T")[0];
      if (sortedDays.includes(today)) {
        setExpandedDays(new Set([today]));
      }
    }
  }, [sortedDays]);

  if (error) return (
    <div className="space-y-3 fade-in">
      <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: theme.bgSecondary }}>
        <div className="flex justify-center mb-3">
          <AlertTriangle size={40} style={{ color: theme.danger }} />
        </div>
        <p className="text-sm font-medium mb-2" style={{ color: theme.danger }}>Connection Issue</p>
        <p className="text-xs" style={{ color: theme.textMuted }}>{error}</p>
      </div>
    </div>
  );

  if (editItem) return (
    <AddExpense user={user} editData={editItem} onDone={() => setEditItem(null)} />
  );

return (
    <div className="space-y-3 fade-in" style={{ backgroundColor: theme.bg }}>
      {/* Search - glass effect */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: theme.textMuted }}
        />
        <input
          className="w-full rounded-2xl pl-10 pr-10 py-3 text-sm focus:outline-none transition"
          style={{
            backgroundColor: `${theme.bgSecondary}cc`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
          placeholder="Search transactions..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(""); setSearch(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center press"
            style={{ backgroundColor: theme.bgTertiary }}
            aria-label="Clear search"
          >
            <X size={12} style={{ color: theme.textMuted }} />
          </button>
        )}
      </div>

      {/* Unified Filter Row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {UNIFIED_FILTERS.map((f) => {
          const isActive = unifiedFilter === f.key;
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setUnifiedFilter(f.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition press"
              style={{
                backgroundColor: isActive ? `${theme.accent}15` : "transparent",
                color: isActive ? theme.accent : theme.textMuted,
                border: isActive ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
              }}
            >
              {Icon && <Icon size={12} />}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Transaction list */}
      <div>
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonItem key={i} theme={theme} />)
        ) : sortedDays.length > 0 ? (
          sortedDays.map((dayKey) => {
            const { items, total } = grouped[dayKey];
            return (
              <DayGroup
                key={dayKey}
                dateStr={dayKey}
                items={items}
                total={total}
                isExpanded={expandedDays.has(dayKey)}
                onToggle={() => toggleDay(dayKey)}
                onEdit={setEditItem}
                onDeleted={handleDeleted}
                format={format}
              />
            );
          })
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-3">
              <Receipt size={48} style={{ color: theme.textMuted }} />
            </div>
            <p className="text-sm font-medium" style={{ color: theme.textMuted }}>No transactions found</p>
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Try a different search or filter</p>
          </div>
        )}
      </div>

      <UndoToast
        visible={!!deletedExpense}
        message={`Deleted · ${deletedExpense?.title || ""}`}
        onUndo={handleUndo}
        onDismiss={() => setDeletedExpense(null)}
      />
    </div>
  );
}
