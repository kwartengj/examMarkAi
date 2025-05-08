import { supabase } from "../config/supabase.js";

// User table schema
export const userTableSchema = {
  id: "uuid primary key default uuid_generate_v4()",
  username: "text not null",
  email: "text unique not null",
  password_hash: "text",
  role: "text default 'examiner'",
  created_at: "timestamp with time zone default now()",
  last_login: "timestamp with time zone",
};

// Exam table schema
export const examTableSchema = {
  id: "uuid primary key default uuid_generate_v4()",
  title: "text not null",
  subject: "text",
  grade_level: "text",
  total_marks: "int",
  date: "timestamp with time zone default now()",
  status: "text default 'pending'",
  created_by: "uuid references users(id)",
  paper_count: "int default 0",
  file_url: "text",
  file_name: "text",
  created_at: "timestamp with time zone default now()",
  updated_at: "timestamp with time zone default now()",
};

// Question table schema
export const questionTableSchema = {
  id: "uuid primary key default uuid_generate_v4()",
  exam_id: "uuid references exams(id)",
  number: "int not null",
  text: "text not null",
  max_score: "int not null",
  created_at: "timestamp with time zone default now()",
  updated_at: "timestamp with time zone default now()",
};

// Marking criteria table schema (for both exam and question criteria)
export const markingCriteriaTableSchema = {
  id: "uuid primary key default uuid_generate_v4()",
  parent_id: "uuid not null",
  parent_type: "text not null", // 'exam' or 'question'
  description: "text not null",
  max_score: "int not null",
  points: "int",
  created_at: "timestamp with time zone default now()",
};

// Student answer table schema
export const studentAnswerTableSchema = {
  id: "uuid primary key default uuid_generate_v4()",
  question_id: "uuid references questions(id)",
  exam_id: "uuid references exams(id)",
  student_id: "text not null",
  text: "text not null",
  ai_suggested_score: "int default 0",
  ai_confidence_level: "int",
  ai_reasoning: "text",
  examiner_score: "int",
  feedback: "text",
  marked_by: "uuid references users(id)",
  marked_at: "timestamp with time zone",
  created_at: "timestamp with time zone default now()",
  updated_at: "timestamp with time zone default now()",
};

// Criteria matched junction table (for student answers)
export const criteriaMatchedTableSchema = {
  id: "uuid primary key default uuid_generate_v4()",
  student_answer_id: "uuid references student_answers(id)",
  criteria_description: "text not null",
  created_at: "timestamp with time zone default now()",
};

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
