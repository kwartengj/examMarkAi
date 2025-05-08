import express from "express";
import Analytics from "../models/Analytics.js";
import Exam from "../models/Exam.js";
import StudentAnswer from "../models/StudentAnswer.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/analytics/exam/:examId
 * @desc    Get analytics for an exam
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

    // Check if user has permission to view these analytics
    if (
      req.user.role !== "admin" &&
      exam.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You do not have permission to view these analytics",
      });
    }

    // Find existing analytics or create new ones
    let analytics = await Analytics.findOne({ examId });

    if (!analytics) {
      // Generate new analytics
      analytics = await generateExamAnalytics(examId);
    }

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/analytics/exam/:examId/refresh
 * @desc    Refresh analytics for an exam
 * @access  Private
 */
router.post(
  "/exam/:examId/refresh",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { examId } = req.params;

      // Check if exam exists and user has permission
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res
          .status(404)
          .json({ success: false, message: "Exam not found" });
      }

      // Check if user has permission to refresh these analytics
      if (
        req.user.role !== "admin" &&
        exam.createdBy.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You do not have permission to refresh these analytics",
        });
      }

      // Generate new analytics
      const analytics = await generateExamAnalytics(examId);

      res.status(200).json({
        success: true,
        message: "Analytics refreshed successfully",
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics for all exams
 * @access  Private
 */
router.get("/dashboard", isAuthenticated, async (req, res, next) => {
  try {
    // Filter exams by user if not admin
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };

    // Get all exams for this user
    const exams = await Exam.find(filter);
    const examIds = exams.map((exam) => exam._id);

    // Get analytics for all exams
    const analyticsData = await Analytics.find({ examId: { $in: examIds } });

    // Aggregate analytics data
    const dashboardData = aggregateDashboardAnalytics(analyticsData, exams);

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to generate exam analytics
async function generateExamAnalytics(examId) {
  // Get all student answers for this exam
  const answers = await StudentAnswer.find({ examId }).populate("questionId");

  // Get unique student IDs
  const studentIds = [...new Set(answers.map((answer) => answer.studentId))];

  // Calculate total, completed, and pending exams
  const totalExams = studentIds.length;
  const completedExams = studentIds.filter((studentId) => {
    const studentAnswers = answers.filter(
      (answer) => answer.studentId === studentId,
    );
    return studentAnswers.every((answer) => answer.examinerScore !== undefined);
  }).length;
  const pendingExams = totalExams - completedExams;

  // Calculate average score
  const markedAnswers = answers.filter(
    (answer) => answer.examinerScore !== undefined,
  );
  const totalScore = markedAnswers.reduce(
    (sum, answer) => sum + answer.examinerScore,
    0,
  );
  const totalMaxScore = markedAnswers.reduce(
    (sum, answer) => sum + answer.questionId.maxScore,
    0,
  );
  const averageScore =
    totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

  // Calculate marking accuracy
  const answersWithBothScores = markedAnswers.filter(
    (answer) =>
      answer.aiSuggestedScore !== undefined &&
      answer.examinerScore !== undefined,
  );

  let markingAccuracy = 0;
  if (answersWithBothScores.length > 0) {
    const accuracySum = answersWithBothScores.reduce((sum, answer) => {
      const maxPossibleScore = answer.questionId.maxScore;
      const scoreDifference = Math.abs(
        answer.aiSuggestedScore - answer.examinerScore,
      );
      const accuracy = 100 - (scoreDifference / maxPossibleScore) * 100;
      return sum + accuracy;
    }, 0);
    markingAccuracy = accuracySum / answersWithBothScores.length;
  }

  // Find common mistakes (based on feedback)
  const commonMistakes = [];
  const feedbackMap = new Map();

  markedAnswers.forEach((answer) => {
    if (answer.feedback) {
      // Simple keyword extraction (in a real app, this would be more sophisticated)
      const keywords = answer.feedback.toLowerCase().match(/\b\w{3,}\b/g) || [];
      keywords.forEach((keyword) => {
        if (!["the", "and", "for", "that", "with"].includes(keyword)) {
          feedbackMap.set(keyword, (feedbackMap.get(keyword) || 0) + 1);
        }
      });
    }
  });

  // Convert to array and sort by frequency
  Array.from(feedbackMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([mistake, frequency]) => {
      commonMistakes.push({ mistake, frequency });
    });

  // Calculate AI confidence levels
  const aiConfidence = [
    { level: "High (90-100%)", percentage: 0 },
    { level: "Medium (70-89%)", percentage: 0 },
    { level: "Low (<70%)", percentage: 0 },
  ];

  if (answersWithBothScores.length > 0) {
    let highCount = 0,
      mediumCount = 0,
      lowCount = 0;

    answersWithBothScores.forEach((answer) => {
      const maxPossibleScore = answer.questionId.maxScore;
      const scoreDifference = Math.abs(
        answer.aiSuggestedScore - answer.examinerScore,
      );
      const accuracy = 100 - (scoreDifference / maxPossibleScore) * 100;

      if (accuracy >= 90) highCount++;
      else if (accuracy >= 70) mediumCount++;
      else lowCount++;
    });

    const total = answersWithBothScores.length;
    aiConfidence[0].percentage = Math.round((highCount / total) * 100);
    aiConfidence[1].percentage = Math.round((mediumCount / total) * 100);
    aiConfidence[2].percentage = Math.round((lowCount / total) * 100);
  }

  // Create or update analytics
  let analytics = await Analytics.findOne({ examId });

  if (analytics) {
    // Update existing analytics
    analytics.totalExams = totalExams;
    analytics.completedExams = completedExams;
    analytics.pendingExams = pendingExams;
    analytics.averageScore = averageScore;
    analytics.markingAccuracy = markingAccuracy;
    analytics.commonMistakes = commonMistakes;
    analytics.aiConfidence = aiConfidence;

    // Add new data point to marking trends
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    // Check if we already have an entry for today
    const existingTrendIndex = analytics.markingTrends.findIndex(
      (trend) => new Date(trend.date).toDateString() === today.toDateString(),
    );

    if (existingTrendIndex >= 0) {
      // Update existing trend
      analytics.markingTrends[existingTrendIndex] = {
        date: today,
        accuracy: markingAccuracy,
        papers: completedExams,
      };
    } else {
      // Add new trend
      analytics.markingTrends.push({
        date: today,
        accuracy: markingAccuracy,
        papers: completedExams,
      });
    }

    await analytics.save();
  } else {
    // Create new analytics
    analytics = new Analytics({
      examId,
      totalExams,
      completedExams,
      pendingExams,
      averageScore,
      markingAccuracy,
      commonMistakes,
      aiConfidence,
      markingTrends: [
        {
          date: new Date(),
          accuracy: markingAccuracy,
          papers: completedExams,
        },
      ],
    });

    await analytics.save();
  }

  return analytics;
}

// Helper function to aggregate dashboard analytics
function aggregateDashboardAnalytics(analyticsData, exams) {
  // Calculate totals
  const totalExams = exams.length;
  const completedExams = exams.filter(
    (exam) => exam.status === "completed",
  ).length;
  const pendingExams = totalExams - completedExams;

  // Calculate average score across all exams
  let totalScoreSum = 0;
  let totalExamCount = 0;

  analyticsData.forEach((analytics) => {
    if (analytics.averageScore > 0) {
      totalScoreSum += analytics.averageScore;
      totalExamCount++;
    }
  });

  const averageScore = totalExamCount > 0 ? totalScoreSum / totalExamCount : 0;

  // Calculate average marking accuracy
  let totalAccuracySum = 0;
  let totalAccuracyCount = 0;

  analyticsData.forEach((analytics) => {
    if (analytics.markingAccuracy > 0) {
      totalAccuracySum += analytics.markingAccuracy;
      totalAccuracyCount++;
    }
  });

  const markingAccuracy =
    totalAccuracyCount > 0 ? totalAccuracySum / totalAccuracyCount : 0;

  // Aggregate common mistakes
  const mistakesMap = new Map();

  analyticsData.forEach((analytics) => {
    analytics.commonMistakes.forEach((mistake) => {
      mistakesMap.set(
        mistake.mistake,
        (mistakesMap.get(mistake.mistake) || 0) + mistake.frequency,
      );
    });
  });

  // Convert to array and sort by frequency
  const commonMistakes = Array.from(mistakesMap.entries())
    .map(([mistake, frequency]) => ({ mistake, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Aggregate AI confidence
  const aiConfidence = [
    { level: "High (90-100%)", percentage: 0 },
    { level: "Medium (70-89%)", percentage: 0 },
    { level: "Low (<70%)", percentage: 0 },
  ];

  if (analyticsData.length > 0) {
    let highSum = 0,
      mediumSum = 0,
      lowSum = 0;

    analyticsData.forEach((analytics) => {
      analytics.aiConfidence.forEach((confidence) => {
        if (confidence.level === "High (90-100%)")
          highSum += confidence.percentage;
        else if (confidence.level === "Medium (70-89%)")
          mediumSum += confidence.percentage;
        else if (confidence.level === "Low (<70%)")
          lowSum += confidence.percentage;
      });
    });

    aiConfidence[0].percentage = Math.round(highSum / analyticsData.length);
    aiConfidence[1].percentage = Math.round(mediumSum / analyticsData.length);
    aiConfidence[2].percentage = Math.round(lowSum / analyticsData.length);
  }

  // Aggregate marking trends
  const trendMap = new Map();

  analyticsData.forEach((analytics) => {
    analytics.markingTrends.forEach((trend) => {
      const dateStr = new Date(trend.date).toLocaleDateString("en-US", {
        month: "short",
      });

      if (!trendMap.has(dateStr)) {
        trendMap.set(dateStr, { accuracySum: 0, papersSum: 0, count: 0 });
      }

      const current = trendMap.get(dateStr);
      current.accuracySum += trend.accuracy;
      current.papersSum += trend.papers;
      current.count++;
    });
  });

  // Convert to array and sort by date
  const markingTrends = Array.from(trendMap.entries())
    .map(([date, data]) => ({
      date,
      accuracy: Math.round((data.accuracySum / data.count) * 10) / 10,
      papers: Math.round(data.papersSum / data.count),
    }))
    .sort((a, b) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months.indexOf(a.date) - months.indexOf(b.date);
    });

  return {
    totalExams,
    completedExams,
    pendingExams,
    averageScore,
    markingAccuracy,
    commonMistakes,
    aiConfidence,
    markingTrends,
  };
}

export default router;
