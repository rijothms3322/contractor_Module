"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { DEFAULT_AI_INSIGHTS } from "../../services/wellnessService";
import { supabase } from "../../lib/supabaseClient";

export const InsightsView: React.FC<{
  hideHero?: boolean;
  hideDiagnosticBlocks?: boolean;
}> = ({ hideHero = false, hideDiagnosticBlocks = false }) => {
  const { user, adherenceStreak, adherencePercentage, setActiveTab, reports, uploadReportPlaceholder } = useApp();
  const [showReportUpload, setShowReportUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [aiMessage, setAiMessage] = useState("Loading your personalized wellness sync analysis...");
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    // 1. Resolve greeting based on user's local timezone (fallback to Indian Standard Time if unconfigured/UTC/PDT testing VM)
    let hour = new Date().getHours();
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const targetTimezone = !userTimezone || userTimezone === "UTC" || userTimezone === "America/Los_Angeles"
        ? "Asia/Kolkata"
        : userTimezone;
        
      const timeString = new Date().toLocaleTimeString("en-US", {
        timeZone: targetTimezone,
        hour12: false,
        hour: "numeric",
      });
      const parsed = parseInt(timeString, 10);
      if (!isNaN(parsed)) {
        hour = parsed;
      }
    } catch (e) {
      hour = new Date().getHours();
    }

    let gStr = "Good morning";
    if (hour >= 12 && hour < 17) gStr = "Good afternoon";
    else if (hour >= 17 && hour < 21) gStr = "Good evening";
    else if (hour >= 21 || hour < 5) gStr = "Good night";
    setGreeting(gStr);

    // 2. Query database for AI sync insights
    const fetchInsights = async () => {
      if (supabase) {
        try {
          // Race the database query with a 1.5 second timeout to prevent hangs
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 1500)
          );
          const queryPromise = supabase.from("ai_insights").select("message");
          const result = await Promise.race([queryPromise, timeoutPromise]) as any;
          
          const { data, error } = result;
          if (data && !error && data.length > 0) {
            const msgs = data.map((d: any) => d.message);
            const randIdx = Math.floor(Math.random() * msgs.length);
            setAiMessage(msgs[randIdx]);
            return;
          }
        } catch (e) {
          console.warn("Could not load insights from database, using offline presets", e);
        }
      }
      
      const randIdx = Math.floor(Math.random() * DEFAULT_AI_INSIGHTS.length);
      setAiMessage(DEFAULT_AI_INSIGHTS[randIdx]);
    };

    fetchInsights();
  }, []);

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
      {!hideHero && (
        <section className="relative overflow-hidden rounded-3xl p-6 shadow-lg border border-white/20 bg-gradient-to-br from-tertiary-container/80 via-surface to-primary-container/40 animate-in fade-in duration-300">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-dots-pattern"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-tertiary/20 rounded-full blur-3xl animate-pulse pointer-events-none transform -translate-x-1/2 translate-y-1/2" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-5 items-start w-full">
              <div className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-md text-tertiary flex items-center justify-center flex-shrink-0 shadow-sm border border-white/50">
                <span className="material-symbols-outlined text-3xl font-bold">spa</span>
              </div>
              <div className="flex-grow text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-headline-md text-xl text-secondary font-bold tracking-tight">
                    {greeting}! 👋
                  </h2>
                  <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI Sync
                  </span>
                </div>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed opacity-90 max-w-md">
                  "{aiMessage}"
                </p>
              </div>
            </div>
          </div>
        </section>
      )}


      {!hideDiagnosticBlocks && (
        <>
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
        </>
      )}
    </div>
  );
};
