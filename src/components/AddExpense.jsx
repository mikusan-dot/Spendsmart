import { useState } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, serverTimestamp,
  doc, updateDoc
} from "firebase/firestore";
import { localDB } from "../utils/localStorage";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { CATEGORIES, INCOME_CATEGORIES } from "../utils/categories";
import { DollarSign, Tag, Check, Loader2 } from "lucide-react";

export default function AddExpense({ user, onDone, editData = null, defaultType = "expense" }) {
  const [type, setType] = useState(editData?.type || defaultType || "expense");
  const [title, setTitle] = useState(editData?.title || "");
  const [amount, setAmount] = useState(editData?.amount || "");
  const [category, setCategory] = useState(editData?.category || "Food");
  const [note, setNote] = useState(editData?.note || "");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { currency } = useCurrency();

  const categories = type === "income" ? INCOME_CATEGORIES : CATEGORIES;

  const handleSubmit = async () => {
    if (!title || !amount) return alert("Please fill in title and amount");
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return alert("Please enter a valid positive amount");
    setLoading(true);

    const data = {
      title,
      amount: parsedAmount,
      category,
      note,
      type,
    };

    try {
      if (editData) {
        localDB.updateExpense(user.uid, editData.id, data);
        await updateDoc(doc(db, "expenses", editData.id), data);
      } else {
        const tempId = `local_${Date.now()}`;
        const localExpense = {
          ...data,
          id: tempId,
          uid: user.uid,
          createdAt: { toDate: () => new Date() },
          _local: true,
        };
        localDB.addExpense(user.uid, localExpense);

        try {
          const docRef = await addDoc(collection(db, "expenses"), {
            ...data,
            uid: user.uid,
            createdAt: serverTimestamp(),
          });
          const expenses = localDB.getExpenses(user.uid);
          const updated = expenses.map(e =>
            e.id === tempId ? { ...e, id: docRef.id, _local: false } : e
          );
          localDB.saveExpenses(user.uid, updated);
        } catch {
          console.log("Saved locally — will sync when online");
        }
      }
      onDone();
    } catch (err) {
      console.error(err);
      onDone();
    }
    setLoading(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="space-y-4 fade-in">
      <form
        onSubmit={handleFormSubmit}
        className="rounded-2xl p-5 space-y-4"
        style={{
          backgroundColor: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Type Toggle */}
        <div>
          <label className="text-xs mb-2.5 block font-medium" style={{ color: theme.textMuted }}>
            Type
          </label>
          <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: theme.bgTertiary }}>
            {[
              { value: "expense", label: "Expense" },
              { value: "income", label: "Income" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setType(opt.value);
                  setCategory(opt.value === "expense" ? CATEGORIES[0] : INCOME_CATEGORIES[0]);
                }}
                className="flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: type === opt.value ? theme.accent : "transparent",
                  color: type === opt.value ? "white" : theme.textMuted,
                  boxShadow: type === opt.value ? `0 2px 8px ${theme.accent}30` : "none",
                }}
              >
                <DollarSign size={14} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs mb-1.5 block font-medium" style={{ color: theme.textMuted }}>
            Title
          </label>
          <div className="relative">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
            <input
              className="w-full rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition-all duration-200"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = theme.border}
              placeholder="e.g. Lunch, Uber, Netflix..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs mb-1.5 block font-medium" style={{ color: theme.textMuted }}>
            Amount ({currency.symbol})
          </label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
            <input
              type="number"
              min="0"
              className="w-full rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition-all duration-200 tabular-nums"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = theme.border}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs mb-2.5 block font-medium" style={{ color: theme.textMuted }}>
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
                style={{
                  backgroundColor: category === cat ? theme.accent + "20" : "transparent",
                  color: category === cat ? theme.accent : theme.textMuted,
                  border: `1px solid ${category === cat ? theme.accent : theme.border}`,
                }}
              >
                <Tag size={12} />
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="text-xs mb-1.5 block font-medium" style={{ color: theme.textMuted }}>
            Note (optional)
          </label>
          <textarea
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200 resize-none"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
            onFocus={(e) => e.target.style.borderColor = theme.accent}
            onBlur={(e) => e.target.style.borderColor = theme.border}
            rows={2}
            maxLength={500}
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full font-semibold py-3.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            backgroundColor: theme.accent,
            color: "white",
            boxShadow: `0 4px 14px ${theme.accent}30`,
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {editData ? <Check size={16} /> : <DollarSign size={16} />}
              {editData
                ? `Update ${type === "income" ? "Income" : "Expense"}`
                : `Add ${type === "income" ? "Income" : "Expense"}`}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
