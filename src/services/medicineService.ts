import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { Medicine, FamilyMember } from "../lib/mockData";

export const medicineService = {
  /**
   * Fetches all medications registered to a patient
   */
  async getMedicines(userId: string): Promise<Medicine[]> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      instructions: m.instructions,
      frequency: m.frequency as "daily" | "weekly",
      timings: m.timings || [],
      startDate: m.start_date,
      endDate: m.end_date || undefined,
      stockCount: m.stock_count !== null ? m.stock_count : undefined,
      isPrivate: !!m.is_private
    }));
  },

  /**
   * Registers a new medicine prescription for a patient
   */
  async addMedicine(userId: string, medicine: Omit<Medicine, "id">): Promise<Medicine> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("medicines")
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        name: medicine.name,
        dosage: medicine.dosage,
        instructions: medicine.instructions,
        frequency: medicine.frequency,
        timings: medicine.timings,
        start_date: medicine.startDate,
        end_date: medicine.endDate || null,
        stock_count: medicine.stockCount || null,
        is_private: !!medicine.isPrivate
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      dosage: data.dosage,
      instructions: data.instructions,
      frequency: data.frequency,
      timings: data.timings || [],
      startDate: data.start_date,
      endDate: data.end_date || undefined,
      stockCount: data.stock_count !== null ? data.stock_count : undefined,
      isPrivate: !!data.is_private
    };
  },

  /**
   * Deletes a medicine prescription by ID
   */
  async deleteMedicine(medicineId: string): Promise<void> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { error } = await supabase
      .from("medicines")
      .delete()
      .eq("id", medicineId);

    if (error) throw error;
  },

  /**
   * Fetches all synced family profiles for a patient
   */
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    return (data || []).map((f: any) => {
      let localMeta: any = {};
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(`medimz_fam_metadata_${f.id}`);
          if (stored) localMeta = JSON.parse(stored);
        } catch (e) {}
      }

      return {
        id: f.id,
        name: f.name,
        avatarUrl: f.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(f.name)}`,
        relationship: f.relationship,
        age: f.age || 40,
        gender: f.gender || "Male",
        medicalConditions: f.medical_conditions || [],
        adherenceRate: 100,
        nickname: localMeta.nickname || f.nickname || f.name,
        dob: localMeta.dob || f.dob || "",
        bloodGroup: localMeta.bloodGroup || f.blood_group || "O+",
        phone: localMeta.phone || f.phone || "",
        medicalNotes: localMeta.medicalNotes || f.medical_notes || "",
        allergies: f.allergies || [],
        existingDiseases: f.existing_diseases || [],
        color: localMeta.color || f.color || "blue"
      };
    });
  },

  /**
   * Creates a family profile card linked to a patient account
   */
  async addFamilyMember(userId: string, member: Omit<FamilyMember, "id" | "adherenceRate">): Promise<FamilyMember> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const payload: any = {
      user_id: userId,
      name: member.name,
      avatar_url: member.avatarUrl || null,
      relationship: member.relationship,
      age: Number(member.age),
      gender: member.gender,
      medical_conditions: member.medicalConditions,
      nickname: member.nickname || member.name,
      dob: member.dob || null,
      blood_group: member.bloodGroup || null,
      phone: member.phone || null,
      medical_notes: member.medicalNotes || null,
      allergies: member.allergies || null,
      existing_diseases: member.existingDiseases || null,
      color: member.color || "blue"
    };

    try {
      const { data, error } = await supabase
        .from("family_members")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
        relationship: data.relationship,
        age: data.age,
        gender: data.gender,
        medicalConditions: data.medical_conditions || [],
        adherenceRate: 100,
        nickname: data.nickname || data.name,
        dob: data.dob || "",
        bloodGroup: data.blood_group || "",
        phone: data.phone || "",
        medicalNotes: data.medical_notes || "",
        allergies: data.allergies || [],
        existingDiseases: data.existing_diseases || [],
        color: data.color || "blue"
      };
    } catch (e: any) {
      console.warn("Extended family member insert failed, falling back to core columns:", e);
      const fallbackPayload = {
        user_id: userId,
        name: member.name,
        avatar_url: member.avatarUrl || null,
        relationship: member.relationship,
        age: Number(member.age),
        gender: member.gender,
        medical_conditions: member.medicalConditions
      };
      
      const { data, error } = await supabase
        .from("family_members")
        .insert(fallbackPayload)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
        relationship: data.relationship,
        age: data.age,
        gender: data.gender,
        medicalConditions: data.medical_conditions || [],
        adherenceRate: 100,
        nickname: member.nickname || member.name,
        dob: member.dob || "",
        bloodGroup: member.bloodGroup || "",
        phone: member.phone || "",
        medicalNotes: member.medicalNotes || "",
        allergies: member.allergies || [],
        existingDiseases: member.existingDiseases || [],
        color: member.color || "blue"
      };
    }
  },
  async updateFamilyMember(memberId: string, member: Partial<FamilyMember>): Promise<void> {
    const payload: any = {};
    if (member.name !== undefined) payload.name = member.name;
    if (member.avatarUrl !== undefined) payload.avatar_url = member.avatarUrl;
    if (member.relationship !== undefined) payload.relationship = member.relationship;
    if (member.age !== undefined) payload.age = Number(member.age);
    if (member.gender !== undefined) payload.gender = member.gender;
    if (member.medicalConditions !== undefined) payload.medical_conditions = member.medicalConditions;
    if (member.nickname !== undefined) payload.nickname = member.nickname;
    if (member.dob !== undefined) payload.dob = member.dob || null;
    if (member.bloodGroup !== undefined) payload.blood_group = member.bloodGroup || null;
    if (member.phone !== undefined) payload.phone = member.phone || null;
    if (member.medicalNotes !== undefined) payload.medical_notes = member.medicalNotes || null;
    if (member.color !== undefined) payload.color = member.color || "blue";

    await supabase
      .from("family_members")
      .update(payload)
      .eq("id", memberId);
  },
  async deleteFamilyMember(memberId: string): Promise<void> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", memberId);
    if (error) throw error;
  }
};
