import React from "react";

export default function FamilyHealthcare() {
  return (
    <section className="px-gutter py-24 bg-surface border-y border-outline-variant/20">
      <div className="max-w-container-max mx-auto text-center">
        <h2 className="font-display-lg text-3xl md:text-5xl mb-6">Care for the Whole Family</h2>
        <p className="text-body-lg text-on-surface-variant max-w-[600px] mx-auto mb-16">
          Manage healthcare for dependents, aging parents, and children all from one master account. Never miss another vaccine or refill.
        </p>

        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-surface-container rounded-full p-2 gap-2 shadow-inner">
            <div className="px-6 py-2 rounded-full bg-primary text-on-primary font-label-md shadow-sm">My Profile</div>
            <div className="px-6 py-2 rounded-full text-on-surface-variant font-label-md hover:bg-surface-container-high transition-colors cursor-pointer">Sarah (Spouse)</div>
            <div className="px-6 py-2 rounded-full text-on-surface-variant font-label-md hover:bg-surface-container-high transition-colors cursor-pointer">Dad</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center text-left">
          <div className="space-y-6">
            <div className="glass-card rounded-[24px] p-6 flex gap-4 items-start">
              <span className="material-symbols-outlined text-secondary text-2xl">vaccines</span>
              <div>
                <h4 className="font-headline-md text-on-surface mb-1">Vaccination Tracking</h4>
                <p className="text-body-sm text-on-surface-variant">Keep digital records of your children's vaccinations with timely reminders for upcoming shots.</p>
              </div>
            </div>
            
            <div className="glass-card rounded-[24px] p-6 flex gap-4 items-start">
              <span className="material-symbols-outlined text-primary text-2xl">supervisor_account</span>
              <div>
                <h4 className="font-headline-md text-on-surface mb-1">Caregiver Access</h4>
                <p className="text-body-sm text-on-surface-variant">Grant restricted access to nurses or other family members to monitor your parents' medication adherence remotely.</p>
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-6 flex gap-4 items-start">
              <span className="material-symbols-outlined text-tertiary text-2xl">folder_shared</span>
              <div>
                <h4 className="font-headline-md text-on-surface mb-1">Centralized Records</h4>
                <p className="text-body-sm text-on-surface-variant">All prescriptions, lab reports, and doctor notes for the entire family stored securely in one place.</p>
              </div>
            </div>
          </div>

          <div className="relative h-[400px] flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/20 to-secondary-container/20 rounded-full blur-[60px] pointer-events-none"></div>
             
             {/* Mock UI for Family switching */}
             <div className="w-[80%] bg-surface rounded-[32px] p-6 shadow-2xl border border-outline-variant/30 relative z-10">
               <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/20">
                 <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xl font-bold">D</div>
                 <div>
                   <div className="font-headline-lg text-on-surface">Dad's Profile</div>
                   <div className="text-label-md text-error">1 Medication Missed Today</div>
                 </div>
               </div>
               
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-body-md text-on-surface-variant">Amlodipine (Blood Pressure)</span>
                   <button className="text-label-sm font-label-md text-primary bg-primary/10 px-3 py-1 rounded-full">Send Reminder</button>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-body-md text-on-surface-variant">Upcoming Lab Test</span>
                   <span className="text-label-sm font-label-md text-on-surface">Tomorrow, 8 AM</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
