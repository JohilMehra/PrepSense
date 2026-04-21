const evaluationCache = new Map();
const AI_TIMEOUT_MS = 5000;
const FALLBACK_EVALUATION = Object.freeze({
  score: 5,
  strengths: ["Basic understanding"],
  weaknesses: ["Needs improvement"],
  suggestion: "Revise this topic",
});

const evaluationJsonSchema = {
  type: "object",
  properties: {
    score: { type: "number" },
    strengths: {
      type: "array",
      items: { type: "string" },
    },
    weaknesses: {
      type: "array",
      items: { type: "string" },
    },
    suggestion: { type: "string" },
  },
  required: ["score", "strengths", "weaknesses", "suggestion"],
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

const normalizeEvaluation = (result) => ({
  score: Math.max(0, Math.min(10, Number(result?.score) || 0)),
  strengths: Array.isArray(result?.strengths)
    ? result.strengths
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [],
  weaknesses: Array.isArray(result?.weaknesses)
    ? result.weaknesses
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [],
  suggestion:
    typeof result?.suggestion === "string" ? result.suggestion.trim() : "",
});

const getFallbackEvaluation = () => ({
  score: FALLBACK_EVALUATION.score,
  strengths: [...FALLBACK_EVALUATION.strengths],
  weaknesses: [...FALLBACK_EVALUATION.weaknesses],
  suggestion: FALLBACK_EVALUATION.suggestion,
});

const buildPrompt = ({ question, answer }) => `
You are an interviewer.

Evaluate this answer.

Question: ${question}
Answer: ${answer || "No answer provided."}

Return JSON:
{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "suggestion": ""
}
`;

const parseEvaluation = (content) =>
  normalizeEvaluation(JSON.parse(cleanJsonResponse(content)));

const fetchWithTimeout = async (url, options = {}, timeoutMs = AI_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`AI evaluation timed out after ${timeoutMs}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const evaluateWithOpenAI = async (payload) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetchWithTimeout("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: buildPrompt(payload),
      text: {
        format: {
          type: "json_schema",
          name: "interview_text_evaluation",
          schema: evaluationJsonSchema,
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

  return parseEvaluation(data.output_text);
};

const evaluateWithGemini = async (payload) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildPrompt(payload) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    },
    AI_TIMEOUT_MS
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!outputText) {
    throw new Error("Gemini response did not include structured output");
  }

  return parseEvaluation(outputText);
};

const getCacheKey = ({ question, answer }) =>
  `${question}::${typeof answer === "string" ? answer.trim() : ""}`;

const evaluateTextAnswer = async ({ question, answer }) => {
  const cacheKey = getCacheKey({ question, answer });

  if (evaluationCache.has(cacheKey)) {
    return evaluationCache.get(cacheKey);
  }

  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  let result;

  try {
    if (provider === "gemini") {
      result = await evaluateWithGemini({ question, answer });
    } else if (provider === "openai") {
      result = await evaluateWithOpenAI({ question, answer });
    } else {
      throw new Error("Unsupported AI_PROVIDER. Use 'openai' or 'gemini'.");
    }
  } catch (error) {
    console.error("Text evaluation fallback:", error.message);
    result = normalizeEvaluation(getFallbackEvaluation());
  }

  evaluationCache.set(cacheKey, result);
  return result;
};

module.exports = {
  evaluateTextAnswer,
};
