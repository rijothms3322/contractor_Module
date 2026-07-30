"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { notificationService } from "../services/notificationService";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { authService } from "../services/authService";
import { medicineService } from "../services/medicineService";
import { reminderService } from "../services/reminderService";
import { bookingService } from "../services/bookingService";
import { adminService, UserRole, AdminAuditLog, FeatureFlag, RolePermission } from "../services/adminService";
import {
  Profile,
  FamilyMember,
  Medicine,
  Reminder,
  Lab,
  DiagnosticTest,
  Booking,
  HealthReport,
  Notification,
  DEFAULT_PROFILE,
  DEFAULT_MEDICINES,
  generateDefaultReminders,
  DEFAULT_LABS,
  DEFAULT_TESTS,
  DEFAULT_BOOKINGS
} from "../lib/mockData";

const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("localStorage.getItem blocked/failed:", e);
    }
    return null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn("localStorage.setItem blocked/failed:", e);
    }
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn("localStorage.removeItem blocked/failed:", e);
    }
  },
  clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      console.warn("localStorage.clear blocked/failed:", e);
    }
  }
};

export interface EmergencyContact {
  primaryName: string;
  primaryPhone: string;
  primaryRel: string;
  secondaryName?: string;
  secondaryPhone?: string;
  secondaryRel?: string;
}

export interface WellnessLog {
  date: string;
  time: string;
  mood: "great" | "okay" | "not_well" | "need_help";
}

export interface CheckInConfig {
  checkInTime: string;
  reminderWindowMins: number;
  alertCaregiverWindowMins: number;
}

export type TabType = "home" | "health" | "insights" | "wellness" | "profile" | "admin" | "admin-operations" | "admin-analytics" | "admin-system";

