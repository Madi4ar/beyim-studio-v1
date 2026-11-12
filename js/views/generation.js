// Generation screen (spec sec. 9–15): three-column layout, live stage
// progress, partial results usable before the whole job finishes.

import { h, icon, mount, clear } from "../utils/dom.js";
import { renderShell } from "../components/shell.js";
import { renderMaterialCard } from "../components/materialCard.js";
import { renderProgressBar } from "../components/progress.js";
import { getProject } from "../data/store.js";
import { onEngineTick, startEngine } from "../data/generationEngine.js";
import { GENERATION_STAGES, LIVE_MESSAGES } from "../data/mockContent.js";
import { navigate } from "../router.js";

export function renderGeneration(root, { id }) {
  startEngine();
  let project = getProject(id);
  if (!project) {
    navigate("/materials");
    return;
  }

  const chatCol = h("div", {
    class:
      "w-full md:w-72 md:shrink-0 bg-white border-b md:border-b-0 md:border-r border-line p-5 flex flex-col gap-4 max-h-72 md:max-h-none md:h-screen md:sticky md:top-0 overflow-y-auto scrollbar-thin",
  });
  const mainCol = h("div", { class: "flex-1 flex flex-col items-center justify-center gap-6 px-5 md:px-6 py-8 md:py-10" });
  const mainWrap = h("div", { class: "flex-1 flex flex-col md:h-screen overflow-y-auto scrollbar-thin" }, [mainCol]);
  const columns = h("div", { class: "flex flex-col md:flex-row flex-1 min-h-0" }, [chatCol, mainWrap]);

  const AI_LIVE_LABELS = { ksp: "пишет КСП", quiz: "составляет квиз", worksheet: "составляет рабочий лист", tasks3: "составляет задания 3 уровней" };
  let msgIndex = 0;
  function currentLiveMessage() {
    const aiMaterial = project.materials.find((m) => AI_LIVE_LABELS[m.key] && m.status === "running" && m._aiRequested);
    if (aiMaterial) {
      return `AI ${AI_LIVE_LABELS[aiMaterial.key]} по теме «${project.topic}»...`;
    }
    return LIVE_MESSAGES[msgIndex];
  }
  const liveMsgEl = h("p", { class: "text-sm text-muted text-center max-w-sm animate-fade-in" }, currentLiveMessage());

  function renderChat() {
    clear(chatCol);
    chatCol.append(
      h("button", { class: "flex items-center gap-1.5 text-sm text-muted hover:text-ink self-start", onClick: () => navigate("/materials") }, [
        h("span", { html: icon("arrowLeft", "w-4 h-4") }),
        "Назад",
      ]),
      h("div", { class: "flex items-center gap-2 mt-2" }, [
        h("div", { class: "w-8 h-8 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center text-xs font-semibold" }, "М"),
        h("p", { class: "text-sm font-medium text-ink" }, "Мадияр"),
      ]),
      h("div", { class: "card p-3 text-sm text-ink bg-brand-soft/40 border-brand/10" }, [
        h("p", {}, [
          "Создай комплект материалов для урока по теме ",
          h("strong", {}, `«${project.topic}»`),
          `, ${project.grade} класс, ${project.duration} минут.`,
        ]),
      ]),
      h("div", { class: "flex items-center gap-2 text-xs text-muted" }, [
        h("span", { class: "w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-dot" }),
        "AI анализирует...",
      ]),
      h("p", { class: "text-xs font-medium text-muted mt-4" }, "История версий"),
      h("p", { class: "text-xs text-muted" }, "Version 1 — черновик запроса")
    );

    const refineInput = h("input", { class: "input !text-sm mt-auto", placeholder: "Написать уточнение..." });
    chatCol.appendChild(refineInput);
  }

  function stageStatuses() {
    const readyCount = project.materials.filter((m) => m.status === "ready").length;
    const runningCount = project.materials.filter((m) => m.status === "running").length;
    const doneStages = Math.min(GENERATION_STAGES.length - 1, Math.floor((readyCount / project.materials.length) * (GENERATION_STAGES.length - 1)));
    return GENERATION_STAGES.map((s, i) => ({
      ...s,
      status: project.status === "ready" ? "done" : i < doneStages ? "done" : i === doneStages ? "running" : "pending",
    }));
  }

  function renderMain() {
    clear(mainCol);

    if (project.status === "ready") {
      navigate(`/dashboard/${project.id}`);
      return;
    }

    const stages = stageStatuses();

    mainCol.append(
      h("h1", { class: "text-2xl font-semibold text-ink tracking-tight" }, "Создаем ваш урок"),
      h("div", { class: "text-4xl font-bold text-brand tracking-tight" }, `${project.progress}%`),
      h("div", { class: "w-full max-w-md" }, [renderProgressBar(project.progress)]),
      liveMsgEl,
      h("div", { class: "card p-5 w-full max-w-md" }, [
        h("p", { class: "text-xs font-medium text-muted mb-3" }, "Этапы генерации"),
        renderStages(stages),
      ]),
      h("div", { class: "w-full max-w-3xl" }, [
        h("p", { class: "text-xs font-medium text-muted mb-3" }, "Уже готово — можно открыть, не дожидаясь завершения"),
        h(
          "div",
          { class: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3" },
          project.materials.filter((m) => m.status !== "pending").map((m) => renderMaterialCard(project, m))
        ),
      ])
    );
  }

  function renderStages(stages) {
    return h(
      "ul",
      { class: "flex flex-col gap-2.5" },
      stages.map((stage) => {
        const isDone = stage.status === "done";
        const isRunning = stage.status === "running";
        const markIcon = isDone ? "check" : isRunning ? "dot" : "circle";
        const markClass = isDone ? "text-brand" : isRunning ? "text-amber-500 animate-pulse-dot" : "text-muted/40";
        return h("li", { class: "flex items-center gap-2.5 text-sm" }, [
          h("span", { class: markClass, html: icon(markIcon, "w-4 h-4") }),
          h("span", { class: isDone ? "text-ink" : isRunning ? "text-ink font-medium" : "text-muted" }, stage.label),
        ]);
      })
    );
  }

  renderChat();
  renderMain();

  const stop = onEngineTick(() => {
    project = getProject(id) || project;
    msgIndex = (msgIndex + 1) % LIVE_MESSAGES.length;
    liveMsgEl.textContent = currentLiveMessage();
    renderMain();
  });

  const cleanupInterval = setInterval(() => {
    if (!document.body.contains(mainWrap)) {
      stop();
      clearInterval(cleanupInterval);
    }
  }, 3000);

  mount(root, renderShell(columns));
}
