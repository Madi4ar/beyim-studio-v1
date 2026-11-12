// Templates library (spec sec. 38): curated starting points for a new project.

import { h, icon, mount } from "../utils/dom.js";
import { renderShell } from "../components/shell.js";
import { createGeneratingProject } from "../data/generationEngine.js";
import { navigate } from "../router.js";

const TEMPLATES = [
  { title: "КСП", icon: "clipboard", desc: "Полный план урока по стандарту" },
  { title: "Презентация", icon: "presentation", desc: "9-12 слайдов с speaker notes" },
  { title: "Worksheet", icon: "doc", desc: "Рабочий лист с разными типами заданий" },
  { title: "Quiz", icon: "quiz", desc: "Интерактивный тест с таймером" },
  { title: "Project", icon: "layers", desc: "Проектная работа для группы" },
  { title: "Lesson plan", icon: "clipboard", desc: "Краткий план урока" },
  { title: "Reading activity", icon: "detective", desc: "Работа с текстом и источником" },
  { title: "Debate", icon: "users", desc: "Структура дебатов для класса" },
  { title: "Case", icon: "doc", desc: "Разбор реального кейса" },
  { title: "Lab", icon: "wand", desc: "Лабораторная/практическая работа" },
  { title: "Reflection", icon: "cards", desc: "Рефлексия и exit ticket" },
];

export function renderTemplates(root) {
  const grid = h(
    "div",
    { class: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" },
    TEMPLATES.map((tpl) => {
      const card = h("div", { class: "card p-5 flex flex-col gap-3 hover:shadow-pop transition-shadow" }, [
        h("div", { class: "icon-tile w-10 h-10 rounded-xl" }, [h("span", { html: icon(tpl.icon, "w-5 h-5") })]),
        h("div", {}, [h("p", { class: "font-semibold text-ink" }, tpl.title), h("p", { class: "text-xs text-muted mt-1" }, tpl.desc)]),
        h(
          "button",
          {
            class: "btn-secondary !py-1.5 !px-3 text-xs self-start",
            onClick: () => {
              const project = createGeneratingProject({ topic: `${tpl.title} — новая тема`, subject: "Общий предмет", grade: "7", lang: "ru" });
              navigate(`/generating/${project.id}`);
            },
          },
          "Использовать шаблон"
        ),
      ]);
      return card;
    })
  );

  const content = h("div", { class: "flex-1 overflow-y-auto scrollbar-thin" }, [
    h("div", { class: "max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col gap-6" }, [
      h("h1", { class: "text-2xl font-semibold text-ink tracking-tight" }, "Шаблоны"),
      h("p", { class: "text-sm text-muted" }, "Библиотека проверенных педагогических шаблонов."),
      grid,
    ]),
  ]);

  mount(root, renderShell(content));
}
