const crypto = require("crypto");
const { codingQuestions } = require("../data/codingQuestions");
const { templates } = require("../data/questionTemplates");

const MCQ_SCORE = 1;
const TEXT_SCORE_MAX = 10;
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

const SECTION_ORDER = [
  {
    key: "fundamental",
    label: "Fundamentals Round",
    type: "mcq",
    count: 2,
    timeLimitSeconds: 10 * 60,
  },
  {
    key: "coding",
    label: "Coding Round",
    type: "mcq",
    count: 6,
    timeLimitSeconds: 10 * 60,
  },
  {
    key: "project",
    label: "Project Round",
    type: "text",
    count: 2,
    timeLimitSeconds: null,
  },
  {
    key: "scenario",
    label: "Scenario Round",
    type: "text",
    count: 2,
    timeLimitSeconds: null,
  },
  {
    key: "behavioral",
    label: "Behavioral Round",
    type: "text",
    count: 1,
    timeLimitSeconds: null,
  },
];

const FUNDAMENTAL_BANK = {
  "In a system like {project}, why does normalization matter for data quality and long-term maintainability?": {
    options: [
      "To reduce duplicate data and avoid update anomalies",
      "To make every query run in constant time",
      "To remove the need for indexes",
      "To store all data in one table",
    ],
    correctAnswer: "To reduce duplicate data and avoid update anomalies",
  },
  "In a product like {project}, why would you choose multiple threads inside one process instead of spinning up separate processes for every task?": {
    options: [
      "Processes have separate memory spaces, while threads share a process memory space",
      "Threads always run on different machines, while processes stay local",
      "Processes are lighter than threads in every operating system",
      "Threads cannot run concurrently",
    ],
    correctAnswer:
      "Processes have separate memory spaces, while threads share a process memory space",
  },
  "When a user opens {project} in the browser, what happens from URL entry to page render, and why does each step matter for performance and reliability?": {
    options: [
      "DNS lookup happens, a connection is established, the request is sent, and the response is rendered",
      "The browser sends SQL directly to the server and prints the result",
      "The operating system compiles the page before loading it",
      "The request skips networking if the site uses HTTPS",
    ],
    correctAnswer:
      "DNS lookup happens, a connection is established, the request is sent, and the response is rendered",
  },
  "In a system like {project}, how do ACID properties protect data consistency, and why do they matter during failures or concurrent updates?": {
    options: [
      "They help transactions stay reliable through atomicity, consistency, isolation, and durability",
      "They are CSS rules used to style database dashboards",
      "They describe how APIs must be versioned",
      "They replace the need for backups",
    ],
    correctAnswer:
      "They help transactions stay reliable through atomicity, consistency, isolation, and durability",
  },
};

const normalizeText = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizeResumeData = (resumeData) => ({
  skills: Array.isArray(resumeData?.skills) ? resumeData.skills.filter(Boolean) : [],
  projects: Array.isArray(resumeData?.projects)
    ? resumeData.projects.filter(Boolean)
    : [],
  summary: typeof resumeData?.summary === "string" ? resumeData.summary : "",
});

