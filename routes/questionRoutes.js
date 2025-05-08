import express from "express";
import Question from "../models/Question.js";
import Exam from "../models/Exam.js";
import { isAuthenticated, isOwnerOrAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/questions/exam/:examId
 * @desc    Get all questions for an exam
 * @access  Private
 */
router.get("/exam/:examId", isAuthenticated, async (req, res, next) => {
  try {
    const { examId } = req.params;

    // Check if exam exists and user has permission
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found" });
    }

    // Check if user has permission to view this exam's questions
    if (
      req.user.role !== "admin" &&
      exam.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You do not have permission to view these questions",
      });
    }

    const questions = await Question.find({ examId }).sort({ number: 1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/questions/:id
 * @desc    Get question by ID
 * @access  Private
 */
router.get("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Check if user has permission to view this question
    const exam = await Exam.findById(question.examId);
    if (
      req.user.role !== "admin" &&
      exam.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to view this question",
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/questions
 * @desc    Create a new question
 * @access  Private
 */
router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    const { examId, number, text, maxScore, markingCriteria } = req.body;

    // Check if exam exists and user has permission
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found" });
    }

    // Check if user has permission to add questions to this exam
    if (
      req.user.role !== "admin" &&
      exam.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You do not have permission to add questions to this exam",
      });
    }

    // Create new question
    const question = new Question({
      examId,
      number,
      text,
      maxScore,
      markingCriteria: markingCriteria || [],
    });

    await question.save();

    // Add question to exam's questions array
    exam.questions.push(question._id);
    await exam.save();

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
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
 * @route   PUT /api/questions/:id
 * @desc    Update a question
 * @access  Private
 */
router.put("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { text, maxScore, markingCriteria } = req.body;

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Check if user has permission to update this question
    const exam = await Exam.findById(question.examId);
    if (
      req.user.role !== "admin" &&
      exam.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You do not have permission to update this question",
      });
    }

    // Update question fields
    if (text) question.text = text;
    if (maxScore) question.maxScore = maxScore;
    if (markingCriteria) question.markingCriteria = markingCriteria;

    await question.save();

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: question,
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
 * @route   DELETE /api/questions/:id
 * @desc    Delete a question
 * @access  Private
 */
router.delete("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Check if user has permission to delete this question
    const exam = await Exam.findById(question.examId);
    if (
      req.user.role !== "admin" &&
      exam.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You do not have permission to delete this question",
      });
    }

    // Remove question from exam's questions array
    exam.questions = exam.questions.filter(
      (q) => q.toString() !== question._id.toString(),
    );
    await exam.save();

    // Delete the question
    await question.remove();

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
