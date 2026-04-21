const mongoose = require("mongoose");

const interviewHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    weakAreas: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

interviewHistorySchema.index({ userId: 1, createdAt: -1 });

const InterviewHistory = mongoose.model(
  "InterviewHistory",
  interviewHistorySchema
);

module.exports = InterviewHistory;
