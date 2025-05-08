import express from "express";
import StudentAnswer from "../models/StudentAnswer.js";
import Question from "../models/Question.js";
import Exam from "../models/Exam.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/student-answers/exam/:examId/student/:studentId
 * @desc    Get all answers for a student in an exam
 * @access  Private
 */
router.get(
  "/exam/:examId/student/:studentId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { examId, studentId } = req.params;

      // Check if exam exists and user has permission
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res
          .status(404)
          .json({ success: false, message: "Exam not found" });
      }

      // Check if user has permission to view these answers
      if (
        req.user.role !== "admin" &&
        exam.createdBy.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You do not have permission to view these answers",
        });
      }

      const answers = await StudentAnswer.find({ examId, studentId })
        .populate("questionId")
        .sort({ "questionId.number": 1 });

      res.status(200).json({
        success: true,
        count: answers.length,
        data: answers,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   GET /api/student-answers/:id
 * @desc    Get student answer by ID
 * @access  Private
 */
router.get("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const answer = await StudentAnswer.findById(req.params.id).populate(
      "questionId",
    );

    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });
    }

    // Check if user has permission to view this answer
    const exam = await Exam.findById(answer.examId);
    if (
      req.user.role !== "admin" &&
      exam.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to view this answer",
      });
    }

    res.status(200).json({
      success: true,
      data: answer,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/student-answers
 * @desc    Create a new student answer
 * @access  Private
 */
router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    const { questionId, examId, studentId, text, aiSuggestedScore } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Check if exam exists and user has permission
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found" });
    }

    // Check if user has permission to add answers to this exam
    if (
      req.user.role !== "admin" &&
      exam.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You do not have permission to add answers to this exam",
      });
    }

    // Create new student answer
    const answer = new StudentAnswer({
      questionId,
      examId,
      studentId,
      text,
      aiSuggestedScore: aiSuggestedScore || 0,
    });

    await answer.save();

    // Update exam paper count if this is a new student
    const existingAnswers = await StudentAnswer.find({ examId, studentId });
    if (existingAnswers.length === 1) {
      // This is the first answer for this student
      exam.paperCount += 1;
      await exam.save();
    }

    res.status(201).json({
      success: true,
      message: "Student answer created successfully",
      data: answer,
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
 * @route   PUT /api/student-answers/:id
 * @desc    Update a student answer (mark it)
 * @access  Private
 */
router.put("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { examinerScore, feedback } = req.body;

    const answer = await StudentAnswer.findById(req.params.id);

    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });
    }

    // Check if user has permission to mark this answer
    const exam = await Exam.findById(answer.examId);
    if (
      req.user.role !== "admin" &&
      exam.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to mark this answer",
      });
    }

    // Update answer fields
    if (examinerScore !== undefined) answer.examinerScore = examinerScore;
    if (feedback !== undefined) answer.feedback = feedback;

    // Set marking metadata
    answer.markedBy = req.user._id;
    answer.markedAt = Date.now();

    await answer.save();

    res.status(200).json({
      success: true,
      message: "Answer marked successfully",
      data: answer,
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

export default router;
