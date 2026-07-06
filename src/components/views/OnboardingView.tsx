"use client";

import React, { useState } from "react";

interface OnboardingViewProps {
  onEnterAuth: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onEnterAuth }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Pill Reminders",
      subtitle: "Never miss a dose. Track today's schedule, weekly adherence, and get proactive pharmacy refill notifications.",
      icon: "pill",
      colorClass: "from-primary to-primary-container",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      imageAlt: "Colorful medicine pills organized neatly"
    },
    {
      title: "AI Health Companion",
      subtitle: "Smart insights, daily pulse reviews, and personalized habits recommendations focused on diagnostics tracking.",
      icon: "psychology",
      colorClass: "from-secondary to-secondary-container",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      imageAlt: "Doctor showing health dashboard on tablet"
    },
    {
      title: "Diagnostics from Home",
      subtitle: "Browse checkups, select rated laboratories, add saved home addresses, and track sample collection phlebotomists.",
      icon: "biotech",
      colorClass: "from-tertiary to-tertiary-container",
      image: "https://images.unsplash.com/photo-1579152276502-8b6f2403b551?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      imageAlt: "Blood collection vial in high-tech lab"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onEnterAuth();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between items-center py-8 px-gutter max-w-[480px] mx-auto relative overflow-hidden">
      {/* Background Heartbeat Pulse Effect */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-[300px] text-primary animate-pulse" style={{ fontVariationSettings: "'wght' 100" }}>
          favorite
        </span>
      </div>

      {/* Top App Bar Header placeholder */}
      <div className="w-full flex justify-between items-center z-10">
        <div className="flex items-center gap-2 select-none">
          <img src="/logo.png" alt="MEDIMZ Logo" className="h-9 w-auto object-contain" />
        </div>
        <button
          onClick={onEnterAuth}
          className="font-label-md text-label-md text-secondary hover:text-primary transition-colors py-2 px-4 rounded-full bg-surface-container-low font-bold"
        >
          Skip
        </button>
      </div>

      {/* Slide Content */}
      <div className="w-full flex-grow flex flex-col justify-center items-center z-10 py-8">
        {/* Rounded image Container with heartbeat-pulse glow */}
        <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest/80 relative mb-8 animate-in zoom-in-95 duration-500">
          <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].colorClass} opacity-10`} />
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].imageAlt}
            className="w-full h-full object-cover"
          />
          {/* Floating Icon */}
          <div className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${slides[currentSlide].colorClass} text-white flex items-center justify-center shadow-lg`}>
            <span className="material-symbols-outlined text-2xl">{slides[currentSlide].icon}</span>
          </div>
        </div>

        {/* Text Area */}
        <div className="text-center max-w-[360px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="font-display-lg text-3xl text-secondary mb-3 font-bold leading-tight">
            {slides[currentSlide].title}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {slides[currentSlide].subtitle}
          </p>
        </div>
      </div>

      {/* Bottom Navigation controls */}
      <div className="w-full flex flex-col items-center gap-6 z-10">
        {/* Dot Indicators */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? "w-8 bg-primary" : "w-2.5 bg-surface-container-highest"
              }`}
            />
          ))}
        </div>

        {/* Dynamic primary button */}
        <button
          onClick={handleNext}
          className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-xl hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 group"
        >
          <span>{currentSlide === slides.length - 1 ? "Get Started" : "Continue"}</span>
          <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};
