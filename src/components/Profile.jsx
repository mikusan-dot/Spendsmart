import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useTheme, themes } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { setSoundEnabled, isSoundEnabled } from "../utils/audio";
import { setHapticsEnabled, isHapticsEnabled } from "../utils/haptics";
import {
  isReminderEnabled, setReminderEnabled,
  requestNotificationPermission, scheduleInactivityReminder, cancelReminder,
} from "../utils/notifications";

const NOTIFICATIONS_KEY = "ss_notifications_enabled";

const isNotificationsEnabled = () => {
  try {
    const val = localStorage.getItem(NOTIFICATIONS_KEY);
    return val === null ? true : val === "true";
  } catch {
    return true;
  }
};

const setNotificationsEnabled = (enabled) => {
  localStorage.setItem(NOTIFICATIONS_KEY, enabled.toString());
};
import { ACHIEVEMENTS, LEVELS } from "../utils/gamification";
import { Settings, Cloud, FileDown, Trophy, Flame, Shield, ChevronDown, Bell, Palette, Volume2, Vibrate, Copy, Check, RotateCcw, Info, Star, Camera, X, Pencil } from "lucide-react";
import { AVATAR_PACK } from "../utils/avatarPack";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

function AccordionItem({ icon: Icon, label, desc, isActive, onToggle, theme, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: isActive ? theme.accent + "06" : theme.bgSecondary,
        border: `1px solid ${isActive ? theme.accent + "25" : theme.border}`,
        borderLeftWidth: isActive ? "3px" : "1px",
        borderLeftColor: isActive ? theme.accent : theme.border,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isActive ? theme.accent + "18" : theme.bgTertiary }}
        >
          <Icon size={18} style={{ color: isActive ? theme.accent : theme.textMuted }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: theme.text }}>{label}</p>
          <p className="text-xs" style={{ color: theme.textMuted }}>{desc}</p>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: theme.textMuted,
            transform: isActive ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            flexShrink: 0,
          }}
        />
      </button>
      {isActive && (
        <div className="px-4 pb-4 fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

function Toggle({ label, desc, enabled, onToggle, icon: Icon }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent + "12" }}>
            <Icon size={14} style={{ color: theme.accent }} />
          </div>
        )}
        <div>
          <p className="text-sm font-medium" style={{ color: theme.text }}>{label}</p>
          {desc && <p className="text-xs" style={{ color: theme.textMuted }}>{desc}</p>}
        </div>
      </div>
      <button
        onClick={onToggle}
        className="w-11 h-6 rounded-full p-0.5 transition-all duration-300 flex-shrink-0"
        style={{
          backgroundColor: enabled ? theme.accent : theme.bgTertiary,
          border: `1px solid ${enabled ? theme.accent : theme.border}`,
        }}
      >
        <div
          className="w-[18px] h-[18px] rounded-full shadow-sm transition-all duration-300"
          style={{
            backgroundColor: "white",
            transform: enabled ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </button>
    </div>
  );
}

