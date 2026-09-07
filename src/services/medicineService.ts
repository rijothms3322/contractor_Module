// services/medicineNewService.ts

import { FamilyMember, Medicine } from "../lib/mockData";
import {
  isSupabaseConfigured,
  supabase,
} from "../lib/supabaseClient";

/**
 * Convert Supabase medicine row -> application Medicine object
 */
function mapMedicine(data: any): Medicine {
  return {
    id: data.id,
    name: data.name,
    dosage: data.dosage,
    instructions: data.instructions,

    frequency: data.frequency as
      | "daily"
      | "weekly"
      | "every_day"
      | "specific_days"
      | "interval",

    timings: data.timings || [],

    startDate: data.start_date,

    endDate:
      data.end_date || undefined,

    stockCount:
      data.stock_count !== null &&
        data.stock_count !== undefined
        ? data.stock_count
        : undefined,

    isPrivate:
      !!data.is_private,

    intakeTimes:
      data.intake_times || [],

    selected_days:
      data.selected_days || [],

    repeat_every_n_days:
      data.repeat_every_n_days ?? undefined,


    remind_every: data.remind_every ?? undefined,

    interval_start_time:
      data.interval_start_time || undefined,

    document_id:
      data.document_id || undefined,
  };
}

function normalizeTime(value?: string | null): string | null {
  if (!value) return null;

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }

  return value;
}

/**
 * Convert application Medicine -> Supabase payload
 */
function medicineToPayload(
  userId: string,
  medicine: Omit<Medicine, "id">
) {
  return {
    user_id: userId,

    name:
      medicine.name,

    dosage:
      medicine.dosage,

    instructions:
      medicine.instructions,

    frequency:
      medicine.frequency,

    timings:
      medicine.timings || [],

    start_date:
      medicine.startDate,

    end_date:
      medicine.endDate ?? null,

    stock_count:
      medicine.stockCount ?? null,

    is_private:
      !!medicine.isPrivate,

    intake_times:
      medicine.intakeTimes ?? null,

    selected_days:
      medicine.selected_days ?? null,

    repeat_every_n_days:
      medicine.repeat_every_n_days ?? null,

    remind_every: medicine.remind_every ?? null,

    interval_start_time:
      normalizeTime(medicine.interval_start_time),


    document_id:
      medicine.document_id ?? null,
  };
}


