"use client";

import React from "react";
import { useApp, TabType } from "../../context/AppContext";

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();

  const navItems: { tab: TabType; icon: string; label: string }[] = [
    { tab: "home", icon: "home", label: "Home" },
    { tab: "health", icon: "medical_services", label: "Health" },
    { tab: "insights", icon: "psychology", label: "Insights" },
    { tab: "wellness", icon: "self_improvement", label: "Wellness" },
    { tab: "profile", icon: "person", label: "Profile" }
  ];

  // Add Admin tab dynamically if user has admin permissions
  if (user?.role === "admin") {
    navItems.push({ tab: "admin", icon: "admin_panel_settings", label: "Admin" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-container-max mx-auto h-20 px-2 pb-4 pt-2 bg-surface/90 backdrop-blur-2xl border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(9,100,144,0.06)] rounded-t-2xl flex justify-around items-center transition-all">
      {navItems.map((item) => {
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none group relative"
          >
            {/* Active Pill Highlights */}
            <div
              className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 duration-300 transition-all ${
                isActive
                  ? "bg-primary-container text-on-primary-container scale-105 shadow-md"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container/30"
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-[11px] font-bold mt-0.5 tracking-tight">
                {item.label}
              </span>
            </div>
            
            {/* Soft indicator dot */}
            {isActive && (
              <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
