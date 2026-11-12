// Static file server + the real AI endpoints (КСП, Quiz, Рабочий лист,
// Задания 3 уровней — all via OpenAI). Everything else in the app still
// runs as a plain static site — this is the minimal addition needed so the
// browser never sees the API key.

import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildKSPPrompt, KSP_JSON_SCHEMA } from "./api/prompts/ksp.js";
import { buildQuizPrompt, QUIZ_JSON_SCHEMA } from "./api/prompts/quiz.js";
import { buildWorksheetPrompt, WORKSHEET_JSON_SCHEMA } from "./api/prompts/worksheet.js";
import { buildTasks3Prompt, TASKS3_JSON_SCHEMA } from "./api/prompts/tasks3.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve relative to this file, not process.cwd() — so the key loads
// correctly no matter where `node server.js` is actually launched from.
dotenv.config({ path: path.join(__dirname, ".env.local") });

const PORT = process.env.PORT || 5173;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

async function callOpenAI({ apiKey, system, user, jsonSchema }) {
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_schema", json_schema: jsonSchema },
    }),
  });

  if (!openaiRes.ok) {
    const errBody = await openaiRes.text();
    console.error("OpenAI API error:", openaiRes.status, errBody);
    throw new Error("OpenAI API request failed");
  }

  const data = await openaiRes.json();
  return JSON.parse(data.choices[0].message.content);
}

// gpt-4o-mini doesn't reliably hit exact structural counts (e.g. "exactly 4
// stages") on every call even with a strict JSON schema — it's a model
// instruction-following gap, not a parsing error, so retrying the same
// request is the fix rather than tightening the prompt further.
async function callOpenAIWithRetry({ apiKey, system, user, jsonSchema, validate, maxAttempts = 3 }) {
  let last;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    last = await callOpenAI({ apiKey, system, user, jsonSchema });
    if (!validate || validate(last)) return last;
    console.warn(`${jsonSchema.name}: attempt ${attempt}/${maxAttempts} failed validation, retrying...`);
  }
  return last;
}

// One route factory for every AI-backed material: same key check, same
// topic validation, same retry-on-validation-failure flow. `buildPrompt`
// returns { system, user, ...extra } — `extra` fields (e.g. quiz's `count`)
// are passed through to `validate` as a second argument.
function registerGenerateRoute(path, { buildPrompt, jsonSchema, validate, label }) {
  app.post(path, async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server (.env.local)." });
    }

    const { topic } = req.body || {};
    if (!topic || !String(topic).trim()) {
      return res.status(400).json({ error: "topic is required" });
    }

    const { system, user, ...extra } = buildPrompt(req.body || {});

    try {
      const content = await callOpenAIWithRetry({
        apiKey,
        system,
        user,
        jsonSchema,
        validate: validate ? (c) => validate(c, extra) : undefined,
      });
      res.json(content);
    } catch (err) {
      console.error(`${label} generation failed:`, err);
      res.status(502).json({ error: `${label} generation failed` });
    }
  });
}

registerGenerateRoute("/api/generate-ksp", {
  buildPrompt: ({ topic, subject, grade, lang, goal, duration, textbook }) =>
    buildKSPPrompt({ topic, subject, grade, lang, goal, duration, textbook }),
  jsonSchema: KSP_JSON_SCHEMA,
  validate: (c) => Array.isArray(c.stages) && c.stages.length === 4,
  label: "КСП",
});

registerGenerateRoute("/api/generate-quiz", {
  buildPrompt: ({ topic, subject, grade, lang, duration, textbook }) =>
    buildQuizPrompt({ topic, subject, grade, lang, duration, textbook }),
  jsonSchema: QUIZ_JSON_SCHEMA,
  validate: (c, { count }) => Array.isArray(c.questions) && c.questions.length === count,
  label: "Quiz",
});

registerGenerateRoute("/api/generate-worksheet", {
  buildPrompt: ({ topic, subject, grade, lang, duration, textbook }) =>
    buildWorksheetPrompt({ topic, subject, grade, lang, duration, textbook }),
  jsonSchema: WORKSHEET_JSON_SCHEMA,
  validate: (c) =>
    c.matching?.pairs?.length === 5 &&
    c.fillIn?.items?.length === 6 &&
    c.table?.rows?.length === 4 &&
    c.openQuestions?.items?.length === 2,
  label: "Рабочий лист",
});

registerGenerateRoute("/api/generate-tasks3", {
  buildPrompt: ({ topic, subject, grade, lang, textbook }) => buildTasks3Prompt({ topic, subject, grade, lang, textbook }),
  jsonSchema: TASKS3_JSON_SCHEMA,
  validate: (c) => [c.levelA, c.levelB, c.levelC].every((lvl) => Array.isArray(lvl?.tasks) && lvl.tasks.length === 4),
  label: "Задания 3 уровней",
});

app.listen(PORT, () => {
  console.log(`Beyim Studio running at http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set — КСП generation will fall back to mock content.");
  }
});
