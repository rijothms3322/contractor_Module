"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { FamilyMember, Medicine, Reminder, Booking, HealthReport } from "../../lib/mockData";
import { AVATAR_CATEGORIES, AVATAR_ITEMS, AvatarItem } from "../../lib/avatarLibrary";
import { medicineService } from "@/services/medicineService";
import { adminService } from "@/services/adminService";
import { requestNotificationPermission } from "@/services/notificationWeb";
import OCRUploader from "../OCRUploader";
import { getDocumentPreview, medicalReportService } from "@/services/medicalReportService";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { nicknameService } from "@/services/nicknameService";
import { documentService } from "@/services/documentService";

interface MemberDashboardViewProps {
  member: FamilyMember;
  onBack: () => void;
}

// Frequency options (same as DashboardView)
const frequencyOptions = [
  { value: "every_day", label: "Every day" },
  { value: "specific_days", label: "Specific days" },
  { value: "interval", label: "At an interval" }
];

const WEEK_DAYS = [
  { key: "sunday", label: "Sunday" },
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
];

const TEST_CATEGORY = [
  { key: "lab_report", label: "Lab Report" },
  { key: "medical_report", label: "Medical Report" },
  { key: "discharge_summary", label: "Discharge Summary" },
  { key: "radiology", label: "Radiology" },
  { key: "pathology", label: "Pathology" },
  { key: "other", label: "Other" },
];

const SLOT_DEFAULT_TIME: Record<
  "morning" | "afternoon" | "evening" | "night",
  string
> = {
  morning: "08:00",
  afternoon: "12:00",
  evening: "17:00",
  night: "20:00",
};