function DataRow({ label, value, accent }) {
  const { theme } = useTheme();
  return (
    <div className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid ${theme.border}` }}>
      <span className="text-xs" style={{ color: theme.textMuted }}>{label}</span>
      <span className="text-xs font-medium" style={{ color: accent || theme.text }}>{value}</span>
    </div>
  );
}

export default function Profile({ user, gameData, level, progress, updateStats, onSync, savedAvatarSrc, savedDisplayName, previewAvatarSrc, isPending, pendingAvatar, editing, selectPendingPreset, uploadPendingCustom, setPendingName, saveProfile, cancelEditing, uploadError, userInitials }) {
  console.log("Profile render - pendingAvatar:", pendingAvatar, "previewAvatarSrc:", previewAvatarSrc);
  const { theme, themeName, setThemeName } = useTheme();
  const { currency, currencyCode } = useCurrency();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [hapticsOn, setHapticsOn] = useState(isHapticsEnabled());
  const [reminderOn, setReminderOn] = useState(isReminderEnabled());
  const [notificationsOn, setNotificationsOn] = useState(isNotificationsEnabled());
  const [copied, setCopied] = useState(false);
  const [syncCode, setSyncCode] = useState("");
  const [showSyncInput, setShowSyncInput] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [pdfMonth, setPdfMonth] = useState(new Date().getMonth());
  const [pdfYear, setPdfYear] = useState(new Date().getFullYear());
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const fileInputRef = useRef(null);

  function handlePresetAvatarClick(avatar) {
    console.log("PRESET AVATAR CLICKED:", avatar.id, "avatar object:", avatar);
    selectPendingPreset(avatar.id);
  }

  function handleAvatarFileChange(e) {
    const file = e.target.files?.[0];
    console.log("FILE SELECTED:", file);
    if (file) uploadPendingCustom(file);
    e.target.value = "";
  }

  useEffect(() => {
    const syncStats = async () => {
      try {
        const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
        const snap = await getDocs(q);
        const expenses = snap.docs.map(d => d.data());
        const categories = new Set(expenses.map(e => e.category));
        await updateStats({
          totalExpenses: expenses.length,
          categoriesUsed: categories.size,
        });
      } catch (err) {
        console.error(err);
      }
    };
    if (gameData) syncStats();
  }, [user.uid, gameData, updateStats]);

  const copyUID = () => {
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = () => {
    if (!syncCode.trim()) return;
    if (!syncCode.startsWith("user_")) return alert("Invalid sync code format");
    if (confirm(`Sync to device code: ${syncCode}?`)) {
      localStorage.setItem("spendsmart_uid", syncCode.trim());
      onSync(syncCode.trim());
      setShowSyncInput(false);
      setSyncCode("");
    }
  };

  const handleReminderToggle = async () => {
    const next = !reminderOn;
    setReminderOn(next);
    setReminderEnabled(next);
    if (next) {
      await requestNotificationPermission();
      await scheduleInactivityReminder(24);
    } else {
      await cancelReminder();
    }
  };

  const generatePDF = async () => {
    setPdfLoading(true);
    setPdfDone(false);
    try {
      const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = all.sort((a, b) => {
        const da = a.createdAt?.toDate?.() || new Date(0);
        const db2 = b.createdAt?.toDate?.() || new Date(0);
        return db2 - da;
      });
      const filtered = sorted.filter(e => {
        const d = e.createdAt?.toDate?.();
        return d && d.getMonth() === pdfMonth && d.getFullYear() === pdfYear;
      });

      const doc = new jsPDF();
      const pdfSymbol = currency.symbol.length <= 3 && /^[\x20-\x7E]+$/.test(currency.symbol) ? currency.symbol : currencyCode + " ";

      doc.setFillColor(17, 23, 19);
      doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(245, 247, 245);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SpendSmart", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`${MONTHS[pdfMonth]} ${pdfYear} Report`, 14, 25);

      const expensesList = filtered.filter(e => (e.type || "expense") === "expense");
      const incomeList = filtered.filter(e => e.type === "income");
      const totalExpense = expensesList.reduce((s, e) => s + Number(e.amount), 0);
      const totalIncome = incomeList.reduce((s, e) => s + Number(e.amount), 0);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, 48);
      doc.setFillColor(245, 245, 255);
      doc.roundedRect(14, 52, 55, 25, 3, 3, "F");
      doc.roundedRect(78, 52, 55, 25, 3, 3, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Spent", 22, 60);
      doc.text("Earned", 86, 60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(239, 68, 68);
      doc.text(`${pdfSymbol}${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 22, 71);
      doc.setTextColor(16, 185, 129);
      doc.text(`${pdfSymbol}${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 86, 71);

      const rows = filtered.map(e => {
        const isIncome = e.type === "income";
        return [
          e.createdAt?.toDate?.().toLocaleDateString() || "-",
          e.title, e.category, isIncome ? "Income" : "Expense",
          `${isIncome ? "+" : "-"}${pdfSymbol}${Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        ];
      });

      autoTable(doc, {
        startY: 90,
        head: [["Date", "Title", "Category", "Type", "Amount"]],
        body: rows.length > 0 ? rows : [["No transactions", "-", "-", "-", "-"]],
        theme: "striped",
        headStyles: { fillColor: [17, 23, 19], textColor: 245, fontStyle: "bold" },
        styles: { fontSize: 9 },
        columnStyles: { 4: { halign: "right" } }
      });

      const fileName = `SpendSmart_${MONTHS[pdfMonth]}_${pdfYear}.pdf`;
      const isMobileWeb = /Mobi|Android/i.test(navigator.userAgent) && !Capacitor.isNativePlatform();

      if (Capacitor.isNativePlatform()) {
        const arrayBuffer = doc.output("arraybuffer");
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i += 8192) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
        }
        await Filesystem.writeFile({ path: fileName, data: btoa(binary), directory: Directory.Cache, encoding: "base64" });
        const uri = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
        await Share.share({ title: "Open PDF", files: [uri.uri] });
      } else if (isMobileWeb && navigator.share && navigator.canShare) {
        // Mobile web: use Share API with proper File object
        const blob = doc.output("blob");
        console.log("PDF blob size:", blob.size, "bytes, type:", blob.type);
        const file = new File([blob], fileName, { type: "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "SpendSmart PDF Report", files: [file] });
        } else {
          // Fallback: trigger download via blob URL
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        // Desktop web: standard save
        doc.save(fileName);
      }
      setPdfDone(true);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF");
    }
    setPdfLoading(false);
  };

  const xp = gameData?.xp || 0;
  const streak = gameData?.streak || 0;
  const achievements = gameData?.achievements || [];

  return (
    <div className="space-y-4 fade-in max-w-[860px] mx-auto">
      {/* Profile Header */}
      <div
        className="rounded-2xl p-7 md:p-8"
        style={{
          background: theme.heroGradient,
          border: `1px solid ${theme.border}`,
          boxShadow: `0 4px 24px ${theme.accent}15`,
        }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Avatar — clickable, opens modal */}
          <button
            onClick={() => setShowAvatarModal(true)}
            className="relative mb-5 group cursor-pointer"
            title="Change profile photo"
            style={{ zIndex: 1 }}
          >
            <div
              className="w-[84px] h-[84px] md:w-[96px] md:h-[96px] rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-200"
              style={{
                backgroundColor: theme.bg + "30",
                border: `2px solid ${theme.accent}`,
                boxShadow: `0 0 20px ${theme.accent}35`,
              }}
            >
              {previewAvatarSrc ? (
                <img src={previewAvatarSrc} alt="" className="w-full h-full rounded-2xl object-cover" onLoad={() => console.log("Preview img loaded:", previewAvatarSrc)} onError={() => console.log("Preview img ERROR:", previewAvatarSrc)} />
              ) : (
                <span className="text-3xl font-bold" style={{ color: "white" }}>
                  {userInitials || "A"}
                </span>
              )}
            </div>
            {/* Camera overlay on hover */}
            <div
              className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            >
              <Camera size={22} style={{ color: "white" }} />
            </div>
            {/* Edit badge */}
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center pointer-events-none"
              style={{ backgroundColor: theme.accent, boxShadow: `0 2px 8px ${theme.accent}40` }}
            >
              <Camera size={11} style={{ color: "white" }} />
            </div>
          </button>

          {/* Name — with edit indicator */}
          {editingName ? (
            <div className="flex flex-col items-center gap-2 mb-3 w-full max-w-[280px]">
              <input
                type="text"
                className="w-full rounded-xl px-4 py-2.5 text-2xl font-bold focus:outline-none text-center"
                style={{
                  backgroundColor: theme.bg + "50",
                  color: "white",
                  border: `1px solid ${theme.accent}60`,
                }}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPendingName(nameInput);
                    setEditingName(false);
                  }
                  if (e.key === "Escape") {
                    setEditingName(false);
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium transition"
                  style={{ backgroundColor: theme.bgTertiary, color: theme.textMuted, border: `1px solid ${theme.border}` }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingName(nameInput);
                    setEditingName(false);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold transition"
                  style={{ backgroundColor: theme.accent, color: theme.bg }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setNameInput(savedDisplayName || ""); setEditingName(true); }}
              className="group/name flex items-center gap-2 mb-2 hover:opacity-80 transition"
              title="Edit display name"
            >
              <span className="text-2xl font-bold" style={{ color: "white" }}>
                {savedDisplayName || "Account"}
              </span>
              <Pencil
                size={14}
                className="opacity-0 group-hover/name:opacity-100 transition-opacity"
                style={{ color: theme.accent }}
              />
            </button>
          )}

          {/* Level + XP */}
          <div className="flex items-center gap-2 mb-1">
            {level && (
              <span className="text-sm font-medium" style={{ color: theme.accent }}>
                {level.icon} {level.name}
              </span>
            )}
            {level && <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>·</span>}
            {level && (
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                Level {level.level}
              </span>
            )}
          </div>
          <p className="text-sm font-medium tabular-nums" style={{ color: "rgba(255,255,255,0.5)" }}>
            {xp} XP
          </p>

          {/* Pending changes indicator + Save/Cancel */}
          {editing && (
            <div className="flex items-center gap-3 mt-4 fade-in">
              <button
                onClick={() => { cancelEditing(); setEditingName(false); }}
                className="px-5 py-2 rounded-xl text-sm font-medium transition"
                style={{ backgroundColor: theme.bgTertiary, color: theme.textMuted, border: `1px solid ${theme.border}` }}
              >
                Cancel
              </button>
              <button
                onClick={() => { saveProfile(); setEditingName(false); }}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition"
                style={{ backgroundColor: theme.accent, color: theme.bg, boxShadow: `0 4px 14px ${theme.accent}30` }}
              >
                Save changes
              </button>
            </div>
          )}
        </div>

        {/* Subtle progress bar */}
        {level && (
          <div className="mt-5">
            <div className="w-full rounded-full h-1" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
              <div
                className="h-1 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "rgba(255,255,255,0.4)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarModal && createPortal((
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAvatarModal(false);
          }}
        >
          <div
            className="w-full max-w-[460px] rounded-[20px] p-6 fade-in relative z-10"
            style={{
              backgroundColor: "#101A15",
              border: `1px solid rgba(103,232,165,0.12)`,
              boxShadow: "0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
              zIndex: 51,
              pointerEvents: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-lg font-bold" style={{ color: "#F5F7F5" }}>Change profile photo</p>
                <p className="text-sm mt-0.5" style={{ color: "#9AA79F" }}>Choose an avatar</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition"
                style={{ backgroundColor: "#142019", color: "#9AA79F", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Avatar grid */}
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_PACK.map((avatar) => {
                const isSelected = pendingAvatar?.type === "preset" && pendingAvatar?.id === avatar.id;
                console.log("Avatar grid item:", avatar.id, "isSelected:", isSelected, "pendingAvatar:", pendingAvatar);
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handlePresetAvatarClick(avatar)}
                    className="relative rounded-2xl overflow-hidden transition-all duration-200 hover:scale-105 cursor-pointer"
                    style={{
                      aspectRatio: "1",
                      border: `2.5px solid ${isSelected ? "#67E8A5" : "transparent"}`,
                      boxShadow: isSelected ? `0 0 16px rgba(103,232,165,0.25)` : "none",
                      zIndex: 10,
                      pointerEvents: "auto",
                      backgroundColor: "transparent",
                    }}
                  >
                    <img
                      src={avatar.src}
                      alt={avatar.name}
                      draggable="false"
                      className="w-full h-full object-cover"
                      style={{ pointerEvents: "none" }}
                    />
                    {isSelected && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ backgroundColor: "rgba(103,232,165,0.25)" }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#67E8A5", boxShadow: "0 2px 8px rgba(103,232,165,0.4)" }}
                        >
                          <Check size={12} style={{ color: "#07100D" }} />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
              <span className="text-xs font-medium" style={{ color: "#9AA79F" }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* Upload button — ref-based file input */}
            <button
              type="button"
              onClick={() => {
                console.log("UPLOAD BUTTON CLICKED");
                fileInputRef.current?.click();
              }}
              className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
              style={{
                backgroundColor: "#142019",
                color: "#F5F7F5",
                border: "1px solid rgba(255,255,255,0.08)",
                zIndex: 10,
                pointerEvents: "auto",
              }}
            >
              <Camera size={16} />
              Upload your photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={handleAvatarFileChange}
            />

            {/* Upload error */}
            {uploadError && (
              <p className="text-xs mt-3 text-center" style={{ color: "#ef4444" }}>
                {uploadError}
              </p>
            )}

            {/* Modal footer — Cancel / Save */}
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  cancelEditing();
                  setShowAvatarModal(false);
                }}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
                style={{ backgroundColor: "#142019", color: "#9AA79F", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  saveProfile();
                  setShowAvatarModal(false);
                }}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200"
                style={{ backgroundColor: "#67E8A5", color: "#07100D", boxShadow: "0 4px 14px rgba(103,232,165,0.3)" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {/* Menu Sections — Accordion */}
      <AccordionItem
        id="progress"
        icon={Trophy}
        label="Finance Progress"
        desc="Levels, XP & achievements"
        isActive={activeSection === "progress"}
        onToggle={() => setActiveSection(activeSection === "progress" ? null : "progress")}
        theme={theme}
      >
        {level && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Flame, label: "Streak", value: streak },
                { icon: Shield, label: "Badges", value: achievements.length },
                { icon: Trophy, label: "Tracked", value: gameData?.stats?.totalExpenses || 0 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3.5 rounded-xl"
                  style={{ backgroundColor: theme.bgTertiary, border: `1px solid ${theme.border}` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: theme.accent + "15" }}
                  >
                    <stat.icon size={16} style={{ color: theme.accent }} />
                  </div>
                  <p className="text-lg font-bold tabular-nums" style={{ color: theme.text }}>{stat.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: theme.accent + "15" }}>
                  <Star size={12} style={{ color: theme.accent }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: theme.text }}>Level Roadmap</p>
              </div>
              <div className="relative">
                {LEVELS.map((l, idx) => {
                  const isCurrent = l.level === level.level;
                  const isUnlocked = xp >= l.minXP;
                  const isLast = idx === LEVELS.length - 1;
                  return (
                    <div key={l.level} className="flex gap-3 relative">
                      <div className="flex flex-col items-center w-6 flex-shrink-0">
                        <div
                          className="w-3 h-3 rounded-full border-2 flex-shrink-0 z-10"
                          style={{
                            borderColor: isCurrent ? theme.accent : isUnlocked ? theme.accent : theme.bgTertiary,
                            backgroundColor: isCurrent ? theme.accent : isUnlocked ? theme.accent : theme.bgSecondary,
                            boxShadow: isCurrent ? `0 0 12px ${theme.accent}60` : "none",
                          }}
                        />
                        {!isLast && (
                          <div
                            className="w-0.5 flex-1 min-h-[24px]"
                            style={{
                              backgroundColor: isUnlocked && (idx + 1 < LEVELS.length && xp >= LEVELS[idx + 1].minXP)
                                ? theme.accent
                                : theme.border,
                            }}
                          />
                        )}
                      </div>
                      <div
                        className="flex-1 pb-4 flex items-center gap-3 rounded-xl p-2.5 -ml-0.5"
                        style={{
                          backgroundColor: isCurrent ? theme.accent + "12" : "transparent",
                          border: isCurrent ? `1px solid ${theme.accent}30` : "1px solid transparent",
                          opacity: isUnlocked ? 1 : 0.4,
                        }}
                      >
                        <span className="text-lg flex-shrink-0">{l.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: isCurrent ? theme.accent : theme.text }}>{l.name}</p>
                          <p className="text-xs tabular-nums" style={{ color: theme.textMuted }}>
                            {l.minXP} – {l.maxXP === 999999 ? "∞" : l.maxXP} XP
                          </p>
                        </div>
                        {isCurrent && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                            style={{ backgroundColor: theme.accent + "20", color: theme.accent }}
                          >
                            Current
                          </span>
                        )}
                        {isUnlocked && !isCurrent && (
                          <Check size={14} style={{ color: theme.accent }} className="flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: theme.accent + "15" }}>
                  <Shield size={12} style={{ color: theme.accent }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: theme.text }}>Achievements</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ACHIEVEMENTS.map((a) => {
                  const unlocked = achievements.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl transition-all"
                      style={{
                        backgroundColor: unlocked ? theme.accent + "08" : theme.bgTertiary,
                        border: `1px solid ${unlocked ? theme.accent + "25" : theme.border}`,
                        opacity: unlocked ? 1 : 0.45,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">{a.icon}</span>
                        {unlocked && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: theme.accent + "20", color: theme.accent }}
                          >
                            +{a.xp}xp
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold" style={{ color: theme.text }}>{a.name}</p>
                      <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: theme.textMuted }}>{a.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </AccordionItem>

      <AccordionItem
        id="settings"
        icon={Settings}
        label="App Settings"
        desc="Sound, haptics, notifications, theme and reminders"
        isActive={activeSection === "settings"}
        onToggle={() => setActiveSection(activeSection === "settings" ? null : "settings")}
        theme={theme}
      >
        <Toggle label="Sound Effects" desc="Play sounds on actions" enabled={soundOn}
          icon={Volume2} onToggle={() => { setSoundEnabled(!soundOn); setSoundOn(!soundOn); }} />
        <div style={{ borderBottom: `1px solid ${theme.border}` }} />
        <Toggle label="Haptic Feedback" desc="Vibration on interactions" enabled={hapticsOn}
          icon={Vibrate} onToggle={() => { setHapticsEnabled(!hapticsOn); setHapticsOn(!hapticsOn); }} />
        <div style={{ borderBottom: `1px solid ${theme.border}` }} />
        <Toggle label="Notifications" desc="Allow app notifications" enabled={notificationsOn}
          icon={Bell} onToggle={async () => {
            const next = !notificationsOn;
            setNotificationsOn(next);
            setNotificationsEnabled(next);
            if (next) {
              await requestNotificationPermission();
            }
          }} />
        <div style={{ borderBottom: `1px solid ${theme.border}` }} />
        <div className="py-2.5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent + "12" }}>
              <Palette size={14} style={{ color: theme.accent }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: theme.text }}>Theme</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>Choose appearance</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(themes).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setThemeName(key)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all press flex items-center gap-1.5"
                style={{
                  backgroundColor: themeName === key ? theme.accent : theme.bgTertiary,
                  color: themeName === key ? theme.bg : theme.textMuted,
                  border: `1px solid ${themeName === key ? theme.accent : theme.border}`,
                }}
              >
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ borderBottom: `1px solid ${theme.border}` }} />
        <Toggle label="Inactivity Reminder" desc="Remind after 24h of no activity" enabled={reminderOn}
          icon={Bell} onToggle={handleReminderToggle} />
      </AccordionItem>

      <AccordionItem
        id="sync"
        icon={Cloud}
        label="Cloud Sync"
        desc="Device-to-device sync"
        isActive={activeSection === "sync"}
        onToggle={() => setActiveSection(activeSection === "sync" ? null : "sync")}
        theme={theme}
      >
        <div>
          <p className="text-xs mb-2 font-medium" style={{ color: theme.textMuted }}>Your Device Code</p>
          <div className="flex gap-2">
            <div
              className="flex-1 rounded-xl px-3.5 py-2.5"
              style={{ backgroundColor: theme.bgTertiary, border: `1px solid ${theme.border}` }}
            >
              <p className="text-xs font-mono truncate tabular-nums" style={{ color: theme.accent }}>{user.uid}</p>
            </div>
            <button
              onClick={copyUID}
              className="px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                backgroundColor: copied ? theme.accent : theme.accent + "15",
                color: copied ? "white" : theme.accent,
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowSyncInput(!showSyncInput)}
          className="w-full rounded-xl text-sm py-2.5 transition-all duration-200 font-medium"
          style={{ backgroundColor: theme.bgTertiary, color: theme.textMuted, border: `1px solid ${theme.border}` }}
        >
          {showSyncInput ? "Cancel" : "Sync from another device"}
        </button>
        {showSyncInput && (
          <div className="space-y-2 fade-in">
            <input
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none font-mono transition-all duration-200"
              style={{
                backgroundColor: theme.bgTertiary,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = theme.border}
              placeholder="Paste sync code..."
              value={syncCode}
              onChange={(e) => setSyncCode(e.target.value)}
            />
            <button
              onClick={handleSync}
              className="w-full font-semibold py-2.5 rounded-xl text-sm transition-all duration-200"
              style={{ backgroundColor: theme.accent, color: "white" }}
            >
              Apply Sync Code
            </button>
          </div>
        )}
        <button
          onClick={() => {
            if (confirm("Reset your sync code?")) {
              localStorage.removeItem("spendsmart_uid");
              window.location.reload();
            }
          }}
          className="w-full rounded-xl text-sm py-2.5 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          style={{ backgroundColor: "#ef444415", color: "#ef4444", border: "1px solid #ef444425" }}
        >
          <RotateCcw size={14} />
          Reset Sync Code
        </button>
      </AccordionItem>

      <AccordionItem
        id="export"
        icon={FileDown}
        label="Export PDF"
        desc="Download reports"
        isActive={activeSection === "export"}
        onToggle={() => setActiveSection(activeSection === "export" ? null : "export")}
        theme={theme}
      >
        <div>
          <label className="text-xs mb-1.5 block font-medium" style={{ color: theme.textMuted }}>Month</label>
          <select
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all duration-200"
            style={{ backgroundColor: theme.bgTertiary, color: theme.text, border: `1px solid ${theme.border}` }}
            value={pdfMonth}
            onChange={(e) => setPdfMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i} style={{ backgroundColor: theme.bgSecondary }}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs mb-1.5 block font-medium" style={{ color: theme.textMuted }}>Year</label>
          <select
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all duration-200"
            style={{ backgroundColor: theme.bgTertiary, color: theme.text, border: `1px solid ${theme.border}` }}
            value={pdfYear}
            onChange={(e) => setPdfYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
              <option key={y} value={y} style={{ backgroundColor: theme.bgSecondary }}>{y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={generatePDF}
          disabled={pdfLoading}
          className="w-full font-semibold py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            backgroundColor: theme.accent,
            color: "white",
            boxShadow: `0 4px 14px ${theme.accent}30`,
          }}
        >
          {pdfLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown size={16} />
              Export PDF
            </>
          )}
        </button>
        {pdfDone && (
          <div
            className="text-xs text-center py-1.5 rounded-lg"
            style={{ backgroundColor: theme.accent + "15", color: theme.accent }}
          >
            PDF generated successfully
          </div>
        )}
      </AccordionItem>

      <AccordionItem
        id="about"
        icon={Info}
        label="About"
        desc="v2.0.0"
        isActive={activeSection === "about"}
        onToggle={() => setActiveSection(activeSection === "about" ? null : "about")}
        theme={theme}
      >
        <DataRow label="App Name" value="SpendSmart" />
        <DataRow label="Version" value="2.0.0" />
        <DataRow label="Database" value="Firebase Firestore" />
        <DataRow label="Sync" value="Real-time" accent={theme.accent} />
      </AccordionItem>
    </div>
  );
}
