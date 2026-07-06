import React from "react";

export default function Testimonials() {
  return (
    <section className="px-gutter py-24 bg-surface-container-low overflow-hidden">
      <div className="max-w-container-max mx-auto text-center mb-16">
        <h2 className="font-display-lg text-3xl md:text-5xl mb-6">Trusted by Early Adopters</h2>
        <p className="text-body-lg text-on-surface-variant max-w-[600px] mx-auto">
          See how Medimz is changing lives by taking the stress out of daily healthcare management.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-container-max mx-auto">
        {/* Testimonial 1 */}
        <div className="glass-card rounded-[24px] p-8 flex flex-col justify-between">
          <div>
            <div className="flex gap-1 mb-6 text-tertiary">
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
            </div>
            <p className="text-body-md text-on-surface italic mb-8">
              "Managing my parents' daily medications used to be a constant source of anxiety. With Medimz, I get notified when they take their pills. It's given me incredible peace of mind."
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">R</div>
            <div>
              <div className="font-headline-md text-on-surface text-sm">Rahul S.</div>
              <div className="text-label-sm text-on-surface-variant">Caregiver</div>
            </div>
          </div>
        </div>

        {/* Testimonial 2 */}
        <div className="glass-card rounded-[24px] p-8 flex flex-col justify-between transform md:-translate-y-4 shadow-xl border-primary/20">
          <div>
            <div className="flex gap-1 mb-6 text-tertiary">
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
            </div>
            <p className="text-body-md text-on-surface italic mb-8">
              "The lab booking experience is incredibly smooth. The phlebotomist arrived exactly on time, and I had my AI-analyzed reports on my phone the same evening."
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">P</div>
            <div>
              <div className="font-headline-md text-on-surface text-sm">Priya M.</div>
              <div className="text-label-sm text-on-surface-variant">Beta User</div>
            </div>
          </div>
        </div>

        {/* Testimonial 3 */}
        <div className="glass-card rounded-[24px] p-8 flex flex-col justify-between">
          <div>
            <div className="flex gap-1 mb-6 text-tertiary">
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
            </div>
            <p className="text-body-md text-on-surface italic mb-8">
              "I used to struggle with consistency in my supplements and vitamins. The gamified streaks and smart nudges actually make me want to stay on track."
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold">A</div>
            <div>
              <div className="font-headline-md text-on-surface text-sm">Arjun K.</div>
              <div className="text-label-sm text-on-surface-variant">Fitness Enthusiast</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
