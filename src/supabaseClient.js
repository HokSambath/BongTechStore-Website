import { createClient } from "@supabase/supabase-js";

// === IMPORTANT ===
// Always use the base Supabase Project URL (origin only, without "/rest/v1/")
// For example: "https://xxxxxx.supabase.co"
const SUPABASE_URL = "https://ievobrdqmcemaetwrqtc.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_AZ_XXKh_OH5EbHBFhDwHAw_sLXzywmC";
// =================================================

// Export the configured Supabase client for use throughout the application
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
