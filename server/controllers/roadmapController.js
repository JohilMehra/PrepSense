const { generateRoadmap } = require("../services/roadmapAiService");

const generateRoadmapPlan = async (req, res) => {
  try {
    const { weakAreas, role, resumeData } = req.body;

    if (!Array.isArray(weakAreas) || weakAreas.length === 0) {
      return res.status(400).json({
        message: "weakAreas must be a non-empty array",
      });
    }

    if (!role || typeof role !== "string") {
      return res.status(400).json({
        message: "role is required",
      });
    }

    const normalizedWeakAreas = weakAreas
      .map((area) => (typeof area === "string" ? area.trim() : ""))
      .filter(Boolean);

    if (!normalizedWeakAreas.length) {
      return res.status(400).json({
        message: "weakAreas must contain valid strings",
      });
    }

    if (
      resumeData !== undefined &&
      (typeof resumeData !== "object" || Array.isArray(resumeData))
    ) {
      return res.status(400).json({
        message: "resumeData must be an object when provided",
      });
    }

    const roadmap = await generateRoadmap({
      weakAreas: normalizedWeakAreas,
      role: role.trim(),
      resumeData,
    });

    return res.status(200).json(roadmap);
  } catch (error) {
    console.error("Roadmap generation error:", error);

    if (
      error.message.includes("must") ||
      error.message.includes("valid") ||
      error.message.includes("include")
    ) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Failed to generate roadmap",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  generateRoadmapPlan,
};
