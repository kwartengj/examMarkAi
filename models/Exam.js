import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Exam title is required"],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, "Exam date is required"],
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paperCount: {
    type: Number,
    default: 0,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  markingCriteria: [
    {
      description: {
        type: String,
        required: true,
        trim: true,
      },
      maxScore: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  fileUrl: {
    type: String,
    trim: true,
  },
  fileName: {
    type: String,
    trim: true,
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
ExamSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Exam = mongoose.model("Exam", ExamSchema);

export default Exam;
