import axios from "axios";
import { supabase } from "../lib/supabaseClient";

// Create axios instance with base URL and credentials (for fallback)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to format Supabase response
const formatSupabaseResponse = (data: any, error: any) => {
  if (error) {
    console.error("Supabase error:", error);
    return { success: false, message: error.message, data: null };
  }
  return { success: true, data };
};

// Auth API
export const authAPI = {
  register: async (userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            role: userData.role || "examiner",
          },
        },
      });

      if (error) throw error;

      // Check if user was created successfully
      if (!data.user) {
        return {
          success: false,
          message: "Registration failed - no user created",
        };
      }

      // Create user profile in the users table
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          username: userData.username,
          email: userData.email,
          role: userData.role || "examiner",
          created_at: new Date().toISOString(),
        },
      ]);

      // Even if there's a profile error, the user is still registered in Auth
      if (profileError) {
        console.warn(
          "User created in Auth but profile creation failed:",
          profileError,
        );
      }

      return {
        success: true,
        message: data.session
          ? "User registered and logged in successfully"
          : "User registered successfully. Please check your email to confirm registration.",
        user: {
          id: data.user.id,
          username: userData.username,
          email: userData.email,
          role: userData.role || "examiner",
        },
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      return { success: false, message: error.message };
    }
  },

  login: async (credentials: any) => {
    try {
      console.log("Attempting login with:", credentials.email);

      if (!supabase) {
        console.error("Supabase client is not initialized");
        return {
          success: false,
          message: "Authentication service unavailable",
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }

      if (!data.user) {
        console.error("No user returned from auth");
        return { success: false, message: "Authentication failed" };
      }

      console.log("Auth successful, fetching user profile");

      // Get user profile from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      // If user exists in auth but not in users table, create a profile
      if (userError && userError.code === "PGRST116") {
        console.log("User not found in users table, creating profile");
        // Create user profile
        const { data: newUserData, error: createError } = await supabase
          .from("users")
          .insert([
            {
              id: data.user.id,
              username:
                data.user.user_metadata?.username ||
                data.user.email?.split("@")[0] ||
                "User",
              email: data.user.email,
              role: "examiner",
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (createError) {
          console.error("Error creating user profile:", createError);
          // Even if profile creation fails, return the basic user data
          return {
            success: true,
            message: "Login successful, but profile creation failed",
            user: {
              id: data.user.id,
              username: data.user.email?.split("@")[0] || "User",
              email: data.user.email,
              role: "examiner",
            },
          };
        }

        return {
          success: true,
          message: "Login successful",
          user: newUserData[0],
        };
      } else if (userError) {
        console.error("Error fetching user profile:", userError);
        // Return basic user data even if profile fetch fails
        return {
          success: true,
          message: "Login successful, but profile fetch failed",
          user: {
            id: data.user.id,
            username: data.user.email?.split("@")[0] || "User",
            email: data.user.email,
            role: "examiner",
          },
        };
      }

      console.log("Login successful with user profile");
      return {
        success: true,
        message: "Login successful",
        user: userData,
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, message: error.message || "Login failed" };
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, message: "Logout successful" };
    } catch (error: any) {
      console.error("Logout error:", error);
      return { success: false, message: error.message };
    }
  },

  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (!data.user) {
        return { success: false, message: "No user found" };
      }

      // Get user profile from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (userError) throw userError;

      return { success: true, user: userData };
    } catch (error: any) {
      console.error("Get current user error:", error);
      return { success: false, message: error.message };
    }
  },
};

// Exams API
export const examsAPI = {
  getAllExams: async () => {
    try {
      // Check if supabase is initialized
      if (!supabase) {
        console.error("Supabase client is not initialized");
        return {
          success: false,
          message: "Supabase client is not initialized",
          data: [],
        };
      }

      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching exams:", error);
        return { success: false, message: error.message, data: [] };
      }

      // If no data or empty array, return empty array instead of null
      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Error fetching exams:", error);
      return { success: false, message: error.message, data: [] };
    }
  },

  getExamById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .single();

      return formatSupabaseResponse(data, error);
    } catch (error: any) {
      console.error(`Error fetching exam ${id}:`, error);
      return { success: false, message: error.message, data: null };
    }
  },

  createExam: async (examData: any) => {
    try {
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

      return formatSupabaseResponse(data?.[0], error);
    } catch (error: any) {
      console.error("Error creating exam:", error);
      return { success: false, message: error.message, data: null };
    }
  },

  uploadExam: async (formData: FormData) => {
    // For file uploads, we'll need to use Supabase Storage
    try {
      const file = formData.get("file") as File;
      const examData = JSON.parse(formData.get("examData") as string);

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: fileData, error: fileError } = await supabase.storage
        .from("exam-papers")
        .upload(fileName, file);

      if (fileError) throw fileError;

      // Create exam record with file URL
      const fileUrl = supabase.storage
        .from("exam-papers")
        .getPublicUrl(fileName).data.publicUrl;

      const { data, error } = await supabase
        .from("exams")
        .insert([
          {
            ...examData,
            file_url: fileUrl,
            created_at: new Date().toISOString(),
            status: "pending",
          },
        ])
        .select();

      return formatSupabaseResponse(data?.[0], error);
    } catch (error: any) {
      console.error("Error uploading exam:", error);
      return { success: false, message: error.message, data: null };
    }
  },

  updateExam: async (id: string, examData: any) => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .update(examData)
        .eq("id", id)
        .select();

      return formatSupabaseResponse(data?.[0], error);
    } catch (error: any) {
      console.error(`Error updating exam ${id}:`, error);
      return { success: false, message: error.message, data: null };
    }
  },

  deleteExam: async (id: string) => {
    try {
      const { error } = await supabase.from("exams").delete().eq("id", id);

      return {
        success: !error,
        message: error ? error.message : "Exam deleted successfully",
      };
    } catch (error: any) {
      console.error(`Error deleting exam ${id}:`, error);
      return { success: false, message: error.message };
    }
  },
};

