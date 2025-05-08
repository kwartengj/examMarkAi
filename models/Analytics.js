import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  totalExams: {
    type: Number,
    default: 0,
  },
  completedExams: {
    type: Number,
    default: 0,
  },
  pendingExams: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  markingAccuracy: {
    type: Number,
    default: 0,
  },
  commonMistakes: [
    {
      mistake: String,
      frequency: Number,
    },
  ],
  aiConfidence: [
    {
      level: String,
      percentage: Number,
    },
  ],
  markingTrends: [
    {
      date: Date,
      accuracy: Number,
      papers: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
AnalyticsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Analytics = mongoose.model("Analytics", AnalyticsSchema);

export default Analytics;
