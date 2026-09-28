import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "your_supabase_url_here" &&
  supabaseUrl.startsWith("http");

if (!isConfigured) {
  console.warn(
    "⚠️ Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
