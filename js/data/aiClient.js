// Thin client for the real AI endpoints (КСП, Quiz, Рабочий лист, Задания 3
// уровней). Everything else still goes through the local mock builders in
// mockContent.js.

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed with ${res.status}`);
  }
  return res.json();
}

export function generateKSP({ topic, subject, grade, lang, goal, duration, textbook }) {
  return postJSON("/api/generate-ksp", { topic, subject, grade, lang, goal, duration, textbook });
}

export function generateQuiz({ topic, subject, grade, lang, duration, textbook }) {
  return postJSON("/api/generate-quiz", { topic, subject, grade, lang, duration, textbook });
}

export function generateWorksheet({ topic, subject, grade, lang, duration, textbook }) {
  return postJSON("/api/generate-worksheet", { topic, subject, grade, lang, duration, textbook });
}

export function generateTasks3({ topic, subject, grade, lang, textbook }) {
  return postJSON("/api/generate-tasks3", { topic, subject, grade, lang, textbook });
}
