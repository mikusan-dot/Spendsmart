import { useState, useCallback, useEffect } from "react";
import { useTheme } from "./context/ThemeContext";
import { haptics } from "./utils/haptics";
import { audio } from "./utils/audio";
import {
  isReminderEnabled, updateLastActivity,
  requestNotificationPermission, scheduleInactivityReminder,
} from "./utils/notifications";
import useGesture from "./hooks/useGesture";
import AppLayout from "./components/AppLayout";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import AddExpense from "./components/AddExpense";
import ExpenseList from "./components/ExpenseList";
import Charts from "./components/Charts";
import Budget from "./components/Budget";
import Profile from "./components/Profile";
import AIInsights from "./components/AIInsights";
import XPPopup from "./components/XPPopup";
import Confetti from "./components/Confetti";
import PageTransition from "./components/PageTransition";
import BottomSheet from "./components/BottomSheet";
import OfflineIndicator from "./components/OfflineIndicator";
import useUser from "./hooks/useUser";
import useGamification from "./hooks/useGamification";
import useProfile from "./hooks/useProfile";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState("expense");
  const [confetti, setConfetti] = useState(false);

  const onAchievement = useCallback(() => setConfetti(true), []);
  const onConfettiDone = useCallback(() => setConfetti(false), []);
  const userBase = useUser();
  const [uid, setUid] = useState(null);
  const { theme } = useTheme();
  const profile = useProfile();
  console.log("App.jsx render - pendingAvatar:", profile.pendingAvatar, "previewAvatarSrc:", profile.previewAvatarSrc);

  const user = uid
    ? { uid, displayName: profile.savedDisplayName || "User" }
    : userBase.uid
    ? { uid: userBase.uid, displayName: profile.savedDisplayName || "User" }
    : null;

  const {
    gameData, level, progress,
    addXP, updateStats,
    newAchievements, xpPopup,
  } = useGamification(user?.uid);

  // Inactivity notification setup
  useEffect(() => {
    if (!user?.uid) return;
    updateLastActivity();
    if (isReminderEnabled()) {
      requestNotificationPermission();
      scheduleInactivityReminder(24);
    }
  }, [user?.uid]);

  const tabIds = ["home", "transactions", "budget", "analytics", "profile"];
  const gestureRef = useGesture({
    onSwipeLeft: () => {
      const idx = tabIds.indexOf(activeTab);
      if (idx < tabIds.length - 1) setActiveTab(tabIds[idx + 1]);
    },
    onSwipeRight: () => {
      const idx = tabIds.indexOf(activeTab);
      if (idx > 0) setActiveTab(tabIds[idx - 1]);
    },
    enabled: !showAdd,
  });

  if (!user) return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold"
          style={{ backgroundColor: theme.accent + "20", color: theme.accent }}
        >
          $
        </div>
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.accent }}
        />
      </div>
    </div>
  );

  return (
    <div ref={gestureRef}>
      <OfflineIndicator />
      <XPPopup xpPopup={xpPopup} newAchievements={newAchievements} onAchievement={onAchievement} />
      <Confetti active={confetti} onDone={onConfettiDone} />

      <AppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddPress={() => { setAddType("expense"); setShowAdd(true); }}
        user={user}
        avatar={profile.savedAvatarSrc}
        userInitials={profile.initials}
        userLevel={level}
      >
        <PageTransition tabKey={activeTab}>
          {activeTab === "home" && (
            <>
              <Navbar activeTab={activeTab} />
              <Dashboard
                user={user}
                onAddPress={() => { setAddType("expense"); setShowAdd(true); }}
                onTabChange={setActiveTab}
              />
            </>
          )}
          {activeTab === "transactions" && (
            <>
              <Navbar activeTab={activeTab} />
              <ExpenseList user={user} />
            </>
          )}
          {activeTab === "budget" && (
            <>
              <Navbar activeTab={activeTab} />
              <Budget user={user} />
            </>
          )}
          {activeTab === "analytics" && (
            <>
              <Navbar activeTab={activeTab} />
              <Charts user={user} />
              <div className="mt-6">
                <AIInsights
                  user={user}
                  onUse={() => {
                    addXP(15, "AI Insights");
                    updateStats({ aiUsed: (gameData?.stats?.aiUsed || 0) + 1 });
                  }}
                />
              </div>
            </>
          )}
          {activeTab === "profile" && (
            <Profile
              user={user}
              gameData={gameData}
              level={level}
              progress={progress}
              updateStats={updateStats}
              onSync={(newUid) => setUid(newUid)}
              savedAvatarSrc={profile.savedAvatarSrc}
              savedDisplayName={profile.savedDisplayName}
              previewAvatarSrc={profile.previewAvatarSrc}
              isPending={profile.isPending}
              pendingAvatar={profile.pendingAvatar}
              editing={profile.editing}
              selectPendingPreset={profile.selectPendingPreset}
              uploadPendingCustom={profile.uploadPendingCustom}
              setPendingName={profile.setPendingName}
              saveProfile={profile.saveProfile}
              cancelEditing={profile.cancelEditing}
              uploadError={profile.uploadError}
              userInitials={profile.initials}
            />
          )}
        </PageTransition>
      </AppLayout>

      {/* Add Transaction Bottom Sheet */}
      <BottomSheet
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title={addType === "income" ? "Add Income" : "Add Expense"}
      >
        <AddExpense
          user={user}
          defaultType={addType}
          onDone={() => {
            setShowAdd(false);
            setActiveTab("transactions");
            haptics.success();
            audio.success();
            addXP(10, "Transaction added!");
            updateStats({ totalExpenses: (gameData?.stats?.totalExpenses || 0) + 1 });
            updateLastActivity();
            if (isReminderEnabled()) scheduleInactivityReminder(24);
          }}
        />
      </BottomSheet>
    </div>
  );
}
