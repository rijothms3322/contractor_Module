import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { Booking, HealthReport, Profile } from "../lib/mockData";

export const bookingService = {
  /**
   * Fetches booking logs for a specific patient
   */
  async getBookings(userId: string): Promise<Booking[]> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        labs (
          name
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Resolve test names from test table in parallel or mock
    const bookingsResolved: Booking[] = [];
    for (const b of (data || [])) {
      const labName = b.labs?.name || "Apollo Diagnostics";
      let testNames: string[] = ["General Wellness Profile"];

      // Fetch matching test records if test_ids are populated
      if (b.test_ids && b.test_ids.length > 0) {
        const { data: testData } = await supabase
          .from("tests")
          .select("name")
          .in("id", b.test_ids);
        if (testData && testData.length > 0) {
          testNames = testData.map((t: any) => t.name);
        }
      }

      bookingsResolved.push({
        id: b.id,
        labId: b.lab_id,
        labName,
        testNames,
        bookingDate: b.booking_date,
        timeSlot: b.time_slot,
        address: b.address,
        status: b.status as Booking["status"],
        phlebotomistName: b.phlebotomist_name || undefined,
        phlebotomistRating: b.phlebotomist_rating ? Number(b.phlebotomist_rating) : undefined,
        phlebotomistPhone: b.phlebotomist_phone || undefined,
        phlebotomistAvatar: b.phlebotomist_avatar || undefined,
        createdAt: b.created_at
      });
    }

    return bookingsResolved;
  },

  /**
   * Schedules a home-collection appointment in the database
   */
  async createBooking(
    userId: string,
    labId: string,
    testIds: string[],
    timeSlot: string,
    address: Booking["address"]
  ): Promise<Booking> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        lab_id: labId,
        test_ids: testIds,
        booking_date: formattedDate,
        time_slot: timeSlot,
        address: address,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;

    // Resolve lab name
    const { data: labData } = await supabase
      .from("labs")
      .select("name")
      .eq("id", labId)
      .single();

    const labName = labData?.name || "Apollo Diagnostics";

    // Resolve test names
    let testNames: string[] = ["General Wellness Profile"];
    if (testIds && testIds.length > 0) {
      const { data: testData } = await supabase
        .from("tests")
        .select("name")
        .in("id", testIds);
      if (testData && testData.length > 0) {
        testNames = testData.map((t: any) => t.name);
      }
    }

    return {
      id: data.id,
      labId: data.lab_id,
      labName,
      testNames,
      bookingDate: data.booking_date,
      timeSlot: data.time_slot,
      address: data.address,
      status: data.status,
      createdAt: data.created_at
    };
  },

  /**
   * Updates phlebotomy collection tracking status
   */
  async updateBookingStatus(bookingId: string, status: Booking["status"]): Promise<void> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) throw error;
  },

  /**
   * Dispatches and assigns phlebotomist details to a booked appointment
   */
  async assignPhlebotomist(
    bookingId: string,
    name: string,
    phone: string,
    rating = 4.8,
    avatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuD-fiijosOOELks0G1tPoJE1MwOmluzSSwm9TEMIKcSMP21iAdVQkAz9HzvlZz_bMc9BAGFfm9eicDCBgBKlTZP6xA2M5YuPjf8kBHQXlAUMDCUFmgw6CwcZ5z4CUrLxxocC1utmx6t299A3bLTh3QfPRnX8rBnBia6B_YosJzdoBQ3em3MAveGI-y_MFhviEicCv2Zo9gtHVKAzJ4beOQSiDimbElcfX9XLdCNUHeC9gJDjfT65xTalzDi_Dea6iy-YWtbxGTSSCs"
  ): Promise<void> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "assigned",
        phlebotomist_name: name,
        phlebotomist_phone: phone,
        phlebotomist_rating: rating,
        phlebotomist_avatar: avatar
      })
      .eq("id", bookingId);

    if (error) throw error;
  },

  /**
   * Fetches patient health reports
   */
  async getReports(userId: string): Promise<HealthReport[]> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((r: any) => ({
      id: r.id,
      testName: r.test_name,
      fileUrl: r.file_url,
      aiSummary: r.ai_summary || "",
      date: r.created_at ? r.created_at.split("T")[0] : new Date().toISOString().split("T")[0]
    }));
  },

  /**
   * Saves a placeholder health report card in the database
   */
  async addReport(
    userId: string,
    bookingId: string | null,
    testName: string,
    fileUrl: string,
    aiSummary: string
  ): Promise<HealthReport> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("reports")
      .insert({
        user_id: userId,
        booking_id: bookingId || null,
        test_name: testName,
        file_url: fileUrl,
        ai_summary: aiSummary
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      testName: data.test_name,
      fileUrl: data.file_url,
      aiSummary: data.ai_summary || "",
      date: data.created_at ? data.created_at.split("T")[0] : new Date().toISOString().split("T")[0]
    };
  },

  // ====================================================================
  // ADMINISTRATIVE LOGISTICS OPERATIONS ENDPOINTS (SUPERUSER MODE)
  // ====================================================================

  /**
   * Admins retrieve all bookings across the whole platform
   */
  async getAllBookingsAdmin(): Promise<any[]> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        profiles (
          full_name,
          role
        ),
        labs (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((b: any) => ({
      id: b.id,
      patientName: b.profiles?.full_name || "Unknown Patient",
      labName: b.labs?.name || "Apollo Diagnostics",
      bookingDate: b.booking_date,
      timeSlot: b.time_slot,
      address: b.address,
      status: b.status,
      createdAt: b.created_at,
      testNames: ["Diagnostic Health Checkup"]
    }));
  },

  /**
   * Admins fetch all active user profiles
   */
  async getAllUsersAdmin(): Promise<Profile[]> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((p: any) => ({
      id: p.id,
      fullName: p.full_name || "Health User",
      avatarUrl: p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || "User")}`,
      age: p.age || 35,
      gender: p.gender || "Male",
      medicalConditions: p.medical_conditions || [],
      addresses: p.addresses || [],
      role: p.role as "user" | "admin"
    }));
  }
};