export const medicineNewService = {

  // ============================================================
  // GET ALL MEDICINES
  // ============================================================

  async getMedicines(
    userId: string
  ): Promise<Medicine[]> {

    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured."
      );
    }

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("medicines")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });
    console.log(data, 'getMedicine')
    if (error) {
      throw new Error(
        `Failed to fetch medicines: ${error.message}`
      );
    }
    return (data || []).map(mapMedicine);
  },


  // ============================================================
  // ADD MEDICINE
  // ============================================================

  async addMedicine(
    userId: string,
    medicine: Omit<Medicine, "id">
  ): Promise<Medicine> {

    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured."
      );
    }

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    if (!medicine.name) {
      throw new Error(
        "Medicine name is required."
      );
    }

    const payload = medicineToPayload(
      userId,
      medicine
    );

    const {
      data,
      error,
    } = await supabase
      .from("medicines")
      .insert(payload)
      .select()
      .single();
    console.log(data, 'addMedicine')
    if (error) {
      console.error(
        "Medicine insert failed:",
        error
      );

      throw new Error(
        `Failed to add medicine: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "Medicine was created but no data was returned."
      );
    }
    return mapMedicine(data);
  },


  // ============================================================
  // UPDATE MEDICINE
  // ============================================================

  async updateMedicine(
    medicineId: string,
    updates: Partial<Medicine>
  ): Promise<Medicine> {

    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured."
      );
    }

    if (!medicineId) {
      throw new Error(
        "Medicine ID is required."
      );
    }

    const payload: Record<string, any> = {};

    if (
      updates.name !== undefined
    ) {
      payload.name =
        updates.name;
    }

    if (
      updates.dosage !== undefined
    ) {
      payload.dosage =
        updates.dosage;
    }

    if (
      updates.instructions !== undefined
    ) {
      payload.instructions =
        updates.instructions;
    }

    if (updates.frequency !== undefined) {
      payload.frequency = updates.frequency;

      if (updates.frequency !== "interval") {
        payload.interval_hours = null;
        payload.interval_start_time = null;
      }

      if (updates.frequency === "interval") {
        payload.timings = [];
        payload.intake_times = [];
        payload.selected_days = null;
        payload.repeat_every_n_days = null;
      }
    }


    if (
      updates.timings !== undefined
    ) {
      payload.timings =
        updates.timings;
    }

    if (
      updates.startDate !== undefined
    ) {
      payload.start_date =
        updates.startDate;
    }

    if (
      updates.endDate !== undefined
    ) {
      payload.end_date =
        updates.endDate ?? null;
    }

    if (
      updates.stockCount !== undefined
    ) {
      payload.stock_count =
        updates.stockCount ?? null;
    }

    if (
      updates.isPrivate !== undefined
    ) {
      payload.is_private =
        !!updates.isPrivate;
    }

    if (
      updates.intakeTimes !== undefined
    ) {
      payload.intake_times =
        updates.intakeTimes ?? null;
    }

    if (
      updates.selected_days !== undefined
    ) {
      payload.selected_days =
        updates.selected_days ?? null;
    }

    if (
      updates.repeat_every_n_days !== undefined
    ) {
      payload.repeat_every_n_days =
        updates.repeat_every_n_days ?? null;
    }

    if (updates.remind_every !== undefined) {
      payload.remind_every = updates.remind_every ?? null;
    }

    if (
      updates.interval_start_time !== undefined
    ) {
      payload.interval_start_time =
        normalizeTime(updates.interval_start_time);
    }


    if (
      updates.document_id !== undefined
    ) {
      payload.document_id =
        updates.document_id ?? null;
    }

    if (
      Object.keys(payload).length === 0
    ) {
      throw new Error(
        "No medicine fields to update."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("medicines")
      .update(payload)
      .eq("id", medicineId)
      .select()
      .single();
    console.log(data, 'updateMedicine')
    if (error) {
      console.error(
        "Medicine update failed:",
        error
      );

      throw new Error(
        `Failed to update medicine: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "Medicine update completed but no data was returned."
      );
    }

    return mapMedicine(data);
  },


  // ============================================================
  // DELETE MEDICINE
  // ============================================================

  async deleteMedicine(
    medicineId: string
  ): Promise<{ success: boolean }> {

    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured."
      );
    }

    if (!medicineId) {
      throw new Error(
        "Medicine ID is required."
      );
    }

    const {
      error,
    } = await supabase
      .from("medicines")
      .delete()
      .eq("id", medicineId);
    if (error) {
      console.error(
        "Medicine delete failed:",
        error
      );

      throw new Error(
        `Failed to delete medicine: ${error.message}`
      );
    }

    return {
      success: true,
    };
  },


  // ============================================================
  // GET FAMILY MEMBERS
  // ============================================================

  async getFamilyMembers(
    userId: string
  ): Promise<FamilyMember[]> {

    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured."
      );
    }

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(
        `Failed to fetch family members: ${error.message}`
      );
    }

    return (data || []).map(
      (f: any) => {

        let localMeta: any = {};

        if (
          typeof window !==
          "undefined"
        ) {
          try {
            const stored =
              localStorage.getItem(
                `medimz_fam_metadata_${f.id}`
              );

            if (stored) {
              localMeta =
                JSON.parse(stored);
            }
          } catch {
            // Ignore local metadata errors
          }
        }

        return {
          id: f.id,

          name:
            f.name,

          avatarUrl:
            f.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              f.name
            )}`,

          relationship:
            f.relationship,

          age:
            f.age,

          gender:
            f.gender,

          medicalConditions:
            f.medical_conditions || [],

          adherenceRate:
            100,

          nickname:
            localMeta.nickname ||
            f.nickname ||
            f.name,

          dob:
            localMeta.dob ||
            f.dob,

          bloodGroup:
            localMeta.bloodGroup ||
            f.blood_group,

          phone:
            localMeta.phone ||
            f.phone,

          medicalNotes:
            localMeta.medicalNotes ||
            f.medical_notes,

          allergies:
            f.allergies || [],

          existingDiseases:
            f.existing_diseases || [],

          color:
            localMeta.color ||
            f.color,
        };
      }
    );
  },


  // ============================================================
  // ADD FAMILY MEMBER
  // ============================================================

  async addFamilyMember(
    userId: string,
    member: Omit<
      FamilyMember,
      "id" | "adherenceRate"
    >
  ): Promise<FamilyMember> {

    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured."
      );
    }

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    const payload = {
      user_id:
        userId,

      name:
        member.name,

      avatar_url:
        member.avatarUrl || null,

      relationship:
        member.relationship,

      age:
        Number(member.age),

      gender:
        member.gender,

      medical_conditions:
        member.medicalConditions || [],

      nickname:
        member.nickname ||
        member.name,

      dob:
        member.dob || null,

      blood_group:
        member.bloodGroup || null,

      phone:
        member.phone || null,

      medical_notes:
        member.medicalNotes || null,

      allergies:
        member.allergies || null,

      existing_diseases:
        member.existingDiseases || null,

      color:
        member.color || "blue",
    };

    const {
      data,
      error,
    } = await supabase
      .from("family_members")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(
        "Family member insert failed:",
        error
      );

      throw new Error(
        `Failed to add family member: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "Family member was created but no data was returned."
      );
    }

    return {
      id:
        data.id,

      name:
        data.name,

      avatarUrl:
        data.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          data.name
        )}`,

      relationship:
        data.relationship,

      age:
        data.age,

      gender:
        data.gender,

      medicalConditions:
        data.medical_conditions || [],

      adherenceRate:
        100,

      nickname:
        data.nickname ||
        data.name,

      dob:
        data.dob || "",

      bloodGroup:
        data.blood_group || "",

      phone:
        data.phone || "",

      medicalNotes:
        data.medical_notes || "",

      allergies:
        data.allergies || [],

      existingDiseases:
        data.existing_diseases || [],

      color:
        data.color || "blue",
    };
  },


  // ============================================================
  // UPDATE FAMILY MEMBER
  // ============================================================

  async updateFamilyMember(
    memberId: string,
    member: Partial<FamilyMember>
  ): Promise<FamilyMember> {

    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured."
      );
    }

    if (!memberId) {
      throw new Error(
        "Family member ID is required."
      );
    }

    const payload: Record<string, any> = {};

    if (
      member.name !== undefined
    ) {
      payload.name =
        member.name;
    }

    if (
      member.avatarUrl !== undefined
    ) {
      payload.avatar_url =
        member.avatarUrl;
    }

    if (
      member.relationship !== undefined
    ) {
      payload.relationship =
        member.relationship;
    }

    if (
      member.age !== undefined
    ) {
      payload.age =
        Number(member.age);
    }

    if (
      member.gender !== undefined
    ) {
      payload.gender =
        member.gender;
    }

    if (
      member.medicalConditions !== undefined
    ) {
      payload.medical_conditions =
        member.medicalConditions;
    }

    if (
      member.nickname !== undefined
    ) {
      payload.nickname =
        member.nickname;
    }

    if (
      member.dob !== undefined
    ) {
      payload.dob =
        member.dob || null;
    }

    if (
      member.bloodGroup !== undefined
    ) {
      payload.blood_group =
        member.bloodGroup || null;
    }

    if (
      member.phone !== undefined
    ) {
      payload.phone =
        member.phone || null;
    }

    if (
      member.medicalNotes !== undefined
    ) {
      payload.medical_notes =
        member.medicalNotes || null;
    }

    if (
      member.allergies !== undefined
    ) {
      payload.allergies =
        member.allergies || null;
    }

    if (
      member.existingDiseases !== undefined
    ) {
      payload.existing_diseases =
        member.existingDiseases || null;
    }

    if (
      member.color !== undefined
    ) {
      payload.color =
        member.color || "blue";
    }

    if (
      Object.keys(payload).length === 0
    ) {
      throw new Error(
        "No family member fields to update."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("family_members")
      .update(payload)
      .eq("id", memberId)
      .select()
      .single();

    if (error) {
      console.error(
        "Family member update failed:",
        error
      );

      throw new Error(
        `Failed to update family member: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "Family member update completed but no data was returned."
      );
    }

    return {
      id:
        data.id,

      name:
        data.name,

      avatarUrl:
        data.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          data.name
        )}`,

      relationship:
        data.relationship,

      age:
        data.age,

      gender:
        data.gender,

      medicalConditions:
        data.medical_conditions || [],

      adherenceRate:
        100,

      nickname:
        data.nickname ||
        data.name,

      dob:
        data.dob || "",

      bloodGroup:
        data.blood_group || "",

      phone:
        data.phone || "",

      medicalNotes:
        data.medical_notes || "",

      allergies:
        data.allergies || [],

      existingDiseases:
        data.existing_diseases || [],

      color:
        data.color || "blue",
    };
  },


  // ============================================================
  // DELETE FAMILY MEMBER
  // ============================================================

  async deleteFamilyMember(
    memberId: string
  ): Promise<{ success: boolean }> {

    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured."
      );
    }

    if (!memberId) {
      throw new Error(
        "Family member ID is required."
      );
    }

    const {
      error,
    } = await supabase
      .from("family_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error(
        "Family member delete failed:",
        error
      );

      throw new Error(
        `Failed to delete family member: ${error.message}`
      );
    }

    return {
      success: true,
    };
  },
};