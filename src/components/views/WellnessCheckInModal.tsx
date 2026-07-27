"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";

interface WellnessCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WellnessCheckInModal: React.FC<WellnessCheckInModalProps> = ({ isOpen, onClose }) => {
  const { addWellnessLog, wellnessLogs } = useApp();
  if (!isOpen) return null;

  const t = {
    title: "Daily Wellness Check-In",
    subtitle: "How are you feeling today?",
    great: "Great",
    okay: "Okay",
    notWell: "Not Well",
    needHelp: "Need Help",
    disclaimer: "Your response is securely logged and accessible by your caregivers.",
    cancel: "Ask me later"
  };

  const handleMoodSelect = (mood: "great" | "okay" | "not_well" | "need_help") => {
    addWellnessLog(mood);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-container/90 backdrop-blur-md flex items-center justify-center p-gutter animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-xl flex flex-col gap-5 relative text-left">
        
        {/* Simple Header */}
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/15">
          <span className="font-label-md text-xs font-extrabold text-secondary uppercase tracking-wider">☀️ Medimz Check-In</span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="font-headline-lg text-lg font-black text-secondary">{t.title}</h2>
          <p className="font-body-md text-xs text-on-surface-variant font-semibold">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* GREAT */}
          <button
            onClick={() => handleMoodSelect("great")}
            className="p-4 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/50 rounded-2xl flex flex-col items-center gap-2 hover:scale-[1.01] active:scale-98 transition-all group"
          >
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">😀</span>
            <span className="font-label-md text-xs font-black text-emerald-800">{t.great}</span>
          </button>

          {/* OKAY */}
          <button
            onClick={() => handleMoodSelect("okay")}
            className="p-4 bg-blue-50 hover:bg-blue-100/70 border border-blue-200/50 rounded-2xl flex flex-col items-center gap-2 hover:scale-[1.01] active:scale-98 transition-all group"
          >
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">🙂</span>
            <span className="font-label-md text-xs font-black text-blue-800">{t.okay}</span>
          </button>

          {/* NOT WELL */}
          <button
            onClick={() => handleMoodSelect("not_well")}
            className="p-4 bg-orange-50 hover:bg-orange-100/70 border border-orange-200/50 rounded-2xl flex flex-col items-center gap-2 hover:scale-[1.01] active:scale-98 transition-all group"
          >
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">😐</span>
            <span className="font-label-md text-xs font-black text-orange-800">{t.notWell}</span>
          </button>

          {/* NEED HELP */}
          <button
            onClick={() => handleMoodSelect("need_help")}
            className="p-4 bg-red-50 hover:bg-red-100/70 border border-red-200/50 rounded-2xl flex flex-col items-center gap-2 hover:scale-[1.01] active:scale-98 transition-all group animate-pulse"
          >
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">😣</span>
            <span className="font-label-md text-xs font-black text-red-800">{t.needHelp}</span>
          </button>
        </div>

        <p className="text-[10px] text-on-surface-variant/80 text-center leading-relaxed font-semibold">
          {t.disclaimer}
        </p>

        <div className="pt-2 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-outline font-label-md text-xs hover:bg-surface-container-low transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
