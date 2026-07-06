import React from "react";

export default function HomeCollection() {
  return (
    <section className="px-gutter py-24 bg-surface-container-lowest overflow-hidden">
      <div className="max-w-container-max mx-auto">
        <div className="bg-surface-container-low rounded-[40px] p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-16 border border-outline-variant/10">
          
          {/* Ambient Animation */}
          <div className="absolute -left-[20%] -top-[20%] w-[500px] h-[500px] bg-secondary-container/30 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Timeline Animation Graphic */}
          <div className="w-full md:w-1/2 relative z-10">
             <div className="glass-pulse rounded-[32px] p-8 relative border border-white/50">
               
               <div className="relative border-l-2 border-surface-container-highest ml-6 space-y-10 pb-4">
                 
                 {/* Step 1 */}
                 <div className="relative pl-10">
                   <div className="absolute left-[-11px] top-1 w-5 h-5 rounded-full bg-tertiary flex items-center justify-center ring-4 ring-surface-container-low">
                     <span className="material-symbols-outlined text-[12px] text-on-tertiary">check</span>
                   </div>
                   <div className="bg-surface rounded-xl p-4 shadow-sm border border-outline-variant/10">
                     <div className="font-headline-md text-on-surface text-lg">Test Booked</div>
                     <div className="text-label-sm text-on-surface-variant">Confirmed for Tomorrow, 8:00 AM</div>
                   </div>
                 </div>

                 {/* Step 2 (Active) */}
                 <div className="relative pl-10 group">
                   <div className="absolute left-[-11px] top-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center ring-4 ring-secondary-container animate-pulse">
                     <div className="w-2 h-2 rounded-full bg-on-secondary"></div>
                   </div>
                   <div className="bg-surface rounded-xl p-4 shadow-lg border-l-4 border-secondary transform transition-transform group-hover:scale-105">
                     <div className="flex justify-between items-center mb-1">
                       <div className="font-headline-md text-on-surface text-lg">Phlebotomist Assigned</div>
                       <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-[10px] font-bold">LIVE</span>
                     </div>
                     <div className="flex items-center gap-3 mt-3">
                       <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
                         <span className="material-symbols-outlined text-outline">person</span>
                       </div>
                       <div>
                         <div className="text-label-md font-bold text-on-surface">Rajesh Kumar</div>
                         <div className="text-label-sm text-on-surface-variant">Trained & Vaccinated • 4.9 ★</div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Step 3 */}
                 <div className="relative pl-10 opacity-50">
                   <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-surface-container-highest ring-4 ring-surface-container-low"></div>
                   <div className="font-headline-md text-on-surface text-lg">Sample Processing</div>
                   <div className="text-label-sm text-on-surface-variant">At NABL Accredited Lab</div>
                 </div>

               </div>
             </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-1/2 relative z-10">
            <h2 className="font-display-lg text-4xl mb-6">Painless. Safe.<br/>Right at your doorstep.</h2>
            <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed">
              Fasting for a blood test shouldn't mean sitting in traffic and waiting in crowded clinic lobbies. 
              Our highly-trained phlebotomists come to your home or office at your preferred time slot, ensuring a hygienic and painless sample collection.
            </p>
            
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-secondary text-2xl mt-0.5">verified_user</span>
                <div>
                  <h4 className="font-headline-md text-xl mb-1 text-on-surface">Strict Safety Protocols</h4>
                  <p className="text-body-md text-on-surface-variant">Fresh sealed kits, mandatory sanitization, and temperature-controlled sample transport bags.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary text-2xl mt-0.5">timer</span>
                <div>
                  <h4 className="font-headline-md text-xl mb-1 text-on-surface">60-Minute Rapid Collection</h4>
                  <p className="text-body-md text-on-surface-variant">Need it urgently? Book our express slot and our executive reaches your location within an hour.</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
