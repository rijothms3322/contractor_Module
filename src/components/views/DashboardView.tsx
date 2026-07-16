"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Reminder } from "../../lib/mockData";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { MedicineBox } from "./MedicineBox";
import { PredictiveSearch } from "@/components/search/PredictiveSearch";
import { SymptomAssessment } from "./SymptomAssessment";
import { AVATAR_CATEGORIES, AVATAR_ITEMS } from "../../lib/avatarLibrary";

const MEDICINE_SUGGESTIONS = [
  { name: "Atorvastatin", dosage: "10mg", instructions: "After Food" },
  { name: "Metformin", dosage: "500mg", instructions: "During Meal" },
  { name: "Lisinopril", dosage: "20mg", instructions: "Before Sleep" },
  { name: "Amlodipine", dosage: "5mg", instructions: "Morning" },
  { name: "Levothyroxine", dosage: "50mcg", instructions: "Empty Stomach" },
  { name: "Omeprazole", dosage: "20mg", instructions: "Empty Stomach" },
  { name: "Losartan", dosage: "50mg", instructions: "Morning" },
  { name: "Sertraline", dosage: "50mg", instructions: "With Water" },
  { name: "Paracetamol", dosage: "650mg", instructions: "After Food" },
  { name: "Ibuprofen", dosage: "400mg", instructions: "After Food" },
  { name: "Amoxicillin", dosage: "500mg", instructions: "After Food" },
  { name: "Vitamin D3", dosage: "60K IU", instructions: "Weekly" }
];

