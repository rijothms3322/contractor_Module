"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export const InsightsView: React.FC = () => {
  const { adherenceStreak, adherencePercentage, setActiveTab, reports, uploadReportPlaceholder } = useApp();
  const [selectedRange, setSelectedRange] = useState<"day" | "week">("week");
  const [showReportUpload, setShowReportUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadText, setUploadText] = useState("");

  const handleManualUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadText) return;

    uploadReportPlaceholder(uploadTitle, uploadText);
    setUploadTitle("");
    setUploadText("");
    setShowReportUpload(false);
  };

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-300">
      
      {/* 1. Hero Weekly Health Pulse Section */}
      <section className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-shrink-0 relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tertiary to-secondary flex items-center justify-center text-white shadow-lg animate-pulse">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary-container text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
            Live AI
          </div>
        </div>

        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-secondary mb-1">
            Weekly Health Pulse
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            "Your blood sugar levels have <span className="text-tertiary font-bold">stabilized by 12%</span> since last week. Consistent morning walks and your Atorvastatin schedule are showing a positive impact on your metabolic recovery."
          </p>
        </div>
      </section>

      {/* 2. Bento Grid Layout */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Glucose stability bar chart */}
        <div className="md:col-span-8 glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 min-h-[340px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-headline-md text-base text-secondary font-bold">Glucose Stability</h3>
              <p className="font-label-md text-xs text-on-surface-variant">Last 7 Days (mg/dL)</p>
            </div>
            <div className="flex gap-1 bg-surface-container p-1 rounded-full text-xs">
              <button
                onClick={() => setSelectedRange("day")}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  selectedRange === "day" ? "bg-white text-secondary shadow-sm" : "text-on-surface-variant hover:text-secondary"
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setSelectedRange("week")}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  selectedRange === "week" ? "bg-white text-secondary shadow-sm" : "text-on-surface-variant hover:text-secondary"
                }`}
              >
                Week
              </button>
            </div>
          </div>

          {/* Interactive vertical charts representation */}
          <div className="flex-grow flex items-end gap-2 md:gap-4 w-full h-44 px-2 pt-4">
            <div className="flex-grow bg-secondary/10 rounded-t-lg relative group h-[60%]">
              <div className="absolute inset-x-0 bottom-0 bg-secondary/40 rounded-t-lg h-full transition-all group-hover:bg-secondary/60" />
            </div>
            <div className="flex-grow bg-secondary/10 rounded-t-lg relative group h-[45%]">
              <div className="absolute inset-x-0 bottom-0 bg-secondary/40 rounded-t-lg h-full transition-all group-hover:bg-secondary/60" />
            </div>
            <div className="flex-grow bg-secondary/10 rounded-t-lg relative group h-[85%]">
              <div className="absolute inset-x-0 bottom-0 bg-secondary/40 rounded-t-lg h-full transition-all group-hover:bg-secondary/60" />
            </div>
            <div className="flex-grow bg-secondary/10 rounded-t-lg relative group h-[70%]">
              <div className="absolute inset-x-0 bottom-0 bg-secondary/40 rounded-t-lg h-full transition-all group-hover:bg-secondary/60" />
            </div>
            <div className="flex-grow bg-secondary/10 rounded-t-lg relative group h-[95%]">
              <div className="absolute inset-x-0 bottom-0 bg-secondary/40 rounded-t-lg h-full transition-all group-hover:bg-secondary/60" />
            </div>
            <div className="flex-grow bg-secondary/10 rounded-t-lg relative group h-[65%]">
              <div className="absolute inset-x-0 bottom-0 bg-secondary/40 rounded-t-lg h-full transition-all group-hover:bg-secondary/60" />
            </div>
            {/* today's highlighted bar */}
            <div className="flex-grow bg-secondary/10 rounded-t-lg relative group h-[50%]">
              <div className="absolute inset-x-0 bottom-0 bg-tertiary-container rounded-t-lg h-full shadow-[0_0_12px_rgba(0,179,81,0.4)]" />
            </div>
          </div>

          <div className="flex justify-between mt-4 px-2 text-outline font-bold font-label-sm text-[10px] uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span className="text-tertiary">Today</span>
          </div>
        </div>

        {/* Adherence Streak wheel representation */}
        <div className="md:col-span-4 glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 border-l-4 border-tertiary flex flex-col justify-between">
          <h3 className="font-headline-md text-base text-secondary font-bold mb-3">Dose Adherence</h3>
          
          <div className="flex flex-col items-center py-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-surface-container-highest"
                  cx="56"
                  cy="56"
                  fill="transparent"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  className="text-tertiary rounded-full"
                  cx="56"
                  cy="56"
                  fill="transparent"
                  r="50"
                  stroke="currentColor"
                  strokeDasharray="314.16"
                  strokeDashoffset={314.16 * (1 - adherencePercentage / 100)}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-2xl font-bold text-on-background">{adherenceStreak}</span>
                <span className="font-label-sm text-[9px] text-outline uppercase tracking-wider mt-1">Days</span>
              </div>
            </div>
            
            <p className="mt-4 text-center font-body-md text-xs text-on-surface-variant leading-relaxed">
              You are on a <span className="font-bold text-tertiary">{adherenceStreak}-day streak</span>! Consistent schedules reduce health risks by 24%.
            </p>
          </div>
        </div>

      </section>

      {/* 3. Recommended Tests & PDF Downloads bento column */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recommended Tests */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-xl">event_upcoming</span>
            <h3 className="font-headline-md text-base text-secondary font-bold">Recommended Diagnostic Tests</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center p-3.5 bg-surface-container-low rounded-xl gap-3 hover:bg-surface-container transition-colors cursor-pointer" onClick={() => setActiveTab("health")}>
              <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl">bloodtype</span>
              </div>
              <div className="flex-grow text-left">
                <h4 className="font-label-md text-xs text-secondary font-bold leading-tight">Lipid Profile Test</h4>
                <p className="font-body-md text-[10px] text-on-surface-variant mt-0.5">Recommended based on Hypertension history.</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-sm">chevron_right</span>
            </div>

            <div className="flex items-center p-3.5 bg-surface-container-low rounded-xl gap-3 hover:bg-surface-container transition-colors cursor-pointer" onClick={() => setActiveTab("health")}>
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl">ecg</span>
              </div>
              <div className="flex-grow text-left">
                <h4 className="font-label-md text-xs text-secondary font-bold leading-tight">HbA1c Blood Glucose</h4>
                <p className="font-body-md text-[10px] text-on-surface-variant mt-0.5">Recommended to track metabolic index every 90 days.</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-sm">chevron_right</span>
            </div>
          </div>
        </div>

        {/* Reports History & Manual PDF Uploader */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">analytics</span>
              <h3 className="font-headline-md text-base text-secondary font-bold">Diagnostic PDF Reports</h3>
            </div>
            <button
              onClick={() => setShowReportUpload(true)}
              className="text-xs text-primary font-bold hover:underline"
            >
              Upload Report
            </button>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => alert(`[Medimz AI Report Audit]\n\nTest: ${rep.testName}\nDate: ${rep.date}\n\nAI Analysis:\n${rep.aiSummary}`)}
                className="p-3 bg-gradient-to-br from-secondary/5 to-secondary-container/5 hover:from-secondary/10 hover:to-secondary-container/10 border border-outline-variant/20 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="flex gap-2.5 items-center">
                  <div className="w-8 h-8 bg-secondary text-white rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-xs text-secondary font-bold leading-tight truncate w-40">{rep.testName}</h4>
                    <p className="font-body-md text-[9px] text-outline mt-0.5">{rep.date} • Medimz AI Audited</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary text-base">download</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 4. MANUAL REPORT UPLOAD MODAL */}
      {showReportUpload && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-base text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">cloud_upload</span>
                <span>Upload Laboratory Report</span>
              </h3>
              <button
                onClick={() => setShowReportUpload(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleManualUpload} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-label-md text-xs text-on-surface-variant font-bold">Checkup Test Name</label>
                <input
                  type="text"
                  placeholder="e.g. Liver Function Test"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-xs text-on-surface-variant font-bold">Report Summary Notes</label>
                <textarea
                  placeholder="Paste laboratory parameters or doctors diagnosis notes..."
                  required
                  rows={4}
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all shadow-md"
              >
                Analyze Report with Medimz AI
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
