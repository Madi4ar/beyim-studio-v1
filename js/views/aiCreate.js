// AI Create copied from /Users/madiar/Desktop/new-proj and adapted to this SPA's data layer.

import { h, icon, mount, clear } from "../utils/dom.js";
import { sourcePage, sourceAutosaveBadge, sourceSelect } from "../components/sourcePage.js";
import { createGeneratingProject } from "../data/generationEngine.js";
import { getClasses } from "../data/store.js";
import { navigate } from "../router.js";

const SOURCE_TABS = [
  { key: "topic", icon: "sparkles", label: "Тема" },
  { key: "text", icon: "doc", label: "Текст" },
  { key: "file", icon: "upload", label: "PDF / Word" },
  { key: "link", icon: "link", label: "Ссылка" },
  { key: "image", icon: "image", label: "Изображение" },
  { key: "own", icon: "folder", label: "Мой материал" },
];

const INTENTS = ["Объяснить", "Закрепить", "Повторить", "Проверить", "Развивать критическое мышление", "Подготовить к экзамену"];

export function renderAiCreate(root) {
  let activeSource = "topic";
  let activeIntent = null;
  let showMore = false;
  let chosenFileName = "";
  let topic = "";
  const body = h("div", { class: "source-enter" });

  function draw() {
    clear(body);
    const tabs = h("div", { class: "flex flex-wrap gap-2 mb-4" });
    SOURCE_TABS.forEach((tab) => {
      const button = h("button", { type: "button", class: `source-chip${activeSource === tab.key ? " is-selected" : ""}` }, [
        h("span", { html: icon(tab.icon, "w-4 h-4") }), h("span", {}, tab.label),
      ]);
      button.addEventListener("click", () => { activeSource = tab.key; chosenFileName = ""; topic = ""; draw(); });
      tabs.appendChild(button);
    });

    const form = h("form", { class: "source-card p-5" });
    if (activeSource === "topic" || activeSource === "text") {
      const field = h("textarea", {
        name: "topic", rows: "4", class: "w-full resize-none border-0 outline-none text-[16px] bg-transparent source-input-area",
        placeholder: activeSource === "topic" ? "Тема урока или учебная цель..." : "Вставьте текст — AI поймёт тему и уровень сложности...",
      });
      field.value = topic;
      field.addEventListener("input", (event) => (topic = event.target.value));
      form.appendChild(field);
    } else if (activeSource === "link") {
      const field = h("input", { type: "url", name: "sourceUrl", class: "source-input w-full max-w-sm px-3 py-2 text-[14px]", placeholder: "https://..." });
      field.value = topic;
      field.addEventListener("input", (event) => (topic = event.target.value));
      form.appendChild(h("div", { class: "flex flex-col items-center gap-3 py-8 text-center" }, [
        h("span", { class: "source-soft", html: icon("link", "w-7 h-7") }),
        h("div", { class: "text-[14px] source-soft" }, "Вставьте ссылку на статью, видео или сайт"), field,
      ]));
    } else if (activeSource === "own") {
      const openMaterials = h("button", { type: "button", class: "source-btn source-btn-secondary source-btn-sm" }, "Открыть «Материалы»");
      openMaterials.addEventListener("click", () => navigate("/materials"));
      form.appendChild(h("div", { class: "flex flex-col items-center gap-3 py-8 text-center" }, [
        h("span", { class: "source-soft", html: icon("folder", "w-7 h-7") }),
        h("div", { class: "text-[14px] source-soft" }, "Выберите материал из раздела «Материалы» для адаптации"), openMaterials,
      ]));
    } else {
      const fileName = h("span", { class: "text-[12.5px] source-soft" }, chosenFileName);
      const input = h("input", { type: "file", class: "hidden", accept: activeSource === "file" ? ".pdf,.doc,.docx" : "image/*" });
      input.addEventListener("change", () => { chosenFileName = input.files?.[0]?.name || ""; fileName.textContent = chosenFileName; });
      const chooser = h("label", { class: "source-btn source-btn-secondary source-btn-sm cursor-pointer" }, ["Выбрать файл", input]);
      form.appendChild(h("div", { class: "flex flex-col items-center gap-3 py-8 text-center" }, [
        h("span", { class: "source-soft", html: icon(activeSource === "file" ? "upload" : "image", "w-7 h-7") }),
        h("div", { class: "text-[14px] source-soft" }, activeSource === "file" ? "Перетащите PDF или Word, или выберите файл" : "Загрузите изображение — AI распознает текст и тему"),
        chooser, fileName,
      ]));
    }

    const params = h("div", { class: "pt-3 mt-1 border-t", style: "border-color:var(--source-border)" }, [
      h("div", { class: "grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3" }, [
        sourceSelect({ name: "subject", label: "Предмет", options: ["История Казахстана", "Алгебра", "Биология", "Русский язык", "Қазақ тілі", "Всемирная история"], selected: "История Казахстана" }),
        sourceSelect({ name: "grade", label: "Класс", options: ["5", "6", "7", "8", "9", "10", "11"], selected: "7" }),
        sourceSelect({ name: "language", label: "Язык", options: ["Қазақша", "Русский"], selected: "Қазақша" }),
      ]),
    ]);
    const moreToggle = h("button", { type: "button", class: "text-[13px] flex items-center gap-1 mt-4 source-brand" }, [
      h("span", { html: icon(showMore ? "chevronDown" : "chevronRight", "w-3.5 h-3.5") }),
      showMore ? "Скрыть уточнения" : "Показать больше уточнений (необязательно)",
    ]);
    moreToggle.addEventListener("click", () => { showMore = !showMore; draw(); });
    params.appendChild(moreToggle);
    if (showMore) {
      params.appendChild(h("div", { class: "grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3" }, [
        sourceSelect({ name: "duration", label: "Длительность урока", options: ["30 минут", "40 минут", "45 минут", "70 минут (сдвоенный)"], selected: "45 минут" }),
        sourceSelect({ name: "difficulty", label: "Уровень сложности", options: ["Базовый", "Стандартный", "Повышенный"], selected: "Стандартный" }),
        sourceSelect({ name: "style", label: "Стиль подачи", options: ["Академический", "Простой", "Для школьника", "Методический"], selected: "Методический" }),
      ]));
    }

    const intents = h("div", { class: "flex flex-wrap gap-2" });
    INTENTS.forEach((label) => {
      const chip = h("button", { type: "button", class: `source-chip${activeIntent === label ? " is-selected" : ""}` }, label);
      chip.addEventListener("click", () => { activeIntent = activeIntent === label ? null : label; draw(); });
      intents.appendChild(chip);
    });
    params.appendChild(h("div", { class: "mt-4" }, [h("div", { class: "text-[13px] font-medium mb-2 source-soft" }, "Цель на уроке"), intents]));
    form.appendChild(params);

    const classProfile = getClasses()[0];
    form.appendChild(h("div", { class: "flex items-center justify-between mt-5 pt-4 border-t flex-wrap gap-3", style: "border-color:var(--source-border)" }, [
      h("label", { class: "flex items-center gap-2 text-[13px] source-soft" }, [
        h("span", { html: icon("users", "w-4 h-4") }),
        `Профиль класса «${classProfile?.name || "7А"}» подключён — дифференциация предложится автоматически`,
      ]),
      h("button", { type: "submit", class: "source-btn source-btn-primary" }, [h("span", { html: icon("sparkles", "w-4 h-4") }), "Создать материалы"]),
    ]));

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (activeSource === "own") return;
      const fd = new FormData(form);
      const rawTopic = topic.trim() || chosenFileName;
      if (!rawTopic) { form.classList.add("ring-2", "ring-red-300"); return; }
      const language = String(fd.get("language") || "Қазақша");
      const project = createGeneratingProject({
        topic: rawTopic,
        subject: String(fd.get("subject") || "История Казахстана"),
        grade: String(fd.get("grade") || "7"),
        lang: language === "Қазақша" ? "kz" : "ru",
        goal: activeIntent || "",
        duration: parseInt(String(fd.get("duration") || "45"), 10) || 45,
      });
      navigate(`/generating/${project.id}`);
    });

    body.append(tabs, form);
  }

  draw();
  mount(root, sourcePage({ title: "AI Create", subtitle: "Начните с темы, цели, текста, файла или ссылки — остальное уточнения.", actions: sourceAutosaveBadge(), body }));
}
