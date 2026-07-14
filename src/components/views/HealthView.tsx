"use client";

import React, { useState, useEffect } from "react";
import { useApp, TabType } from "../../context/AppContext";
import { Medicine, Reminder, Lab, DiagnosticTest, Booking, HealthReport, DEFAULT_MEDICINES } from "../../lib/mockData";
import { InsightsView } from "./InsightsView";
import { WellnessView } from "./WellnessView";

export const HealthView: React.FC = () => {
  const {
    reminders,
    toggleReminderStatus,
    addMedicine,
    editMedicine,
    medicines,
    familyMembers,
    labs,
    tests,
    bookings,
    createBooking,
    createMedicineOrder,
    reports,
    uploadReportPlaceholder,
    user,
    wellnessScore,
    familyWellnessScore,
    wellnessCategory,
    familyWellnessCategory,
    wellnessTrend,
    familyAlerts,
    unlockedAchievements,
    adherenceStreak,
    familyAdherenceStreak
  } = useApp();

  // Modals / Sub-views state
  const [activeModal, setActiveModal] = useState<"add_medicine" | "book_test" | "upload_report" | "view_history" | "tracking" | null>(null);
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<Booking | null>(null);

  // Medicine Ordering state
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>("pharm-apollo");
  const [medSearchQuery, setMedSearchQuery] = useState("");
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [showMedCheckout, setShowMedCheckout] = useState(false);
  const [selectedMedSlot, setSelectedMedSlot] = useState("Express Delivery (30-45 mins)");
  const [selectedMedAddressId, setSelectedMedAddressId] = useState("addr-1");

  // Add Medicine Form state (legacy fallback/reminder support if needed)
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedTimings, setSelectedTimings] = useState<("morning" | "afternoon" | "evening" | "night")[]>(["morning"]);
  const [familyMemberId, setFamilyMemberId] = useState<string>("");

  // Lab Booking Flow state
  const [selectedLabId, setSelectedLabId] = useState<string>("lab-apollo");
  const [labSearchQuery, setLabSearchQuery] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("08:00 AM - 09:00 AM");
  const [selectedAddressId, setSelectedAddressId] = useState("addr-1");

  // Report Upload state
  const [uploadTestName, setUploadTestName] = useState("");
  const [uploadSummary, setUploadSummary] = useState("");

  // Edit Medicine/Reminder states
  const [isEditReminderOpen, setIsEditReminderOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editMedName, setEditMedName] = useState("");
  const [editDosage, setEditDosage] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editSelectedTimings, setEditSelectedTimings] = useState<("morning" | "afternoon" | "evening" | "night")[]>(["morning"]);
  const [editStockCount, setEditStockCount] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [editFamilyMemberId, setEditFamilyMemberId] = useState("");
  const [editIntakeTimes, setEditIntakeTimes] = useState<string[]>([]);

  const handleRowClick = (r: Reminder) => {
    // Find the medicine object in the medicines list from context using r.medicineId
    const med = medicines.find(m => m.id === r.medicineId);
    
    if (med) {
      setEditingMedId(med.id);
      setEditMedName(med.name);
      setEditDosage(med.dosage);
      setEditInstructions(med.instructions);
      setEditSelectedTimings(med.timings || ["morning"]);
      setEditStockCount(med.stockCount !== undefined ? String(med.stockCount) : "30");
      setEditIsPrivate(med.isPrivate || false);
      setEditFamilyMemberId(r.familyMemberId || "");
      setEditIntakeTimes(med.intakeTimes || []);
    } else {
      // Fallback to reminder details if medicine not found in database
      setEditingMedId(r.medicineId);
      setEditMedName(r.medicineName);
      setEditDosage(r.dosage);
      setEditInstructions(r.instructions);
      setEditSelectedTimings([r.timing]);
      setEditStockCount("30");
      setEditIsPrivate(false);
      setEditFamilyMemberId(r.familyMemberId || "");
      setEditIntakeTimes([]);
    }
    setIsEditReminderOpen(true);
  };

  const handleEditReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedId || !editMedName || !editDosage) return;

    const payload = {
      name: editMedName,
      dosage: editDosage,
      instructions: editInstructions || "As directed",
      frequency: "daily" as const,
      timings: editSelectedTimings.length > 0 ? editSelectedTimings : ["morning" as const],
      startDate: new Date().toISOString().split("T")[0],
      stockCount: editStockCount ? parseInt(editStockCount, 10) : undefined,
      isPrivate: editIsPrivate,
      intakeTimes: editIntakeTimes
    };

    const targetFamilyId = editIsPrivate ? null : (editFamilyMemberId || null);

    editMedicine(editingMedId, payload, targetFamilyId);
    setIsEditReminderOpen(false);
    setEditingMedId(null);
  };

  const handleEditTimingToggle = (slot: "morning" | "afternoon" | "evening" | "night") => {
    setEditSelectedTimings(prev => 
      prev.includes(slot) 
        ? prev.filter(item => item !== slot) 
        : [...prev, slot]
    );
  };

  const [editTimeInput, setEditTimeInput] = useState("");

  const getEditIntakeTimeOptions = () => {
    const options: { value: string; label: string }[] = [];
    
    if (editSelectedTimings.includes("morning")) {
      for (let h = 5; h <= 12; h++) {
        const hStr = h.toString().padStart(2, "0");
        const label = h === 12 ? "12:00 PM" : `${h}:00 AM`;
        options.push({ value: `${hStr}:00`, label });
        if (h !== 12) {
          options.push({ value: `${hStr}:30`, label: `${h}:30 AM` });
        }
      }
    }
    
    if (editSelectedTimings.includes("afternoon")) {
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
    
    if (editSelectedTimings.includes("evening")) {
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
    
    if (editSelectedTimings.includes("night")) {
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
    return options;
  };

  const editTimeOptions = getEditIntakeTimeOptions();
  const uniqueEditTimeOptions = editTimeOptions.filter(
    (opt, index, self) => self.findIndex(o => o.value === opt.value) === index
  );

  // Set default selection when timings change
  useEffect(() => {
    if (uniqueEditTimeOptions.length > 0) {
      if (!uniqueEditTimeOptions.some(o => o.value === editTimeInput)) {
        setEditTimeInput(uniqueEditTimeOptions[0].value);
      }
    } else {
      setEditTimeInput("");
    }
  }, [editSelectedTimings]);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const openModal = sessionStorage.getItem("medimz_open_modal");
      if (openModal === "add_medicine") {
        const med = sessionStorage.getItem("medimz_prefill_med");
        if (med) {
          // Preselect matching mock medicine if exists, else set query search string
          const found = DEFAULT_MEDICINES.find(m => m.name.toLowerCase() === med.toLowerCase());
          if (found) {
            setSelectedMeds([found.id]);
            setShowMedCheckout(true);
          } else {
            setMedSearchQuery(med);
          }
        }
        setActiveModal("add_medicine");
        sessionStorage.removeItem("medimz_open_modal");
        sessionStorage.removeItem("medimz_prefill_med");
      } else if (openModal === "book_test") {
        const testId = sessionStorage.getItem("medimz_prefill_test");
        const labId = sessionStorage.getItem("medimz_prefill_lab");
        if (labId) {
          setSelectedLabId(labId);
        }
        if (testId) {
          setSelectedTests([testId]);
          setShowCheckout(true);
        }
        setActiveModal("book_test");
        sessionStorage.removeItem("medimz_open_modal");
        sessionStorage.removeItem("medimz_prefill_test");
        sessionStorage.removeItem("medimz_prefill_lab");
      }
    }
  }, []);

  // Helper: Convert slot time or reminder time to sorting minutes from midnight
  const getSortMinutes = (timeString: string): number => {
    // Check if it's an ISO datetime string
    if (timeString.includes("T")) {
      try {
        const d = new Date(timeString);
        return d.getHours() * 60 + d.getMinutes();
      } catch {
        return 0;
      }
    }
    // Parse timeslot format: e.g. "08:00 AM - 09:00 AM" or just "08:00 AM"
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // 1. Health Overview Stats
  const todayReminders = reminders.filter((r) => {
    const todayLocal = new Date();
    const schedLocal = new Date(r.scheduledTime);
    return todayLocal.getFullYear() === schedLocal.getFullYear() &&
           todayLocal.getMonth() === schedLocal.getMonth() &&
           todayLocal.getDate() === schedLocal.getDate();
  });

  const todayBookings = bookings.filter((b) => b.bookingDate === todayStr);

  const completedMedsCount = todayReminders.filter((r) => r.status === "taken").length;
  const missedMedsCount = todayReminders.filter((r) => r.status === "missed").length;
  const pendingMedsCount = todayReminders.filter((r) => r.status === "pending").length;

  const upcomingTestsCount = bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled").length;
  const completedTestsCount = bookings.filter((b) => b.status === "completed").length;

  // 2. Timeline items construction
  const timelineItems: {
    id: string;
    time: string;
    sortMinutes: number;
    type: "medicine" | "lab_test";
    label: string;
    subtitle: string;
    status: string;
    raw: any;
  }[] = [];

  // Add Today's reminders
  todayReminders.forEach((r) => {
    const timeFormatted = new Date(r.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    timelineItems.push({
      id: `rem-${r.id}`,
      time: timeFormatted,
      sortMinutes: getSortMinutes(r.scheduledTime),
      type: "medicine",
      label: r.medicineName,
      subtitle: `${r.dosage} • ${r.instructions}${r.familyMemberName ? ` (${r.familyMemberName})` : ""}`,
      status: r.status,
      raw: r
    });
  });

  // Add Today's bookings
  todayBookings.forEach((b) => {
    const isMedOrder = b.type === "medicine";
    const timeFormatted = b.timeSlot.includes(" - ") ? b.timeSlot.split(" - ")[0] : b.timeSlot.split(" (")[0];
    timelineItems.push({
      id: `book-${b.id}`,
      time: isMedOrder ? "Delivery" : timeFormatted,
      sortMinutes: getSortMinutes(b.timeSlot),
      type: isMedOrder ? "medicine" : "lab_test",
      label: isMedOrder ? `Delivery: ${b.labName}` : `${b.labName} Collection`,
      subtitle: isMedOrder ? `Medicines: ${b.testNames.join(", ")}` : b.testNames.join(", "),
      status: b.status,
      raw: b
    });
  });

  // Sort timeline chronologically
  timelineItems.sort((a, b) => a.sortMinutes - b.sortMinutes);

  // Handlers
  const handleTimingToggle = (timing: "morning" | "afternoon" | "evening" | "night") => {
    if (selectedTimings.includes(timing)) {
      setSelectedTimings((prev) => prev.filter((t) => t !== timing));
    } else {
      setSelectedTimings((prev) => [...prev, timing]);
    }
  };

  const handleAddMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !dosage || selectedTimings.length === 0) return;

    addMedicine(
      {
        name: medName,
        dosage,
        instructions: instructions || "As directed",
        frequency: "daily",
        timings: selectedTimings,
        startDate: todayStr
      },
      familyMemberId || null
    );

    setMedName("");
    setDosage("");
    setInstructions("");
    setSelectedTimings(["morning"]);
    setFamilyMemberId("");
    setActiveModal(null);
  };

  const handleTestCheckboxToggle = (testId: string) => {
    if (selectedTests.includes(testId)) {
      setSelectedTests((prev) => prev.filter((id) => id !== testId));
    } else {
      setSelectedTests((prev) => [...prev, testId]);
    }
  };

  const handlePlaceOrder = () => {
    if (selectedTests.length === 0) return;
    const booking = createBooking(selectedLabId, selectedTests, selectedSlot, selectedAddressId);
    setSelectedTests([]);
    setShowCheckout(false);
    setActiveTrackingBooking(booking);
    setActiveModal("tracking");
  };

  const handleUploadReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTestName || !uploadSummary) return;
    uploadReportPlaceholder(uploadTestName, uploadSummary);
    setUploadTestName("");
    setUploadSummary("");
    setActiveModal(null);
    alert("Report placeholder created successfully and AI analysis populated!");
  };

  const PHARMACIES = [
    { id: "pharm-medplus", name: "MedPlus Pharmacy", rating: 4.8, fastDeliveryMins: 45 },
    { id: "pharm-apollo", name: "Apollo Pharmacy", rating: 4.9, fastDeliveryMins: 30 },
    { id: "pharm-netmeds", name: "Netmeds Store", rating: 4.7, fastDeliveryMins: 60 }
  ];

  const activePharmacy = PHARMACIES.find((p) => p.id === selectedPharmacyId) || PHARMACIES[0];
  
  const filteredMedsForOrder = DEFAULT_MEDICINES.filter((m) =>
    m.name.toLowerCase().includes(medSearchQuery.toLowerCase())
  );
  
  const getMedPrice = (med: any) => {
    return (med.name.length * 12) + 40;
  };

  const totalMedAmount = DEFAULT_MEDICINES
    .filter(m => selectedMeds.includes(m.id))
    .reduce((sum, m) => sum + getMedPrice(m), 0);

  const handleMedCheckboxToggle = (medId: string) => {
    if (selectedMeds.includes(medId)) {
      setSelectedMeds(prev => prev.filter(id => id !== medId));
    } else {
      setSelectedMeds(prev => [...prev, medId]);
    }
  };

  const handlePlaceMedOrder = () => {
    if (selectedMeds.length === 0) return;
    const order = createMedicineOrder(selectedPharmacyId, selectedMeds, selectedMedSlot, selectedMedAddressId);
    setSelectedMeds([]);
    setShowMedCheckout(false);
    setActiveTrackingBooking(order);
    setActiveModal("tracking");
  };

  const activeLab = labs.find((l) => l.id === selectedLabId) || labs[0];
  const activeLabTests = tests.filter((t) => t.labId === selectedLabId);
  const filteredLabTests = activeLabTests.filter((t) =>
    t.name.toLowerCase().includes(labSearchQuery.toLowerCase())
  );
  const totalAmount = tests
    .filter((t) => selectedTests.includes(t.id))
    .reduce((sum, t) => sum + t.discountedPrice, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* HEALTH INSIGHTS SECTION (Merged Page 2 and 3) - Only AI Sync card at top */}
      <InsightsView hideDiagnosticBlocks={true} hideBento={true} />
      
      {/* 1. HEALTH OVERVIEW - PREMIUM WELLNESS SCORE DASHBOARD */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-tertiary/10 p-5 rounded-3xl border border-outline-variant/20 shadow-sm space-y-4">
        <div className="text-left flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-3">
          <div>
            <span className="font-label-sm text-[10px] text-primary font-bold uppercase tracking-wider block">Wellness Engine</span>
            <h2 className="font-headline-md text-xl text-secondary font-bold mt-0.5">Medicine Adherence Scores</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Individual Adherence Streak Pill */}
            <div className="bg-white/80 border border-outline-variant/10 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 flex-shrink-0">
              {adherenceStreak === "no_medicines" ? (
                <>
                  <span className="material-symbols-outlined text-outline text-base">pill</span>
                  <div className="text-left">
                    <span className="text-[8px] text-outline font-bold uppercase tracking-wider block leading-none">Your Streak</span>
                    <span className="text-[10px] font-bold text-outline mt-0.5 block leading-none">No medicines scheduled</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-primary text-base">local_fire_department</span>
                  <div className="text-left">
                    <span className="text-[8px] text-outline font-bold uppercase tracking-wider block leading-none">Your Streak</span>
                    <span className="text-[11px] font-black text-secondary mt-0.5 block leading-none">🔥 {adherenceStreak}-Day Streak</span>
                  </div>
                </>
              )}
            </div>

            {/* Family Adherence Streak Pill */}
            <div className="bg-white/80 border border-outline-variant/10 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 flex-shrink-0">
              {familyAdherenceStreak === "no_medicines" ? (
                <>
                  <span className="material-symbols-outlined text-outline text-base">pill</span>
                  <div className="text-left">
                    <span className="text-[8px] text-outline font-bold uppercase tracking-wider block leading-none">Family Streak</span>
                    <span className="text-[9px] font-bold text-outline mt-0.5 block leading-tight max-w-[125px]">No medicines scheduled for any family member today</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-primary text-base">groups</span>
                  <div className="text-left">
                    <span className="text-[8px] text-outline font-bold uppercase tracking-wider block leading-none">Family Streak</span>
                    <span className="text-[11px] font-black text-secondary mt-0.5 block leading-none">👨‍👩‍👧‍👦 Family Streak: {familyAdherenceStreak} Days</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Individual Wellness Dial Card */}
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/10 flex items-center justify-between gap-4 text-left">
            <div className="flex-1 space-y-2 text-left">
              <div>
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Your Wellness Score</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-3xl font-extrabold text-secondary leading-none">{wellnessScore}</span>
                  <span className="text-xs text-outline font-semibold">/ 10</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-left items-start">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit uppercase tracking-wider ${
                  wellnessScore >= 9.0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  wellnessScore >= 8.0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  wellnessScore >= 7.0 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                  wellnessScore >= 5.0 ? "bg-orange-50 text-orange-700 border border-orange-200" :
                  "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  🟢 {wellnessCategory}
                </span>
                <span className="text-[10px] text-outline font-medium truncate">{wellnessTrend}</span>
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-[72px] h-[72px] flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-surface-container-highest" />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 30}
                  strokeDashoffset={2 * Math.PI * 30 * (1 - (wellnessScore || 10) / 10)}
                  className={`progress-ring-circle ${
                    wellnessScore >= 8.0 ? "text-emerald-500" :
                    wellnessScore >= 5.0 ? "text-amber-500" :
                    "text-red-500"
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-sm font-black text-secondary">
                {Math.round((wellnessScore || 0) * 10)}%
              </div>
            </div>
          </div>

          {/* Family Wellness Dial Card */}
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/10 flex items-center justify-between gap-4 text-left">
            <div className="flex-1 space-y-2 text-left">
              <div>
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Family Wellness Score</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-3xl font-extrabold text-secondary leading-none">{familyWellnessScore}</span>
                  <span className="text-xs text-outline font-semibold">/ 10</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-left items-start">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit uppercase tracking-wider ${
                  familyWellnessScore >= 9.0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  familyWellnessScore >= 8.0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  familyWellnessScore >= 7.0 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                  familyWellnessScore >= 5.0 ? "bg-orange-50 text-orange-700 border border-orange-200" :
                  "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  👥 {familyWellnessCategory}
                </span>
                <span className="text-[10px] text-outline font-medium">Shared household average</span>
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-[72px] h-[72px] flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-surface-container-highest" />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 30}
                  strokeDashoffset={2 * Math.PI * 30 * (1 - (familyWellnessScore || 10) / 10)}
                  className={`progress-ring-circle ${
                    familyWellnessScore >= 8.0 ? "text-emerald-500" :
                    familyWellnessScore >= 5.0 ? "text-amber-500" :
                    "text-red-500"
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-sm font-black text-secondary">
                {Math.round((familyWellnessScore || 0) * 10)}%
              </div>
            </div>
          </div>
        </div>

        {/* Daily, Weekly, Monthly Trends Indicators */}
        <div className="bg-white/40 p-3.5 rounded-2xl border border-outline-variant/10 space-y-2.5">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Adherence Forecast & Trends</span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Daily Trend */}
            <div className="bg-white/60 p-2.5 rounded-xl border border-outline-variant/5">
              <span className="text-[9px] text-outline font-medium block">Daily Average</span>
              <span className="text-base font-extrabold text-secondary block mt-0.5">{wellnessScore}</span>
              <div className="flex items-center justify-center gap-0.5 text-[8px] font-bold text-emerald-600 mt-1">
                <span className="material-symbols-outlined text-[8px]">trending_up</span>
                <span>Stable</span>
              </div>
            </div>

            {/* Weekly Trend */}
            <div className="bg-white/60 p-2.5 rounded-xl border border-outline-variant/5">
              <span className="text-[9px] text-outline font-medium block">Weekly Average</span>
              <span className="text-base font-extrabold text-secondary block mt-0.5">
                {Math.round(wellnessScore * 0.96 * 10) / 10}
              </span>
              <div className="flex items-center justify-center gap-0.5 text-[8px] font-bold text-emerald-600 mt-1">
                <span className="material-symbols-outlined text-[8px]">trending_up</span>
                <span>+0.4 increase</span>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white/60 p-2.5 rounded-xl border border-outline-variant/5">
              <span className="text-[9px] text-outline font-medium block">Monthly Average</span>
              <span className="text-base font-extrabold text-secondary block mt-0.5">
                {Math.round(wellnessScore * 0.92 * 10) / 10}
              </span>
              <div className="flex items-center justify-center gap-0.5 text-[8px] font-bold text-amber-600 mt-1">
                <span className="material-symbols-outlined text-[8px]">trending_flat</span>
                <span>Baseline standard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Family Alerts Warning Console */}
        {familyAlerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200/50 p-3.5 rounded-2xl space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">⚠️ Family Alert Monitor</span>
            {familyAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-bold text-amber-700">
                <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
                <span>{alert}</span>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Achievements & Streak Rewards Grid */}
        {unlockedAchievements.length > 0 && (
          <div className="pt-3.5 border-t border-outline-variant/15 space-y-2">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Achievements Unlocked ({unlockedAchievements.length})</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {unlockedAchievements.map((ach) => (
                <div key={ach.id} className="flex items-center gap-2.5 p-2.5 bg-white/80 border border-outline-variant/10 rounded-xl shadow-sm hover:scale-[1.01] transition-transform">
                  <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">{ach.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-label-md text-[10px] text-secondary font-bold leading-tight truncate">{ach.title}</h5>
                    <p className="text-[8px] text-on-surface-variant leading-tight mt-0.5">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* WELLNESS HEALTH SECTION (Merged Wellness) */}
      <WellnessView hideHero={true} />


      {/* 3. TODAY'S TIMELINE */}
      <section className="space-y-3">
        <h3 className="font-headline-md text-base text-secondary font-bold">Today's Timeline</h3>
        
        {timelineItems.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-low border border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-4xl text-outline-variant/70">event_busy</span>
            <p className="font-body-md text-xs text-on-surface-variant">No medicines or lab appointments scheduled for today.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4">
            {/* Horizontal-centered vertical line indicator */}
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-outline-variant/30 rounded-full" />

            {timelineItems.map((item) => {
              const isMedicine = item.type === "medicine";
              const isCompleted = item.status === "taken" || item.status === "completed";
              
              return (
                <div key={item.id} className="relative flex gap-3.5 items-start w-full min-w-0 animate-in fade-in duration-300">
                  {/* Circle indicator on timeline */}
                  <div className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-background flex items-center justify-center ${
                    isCompleted
                      ? "bg-tertiary shadow-[0_0_8px_rgba(0,110,47,0.4)]"
                      : "bg-primary"
                  }`} />

                  {/* Scheduled time */}
                  <div className="w-14 flex-shrink-0 pt-0.5">
                    <span className="font-label-sm text-[11px] text-outline font-bold uppercase tracking-wider block leading-none">{item.time}</span>
                  </div>

                  {/* Card Content */}
                  <div className={`flex-grow p-4 rounded-2xl border transition-all duration-300 flex justify-between items-center gap-3 min-w-0 ${
                    isCompleted
                      ? "bg-surface-container-low/50 border-outline-variant/15 opacity-75"
                      : "bg-white border-outline-variant/30 hover:border-primary/20 shadow-sm"
                  }`}>
                    <div className="flex gap-3 items-center min-w-0 flex-grow">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isMedicine
                          ? isCompleted ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
                          : isCompleted ? "bg-tertiary/10 text-tertiary" : "bg-secondary/10 text-secondary"
                      }`}>
                        <span className="material-symbols-outlined text-lg">
                          {isMedicine ? "pill" : "science"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h4 className="font-label-md text-xs text-secondary font-bold break-words leading-snug">{item.label}</h4>
                        <p className="font-body-md text-[10px] text-on-surface-variant break-words mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isMedicine ? (
                      <button
                        onClick={() => toggleReminderStatus(item.raw.id, isCompleted ? "pending" : "taken")}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted
                            ? "bg-tertiary text-white shadow-sm"
                            : "bg-surface-container hover:bg-primary/10 border border-outline-variant/20"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {isCompleted ? "done" : "circle"}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTrackingBooking(item.raw);
                          setActiveModal("tracking");
                        }}
                        className="px-2.5 py-1.5 bg-secondary/15 hover:bg-secondary/25 text-secondary rounded-lg font-label-sm text-[10px] font-bold flex-shrink-0 transition-all"
                      >
                        Track
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. MEDICINES SECTION */}
      <section className="bg-white border border-outline-variant/20 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">pill</span>
            <h3 className="font-headline-md text-base text-secondary font-bold">Your Medicines</h3>
          </div>
          <button
            onClick={() => setActiveModal("add_medicine")}
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-sm">shopping_cart</span> Order
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Configure Reminders</p>
          {reminders.length === 0 ? (
            <p className="text-xs text-on-surface-variant italic py-1">No prescriptions configured.</p>
          ) : (
            reminders.slice(0, 4).map((r) => (
              <div
                key={r.id}
                onClick={() => handleRowClick(r)}
                className="p-3 bg-surface-container-low/40 border border-outline-variant/20 rounded-xl flex justify-between items-center text-xs cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-label-md text-xs text-secondary font-bold truncate hover:text-primary transition-colors">{r.medicineName}</span>
                    {r.familyMemberName && (
                      <span className="bg-secondary/10 text-secondary text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        {r.familyMemberName.split(" ")[0]}
                      </span>
                    )}
                  </div>
                  <p className="font-body-md text-[10px] text-on-surface-variant mt-0.5">{r.dosage} • {r.instructions}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  r.status === "taken" ? "bg-tertiary-container/10 text-tertiary" : "bg-outline-variant/20 text-on-surface-variant"
                }`}>
                  {r.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Medicine Orders Delivery Tracking */}
        {bookings.filter(b => b.type === "medicine").length > 0 && (
          <div className="border-t border-outline-variant/20 pt-3 space-y-2">
            <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Active Deliveries</p>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {bookings.filter(b => b.type === "medicine").map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setActiveTrackingBooking(b);
                    setActiveModal("tracking");
                  }}
                  className="p-3 bg-primary-container/5 border border-primary/20 rounded-xl flex justify-between items-center text-xs cursor-pointer hover:bg-primary-container/10 transition-colors animate-pulse"
                >
                  <div className="min-w-0">
                    <span className="font-label-md text-xs text-secondary font-bold block truncate">{b.testNames.join(", ")}</span>
                    <p className="font-body-md text-[9px] text-outline mt-0.5 uppercase tracking-wide">📦 {b.labName} • {b.status.replace("_", " ")}</p>
                  </div>
                  <span className="font-label-sm text-[10px] text-primary font-bold">Track &gt;</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>


      {/* MODAL 1: ORDER MEDICINES */}
      {activeModal === "add_medicine" && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-lg text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">shopping_cart</span>
                <span>Order Medicines</span>
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedMeds([]);
                  setShowMedCheckout(false);
                }}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Pharmacy Partner Selection */}
              <div className="space-y-1.5">
                <label className="block font-label-md text-xs text-on-surface-variant font-bold">Select Pharmacy Partner</label>
                <div className="grid grid-cols-3 gap-2">
                  {PHARMACIES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPharmacyId(p.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        selectedPharmacyId === p.id
                          ? "bg-primary-container/20 border-primary text-primary scale-105"
                          : "bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary/30"
                      }`}
                    >
                      <span className="font-label-md text-[10px] font-bold block leading-tight truncate w-full">
                        {p.name.split(" ")[0]}
                      </span>
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="material-symbols-outlined text-primary text-[8px] fill-primary">star</span>
                        <span className="text-[9px] font-bold text-on-surface">{p.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pharmacy Info Banner */}
              <div className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs space-y-1">
                <h4 className="font-bold text-secondary">{activePharmacy.name}</h4>
                <p className="text-on-surface-variant">⚡ Delivery: Express within {activePharmacy.fastDeliveryMins} mins</p>
              </div>

              {/* Search Medicines */}
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-base">search</span>
                <input
                  type="text"
                  placeholder="Search medicine (Paracetamol, Metformin...)"
                  value={medSearchQuery}
                  onChange={(e) => setMedSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface-container/50 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Medicine lists */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filteredMedsForOrder.length === 0 ? (
                  <p className="text-xs text-outline-variant/80 italic p-3 text-center">No matching medicines found.</p>
                ) : (
                  filteredMedsForOrder.map((med) => {
                    const isChecked = selectedMeds.includes(med.id);
                    const price = getMedPrice(med);
                    return (
                      <div
                        key={med.id}
                        onClick={() => handleMedCheckboxToggle(med.id)}
                        className={`p-3 rounded-xl border flex justify-between items-center gap-2 cursor-pointer hover:border-primary/30 transition-colors ${
                          isChecked ? "border-primary/40 bg-primary-container/5" : "border-outline-variant/20"
                        }`}
                      >
                        <div className="min-w-0">
                          <h5 className="font-label-md text-xs text-secondary font-bold leading-tight truncate">{med.name}</h5>
                          <p className="text-[9px] text-on-surface-variant truncate mt-0.5">{med.dosage} • {med.instructions}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-primary">₹{price}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked ? "bg-primary text-white" : "bg-surface-container border border-outline-variant/20"
                        }`}>
                          {isChecked && <span className="material-symbols-outlined text-xs font-bold">done</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {selectedMeds.length > 0 && !showMedCheckout && (
                <button
                  onClick={() => setShowMedCheckout(true)}
                  className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all flex justify-between items-center px-4"
                >
                  <span>{selectedMeds.length} Items Selected</span>
                  <div className="flex items-center gap-1">
                    <span>Subtotal: ₹{totalMedAmount}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </button>
              )}

              {/* Medicine Checkout Wizard */}
              {showMedCheckout && (
                <div className="border-t border-outline-variant/30 pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="space-y-1.5">
                    <label className="block font-label-md text-xs text-on-surface-variant font-bold">Select Delivery Slot</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Express Delivery (30-45 mins)",
                        "Standard Delivery (Same Day)",
                        "Next Morning (Before 9 AM)",
                        "Scheduled Slot (2 PM - 5 PM)"
                      ].map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedMedSlot(slot)}
                          className={`p-2 rounded-xl border text-[9px] font-bold text-center transition-colors ${
                            selectedMedSlot === slot
                              ? "bg-primary-container/20 border-primary text-primary"
                              : "bg-surface-container-low border-outline-variant/20 text-on-surface-variant"
                          }`}
                        >
                          {slot.split(" ")[0]} Slot
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-label-md text-xs text-on-surface-variant font-bold">Select Delivery Address</label>
                    <select
                      value={selectedMedAddressId}
                      onChange={(e) => setSelectedMedAddressId(e.target.value)}
                      className="w-full px-4 py-2 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                    >
                      {user?.addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label} • {addr.line1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handlePlaceMedOrder}
                    className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all shadow-md"
                  >
                    Place Delivery Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BOOK LAB TEST */}
      {activeModal === "book_test" && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-lg text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">biotech</span>
                <span>Book Diagnostic Test</span>
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedTests([]);
                  setShowCheckout(false);
                }}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Lab Partner Selection */}
              <div className="space-y-1.5">
                <label className="block font-label-md text-xs text-on-surface-variant font-bold">Select Laboratory Partner</label>
                <div className="grid grid-cols-3 gap-2">
                  {labs.map((lab) => (
                    <button
                      key={lab.id}
                      onClick={() => setSelectedLabId(lab.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        selectedLabId === lab.id
                          ? "bg-secondary-container/20 border-secondary text-secondary scale-105"
                          : "bg-white border-outline-variant/30 text-on-surface-variant hover:border-secondary/30"
                      }`}
                    >
                      <span className="font-label-md text-[10px] font-bold block leading-tight truncate w-full">
                        {lab.name.split(" ")[0]}
                      </span>
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="material-symbols-outlined text-primary text-[8px] fill-primary">star</span>
                        <span className="text-[9px] font-bold text-on-surface">{lab.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lab Info Banner */}
              <div className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs space-y-1">
                <h4 className="font-bold text-secondary">{activeLab.name}</h4>
                <p className="text-on-surface-variant">📍 Centre: Pune • Collection in {activeLab.fastCollectionMins} mins</p>
              </div>

              {/* Search Diagnostics */}
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-base">search</span>
                <input
                  type="text"
                  placeholder="Search package (CBC, Lipid...)"
                  value={labSearchQuery}
                  onChange={(e) => setLabSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface-container/50 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-secondary transition-all"
                />
              </div>

              {/* Test lists */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filteredLabTests.map((test) => {
                  const isChecked = selectedTests.includes(test.id);
                  return (
                    <div
                      key={test.id}
                      onClick={() => handleTestCheckboxToggle(test.id)}
                      className={`p-3 rounded-xl border flex justify-between items-center gap-2 cursor-pointer hover:border-secondary/30 transition-colors ${
                        isChecked ? "border-secondary/40 bg-secondary-container/5" : "border-outline-variant/20"
                      }`}
                    >
                      <div className="min-w-0">
                        <h5 className="font-label-md text-xs text-secondary font-bold leading-tight truncate">{test.name}</h5>
                        <p className="text-[9px] text-on-surface-variant truncate mt-0.5">{test.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-primary">₹{test.discountedPrice}</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isChecked ? "bg-secondary text-white" : "bg-surface-container border border-outline-variant/20"
                      }`}>
                        {isChecked && <span className="material-symbols-outlined text-xs font-bold">done</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedTests.length > 0 && !showCheckout && (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all flex justify-between items-center px-4"
                >
                  <span>{selectedTests.length} Package Selected</span>
                  <div className="flex items-center gap-1">
                    <span>Grand Total: ₹{totalAmount}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </button>
              )}

              {/* Checkout Wizard inside modal */}
              {showCheckout && (
                <div className="border-t border-outline-variant/30 pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="space-y-1.5">
                    <label className="block font-label-md text-xs text-on-surface-variant font-bold">Select Collection Slot</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["07:00 AM - 08:00 AM", "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:30 AM"].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setSelectedSlot(s)}
                          className={`p-2 rounded-xl border text-[9px] font-bold text-center transition-colors ${
                            selectedSlot === s
                              ? "bg-secondary-container/20 border-secondary text-secondary"
                              : "bg-surface-container-low border-outline-variant/20 text-on-surface-variant"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-label-md text-xs text-on-surface-variant font-bold">Select Address</label>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full px-4 py-2 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-secondary transition-all"
                    >
                      {user?.addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label} • {addr.line1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all shadow-md"
                  >
                    Confirm Booking & Dispatch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD REPORT */}
      {activeModal === "upload_report" && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-lg text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-2xl">cloud_upload</span>
                <span>Upload Lab Report</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadReportSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-label-md text-xs text-on-surface-variant font-bold">Diagnostic Test / Panel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count (CBC)"
                  required
                  value={uploadTestName}
                  onChange={(e) => setUploadTestName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface focus:outline-none focus:border-tertiary transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-xs text-on-surface-variant font-bold">AI Diagnostics Summary</label>
                <textarea
                  placeholder="Paste test values, summary results or Doctor notes..."
                  required
                  rows={4}
                  value={uploadSummary}
                  onChange={(e) => setUploadSummary(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface focus:outline-none focus:border-tertiary transition-all"
                />
              </div>

              <div className="border border-dashed border-outline-variant/40 rounded-xl p-6 text-center hover:bg-surface-container-low transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-3xl text-outline-variant/80">picture_as_pdf</span>
                <span className="block text-[11px] font-bold text-secondary mt-1">Select PDF or Lab Image</span>
                <span className="text-[9px] text-outline block mt-0.5">Max size 5MB</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-tertiary text-white font-bold rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all shadow-md"
              >
                Parse & Upload Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW HISTORY */}
      {activeModal === "view_history" && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-lg text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">history</span>
                <span>Report & Diagnostics History</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Reports List */}
              <div className="space-y-2">
                <h4 className="font-headline-md text-sm text-secondary font-bold">Uploaded Lab Reports</h4>
                {reports.length === 0 ? (
                  <p className="text-xs text-outline italic">No lab reports found.</p>
                ) : (
                  reports.map((rep) => (
                    <div key={rep.id} className="p-3.5 bg-surface-container-low border border-outline-variant/20 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-label-md text-xs text-secondary font-bold">{rep.testName}</span>
                        <span className="text-[9px] text-outline font-medium">{rep.date}</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed bg-white/70 p-2.5 rounded-lg border border-outline-variant/10">
                        {rep.aiSummary}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PHLEBOTOMIST TRACKING */}
      {activeModal === "tracking" && activeTrackingBooking && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] h-[80vh] bg-white rounded-3xl shadow-2xl border border-outline-variant/30 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Map Canvas Stub */}
            <div className="absolute inset-0 z-0">
              <img
                alt="City Map Grid"
                className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/80 pointer-events-none" />
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="soft-path stroke-secondary opacity-40 fill-none stroke-[3px]"
                  strokeDasharray="8 8"
                  d="M 60,120 Q 240,80 200,280 T 360,200"
                />
                <circle cx="200" cy="280" r="10" className="fill-primary animate-ping" />
                <circle cx="200" cy="280" r="8" className="fill-primary shadow-lg" />
              </svg>
            </div>

            {/* Back button */}
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-secondary text-lg">arrow_back</span>
              </button>
              <div className="bg-white px-3 py-1.5 rounded-full shadow-md text-[10px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1 border border-outline-variant/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>{activeTrackingBooking.type === "medicine" ? `Order Status: ${activeTrackingBooking.status.replace("_", " ")}` : "Phlebotomist Dispatched"}</span>
              </div>
            </div>

            {/* Live status */}
            <div className="absolute top-16 left-4 right-4 z-20">
              <div className="bg-white/90 backdrop-blur border border-outline-variant/30 p-3 rounded-xl shadow-md flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-container text-white rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">
                      {activeTrackingBooking.type === "medicine" ? "motorcycle" : "biotech"}
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-outline font-bold">ETA</p>
                    <h4 className="font-bold text-on-surface">Arriving in {activeTrackingBooking.type === "medicine" ? "20" : "15"} mins</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Details bottom pane */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-outline-variant/20 p-4 space-y-3 z-20 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    alt={activeTrackingBooking.phlebotomistName || "Rider Ramesh"}
                    className="w-12 h-12 rounded-xl object-cover"
                    src={activeTrackingBooking.phlebotomistAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBNNZkMGj4I60pe8WPNWMe2lV2_-hCv1uaYCkAmsEDa1V0oauJkDG6W9CbSFNwGkN39oHcwQ8Gf0GBySyYTPXiO7_rbZrE-3qLk7eYJOFj4dqC6nVjckMqxr_n6CVVnRU--0fkAbKxuSRbe-QANE62TtQVIQ7_MFKDs7JZh6J2o7KRcAtHFlYIJCEfdcoxdRQlo3QDeFjURYDZfrVkL31ABDyPhF_VUmsn6isYDSO4hCLEzu8nqwMc9vDexa5YM4yz3RBSSbabbtTI"}
                  />
                  <span className="absolute -bottom-1.5 -right-1 bg-tertiary text-white text-[7px] px-1 rounded font-bold shadow-sm">
                    {activeTrackingBooking.type === "medicine" ? "RIDER" : "VERIFIED"}
                  </span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-headline-md text-xs text-secondary font-bold leading-tight">
                    {activeTrackingBooking.phlebotomistName || (activeTrackingBooking.type === "medicine" ? "Ramesh Delivery Rider" : "Dr. Rajesh Kumar")}
                  </h4>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-[10px] fill-primary">star</span>
                    <span className="text-[9px] text-on-surface-variant font-medium">
                      {activeTrackingBooking.phlebotomistRating || 4.9} ({activeTrackingBooking.type === "medicine" ? "200+ deliveries" : "120+ checks"})
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="w-8 h-8 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center hover:opacity-85 transition-opacity">
                    <span className="material-symbols-outlined text-sm">call</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between text-[11px]">
                <span className="font-bold text-on-surface truncate max-w-[240px]">{activeTrackingBooking.testNames.join(", ")}</span>
                <span className="font-bold text-primary flex-shrink-0">{activeTrackingBooking.id}</span>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* EDIT PRESCRIPTION MODAL */}
      {isEditReminderOpen && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">medication</span>
                <span>Edit Medication Details</span>
              </h3>
              <button
                onClick={() => {
                  setIsEditReminderOpen(false);
                  setEditingMedId(null);
                }}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>

            <form onSubmit={handleEditReminderSubmit} className="space-y-4 text-left">
              {/* Medicine Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin"
                  value={editMedName}
                  onChange={(e) => setEditMedName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Dosage & Instructions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Dosage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg, 1 tablet"
                    value={editDosage}
                    onChange={(e) => setEditDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. After Food"
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Stock Count */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Stock Count</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 30"
                  value={editStockCount}
                  onChange={(e) => setEditStockCount(e.target.value)}
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
                  checked={editIsPrivate}
                  onChange={(e) => setEditIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50"
                />
              </div>

              {/* Family Member Assignment */}
              {!editIsPrivate && familyMembers.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Assign to Family Member (Optional)</label>
                  <select
                    value={editFamilyMemberId}
                    onChange={(e) => setEditFamilyMemberId(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">Personal Reminder (Assign to self)</option>
                    {familyMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.relationship})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Timing Slots */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Schedule Slots</label>
                <div className="grid grid-cols-2 gap-2">
                  {["morning", "afternoon", "evening", "night"].map((slot) => {
                    const isSelected = editSelectedTimings.includes(slot as any);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleEditTimingToggle(slot as any)}
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
                    value={editTimeInput}
                    onChange={(e) => setEditTimeInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-outline-variant/30 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary text-on-surface"
                  >
                    {uniqueEditTimeOptions.length > 0 ? (
                      uniqueEditTimeOptions.map((opt) => (
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
                      if (editTimeInput && !editIntakeTimes.includes(editTimeInput)) {
                        setEditIntakeTimes(prev => [...prev, editTimeInput].sort());
                      }
                    }}
                    className="px-3 py-1.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all"
                  >
                    Add Time
                  </button>
                </div>
                {editIntakeTimes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {editIntakeTimes.map(t => {
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
                            onClick={() => setEditIntakeTimes(prev => prev.filter(item => item !== t))}
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

              {/* Submit Buttons */}
              <button
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all shadow-md mt-2"
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
