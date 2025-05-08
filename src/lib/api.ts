import axios from "axios";

// Create axios instance with base URL and credentials
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authAPI = {
  register: async (userData: any) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  logout: async () => {
    const response = await api.get("/auth/logout");
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get("/auth/user");
    return response.data;
  },
};

// Exams API
export const examsAPI = {
  getAllExams: async () => {
    const response = await api.get("/exams");
    return response.data;
  },
  getExamById: async (id: string) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },
  createExam: async (examData: any) => {
    const response = await api.post("/exams", examData);
    return response.data;
  },
  uploadExam: async (formData: FormData) => {
    const response = await api.post("/exams/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateExam: async (id: string, examData: any) => {
    const response = await api.put(`/exams/${id}`, examData);
    return response.data;
  },
  deleteExam: async (id: string) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },
};

// Questions API
export const questionsAPI = {
  getQuestionsByExamId: async (examId: string) => {
    const response = await api.get(`/questions/exam/${examId}`);
    return response.data;
  },
  getQuestionById: async (id: string) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },
  createQuestion: async (questionData: any) => {
    const response = await api.post("/questions", questionData);
    return response.data;
  },
  updateQuestion: async (id: string, questionData: any) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },
  deleteQuestion: async (id: string) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
};

// Student Answers API
export const studentAnswersAPI = {
  getAnswersByExamAndStudent: async (examId: string, studentId: string) => {
    const response = await api.get(
      `/student-answers/exam/${examId}/student/${studentId}`,
    );
    return response.data;
  },
  getAnswerById: async (id: string) => {
    const response = await api.get(`/student-answers/${id}`);
    return response.data;
  },
  createAnswer: async (answerData: any) => {
    const response = await api.post("/student-answers", answerData);
    return response.data;
  },
  updateAnswer: async (id: string, answerData: any) => {
    const response = await api.put(`/student-answers/${id}`, answerData);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getExamAnalytics: async (examId: string) => {
    const response = await api.get(`/analytics/exam/${examId}`);
    return response.data;
  },
  refreshExamAnalytics: async (examId: string) => {
    const response = await api.post(`/analytics/exam/${examId}/refresh`);
    return response.data;
  },
  getDashboardAnalytics: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Redirect to login or dispatch logout action
      console.error("Session expired or unauthorized");
      // You might want to redirect to login page or dispatch a logout action here
    }
    return Promise.reject(error);
  },
);

export default api;
