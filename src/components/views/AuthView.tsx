"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";
import { adminService } from "../../services/adminService";
import { TermsConditions } from "@/lib/mockData";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { signInWithGoogle } from "@/lib/googleAuth";

// OTP Input Component 
const OtpInput = ({
  otp,
  setOtp,
}: {
  otp: string;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return;

    const digit = digits[0];
    const otpArray = otp.padEnd(4, "").split("");
    otpArray[index] = digit;
    const newOtp = otpArray.join("").slice(0, 4);
    setOtp(newOtp);

    if (index < 3) {
      const nextInput = document.querySelector(
        `[data-otp-index="${index + 1}"]`
      ) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key !== "Backspace") return;
    e.preventDefault();

    const otpArray = otp.padEnd(4, "").split("");
    if (otpArray[index]) {
      otpArray[index] = "";
      setOtp(otpArray.join("").replace(/\s/g, ""));
      return;
    }

    if (index > 0) {
      const previousInput = document.querySelector(
        `[data-otp-index="${index - 1}"]`
      ) as HTMLInputElement | null;
      previousInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (!pastedOtp) return;

    setOtp(pastedOtp);
    const lastIndex = Math.min(pastedOtp.length - 1, 3);
    const input = document.querySelector(
      `[data-otp-index="${lastIndex}"]`
    ) as HTMLInputElement | null;
    input?.focus();
  };



  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-on-surface-variant">
        Enter 4-Digit OTP
      </label>
      <div className="flex justify-center gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <input
            key={index}
            data-otp-index={index}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={otp[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="
              w-14 h-14
              text-center
              text-xl
              font-bold
              bg-surface-container/40
              border
              border-outline-variant/40
              rounded-xl
              text-on-surface
              focus:outline-none
              focus:border-primary
              focus:ring-2
              focus:ring-primary/30
              transition-all
            "
          />
        ))}
      </div>
    </div>
  );
};