const getResumeCorpus = (resumeData, role) =>
  [
    ...(resumeData.skills || []),
    ...(resumeData.projects || []),
    resumeData.summary || "",
    role || "",
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");

const scoreTemplate = (template, corpus) => {
  const skill = normalizeText(template?.skill);

  if (!skill) {
    return 0;
  }

  if (corpus.includes(skill)) {
    return 3;
  }

  if (skill === "js" && corpus.includes("javascript")) {
    return 3;
  }

  if (skill === "node" && corpus.includes("node.js")) {
    return 3;
  }

  if (skill === "api" && corpus.includes("rest")) {
    return 2;
  }

  return 0;
};

const sortTemplatesByRelevance = (templateList, corpus) =>
  [...templateList].sort((left, right) => {
    const scoreDifference = scoreTemplate(right, corpus) - scoreTemplate(left, corpus);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return left.question.localeCompare(right.question);
  });

const getProjectName = (resumeData, index) => {
  const projects = resumeData.projects || [];

  if (!projects.length) {
    return "your recent project";
  }

  return projects[index] || projects[0];
};

const getSkillsLabel = (resumeData) => {
  const skills = resumeData.skills || [];

  if (!skills.length) {
    return "your core skills";
  }

  return skills.slice(0, 3).join(", ");
};

const applyPlaceholders = (question, resumeData, index = 0) =>
  question
    .replaceAll("{project}", getProjectName(resumeData, index))
    .replaceAll("{skills}", getSkillsLabel(resumeData));

const createSessionId = () => crypto.randomBytes(12).toString("hex");
const TOTAL_QUESTIONS = SECTION_ORDER.reduce(
  (sum, section) => sum + section.count,
  0
);
const TOTAL_SCORE = SECTION_ORDER.reduce((sum, section) => {
  const questionScore = section.type === "mcq" ? MCQ_SCORE : TEXT_SCORE_MAX;
  return sum + section.count * questionScore;
}, 0);

const buildMcqQuestion = (question, bankEntry) => ({
  question,
  type: "mcq",
  category: "coding",
  options: bankEntry.options,
  correctAnswer: bankEntry.correctAnswer,
});

const buildFundamentalQuestion = (question, bankEntry) => ({
  question,
  type: "mcq",
  category: "fundamental",
  options: bankEntry.options,
  correctAnswer: bankEntry.correctAnswer,
});

const buildTextQuestion = (question, category) => ({
  question,
  type: "text",
  category,
});

const shuffle = (items) => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[randomIndex]] = [
      nextItems[randomIndex],
      nextItems[index],
    ];
  }

  return nextItems;
};

const pickRandomWithoutRepetition = (items, count, label) => {
  if (!Array.isArray(items) || items.length < count) {
    throw new Error(`Not enough ${label} coding questions configured`);
  }

  return shuffle(items).slice(0, count);
};

const buildCodingQuestion = (question) => ({
  question: question.question,
  options: question.options,
  correctAnswer: question.correctAnswer || question.answer,
  type: "mcq",
  category: "coding",
});

const getCodingQuestions = (difficulty) => {
  if (!DIFFICULTY_OPTIONS.includes(difficulty)) {
    throw new Error("difficulty must be Easy, Medium, or Hard");
  }

  const difficultyKey = difficulty.toLowerCase();
  const difficultyPool = codingQuestions[difficultyKey];

  if (!Array.isArray(difficultyPool)) {
    throw new Error(`Coding dataset is missing the ${difficulty} pool`);
  }

  return pickRandomWithoutRepetition(
    difficultyPool,
    6,
    `${difficulty} coding`
  ).map(buildCodingQuestion);
};

const buildInterviewQuestions = ({ difficulty = "Medium", role, resumeData }) => {
  const normalizedResume = normalizeResumeData(resumeData);
  const resumeCorpus = getResumeCorpus(normalizedResume, role);

  const fundamentals = sortTemplatesByRelevance(templates.fundamentals, resumeCorpus)
    .slice(0, 2)
    .map((template, index) => {
      const question = applyPlaceholders(
        template.question,
        normalizedResume,
        index
      );
      const bankEntry = FUNDAMENTAL_BANK[template.question];

      if (!bankEntry) {
        throw new Error(`Missing fundamental MCQ metadata for: ${template.question}`);
      }

      return buildFundamentalQuestion(question, bankEntry);
    });

  const coding = getCodingQuestions(difficulty);

  const project = templates.project.slice(0, 2).map((template, index) =>
    buildTextQuestion(
      applyPlaceholders(template.question, normalizedResume, index),
      "project"
    )
  );

  const scenario = templates.scenario.slice(0, 2).map((template, index) =>
    buildTextQuestion(
      applyPlaceholders(template.question, normalizedResume, index),
      "scenario"
    )
  );

  const behavioral = templates.behavioral.slice(0, 1).map((template, index) =>
    buildTextQuestion(
      applyPlaceholders(template.question, normalizedResume, index),
      "behavioral"
    )
  );

  const questions = [
    ...fundamentals,
    ...coding,
    ...project,
    ...scenario,
    ...behavioral,
  ];

  if (questions.length !== TOTAL_QUESTIONS) {
    throw new Error(
      `Interview engine must return exactly ${TOTAL_QUESTIONS} questions`
    );
  }

  return {
    sessionId: createSessionId(),
    questions,
    sections: SECTION_ORDER,
  };
};

