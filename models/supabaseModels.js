import { supabase } from "../config/supabase.js";

// User model operations
export const UserModel = {
  // Create a new user
  create: async (userData) => {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username: userData.username,
          email: userData.email,
          password_hash: userData.password, // Note: password should be hashed before storing
          role: userData.role || "examiner",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Find a user by email
  findByEmail: async (email) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Find a user by ID
  findById: async (id) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Update user's last login
  updateLastLogin: async (id) => {
    const { data, error } = await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  },
};

// Exam model operations
export const ExamModel = {
  // Get all exams
  getAll: async () => {
    const { data, error } = await supabase.from("exams").select("*");

    if (error) throw error;
    return data;
  },

  // Get exam by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Create a new exam
  create: async (examData) => {
    const { data, error } = await supabase
      .from("exams")
      .insert([
        {
          title: examData.title,
          subject: examData.subject,
          grade_level: examData.gradeLevel,
          total_marks: examData.totalMarks,
          created_by: examData.createdBy,
          created_at: new Date().toISOString(),
          status: examData.status || "pending",
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Update an exam
  update: async (id, examData) => {
    const { data, error } = await supabase
      .from("exams")
      .update(examData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Delete an exam
  delete: async (id) => {
    const { error } = await supabase.from("exams").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};
