// Simulated "generation_job" engine. Drives progress for a project's
// material list over time, independent of which view is open, so background
// generation + realtime progress (sec. 15/66 of the spec) can be approximated
// client-side without a real backend/WebSocket.

import { getProjects, saveProjects } from "./store.js";
import { materialTypeList } from "./seed.js";
import { buildKSP, buildQuiz, buildWorksheet, buildTasks3Levels } from "./mockContent.js";
import { generateKSP, generateQuiz, generateWorksheet, generateTasks3 } from "./aiClient.js";

const listeners = new Set();
let timer = null;

// Materials wired to a real model call; everything else still advances on
// the local fake timer below. Each entry: generate(params) -> content, and
// fallback(project) -> mock content used if the real call fails.
const AI_MATERIALS = {
  ksp: { generate: generateKSP, fallback: buildKSP },
  quiz: { generate: generateQuiz, fallback: buildQuiz },
  worksheet: { generate: generateWorksheet, fallback: buildWorksheet },
  tasks3: { generate: generateTasks3, fallback: buildTasks3Levels },
};

// This keeps the request in flight across ticks without re-triggering it
// (getProjects() returns fresh object references every call, so `material`
// here goes stale — all writes happen through applyAIResult, which re-reads
// live state before saving).
async function requestRealMaterial(projectId, materialKey, params) {
  const handler = AI_MATERIALS[materialKey];
  try {
    const content = await handler.generate(params);
    applyAIResult(projectId, materialKey, content);
  } catch (err) {
    console.warn(`${materialKey}: real generation failed, falling back to mock content.`, err);
    const project = getProjects().find((p) => p.id === projectId);
    applyAIResult(projectId, materialKey, project ? handler.fallback(project) : null);
  }
}

function applyAIResult(projectId, materialKey, content) {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  const material = project && project.materials.find((m) => m.key === materialKey);
  if (!material) return;

  material.status = "ready";
  material.versions = 1;
  material.content = content;

  const readyCount = project.materials.filter((m) => m.status === "ready").length;
  project.progress = Math.round((readyCount / project.materials.length) * 100);
  if (readyCount === project.materials.length) {
    project.status = "ready";
    project.goalMatch = 85 + Math.floor(Math.random() * 12);
  }

  saveProjects(projects);
  listeners.forEach((fn) => fn());
}

function tickProjects() {
  const projects = getProjects();
  let changed = false;

  for (const project of projects) {
    if (project.status !== "generating") continue;
    const pendingIdx = project.materials.findIndex((m) => m.status !== "ready");
    if (pendingIdx === -1) {
      project.status = "ready";
      project.progress = 100;
      project.goalMatch = 85 + Math.floor(Math.random() * 12);
      changed = true;
      continue;
    }
    const material = project.materials[pendingIdx];
    if (material.status === "pending") {
      material.status = "running";
      changed = true;
      if (AI_MATERIALS[material.key]) {
        material._aiRequested = true;
        requestRealMaterial(project.id, material.key, {
          topic: project.topic,
          subject: project.subject,
          grade: project.grade,
          lang: project.lang,
          goal: project.goal,
          duration: project.duration,
          textbook: project.textbook,
        });
      }
    } else if (material.status === "running") {
      if (AI_MATERIALS[material.key] && material._aiRequested) {
        // Waiting on the real API call — requestRealMaterial/applyAIResult
        // will flip this to "ready" when it resolves, not this generic timer.
      } else {
        material.status = "ready";
        material.versions = 1;
        changed = true;
      }
    }
    const readyCount = project.materials.filter((m) => m.status === "ready").length;
    project.progress = Math.round((readyCount / project.materials.length) * 100);
  }

  if (changed) saveProjects(projects);
  return changed;
}

export function startEngine(intervalMs = 2200) {
  if (timer) return;
  timer = setInterval(() => {
    const changed = tickProjects();
    if (changed) listeners.forEach((fn) => fn());
  }, intervalMs);
}

export function onEngineTick(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function createGeneratingProject({ topic, subject, grade, lang, goal, duration, textbook, materialKeys }) {
  const id = `proj_${Date.now().toString(36)}`;
  const allTypes = materialTypeList();
  const chosenTypes = materialKeys && materialKeys.length ? allTypes.filter((m) => materialKeys.includes(m.key)) : allTypes;
  const project = {
    id,
    topic: topic.trim(),
    subject: subject || "Общий предмет",
    grade: grade || "7",
    lang: lang || "ru",
    goal: goal || "",
    duration: Number(duration) || 45,
    textbook: textbook || "",
    status: "generating",
    progress: 0,
    createdAt: new Date().toISOString(),
    goalMatch: null,
    materials: chosenTypes.map((m) => ({ ...m, status: "pending", versions: 0 })),
  };
  const projects = getProjects();
  projects.unshift(project);
  saveProjects(projects);
  return project;
}