const normalizeAnswers = (answers) => {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new Error("answers must be an object");
  }

  return answers;
};

const getAnswerForIndex = (answers, index) => {
  const directValue =
    typeof answers[index] === "string"
      ? answers[index]
      : typeof answers[String(index)] === "string"
      ? answers[String(index)]
      : "";

  return directValue.trim();
};

const createSectionScores = () =>
  SECTION_ORDER.reduce((accumulator, section) => {
    const maxScore =
      section.type === "mcq"
        ? section.count * MCQ_SCORE
        : section.count * TEXT_SCORE_MAX;

    accumulator[section.key] = {
      score: 0,
      maxScore,
      answered: 0,
      total: section.count,
    };

    return accumulator;
  }, {});

const addSectionScore = (sectionScores, category, score) => {
  if (!sectionScores[category]) {
    return;
  }

  sectionScores[category].score += score;
  sectionScores[category].answered += 1;
};

const getWeakAreas = (sectionScores) =>
  Object.entries(sectionScores)
    .filter(([, stats]) => stats.maxScore > 0)
    .filter(([, stats]) => stats.score / stats.maxScore < 0.7)
    .sort((left, right) => {
      const leftRatio = left[1].score / left[1].maxScore;
      const rightRatio = right[1].score / right[1].maxScore;

      if (leftRatio !== rightRatio) {
        return leftRatio - rightRatio;
      }

      return (
        SECTION_ORDER.findIndex((section) => section.key === left[0]) -
        SECTION_ORDER.findIndex((section) => section.key === right[0])
      );
    })
    .map(([category]) => category);

const evaluateInterviewAnswers = async ({
  answers,
  questions,
  evaluateTextAnswer,
}) => {
  const normalizedAnswers = normalizeAnswers(answers);

  if (!Array.isArray(questions) || questions.length !== TOTAL_QUESTIONS) {
    throw new Error(`questions must contain exactly ${TOTAL_QUESTIONS} items`);
  }

  if (typeof evaluateTextAnswer !== "function") {
    throw new Error("evaluateTextAnswer must be provided");
  }

  const sectionScores = createSectionScores();
  const questionResults = new Array(questions.length);
  const textEvaluations = [];

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const answer = getAnswerForIndex(normalizedAnswers, index);

    if (question.type === "mcq") {
      const isCorrect = Boolean(answer) && answer === question.correctAnswer;
      const score = isCorrect ? MCQ_SCORE : 0;

      addSectionScore(sectionScores, question.category, score);
      questionResults[index] = {
        question: question.question,
        category: question.category,
        type: question.type,
        answer,
        score,
        maxScore: MCQ_SCORE,
        isCorrect,
      };
      continue;
    }

    textEvaluations.push(
      evaluateTextAnswer({
        question: question.question,
        answer,
      }).then((evaluation) => {
        const boundedScore = Math.max(
          0,
          Math.min(TEXT_SCORE_MAX, Number(evaluation?.score) || 0)
        );

        return {
          index,
          result: {
            question: question.question,
            category: question.category,
            type: question.type,
            answer,
            score: boundedScore,
            maxScore: TEXT_SCORE_MAX,
            strengths: Array.isArray(evaluation?.strengths)
              ? evaluation.strengths
              : [],
            weaknesses: Array.isArray(evaluation?.weaknesses)
              ? evaluation.weaknesses
              : [],
            suggestion:
              typeof evaluation?.suggestion === "string"
                ? evaluation.suggestion
                : "",
          },
        };
      })
    );
  }

  const resolvedTextEvaluations = await Promise.all(textEvaluations);

  resolvedTextEvaluations.forEach(({ index, result }) => {
    addSectionScore(sectionScores, result.category, result.score);
    questionResults[index] = result;
  });

  const score = Object.values(sectionScores).reduce(
    (sum, section) => sum + section.score,
    0
  );

  return {
    score,
    total: TOTAL_SCORE,
    weakAreas: getWeakAreas(sectionScores),
    sectionScores,
    questionResults,
  };
};

module.exports = {
  DIFFICULTY_OPTIONS,
  SECTION_ORDER,
  TOTAL_QUESTIONS,
  TOTAL_SCORE,
  buildInterviewQuestions,
  evaluateInterviewAnswers,
  getCodingQuestions,
};
