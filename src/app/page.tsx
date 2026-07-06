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

export default function Page() {
  const { isLoggedIn, activeTab, user } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
        // Fallback for non-admin attempts just in case
        if (user?.role !== "admin") {
          return <DashboardView />;
        }
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
    </div>
  );
}
