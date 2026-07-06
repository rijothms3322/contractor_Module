import React from "react";

export default function HealthInsights() {
  return (
    <section className="px-gutter py-32 bg-surface-container-low relative overflow-hidden">
      
      {/* Abstract Glowing Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--color-primary-container)_0%,_transparent_70%)] opacity-20 blur-[80px] pointer-events-none"></div>

      <div className="max-w-container-max mx-auto relative z-10">
        
        <div className="text-center mb-24 max-w-[800px] mx-auto">
          <span className="text-label-md font-bold text-primary tracking-widest uppercase mb-4 block">Your Wellness Companion</span>
          <h2 className="font-display-lg text-4xl md:text-5xl mb-6 tracking-tight">AI That Speaks Human.</h2>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            Medical reports are full of complex jargon and scary numbers. Medimz AI translates your 
            lab results and daily habits into friendly, understandable, and actionable wellness advice. 
            We are not a diagnostic engine—we are your personal health translator.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content Features */}
          <div className="space-y-10 order-2 lg:order-1">
            <div className="glass-card bg-surface/40 p-6 rounded-3xl border border-outline-variant/20 hover:bg-surface/80 transition-colors">
               <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                   <span className="material-symbols-outlined text-2xl">translate</span>
                 </div>
                 <div>
                   <h4 className="font-headline-lg text-2xl mb-2 text-on-surface">Report Translation</h4>
                   <p className="text-body-md text-on-surface-variant leading-relaxed">
                     Upload any PDF. Instead of just seeing "HbA1c: 6.2%", our AI explains: "Your average blood sugar is slightly elevated. Let's work on reducing refined carbs."
                   </p>
                 </div>
               </div>
            </div>

            <div className="glass-card bg-surface/40 p-6 rounded-3xl border border-outline-variant/20 hover:bg-surface/80 transition-colors">
               <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                   <span className="material-symbols-outlined text-2xl">insights</span>
                 </div>
                 <div>
                   <h4 className="font-headline-lg text-2xl mb-2 text-on-surface">Trend Visualization</h4>
                   <p className="text-body-md text-on-surface-variant leading-relaxed">
                     Health is a marathon, not a sprint. We automatically plot your test results over years, helping you visualize your progress visually and intuitively.
                   </p>
                 </div>
               </div>
            </div>

            <div className="glass-card bg-surface/40 p-6 rounded-3xl border border-outline-variant/20 hover:bg-surface/80 transition-colors">
               <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                   <span className="material-symbols-outlined text-2xl">restaurant</span>
                 </div>
                 <div>
                   <h4 className="font-headline-lg text-2xl mb-2 text-on-surface">Lifestyle & Diet Nudges</h4>
                   <p className="text-body-md text-on-surface-variant leading-relaxed">
                     Based on your medication and lab profile, the AI gently suggests holistic adjustments. "Since you're on statins, taking CoQ10 might help with muscle fatigue."
                   </p>
                 </div>
               </div>
            </div>
          </div>

          {/* Interactive AI Chat Mockup */}
          <div className="relative h-[600px] flex items-center justify-center order-1 lg:order-2">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[60px]"></div>
            
            <div className="w-[85%] h-[90%] glass-pulse rounded-[40px] p-6 shadow-2xl border border-white/50 relative z-10 flex flex-col bg-surface/60 backdrop-blur-xl">
               
               <div className="flex items-center gap-4 mb-8 pb-4 border-b border-outline-variant/20">
                 <div className="relative">
                   <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                     <span className="material-symbols-outlined text-primary">smart_toy</span>
                   </div>
                   <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tertiary ring-2 ring-surface"></div>
                 </div>
                 <div>
                   <div className="font-headline-md text-on-surface">Medimz Assistant</div>
                   <div className="text-label-sm text-tertiary font-bold">Online</div>
                 </div>
               </div>

               <div className="flex-grow space-y-6 overflow-hidden">
                 
                 {/* User message */}
                 <div className="flex justify-end">
                   <div className="bg-surface-container-high rounded-2xl rounded-tr-sm p-4 max-w-[80%] text-body-md text-on-surface">
                     I just uploaded my new Lipid Profile. How does it look?
                   </div>
                 </div>

                 {/* AI message */}
                 <div className="flex justify-start animate-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                   <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm p-5 max-w-[90%] text-body-md text-on-surface">
                     <p className="mb-4">Great job getting tested! Looking at your new report compared to your last one in January:</p>
                     <ul className="space-y-3 mb-4">
                       <li className="flex items-start gap-2">
                         <span className="material-symbols-outlined text-tertiary text-[18px]">trending_down</span>
                         <span>Your <strong>LDL (Bad Cholesterol)</strong> dropped from 160 to 135! That's excellent progress.</span>
                       </li>
                       <li className="flex items-start gap-2">
                         <span className="material-symbols-outlined text-error text-[18px]">trending_up</span>
                         <span>Your <strong>Triglycerides</strong> went up slightly.</span>
                       </li>
                     </ul>
                     <div className="bg-surface p-3 rounded-xl shadow-sm text-label-sm mt-4 border border-outline-variant/10">
                       💡 <strong>Wellness Tip:</strong> Try swapping out refined cooking oils for olive oil, and consider adding a 15-minute walk after dinner.
                     </div>
                   </div>
                 </div>

                 {/* Typing indicator */}
                 <div className="flex justify-start animate-in fade-in duration-500 delay-[2000ms] fill-mode-both">
                   <div className="bg-surface-container rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
                     <div className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce"></div>
                     <div className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce" style={{animationDelay: '0.2s'}}></div>
                     <div className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce" style={{animationDelay: '0.4s'}}></div>
                   </div>
                 </div>

               </div>
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}
