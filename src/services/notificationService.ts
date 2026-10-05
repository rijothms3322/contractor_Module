import { Reminder } from "@/lib/mockData";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

const { NativeSettings, AndroidSettings, IOSSettings } = await import(
  "capacitor-native-settings"
);

const NOTIFICATION_WINDOW_DAYS = 7;
const MAX_SCHEDULED_NOTIFICATIONS = 150;

export type NotificationPermissionStatus =
  | "granted"
  | "denied"
  | "prompt"
  | "prompt-with-rationale"
  | "unsupported";

const getLocalNotifications = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  return LocalNotifications;
};

/**
 * Create a deterministic notification ID.
 *
 * IMPORTANT:
 * Do not use Math.random() for reminder notifications.
 * We need the same reminder to always have the same notification ID
 * so that it can be cancelled/rescheduled.
 */
function getNotificationId(reminderId: string): number {
  let hash = 0;

  for (let i = 0; i < reminderId.length; i++) {
    hash = (hash << 5) - hash + reminderId.charCodeAt(i);
    hash |= 0;
  }

  // Keep it positive and inside a safe notification ID range.
  return Math.abs(hash % 2147483647);
}

export const notificationService = {
  async init() {
    const notifications = getLocalNotifications();

    if (!notifications) {
      console.log("[Notifications] Running on web");
      return;
    }

    try {
      if (Capacitor.getPlatform() === "android") {
        try {
          await notifications.createChannel({
            id: "medicine-reminders-v2",
            name: "Medicine Reminders",
            description: "Reminders to take your medicine",
            importance: 5,
            visibility: 1,
            sound: "notification.wav",
            vibration: true,
          });
          console.log("[Notifications] Channel created successfully");
        } catch (err) {
          console.error("[Notifications] Channel creation FAILED :", err);
        }

        try {
          const { exact_alarm } =
            await notifications.checkExactNotificationSetting();
          console.log("[Notifications] Exact alarm status:", exact_alarm);

          if (exact_alarm !== "granted") {
            const res = await notifications.changeExactNotificationSetting();
            console.log("[Notifications] Exact alarm change result:", res);
          }
        } catch (err) {
          console.warn("[Notifications] Exact alarm check failed:", err);
        }
      }

      await notifications.registerActionTypes({
        types: [
          {
            id: "MED_REMINDER_ACTIONS",
            actions: [
              { id: "taken", title: "✅ Taken", foreground: false },
              { id: "snooze", title: "⏰ Snooze", foreground: false },
              { id: "skip", title: "❌ Skip", foreground: false },
            ],
          },
        ],
      });

      console.log("[Notifications] Initialized successfully");
    } catch (error) {
      console.error("[Notifications] Initialization failed:", error);
    }
  },

  /**
   * Read current permission WITHOUT prompting.
   */
  async checkPermission(): Promise<NotificationPermissionStatus> {
    const notifications = getLocalNotifications();
    if (!notifications) return "unsupported";

    const status = await notifications.checkPermissions();
    return status.display as NotificationPermissionStatus;
  },

  /**
   * Request permission.
   *   - "granted"  → already allowed, nothing to do
   *   - "denied"   → permanently denied, caller must go to Settings
   *   - otherwise  → OS dialog will show
   */
  async requestPermission(): Promise<NotificationPermissionStatus> {
    const notifications = getLocalNotifications();
    if (!notifications) return "unsupported";

    const current = await this.checkPermission();
    if (current === "granted") return "granted";
    if (current === "denied") return "denied";

    const result = await notifications.requestPermissions();
    return result.display as NotificationPermissionStatus;
  },

  /**
   * Open OS-level app settings (Android: app detail screen).
   */
  async openAppSettings(): Promise<void> {
    if (typeof window === "undefined") return;
    if (!Capacitor.isNativePlatform()) return;

    try {

      if (Capacitor.getPlatform() === "android") {
        await NativeSettings.openAndroid({
          option: AndroidSettings.ApplicationDetails,
        });
      } else {
        await NativeSettings.openIOS({
          option: IOSSettings.App,
        });
      }
      console.log("[Notifications] Opened app settings");
    } catch (err) {
      console.error("[Notifications] openAppSettings failed:", err);
    }
  },

  async scheduleReminder(reminder: Reminder) {
    const notifications = getLocalNotifications();

    if (!notifications) {
      console.log(
        "[Notifications] Web - skipping native notification:",
        reminder.id
      );
      return;
    }

    if (reminder.status !== "pending") {
      return;
    }

    // --- Determine effective time (snoozedUntil takes precedence) ---
    const effectiveTime = reminder.snoozedUntil
      ? new Date(reminder.snoozedUntil)
      : new Date(reminder.scheduledTime);

    if (Number.isNaN(effectiveTime.getTime())) {
      console.warn(
        "[Notifications] Invalid effective time:",
        reminder.snoozedUntil || reminder.scheduledTime
      );
      return;
    }

    if (effectiveTime <= new Date()) {
      return;
    }

    const id = getNotificationId(reminder.id);

    let message = "";
    const isSnoozed =
      reminder.snoozedUntil && new Date(reminder.snoozedUntil) > new Date();

    if (isSnoozed) {
      message = `Snoozed reminder: Time to take ${reminder.medicineName} ${reminder.dosage}.`;
    } else {
      const slot = reminder.timingSlot || "morning";
      switch (slot) {
        case "morning":
          message = `Time for your morning dose: ${reminder.medicineName} ${reminder.dosage}. Tap to mark as taken.`;
          break;
        case "afternoon":
          message = `Afternoon dose due: ${reminder.medicineName} ${reminder.dosage}. Tap to log intake.`;
          break;
        case "evening":
          message = `Evening dose reminder: ${reminder.medicineName} ${reminder.dosage} ${reminder.instructions}`;
          break;
        case "night":
          message = `Last dose of the day: ${reminder.medicineName} ${reminder.dosage} ${reminder.instructions}`;
          break;
        default:
          message = `Time to take ${reminder.medicineName} ${reminder.dosage}.`;
      }
    }

    try {
      await notifications.schedule({
        notifications: [
          {
            id,
            title: "💊 Medicine Reminder",
            body: message,
            schedule: {
              at: effectiveTime,
              allowWhileIdle: true,
            },
            sound: "notification.wav",
            channelId: "medicine-reminders-v2",
            smallIcon: "ic_notification",
            actionTypeId: "MED_REMINDER_ACTIONS",
            extra: {
              reminderId: reminder.id,
              medicineId: reminder.medicineId,
              familyMemberId: reminder.familyMemberId || null,
              recipient: reminder.recipientNickname || "Myself",
              timingSlot: reminder.timingSlot,
              intakeTime: reminder.intakeTime,
              scheduledTime: reminder.scheduledTime,
              snoozedUntil: reminder.snoozedUntil || null,
            },
          },
        ],
      });

      console.log(
        `[Notifications] Scheduled ${reminder.id} -> ${effectiveTime.toString()}`
      );
    } catch (error) {
      console.error(
        `[Notifications] Failed to schedule ${reminder.id}:`,
        error
      );
    }
  },

  async scheduleReminders(reminders: Reminder[]) {
    const notifications = getLocalNotifications();
    if (!notifications) return;

    const now = new Date();
    const windowEnd = new Date(
      now.getTime() + NOTIFICATION_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );

    const futurePending = reminders
      .filter((r) => {
        if (r.status !== "pending") return false;

        const date = r.snoozedUntil
          ? new Date(r.snoozedUntil)
          : new Date(r.scheduledTime);

        return (
          !Number.isNaN(date.getTime()) && date > now && date <= windowEnd
        );
      })
      .sort((a, b) => {
        const aDate = a.snoozedUntil
          ? new Date(a.snoozedUntil).getTime()
          : new Date(a.scheduledTime).getTime();

        const bDate = b.snoozedUntil
          ? new Date(b.snoozedUntil).getTime()
          : new Date(b.scheduledTime).getTime();

        return aDate - bDate;
      })
      .slice(0, MAX_SCHEDULED_NOTIFICATIONS);

    console.log(
      `[Notifications] Scheduling ${futurePending.length} reminders for next ${NOTIFICATION_WINDOW_DAYS} days`
    );

    for (const reminder of futurePending) {
      await this.scheduleReminder(reminder);
    }
  },

  async cancelReminder(reminderId: string) {
    const notifications = getLocalNotifications();
    if (!notifications) return;

    const id = getNotificationId(reminderId);

    try {
      await notifications.cancel({
        notifications: [{ id }],
      });
      console.log(`[Notifications] Cancelled reminder ${reminderId}`);
    } catch (error) {
      console.error(`[Notifications] Failed to cancel ${reminderId}:`, error);
    }
  },

  /**
   * Cancel a list of reminders.
   */
  async cancelReminders(reminders: Reminder[]) {
    const notifications = getLocalNotifications();
    if (!notifications || reminders.length === 0) return;

    try {
      await notifications.cancel({
        notifications: reminders.map((reminder) => ({
          id: getNotificationId(reminder.id),
        })),
      });
      console.log(`[Notifications] Cancelled ${reminders.length} reminders`);
    } catch (error) {
      console.error("[Notifications] Failed to cancel reminders:", error);
    }
  },

  /**
   * Cancel and reschedule all pending reminders.
   */
  async rescheduleAll(reminders: Reminder[]) {
    const notifications = getLocalNotifications();
    if (!notifications) return;

    try {
      /*
       * Cancel only notification IDs represented by our reminders.
       *
       * We do not use removeAllDeliveredNotifications because that
       * would also remove unrelated app notifications.
       */
      const ids = reminders.map((r) => ({
        id: getNotificationId(r.id),
      }));

      if (ids.length > 0) {
        await notifications.cancel({ notifications: ids });
      }

      const now = new Date();

      // Filter future pending reminders using effective time
      const futurePending = reminders.filter((r) => {
        if (r.status !== "pending") return false;

        const date = r.snoozedUntil
          ? new Date(r.snoozedUntil)
          : new Date(r.scheduledTime);

        return !Number.isNaN(date.getTime()) && date > now;
      });

      await this.scheduleReminders(futurePending);

      console.log(
        `[Notifications] Rescheduled ${futurePending.length} future reminders`
      );
    } catch (error) {
      console.error("[Notifications] Failed to reschedule reminders:", error);
    }
  },

  async setupActionListeners(callbacks: {
    onTaken: (reminderId: string, medicineId: string) => void;
    onSnooze: (reminderId: string, medicineId: string, minutes: number) => void;
    onSkip: (reminderId: string, medicineId: string) => void;
  }) {
    const notifications = getLocalNotifications();
    if (!notifications) return;

    await notifications.addListener(
      "localNotificationActionPerformed",
      (action: any) => {
        const notification = action.notification;

        const extra = notification?.extra;

        if (!extra?.reminderId) return;
        if (!extra?.medicineId) return;

        const reminderId = extra.reminderId;
        const medicineId = extra.medicineId;

        switch (action.actionId) {
          case "taken":
            callbacks.onTaken(reminderId, medicineId);
            break;

          case "snooze":
            callbacks.onSnooze(reminderId, medicineId, 10);
            break;

          case "skip":
            callbacks.onSkip(reminderId, medicineId);
            break;
        }
      }
    );
  },

  // cancel all notification  
  async cancelAllScheduledReminders() {
    const notifications = getLocalNotifications();
    if (!notifications) return;

    try {
      const { notifications: pending } =
        await notifications.getPending();

      if (pending.length === 0) {
        console.log("[Notifications] No pending notifications to cancel");
        return;
      }

      await notifications.cancel({
        notifications: pending.map((notification) => ({
          id: notification.id,
        })),
      });

      console.log(
        `[Notifications] Cancelled ${pending.length} pending notifications`
      );
    } catch (error) {
      console.error(
        "[Notifications] Failed to cancel all pending notifications:",
        error
      );
    }
  },
};