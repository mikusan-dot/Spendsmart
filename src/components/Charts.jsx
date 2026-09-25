import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
  Area, AreaChart
} from "recharts";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import { CAT_COLORS, INC_COLORS } from "../utils/categories";
import { BarChart3, TrendingUp, TrendingDown, Activity, LayoutGrid } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function CustomTooltip({ active, payload, label, theme, format }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-3 py-2 text-xs shadow-xl"
        style={{
          backgroundColor: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
        }}
      >
        <p className="font-medium mb-1" style={{ color: theme.text }}>{label || payload[0].name}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="tabular-nums" style={{ color: entry.color || theme.textMuted }}>
            {entry.name}: {format(entry.value.toFixed(0))}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function TrendTooltip({ active, payload, label, theme, format }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-3 py-2 text-xs shadow-xl"
        style={{
          backgroundColor: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
        }}
      >
        <p className="font-medium mb-1" style={{ color: theme.text }}>{label}</p>
        <p className="tabular-nums" style={{ color: theme.accent }}>
          Spent: {format(payload[0].value.toFixed(0))}
        </p>
      </div>
    );
  }
  return null;
}

export default function Charts({ user }) {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [chartType, setChartType] = useState("expense");
  const { format } = useCurrency();

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
        console.error("Charts snapshot error:", err);
      }
    );
  }, [user.uid]);

  const filteredExpenses = expenses.filter((e) => {
    if (chartType === "income") return e.type === "income";
    return (e.type || "expense") === "expense";
  });
  const colorMap = chartType === "income" ? INC_COLORS : CAT_COLORS;

  const catTotals = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});
  const pieData = Object.entries(catTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalForPct = pieData.reduce((s, d) => s + d.value, 0);

  const now = new Date();
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const expenseTotal = expenses
      .filter((e) => {
        const ed = e.createdAt?.toDate?.();
        const expType = e.type || "expense";
        return ed && ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear() && expType === "expense";
      })
      .reduce((s, e) => s + Number(e.amount), 0);
    const incomeTotal = expenses
      .filter((e) => {
        const ed = e.createdAt?.toDate?.();
        return ed && ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear() && e.type === "income";
      })
      .reduce((s, e) => s + Number(e.amount), 0);
    return { month: MONTHS[d.getMonth()], expense: expenseTotal, income: incomeTotal };
  });

  const trendData = useMemo(() => {
    const days = 30;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStr = `${d.getDate()}/${d.getMonth() + 1}`;
      const total = expenses
        .filter((e) => {
          const ed = e.createdAt?.toDate?.();
          const expType = e.type || "expense";
          return (
            ed &&
            ed.getDate() === d.getDate() &&
            ed.getMonth() === d.getMonth() &&
            ed.getFullYear() === d.getFullYear() &&
            expType === "expense"
          );
        })
        .reduce((s, e) => s + Number(e.amount), 0);
      result.push({ day: dayStr, amount: total });
    }
    return result;
  }, [expenses]); // eslint-disable-line react-hooks/exhaustive-deps

  const topCategories = useMemo(() => {
    const totals = expenses
      .filter((e) => (e.type || "expense") === "expense")
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {});
    const total = Object.values(totals).reduce((s, v) => s + v, 0);
    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount, pct: total > 0 ? (amount / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <BarChart3 size={20} style={{ color: theme.accent }} />
        <h2 className="text-xl font-bold" style={{ color: theme.text }}>Analytics</h2>
      </div>

      {/* Chart Type Toggle */}
      <div
        className="inline-flex rounded-xl p-1 gap-1"
        style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        {[
          { key: "expense", label: "Expenses", icon: TrendingDown },
          { key: "income", label: "Income", icon: TrendingUp },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setChartType(key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
            style={
              chartType === key
                ? { backgroundColor: theme.accent, color: theme.bg, boxShadow: `0 2px 12px ${theme.accent}25` }
                : { backgroundColor: "transparent", color: theme.textMuted }
            }
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: theme.text }}>
            {chartType === "income" ? "Income by Category" : "Spending by Category"}
          </h3>
          {pieData.length > 0 ? (
            <>
              <div className="h-44 lg:h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="42%"
                      outerRadius="72%"
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={colorMap[entry.name] || theme.accentSecondary} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip theme={theme} format={format} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 justify-center">
                {pieData.map((d) => {
                  const pct = totalForPct > 0 ? ((d.value / totalForPct) * 100).toFixed(0) : 0;
                  return (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colorMap[d.name] || theme.accentSecondary }}
                      />
                      <span className="text-[11px]" style={{ color: theme.textMuted }}>{d.name}</span>
                      <span className="text-[11px] tabular-nums font-medium" style={{ color: theme.text }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-44">
              <p className="text-sm" style={{ color: theme.textMuted }}>No data yet</p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: theme.text }}>Monthly Overview</h3>
          <div className="h-44 lg:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: theme.textMuted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: theme.textMuted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip theme={theme} format={format} />} cursor={false} />
                <Bar dataKey="expense" fill={theme.expense} radius={[4, 4, 0, 0]} name="Expenses" maxBarSize={24} />
                <Bar dataKey="income" fill={theme.income} radius={[4, 4, 0, 0]} name="Income" maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 justify-center text-[11px]" style={{ color: theme.textMuted }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.expense }} />
              Expenses
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.income }} />
              Income
            </div>
          </div>
        </div>
      </div>

      {/* Spending Trend */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity size={14} style={{ color: theme.accent }} />
          <h3 className="text-sm font-semibold" style={{ color: theme.text }}>Spending Trend (Last 30 Days)</h3>
        </div>
        {trendData.some((d) => d.amount > 0) ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.accent} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={theme.accent} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fill: theme.textMuted, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: theme.textMuted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<TrendTooltip theme={theme} format={format} />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={theme.accent}
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: theme.accent,
                    stroke: theme.bgSecondary,
                    strokeWidth: 2,
                  }}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm" style={{ color: theme.textMuted }}>No spending data yet</p>
          </div>
        )}
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid size={14} style={{ color: theme.accent }} />
            <h3 className="text-sm font-semibold" style={{ color: theme.text }}>Top Categories</h3>
          </div>
          <div className="space-y-3">
            {topCategories.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: `${colorMap[cat.name] || theme.accentSecondary}18`, color: colorMap[cat.name] || theme.accentSecondary }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium truncate" style={{ color: theme.text }}>{cat.name}</span>
                    <span className="text-xs tabular-nums font-semibold ml-2 flex-shrink-0" style={{ color: theme.text }}>
                      {format(cat.amount.toFixed(0))}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${theme.text}06` }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.pct}%`, backgroundColor: colorMap[cat.name] || theme.accentSecondary }}
                    />
                  </div>
                </div>
                <span className="text-xs tabular-nums flex-shrink-0 w-10 text-right" style={{ color: theme.textMuted }}>
                  {cat.pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
