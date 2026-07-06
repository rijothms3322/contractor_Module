import { createClient } from "@supabase/supabase-js";

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

// Safe Client Export
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
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
