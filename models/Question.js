import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  number: {
    type: Number,
    required: [true, "Question number is required"],
  },
  text: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  maxScore: {
    type: Number,
    required: [true, "Maximum score is required"],
    min: [0, "Maximum score cannot be negative"],
  },
  markingCriteria: [
    {
      description: {
        type: String,
        required: true,
      },
      points: {
        type: Number,
        required: true,
      },
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
QuestionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Question = mongoose.model("Question", QuestionSchema);

export default Question;
