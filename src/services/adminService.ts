import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

export interface UserRole {
  id: string;
  userId: string;
  email: string;
  role: "super_admin" | "operations" | "customer_support" | "marketing" | "finance" | "analytics" | "developer" | "medical_operations";
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string | null;
  adminEmail: string;
  ipAddress: string | null;
  browser: string | null;
  device: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  previousValue: any;
  newValue: any;
  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface RolePermission {
  id: string;
  role: string;
  resource: string;
  action: string;
  allowed: boolean;
}

export const adminService = {
  /**
   * Helper to ensure Supabase is configured
   */
  checkBackend(): void {
    if (!isSupabaseConfigured) {
      throw new Error("SUPABASE_BACKEND_UNAVAILABLE");
    }
  },

  /**
   * Fetch all roles registered in the system
   */
  async getAllUserRoles(): Promise<UserRole[]> {
    this.checkBackend();
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      email: r.email,
      role: r.role,
      createdAt: r.created_at
    }));
  },

  /**
   * Assign or update a user's role in the database
   */
  async assignUserRole(adminEmail: string, email: string, role: UserRole["role"]): Promise<UserRole> {
    this.checkBackend();
    const cleanEmail = email.toLowerCase().trim();

    // Find user profile by email first
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .ilike("full_name", `%${cleanEmail.split("@")[0]}%`);

    const profileId = profiles && profiles[0] ? profiles[0].id : "00000000-0000-0000-0000-000000000000";

    const payload = {
      user_id: profileId,
      email: cleanEmail,
      role
    };

    const { data, error } = await supabase
      .from("user_roles")
      .upsert(payload, { onConflict: "email" })
      .select()
      .single();

    if (error) throw error;

    // Update public.profiles role tag too
    await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", profileId);

    const returnedRole: UserRole = {
      id: data.id,
      userId: data.user_id,
      email: data.email,
      role: data.role,
      createdAt: data.created_at
    };

    await this.logAdminAction(
      null,
      adminEmail,
      `Assigned role ${role} to ${cleanEmail}`,
      "user_roles",
      data.id,
      null,
      payload
    );

    return returnedRole;
  },

  /**
   * Revoke/Delete a role assignment
   */
  async revokeUserRole(adminEmail: string, roleId: string): Promise<void> {
    this.checkBackend();

    // Find role email for logging
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("email, user_id, role")
      .eq("id", roleId)
      .single();

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", roleId);

    if (error) throw error;

    if (roleData) {
      // Revert profile tag
      await supabase
        .from("profiles")
        .update({ role: "user" })
        .eq("id", roleData.user_id);

      await this.logAdminAction(
        null,
        adminEmail,
        `Revoked ${roleData.role} role for ${roleData.email}`,
        "user_roles",
        roleId,
        roleData,
        null
      );
    }
  },

  /**
   * Fetch system audit logs
   */
  async getAuditLogs(): Promise<AdminAuditLog[]> {
    this.checkBackend();
    const { data, error } = await supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((l: any) => ({
      id: l.id,
      adminId: l.admin_id,
      adminEmail: l.admin_email,
      ipAddress: l.ip_address,
      browser: l.browser,
      device: l.device,
      action: l.action,
      targetType: l.target_type,
      targetId: l.target_id,
      previousValue: l.previous_value,
      newValue: l.new_value,
      createdAt: l.created_at
    }));
  },

  /**
   * Log an administrative action to database
   */
  async logAdminAction(
    adminId: string | null,
    adminEmail: string,
    action: string,
    targetType: string,
    targetId: string | null,
    previousValue: any,
    newValue: any
  ): Promise<void> {
    this.checkBackend();

    let ip = "127.0.0.1";
    let browserName = "Unknown Browser";
    let deviceName = "Unknown Device";

    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      if (ua.includes("Firefox")) browserName = "Firefox";
      else if (ua.includes("Chrome")) browserName = "Chrome";
      else if (ua.includes("Safari")) browserName = "Safari";
      else if (ua.includes("Edge")) browserName = "Edge";

      if (ua.includes("Windows")) deviceName = "Windows PC";
      else if (ua.includes("Macintosh")) deviceName = "MacBook / iMac";
      else if (ua.includes("iPhone")) deviceName = "iPhone";
      else if (ua.includes("Android")) deviceName = "Android Mobile";
    }

    const payload = {
      admin_id: adminId,
      admin_email: adminEmail,
      ip_address: ip,
      browser: browserName,
      device: deviceName,
      action,
      target_type: targetType,
      target_id: targetId,
      previous_value: previousValue || {},
      new_value: newValue || {}
    };

    const { error } = await supabase.from("admin_audit_logs").insert(payload);
    if (error) throw error;
  },

  /**
   * Load dynamic permissions mappings
   */
  async getRolePermissions(): Promise<RolePermission[]> {
    this.checkBackend();
    const { data, error } = await supabase
      .from("role_permissions")
      .select("*");

    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      role: p.role,
      resource: p.resource,
      action: p.action,
      allowed: p.allowed
    }));
  },

  /**
   * Update a specific granular permission rule in permissions matrix
   */
  async updateRolePermission(permissionId: string, allowed: boolean): Promise<void> {
    this.checkBackend();
    const { error } = await supabase
      .from("role_permissions")
      .update({ allowed })
      .eq("id", permissionId);

    if (error) throw error;
  },

  /**
   * Load feature flags list
   */
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    this.checkBackend();
    const { data, error } = await supabase
      .from("feature_flags")
      .select("*");

    if (error) throw error;
    return (data || []).map((f: any) => ({
      id: f.id,
      key: f.key,
      label: f.label,
      description: f.description,
      enabled: f.enabled
    }));
  },

  /**
   * Update a specific feature flag state
   */
  async updateFeatureFlag(flagId: string, enabled: boolean): Promise<void> {
    this.checkBackend();
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled })
      .eq("id", flagId);

    if (error) throw error;
  },

  /**
   * SQL RPC for modular Dashboard Analytics
   */
  async getDashboardAnalytics(): Promise<any> {
    this.checkBackend();
    try {
      const { data, error } = await supabase.rpc("get_dashboard_analytics");
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("[adminService] RPC get_dashboard_analytics missing/failed. Falling back to default stats.");
      return null;
    }
  },

  /**
   * SQL RPC for Healthcare Intelligence
   */
  async getHealthcareIntelligence(): Promise<any> {
    this.checkBackend();
    try {
      const { data, error } = await supabase.rpc("get_healthcare_intelligence");
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("[adminService] RPC get_healthcare_intelligence missing/failed. Falling back to default stats.");
      return null;
    }
  },

  /**
   * Server-side paginated & cursor search users list
   */
  async searchUsersPaginated(query: string, limit: number, offset: number): Promise<any[]> {
    this.checkBackend();
    try {
      const { data, error } = await supabase.rpc("search_users_paginated", {
        search_query: query,
        page_limit: limit,
        page_offset: offset
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("[adminService] RPC search_users_paginated missing. Falling back to standard select query.", err);
      try {
        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role, created_at");
        if (profErr) throw profErr;

        const filtered = (profiles || []).filter((p: any) =>
          (p.full_name || "").toLowerCase().includes(query.toLowerCase())
        );
        return filtered.slice(offset, offset + limit).map((p: any) => ({
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          role: p.role,
          email: "",
          created_at: p.created_at,
          family_members_count: 0
        }));
      } catch (fallbackErr) {
        console.error("[adminService] Local fallback search failed:", fallbackErr);
        return [];
      }
    }
  },


  // Server-side machine name search 
  async searchMedicines(query: string) {
    this.checkBackend();

    const searchText = query.trim();

    if (searchText.length < 2) {
      return [];
    }

    const { data, error } = await supabase.rpc("search_medicines", {
      search_text: searchText,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },
};

