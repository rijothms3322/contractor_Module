import React from "react";

export default function WellnessSection() {
  return (
    <section id="wellness" className="px-gutter py-32 bg-surface relative overflow-hidden">
      {/* Decorative SVG Paths in background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.02]">
        <svg width="100%" height="100%">
          <path d="M0,200 Q400,0 800,200 T1600,200" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M0,300 Q400,100 800,300 T1600,300" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>

      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-24 max-w-[800px] mx-auto">
          <span className="text-label-md font-bold text-tertiary tracking-widest uppercase mb-4 block">Holistic Wellness</span>
          <h2 className="font-display-lg text-4xl md:text-5xl mb-6 tracking-tight">Your Health is More Than Just Medicine.</h2>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            True preventive healthcare requires a 360-degree view of your lifestyle. Poor sleep, chronic stress, and dehydration directly impact how your body processes medication. We track the vital signs of your daily life to calculate your Unified Wellness Score.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 relative z-10">
          
          {/* Card 1: Sleep & Recovery */}
          <div className="glass-card rounded-[32px] p-8 border border-outline-variant/20 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">bedtime</span>
            </div>
            <h3 className="font-headline-lg text-2xl mb-3 text-on-surface">Sleep Quality</h3>
            <p className="text-body-md text-on-surface-variant mb-8 leading-relaxed">
              Deep sleep is when cellular repair and immune system strengthening occur. Chronic deprivation limits insulin sensitivity and spikes blood pressure.
            </p>
            
            <div className="bg-surface-container-low rounded-2xl p-5">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="font-display-lg text-3xl text-on-surface">7h 20m</div>
                  <div className="text-label-sm text-on-surface-variant">Last Night</div>
                </div>
                <div className="text-label-sm font-bold text-tertiary bg-tertiary/10 px-2 py-1 rounded-md">Optimal</div>
              </div>
              {/* Mini Bar Chart */}
              <div className="flex items-end justify-between h-16 gap-2">
                <div className="w-full bg-indigo-200 rounded-t-sm h-[60%] hover:bg-indigo-400 transition-colors"></div>
                <div className="w-full bg-indigo-200 rounded-t-sm h-[80%] hover:bg-indigo-400 transition-colors"></div>
                <div className="w-full bg-indigo-200 rounded-t-sm h-[40%] hover:bg-indigo-400 transition-colors"></div>
                <div className="w-full bg-indigo-500 rounded-t-sm h-[90%] relative group-hover:animate-pulse"></div>
                <div className="w-full bg-indigo-200 rounded-t-sm h-[70%] hover:bg-indigo-400 transition-colors"></div>
              </div>
            </div>
          </div>

          {/* Card 2: The Core Score (Elevated) */}
          <div className="glass-pulse rounded-[32px] p-10 border border-primary/20 shadow-2xl shadow-primary/10 transform lg:-translate-y-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[30px] group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="text-center relative z-10">
              <h3 className="font-headline-md text-on-surface mb-2">Unified Wellness Score</h3>
              <p className="text-label-sm text-on-surface-variant">Updated daily based on 14 bio-markers</p>
            </div>
            
            <div className="relative w-56 h-56 mx-auto my-12 flex items-center justify-center">
              {/* Animated Rings */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-md">
                <circle cx="112" cy="112" r="95" fill="none" stroke="var(--color-surface-container-high)" strokeWidth="16" />
                <circle cx="112" cy="112" r="95" fill="none" stroke="var(--color-primary)" strokeWidth="16" strokeDasharray="596" strokeDashoffset="119" strokeLinecap="round" className="progress-ring-circle" style={{ transitionDuration: '2s' }} />
              </svg>
              <div className="text-center relative z-10 animate-in zoom-in duration-1000 delay-300">
                <span className="font-display-lg text-[72px] leading-none text-primary tracking-tighter">80</span>
                <span className="block text-label-md font-bold text-on-surface mt-2 tracking-wide uppercase">Excellent</span>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 relative z-10">
              <p className="text-body-sm text-on-surface-variant text-center">
                Your consistency with evening walks and medication timing has boosted your score by 12 points this month!
              </p>
            </div>
          </div>

          {/* Card 3: Activity & Hydration */}
          <div className="glass-card rounded-[32px] p-8 border border-outline-variant/20 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">water_drop</span>
            </div>
            <h3 className="font-headline-lg text-2xl mb-3 text-on-surface">Hydration & Activity</h3>
            <p className="text-body-md text-on-surface-variant mb-8 leading-relaxed">
              Proper water intake is critical for kidney function, especially when processing chronic medications. Movement improves cardiovascular circulation.
            </p>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-label-md mb-2">
                  <span className="font-headline-md text-on-surface">1.8 Liters</span>
                  <span className="text-secondary font-bold">Goal: 2.5L</span>
                </div>
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[72%] rounded-full relative overflow-hidden">
                     <div className="absolute inset-0 bg-white/30 w-1/2 -skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-label-md mb-2">
                  <span className="font-headline-md text-on-surface">6,432 Steps</span>
                  <span className="text-tertiary font-bold">Goal: 8k</span>
                </div>
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary w-[80%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Required CSS for Shimmer inside component for simplicity or in globals */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(250%); }
        }
      `}} />
    </section>
  );
}
