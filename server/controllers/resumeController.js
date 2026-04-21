const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const { extractStructuredResumeData } = require("../services/resumeAiService");

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    const isPdfMimeType = file.mimetype === "application/pdf";
    const isPdfExtension = file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdfMimeType || !isPdfExtension) {
      return cb(new Error("Only PDF files are allowed"));
    }

    return cb(null, true);
  },
});

const uploadResumeMiddleware = upload.single("resume");

const uploadResume = async (req, res) => {
  let parser;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume PDF file is required" });
    }

    parser = new PDFParse({ data: req.file.buffer });
    const parsedPdf = await parser.getText();
    const extractedText = parsedPdf.text?.trim();

    if (!extractedText) {
      return res.status(400).json({
        message: "Could not extract text from the uploaded PDF",
      });
    }

    const structuredData = await extractStructuredResumeData(extractedText);

    return res.status(200).json({
      message: "Resume parsed successfully",
      data: structuredData,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    return res.status(500).json({
      message: "Failed to upload and parse resume",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

const handleResumeUploadError = (error, _req, res, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Resume file is too large. Max size is 5MB",
      });
    }

    return res.status(400).json({
      message: error.message || "File upload failed",
    });
  }

  if (error.message === "Only PDF files are allowed") {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
};

module.exports = {
  uploadResumeMiddleware,
  uploadResume,
  handleResumeUploadError,
};
