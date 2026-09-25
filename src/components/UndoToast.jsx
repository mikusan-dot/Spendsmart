import { useTheme } from "../context/ThemeContext";

export default function UndoToast({ visible, message, onUndo }) {
  const { theme } = useTheme();
  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-slideUp">
      <div
        className="rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl backdrop-blur-xl"
        style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <span className="text-sm truncate mr-3" style={{ color: theme.textMuted }}>{message}</span>
        <button
          onClick={onUndo}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg press whitespace-nowrap"
          style={{ backgroundColor: theme.accent, color: theme.bg }}
        >
          Undo
        </button>
      </div>
    </div>
  );
}
