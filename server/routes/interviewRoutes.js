const express = require("express");
const {
  getInterviewHistory,
  startInterview,
  submitInterview,
} = require("../controllers/interviewController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/start", protect, startInterview);
router.post("/submit", protect, submitInterview);
router.get("/history", protect, getInterviewHistory);

module.exports = router;
