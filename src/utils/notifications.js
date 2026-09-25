import { LocalNotifications } from "@capacitor/local-notifications";

const KEYS = {
  LAST_ACTIVITY: "ss_last_activity",
  REMINDER_ENABLED: "ss_reminders_enabled",
};

export const getLastActivity = () => {
  try {
    return localStorage.getItem(KEYS.LAST_ACTIVITY);
  } catch {
    return null;
  }
};

export const updateLastActivity = () => {
  localStorage.setItem(KEYS.LAST_ACTIVITY, Date.now().toString());
};

export const isReminderEnabled = () => {
  try {
    const val = localStorage.getItem(KEYS.REMINDER_ENABLED);
    return val === null ? true : val === "true";
  } catch {
    return true;
  }
};

export const setReminderEnabled = (enabled) => {
  localStorage.setItem(KEYS.REMINDER_ENABLED, enabled.toString());
};

export const requestNotificationPermission = async () => {
  try {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === "granted";
  } catch {
    return false;
  }
};

export const scheduleInactivityReminder = async (hours = 24) => {
  try {
    await cancelReminder();
    const granted = await requestNotificationPermission();
    if (!granted) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Don't forget to log your expenses!",
          body: "You haven't tracked anything in a while. Tap to add a transaction.",
          id: 9999,
          schedule: { in: { unit: "hour", quantity: hours } },
          extra: { type: "inactivity_reminder" },
          android: {
            channelId: "spendsmart-reminders",
            smallIcon: "ic_launcher",
            largeIcon: "ic_launcher",
          },
        },
      ],
    });
  } catch (err) {
    console.log("Notification scheduling failed:", err);
  }
};

export const cancelReminder = async () => {
  try {
    const pending = await LocalNotifications.getPending();
    const reminder = pending.notifications.find((n) => n.id === 9999);
    if (reminder) {
      await LocalNotifications.cancel({ notifications: [reminder] });
    }
  } catch {
    // ignore
  }
};
