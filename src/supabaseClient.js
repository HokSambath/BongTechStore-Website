import { createClient } from "@supabase/supabase-js";

// === IMPORTANT ===
// Use environment variables for Vercel/Production deployment, falling back to current project values.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ievobrdqmcemaetwrqtc.supabase.co";
const SUPABASE_PUBLIC_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_AZ_XXKh_OH5EbHBFhDwHAw_sLXzywmC";
// =================================================

// Export the configured Supabase client for use throughout the application
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
