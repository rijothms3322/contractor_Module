"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export const Header: React.FC = () => {
  const { user, notifications, markNotificationRead, clearNotifications, activeTab, setActiveTab, elderlyMode, toggleElderlyMode } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 max-w-container-max mx-auto h-16 px-gutter flex justify-between items-center bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-all">
      {/* User and Logo */}
      <div className="flex items-center gap-stack-sm">
        <button
          onClick={() => setActiveTab("profile")}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed focus:outline-none hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
        >
          <img
            alt={user?.fullName || "User profile"}
            className="w-full h-full object-cover"
            src={user?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User"}
          />
        </button>
        <div
          onClick={() => setActiveTab("home")}
          className="flex items-center cursor-pointer select-none"
        >
          <img
            src="/logo.png"
            alt="MEDIMZ Logo"
            className="h-10 w-auto object-contain hover:scale-[1.02] transition-transform"
          />
        </div>
      </div>

      {/* Center active page indicator for larger screens */}
      <div className="hidden md:block">
        <h1 className="font-headline-md text-headline-md text-secondary capitalize">
          {activeTab === "home" ? "Health Dashboard" : activeTab}
        </h1>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-stack-sm relative">
        {/* Admin Switcher indicator */}
        {user?.role === "admin" && (
          <button
            onClick={() => setActiveTab(activeTab === "admin" ? "home" : "admin")}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1 transition-all ${
              activeTab === "admin"
                ? "bg-primary text-white shadow-md"
                : "bg-primary-fixed text-on-primary-fixed hover:bg-primary hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">settings_accessibility</span>
            <span>{activeTab === "admin" ? "Exit Admin" : "Admin Panel"}</span>
          </button>
        )}

        {/* Elderly Mode Toggle */}
        <button
          onClick={toggleElderlyMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 font-label-sm text-xs font-black shadow-sm ${
            elderlyMode
              ? "bg-[#ee7b4d] text-white border-[#ee7b4d] scale-102"
              : "bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface-variant"
          }`}
          title="Toggle Elderly Mode Accessibility"
        >
          <span>👴 Elderly Mode</span>
          <span className={`w-2 h-2 rounded-full ${elderlyMode ? "bg-[#00b351] animate-pulse" : "bg-outline"}`} />
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors active:scale-95 relative"
        >
          <span className="material-symbols-outlined text-secondary">notifications</span>
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadNotifications.length}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Panel */}
        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 md:w-96 max-h-[450px] overflow-y-auto glass-card rounded-xl shadow-2xl p-4 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30 mb-2">
              <h3 className="font-headline-md text-base text-secondary font-bold">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="font-label-sm text-label-sm text-primary hover:underline font-bold"
                >
                  Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-4xl text-outline-variant/60">notifications_off</span>
                <p className="font-label-md text-label-md text-on-surface-variant">All caught up! No new alerts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3 rounded-lg flex gap-3 cursor-pointer hover:bg-surface-container/50 transition-colors ${
                      !n.isRead ? "bg-surface-container-low border-l-4 border-primary" : "opacity-80"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-primary text-xl">
                        {n.type === "reminder" ? "pill" : n.type === "booking" ? "biotech" : "info"}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-label-md text-label-md text-on-surface font-bold leading-tight">
                        {n.title}
                      </h4>
                      <p className="font-body-md text-xs text-on-surface-variant mt-1 leading-snug">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-outline mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
