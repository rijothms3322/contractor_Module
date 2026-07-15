import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { Profile } from "../lib/mockData";

export const authService = {
  /**
   * Signs up a new patient and triggers custom public profile generation
   */
  async signUp(email: string, password: string, fullName: string, role: "user" | "admin" = "user"): Promise<Profile> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Running in demo mode.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Signup failed: No user object returned.");

    // Return profile structure matching UI expected states
    return {
      id: data.user.id,
      fullName,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      age: 40, // default placeholder, editable in profile screen
      gender: "Male",
      medicalConditions: [],
      addresses: [],
      role,
      familyId: null
    };
  },

  /**
   * Logs in a patient with credentials and retrieves their synchronized profile
   */
  async signIn(email: string, password: string): Promise<{ user: Profile; token: string }> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Running in demo mode.");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "apikey": supabaseAnonKey || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error_description || errData?.message || "Invalid email or password.");
    }

    const data = await response.json();
    if (!data.user || !data.access_token) {
      throw new Error("Login failed: Authentication session is empty.");
    }

    // Set auth session state in Supabase client context
    if (supabase) {
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token || ""
      });
    }

    const profile = await this.getProfile(data.user.id);

    return {
      user: profile,
      token: data.access_token
    };
  },

  /**
   * Logs out the active patient session
   */
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Gets a patient's public profile from the profiles table
   */
  async getProfile(userId: string): Promise<Profile> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn("Failed to fetch profiles table row, returning safe UI fallback:", error);
      // Return safe fallback mapped to credentials
      return {
        id: userId,
        fullName: "Health Champion",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=User`,
        age: 35,
        gender: "Male",
        medicalConditions: [],
        addresses: [],
        role: "user",
        familyId: null
      };
    }

    // Map database snake_case fields directly to existing TypeScript CamelCase interfaces
    return {
      id: data.id,
      fullName: data.full_name || "Health Champion",
      avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.full_name || "User")}`,
      age: data.age || 35,
      gender: data.gender || "Male",
      medicalConditions: data.medical_conditions || [],
      addresses: data.addresses || [],
      role: (data.role as "user" | "admin") || "user",
      familyId: data.family_id || null
    };
  },

  /**
   * Updates public patient details in public.profiles table
   */
  async updateProfile(userId: string, profileData: Partial<Profile>): Promise<Profile> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured.");
    }

    // Prepare database fields
    const dbPayload: any = { id: userId };
    if (profileData.fullName !== undefined) dbPayload.full_name = profileData.fullName;
    if (profileData.avatarUrl !== undefined) dbPayload.avatar_url = profileData.avatarUrl;
    if (profileData.age !== undefined) dbPayload.age = Number(profileData.age);
    if (profileData.gender !== undefined) dbPayload.gender = profileData.gender;
    if (profileData.medicalConditions !== undefined) dbPayload.medical_conditions = profileData.medicalConditions;
    if (profileData.addresses !== undefined) dbPayload.addresses = profileData.addresses;
    if (profileData.role !== undefined) dbPayload.role = profileData.role;
    if (profileData.familyId !== undefined) dbPayload.family_id = profileData.familyId;

    const { data, error } = await supabase
      .from("profiles")
      .upsert(dbPayload)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Database update failed");
    }

    return {
      id: data.id,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      age: data.age,
      gender: data.gender,
      medicalConditions: data.medical_conditions || [],
      addresses: data.addresses || [],
      role: data.role as "user" | "admin",
      familyId: data.family_id || null
    };
  }
};
