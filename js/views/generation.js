// Generation screen (spec sec. 9–15): three-column layout, live stage
// progress, partial results usable before the whole job finishes.

import { h, icon, mount, clear } from "../utils/dom.js";
import { renderShell } from "../components/shell.js";
import { renderMaterialCard } from "../components/materialCard.js";
import { renderProgressBar } from "../components/progress.js";
import { getProject } from "../data/store.js";
import { onEngineTick, startEngine } from "../data/generationEngine.js";
import { LIVE_MESSAGES } from "../data/mockContent.js";
import { navigate } from "../router.js";
import { showToast } from "../components/feedback.js";

const MATERIAL_THOUGHTS = {
  ksp: [
    "Сверяю тему с учебной целью и программой.",
    "Распределяю время между этапами урока.",
    "Формулирую критерии оценивания и дескрипторы.",
    "Проверяю связность КСП перед сохранением.",
  ],
  presentation: [
    "Выстраиваю последовательность слайдов.",
    "Сокращаю формулировки для показа на экране.",
    "Добавляю вопросы для проверки понимания.",
    "Проверяю темп презентации относительно урока.",
  ],
  worksheet: [
    "Подбираю задания под возраст и тему.",
    "Чередую простые и более сложные упражнения.",
    "Добавляю место для письменных ответов.",
    "Проверяю инструкции рабочего листа.",
  ],
  tasks3: [
    "Разделяю задания на три уровня сложности.",
    "Проверяю, что базовый уровень доступен всему классу.",
    "Добавляю задания на анализ и аргументацию.",
    "Сверяю задания с целью урока.",
  ],
  quiz: [
    "Формулирую вопросы без двусмысленности.",
    "Подбираю правдоподобные варианты ответов.",
    "Распределяю вопросы по уровню сложности.",
    "Проверяю ответы и пояснения.",
  ],
  reflection: ["Подбираю короткие вопросы для рефлексии.", "Связываю рефлексию с целью урока.", "Проверяю, что ответы можно дать за несколько минут."],
  homework: ["Формирую понятное домашнее задание.", "Проверяю объём и уровень сложности.", "Добавляю критерии выполнения."],
  textDetective: ["Выделяю ключевые факты в тексте.", "Готовлю вопросы на внимательное чтение.", "Проверяю подсказки и ответы."],
  cards: ["Выбираю ключевые термины.", "Формулирую краткие определения.", "Проверяю карточки на повторения."],
};

