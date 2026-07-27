"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp, EmergencyContact } from "../../context/AppContext";

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({ isOpen, onClose }) => {
  const { user, medicines, reminders, emergencyContact, setEmergencyContact } = useApp();

  // Mode: "setup" | "menu" | "call" | "location" | "profile" | "meds" | "allergies" | "ambulance"
  const [activeScreen, setActiveScreen] = useState<"setup" | "menu" | "location" | "profile" | "meds" | "allergies" | "ambulance">("menu");

  // Setup Form state
  const [primaryName, setPrimaryName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [primaryRel, setPrimaryRel] = useState("Spouse");
  const [secondaryName, setSecondaryName] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [secondaryRel, setSecondaryRel] = useState("Child");

  // Location share state
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ambulance settings
  const [countryCode, setCountryCode] = useState("IN");
  const countryEmergencyNumbers: Record<string, { name: string; number: string }> = {
    US: { name: "United States", number: "911" },
    IN: { name: "India", number: "102" },
    UK: { name: "United Kingdom", number: "999" },
    AE: { name: "UAE", number: "999" },
    CA: { name: "Canada", number: "911" }
  };

  // Pre-fill setup state if contact is already set
  useEffect(() => {
    if (emergencyContact) {
      setPrimaryName(emergencyContact.primaryName);
      setPrimaryPhone(emergencyContact.primaryPhone);
      setPrimaryRel(emergencyContact.primaryRel);
      setSecondaryName(emergencyContact.secondaryName || "");
      setSecondaryPhone(emergencyContact.secondaryPhone || "");
      setSecondaryRel(emergencyContact.secondaryRel || "Child");
      setActiveScreen("menu");
    } else {
      setActiveScreen("setup");
    }
  }, [emergencyContact, isOpen]);

  // Clean up location tracking intervals on close/unmount
  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  // Handle emergency setup submission
  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryName || !primaryPhone) {
      alert("Primary contact name and phone are required.");
      return;
    }
    const contact: EmergencyContact = {
      primaryName,
      primaryPhone,
      primaryRel,
      secondaryName: secondaryName || undefined,
      secondaryPhone: secondaryPhone || undefined,
      secondaryRel: secondaryName ? secondaryRel : undefined
    };
    setEmergencyContact(contact);
    setActiveScreen("menu");
  };

  // Location tracking logic simulation
  const startLocationSharing = () => {
    if (navigator.geolocation) {
      setIsSharingLocation(true);
      
      const updateLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error) => {
            console.warn("Geolocation permission denied or timed out. Simulating GPS coordinates...");
            // Fallback simulation coordinates for Pune, India
            setLatitude(18.5204 + (Math.random() - 0.5) * 0.001);
            setLongitude(73.8567 + (Math.random() - 0.5) * 0.001);
          },
          { enableHighAccuracy: true }
        );
      };

      updateLocation();
      // Update coordinates every 4 seconds
      locationIntervalRef.current = setInterval(updateLocation, 4000);
    } else {
      alert("Geolocation is not supported by your browser.");
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-container/95 backdrop-blur-md flex items-center justify-center p-gutter animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-xl flex flex-col gap-6 relative overflow-hidden text-left">
        
        {/* Decorative alert background accents */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
        
        {/* SETUP SCREEN */}
        {activeScreen === "setup" && (
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div className="text-center pb-2">
              <span className="material-symbols-outlined text-4xl text-red-500 animate-pulse">contact_phone</span>
              <h2 className="font-headline-lg text-lg font-extrabold text-secondary mt-1">Setup Emergency Contacts</h2>
              <p className="font-body-md text-xs text-on-surface-variant">Please configure emergency contacts before continuing.</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-label-md text-xs font-bold text-primary uppercase tracking-wider">Primary Contact (Primary)</h3>
              <div className="grid gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                    className="px-3 py-2 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
                    required
                  />
                  <select
                    value={primaryRel}
                    onChange={(e) => setPrimaryRel(e.target.value)}
                    className="px-3 py-2 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Neighbor">Neighbor</option>
                  </select>
                </div>
              </div>

              <div className="h-px bg-outline-variant/20 my-2" />

              <h3 className="font-label-md text-xs font-bold text-outline uppercase tracking-wider">Secondary Contact (Optional)</h3>
              <div className="grid gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={secondaryName}
                  onChange={(e) => setSecondaryName(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    className="px-3 py-2 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
                  />
                  <select
                    value={secondaryRel}
                    onChange={(e) => setSecondaryRel(e.target.value)}
                    className="px-3 py-2 border border-outline-variant/40 rounded-xl font-label-md text-xs bg-surface-container-low"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Neighbor">Neighbor</option>
                  </select>
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
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-primary text-white font-label-md text-xs font-bold hover:opacity-95 shadow-md"
              >
                Save & Proceed
              </button>
            </div>
          </form>
        )}

        {/* MENU OPTIONS SCREEN */}
        {activeScreen === "menu" && (
          <div className="space-y-4 text-center">
            <div>
              <span className="material-symbols-outlined text-5xl text-red-500 animate-bounce">sos</span>
              <h2 className="font-headline-lg text-lg font-black text-secondary mt-1">Emergency Assistance</h2>
              <p className="font-body-md text-xs text-on-surface-variant">Need immediate help? Select an option below.</p>
            </div>

            <div className="grid gap-2 text-left">
              <button
                onClick={() => {
                  if (emergencyContact) {
                    alert(`Simulating Phone Call:\nDialing Primary Emergency Contact:\n📞 ${emergencyContact.primaryName} (${emergencyContact.primaryPhone})`);
                  }
                }}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-label-md text-xs font-bold flex items-center justify-between shadow-md transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-white">phone_in_talk</span>
                  <span>Call Emergency Contact</span>
                </div>
                <span className="font-bold opacity-80">{emergencyContact?.primaryName}</span>
              </button>

              <button
                onClick={() => {
                  setActiveScreen("location");
                  startLocationSharing();
                }}
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

              <button
                onClick={() => setActiveScreen("meds")}
                className="w-full py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-secondary rounded-2xl font-label-md text-xs font-bold flex items-center justify-between border border-outline-variant/20 shadow-sm transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary">medication</span>
                  <span>Share Current Medications</span>
                </div>
                <span className="material-symbols-outlined text-sm text-secondary">arrow_forward</span>
              </button>

              <button
                onClick={() => setActiveScreen("allergies")}
                className="w-full py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-secondary rounded-2xl font-label-md text-xs font-bold flex items-center justify-between border border-outline-variant/20 shadow-sm transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary">warning</span>
                  <span>Share Chronic Conditions</span>
                </div>
                <span className="material-symbols-outlined text-sm text-secondary">arrow_forward</span>
              </button>

              <button
                onClick={() => setActiveScreen("ambulance")}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-label-md text-xs font-bold flex items-center justify-between shadow-md transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-white">medical_services</span>
                  <span>Call Ambulance Dispatch</span>
                </div>
                <span className="material-symbols-outlined text-sm text-white">arrow_forward</span>
              </button>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setActiveScreen("setup")}
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
              <p className="text-[10px] text-blue-700/80">Location parameters are automatically updated every 4 seconds. Handlers simulate emergency coordinate feeds if GPS permissions are denied.</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  stopLocationSharing();
                  setActiveScreen("menu");
                }}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-label-md text-xs font-bold hover:opacity-95"
              >
                Stop Sharing & Back
              </button>
            </div>
          </div>
        )}

        {/* MEDICAL PROFILE SCREEN */}
        {activeScreen === "profile" && (
          <div className="space-y-4 text-left">
            <h3 className="font-headline-lg text-base text-secondary font-black text-center border-b pb-2">🚑 Medical Summary Card</h3>
            <div className="space-y-2 font-label-md text-xs">
              <p><strong className="text-secondary">Patient Name:</strong> {user?.fullName || "Sarah D'Souza"}</p>
              <p><strong className="text-secondary">Age:</strong> {user?.age || 68} yrs ({user?.gender || "Female"})</p>
              <p><strong className="text-secondary">Blood Group:</strong> {user?.bloodGroup || "O+"}</p>
              <p><strong className="text-secondary">Chronic Diagnoses:</strong> {user?.medicalConditions && user.medicalConditions.length > 0 ? user.medicalConditions.join(", ") : "None Configured"}</p>
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
