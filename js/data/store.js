// App state + persistence (localStorage). No backend — this simulates
// "projects", "lesson_packages" and "generation_jobs" entities client-side.

import { seedProjects, seedClasses, seedTeacherProfile } from "./seed.js";

const PROJECTS_KEY = "beyim_projects_v1";
const CLASSES_KEY = "beyim_classes_v1";
const PROFILE_KEY = "beyim_profile_v1";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProjects() {
  let projects = read(PROJECTS_KEY, null);
  if (!projects) {
    projects = seedProjects();
    write(PROJECTS_KEY, projects);
  }
  return projects;
}

export function saveProjects(projects) {
  write(PROJECTS_KEY, projects);
}

export function getProject(id) {
  return getProjects().find((p) => p.id === id) || null;
}

export function upsertProject(project) {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.unshift(project);
  saveProjects(projects);
  return project;
}

export function deleteProject(id) {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
}

export function getClasses() {
  let classes = read(CLASSES_KEY, null);
  if (!classes) {
    classes = seedClasses();
    write(CLASSES_KEY, classes);
  }
  return classes;
}

export function getProfile() {
  let profile = read(PROFILE_KEY, null);
  if (!profile) {
    profile = seedTeacherProfile();
    write(PROFILE_KEY, profile);
  }
  return profile;
}

export function saveProfile(profile) {
  write(PROFILE_KEY, profile);
}

export function newId(prefix = "proj") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
