const INTERVIEW_TYPES = [
  "fundamental",
  "applied",
  "project",
  "scenario",
  "behavioral",
];

const QUESTION_COUNT_OPTIONS = [5, 10, 15];
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

const interviewQuestionsJsonSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      minItems: 5,
      maxItems: 15,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: { type: "string" },
          },
          correctAnswer: { type: "string" },
          type: {
            type: "string",
            enum: INTERVIEW_TYPES,
          },
        },
        required: ["question", "options", "correctAnswer", "type"],
        additionalProperties: false,
      },
    },
  },
  required: ["questions"],
  additionalProperties: false,
};

const cleanJsonResponse = (content) => {
  const trimmedContent = content.trim();

  if (trimmedContent.startsWith("```")) {
    return trimmedContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  return trimmedContent;
};

const getRoundTargets = (questionCount) => {
  if (!QUESTION_COUNT_OPTIONS.includes(questionCount)) {
    throw new Error("Interview generation must use 5, 10, or 15 questions");
  }

  const perRound = questionCount / INTERVIEW_TYPES.length;

  return INTERVIEW_TYPES.reduce((accumulator, type) => {
    accumulator[type] = perRound;
    return accumulator;
  }, {});
};

const normalizeQuestion = (question, fallbackType) => {
  const options = Array.isArray(question?.options)
    ? question.options
        .map((option) => (typeof option === "string" ? option.trim() : ""))
        .filter(Boolean)
        .slice(0, 4)
    : [];

  return {
    question:
      typeof question?.question === "string" ? question.question.trim() : "",
    options,
    correctAnswer:
      typeof question?.correctAnswer === "string"
        ? question.correctAnswer.trim()
        : "",
    type: INTERVIEW_TYPES.includes(question?.type) ? question.type : fallbackType,
  };
};

const validateInterviewQuestions = (questions, questionCount) => {
  const roundTargets = getRoundTargets(questionCount);

  if (!Array.isArray(questions) || questions.length !== questionCount) {
    throw new Error(
      `Interview generation must return exactly ${questionCount} questions`
    );
  }

  const countsByType = INTERVIEW_TYPES.reduce((accumulator, type) => {
    accumulator[type] = 0;
    return accumulator;
  }, {});

  questions.forEach((question, index) => {
    if (!question.question) {
      throw new Error(`Question ${index + 1} is missing the question text`);
    }

    if (!INTERVIEW_TYPES.includes(question.type)) {
      throw new Error(`Question ${index + 1} has an invalid type`);
    }

    if (!Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 options`);
    }

    if (!question.correctAnswer || !question.options.includes(question.correctAnswer)) {
      throw new Error(
        `Question ${index + 1} must have a correctAnswer that matches one of its options`
      );
    }

    countsByType[question.type] += 1;
  });

  INTERVIEW_TYPES.forEach((type) => {
    if (countsByType[type] !== roundTargets[type]) {
      throw new Error(
        `Interview generation must include exactly ${roundTargets[type]} ${type} questions`
      );
    }
  });

  return questions;
};

const buildInterviewPrompt = ({
  userId,
  role,
  difficulty,
  questionCount,
  resumeData,
}) => {
  const roundTargets = getRoundTargets(questionCount);

  return `
Act as a real technical interviewer.

Generate a structured interview for this candidate.

Round 1: Fundamentals (${roundTargets.fundamental} questions)
Round 2: Applied concepts (${roundTargets.applied} questions)
Round 3: Project-based (${roundTargets.project} questions)
Round 4: Scenario/problem-solving (${roundTargets.scenario} questions)
Round 5: Behavioral (${roundTargets.behavioral} questions)

Rules:
- Return exactly ${questionCount} questions total.
- Every question must have exactly 4 options.
- correctAnswer must exactly match one string from options.
- Use these exact types only: fundamental, applied, project, scenario, behavioral.
- No textbook definitions.
- No generic MCQs.
- Questions must feel conversational and realistic.
- Use resume data when possible, especially for project-based questions.
- Keep questions concise.
- Avoid markdown, explanations, numbering, or extra keys.
- Keep the sequence grouped by round order.

Difficulty: ${difficulty}
Target role: ${role}

Return valid JSON only with this exact shape:
{
  "questions": [
    {
      "question": "string",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correctAnswer": "one of the options above",
      "type": "fundamental"
    }
  ]
}

Candidate context:
${JSON.stringify(
    {
      userId,
      role,
      difficulty,
      questionCount,
      skills: Array.isArray(resumeData?.skills) ? resumeData.skills : [],
      projects: Array.isArray(resumeData?.projects) ? resumeData.projects : [],
      summary: typeof resumeData?.summary === "string" ? resumeData.summary : "",
    },
    null,
    2
  )}
`;
};

const parseInterviewJson = (content, questionCount) => {
  const parsed = JSON.parse(cleanJsonResponse(content));
  const rawQuestions = Array.isArray(parsed?.questions) ? parsed.questions : [];
  const roundTargets = getRoundTargets(questionCount);
  const fallbackOrder = INTERVIEW_TYPES.flatMap((type) =>
    Array.from({ length: roundTargets[type] }, () => type)
  );
  const normalizedQuestions = rawQuestions.map((question, index) =>
    normalizeQuestion(question, fallbackOrder[index] || "fundamental")
  );

  return validateInterviewQuestions(normalizedQuestions, questionCount);
};

const buildFallbackQuestions = ({ role, difficulty, questionCount, resumeData }) => {
  const projectName =
    Array.isArray(resumeData?.projects) && resumeData.projects.length
      ? resumeData.projects[0]
      : "your recent project";
  const topSkill =
    Array.isArray(resumeData?.skills) && resumeData.skills.length
      ? resumeData.skills[0]
      : role;

  const pools = {
    fundamental: [
      {
        question: `When you work as a ${role}, what is the main reason to normalize a relational schema?`,
        options: [
          "To reduce redundant data and update anomalies",
          "To speed up every query automatically",
          "To replace indexing",
          "To avoid writing joins",
        ],
        correctAnswer: "To reduce redundant data and update anomalies",
        type: "fundamental",
      },
      {
        question: `In day-to-day ${topSkill} work, why would you use an index?`,
        options: [
          "To improve lookups on frequently filtered fields",
          "To encrypt data at rest",
          "To reduce API payload size",
          "To avoid validation",
        ],
        correctAnswer: "To improve lookups on frequently filtered fields",
        type: "fundamental",
      },
      {
        question: "What is the practical benefit of keeping functions small and focused?",
        options: [
          "They are easier to test and debug",
          "They remove the need for reviews",
          "They guarantee zero bugs",
          "They always run faster",
        ],
        correctAnswer: "They are easier to test and debug",
        type: "fundamental",
      },
    ],
    applied: [
      {
        question: `You are adding a new feature in a ${difficulty.toLowerCase()} round interview. What should you clarify first?`,
        options: [
          "Requirements, edge cases, and success criteria",
          "The final deployment date only",
          "The interviewer’s favorite library",
          "How to skip testing",
        ],
        correctAnswer: "Requirements, edge cases, and success criteria",
        type: "applied",
      },
      {
        question: "A page becomes slow after a release. What is the best first step?",
        options: [
          "Measure the bottleneck before changing code",
          "Rewrite the whole module",
          "Remove logging permanently",
          "Scale the database without checking metrics",
        ],
        correctAnswer: "Measure the bottleneck before changing code",
        type: "applied",
      },
      {
        question: "You find a recurring bug in production. What is the best durable fix?",
        options: [
          "Reproduce it, patch root cause, and add a regression test",
          "Restart the server daily",
          "Ignore it if it is intermittent",
          "Only update the UI copy",
        ],
        correctAnswer: "Reproduce it, patch root cause, and add a regression test",
        type: "applied",
      },
    ],
    project: [
      {
        question: `On ${projectName}, what is the strongest way to explain your contribution?`,
        options: [
          "Describe the problem, your decisions, and the outcome",
          "List random tools without context",
          "Only say the project was successful",
          "Avoid mentioning tradeoffs",
        ],
        correctAnswer: "Describe the problem, your decisions, and the outcome",
        type: "project",
      },
      {
        question: `If an interviewer asks why you chose a certain approach on ${projectName}, what makes the best answer?`,
        options: [
          "Tradeoffs, constraints, and why it fit the project",
          "Because it looked easier",
          "Because everyone else does it",
          "Because the deadline did not matter",
        ],
        correctAnswer: "Tradeoffs, constraints, and why it fit the project",
        type: "project",
      },
      {
        question: `What interview answer sounds strongest when discussing ${projectName}?`,
        options: [
          "A concrete example of a bug you solved and what you learned",
          "A vague claim that everything worked",
          "A list of buzzwords only",
          "A promise that there were no challenges",
        ],
        correctAnswer: "A concrete example of a bug you solved and what you learned",
        type: "project",
      },
    ],
    scenario: [
      {
        question: "A critical bug appears one hour before launch. What should you do first?",
        options: [
          "Assess impact, align stakeholders, and decide rollback or fix",
          "Push another unrelated feature",
          "Hide the error from monitoring",
          "Wait and hope it resolves",
        ],
        correctAnswer: "Assess impact, align stakeholders, and decide rollback or fix",
        type: "scenario",
      },
      {
        question: "A teammate disagrees with your implementation plan. What is the best response?",
        options: [
          "Compare tradeoffs together and use evidence",
          "Insist because you started first",
          "Escalate immediately without discussion",
          "Stop collaborating",
        ],
        correctAnswer: "Compare tradeoffs together and use evidence",
        type: "scenario",
      },
      {
        question: "Your service is timing out after traffic spikes. What would you prioritize?",
        options: [
          "Inspect metrics, isolate the bottleneck, and mitigate safely",
          "Delete old code blindly",
          "Disable alerts permanently",
          "Change the color theme first",
        ],
        correctAnswer: "Inspect metrics, isolate the bottleneck, and mitigate safely",
        type: "scenario",
      },
    ],
    behavioral: [
      {
        question: "If you do not know an answer in an interview, what is the strongest move?",
        options: [
          "Say what you know and reason through the gap clearly",
          "Invent a confident answer",
          "Change the subject",
          "Stop talking",
        ],
        correctAnswer: "Say what you know and reason through the gap clearly",
        type: "behavioral",
      },
      {
        question: "How should you describe a difficult team situation?",
        options: [
          "Explain the context, your action, and the result",
          "Blame others without specifics",
          "Say conflict never happens",
          "Skip the result",
        ],
        correctAnswer: "Explain the context, your action, and the result",
        type: "behavioral",
      },
      {
        question: "What answer best shows ownership?",
        options: [
          "I communicated risks early and followed through on the fix",
          "I waited for someone else to notice the issue",
          "I avoided documenting anything",
          "I ignored feedback until the deadline",
        ],
        correctAnswer: "I communicated risks early and followed through on the fix",
        type: "behavioral",
      },
    ],
  };

  const roundTargets = getRoundTargets(questionCount);

  return INTERVIEW_TYPES.flatMap((type) =>
    pools[type].slice(0, roundTargets[type]).map((question) => ({
      ...question,
      type,
    }))
  );
};

const generateWithOpenAI = async (payload) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: buildInterviewPrompt(payload),
      text: {
        format: {
          type: "json_schema",
          name: "interview_mcq_generation",
          schema: interviewQuestionsJsonSchema,
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();

  if (!data.output_text) {
    throw new Error("OpenAI response did not include structured output");
  }

  return parseInterviewJson(data.output_text, payload.questionCount);
};

const generateWithGemini = async (payload) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const maxRetries = 3;
  const retryDelayMs = 2000;

  const wait = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: buildInterviewPrompt(payload) }],
              },
            ],
            generationConfig: {
              temperature: 0.4,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        const isServiceUnavailable = response.status === 503;

        if (isServiceUnavailable && attempt < maxRetries) {
          await wait(retryDelayMs);
          continue;
        }

        throw new Error(`Gemini request failed: ${response.status} ${errorBody}`);
      }

      const data = await response.json();
      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!outputText) {
        throw new Error("Gemini response did not include structured output");
      }

      return parseInterviewJson(outputText, payload.questionCount);
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      if (!isLastAttempt) {
        await wait(retryDelayMs);
        continue;
      }

      console.error(
        "Gemini interview generation failed after retries. Using fallback questions.",
        error
      );

      return validateInterviewQuestions(
        buildFallbackQuestions(payload),
        payload.questionCount
      );
    }
  }

  return validateInterviewQuestions(
    buildFallbackQuestions(payload),
    payload.questionCount
  );
};

const generateInterviewQuestions = async ({
  userId,
  role,
  difficulty,
  questionCount,
  resumeData,
}) => {
  if (!DIFFICULTY_OPTIONS.includes(difficulty)) {
    throw new Error("difficulty must be Easy, Medium, or Hard");
  }

  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const payload = {
    userId,
    role,
    difficulty,
    questionCount,
    resumeData,
  };

  if (provider === "gemini") {
    return generateWithGemini(payload);
  }

  if (provider === "openai") {
    return generateWithOpenAI(payload);
  }

  throw new Error("Unsupported AI_PROVIDER. Use 'openai' or 'gemini'.");
};

const evaluateInterviewAnswers = ({ answers, questions }) => {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new Error("answers must be an object");
  }

  const normalizedQuestions = questions.map((question, index) =>
    normalizeQuestion(question, INTERVIEW_TYPES[index % INTERVIEW_TYPES.length])
  );

  validateInterviewQuestions(normalizedQuestions, normalizedQuestions.length);

  const sections = INTERVIEW_TYPES.reduce((accumulator, type) => {
    accumulator[type] = { correct: 0, total: 0 };
    return accumulator;
  }, {});

  const wrongCountsByType = INTERVIEW_TYPES.reduce((accumulator, type) => {
    accumulator[type] = 0;
    return accumulator;
  }, {});

  let score = 0;

  normalizedQuestions.forEach((question, index) => {
    const userAnswer =
      typeof answers[index] === "string"
        ? answers[index].trim()
        : typeof answers[String(index)] === "string"
        ? answers[String(index)].trim()
        : "";

    sections[question.type].total += 1;

    if (userAnswer && userAnswer === question.correctAnswer) {
      score += 1;
      sections[question.type].correct += 1;
      return;
    }

    wrongCountsByType[question.type] += 1;
  });

  const weakAreas = Object.entries(wrongCountsByType)
    .filter(([, wrongCount]) => wrongCount > 0)
    .sort((left, right) => right[1] - left[1])
    .map(([type]) => type);

  return {
    score,
    total: normalizedQuestions.length,
    sections,
    weakAreas,
  };
};

module.exports = {
  evaluateInterviewAnswers,
  generateInterviewQuestions,
};
