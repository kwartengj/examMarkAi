import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error(
    "Supabase URL or Anon Key not provided. Client-side Supabase client not initialized.",
  );
}

export const supabase = supabaseClient;

export const initializeSupabase = async () => {
  if (!supabase) return false;

  try {
    // Test connection
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error && error.code !== "42P01") {
      console.error("Error connecting to Supabase:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
    return false;
  }
};
