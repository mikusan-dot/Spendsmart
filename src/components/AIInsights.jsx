import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import { CATEGORIES } from "../utils/categories";
import { Brain, Sparkles, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Minus, Lightbulb, Target } from "lucide-react";

function generateLocalInsights(expenses, format) {
  const now = new Date();

  const thisMonth = expenses.filter(e => {
    const d = e.createdAt?.toDate?.();
    return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const lastMonth = expenses.filter(e => {
    const d = e.createdAt?.toDate?.();
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d && d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
  });

  const thisMonthExpenses = thisMonth.filter(e => (e.type || "expense") === "expense");
  const thisMonthIncome = thisMonth.filter(e => e.type === "income");
  const lastMonthExpenses = lastMonth.filter(e => (e.type || "expense") === "expense");
  const lastMonthIncome = lastMonth.filter(e => e.type === "income");

  const totalExpense = thisMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalIncome = thisMonthIncome.reduce((s, e) => s + Number(e.amount), 0);
  const lastTotalExpense = lastMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const lastTotalIncome = lastMonthIncome.reduce((s, e) => s + Number(e.amount), 0);
  const netFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netFlow / totalIncome) * 100 : 0;

  const change = lastTotalExpense > 0 ? ((totalExpense - lastTotalExpense) / lastTotalExpense * 100) : 0;

  const byCategory = thisMonthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const avgPerDay = now.getDate() > 0 ? totalExpense / now.getDate() : 0;

  let score = 70;
  if (change < 0) score += 10;
  if (change > 20) score -= 10;
  if (thisMonthExpenses.length > 20) score -= 5;
  if (savingsRate >= 20) score += 15;
  else if (savingsRate >= 10) score += 5;
  else if (savingsRate < 0 && totalIncome > 0) score -= 20;
  score = Math.min(100, Math.max(0, score));

  const scoreLabel = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";

  const insights = [];

  if (topCat) {
    const pct = ((topCat[1] / totalExpense) * 100).toFixed(0);
    insights.push({
      icon: "category",
      title: `${topCat[0]} is your top expense`,
      description: `You spent ${format(topCat[1].toFixed(0))} on ${topCat[0]} this month, which is ${pct}% of your expenses.`
    });
  }

  if (totalIncome > 0) {
    insights.push({
      icon: "savings",
      title: `Savings rate: ${savingsRate.toFixed(0)}%`,
      description: savingsRate >= 20
        ? `Great job! You're saving ${savingsRate.toFixed(0)}% of your income. Aim to keep it above 20%.`
        : `You're saving ${savingsRate.toFixed(0)}% of your income. Try to reach 20% for a healthy financial cushion.`
    });
  }

  if (change > 10) {
    insights.push({
      icon: "warning",
      title: "Spending increased this month",
      description: `Your expenses went up by ${change.toFixed(1)}% compared to last month. Try to identify where the extra money went.`
    });
  } else if (change < -10) {
    insights.push({
      icon: "success",
      title: "Great job cutting expenses!",
      description: `You spent ${Math.abs(change).toFixed(1)}% less than last month. Keep up the good work!`
    });
  } else if (lastTotalExpense === 0 && totalExpense > 0) {
    insights.push({
      icon: "new",
      title: "First month tracking",
      description: `You're tracking ${format(totalExpense.toFixed(0))} in expenses this month. Keep going to get better insights!`
    });
  }

  if (avgPerDay > 0) {
    insights.push({
      icon: "daily",
      title: `Daily average: ${format(avgPerDay.toFixed(0))}`,
      description: `At this rate you'll spend about ${format((avgPerDay * 30).toFixed(0))} this month. Plan accordingly!`
    });
  }

  const foodCat = CATEGORIES[0];
  if (byCategory[foodCat] && totalExpense > 0 && (byCategory[foodCat] / totalExpense) > 0.5) {
    insights.push({
      icon: "food",
      title: "High food spending",
      description: `Food takes up more than 50% of your expenses. Consider meal prepping to reduce costs.`
    });
  }

  if (thisMonthExpenses.length === 0 && thisMonthIncome.length === 0) {
    insights.push({
      icon: "empty",
      title: "No transactions this month yet",
      description: "Start adding your expenses and income to get personalized AI insights!"
    });
  } else if (thisMonthExpenses.length === 0) {
    insights.push({
      icon: "empty",
      title: "No expenses this month",
      description: "You've only recorded income so far. Add your expenses to see spending insights."
    });
  }

  const tips = [];
  if (topCat) tips.push(`Try to reduce ${topCat[0]} spending by 10% next month — that saves ${format((topCat[1] * 0.1).toFixed(0))}`);
  if (avgPerDay > 500) tips.push(`Set a daily spending limit of ${format((avgPerDay * 0.9).toFixed(0))} to stay on track`);
  if (savingsRate < 20 && totalIncome > 0) tips.push(`Try to save at least 20% of your income. Cut non-essential expenses to boost your savings rate.`);
  tips.push("Use the Budget tab to set category limits and get alerts");
  tips.push("Export a PDF report at the end of each month to track progress");
  if (change > 0) tips.push("Review last month's expenses to find areas to cut back");

  const hasIncome = totalIncome > 0;
  const hasLastIncome = lastTotalIncome > 0;
  let monthComparison;
  if (hasIncome && hasLastIncome) {
    const incomeChange = ((totalIncome - lastTotalIncome) / lastTotalIncome * 100).toFixed(1);
    monthComparison = `Expenses: ${format(totalExpense.toFixed(0))} vs ${format(lastTotalExpense.toFixed(0))} last month (${change > 0 ? "+" : ""}${change.toFixed(1)}%) · Income: ${format(totalIncome.toFixed(0))} vs ${format(lastTotalIncome.toFixed(0))} (${incomeChange > 0 ? "+" : ""}${incomeChange}%)`;
  } else if (hasIncome) {
    monthComparison = `This month: earned ${format(totalIncome.toFixed(0))}, spent ${format(totalExpense.toFixed(0))} (${netFlow >= 0 ? "+" : ""}${format(Math.abs(netFlow).toFixed(0))} net)`;
  } else {
    monthComparison = lastTotalExpense === 0
      ? "This is your first month of data — keep tracking to see comparisons!"
      : `This month: ${format(totalExpense.toFixed(0))} vs last month: ${format(lastTotalExpense.toFixed(0))} (${change > 0 ? "+" : ""}${change.toFixed(1)}%)`;
  }

  const summaryParts = [];
  if (thisMonthExpenses.length === 0 && thisMonthIncome.length === 0) {
    summaryParts.push("No transactions recorded this month yet. Start adding to get personalized insights!");
  } else {
    if (totalExpense > 0) summaryParts.push(`spent ${format(totalExpense.toFixed(0))} across ${thisMonthExpenses.length} transactions`);
    if (totalIncome > 0) summaryParts.push(`earned ${format(totalIncome.toFixed(0))}`);
    if (totalIncome > 0) {
      summaryParts.push(`${netFlow >= 0 ? "saving" : "overspending by"} ${format(Math.abs(netFlow).toFixed(0))}`);
    }
    if (change !== 0 && lastTotalExpense > 0) {
      summaryParts.push(`expenses ${change > 0 ? "up" : "down"} ${Math.abs(change).toFixed(1)}% from last month`);
    }
  }

  return {
    summary: summaryParts.length > 0
      ? `You've ${summaryParts.join(", ")}.`
      : "No data to analyze yet.",
    score: Math.round(score),
    scoreLabel,
    insights: insights.slice(0, 4),
    tips: tips.slice(0, 4),
    monthComparison: monthComparison || "Keep tracking to see month-over-month data!"
  };
}

function ScoreGauge({ score, theme }) {
  const radius = 52;
  const stroke = 7;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor = score >= 70
    ? theme.income
    : score >= 40
      ? theme.warning
      : theme.expense;

  return (
    <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
      <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
        <circle
          stroke={`${theme.text}08`}
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={scoreColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color: scoreColor }}>
          {score}
        </span>
        <span className="text-[10px] font-medium" style={{ color: theme.textMuted }}>/100</span>
      </div>
    </div>
  );
}

