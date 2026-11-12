// Templates page copied from /Users/madiar/Desktop/new-proj.

import { h, icon, mount } from "../utils/dom.js";
import { sourcePage } from "../components/sourcePage.js";
import { createGeneratingProject } from "../data/generationEngine.js";
import { navigate } from "../router.js";
import { showToast } from "../components/feedback.js";

const TEMPLATES = [
  { id: "t1", icon: "clipboard", type: "КСП", title: "КСП — предметный шаблон МОН РК", subject: "Любой предмет", gradeGroup: "5–11", language: "Два языка", ageDays: 2, author: "Библиотека Beyim" },
  { id: "t2", icon: "presentation", type: "Презентация", title: "Презентация — объяснение новой темы", subject: "Любой предмет", gradeGroup: "5–11", language: "Два языка", ageDays: 5, author: "Библиотека Beyim" },
  { id: "t3", icon: "doc", type: "Рабочий лист", title: "Рабочий лист — работа с текстом", subject: "Гуманитарные предметы", gradeGroup: "7–9", language: "Русский", ageDays: 12, author: "Библиотека Beyim" },
  { id: "t4", icon: "quiz", type: "Quiz", title: "Quiz — проверка понимания", subject: "Любой предмет", gradeGroup: "5–11", language: "Два языка", ageDays: 4, author: "Библиотека Beyim" },
  { id: "t5", icon: "book", type: "Проект", title: "Project — исследовательский мини-проект", subject: "Естественные науки", gradeGroup: "7–9", language: "Русский", ageDays: 20, author: "Методисты школы №12" },
  { id: "t6", icon: "clipboard", type: "План урока", title: "Lesson plan — дебаты", subject: "История, обществознание", gradeGroup: "10–11", language: "Русский", ageDays: 8, author: "Методисты школы №12" },
  { id: "t7", icon: "detective", type: "Работа с текстом", title: "Reading activity — анализ источника", subject: "Гуманитарные предметы", gradeGroup: "7–9", language: "Қазақша", ageDays: 26, author: "Библиотека Beyim" },
  { id: "t8", icon: "doc", type: "Кейс", title: "Case — реальная ситуация", subject: "Функциональная грамотность", gradeGroup: "10–11", language: "Два языка", ageDays: 35, author: "Библиотека Beyim" },
];

const FILTERS = [
  { key: "subject", label: "Предмет", all: "Все предметы", options: [...new Set(TEMPLATES.map((item) => item.subject))] },
  { key: "gradeGroup", label: "Класс", all: "Все классы", options: [...new Set(TEMPLATES.map((item) => item.gradeGroup))] },
  { key: "type", label: "Тип", all: "Все типы", options: [...new Set(TEMPLATES.map((item) => item.type))] },
  { key: "language", label: "Язык", all: "Все языки", options: [...new Set(TEMPLATES.map((item) => item.language))] },
  { key: "date", label: "Дата", all: "За всё время", options: ["За неделю", "За месяц"] },
  { key: "author", label: "Автор", all: "Все авторы", options: [...new Set(TEMPLATES.map((item) => item.author))] },
];

