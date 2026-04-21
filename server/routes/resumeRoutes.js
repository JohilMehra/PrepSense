const express = require("express");
const {
  uploadResumeMiddleware,
  uploadResume,
  handleResumeUploadError,
} = require("../controllers/resumeController");

const router = express.Router();

router.post(
  "/upload",
  uploadResumeMiddleware,
  handleResumeUploadError,
  uploadResume
);

module.exports = router;