interface AppContextType {
  // Auth State
  user: Profile | null;
  isLoggedIn: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  login: (email: string, password?: string, targetRole?: "user" | "admin") => Promise<boolean>;
  signup: (email: string, password?: string, fullName?: string, targetRole?: "user" | "admin") => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profileData: Partial<Profile>) => void;
  isLoading: boolean;

  // Admin Role Management
  adminRole: UserRole["role"] | null;
  adminRoles: UserRole[];
  auditLogs: AdminAuditLog[];
  rolePermissions: RolePermission[];
  featureFlags: FeatureFlag[];
  dashboardStats: any | null;
  healthcareStats: any | null;
  isBackendAvailable: boolean;
  assignAdminRole: (email: string, role: UserRole["role"]) => Promise<void>;
  revokeAdminRole: (roleId: string) => Promise<void>;
  updatePermissionRule: (permId: string, allowed: boolean) => Promise<void>;
  toggleFeatureFlagState: (flagId: string, enabled: boolean) => Promise<void>;
  fetchOperationsAnalytics: () => Promise<void>;
  searchPatientsPaginated: (query: string, limit: number, offset: number) => Promise<any[]>;
  fetchAuditLogs: () => Promise<void>;

  // Family Members
  familyMembers: FamilyMember[];
  addFamilyMember: (member: Omit<FamilyMember, "id" | "adherenceRate">) => void;
  updateFamilyMember: (memberId: string, memberData: Partial<FamilyMember>) => void;
  deleteFamilyMember: (memberId: string) => void;

  // Medicines & Reminders
  medicines: Medicine[];
  reminders: Reminder[];
  addMedicine: (medicine: Omit<Medicine, "id">, targetFamilyMemberId?: string | null) => void;
  editMedicine: (medicineId: string, updatedFields: Partial<Medicine>, targetFamilyMemberId?: string | null) => void;
  updateMedicineStock: (medicineId: string, newStock: number) => void;
  deleteMedicine: (medicineId: string) => void;
  deleteReminder: (reminderId: string) => void;
  snoozeReminder: (reminderId: string, minutes: number) => void;
  toggleReminderStatus: (reminderId: string, status: "pending" | "taken" | "missed", operatorUserId?: string) => void;
  adherenceStreak: number | "no_medicines";
  familyAdherenceStreak: number | "no_medicines";
  adherencePercentage: number;
  isLinkedToFamily: boolean;
  setIsLinkedToFamily: React.Dispatch<React.SetStateAction<boolean>>;
  activeFamily: { id: string; name: string; familyCode: string; adminId: string } | null;
  createFamily: (name: string) => Promise<boolean>;
  joinFamily: (familyId: string, name: string, code: string, adminId: string) => Promise<boolean>;
  leaveFamily: () => Promise<boolean>;
  disbandFamily: () => Promise<boolean>;
  removeFamilyMember: (memberId: string) => Promise<boolean>;
  transferAdminRights: (memberId: string) => Promise<boolean>;
  renameFamily: (name: string) => Promise<boolean>;
  regenerateFamilyCode: () => Promise<boolean>;
  
  // Wellness Engine
  wellnessScore: number;
  familyWellnessScore: number;
  wellnessCategory: string;
  familyWellnessCategory: string;
  wellnessTrend: string;
  familyAlerts: string[];
  unlockedAchievements: { id: string; title: string; desc: string; icon: string }[];
  medicationLogs: any[];
  calculateDailyScore: (dayStr: string, remindersList: Reminder[], logsList: any[], targetFamilyMemberId?: string | null) => number;
  getWellnessScoreForMember: (targetFamilyMemberId: string | null, remindersList: Reminder[], logsList: any[]) => number;

  // Labs & Bookings
  labs: Lab[];
  tests: DiagnosticTest[];
  bookings: Booking[];
  createBooking: (labId: string, testIds: string[], timeSlot: string, addressId: string) => Booking;
  createMedicineOrder: (pharmacyId: string, medicineIds: string[], deliverySlot: string, addressId: string) => Booking;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
  assignPhlebotomist: (bookingId: string, name: string, phone: string) => void;

  // Reports
  reports: HealthReport[];
  uploadReportPlaceholder: (testName: string, textSummary: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  activeNotification: {
    id: string;
    reminderId: string;
    name: string;
    dosage: string;
    recipientName: string;
    timeLabel: string;
  } | null;
  setActiveNotification: React.Dispatch<React.SetStateAction<{
    id: string;
    reminderId: string;
    name: string;
    dosage: string;
    recipientName: string;
    timeLabel: string;
  } | null>>;
  elderlyMode: boolean;
  toggleElderlyMode: () => void;

  // Emergency Contact & SOS
  emergencyContact: EmergencyContact | null;
  setEmergencyContact: (contact: EmergencyContact) => void;

  // Wellness Logs & Config
  wellnessLogs: WellnessLog[];
  addWellnessLog: (mood: WellnessLog["mood"]) => void;
  checkInConfig: CheckInConfig;
  setCheckInConfig: (config: CheckInConfig) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = safeLocalStorage.getItem("medimz_user");
      const storedIsLoggedIn = safeLocalStorage.getItem("medimz_isLoggedIn");
      if (storedUser && storedIsLoggedIn === "true") {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.avatarUrl && parsed.avatarUrl.includes("googleusercontent.com")) {
            parsed.avatarUrl = "https://api.dicebear.com/7.x/lorelei/svg?seed=Sarah&radius=50";
            safeLocalStorage.setItem("medimz_user", JSON.stringify(parsed));
          }
          return parsed;
        } catch (err) {
          console.warn("Failed to parse stored user profile:", err);
        }
      }
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return safeLocalStorage.getItem("medimz_isLoggedIn") === "true";
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== "undefined") {
      const storedUser = safeLocalStorage.getItem("medimz_user");
      const storedIsLoggedIn = safeLocalStorage.getItem("medimz_isLoggedIn");
      if (storedUser && storedIsLoggedIn === "true") {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.email === "teams@medimz.com") {
            return "admin-operations";
          }
        } catch (e) {}
      }
    }
    return "home";
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(true); // default to true since we initialize synchronously

  // Admin states
  const [adminRole, setAdminRole] = useState<UserRole["role"] | null>(null);
  const [adminRoles, setAdminRoles] = useState<UserRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any | null>(null);
  const [healthcareStats, setHealthcareStats] = useState<any | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(isSupabaseConfigured);
  
  const [elderlyMode, setElderlyMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("medimz_elderly_mode") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (elderlyMode) {
        document.documentElement.classList.add("elderly-mode");
      } else {
        document.documentElement.classList.remove("elderly-mode");
      }
    }
  }, [elderlyMode]);

  const toggleElderlyMode = () => {
    setElderlyMode(prev => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("medimz_elderly_mode", String(next));
      }
      return next;
    });
  };

  const [emergencyContact, setEmergencyContactState] = useState<EmergencyContact | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("medimz_emergency_contact");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const setEmergencyContact = (contact: EmergencyContact) => {
    setEmergencyContactState(contact);
    if (typeof window !== "undefined") {
      localStorage.setItem("medimz_emergency_contact", JSON.stringify(contact));
    }
  };

  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>(() => {
    const generateDefaultWellnessLogs = (): WellnessLog[] => {
      const logs: WellnessLog[] = [];
      const moods: WellnessLog["mood"][] = ["great", "great", "okay", "great", "not_well", "great", "okay"];
      for (let i = 7; i >= 1; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        logs.push({
          date: d.toISOString().split("T")[0],
          time: "08:15",
          mood: moods[7 - i]
        });
      }
      return logs;
    };

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("medimz_wellness_logs");
      return stored ? JSON.parse(stored) : generateDefaultWellnessLogs();
    }
    return generateDefaultWellnessLogs();
  });

  const addWellnessLog = (mood: WellnessLog["mood"]) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    
    setWellnessLogs(prev => {
      let updated = [...prev];
      const todayIdx = updated.findIndex(log => log.date === todayStr);
      if (todayIdx > -1) {
        updated[todayIdx] = { date: todayStr, time: timeStr, mood };
      } else {
        updated.push({ date: todayStr, time: timeStr, mood });
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("medimz_wellness_logs", JSON.stringify(updated));
      }
      return updated;
    });

    if (mood === "need_help") {
      const newNotif = {
        id: `sos-notif-${Date.now()}`,
        title: "Caregiver Alert Sent",
        message: "Sarah reported 'Need Help' this morning. Designated contacts have been alerted.",
        type: "system" as const,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const [checkInConfig, setCheckInConfigState] = useState<CheckInConfig>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("medimz_checkin_config");
      return stored ? JSON.parse(stored) : { checkInTime: "08:00", reminderWindowMins: 120, alertCaregiverWindowMins: 120 };
    }
    return { checkInTime: "08:00", reminderWindowMins: 120, alertCaregiverWindowMins: 120 };
  });

  const setCheckInConfig = (config: CheckInConfig) => {
    setCheckInConfigState(config);
    if (typeof window !== "undefined") {
      localStorage.setItem("medimz_checkin_config", JSON.stringify(config));
    }
  };


  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    reminderId: string;
    name: string;
    dosage: string;
    recipientName: string;
    timeLabel: string;
  } | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    if (typeof window !== "undefined") {
      const storedFam = safeLocalStorage.getItem("medimz_family");
      return storedFam ? JSON.parse(storedFam) : [];
    }
    return [];
  });

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    if (typeof window !== "undefined") {
      const storedMed = safeLocalStorage.getItem("medimz_medicines");
      return storedMed ? JSON.parse(storedMed) : [];
    }
    return [];
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    if (typeof window !== "undefined") {
      const storedRem = safeLocalStorage.getItem("medimz_reminders");
      return storedRem ? JSON.parse(storedRem) : [];
    }
    return [];
  });

  const [labs] = useState<Lab[]>(DEFAULT_LABS);
  const [isLinkedToFamily, setIsLinkedToFamily] = useState<boolean>(false);
  const [tests] = useState<DiagnosticTest[]>(DEFAULT_TESTS);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window !== "undefined") {
      const storedBook = safeLocalStorage.getItem("medimz_bookings");
      return storedBook ? JSON.parse(storedBook) : [];
    }
    return [];
  });

  const [reports, setReports] = useState<HealthReport[]>(() => {
    if (typeof window !== "undefined") {
      const storedReports = safeLocalStorage.getItem("medimz_reports");
      return storedReports ? JSON.parse(storedReports) : [];
    }
    return [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== "undefined") {
      const storedNotif = safeLocalStorage.getItem("medimz_notifs");
      return storedNotif ? JSON.parse(storedNotif) : [];
    }
    return [];
  });

  const [adherenceStreak, setAdherenceStreak] = useState<number | "no_medicines">("no_medicines");
  const [familyAdherenceStreak, setFamilyAdherenceStreak] = useState<number | "no_medicines">("no_medicines");
  const [adherencePercentage, setAdherencePercentage] = useState<number>(0);

  // Wellness Engine state declarations
  const [wellnessScore, setWellnessScore] = useState<number>(0);
  const [familyWellnessScore, setFamilyWellnessScore] = useState<number>(0);
  const [wellnessCategory, setWellnessCategory] = useState<string>("No Data");
  const [familyWellnessCategory, setFamilyWellnessCategory] = useState<string>("No Data");
  const [wellnessTrend, setWellnessTrend] = useState<string>("No Trend");
  const [familyAlerts, setFamilyAlerts] = useState<string[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<{ id: string; title: string; desc: string; icon: string }[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<any[]>([]);
  const [activeFamily, setActiveFamily] = useState<{ id: string; name: string; familyCode: string; adminId: string } | null>(null);

  // ====================================================================
  // INITIALIZATION TRIGGER & AUTH OBSERVER
  // ====================================================================
  const familyMembersRef = React.useRef(familyMembers);
  const userRef = React.useRef(user);

  useEffect(() => {
    familyMembersRef.current = familyMembers;
  }, [familyMembers]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    // RESTORE STANDARD AUTH OBSERVER AND STORAGE LOAD
    if (!isSupabaseConfigured) {
      return;
    }

    let familySyncChannel: any = null;

    // 2. LIVE SUPABASE REAL-TIME SESSION OBSERVER
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        setIsLoading(true);
        try {
          // Fetch authenticated profile details
          const profile = await authService.getProfile(session.user.id);
          
          let resolvedRole: UserRole["role"] | null = null;
          if (session.user.email === "teams@medimz.com") {
            resolvedRole = "super_admin";
            await adminService.assignUserRole(session.user.email, session.user.email, "super_admin").catch(() => {});
          } else {
            try {
              const roles = await adminService.getAllUserRoles();
              const matched = roles.find(r => r.email === session.user.email?.toLowerCase().trim());
              if (matched) {
                resolvedRole = matched.role;
              }
            } catch (err) {}
          }

          const isUserAdmin = resolvedRole !== null;
          const finalRole: "admin" | "user" = isUserAdmin ? "admin" : "user";
          setUser({ ...profile, role: finalRole, email: session.user.email });
          setAdminRole(resolvedRole);
          setIsLoggedIn(true);

          if (isUserAdmin) {
            // Load operations center metrics
            adminService.getDashboardAnalytics().then(stats => setDashboardStats(stats)).catch(() => {});
            adminService.getHealthcareIntelligence().then(hStats => setHealthcareStats(hStats)).catch(() => {});
            adminService.getFeatureFlags().then(flags => setFeatureFlags(flags)).catch(() => {});
            adminService.getRolePermissions().then(perms => setRolePermissions(perms)).catch(() => {});
            adminService.getAuditLogs().then(logs => setAuditLogs(logs)).catch(() => {});
            adminService.getAllUserRoles().then(allRoles => setAdminRoles(allRoles)).catch(() => {});
          }
 
          const safeFetch = async <T,>(promise: Promise<T>, fallback: T, label: string): Promise<T> => {
            const timeout = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout fetching ${label}`)), 6000)
            );
            try {
              return await Promise.race([promise, timeout]);
            } catch (err) {
              console.warn(`[Supabase Fetch Warning] Failed to load ${label}, using fallback:`, err);
              return fallback;
            }
          };

          const [
            dbMeds,
            dbFam,
            dbRems,
            dbBookings,
            dbReports,
            dbNotifs
          ] = await Promise.all([
            safeFetch(medicineService.getMedicines(session.user.id), medicines, "medicines"),
            safeFetch(medicineService.getFamilyMembers(session.user.id), familyMembers, "family members"),
            safeFetch(reminderService.getReminders(session.user.id), reminders, "reminders"),
            safeFetch(bookingService.getBookings(session.user.id), bookings, "bookings"),
            safeFetch(bookingService.getReports(session.user.id), reports, "reports"),
            safeFetch(reminderService.getNotifications(session.user.id), notifications, "notifications")
          ]);
 
          // Deduplicate medicines: keep only one medicine per name and dosage
          const uniqueMeds: Medicine[] = [];
          const seenMedKeys = new Set<string>();
          const duplicateMedIds: string[] = [];

          dbMeds.forEach(m => {
            const key = `${m.name.toLowerCase()}-${m.dosage.toLowerCase()}`;
            if (seenMedKeys.has(key)) {
              duplicateMedIds.push(m.id);
            } else {
              seenMedKeys.add(key);
              uniqueMeds.push(m);
            }
          });

          if (duplicateMedIds.length > 0) {
            supabase
              .from("medicines")
              .delete()
              .in("id", duplicateMedIds)
              .then((res: any) => {
                if (res.error) console.error("Failed to clean up duplicate medicines from database:", res.error);
              });
          }

          // Deduplicate reminders: keep only one reminder per medicine, time, and family member
          const uniqueRems: Reminder[] = [];
          const seenKeys = new Set<string>();
          const duplicateIdsToDelete: string[] = [];

          dbRems.forEach(r => {
            const key = `${r.medicineId}-${r.scheduledTime}-${r.familyMemberId || "null"}`;
            if (seenKeys.has(key)) {
              duplicateIdsToDelete.push(r.id);
            } else {
              seenKeys.add(key);
              uniqueRems.push(r);
            }
          });

          if (duplicateIdsToDelete.length > 0) {
            supabase
              .from("reminders")
              .delete()
              .in("id", duplicateIdsToDelete)
              .then((res: any) => {
                if (res.error) console.error("Failed to clean up duplicate reminders from database:", res.error);
              });
          }

          // Fetch active family and other member details
          let familyObj: any = null;
          let sharedMeds: Medicine[] = [];
          let sharedRems: Reminder[] = [];
          let sharedFam: FamilyMember[] = [];

          if (profile?.familyId) {
            console.log("Medimz Link System: User belongs to family UUID:", profile.familyId);
            const { data: famData, error: famErr } = await supabase
              .from("families")
              .select("*")
              .eq("id", profile.familyId)
              .maybeSingle();

            if (!famErr && famData) {
              familyObj = {
                id: famData.id,
                name: famData.name,
                familyCode: famData.family_code,
                adminId: famData.admin_id
              };

              console.log("Medimz Link System: Found family data:", familyObj.name);

              // Query all profiles sharing the same family_id
              const { data: familyProfiles, error: profsErr } = await supabase
                .from("profiles")
                .select("*")
                .eq("family_id", profile.familyId);

              if (!profsErr && familyProfiles) {
                const otherProfiles = familyProfiles.filter((p: any) => p.id !== session.user.id);
                console.log("Medimz Link System: Found other family members count:", otherProfiles.length);

                await Promise.all(otherProfiles.map(async (mProfile: any) => {
                  sharedFam.push({
                    id: mProfile.id,
                    name: mProfile.full_name,
                    avatarUrl: mProfile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mProfile.full_name)}`,
                    relationship: mProfile.id === familyObj.adminId ? "Family Admin" : "Family Member",
                    age: mProfile.age || 35,
                    gender: mProfile.gender || "Male",
                    medicalConditions: mProfile.medical_conditions || [],
                    color: "purple"
                  });

                  try {
                    const [lMeds, lRems] = await Promise.all([
                      safeFetch(medicineService.getMedicines(mProfile.id), [], `medicines for ${mProfile.full_name}`),
                      safeFetch(reminderService.getReminders(mProfile.id), [], `reminders for ${mProfile.full_name}`)
                    ]);
                    
                    // Filter out private items
                    const publicMeds = lMeds.filter(m => !m.isPrivate);
                    const publicRems = lRems.filter(r => !r.isPrivate);

                    console.log(`Medimz Link System: Loaded ${publicMeds.length} public meds and ${publicRems.length} public reminders for member ${mProfile.full_name}`);

                    const mappedRems = publicRems.map(r => ({
                      ...r,
                      familyMemberId: r.familyMemberId || mProfile.id,
                      recipientNickname: r.recipientNickname && r.recipientNickname !== "Myself" ? r.recipientNickname : mProfile.full_name,
                      recipientAvatar: r.recipientAvatar || mProfile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mProfile.full_name)}`,
                      recipientColor: r.recipientColor || "purple"
                    }));

                    sharedMeds.push(...publicMeds);
                    sharedRems.push(...mappedRems);
                  } catch (err) {
                    console.error(`Failed to load medicines for member ${mProfile.full_name}:`, err);
                  }
                }));
              }
            }
          }

          // Resolve care recipient nickname/avatar/color dynamically on query fetch load
          const resolvedRems = uniqueRems.map(r => {
            const fm = dbFam.find(f => f.id === r.familyMemberId);
            return {
              ...r,
              recipientNickname: fm ? (fm.nickname || fm.name) : "Myself",
              recipientAvatar: fm ? fm.avatarUrl : (profile?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=Sarah"),
              recipientColor: fm ? (fm.color || "blue") : "orange"
            };
          });

          const allMeds = [...uniqueMeds, ...sharedMeds];
          const allFam = [...dbFam, ...sharedFam];
          const allRems = [...resolvedRems, ...sharedRems];

          setActiveFamily(familyObj);
          setIsLinkedToFamily(!!profile?.familyId);
          setMedicines(Array.from(new Map(allMeds.map(m => [m.id, m])).values()));
          setFamilyMembers(Array.from(new Map(allFam.map(f => [f.id, f])).values()));
          setReminders(Array.from(new Map(allRems.map(r => [r.id, r])).values()));
          setBookings(dbBookings);
          setReports(dbReports);
          setNotifications(dbNotifs);

          // Real-time listener for all family changes on a single unified channel
          if (familySyncChannel) {
            familySyncChannel.unsubscribe();
          }

          familySyncChannel = supabase
            .channel(`family-sync-${profile.familyId || 'public'}`)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "profiles"
              },
              (payload: any) => {
                const updatedProfile = payload.new;
                console.log("Real-time profiles sync update:", updatedProfile);
                
                // If it is the active user's own profile, update local user state
                if (updatedProfile.id === session.user.id) {
                  setUser(prev => prev ? {
                    ...prev,
                    fullName: updatedProfile.full_name,
                    avatarUrl: updatedProfile.avatar_url || prev.avatarUrl,
                    age: updatedProfile.age || prev.age,
                    gender: updatedProfile.gender || prev.gender,
                    medicalConditions: updatedProfile.medical_conditions || prev.medicalConditions
                  } : null);
                }

                // Update roster listings for family members sharing the same family ID immediately
                setFamilyMembers(prev =>
                  prev.map(fm =>
                    fm.id === updatedProfile.id
                      ? {
                          ...fm,
                          name: updatedProfile.full_name,
                          avatarUrl: updatedProfile.avatar_url || fm.avatarUrl,
                          age: updatedProfile.age || fm.age,
                          gender: updatedProfile.gender || fm.gender,
                          medicalConditions: updatedProfile.medical_conditions || fm.medicalConditions
                        }
                      : fm
                  )
                );
              }
            )
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "medicines"
              },
              (payload: any) => {
                const { eventType, new: newMed, old: oldMed } = payload;
                console.log(`Real-time medicines sync event: ${eventType}`, payload);

                if (eventType === "DELETE") {
                  setMedicines(prev => prev.filter(m => m.id !== oldMed.id));
                } else {
                  // Verify if the medicine belongs to us or a family member
                  const isFamMed = newMed.user_id === session.user.id || 
                    familyMembersRef.current.some(f => f.id === newMed.user_id);
                  
                  if (!isFamMed) return;

                  // Filter out private medicines if it belongs to someone else
                  if (newMed.user_id !== session.user.id && newMed.is_private) {
                    setMedicines(prev => prev.filter(m => m.id !== newMed.id));
                    return;
                  }

                  const mappedMed: Medicine = {
                    id: newMed.id,
                    name: newMed.generic_name,
                    dosage: newMed.strength || "",
                    instructions: newMed.dosage_form || "",
                    frequency: (newMed.schedule_type === "weekly" ? "weekly" : "daily") as any,
                    timings: [],
                    startDate: newMed.created_at ? newMed.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
                    isPrivate: newMed.is_private || false,
                    stockCount: 0
                  };

                  if (eventType === "INSERT") {
                    setMedicines(prev => {
                      if (prev.some(m => m.id === mappedMed.id)) return prev;
                      return [...prev, mappedMed];
                    });
                  } else if (eventType === "UPDATE") {
                    setMedicines(prev => prev.map(m => m.id === mappedMed.id ? mappedMed : m));
                  }
                }
              }
            )
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "reminders"
              },
              (payload: any) => {
                const { eventType, new: newRem, old: oldRem } = payload;
                console.log(`Real-time reminders sync event: ${eventType}`, payload);

                if (eventType === "DELETE") {
                  setReminders(prev => prev.filter(r => r.id !== oldRem.id));
                } else {
                  const isFamRem = newRem.user_id === session.user.id || 
                    familyMembersRef.current.some(f => f.id === newRem.user_id);
                  
                  if (!isFamRem) return;

                  if (newRem.user_id !== session.user.id && newRem.is_private) {
                    setReminders(prev => prev.filter(r => r.id !== newRem.id));
                    return;
                  }

                  const fm = familyMembersRef.current.find(f => f.id === newRem.user_id);
                  const mappedRem: Reminder = {
                    id: newRem.id,
                    medicineId: newRem.medicine_id,
                    medicineName: newRem.medicine_name,
                    dosage: newRem.dosage || "",
                    instructions: newRem.instructions || "",
                    scheduledTime: newRem.scheduled_time,
                    timingSlot: (newRem.timing_slot || "morning") as any,
                    status: newRem.status as any,
                    isPrivate: newRem.is_private || false,
                    familyMemberId: newRem.user_id,
                    recipientNickname: fm ? (fm.nickname || fm.name) : "Myself",
                    recipientAvatar: fm ? fm.avatarUrl : (profile?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User"),
                    recipientColor: fm ? (fm.color || "purple") : "orange",
                    takenAt: newRem.taken_at || undefined,
                    snoozedUntil: newRem.snoozed_until || undefined
                  };

                  if (eventType === "INSERT") {
                    setReminders(prev => {
                      if (prev.some(r => r.id === mappedRem.id)) return prev;
                      return [...prev, mappedRem];
                    });
                  } else if (eventType === "UPDATE") {
                    setReminders(prev => prev.map(r => r.id === mappedRem.id ? mappedRem : r));
                  }
                }
              }
            )
            .subscribe();

        } catch (e) {
          console.error("[Medimz Sync Error] Failed to load data from live Supabase:", e);
        } finally {
          setIsLoading(false);
          setIsInitialized(true);
        }
      } else {
        // Reset states completely on logout
        setUser(null);
        setIsLoggedIn(false);
        setMedicines([]);
        setFamilyMembers([]);
        setReminders([]);
        setBookings([]);
        setReports([]);
        setNotifications([]);
        setIsLinkedToFamily(false);
        setIsInitialized(true);
      }
    });
 
    return () => {
      subscription.unsubscribe();
      if (familySyncChannel) {
        familySyncChannel.unsubscribe();
      }
    };
  }, []);

  // Initialize native notifications and handle quick action listener hooks
  useEffect(() => {
    notificationService.init();
    notificationService.setupActionListeners({
      onTaken: (medId) => {
        setReminders(prev => prev.map(r => {
          if (r.medicineId === medId && r.status === "pending") {
            return { ...r, status: "taken", takenAt: new Date().toISOString() };
          }
          return r;
        }));
      },
      onSnooze: (medId, mins) => {
        setReminders(prev => prev.map(r => {
          if (r.medicineId === medId && r.status === "pending") {
            const snoozeDate = new Date(Date.now() + mins * 60 * 1000).toISOString();
            return { ...r, snoozedUntil: snoozeDate };
          }
          return r;
        }));
      },
      onSkip: (medId) => {
        setReminders(prev => prev.map(r => {
          if (r.medicineId === medId && r.status === "pending") {
            return { ...r, status: "missed" };
          }
          return r;
        }));
      }
    });
  }, []);

  // Record session start time to prevent ancient historical mock reminders from firing automatically
  const sessionStartTime = useRef(new Date(Date.now() - 60 * 1000)); // 1 min buffer

  // Active background interval checking if any reminder time is reached
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!isLoggedIn) return;
      const now = new Date();
      
      const dueReminder = reminders.find(r => {
        if (r.status !== "pending") return false;
        if (notifiedIds.includes(r.id)) return false;
        
        const targetTime = r.snoozedUntil ? new Date(r.snoozedUntil) : new Date(r.scheduledTime);
        // Only trigger reminders scheduled/snoozed for the current active session
        return targetTime >= sessionStartTime.current && targetTime <= now;
      });

      if (dueReminder) {
        setNotifiedIds(prev => [...prev, dueReminder.id]);
        
        // Trigger visual overlay banner on localhost:3000
        setActiveNotification({
          id: dueReminder.medicineId,
          reminderId: dueReminder.id,
          name: dueReminder.medicineName,
          dosage: dueReminder.dosage,
          recipientName: dueReminder.recipientNickname || "Myself",
          timeLabel: dueReminder.intakeTime || new Date(dueReminder.scheduledTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        });
        
        // Trigger native notification if in Capacitor APK environment
        notificationService.scheduleMedicineReminder({
          id: dueReminder.medicineId,
          name: dueReminder.medicineName,
          dosage: dueReminder.dosage,
          recipientName: dueReminder.recipientNickname || "Myself",
          timeLabel: dueReminder.intakeTime || "8:00 AM"
        }, 1);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(checkInterval);
  }, [reminders, isLoggedIn, notifiedIds]);

  // ====================================================================
  // LOCALSTORAGE SYNC BLOCK (Only active when Supabase is disabled)
  // ====================================================================
  useEffect(() => {
    if (!isInitialized) return;
    if (isLoggedIn && user) {
      safeLocalStorage.setItem("medimz_user", JSON.stringify(user));
      safeLocalStorage.setItem("medimz_isLoggedIn", "true");
    } else {
      safeLocalStorage.removeItem("medimz_user");
      safeLocalStorage.setItem("medimz_isLoggedIn", "false");
    }
  }, [user, isLoggedIn, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (familyMembers.length > 0) {
      safeLocalStorage.setItem("medimz_family", JSON.stringify(familyMembers));
    }
  }, [familyMembers, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (medicines.length > 0) {
      safeLocalStorage.setItem("medimz_medicines", JSON.stringify(medicines));
    }
  }, [medicines, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (reminders.length > 0) {
      safeLocalStorage.setItem("medimz_reminders", JSON.stringify(reminders));
      calculateMetrics(reminders);
    }
  }, [reminders, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (bookings.length > 0) {
      safeLocalStorage.setItem("medimz_bookings", JSON.stringify(bookings));
    }
  }, [bookings, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    if (reports.length > 0) {
      safeLocalStorage.setItem("medimz_reports", JSON.stringify(reports));
    }
  }, [reports, isInitialized]);

  // Listen for online events to synchronize offline actions
  useEffect(() => {
    const handleOnline = () => {
      const queueStr = safeLocalStorage.getItem("medimz_offline_queue");
      if (!queueStr) return;
      try {
        const queue = JSON.parse(queueStr);
        if (queue.length === 0) return;

        if (isSupabaseConfigured && user) {
          queue.forEach((item: any) => {
            if (item.action === "addMedicine") {
              medicineService.addMedicine(user.id, item.data.medicine).then(dbMed => {
                const dbRems = generateDefaultReminders().map(r => ({
                  medicineId: dbMed.id,
                  familyMemberId: item.data.targetFamilyMemberId || null,
                  scheduledTime: r.scheduledTime,
                  timingSlot: r.timingSlot,
                  status: r.status as any
                }));
                reminderService.addReminders(user.id, dbRems);
              });
            }
          });
        }
        safeLocalStorage.removeItem("medimz_offline_queue");
        addNotification("Back Online! ⚡", "Successfully synchronized your offline medicine reminders to the cloud.", "system");
      } catch (e) {
        console.error("Failed to parse offline sync queue:", e);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
      }
    };
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured && notifications.length > 0) {
      safeLocalStorage.setItem("medimz_notifs", JSON.stringify(notifications));
    }
  }, [notifications]);

  const getWellnessCategory = (score: number): string => {
    if (score >= 9.0) return "Excellent";
    if (score >= 8.0) return "Very Good";
    if (score >= 7.0) return "Good";
    if (score >= 5.0) return "Needs Attention";
    return "Critical";
  };

  const calculateDailyScore = (
    dayStr: string,
    remindersList: Reminder[],
    logsList: any[],
    targetFamilyMemberId?: string | null
  ): number => {
    const dayReminders = remindersList.filter(r => {
      const matchMember = targetFamilyMemberId 
        ? r.familyMemberId === targetFamilyMemberId 
        : !r.familyMemberId;
      const rDateStr = r.scheduledTime ? r.scheduledTime.split("T")[0] : "";
      return matchMember && rDateStr === dayStr;
    });

    if (dayReminders.length === 0) {
      return 10.0;
    }

    let totalScore = 0;
    let countedDoses = 0;

    dayReminders.forEach(r => {
      const isPast = new Date(r.scheduledTime).getTime() <= new Date().getTime();

      if (r.status === "taken") {
        let delayMins = 0;
        if (r.takenAt) {
          const sched = new Date(r.scheduledTime).getTime();
          const taken = new Date(r.takenAt).getTime();
          delayMins = Math.max(0, (taken - sched) / 60000);
        }
        
        if (delayMins <= 15) totalScore += 10;
        else if (delayMins <= 60) totalScore += 9;
        else if (delayMins <= 180) totalScore += 8;
        else if (delayMins <= 360) totalScore += 6;
        else totalScore += 4;
        
        countedDoses++;
      } else if (r.status === "missed" || (r.status === "pending" && isPast && !r.snoozedUntil)) {
        totalScore += 0;
        countedDoses++;
      } else if (r.snoozedUntil) {
        totalScore += 7;
        countedDoses++;
      }
    });

    if (countedDoses === 0) {
      return 10.0;
    }

    return Math.max(0, Math.min(10, totalScore / countedDoses));
  };

  const getWellnessScoreForMember = (
    targetFamilyMemberId: string | null,
    remindersList: Reminder[],
    logsList: any[]
  ): number => {
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      sum += calculateDailyScore(dayStr, remindersList, logsList, targetFamilyMemberId);
    }
    return Math.round((sum / 7) * 10) / 10;
  };

  const getWellnessTrendIndicator = (
    targetFamilyMemberId: string | null,
    remindersList: Reminder[],
    logsList: any[]
  ): string => {
    let thisWeekSum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      thisWeekSum += calculateDailyScore(dayStr, remindersList, logsList, targetFamilyMemberId);
    }
    const thisWeekAvg = thisWeekSum / 7;

    let lastWeekSum = 0;
    for (let i = 7; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      lastWeekSum += calculateDailyScore(dayStr, remindersList, logsList, targetFamilyMemberId);
    }
    const lastWeekAvg = lastWeekSum / 7;

    const diff = thisWeekAvg - lastWeekAvg;
    const sign = diff >= 0 ? "↑" : "↓";
    const prefix = diff >= 0 ? "+" : "";
    return `${sign} ${prefix}${diff.toFixed(1)} compared to last week`;
  };

  const getFamilyAlerts = (remindersList: Reminder[]): string[] => {
    const alerts: string[] = [];
    const todayStr = new Date().toISOString().split("T")[0];
    
    const userMisses = remindersList.filter(r => !r.familyMemberId && r.scheduledTime && r.scheduledTime.split("T")[0] === todayStr && r.status === "missed").length;
    if (userMisses > 0) {
      alerts.push(`You have missed ${userMisses} medicine${userMisses > 1 ? "s" : ""} today.`);
    }

    familyMembers.forEach(member => {
      const misses = remindersList.filter(r => r.familyMemberId === member.id && r.scheduledTime && r.scheduledTime.split("T")[0] === todayStr && r.status === "missed").length;
      if (misses > 0) {
        alerts.push(`${member.name} has missed ${misses} medicine${misses > 1 ? "s" : ""} today.`);
      }
    });

    return alerts;
  };

  const checkAchievements = (remindersList: Reminder[], logsList: any[]) => {
    const unlocked: { id: string; title: string; desc: string; icon: string }[] = [];
    
    const dailyScores: number[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      dailyScores.push(calculateDailyScore(dayStr, remindersList, logsList, null));
    }

    const last7DaysPerfect = dailyScores.slice(0, 7).every(score => score === 10);
    if (last7DaysPerfect) {
      unlocked.push({
        id: "ach-7-perfect",
        title: "7-Day Perfect Adherence",
        desc: "Maintained a perfect 10 score for 7 consecutive days.",
        icon: "verified"
      });
    }

    const last30DaysStreak = dailyScores.every(score => score >= 9.0);
    if (last30DaysStreak) {
      unlocked.push({
        id: "ach-30-streak",
        title: "30-Day Streak",
        desc: "Maintained a very high adherence score above 9.0 for a month.",
        icon: "emoji_events"
      });
    }

    if (last7DaysPerfect) {
      unlocked.push({
        id: "ach-perfect-week",
        title: "Perfect Week",
        desc: "No missed or delayed doses for a whole week.",
        icon: "workspace_premium"
      });
    }

    const totalTaken = remindersList.filter(r => !r.familyMemberId && r.status === "taken").length;
    if (totalTaken + 95 >= 100) {
      unlocked.push({
        id: "ach-centurion",
        title: "100 Medicines Taken",
        desc: "Successfully tracked and logged 100 medicine doses.",
        icon: "stars"
      });
    }

    const userScore = getWellnessScoreForMember(null, remindersList, logsList);
    const familyScores = familyMembers.map(m => ({ name: m.name, score: getWellnessScoreForMember(m.id, remindersList, logsList) }));
    const isChampion = familyScores.every(f => userScore >= f.score);
    if (isChampion && familyMembers.length > 0) {
      unlocked.push({
        id: "ach-family-champ",
        title: "Family Wellness Champion",
        desc: "Held the highest wellness score in your family household.",
        icon: "military_tech"
      });
    }

    return unlocked;
  };

    const getIndividualStreak = (
      targetFamilyMemberId: string | null,
      remindersList: Reminder[]
    ): number | "no_medicines" => {
      const hasAnyReminders = remindersList.some(r => 
        targetFamilyMemberId ? r.familyMemberId === targetFamilyMemberId : !r.familyMemberId
      );
      if (!hasAnyReminders) {
        return "no_medicines";
      }

      let streak = 0;
      let dayOffset = 0;
      
      while (dayOffset < 90) {
        const d = new Date();
        d.setDate(d.getDate() - dayOffset);
        const dayStr = d.toISOString().split("T")[0];

        const dayRems = remindersList.filter(r => {
          const matchMember = targetFamilyMemberId 
            ? r.familyMemberId === targetFamilyMemberId 
            : !r.familyMemberId;
          return matchMember && r.scheduledTime && r.scheduledTime.split("T")[0] === dayStr;
        });

        if (dayRems.length === 0) {
          dayOffset++;
          continue;
        }

        const hasMissed = dayRems.some(r => r.status === "missed");
        const allTaken = dayRems.every(r => r.status === "taken");

        if (hasMissed) {
          break;
        }

        if (allTaken) {
          streak++;
        } else if (dayOffset !== 0) {
          break;
        }

        dayOffset++;
      }

      return streak;
    };

    const getFamilyStreak = (remindersList: Reminder[]): number | "no_medicines" => {
      const userHasRems = remindersList.some(r => !r.familyMemberId);
      const activeMemberIds = familyMembers
        .filter(m => remindersList.some(r => r.familyMemberId === m.id))
        .map(m => m.id);

      const includedIds: (string | null)[] = [];
      if (userHasRems) includedIds.push(null);
      activeMemberIds.forEach(id => includedIds.push(id));

      if (includedIds.length === 0) {
        return "no_medicines";
      }

      let streak = 0;
      let dayOffset = 0;

      while (dayOffset < 90) {
        const d = new Date();
        d.setDate(d.getDate() - dayOffset);
        const dayStr = d.toISOString().split("T")[0];

        const membersWithRemindersOnDay = includedIds.filter(memberId => {
          return remindersList.some(r => {
            const matchMember = memberId ? r.familyMemberId === memberId : !r.familyMemberId;
            return matchMember && r.scheduledTime && r.scheduledTime.split("T")[0] === dayStr;
          });
        });

        if (membersWithRemindersOnDay.length === 0) {
          dayOffset++;
          continue;
        }

        const dayRems = remindersList.filter(r => {
          const isIncluded = r.familyMemberId ? activeMemberIds.includes(r.familyMemberId) : userHasRems;
          return isIncluded && r.scheduledTime && r.scheduledTime.split("T")[0] === dayStr;
        });

        const hasMissed = dayRems.some(r => r.status === "missed");
        const allTaken = dayRems.every(r => r.status === "taken");

        if (hasMissed) {
          break;
        }

        if (allTaken) {
          streak++;
        } else if (dayOffset !== 0) {
          break;
        }

        dayOffset++;
      }

      return streak;
    };

  // Recalculate adherence analytics based on reminders
  const calculateMetrics = (remLogs: Reminder[]) => {
    const userLogs = remLogs.filter(r => !r.familyMemberId);
    if (userLogs.length === 0) {
      setAdherencePercentage(0);
      setAdherenceStreak("no_medicines");
      setFamilyAdherenceStreak("no_medicines");
      setWellnessScore(0);
      setWellnessCategory("No Data");
      setWellnessTrend("No Trend");
      setFamilyWellnessScore(0);
      setFamilyWellnessCategory("No Data");
      setFamilyAlerts([]);
      setUnlockedAchievements([]);
      return;
    }

    const finishedLogs = userLogs.filter(r => r.status !== "pending");
    if (finishedLogs.length === 0) {
      setAdherencePercentage(100);
    } else {
      const takenLogs = finishedLogs.filter(r => r.status === "taken");
      const percentage = Math.round((takenLogs.length / finishedLogs.length) * 100);
      setAdherencePercentage(percentage);
    }

    // Set Streaks
    setAdherenceStreak(getIndividualStreak(null, remLogs));
    setFamilyAdherenceStreak(getFamilyStreak(remLogs));

    const score = getWellnessScoreForMember(null, remLogs, medicationLogs);
    setWellnessScore(score);
    setWellnessCategory(getWellnessCategory(score));
    setWellnessTrend(getWellnessTrendIndicator(null, remLogs, medicationLogs));

    const activeScores: number[] = [];
    const ownRems = remLogs.filter(r => !r.familyMemberId);
    if (ownRems.length > 0) {
      activeScores.push(score);
    }
    
    familyMembers.forEach(m => {
      const mRems = remLogs.filter(r => r.familyMemberId === m.id);
      if (mRems.length > 0) {
        activeScores.push(getWellnessScoreForMember(m.id, remLogs, medicationLogs));
      }
    });

    const familyScoreVal = activeScores.length > 0
      ? Math.round((activeScores.reduce((a, b) => a + b, 0) / activeScores.length) * 10) / 10
      : 0;

    setFamilyWellnessScore(familyScoreVal);
    setFamilyWellnessCategory(getWellnessCategory(familyScoreVal));

    setFamilyAlerts(getFamilyAlerts(remLogs));
    setUnlockedAchievements(checkAchievements(remLogs, medicationLogs));
  };

  // ====================================================================
  // AUTHENTICATION INTERFACES
  // ====================================================================
  const login = async (email: string, password?: string, targetRole: "user" | "admin" = "admin"): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const cleanPassword = password || "password123";
        const { user: dbProfile } = await authService.signIn(email, cleanPassword);

        // Load role details
        let resolvedRole: UserRole["role"] | null = null;
        if (email === "teams@medimz.com") {
          resolvedRole = "super_admin";
          // Seed super admin role dynamically if needed
          await adminService.assignUserRole(email, email, "super_admin").catch(() => {});
        } else {
          const roles = await adminService.getAllUserRoles();
          const matched = roles.find(r => r.email === email.toLowerCase().trim());
          if (matched) {
            resolvedRole = matched.role;
          }
        }

        const isUserAdmin = resolvedRole !== null;
        const finalRole: "admin" | "user" = isUserAdmin ? "admin" : "user";
        const updatedProfile = { ...dbProfile, role: finalRole, email };
        setUser(updatedProfile);
        setAdminRole(resolvedRole);
        setIsLoggedIn(true);

        if (isUserAdmin) {
          setActiveTab("admin-operations");
          const allB = await bookingService.getAllBookingsAdmin();
          setBookings(allB);
          // Load audit logs and admin roles
          const logs = await adminService.getAuditLogs();
          setAuditLogs(logs);
          const allRoles = await adminService.getAllUserRoles();
          setAdminRoles(allRoles);
        } else {
          setActiveTab("home");
        }
      } else {
        // Offline Simulated Mock Login
        const name = email.split("@")[0];
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        
        let resolvedRole: UserRole["role"] | null = null;
        if (email === "teams@medimz.com") {
          resolvedRole = "super_admin";
          await adminService.assignUserRole(email, email, "super_admin").catch(() => {});
        } else {
          try {
            const roles = await adminService.getAllUserRoles();
            const matched = roles.find(r => r.email === email.toLowerCase().trim());
            if (matched) {
              resolvedRole = matched.role;
            }
          } catch (e) {
            console.log("Offline mode: skipping admin role lookup.");
          }
        }

        const isUserAdmin = resolvedRole !== null;
        const finalRole = isUserAdmin ? "admin" : "user";
        const loggedProfile: Profile = {
          ...DEFAULT_PROFILE,
          id: `user-${Date.now()}`,
          fullName: formattedName,
          role: finalRole,
          email
        };
        
        setUser(loggedProfile);
        setAdminRole(resolvedRole);
        setIsLoggedIn(true);

        if (isUserAdmin) {
          setActiveTab("admin-operations");
          try {
            const logs = await adminService.getAuditLogs();
            setAuditLogs(logs);
          } catch (e) {
            console.warn("Offline mode: skipping audit log fetch.");
          }
          try {
            const allRoles = await adminService.getAllUserRoles();
            setAdminRoles(allRoles);
          } catch (e) {
            console.warn("Offline mode: skipping user role list fetch.");
          }
        } else {
          setActiveTab("home");
        }
        addNotification(`Welcome back, ${formattedName}! 👋`, "Successfully logged in to Medimz Healthcare.", "system");
      }
      return true;
    } catch (e: any) {
      console.error("Login failure:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password?: string, fullName?: string, targetRole: "user" | "admin" = "admin"): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        // Live Supabase Patient Register
        const cleanPassword = password || "password123";
        const cleanName = fullName || email.split("@")[0];
        const dbProfile = await authService.signUp(email, cleanPassword, cleanName, targetRole);
        
        const updatedProfile = { ...dbProfile, role: targetRole, email };
        setUser(updatedProfile);
        setIsLoggedIn(true);
      } else {
        // Offline Simulated Mock Signup
        const cleanName = fullName || email.split("@")[0];
        const loggedProfile: Profile = {
          ...DEFAULT_PROFILE,
          id: `user-${Date.now()}`,
          fullName: cleanName,
          role: targetRole
        };
        
        setUser(loggedProfile);
        setIsLoggedIn(true);
        addNotification("Account Created! 🎉", "Welcome to Medimz. Start tracking your health consistency today.", "system");
      }
      return true;
    } catch (e: any) {
      console.error("Signup failure:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const redirectToUrl = typeof window !== "undefined" ? `${window.location.origin}` : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectToUrl,
        });
        if (error) throw error;
      }
      return true;
    } catch (e: any) {
      console.error("Password reset failure:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      authService.signOut().catch(console.error);
    }
    setUser(null);
    setIsLoggedIn(false);
    setActiveTab("home");
    if (typeof window !== "undefined") {
      safeLocalStorage.clear();
    }
  };

  const updateUserProfile = (profileData: Partial<Profile>) => {
    if (user) {
      const updated = { ...user, ...profileData };
      setUser(updated);

      if (typeof window !== "undefined") {
        safeLocalStorage.setItem("medimz_user", JSON.stringify(updated));
        safeLocalStorage.setItem("medimz_user_nickname", updated.nickname || "");
        safeLocalStorage.setItem("medimz_user_dob", updated.dob || "");
        safeLocalStorage.setItem("medimz_user_bloodGroup", updated.bloodGroup || "");
        safeLocalStorage.setItem("medimz_user_phone", updated.phone || "");
      }

      if (isSupabaseConfigured) {
        authService.updateProfile(user.id, profileData)
          .then(dbP => {
            const merged = { ...dbP, ...updated };
            setUser(merged);
            if (typeof window !== "undefined") {
              safeLocalStorage.setItem("medimz_user", JSON.stringify(merged));
            }
            return reminderService.addNotification(user.id, "Profile Synchronized! 🧬", "Your profile changes have been successfully saved and synced to the cloud.", "system")
              .then(n => setNotifications(prev => [n, ...prev]))
              .catch(err => console.error("Failed to sync profile success notification:", err));
          })
          .catch(err => {
            console.error("Failed to sync profile update:", err?.message || err?.details || err);
            // Graceful fallback warning notification so they know it is saved locally
            addNotification("Saved Locally 💾", "Failed to sync to database due to security policies. Your updates are saved on this device.", "system");
          });
      } else {
        addNotification("Profile Updated! 💾", "Your personal health records were successfully saved locally.", "system");
      }
    }
  };

  // ====================================================================
  // FAMILY ROSTER CRUD
  // ====================================================================
  const addFamilyMember = (member: Omit<FamilyMember, "id" | "adherenceRate">) => {
    const tempId = `fam-${Date.now()}`;
    const newMember: FamilyMember = {
      ...member,
      id: tempId,
      adherenceRate: 100
    };
    setFamilyMembers(prev => [...prev, newMember]);

    if (typeof window !== "undefined") {
      safeLocalStorage.setItem(`medimz_fam_metadata_${tempId}`, JSON.stringify({
        nickname: member.nickname,
        dob: member.dob,
        bloodGroup: member.bloodGroup,
        phone: member.phone,
        color: member.color,
        medicalNotes: member.medicalNotes
      }));
    }

    if (isSupabaseConfigured && user) {
      medicineService.addFamilyMember(user.id, member)
        .then(dbFam => {
          // Swap temp client ID with true DB generated UUID
          setFamilyMembers(prev => prev.map(f => f.id === tempId ? dbFam : f));
          if (typeof window !== "undefined") {
            safeLocalStorage.setItem(`medimz_fam_metadata_${dbFam.id}`, JSON.stringify({
              nickname: dbFam.nickname || member.nickname,
              dob: dbFam.dob || member.dob,
              bloodGroup: dbFam.bloodGroup || member.bloodGroup,
              phone: dbFam.phone || member.phone,
              color: dbFam.color || member.color,
              medicalNotes: dbFam.medicalNotes || member.medicalNotes
            }));
          }
          reminderService.addNotification(user.id, "Family Member Added! 🧑‍⚕️", `${member.name} has been added to your profile synchronization.`, "system")
            .then(n => setNotifications(prev => [n, ...prev]));
        })
        .catch(err => console.error("Failed to sync new family member:", err));
    } else {
      addNotification("Family Member Added! 🧑‍⚕️", `${member.name} has been added to your profile synchronization.`, "system");
    }
  };

  const updateFamilyMember = (memberId: string, memberData: Partial<FamilyMember>) => {
    setFamilyMembers(prev => prev.map(f => {
      if (f.id === memberId) {
        const updated = { ...f, ...memberData };
        if (typeof window !== "undefined") {
          safeLocalStorage.setItem(`medimz_fam_metadata_${memberId}`, JSON.stringify({
            nickname: updated.nickname,
            dob: updated.dob,
            bloodGroup: updated.bloodGroup,
            phone: updated.phone,
            color: updated.color,
            medicalNotes: updated.medicalNotes
          }));
        }
        return updated;
      }
      return f;
    }));

    if (isSupabaseConfigured && user) {
      medicineService.updateFamilyMember(memberId, memberData)
        .catch(err => console.error("Failed to sync family member update:", err));
    }
  };

  const deleteFamilyMember = (memberId: string) => {
    setFamilyMembers(prev => prev.filter(f => f.id !== memberId));

    if (isSupabaseConfigured && user) {
      medicineService.deleteFamilyMember(memberId)
        .catch(err => console.error("Failed to sync family member deletion:", err));
    }
    addNotification("Member Removed 🗑️", "Family member profile card was deleted successfully.", "system");
  };

  // ====================================================================
  // MEDICINES & TIMELINE REMINDERS CRUD
  // ====================================================================
  const addMedicine = (medicine: Omit<Medicine, "id">, targetFamilyMemberId?: string | null) => {
    const medId = `med-${Date.now()}`;
    const newMed: Medicine = {
      ...medicine,
      id: medId
    };
    
    setMedicines(prev => [...prev, newMed]);
 
    // Automatically generate scheduled reminders for the next 3 days
    const newReminders: Reminder[] = [];
    const today = new Date();
    const familyMember = familyMembers.find(f => f.id === targetFamilyMemberId);

    const timesToSchedule = (medicine.intakeTimes && medicine.intakeTimes.length > 0)
      ? medicine.intakeTimes
      : medicine.timings.map(slot => {
          if (slot === "morning") return "08:00";
          if (slot === "afternoon") return "13:00";
          if (slot === "evening") return "18:00";
          return "21:00";
        });
 
    timesToSchedule.forEach((timeStr, idx) => {
      const [hStr, mStr] = timeStr.split(":");
      const hour = parseInt(hStr, 10) || 8;
      const minute = parseInt(mStr, 10) || 0;

      let slot: "morning" | "afternoon" | "evening" | "night" = "morning";
      if (hour >= 12 && hour < 17) slot = "afternoon";
      else if (hour >= 17 && hour < 20) slot = "evening";
      else if (hour >= 20 || hour < 6) slot = "night";
 
      for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
        const scheduledDay = new Date();
        scheduledDay.setDate(today.getDate() + dayOffset);
 
        const scheduledTime = new Date(
          scheduledDay.getFullYear(),
          scheduledDay.getMonth(),
          scheduledDay.getDate(),
          hour,
          minute
        ).toISOString();
 
        newReminders.push({
          id: `rem-${medId}-${idx}-${dayOffset}`,
          medicineId: medId,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          instructions: medicine.instructions,
          familyMemberId: targetFamilyMemberId || null,
          familyMemberName: familyMember ? familyMember.name : undefined,
          scheduledTime,
          timingSlot: slot,
          status: "pending",
          recipientNickname: familyMember ? (familyMember.nickname || familyMember.name) : "Myself",
          recipientAvatar: familyMember ? familyMember.avatarUrl : (user?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=Sarah"),
          recipientColor: familyMember ? (familyMember.color || "blue") : "orange",
          intakeTime: timeStr
        });
      }
    });
 
    setReminders(prev => [...newReminders, ...prev]);

    // Schedule a mock native push notification in 3 seconds to demo the integration
    notificationService.scheduleMedicineReminder({
      id: medId,
      name: medicine.name,
      dosage: medicine.dosage,
      recipientName: familyMember ? familyMember.name : "Myself",
      timeLabel: timesToSchedule[0] || "8:00 AM"
    }, 3);

    setTimeout(() => {
      setActiveNotification({
        id: medId,
        reminderId: `rem-${medId}-0-0`,
        name: medicine.name,
        dosage: medicine.dosage,
        recipientName: familyMember ? (familyMember.nickname || familyMember.name) : "Myself",
        timeLabel: timesToSchedule[0] || "8:00 AM"
      });
    }, 3000);

    if (isSupabaseConfigured && user) {
      const resolveCaregiverId = async (): Promise<string | null> => {
        if (!targetFamilyMemberId) return null;
        // If it's a mock ID starting with fam- (like fam-mom or fam-dad), sync to DB first
        if (targetFamilyMemberId.startsWith("fam-") && targetFamilyMemberId.split("-")[1]?.match(/^[a-zA-Z]+$/)) {
          const fm = familyMembers.find(f => f.id === targetFamilyMemberId);
          if (fm) {
            try {
              const dbFam = await medicineService.addFamilyMember(user.id, fm);
              // Swap client ID in local state
              setFamilyMembers(prev => prev.map(f => f.id === targetFamilyMemberId ? dbFam : f));
              return dbFam.id;
            } catch (e) {
              console.error("Auto caregiver creation failed, fallback to null", e);
              return null;
            }
          }
        }
        return targetFamilyMemberId;
      };

      resolveCaregiverId().then(resolvedFamId => {
        medicineService.addMedicine(user.id, medicine)
          .then(dbMed => {
            setMedicines(prev => prev.map(m => m.id === medId ? dbMed : m));
            
            const dbRems = newReminders.map(r => ({
              medicineId: dbMed.id,
              familyMemberId: resolvedFamId || null,
              scheduledTime: r.scheduledTime,
              timingSlot: r.timingSlot,
              status: r.status as any,
              intakeTime: r.intakeTime
            }));
     
            reminderService.addReminders(user.id, dbRems).then(() => {
              reminderService.getReminders(user.id).then(syncedRems => {
                const resolvedRems = syncedRems.map(sr => {
                  const fm = familyMembers.find(f => f.id === sr.familyMemberId);
                  return {
                    ...sr,
                    recipientNickname: fm ? (fm.nickname || fm.name) : "Myself",
                    recipientAvatar: fm ? fm.avatarUrl : (user?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=Sarah"),
                    recipientColor: fm ? (fm.color || "blue") : "orange"
                  };
                });
                setReminders(resolvedRems);
              }).catch(e => console.error("Failed to query synced reminders:", e));
            }).catch(e => console.error("Failed to insert reminders to database:", e));
    
            reminderService.addNotification(user.id, "Medicine Added 💊", `${medicine.name} (${medicine.dosage}) added successfully. Reminders created!`, "reminder")
              .then(n => setNotifications(prev => [n, ...prev]))
              .catch(e => console.error("Failed to post notification:", e));
          }, (err) => {
            console.warn("Failed to add live medication, storing locally for offline sync:", err);
            const offlineQueue = JSON.parse(safeLocalStorage.getItem("medimz_offline_queue") || "[]");
            offlineQueue.push({ action: "addMedicine", data: { medicine, targetFamilyMemberId: resolvedFamId } });
            safeLocalStorage.setItem("medimz_offline_queue", JSON.stringify(offlineQueue));
          });
      });
    } else {
      addNotification("Medicine Added 💊", `${medicine.name} (${medicine.dosage}) added successfully. Reminders created!`, "reminder");
    }
  };

  const editMedicine = (medicineId: string, updatedFields: Partial<Medicine>, targetFamilyMemberId?: string | null) => {
    setMedicines(prev => prev.map(m => m.id === medicineId ? { ...m, ...updatedFields } : m));
    setReminders(prev => {
      const nonPending = prev.filter(r => r.medicineId !== medicineId || r.status !== "pending");
      const updatedMed = medicines.find(m => m.id === medicineId);
      if (!updatedMed) return prev;
      
      const mergedMed = { ...updatedMed, ...updatedFields };
      const newReminders: Reminder[] = [];
      const today = new Date();
      const familyMember = familyMembers.find(f => f.id === targetFamilyMemberId);

      const timesToSchedule = (mergedMed.intakeTimes && mergedMed.intakeTimes.length > 0)
        ? mergedMed.intakeTimes
        : mergedMed.timings.map(slot => {
            if (slot === "morning") return "08:00";
            if (slot === "afternoon") return "13:00";
            if (slot === "evening") return "18:00";
            return "21:00";
          });

      timesToSchedule.forEach((timeStr, idx) => {
        const [hStr, mStr] = timeStr.split(":");
        const hour = parseInt(hStr, 10) || 8;
        const minute = parseInt(mStr, 10) || 0;

        let slot: "morning" | "afternoon" | "evening" | "night" = "morning";
        if (hour >= 12 && hour < 17) slot = "afternoon";
        else if (hour >= 17 && hour < 20) slot = "evening";
        else if (hour >= 20 || hour < 6) slot = "night";

        for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
          const scheduledDay = new Date();
          scheduledDay.setDate(today.getDate() + dayOffset);

          const scheduledTime = new Date(
            scheduledDay.getFullYear(),
            scheduledDay.getMonth(),
            scheduledDay.getDate(),
            hour,
            minute
          ).toISOString();

          newReminders.push({
            id: `rem-${medicineId}-${idx}-${dayOffset}-edit-${Date.now()}`,
            medicineId: medicineId,
            medicineName: mergedMed.name,
            dosage: mergedMed.dosage,
            instructions: mergedMed.instructions,
            familyMemberId: targetFamilyMemberId || null,
            familyMemberName: familyMember ? familyMember.name : undefined,
            scheduledTime,
            timingSlot: slot,
            status: "pending",
            recipientNickname: familyMember ? (familyMember.nickname || familyMember.name) : "Myself",
            recipientAvatar: familyMember ? familyMember.avatarUrl : (user?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=Sarah"),
            recipientColor: familyMember ? (familyMember.color || "blue") : "orange",
            intakeTime: timeStr
          });
        }
      });

      return [...newReminders, ...nonPending];
    });

    addNotification("Medicine Updated 📝", `Medication details and future reminders updated successfully.`, "reminder");
  };

  const updateMedicineStock = (medicineId: string, newStock: number) => {
    setMedicines(prev => prev.map(m => m.id === medicineId ? { ...m, stockCount: newStock } : m));
    if (isSupabaseConfigured && user) {
      supabase
        .from("medicines")
        .update({ stock_count: newStock })
        .eq("id", medicineId)
        .then((res: any) => {
          if (res.error) console.error("Failed to update stock in database:", res.error);
        });
    }
    addNotification("Stock Updated 📦", `Medication stock count updated successfully.`, "system");
  };

  const deleteMedicine = (medicineId: string) => {
    setMedicines(prev => prev.filter(m => m.id !== medicineId));
    setReminders(prev => prev.filter(r => r.medicineId !== medicineId || r.status !== "pending"));
    
    if (isSupabaseConfigured && user) {
      medicineService.deleteMedicine(medicineId)
        .catch(err => console.error("Failed to delete medicine from database:", err));
    }
    
    addNotification("Medicine Deleted 🗑️", `Medication and its scheduled reminders have been removed.`, "reminder");
  };

  const deleteReminder = (reminderId: string) => {
    const targetRem = reminders.find(r => r.id === reminderId);
    if (!targetRem) return;

    const med = medicines.find(m => m.id === targetRem.medicineId);
    if (med) {
      const hasMultipleIntakeTimes = med.intakeTimes && med.intakeTimes.length > 1;
      const hasMultipleTimings = med.timings && med.timings.length > 1;

      if (hasMultipleIntakeTimes && targetRem.intakeTime) {
        const updatedIntakeTimes = (med.intakeTimes || []).filter(t => t !== targetRem.intakeTime);
        const updatedTimings = Array.from(new Set(updatedIntakeTimes.map(timeStr => {
          const hour = parseInt(timeStr.split(":")[0], 10);
          if (hour >= 5 && hour < 12) return "morning" as const;
          if (hour >= 12 && hour < 17) return "afternoon" as const;
          if (hour >= 17 && hour < 20) return "evening" as const;
          return "night" as const;
        })));
        
        editMedicine(med.id, { intakeTimes: updatedIntakeTimes, timings: updatedTimings }, targetRem.familyMemberId || null);
        addNotification("Reminder Updated 🗑️", `Removed ${targetRem.medicineName} dose at ${targetRem.intakeTime}.`, "reminder");
        return;
      } else if (hasMultipleTimings) {
        const updatedTimings = med.timings.filter(t => t !== targetRem.timingSlot);
        editMedicine(med.id, { timings: updatedTimings }, targetRem.familyMemberId || null);
        addNotification("Reminder Updated 🗑️", `Removed ${targetRem.medicineName} ${targetRem.timingSlot} dose.`, "reminder");
        return;
      }
    }

    if (med) {
      deleteMedicine(med.id);
    } else {
      setReminders(prev => prev.filter(r => r.id !== reminderId));
      if (isSupabaseConfigured && user) {
        reminderService.deleteReminder(reminderId)
          .catch(err => console.error("Failed to delete reminder from DB:", err));
      }
    }
  };

  const snoozeReminder = (reminderId: string, minutes: number) => {
    const now = new Date();
    const snoozedTime = new Date(now.getTime() + minutes * 60000).toISOString();

    setReminders(prev => prev.map(rem => {
      if (rem.id === reminderId) {
        return {
          ...rem,
          snoozedUntil: snoozedTime
        };
      }
      return rem;
    }));

    const targetRem = reminders.find(r => r.id === reminderId);
    if (targetRem) {
      addNotification("Dose Snoozed ⏰", `Snoozed ${targetRem.medicineName} for ${minutes} mins.`, "reminder");
    }
  };

  const toggleReminderStatus = (reminderId: string, status: "pending" | "taken" | "missed", operatorUserId?: string) => {
    const takenAt = status === "taken" ? new Date().toISOString() : undefined;

    setReminders(prev =>
      prev.map(rem => {
        if (rem.id === reminderId) {
          return { ...rem, status, takenAt };
        }
        return rem;
      })
    );

    const targetRem = reminders.find(r => r.id === reminderId);
    if (!targetRem) return;

    // Decrement stock count if marked as taken
    if (status === "taken") {
      setMedicines(prev => prev.map(m => {
        if (m.id === targetRem.medicineId) {
          const currentStock = m.stockCount !== undefined ? m.stockCount : 30;
          const newStock = Math.max(0, currentStock - 1);

          if (isSupabaseConfigured && user) {
            supabase
              .from("medicines")
              .update({ stock_count: newStock })
              .eq("id", m.id)
              .then((res: any) => {
                if (res.error) console.error("Failed to update medication stock in database:", res.error);
              });
          }
          return { ...m, stockCount: newStock };
        }
        return m;
      }));
    }

    if (isSupabaseConfigured && user) {
      reminderService.updateReminderStatus(reminderId, status, takenAt)
        .then(() => {
          const ownerId = targetRem.familyMemberId || user.id;
          const operatorId = operatorUserId || user.id;

          const isOwnerRealUser = ownerId && !ownerId.startsWith("fam-");
          const isOperatorRealUser = operatorId && !operatorId.startsWith("fam-");

          if (status === "taken") {
            const msg = operatorId !== ownerId 
              ? `Family member marked your dose of ${targetRem.medicineName} as taken.` 
              : `You marked ${targetRem.medicineName} as taken. Great job!`;

            if (isOwnerRealUser) {
              reminderService.addNotification(ownerId, "Dose Tracked! 🌟", msg, "reminder")
                .then(n => {
                  if (ownerId === user.id) {
                    setNotifications(prev => [n, ...prev]);
                  }
                })
                .catch(err => console.error("Failed to add dose notification:", err));
            }

            // Write audit trail log if a family member marked it and both are real users
            if (operatorId !== ownerId && isOwnerRealUser && isOperatorRealUser) {
              reminderService.logComplianceAudit(ownerId, operatorId, targetRem.medicineName, reminderId, status, "Family Member")
                .catch(err => console.error("Failed to write compliance audit log:", err));
            }
          }
        })
        .catch(err => console.error("Failed to sync compliance reminder status:", err));
    } else {
      if (status === "taken") {
        addNotification("Dose Tracked! 🌟", `You marked ${targetRem.medicineName} as taken. Great job!`, "reminder");
      }
    }
  };

  // ====================================================================
  // LAB BOOKINGS & DISPATCH LOGISTICS
  // ====================================================================
  const createBooking = (labId: string, testIds: string[], timeSlot: string, addressId: string) => {
    const selectedLab = labs.find(l => l.id === labId);
    const selectedTests = tests.filter(t => testIds.includes(t.id));
    const testNames = selectedTests.map(t => t.name);
    const address = user?.addresses.find(a => a.id === addressId) || DEFAULT_PROFILE.addresses[0];

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const tempId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: tempId,
      labId,
      labName: selectedLab?.name || "Apollo Diagnostics",
      testNames,
      bookingDate: formattedDate,
      timeSlot,
      address,
      status: "pending",
      createdAt: today.toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);

    if (isSupabaseConfigured && user) {
      bookingService.createBooking(user.id, labId, testIds, timeSlot, address)
        .then(dbB => {
          // Swap client temp structure with live DB structure
          setBookings(prev => prev.map(b => b.id === tempId ? dbB : b));
          reminderService.addNotification(user.id, "Test Booked Successfully! 🧪", `Your sample collection from ${dbB.labName} is scheduled.`, "booking")
            .then(n => setNotifications(prev => [n, ...prev]));
        })
        .catch(err => console.error("Failed to submit diagnostic booking:", err));
    } else {
      addNotification("Test Booked Successfully! 🧪", `Your sample collection from ${newBooking.labName} is scheduled.`, "booking");
      
      // Local Mock Dispatcher simulation
      setTimeout(() => {
        setBookings(currentBookings =>
          currentBookings.map(b => {
            if (b.id === newBooking.id) {
              addNotification("Phlebotomist Assigned! 🚗", `Dr. Rajesh Kumar is assigned for your ${newBooking.testNames[0]} collection.`, "booking");
              return {
                ...b,
                status: "assigned",
                phlebotomistName: "Dr. Rajesh Kumar",
                phlebotomistRating: 4.9,
                phlebotomistPhone: "+91 98765 43210",
                phlebotomistAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNNZkMGj4I60pe8WPNWMe2lV2_-hCv1uaYCkAmsEDa1V0oauJkDG6W9CbSFNwGkN39oHcwQ8Gf0GBySyYTPXiO7_rbZrE-3qLk7eYJOFj4dqC6nVjckMqxr_n6CVVnRU--0fkAbKxuSRbe-QANE62TtQVIQ7_MFKDs7JZh6J2o7KRcAtHFlYIJCEfdcoxdRQlo3QDeFjURYDZfrVkL31ABDyPhF_VUmsn6isYDSO4hCLEzu8nqwMc9vDexa5YM4yz3RBSSbabbtTI"
              };
            }
            return b;
          })
        );
      }, 5000);
    }

    return newBooking;
  };

  const createMedicineOrder = (pharmacyId: string, medicineIds: string[], deliverySlot: string, addressId: string) => {
    const PHARMACIES = [
      { id: "pharm-medplus", name: "MedPlus Pharmacy", rating: 4.8, fastDeliveryMins: 45 },
      { id: "pharm-apollo", name: "Apollo Pharmacy", rating: 4.9, fastDeliveryMins: 30 },
      { id: "pharm-netmeds", name: "Netmeds Store", rating: 4.7, fastDeliveryMins: 60 }
    ];
    const selectedPharm = PHARMACIES.find(p => p.id === pharmacyId) || PHARMACIES[1];
    
    // Look up medicines
    const selectedMeds = DEFAULT_MEDICINES.filter(m => medicineIds.includes(m.id));
    const medNames = selectedMeds.map(m => m.name);
    
    const address = user?.addresses.find(a => a.id === addressId) || DEFAULT_PROFILE.addresses[0];
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const tempId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Booking = {
      id: tempId,
      labId: pharmacyId,
      labName: selectedPharm.name,
      testNames: medNames,
      bookingDate: formattedDate,
      timeSlot: deliverySlot,
      address,
      status: "pending",
      type: "medicine",
      createdAt: today.toISOString(),
      phlebotomistName: "Ramesh Delivery Rider",
      phlebotomistRating: 4.9,
      phlebotomistPhone: "+91 98765 43210",
      phlebotomistAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-fiijosOOELks0G1tPoJE1MwOmluzSSwm9TEMIKcSMP21iAdVQkAz9HzvlZz_bMc9BAGFfm9eicDCBgBKlTZP6xA2M5YuPjf8kBHQXlAUMDCUFmgw6CwcZ5z4CUrLxxocC1utmx6t299A3bLTh3QfPRnX8rBnBia6B_YosJzdoBQ3em3MAveGI-y_MFhviEicCv2Zo9gtHVKAzJ4beOQSiDimbElcfX9XLdCNUHeC9gJDjfT65xTalzDi_Dea6iy-YWtbxGTSSCs"
    };

    setBookings(prev => [newOrder, ...prev]);
    addNotification("Medicine Order Placed! 💊", `Your delivery from ${newOrder.labName} is scheduled.`, "booking");

    // Local Mock dispatcher delivery simulation
    setTimeout(() => {
      setBookings(currentBookings =>
        currentBookings.map(b => {
          if (b.id === newOrder.id) {
            addNotification("Delivery Out for Delivery! 🛵", `Rider Ramesh is out for delivery with your medicines.`, "booking");
            return {
              ...b,
              status: "out_for_collection"
            };
          }
          return b;
        })
      );
    }, 15000);

    return newOrder;
  };

  const updateBookingStatus = (bookingId: string, status: Booking["status"]) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          let msg = `Order #${b.id} status updated to ${status}.`;
          if (status === "out_for_collection") msg = `Phlebotomist is out for sample collection for Order #${b.id}.`;
          else if (status === "collected") msg = `Samples collected successfully for Order #${b.id}.`;
          else if (status === "completed") msg = `Diagnostic checkup reports are ready for Order #${b.id}.`;

          addNotification("Booking Status Update", msg, "booking");
          
          if (status === "completed") {
            const repId = `rep-${Date.now()}`;
            const newReport: HealthReport = {
              id: repId,
              testName: b.testNames[0],
              fileUrl: `/reports/gen_${repId}.pdf`,
              aiSummary: `AI report summary for your recent ${b.testNames[0]} diagnostic checkup. General metabolic indicators, vitamins, and minerals show a stabilized pattern within physiological boundaries.`,
              date: new Date().toISOString().split("T")[0]
            };
            setReports(currentReports => [newReport, ...currentReports]);

            if (isSupabaseConfigured && user) {
              bookingService.addReport(user.id, b.id, newReport.testName, newReport.fileUrl, newReport.aiSummary)
                .then(dbRep => setReports(currentReports => [dbRep, ...currentReports.filter(r => r.id !== repId)]))
                .catch(err => console.error("Failed to sync generated report:", err));
            }
          }

          return { ...b, status };
        }
        return b;
      })
    );

    if (isSupabaseConfigured) {
      bookingService.updateBookingStatus(bookingId, status)
        .catch(err => console.error("Failed to update db booking status:", err));
    }
  };

  const assignPhlebotomist = (bookingId: string, name: string, phone: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          addNotification("Phlebotomist Assigned", `${name} (${phone}) assigned to collect samples for Order #${b.id}.`, "booking");
          return {
            ...b,
            status: "assigned",
            phlebotomistName: name,
            phlebotomistPhone: phone,
            phlebotomistRating: 4.8,
            phlebotomistAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-fiijosOOELks0G1tPoJE1MwOmluzSSwm9TEMIKcSMP21iAdVQkAz9HzvlZz_bMc9BAGFfm9eicDCBgBKlTZP6xA2M5YuPjf8kBHQXlAUMDCUFmgw6CwcZ5z4CUrLxxocC1utmx6t299A3bLTh3QfPRnX8rBnBia6B_YosJzdoBQ3em3MAveGI-y_MFhviEicCv2Zo9gtHVKAzJ4beOQSiDimbElcfX9XLdCNUHeC9gJDjfT65xTalzDi_Dea6iy-YWtbxGTSSCs"
          };
        }
        return b;
      })
    );

    if (isSupabaseConfigured) {
      bookingService.assignPhlebotomist(bookingId, name, phone)
        .catch(err => console.error("Failed to assign phlebotomist in db:", err));
    }
  };

  // ====================================================================
  // LAB REPORTS UPLOADER (AI METABOLIC SIMULATIONS)
  // ====================================================================
  const uploadReportPlaceholder = (testName: string, textSummary: string) => {
    const repId = `rep-${Date.now()}`;
    const newReport: HealthReport = {
      id: repId,
      testName: testName,
      fileUrl: `/reports/uploaded_${repId}.pdf`,
      aiSummary: textSummary,
      date: new Date().toISOString().split("T")[0]
    };
    
    setReports(prev => [newReport, ...prev]);

    if (isSupabaseConfigured && user) {
      bookingService.addReport(user.id, null, testName, newReport.fileUrl, textSummary)
        .then(dbRep => setReports(prev => [dbRep, ...prev.filter(r => r.id !== repId)]))
        .catch(err => console.error("Failed to save uploaded report in database:", err));
      
      reminderService.addNotification(user.id, "Report Uploaded Successfully! 📂", `Medimz AI has analyzed your uploaded ${testName} report.`, "system")
        .then(n => setNotifications(prev => [n, ...prev]));
    } else {
      addNotification("Report Uploaded Successfully! 📂", `Medimz AI has analyzed your uploaded ${testName} report.`, "system");
    }
  };

  // ====================================================================
  // NOTIFICATIONS HELPER DISPATCHERS
  // ====================================================================
  const addNotification = (title: string, message: string, type: Notification["type"]) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotif, ...prev]);

    if (isSupabaseConfigured && user) {
      reminderService.addNotification(user.id, title, message, type)
        .then(dbN => setNotifications(prev => [dbN, ...prev.filter(n => n.id !== newNotif.id)]))
        .catch(err => console.error("Failed to dispatch database notification:", err));
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );

    if (isSupabaseConfigured) {
      reminderService.markNotificationRead(id)
        .catch(err => console.error("Failed to mark notification read in db:", err));
    }
  };

  const clearNotifications = () => {
    setNotifications([]);

    if (isSupabaseConfigured && user) {
      reminderService.clearNotifications(user.id)
        .catch(err => console.error("Failed to clear database notifications:", err));
    }
  };

  const createFamily = async (name: string): Promise<boolean> => {
    if (!user) return false;
    if (!isSupabaseConfigured) {
      alert("Database connection is not configured. Please set your Supabase environment variables.");
      return false;
    }
    
    // 1. Generate invitation code
    const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "FAM-";
    for (let i = 0; i < 6; i++) {
      code += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
    }

    try {
      const createActionPromise = (async () => {
        // 1. Insert new family row via supabase client
        const { data: insertedData, error: insErr } = await supabase
          .from("families")
          .insert({
            family_code: code,
            name,
            admin_id: user.id
          })
          .select();

        if (insErr) throw insErr;
        if (!insertedData || insertedData.length === 0) {
          throw new Error("No data returned from family creation.");
        }
        const newFam = insertedData[0];

        // 2. Update user's profile family_id via supabase client
        const { error: updErr } = await supabase
          .from("profiles")
          .update({
            family_id: newFam.id
          })
          .eq("id", user.id);

        if (updErr) throw updErr;
        return newFam;
      })();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out creating family group in database. Please check your connection.")), 8000)
      );

      const newFam = await Promise.race([createActionPromise, timeoutPromise]);

      const n = await reminderService.addNotification(user.id, "Family Portal Created! 🏠", `Successfully created family '${name}' with code ${code}.`, "system");
      setNotifications(prev => [n, ...prev]);

      const updatedUser = { ...user, familyId: newFam.id };
      setUser(updatedUser);
      if (typeof window !== "undefined") {
        safeLocalStorage.setItem("medimz_user", JSON.stringify(updatedUser));
      }

      setActiveFamily({
        id: newFam.id,
        name: newFam.name,
        familyCode: newFam.family_code,
        adminId: newFam.admin_id
      });
      setIsLinkedToFamily(true);

      // Force window reload to synchronize state and trigger live subscription updates instantly
      if (typeof window !== "undefined") {
        window.location.reload();
      }

      return true;
    } catch (e: any) {
      alert("Failed to create family: " + e.message);
      return false;
    }
  };

  const joinFamily = async (familyId: string, name: string, code: string, adminId: string): Promise<boolean> => {
    if (!user) {
      alert("Failed to join family: No active user session was found.");
      return false;
    }
    if (!isSupabaseConfigured) {
      alert("Database connection is not configured. Please set your Supabase environment variables.");
      return false;
    }

    try {
      // 1. Update user's profile family_id via supabase client with 8-second timeout
      const updatePromise = supabase
        .from("profiles")
        .update({ family_id: familyId })
        .eq("id", user.id);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out writing profile update to the database. Please verify your connection.")), 8000)
      );

      const { error: updErr } = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (updErr) {
        throw updErr;
      }

      // Add a system notification
      const n = await reminderService.addNotification(user.id, "Joined Family Portal! 🤝", `You have successfully joined family group '${name}'.`, "system");
      setNotifications(prev => [n, ...prev]);

      const updatedUser = { ...user, familyId };
      setUser(updatedUser);
      if (typeof window !== "undefined") {
        safeLocalStorage.setItem("medimz_user", JSON.stringify(updatedUser));
      }

      setActiveFamily({
        id: familyId,
        name: name,
        familyCode: code,
        adminId: adminId
      });
      setIsLinkedToFamily(true);

      // Force window reload to synchronize state and trigger live subscription updates instantly
      if (typeof window !== "undefined") {
        window.location.reload();
      }

      return true;
    } catch (e: any) {
      alert("Failed to join family: " + e.message);
      return false;
    }
  };

  const leaveFamily = async (): Promise<boolean> => {
    if (!user) return false;
    if (!isSupabaseConfigured) {
      alert("Database connection is not configured. Please set your Supabase environment variables.");
      return false;
    }

    if (activeFamily && activeFamily.adminId === user.id) {
      alert("As Admin, you cannot leave the family without transferring ownership or disbanding the family.");
      return false;
    }

    try {
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ family_id: null })
        .eq("id", user.id);

      if (updErr) throw updErr;

      const n = await reminderService.addNotification(user.id, "Left Family Portal 🚪", "You have left your family group.", "system");
      setNotifications(prev => [n, ...prev]);

      const updatedUser = { ...user, familyId: null };
      setUser(updatedUser);
      if (typeof window !== "undefined") {
        safeLocalStorage.setItem("medimz_user", JSON.stringify(updatedUser));
      }

      setActiveFamily(null);
      setIsLinkedToFamily(false);
      setReminders(prev => prev.filter(r => !r.familyMemberId));
      setFamilyMembers([]);
      return true;
    } catch (e: any) {
      alert("Failed to leave family: " + e.message);
      return false;
    }
  };

  const disbandFamily = async (): Promise<boolean> => {
    if (!user || !activeFamily) return false;
    if (!isSupabaseConfigured) {
      alert("Database connection is not configured. Please set your Supabase environment variables.");
      return false;
    }

    if (activeFamily.adminId !== user.id) {
      alert("Only the family Admin can disband the family portal.");
      return false;
    }

    try {
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ family_id: null })
        .eq("family_id", activeFamily.id);

      if (updErr) throw updErr;

      const { error: delErr } = await supabase
        .from("families")
        .delete()
        .eq("id", activeFamily.id);

      if (delErr) throw delErr;

      const n = await reminderService.addNotification(user.id, "Family Disbanded 💥", `The family portal '${activeFamily.name}' was disbanded by the Admin.`, "system");
      setNotifications(prev => [n, ...prev]);

      const updatedUser = { ...user, familyId: null };
      setUser(updatedUser);
      if (typeof window !== "undefined") {
        safeLocalStorage.setItem("medimz_user", JSON.stringify(updatedUser));
      }

      setActiveFamily(null);
      setIsLinkedToFamily(false);
      setReminders(prev => prev.filter(r => !r.familyMemberId));
      setFamilyMembers([]);
      return true;
    } catch (e: any) {
      alert("Failed to disband family: " + e.message);
      return false;
    }
  };

  const removeFamilyMember = async (memberId: string): Promise<boolean> => {
    if (!user || !activeFamily) return false;
    if (!isSupabaseConfigured) {
      alert("Database connection is not configured. Please set your Supabase environment variables.");
      return false;
    }

    if (activeFamily.adminId !== user.id) {
      alert("Only the family Admin can remove members.");
      return false;
    }

    try {
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ family_id: null })
        .eq("id", memberId);

      if (updErr) throw updErr;

      const n = await reminderService.addNotification(user.id, "Member Removed 🧑‍⚕️", "A member has been removed from the family group.", "system");
      setNotifications(prev => [n, ...prev]);

      window.location.reload();
      return true;
    } catch (e: any) {
      alert("Failed to remove member: " + e.message);
      return false;
    }
  };

  const transferAdminRights = async (memberId: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !user || !activeFamily) return false;
    try {
      if (activeFamily.adminId !== user.id) {
        alert("Only the current Admin can transfer administration rights.");
        return false;
      }

      const { error: updErr } = await supabase
        .from("families")
        .update({ admin_id: memberId })
        .eq("id", activeFamily.id);

      if (updErr) throw updErr;

      const n = await reminderService.addNotification(user.id, "Admin Ownership Transferred 👑", "Family administration ownership has been successfully transferred.", "system");
      setNotifications(prev => [n, ...prev]);

      window.location.reload();
      return true;
    } catch (e: any) {
      alert("Failed to transfer ownership: " + e.message);
      return false;
    }
  };

  const renameFamily = async (name: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !user || !activeFamily) return false;
    try {
      if (activeFamily.adminId !== user.id) {
        alert("Only the family Admin can rename the family portal.");
        return false;
      }

      const { error: updErr } = await supabase
        .from("families")
        .update({ name })
        .eq("id", activeFamily.id);

      if (updErr) throw updErr;

      const n = await reminderService.addNotification(user.id, "Family Portal Renamed ✏️", `Family portal renamed to '${name}'.`, "system");
      setNotifications(prev => [n, ...prev]);

      window.location.reload();
      return true;
    } catch (e: any) {
      alert("Failed to rename family: " + e.message);
      return false;
    }
  };

  const regenerateFamilyCode = async (): Promise<boolean> => {
    if (!isSupabaseConfigured || !user || !activeFamily) return false;
    try {
      if (activeFamily.adminId !== user.id) {
        alert("Only the family Admin can regenerate the invitation code.");
        return false;
      }

      const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "FAM-";
      for (let i = 0; i < 6; i++) {
        code += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
      }

      const { error: updErr } = await supabase
        .from("families")
        .update({ family_code: code })
        .eq("id", activeFamily.id);

      if (updErr) throw updErr;

      const n = await reminderService.addNotification(user.id, "Invitation Code Changed 🔑", `Family code updated to ${code}.`, "system");
      setNotifications(prev => [n, ...prev]);

      window.location.reload();
      return true;
    } catch (e: any) {
      alert("Failed to regenerate code: " + e.message);
      return false;
    }
  };

  // Admin functions
  const assignAdminRole = async (email: string, role: UserRole["role"]) => {
    if (!user) return;
    try {
      const newRole = await adminService.assignUserRole(user.email || "", email, role);
      setAdminRoles(prev => {
        const filtered = prev.filter(r => r.email !== email.toLowerCase().trim());
        return [newRole, ...filtered];
      });
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
      addNotification("Admin Role Assigned 🛡️", `${email} has been promoted to ${role} role.`, "system");
    } catch (e: any) {
      alert("Failed to assign role: " + e.message);
    }
  };

  const revokeAdminRole = async (roleId: string) => {
    if (!user) return;
    try {
      await adminService.revokeUserRole(user.email || "", roleId);
      setAdminRoles(prev => prev.filter(r => r.id !== roleId));
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
      addNotification("Admin Role Revoked 🗑️", `Access revoked successfully.`, "system");
    } catch (e: any) {
      alert("Failed to revoke role: " + e.message);
    }
  };

  const updatePermissionRule = async (permId: string, allowed: boolean) => {
    if (!user) return;
    try {
      await adminService.updateRolePermission(permId, allowed);
      setRolePermissions(prev => prev.map(p => p.id === permId ? { ...p, allowed } : p));
      await adminService.logAdminAction(
        user.id,
        user.email || "",
        `Updated permission rule ${permId} to ${allowed}`,
        "role_permissions",
        permId,
        { allowed: !allowed },
        { allowed }
      );
    } catch (e: any) {
      alert("Failed to update permission: " + e.message);
    }
  };

  const toggleFeatureFlagState = async (flagId: string, enabled: boolean) => {
    if (!user) return;
    try {
      await adminService.updateFeatureFlag(flagId, enabled);
      setFeatureFlags(prev => prev.map(f => f.id === flagId ? { ...f, enabled } : f));
      await adminService.logAdminAction(
        user.id,
        user.email || "",
        `Updated feature flag ${flagId} to ${enabled}`,
        "feature_flags",
        flagId,
        { enabled: !enabled },
        { enabled }
      );
    } catch (e: any) {
      alert("Failed to update feature flag: " + e.message);
    }
  };

  const fetchOperationsAnalytics = async () => {
    try {
      const stats = await adminService.getDashboardAnalytics();
      setDashboardStats(stats);
      const hStats = await adminService.getHealthcareIntelligence();
      setHealthcareStats(hStats);
      const flags = await adminService.getFeatureFlags();
      setFeatureFlags(flags);
      const perms = await adminService.getRolePermissions();
      setRolePermissions(perms);
    } catch (e: any) {
      console.warn("Analytics fetch failure (live Supabase missing or unconfigured):", e);
    }
  };

  const searchPatientsPaginated = async (query: string, limit: number, offset: number) => {
    try {
      return await adminService.searchUsersPaginated(query, limit, offset);
    } catch (e) {
      console.error("Paginated search failed:", e);
      return [];
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
    } catch (e: any) {
      console.error("Failed to load audit logs:", e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn,
        activeTab,
        setActiveTab,
        login,
        signup,
        resetPassword,
        logout,
        updateUserProfile,
        isLoading,

        adminRole,
        adminRoles,
        auditLogs,
        rolePermissions,
        featureFlags,
        dashboardStats,
        healthcareStats,
        isBackendAvailable,
        assignAdminRole,
        revokeAdminRole,
        updatePermissionRule,
        toggleFeatureFlagState,
        fetchOperationsAnalytics,
        searchPatientsPaginated,
        fetchAuditLogs,

        familyMembers,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,

        medicines,
        reminders,
        addMedicine,
        editMedicine,
        updateMedicineStock,
        deleteMedicine,
        deleteReminder,
        snoozeReminder,
        toggleReminderStatus,
        adherenceStreak,
        familyAdherenceStreak,
        adherencePercentage,
        isLinkedToFamily,
        setIsLinkedToFamily,
        activeFamily,
        createFamily,
        joinFamily,
        leaveFamily,
        disbandFamily,
        removeFamilyMember,
        transferAdminRights,
        renameFamily,
        regenerateFamilyCode,

        // Wellness Engine
        wellnessScore,
        familyWellnessScore,
        wellnessCategory,
        familyWellnessCategory,
        wellnessTrend,
        familyAlerts,
        unlockedAchievements,
        medicationLogs,
        calculateDailyScore,
        getWellnessScoreForMember,

        labs,
        tests,
        bookings,
        createBooking,
        createMedicineOrder,
        updateBookingStatus,
        assignPhlebotomist,

        reports,
        uploadReportPlaceholder,

        notifications,
        markNotificationRead,
        clearNotifications,
        activeNotification,
        setActiveNotification,
        elderlyMode,
        toggleElderlyMode,

        emergencyContact,
        setEmergencyContact,
        wellnessLogs,
        addWellnessLog,
        checkInConfig,
        setCheckInConfig
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
