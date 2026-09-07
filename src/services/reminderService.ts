// services/reminderService.ts

import {
  isSupabaseConfigured,
  supabase,
} from "@/lib/supabaseClient";

import {
  Reminder,
  Notification,
} from "@/lib/mockData";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface AddReminderParams {
  medicineId: string;
  familyMemberId?: string | null;
  scheduledTime: string;
  timingSlot: "morning" | "afternoon" | "evening" | "night";
  status?: "pending" | "taken" | "missed";
  takenAt?: string | null;
}

export interface AddNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: "reminder" | "booking" | "system";
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
}

function ensureUserId(userId: string) {
  if (!userId) {
    throw new Error("User ID is required.");
  }
}

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export const reminderService = {

  // ─────────────────────────────────────────────
  // GET ALL REMINDERS
  // ─────────────────────────────────────────────

  async getReminders(userId: string): Promise<Reminder[]> {
    ensureSupabaseConfigured();
    ensureUserId(userId);

    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        medicine:medicines(
          id,
          name,
          dosage,
          instructions
        ),
        family_member:family_members(
          id,
          name
        )
      `)
      .eq("user_id", userId)
      .order("scheduled_time", {
        ascending: false,
      });

    if (error) {
      console.error(
        "[getReminders] ERROR:",
        error
      );

      throw new Error(
        `Failed to fetch reminders: ${error.message}`
      );
    }

    return (data || []).map((r: any) => ({
      id: r.id,

      medicineId: r.medicine_id,

      medicineName:
        r.medicine?.name ||
        "Unknown Medication",

      dosage:
        r.medicine?.dosage ||
        "1 Unit",

      instructions:
        r.medicine?.instructions ||
        "Take as directed",

      familyMemberId:
        r.family_member_id || null,

      familyMemberName:
        r.family_member?.name ||
        undefined,

      scheduledTime:
        r.scheduled_time,

      timingSlot:
        r.timing_slot as
          | "morning"
          | "afternoon"
          | "evening"
          | "night",

      status:
        r.status as
          | "pending"
          | "taken"
          | "missed",

      takenAt:
        r.taken_at || undefined,
    }));
  },

  // ─────────────────────────────────────────────
  // GET SINGLE REMINDER
  // ─────────────────────────────────────────────

  async getReminderById(
    reminderId: string
  ): Promise<Reminder> {
    ensureSupabaseConfigured();

    if (!reminderId) {
      throw new Error("Reminder ID is required.");
    }

    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        medicine:medicines(
          id,
          name,
          dosage,
          instructions
        ),
        family_member:family_members(
          id,
          name
        )
      `)
      .eq("id", reminderId)
      .single();

    if (error) {
      console.error(
        "[getReminderById] ERROR:",
        error
      );

      throw new Error(
        `Failed to fetch reminder: ${error.message}`
      );
    }

    return {
      id: data.id,

      medicineId: data.medicine_id,

      medicineName:
        data.medicine?.name ||
        "Unknown Medication",

      dosage:
        data.medicine?.dosage ||
        "1 Unit",

      instructions:
        data.medicine?.instructions ||
        "Take as directed",

      familyMemberId:
        data.family_member_id || null,

      familyMemberName:
        data.family_member?.name ||
        undefined,

      scheduledTime:
        data.scheduled_time,

      timingSlot:
        data.timing_slot,

      status:
        data.status,

      takenAt:
        data.taken_at || undefined,
    };
  },

  // ─────────────────────────────────────────────
  // ADD REMINDERS
  // ─────────────────────────────────────────────

  async addReminders(
    userId: string,
    reminders: AddReminderParams[]
  ) {
    ensureSupabaseConfigured();
    ensureUserId(userId);

    if (!reminders.length) {
      return [];
    }

    const dbPayload = reminders.map(
      (reminder) => ({
        user_id: userId,

        medicine_id:
          reminder.medicineId,

        family_member_id:
          reminder.familyMemberId || null,

        scheduled_time:
          reminder.scheduledTime,

        timing_slot:
          reminder.timingSlot,

        status:
          reminder.status || "pending",

        taken_at:
          reminder.takenAt || null,
      })
    );

    const {
      data,
      error,
    } = await supabase
      .from("reminders")
      .insert(dbPayload)
      .select();

    if (error) {
      console.error(
        "[addReminders] ERROR:",
        error
      );

      throw new Error(
        `Failed to add reminders: ${error.message}`
      );
    }

    return data || [];
  },

  // ─────────────────────────────────────────────
  // ADD SINGLE REMINDER
  // ─────────────────────────────────────────────

  async addReminder(
    userId: string,
    reminder: AddReminderParams
  ) {
    ensureSupabaseConfigured();
    ensureUserId(userId);

    const {
      data,
      error,
    } = await supabase
      .from("reminders")
      .insert({
        user_id: userId,

        medicine_id:
          reminder.medicineId,

        family_member_id:
          reminder.familyMemberId || null,

        scheduled_time:
          reminder.scheduledTime,

        timing_slot:
          reminder.timingSlot,

        status:
          reminder.status || "pending",

        taken_at:
          reminder.takenAt || null,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "[addReminder] ERROR:",
        error
      );

      throw new Error(
        `Failed to add reminder: ${error.message}`
      );
    }

    return data;
  },

  // ─────────────────────────────────────────────
  // DELETE PENDING REMINDERS FOR MEDICINE
  // ─────────────────────────────────────────────

  async deletePendingReminders(
    medicineId: string,
    userId: string
  ): Promise<void> {
    ensureSupabaseConfigured();
    ensureUserId(userId);

    if (!medicineId) {
      throw new Error(
        "Medicine ID is required."
      );
    }

    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("medicine_id", medicineId)
      .eq("user_id", userId)
      .eq("status", "pending");

    if (error) {
      console.error(
        "[deletePendingReminders] ERROR:",
        error
      );

      throw new Error(
        `Failed to delete pending reminders: ${error.message}`
      );
    }
  },

  // ─────────────────────────────────────────────
  // UPDATE REMINDER STATUS
  // ─────────────────────────────────────────────

  async updateReminderStatus(
    reminderId: string,
    status:
      | "pending"
      | "taken"
      | "missed",
    takenAt?: string | null
  ) {
    console.log(reminderId, status, takenAt, '[updateReminderStatus]')
    ensureSupabaseConfigured();

    if (!reminderId) {
      throw new Error(
        "Reminder ID is required."
      );
    }

    const updateData: {
      status: "pending" | "taken" | "missed";
      taken_at: string | null;
    } = {
      status,
      taken_at:
        status === "taken" || status === "missed"
          ? takenAt ||
            new Date().toISOString()
          : null,
    };

    const {
      data,
      error,
    } = await supabase
      .from("reminders")
      .update(updateData)
      .eq("id", reminderId)
      .select()
      .single();
    console.log(data, error, '[updateReminderStatus]')
    if (error) {
      console.error(
        "[updateReminderStatus] ERROR:",
        error
      );

      throw new Error(
        `Failed to update reminder status: ${error.message}`
      );
    }

    return data;
  },

  // ─────────────────────────────────────────────
  // DELETE SINGLE REMINDER
  // ─────────────────────────────────────────────

  async deleteReminder(
    reminderId: string
  ): Promise<void> {
    ensureSupabaseConfigured();

    if (!reminderId) {
      throw new Error(
        "Reminder ID is required."
      );
    }

    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", reminderId);

    if (error) {
      console.error(
        "[deleteReminder] ERROR:",
        error
      );

      throw new Error(
        `Failed to delete reminder: ${error.message}`
      );
    }
  },

  // ─────────────────────────────────────────────
  // GET NOTIFICATIONS
  // ─────────────────────────────────────────────

  async getNotifications(
    userId: string
  ): Promise<Notification[]> {
    ensureSupabaseConfigured();
    ensureUserId(userId);

    const {
      data,
      error,
    } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "[getNotifications] ERROR:",
        error
      );

      throw new Error(
        `Failed to fetch notifications: ${error.message}`
      );
    }

    return (data || []).map(
      (n: any) => ({
        id: n.id,

        title: n.title,

        message: n.message,

        type:
          n.type as
            | "reminder"
            | "booking"
            | "system",

        isRead:
          n.is_read,

        createdAt:
          n.created_at,
      })
    );
  },

  // ─────────────────────────────────────────────
  // ADD NOTIFICATION
  // ─────────────────────────────────────────────

  async addNotification(
    userId: string,
    title: string,
    message: string,
    type:
      | "reminder"
      | "booking"
      | "system"
  ): Promise<Notification> {
    ensureSupabaseConfigured();
    ensureUserId(userId);

    if (!title) {
      throw new Error(
        "Notification title is required."
      );
    }

    if (!message) {
      throw new Error(
        "Notification message is required."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,

        title,

        message,

        type,

        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "[addNotification] ERROR:",
        error
      );

      throw new Error(
        `Failed to add notification: ${error.message}`
      );
    }

    return {
      id: data.id,

      title: data.title,

      message: data.message,

      type:
        data.type as
          | "reminder"
          | "booking"
          | "system",

      isRead:
        data.is_read,

      createdAt:
        data.created_at,
    };
  },

  // ─────────────────────────────────────────────
  // MARK NOTIFICATION READ
  // ─────────────────────────────────────────────

  async markNotificationRead(
    notificationId: string
  ): Promise<Notification> {
    ensureSupabaseConfigured();

    if (!notificationId) {
      throw new Error(
        "Notification ID is required."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId)
      .select()
      .single();

    if (error) {
      console.error(
        "[markNotificationRead] ERROR:",
        error
      );

      throw new Error(
        `Failed to mark notification as read: ${error.message}`
      );
    }

    return {
      id: data.id,

      title: data.title,

      message: data.message,

      type:
        data.type as
          | "reminder"
          | "booking"
          | "system",

      isRead:
        data.is_read,

      createdAt:
        data.created_at,
    };
  },

  // ─────────────────────────────────────────────
  // CLEAR NOTIFICATIONS
  // ─────────────────────────────────────────────

  async clearNotifications(
    userId: string
  ): Promise<void> {
    ensureSupabaseConfigured();
    ensureUserId(userId);

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error(
        "[clearNotifications] ERROR:",
        error
      );

      throw new Error(
        `Failed to clear notifications: ${error.message}`
      );
    }
  },

  // ─────────────────────────────────────────────
  // COMPLIANCE AUDIT LOG
  // ─────────────────────────────────────────────

  async logComplianceAudit(
    ownerId: string,
    operatorId: string,
    medName: string,
    reminderId: string,
    status: string,
    sourceDevice = "Family Member"
  ): Promise<void> {
    ensureSupabaseConfigured();

    if (
      !ownerId ||
      !operatorId ||
      !reminderId
    ) {
      throw new Error(
        "Owner ID, operator ID and reminder ID are required."
      );
    }

    const { error } = await supabase
      .from("compliance_audit_logs")
      .insert({
        medicine_owner_id:
          ownerId,

        marked_by_id:
          operatorId,

        medicine_name:
          medName,

        reminder_id:
          reminderId,

        status,

        source_device:
          sourceDevice,
      });

    if (error) {
      console.error(
        "[logComplianceAudit] ERROR:",
        error
      );

      throw new Error(
        `Failed to write compliance audit log: ${error.message}`
      );
    }
  },
};