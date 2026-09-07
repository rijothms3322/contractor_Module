"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { FamilyMember, Medicine, Reminder, Booking, HealthReport } from "../../lib/mockData";
import { AVATAR_CATEGORIES, AVATAR_ITEMS } from "../../lib/avatarLibrary";
import { medicineNewService } from "@/services/medicineService";

interface MemberDashboardViewProps {
  member: FamilyMember;
  onBack: () => void;
}

export const MemberDashboardView: React.FC<MemberDashboardViewProps> = ({ member, onBack }) => {
  console.log(member, 'member')
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
  console.log(familyMembers, 'familyMembers')
  console.log(medicines, 'medi')
  console.log(user, 'user')
  const [activeTab, setActiveTab] = useState<"overview" | "medicines" | "orders" | "labs" | "reports" | "appointments" | "timeline" | "history">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMedsModal, setShowAddMedsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Profile Edit fields
  const [editName, setEditName] = useState(member.name);
  const [editNickname, setEditNickname] = useState(member.nickname || member.name);
  const [editRel, setEditRel] = useState(member.relationship);
  const [editDob, setEditDob] = useState(member.dob || "");
  const [editAge, setEditAge] = useState(member.age);
  const [editGender, setEditGender] = useState(member.gender);
  const [editBloodGroup, setEditBloodGroup] = useState(member.bloodGroup || "O+");
  const [editPhone, setEditPhone] = useState(member.phone || "");
  const [editConditions, setEditConditions] = useState(member.medicalConditions.join(", "));
  const [editColor, setEditColor] = useState(member.color || "blue");
  const [editAvatarUrl, setEditAvatarUrl] = useState(member.avatarUrl);
  const [activeEditAvatarCategory, setActiveEditAvatarCategory] = useState<"adults" | "children" | "babies" | "friends" | "pets">("adults");
  const [freshMember, setFreshMember] = useState<FamilyMember | null>(null);
  const [memberMeds, setMemberMeds] = useState<Medicine[]>([]);
  console.log(memberMeds, 'memberMeds')

  // Form states for quick action: Add Medicine
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFreq, setMedFreq] = useState("Daily");
  const [medInst, setMedInst] = useState("Take after food");

  // 1. FILTERING GLOBAL CONTEXT RECORDS FOR THIS MEMBER

  const memberReminders = useMemo(() => {
    return reminders.filter(r => r.familyMemberId === member.id);
  }, [reminders, member.id]);

  // const memberMeds = useMemo(() => {
  //   return medicines.filter(m => m.familyMemberId === member.id);
  // }, [medicines, member.id]);  

  const memberBookings = useMemo(() => {
    // Match bookings by patientName (e.g. Dad, Mom, Grandma) or direct comparison
    return bookings.filter(b => b.patientName?.toLowerCase() === member.nickname?.toLowerCase() || b.patientName?.toLowerCase() === member.name.toLowerCase());
  }, [bookings, member]);

  const memberReports = useMemo(() => {
    return reports.filter(r => r.testName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [reports, searchQuery]);

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

  // Chronological Health History Feed
  const memberHistory = useMemo(() => {
    return [
      { date: "2026-07-03", title: "Routine checkup completed with Dr. Shalini Sen", category: "appointment" },
      { date: "2026-07-02", title: "Blood Sugar Test booked successfully", category: "lab" },
      { date: "2026-07-01", title: "New Prescription uploaded for Metformin 500mg", category: "report" },
      { date: "2026-06-28", title: "Adherence Compliance reached 98% this week", category: "milestone" }
    ];
  }, []);

  const handleAddMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDosage) return;
    addMedicine({
      name: medName,
      dosage: medDosage,
      instructions: medInst,
      timings: medFreq === "Twice Daily" ? ["morning", "evening"] : ["morning"],
      frequency: medFreq === "Weekly" ? "weekly" : "daily",
      startDate: new Date().toISOString().split("T")[0]
    }, member.id);
    setMedName("");
    setMedDosage("");
    setShowAddMedsModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) return;

    let calculatedAge = Number(editAge);
    if (editDob) {
      const birth = new Date(editDob);
      const diff = Date.now() - birth.getTime();
      calculatedAge = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    updateFamilyMember(member.id, {
      name: editName,
      nickname: editNickname || editName,
      relationship: editRel,
      dob: editDob,
      age: calculatedAge,
      gender: editGender,
      bloodGroup: editBloodGroup,
      phone: editPhone,
      medicalConditions: editConditions ? editConditions.split(",").map(s => s.trim()) : [],
      color: editColor,
      avatarUrl: editAvatarUrl
    });

    setShowEditModal(false);
  };

  useEffect(() => {
    console.log('call 1')
  const fetchMeds = async () => {

    console.log('call 2',member.id)
    try {
      const allMeds = await medicineNewService.getMedicines(member.id);
      console.log(allMeds, 'filtered')
      setMemberMeds(allMeds);
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    }
  };
  fetchMeds();
}, []);

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
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center border border-outline-variant/10 text-secondary hover:text-primary transition-colors"
                title="Edit Profile"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
              </button>
            </div>
            <p className="font-body-md text-xs text-on-surface-variant">Full Name: {member.name} • {member.gender}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/60 p-2 rounded-xl border border-outline-variant/10 text-left">
                <span className="block text-[8px] font-bold text-outline uppercase">Age</span>
                <span className="text-xs font-bold text-secondary">{member.age} yrs</span>
              </div>
              <div className="bg-white/60 p-2 rounded-xl border border-outline-variant/10 text-left">
                <span className="block text-[8px] font-bold text-outline uppercase">Blood Type</span>
                <span className="text-xs font-bold text-secondary">{member.bloodGroup}</span>
              </div>
              <div className="bg-white/60 p-2 rounded-xl border border-outline-variant/10 text-left">
                <span className="block text-[8px] font-bold text-outline uppercase">Height</span>
                <span className="text-xs font-bold text-secondary">{'-'}</span>
              </div>
              <div className="bg-white/60 p-2 rounded-xl border border-outline-variant/10 text-left">
                <span className="block text-[8px] font-bold text-outline uppercase">Weight</span>
                <span className="text-xs font-bold text-secondary">{"-"}</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-on-surface-variant space-y-1 text-left">
              <p><strong className="text-secondary">Medical Conditions:</strong> {member.medicalConditions.join(", ") || "None declared"}</p>
              <p><strong className="text-secondary">Allergies:</strong> Penicillin, Shellfish</p>
              <p><strong className="text-secondary">Emergency Contact:</strong> +91 98765 43201 (Primary)</p>
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
          <span className="text-lg font-extrabold leading-none">{memberMeds.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("labs")}
          className={`p-3.5 rounded-2xl border text-left shadow-xs transition-all ${activeTab === "labs" ? "bg-primary text-on-primary border-primary" : "bg-white text-secondary border-outline-variant/15 hover:bg-surface-container"
            }`}
        >
          <span className="material-symbols-outlined text-lg">science</span>
          <span className="block text-xs font-bold mt-1">Lab Tests</span>
          <span className="text-lg font-extrabold leading-none">{memberBookings.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("appointments")}
          className={`p-3.5 rounded-2xl border text-left shadow-xs transition-all ${activeTab === "appointments" ? "bg-primary text-on-primary border-primary" : "bg-white text-secondary border-outline-variant/15 hover:bg-surface-container"
            }`}
        >
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          <span className="block text-xs font-bold mt-1">Appointments</span>
          <span className="text-lg font-extrabold leading-none">{memberAppointments.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`p-3.5 rounded-2xl border text-left shadow-xs transition-all ${activeTab === "reports" ? "bg-primary text-on-primary border-primary" : "bg-white text-secondary border-outline-variant/15 hover:bg-surface-container"
            }`}
        >
          <span className="material-symbols-outlined text-lg">description</span>
          <span className="block text-xs font-bold mt-1">Health Reports</span>
          <span className="text-lg font-extrabold leading-none">{memberReports.length}</span>
        </button>

        <div className="p-3.5 rounded-2xl bg-white border border-outline-variant/15 text-left shadow-xs col-span-2 md:col-span-1">
          <span className="material-symbols-outlined text-tertiary text-lg">favorite</span>
          <span className="block text-xs font-bold mt-1 text-secondary">Health Score</span>
          <span className="text-lg font-extrabold leading-none text-tertiary">88/100</span>
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
          {["overview", "medicines", "orders", "labs", "reports", "appointments", "timeline", "history"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex-shrink-0 ${activeTab === t
                ? "bg-secondary text-on-secondary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/10"
                }`}
            >
              {t}
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
                <span>Today's Reminder Slot</span>
              </h4>
              <button onClick={() => setActiveTab("timeline")} className="text-[10px] font-bold text-primary hover:underline">View Timeline</button>
            </div>
            <div className="space-y-2">
              {memberReminders.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3 bg-surface-container-low rounded-xl flex justify-between items-center border border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">pill</span>
                    <span className="text-xs font-bold text-secondary">{r.medicineName}</span>
                  </div>
                  <span className="text-[9px] bg-secondary-container/10 text-secondary font-bold px-2 py-0.5 rounded uppercase">{r.timingSlot}</span>
                </div>
              ))}
              {memberReminders.length === 0 && (
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
              {memberHistory.slice(0, 3).map((h, i) => (
                <div key={i} className="relative pl-3">
                  <div className="absolute -left-[16px] top-1.5 w-2 h-2 rounded-full bg-secondary" />
                  <span className="block text-[8px] font-bold text-outline">{h.date}</span>
                  <span className="text-[10px] font-bold text-secondary leading-tight block">{h.title}</span>
                </div>
              ))}
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
              onClick={() => setShowAddMedsModal(true)}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>Add Medicine</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {memberMeds.map((med) => (
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
                  <p><strong className="text-secondary">Frequency:</strong> {med.timings.join(", ") || "Once Daily"}</p>
                </div>
                <div className="flex justify-between items-center border-t border-outline-variant/10 pt-2.5 mt-1">
                  <span className="text-[9px] text-tertiary font-bold">Refill: 5 days left</span>
                  <button className="bg-secondary text-on-secondary px-3 py-1 rounded-lg text-[9px] font-bold shadow-xs hover:opacity-90">
                    Reorder Meds
                  </button>
                </div>
              </div>
            ))}
            {memberMeds.length === 0 && (
              <p className="text-xs text-on-surface-variant py-8 text-center col-span-2">No active medicines found matching the search query</p>
            )}
          </div>
        </div>
      )}

      {/* ORDERS SUBSECTION */}
      {activeTab === "orders" && (
        <div className="space-y-3">
          <h4 className="font-headline-md text-xs text-secondary font-bold">Medicine Orders History</h4>
          <div className="space-y-2">
            {memberOrders.map((o) => (
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
            ))}
          </div>
        </div>
      )}

      {/* LABS SUBSECTION */}
      {activeTab === "labs" && (
        <div className="space-y-3">
          <h4 className="font-headline-md text-xs text-secondary font-bold">Laboratory Diagnostic Bookings</h4>
          <div className="space-y-2">
            {memberBookings.map((b) => (
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
                  <button className="px-3 py-1 bg-surface-container text-secondary text-[9px] font-bold rounded-lg">
                    Rebook Test
                  </button>
                  <button className="px-3 py-1 bg-primary text-on-primary text-[9px] font-bold rounded-lg">
                    Download Report
                  </button>
                </div>
              </div>
            ))}
            {memberBookings.length === 0 && (
              <p className="text-xs text-on-surface-variant py-8 text-center">No lab bookings found for this family member</p>
            )}
          </div>
        </div>
      )}

      {/* REPORTS SUBSECTION */}
      {activeTab === "reports" && (
        <div className="space-y-3">
          <h4 className="font-headline-md text-xs text-secondary font-bold">Uploaded Medical Records & PDF Reports</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {memberReports.map((rep) => (
              <div key={rep.id} className="p-3 bg-white border border-outline-variant/15 rounded-xl flex gap-3 items-center">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">picture_as_pdf</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-headline-md text-xs text-secondary font-bold truncate">{rep.testName}</h5>
                  <p className="text-[9px] text-on-surface-variant truncate mt-0.5">{rep.date} • AI summarized</p>
                </div>
                <div className="flex gap-1">
                  <button className="w-7 h-7 bg-surface-container hover:bg-surface-container-high rounded-full flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                  </button>
                  <button className="w-7 h-7 bg-surface-container hover:bg-surface-container-high rounded-full flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPOINTMENTS SUBSECTION */}
      {activeTab === "appointments" && (
        <div className="space-y-3">
          <h4 className="font-headline-md text-xs text-secondary font-bold">Doctor Appointments List</h4>
          <div className="space-y-2.5">
            {memberAppointments.map((apt) => (
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
            ))}
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
            {memberHistory.map((h, idx) => (
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
            ))}
          </div>
        </div>
      )}

      {/* 6. FLOATING QUICK ACTION BUTTON (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          type="button"
          onClick={() => setShowAddMedsModal(true)}
          className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl font-bold">add</span>
        </button>
      </div>

      {/* Add Medicine Modal */}
      {showAddMedsModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">medication</span>
                <span>Add Medicine</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMedsModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMedSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase">Dosage</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 mg"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase">Frequency</label>
                <select
                  value={medFreq}
                  onChange={(e) => setMedFreq(e.target.value)}
                  className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs focus:outline-none focus:border-primary"
                >
                  <option value="Daily">Daily</option>
                  <option value="Twice Daily">Twice Daily (Morning & Night)</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md mt-2"
              >
                Configure Medication
              </button>
            </form>
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
