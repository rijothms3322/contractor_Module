import React from "react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] px-gutter pt-32 pb-20 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Immersive Ambient Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--color-surface-container-low)_0%,_var(--color-background)_100%)] pointer-events-none"></div>
      <div className="absolute top-1/4 left-[10%] w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-secondary-container/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] right-[5%] w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-primary-container/15 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>

      {/* Floating Particles (CSS handled inline for demo) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[20%] left-[20%] w-2 h-2 rounded-full bg-primary/40 animate-ping" style={{ animationDuration: '4s' }}></div>
         <div className="absolute top-[60%] right-[25%] w-3 h-3 rounded-full bg-tertiary/40 animate-ping" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
         <div className="absolute bottom-[30%] left-[30%] w-1.5 h-1.5 rounded-full bg-secondary/50 animate-bounce" style={{ animationDuration: '5s' }}></div>
      </div>

      <div className="relative z-20 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-surface-container/60 backdrop-blur-md border border-outline-variant/30 text-label-md text-primary mb-8 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          Your Daily Healthcare Companion
        </div>
        
        <h1 className="font-display-lg text-4xl md:text-[72px] leading-[1.1] text-on-surface mb-8 tracking-tight">
          Smarter Healthcare Starts With <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">Better Habits.</span>
        </h1>
        
        <p className="font-body-lg text-on-surface-variant max-w-[650px] mx-auto mb-12 text-lg md:text-xl leading-relaxed">
          Medimz helps you build bulletproof wellness routines. From ensuring you never miss a vital medication to delivering diagnostic insights that actually make sense, we make staying healthy effortless.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <button className="w-full sm:w-auto bg-primary text-on-primary px-10 py-4 rounded-full font-label-md shadow-[0_8px_30px_rgb(160,65,23,0.3)] hover:bg-primary/90 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(160,65,23,0.4)] text-base">
            Start Your Health Journey
          </button>
          <button className="w-full sm:w-auto bg-surface/80 backdrop-blur-md text-on-surface px-10 py-4 rounded-full font-label-md border border-outline-variant/40 hover:bg-surface-container-low transition-all hover:-translate-y-1 text-base flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">play_circle</span>
            See How It Works
          </button>
        </div>
      </div>

      {/* Layered Motion Dashboard Preview */}
      <div className="relative w-full max-w-[1000px] mx-auto mt-24 h-[350px] md:h-[500px] perspective-[2000px]">
        {/* Main Glass Dashboard */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[95%] md:w-[85%] h-full glass-card rounded-[40px] p-8 shadow-[0_30px_100px_rgba(9,100,144,0.15)] border-t border-l border-white/60 animate-in zoom-in-[0.98] slide-in-from-bottom-24 duration-[1500ms] delay-300 fill-mode-both flex flex-col z-10 transform-gpu rotate-x-[5deg] hover:rotate-x-0 transition-transform duration-700 ease-out">
          
          <div className="flex items-center justify-between mb-10">
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container text-on-primary-container flex items-center justify-center font-display-lg text-2xl shadow-inner">A</div>
              <div>
                <div className="font-headline-lg text-on-surface">Good Morning, Alex</div>
                <div className="text-body-md text-on-surface-variant mt-1">Your wellness score is trending up this week!</div>
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <div className="w-3 h-3 rounded-full bg-tertiary"></div>
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-grow">
             {/* Stat Card */}
             <div className="bg-surface/60 backdrop-blur-sm rounded-[24px] p-6 border border-outline-variant/20 flex flex-col justify-between group hover:bg-surface-container-low transition-colors">
               <div className="flex justify-between items-start">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                   <span className="material-symbols-outlined">pill</span>
                 </div>
                 <span className="text-label-sm font-bold text-tertiary bg-tertiary/10 px-2 py-1 rounded-lg">+14 Days</span>
               </div>
               <div>
                 <div className="font-display-lg text-4xl text-on-surface mb-1">100%</div>
                 <div className="text-label-md text-on-surface-variant">Medication Adherence</div>
               </div>
             </div>
             
             {/* Insight Card */}
             <div className="bg-surface/60 backdrop-blur-sm rounded-[24px] p-6 border border-outline-variant/20 flex flex-col justify-between group hover:bg-surface-container-low transition-colors relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-container/30 rounded-full blur-[20px] group-hover:scale-150 transition-transform duration-700"></div>
               <div className="flex justify-between items-start relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                   <span className="material-symbols-outlined">monitor_heart</span>
                 </div>
               </div>
               <div className="relative z-10">
                 <div className="font-display-lg text-4xl text-on-surface mb-1">89</div>
                 <div className="text-label-md text-on-surface-variant">Overall Wellness Score</div>
               </div>
             </div>

             <div className="bg-gradient-to-br from-secondary/10 to-primary/5 rounded-[24px] p-6 border border-secondary/10 hidden md:flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="font-label-sm text-secondary font-bold tracking-widest mb-4 uppercase">AI Insight</div>
                  <p className="text-body-md text-on-surface-variant leading-relaxed font-medium">Your vitamin D intake is perfectly aligned with your recent lab report. Keep up the 8AM routine!</p>
                </div>
             </div>
          </div>
        </div>

        {/* Floating Reminder Card - Overlapping Left */}
        <div className="absolute top-[20%] left-[-5%] md:left-[2%] glass-pulse rounded-[24px] p-5 flex items-center gap-4 z-30 shadow-[0_20px_40px_rgba(0,0,0,0.08)] animate-bounce transform hover:scale-105 transition-transform cursor-default border border-white/50" style={{ animationDuration: '4s' }}>
          <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined">alarm</span>
          </div>
          <div>
            <div className="font-headline-md text-on-surface">Time for Amlodipine</div>
            <div className="text-label-sm text-on-surface-variant mt-1">Take with food • 5mg</div>
          </div>
        </div>

        {/* Floating Success Card - Overlapping Right */}
        <div className="absolute bottom-[20%] right-[-5%] md:right-[2%] glass-card bg-white/80 rounded-[24px] p-5 flex items-center gap-4 z-30 shadow-[0_20px_40px_rgba(0,0,0,0.08)] animate-pulse border border-success/20 transform hover:-translate-y-2 transition-transform cursor-default" style={{ animationDuration: '5s' }}>
          <div className="w-12 h-12 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined">check</span>
          </div>
          <div>
            <div className="font-headline-md text-on-surface">Sample Collected</div>
            <div className="text-label-sm text-on-surface-variant mt-1">Reports expected by 6 PM</div>
          </div>
        </div>
      </div>
    </section>
  );
}
