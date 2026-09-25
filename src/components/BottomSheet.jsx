import { useEffect, useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { haptics } from "../utils/haptics";
import { X } from "lucide-react";

export default function BottomSheet({ isOpen, onClose, children, title }) {
  const { theme } = useTheme();
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(null);
  const sheetRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDragY(0);
      haptics.light();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleTouchStart = (e) => setStartY(e.touches[0].clientY);
  const handleTouchMove = (e) => {
    if (startY === null) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) setDragY(dy);
  };
  const handleTouchEnd = () => {
    if (dragY > 120) { haptics.medium(); onClose(); }
    else setDragY(0);
    setStartY(null);
  };
  const handleClose = () => { haptics.light(); onClose(); };

  if (!visible && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div
        ref={sheetRef}
        className="relative w-full max-w-md mx-auto rounded-t-3xl"
        style={{
          backgroundColor: theme.bgSecondary,
          borderTop: `1px solid ${theme.border}`,
          maxHeight: "92vh",
          overflowY: "auto",
          transform: isOpen ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: startY ? "none" : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTransitionEnd={() => { if (!isOpen) setVisible(false); }}
      >
        <div className="sticky top-0 pt-3 pb-2 flex flex-col items-center z-10" style={{ backgroundColor: theme.bgSecondary }}>
          <div className="w-10 h-1 rounded-full mb-3" style={{ backgroundColor: theme.border }} />
          {title && (
            <div className="flex items-center justify-between w-full px-5 pb-2">
              <h3 className="text-sm font-semibold" style={{ color: theme.text }}>{title}</h3>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center press"
                style={{ backgroundColor: theme.bgTertiary, color: theme.textMuted }}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}
