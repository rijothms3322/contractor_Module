import { useApp } from '@/context/AppContext';
import React, { useState } from 'react';
import { Joyride } from 'react-joyride';
import { STATUS } from 'react-joyride';
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
                updateUserProfile({ isMedicineWalkthroughShown: true });
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
        <h3 className="font-bold text-lg">💊 Medicine Name</h3>
        <p className="text-sm mt-1">Start here. Enter the name of the medicine exactly as prescribed.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#add-medicine-name',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">💊 Dosage</h3>
        <p className="text-sm mt-1">Specify how much medicine should be taken each time.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#add-dosage',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">📋 Instructions</h3>
        <p className="text-sm mt-1">Add notes like After Food, Before Breakfast, or With Water.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#add-instructions',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">📦 Stock Count</h3>
        <p className="text-sm mt-1">Enter how many tablets or doses you currently have to receive low-stock reminders.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#add-stock-count',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">🔒 Keep Private</h3>
        <p className="text-sm mt-1">Turn this on if you don't want this medicine shared with your family members.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#add-private-checkbox',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">🕐 Schedule Slots</h3>
        <p className="text-sm mt-1">Choose when this medicine is usually taken—Morning, Afternoon, Evening, or Night.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#add-timings',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">⏰ Preferred Intake Time</h3>
        <p className="text-sm mt-1">Select the exact time you want Medimz to remind you.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#add-intake-time-select',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">➕ Add Time</h3>
        <p className="text-sm mt-1">Need multiple reminders? Tap Add Time to add another dose.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#add-time-btn',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">📅 Reminder Duration</h3>
        <p className="text-sm mt-1">Keep reminders active until you stop them, or choose a custom end date.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#add-duration',
    skipBeacon: true,
  },
  {
    content: (
      <div>
        <h3 className="font-bold text-lg">💾 Save Prescription Reminder</h3>
        <p className="text-sm mt-1">You're all set! Tap here to start receiving reminders.</p>
      </div>
    ),
    placement: 'bottom',
    target: '#add-save-btn',
    skipBeacon: true,
  },
];



const AddReminderTour: React.FC = () => {

  return (
    <Joyride
      steps={tourSteps}
      run={true}
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

export default AddReminderTour;
