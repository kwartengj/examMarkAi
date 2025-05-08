import mongoose from "mongoose";

const StudentAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  studentId: {
    type: String,
    required: [true, "Student ID is required"],
    trim: true,
  },
  text: {
    type: String,
    required: [true, "Answer text is required"],
    trim: true,
  },
  aiSuggestedScore: {
    type: Number,
    default: 0,
  },
  aiConfidenceLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  aiReasoning: {
    type: String,
    trim: true,
  },
  criteriaMatched: {
    type: [String],
    default: [],
  },
  examinerScore: {
    type: Number,
  },
  feedback: {
    type: String,
    trim: true,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  markedAt: {
    type: Date,
  },
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
StudentAnswerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const StudentAnswer = mongoose.model("StudentAnswer", StudentAnswerSchema);

export default StudentAnswer;
