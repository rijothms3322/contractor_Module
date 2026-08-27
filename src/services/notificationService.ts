import { Reminder } from "@/lib/mockData";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Synchronous helper (no async) to avoid Promise issues
const getLocalNotifications = () => {
  console.log('[DEBUG] getLocalNotifications called');
  if (typeof window === "undefined") {
    console.log('[DEBUG] window undefined');
    return null;
  }
  if (!Capacitor.isNativePlatform()) {
    console.log('[DEBUG] Not native platform');
    return null;
  }
  console.log('[DEBUG] LocalNotifications object:', LocalNotifications);
  return LocalNotifications;
};

function getNotificationId(reminderId: string): number {
  let hash = 0;
  for (let i = 0; i < reminderId.length; i++) {
    hash = (hash << 5) - hash + reminderId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const notificationService = {
  async init() {
    console.log('[DEBUG] init() started');
    try {
      const LocalNotifications = getLocalNotifications();
      console.log('[DEBUG] LocalNotifications after get:', LocalNotifications);

      if (!LocalNotifications) {
        console.warn('[DEBUG] LocalNotifications is null/undefined');
        return;
      }

      console.log('[DEBUG] Requesting permissions...');
      const permission = await LocalNotifications.requestPermissions();
      console.log('[DEBUG] Permission result:', JSON.stringify(permission));

      if (permission.display !== "granted") {
        console.warn("[DEBUG] Notification permissions not granted");
        return;
      }
      console.log("[DEBUG] Permission Granted");

      console.log('[DEBUG] Registering action types...');
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: "MED_REMINDER_ACTIONS",
            actions: [
              { id: "taken", title: "✅ Taken", foreground: false },
              { id: "snooze", title: "⏰ Snooze", foreground: false },
              { id: "skip", title: "❌ Skip", foreground: false }
            ]
          }
        ]
      });
      console.log('[DEBUG] Action types registered');
      console.log("✅ Capacitor Local Notifications initialized successfully");
    } catch (error) {
      console.error('[ERROR] init() failed:', error);
      console.error(error);
    }
  },

  async scheduleMedicineReminder(med: {
    id: string;
    name: string;
    dosage: string;
    recipientName?: string;
    timeLabel?: string;
  }, delaySeconds = 1) {
    console.log('[DEBUG] scheduleMedicineReminder called');
    const LocalNotifications = getLocalNotifications();
    console.log('[DEBUG] LocalNotifications in schedule:', LocalNotifications);

    if (!LocalNotifications) {
      console.log("[Web Simulator Fallback] Scheduled notification for:", med.name);
      return;
    }

    try {
      const recipient = med.recipientName || "Myself";
      const scheduledTime = med.timeLabel || "8:00 AM";

      console.log('[DEBUG] Attempting to schedule with delay:', delaySeconds);
      const result = await LocalNotifications.schedule({
        notifications: [
          {
            title: "💊 Time to Take Your Medicine",
            body: `${med.name} ${med.dosage}\nFor: ${recipient}\nScheduled: ${scheduledTime}`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + delaySeconds * 1000) },
            sound: "", // Temporarily disabled to avoid missing file
            smallIcon: 'ic_notification', // Must exist in drawable/
            actionTypeId: "MED_REMINDER_ACTIONS",
            extra: {
              medicineId: med.id,
              recipient,
              scheduledTime
            }
          }
        ]
      });
      console.log('[DEBUG] Schedule result:', result);
      console.log(`✅ Native notification scheduled for ${med.name} in ${delaySeconds} seconds`);
    } catch (e) {
      console.error("[ERROR] Failed to schedule local notification:", e);
      console.error(e);
    }
  },

  async setupActionListeners(callbacks: {
    onTaken: (medicineId: string) => void;
    onSnooze: (medicineId: string, minutes: number) => void;
    onSkip: (medicineId: string) => void;
  }) {
    const LocalNotifications = getLocalNotifications();
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
  },

  async scheduleReminder(reminder: Reminder) {
    const LocalNotifications = getLocalNotifications();
    if (!LocalNotifications) return;

    const scheduledTime = new Date(reminder.scheduledTime);
    const now = new Date();
    if (scheduledTime <= now) return;

    const id = getNotificationId(reminder.id);
    const title = '💊 Medicine Reminder';
    const body = `${reminder.medicineName} (${reminder.dosage}) – ${reminder.instructions || ''}`;
    const recipient = reminder.recipientNickname || 'Myself';

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body: `${body}\nFor: ${recipient}`,
            schedule: { at: scheduledTime },
            sound: "",
            smallIcon: 'ic_notification',
            actionTypeId: 'MED_REMINDER_ACTIONS',
            extra: {
              reminderId: reminder.id,
              medicineId: reminder.medicineId,
              recipient,
            },
          },
        ],
      });
      console.log(`Scheduled notification for reminder ${reminder.id} at ${scheduledTime.toISOString()}`);
    } catch (e) {
      console.error('Failed to schedule local notification:', e);
    }
  },

  async cancelReminder(reminderId: string) {
    const LocalNotifications = getLocalNotifications();
    if (!LocalNotifications) return;
    const id = getNotificationId(reminderId);
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      console.log(`Cancelled notification for reminder ${reminderId}`);
    } catch (e) {
      console.error('Failed to cancel notification:', e);
    }
  },

  async rescheduleAll(reminders: Reminder[]) {
    const LocalNotifications = getLocalNotifications();
    if (!LocalNotifications) return;

    for (const r of reminders) {
      if (r.status === 'pending') {
        await this.cancelReminder(r.id);
      }
    }

    const now = new Date();
    const futureReminders = reminders.filter(r => r.status === 'pending' && new Date(r.scheduledTime) > now);
    for (const r of futureReminders) {
      await this.scheduleReminder(r);
    }
    console.log(`Rescheduled ${futureReminders.length} future reminders.`);
  }
};