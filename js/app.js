// App entry point: wires up routes to views and starts the background
// "generation engine" that simulates realtime progress updates.

import { registerRoute, startRouter, navigate } from "./router.js";
import { startEngine } from "./data/generationEngine.js";
import { renderHome } from "./views/home.js";
import { renderAiCreate } from "./views/aiCreate.js";
import { renderGeneration } from "./views/generation.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderEditor } from "./views/editor.js";
import { renderMyMaterials } from "./views/myMaterials.js";
import { renderTemplates } from "./views/templates.js";
import { renderLibrary } from "./views/library.js";
import { renderLessonSelect, renderLessonMode } from "./views/lessonMode.js";
import { renderAnalytics } from "./views/analytics.js";
import { renderSettings } from "./views/settings.js";

const root = document.getElementById("app");

registerRoute("/", () => renderHome(root));
registerRoute("/create", () => renderAiCreate(root));
registerRoute("/generating/:id", (params) => renderGeneration(root, params));
registerRoute("/dashboard/:id", (params) => renderDashboard(root, params));
registerRoute("/editor/:id/:materialKey", (params) => renderEditor(root, params));
registerRoute("/materials", () => renderMyMaterials(root));
registerRoute("/templates", () => renderTemplates(root));
registerRoute("/library", () => renderLibrary(root));
registerRoute("/teach", () => renderLessonSelect(root));
registerRoute("/teach/:id", (params) => renderLessonMode(root, params));
registerRoute("/analytics", () => renderAnalytics(root));
registerRoute("/settings", () => renderSettings(root));

startEngine();
startRouter();

window.addEventListener("hashchange", () => window.scrollTo(0, 0));
