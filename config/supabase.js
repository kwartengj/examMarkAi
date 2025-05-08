import { createClient } from "@supabase/supabase-js";

// Supabase connection configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if URL and key are available
let supabaseInstance = null;

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.warn(
      "Supabase URL or Anon Key not provided. Supabase client not initialized.",
    );
  }
} catch (error) {
  console.error("Error initializing Supabase client:", error);
}

export const supabase = supabaseInstance;

// Connect to Supabase
export const connectSupabase = async () => {
  try {
    if (!supabase) {
      console.error(
        "Supabase client not initialized. Check your environment variables.",
      );
      return false;
    }

    // Test the connection by fetching a simple query
    const { data, error } = await supabase
      .from("health_check")
      .select("*")
      .limit(1);

    if (error) {
      throw error;
    }

    console.log("Supabase connected successfully");
    return true;
  } catch (error) {
    console.error(
      "Supabase connection error:",
      error?.message || "Unknown error",
    );
    return false;
  }
};

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY) && Boolean(supabase)
  );
};
