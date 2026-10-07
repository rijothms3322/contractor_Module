"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { AVATAR_CATEGORIES, AVATAR_ITEMS, AvatarItem } from "../../lib/avatarLibrary";
import { MemberDashboardView } from "./MemberDashboardView";
import OCRUploader from "../OCRUploader";
import { documentService } from "@/services/documentService";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { nicknameService } from "@/services/nicknameService";
import { authService } from "@/services/authService";

const TEST_CATEGORY = [
  { key: "lab_report", label: "Lab Report" },
  { key: "prescription", label: "Prescription" },
  { key: "medical_report", label: "Medical Report" },
  { key: "discharge_summary", label: "Discharge Summary" },
  { key: "radiology", label: "Radiology" },
  { key: "pathology", label: "Pathology" },
  { key: "other", label: "Other" },
];

export const ProfileView: React.FC = () => {
  const { user, familyMembers, addFamilyMember, leaveFamily, activeFamily, adherencePercentage, familyWellnessScore, joinFamily, renameFamily, removeFamilyMember, transferAdminRights, regenerateFamilyCode, createFamily, disbandFamily, deleteFamilyMember, updateUserProfile, logout } = useApp();
  // console.log(familyMembers, 'familyMembers')
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  // console.log(user, 'user data')
  // Documents state
  const [documents, setDocuments] = useState<any[]>([]);
  console.log(documents, 'documents')
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);

  // OCR / upload states
  const [ocrReportData, setOcrReportData] = useState<any>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);

  const [showAddReport, setShowAddReport] = useState(false);
  const [reportPatient, setReportPatient] = useState("Myself");
  const [reportTestCategory, setReportTestCategory] = useState<string>("lab_report");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [isPrivateReport, setIsPrivateReport] = useState(false);
  const [reportNote, setReportNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);


  // Profile edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "-");
  const [age, setAge] = useState(user?.age || '-');
  const [gender, setGender] = useState(user?.gender ?? "");
  const [userNickname, setUserNickname] = useState(user?.nickname || "");
  const [userDob, setUserDob] = useState(user?.dob || "");
  const [userBloodGroup, setUserBloodGroup] = useState(user?.bloodGroup ?? "");
  const [userPhone, setUserPhone] = useState(user?.phone_number || "");
  const [userConditions, setUserConditions] = useState(user?.medicalConditions.join(", ") || "");
  const [userAvatarUrl, setUserAvatarUrl] = useState(user?.avatarUrl || "/avatars/senior-01.png");
  const [activeUserAvatarCategory, setActiveUserAvatarCategory] = useState<AvatarItem["category"]>("senior");

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
  const [famAvatarUrl, setFamAvatarUrl] = useState("/avatars/senior-01.png");
  const [activeAvatarCategory, setActiveAvatarCategory] = useState<AvatarItem["category"]>("senior");


  // Family Sync Hub states
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [joinFamilyId, setJoinFamilyId] = useState("");
  const [verificationFamily, setVerificationFamily] = useState<{ id: string; name: string; memberCount: number; adminName: string; familyCode: string; adminId: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isJoiningFamily, setIsJoiningFamily] = useState(false);
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const [isEditingFamilyName, setIsEditingFamilyName] = useState(false);
  const [editedFamilyName, setEditedFamilyName] = useState("");
  const [isRenamingFamily, setIsRenamingFamily] = useState(false);
  const [isRegeneratingCode, setIsRegeneratingCode] = useState(false);
  const [isTransferringAdmin, setIsTransferringAdmin] = useState<string | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState<string | null>(null);
  const [isDisbanding, setIsDisbanding] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [nicknameMap, setNicknameMap] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dontShareMedicalRecords, setDontShareMedicalRecords] = useState(false);
  const [copiedFamilyCode, setCopiedFamilyCode] = useState(false);
  const [editingNicknameMemberId, setEditingNicknameMemberId] = useState<string | null>(null);
  const [editingNicknameValue, setEditingNicknameValue] = useState<string>("");

  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // --- Profile handlers ---
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
      nickname: userNickname,
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

  // --- Family handlers ---
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
      existingDiseases: famConditions ? famConditions.split(",").map(s => s.trim()) : [],
      isCustom: true
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
    setFamAvatarUrl("/avatars/senior-01.png");
    setShowAddMember(false);
  };

  // --- Address handlers ---
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

  // 
  const handleCopyFamilyCode = async (code: string) => {
    if (!code) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedFamilyCode(true);
      setTimeout(() => setCopiedFamilyCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy family code:", err);
      alert("Could not copy code. Please copy manually: " + code);
    }
  };

  // --- Document fetching ---
  const fetchDocuments = async () => {
    if (!user?.id) return;
    setLoadingDocuments(true);
    try {
      const docs = await documentService.getUserDocuments(user.id);
      // console.log("📂 User documents:", docs);
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user?.id]);

  useEffect(() => {
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (
        target?.type === "file" &&
        target.files &&
        target.files.length > 0
      ) {
        setIsUploading(true);
      }
    };

    document.addEventListener("change", handleChange, true);
    return () => document.removeEventListener("change", handleChange, true);
  }, []);

  useEffect(() => {
    setPreviewLoading(false);
    setPreviewError(false);
  }, [selectedDocument]);
  useEffect(() => {
    if (selectedDocument) {
      setPreviewLoading(true);
      setPreviewError(false);
      console.log('🔍 Preview URL:', selectedDocument.previewUrl);
    }
  }, [selectedDocument]);

  // Load per-owner dynamic nicknames into a lookup map.
  useEffect(() => {
    const ownerId = user?.id;
    if (!ownerId || !isSupabaseConfigured) return;
    if (familyMembers.length === 0) return;

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

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, familyMembers.length]);

  // --- Delete document (placeholder – implement real deletion if needed) ---
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await documentService.deleteDocument(documentId);
      fetchDocuments()
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete document.");
    }
  };

  const selectedMember = familyMembers.find(f => f.id === selectedMemberId);

  if (selectedMember) {
    const memberWithNickname = {
      ...selectedMember,
      nickname: nicknameMap[selectedMember.id] || selectedMember.nickname || selectedMember.name,
    };

    return (
      <MemberDashboardView
        member={memberWithNickname}
        onBack={() => setSelectedMemberId(null)}
      />
    );
  }

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-300">

      {/* 1. Profile Card */}
      <section className="flex flex-col gap-3 glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20">

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
                {user?.age && <span>• Age: {user?.age}</span>}
                {user?.gender && <span>• Gender: {user?.gender}</span>}
                {userBloodGroup && <span>• Blood Type: <span className="font-bold text-secondary">{userBloodGroup}</span></span>}
              </div>
              {user?.email && (
                <div className="font-body-md text-[11px] text-primary mt-1 flex items-center gap-1 min-w-0">
                  <span className="material-symbols-outlined text-[13px] shrink-0">mail</span>
                  <span className="truncate" title={user.email}>{user.email}</span>
                </div>
              )}
              {user?.phone_number && (
                <div className="font-body-md text-[11px] text-primary mt-1 flex items-center gap-1 min-w-0">
                  <span className="material-symbols-outlined text-[13px] shrink-0">phone</span>
                  <span className="truncate" title={user.phone_number}>{user.phone_number}</span>
                </div>
              )}
              <div className="flex gap-1.5 flex-wrap mt-2">
                {user?.medicalConditions.map((condition, idx) => (
                  <span key={`${condition}-${idx}`} className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
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
                setUserAvatarUrl(user?.avatarUrl || "/avatars/senior-01.png");
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-secondary text-white font-bold rounded-xl text-xs hover:bg-opacity-95 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">edit</span> Edit Profile
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 bg-surface-container text-primary font-bold rounded-xl text-xs hover:bg-surface-container-high transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-3">
          <button
            onClick={() => {
              setDeleteConfirmText("");
              setShowDeleteAccount(true);
            }}
            className="px-8 py-2 bg-red-100 text-red-500 font-bold rounded-xl text-sm hover:bg-opacity-95 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
            <span>Delete Account</span>
          </button>
        </div>
      </section>

      {/* 2. Family Sync Dashboard */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-base text-secondary font-bold">Family Synchronization Hub</h3>
          {/* <button
            onClick={() => setShowAddMember(true)}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span> Sync Member
          </button> */}
          <button
            onClick={() => setShowSyncModal(true)}
            className="text-xs text-secondary font-bold hover:underline flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">diversity_1</span> Family Sync
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
                {fam.isCustom && (
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
                      <h4 className="font-label-md text-sm text-secondary font-bold leading-tight">
                        {nicknameMap[fam.id] || fam.nickname || fam.name}
                      </h4>
                      <span className="bg-secondary-container/10 text-on-secondary-container text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        {fam.relationship}
                      </span>
                      {!fam.isCustom && (<span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        {"Family Sync"}
                      </span>)}
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

      {/* 3. Saved Address Book */}
      <section className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4 pb-16">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-base text-secondary font-bold">Saved Home & Office Addresses</h3>
          <button
            onClick={() => setShowAddAddress(true)}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">add_location</span> Add Address
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

      {/* 4. Documents List */}
      <section className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4">
        <div className="flex flex-col gap-1">
          {/* Row 1: Title + Action button */}
          <div className="flex justify-between items-start gap-3">
            <h3 className="font-headline-md text-base text-secondary font-bold">
              My Health Records
            </h3>
            <button
              onClick={() => setShowAddReport(true)}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 shrink-0"
            >
              <span className="material-symbols-outlined text-sm font-bold">upload_file</span>
              <span>Add Report</span>
            </button>
          </div>

          {/* Row 2: Subtitle */}
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Keep your personal and shared medical documents safe and organized here.
          </p>
        </div>

        <div className="space-y-2 text-left">
          {loadingDocuments ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
              <p className="text-xs text-outline mt-2">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <p className="text-xs text-outline italic text-center py-4 w-full">No documents uploaded yet.</p>
          ) : (
            documents.map((doc) => {
              console.log(doc.reportCategory, 'doc.reportCategory')
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
                  className="p-3.5 bg-surface-container-low rounded-xl flex gap-3 border border-outline-variant/15 hover:bg-surface-container transition-colors items-center justify-between cursor-pointer"
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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id);
                    }}
                    className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-outline hover:text-red-500 transition-colors ml-1 disabled:opacity-50 shrink-0"
                    title="Delete Document"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 5. ADD DOCUMENT MODAL */}
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
                onClick={() => {
                  setShowAddReport(false);
                  setReportPatient("Myself");
                  setReportDate(new Date().toISOString().split("T")[0]);
                  setIsPrivateReport(false);
                  setReportNote("");
                  setIsUploading(false);
                }}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4 text-left">
              {/* Who's report? */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Who's report is this?</label>
                <select
                  value={reportPatient}
                  onChange={(e) => setReportPatient(e.target.value)}
                  disabled={isUploading}
                  className={`w-full px-2 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <option value="Myself">Myself ({user?.nickname || user?.fullName})</option>
                  {familyMembers.map((fm) => (
                    <option key={fm.id} value={fm.id}>
                      {nicknameMap[fm.id] || fm.nickname || fm.name} ({fm.relationship})
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Category Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">
                  Test Category
                </label>

                <select
                  value={reportTestCategory}
                  onChange={(e) => setReportTestCategory(e.target.value)}
                  disabled={isUploading}
                  className={`w-full px-3 py-2.5 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {TEST_CATEGORY.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Test Date</label>
                <input
                  type="date"
                  value={reportDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setReportDate(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  disabled={isUploading}
                  className={`w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div>

              {/* Report Description / Note */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">
                  Report Description / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual Blood Sugar Report, Lipid Panel"
                  value={reportNote}
                  disabled={isUploading}
                  onChange={(e) => setReportNote(e.target.value)}
                  className={`w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div>

              {/* Keep Private Checkbox */}
              <div className="space-y-1 px-2 py-1 rounded-2xl bg-orange-50/30 border border-orange-200/40 flex items-center! justify-between">
                <label className="block mt-1 text-[10px] font-bold text-secondary uppercase tracking-wider">
                  Keep as Private
                </label>
                <input
                  type="checkbox"
                  disabled={isUploading}
                  checked={isPrivateReport}
                  onChange={(e) => setIsPrivateReport(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50 shrink-0"
                />
              </div>

              {/* OCR Uploader */}
              <OCRUploader
                userId={reportPatient === "Myself" ? user?.id : reportPatient}
                reportDate={reportDate}
                reportNote={reportNote}
                reportCategory={reportTestCategory}
                isPrivate={isPrivateReport}
                onComplete={async (data) => {
                  console.log('OCR Data:', data, 'Patient:', reportPatient,);
                  setOcrError(null);
                  setOcrMessage(null);
                  setOcrReportData(data);

                  if (!data.document_id) {
                    setOcrError('No document ID returned. Upload may have failed.');
                    setIsUploading(false);
                    return;
                  }

                  await fetchDocuments();

                  setOcrMessage('Document uploaded and processed successfully!');
                  setShowAddReport(false);
                  setOcrReportData(null);
                  setOcrError(null);
                  setOcrMessage(null);
                  setReportPatient("Myself");
                  setReportDate(new Date().toISOString().split("T")[0]);
                  setIsPrivateReport(false);
                  setReportNote("");
                  setIsUploading(false);
                  // Reset fields after successful upload
                  setReportPatient(reportPatient);
                }}
                onError={(err) => {
                  setOcrError('Failed to process the file. Please try again.');
                  setIsUploading(false);
                  console.error(err);
                }}
                onClear={() => {
                  setOcrReportData(null);
                  setOcrError(null);
                  setOcrMessage(null);
                  setIsUploading(false);
                }}
              />

              {ocrError && <p className="text-red-500 text-xs font-medium text-center">{ocrError}</p>}
              {ocrMessage && <p className="text-green-500 text-xs font-medium text-center">{ocrMessage}</p>}
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Address Modal */}
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

      {/* 7. Edit Profile Modal */}
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

      {/* 8. Add Family Member Modal */}
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

              {/* Color Picker */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Personalized Accent Color</label>
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
                        {isSelected && <span className="material-symbols-outlined text-white text-xs font-bold">done</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Select Representative Avatar</label>
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

      {/* 9. Document Preview Modal */}
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
                <span className="material-symbols-outlined text-primary">description</span>
                <div className="min-w-0">
                  <h3 className="font-headline-md text-sm text-secondary font-bold truncate">
                    {selectedDocument.fileName}
                  </h3>
                  <p className="text-[10px] text-outline">
                    {selectedDocument.documentType} • {new Date(selectedDocument.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedDocument.isPrivate && (
                  <span className="bg-orange-50 text-orange-700 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Private
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-2 rounded-full! hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-4 bg-surface-container-low/30">
              {selectedDocument.previewUrl ? (
                selectedDocument.mimeType?.startsWith("image/") ? (
                  <div className="relative flex items-center justify-center min-h-[50vh]">
                    {previewLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
                      </div>
                    )}
                    {!previewError ? (
                      <img
                        key={selectedDocument.id}
                        src={selectedDocument.previewUrl}
                        alt={selectedDocument.fileName}
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
                          href={selectedDocument.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 text-primary text-sm font-bold underline"
                        >
                          Open in new tab
                        </a>
                      </div>
                    )}
                  </div>
                ) : selectedDocument.mimeType === "application/pdf" ? (
                  <iframe
                    src={selectedDocument.previewUrl}
                    className="w-full h-[70vh] rounded-lg"
                    title={selectedDocument.fileName}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                    <span className="material-symbols-outlined text-6xl text-outline-variant">insert_drive_file</span>
                    <p className="text-sm text-on-surface-variant mt-2">Preview not available for this file type.</p>
                    {selectedDocument.previewUrl && (
                      <a
                        href={selectedDocument.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-primary text-sm font-bold underline"
                      >
                        Open in new tab
                      </a>
                    )}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                  <span className="material-symbols-outlined text-6xl text-outline-variant">image_not_supported</span>
                  <p className="text-sm text-on-surface-variant mt-2">No preview available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Family Sync Hub Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-sm text-secondary font-bold flex items-center gap-2" id="family-sync-header">
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
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3" id="create-family-card">
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
                  <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-2xl space-y-3" id="join-family-card">
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
                              if (!fams || fams.length === 0) return null;

                              const matchFam = fams[0];
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
                              setTimeout(() => reject(new Error("Request timed out. Please check your connection.")), 8000)
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

                    {verificationFamily && (
                      <div className="p-3 bg-white rounded-xl border border-primary/20 space-y-3 animate-in zoom-in-95 duration-200">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-secondary">{verificationFamily.name}</h4>
                          <div className="text-[10px] text-on-surface-variant space-y-0.5">
                            <p>👑 Admin: <span className="font-bold text-on-surface">{verificationFamily.adminName}</span></p>
                            <p>👥 Members: <span className="font-bold text-on-surface">{verificationFamily.memberCount} joined</span></p>
                          </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className='flex gap-2'>
                          <input
                            id="terms"
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="h-4 w-4 rounded border-outline-variant/50 text-primary accent-primary mt-0.5"
                          />
                          <label htmlFor="terms" className="text-xs text-on-surface-variant leading-5 cursor-pointer">
                            By joining this family group, you agree to share your personal information, medication reminders, and health records with other members of this group. Only join if you trust all members
                          </label>
                        </div>

                        {/* Don't Share Medical Records */}
                        <div className='flex gap-2'>
                          <input
                            id="shareMedicalRecords"
                            type="checkbox"
                            checked={dontShareMedicalRecords}
                            onChange={(e) => setDontShareMedicalRecords(e.target.checked)}
                            className="h-4 w-4 rounded border-outline-variant/50 text-primary accent-primary mt-0.5"
                          />
                          <label htmlFor="shareMedicalRecords" className="text-xs text-on-surface-variant leading-5 cursor-pointer">
                            I don't want to share my medical records
                          </label>
                        </div>

                        <button
                          onClick={async () => {
                            setIsJoiningFamily(true);
                            try {
                              const success = await joinFamily(
                                verificationFamily.id,
                                verificationFamily.name,
                                verificationFamily.familyCode,
                                verificationFamily.adminId,
                                dontShareMedicalRecords
                              );
                              if (success) {
                                setVerificationFamily(null);
                                setJoinFamilyId("");
                                setDontShareMedicalRecords(false);
                                setTermsAccepted(false);
                              }
                            } finally {
                              setIsJoiningFamily(false);
                            }
                          }}
                          disabled={isJoiningFamily || !termsAccepted}
                          className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-[11px] hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 min-h-[32px] disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {isJoiningFamily ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : "Confirm & Join Group"}
                        </button>
                      </div>
                    )}
                  </div>
                  <div id="family-sync-note" className="mt-4 p-3 bg-secondary/5 border border-secondary/10 rounded-xl text-xs text-on-surface-variant">
                    <strong>Note:</strong> Family Sync helps caregivers and family members stay informed with shared medication schedules, reminders, and health updates.
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
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">
                            Code:{" "}
                            <span className="font-mono text-secondary select-all">
                              {activeFamily.familyCode}
                            </span>
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopyFamilyCode(activeFamily.familyCode)}
                            className={`flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[9px] font-bold transition-all active:scale-95 ${copiedFamilyCode
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                              : "bg-white border-outline-variant/30 text-secondary hover:border-primary/40 hover:text-primary"
                              }`}
                            title={copiedFamilyCode ? "Copied!" : "Copy Family Code"}
                          >
                            <span className="material-symbols-outlined text-sm! leading-none">
                              {copiedFamilyCode ? "check" : "content_copy"}
                            </span>
                            <span>{copiedFamilyCode ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Active Group
                      </span>
                    </div>

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
                      {/* Active User */}
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
                        <div
                          key={member.id}
                          onClick={() => {
                            setEditingNicknameMemberId(member.id);
                            setEditingNicknameValue(nicknameMap[member.id] || member.name);
                          }}
                          className="p-3 flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full border border-outline-variant/30" />
                            <div>
                              <span className="font-bold text-xs text-on-surface block cursor-pointer hover:text-primary transition-colors">
                                {nicknameMap[member.id] || member.nickname || member.name}
                              </span>
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
            </div>

            {/* Title & Message */}
            <div className="text-center mb-6">
              <h3 className="font-headline-md text-base text-secondary font-bold">
                Delete Account?
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mt-2">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAccount(false);
                }}
                disabled={isDeletingAccount}
                className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-secondary font-bold rounded-xl text-xs active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={async () => {
                  if (!user?.id) {
                    console.error("Cannot delete account: user ID is missing");
                    return;
                  }
                  setIsDeletingAccount(true);
                  try {
                    await authService.deleteAccount(user?.id);
                  } catch (err: any) {
                    console.error("Delete failed:", err);
                    // Optional: error UI
                  } finally {
                    setIsDeletingAccount(false);
                  }
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:pointer-events-none"
              >
                {isDeletingAccount ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Nickname Edit Modal */}
      {editingNicknameMemberId && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-headline-md text-sm text-secondary font-bold">Edit Nickname</h4>
              <button
                onClick={() => setEditingNicknameMemberId(null)}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                  Nickname
                </label>
                <input
                  type="text"
                  value={editingNicknameValue}
                  onChange={(e) => setEditingNicknameValue(e.target.value)}
                  placeholder="Enter nickname"
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!editingNicknameMemberId) return;
                    const trimmed = editingNicknameValue.trim();
                    if (!trimmed) return;

                    const ownerId = user?.id;

                    if (
                      editingNicknameMemberId.startsWith("fam-") ||
                      !ownerId ||
                      !isSupabaseConfigured
                    ) {
                      setNicknameMap((prev) => ({
                        ...prev,
                        [editingNicknameMemberId]: trimmed,
                      }));
                      setEditingNicknameMemberId(null);
                      return;
                    }

                    try {
                      const saved = await nicknameService.saveNickname(
                        ownerId,
                        editingNicknameMemberId,
                        trimmed
                      );

                      setNicknameMap((prev) => ({
                        ...prev,
                        [saved.targetUserId]: saved.nickname,
                      }));

                      setEditingNicknameMemberId(null);
                    } catch (err: any) {
                      console.error("Failed to save nickname:", err);
                      alert(err?.message);
                    }
                  }}
                  className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingNicknameMemberId(null)}
                  className="flex-1 py-2.5 bg-surface-container text-on-surface font-bold rounded-xl text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};