export function renderTemplates(root) {
  const grid = h("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" });
  const selectedFilters = Object.fromEntries(FILTERS.map((filter) => [filter.key, filter.all]));
  let searchQuery = "";

  function matchesFilters(item) {
    return FILTERS.every((filter) => {
      const selected = selectedFilters[filter.key];
      if (selected === filter.all) return true;
      if (filter.key === "date") return selected === "За неделю" ? item.ageDays <= 7 : item.ageDays <= 30;
      return item[filter.key] === selected;
    });
  }

  function drawCards() {
    grid.replaceChildren();
    const normalized = searchQuery.trim().toLowerCase();
    const visible = TEMPLATES.filter((item) => matchesFilters(item) && `${item.title} ${item.subject} ${item.author} ${item.type}`.toLowerCase().includes(normalized));
    if (!visible.length) {
      grid.appendChild(h("div", { class: "col-span-full source-card p-10 text-center" }, [
        h("p", { class: "font-medium text-[14px]" }, "Шаблоны не найдены"),
        h("p", { class: "text-[13px] source-soft mt-1" }, "Измените фильтры или поисковый запрос."),
      ]));
      return;
    }
    visible.forEach((tpl) => {
      const adapt = h("button", { class: "source-btn source-btn-secondary source-btn-sm mt-1" }, "Адаптировать для моего класса");
      adapt.addEventListener("click", () => {
        const project = createGeneratingProject({ topic: `${tpl.title} — новая тема`, subject: tpl.subject, grade: "7", lang: "ru" });
        showToast({ tone: "info", title: "Проект создан", message: "Открываем генерацию материалов по выбранному шаблону." });
        navigate(`/generating/${project.id}`);
      });
      grid.appendChild(h("div", { class: "source-card source-card-hover p-5 flex flex-col gap-3" }, [
        h("div", { class: "source-icon-tile" }, [h("span", { html: icon(tpl.icon, "w-[18px] h-[18px]") })]),
        h("div", {}, [
          h("div", { class: "font-medium text-[14.5px] leading-snug" }, tpl.title),
          h("div", { class: "text-[13px] mt-0.5 source-soft" }, tpl.subject),
        ]),
        h("div", { class: "text-[12.5px] source-soft" }, tpl.author),
        adapt,
      ]));
    });
  }

  const filters = h("div", { class: "flex flex-wrap gap-2 mb-6" });
  const dropdowns = [];
  function closeAllDropdowns() {
    dropdowns.forEach(({ panel, trigger, chevron }) => {
      panel.classList.add("hidden");
      trigger.setAttribute("aria-expanded", "false");
      chevron.style.transform = "";
    });
  }

  FILTERS.forEach((filter) => {
    const label = h("span", {}, filter.label);
    const chevron = h("span", { class: "transition-transform", html: icon("chevronDown", "w-3.5 h-3.5") });
    const trigger = h("button", { type: "button", class: "source-chip", "aria-haspopup": "listbox", "aria-expanded": "false" }, [label, chevron]);
    const panel = h("div", { class: "hidden absolute left-0 top-full z-30 mt-2 min-w-[210px] source-card p-2 shadow-pop", role: "listbox", "aria-label": filter.label });

    [filter.all, ...filter.options].forEach((option) => {
      const optionButton = h("button", { type: "button", class: "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-[#fafafa]" }, [
        h("span", {}, option),
        selectedFilters[filter.key] === option ? h("span", { class: "source-brand", html: icon("check", "w-3.5 h-3.5") }) : null,
      ]);
      optionButton.addEventListener("click", (event) => {
        event.stopPropagation();
        selectedFilters[filter.key] = option;
        label.textContent = option === filter.all ? filter.label : `${filter.label}: ${option}`;
        trigger.classList.toggle("is-selected", option !== filter.all);
        Array.from(panel.children).forEach((node, index) => {
          const currentOption = [filter.all, ...filter.options][index];
          node.replaceChildren(h("span", {}, currentOption));
          if (currentOption === option) node.appendChild(h("span", { class: "source-brand", html: icon("check", "w-3.5 h-3.5") }));
        });
        closeAllDropdowns();
        drawCards();
      });
      panel.appendChild(optionButton);
    });

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const opening = panel.classList.contains("hidden");
      closeAllDropdowns();
      if (opening) {
        panel.classList.remove("hidden");
        trigger.setAttribute("aria-expanded", "true");
        chevron.style.transform = "rotate(180deg)";
        setTimeout(() => document.addEventListener("click", closeAllDropdowns, { once: true }), 0);
      }
    });
    dropdowns.push({ panel, trigger, chevron });
    filters.appendChild(h("div", { class: "relative" }, [trigger, panel]));
  });
  const search = h("input", { type: "search", class: "source-input w-full pl-9 pr-3 py-2 text-[13.5px]", placeholder: "Поиск по шаблонам и материалам" });
  search.addEventListener("input", (event) => { searchQuery = event.target.value; drawCards(); });
  filters.appendChild(h("div", { class: "flex-1 min-w-[180px] relative" }, [
    h("span", { class: "absolute left-3 top-1/2 -translate-y-1/2 source-faint", html: icon("search", "w-4 h-4") }),
    search,
  ]));

  drawCards();
  const body = h("div", { class: "source-enter" }, [filters, grid]);
  mount(root, sourcePage({ title: "Шаблоны", subtitle: "Проверенные педагогические шаблоны", body }));
}
