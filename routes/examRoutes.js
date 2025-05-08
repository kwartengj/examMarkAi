import express from "express";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import { isAuthenticated, isOwnerOrAdmin } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF, Word documents, and images are allowed"));
    }
  },
});

const router = express.Router();

/**
 * @route   GET /api/exams
 * @desc    Get all exams
 * @access  Private
 */
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    // Filter exams by user if not admin
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };

    const exams = await Exam.find(filter)
      .sort({ date: -1 })
      .populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/exams/:id
 * @desc    Get exam by ID
 * @access  Private
 */
router.get("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("questions");

    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found" });
    }

    // Check if user has permission to view this exam
    if (
      req.user.role !== "admin" &&
      exam.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to view this exam",
      });
    }

    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/exams
 * @desc    Create a new exam
 * @access  Private
 */
router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    const { title, date, status, questions } = req.body;

    // Create new exam
    const exam = new Exam({
      title,
      date: date || Date.now(),
      status: status || "pending",
      createdBy: req.user._id,
      paperCount: 0,
    });

    await exam.save();

    // If questions are provided, create them
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const questionDocs = questions.map((q, index) => ({
        examId: exam._id,
        number: index + 1,
        text: q.text,
        maxScore: q.maxScore,
        markingCriteria: q.markingCriteria || [],
      }));

      const createdQuestions = await Question.insertMany(questionDocs);

      // Update exam with question IDs
      exam.questions = createdQuestions.map((q) => q._id);
      await exam.save();
    }

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data: exam,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    next(error);
  }
});

/**
 * @route   PUT /api/exams/:id
 * @desc    Update an exam
 * @access  Private
 */
router.put(
  "/:id",
  isAuthenticated,
  isOwnerOrAdmin(Exam),
  async (req, res, next) => {
    try {
      const { title, date, status } = req.body;

      const exam = await Exam.findById(req.params.id);

      if (!exam) {
        return res
          .status(404)
          .json({ success: false, message: "Exam not found" });
      }

      // Update exam fields
      if (title) exam.title = title;
      if (date) exam.date = date;
      if (status) exam.status = status;

      await exam.save();

      res.status(200).json({
        success: true,
        message: "Exam updated successfully",
        data: exam,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res
          .status(400)
          .json({ success: false, message: messages.join(", ") });
      }
      next(error);
    }
  },
);

/**
 * @route   DELETE /api/exams/:id
 * @desc    Delete an exam
 * @access  Private
 */
router.delete(
  "/:id",
  isAuthenticated,
  isOwnerOrAdmin(Exam),
  async (req, res, next) => {
    try {
      const exam = await Exam.findById(req.params.id);

      if (!exam) {
        return res
          .status(404)
          .json({ success: false, message: "Exam not found" });
      }

      // Delete associated questions
      await Question.deleteMany({ examId: exam._id });

      // Delete the exam
      await exam.remove();

      res.status(200).json({
        success: true,
        message: "Exam deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/exams/upload
 * @desc    Upload an exam file with marking criteria
 * @access  Private
 */
router.post(
  "/upload",
  isAuthenticated,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { title, markingCriteria } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Exam title is required",
        });
      }

      let parsedCriteria = [];
      try {
        parsedCriteria = JSON.parse(markingCriteria || "[]");
        if (!Array.isArray(parsedCriteria)) {
          throw new Error("Marking criteria must be an array");
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid marking criteria format",
        });
      }

      // Create new exam
      const exam = new Exam({
        title,
        date: Date.now(),
        status: "pending",
        createdBy: req.user._id,
        paperCount: 0,
        markingCriteria: parsedCriteria,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
      });

      await exam.save();

      res.status(201).json({
        success: true,
        message: "Exam uploaded successfully",
        data: exam,
      });
    } catch (error) {
      if (req.file) {
        // Delete the uploaded file if there was an error
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res
          .status(400)
          .json({ success: false, message: messages.join(", ") });
      }
      next(error);
    }
  },
);

export default router;
