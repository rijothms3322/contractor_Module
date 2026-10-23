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

export const ProfileOnboarding: React.FC<ProfileOnboardingProps> = ({ onComplete, onSkip, isLoading = false, loadingAction = null, }) => {
    const { user } = useApp();

    const [fullName, setFullName] = useState(user?.fullName || "");
    const [bloodGroup, setBloodGroup] = useState("");

    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [phone, setPhone] = useState(user?.phone_number || "");
    const [email, setEmail] = useState(user?.email || "");
    const [conditions, setConditions] = useState<string[]>([]);
    const [error, setError] = useState("");
    const today = new Date().toISOString().split("T")[0];
    console.log(user)
    const conditionList = [
        "None",
        "Diabetes",
        "Hypertension",
        "Heart Disease",
        "Asthma & COPD",
        "Cancer",
        "Kidney Disease",
        "Others",
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
        <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center pb-32 font-sans text-[#1F2937]">
            {/* Header */}
            <div className="text-center mt-10 mb-8 px-6 max-w-lg">
                <img src="/logo.png" alt="MEDIMZ" className="h-40 mx-auto mb-7" />
                <h1 className="text-[34px] leading-tight font-extrabold
                    bg-gradient-to-r from-primary via-[#ee7b4d] to-secondary
                    bg-clip-text text-transparent">
                    Tell us about yourself
                </h1>
                <p className="text-sm text-on-surface-variant mt-2">
                    This helps Medimz personalize your health journey & custom care plans.
                </p>
            </div>

            <div className="w-full max-w-[500px] px-4 flex flex-col gap-6">

                {/* Basic Information Card */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">

                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-3">
                        <div className="bg-red-100 p-2 rounded-xl text-primary shrink-0">
                            <span className="material-symbols-outlined">badge</span>
                        </div>
                        <div>
                            <h2 className="text-[17px] font-bold text-gray-900">Basic Information</h2>
                            <p className="text-[13px] text-[#6B7280]">Essential details to establish your record</p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full mb-6" />

                    {/* Full Name Field */}
                    <div className="mb-4">
                        <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                            Full Name <span className="text-[#ee7b4d]">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-gray-400">
                                <span className="material-symbols-outlined text-md!">person</span>
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-[#F9FAFB] border border-[#E8DCD7] rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#ee7b4d] focus:ring-1 focus:ring-[#ee7b4d]/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                        {/* Email */}
                        <div>
                            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                                Email Address <span className="text-[#ee7b4d]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-gray-400">
                                    <span className="material-symbols-outlined text-md!">mail</span>
                                </div>
                                <input
                                    type="email"
                                    placeholder="e.g. john@example.com"
                                    value={email}
                                    disabled
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9FAFB] border border-[#E8DCD7] rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#ee7b4d] focus:ring-1 focus:ring-[#ee7b4d]/20 transition-all"
                                />
                            </div>
                        </div>
                        {/* Phone */}
                        <div>
                            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                                Phone Number <span className="text-[#ee7b4d]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-gray-400">
                                    <span className="material-symbols-outlined text-md!">phone</span>
                                </div>
                                <input
                                    type="tel"
                                    placeholder="e.g. +1 (555) 000-0000"
                                    value={phone}
                                    disabled
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9FAFB] border border-[#E8DCD7] rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#ee7b4d] focus:ring-1 focus:ring-[#ee7b4d]/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="mb-5">
                        <label className="block text-[13px] font-semibold text-gray-800 mb-2">
                            Gender <span className="text-[#ee7b4d]">*</span>
                        </label>
                        <div className="flex bg-[#F0F4F8] p-1.5 rounded-xl">
                            {["Male", "Female", "Other"].map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setGender(item)}
                                    className={`
                                        flex-1 py-2.5 text-[14px] font-semibold rounded-lg transition-all duration-200
                                        ${gender === item
                                            ? "bg-[#ee7b4d] text-white shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                        }
                                    `}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date of Birth */}
                        <div>
                            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                                Date of Birth <span className="text-[#ee7b4d]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-gray-400">
                                    <span className="material-symbols-outlined text-md!">calendar_month</span>
                                </div>
                                <input
                                    type="date"
                                    value={dob}
                                    max={today}
                                    onFocus={(e) => e.currentTarget.showPicker?.()}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9FAFB] border border-[#E8DCD7] rounded-xl text-[14px] text-gray-500 focus:outline-none focus:border-[#ee7b4d] focus:ring-1 focus:ring-[#ee7b4d]/20 transition-all"
                                />
                            </div>
                        </div>
                        {/* Blood Group */}
                        <div>
                            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                                Blood Group
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-gray-400">
                                    <span className="material-symbols-outlined text-md!">bloodtype</span>
                                </div>
                                <select
                                    value={bloodGroup}
                                    onChange={(e) => setBloodGroup(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2.5 bg-[#F9FAFB] border border-[#E8DCD7] rounded-xl text-[14px] text-gray-900 appearance-none focus:outline-none focus:border-[#ee7b4d] focus:ring-1 focus:ring-[#ee7b4d]/20 transition-all"
                                >
                                    <option value="" disabled>Select</option>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                                    <span className="material-symbols-outlined text-md!">keyboard_arrow_down</span> 
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Existing Conditions Card */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">

                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-6">
                        <div className="bg-[#EFF6F9] p-2.5 rounded-xl text-[#4A7A9C] shrink-0">
                           <span className="material-symbols-outlined text-md!">health_and_safety</span> 
                        </div>
                        <div>
                            <h2 className="text-[17px] font-bold text-gray-900">Existing Conditions</h2>
                            <p className="text-[13px] text-[#6B7280]">Tailors your care recommendations</p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full mb-6" />

                    {/* Condition Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {conditionList.map((item) => {
                            const isSelected = conditions.includes(item);
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => toggleCondition(item)}
                                    className={`
                                        flex items-center justify-between py-3 px-4 rounded-xl border transition-all duration-200
                                        ${isSelected
                                            ? "border-[#ee7b4d] bg-[#FEF0EC]"
                                            : "border-[#E8DCD7] bg-white hover:border-[#ee7b4d]/50"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#ee7b4d]' : 'bg-[#D1BFA9]'}`} />
                                        <span className={`text-[13px] font-semibold truncate ${isSelected ? 'text-[#ee7b4d]' : 'text-gray-700'}`}>
                                            {item}
                                        </span>
                                    </div>
                                    <div className={`
                                        w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors
                                        ${isSelected
                                            ? "border-[#ee7b4d] bg-[#ee7b4d]"
                                            : "border-[#E8DCD7] bg-white"
                                        }
                                    `}>
                                        {isSelected && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3.5 bg-red-50 text-red-600 text-[13px] font-medium rounded-xl border border-red-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {error}
                    </div>
                )}
            </div>

            {/* Sticky Bottom Bar for Continue Button */}
            <div className="w-full">
                <div className="max-w-[500px] mx-auto p-4 flex flex-col items-center">
                    <button
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="w-full py-3.5 bg-[#ee7b4d] text-white font-bold text-[16px] rounded-xl shadow-[0_4px_14px_rgba(242,108,66,0.3)] hover:bg-[#E05A31] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loadingAction === "complete" ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                Continue
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};