// Main AuthView Component
export const AuthView: React.FC = () => {
  const router = useRouter();
  const { login, signup, resetPassword, loginWithPhone } = useApp();

  // Mode & Tabs
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [activeTab, setActiveTab] = useState<"emailLogin" | "phoneLogin">("emailLogin");
  const [signUpActiveTab, setSignUpActiveTab] = useState<"emailSignUp" | "phoneSignUp">("emailSignUp");
  const [role, setRole] = useState<"user" | "admin">("admin");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // useEffect(() => {
  //   if (!Capacitor.isNativePlatform()) {
  //     return;
  //   }

  //   let listenerHandle: any;

  //   const handleAppUrl = async ({ url }: { url: string }) => {
  //     console.log("[Google OAuth] CALLBACK:", url);

  //     if (!url.startsWith("com.medimz.app://auth/callback")) {
  //       return;
  //     }

  //     try {
  //       const callbackUrl = new URL(url);

  //       // Supabase PKCE callback
  //       const code = callbackUrl.searchParams.get("code");

  //       console.log("[Google OAuth] CODE:", code);

  //       if (code) {
  //         const { data, error } =
  //           await supabase.auth.exchangeCodeForSession(code);

  //         if (error) {
  //           console.error(
  //             "[Google OAuth] exchangeCodeForSession ERROR:",
  //             error
  //           );

  //           setError(error.message);
  //           return;
  //         }

  //         console.log(
  //           "[Google OAuth] SESSION:",
  //           data.session
  //         );

  //         if (data.session) {
  //           router.replace("/");
  //         }

  //         return;
  //       }

  //       // Fallback: access_token / refresh_token
  //       const hashParams = new URLSearchParams(
  //         callbackUrl.hash.substring(1)
  //       );

  //       const accessToken =
  //         hashParams.get("access_token");

  //       const refreshToken =
  //         hashParams.get("refresh_token");

  //       console.log(
  //         "[Google OAuth] ACCESS TOKEN:",
  //         !!accessToken
  //       );

  //       console.log(
  //         "[Google OAuth] REFRESH TOKEN:",
  //         !!refreshToken
  //       );

  //       if (accessToken && refreshToken) {
  //         const { data, error } =
  //           await supabase.auth.setSession({
  //             access_token: accessToken,
  //             refresh_token: refreshToken,
  //           });

  //         if (error) {
  //           console.error(
  //             "[Google OAuth] setSession ERROR:",
  //             error
  //           );

  //           setError(error.message);
  //           return;
  //         }

  //         console.log(
  //           "[Google OAuth] SESSION:",
  //           data.session
  //         );

  //         if (data.session) {
  //           router.replace("/");
  //         }
  //       }
  //     } catch (err) {
  //       console.error(
  //         "[Google OAuth] CALLBACK ERROR:",
  //         err
  //       );
  //     }
  //   };

  //   App.addListener(
  //     "appUrlOpen",
  //     handleAppUrl
  //   ).then((handle) => {
  //     listenerHandle = handle;
  //   });

  //   return () => {
  //     listenerHandle?.remove();
  //   };
  // }, [router]);

  // Helpers

  const formatPhoneNumber = (raw: string): string => {
    let digits = raw.replace(/\D/g, "");
    // Remove leading zero if any
    if (digits.startsWith("0")) digits = digits.slice(1);
    if (digits.startsWith("91") && digits.length === 12) {
      return `+${digits}`;
    }
    return `${digits}`;
  };

  const validatePhone = (raw: string): boolean => {
    const digits = raw.replace(/\D/g, "");
    // Indian 10-digit number (starting with 6-9)
    return /^[6-9]\d{9}$/.test(digits);
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
    setCanResendOtp(false);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResendOtp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPhone("");
    setOtp("");
    setOtpSent(false);
    setFullName("");
    setError("");
    setMessage("");
    setAcceptTerms(false);
  };

  // Resend OTP
  const resendOtp = async () => {
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    const formatted = formatPhoneNumber(phone);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formatted,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setOtp("");
      setMessage("OTP resent successfully.");
      startOtpTimer();
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };


  // Tab Handlers

  const handleLoginTabChange = (tab: "emailLogin" | "phoneLogin") => {
    setActiveTab(tab);
    setOtpSent(false);
    setOtp("");
    setPhone("");
    setError("");
    setMessage("");
  };

  const handleSignupTabChange = (tab: "emailSignUp" | "phoneSignUp") => {
    setSignUpActiveTab(tab);
    setOtpSent(false);
    setOtp("");
    setPhone("");
    setEmail("");
    setPassword("");
    setError("");
    setMessage("");
  };


  // Google Sign In

  const handleGoogleSignIn = async () => {
    // setError("");
    // setMessage("");
    // setLoading(true);
    // try {
    //   if (isSupabaseConfigured) {
    //     // Trigger live Google OAuth login sequence

    //     const redirectTo = Capacitor.isNativePlatform()
    //       ? "com.medimz.app://auth/callback"
    //       : window.location.origin;

    //     const { error: oauthError } = await supabase.auth.signInWithOAuth({
    //       provider: "google",
    //       options: { redirectTo: redirectTo },
    //     });
    //     if (oauthError) throw oauthError;
    //   } else {
    //     // Fallback demo mode login
    //     if (role === "admin") {
    //       await login("teams@medimz.com", "password123", "admin");
    //     } else {
    //       await login("google-user@medimz.com", "password123", "user");
    //     }
    //   }
    // } catch (err: any) {
    //   setError(err?.message || "Google Sign-In failed.");
    // } finally {
    //   setLoading(false);
    // }

    setError("");
  setMessage("");

  if (!isSupabaseConfigured) {
    // Fallback demo mode login
    setLoading(true);
    try {
      if (role === "admin") {
        await login("teams@medimz.com", "password123", "admin");
      } else {
        await login("google-user@medimz.com", "password123", "user");
      }
    } catch (err: any) {
      setError(err?.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
    return;
  }

  setLoading(true);
  const result = await signInWithGoogle();
  setLoading(false);

  if (result.status === "error") {
    setError(result.message);
  }
  // "success" → onAuthStateChange / useAuthSession picks up the session
  // and page.tsx routes to onboarding or home automatically
  // "cancelled" → user backed out, do nothing
  };


  // Main Submit Handler

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // ──────────────────────────────────────────────────────────────
    // PHONE LOGIN
    // ──────────────────────────────────────────────────────────────
    if (mode === "login" && activeTab === "phoneLogin") {
      const formattedPhone = formatPhoneNumber(phone);

      if (!phone.trim()) {
        setError("Please enter your mobile number.");
        return;
      }
      if (!validatePhone(phone)) {
        setError("Please enter a valid 10-digit Indian mobile number.");
        return;
      }
      if (!acceptTerms) {
        setError("Please accept the Terms & Conditions.");
        return;
      }

      // Send OTP
      if (!otpSent) {
        setLoading(true);
        try {
          const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
            options: { shouldCreateUser: true },
          });
          if (error) throw error;
          setOtpSent(true);
          setOtp("");
          setMessage("OTP sent successfully to your phone.");
          startOtpTimer();
        } catch (err: any) {
          setError(err?.message || "Failed to send OTP.");
        } finally {
          setLoading(false);
        }
        return;
      }

      // Verify OTP
      if (!otp.trim()) {
        setError("Please enter the OTP.");
        return;
      }
      if (!/^\d{4}$/.test(otp)) {
        setError("Please enter the complete 4-digit OTP.");
        return;
      }

      setLoading(true);
      try {
        await loginWithPhone(formattedPhone, otp);
        // On success, loginWithPhone will update context state → redirect
      } catch (err: any) {
        setError(err?.message || "Invalid OTP. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ──────────────────────────────────────────────────────────────
    // PHONE SIGNUP
    // ──────────────────────────────────────────────────────────────
    if (mode === "signup" && signUpActiveTab === "phoneSignUp") {
      const formattedPhone = formatPhoneNumber(phone);

      if (!fullName.trim() || fullName.trim().length < 2) {
        setError("Please enter a valid full name (at least 2 characters).");
        return;
      }
      if (!phone.trim()) {
        setError("Please enter your mobile number.");
        return;
      }
      if (!validatePhone(phone)) {
        setError("Please enter a valid 10-digit Indian mobile number.");
        return;
      }
      if (!acceptTerms) {
        setError("Please accept the Terms & Conditions.");
        return;
      }

      // Send OTP
      if (!otpSent) {
        setLoading(true);
        try {
          const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
            options: {
              shouldCreateUser: true,
              data: {
                full_name: fullName.trim(),
                role: role,
              },
            },
          });
          if (error) throw error;
          setOtpSent(true);
          setOtp("");
          setMessage("OTP sent successfully to your phone.");
          startOtpTimer();
        } catch (err: any) {
          setError(err?.message || "Failed to send OTP.");
        } finally {
          setLoading(false);
        }
        return;
      }

      // Verify OTP
      if (!otp.trim()) {
        setError("Please enter the OTP.");
        return;
      }
      if (!/^\d{4}$/.test(otp)) {
        setError("Please enter the complete 4-digit OTP.");
        return;
      }

      setLoading(true);
      try {
        await loginWithPhone(formattedPhone, otp);
        // loginWithPhone will handle session and profile
      } catch (err: any) {
        setError(err?.message || "Invalid OTP. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ──────────────────────────────────────────────────────────────
    // EMAIL VALIDATION (for login, signup, forgot)
    // ──────────────────────────────────────────────────────────────
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "login") {
      if (!password.trim()) {
        setError("Please enter your password.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    if (mode === "signup" && signUpActiveTab === "emailSignUp") {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setError("Please enter a valid full name (at least 2 characters).");
        return;
      }
      if (!password.trim()) {
        setError("Please enter your password.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError("Password must contain at least one uppercase letter.");
        return;
      }
      if (!/[a-z]/.test(password)) {
        setError("Password must contain at least one lowercase letter.");
        return;
      }
      if (!/\d/.test(password)) {
        setError("Password must contain at least one number.");
        return;
      }
    }

    // Terms
    if (mode !== "forgot" && !acceptTerms) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    // ──────────────────────────────────────────────────────────────
    // EXECUTE AUTH ACTIONS
    // ──────────────────────────────────────────────────────────────
    setLoading(true);
    try {
      // Email Login
      if (mode === "login") {
        if (role === "admin") {
          const normalizedEmail = email.toLowerCase().trim();
          const isSuper = normalizedEmail === "teams@medimz.com";
          let hasAssignedRole = false;
          try {
            const roles = await adminService.getAllUserRoles();
            hasAssignedRole = roles.some(
              (r) => r.email?.toLowerCase().trim() === normalizedEmail
            );
          } catch {
            console.log("Offline mode: skipping admin role check.");
          }
          if (!isSuper && !hasAssignedRole && isSupabaseConfigured) {
            throw new Error(
              "Access Denied: Only authorized administrative accounts can access the Admin Portal."
            );
          }
        }
        await login(email.trim(), password, role);
        return;
      }

      // Email Signup
      if (mode === "signup" && signUpActiveTab === "emailSignUp") {
        const normalizedEmail = email.toLowerCase().trim();
        const isSuper = normalizedEmail === "teams@medimz.com";
        if (role === "admin" && !isSuper) {
          throw new Error(
            "Access Denied: Unauthorized admin registration. Administrators must be promoted by a Super Admin."
          );
        }
        await signup(normalizedEmail, password, fullName.trim(), role);
        return;
      }

      // Forgot Password
      if (mode === "forgot") {
        const res = await resetPassword(email.trim());
        if (res) {
          setMode("login");
          setMessage(
            "A password recovery link has been sent to your registered email address."
          );
          setEmail("");
          setPassword("");
          setTimeout(() => setMessage(""), 3000);
        } else {
          setError("Unable to send the reset email. Please try again.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please check your details.");
    } finally {
      setLoading(false);
    }
  };


  // RENDER

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-8 px-gutter max-w-[440px] mx-auto relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full filter blur-2xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full glass-card rounded-3xl p-8 shadow-2xl relative z-10 border border-outline-variant/35 animate-in zoom-in-95 duration-300">
        {/* Logo & Title */}
        <div className="text-center mb-6 flex flex-col items-center">
          <img src="/logo.png" alt="MEDIMZ Logo" className="h-16 w-auto object-contain mb-2 select-none" />
          <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Recover Password"}
          </p>
        </div>

        {/* Error / Success Banners */}
        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2 border border-error/20">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-tertiary-container/10 text-tertiary text-xs rounded-xl flex items-center gap-2 border border-tertiary/20">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{message}</span>
          </div>
        )}

        {/* Tabs for Login */}
        {mode === "login" && (
          <div className="flex bg-surface-container rounded-md p-1 mb-6">
            <button
              type="button"
              onClick={() => handleLoginTabChange("emailLogin")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "emailLogin"
                ? "bg-white shadow text-primary"
                : "text-gray-500"
                }`}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => handleLoginTabChange("phoneLogin")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "phoneLogin"
                ? "bg-white shadow text-primary"
                : "text-gray-500"
                }`}
            >
              Phone Login
            </button>
          </div>
        )}

        {/* Tabs for Signup */}
        {mode === "signup" && (
          <div className="flex bg-surface-container rounded-md p-1 mb-6">
            <button
              type="button"
              onClick={() => handleSignupTabChange("emailSignUp")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${signUpActiveTab === "emailSignUp"
                ? "bg-white shadow text-primary"
                : "text-gray-500"
                }`}
            >
              Email Sign Up
            </button>
            <button
              type="button"
              onClick={() => handleSignupTabChange("phoneSignUp")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${signUpActiveTab === "phoneSignUp"
                ? "bg-white shadow text-primary"
                : "text-gray-500"
                }`}
            >
              Phone Sign Up
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (only for signup) */}
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="block font-label-md text-xs text-on-surface-variant font-bold">Full Name</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-lg">person</span>
                <input
                  type="text"
                  placeholder="e.g. Sarah D'Souza"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          )}

          {/* Email & Password fields (for email flows) */}
          {(
            mode === "forgot" ||
            (mode === "login" && activeTab === "emailLogin") ||
            (mode === "signup" && signUpActiveTab === "emailSignUp")
          ) && (
              <>
                <div className="space-y-1">
                  <label className="block font-label-md text-xs text-on-surface-variant font-bold">Email Address</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-secondary text-lg">mail</span>
                    <input
                      type="email"
                      placeholder="sarah@medimz.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-1">
                    <label className="block font-label-md text-xs text-on-surface-variant font-bold">Password</label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-secondary text-lg">lock</span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

          {/* Phone & OTP fields (for phone flows) */}
          {((mode === "login" && activeTab === "phoneLogin") ||
            (mode === "signup" && signUpActiveTab === "phoneSignUp")) && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold">Mobile Number</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-secondary text-lg">call</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(val);
                      }}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-3 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Show OTP input only after OTP sent */}
                {otpSent && <OtpInput otp={otp} setOtp={setOtp} />}

                {/* Resend OTP */}
                {otpSent && (
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      disabled={!canResendOtp || loading}
                      onClick={resendOtp}
                      className={`text-[13px] font-semibold ${canResendOtp ? "text-primary" : "text-gray-400"
                        }`}
                    >
                      Resend OTP
                    </button>
                    <span className="text-[13px] text-gray-500">
                      {canResendOtp ? "You can resend" : `${otpTimer}s`}
                    </span>
                  </div>
                )}
              </div>
            )}

          {/* Terms & Conditions */}
          {mode !== "forgot" && (
            <div className="flex items-center justify-center gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 rounded border-outline-variant/50 text-primary accent-primary"
              />
              <label htmlFor="terms" className="text-xs text-on-surface-variant leading-5 cursor-pointer">
                I agree to the{" "}
                <a
                  href={TermsConditions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline"
                >
                  Terms & Conditions.
                </a>
              </label>
            </div>
          )}

          {/* Forgot Password link */}
          {mode === "login" && activeTab === "emailLogin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode("forgot");
                }}
                className="font-label-sm text-xs text-primary hover:underline font-bold"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:opacity-90 active:scale-98 transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === "login" ? (
              activeTab === "phoneLogin"
                ? otpSent ? "Verify OTP" : "Send OTP"
                : "Login"
            ) : mode === "signup" ? (
              signUpActiveTab === "phoneSignUp"
                ? otpSent ? "Verify OTP" : "Send OTP"
                : "Create Account"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-grow h-px bg-outline-variant/30" />
          <span className="px-3 font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold">Or continue with</span>
          <div className="flex-grow h-px bg-outline-variant/30" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container-low font-label-md text-sm text-on-surface rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5 object-contain" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>Sign In with Google</span>
        </button>

        {/* Mode Switcher */}
        <div className="text-center mt-6 space-y-4">
          {mode === "login" ? (
            <p className="font-label-md text-xs text-on-surface-variant">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  resetForm();
                  setMode("signup");
                }}
                className="text-primary hover:underline font-bold"
              >
                Sign Up
              </button>
            </p>
          ) : mode === "signup" ? (
            <p className="font-label-md text-xs text-on-surface-variant">
              Already have an account?{" "}
              <button
                onClick={() => {
                  resetForm();
                  setMode("login");
                }}
                className="text-primary hover:underline font-bold"
              >
                Log In
              </button>
            </p>
          ) : (
            <button
              onClick={() => {
                resetForm();
                setMode("login");
              }}
              className="font-label-md text-xs text-primary hover:underline font-bold flex items-center justify-center gap-1 mx-auto"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Log In</span>
            </button>
          )}

          {/* Admin/Patient toggle */}
          {mode !== "forgot" && (
            <div className="pt-2 border-t border-outline-variant/10 text-center">
              <button
                type="button"
                onClick={() => setRole(role === "admin" ? "user" : "admin")}
                className="text-[10px] text-outline hover:text-primary transition-colors font-bold uppercase tracking-wider"
              >
                ⚙️ Mode: {role === "admin" ? "Admin Portal" : "Patient Portal"} (Tap to Switch)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};