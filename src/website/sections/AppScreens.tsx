import React from "react";

export default function AppScreens() {
  return (
    <section className="px-gutter py-24 bg-surface-container overflow-hidden">
      <div className="max-w-container-max mx-auto text-center mb-16">
        <h2 className="font-display-lg text-3xl md:text-5xl mb-6">Designed for Simplicity</h2>
        <p className="text-body-lg text-on-surface-variant max-w-[600px] mx-auto">
          A calm, intuitive interface that gets out of your way. No clutter, just what you need for better health.
        </p>
      </div>

      {/* Horizontal scrolling showcase or grid */}
      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-gutter md:justify-center">
        
        {/* Screen 1 */}
        <div className="min-w-[280px] w-[280px] h-[580px] bg-background rounded-[40px] shadow-2xl border-[8px] border-surface p-4 relative shrink-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-surface rounded-b-xl z-20"></div>
          {/* Mock content */}
          <div className="h-full rounded-[32px] overflow-hidden bg-surface-container-low p-4 flex flex-col">
            <div className="mt-8 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 mb-2"></div>
              <div className="h-4 w-1/2 bg-surface-container-highest rounded mb-2"></div>
              <div className="h-3 w-1/3 bg-surface-container-high rounded"></div>
            </div>
            <div className="bg-surface rounded-2xl p-4 mb-4 flex-grow">
              <div className="h-24 w-full bg-surface-container-low rounded-xl mb-4"></div>
              <div className="h-12 w-full bg-surface-container-low rounded-xl mb-2"></div>
              <div className="h-12 w-full bg-surface-container-low rounded-xl"></div>
            </div>
          </div>
          <div className="absolute -bottom-10 left-0 right-0 text-center font-label-md text-on-surface-variant">Dashboard</div>
        </div>

        {/* Screen 2 */}
        <div className="min-w-[280px] w-[280px] h-[580px] bg-background rounded-[40px] shadow-2xl border-[8px] border-surface p-4 relative shrink-0 -translate-y-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-surface rounded-b-xl z-20"></div>
          {/* Mock content */}
          <div className="h-full rounded-[32px] overflow-hidden bg-surface-container-low p-4 flex flex-col">
            <div className="mt-8 mb-6 flex justify-between">
              <div className="h-6 w-1/2 bg-surface-container-highest rounded"></div>
              <div className="h-6 w-1/6 bg-surface-container-high rounded"></div>
            </div>
            <div className="space-y-3">
              <div className="h-16 w-full bg-surface rounded-xl border-l-4 border-primary"></div>
              <div className="h-16 w-full bg-surface rounded-xl opacity-50"></div>
              <div className="h-16 w-full bg-surface rounded-xl opacity-50"></div>
            </div>
          </div>
          <div className="absolute -bottom-2 left-0 right-0 text-center font-label-md text-on-surface-variant">Medicines</div>
        </div>

        {/* Screen 3 */}
        <div className="min-w-[280px] w-[280px] h-[580px] bg-background rounded-[40px] shadow-2xl border-[8px] border-surface p-4 relative shrink-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-surface rounded-b-xl z-20"></div>
          {/* Mock content */}
          <div className="h-full rounded-[32px] overflow-hidden bg-surface-container-low p-4 flex flex-col">
            <div className="mt-8 mb-6">
              <div className="h-6 w-2/3 bg-surface-container-highest rounded mb-4"></div>
              <div className="flex gap-2">
                <div className="h-8 w-1/3 bg-surface-container-high rounded-full"></div>
                <div className="h-8 w-1/3 bg-surface-container-high rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="h-24 bg-surface rounded-xl"></div>
               <div className="h-24 bg-surface rounded-xl"></div>
            </div>
            <div className="h-32 bg-surface rounded-xl"></div>
          </div>
          <div className="absolute -bottom-10 left-0 right-0 text-center font-label-md text-on-surface-variant">Lab Booking</div>
        </div>

      </div>
    </section>
  );
}
