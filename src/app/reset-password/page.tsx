"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

const handlePasswordSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setMessage("");
  if (!newPassword || !confirmPassword) {
    setError("Please fill in both password fields.");
    return;
  }
  if (newPassword.length < 6) {
    setError("New Password must be at least 6 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }
  setLoading(true);
  try {
    if (!isSupabaseConfigured) {
      setMessage("Password reset successful (demo mode). You can now log in.");
      setTimeout(() => router.push("/"), 1000);
      return;
    }
    // Check recovery session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) {
      throw sessionError;
    }
    if (!sessionData.session) {
      throw new Error(
        "Reset session expired. Please request a new password reset link."
      );
    }
    console.log("Updating password...");

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw updateError;
    }
    console.log("Password updated successfully");
    // Logout so user can login with new password
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Sign out error:", signOutError);
    }
    setMessage("Password reset successful! Redirecting to login...");
    setTimeout(() => {
      router.push("/");
    }, 1000);

  } catch (err: any) {
    console.error("Password reset error:", err);
    setError(
      err?.message || "Something went wrong while resetting password."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-8 px-gutter max-w-[440px] mx-auto">
      <div className="w-full glass-card rounded-3xl p-8 shadow-2xl border border-outline-variant/35">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="MEDIMZ" className="h-16 mx-auto mb-2" />
          <h1 className="text-xl font-bold text-on-surface">Set New Password</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Create a new password for your account.
          </p>
        </div>

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

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block font-label-md text-xs text-on-surface-variant font-bold">
              New Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-secondary text-lg">lock</span>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-label-md text-xs text-on-surface-variant font-bold">
              Confirm Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-secondary text-lg">lock</span>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:opacity-90 active:scale-98 transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <button
          onClick={() => router.push("/")}
          className="w-full mt-4 text-sm text-on-surface-variant hover:text-primary transition-colors text-center"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}