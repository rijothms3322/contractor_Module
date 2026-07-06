"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";

export const AuthView: React.FC = () => {
  const { login, signup, resetPassword } = useApp();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please fill in your email address.");
      return;
    }

    if (mode === "login" && !password) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "signup" && (!fullName || !password)) {
      setError("Please enter your full name and password.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password, role);
      } else if (mode === "signup") {
        await signup(email, password, fullName, role);
      } else {
        await resetPassword(email);
        setMessage("A password recovery link has been sent to your registered email address.");
        setEmail("");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        // Trigger live Google OAuth login sequence
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin
          }
        });
        if (oauthError) throw oauthError;
      } else {
        // Fallback demo mode login
        await login("google-user@medimz.com", "password123", role);
      }
    } catch (err: any) {
      setError(err?.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-8 px-gutter max-w-[440px] mx-auto relative overflow-hidden">
      {/* Dynamic Background Heartbeat Ring */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full filter blur-2xl pointer-events-none" />

      {/* Main card box */}
      <div className="w-full glass-card rounded-3xl p-8 shadow-2xl relative z-10 border border-outline-variant/35 animate-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <img
            src="/logo.png"
            alt="MEDIMZ Logo"
            className="h-16 w-auto object-contain mb-2 select-none"
          />
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

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Quick Demo Role Selector (shown in login/signup to let user test easily!) */}
          {mode !== "forgot" && (
            <div className="space-y-1 p-3 bg-surface-container/50 rounded-xl border border-outline-variant/20">
              <span className="block font-label-sm text-[10px] text-secondary font-bold uppercase tracking-wider mb-2">
                Demo Role Access:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    role === "user" ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  Patient Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    role === "admin" ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  Admin Operations
                </button>
              </div>
            </div>
          )}

          {/* Forgot trigger */}
          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("forgot")}
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
              "Log In"
            ) : mode === "signup" ? (
              "Create Account"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* OAuth placeholder divider */}
        <div className="flex items-center my-5">
          <div className="flex-grow h-px bg-outline-variant/30" />
          <span className="px-3 font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold">Or continue with</span>
          <div className="flex-grow h-px bg-outline-variant/30" />
        </div>

        {/* OAuth mock buttons */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container-low font-label-md text-sm text-on-surface rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5 object-contain" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Sign In with Google</span>
        </button>

        {/* Mode Switcher */}
        <div className="text-center mt-6">
          {mode === "login" ? (
            <p className="font-label-md text-xs text-on-surface-variant">
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-primary hover:underline font-bold"
              >
                Sign Up
              </button>
            </p>
          ) : mode === "signup" ? (
            <p className="font-label-md text-xs text-on-surface-variant">
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-primary hover:underline font-bold"
              >
                Log In
              </button>
            </p>
          ) : (
            <button
              onClick={() => setMode("login")}
              className="font-label-md text-xs text-primary hover:underline font-bold flex items-center justify-center gap-1 mx-auto"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Log In</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
