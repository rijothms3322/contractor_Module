"use client";

import React, { useEffect, useState } from "react";

interface SplashScreenProps {
  onFadeComplete: () => void;
}

const SPLASH_STYLES = `
  @keyframes pulse-bg {
    0%, 100% { transform: scale(1); opacity: 0.08; }
    50% { transform: scale(1.08); opacity: 0.13; }
  }
  @keyframes heartbeat {
    0% { transform: scale(1); opacity: 0.15; }
    14% { transform: scale(1.08); opacity: 0.3; }
    28% { transform: scale(1); opacity: 0.15; }
    42% { transform: scale(1.08); opacity: 0.3; }
    70% { transform: scale(1); opacity: 0.15; }
  }
  @keyframes loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .pulse-bg {
    animation: pulse-bg 8s ease-in-out infinite;
  }
  .heartbeat-layer {
    background: radial-gradient(circle, rgba(238, 123, 77, 0.22) 0%, transparent 70%);
    animation: heartbeat 2.2s ease-in-out infinite;
  }
  .loading-bar {
    width: 160px;
    height: 3px;
    background: rgba(9, 100, 144, 0.1);
    border-radius: 9999px;
    overflow: hidden;
  }
  .loading-progress {
    width: 100%;
    height: 100%;
    background: #ee7b4d;
    border-radius: 9999px;
    animation: loading 2.2s infinite ease-in-out;
  }
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFadeComplete }) => {
  const [fadeClass, setFadeClass] = useState("opacity-100");

  useEffect(() => {
    // 2900 ms -> Start fade out transition
    const fadeTimer = setTimeout(() => {
      setFadeClass("opacity-0 transition-opacity duration-500 ease-out pointer-events-none");
    }, 2900);

    // 3400 ms -> Complete transition
    const completeTimer = setTimeout(() => {
      onFadeComplete();
    }, 3400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onFadeComplete]);

  return (
    <div className={`fixed inset-0 z-[99999] bg-surface overflow-hidden h-screen w-screen flex flex-col items-center justify-center ${fadeClass}`}>
      <style dangerouslySetInnerHTML={{ __html: SPLASH_STYLES }} />

      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f9f9ff] via-[#e7eeff]/40 to-[#dee8ff]/30"></div>
        {/* Soft pulse circles */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-secondary opacity-10 pulse-bg blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-[#ee7b4d] opacity-10 pulse-bg blur-3xl" style={{ animationDelay: "-3s" }}></div>
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 flex flex-col items-center justify-between h-full py-16 px-gutter w-full max-w-[480px] mx-auto text-center pointer-events-none">
        {/* Top Spacer */}
        <div></div>

        {/* Center Identity Cluster */}
        <div className="animate-fade-in space-y-4 flex flex-col items-center">
          {/* Brand Logo Frame */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Heartbeat Pulse Effect behind logo */}
            <div className="absolute inset-0 heartbeat-layer rounded-full"></div>
            
            {/* Main Logo */}
            <img
              alt="Medimz Healthcare Logo"
              className="relative w-[85%] h-[85%] object-contain drop-shadow-[0_8px_30px_rgba(238,123,77,0.18)]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA29inFKXJTa_PAsRNASYjyxIO0R9FGaLxiWaN1190ku6FG_T4Q0lwqij74owHbSPOjRsedjl9sdpu-jQ2Um8HcfAAClSDsv0tH0AXy5miou5u5cTp9O83qsfVh1laDVteXHtUVEJdMeFt-ksXXUAe8GCKaQE6rniCDVtq4uk9ywv8EiFCEhbMT6-wQYBhhFmasfOI0kX1lT7v9DslXO3uAK0v9eKZgjOI1TcNOy_f5JIIoQR4lKDPpDvVcJ4rYVDQoLg"
            />
          </div>
        </div>

        {/* Bottom Footer Cluster */}
        <div className="animate-fade-in flex flex-col items-center space-y-4" style={{ animationDelay: "0.4s" }}>
          {/* Loading Indicator */}
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>

          {/* Intelligent Tagline */}
          <div className="flex items-center space-x-2 text-secondary/70">
            <span className="material-symbols-outlined !text-[18px] text-[#ee7b4d]">auto_awesome</span>
            <span className="font-label-md uppercase tracking-[0.2em] font-semibold text-[10px] sm:text-xs">
              Compassionate Care, Powered by Intelligence
            </span>
          </div>

          {/* Subtle Regulatory/Medical Grade Anchor */}
          <p className="font-label-sm text-[10px] text-on-surface-variant/40 pt-2">
            Version 2.4.0 • Secure Clinical Encryption
          </p>
        </div>
      </main>
    </div>
  );
};
