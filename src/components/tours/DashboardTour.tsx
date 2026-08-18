
"use client";
import { useApp } from '@/context/AppContext';
import React, { useState } from 'react';
import { Joyride } from "react-joyride";
import type { Step, TooltipRenderProps } from "react-joyride";

// ─── Custom Tooltip ──────────────────────────────────────────────────────
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
    const {updateUserProfile} = useApp()
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
                                updateUserProfile({ isWalkthroughShown: true });
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

// ─── Tour Steps ─────────────────────────────────────────────────────────
const tourSteps: Step[] = [
    {
        content: (
            <div>
                <h2 className="text-xl font-bold">👋 Welcome to your Health Dashboard</h2>
                <p className="text-sm mt-2">Your personal healthcare hub. Manage medicines, track health, and keep your family connected—all in one place.</p>
            </div>
        ),
        placement: 'center',
        target: 'body',
        skipBeacon: true,
    },
    {
        content: (
            <div>
                <h3 className="font-bold text-lg">💊 Add Medicine Reminder</h3>
                <p className="text-sm mt-1">Create personalized medicine reminders with flexible schedules, dosage details, and timely notifications so you never miss a dose.</p>
            </div>
        ),
        placement: 'top',
        target: '#add-reminder-btn',
        skipBeacon: true,
    },
    {
        content: (
            <div>
                <h3 className="font-bold text-lg">❤️ Today's Wellness Status</h3>
                <p className="text-sm mt-1">Log your daily wellness check-in to build healthy habits and track your overall well-being over time.</p>
            </div>
        ),
        placement: 'top',
        target: '#wellness-card',
        skipBeacon: true,
    },
    {
        content: (
            <div>
                <h3 className="font-bold text-lg">👪 Family Synchronization Hub</h3>
                <p className="text-sm mt-1">Connect with your loved ones to share medication updates, monitor adherence, and coordinate care from anywhere. Create your family's unique ID to connect with your family profile.</p>
            </div>
        ),
        placement: 'top',
        target: '#family-sync-card',
        skipBeacon: true,
    },
    {
        content: (
            <div>
                <h3 className="font-bold text-lg">💊 Pharmacy Refill Alerts</h3>
                <p className="text-sm mt-1">Stay ahead of your refills. Medimz notifies you before your medicine stock runs low.</p>
            </div>
        ),
        placement: 'top',
        target: '#refill-alert-card',
        skipBeacon: true,
    },
    {
        content: (
            <div>
                <h3 className="font-bold text-lg">🧪 Lab Reports & Vitals</h3>
                <p className="text-sm mt-1">Securely store and monitor your lab reports and vital health metrics—all in one place.</p>
            </div>
        ),
        placement: 'top',
        target: '#log-report-btn',
        skipBeacon: true,
    },
    {
        content: (
            <div>
                <h3 className="font-bold text-lg">📦 Medicine Inventory</h3>
                <p className="text-sm mt-1">Keep track of your medicine stock and receive timely reminders before you run out.</p>
            </div>
        ),
        placement: 'top',
        target: '#medicine-inventory',
        skipBeacon: true,
    },
    {
        content: (
            <div className="text-center">
                <h2 className="text-2xl font-bold">🎉 You're All Set!</h2>
                <p className="text-sm mt-2">You're ready to take control of your health. Explore Medimz and never miss a medicine again!</p>
            </div>
        ),
        placement: 'center',
        target: 'body',
        skipBeacon: true,
    },
];



// ─── Main Tour Component ──────────────────────────────────────────────
const DashboardTour: React.FC = () => {

    return (
        <Joyride
            steps={tourSteps}
            run={true}
            continuous
            scrollToFirstStep
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

export default DashboardTour;