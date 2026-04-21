const express = require("express");
const { generateRoadmapPlan } = require("../controllers/roadmapController");

const router = express.Router();

router.post("/generate", generateRoadmapPlan);

module.exports = router;
