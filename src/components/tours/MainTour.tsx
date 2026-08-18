"use client";

import React from "react";

interface MainTourProps {
  onContinue: () => void;
  onSkip: () => void;
}

export const MainTour: React.FC<MainTourProps> = ({
  onContinue,
  onSkip,
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
              alt="Medimz Healthcare Logo"
              className="relative w-[60%] h-[60%] object-contain drop-shadow-[0_8px_30px_rgba(238,123,77,0.18)]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA29inFKXJTa_PAsRNASYjyxIO0R9FGaLxiWaN1190ku6FG_T4Q0lwqij74owHbSPOjRsedjl9sdpu-jQ2Um8HcfAAClSDsv0tH0AXy5miou5u5cTp9O83qsfVh1laDVteXHtUVEJdMeFt-ksXXUAe8GCKaQE6rniCDVtq4uk9ywv8EiFCEhbMT6-wQYBhhFmasfOI0kX1lT7v9DslXO3uAK0v9eKZgjOI1TcNOy_f5JIIoQR4lKDPpDvVcJ4rYVDQoLg"
            />
        </div>

        {/* Card */}
        <div className="bg-white rounded-[32px] shadow-xl px-7 py-8">

          <p className="text-on-primary-container/85 text-center mt-4 leading-7 text-lg">
            Compassionate Care, Powered by Intelligence. Let's begin your
            personalized health journey.
          </p>

          {/* Button */}
          <button
            onClick={onContinue}
            className="mt-10 w-full h-14 rounded-xl bg-[#ee7b4d] text-white font-semibold text-lg shadow-lg hover:opacity-95 transition active:scale-95 flex items-center justify-center gap-2"
          >
            Start the tour
            <span>→</span>
          </button>

          {/* Skip */}
          <button
            onClick={onSkip}
            className="w-full mt-6 text-primary font-medium"
          >
            Skip
          </button>

          {/* Terms */}
          <p className="mt-4 text-center text-xs text-gray-600 leading-5">
            By continuing, you agree to our{" "}
            <span className="font-medium">Terms &amp; Conditions</span>
          </p>
        </div>
      </div>
    </div>
  );
};