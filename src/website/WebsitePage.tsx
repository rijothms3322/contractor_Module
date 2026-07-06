import React from "react";
import HeroSection from "@/website/sections/HeroSection";
import MedicineShowcase from "@/website/sections/MedicineShowcase";
import LabBookingPreview from "@/website/sections/LabBookingPreview";
import HomeCollection from "@/website/sections/HomeCollection";
import HealthInsights from "@/website/sections/HealthInsights";
import WellnessSection from "@/website/sections/WellnessSection";
import FamilyHealthcare from "@/website/sections/FamilyHealthcare";
import AppScreens from "@/website/sections/AppScreens";
import HealthBlog from "@/website/sections/HealthBlog";
import Footer from "@/website/sections/Footer";

export default function WebsitePage() {
  return (
    <div className="min-h-screen bg-background text-on-background overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Navigation Bar for Website */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card px-gutter py-4 border-b border-outline-variant/20 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary text-on-primary flex items-center justify-center font-display-lg text-xl shadow-lg shadow-primary/20">M</div>
          <span className="font-headline-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Medimz</span>
        </div>
        <div className="hidden lg:flex items-center gap-10 text-label-md text-on-surface-variant bg-surface/50 px-8 py-3 rounded-full border border-outline-variant/20 backdrop-blur-md shadow-sm">
          <a href="#reminders" className="hover:text-primary hover:-translate-y-0.5 transition-all">Reminders</a>
          <a href="#wellness" className="hover:text-primary hover:-translate-y-0.5 transition-all">Wellness</a>
          <a href="#labs" className="hover:text-primary hover:-translate-y-0.5 transition-all">Diagnostics</a>
          <a href="#blog" className="hover:text-primary hover:-translate-y-0.5 transition-all">Journal</a>
        </div>
        <button className="bg-primary text-on-primary px-8 py-2.5 rounded-full font-label-md shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30">
          Get Started
        </button>
      </nav>

      <main className="pt-24 md:pt-32">
        <HeroSection />
        <MedicineShowcase />
        <WellnessSection />
        <LabBookingPreview />
        <HomeCollection />
        <HealthInsights />
        <FamilyHealthcare />
        <AppScreens />
        <HealthBlog />
      </main>

      <Footer />
    </div>
  );
}
