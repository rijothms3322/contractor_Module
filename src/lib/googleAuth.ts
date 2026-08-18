import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/lib/supabaseClient";

let initialized = false;

/**
 * Initialize the native GoogleAuth plugin once, before first sign-in attempt.
 * Call this once at app startup (e.g. in AppProvider's mount effect) — NOT
 * inside the sign-in click handler, to avoid re-init races.
 */
export function initGoogleAuth() {
  if (initialized || !Capacitor.isNativePlatform()) return;

  GoogleAuth.initialize({
    clientId: "377950550538-ioghl0itm300s5bvd3mhb6qc9v4n754a.apps.googleusercontent.com", // web client ID, used for serverClientId/idToken audience
    scopes: ["profile", "email"],
    grantOfflineAccess: true,
  });

  initialized = true;
}

export type GoogleSignInResult =
  | { status: "success" }
  | { status: "cancelled" }
  | { status: "error"; message: string };

/**
 * Fires native Google sign-in, exchanges the idToken with Supabase.
 * Does NOT do any routing/profile logic — that's the job of the
 * onAuthStateChange listener elsewhere. This function's only job is to
 * establish a valid Supabase session, quickly, with clear error states.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback — standard OAuth redirect flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { status: "success" };
    }

    if (!initialized) initGoogleAuth();

    const googleUser = await GoogleAuth.signIn();
    const idToken = googleUser?.authentication?.idToken;

    if (!idToken) {
      return { status: "error", message: "No idToken returned from Google." };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) throw error;

    return { status: "success" };
  } catch (err: any) {
    // Codetrix plugin throws a specific error/code on user-cancel
    const msg = String(err?.message || err);
    if (msg.toLowerCase().includes("cancel") || err?.code === "12501") {
      return { status: "cancelled" };
    }
    console.error("[GoogleAuth] Sign-in failed:", err);
    return { status: "error", message: msg };
  }
}

export async function signOutGoogle() {
  try {
    if (Capacitor.isNativePlatform()) {
      await GoogleAuth.signOut().catch(() => {});
    }
  } finally {
    await supabase.auth.signOut();
  }
}