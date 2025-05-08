import { createClient } from "@supabase/supabase-js";
import {
  userTableSchema,
  examTableSchema,
  questionTableSchema,
  markingCriteriaTableSchema,
  studentAnswerTableSchema,
  criteriaMatchedTableSchema,
} from "../models/supabaseModels.js";

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

// Helper function to create a table if it doesn't exist
async function createTableIfNotExists(tableName, schema) {
  try {
    if (!supabase) return false;

    // Check if table exists
    const { data, error } = await supabase.from(tableName).select("*").limit(1);

    if (error && error.code === "42P01") {
      // Table doesn't exist error code
      // Create the table using SQL
      const createTableSQL = `
        CREATE TABLE ${tableName} (
          ${Object.entries(schema)
            .map(([column, type]) => `${column} ${type}`)
            .join(",\n          ")}
        );
      `;

      const { error: createError } = await supabase.rpc("exec_sql", {
        sql: createTableSQL,
      });

      if (createError) {
        console.error(`Error creating table ${tableName}:`, createError);
        return false;
      }

      console.log(`Table ${tableName} created successfully`);
      return true;
    } else if (error) {
      console.error(`Error checking table ${tableName}:`, error);
      return false;
    }

    console.log(`Table ${tableName} already exists`);
    return true;
  } catch (error) {
    console.error(`Error in createTableIfNotExists for ${tableName}:`, error);
    return false;
  }
}

// Initialize database schema
export const initializeSchema = async () => {
  try {
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot create schema.");
      return false;
    }

    // Create tables in order (respecting foreign key constraints)
    const tables = [
      { name: "users", schema: userTableSchema },
      { name: "exams", schema: examTableSchema },
      { name: "questions", schema: questionTableSchema },
      { name: "marking_criteria", schema: markingCriteriaTableSchema },
      { name: "student_answers", schema: studentAnswerTableSchema },
      { name: "criteria_matched", schema: criteriaMatchedTableSchema },
    ];

    for (const table of tables) {
      await createTableIfNotExists(table.name, table.schema);
    }

    return true;
  } catch (error) {
    console.error("Error initializing schema:", error);
    return false;
  }
};

// Connect to Supabase and initialize schema
export const connectSupabase = async () => {
  try {
    if (!supabase) {
      console.error(
        "Supabase client not initialized. Check your environment variables.",
      );
      return false;
    }

    // Test the connection by fetching a simple query
    const { data, error } = await supabase.from("users").select("*").limit(1);

    if (error && error.code === "42P01") {
      // Table doesn't exist
      console.log("Tables don't exist yet. Initializing schema...");
      const schemaInitialized = await initializeSchema();
      if (!schemaInitialized) {
        console.error("Failed to initialize schema.");
        return false;
      }
      console.log("Schema initialized successfully.");
      return true;
    } else if (error) {
      console.error("Supabase connection error:", error);
      return false;
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
