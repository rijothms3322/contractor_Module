import { Profile } from "../lib/mockData";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

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
      age: data.age, // default placeholder, editable in profile screen
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

    const signInPromise = supabase.auth.signInWithPassword({
      email,
      password
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Login request timed out. Please verify your connection.")), 10000)
    );

    try {
      const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any;

      if (error) throw error;
      if (!data.user || !data.session) {
        throw new Error("Login failed: Authentication session is empty.");
      }

      const profile = await this.getProfile(data.user.id);

      return {
        user: profile,
        token: data.session.access_token
      };
    } catch (e: any) {
      throw e;
    }
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
    try {
      const selectPromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Profiles query timed out.")), 12000)
      );

      const { data, error } = await Promise.race([selectPromise, timeoutPromise]) as any;
      console.log(data, 'data')
      if (error) throw error;

      let localNickname = "";
      let localDob = "";
      let localBloodGroup = "";
      let localPhone = "";
      if (typeof window !== "undefined") {
        try {
          localNickname = localStorage.getItem("medimz_user_nickname") || "";
          localDob = localStorage.getItem("medimz_user_dob") || "";
          localBloodGroup = localStorage.getItem("medimz_user_bloodGroup") || "";
          localPhone = localStorage.getItem("medimz_user_phone") || "";
        } catch (e) { }
      }

      // Auto-create profile row if it doesn't exist yet
      if (!data) {
        console.log("No profile row found for user, auto-creating profile in database...");

        let metaName = "Health Champion";
        let metaRole = "user";
        try {
          const { data: userData } = await supabase.auth.getUser();
          console.log(userData, 'userdata')
          if (userData?.user?.user_metadata) {
            metaName = userData.user.user_metadata.full_name || metaName;
            metaRole = userData.user.user_metadata.role || metaRole;
          }
        } catch (authErr) {
          console.warn("Could not retrieve user metadata for auto-profile creation:", authErr);
        }

        const { data: newProfile, error: insErr } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            full_name: metaName,
            role: metaRole,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(metaName)}`,
            age: null,
            gender: null
          })
          .select()
          .single();

        if (insErr) {
          console.error("Failed to auto-create profile row:", insErr);
          throw insErr;
        }
        console.log(data, 'av')
        console.log(newProfile, 'ne')
        return {
          id: newProfile.id,
          fullName: newProfile.full_name,
          avatarUrl: newProfile.avatar_url,
          age: newProfile.age,
          gender: newProfile.gender,
          medicalConditions: newProfile.medical_conditions || [],
          addresses: newProfile.addresses || [],
          role: newProfile.role || "user",
          familyId: newProfile.family_id || null,
          nickname: localNickname || newProfile.full_name,
          dob: newProfile.dob,
          bloodGroup: localBloodGroup,
          phone_number: newProfile.phone_number,
          isWalkthroughShown: newProfile.is_walkthrough_shown,
          isMedicineWalkthroughShown: newProfile.is_medicine_walkthrough_shown,
          isPrescriptionWalkthroughShown: newProfile.is_prescription_walkthrough_shown,
          isWellnessHealthWalkthroughShown: newProfile.is_wellness_health_walkthrough_shown,
          isSignupDone: newProfile.is_signup_done ?? false,
        };
      }

      return {
        id: data.id,
        fullName: data.full_name,
        avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.full_name || "User")}`,
        age: data.age,
        gender: data.gender,
        medicalConditions: data.medical_conditions || [],
        addresses: data.addresses || [],
        role: data.role || "user",
        familyId: data.family_id || null,
        nickname: localNickname || data.full_name,
        dob: data.dob,
        bloodGroup: localBloodGroup,
        phone_number: data.phone_number,
        isWalkthroughShown: data.is_walkthrough_shown || false,
        isMedicineWalkthroughShown: data.is_medicine_walkthrough_shown || false,
        isPrescriptionWalkthroughShown: data.is_prescription_walkthrough_shown || false,
        isWellnessHealthWalkthroughShown: data.is_wellness_health_walkthrough_shown || false,
        isSignupDone: data.is_signup_done ?? false,
      };
    } catch (error) {
      console.warn("Failed to fetch profiles table row, attempting local cache recovery:", error);
      if (typeof window !== "undefined") {
        try {
          const cachedUser = localStorage.getItem("medimz_user");
          if (cachedUser) {
            const parsed = JSON.parse(cachedUser);
            // Ensure the cached profile belongs to the requesting user before recovering
            if (parsed && parsed.id === userId) {
              console.log("Medimz Cache Recovery: Successfully recovered active session profile from cache!");
              return parsed;
            }
          }
        } catch (e) {
          console.warn("Failed to parse cached local user profile:", e);
        }
      }

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
  },

  /**
   * Updates public patient details in public.profiles table
   */
  async updateProfile(userId: string, profileData: Partial<Profile>): Promise<Profile> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured.");
    }
    console.log(profileData, 'updateProfile')
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
    if (profileData.dob !== undefined) dbPayload.dob = profileData.dob;
    if (profileData.phone_number !== undefined) dbPayload.phone_number = profileData.phone_number;
    if (profileData.email !== undefined) dbPayload.email = profileData.email;
    if (profileData.isWalkthroughShown !== undefined) dbPayload.is_walkthrough_shown = profileData.isWalkthroughShown;
    if (profileData.isMedicineWalkthroughShown !== undefined) dbPayload.is_medicine_walkthrough_shown = profileData.isMedicineWalkthroughShown;
    if (profileData.isPrescriptionWalkthroughShown !== undefined) dbPayload.is_prescription_walkthrough_shown = profileData.isPrescriptionWalkthroughShown;
    if (profileData.isWellnessHealthWalkthroughShown !== undefined) dbPayload.is_wellness_health_walkthrough_shown = profileData.isWellnessHealthWalkthroughShown;
    if (profileData.isSignupDone !== undefined) dbPayload.is_signup_done = profileData.isSignupDone;


    console.log(profileData.isSignupDone, 'profileData')
    const { data, error } = await supabase
      .from("profiles")
      .update(dbPayload)
      .eq("id", userId)
      .select()
      .single();
    console.log(data, 'up')
    if (error) {
      throw new Error(error.message || "Database update failed");
    }

    let localNickname = "";
    let localDob = "";
    let localBloodGroup = "";
    let localPhone = "";
    if (typeof window !== "undefined") {
      try {
        localNickname = localStorage.getItem("medimz_user_nickname") || "";
        localDob = localStorage.getItem("medimz_user_dob") || "";
        localBloodGroup = localStorage.getItem("medimz_user_bloodGroup") || "";
        localPhone = localStorage.getItem("medimz_user_phone") || "";
      } catch (e) { }
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
      familyId: data.family_id || null,
      nickname: localNickname || data.full_name,
      dob: data.dob,
      bloodGroup: localBloodGroup,
      phone_number: data.phone_number,
      email: data.email,
      isSignupDone: data.is_signup_done ?? false,
    };
  }
};
