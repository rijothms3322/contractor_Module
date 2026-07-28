import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { Reminder, Notification } from "../lib/mockData";

export const reminderService = {
  /**
   * Fetches reminders utilizing Supabase relational queries to resolve medication and family names
   */
  async getReminders(userId: string): Promise<Reminder[]> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("reminders")
      .select(`
        id,
        scheduled_time,
        timing_slot,
        status,
        taken_at,
        medicine_id,
        family_member_id,
        medicines (
          name,
          dosage,
          instructions
        ),
        family_members (
          name
        )
      `)
      .eq("user_id", userId)
      .order("scheduled_time", { ascending: false });

    if (error) throw error;

    return (data || []).map((r: any) => {
      const med = r.medicines || {};
      const fam = r.family_members || {};

      return {
        id: r.id,
        medicineId: r.medicine_id,
        medicineName: med.name || "Unknown Medication",
        dosage: med.dosage || "1 Unit",
        instructions: med.instructions || "Take as directed",
        familyMemberId: r.family_member_id || null,
        familyMemberName: fam.name || undefined,
        scheduledTime: r.scheduled_time,
        timingSlot: r.timing_slot as "morning" | "afternoon" | "evening" | "night",
        status: r.status as "pending" | "taken" | "missed",
        takenAt: r.taken_at || undefined
      };
    });
  },

  /**
   * Bulk schedules a batch of future reminders in the database
   */
  async addReminders(userId: string, reminders: Omit<Reminder, "id" | "medicineName" | "dosage" | "instructions" | "familyMemberName">[]): Promise<void> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const dbPayload = reminders.map((r: any) => ({
      id: crypto.randomUUID(),
      user_id: userId,
      medicine_id: r.medicineId,
      family_member_id: r.familyMemberId || null,
      scheduled_time: r.scheduledTime,
      timing_slot: r.timingSlot,
      status: r.status,
      taken_at: r.takenAt || null
    }));

    const { error } = await supabase
      .from("reminders")
      .insert(dbPayload);

    if (error) throw error;
  },

  /**
   * Logs taken or missed dose compliance statuses
   */
  async updateReminderStatus(reminderId: string, status: "pending" | "taken" | "missed", takenAt?: string): Promise<void> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { error } = await supabase
      .from("reminders")
      .update({
        status,
        taken_at: takenAt || null
      })
      .eq("id", reminderId);

    if (error) throw error;
  },

  /**
   * Fetches patient inbox notifications
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as "reminder" | "booking" | "system",
      isRead: n.is_read,
      createdAt: n.created_at
    }));
  },

  /**
   * Registers a new patient notification (system alert, reminder triggered, or test booking updates)
   */
  async addNotification(userId: string, title: string, message: string, type: "reminder" | "booking" | "system"): Promise<Notification> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const insertPromise = (async () => {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          title,
          message,
          type,
          is_read: false
        })
        .select();
      if (error) throw error;
      return data;
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timed out writing notification to DB.")), 8000)
    );

    try {
      const inserted = await Promise.race([insertPromise, timeoutPromise]) as any;

      if (!inserted || inserted.length === 0) {
        throw new Error("No data returned from notification save.");
      }
      const data = inserted[0];

      // Trigger local reminder placeholder push warning
      if (typeof window !== "undefined" && "Notification" in window) {
        console.log(`[Push Notification Dispatcher] ${title}: ${message}`);
      }

      return {
        id: data.id,
        title: data.title,
        message: data.message,
        type: data.type as "reminder" | "booking" | "system",
        isRead: data.is_read,
        createdAt: data.created_at
      };
    } catch (err: any) {
      console.warn("Failed to write notification to DB (using local fallback):", err.message || err);
      return {
        id: `local-noti-${Date.now()}`,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      };
    }
  },

  /**
   * Sets custom notifications to read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) throw error;
  },

  /**
   * Clears patient notifications completely
   */
  async clearNotifications(userId: string): Promise<void> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  },

  /**
   * Records an audit log whenever a caregiver/family member marks a medicine as Taken for another user
   */
  async logComplianceAudit(
    ownerId: string,
    operatorId: string,
    medName: string,
    reminderId: string,
    status: string,
    sourceDevice = "Family Member"
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from("compliance_audit_logs")
      .insert({
        medicine_owner_id: ownerId,
        marked_by_id: operatorId,
        medicine_name: medName,
        reminder_id: reminderId,
        status: status,
        source_device: sourceDevice
      });

    if (error) {
      console.error("Failed to write compliance audit log:", error);
    }
  },

  /**
   * Deletes a specific reminder by ID
   */
  async deleteReminder(reminderId: string): Promise<void> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", reminderId);
    if (error) throw error;
  }
};
