import { showNotification } from "./notificationWeb";

// Helper to lazy load Capacitor plugins dynamically to prevent server-side import exceptions in Next.js
const getLocalNotifications = async () => {
  if (typeof window === "undefined") return null;
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return null;

    const { LocalNotifications } = await import("@capacitor/local-notifications");
    return LocalNotifications;
  } catch (e) {
    console.warn("Capacitor core or local-notifications not available", e);
    return null;
  }
};

export const notificationService = {
  // Request notification permissions and register Action Types
  async init() {
    const LocalNotifications = await getLocalNotifications();
    console.log("LocalNotifications:", LocalNotifications);
    if (!LocalNotifications) return;
    if (!LocalNotifications) {
      console.log("LocalNotifications is NULL");
      return;
    }
    try {
      // 1. Request Permission
      const permission = await LocalNotifications.requestPermissions();
      console.log("Permission:", permission);
      if (permission.display !== "granted") {
        console.warn("Notification permissions not granted");
        return;
      }
      console.log("Permission Granted");

      // 2. Register Action Types (Taken, Snooze, Skip)
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: "MED_REMINDER_ACTIONS",
            actions: [
              {
                id: "taken",
                title: "✅ Taken",
                foreground: false
              },
              {
                id: "snooze",
                title: "⏰ Snooze",
                foreground: false
              },
              {
                id: "skip",
                title: "❌ Skip",
                foreground: false
              }
            ]
          }
        ]
      });
      console.log("Initialized");
      console.log("Capacitor Local Notifications initialized successfully");
    } catch (e) {
      console.error("Failed to initialize Capacitor Local Notifications:", e);
    }
  },
  // Schedule a high-priority native notification
  async scheduleMedicineReminder(med: {
    id: string;
    name: string;
    dosage: string;
    recipientName?: string;
    timeLabel?: string;
  }, delaySeconds = 1) {
    const LocalNotifications = await getLocalNotifications();
    if (!LocalNotifications) {
      console.log("[Web Simulator Fallback] Scheduled notification for:", med.name);
      return;
    }

    try {
      const recipient = med.recipientName || "Myself";
      const scheduledTime = med.timeLabel || "8:00 AM";

      await LocalNotifications.schedule({
        notifications: [
          {
            title: "💊 Time to Take Your Medicine",
            body: `${med.name} ${med.dosage}\nTake 1 tablet now.\nFor: ${recipient}\nScheduled: ${scheduledTime}\nStay consistent. Every dose matters.`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + delaySeconds * 1000) },
            sound: "beep.wav",
            actionTypeId: "MED_REMINDER_ACTIONS",
            extra: {
              medicineId: med.id,
              recipient,
              scheduledTime
            }
          }
        ]
      });
      console.log(`Native notification scheduled for ${med.name} in ${delaySeconds} seconds`);
    } catch (e) {
      console.error("Failed to schedule local notification:", e);
    }
  },

  // Set up listeners for the action buttons
  async setupActionListeners(callbacks: {
    onTaken: (medicineId: string) => void;
    onSnooze: (medicineId: string, minutes: number) => void;
    onSkip: (medicineId: string) => void;
  }) {
    const LocalNotifications = await getLocalNotifications();

    if (!LocalNotifications) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        console.log("Web notification permission:", permission);
      }
      return;
    }

    LocalNotifications.addListener("localNotificationActionPerformed", (action: any) => {
      const extra = action.notification.extra;
      if (!extra || !extra.medicineId) return;

      const medicineId = extra.medicineId;

      if (action.actionId === "taken") {
        callbacks.onTaken(medicineId);
      } else if (action.actionId === "snooze") {
        callbacks.onSnooze(medicineId, 10);
      } else if (action.actionId === "skip") {
        callbacks.onSkip(medicineId);
      }
    });
  }
};
