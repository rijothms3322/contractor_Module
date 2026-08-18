"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { AVATAR_CATEGORIES, AVATAR_ITEMS } from "../../lib/avatarLibrary";
import { MemberDashboardView } from "./MemberDashboardView";

export interface MedicalReport {
  id: string;
  patientName: string;
  note: string;
  fileName: string;
  date: string;
}

export const ProfileView: React.FC = () => {
  const { user, familyMembers, addFamilyMember, deleteFamilyMember, updateUserProfile, logout } = useApp();
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Medical Reports State
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("medimz_medical_reports");
      if (stored) return JSON.parse(stored);
    }
    return [
      { id: "rep-1", patientName: "Myself", note: "Annual Lipid Panel Results", fileName: "lipid_profile_june2026.pdf", date: "2026-06-15" },
      { id: "rep-2", patientName: "Mom", note: "Thyroid Function Test", fileName: "thyroid_report.pdf", date: "2026-07-02" }
    ];
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("medimz_medical_reports", JSON.stringify(medicalReports));
    }
  }, [medicalReports]);

  const [showAddReport, setShowAddReport] = useState(false);
  const [reportPatient, setReportPatient] = useState("Myself");
  const [reportNote, setReportNote] = useState("");
  const [reportFileName, setReportFileName] = useState("blood_test_report.pdf");

  // Profile edit fields
  console.log(user, 'user')
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "-");
  const [age, setAge] = useState(user?.age || '-');
  const [gender, setGender] = useState(user?.gender ?? "");
  const [userNickname, setUserNickname] = useState(user?.nickname || "");
  const [userDob, setUserDob] = useState(user?.dob || "");
  const [userBloodGroup, setUserBloodGroup] = useState(user?.bloodGroup ?? "");
  const [userPhone, setUserPhone] = useState(user?.phone_number || "");
  const [userConditions, setUserConditions] = useState(user?.medicalConditions.join(", ") || "");
  const [userAvatarUrl, setUserAvatarUrl] = useState(user?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=Sarah");
  const [activeUserAvatarCategory, setActiveUserAvatarCategory] = useState<"adults" | "children" | "babies" | "friends" | "pets">("adults");

  // Address add fields
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressArea, setAddressArea] = useState("");
  const [addressPincode, setAddressPincode] = useState("");

  // Family member fields
  const [famName, setFamName] = useState("");
  const [famNickname, setFamNickname] = useState("");
  const [famRel, setFamRel] = useState("Mother");
  const [famDob, setFamDob] = useState("");
  const [famAge, setFamAge] = useState(40);
  const [famGender, setFamGender] = useState("Female");
  const [famBloodGroup, setFamBloodGroup] = useState("O+");
  const [famPhone, setFamPhone] = useState("");
  const [famConditions, setFamConditions] = useState("");
  const [famColor, setFamColor] = useState("blue");
  const [famAvatarUrl, setFamAvatarUrl] = useState("https://api.dicebear.com/7.x/lorelei/svg?seed=adult-seed-2&radius=50");
  const [activeAvatarCategory, setActiveAvatarCategory] = useState<"adults" | "children" | "babies" | "friends" | "pets">("adults");

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    let calculatedAge = Number(age);
    if (userDob) {
      const birth = new Date(userDob);
      const diff = Date.now() - birth.getTime();
      calculatedAge = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    updateUserProfile({
      fullName,
      nickname: userNickname || fullName,
      dob: userDob,
      age: calculatedAge,
      gender,
      bloodGroup: userBloodGroup,
      phone_number: userPhone,
      medicalConditions: userConditions ? userConditions.split(",").map((s) => s.trim()) : [],
      avatarUrl: userAvatarUrl
    });

    setIsEditing(false);
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!famName || !famRel) return;

    let calculatedAge = Number(famAge);
    if (famDob) {
      const birth = new Date(famDob);
      const diff = Date.now() - birth.getTime();
      calculatedAge = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    addFamilyMember({
      name: famName,
      relationship: famRel,
      age: calculatedAge,
      gender: famGender,
      avatarUrl: famAvatarUrl,
      medicalConditions: famConditions ? famConditions.split(",").map(s => s.trim()) : [],
      nickname: famNickname || famName,
      dob: famDob,
      bloodGroup: famBloodGroup,
      phone: famPhone,
      medicalNotes: famConditions,
      color: famColor,
      allergies: [],
      existingDiseases: famConditions ? famConditions.split(",").map(s => s.trim()) : []
    });

    setFamName("");
    setFamNickname("");
    setFamRel("Mother");
    setFamDob("");
    setFamAge(40);
    setFamGender("Female");
    setFamBloodGroup("O+");
    setFamPhone("");
    setFamConditions("");
    setFamColor("blue");
    setFamAvatarUrl("https://api.dicebear.com/7.x/lorelei/svg?seed=adult-seed-2&radius=50");
    setShowAddMember(false);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine1 || !addressArea || !addressPincode) return;

    const newAddress = {
      id: `addr-${Date.now()}`,
      label: addressLabel,
      line1: addressLine1,
      city: addressArea,
      area: addressArea,
      pincode: addressPincode
    };

    const updatedAddresses = [...(user?.addresses || []), newAddress];
    updateUserProfile({ addresses: updatedAddresses });

    // Reset fields
    setAddressLabel("Home");
    setAddressLine1("");
    setAddressArea("");
    setAddressPincode("");
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updatedAddresses = (user?.addresses || []).filter((addr) => addr.id !== id);
    updateUserProfile({ addresses: updatedAddresses });
  };

  const handleAddReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNote) return;
    const newReport: MedicalReport = {
      id: `rep-${Date.now()}`,
      patientName: reportPatient,
      note: reportNote,
      fileName: reportFileName || "medical_document.pdf",
      date: new Date().toISOString().split("T")[0]
    };
    setMedicalReports(prev => [newReport, ...prev]);
    setReportPatient("Myself");
    setReportNote("");
    setReportFileName("blood_test_report.pdf");
    setShowAddReport(false);
  };

  const handleDeleteReport = (id: string) => {
    setMedicalReports(prev => prev.filter(r => r.id !== id));
  };

  const selectedMember = familyMembers.find(f => f.id === selectedMemberId);

  if (selectedMember) {
    return (
      <MemberDashboardView
        member={selectedMember}
        onBack={() => setSelectedMemberId(null)}
      />
    );
  }

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-300">

      {/* 1. Sarah's Profile Details Card */}
      <section className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex justify-between gap-4 items-center text-left">
            <img
              alt={user?.fullName || "User Profile"}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-container shadow-md"
              src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBCs_YGgPk7VOsahsNOdDGaNvTVuV8ZJljMuiD4GSAvQV802koXWwDy1aqg24M8w4jkBOlONbu5i26SUif3gi5LPSJdJTIs"}
            />
            <div>
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-headline-md text-xl text-secondary font-bold leading-tight truncate">
                  {user?.fullName || "-"}
                </h2>

                {user?.nickname && user.nickname !== user?.fullName && (
                  <span className="shrink-0 bg-primary/5 text-primary text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {user.nickname}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 font-body-md text-xs text-on-surface-variant mt-0.5">
                {user?.age && <span>
                  • Age: {user?.age}
                </span>}

                {user?.gender && <span>
                  • Gender: {user?.gender}
                </span>}

                {userBloodGroup && <span>
                  • Blood Type:{" "}
                  <span className="font-bold text-secondary">
                    {userBloodGroup}
                  </span>
                </span>}
              </div>
              {user?.email && (
                <div className="font-body-md text-[11px] text-primary mt-1 flex items-center gap-1 min-w-0">
                  <span className="material-symbols-outlined text-[13px] shrink-0">
                    mail
                  </span>
                  <span className="truncate" title={user.email}>
                    {user.email}
                  </span>
                </div>
              )}

              {user?.phone_number && (
                <div className="font-body-md text-[11px] text-primary mt-1 flex items-center gap-1 min-w-0">
                  <span className="material-symbols-outlined text-[13px] shrink-0">
                    phone
                  </span>
                  <span className="truncate" title={user.phone_number}>
                    {user.phone_number}
                  </span>
                </div>
              )}

              <div className="flex gap-1.5 flex-wrap mt-2">
                {/* {user?.medicalConditions.map((cond, idx) => (
                  <span key={idx} className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {cond}
                  </span>
                ))} */}
                {user?.medicalConditions.map((condition, idx) => (
                  <span
                    key={`${condition}-${idx}`}
                    className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setFullName(user?.fullName || "");
                setAge(user?.age || '');
                setGender(user?.gender || '');
                setUserNickname(user?.nickname || '');
                setUserDob(user?.dob || "");
                setUserBloodGroup(user?.bloodGroup || "");
                setUserPhone(user?.phone_number || "");
                setUserConditions(user?.medicalConditions.join(", ") || "");
                setUserAvatarUrl(user?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=Sarah");
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-secondary text-white font-bold rounded-xl text-xs hover:bg-opacity-95 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>Edit Profile</span>
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 bg-surface-container text-primary font-bold rounded-xl text-xs hover:bg-surface-container-high transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </section>

      {/* 2. Family Health Sync Dashboard (Mom & Dad Card representation) */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-base text-secondary font-bold">Family Synchronization Hub</h3>
          <button
            onClick={() => setShowAddMember(true)}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>Sync Member</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {familyMembers.map((fam) => {
            const BORDER_COLORS: Record<string, string> = {
              blue: "border-l-blue-500",
              green: "border-l-emerald-500",
              purple: "border-l-purple-500",
              orange: "border-l-orange-500",
              pink: "border-l-pink-500",
              teal: "border-l-teal-500",
              grey: "border-l-slate-500"
            };
            return (
              <div
                key={fam.id}
                onClick={() => setSelectedMemberId(fam.id)}
                className={`p-5 glass-card rounded-2xl border border-outline-variant/20 border-l-4 ${BORDER_COLORS[fam.color || "blue"] || "border-l-blue-500"} flex flex-col justify-between gap-4 hover:border-secondary/35 cursor-pointer hover:scale-[1.01] transition-all shadow-sm relative group`}
              >
                {/* Delete Local Profile Card option */}
                {fam.color !== "purple" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete ${fam.name}?`)) {
                        deleteFamilyMember(fam.id);
                      }
                    }}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/80 hover:bg-red-50 hover:text-red-600 border border-outline-variant/20 flex items-center justify-center text-outline transition-colors z-20"
                    title="Delete Family Member"
                  >
                    <span className="material-symbols-outlined text-xs">delete</span>
                  </button>
                )}
                <div className="flex gap-3 items-start">
                  <img
                    alt={fam.name}
                    className="w-12 h-12 rounded-xl object-cover border border-outline-variant/30"
                    src={fam.avatarUrl}
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-label-md text-sm text-secondary font-bold leading-tight">{fam.nickname || fam.name}</h4>
                      <span className="bg-secondary-container/10 text-on-secondary-container text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        {fam.relationship}
                      </span>
                    </div>
                    <p className="font-body-md text-[10px] text-on-surface-variant mt-0.5">
                      Age: {fam.age} • {fam.gender}
                    </p>
                    <div className="flex gap-1 flex-wrap mt-2">
                      {fam.medicalConditions.map((cond, idx) => (
                        <span key={idx} className="bg-surface-container text-outline text-[8px] px-1.5 py-0.5 rounded font-bold">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress visual Adherence */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-on-surface-variant font-label-sm">Dosing Compliance</span>
                    <span className="text-tertiary">{fam.adherenceRate || 100}%</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-tertiary rounded-full transition-all duration-500"
                      style={{ width: `${fam.adherenceRate || 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Saved Address Book List */}
      <section className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4 pb-16">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-base text-secondary font-bold">Saved Home & Office Addresses</h3>
          <button
            onClick={() => setShowAddAddress(true)}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">add_location</span>
            <span>Add Address</span>
          </button>
        </div>

        <div className="space-y-2">
          {user?.addresses.map((addr) => (
            <div key={addr.id} className="p-3.5 bg-surface-container-low rounded-xl flex gap-3 border border-outline-variant/15 hover:bg-surface-container transition-colors items-center justify-between">
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-secondary-container/20 text-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">
                    {addr.label === "Home" ? "home" : "business"}
                  </span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-label-md text-xs text-secondary font-bold leading-none">{addr.label}</h4>
                    <span className="bg-primary/5 text-primary text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {addr.area}
                    </span>
                  </div>
                  <p className="font-body-md text-[10px] text-on-surface-variant mt-1 leading-relaxed">
                    {addr.line1}, {addr.area}, Pincode: {addr.pincode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteAddress(addr.id)}
                className="text-on-surface-variant/40 hover:text-red-500 transition-colors p-1"
                title="Delete Address"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3.8 Saved Medical Reports Section */}
      <section className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-base text-secondary font-bold">Medical Reports</h3>
          <button
            onClick={() => setShowAddReport(true)}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">upload_file</span>
            <span>Add Report</span>
          </button>
        </div>

        <div className="space-y-2 text-left">
          {medicalReports.map((rep) => (
            <div key={rep.id} className="p-3.5 bg-surface-container-low rounded-xl flex gap-3 border border-outline-variant/15 hover:bg-surface-container transition-colors items-center justify-between">
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">description</span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-label-md text-xs text-secondary font-bold leading-none">{rep.note}</h4>
                    <span className="bg-secondary/10 text-secondary text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      For: {rep.patientName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-outline font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
                      {rep.fileName}
                    </span>
                    <span className="text-[9px] text-outline">Uploaded: {rep.date}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteReport(rep.id)}
                className="text-on-surface-variant/40 hover:text-red-500 transition-colors p-1"
                title="Delete Report"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          ))}
          {medicalReports.length === 0 && (
            <p className="text-xs text-outline italic text-center py-4 w-full">No medical reports uploaded yet.</p>
          )}
        </div>
      </section>

      {/* 3.9 ADD MEDICAL REPORT MODAL */}
      {showAddReport && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">upload_file</span>
                <span>Add Medical Report</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddReport(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleAddReportSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Who's report is this?</label>
                <select
                  value={reportPatient}
                  onChange={(e) => setReportPatient(e.target.value)}
                  className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Myself">Myself ({user?.nickname || user?.fullName || "Sarah"})</option>
                  {familyMembers.map((fm) => (
                    <option key={fm.id} value={fm.nickname || fm.name}>
                      {fm.nickname || fm.name} ({fm.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Report Description / Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Blood Sugar Report, Lipid Panel"
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. blood_test_july.pdf"
                  value={reportFileName}
                  onChange={(e) => setReportFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md mt-2"
              >
                Upload & Save Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3.5 ADD ADDRESS MODAL */}
      {showAddAddress && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">add_location_alt</span>
                <span>Add Address</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Address Label</label>
                <select
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Parent's House">Parent's House</option>
                  <option value="Doctor's Clinic">Doctor's Clinic</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Street Address (Line 1)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Block A, Green Glen Layout"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Area / Locality</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune, Bangalore"
                    value={addressArea}
                    onChange={(e) => setAddressArea(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 411001"
                    value={addressPincode}
                    onChange={(e) => setAddressPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md mt-2"
              >
                Add Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD FAMILY MEMBER MODAL */}
      {/* 1.5 EDIT USER PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">manage_accounts</span>
                <span>Edit Personal Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 text-left">
              {/* Name & Nickname */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Nickname</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah"
                    value={userNickname}
                    onChange={(e) => setUserNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Age & DOB */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    value={userDob}
                    onChange={(e) => setUserDob(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Gender & Blood Group */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Blood Group</label>
                  <select
                    value={userBloodGroup}
                    onChange={(e) => setUserBloodGroup(e.target.value)}
                    className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
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
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Medical Conditions (Comma Separated)</label>
                  <textarea
                    placeholder="e.g. Hypertension, Pre-Diabetes"
                    value={userConditions}
                    onChange={(e) => setUserConditions(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary h-14 resize-none"
                  />
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
                      onClick={() => setActiveUserAvatarCategory(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors flex-shrink-0 ${activeUserAvatarCategory === cat.id
                        ? "bg-secondary/15 text-secondary"
                        : "bg-white text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 bg-white border border-outline-variant/10 rounded-xl">
                  {AVATAR_ITEMS.filter((av) => av.category === activeUserAvatarCategory).map((av) => {
                    const isSelected = userAvatarUrl === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setUserAvatarUrl(av.url)}
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

      {showAddMember && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">group_add</span>
                <span>Sync Family Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-left">
              {/* Name & Nickname */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thomas D'Souza"
                    value={famName}
                    onChange={(e) => setFamName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Nickname</label>
                  <input
                    type="text"
                    placeholder="e.g. Dad, Mom"
                    value={famNickname}
                    onChange={(e) => setFamNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Relationship & DOB */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Relationship</label>
                  <select
                    value={famRel}
                    onChange={(e) => setFamRel(e.target.value)}
                    className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
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
                    value={famDob}
                    onChange={(e) => setFamDob(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Gender & Blood Group */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Gender</label>
                  <select
                    value={famGender}
                    onChange={(e) => setFamGender(e.target.value)}
                    className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Blood Group</label>
                  <select
                    value={famBloodGroup}
                    onChange={(e) => setFamBloodGroup(e.target.value)}
                    className="w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone & Notes */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={famPhone}
                    onChange={(e) => setFamPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Medical Notes / Conditions</label>
                  <textarea
                    placeholder="e.g. Penicillin allergy, diabetes, high blood pressure"
                    value={famConditions}
                    onChange={(e) => setFamConditions(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary h-14 resize-none"
                  />
                </div>
              </div>

              {/* Identification Color Picker */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider font-bold">Personalized Accent Color</label>
                <div className="flex gap-2">
                  {["blue", "green", "purple", "orange", "pink", "teal", "grey"].map((c) => {
                    const isSelected = famColor === c;
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
                        onClick={() => setFamColor(c)}
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

              {/* Avatar Selector Grid */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Select Representative Avatar</label>

                {/* Categories */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {AVATAR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveAvatarCategory(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors flex-shrink-0 ${activeAvatarCategory === cat.id
                        ? "bg-secondary/15 text-secondary"
                        : "bg-white text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Avatar items */}
                <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-white border border-outline-variant/10 rounded-xl">
                  {AVATAR_ITEMS.filter((av) => av.category === activeAvatarCategory).map((av) => {
                    const isSelected = famAvatarUrl === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setFamAvatarUrl(av.url)}
                        className={`w-11 h-11 rounded-full p-0.5 border-2 transition-all flex items-center justify-center overflow-hidden flex-shrink-0 ${isSelected ? "border-primary scale-110 shadow-sm" : "border-transparent hover:scale-105"
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
                type="submit"
                disabled={!famName}
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md mt-2 disabled:opacity-50"
              >
                Establish Health Sync
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
