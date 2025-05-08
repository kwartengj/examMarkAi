import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import { connectDB } from "./config/database.js";
import { connectSupabase, isSupabaseConfigured } from "./config/supabase.js";
import examRoutes from "./routes/examRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import studentAnswerRoutes from "./routes/studentAnswerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import "./config/passport.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB (legacy connection)
connectDB();

// Connect to Supabase and initialize schema if needed
if (isSupabaseConfigured()) {
  connectSupabase()
    .then((connected) => {
      if (connected) {
        console.log("Supabase connected and schema initialized successfully");
      } else {
        console.error("Failed to connect to Supabase or initialize schema");
      }
    })
    .catch((error) => {
      console.error("Error connecting to Supabase:", error);
    });
} else {
  console.warn("Supabase not configured. Skipping connection.");
}

// Initialize Supabase in browser context
if (typeof window !== "undefined") {
  connectSupabase()
    .then((connected) => {
      if (connected) {
        console.log("Supabase connected in browser context");
      } else {
        console.error("Failed to connect to Supabase in browser context");
      }
    })
    .catch((error) => {
      console.error("Error connecting to Supabase in browser context:", error);
    });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "exam-marking-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/student-answers", studentAnswerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    supabase: isSupabaseConfigured() ? "configured" : "not configured",
  };
  res.status(200).json(health);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An error occurred on the server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
