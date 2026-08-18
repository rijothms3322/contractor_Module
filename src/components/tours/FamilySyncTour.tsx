import { useApp } from '@/context/AppContext';
import React, { useState } from 'react';
import { Joyride } from 'react-joyride';
import type { Step, TooltipRenderProps } from 'react-joyride';

function CustomTooltip({
  step,
  index,
  size,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) {
  const isLastStep = index === size - 1;
  const { updateUserProfile } = useApp()
  return (
    <div
      {...tooltipProps}
      className="bg-white/92 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 max-w-[400px] text-on-surface font-manrope"
    >
      <div className="prose prose-sm max-w-none">{step.content}</div>
      <div className="flex items-center justify-between mt-6 border-t border-outline-variant/15 pt-4">
        <button
          {...skipProps}
          onClick={(e) => {
            updateUserProfile({ isWalkthroughShown: true, isMedicineWalkthroughShown: true, isPrescriptionWalkthroughShown: true });
            skipProps.onClick(e);
          }}
          className="text-outline font-semibold text-sm hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
        >
          Skip
        </button>
        <div className="flex gap-2">
          {!isLastStep && (
            <button
              {...backProps}
              className="px-4 py-2 text-secondary font-semibold text-sm rounded-xl hover:bg-secondary/5 transition-colors bg-transparent border-none"
            >
              Back
            </button>
          )}
          <button
            {...primaryProps}
            onClick={(e) => {
              if (isLastStep) {
                updateUserProfile({ isPrescriptionWalkthroughShown: true });
              }
              primaryProps.onClick(e);
            }}
            className="px-5 py-2 bg-primary text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all border-none"
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

const tourSteps: Step[] = [
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">👪 Family Sync Hub</h3>
        <p className="text-sm mt-1">Manage your family's health together. Connect with loved ones to share medication updates and monitor adherence.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#family-sync-header',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">👪 Create a Family Group</h3>
        <p className="text-sm mt-1">Create your own family group to securely manage medications and monitor your loved ones' adherence from one place.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#create-family-card',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">🔗 Join an Existing Family Group</h3>
        <p className="text-sm mt-1">Enter an invitation code from your family administrator to securely join an existing family group and stay connected.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#join-family-card',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">💡 Why Family Sync?</h3>
        <p className="text-sm mt-1">Family Sync helps caregivers and family members stay informed with shared medication schedules, reminders, and health updates.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#family-sync-note',
    skipBeacon: true,
  },
];

const FamilySyncTour: React.FC = () => {
  const [run, setRun] = useState(true);

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      tooltipComponent={CustomTooltip}
      styles={{
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.35)',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip',
      }}
    />
  );
};

export default FamilySyncTour;