export function renderGeneration(root, { id }) {
  startEngine();
  let project = getProject(id);
  if (!project) {
    navigate("/materials");
    return;
  }

  const chatCol = h("div", {
    class:
      "ambient-generation-side w-full md:w-72 md:shrink-0 bg-white border-b md:border-b-0 md:border-r border-line p-5 flex flex-col gap-4 max-h-72 md:max-h-none md:h-screen md:sticky md:top-0 overflow-y-auto scrollbar-thin",
  });
  const mainCol = h("div", { class: "flex-1 flex flex-col items-center justify-center gap-6 px-5 md:px-6 py-8 md:py-10" });
  const mainWrap = h("div", { class: "generation-workspace flex-1 flex flex-col md:h-screen overflow-y-auto scrollbar-thin" }, [mainCol]);
  const columns = h("div", { class: "ambient-generation flex flex-col md:flex-row flex-1 min-h-0" }, [chatCol, mainWrap]);

  let msgIndex = 0;
  let completionHandled = false;
  const previousStatuses = new Map(project.materials.map((material) => [material.key, material.status]));
  const thoughtHistory = [];

  function activeMaterial() {
    return project.materials.find((material) => material.status === "running") || null;
  }

  function currentLiveMessage() {
    const material = activeMaterial();
    const messages = material && MATERIAL_THOUGHTS[material.key];
    return messages?.[msgIndex % messages.length] || LIVE_MESSAGES[msgIndex % LIVE_MESSAGES.length];
  }

  function rememberCurrentThought() {
    const text = currentLiveMessage();
    if (thoughtHistory[0] !== text) thoughtHistory.unshift(text);
    if (thoughtHistory.length > 4) thoughtHistory.length = 4;
  }

  function renderThinkingPanel() {
    const material = activeMaterial();
    const readyCount = project.materials.filter((item) => item.status === "ready").length;
    rememberCurrentThought();
    return h("div", { class: "ambient-generation-active card generation-thinking-card p-5 w-full max-w-md", "aria-live": "polite" }, [
      h("div", { class: "flex items-start justify-between gap-3 mb-4" }, [
        h("div", { class: "min-w-0" }, [
          h("p", { class: "text-xs font-medium text-brand-dark flex items-center gap-1.5" }, [
            h("span", { html: icon("sparkles", "w-3.5 h-3.5") }),
            "AI работает",
          ]),
          h("p", { class: "text-sm font-semibold text-ink mt-1" }, material ? `Сейчас создаётся: ${material.label}` : "Подготавливаем следующий материал"),
        ]),
        h("span", { class: "text-xs text-muted shrink-0 tabular-nums" }, `${readyCount}/${project.materials.length}`),
      ]),
      h("ul", { class: "flex flex-col gap-2.5" }, thoughtHistory.map((text, index) =>
        h("li", { class: "flex items-start gap-2.5 text-[13px]" }, [
          index === 0
            ? h("span", { class: "w-2 h-2 rounded-full bg-brand animate-pulse-dot shrink-0 mt-1.5" })
            : h("span", { class: "text-brand shrink-0 mt-0.5", html: icon("check", "w-3.5 h-3.5") }),
          h("span", { class: index === 0 ? "text-ink font-medium" : "text-muted" }, text),
        ])
      )),
      h("p", { class: "text-xs text-muted mt-4 pt-3 border-t border-line" }, "Материал активно создаётся. Готовые части можно открывать, пока AI продолжает работу."),
    ]);
  }

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

  function renderMain() {
    clear(mainCol);

    if (project.status === "ready") {
      navigate(`/dashboard/${project.id}`);
      return;
    }

    mainCol.append(
      h("h1", { class: "text-2xl font-semibold text-ink tracking-tight" }, "Создаем ваш урок"),
      h("div", { class: "text-4xl font-bold text-brand tracking-tight" }, `${project.progress}%`),
      h("div", { class: "w-full max-w-md" }, [renderProgressBar(project.progress)]),
      renderThinkingPanel(),
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

  renderChat();
  renderMain();

  const stop = onEngineTick(() => {
    project = getProject(id) || project;

    project.materials.forEach((material) => {
      const previous = previousStatuses.get(material.key);
      if (previous !== "ready" && material.status === "ready") {
        showToast({ tone: "success", title: "Материал готов", message: `${material.label} можно открыть уже сейчас.` });
      }
      previousStatuses.set(material.key, material.status);
    });

    if (project.status === "ready" && !completionHandled) {
      completionHandled = true;
      clearInterval(thoughtInterval);
      showToast({ tone: "success", title: "Комплект урока готов", message: "Все материалы созданы и сохранены в проекте.", duration: 5000 });
      setTimeout(() => navigate(`/dashboard/${project.id}`), 700);
      return;
    }

    renderMain();
  });

  // Thought copy keeps moving even while a real AI request is in flight and
  // the generation engine has no state transition to emit yet.
  const thoughtInterval = setInterval(() => {
    if (!document.body.contains(mainWrap) || project.status !== "generating") return;
    msgIndex = (msgIndex + 1) % LIVE_MESSAGES.length;
    renderMain();
  }, 2400);

  const cleanupInterval = setInterval(() => {
    if (!document.body.contains(mainWrap)) {
      stop();
      clearInterval(thoughtInterval);
      clearInterval(cleanupInterval);
    }
  }, 3000);

  mount(root, renderShell(columns, { sourceReplica: true }));
}
