import React from "react";

export default function LabBookingPreview() {
  return (
    <section id="labs" className="px-gutter py-32 bg-background relative overflow-hidden">
      <div className="max-w-container-max mx-auto">
        
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-[700px]">
             <span className="text-label-md font-bold text-secondary tracking-widest uppercase mb-4 block">Diagnostics</span>
             <h2 className="font-display-lg text-4xl md:text-5xl mb-6">Preventive Health, Delivered.</h2>
             <p className="text-body-lg text-on-surface-variant leading-relaxed">
               Routine blood work is the window to your internal health. We make it effortless. 
               Browse NABL certified labs, compare transparent pricing, and book comprehensive 
               checkups that help catch issues years before they become emergencies.
             </p>
          </div>
          <button className="bg-surface-container-high text-on-surface px-8 py-4 rounded-full font-label-md border border-outline-variant/30 hover:bg-surface-container-highest transition-all shadow-sm hover:shadow-md flex items-center gap-2">
            Explore All Checkups <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* Horizontal Scrolling Premium Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="glass-card rounded-[32px] p-2 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 group cursor-pointer border border-outline-variant/20">
            <div className="bg-surface rounded-[28px] h-full p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[20px] group-hover:scale-150 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-label-sm font-label-md font-bold tracking-wide">COMPREHENSIVE</div>
                <div className="flex items-center gap-1.5 text-label-md bg-surface-container px-3 py-1.5 rounded-full font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">star</span> 4.9
                </div>
              </div>
              
              <h3 className="font-headline-lg text-2xl mb-3 relative z-10">Master Health Checkup</h3>
              <p className="text-body-sm text-on-surface-variant mb-6 flex-grow relative z-10">
                Our most thorough diagnostic package. Evaluates 85 critical parameters across liver, kidney, thyroid, and cardiovascular health. Recommended annually.
              </p>
              
              <div className="space-y-3 mb-8 relative z-10">
                <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-primary">verified</span> Includes HbA1c & Lipid Profile
                </div>
                <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-secondary">schedule</span> Fasting Required (10-12 Hrs)
                </div>
              </div>
              
              <div className="flex items-end justify-between pt-6 border-t border-outline-variant/20 relative z-10">
                <div>
                  <div className="text-label-sm text-on-surface-variant line-through mb-1">₹2499</div>
                  <div className="font-display-lg text-3xl text-on-surface tracking-tight">₹999</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined">add</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-[32px] p-2 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/5 hover:-translate-y-2 group cursor-pointer border border-outline-variant/20 relative transform md:-translate-y-4">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none"></div>
            <div className="bg-surface/90 backdrop-blur-md rounded-[28px] h-full p-8 flex flex-col relative z-10">
              
              <div className="flex justify-between items-start mb-6">
                <div className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg text-label-sm font-label-md font-bold tracking-wide">ESSENTIAL</div>
                <div className="flex items-center gap-1.5 text-label-md bg-surface-container px-3 py-1.5 rounded-full font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">star</span> 4.8
                </div>
              </div>
              
              <h3 className="font-headline-lg text-2xl mb-3">Vitamin Deficiency Profile</h3>
              <p className="text-body-sm text-on-surface-variant mb-6 flex-grow">
                Fatigue and joint pain are often linked to deficiencies. Check your Vitamin D Total, B12, and Iron levels from the comfort of home.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-primary">verified</span> NABL Accredited Lab
                </div>
                <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-secondary">flash_on</span> Reports in 12 hours
                </div>
              </div>
              
              <div className="flex items-end justify-between pt-6 border-t border-outline-variant/20">
                <div>
                  <div className="text-label-sm text-on-surface-variant line-through mb-1">₹1500</div>
                  <div className="font-display-lg text-3xl text-on-surface tracking-tight">₹499</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  <span className="material-symbols-outlined">add</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-[32px] p-2 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-tertiary/5 hover:-translate-y-2 group cursor-pointer border border-outline-variant/20">
            <div className="bg-surface rounded-[28px] h-full p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full blur-[20px] group-hover:scale-150 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="bg-tertiary/10 text-tertiary px-3 py-1.5 rounded-lg text-label-sm font-label-md font-bold tracking-wide">SENIORS</div>
                <div className="flex items-center gap-1.5 text-label-md bg-surface-container px-3 py-1.5 rounded-full font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">star</span> 4.9
                </div>
              </div>
              
              <h3 className="font-headline-lg text-2xl mb-3 relative z-10">Healthy Heart Profile</h3>
              <p className="text-body-sm text-on-surface-variant mb-6 flex-grow relative z-10">
                Deep dive into cardiovascular risks. Includes comprehensive Lipid Profile, Cardiac Risk Markers, HbA1c, and Fasting Blood Sugar.
              </p>
              
              <div className="space-y-3 mb-8 relative z-10">
                <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-primary">verified</span> Free AI Health Insight
                </div>
                <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-secondary">monitor_heart</span> Fasting Required (12 Hrs)
                </div>
              </div>
              
              <div className="flex items-end justify-between pt-6 border-t border-outline-variant/20 relative z-10">
                <div>
                  <div className="text-label-sm text-on-surface-variant line-through mb-1">₹3200</div>
                  <div className="font-display-lg text-3xl text-on-surface tracking-tight">₹1499</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                  <span className="material-symbols-outlined">add</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