export const DashboardView: React.FC = () => {
  const {
    user,
    reminders,
    toggleReminderStatus,
    adherenceStreak,
    adherencePercentage,
    isLinkedToFamily,
    wellnessScore,
    familyWellnessScore,
    setActiveTab,
    uploadReportPlaceholder,
    bookings,
    addMedicine,
    editMedicine,
    updateMedicineStock,
    deleteMedicine,
    deleteReminder,
    snoozeReminder,
    familyMembers,
    addFamilyMember,
    deleteFamilyMember,
    medicines,
    activeFamily,
    createFamily,
    joinFamily,
    leaveFamily,
    disbandFamily,
    removeFamilyMember,
    transferAdminRights,
    renameFamily,
    regenerateFamilyCode
  } = useApp();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("02h 45m");

  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newSelectedTimings, setNewSelectedTimings] = useState<("morning" | "afternoon" | "evening" | "night")[]>(["morning"]);
  const [newFamilyMemberId, setNewFamilyMemberId] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newIntakeTimes, setNewIntakeTimes] = useState<string[]>([]);
  const [timeInput, setTimeInput] = useState("08:00");
  const [newEndDate, setNewEndDate] = useState("");
  const [untilStopped, setUntilStopped] = useState(true);
  const [newStockCount, setNewStockCount] = useState<string>("");

  // Family Portal & Invite States
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitations, setInvitations] = useState<{ email: string; status: "Pending" | "Joined" }[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinFamilyId, setJoinFamilyId] = useState("");

  const [newFamilyName, setNewFamilyName] = useState("");
  const [verificationFamily, setVerificationFamily] = useState<{ id: string; name: string; memberCount: number; adminName: string; familyCode: string; adminId: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEditingFamilyName, setIsEditingFamilyName] = useState(false);
  const [editedFamilyName, setEditedFamilyName] = useState("");

  // Lab Vitals & Report Logging States
  const [showLogReportModal, setShowLogReportModal] = useState(false);
  const [reportPatientId, setReportPatientId] = useState("Myself");
  const [reportTestCategory, setReportTestCategory] = useState("Lipid Profile");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [loggedReports, setLoggedReports] = useState<Array<{
    id: string;
    category: string;
    patientName: string;
    date: string;
    fields: Record<string, string>;
  }>>([]);

  const [reportFields, setReportFields] = useState<Record<string, string>>({
    "Total Cholesterol": "198",
    "HDL (Good)": "48",
    "LDL (Bad)": "120",
    "Triglycerides": "145"
  });

  const [customReportFields, setCustomReportFields] = useState<{ name: string; value: string }[]>([]);
  const [newCustomFieldName, setNewCustomFieldName] = useState("");
  const [newCustomFieldValue, setNewCustomFieldValue] = useState("");
  const [editingStockMedId, setEditingStockMedId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState("");

  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [snoozeReminderId, setSnoozeReminderId] = useState<string | null>(null);
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);
  const [customSnoozeHours, setCustomSnoozeHours] = useState(0);
  const [customSnoozeMins, setCustomSnoozeMins] = useState(10);

  const [isAddingNewPerson, setIsAddingNewPerson] = useState(false);
  const [confirmTakenReminder, setConfirmTakenReminder] = useState<Reminder | null>(null);
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const [isJoiningFamily, setIsJoiningFamily] = useState(false);
  const [isRenamingFamily, setIsRenamingFamily] = useState(false);
  const [isRegeneratingCode, setIsRegeneratingCode] = useState(false);
  const [isTransferringAdmin, setIsTransferringAdmin] = useState<string | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState<string | null>(null);
  const [isDisbanding, setIsDisbanding] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonNickname, setNewPersonNickname] = useState("");
  const [newPersonRelationship, setNewPersonRelationship] = useState("Mother");
  const [newPersonDob, setNewPersonDob] = useState("");
  const [newPersonGender, setNewPersonGender] = useState("Female");
  const [newPersonBloodGroup, setNewPersonBloodGroup] = useState("O+");
  const [newPersonPhone, setNewPersonPhone] = useState("");
  const [newPersonNotes, setNewPersonNotes] = useState("");
  const [newPersonColor, setNewPersonColor] = useState("blue");
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState("https://api.dicebear.com/7.x/lorelei/svg?seed=adult-seed-2&radius=50");
  const [activeAvatarCategory, setActiveAvatarCategory] = useState<"adults" | "children" | "babies" | "friends" | "pets">("adults");

  const resetNewPersonForm = () => {
    setIsAddingNewPerson(false);
    setNewPersonName("");
    setNewPersonNickname("");
    setNewPersonRelationship("Mother");
    setNewPersonDob("");
    setNewPersonGender("Female");
    setNewPersonBloodGroup("O+");
    setNewPersonPhone("");
    setNewPersonNotes("");
    setNewPersonColor("blue");
    setSelectedAvatarUrl("https://api.dicebear.com/7.x/lorelei/svg?seed=adult-seed-2&radius=50");
    setActiveAvatarCategory("adults");
  };

  const handleAddNewPersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName) return;

    let age = 40;
    if (newPersonDob) {
      const birth = new Date(newPersonDob);
      const diff = Date.now() - birth.getTime();
      age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    addFamilyMember({
      name: newPersonName,
      avatarUrl: selectedAvatarUrl,
      relationship: newPersonRelationship,
      age,
      gender: newPersonGender,
      medicalConditions: newPersonNotes ? [newPersonNotes] : [],
      nickname: newPersonNickname || newPersonName,
      dob: newPersonDob,
      bloodGroup: newPersonBloodGroup,
      phone: newPersonPhone,
      medicalNotes: newPersonNotes,
      allergies: [],
      existingDiseases: newPersonNotes ? [newPersonNotes] : [],
      color: newPersonColor
    });

    setIsAddingNewPerson(false);
  };

  useEffect(() => {
    if (newPersonName) {
      const added = familyMembers.find(f => f.name === newPersonName);
      if (added) {
        setNewFamilyMemberId(added.id);
      }
    }
  }, [familyMembers]);

  const resetAddReminderForm = () => {
    setNewMedName("");
    setNewDosage("");
    setNewInstructions("");
    setNewSelectedTimings(["morning"]);
    setNewFamilyMemberId("");
    setShowSuggestions(false);
    setNewIntakeTimes([]);
    setTimeInput("08:00");
    setEditingMedId(null);
    setNewEndDate("");
    setUntilStopped(true);
    setNewStockCount("");
    setIsPrivate(false);
  };

  const handleSelectSuggestion = (s: typeof MEDICINE_SUGGESTIONS[0]) => {
    setNewMedName(s.name);
    setNewDosage(s.dosage);
    if (s.instructions) {
      setNewInstructions(s.instructions);
    }
    setShowSuggestions(false);
  };

  const handleTimingToggle = (timing: "morning" | "afternoon" | "evening" | "night") => {
    if (newSelectedTimings.includes(timing)) {
      setNewSelectedTimings(prev => prev.filter(t => t !== timing));
    } else {
      setNewSelectedTimings(prev => [...prev, timing]);
    }
  };

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !newDosage) return;

    const payload = {
      name: newMedName,
      dosage: newDosage,
      instructions: newInstructions || "As directed",
      frequency: "daily" as const,
      timings: newSelectedTimings.length > 0 ? newSelectedTimings : ["morning" as const],
      startDate: new Date().toISOString().split("T")[0],
      endDate: untilStopped ? undefined : newEndDate || undefined,
      intakeTimes: newIntakeTimes,
      stockCount: newStockCount ? parseInt(newStockCount, 10) : undefined,
      isPrivate: isPrivate
    };

    const targetFamilyId = isPrivate ? null : (newFamilyMemberId || null);

    if (editingMedId) {
      editMedicine(editingMedId, payload, targetFamilyId);
    } else {
      addMedicine(payload, targetFamilyId);
    }

    setIsAddReminderOpen(false);
    resetAddReminderForm();
  };

  const getIntakeTimeOptions = () => {
    const options: { value: string; label: string }[] = [];
    
    if (newSelectedTimings.includes("morning")) {
      for (let h = 5; h <= 12; h++) {
        const hStr = h.toString().padStart(2, "0");
        const label = h === 12 ? "12:00 PM" : `${h}:00 AM`;
        options.push({ value: `${hStr}:00`, label });
        if (h !== 12) {
          options.push({ value: `${hStr}:30`, label: `${h}:30 AM` });
        }
      }
    }
    
    if (newSelectedTimings.includes("afternoon")) {
      for (let h = 12; h <= 17; h++) {
        const displayHour = h > 12 ? h - 12 : h;
        const hStr = h.toString().padStart(2, "0");
        const label = `${displayHour}:00 PM`;
        options.push({ value: `${hStr}:00`, label });
        if (h !== 17) {
          options.push({ value: `${hStr}:30`, label: `${displayHour}:30 PM` });
        }
      }
    }
    
    if (newSelectedTimings.includes("evening")) {
      for (let h = 17; h <= 20; h++) {
        const displayHour = h - 12;
        const hStr = h.toString().padStart(2, "0");
        const label = `${displayHour}:00 PM`;
        options.push({ value: `${hStr}:00`, label });
        if (h !== 20) {
          options.push({ value: `${hStr}:30`, label: `${displayHour}:30 PM` });
        }
      }
    }
    
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

  const timeOptions = getIntakeTimeOptions();

  useEffect(() => {
    if (timeOptions.length > 0 && !timeOptions.some(opt => opt.value === timeInput)) {
      setTimeInput(timeOptions[0].value);
    }
  }, [newSelectedTimings, timeOptions]);

  // Filter today's reminders
  const todayReminders = reminders.filter((r) => {
    const todayLocal = new Date();
    const schedLocal = new Date(r.scheduledTime);
    const isToday = todayLocal.getFullYear() === schedLocal.getFullYear() &&
                    todayLocal.getMonth() === schedLocal.getMonth() &&
                    todayLocal.getDate() === schedLocal.getDate();
    if (!isToday) return false;

    // Hide private reminders belonging to other family members
    if (r.isPrivate && r.familyMemberId !== null) {
      return false;
    }

    return true;
  });

  const pendingReminders = todayReminders.filter((r) => r.status === "pending");
  const nextReminder = pendingReminders[0] || null;
  const handleSearchSelect = (item: any) => {
    if (item.type === "medicine") {
      setActiveTab("health");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("medimz_prefill_med", item.name);
        sessionStorage.setItem("medimz_open_modal", "add_medicine");
      }
    } else if (item.type === "lab_test") {
      setActiveTab("health");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("medimz_prefill_test", item.raw.id);
        sessionStorage.setItem("medimz_prefill_lab", item.raw.labId);
        sessionStorage.setItem("medimz_open_modal", "book_test");
      }
    }
  };

  // Simple dynamic timer to make next pill feel alive
  useEffect(() => {
    const timer = setInterval(() => {
      const hours = Math.floor(Math.random() * 3);
      const mins = Math.floor(Math.random() * 60);
      setTimeRemaining(`${hours.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m`);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // Simulate AI Prescription Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setExtractedInfo(null);

    setTimeout(() => {
      setUploading(false);
      setExtractedInfo("Atorvastatin 10mg - Take 1 tablet daily after breakfast");
    }, 2500);
  };

  const handleConfirmExtraction = () => {
    // Inject the parsed report or med
    uploadReportPlaceholder(
      "AI Prescription Scan",
      "Medimz AI successfully extracted: Atorvastatin 10mg. Added to active medicine reminder timeline."
    );
    setShowUploadModal(false);
    setExtractedInfo(null);
    setActiveTab("health");
  };

  const filteredSuggestions = newMedName.trim() === ""
    ? MEDICINE_SUGGESTIONS.slice(0, 4)
    : MEDICINE_SUGGESTIONS.filter((s) => s.name.toLowerCase().includes(newMedName.toLowerCase()));

  // Find active out for collection booking
  const activeBooking = bookings.find(
    (b) => b.status === "out_for_collection" || b.status === "assigned"
  );

  // Helper to dynamically calculate adherence for a past day offset (0 = today, 1 = yesterday, etc.)
  const getDailyAdherence = (dayOffset: number): { dayLabel: string; value: number } => {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    const dayStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });
    
    // Filter active reminders for the logged user on this date
    const dayRems = reminders.filter(r => {
      const rDateStr = r.scheduledTime ? r.scheduledTime.split("T")[0] : "";
      return !r.familyMemberId && rDateStr === dayStr;
    });
    
    if (dayRems.length === 0) {
      return { dayLabel, value: -1 };
    }
    
    const finishedRems = dayRems.filter(r => r.status !== "pending");
    if (finishedRems.length === 0) {
      return { dayLabel, value: 100 };
    }
    
    const takenRems = finishedRems.filter(r => r.status === "taken");
    const pct = Math.round((takenRems.length / finishedRems.length) * 100);
    return { dayLabel, value: pct };
  };

  const past7DaysData = Array.from({ length: 7 }, (_, i) => getDailyAdherence(6 - i));
  const hasAnyWeeklyData = past7DaysData.some(d => d.value !== -1);

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  const morningReminders = todayReminders.filter((r) => r.timingSlot === "morning");
  const afternoonReminders = todayReminders.filter((r) => r.timingSlot === "afternoon");
  const eveningReminders = todayReminders.filter((r) => r.timingSlot === "evening");
  const nightReminders = todayReminders.filter((r) => r.timingSlot === "night");

  const isMorningDone = morningReminders.length > 0 && morningReminders.every(r => r.status === "taken");
  const isAfternoonDone = afternoonReminders.length > 0 && afternoonReminders.every(r => r.status === "taken");
  const isEveningDone = eveningReminders.length > 0 && eveningReminders.every(r => r.status === "taken");
  const isNightDone = nightReminders.length > 0 && nightReminders.every(r => r.status === "taken");

  const RECIPIENT_THEMES: Record<string, { border: string, bg: string, text: string }> = {
    blue: { border: "border-l-blue-500", bg: "bg-blue-50 text-blue-700", text: "text-blue-700" },
    green: { border: "border-l-emerald-500", bg: "bg-emerald-50 text-emerald-700", text: "text-emerald-700" },
    purple: { border: "border-l-purple-500", bg: "bg-purple-50 text-purple-700", text: "text-purple-700" },
    orange: { border: "border-l-orange-500", bg: "bg-orange-50 text-orange-700", text: "text-orange-700" },
    pink: { border: "border-l-pink-500", bg: "bg-pink-50 text-pink-700", text: "text-pink-700" },
    teal: { border: "border-l-teal-500", bg: "bg-teal-50 text-teal-700", text: "text-teal-700" },
    grey: { border: "border-l-slate-500", bg: "bg-slate-50 text-slate-700", text: "text-slate-700" }
  };

  const handleEditClick = (medicineId: string, familyMemberId: string | null) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;
    setNewMedName(med.name);
    setNewDosage(med.dosage);
    setNewInstructions(med.instructions);
    setNewSelectedTimings(med.timings);
    setNewFamilyMemberId(familyMemberId || "");
    setNewIntakeTimes(med.intakeTimes || []);
    setNewEndDate(med.endDate || "");
    setUntilStopped(!med.endDate);
    setNewStockCount(med.stockCount !== undefined ? String(med.stockCount) : "");
    setIsPrivate(!!med.isPrivate);
    setEditingMedId(medicineId);
    setIsAddReminderOpen(true);
  };

  const renderReminderCard = (r: Reminder) => {
    const theme = RECIPIENT_THEMES[r.recipientColor || "orange"] || { border: "border-l-primary", bg: "bg-primary/10 text-primary", text: "text-primary" };
    const borderClass = r.status === "taken" 
      ? "border-l-tertiary bg-surface-container-low/40 opacity-80" 
      : r.status === "missed"
      ? "border-l-red-500 bg-red-50/20 opacity-80"
      : `${theme.border} bg-white`;
      
    const displayName = r.recipientNickname && r.recipientNickname !== "Myself"
      ? `${r.recipientNickname}'s ${r.medicineName}`
      : r.medicineName;

    let timeLabel = "";
    if (r.intakeTime) {
      const [hStr, mStr] = r.intakeTime.split(":");
      const h = parseInt(hStr, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      timeLabel = `${displayHour}:${mStr} ${ampm}`;
    } else {
      const date = new Date(r.scheduledTime);
      timeLabel = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }

    const isSnoozed = r.snoozedUntil ? new Date(r.snoozedUntil) > new Date() : false;
    let snoozeLabel = "";
    if (isSnoozed && r.snoozedUntil) {
      const date = new Date(r.snoozedUntil);
      snoozeLabel = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }

    return (
      <div key={r.id} className={`glass-card p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between border-l-4 transition-all gap-3 ${borderClass}`}>
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-surface-container-highest flex items-center justify-center flex-shrink-0 overflow-hidden border border-outline-variant/10">
            {r.recipientAvatar && r.recipientNickname !== "Myself" ? (
              <img src={r.recipientAvatar} alt={r.recipientNickname} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-secondary text-2xl">
                {r.timingSlot === "afternoon" ? "vaccines" : "pill"}
              </span>
            )}
          </div>
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-headline-md text-xs text-on-surface font-bold break-words leading-tight">
                {displayName}
              </h4>
              {r.recipientNickname && r.recipientNickname !== "Myself" && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${theme.bg}`}>
                  {r.recipientNickname}
                </span>
              )}
              {isSnoozed && (
                <span className="bg-orange-50 text-orange-700 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5 border border-orange-200">
                  <span className="material-symbols-outlined text-[10px]">snooze</span>
                  <span>Snoozed till {snoozeLabel}</span>
                </span>
              )}
            </div>
            <div className="flex gap-1.5 mt-0.5 flex-wrap items-center">
              <span className="font-label-sm text-[10px] text-on-surface-variant">{r.dosage}</span>
              <span className="text-on-surface-variant/30">•</span>
              <span className="font-label-sm text-[10px] text-on-surface-variant">{r.instructions}</span>
              <span className="text-on-surface-variant/30">•</span>
              <span className="bg-primary/5 text-primary text-[9px] px-2 py-0.5 rounded font-bold">{timeLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end self-end sm:self-auto">
          {r.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => setSnoozeReminderId(r.id)}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center border border-outline-variant/15 text-secondary hover:text-primary transition-all active:scale-90"
                title="Snooze Reminder"
              >
                <span className="material-symbols-outlined text-xs">snooze</span>
              </button>
              <button
                type="button"
                onClick={() => toggleReminderStatus(r.id, "missed")}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center border border-outline-variant/15 text-secondary hover:text-red-500 transition-all active:scale-90"
                title="Skip Dose"
              >
                <span className="material-symbols-outlined text-xs">block</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to delete this specific reminder slot?")) {
                deleteReminder(r.id);
              }
            }}
            className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center border border-outline-variant/15 text-secondary hover:text-red-500 transition-all active:scale-90"
            title="Delete Reminder Slot"
          >
            <span className="material-symbols-outlined text-xs">delete</span>
          </button>
          
          <div className="border-l border-outline-variant/20 h-5 mx-1" />

          {r.status === "taken" ? (
            <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          ) : r.status === "missed" ? (
            <span className="text-red-600 font-bold text-xs uppercase tracking-wide flex items-center gap-1">
              <span className="material-symbols-outlined text-base">cancel</span>
              <span>Skipped</span>
            </span>
          ) : (
            <button
              onClick={() => {
                if (r.familyMemberId && r.familyMemberId !== user?.id) {
                  setConfirmTakenReminder(r);
                } else {
                  toggleReminderStatus(r.id, "taken");
                }
              }}
              className="bg-primary text-on-primary font-label-md text-[10px] font-bold px-3 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Mark Taken
            </button>
          )}
        </div>
      </div>
    );
  };

  // Dynamic Refill Alert Calculations
  const medicinesNeedingRefill = medicines.map(med => {
    const medStock = med.stockCount;
    if (medStock === undefined) return null;
    const dailyDoses = med.timings ? med.timings.length : 1;
    const remainingDays = Math.floor(medStock / (dailyDoses || 1));
    return {
      ...med,
      remainingDays
    };
  }).filter(item => item !== null && item.remainingDays <= 6) as any[];

  let refillAlertText = "Please add your prescriptions to the system so we can calculate your remaining medicine days.";
  const hasConfiguredStock = medicines.some(m => m.stockCount !== undefined);
  if (hasConfiguredStock) {
    if (medicinesNeedingRefill.length > 0) {
      refillAlertText = medicinesNeedingRefill.map(m => `${m.name} needs refill in ${m.remainingDays} days`).join(", ") + ".";
    } else {
      refillAlertText = "You are all Set. No medicine needs refill";
    }
  }

  return (
    <div className="space-y-stack-lg pb-16">
      
      {/* Date Header & Profile Greeting */}
      <div className="flex justify-between items-center glass-card bg-gradient-to-br from-secondary-container/20 to-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm">
        <div>
          <h2 className="font-headline-lg-mobile text-xl text-primary font-extrabold tracking-tight">Today's Schedule</h2>
          <p className="font-label-md text-xs text-on-surface-variant font-semibold mt-0.5">{todayFormatted}</p>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setIsAddReminderOpen(true)}
            className="px-5 py-2.5 bg-primary text-on-primary font-label-md text-xs font-extrabold rounded-xl flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Dynamic Schedule Timeline */}
      <div className="relative pl-6 space-y-8 mt-2">
        {/* Continuous timeline connector line */}
        <div className="absolute left-2.5 top-2 bottom-4 w-0.5 bg-secondary/15 rounded-full" />

        {/* Morning Section */}
        <section className="relative space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-white border-4 border-secondary flex items-center justify-center z-10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            </div>
            <h3 className="font-headline-md text-sm text-secondary font-bold">Morning</h3>
            {morningReminders.length > 0 && (
              <span className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isMorningDone ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
              }`}>
                {isMorningDone ? "Completed" : "Next Up"}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {morningReminders.length === 0 ? (
              <div className="glass-card p-4 rounded-2xl shadow-sm opacity-60 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant/40 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">medication</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-xs text-on-surface-variant font-semibold">No Doses Scheduled</h4>
                  <p className="font-body-md text-[10px] text-on-surface-variant">No medicines scheduled for this morning.</p>
                </div>
              </div>
            ) : (
              morningReminders.map((r) => renderReminderCard(r))
            )}
          </div>
        </section>

        {/* Afternoon Section */}
        <section className="relative space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-white border-4 border-secondary flex items-center justify-center z-10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            </div>
            <h3 className="font-headline-md text-sm text-secondary font-bold">Afternoon</h3>
            {afternoonReminders.length > 0 && (
              <span className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isAfternoonDone ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
              }`}>
                {isAfternoonDone ? "Completed" : "Scheduled"}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {afternoonReminders.length === 0 ? (
              <div className="glass-card p-4 rounded-2xl shadow-sm opacity-60 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant/40 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">medication</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-xs text-on-surface-variant font-semibold">No Doses Scheduled</h4>
                  <p className="font-body-md text-[10px] text-on-surface-variant">No medicines scheduled for this afternoon.</p>
                </div>
              </div>
            ) : (
              afternoonReminders.map((r) => renderReminderCard(r))
            )}
          </div>
        </section>

        {/* Evening Section */}
        <section className="relative space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-white border-4 border-secondary flex items-center justify-center z-10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            </div>
            <h3 className="font-headline-md text-sm text-secondary font-bold">Evening</h3>
            {eveningReminders.length > 0 && (
              <span className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isEveningDone ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
              }`}>
                {isEveningDone ? "Completed" : "Scheduled"}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {eveningReminders.length === 0 ? (
              <div className="glass-card p-4 rounded-2xl shadow-sm opacity-60 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant/40 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">medication</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-xs text-on-surface-variant font-semibold">No Doses Scheduled</h4>
                  <p className="font-body-md text-[10px] text-on-surface-variant">No medicines scheduled for this evening.</p>
                </div>
              </div>
            ) : (
              eveningReminders.map((r) => renderReminderCard(r))
            )}
          </div>
        </section>

        {/* Night Section */}
        <section className="relative space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-white border-4 border-secondary flex items-center justify-center z-10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            </div>
            <h3 className="font-headline-md text-sm text-secondary font-bold">Night</h3>
            {nightReminders.length > 0 && (
              <span className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isNightDone ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
              }`}>
                {isNightDone ? "Completed" : "Scheduled"}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {nightReminders.length === 0 ? (
              <div className="glass-card p-4 rounded-2xl shadow-sm opacity-60 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant/40 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">medication</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-xs text-on-surface-variant font-semibold">No Doses Scheduled</h4>
                  <p className="font-body-md text-[10px] text-on-surface-variant">No medicines scheduled for tonight.</p>
                </div>
              </div>
            ) : (
              nightReminders.map((r) => renderReminderCard(r))
            )}
          </div>
        </section>
      </div>

      {/* Family Sync Portal Card */}
      <section className="glass-card rounded-2xl p-5 shadow-sm border border-outline-variant/20 bg-gradient-to-br from-primary-container/10 to-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 items-start text-left">
          <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-xl">diversity_1</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-md text-sm text-secondary font-bold">
                {activeFamily ? activeFamily.name : "Family Synchronization Hub"}
              </h3>
              {isLinkedToFamily ? (
                <span className="bg-emerald-500 text-white text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm border border-emerald-400/20">
                  <span className="material-symbols-outlined text-[10px] font-bold">verified</span>
                  Connected
                </span>
              ) : (
                <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Sync Portal
                </span>
              )}
            </div>
            <p className="font-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
              {activeFamily 
                ? `Active family invitation code: ${activeFamily.familyCode}. Share this with members to sync schedules.` 
                : "Link portals with your family members to monitor compliance, share real-time reminders, and sync medical updates."
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSyncModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-secondary hover:bg-opacity-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm flex-shrink-0"
        >
          <span className="material-symbols-outlined text-sm">settings</span>
          <span>Manage Sync</span>
        </button>
      </section>

      {/* Adherence Bento Grid Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div className="glass-card p-6 rounded-2xl shadow-sm bg-gradient-to-br from-secondary-container/20 to-white border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <h4 className="font-label-md text-xs text-secondary font-bold mb-3">Weekly Adherence Progress</h4>
            {!hasAnyWeeklyData ? (
              <div className="flex flex-col items-center justify-center h-20 text-center">
                <span className="material-symbols-outlined text-outline-variant text-xl mb-1 animate-pulse">add_chart</span>
                <p className="font-label-sm text-[10px] text-outline font-bold">No tracking data yet. Log details to see insights.</p>
              </div>
            ) : (
              <div className="flex items-end gap-2.5 h-20 mb-3 pt-1">
                {past7DaysData.map((d, idx) => {
                  const val = d.value === -1 ? 0 : d.value;
                  const barHeight = `${Math.max(8, val)}%`;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div 
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          d.value === -1 
                            ? "bg-outline-variant/10 h-[8px]" 
                            : "bg-tertiary"
                        }`}
                        style={{ height: d.value === -1 ? "8px" : barHeight }}
                        title={d.value === -1 ? "No doses scheduled" : `${d.value}% adherence`}
                      />
                      <span className="text-[9px] text-outline font-bold uppercase mt-1">{d.dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <p className="font-label-sm text-[11px] text-on-surface-variant leading-relaxed">
            {hasAnyWeeklyData ? (
              <>You've taken <span className="text-tertiary font-bold">{adherencePercentage}%</span> of your doses this week. Keep it up!</>
            ) : (
              <>No medicine reminders found. Create medication reminders to view compliance tracking.</>
            )}
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between h-36">
          <div>
            <h4 className="font-label-md text-xs text-secondary font-bold mb-1">Pharmacy Refill Alert</h4>
            <p className="font-body-md text-xs text-on-surface leading-relaxed">{refillAlertText}</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-3 text-primary font-label-md text-xs font-bold flex items-center gap-1.5 hover:underline text-left"
          >
            <span>Add Prescription</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Quick Diagnostics Actions & Helpers */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-headline-md text-xs text-secondary font-bold">Quick Diagnostics & Helpers</h3>
          <span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Coming Soon
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-sm opacity-50 pointer-events-none cursor-not-allowed select-none">
          
          <button
            onClick={() => setActiveTab("health")}
            className="p-4 glass-card rounded-2xl text-left border border-outline-variant/10 hover:border-primary/40 hover:scale-[1.01] active:scale-98 transition-all flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">add_moderator</span>
            </div>
            <span className="font-label-md text-xs text-secondary font-bold leading-tight">Add Medicine</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="p-4 glass-card rounded-2xl text-left border border-outline-variant/10 hover:border-primary/40 hover:scale-[1.01] active:scale-98 transition-all flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-xl bg-secondary-container/15 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
            </div>
            <span className="font-label-md text-xs text-secondary font-bold leading-tight">Upload Rx</span>
          </button>

          <button
            onClick={() => setActiveTab("health")}
            className="p-4 glass-card rounded-2xl text-left border border-outline-variant/10 hover:border-primary/40 hover:scale-[1.01] active:scale-98 transition-all flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-xl bg-tertiary-container/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">biotech</span>
            </div>
            <span className="font-label-md text-xs text-secondary font-bold leading-tight">Book Lab</span>
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            className="p-4 glass-card rounded-2xl text-left border border-outline-variant/10 hover:border-primary/40 hover:scale-[1.01] active:scale-98 transition-all flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-xl bg-surface-container-highest text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">analytics</span>
            </div>
            <span className="font-label-md text-xs text-secondary font-bold leading-tight">View Reports</span>
          </button>

        </div>
      </section>


      {/* Latest Lab Reports Stack */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-headline-md text-xs text-secondary font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">bloodtype</span>
            <span>Latest Lab Checkups & Vitals</span>
          </h3>
          <button
            onClick={() => setShowLogReportModal(true)}
            className="px-2.5 py-1 bg-primary/10 text-primary text-[9px] font-bold rounded-lg flex items-center gap-1 hover:bg-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-xs">add</span>
            <span>Log Report</span>
          </button>
        </div>

        {loggedReports.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center border border-outline-variant/20 space-y-2 animate-in fade-in duration-300">
            <span className="material-symbols-outlined text-outline-variant text-2xl animate-pulse">biotech</span>
            <p className="font-label-sm text-xs text-outline font-bold">No tracking data yet. Log details to see insights.</p>
            <p className="font-body-sm text-[10px] text-on-surface-variant">Log your latest blood tests or vitals to track metrics.</p>
          </div>
        ) : (
          loggedReports.map((report) => (
            <section key={report.id} className="glass-card rounded-2xl p-5 shadow-sm border border-outline-variant/20 space-y-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-center pb-1.5 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">description</span>
                <div>
                  <h4 className="font-headline-md text-[11px] text-secondary font-bold">Latest {report.category} Checkup</h4>
                  <p className="text-[9px] text-on-surface-variant leading-none mt-0.5">{report.patientName} • {report.date}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this report?")) {
                    setLoggedReports(prev => prev.filter(r => r.id !== report.id));
                  }
                }}
                className="w-5 h-5 rounded-full hover:bg-red-50 flex items-center justify-center text-outline hover:text-red-500 transition-colors"
                title="Delete Report"
              >
                <span className="material-symbols-outlined text-xs">delete</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {Object.entries(report.fields).slice(0, 3).map(([fieldName, fieldValue]) => {
                const valNum = parseFloat(fieldValue) || 0;
                let status = "Optimal";
                let badgeColor = "bg-tertiary/10 text-tertiary";
                let unit = "mg/dL";

                if (fieldName.includes("Total Cholesterol") || fieldName.includes("LDL")) {
                  const maxVal = fieldName.includes("Total Cholesterol") ? 200 : 100;
                  status = valNum < maxVal ? "Optimal" : "High";
                  badgeColor = valNum < maxVal ? "bg-tertiary/10 text-tertiary" : "bg-orange-50 text-orange-700";
                } else if (fieldName.includes("HDL")) {
                  status = valNum >= 40 ? "Stable" : "Low";
                  badgeColor = valNum >= 40 ? "bg-secondary/10 text-secondary" : "bg-red-50 text-red-700";
                } else if (fieldName.includes("HbA1c")) {
                  unit = "%";
                  status = valNum < 5.7 ? "Normal" : valNum < 6.5 ? "Prediabetes" : "Diabetic";
                  badgeColor = valNum < 5.7 ? "bg-tertiary/10 text-tertiary" : valNum < 6.5 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700";
                } else if (fieldName.includes("Sugar")) {
                  status = valNum < 100 ? "Normal" : "High";
                  badgeColor = valNum < 100 ? "bg-tertiary/10 text-tertiary" : "bg-red-50 text-red-700";
                } else if (fieldName.includes("TSH")) {
                  unit = "uIU/mL";
                  status = valNum >= 0.45 && valNum <= 4.5 ? "Normal" : "Out of Range";
                  badgeColor = valNum >= 0.45 && valNum <= 4.5 ? "bg-tertiary/10 text-tertiary" : "bg-red-50 text-red-700";
                } else if (fieldName.includes("Hemoglobin")) {
                  unit = "g/dL";
                  status = valNum >= 12 && valNum <= 17.5 ? "Optimal" : "Anemic";
                  badgeColor = valNum >= 12 && valNum <= 17.5 ? "bg-tertiary/10 text-tertiary" : "bg-red-50 text-red-700";
                }

                return (
                  <div key={fieldName} className="p-2.5 bg-surface-container-low rounded-xl flex flex-col justify-between min-h-[90px] border border-outline-variant/10">
                    <span className="text-[8px] uppercase font-bold text-outline tracking-wider leading-tight h-5 flex items-center justify-center">
                      {fieldName}
                    </span>
                    <div className="my-0.5">
                      <span className="text-base font-bold text-secondary block leading-none">{fieldValue || "--"}</span>
                      <span className="text-[8px] text-on-surface-variant block mt-0.5">{unit}</span>
                    </div>
                    <span className={`text-[8px] text-outline/80 font-bold py-0.5 rounded-md ${badgeColor}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
            </section>
          ))
        )}
      </div>

      <MedicineBox
        onEditMed={(medId) => {
          const med = medicines.find(m => m.id === medId);
          if (med) {
            setEditingStockMedId(medId);
            setEditingStockValue(med.stockCount !== undefined ? String(med.stockCount) : "30");
          }
        }}
      />

      {/* Upload prescription modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
                <span>AI Prescription Scan</span>
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setExtractedInfo(null);
                }}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>

            <div className="flex-grow space-y-4">
              <p className="font-body-md text-xs text-on-surface-variant">
                Upload your doctor's handwritten prescription or a medical report. Medimz AI will parse the medications,
                frequency, dosage, and automatically configure reminders.
              </p>

              {!uploading && !extractedInfo && (
                <div className="flex flex-col gap-3">
                  <label className="border-2 border-dashed border-outline-variant hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-surface-container-low/40 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-secondary">cloud_upload</span>
                    <span className="font-label-md text-xs text-on-surface font-bold">Click or drag prescription PDF/Image</span>
                    <span className="text-[8px] text-outline uppercase font-bold tracking-tight">Max 10MB (PDF, PNG, JPG)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="flex items-center my-1">
                    <div className="flex-grow h-[1px] bg-outline-variant/30"></div>
                    <span className="px-3 text-[10px] text-outline font-bold uppercase tracking-wider">Or</span>
                    <div className="flex-grow h-[1px] bg-outline-variant/30"></div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetAddReminderForm();
                      setIsAddReminderOpen(true);
                    }}
                    className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-xl font-label-md text-xs text-secondary font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <span className="material-symbols-outlined text-sm">edit_note</span>
                    <span>Add Manually by Typing Name</span>
                  </button>
                </div>
              )}

              {uploading && (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <div className="text-center">
                    <span className="font-label-md text-xs text-secondary font-bold block animate-pulse">
                      Medimz AI is parsing prescription...
                    </span>
                    <span className="text-[9px] text-outline mt-1 block">Performing OCR Character Recognition</span>
                  </div>
                </div>
              )}

              {extractedInfo && (
                <div className="p-3 bg-tertiary-container/10 border border-tertiary/20 rounded-xl space-y-3">
                  <span className="font-label-sm text-[9px] text-tertiary font-bold uppercase tracking-wider block">
                    AI Extraction Successful!
                  </span>
                  <div className="p-2.5 bg-white rounded-lg border border-outline-variant/20 flex gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">pill</span>
                    <div>
                      <h4 className="font-label-md text-xs text-on-surface font-bold">Atorvastatin</h4>
                      <p className="font-body-md text-[10px] text-on-surface-variant">10mg • After breakfast • Daily</p>
                    </div>
                  </div>
                  <button
                    onClick={handleConfirmExtraction}
                    className="w-full py-2.5 bg-tertiary text-white font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md"
                  >
                    Confirm & Add to Schedule
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync Family Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">diversity_1</span>
                <span>Family Sync Hub</span>
              </h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>

            <div className="flex-grow space-y-4 text-left">
              {/* Scenario 1: User does NOT belong to any family */}
              {!activeFamily ? (
                <div className="space-y-4">
                  {/* Create Family Card */}
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Create New Family Group</span>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed">Become the Admin. Choose a custom name and generate your group's unique invitation code.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Family Name (e.g. Thomas Nest)"
                        value={newFamilyName}
                        onChange={(e) => setNewFamilyName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={async () => {
                          if (!newFamilyName.trim()) {
                            alert("Please enter a custom Family Name.");
                            return;
                          }
                          setIsCreatingFamily(true);
                          try {
                            const success = await createFamily(newFamilyName.trim());
                            if (success) {
                              setNewFamilyName("");
                            }
                          } finally {
                            setIsCreatingFamily(false);
                          }
                        }}
                        disabled={isCreatingFamily}
                        className="px-4 py-2 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 min-w-[76px] disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isCreatingFamily ? (
                          <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                        ) : "Create"}
                      </button>
                    </div>
                  </div>

                  {/* Join Family Card */}
                  <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-2xl space-y-3">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Join Existing Family Group</span>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed">Enter a family invitation code to view synced adherence scoreboards.</p>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Code (e.g. FAM-X93A7Q)"
                        value={joinFamilyId}
                        onChange={(e) => setJoinFamilyId(e.target.value)}
                        disabled={isVerifying || isJoiningFamily}
                        className="flex-1 px-3 py-2 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary uppercase disabled:opacity-60"
                      />
                      <button
                        onClick={async () => {
                          if (!joinFamilyId.trim()) {
                            alert("Please enter an invitation code.");
                            return;
                          }
                          if (!isSupabaseConfigured) {
                            alert("Database is not configured. Please set your Supabase environment variables.");
                            return;
                          }
                          let searchId = joinFamilyId.trim().toUpperCase();
                          if (searchId.length === 6 && !searchId.startsWith("FAM-")) {
                            searchId = "FAM-" + searchId;
                          }
                          setIsVerifying(true);
                          try {
                            const verifyActionPromise = (async () => {
                              // 1. Fetch family row and join the admin profile to get their name
                              const { data: fams, error: famErr } = await supabase
                                .from("families")
                                .select(`
                                  id,
                                  name,
                                  family_code,
                                  admin_id,
                                  profiles:admin_id (
                                    full_name
                                  )
                                `)
                                .eq("family_code", searchId);
                              if (famErr) throw famErr;

                              if (!fams || fams.length === 0) {
                                return null;
                              }

                              const matchFam = fams[0];
                              
                              // 2. Fetch the number of profiles currently linked to this family_id
                              const { data: membersList, error: countErr } = await supabase
                                .from("profiles")
                                .select("id")
                                .eq("family_id", matchFam.id);
                              
                              if (countErr) throw countErr;
                              
                              const memberCount = membersList ? membersList.length : 0;
                              const adminName = matchFam.profiles ? (matchFam.profiles.full_name || "Unknown") : "Unknown";

                              return {
                                id: matchFam.id,
                                name: matchFam.name,
                                memberCount: memberCount,
                                adminName: adminName,
                                familyCode: matchFam.family_code,
                                adminId: matchFam.admin_id
                              };
                            })();

                            const timeoutPromise = new Promise<never>((_, reject) =>
                              setTimeout(() => reject(new Error("Request timed out. Please check if your Supabase database is awake and that you ran the SQL migration.")), 8000)
                            );

                            const verified = await Promise.race([verifyActionPromise, timeoutPromise]);

                            if (!verified) {
                              alert("No active family found matching code: " + searchId);
                              setVerificationFamily(null);
                            } else {
                              setVerificationFamily(verified);
                            }
                          } catch (e: any) {
                            alert("Verification failed: " + e.message);
                            setVerificationFamily(null);
                          } finally {
                            setIsVerifying(false);
                          }
                        }}
                        disabled={isVerifying || isJoiningFamily}
                        className="px-3 py-2 bg-secondary text-white font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center min-w-[70px] disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isVerifying ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : "Verify"}
                      </button>
                    </div>

                    {/* Invitation Code Verification Result Card */}
                    {verificationFamily && (
                      <div className="p-3 bg-white rounded-xl border border-primary/20 space-y-3 animate-in zoom-in-95 duration-200">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-secondary">{verificationFamily.name}</h4>
                          <div className="text-[10px] text-on-surface-variant space-y-0.5">
                            <p>👑 Admin: <span className="font-bold text-on-surface">{verificationFamily.adminName}</span></p>
                            <p>👥 Members: <span className="font-bold text-on-surface">{verificationFamily.memberCount} joined</span></p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            setIsJoiningFamily(true);
                            try {
                              const success = await joinFamily(
                                verificationFamily.id,
                                verificationFamily.name,
                                verificationFamily.familyCode,
                                verificationFamily.adminId
                              );
                              if (success) {
                                setVerificationFamily(null);
                                setJoinFamilyId("");
                              }
                            } finally {
                              setIsJoiningFamily(false);
                            }
                          }}
                          disabled={isJoiningFamily}
                          className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-[11px] hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 min-h-[32px] disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {isJoiningFamily ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : "Confirm & Join Group"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Scenario 2: User belongs to a family */
                <div className="space-y-4">
                  {/* Family Header Info */}
                  <div className="p-4 bg-gradient-to-r from-primary-container/10 to-white border border-primary/15 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        {isEditingFamilyName ? (
                          <div className="flex gap-1.5 items-center">
                            <input
                              type="text"
                              value={editedFamilyName}
                              onChange={(e) => setEditedFamilyName(e.target.value)}
                              className="px-2 py-1 bg-white border border-outline rounded-lg text-xs font-bold focus:outline-none focus:border-primary"
                            />
                            <button
                               onClick={async () => {
                                 if (editedFamilyName.trim()) {
                                   setIsRenamingFamily(true);
                                   try {
                                     await renameFamily(editedFamilyName.trim());
                                     setIsEditingFamilyName(false);
                                   } finally {
                                     setIsRenamingFamily(false);
                                   }
                                 }
                               }}
                               disabled={isRenamingFamily}
                               className="px-2 py-1 bg-primary text-on-primary text-[10px] font-bold rounded flex items-center justify-center gap-1 disabled:opacity-50"
                             >
                               {isRenamingFamily ? (
                                 <div className="w-2 h-2 border border-on-primary border-t-transparent rounded-full animate-spin" />
                               ) : "Save"}
                             </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-headline-md text-sm text-secondary font-bold">{activeFamily.name}</h4>
                            {user?.id === activeFamily.adminId && (
                              <button
                                onClick={() => {
                                  setEditedFamilyName(activeFamily.name);
                                  setIsEditingFamilyName(true);
                                }}
                                className="text-outline hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-xs">edit</span>
                              </button>
                            )}
                          </div>
                        )}
                        <p className="text-[9px] text-outline font-bold mt-1 uppercase tracking-wider">
                          Code: <span className="font-mono text-secondary select-all">{activeFamily.familyCode}</span>
                        </p>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Active Group
                      </span>
                    </div>

                    {/* Code Regeneration Option for Admins with no other members */}
                    {user?.id === activeFamily.adminId && familyMembers.length === 0 && (
                      <button
                         onClick={async () => {
                           if (confirm("Regenerate invitation code? This will invalidate the previous code.")) {
                             setIsRegeneratingCode(true);
                             try {
                               await regenerateFamilyCode();
                             } finally {
                               setIsRegeneratingCode(false);
                             }
                           }
                         }}
                         disabled={isRegeneratingCode}
                         className="text-[9px] text-primary hover:underline font-bold flex items-center gap-0.5 disabled:opacity-50 disabled:pointer-events-none"
                       >
                         {isRegeneratingCode ? (
                           <div className="w-2 h-2 border border-primary border-t-transparent rounded-full animate-spin" />
                         ) : (
                           <span className="material-symbols-outlined text-xs">refresh</span>
                         )}
                         <span>{isRegeneratingCode ? "Regenerating..." : "Regenerate Code"}</span>
                       </button>
                    )}
                  </div>

                  {/* Adherence and Analytics Summary */}
                  <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-on-surface">
                      <span className="font-semibold text-outline text-[11px]">Your Adherence:</span>
                      <span className="font-extrabold text-tertiary text-xs">{adherencePercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface">
                      <span className="font-semibold text-outline text-[11px]">Family Wellness Score:</span>
                      <span className="font-extrabold text-primary text-xs">{familyWellnessScore}/10</span>
                    </div>
                  </div>

                  {/* Family Roster list */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Family Roster</span>
                    <div className="divide-y divide-outline-variant/15 border border-outline-variant/15 rounded-xl overflow-hidden bg-white">
                      
                      {/* Active User (Admin or Member) */}
                      <div className="p-3 flex items-center justify-between gap-3 bg-surface-container-low/20">
                        <div className="flex items-center gap-2">
                          <img 
                            src={user?.avatarUrl} 
                            alt={user?.fullName} 
                            className="w-8 h-8 rounded-full border border-primary/20" 
                          />
                          <div>
                            <span className="font-bold text-xs text-on-surface block">{user?.fullName} (You)</span>
                            <span className="text-[9px] text-outline">
                              {user?.id === activeFamily.adminId ? "Group Admin" : "Group Member"}
                            </span>
                          </div>
                        </div>
                        <span className="text-[8px] px-2 py-0.5 rounded font-bold uppercase bg-primary-container text-white border border-primary/20">
                          {user?.id === activeFamily.adminId ? "Admin" : "Member"}
                        </span>
                      </div>

                      {/* Linked Members */}
                      {familyMembers.map((member) => (
                        <div key={member.id} className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full border border-outline-variant/30" />
                            <div>
                              <span className="font-bold text-xs text-on-surface block">{member.name}</span>
                              <span className="text-[9px] text-outline">
                                {member.color === "purple" 
                                  ? (member.id === activeFamily.adminId ? "Group Admin" : "Group Member")
                                  : `Local Profile (${member.relationship})`
                                }
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {member.color === "purple" ? (
                              /* Linked Account: requires Admin permissions to manage */
                              user?.id === activeFamily.adminId ? (
                                <>
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Transfer admin ownership rights to ${member.name}?`)) {
                                        setIsTransferringAdmin(member.id);
                                        try {
                                          await transferAdminRights(member.id);
                                        } finally {
                                          setIsTransferringAdmin(null);
                                        }
                                      }
                                    }}
                                    disabled={isTransferringAdmin !== null || isRemovingMember !== null}
                                    className="px-2 py-1 bg-surface-container-high hover:bg-opacity-80 text-secondary font-bold text-[9px] rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                                    title="Transfer Admin Rights"
                                  >
                                    {isTransferringAdmin === member.id && (
                                      <div className="w-2 h-2 border border-secondary border-t-transparent rounded-full animate-spin" />
                                    )}
                                    <span>Make Admin</span>
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Are you sure you want to remove ${member.name} from the family portal?`)) {
                                        setIsRemovingMember(member.id);
                                        try {
                                          await removeFamilyMember(member.id);
                                        } finally {
                                          setIsRemovingMember(null);
                                        }
                                      }
                                    }}
                                    disabled={isTransferringAdmin !== null || isRemovingMember !== null}
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[9px] rounded-lg transition-all border border-red-200/20 flex items-center gap-1 disabled:opacity-50"
                                  >
                                    {isRemovingMember === member.id && (
                                      <div className="w-2 h-2 border border-red-600 border-t-transparent rounded-full animate-spin" />
                                    )}
                                    <span>Remove</span>
                                  </button>
                                </>
                              ) : (
                                <span className="text-[9px] text-outline/80 italic pr-1">Joined</span>
                              )
                            ) : (
                              /* Local Family Member Profile: anyone can delete their local cards */
                              <button
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete the local profile card for ${member.name}?`)) {
                                    setIsRemovingMember(member.id);
                                    try {
                                      await deleteFamilyMember(member.id);
                                    } finally {
                                      setIsRemovingMember(null);
                                    }
                                  }
                                }}
                                disabled={isRemovingMember === member.id}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[9px] rounded-lg transition-all border border-red-200/20 flex items-center gap-1 disabled:opacity-50"
                              >
                                {isRemovingMember === member.id && (
                                  <div className="w-2 h-2 border border-red-600 border-t-transparent rounded-full animate-spin" />
                                )}
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="border-t border-outline-variant/15 pt-3 flex gap-2">
                    {user?.id === activeFamily.adminId ? (
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to DISBAND this family group? All other members will be disconnected instantly.")) {
                            setIsDisbanding(true);
                            try {
                              await disbandFamily();
                            } finally {
                              setIsDisbanding(false);
                            }
                          }
                        }}
                        disabled={isDisbanding}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isDisbanding ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">delete_forever</span>
                            <span>Disband Family Group</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to leave this family group? You will lose access to the shared scoreboard timeline.")) {
                            setIsLeaving(true);
                            try {
                              await leaveFamily();
                            } finally {
                              setIsLeaving(false);
                            }
                          }
                        }}
                        disabled={isLeaving}
                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isLeaving ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">logout</span>
                            <span>Leave Family Group</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Log Lab Report Modal */}
      {showLogReportModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">file_upload</span>
                <span>Log Lab Report</span>
              </h3>
              <button
                onClick={() => {
                  setShowLogReportModal(false);
                  setCustomReportFields([]);
                }}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>

            <div className="space-y-4 text-left">
              {/* Patient Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Patient Profile</label>
                <select
                  value={reportPatientId}
                  onChange={(e) => setReportPatientId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Myself">Myself (Sarah)</option>
                  {familyMembers.map((fm) => (
                    <option key={fm.id} value={fm.id}>{fm.name} ({fm.relationship})</option>
                  ))}
                </select>
              </div>

              {/* Test Category Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Test Category</label>
                <select
                  value={reportTestCategory}
                  onChange={(e) => {
                    const category = e.target.value;
                    setReportTestCategory(category);
                    const presets = {
                      "Lipid Profile": ["Total Cholesterol", "HDL (Good)", "LDL (Bad)", "Triglycerides"],
                      "Thyroid Profile": ["TSH", "Free T3", "Free T4"],
                      "Diabetic Profile": ["HbA1c", "Fasting Blood Sugar", "Post-Prandial Sugar"],
                      "Complete Blood Count (CBC)": ["Hemoglobin", "WBC Count", "Platelets", "RBC Count"]
                    }[category] || [];
                    const fields: Record<string, string> = {};
                    presets.forEach(f => { fields[f] = ""; });
                    setReportFields(fields);
                  }}
                  className="w-full px-3 py-2.5 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Lipid Profile">Lipid Profile</option>
                  <option value="Thyroid Profile">Thyroid Profile</option>
                  <option value="Diabetic Profile">Diabetic Profile</option>
                  <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                </select>
              </div>

              {/* Date Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Test Date</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Upload Report Block */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Upload Lab Report File (Optional)</label>
                <label className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer bg-surface-container-low/40 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-secondary">cloud_upload</span>
                  <span className="font-label-md text-[10px] text-on-surface font-bold">Upload PDF or Image</span>
                  <input type="file" className="hidden" onChange={() => alert("File uploaded successfully. Proceeding with manual metadata entries.")} />
                </label>
              </div>

              {/* Dynamic Fields Section */}
              <div className="space-y-3 border-t border-outline-variant/15 pt-3">
                <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Test Parameters & Results</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(reportFields).map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="block text-[9px] font-bold text-secondary uppercase tracking-wider">{field}</label>
                      <input
                        type="text"
                        placeholder="e.g. 120"
                        value={reportFields[field] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReportFields(prev => ({ ...prev, [field]: val }));
                        }}
                        className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                  
                  {/* Custom Parameter Fields */}
                  {customReportFields.map((field, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="block text-[9px] font-bold text-secondary uppercase tracking-wider">{field.name}</label>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomReportFields(prev => prev.map((item, i) => i === idx ? { ...item, value: val } : item));
                        }}
                        className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Parameter Form */}
              <div className="space-y-2 border-t border-outline-variant/15 pt-3">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Add Custom Parameter (Not in presets)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. VLDL, Vitamin D3"
                    value={newCustomFieldName}
                    onChange={(e) => setNewCustomFieldName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={newCustomFieldValue}
                    onChange={(e) => setNewCustomFieldValue(e.target.value)}
                    className="w-20 px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCustomFieldName.trim() && newCustomFieldValue.trim()) {
                        setCustomReportFields(prev => [...prev, { name: newCustomFieldName, value: newCustomFieldValue }]);
                        setNewCustomFieldName("");
                        setNewCustomFieldValue("");
                      }
                    }}
                    className="px-3 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-secondary font-bold rounded-xl text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={() => {
                  const patientName = reportPatientId === "Myself"
                    ? "Sarah (Myself)"
                    : familyMembers.find(f => f.id === reportPatientId)?.name || "Family Member";

                  const mergedFields: Record<string, string> = { ...reportFields };
                  customReportFields.forEach(f => {
                    if (f.name) mergedFields[f.name] = f.value;
                  });

                  setLoggedReports(prev => [
                    {
                      id: `rep-${Date.now()}`,
                      category: reportTestCategory,
                      patientName,
                      date: reportDate ? new Date(reportDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Today",
                      fields: mergedFields
                    },
                    ...prev
                  ]);

                  const entries = Object.entries(mergedFields)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ");
                  
                  uploadReportPlaceholder(reportTestCategory, `Patient: ${patientName}. Date: ${reportDate}. Values: ${entries}`);
                  
                  setShowLogReportModal(false);
                  setCustomReportFields([]);
                  alert(`Successfully logged ${reportTestCategory} checkup for ${patientName}!`);
                }}
                className="w-full py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md mt-4"
              >
                Save Report & Update Vitals
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STOCK INVENTORY MODAL */}
      {editingStockMedId !== null && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-[99] flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
                <span>Update Stock Inventory</span>
              </h3>
              <button
                onClick={() => {
                  setEditingStockMedId(null);
                  setEditingStockValue("");
                }}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>

            <div className="space-y-4 text-left">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Enter the remaining count for <strong className="text-secondary">{medicines.find(m => m.id === editingStockMedId)?.name}</strong>. This updates your stock status and refill alerts.
              </p>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Remaining Doses</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 30"
                  value={editingStockValue}
                  onChange={(e) => setEditingStockValue(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary text-center font-bold"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStockMedId(null);
                    setEditingStockValue("");
                  }}
                  className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high text-secondary font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newStockNum = parseInt(editingStockValue, 10);
                    if (!isNaN(newStockNum)) {
                      updateMedicineStock(editingStockMedId, newStockNum);
                    }
                    setEditingStockMedId(null);
                    setEditingStockValue("");
                  }}
                  className="flex-1 py-2 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURE PRESCRIPTION / ADD REMINDER MODAL */}
      {isAddReminderOpen && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">medication</span>
                <span>{editingMedId ? "Edit Medication Details" : "Configure Prescription"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddReminderOpen(false);
                  resetAddReminderForm();
                }}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>

            <form onSubmit={handleReminderSubmit} className="space-y-4 text-left">
              {/* Medicine Name */}
              <div className="space-y-1 relative">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin, Atorvastatin"
                  value={newMedName}
                  onChange={(e) => {
                    setNewMedName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-outline-variant/20 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-outline-variant/10">
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-primary-container/10 transition-colors flex justify-between items-center text-xs focus:outline-none"
                      >
                        <div>
                          <span className="font-bold text-secondary">{s.name}</span>
                          <span className="text-[10px] text-on-surface-variant block mt-0.5">{s.instructions}</span>
                        </div>
                        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">{s.dosage}</span>
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
                    required
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
              
              {/* Current Stock Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Number of Medicines in Hand (Stock Count)</label>
                <input
                  type="number"
                  required
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
                  <span className="text-[10px] text-on-surface-variant block">Do not share this medicine details on the family portal</span>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50"
                />
              </div>

              {/* Timing Slots */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Schedule Slots (General Category)</label>
                <div className="grid grid-cols-2 gap-2">
                  {["morning", "afternoon", "evening", "night"].map((slot) => {
                    const isSelected = newSelectedTimings.includes(slot as any);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleTimingToggle(slot as any)}
                        className={`py-2 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 font-label-md text-xs font-bold ${
                          isSelected
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

              {/* Preferred Intake Times */}
              <div className="space-y-1.5 bg-surface-container-low/40 p-3 rounded-2xl border border-outline-variant/10">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Preferred Intake Times</label>
                <div className="flex gap-2">
                  <select
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-outline-variant/30 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary text-on-surface"
                  >
                    {timeOptions.length > 0 ? (
                      timeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
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
                      const formattedTime = `${displayHour}:${mStr} ${ampm}`;
                      return (
                        <span key={t} className="bg-primary/5 text-primary text-[10px] pl-2.5 pr-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-primary/10">
                          <span>{formattedTime}</span>
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

              {/* Reminder Duration / End Date */}
              <div className="space-y-2 bg-surface-container-low/40 p-3 rounded-2xl border border-outline-variant/10">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Reminder Duration</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={untilStopped}
                      onChange={(e) => setUntilStopped(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50"
                    />
                    <span className="font-label-sm text-xs font-bold text-secondary">Set reminder until stopped</span>
                  </label>
                </div>
                {!untilStopped && (
                  <div className="space-y-1.5 pt-1.5 animate-in slide-in-from-top-2 duration-200">
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

              {/* Family Member Select */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Who is this for?</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewFamilyMemberId("");
                      setIsAddingNewPerson(false);
                    }}
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                      newFamilyMemberId === "" && !isAddingNewPerson
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface-container/30 border-outline-variant/30 text-on-surface-variant hover:border-primary/30"
                    }`}
                  >
                    Myself
                  </button>

                  {familyMembers.map((fm) => (
                    <button
                      key={fm.id}
                      type="button"
                      onClick={() => {
                        setNewFamilyMemberId(fm.id);
                        setIsAddingNewPerson(false);
                      }}
                      className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                        newFamilyMemberId === fm.id && !isAddingNewPerson
                          ? "bg-secondary text-white border-secondary"
                          : "bg-surface-container/30 border-outline-variant/30 text-on-surface-variant hover:border-primary/30"
                      }`}
                    >
                      {fm.nickname || fm.name} ({fm.relationship})
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewPerson(true);
                      setNewFamilyMemberId("add_new_person");
                    }}
                    className={`px-3 py-1.5 rounded-full border border-dashed text-xs font-bold transition-all flex items-center gap-1 ${
                      isAddingNewPerson
                        ? "bg-tertiary text-white border-tertiary"
                        : "bg-white border-outline-variant/50 text-tertiary hover:border-tertiary/60"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                    <span>Add New Person</span>
                  </button>
                </div>
              </div>

              {/* Inline "Add New Person" Form wrapper */}
              {isAddingNewPerson && (
                <div className="p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <h4 className="font-label-md text-xs text-secondary font-bold border-b border-outline-variant/20 pb-1.5 flex justify-between items-center">
                    <span>New Care Recipient Profile</span>
                    <button
                      type="button"
                      onClick={resetNewPersonForm}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      Cancel
                    </button>
                  </h4>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Nickname</label>
                      <input
                        type="text"
                        placeholder="e.g. Dad, Mom, Bunty"
                        value={newPersonNickname}
                        onChange={(e) => setNewPersonNickname(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Relationship & DOB */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Relationship</label>
                      <select
                        value={newPersonRelationship}
                        onChange={(e) => setNewPersonRelationship(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                      >
                        {["Mother", "Father", "Son", "Daughter", "Brother", "Sister", "Grandmother", "Grandfather", "Husband", "Wife", "Partner", "Friend", "Relative", "Neighbor", "Caregiver", "Patient", "Other"].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Date of Birth</label>
                      <input
                        type="date"
                        value={newPersonDob}
                        onChange={(e) => setNewPersonDob(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Gender & Blood Group */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Gender</label>
                      <select
                        value={newPersonGender}
                        onChange={(e) => setNewPersonGender(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Blood Group</label>
                      <select
                        value={newPersonBloodGroup}
                        onChange={(e) => setNewPersonBloodGroup(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                      >
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Phone & Notes */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={newPersonPhone}
                        onChange={(e) => setNewPersonPhone(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Medical Notes / Allergies</label>
                      <textarea
                        placeholder="e.g. Penicillin allergy, diabetic, high blood pressure"
                        value={newPersonNotes}
                        onChange={(e) => setNewPersonNotes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary h-14 resize-none"
                      />
                    </div>
                  </div>

                  {/* Color coding theme selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Personalized Identification Color</label>
                    <div className="flex gap-2">
                      {["blue", "green", "purple", "orange", "pink", "teal", "grey"].map((c) => {
                        const isSelected = newPersonColor === c;
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
                            onClick={() => setNewPersonColor(c)}
                            className={`w-6 h-6 rounded-full ${bgColors[c] || "bg-blue-500"} transition-all flex items-center justify-center`}
                            title={c}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-white text-xs font-bold">done</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Avatar Library Grid Selector */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-bold text-outline uppercase tracking-wider">Select Avatar Representative</label>
                    
                    {/* Category tabs */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      {AVATAR_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActiveAvatarCategory(cat.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors flex-shrink-0 ${
                            activeAvatarCategory === cat.id
                              ? "bg-secondary/15 text-secondary"
                              : "bg-white text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Avatar Grid */}
                    <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-white border border-outline-variant/10 rounded-xl">
                      {AVATAR_ITEMS.filter((av) => av.category === activeAvatarCategory).map((av) => {
                        const isSelected = selectedAvatarUrl === av.url;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setSelectedAvatarUrl(av.url)}
                            className={`w-11 h-11 rounded-full p-0.5 border-2 transition-all flex items-center justify-center overflow-hidden flex-shrink-0 ${
                              isSelected ? "border-primary scale-110 shadow-sm" : "border-transparent hover:scale-105"
                            }`}
                            title={av.label}
                          >
                            <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewPersonSubmit}
                    disabled={!newPersonName}
                    className="w-full py-2.5 bg-tertiary text-white font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                  >
                    Add & Select Care Recipient
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md mt-2"
              >
                Save Prescription Reminder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SNOOZE SELECTION DIALOG */}
      {snoozeReminderId && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">snooze</span>
                <span>Snooze Reminder</span>
              </h3>
              <button
                type="button"
                onClick={() => setSnoozeReminderId(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4 text-left">
              {/* Preset Buttons */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Quick Presets</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[5, 10, 15, 30, 60].map((mins) => {
                    const isSelected = snoozeMinutes === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setSnoozeMinutes(mins);
                          setCustomSnoozeHours(0);
                          setCustomSnoozeMins(0);
                        }}
                        className={`py-2 text-center rounded-xl font-bold text-xs transition-all ${
                          isSelected && customSnoozeHours === 0 && customSnoozeMins === 0
                            ? "bg-primary text-on-primary shadow-sm"
                            : "bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        {mins}m
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Duration Selector */}
              <div className="space-y-1.5 bg-surface-container-low/40 p-3 rounded-2xl border border-outline-variant/10">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Custom Duration</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 flex-1">
                    <select
                      value={customSnoozeHours}
                      onChange={(e) => {
                        setCustomSnoozeHours(parseInt(e.target.value, 10));
                        setSnoozeMinutes(0); // clear preset selection highlight
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-outline-variant/30 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                        <option key={h} value={h}>{h} hrs</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-xs text-on-surface-variant font-bold">:</span>
                  <div className="flex items-center gap-1.5 flex-1">
                    <select
                      value={customSnoozeMins}
                      onChange={(e) => {
                        setCustomSnoozeMins(parseInt(e.target.value, 10));
                        setSnoozeMinutes(0);
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-outline-variant/30 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                    >
                      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                        <option key={m} value={m}>{m} mins</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  let totalMinutes = snoozeMinutes;
                  if (totalMinutes === 0) {
                    totalMinutes = customSnoozeHours * 60 + customSnoozeMins;
                  }
                  if (totalMinutes > 0) {
                    snoozeReminder(snoozeReminderId, totalMinutes);
                  }
                  setSnoozeReminderId(null);
                }}
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md mt-2"
              >
                Snooze Dosing Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmTakenReminder && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200 text-left">
            <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-xl">help</span>
              <span>Confirm Tracking Action</span>
            </h3>
            
            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed mb-4">
              You are about to mark medicine <strong className="text-secondary">{confirmTakenReminder.medicineName}</strong> as taken for <strong className="text-secondary">{confirmTakenReminder.recipientNickname}</strong>.
              <br /><br />
              Please confirm that the medicine has actually been taken. This action will update their adherence history and wellness score.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmTakenReminder(null)}
                className="flex-grow py-2.5 bg-surface-container hover:bg-surface-container-high text-secondary font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleReminderStatus(confirmTakenReminder.id, "taken", user?.id);
                  setConfirmTakenReminder(null);
                }}
                className="flex-grow py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Confirm & Mark Taken
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
