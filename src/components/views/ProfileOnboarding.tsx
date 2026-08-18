"use client";

import { useApp } from "@/context/AppContext";
import React, { useState } from "react";

interface ProfileOnboardingProps {
    onComplete: (data: {
        gender: string;
        dob: string;
        conditions: string[];
        phone: string;
        email: string;
    }) => void;
    onSkip: () => void;
    isLoading?: boolean;
    loadingAction?: "complete" | "skip" | null;
}

export const ProfileOnboarding: React.FC<ProfileOnboardingProps> = ({ onComplete, onSkip, isLoading = false, loadingAction = null,}) => {
    const [gender, setGender] = useState("");
    const { user } = useApp();
    console.log(user, 'y')
    const [dob, setDob] = useState("");
    const [phone, setPhone] = useState(user?.phone_number || "");
    const [email, setEmail] = useState(user?.email || "");
    const [conditions, setConditions] = useState<string[]>([]);
    const [error, setError] = useState("");
    const today = new Date().toISOString().split("T")[0];

    const conditionList = [
        "Diabetes",
        "Hypertension",
        "Heart Disease",
        "Asthma & COPD",
        "Cancer",
        "Kidney Disease",
        "Others",
        "None",
    ];

    const toggleCondition = (value: string) => {
        if (conditions.includes(value)) {
            setConditions(conditions.filter((c) => c !== value));
        } else {
            if (value === "None") {
                setConditions(["None"]);
            } else {
                setConditions(conditions.filter((c) => c !== "None").concat(value));
            }
        }
    };

    const handleContinue = () => {
        setError("");

        if (!gender) {
            setError("Please select your gender.");
            return;
        }

        if (!dob) {
            setError("Please select your date of birth.");
            return;
        }

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Please enter your email address.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        const trimmedPhone = phone.trim();
        if (!trimmedPhone) {
            setError("Please enter your phone number.");
            return;
        }
        // Extract only digits
        const digits = trimmedPhone.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 15) {
            setError("Please enter a valid phone number (10–15 digits).");
            return;
        }


        if (conditions.length === 0) {
            setError("Please select at least one health condition.");
            return;
        }

        onComplete({ gender, dob, conditions, phone, email });
    };

    return (
        <div className="min-h-screen bg-background flex justify-center items-center p-6">
            <div className="w-full max-w-100 bg-white rounded-3xl p-8 shadow-xl border border-outline-variant/20 animate-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="MEDIMZ" className="h-14 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-on-surface">
                        Tell us about yourself
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-2">
                        This helps Medimz personalize your health journey.
                    </p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="
                            w-full px-4 py-3 bg-surface-container/40 border border-outline-variant/40 rounded-xl
                            text-sm text-on-surface
                            focus:outline-none focus:border-primary transition-all
                        "
                    />
                </div>

                {/* Gender */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                        Gender
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {["Male", "Female", "Other"].map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setGender(item)}
                                className={`
                                    py-3 rounded-xl border font-medium transition-all
                                    ${gender === item
                                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                                        : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-primary/40"
                                    }
                                `}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date of Birth */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        value={dob}
                        max={today}
                        onFocus={(e) => e.currentTarget.showPicker?.()}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        onChange={(e) => setDob(e.target.value)}
                        className="
                            w-full px-4 py-3 bg-surface-container/40 border border-outline-variant/40 rounded-xl
                            text-sm text-on-surface
                            focus:outline-none focus:border-primary transition-all
                        "
                    />
                </div>

                {/* Phone Number */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="
                            w-full px-4 py-3 bg-surface-container/40 border border-outline-variant/40 rounded-xl
                            text-sm text-on-surface
                            focus:outline-none focus:border-primary transition-all
                        "
                    />
                </div>

                {/* Conditions */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                        Existing Conditions
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {conditionList.map((item) => {
                            const isSelected = conditions.includes(item);
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => toggleCondition(item)}
                                    className={`
                                        py-2.5 px-3 rounded-xl border text-sm font-medium transition-all
                                        flex items-center gap-2
                                        ${isSelected
                                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                                            : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-primary/40"
                                        }
                                    `}
                                >
                                    <span
                                        className={`
                                            w-4 h-4 rounded border flex items-center justify-center text-xs
                                            ${isSelected
                                                ? "border-primary bg-primary text-white"
                                                : "border-outline-variant/50 bg-white"
                                            }
                                        `}
                                    >
                                        {isSelected && "✓"}
                                    </span>
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>


                {error && (
                    <div className="mb-5 p-3 bg-error-container/20 text-error text-sm rounded-xl border border-error/20">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleContinue}
                    disabled={isLoading}
                    className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:opacity-90 active:scale-98 transition-all"
                >
                   {loadingAction === "complete" ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : 'Continue →'}
                </button>

                <button
                    onClick={onSkip}
                    disabled={isLoading}
                    className="w-full mt-3 text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                    {loadingAction === "skip" ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-outline-variant/40 border-t-primary rounded-full animate-spin" />
                            Skipping...
                        </div>
                    ) : 'Skip for now'}
                </button>
            </div>
        </div>
    );
};