function getInsightIcon(iconType) {
  const iconProps = { size: 16 };
  switch (iconType) {
    case "category": return <TrendingUp {...iconProps} />;
    case "savings": return <CheckCircle {...iconProps} />;
    case "warning": return <AlertTriangle {...iconProps} />;
    case "success": return <CheckCircle {...iconProps} />;
    case "new": return <Sparkles {...iconProps} />;
    case "daily": return <Target {...iconProps} />;
    case "food": return <AlertTriangle {...iconProps} />;
    case "empty": return <Minus {...iconProps} />;
    default: return <Brain {...iconProps} />;
  }
}

function getInsightColor(iconType, theme) {
  switch (iconType) {
    case "category": return theme.accentSecondary;
    case "savings": return theme.income;
    case "warning": return theme.warning;
    case "success": return theme.income;
    case "new": return theme.accent;
    case "daily": return theme.accent;
    case "food": return theme.warning;
    case "empty": return theme.textMuted;
    default: return theme.accent;
  }
}

export default function AIInsights({ user, onUse }) {
  const [expenses, setExpenses] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const { format } = useCurrency();
  const { theme } = useTheme();

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
        const snap = await getDocs(q);
        setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadError(null);
      } catch (err) {
        console.error("AI insights load error:", err);
        setLoadError("Failed to load expense data.");
      }
    };
    loadExpenses();
  }, [user.uid]);

  const generateInsights = () => {
    setLoading(true);
    setInsights(null);
    onUse?.();
    const result = generateLocalInsights(expenses, format);
    setInsights(result);
    setLoaded(true);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain size={20} style={{ color: theme.accent }} />
        <h2 className="text-xl font-bold" style={{ color: theme.text }}>AI Insights</h2>
      </div>

      {loadError && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
        >
          <AlertTriangle size={18} className="mx-auto mb-2" style={{ color: theme.expense }} />
          <p className="text-sm" style={{ color: theme.expense }}>{loadError}</p>
        </div>
      )}

      {!loaded && !loadError && (
        <div
          className="rounded-2xl p-6 text-center space-y-4"
          style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: `${theme.accent}15` }}
          >
            <Brain size={28} style={{ color: theme.accent }} />
          </div>
          <h3 className="font-semibold" style={{ color: theme.text }}>Get AI-Powered Insights</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Analyze your spending patterns and get personalized money-saving tips.
          </p>
          <button
            onClick={generateInsights}
            disabled={loading}
            className="w-full text-white font-semibold py-3 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.accent }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing your spending...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate AI Insights
              </>
            )}
          </button>
        </div>
      )}

      {insights && (
        <div className="space-y-4">
          {/* Score Card with SVG Gauge */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
          >
            <p className="text-sm font-medium mb-4" style={{ color: theme.textMuted }}>Financial Health Score</p>
            <div className="flex items-center gap-6">
              <ScoreGauge score={insights.score} theme={theme} />
              <div className="flex-1">
                <p
                  className="text-lg font-bold mb-1"
                  style={{
                    color: insights.score >= 70 ? theme.income : insights.score >= 40 ? theme.warning : theme.expense,
                  }}
                >
                  {insights.scoreLabel}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>{insights.summary}</p>
              </div>
            </div>
          </div>

          {/* Month Comparison */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={13} style={{ color: theme.textMuted }} />
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Month Comparison</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: theme.text }}>{insights.monthComparison}</p>
          </div>

          {/* Insight Cards */}
          <div className="space-y-3">
            {insights.insights?.map((item, i) => {
              const accentColor = getInsightColor(item.icon, theme);
              return (
                <div
                  key={i}
                  className="rounded-2xl p-4 transition-all"
                  style={{
                    backgroundColor: i % 2 === 0 ? theme.bgSecondary : theme.bg,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                    >
                      {getInsightIcon(item.icon)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold mb-1" style={{ color: theme.text }}>{item.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} style={{ color: theme.accent }} />
              <h3 className="text-sm font-semibold" style={{ color: theme.text }}>Action Tips</h3>
            </div>
            <div className="space-y-2.5">
              {insights.tips?.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: theme.accent, color: theme.bg }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => { setLoaded(false); setInsights(null); }}
            className="w-full text-sm py-3 rounded-2xl transition-all flex items-center justify-center gap-2 hover:opacity-80"
            style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}`, color: theme.textMuted }}
          >
            <RefreshCw size={14} />
            Refresh Insights
          </button>
        </div>
      )}
    </div>
  );
}
