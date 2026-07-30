"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/layout/Header";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

// Views
import dynamic from "next/dynamic";

const AuthView = dynamic(
  () => import("../components/views/AuthView").then((mod) => mod.AuthView),
  { ssr: false }
);

const OnboardingView = dynamic(
  () => import("../components/views/OnboardingView").then((mod) => mod.OnboardingView),
  { ssr: false }
);

import { SplashScreen } from "../components/views/SplashScreen";
import { DashboardView } from "../components/views/DashboardView";
import { HealthView } from "../components/views/HealthView";
import { InsightsView } from "../components/views/InsightsView";
import { ProfileView } from "../components/views/ProfileView";
import { AdminView } from "../components/views/AdminView";
import { WellnessView } from "../components/views/WellnessView";
import { EmergencySosModal } from "../components/views/EmergencySosModal";
import { WellnessCheckInModal } from "../components/views/WellnessCheckInModal";

export default function Page() {
  const { 
    isLoggedIn, 
    activeTab, 
    user, 
    activeNotification, 
    setActiveNotification, 
    toggleReminderStatus, 
    snoozeReminder, 
    setActiveTab, 
    reminders,
    wellnessLogs,
    adminRole
  } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [shake, setShake] = useState(false);

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Auto-prompt wellness check-in once daily on login/mount
  useEffect(() => {
    if (isLoggedIn && !showSplash && !showOnboarding) {
      const todayStr = new Date().toISOString().split("T")[0];
      const hasCheckedIn = wellnessLogs.some(log => log.date === todayStr);
      if (!hasCheckedIn) {
        const timer = setTimeout(() => setIsCheckInOpen(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn, showSplash, showOnboarding, wellnessLogs]);

  // Window event listener to trigger wellness check-in modal from child components
  useEffect(() => {
    const handleOpenCheckIn = () => setIsCheckInOpen(true);
    window.addEventListener("open-wellness-checkin", handleOpenCheckIn);
    return () => window.removeEventListener("open-wellness-checkin", handleOpenCheckIn);
  }, []);

  // Audio and shake triggers for simulated push notification
  useEffect(() => {
    if (activeNotification) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Chime note 1
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.3);

        // Chime note 2
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime); // A5
          gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.4);
        }, 80);
      } catch (e) {
        console.log("AudioContext chime failure:", e);
      }

      setShake(true);
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  const handleTaken = () => {
    if (!activeNotification) return;
    const todayRem = reminders.find(r => r.id === activeNotification.reminderId);
    if (todayRem) {
      toggleReminderStatus(todayRem.id, "taken");
    }
    setActiveNotification(null);
    setShowSnoozeMenu(false);
  };

  const handleSkip = () => {
    if (!activeNotification) return;
    const todayRem = reminders.find(r => r.id === activeNotification.reminderId);
    if (todayRem) {
      toggleReminderStatus(todayRem.id, "missed");
    }
    setActiveNotification(null);
    setShowSnoozeMenu(false);
  };

  const handleSnoozeConfirm = (mins: number) => {
    if (!activeNotification) return;
    const todayRem = reminders.find(r => r.id === activeNotification.reminderId);
    if (todayRem) {
      snoozeReminder(todayRem.id, mins);
    }
    setActiveNotification(null);
    setShowSnoozeMenu(false);
  };

  // Read onboarding preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const skipped = localStorage.getItem("medimz_onboarding_skipped");
      if (skipped === "true") {
        setShowOnboarding(false);
      }
    }
  }, []);

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("medimz_onboarding_skipped", "true");
    }
  };

  // 1. Splash Screen Landing
  if (showSplash) {
    return <SplashScreen onFadeComplete={() => setShowSplash(false)} />;
  }

  // 2. Unauthenticated Flows
  if (!isLoggedIn) {
    if (showOnboarding) {
      return <OnboardingView onEnterAuth={handleSkipOnboarding} />;
    }
    return <AuthView />;
  }

  // 3. Authenticated Dashboard Flows
  const renderActiveView = () => {
    switch (activeTab) {
      case "home":
        return <DashboardView />;
      case "health":
        return <HealthView />;
      case "insights":
        return <InsightsView />;
      case "wellness":
        return <WellnessView />;
      case "profile":
        return <ProfileView />;
      case "admin":
      case "admin-operations":
      case "admin-analytics":
      case "admin-system":
        if (adminRole === null) {
          return <DashboardView />;
        }
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Floating Push Notification Banner */}
      {activeNotification && (
        <div className={`fixed top-4 left-4 right-4 z-[9999] max-w-[420px] mx-auto transition-all duration-300 transform translate-y-0 ${shake ? "scale-102 translate-x-1" : ""}`}>
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-outline-variant/30 text-left space-y-3">
            {/* Header */}
            <div className="flex justify-between items-center text-[10px] font-bold text-outline uppercase tracking-wider">
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-xs">medical_services</span>
                <span>Medimz</span>
              </div>
              <span>now</span>
            </div>
            
            {/* Content Body */}
            <div 
              onClick={() => {
                setActiveTab("home");
                setActiveNotification(null);
              }}
              className="cursor-pointer"
            >
              <h4 className="font-headline-md text-xs text-on-surface font-extrabold flex items-center gap-1">
                <span>💊 Time to Take Your Medicine</span>
              </h4>
              <p className="font-body-md text-xs text-secondary font-bold mt-1">
                {activeNotification.name} {activeNotification.dosage}
              </p>
              <p className="font-body-md text-[11px] text-on-surface-variant mt-0.5">
                Take 1 tablet now.
              </p>
              <div className="flex gap-3 text-[10px] text-outline font-semibold mt-2">
                <span>👤 For: {activeNotification.recipientName}</span>
                <span>🕒 Scheduled: {activeNotification.timeLabel}</span>
              </div>
              <p className="text-[10px] text-outline-variant italic mt-2 border-t border-outline-variant/10 pt-2">
                "Stay consistent. Every dose matters."
              </p>
            </div>

            {/* Notification Actions */}
            {!showSnoozeMenu ? (
              <div className="flex gap-2 border-t border-outline-variant/15 pt-2">
                <button
                  onClick={handleTaken}
                  className="flex-grow py-2 bg-teal-50 text-teal-700 font-bold rounded-xl text-xs hover:bg-teal-100 transition-colors"
                >
                  ✅ Taken
                </button>
                <button
                  onClick={() => setShowSnoozeMenu(true)}
                  className="flex-grow py-2 bg-surface-container hover:bg-surface-container-high font-bold rounded-xl text-xs transition-colors"
                >
                  ⏰ Snooze
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-grow py-2 bg-red-50 text-red-600 font-bold rounded-xl text-xs hover:bg-red-100 transition-colors"
                >
                  ❌ Skip
                </button>
              </div>
            ) : (
              <div className="space-y-2 border-t border-outline-variant/15 pt-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-outline">
                  <span>Snooze Duration:</span>
                  <button onClick={() => setShowSnoozeMenu(false)} className="text-secondary hover:underline">Cancel</button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[5, 10, 15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleSnoozeConfirm(mins)}
                      className="py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-[10px] font-semibold text-secondary transition-colors"
                    >
                      {mins >= 60 ? "1 Hour" : `${mins} Min`}
                    </button>
                  ))}
                  <button
                    onClick={() => handleSnoozeConfirm(10)}
                    className="py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-[10px] font-semibold text-secondary transition-colors"
                  >
                    Custom
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Blur Header */}
      <Header />

      {/* Main Responsive Area */}
      <main className="flex-grow pt-20 pb-28 px-gutter max-w-container-max mx-auto w-full transition-all duration-300">
        <div className="max-w-[480px] mx-auto w-full space-y-stack-lg">
          {renderActiveView()}
        </div>
      </main>

      {/* Dynamic Highlight Footer Footer Navbar */}
      <Navbar />
      <Footer />

      {isLoggedIn && (
        <>
          {/* Floating SOS Button */}
          <button
            onClick={() => setIsSosOpen(true)}
            className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Emergency SOS Dispatch"
          >
            <span className="material-symbols-outlined text-2xl text-white font-bold animate-pulse">sos</span>
          </button>

          {/* Emergency SOS confirmation modal */}
          <EmergencySosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />

          {/* Daily Wellness Check-In modal */}
          <WellnessCheckInModal isOpen={isCheckInOpen} onClose={() => setIsCheckInOpen(false)} />
        </>
      )}
    </div>
  );
}
