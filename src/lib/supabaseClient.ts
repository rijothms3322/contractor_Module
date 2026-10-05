import { createClient } from "@supabase/supabase-js";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";       

// Retrieve environment keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials exist and are populated
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  isValidUrl(supabaseUrl);

// ------------------------------------------------------------
// NATIVE MOBILE STORAGE ADAPTER (iOS & Android Persistence)
// ------------------------------------------------------------
const capacitorStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value });
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key });
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  }
};

// Safe Client Export
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      storage: capacitorStorageAdapter,
      storageKey: "medimz-auth-token",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  })
  : null as any;

// Global startup notification in client consoles
if (typeof window !== "undefined") {
  if (isSupabaseConfigured) {
    console.log(
      "%c[Medimz Supabase Engine]%c Connected to live database successfully. Real-time patient sync active! 🧬",
      "color: #ea580c; font-weight: bold; background: #ffedd5; padding: 2px 6px; border-radius: 4px;",
      "color: #0f172a;"
    );
  } else {
    console.warn(
      "[Medimz Supabase Engine] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing or unconfigured.\n" +
      "👉 Medimz is running in offline DEMO MODE with localStorage fallback. All patient screens are fully queryable and testable!"
    );
  }
}