export const MemberDashboardView: React.FC<MemberDashboardViewProps> = ({ member, onBack }) => {
  const {
    medicines,
    reminders,
    bookings,
    reports,
    notifications,
    addMedicine,
    editMedicine,
    toggleReminderStatus,
    updateFamilyMember,
    familyMembers,
    user,
    addFamilyMember,
  } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "medicines" | "orders" | "medicalReport" | "reports" | "appointments" | "timeline" | "history">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMedsModal, setShowAddMedsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [nicknameMap, setNicknameMap] = useState<Record<string, string>>({});
  console.log(medicines, 'medicines')
  // Profile Edit fields
  const [editName, setEditName] = useState(member.name);
  const [editNickname, setEditNickname] = useState(
    nicknameMap[member.id] || member.nickname || member.name
  );
  const [editRel, setEditRel] = useState(member.relationship);
  const [editDob, setEditDob] = useState(member.dob || "");
  const [editAge, setEditAge] = useState(member.age);
  const [editGender, setEditGender] = useState(member.gender);
  const [editBloodGroup, setEditBloodGroup] = useState(member.bloodGroup || "O+");
  const [editPhone, setEditPhone] = useState(member.phone || "");
  const [editConditions, setEditConditions] = useState(member.medicalConditions.join(", "));
  const [editColor, setEditColor] = useState(member.color || "blue");
  const [editAvatarUrl, setEditAvatarUrl] = useState(member.avatarUrl || "/avatars/senior-01.png");
  const [activeEditAvatarCategory, setActiveEditAvatarCategory] = useState<AvatarItem["category"]>("senior");
  const [freshMember, setFreshMember] = useState<FamilyMember | null>(null);
  const [memberMeds, setMemberMeds] = useState<Medicine[]>([]);
  const [apiReports, setApiReports] = useState<any[]>([]);
  const [memberMedsCount, setMemberMedsCount] = useState<number | null>(null);
  const [memberReportsCount, setMemberReportsCount] = useState<number | null>(null);

  // Add these states after existing states
  const [newMedName, setNewMedName] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [newDosage, setNewDosage] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newSelectedTimings, setNewSelectedTimings] = useState<("morning" | "afternoon" | "evening" | "night")[]>(["morning"]);
  const [newIntakeTimes, setNewIntakeTimes] = useState<string[]>(["08:00"]);
  const [timeInput, setTimeInput] = useState("08:00");
  const [newEndDate, setNewEndDate] = useState("");
  const [untilStopped, setUntilStopped] = useState(true);
  const [newStockCount, setNewStockCount] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Frequency states
  const [frequency, setFrequency] = useState<"every_day" | "specific_days" | "interval">("every_day");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDayType, setSelectedDayType] = useState<'weekdays' | 'normal'>("weekdays");
  const [repeatEveryNDays, setRepeatEveryNDays] = useState<number | null>(null);
  const [intervalHours, setIntervalHours] = useState<number>(8);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(0);
  const [intervalStartTime, setIntervalStartTime] = useState<string>("08:00");
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState<boolean>(false);
  const [showWeekOptions, setShowWeekOptions] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);

  const [showEntryChoiceModal, setShowEntryChoiceModal] = useState(false);
  const [extractedMedicines, setExtractedMedicines] = useState<any[] | null>(null);
  const [extractedReport, setExtractedReport] = useState<any | null>(null);
  const [extractedPreviewVisible, setExtractedPreviewVisible] = useState(false);
  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState<number | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrWarning, setOcrWarning] = useState<string | null>(null);
  const [ocrMedicineData, setOcrMedicineData] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  // Member documents 
  const [memberDocuments, setMemberDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
  const [documentPreviewLoading, setDocumentPreviewLoading] = useState(false);
  const [documentPreviewError, setDocumentPreviewError] = useState(false);

  const isMedicineAlreadyAdded = (med: any): boolean => {
    const name = (med.medicine_name || med.name || "").toLowerCase().trim();
    return medicines.some(m => m.name.toLowerCase().trim() === name);
  };

  const getRefillDays = (med: Medicine): number | null => {
    if (med.stockCount === undefined || med.stockCount === null) return null;
    const dailyDoses = (med.intakeTimes?.length || med.timings?.length || 1);
    return Math.floor(med.stockCount / dailyDoses);
  };

  const getSlotFromTime = (
    timeStr: string
  ): "morning" | "afternoon" | "evening" | "night" => {
    const [h] = timeStr.split(":").map(Number);
    if (h >= 5 && h < 12) return "morning";
    if (h >= 12 && h < 17) return "afternoon";
    if (h >= 17 && h < 20) return "evening";
    return "night";
  };

  // Search Medicines (same as DashboardView)
  const searchMedicines = async (searchQuery: any) => {
    setNewMedName(searchQuery);
    if (searchQuery.length < 2) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      setMedicineLoading(true);
      const results = await adminService.searchMedicines(searchQuery);
      setFilteredSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error("Medicine search failed:", error);
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setMedicineLoading(false);
    } finally {
      setMedicineLoading(false);
    }
  };

  const handleSelectSuggestion = (s: any) => {
    setNewMedName(s.medicine_name);
    setNewDosage(s.strength + ',' + s.dosage_form || "");
    setNewInstructions(s.instructions || "");
    setShowSuggestions(false);
  };

  const handleTimingToggle = (
    timing: "morning" | "afternoon" | "evening" | "night"
  ) => {
    if (newSelectedTimings.includes(timing)) {
      // ---------- DESELECT ----------
      setNewSelectedTimings(prev => prev.filter(t => t !== timing));

      // Remove every intake time belonging to this slot
      setNewIntakeTimes(prev =>
        prev.filter(time => getSlotFromTime(time) !== timing)
      );
    } else {
      // ---------- SELECT ----------
      setNewSelectedTimings(prev => [...prev, timing]);

      // Auto-add the default intake time for this slot
      const defaultTime = SLOT_DEFAULT_TIME[timing];
      setNewIntakeTimes(prev => {
        if (prev.includes(defaultTime)) return prev;
        return [...prev, defaultTime].sort();
      });
    }
  };

  const fetchMemberDocuments = async () => {
    if (!member?.id) return;
    setLoadingDocuments(true);
    try {
      const docs = await documentService.getUserDocuments(member.id);
      console.log(docs, 'docs')
      // Family member view me private documents hide karo
      const visibleDocs = docs.filter((d: any) => !d.isPrivate);

      setMemberDocuments(visibleDocs);
    } catch (err) {
      console.error("Failed to fetch member documents:", err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchMemberDocuments();

    const interval = setInterval(fetchMemberDocuments, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchMemberDocuments();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [member.id]);

  // 1. FILTERING GLOBAL CONTEXT RECORDS FOR THIS MEMBER
  const memberReminders = useMemo(() => {
    return reminders.filter(r => r.familyMemberId === member.id);
  }, [reminders, member.id]);

  const memberBookings = useMemo(() => {
    // Match bookings by patientName (e.g. Dad, Mom, Grandma) or direct comparison
    return bookings.filter(b => b.patientName?.toLowerCase() === member.nickname?.toLowerCase() || b.patientName?.toLowerCase() === member.name.toLowerCase());
  }, [bookings, member]);

  const memberReports = useMemo(() => {
    // Filter API reports by search query (case‑insensitive)
    return apiReports.filter((r) => {
      const query = searchQuery.toLowerCase();
      return (
        r.report_title?.toLowerCase().includes(query) ||
        r.report_category?.toLowerCase().includes(query)
      );
    });
  }, [apiReports, searchQuery]);

  const memberNotifications = useMemo(() => {
    return notifications.filter(n => n.message.toLowerCase().includes(member.nickname?.toLowerCase() || member.name.toLowerCase()));
  }, [notifications, member]);

  // Mock appointments for premium representation
  const memberAppointments = useMemo(() => {
    return [
      {
        id: "apt-1",
        doctorName: "Dr. Arvind Mehta",
        specialization: "Cardiologist",
        hospital: "Ruby Hall Clinic, Pune",
        date: "2026-07-10",
        time: "10:30 AM",
        status: "upcoming"
      },
      {
        id: "apt-2",
        doctorName: "Dr. Shalini Sen",
        specialization: "General Physician",
        hospital: "Medimz Care Center",
        date: "2026-06-15",
        time: "04:15 PM",
        status: "completed"
      }
    ].filter(a => a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) || a.specialization.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  // Mock Medicine Order History
  const memberOrders = useMemo(() => {
    return [
      {
        id: "ord-1029",
        medicineName: "Metformin 500mg",
        orderDate: "2026-07-01",
        quantity: "60 Tablets",
        status: "Delivered",
        deliveredDate: "2026-07-02",
        supplier: "Medimz Wellness Pharmacy",
        price: 240
      },
      {
        id: "ord-1044",
        medicineName: "Atorvastatin 10mg",
        orderDate: "2026-07-02",
        quantity: "30 Tablets",
        status: "Pending",
        supplier: "Apollo Pharmacy",
        price: 180
      }
    ];
  }, []);

  useEffect(() => {
    if (selectedReport) {
      setPreviewLoading(true);
      setPreviewError(false);
    }
  }, [selectedReport]);

  // Chronological Health History Feed
  const memberHistory = useMemo(() => {
    return [
      { date: "2026-07-03", title: "Routine checkup completed with Dr. Shalini Sen", category: "appointment" },
      { date: "2026-07-02", title: "Blood Sugar Test booked successfully", category: "lab" },
      { date: "2026-07-01", title: "New Prescription uploaded for Metformin 500mg", category: "report" },
      { date: "2026-06-28", title: "Adherence Compliance reached 98% this week", category: "milestone" }
    ];
  }, []);


  const getIntakeTimeOptions = () => {
    const options: { value: string; label: string }[] = [];

    // Morning: 05:00 → 11:30
    if (newSelectedTimings.includes("morning")) {
      for (let h = 5; h <= 11; h++) {
        const hStr = h.toString().padStart(2, "0");
        options.push({ value: `${hStr}:00`, label: `${h}:00 AM` });
        options.push({ value: `${hStr}:30`, label: `${h}:30 AM` });
      }
    }

    // Afternoon: 12:00 → 16:30
    if (newSelectedTimings.includes("afternoon")) {
      for (let h = 12; h <= 16; h++) {
        const displayHour = h > 12 ? h - 12 : h;
        const hStr = h.toString().padStart(2, "0");
        options.push({ value: `${hStr}:00`, label: `${displayHour}:00 PM` });
        options.push({ value: `${hStr}:30`, label: `${displayHour}:30 PM` });
      }
    }

    // Evening: 17:00 → 19:30
    if (newSelectedTimings.includes("evening")) {
      for (let h = 17; h <= 19; h++) {
        const displayHour = h - 12;
        const hStr = h.toString().padStart(2, "0");
        options.push({ value: `${hStr}:00`, label: `${displayHour}:00 PM` });
        options.push({ value: `${hStr}:30`, label: `${displayHour}:30 PM` });
      }
    }

    // Night: 20:00 → 04:30
    if (newSelectedTimings.includes("night")) {
      for (let h = 20; h <= 23; h++) {
        const displayHour = h - 12;
        const hStr = h.toString().padStart(2, "0");
        options.push({ value: `${hStr}:00`, label: `${displayHour}:00 PM` });
        options.push({ value: `${hStr}:30`, label: `${displayHour}:30 PM` });
      }
      for (let h = 0; h < 5; h++) {
        const displayHour = h === 0 ? 12 : h;
        const hStr = h.toString().padStart(2, "0");
        options.push({ value: `${hStr}:00`, label: `${displayHour}:00 AM` });
        options.push({ value: `${hStr}:30`, label: `${displayHour}:30 AM` });
      }
    }

    const uniqueOptions: { value: string; label: string }[] = [];
    const seen = new Set<string>();
    options.forEach(opt => {
      if (!seen.has(opt.value)) {
        seen.add(opt.value);
        uniqueOptions.push(opt);
      }
    });

    return uniqueOptions;
  };

  const getAllTimeOptions = () => {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        const value = `${hh}:${mm}`;
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        const ampm = h >= 12 ? "PM" : "AM";
        const label = `${displayHour}:${mm} ${ampm}`;
        options.push({ value, label });
      }
    }
    return options;
  };

  const handleAddMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Request notification permission
    if (typeof window !== "undefined" && !("Capacitor" in window)) {
      const permission = await requestNotificationPermission();
      if (permission === "denied") {
        alert("Please enable notifications to receive medicine reminders.");
        return;
      }
    }

    // Validate timings (only for non-interval frequencies)
    if (frequency !== "interval" && newSelectedTimings.length === 0) {
      setValidationError("Please select at least one timing slot.");
      return;
    }

    if (newStockCount && parseInt(newStockCount, 10) <= 0) {
      setValidationError("Stock count must be a positive number.");
      return;
    }

    if (!newMedName) return;

    const payload = {
      name: newMedName,
      dosage: newDosage,
      instructions: newInstructions || "As directed",
      frequency: frequency,
      timings: frequency !== "interval" ? newSelectedTimings : [],
      intakeTimes: frequency !== "interval" ? newIntakeTimes : undefined,
      startDate: new Date().toISOString().split("T")[0],
      endDate: untilStopped ? undefined : newEndDate || undefined,
      stockCount: newStockCount ? parseInt(newStockCount, 10) : undefined,
      isPrivate: isPrivate,
      document_id: editingDocumentId || undefined,
      selected_days: (frequency === "specific_days" && selectedDayType === "weekdays") ? selectedDays : undefined,
      repeat_every_n_days: (frequency === "specific_days" && selectedDayType === "normal") ? (repeatEveryNDays ?? undefined) : undefined,
      remind_every: frequency === "interval" ? (intervalHours * 60 + intervalMinutes) : undefined,
      interval_start_time: frequency === "interval" ? intervalStartTime : undefined,
    };

    // Always pass member.id as targetFamilyId (since this is MemberDashboardView)
    const targetFamilyId = isPrivate ? null : member.id;
    try {
      setIsAddingMedicine(true);
      await addMedicine(payload, targetFamilyId);
      // Reset form
      setNewMedName("");
      setNewDosage("");
      setNewInstructions("");
      setNewSelectedTimings(["morning"]);
      setNewIntakeTimes(["08:00"]);
      setNewStockCount("");
      setUntilStopped(true);
      setNewEndDate("");
      setFrequency("every_day");
      setSelectedDays([]);
      setRepeatEveryNDays(null);
      setIntervalHours(8);
      setIntervalMinutes(0);
      setIntervalStartTime("08:00");
      setIsPrivate(false);
      setShowSuggestions(false);
      setShowAddMedsModal(false);

      // Refetch medicines for this member
      const allMeds = await medicineService.getMedicines(member.id);
      setMemberMeds(allMeds);
    } catch (error) {
      console.error('Failed to save medicine:', error);
    } finally {
      setIsAddingMedicine(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) return;

    let calculatedAge = Number(editAge);
    if (editDob) {
      const birth = new Date(editDob);
      const diff = Date.now() - birth.getTime();
      calculatedAge = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    // Nickname bhi isi payload mein bhejo
    updateFamilyMember(member.id, {
      name: editName,
      nickname: editNickname?.trim() || editName,
      relationship: editRel,
      dob: editDob,
      age: calculatedAge,
      gender: editGender,
      bloodGroup: editBloodGroup,
      phone: editPhone,
      medicalConditions: editConditions ? editConditions.split(",").map(s => s.trim()) : [],
      color: editColor,
      avatarUrl: editAvatarUrl,
    });

    // Local map ko turant update karo (UI refresh)
    const trimmed = (editNickname || "").trim();
    if (trimmed) {
      setNicknameMap((prev) => ({ ...prev, [member.id]: trimmed }));
    }

    setShowEditModal(false);
  };

  useEffect(() => {
    if (activeTab !== "reports") return;
    if (member.allowReportSharing !== false) {
      setApiReports([]);
      return;
    }

    const fetchReports = async () => {
      try {
        const allReport = await medicalReportService.getMedicalReports(member.id);
        setApiReports(allReport);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    fetchReports();
    console.log('featch report')
    const interval = setInterval(fetchReports, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchReports();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [member.id, activeTab, member.allowReportSharing]);


  useEffect(() => {
    // Only run fetching logic when the medicines tab is the active one
    if (activeTab !== "medicines") return;

    const fetchMeds = async () => {
      try {
        const allMedsFromDb = await medicineService
          .getMedicines(member.id)
          .catch(() => []);

        // Global medicines state me se bhi is member ke medicines merge karo
        const fromGlobalOwnerSide = medicines.filter(
          (m) => m.familyMemberId === member.id
        );

        const merged = Array.from(
          new Map(
            [...allMedsFromDb, ...fromGlobalOwnerSide].map((m) => [m.id, m])
          ).values()
        );

        console.log("[fetchMeds] merged for", member.name, ":", merged.length);
        setMemberMeds(merged);
      } catch (error) {
        console.error("Failed to fetch medicines:", error);
      }
    };

    fetchMeds(); // fetch immediately on entering the tab
    const interval = setInterval(fetchMeds, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchMeds();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [member.id, activeTab, medicines]);

  // Load per-owner dynamic nicknames for this member.
  useEffect(() => {
    const ownerId = user?.id;
    if (!ownerId || !isSupabaseConfigured) return;

    let cancelled = false;

    (async () => {
      try {
        const list = await nicknameService.getNicknames(ownerId);
        if (cancelled) return;

        const map: Record<string, string> = {};
        list.forEach((n) => {
          map[n.targetUserId] = n.nickname;
        });
        setNicknameMap(map);
      } catch (err) {
        console.error("Failed to load nicknames:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!member?.id) return;

    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const [medsFromDb, reports] = await Promise.all([
          medicineService.getMedicines(member.id).catch(() => []),
          member.allowReportSharing === false
            ? medicalReportService.getMedicalReports(member.id).catch(() => [])
            : Promise.resolve([]),
        ]);
        console.log("[fetchCounts] DEBUG", {
          memberIdFromProp: member.id,
          memberName: member.name,
          memberColor: member.color,
          medicinesLength: medicines.length,
          medicinesFamilyIds: medicines.map((m) => ({
            name: m.name,
            familyMemberId: m.familyMemberId,
          })),
        });
        if (cancelled) return;

        // Local family member ke liye global medicines state me se
        const fromGlobalOwnerSide = medicines.filter(
          (m) => m.familyMemberId === member.id
        );

        const mergedMeds = Array.from(
          new Map(
            [...medsFromDb, ...fromGlobalOwnerSide].map((m) => [m.id, m])
          ).values()
        );

        setMemberMedsCount(mergedMeds.length);
        setMemberReportsCount(reports.length);

        setMemberMeds((prev) => (prev.length === 0 ? mergedMeds : prev));
        setApiReports((prev) => (prev.length === 0 ? reports : prev));
        console.log("[fetchCounts] merged meds:", mergedMeds.length);
      } catch (err) {
        console.error("Failed to fetch summary counts:", err);
      }
    };

    fetchCounts();

    return () => {
      cancelled = true;
    };
  }, [member.id, member.allowReportSharing, medicines]);

  useEffect(() => {
    if (!selectedDocument) {
      setSelectedDocumentUrl(null);
      setDocumentPreviewError(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setDocumentPreviewLoading(true);
      setDocumentPreviewError(false);
      setSelectedDocumentUrl(null);

      try {
        const preview = await getDocumentPreview(selectedDocument.id);
        if (cancelled) return;
        setSelectedDocumentUrl(preview?.previewUrl || null);
      } catch (err) {
        console.error("Failed to load document preview:", err);
        if (!cancelled) setDocumentPreviewError(true);
      } finally {
        if (!cancelled) setDocumentPreviewLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDocument]);

  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* 1. Navigation Header & Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center border border-outline-variant/15 transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-secondary">arrow_back</span>
        </button>
        <div>
          <h2 className="font-headline-md text-base text-secondary font-bold flex items-center gap-2">
            <span>{member.nickname || member.name}'s Health Folder</span>
          </h2>
          <p className="font-body-sm text-[10px] text-on-surface-variant font-medium">Unified family record view</p>
        </div>
      </div>

      {/* 2. PROFILE HERO HEADER */}
      <div className="glass-card bg-gradient-to-br from-secondary-container/20 to-white border border-outline-variant/20 rounded-3xl p-5 shadow-sm relative overflow-hidden">
        {/* Left Member Badge */}
        {!member.isCustom && (
          <div className="absolute left-4 top-4">
            <span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {"Family Sync"}
            </span>
          </div>
        )}
        {/* Accent Color Badge */}
        <div className="absolute right-4 top-4 flex gap-2 items-center">
          <span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {member.relationship}
          </span>
          <div className={`w-3.5 h-3.5 rounded-full bg-${member.color || "blue"}-500`} title="Profile Theme Color" />
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
          <img
            alt={member.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
            src={member.avatarUrl}
          />
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-headline-lg text-lg text-secondary font-extrabold">{member.nickname || member.name}</h3>
              {member.isCustom && (
                <button
                  type="button"
                  onClick={() => {
                    setEditNickname(member.nickname || member.name);
                    setEditName(member.name);
                    setEditRel(member.relationship);
                    setEditDob(member.dob || "");
                    setEditAge(member.age);
                    setEditGender(member.gender);
                    setEditBloodGroup(member.bloodGroup || "O+");
                    setEditPhone(member.phone || "");
                    setEditConditions(member.medicalConditions.join(", "));
                    setEditColor(member.color || "blue");
                    setEditAvatarUrl(member.avatarUrl);

                    // Auto-detect category from current avatar
                    const currentAvatar = AVATAR_ITEMS.find((av) => av.url === member.avatarUrl);
                    setActiveEditAvatarCategory(
                      (currentAvatar?.category as AvatarItem["category"]) || "senior"
                    );

                    setShowEditModal(true);
                  }}
                  className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center border border-outline-variant/10 text-secondary hover:text-primary transition-colors"
                  title="Edit Profile"
                >
                  <span className="material-symbols-outlined text-xs">edit</span>
                </button>)}
            </div>
            <p className="font-body-md text-xs text-on-surface-variant">Full Name: {member.name} • {member.gender}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {member.age && (
                <div className="bg-white/60 p-2 rounded-xl border border-outline-variant/10 text-left">
                  <span className="block text-[8px] font-bold text-outline uppercase">Age</span>
                  <span className="text-xs font-bold text-secondary">{member.age} yrs</span>
                </div>
              )}
              {member.bloodGroup && (
                <div className="bg-white/60 p-2 rounded-xl border border-outline-variant/10 text-left">
                  <span className="block text-[8px] font-bold text-outline uppercase">Blood Type</span>
                  <span className="text-xs font-bold text-secondary">{member.bloodGroup}</span>
                </div>
              )}
              {/* <div className="bg-white/60 p-2 rounded-xl border border-outline-variant/10 text-left">
                <span className="block text-[8px] font-bold text-outline uppercase">Height</span>
                <span className="text-xs font-bold text-secondary">{'-'}</span>
              </div>
              <div className="bg-white/60 p-2 rounded-xl border border-outline-variant/10 text-left">
                <span className="block text-[8px] font-bold text-outline uppercase">Weight</span>
                <span className="text-xs font-bold text-secondary">{"-"}</span>
              </div> */}
            </div>

            <div className="pt-2 text-xs text-on-surface-variant space-y-1 text-left">
              {member.medicalConditions && (<p><strong className="text-secondary">Medical Conditions:</strong> {member.medicalConditions.join(", ")}</p>)}
              {/* <p><strong className="text-secondary">Allergies:</strong> {'-'}</p>
              <p><strong className="text-secondary">Emergency Contact:</strong> {'-'}</p> */}
            </div>
          </div>
        </div>
      </div>

      {/* 3. HEALTH SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveTab("medicines")}
          className={`p-3.5 rounded-2xl border text-left shadow-xs transition-all ${activeTab === "medicines" ? "bg-primary text-on-primary border-primary" : "bg-white text-secondary border-outline-variant/15 hover:bg-surface-container"
            }`}
        >
          <span className="material-symbols-outlined text-lg">medication</span>
          <span className="block text-xs font-bold mt-1">Active Medicines</span>
          <span className="text-lg font-extrabold leading-none">
            {memberMeds.length > 0 ? memberMeds.length : (memberMedsCount ?? 0)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("medicalReport")}
          className={`p-3.5 rounded-2xl border text-left shadow-xs transition-all ${activeTab === "medicalReport" ? "bg-primary text-on-primary border-primary" : "bg-white text-secondary border-outline-variant/15 hover:bg-surface-container"
            }`}
        >
          <span className="material-symbols-outlined text-lg">science</span>
          <span className="block text-xs font-bold mt-1">Medical Document</span>
          <span className="text-lg font-extrabold leading-none">
            {memberDocuments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("appointments")}
          className={`p-3.5 rounded-2xl border text-left shadow-xs transition-all ${activeTab === "appointments" ? "bg-primary text-on-primary border-primary" : "bg-white text-secondary border-outline-variant/15 hover:bg-surface-container"
            }`}
        >
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          <span className="block text-xs font-bold mt-1">Appointments</span>
          <span className="text-lg font-extrabold leading-none">{0}</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`p-3.5 rounded-2xl border text-left shadow-xs transition-all ${activeTab === "reports" ? "bg-primary text-on-primary border-primary" : "bg-white text-secondary border-outline-variant/15 hover:bg-surface-container"
            }`}
        >
          <span className="material-symbols-outlined text-lg">description</span>
          <span className="block text-xs font-bold mt-1">Health Reports</span>
          {/* <span className="text-lg font-extrabold leading-none">{memberReports.length ?? memberReportsCount}</span> */}
          <span className="text-lg font-extrabold leading-none">-</span>
        </button>

        <div className="p-3.5 rounded-2xl bg-white border border-outline-variant/15 text-left shadow-xs col-span-2 md:col-span-1">
          <span className="material-symbols-outlined text-tertiary text-lg">favorite</span>
          <span className="block text-xs font-bold mt-1 text-secondary">Health Score</span>
          <span className="text-lg font-extrabold leading-none text-tertiary">-/100</span>
        </div>
      </div>

      {/* 4. SEARCH BAR & SECTION TAB NAVIGATION */}
      <div className="space-y-3">
        <div className="flex gap-2 bg-surface-container/30 p-1.5 rounded-xl border border-outline-variant/10">
          <span className="material-symbols-outlined text-outline ml-2 my-auto text-lg">search</span>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-on-surface focus:outline-none placeholder-outline"
          />
        </div>

        {/* Tab Pill Navigation */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {[
            { key: "overview", label: "Overview" },
            { key: "medicines", label: "Medicines" },
            { key: "orders", label: "Orders" },
            { key: "medicalReport", label: "Medical Report" },
            { key: "reports", label: "Reports" },
            { key: "appointments", label: "Appointments" },
            { key: "timeline", label: "Timeline" },
            { key: "history", label: "History" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex-shrink-0 whitespace-nowrap ${activeTab === key
                ? "bg-secondary text-on-secondary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/10"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. DYNAMIC TAB SUBSECTIONS CONTENT */}

      {/* OVERVIEW SUBSECTION */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Schedule timeline preview */}
          <div className="glass-card p-5 border border-outline-variant/20 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-headline-md text-xs text-secondary font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                <span>Today's Reminder Slots</span>
              </h4>
              <button onClick={() => setActiveTab("timeline")} className="text-[10px] font-bold text-primary hover:underline">View Timeline</button>
            </div>
            <div className="space-y-2">
              {memberReminders.length > 0 ? (
                (() => {
                  // Group by timingSlot and take the first reminder for each slot
                  const slots = ["morning", "afternoon", "evening", "night"];
                  const slotMap = new Map();
                  memberReminders.forEach(rem => {
                    if (!slotMap.has(rem.timingSlot)) {
                      slotMap.set(rem.timingSlot, rem);
                    }
                  });
                  // Build list in the correct order
                  const orderedReminders = slots
                    .map(slot => slotMap.get(slot))
                    .filter(Boolean);
                  return orderedReminders.map((rem) => (
                    <div key={rem.id} className="p-3 bg-surface-container-low rounded-xl flex justify-between items-center border border-outline-variant/10">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">pill</span>
                        <span className="text-xs font-bold text-secondary">{rem.medicineName}</span>
                      </div>
                      <span className="text-[9px] bg-secondary-container/10 text-secondary font-bold px-2 py-0.5 rounded uppercase">{rem.timingSlot}</span>
                    </div>
                  ));
                })()
              ) : (
                <p className="text-[10px] text-on-surface-variant text-center py-4">No active reminders configured for today</p>
              )}
            </div>
          </div>

          {/* Chronological history preview */}
          <div className="glass-card p-5 border border-outline-variant/20 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-headline-md text-xs text-secondary font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">history</span>
                <span>Member Health Log</span>
              </h4>
              <button onClick={() => setActiveTab("history")} className="text-[10px] font-bold text-primary hover:underline">Full Log</button>
            </div>
            <div className="space-y-3 pl-2 relative border-l border-outline-variant/25">
              {(!memberHistory.length ? memberHistory.slice(0, 3).map((h, i) => (
                <div key={i} className="relative pl-3">
                  <div className="absolute -left-[16px] top-1.5 w-2 h-2 rounded-full bg-secondary" />
                  <span className="block text-[8px] font-bold text-outline">{h.date}</span>
                  <span className="text-[10px] font-bold text-secondary leading-tight block">{h.title}</span>
                </div>
              )) :
                <p className="text-[10px] text-on-surface-variant italic py-4 text-center">No health history available</p>)}
            </div>
          </div>
        </div>
      )}

      {/* MEDICINES SUBSECTION */}
      {activeTab === "medicines" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-headline-md text-xs text-secondary font-bold">Configured Active Medicines</h4>
            <button
              onClick={() => {
                setExtractedMedicines(null);
                setExtractedReport(null);
                setExtractedPreviewVisible(false);
                setOcrError(null);
                setShowEntryChoiceModal(true);
              }}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>Add Medicine</span>
            </button>
          </div>

          {memberMeds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {memberMeds.map((med) => {
                const refillDays = getRefillDays(med);
                return (
                  <div key={med.id} className="p-4 bg-white border border-outline-variant/25 rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-headline-md text-xs text-secondary font-extrabold">{med.name}</h5>
                        <span className="text-[9px] text-outline font-bold block mt-0.5">Dosage: {med.dosage}</span>
                      </div>
                      <span className="bg-primary/5 text-primary text-[8px] px-2 py-0.5 rounded font-extrabold uppercase">Active</span>
                    </div>
                    <div className="text-[10px] text-on-surface-variant">
                      <p><strong className="text-secondary">Instructions:</strong> {med.instructions || "Take after meals"}</p>
                      <p><strong className="text-secondary">Frequency:</strong> {med.timings.join(", ") || "-"}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-outline-variant/10 pt-2.5 mt-1">
                      {refillDays !== null ? (
                        refillDays <= 6 ? (
                          <span className="text-[9px] text-tertiary font-bold">Refill in {refillDays} days</span>
                        ) : (
                          <span className="text-[9px] text-tertiary font-bold">{refillDays} days remaining</span>
                        )
                      ) : (
                        <span className="text-[9px] text-outline font-bold">Stock not tracked</span>
                      )}
                      <button className="bg-secondary text-on-secondary px-3 py-1 rounded-lg text-[9px] font-bold shadow-xs hover:opacity-90">
                        Reorder Meds
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/15">
              <span className="material-symbols-outlined text-3xl text-outline-variant">medication</span>
              <p className="text-xs font-bold mt-2">No Active Medicines</p>
              <p className="text-[10px]">Add a medicine to start tracking.</p>
            </div>
          )}
        </div>
      )}

      {/* ORDERS SUBSECTION */}
      {activeTab === "orders" && (
        <div className="space-y-3">
          <h4 className="font-headline-md text-xs text-secondary font-bold">Medicine Orders History</h4>
          <div className="space-y-2">
            {(!memberOrders?.length) ? memberOrders.map((o) => (
              <div key={o.id} className="p-3 bg-white border border-outline-variant/15 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-xs text-secondary font-bold">{o.medicineName}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${o.status === "Delivered" ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
                      }`}>{o.status}</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1">Order Date: {o.orderDate} • Supplier: {o.supplier}</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-1 bg-surface-container text-secondary text-[9px] font-bold rounded-lg hover:bg-surface-container-high">
                    Track Order
                  </button>
                  <button className="px-3 py-1 bg-primary text-on-primary text-[9px] font-bold rounded-lg hover:opacity-90">
                    Reorder
                  </button>
                </div>
              </div>
            )) : (
              <div className="space-y-3">
                <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/15">
                  <span className="material-symbols-outlined text-3xl text-outline-variant">inbox</span>
                  <p className="text-xs font-bold mt-2">No Orders Found</p>
                  <p className="text-[10px]">Orders will appear here once placed.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LABS SUBSECTION */}
      {activeTab === "medicalReport" && (
        <div className="space-y-5">
          <div className="space-y-3">
            <h4 className="font-headline-md text-xs text-secondary font-bold">
              Uploaded Medical Reports
            </h4>

            {loadingDocuments ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
                <p className="text-xs text-outline mt-2">Loading documents...</p>
              </div>
            ) : memberDocuments.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/15">
                <span className="material-symbols-outlined text-3xl text-outline-variant">
                  description
                </span>
                <p className="text-xs font-bold mt-2">No Medical Reports Uploaded</p>
                <p className="text-[10px]">
                  This member hasn't uploaded any documents yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {memberDocuments.map((doc) => {
                  // Category label
                  const categoryLabel =
                    TEST_CATEGORY.find((c) => c.key === doc.reportCategory)?.label ||
                    doc.reportCategory ||
                    "Report";

                  // Date (prefer report_date, fallback created_at)
                  const dateStr = doc.reportDate || doc.createdAt;
                  const displayDate = dateStr
                    ? new Date(dateStr).toLocaleDateString()
                    : "—";

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className="p-3.5 bg-surface-container-low rounded-xl flex gap-3 border border-outline-variant/15 hover:bg-surface-container transition-colors items-center cursor-pointer"
                    >
                      <div className="flex gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-lg">
                            {doc.mimeType === "application/pdf" ? "picture_as_pdf" : "image"}
                          </span>
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          {/* Row 1: category badge + private badge + date */}
                          <div className="flex items-center flex-wrap gap-1">
                            <span className="bg-secondary/10 text-secondary text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              {categoryLabel}
                            </span>

                            {doc.isPrivate && (
                              <div className="bg-red-100 text-red-600 rounded font-bold  px-1.5 py-0.5 flex gap-1 items-center">
                                <span className="material-symbols-outlined text-sm!">lock</span>
                                <span className=" text-[8px] tracking-wide!">
                                  Private
                                </span>
                              </div>
                            )}

                            <span className="text-secondary text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              • {displayDate}
                            </span>
                          </div>

                          {/* Row 2: file name */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-outline font-semibold flex items-center gap-0.5 truncate">
                              <span className="material-symbols-outlined text-sm! shrink-0">
                                description
                              </span>
                              <span className="truncate">{doc.fileName}</span>
                            </span>
                          </div>

                          {/* Row 3: note (only if present) */}
                          {doc.note && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm! text-outline shrink-0">
                                notes
                              </span>
                              <span className="text-[10px] text-on-surface-variant italic truncate">
                                {doc.note}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}


      {/* {activeTab === "labs" && (
        <div className="space-y-3">
          <h4 className="font-headline-md text-xs text-secondary font-bold">Laboratory Diagnostic Bookings</h4>
          <div className="space-y-2">
            {memberBookings.length > 0 ? (
              memberBookings.map((b) => (
                <div key={b.id} className="p-3.5 bg-white border border-outline-variant/15 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-headline-md text-xs text-secondary font-extrabold">{b.testNames.join(", ")}</h5>
                      <span className="text-[9px] text-outline font-bold">{b.labName}</span>
                    </div>
                    <span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded font-extrabold uppercase">{b.status}</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant">Scheduled: {b.bookingDate} at {b.timeSlot}</p>
                  <div className="flex justify-end gap-2 border-t border-outline-variant/10 pt-2.5">
                    <button className="px-3 py-1 bg-surface-container text-secondary text-[9px] font-bold rounded-lg">Rebook Test</button>
                    <button className="px-3 py-1 bg-primary text-on-primary text-[9px] font-bold rounded-lg">Download Report</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/15">
                <span className="material-symbols-outlined text-3xl text-outline-variant">science</span>
                <p className="text-xs font-bold mt-2">No Lab Bookings</p>
                <p className="text-[10px]">Book a lab test to see it here.</p>
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* REPORTS SUBSECTION */}
      {activeTab === "reports" && (
        <div className="space-y-3">
          <h4 className="font-headline-md text-xs text-secondary font-bold">Uploaded Medical Records & PDF Reports</h4>

          {/* show reports only if allowReportSharing is false */}
          {member.allowReportSharing === false ? (
            <>
              {/* {memberReports.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {memberReports.map((rep) => {
                    const displayName = rep.report_title || rep.report_category;
                    const dateStr = rep.created_at ? new Date(rep.created_at).toLocaleDateString() : "Today";
                    return (
                      <div
                        key={rep.id}
                        onClick={async () => {
                          setSelectedReport(rep);
                          setPreviewLoading(true);
                          setPreviewError(false);
                          setSignedUrl(null);
                          try {
                            if (rep.document_id) {
                              const preview = await getDocumentPreview(rep.document_id);
                              setSignedUrl(preview.previewUrl);
                            } else {
                              setSignedUrl(null);
                            }
                          } catch (error) {
                            console.error("Failed to fetch preview:", error);
                            setPreviewError(true);
                            setSignedUrl(null);
                          } finally {
                            setPreviewLoading(false);
                          }
                        }}
                        className="p-3 bg-white border border-outline-variant/15 rounded-xl flex gap-3 items-center cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined">picture_as_pdf</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-headline-md text-xs text-secondary font-bold truncate">{displayName}</h5>
                          <p className="text-[9px] text-on-surface-variant truncate mt-0.5">
                            {dateStr} • {rep.report_category}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/15">
                  <span className="material-symbols-outlined text-3xl text-outline-variant">description</span>
                  <p className="text-xs font-bold mt-2">No Reports Found</p>
                  <p className="text-[10px]">Upload a medical report to see it here.</p>
                </div>
              )} */}

              <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/15">
                <span className="material-symbols-outlined text-3xl text-outline-variant">description</span>
                <p className="text-xs font-bold mt-2">No Reports Found</p>
                <p className="text-[10px]">Upload a Health report to see it here.</p>
              </div>
            </>
          ) : (
            /* 👇 Shown when allowReportSharing === true (or undefined) */
            <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/15">
              <span className="material-symbols-outlined text-3xl text-outline-variant">visibility_off</span>
              <p className="text-xs font-bold mt-2">Reports Not Shared</p>
              <p className="text-[10px]">This member has chosen not to share medical reports.</p>
            </div>
          )}
        </div>
      )}

      {/* APPOINTMENTS SUBSECTION */}
      {activeTab === "appointments" && (
        <div className="space-y-3">
          <h4 className="font-headline-md text-xs text-secondary font-bold">Doctor Appointments List</h4>
          <div className="space-y-2.5">
            {(!memberAppointments.length) ? (
              memberAppointments.map((apt) => (
                <div key={apt.id} className="p-4 bg-white border border-outline-variant/15 rounded-2xl flex justify-between items-center gap-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined">medical_information</span>
                    </div>
                    <div>
                      <h5 className="font-headline-md text-xs text-secondary font-extrabold">{apt.doctorName}</h5>
                      <p className="text-[9px] text-outline font-bold">{apt.specialization} • {apt.hospital}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-1">Date: {apt.date} at {apt.time}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase ${apt.status === "upcoming" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"
                    }`}>{apt.status}</span>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/15">
                  <span className="material-symbols-outlined text-3xl text-outline-variant">event_busy</span>
                  <p className="text-xs font-bold mt-2">No Appointments Scheduled</p>
                  <p className="text-[10px]">Upcoming appointments will be listed here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIMELINE SUBSECTION */}
      {activeTab === "timeline" && (
        <div className="space-y-3 pl-4 relative border-l-2 border-outline-variant/20">
          {["morning", "afternoon", "evening", "night"].map((slot) => {
            const slotRems = memberReminders.filter(r => r.timingSlot === slot);
            return (
              <div key={slot} className="relative pl-3 pb-4">
                <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-primary" />
                <h4 className="font-headline-md text-xs text-secondary font-bold uppercase tracking-wider">{slot}</h4>
                <div className="space-y-2 mt-2">
                  {slotRems.map((r) => (
                    <div key={r.id} className="p-3 bg-white border border-outline-variant/15 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-secondary block">{r.medicineName}</span>
                        <span className="text-[9px] text-on-surface-variant">{r.dosage} • {r.instructions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.status === "taken" ? (
                          <span className="material-symbols-outlined text-tertiary text-lg">check_circle</span>
                        ) : (
                          <button
                            onClick={() => toggleReminderStatus(r.id, "taken")}
                            className="bg-primary text-on-primary px-3 py-1 rounded-lg text-[9px] font-bold shadow-xs hover:opacity-90"
                          >
                            Take
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {slotRems.length === 0 && (
                    <p className="text-[10px] text-on-surface-variant italic">No medications scheduled for {slot}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HISTORY SUBSECTION */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <h4 className="font-headline-md text-xs text-secondary font-bold">Chronological Health Journal</h4>
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-outline-variant/30" />
            {(!memberHistory.length) ? (
              memberHistory.map((h, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-secondary border-2 border-white shadow-xs" />
                  <div>
                    <span className="text-[9px] text-outline font-bold">{h.date}</span>
                    <div className="p-3 bg-surface-container-low border border-outline-variant/10 rounded-xl mt-1">
                      <p className="text-xs font-bold text-secondary">{h.title}</p>
                      <span className="bg-primary/5 text-primary text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase mt-2 inline-block">
                        {h.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/15">
                  <span className="material-symbols-outlined text-3xl text-outline-variant">history</span>
                  <p className="text-xs font-bold mt-2">No History Records</p>
                  <p className="text-[10px]">Historical health events will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. FLOATING QUICK ACTION BUTTON (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          type="button"
          onClick={() => {
            setExtractedMedicines(null);
            setExtractedReport(null);
            setExtractedPreviewVisible(false);
            setOcrError(null);
            setShowEntryChoiceModal(true);
          }}
          className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl font-bold">add</span>
        </button>
      </div>

      {/* Add Medicine Modal */}
      {showAddMedsModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">medication</span>
                <span>Add Medicine for {member.nickname || member.name}</span>
              </h3>
              <button
                onClick={() => setShowAddMedsModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMedSubmit} className="space-y-4 text-left">
              {/* Medicine Name with Suggestions */}
              <div className="space-y-1 relative">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin, Atorvastatin"
                  value={newMedName}
                  onChange={(query) => searchMedicines(query.target.value)}
                  onFocus={() => { if (filteredSuggestions.length > 0) setShowSuggestions(true); }}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-outline-variant/20 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s.id ?? s.medicine_name}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-primary-container/10 transition-colors flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-bold text-secondary">{s.medicine_name}</span>
                          {s.strength && <span className="text-[10px] text-on-surface-variant block mt-0.5">{s.strength}</span>}
                        </div>
                        {s.dosage_form && (
                          <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">
                            {s.dosage_form}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dosage & Instructions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 1 tablet"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. After Food, Empty Stomach"
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Stock Count */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Stock Count</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 30 (pills/doses)"
                  value={newStockCount}
                  onChange={(e) => setNewStockCount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Keep Private Checkbox */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-orange-50/30 border border-orange-200/40 flex items-center justify-between">
                <div>
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider">Keep Private</label>
                  <span className="text-[10px] text-on-surface-variant block">Do not share this medicine on family portal</span>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50"
                />
              </div>

              {/* Frequency Section */}
              <div className="space-y-2 bg-surface-container-low/40 p-3 rounded-2xl border border-outline-variant/10">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => {
                    const newFreq = e.target.value as "every_day" | "specific_days" | "interval";
                    setFrequency(newFreq);
                    if (newFreq === "specific_days") {
                      setSelectedDayType("weekdays");
                      setShowWeekOptions(true);
                    } else if (newFreq === "interval") {
                      setShowWeekOptions(false);
                      setShowDurationPicker(false);
                      setSelectedDays([]);
                      setRepeatEveryNDays(null);
                      setNewSelectedTimings([]);
                      setNewIntakeTimes([]);
                    } else {
                      setShowWeekOptions(false);
                      setShowDurationPicker(false);
                      setSelectedDays([]);
                      setRepeatEveryNDays(null);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  {frequencyOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                {/* Interval Options */}
                {frequency === 'interval' && (
                  <div className='flex flex-col gap-2'>
                    <span className='text-sm flex items-center gap-2'>
                      Remind every
                      <select
                        value={intervalHours}
                        onChange={(e) => setIntervalHours(Number(e.target.value))}
                        className='border border-primary rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary'
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                          <option key={h} value={h}>{h} {h === 1 ? 'Hour' : 'Hours'}</option>
                        ))}
                      </select>
                      <select
                        value={intervalMinutes}
                        onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                        className='border border-primary rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary'
                      >
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                          <option key={m} value={m}>{m} min</option>
                        ))}
                      </select>
                    </span>
                    <span className='text-sm relative flex items-center'>
                      Start time
                      <button
                        type='button'
                        className='border border-primary px-2 py-1 rounded ml-3 bg-white'
                        onClick={() => setShowStartTimeDropdown(!showStartTimeDropdown)}
                      >
                        {getAllTimeOptions().find(o => o.value === intervalStartTime)?.label || '8:00 AM'}
                      </button>
                      {showStartTimeDropdown && (
                        <div className="absolute mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 w-40 top-full left-0">
                          {getAllTimeOptions().map(opt => (
                            <div
                              key={opt.value}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => { setIntervalStartTime(opt.value); setShowStartTimeDropdown(false); }}
                            >
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </span>
                  </div>
                )}

                {/* Specific Days */}
                {frequency === "specific_days" && (
                  <div className="inline-flex w-full p-1 rounded-lg bg-orange-50/30 border border-orange-200/60">
                    <button
                      type="button"
                      onClick={() => { setShowWeekOptions(true); setShowDurationPicker(false); setSelectedDayType("weekdays"); setRepeatEveryNDays(null); }}
                      className={`flex-1 px-4 py-1 text-sm font-medium rounded-md transition-all ${selectedDayType === "weekdays"
                        ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-200"
                        : "text-gray-500 hover:text-orange-600 hover:bg-orange-100/50"
                        }`}
                    >
                      Week Days
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowDurationPicker(true); setShowWeekOptions(false); setSelectedDayType("normal"); }}
                      className={`flex-1 px-4 py-1 text-sm font-medium rounded-md transition-all ${selectedDayType === "normal"
                        ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-200"
                        : "text-gray-500 hover:text-orange-600 hover:bg-orange-100/50"
                        }`}
                    >
                      {repeatEveryNDays !== null ? `Every ${repeatEveryNDays} day${repeatEveryNDays > 1 ? 's' : ''}` : "Days"}
                    </button>
                  </div>
                )}

                {/* Week Days Selection */}
                {showWeekOptions && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {WEEK_DAYS.map((day) => {
                      const isSelected = selectedDays.includes(day.key);
                      return (
                        <label key={day.key} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${isSelected
                          ? "bg-primary-container/20 border-primary text-primary"
                          : "bg-white border-outline-variant/30 text-on-surface-variant"
                          }`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedDays(prev => [...prev, day.key]);
                              else setSelectedDays(prev => prev.filter(item => item !== day.key));
                            }}
                            className="h-4 w-4 rounded border-outline-variant/50 text-primary accent-primary"
                          />
                          <span className="text-xs font-bold">{day.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Duration Picker */}
                {showDurationPicker && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
                    <div className="w-[360px] bg-white rounded-2xl p-5 shadow-2xl">
                      <h3 className="text-sm font-bold mb-4">Every</h3>
                      <div className="max-h-52 overflow-y-auto">
                        {[1, 2, 3, 4, 5, 7, 14, 30, 60, 90, 100].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => { setRepeatEveryNDays(days); setShowDurationPicker(false); }}
                            className={`w-full py-3 text-center text-sm ${repeatEveryNDays === days
                              ? "text-primary font-bold border-y border-primary"
                              : "text-gray-500"
                              }`}
                          >
                            {days} {days === 1 ? "day" : "days"}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-end gap-6 mt-5">
                        <button type="button" onClick={() => setShowDurationPicker(false)} className="text-primary font-bold text-sm">CANCEL</button>
                        <button type="button" onClick={() => setShowDurationPicker(false)} className="text-primary font-bold text-sm">SET</button>
                      </div>
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={untilStopped}
                    onChange={(e) => setUntilStopped(e.target.checked)}
                    className="h-4 w-4 rounded border-outline-variant/50 text-primary accent-primary"
                  />
                  <span className="font-label-sm text-xs font-bold text-secondary">Set reminder until stopped</span>
                </label>

                {!untilStopped && (
                  <div className="space-y-1.5 pt-1.5">
                    <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Remind Until Date</label>
                    <input
                      type="date"
                      required={!untilStopped}
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-outline-variant/30 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Timing Slots */}
              {frequency !== "interval" && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Schedule Slots</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["morning", "afternoon", "evening", "night"].map((slot) => {
                        const isSelected = newSelectedTimings.includes(slot as any);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleTimingToggle(slot as any)}
                            className={`py-2 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 font-label-md text-xs font-bold ${isSelected
                              ? "bg-primary-container/20 border-primary text-primary"
                              : "bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary/30"
                              }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {slot === "morning" && "light_mode"}
                              {slot === "afternoon" && "sunny"}
                              {slot === "evening" && "wb_twilight"}
                              {slot === "night" && "bedtime"}
                            </span>
                            <span className="capitalize">{slot}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-surface-container-low/40 p-3 rounded-2xl border border-outline-variant/10">
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Preferred Intake Times</label>
                    <div className="flex gap-2">
                      <select
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-outline-variant/30 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary text-on-surface"
                      >
                        {getIntakeTimeOptions().length > 0 ? (
                          getIntakeTimeOptions().map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))
                        ) : (
                          <option value="">Select general slot first</option>
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (timeInput && !newIntakeTimes.includes(timeInput)) {
                            setNewIntakeTimes(prev => [...prev, timeInput].sort());
                          }
                        }}
                        className="px-3 py-1.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all"
                      >
                        Add Time
                      </button>
                    </div>
                    {newIntakeTimes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {newIntakeTimes.map(t => {
                          const [hStr, mStr] = t.split(":");
                          const h = parseInt(hStr, 10);
                          const ampm = h >= 12 ? "PM" : "AM";
                          const displayHour = h % 12 === 0 ? 12 : h % 12;
                          return (
                            <span key={t} className="bg-primary/5 text-primary text-[10px] pl-2.5 pr-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-primary/10">
                              <span>{`${displayHour}:${mStr} ${ampm}`}</span>
                              <button
                                type="button"
                                onClick={() => setNewIntakeTimes(prev => prev.filter(item => item !== t))}
                                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/10 text-primary"
                              >
                                <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Note: Member is fixed, no need for Family Member Select */}
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-[10px] text-secondary font-bold">
                  <span className="material-symbols-outlined text-sm align-middle">person</span>
                  This medicine will be added for: <span className="text-primary font-extrabold">{member.nickname || member.name}</span>
                </p>
              </div>

              {validationError && (
                <p className="text-red-500 text-xs font-bold text-center mt-2">{validationError}</p>
              )}

              <button
                type="submit"
                disabled={isAddingMedicine}
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md mt-2 flex items-center justify-center gap-2"
              >
                {isAddingMedicine ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Medicine for ' + (member.nickname || member.name)
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. Report Preview Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-primary">description</span>
                <div className="min-w-0">
                  <h3 className="font-headline-md text-sm text-secondary font-bold truncate">
                    {selectedReport.report_title || selectedReport.report_category}
                  </h3>
                  <p className="text-[10px] text-outline">
                    {selectedReport.date || ""} • AI summarized
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-full hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-4 bg-surface-container-low/30">
              {(() => {
                const previewSrc = signedUrl || selectedReport?.fileUrl || selectedReport?.document?.previewUrl || null;
                if (!previewSrc) {
                  return (
                    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                      <span className="material-symbols-outlined text-6xl text-outline-variant">image_not_supported</span>
                      <p className="text-sm text-on-surface-variant mt-2">No preview available for this report.</p>
                    </div>
                  );
                }
                if (previewSrc.toLowerCase().endsWith('.pdf')) {
                  return (
                    <iframe
                      src={previewSrc}
                      className="w-full h-[70vh] rounded-lg"
                      title={selectedReport?.report_title}
                    />
                  );
                }
                return (
                  <div className="relative flex items-center justify-center min-h-[50vh]">
                    {previewLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
                      </div>
                    )}
                    {!previewError ? (
                      <img
                        key={selectedReport?.id || previewSrc}
                        src={previewSrc}
                        alt={selectedReport?.report_title || "Report"}
                        className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
                        onLoad={() => setPreviewLoading(false)}
                        onError={() => {
                          setPreviewLoading(false);
                          setPreviewError(true);
                        }}
                        style={{ display: previewLoading ? 'none' : 'block' }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                        <span className="material-symbols-outlined text-6xl text-outline-variant">image_not_supported</span>
                        <p className="text-sm text-on-surface-variant mt-2">Failed to load image preview.</p>
                        <a
                          href={previewSrc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 text-primary text-sm font-bold underline"
                        >
                          Open in new tab
                        </a>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-primary">
                  {selectedDocument.mimeType === "application/pdf" ? "picture_as_pdf" : "image"}
                </span>
                <div className="min-w-0">
                  <h3 className="font-headline-md text-sm text-secondary font-bold truncate">
                    {selectedDocument.fileName}
                  </h3>
                  <p className="text-[10px] text-outline">
                    {TEST_CATEGORY.find((c) => c.key === selectedDocument.reportCategory)?.label
                      || selectedDocument.reportCategory
                      || "Document"}
                    {" • "}
                    {selectedDocument.reportDate
                      ? new Date(selectedDocument.reportDate).toLocaleDateString()
                      : selectedDocument.createdAt
                        ? new Date(selectedDocument.createdAt).toLocaleDateString()
                        : "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-auto p-4 bg-surface-container-low/30">
              {documentPreviewLoading ? (
                <div className="flex flex-col items-center justify-center h-[70vh]">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
                  <p className="text-xs text-outline mt-3">Loading document...</p>
                </div>
              ) : documentPreviewError || !selectedDocumentUrl ? (
                <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                  <span className="material-symbols-outlined text-6xl text-outline-variant">
                    image_not_supported
                  </span>
                  <p className="text-sm text-on-surface-variant mt-2">
                    No preview available for this document.
                  </p>
                </div>
              ) : selectedDocument.mimeType === "application/pdf" ||
                selectedDocumentUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={selectedDocumentUrl}
                  className="w-full h-[70vh] rounded-lg"
                  title={selectedDocument.fileName}
                />
              ) : (
                <div className="relative flex items-center justify-center min-h-[50vh]">
                  <img
                    src={selectedDocumentUrl}
                    alt={selectedDocument.fileName}
                    className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
                    onError={() => setDocumentPreviewError(true)}
                  />
                </div>
              )}
            </div>

            {/* Optional note footer */}
            {selectedDocument.note && (
              <div className="border-t border-outline-variant/20 p-3 bg-white">
                <p className="text-[10px] text-on-surface-variant italic">
                  <span className="material-symbols-outlined text-sm align-middle text-outline">
                    notes
                  </span>{" "}
                  {selectedDocument.note}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ENTRY CHOICE MODAL */}
      {showEntryChoiceModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">medication</span>
                <span>Add Reminder</span>
              </h3>
              <button
                onClick={() => {
                  setShowEntryChoiceModal(false);
                  setExtractedMedicines(null);
                  setExtractedReport(null);
                  setExtractedPreviewVisible(false);
                  setSelectedMedicineIndex(null);
                  setOcrError(null);
                }}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* If not in preview mode, show uploader + manual button */}
              {!extractedPreviewVisible ? (
                <>
                  <p className="text-xs text-on-surface-variant text-center">
                    Upload a prescription or enter manually
                  </p>

                  {/* OCR Uploader */}
                  <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-4 bg-surface-container-low/30">
                    <OCRUploader
                      onComplete={async (data) => {
                        setOcrError(null);
                        setOcrWarning?.(null); // if you have this state, otherwise remove
                        setSelectedMedicineIndex(null);
                        setOcrMedicineData(data);

                        const hasMedicines = data.medicines && data.medicines.length > 0;
                        const hasReportResults = data.report && data.report.results && data.report.results.length > 0;
                        const hasValidData = hasMedicines;

                        if (hasValidData) {
                          if (hasMedicines) {
                            setExtractedMedicines(data.medicines);
                            setExtractedReport(null);
                            setExtractedPreviewVisible(true);
                          } else if (hasReportResults) {
                            setExtractedReport(data.report);
                            setExtractedMedicines(null);
                            setExtractedPreviewVisible(true);
                          }
                        } else {
                          setOcrMedicineData(null);
                          setOcrError('No medicines found. Please try again or enter manually.');
                          setExtractedPreviewVisible(false);
                        }
                      }}
                      onError={(err) => {
                        setOcrMedicineData(null);
                        setOcrError('Please upload a valid image or PDF to generate automatically.');
                        console.error(err);
                      }}
                      onClear={() => {
                        setOcrMedicineData(null);
                        setOcrError(null);
                        setOcrWarning?.(null);
                      }}
                    />
                    {ocrError && <p className="text-red-500 text-xs font-medium text-center mt-2">{ocrError}</p>}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-grow h-px bg-outline-variant/30" />
                    <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Or</span>
                    <div className="flex-grow h-px bg-outline-variant/30" />
                  </div>

                  {/* Manual Entry Button */}
                  <button
                    onClick={() => {
                      setShowEntryChoiceModal(false);
                      setNewMedName("");
                      setNewDosage("");
                      setNewInstructions("");
                      setNewSelectedTimings(["morning"]);
                      setNewIntakeTimes(["08:00"]);
                      setNewStockCount("");
                      setUntilStopped(true);
                      setNewEndDate("");
                      setFrequency("every_day");
                      setSelectedDays([]);
                      setRepeatEveryNDays(null);
                      setIntervalHours(8);
                      setIntervalMinutes(0);
                      setIntervalStartTime("08:00");
                      setIsPrivate(false);
                      setEditingDocumentId(null);
                      setShowSuggestions(false);
                      setShowAddMedsModal(true);
                    }}
                    className="w-full py-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-xl font-label-md text-[15px] text-secondary font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <span className="material-symbols-outlined text-sm">edit_note</span>
                    <span>Add Manually by Typing Name</span>
                  </button>
                </>
              ) : (
                /* PREVIEW MODE – show extracted medicines (with checkboxes) */
                <>
                  {/* Warning banner */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-700">
                    <span className="material-symbols-outlined text-sm mt-0.5">warning</span>
                    <span>Extracted information may contain errors. Please verify it against the original prescription or report before use.</span>
                  </div>
                  <h4 className="font-headline-md text-xs text-secondary font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">preview</span>
                    Extracted Details
                  </h4>

                  {extractedMedicines && extractedMedicines.length > 0 ? (
                    <>
                      {/* Medicine list with radio‑like checkboxes */}
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {extractedMedicines.map((med, idx) => {
                            const isSelected = selectedMedicineIndex === idx;
                            const alreadyAdded = isMedicineAlreadyAdded(med);
                            return (
                              <label
                                key={idx}
                                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                  ? "bg-primary-container/10 border-primary"
                                  : "bg-surface-container-low/30 border-outline-variant/10 hover:border-primary/30"
                                  } ${alreadyAdded ? "opacity-50 pointer-events-none" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (alreadyAdded) return;
                                    setSelectedMedicineIndex(prev => prev === idx ? null : idx);
                                  }}
                                  disabled={alreadyAdded}
                                  className="mt-0.5 h-4 w-4 rounded border-outline-variant/50 text-primary accent-primary"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold text-xs text-secondary truncate">
                                      {med.medicine_name || med.name}
                                    </span>
                                    <span className="text-[10px] text-on-surface-variant ml-2 whitespace-nowrap">
                                      {med.dosage || ""}
                                    </span>
                                  </div>
                                  {med.instructions && (
                                    <p className="text-[10px] text-on-surface-variant mt-0.5">{med.instructions}</p>
                                  )}
                                  {med.duration && (
                                    <p className="text-[10px] text-on-surface-variant mt-0.5">Duration: {med.duration}</p>
                                  )}
                                  {alreadyAdded && (
                                    <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                      Already added
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => {
                            if (selectedMedicineIndex === null) return;
                            const med = extractedMedicines[selectedMedicineIndex];
                            // Pre‑fill the manual form
                            setNewMedName(med.medicine_name || med.name);
                            setNewDosage(med.dosage || "");
                            setNewInstructions(med.instructions || "");
                            setEditingDocumentId(ocrMedicineData?.document_id || null);
                            // Reset other fields as needed
                            setNewSelectedTimings(["morning"]);
                            setNewIntakeTimes([]);
                            setNewStockCount("");
                            setUntilStopped(true);
                            setNewEndDate("");
                            setIsPrivate(false);
                            setFrequency("every_day");
                            setSelectedDays([]);
                            setRepeatEveryNDays(null);
                            setIntervalHours(8);
                            setIntervalMinutes(0);
                            setIntervalStartTime("08:00");
                            // Close choice modal and open manual modal
                            setShowEntryChoiceModal(false);
                            setShowAddMedsModal(true);
                          }}
                          disabled={selectedMedicineIndex === null}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${selectedMedicineIndex !== null
                            ? "bg-primary text-on-primary hover:opacity-90 active:scale-95"
                            : "bg-outline-variant/20 text-on-surface-variant/50 cursor-not-allowed"
                            }`}
                        >
                          <span className="material-symbols-outlined text-sm align-middle">add</span>
                          Add Reminder
                        </button>
                      </div>

                      <p className="text-[10px] text-on-surface-variant text-center mt-1">
                        <span className="material-symbols-outlined text-xs align-middle">info</span>
                        Select a medicine, then click “Add Reminder” to edit and save.
                      </p>
                    </>
                  ) : extractedReport && extractedReport.results && extractedReport.results.length > 0 ? (
                    /* Lab report preview (no checkboxes) */
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      <div className="bg-primary-container/5 p-2 rounded-lg border border-outline-variant/10">
                        <p className="text-[10px] font-bold text-secondary">
                          {extractedReport.title || extractedReport.category || "Lab Report"}
                        </p>
                        {extractedReport.diagnosis && (
                          <p className="text-[10px] text-on-surface-variant mt-0.5">
                            Diagnosis: {extractedReport.diagnosis}
                          </p>
                        )}
                        {(extractedReport.doctor_name || extractedReport.hospital_name) && (
                          <p className="text-[10px] text-on-surface-variant">
                            {extractedReport.doctor_name && `${extractedReport.doctor_name} • `}
                            {extractedReport.hospital_name}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {extractedReport.results.map((result: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-surface-container-low/30 p-2 rounded-lg border border-outline-variant/10 text-center"
                          >
                            <span className="text-[8px] uppercase font-bold text-outline tracking-wider block leading-tight">
                              {result.test_name}
                            </span>
                            <span className="text-sm font-bold text-secondary block mt-0.5">
                              {result.value_text || "--"}
                            </span>
                            {result.unit && (
                              <span className="text-[8px] text-on-surface-variant block">{result.unit}</span>
                            )}
                            {result.abnormal_flag && (
                              <span
                                className={`text-[8px] font-bold mt-0.5 block ${result.abnormal_flag === "NORMAL" ? "text-tertiary" : "text-orange-600"
                                  }`}
                              >
                                {result.abnormal_flag}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setExtractedPreviewVisible(false);
                          setExtractedReport(null);
                          setExtractedMedicines(null);
                          setOcrError(null);
                        }}
                        className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-xl font-label-md text-xs text-secondary font-bold transition-all"
                      >
                        <span className="material-symbols-outlined text-sm align-middle">arrow_back</span>
                        Back
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant">No extractable data found.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">edit_square</span>
                <span>Edit Family Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
              {/* Name & Nickname */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thomas D'Souza"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Nickname</label>
                  <input
                    type="text"
                    placeholder="e.g. Dad, Mom"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Relationship & DOB */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Relationship</label>
                  <select
                    value={editRel}
                    onChange={(e) => setEditRel(e.target.value)}
                    className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary"
                  >
                    {["Mother", "Father", "Son", "Daughter", "Brother", "Sister", "Grandmother", "Grandfather", "Husband", "Wife", "Partner", "Friend", "Relative", "Neighbor", "Caregiver", "Patient", "Other"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Gender & Blood Group */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Blood Group</label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone & Conditions */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Medical Notes / Conditions</label>
                  <textarea
                    placeholder="e.g. Penicillin allergy, diabetes"
                    value={editConditions}
                    onChange={(e) => setEditConditions(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary h-14 resize-none"
                  />
                </div>
              </div>

              {/* Identification Color Picker */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Personalized Accent Color</label>
                <div className="flex gap-2">
                  {["blue", "green", "purple", "orange", "pink", "teal", "grey"].map((c) => {
                    const isSelected = editColor === c;
                    const bgColors: Record<string, string> = {
                      blue: "bg-blue-500",
                      green: "bg-emerald-500",
                      purple: "bg-purple-500",
                      orange: "bg-orange-500",
                      pink: "bg-pink-500",
                      teal: "bg-teal-500",
                      grey: "bg-slate-500"
                    };
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`w-6 h-6 rounded-full ${bgColors[c] || "bg-blue-500"} transition-all flex items-center justify-center`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-white text-xs font-bold">done</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Selector Grid */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Select Avatar</label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {AVATAR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveEditAvatarCategory(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors flex-shrink-0 ${activeEditAvatarCategory === cat.id
                        ? "bg-secondary/15 text-secondary"
                        : "bg-white text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 bg-white border border-outline-variant/10 rounded-xl">
                  {AVATAR_ITEMS.filter((av) => av.category === activeEditAvatarCategory).map((av) => {
                    const isSelected = editAvatarUrl === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatarUrl(av.url)}
                        className={`w-11 h-11 rounded-full p-0.5 border-2 transition-all flex items-center justify-center overflow-hidden flex-shrink-0 ${isSelected ? "border-primary scale-110 shadow-sm" : "border-transparent hover:scale-105"
                          }`}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md mt-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
