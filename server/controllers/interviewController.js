const {
  DIFFICULTY_OPTIONS,
  TOTAL_SCORE,
  buildInterviewQuestions,
  evaluateInterviewAnswers,
} = require("../services/interviewEngineService");
const { evaluateTextAnswer } = require("../services/textEvaluationService");
const InterviewHistory = require("../models/InterviewHistory");

const HISTORY_LIMIT = 5;

const pruneInterviewHistory = async (userId) => {
  const staleRecords = await InterviewHistory.find({ userId })
    .sort({ createdAt: -1, _id: -1 })
    .skip(HISTORY_LIMIT)
    .select("_id")
    .lean();

  if (!staleRecords.length) {
    return;
  }

  await InterviewHistory.deleteMany({
    _id: { $in: staleRecords.map((record) => record._id) },
  });
};

const startInterview = async (req, res) => {
  try {
    const { difficulty = "Medium", role, resumeData } = req.body;

    if (!role || typeof role !== "string") {
      return res.status(400).json({ message: "role is required" });
    }

    if (!DIFFICULTY_OPTIONS.includes(difficulty)) {
      return res.status(400).json({ message: "difficulty is invalid" });
    }

    if (
      resumeData !== undefined &&
      (typeof resumeData !== "object" || Array.isArray(resumeData))
    ) {
      return res.status(400).json({
        message: "resumeData must be an object when provided",
      });
    }

    const session = buildInterviewQuestions({
      difficulty,
      role: role.trim(),
      resumeData,
    });

    return res.status(200).json({
      message: "Interview questions loaded successfully",
      sessionId: session.sessionId,
      count: session.questions.length,
      sections: session.sections,
      questions: session.questions,
    });
  } catch (error) {
    console.error("Interview generation error:", error);

    return res.status(500).json({
      message: "Failed to generate interview questions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const submitInterview = async (req, res) => {
  try {
    const { answers, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "questions must be a non-empty array" });
    }

    const previousAttempt = await InterviewHistory.findOne({ userId: req.user._id })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    const evaluation = await evaluateInterviewAnswers({
      answers,
      questions,
      evaluateTextAnswer,
    });
    const previousWeakAreas = Array.isArray(previousAttempt?.weakAreas)
      ? previousAttempt.weakAreas
      : [];
    const improvedAreas = previousWeakAreas.filter(
      (area) => !evaluation.weakAreas.includes(area)
    );

    const savedAttempt = await InterviewHistory.create({
      userId: req.user._id,
      score: evaluation.score,
      weakAreas: Array.isArray(evaluation.weakAreas) ? evaluation.weakAreas : [],
    });

    await pruneInterviewHistory(req.user._id);

    return res.status(200).json({
      ...evaluation,
      improvedAreas,
      date: savedAttempt.createdAt,
    });
  } catch (error) {
    if (
      error.message.includes("must") ||
      error.message.includes("invalid") ||
      error.message.includes("exactly") ||
      error.message.includes("at least")
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Interview evaluation error:", error);

    return res.status(500).json({
      message: "Failed to evaluate interview answers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const history = await InterviewHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1, _id: -1 })
      .limit(HISTORY_LIMIT)
      .select("score weakAreas createdAt -_id")
      .lean();

    return res.status(200).json(
      history.map((record) => ({
        score: record.score,
        total: TOTAL_SCORE,
        weakAreas: Array.isArray(record.weakAreas) ? record.weakAreas : [],
        date: record.createdAt,
      }))
    );
  } catch (error) {
    console.error("Interview history fetch error:", error);

    return res.status(500).json({
      message: "Failed to fetch interview history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getInterviewHistory,
  startInterview,
  submitInterview,
};
