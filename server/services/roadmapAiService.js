const roadmapJsonSchema = {
  type: "object",
  properties: {
    duration: {
      type: "string",
    },
    plan: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          day: {
            type: "integer",
          },
          tasks: {
            type: "array",
            minItems: 1,
            items: {
              type: "string",
            },
          },
        },
        required: ["day", "tasks"],
        additionalProperties: false,
      },
    },
  },
  required: ["duration", "plan"],
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

const buildRoadmapPrompt = ({ weakAreas, role, resumeData }) => `
Generate a structured interview preparation roadmap.

Return valid JSON only with this exact shape:
{
  "duration": "7 days",
  "plan": [
    {
      "day": 1,
      "tasks": [
        "Revise DBMS basics",
        "Practice 10 SQL queries"
      ]
    }
  ]
}

Rules:
- Focus strongly on these weak areas: ${weakAreas.join(", ")}.
- Target role: ${role}.
- Use candidate skills and projects when useful.
- Keep tasks realistic and specific.
- Include both coding practice and theory revision where relevant.
- Avoid unnecessary text, markdown, notes, or extra keys.
- Keep the roadmap concise and practical.
- Use sequential day numbers starting at 1.
- Each day should include 2 to 4 tasks.

Input:
${JSON.stringify({ weakAreas, role, resumeData }, null, 2)}
`;

const parseRoadmapJson = (content) => {
  const parsed = JSON.parse(cleanJsonResponse(content));
  const plan = Array.isArray(parsed?.plan) ? parsed.plan : [];

  if (typeof parsed?.duration !== "string" || !parsed.duration.trim()) {
    throw new Error("Roadmap response must include a valid duration");
  }

  if (!plan.length) {
    throw new Error("Roadmap response must include at least one day");
  }

  const normalizedPlan = plan.map((item, index) => {
    const day = Number(item?.day);
    const tasks = Array.isArray(item?.tasks)
      ? item.tasks
          .map((task) => (typeof task === "string" ? task.trim() : ""))
          .filter(Boolean)
      : [];

    if (!Number.isInteger(day) || day < 1) {
      throw new Error(`Roadmap day ${index + 1} must have a valid day number`);
    }

    if (!tasks.length) {
      throw new Error(`Roadmap day ${index + 1} must include at least one task`);
    }

    return {
      day,
      tasks,
    };
  });

  return {
    duration: parsed.duration.trim(),
    plan: normalizedPlan,
  };
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
      input: buildRoadmapPrompt(payload),
      text: {
        format: {
          type: "json_schema",
          name: "roadmap_generation",
          schema: roadmapJsonSchema,
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

  return parseRoadmapJson(data.output_text);
};

const generateWithGemini = async (payload) => {
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
            parts: [{ text: buildRoadmapPrompt(payload) }],
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
    throw new Error(`Gemini request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!outputText) {
    throw new Error("Gemini response did not include structured output");
  }

  return parseRoadmapJson(outputText);
};

const generateRoadmap = async ({ weakAreas, role, resumeData }) => {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "gemini") {
    return generateWithGemini({ weakAreas, role, resumeData });
  }

  if (provider === "openai") {
    return generateWithOpenAI({ weakAreas, role, resumeData });
  }

  throw new Error("Unsupported AI_PROVIDER. Use 'openai' or 'gemini'.");
};

module.exports = {
  generateRoadmap,
};
