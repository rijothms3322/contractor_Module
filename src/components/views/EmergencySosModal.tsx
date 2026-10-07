"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { SOSContact, SOSRelation, sosService } from "@/services/sosService";
import { Contacts } from "@capacitor-community/contacts";
import { Share } from "@capacitor/share";
import { Geolocation } from "@capacitor/geolocation";

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOS_RELATIONS: { key: SOSRelation; label: string }[] = [
  { key: "sibling", label: "Sibling" },
  { key: "child", label: "Child" },
  { key: "spouse", label: "Spouse" },
  { key: "parent", label: "Parent" },
  { key: "doctor", label: "Doctor" },
  { key: "neighbour", label: "Neighbour" },
  { key: "friend", label: "Friend" },
  { key: "other", label: "Other" },
];

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({ isOpen, onClose }) => {
  const { user, familyMembers, medicines, reminders } = useApp();
  const [activeScreen, setActiveScreen] = useState<"setup" | "menu" | "location" | "profile" | "meds" | "allergies" | "ambulance">("menu");

  // Contacts list
  const [contacts, setContacts] = useState<SOSContact[]>([]);
  const [loading, setLoading] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRelation, setFormRelation] = useState<SOSRelation>("spouse");
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("");
  const [showContactsDropdown, setShowContactsDropdown] = useState(false);

  // Location sharing state (unchanged)
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ambulance settings (unchanged)
  const [countryCode, setCountryCode] = useState("IN");
  const countryEmergencyNumbers: Record<string, { name: string; number: string }> = {
    US: { name: "United States", number: "911" },
    IN: { name: "India", number: "108" },
    UK: { name: "United Kingdom", number: "999" },
    AE: { name: "UAE", number: "999" },
    CA: { name: "Canada", number: "911" }
  };

  useEffect(() => {
    if (!isOpen) {
      // Modal closed → clear interval + reset state
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
      setIsSharingLocation(false);
      setLatitude(null);
      setLongitude(null);
    }
  }, [isOpen]);

  // Load contacts on mount
  useEffect(() => {
    if (!isOpen || !user?.id) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const data = await sosService.getSOSContacts(user.id);
        if (cancelled) return;
        setContacts(data);
        // If at least one contact exists, jump straight to the menu
        setActiveScreen(data.length > 0 ? "menu" : "setup");
      } catch (error) {
        console.error("Failed to fetch SOS contacts:", error);
        if (!cancelled) {
          setContacts([]);
          setActiveScreen("setup");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, user?.id]);

  // Cleanup location
  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);


  const pickContact = async () => {
    try {
      const result = await Contacts.pickContact({
        projection: {
          name: true,
          phones: true,
        },
      });

      console.log("Selected contact:", result);

      const contact = result?.contact;

      if (!contact) {
        return;
      }

      const name =
        contact.name?.display ||
        contact.name?.given ||
        "";

      const phone =
        contact.phones?.[0]?.number ||
        "";

      setFormName(name);
      setFormPhone(phone);
    } catch (error) {
      console.error("Contact picker failed:", error);
    }
  };


  // --- Fetch all contacts ---
  const fetchContacts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await sosService.getSOSContacts(user.id);
      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch SOS contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Reset form ---
  const resetForm = () => {
    setEditingId(null);
    setFormName("");
    setFormPhone("");
    setFormRelation("spouse");
    setSelectedFamilyMember("");
  };

  // --- Populate form for editing ---
  const startEdit = (contact: SOSContact) => {
    setEditingId(contact.id);
    setFormName(contact.full_name);
    setFormPhone(contact.phone_number);
    setFormRelation(contact.relation);
  };

  // --- Cancel editing ---
  const cancelEdit = () => {
    resetForm();
  };

  // --- Save contact (create or update) ---
  const handleSaveContact = async () => {
    if (!user?.id) return;
    if (!formName.trim() || !formPhone.trim()) {
      alert("Name and phone are required.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // Update existing
        await sosService.updateSOSContact(editingId, {
          full_name: formName.trim(),
          phone_number: formPhone.trim(),
          relation: formRelation,
        });
      } else {
        // Create new
        await sosService.addSOSContact(user.id, {
          full_name: formName.trim(),
          phone_number: formPhone.trim(),
          relation: formRelation,
          source: "manual",
        });
      }
      await fetchContacts();
      resetForm();
    } catch (error) {
      console.error("Failed to save contact:", error);
      alert("Failed to save contact. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Delete contact ---
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    setLoading(true);
    try {
      await sosService.deleteSOSContact(contactId);
      await fetchContacts();
    } catch (error) {
      console.error("Failed to delete contact:", error);
      alert("Failed to delete contact. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Family member select handler (pre‑fills form) ---
  const handleFamilySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    setSelectedFamilyMember(memberId);
    const member = familyMembers.find(m => m.id === memberId);
    if (member) {
      setFormName(member.name);
      setFormPhone(member.phone || "");
      const relMap: Record<string, SOSRelation> = {
        Mother: "parent",
        Father: "parent",
        Brother: "sibling",
        Sister: "sibling",
        Son: "child",
        Daughter: "child",
        Husband: "spouse",
        Wife: "spouse",
        Doctor: "doctor",
        Neighbor: "neighbour",
        Friend: "friend",
      };
      setFormRelation(relMap[member.relationship] || "other");
    }
  };

  const userOnlyMedicines = useMemo(() => {
    const userId = user?.id;
    const userMedIds = new Set<string>();

    reminders.forEach((r) => {
      // User's own reminder → familyMemberId is null OR equals user.id
      if (!r.familyMemberId || r.familyMemberId === userId) {
        userMedIds.add(r.medicineId);
      }
    });

    return medicines.filter((m) => userMedIds.has(m.id));
  }, [medicines, reminders, user?.id]);

  // --- Handle "Share Live GPS Location" click ---
  const handleShareLocation = async () => {
    if (loading) return;

    setLoading(true);

    try {
      // Check current native permission
      let permissions = await Geolocation.checkPermissions();

      console.log("Initial location permission:", permissions.location);

      // If not granted, request it
      if (permissions.location !== "granted") {
        permissions = await Geolocation.requestPermissions();

        console.log(
          "Location permission after request:",
          permissions.location
        );
      }

      // Still not granted
      if (permissions.location !== "granted") {
        alert(
          "Location permission is required.\n\n" +
          "Please enable Location permission for this app in Android Settings, " +
          "then come back and try again."
        );

        return;
      }

      // Permission granted
      setActiveScreen("location");

      await startLocationSharing();
    } catch (error) {
      console.error("Location permission error:", error);

      alert(
        "Unable to access your location.\n\n" +
        "Please enable Location permission in Android Settings and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Location sharing (unchanged) ---
  const startLocationSharing = async () => {
    setIsSharingLocation(true);

    const updateLocation = async () => {
      try {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000,
        });

        console.log("📍 NATIVE GPS:", {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });

        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      } catch (err) {
        console.error("❌ Native GPS error:", err);
      }
    };

    await updateLocation();

    locationIntervalRef.current = setInterval(
      updateLocation,
      4000
    );
  };

  const shareLocationNative = async () => {
    if (latitude === null || longitude === null) {
      alert("Location not ready yet. Please wait a moment.");
      return;
    }

    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const shareText =
      `🚨 SOS Alert\n\n` +
      `I need urgent help. My current location is shared below. ` +
      `Please use the location link to find me and provide assistance as soon as possible.\n\n` +
      `📍 My Location:\n${mapsLink}\n\n` +
      `Please contact me immediately if you receive this message.`;

    try {
      // no `url` field, warna link do baar aayega
      await Share.share({
        title: "SOS Emergency Alert",
        text: shareText,
        dialogTitle: "Share Emergency Location",
        url: mapsLink,
      });
      console.log("Location shared successfully");
    } catch (err: any) {
      const msg = err?.message?.toLowerCase?.() || "";
      if (msg.includes("cancel") || msg.includes("abort")) {
        return;
      }
      console.error("Native share failed:", err);

      // Browser fallback
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: "🚨 SOS Emergency Alert",
            text: shareText,
          });
          return;
        } catch { /* ignore */ }
      }

      // Clipboard fallback
      try {
        await navigator.clipboard.writeText(shareText);
        alert("SOS message copied to clipboard! Paste it in WhatsApp / SMS / Email.");
      } catch {
        alert("Could not share. Please copy manually:\n\n" + shareText);
      }
    }
  };


  const stopLocationSharing = () => {
    setIsSharingLocation(false);
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setLatitude(null);
    setLongitude(null);
  };

  // --- share medical profile --- 
  const shareMedicalProfile = async () => {
    // Build each section as an array of lines; skip empty ones
    const patientLines: string[] = [];
    if (user?.fullName) patientLines.push(`Name: ${user.fullName}`);
    if (user?.age) patientLines.push(`Age: ${user.age} yrs${user.gender ? ` (${user.gender})` : ""}`);
    if (user?.bloodGroup) patientLines.push(`Blood Group: ${user.bloodGroup}`);

    const conditionLines =
      user?.medicalConditions && user.medicalConditions.length > 0
        ? user.medicalConditions.map((c) => `• ${c}`)
        : ["• None configured"];

    const medLines =
      userOnlyMedicines.length > 0
        ? userOnlyMedicines.map(
          (m) =>
            `• ${m.name} (${m.dosage}) — ${m.instructions || "As directed"}`
        )
        : ["• No medicines configured"];

    // Compose the final message with sections, joining only non-empty blocks
    const sections: string[] = [
      `🚨 MEDICAL PROFILE SUMMARY`,
      patientLines.length > 0
        ? `👤 PATIENT INFORMATION\n${patientLines.join("\n")}`
        : "",
      `⚠️ CHRONIC CONDITIONS\n${conditionLines.join("\n")}`,
      `💊 ACTIVE MEDICATIONS\n${medLines.join("\n")}`,
    ];

    const shareText = sections.filter(Boolean).join("\n\n");

    try {
      await Share.share({
        title: "Medical Profile Summary",
        text: shareText,
        dialogTitle: "Share Medical Profile",
      });
      console.log("Medical profile shared successfully");
    } catch (err: any) {
      const msg = err?.message?.toLowerCase?.() || "";
      if (msg.includes("cancel") || msg.includes("abort")) return;
      console.error("Native share failed:", err);

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: "🚨 Medical Profile Summary",
            text: shareText,
          });
          return;
        } catch {
          /* ignore */
        }
      }

      try {
        await navigator.clipboard.writeText(shareText);
        alert(
          "Medical profile copied to clipboard! Paste it in WhatsApp / SMS / Email."
        );
      } catch {
        alert("Could not share. Please copy manually:\n\n" + shareText);
      }
    }
  };

   if (!isOpen) return null;    

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-container/95 backdrop-blur-md scroll-auto! flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-3xl p-6 my-5! scroll-auto! shadow-xl flex flex-col gap-6 relative overflow-hidden text-left">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
          </div>
        )}

        {/* SETUP SCREEN */}
        {activeScreen === "setup" && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <span className="material-symbols-outlined text-4xl text-red-500 animate-pulse">contact_phone</span>
              <h2 className="font-headline-lg text-lg font-extrabold text-secondary mt-1">Emergency Contacts</h2>
              <p className="font-body-md text-xs text-on-surface-variant">
                {contacts.length === 0 ? "Add your first emergency contact." : "Manage your emergency contacts."}
              </p>
            </div>

            {/* Contact List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {contacts.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic text-center py-2">No contacts saved yet.</p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-2 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-secondary truncate">{contact.full_name}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">{contact.phone_number} • {SOS_RELATIONS.find(r => r.key === contact.relation)?.label || contact.relation}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(contact)}
                        className="py-0.5 px-1 rounded hover:bg-surface-container-high text-secondary"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(contact.id)}
                        className="py-0.5 px-1 rounded hover:bg-red-50 text-red-500"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `tel:${contact.phone_number}`;
                          setShowContactsDropdown(false);
                        }}
                        className="py-0.5 px-1 rounded hover:bg-emerald-50 text-emerald-600"
                      >
                        <span className="material-symbols-outlined text-sm">Call</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add/Edit Form */}
            <div className="border-t border-outline-variant/20 pt-3">
              <h4 className="font-label-md text-xs font-bold text-secondary">
                {editingId ? "Edit Contact" : "Add New Contact"}
              </h4>
              <div className="space-y-2 mt-2">
                {familyMembers.length > 0 && (
                  <select
                    value={selectedFamilyMember}
                    onChange={handleFamilySelect}
                    className="w-full px-3 py-2 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
                  >
                    <option value="">-- Select from family sync --</option>
                    {familyMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.relationship})
                      </option>
                    ))}
                  </select>
                )}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
                  />

                  <button
                    type="button"
                    onClick={pickContact}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 rounded-md hover:bg-surface-container-high"
                    aria-label="Select contact"
                  >
                    <span className="material-symbols-outlined text-sm! text-secondary">
                      call_log
                    </span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="px-3 py-2 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
                  />
                  <select
                    value={formRelation}
                    onChange={(e) => setFormRelation(e.target.value as SOSRelation)}
                    className="px-3 py-2 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
                  >
                    {SOS_RELATIONS.map((rel) => (
                      <option key={rel.key} value={rel.key}>{rel.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveContact}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-primary text-white font-label-md text-xs font-bold hover:opacity-95 shadow-md disabled:opacity-50"
                  >
                    {editingId ? "Update" : "Add"} Contact
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-xl border border-outline-variant/40 font-label-md text-xs hover:bg-surface-container-low"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-xl border border-outline-variant/40 font-label-md text-xs font-bold hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (contacts.length > 0) {
                    setActiveScreen("menu");
                  } else {
                    alert("Please add at least one emergency contact.");
                  }
                }}
                className="w-1/2 py-2.5 rounded-xl bg-primary text-white font-label-md text-xs font-bold hover:opacity-95 shadow-md"
              >
                Proceed
              </button>
            </div>
          </div>
        )}

        {/* MENU SCREEN (unchanged) */}
        {activeScreen === "menu" && (
          <div className="space-y-4 text-center">
            <div>
              <span className="material-symbols-outlined text-5xl text-red-500 animate-bounce">sos</span>
              <h2 className="font-headline-lg text-lg font-black text-secondary mt-1">Emergency Assistance</h2>
              <p className="font-body-md text-xs text-on-surface-variant">Need immediate help? Select an option below.</p>
            </div>

            <div className="grid gap-2 text-left">
              <div className="relative">
                <button
                  onClick={() => setShowContactsDropdown(!showContactsDropdown)}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-label-md text-xs font-bold flex items-center justify-between shadow-md transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-white">phone_in_talk</span>
                    <span>Call Emergency Contact</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-white">
                    {showContactsDropdown ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {showContactsDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-outline-variant/30 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto p-2">
                    {contacts.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic text-center py-2">No contacts saved.</p>
                    ) : (
                      contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg cursor-pointer"
                          onClick={() => {
                            window.location.href = `tel:${contact.phone_number}`;
                            setShowContactsDropdown(false);
                          }}
                        >
                          <div className="text-left">
                            <p className="font-bold text-xs text-secondary">{contact.full_name}</p>
                            <p className="text-[10px] text-on-surface-variant">{contact.phone_number}</p>
                          </div>
                          <span className="material-symbols-outlined text-[10px] text-emerald-600">Call</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Other menu options (unchanged) */}
              <button
                onClick={handleShareLocation}
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-label-md text-xs font-bold flex items-center justify-between shadow-md transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-white">share_location</span>
                  <span>Share Live GPS Location</span>
                </div>
                <span className="material-symbols-outlined text-sm text-white">arrow_forward</span>
              </button>

              <button
                onClick={() => setActiveScreen("profile")}
                className="w-full py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-secondary rounded-2xl font-label-md text-xs font-bold flex items-center justify-between border border-outline-variant/20 shadow-sm transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary">badge</span>
                  <span>Share Medical Profile</span>
                </div>
                <span className="material-symbols-outlined text-sm text-secondary">arrow_forward</span>
              </button>

              {/* <button
                  onClick={() => setActiveScreen("meds")}
                  className="w-full py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-secondary rounded-2xl font-label-md text-xs font-bold flex items-center justify-between border border-outline-variant/20 shadow-sm transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-secondary">medication</span>
                    <span>Share Current Medications</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-secondary">arrow_forward</span>
                </button> */}

              {/* <button
                  onClick={() => setActiveScreen("allergies")}
                  className="w-full py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-secondary rounded-2xl font-label-md text-xs font-bold flex items-center justify-between border border-outline-variant/20 shadow-sm transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-secondary">warning</span>
                    <span>Share Chronic Conditions</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-secondary">arrow_forward</span>
                </button> */}

              <button
                onClick={() => {
                  const config = countryEmergencyNumbers[countryCode];
                  window.location.href = `tel:${config.number}`;
                }}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-label-md text-xs font-bold flex items-center justify-between shadow-md transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-white">medical_services</span>
                  <span>Call Ambulance Dispatch ({countryEmergencyNumbers[countryCode].number})</span>
                </div>
                <span className="material-symbols-outlined text-sm text-white">call</span>
              </button>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setActiveScreen("setup");
                  resetForm();
                }}
                className="w-1/2 py-2.5 rounded-xl border border-outline-variant/30 font-label-md text-xs hover:bg-surface-container-low"
              >
                Edit Contacts
              </button>
              <button
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-xl bg-outline text-white font-label-md text-xs font-bold hover:opacity-95"
              >
                ❌ Close SOS
              </button>
            </div>
          </div>
        )}

        {/* GEOLOCATION SHARE SCREEN */}
        {activeScreen === "location" && (
          <div className="space-y-4 text-center">
            <div className="w-full flex justify-end">
              <button
                onClick={() => { stopLocationSharing(); setActiveScreen("menu"); }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-sm text-secondary">close</span>
              </button>
            </div>
            <div>
              <span className="material-symbols-outlined text-5xl text-blue-500 animate-ping">location_searching</span>
              <h2 className="font-headline-lg text-lg font-black text-secondary mt-3">Live Location Sharing</h2>
              <p className="font-body-md text-xs text-on-surface-variant">Sharing location with emergency contact...</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left font-label-md text-xs text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>GPS Simulator Active</span>
              </div>
              <p>Latitude: <span className="font-mono font-bold">{latitude?.toFixed(6) || "Locating..."}</span></p>
              <p>Longitude: <span className="font-mono font-bold">{longitude?.toFixed(6) || "Locating..."}</span></p>
              <p className="text-[10px] text-blue-700/80">Location parameters are automatically updated every 4 seconds.</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={shareLocationNative}
                disabled={latitude === null || longitude === null}
                className="w-full py-3 rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-white font-label-md text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-sm text-white">share</span>
                <span>
                  {latitude === null ? "Waiting for GPS..." : "Share via"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* MEDICAL PROFILE SCREEN */}
        {activeScreen === "profile" && (
          <div className="flex flex-col gap-5">
            <div className="space-y-4 text-left">
              <h3 className="font-headline-lg text-base text-secondary font-black text-center border-b pb-2">🚑 Medical Summary Card</h3>
              <div className="space-y-2 font-label-md text-xs">
                <p><strong className="text-secondary">Patient Name:</strong> {user?.fullName || "Sarah D'Souza"}</p>
                <p><strong className="text-secondary">Age:</strong> {user?.age || 68} yrs ({user?.gender || "Female"})</p>
                <p><strong className="text-secondary">Blood Group:</strong> {user?.bloodGroup || "O+"}</p>
                <p><strong className="text-secondary">Chronic Diagnoses:</strong> {user?.medicalConditions && user.medicalConditions.length > 0 ? user.medicalConditions.join(", ") : "None Configured"}</p>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <h3 className="font-headline-lg text-base text-secondary font-black text-center border-b pb-2">⚠️ Chronic Conditions & Alerts</h3>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl font-label-md text-xs text-orange-900 space-y-3">
                <p className="font-bold text-red-500">Active High Risk Profile</p>
                {user?.medicalConditions && user.medicalConditions.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {user.medicalConditions.map((cond, idx) => (
                      <li key={idx} className="font-bold">{cond}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-orange-800">No chronic health conditions are registered.</p>
                )}
                <div className="h-px bg-orange-200" />
                <p className="text-[10px] text-orange-700/80">Always check with medical authorities before administrating new prescriptions in emergency situations.</p>
              </div>
            </div>


            <div className="space-y-4 text-left">
              <h3 className="font-headline-lg text-base text-secondary font-black text-center border-b pb-2">💊 Active Medication Summary</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {userOnlyMedicines.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">No medicines found in system.</p>
                ) : (
                  userOnlyMedicines.map((med) => {
                    const hasMatchingRem = reminders.find(
                      (r) => r.medicineId === med.id && (!r.familyMemberId || r.familyMemberId === user?.id)
                    );
                    return (
                      <div key={med.id} className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-label-md text-xs">
                        <p className="font-bold text-secondary">{med.name} ({med.dosage})</p>
                        <p className="text-outline mt-0.5">Instructions: {med.instructions || "N/A"}</p>
                        <p className="text-[10px] text-on-surface-variant">Scheduled: {hasMatchingRem ? "Yes" : "As Needed"}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveScreen("menu")}
                className="w-full py-2.5 rounded-xl bg-outline text-white font-label-md text-xs font-bold hover:opacity-95 active:scale-98 transition-all"
              >
                Back to Emergency Menu
              </button><button
                type="button"
                onClick={shareMedicalProfile}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-label-md text-xs font-bold hover:opacity-95 flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-sm text-white">share</span>
                <span>Share via</span>
              </button>
            </div>
          </div>
        )}

        {/* CURRENT MEDICATIONS SCREEN */}
        {activeScreen === "meds" && (
          <div className="space-y-4 text-left">
            <h3 className="font-headline-lg text-base text-secondary font-black text-center border-b pb-2">💊 Active Medication Summary</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {medicines.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">No medicines found in system.</p>
              ) : (
                medicines.map((med) => {
                  const hasMatchingRem = reminders.find(r => r.medicineId === med.id);
                  return (
                    <div key={med.id} className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-label-md text-xs">
                      <p className="font-bold text-secondary">{med.name} ({med.dosage})</p>
                      <p className="text-outline mt-0.5">Instructions: {med.instructions || "N/A"}</p>
                      <p className="text-[10px] text-on-surface-variant">Scheduled: {hasMatchingRem ? "Yes" : "As Needed"}</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={() => setActiveScreen("menu")}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-label-md text-xs font-bold hover:opacity-95"
              >
                Back to Emergency Menu
              </button>
            </div>
          </div>
        )}

        {/* CHRONIC CONDITIONS / ALLERGIES SCREEN */}
        {activeScreen === "allergies" && (
          <div className="space-y-4 text-left">
            <h3 className="font-headline-lg text-base text-secondary font-black text-center border-b pb-2">⚠️ Chronic Conditions & Alerts</h3>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl font-label-md text-xs text-orange-900 space-y-3">
              <p className="font-bold text-red-500">Active High Risk Profile</p>
              {user?.medicalConditions && user.medicalConditions.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1">
                  {user.medicalConditions.map((cond, idx) => (
                    <li key={idx} className="font-bold">{cond}</li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-orange-800">No chronic health conditions are registered.</p>
              )}
              <div className="h-px bg-orange-200" />
              <p className="text-[10px] text-orange-700/80">Always check with medical authorities before administrating new prescriptions in emergency situations.</p>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={() => setActiveScreen("menu")}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-label-md text-xs font-bold hover:opacity-95"
              >
                Back to Emergency Menu
              </button>
            </div>
          </div>
        )}

        {/* CALL AMBULANCE SCREEN */}
        {activeScreen === "ambulance" && (
          <div className="space-y-4 text-center">
            <div>
              <span className="material-symbols-outlined text-5xl text-red-600 animate-pulse">emergency_share</span>
              <h2 className="font-headline-lg text-lg font-black text-secondary mt-2">Ambulance Dispatch</h2>
              <p className="font-body-md text-xs text-on-surface-variant">Select country region to configure dispatch number.</p>
            </div>

            <div className="space-y-3 text-left">
              <label className="font-label-md text-xs font-bold text-secondary">Region Country Config:</label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
              >
                {Object.entries(countryEmergencyNumbers).map(([code, config]) => (
                  <option key={code} value={code}>
                    {config.name} ({config.number})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  const config = countryEmergencyNumbers[countryCode];
                  if (confirm(`Emergency Safety Check:\nAre you sure you want to dial ${config.name} ambulance dispatcher?\n📞 Dial: ${config.number}`)) {
                    alert(`Calling Emergency Dispatch Services: ${config.number}`);
                  }
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-label-md text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-sm animate-pulse text-white">call</span>
                <span>Confirm Call Ambulance ({countryEmergencyNumbers[countryCode].number})</span>
              </button>

              <button
                onClick={() => setActiveScreen("menu")}
                className="w-full py-2 border border-outline-variant/30 rounded-xl font-label-md text-xs hover:bg-surface-container-low mt-2"
              >
                Cancel & Back
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