// Questions API
export const questionsAPI = {
  getQuestionsByExamId: async (examId: string) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", examId)
        .order("number", { ascending: true });

      return formatSupabaseResponse(data, error);
    } catch (error: any) {
      console.error(`Error fetching questions for exam ${examId}:`, error);
      return { success: false, message: error.message, data: null };
    }
  },

  getQuestionById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("id", id)
        .single();

      return formatSupabaseResponse(data, error);
    } catch (error: any) {
      console.error(`Error fetching question ${id}:`, error);
      return { success: false, message: error.message, data: null };
    }
  },

  createQuestion: async (questionData: any) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .insert([questionData])
        .select();

      return formatSupabaseResponse(data?.[0], error);
    } catch (error: any) {
      console.error("Error creating question:", error);
      return { success: false, message: error.message, data: null };
    }
  },

  updateQuestion: async (id: string, questionData: any) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .update(questionData)
        .eq("id", id)
        .select();

      return formatSupabaseResponse(data?.[0], error);
    } catch (error: any) {
      console.error(`Error updating question ${id}:`, error);
      return { success: false, message: error.message, data: null };
    }
  },

  deleteQuestion: async (id: string) => {
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);

      return {
        success: !error,
        message: error ? error.message : "Question deleted successfully",
      };
    } catch (error: any) {
      console.error(`Error deleting question ${id}:`, error);
      return { success: false, message: error.message };
    }
  },
};

// Student Answers API
export const studentAnswersAPI = {
  getAnswersByExamAndStudent: async (examId: string, studentId: string) => {
    try {
      const { data, error } = await supabase
        .from("student_answers")
        .select("*, questions(*)")
        .eq("exam_id", examId)
        .eq("student_id", studentId);

      return formatSupabaseResponse(data, error);
    } catch (error: any) {
      console.error(
        `Error fetching answers for exam ${examId} and student ${studentId}:`,
        error,
      );
      return { success: false, message: error.message, data: null };
    }
  },

  getAnswerById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("student_answers")
        .select("*")
        .eq("id", id)
        .single();

      return formatSupabaseResponse(data, error);
    } catch (error: any) {
      console.error(`Error fetching answer ${id}:`, error);
      return { success: false, message: error.message, data: null };
    }
  },

  createAnswer: async (answerData: any) => {
    try {
      const { data, error } = await supabase
        .from("student_answers")
        .insert([answerData])
        .select();

      return formatSupabaseResponse(data?.[0], error);
    } catch (error: any) {
      console.error("Error creating answer:", error);
      return { success: false, message: error.message, data: null };
    }
  },

  updateAnswer: async (id: string, answerData: any) => {
    try {
      const { data, error } = await supabase
        .from("student_answers")
        .update(answerData)
        .eq("id", id)
        .select();

      return formatSupabaseResponse(data?.[0], error);
    } catch (error: any) {
      console.error(`Error updating answer ${id}:`, error);
      return { success: false, message: error.message, data: null };
    }
  },
};

// Analytics API
export const analyticsAPI = {
  getExamAnalytics: async (examId: string) => {
    try {
      // For analytics, we might need to perform more complex queries
      // This is a simplified example
      const { data: answers, error: answersError } = await supabase
        .from("student_answers")
        .select("*")
        .eq("exam_id", examId);

      if (answersError) throw answersError;

      // Process the data to generate analytics
      // This would typically involve more complex calculations
      const analytics = {
        totalAnswers: answers.length,
        averageScore:
          answers.reduce(
            (sum, answer) => sum + (answer.examiner_score || 0),
            0,
          ) / answers.length,
        // Add more analytics as needed
      };

      return { success: true, data: analytics };
    } catch (error: any) {
      console.error(`Error fetching analytics for exam ${examId}:`, error);
      return { success: false, message: error.message, data: null };
    }
  },

  refreshExamAnalytics: async (examId: string) => {
    // This would typically involve recalculating analytics
    return analyticsAPI.getExamAnalytics(examId);
  },

  getDashboardAnalytics: async () => {
    try {
      // Fetch data needed for dashboard analytics
      const { data: exams, error: examsError } = await supabase
        .from("exams")
        .select("*");

      if (examsError) throw examsError;

      const { data: answers, error: answersError } = await supabase
        .from("student_answers")
        .select("*");

      if (answersError) throw answersError;

      // Process the data to generate dashboard analytics
      const analytics = {
        totalExams: exams.length,
        completedExams: exams.filter((exam) => exam.status === "completed")
          .length,
        pendingExams: exams.filter((exam) => exam.status === "pending").length,
        // Add more analytics as needed
      };

      return { success: true, data: analytics };
    } catch (error: any) {
      console.error("Error fetching dashboard analytics:", error);
      return { success: false, message: error.message, data: null };
    }
  },
};

// Error handling interceptor for axios (fallback)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      console.error("Session expired or unauthorized");
    }
    return Promise.reject(error);
  },
);

export default api;
