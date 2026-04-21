const resumeJsonSchema = {
  type: "object",
  properties: {
    skills: {
      type: "array",
      items: { type: "string" },
    },
    projects: {
      type: "array",
      items: { type: "string" },
    },
    education: {
      type: "array",
      items: { type: "string" },
    },
    summary: {
      type: "string",
    },
  },
  required: ["skills", "projects", "education", "summary"],
};

const buildResumePrompt = (resumeText) => `
Extract structured resume data from the text below.

Return valid JSON only with this exact shape:
{
  "skills": [],
  "projects": [],
  "education": [],
  "summary": ""
}

Rules:
- "skills" should be an array of concise skill names.
- "projects" should be an array of concise project descriptions or project names.
- "education" should be an array of concise education entries.
- "summary" should be a short professional summary in plain text.
- Do not include markdown, explanations, or extra keys.
- If a field is missing, return an empty array or empty string.

Resume text:
"""
${resumeText}
"""
`;

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

const parseResumeJson = (content) => {
  const parsed = JSON.parse(cleanJsonResponse(content));

  return {
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
  };
};

const parseWithOpenAI = async (resumeText) => {
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
      input: buildResumePrompt(resumeText),
      text: {
        format: {
          type: "json_schema",
          name: "resume_parse",
          schema: resumeJsonSchema,
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
  const outputText = data.output_text;

  if (!outputText) {
    throw new Error("OpenAI response did not include structured output");
  }

  return parseResumeJson(outputText);
};

const parseWithGemini = async (resumeText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

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
            parts: [{ text: buildResumePrompt(resumeText) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const outputText =
    data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!outputText) {
    throw new Error("Gemini response did not include structured output");
  }

  return parseResumeJson(outputText);
};

const extractStructuredResumeData = async (resumeText) => {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "gemini") {
    return parseWithGemini(resumeText);
  }

  if (provider === "openai") {
    return parseWithOpenAI(resumeText);
  }

  throw new Error("Unsupported AI_PROVIDER. Use 'openai' or 'gemini'.");
};

module.exports = {
  extractStructuredResumeData,
};
