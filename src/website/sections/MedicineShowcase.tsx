import React from "react";

export default function MedicineShowcase() {
  return (
    <section id="reminders" className="px-gutter py-32 bg-surface-container-low relative overflow-hidden">
      {/* Educational Background Flow */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-20 max-w-[800px] mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <span className="material-symbols-outlined text-3xl">medical_information</span>
          </div>
          <h2 className="font-display-lg text-4xl md:text-5xl mb-6 tracking-tight">Never Miss a Dose. Ever.</h2>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            Did you know that 50% of medications for chronic diseases are not taken as prescribed? 
            Inconsistent timing reduces drug efficacy and risks your long-term health. Medimz is engineered 
            with behavioral psychology to turn your medical prescriptions into unbreakable daily habits.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Visual Interactive Storytelling */}
          <div className="relative h-[600px] flex items-center justify-center perspective-[1000px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/20 via-surface to-secondary-container/20 rounded-[60px] transform -rotate-3 blur-[20px]"></div>
            
            {/* Main Phone/Card Interface */}
            <div className="w-[90%] md:w-[75%] h-[90%] glass-card rounded-[40px] p-8 shadow-2xl relative z-10 border border-white/60 bg-white/40 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline-lg text-on-surface">Today's Protocol</h3>
                  <p className="text-label-md text-on-surface-variant mt-1">Thursday, Oct 12</p>
                </div>
                <div className="w-14 h-14 rounded-full border-4 border-surface-container-highest relative flex items-center justify-center">
                   <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                     <circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-tertiary)" strokeWidth="4" strokeDasharray="138" strokeDashoffset="34" strokeLinecap="round" className="transition-all duration-1000" />
                   </svg>
                   <span className="font-label-sm font-bold text-tertiary">75%</span>
                </div>
              </div>

              <div className="space-y-4 flex-grow overflow-y-auto scrollbar-hide pr-2">
                {/* Completed Task */}
                <div className="bg-surface rounded-2xl p-5 border border-outline-variant/10 shadow-sm opacity-60 flex gap-4 items-center transition-all">
                   <div className="w-10 h-10 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined">check</span>
                   </div>
                   <div className="flex-grow">
                     <h4 className="font-headline-md text-on-surface line-through decoration-2 decoration-outline-variant/40">Thyroxine Sodium</h4>
                     <p className="text-label-sm text-on-surface-variant">25mcg • Empty Stomach</p>
                   </div>
                   <div className="text-label-sm text-on-surface-variant font-medium">07:00 AM</div>
                </div>

                {/* Active Pending Task (Pulsing) */}
                <div className="bg-surface rounded-2xl p-5 border-2 border-primary shadow-lg flex gap-4 items-center transform scale-105 transition-all relative z-20">
                   <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary animate-ping"></div>
                   <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined">medication_liquid</span>
                   </div>
                   <div className="flex-grow">
                     <h4 className="font-headline-md text-on-surface">Metformin SR</h4>
                     <p className="text-label-sm text-primary font-bold mt-1">Take Now (Post Lunch)</p>
                   </div>
                   <button className="bg-primary text-on-primary w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md">
                     <span className="material-symbols-outlined">done</span>
                   </button>
                </div>

                {/* Educational Nudge inside the UI */}
                <div className="mt-6 bg-secondary/5 rounded-2xl p-5 border border-secondary/10 flex gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                  <span className="material-symbols-outlined text-secondary mt-0.5">lightbulb</span>
                  <div>
                    <h5 className="font-label-md text-on-surface mb-1">Why take this post-lunch?</h5>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">Metformin can cause mild stomach upset if taken on an empty stomach. Eating food buffers the absorption rate.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gamification Floating Element */}
            <div className="absolute -bottom-8 -right-4 lg:-right-12 glass-pulse rounded-3xl p-6 z-30 shadow-2xl flex items-center gap-5 border border-white/60 transform hover:-translate-y-2 transition-transform duration-500">
              <div className="text-5xl drop-shadow-md">🔥</div>
              <div>
                <div className="font-display-lg text-3xl text-on-surface">24 Days</div>
                <div className="text-label-md text-on-surface-variant font-medium uppercase tracking-wide">Perfect Streak</div>
              </div>
            </div>
          </div>

          {/* Deep Content / Features */}
          <div className="space-y-12">
            <div>
              <h3 className="font-headline-lg text-2xl mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm"><span className="material-symbols-outlined text-[16px]">psychology</span></span>
                Behavioral Smart Nudges
              </h3>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Traditional alarms are easy to ignore. Medimz uses context-aware notifications. We remind you to take meds "after breakfast" rather than a rigid "9:00 AM", aligning with your actual human routine.
              </p>
            </div>

            <div>
              <h3 className="font-headline-lg text-2xl mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center text-sm"><span className="material-symbols-outlined text-[16px]">auto_graph</span></span>
                Clinical Adherence Tracking
              </h3>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Your doctor needs to know if a treatment is failing because it's ineffective, or because doses were missed. Medimz builds a verified adherence timeline that you can instantly share with your physician.
              </p>
            </div>

            <div>
              <h3 className="font-headline-lg text-2xl mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-sm"><span className="material-symbols-outlined text-[16px]">family_restroom</span></span>
                Caregiver Escalo-Reminders
              </h3>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Caring for an aging parent? If they miss a critical medication window by 30 minutes, Medimz automatically alerts you or a designated caregiver so you can step in before it's too late.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
