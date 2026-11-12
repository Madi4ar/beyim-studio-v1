// Universal AI Create screen (spec sec. 7–8): topic/goal/text/file entry
// point + optional generation parameters that never block the quick path.

import { h, icon, mount } from "../utils/dom.js";
import { renderShell } from "../components/shell.js";
import { renderSelectField } from "../components/selectField.js";
import { openMaterialPickerModal } from "../components/materialPickerModal.js";
import { createGeneratingProject } from "../data/generationEngine.js";
import { SUBJECTS, GRADES } from "../data/curriculum.js";
import { navigate } from "../router.js";

const SOURCE_TABS = [
  { key: "topic", label: "Тема", icon: "sparkles" },
  { key: "text", label: "Текст", icon: "doc" },
  { key: "file", label: "PDF / Word", icon: "folder" },
  { key: "link", label: "Ссылка", icon: "link" },
];

export function renderAiCreate(root) {
  let activeTab = "topic";
  let topic = "";
  let subject = "";
  let grade = "7";
  let lang = "ru";
  let goal = "";
  let duration = 45;
  let textbook = "";
  let intent = "Объяснить";
  let showMore = false;

  const tabIconEl = h("span", { class: "absolute left-4 top-4 text-brand pointer-events-none", html: icon("sparkles", "w-5 h-5") });

  const tabsWrap = h("div", { class: "flex gap-2 flex-wrap" });
  SOURCE_TABS.forEach((tabDef) => {
    const el = h("button", { class: tabDef.key === activeTab ? "chip-active" : "chip" }, [
      h("span", { html: icon(tabDef.icon, "w-3.5 h-3.5") }),
      tabDef.label,
    ]);
    el.addEventListener("click", () => {
      activeTab = tabDef.key;
      Array.from(tabsWrap.children).forEach((c, i) => (c.className = SOURCE_TABS[i].key === activeTab ? "chip-active" : "chip"));
      tabIconEl.innerHTML = icon(tabDef.icon, "w-5 h-5");
      inputArea.placeholder =
        activeTab === "topic"
          ? "Например: Казахское ханство, 7 класс, объяснить причины образования..."
          : activeTab === "text"
          ? "Вставьте текст, параграф учебника или источник..."
          : activeTab === "file"
          ? "Перетащите PDF/Word сюда или нажмите, чтобы выбрать файл (демо)"
          : "Вставьте ссылку на статью, видео или материал";
    });
    tabsWrap.appendChild(el);
  });

  const inputArea = h("textarea", {
    class: "input !pl-12 !text-base min-h-[140px] resize-none",
    placeholder: "Например: Казахское ханство, 7 класс, объяснить причины образования...",
    oninput: (e) => (topic = e.target.value),
  });
  const inputAreaWrap = h("div", { class: "relative" }, [tabIconEl, inputArea]);

  subject = "История Казахстана";
  const subjectField = renderSelectField({
    icon: "book",
    label: "Предмет",
    value: subject,
    options: SUBJECTS,
    onChange: (v) => (subject = v),
    allowCustom: true,
    customPlaceholder: "Свой предмет...",
  });
  const gradeField = renderSelectField({
    icon: "graduation",
    label: "Класс",
    value: `${grade} класс`,
    options: GRADES,
    onChange: (v) => (grade = v.replace(" класс", "")),
    columns: 4,
  });
  const langField = renderSelectField({
    icon: "globe",
    label: "Язык",
    value: "Русский",
    options: ["Русский", "Қазақша"],
    onChange: (v) => (lang = v === "Қазақша" ? "kz" : "ru"),
  });

  const requiredRow = h("div", { class: "grid grid-cols-1 md:grid-cols-3 gap-3" }, [subjectField, gradeField, langField]);

  function withLeadingIcon(iconName, node) {
    node.classList.add("!pl-10");
    return h("div", { class: "relative" }, [
      h("span", { class: "absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none", html: icon(iconName, "w-4 h-4") }),
      node,
    ]);
  }

  const goalInput = h("input", { class: "input", placeholder: "Учебная цель (необязательно)", oninput: (e) => (goal = e.target.value) });
  const durationInput = h("input", { class: "input", type: "number", placeholder: "Длительность урока (мин)", value: "45", oninput: (e) => (duration = e.target.value) });
  const textbookInput = h("input", { class: "input", placeholder: "Учебник (автор, название — необязательно)", oninput: (e) => (textbook = e.target.value) });
  const intentSelect = h(
    "select",
    { class: "select-native", onchange: (e) => (intent = e.target.value) },
    ["Объяснить", "Закрепить", "Повторить", "Проверить", "Развивать критическое мышление", "Подготовить к экзамену"].map((v) => h("option", { value: v }, v))
  );
  const intentField = h("div", { class: "select-wrap" }, [
    h("span", { class: "absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10", html: icon("wand", "w-4 h-4") }),
    (() => {
      intentSelect.classList.add("!pl-10");
      return intentSelect;
    })(),
    h("span", { class: "select-chevron", html: icon("chevronDown", "w-4 h-4") }),
  ]);

  const moreWrap = h("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden transition-all", style: "max-height:0; opacity:0;" }, [
    withLeadingIcon("target", goalInput),
    withLeadingIcon("timer", durationInput),
    withLeadingIcon("book", textbookInput),
    h("div", {}, [h("p", { class: "text-xs text-muted mb-1.5" }, "Teacher Intent"), intentField]),
  ]);

  const moreToggle = h(
    "button",
    { class: "text-sm text-brand-dark font-medium self-start flex items-center gap-1" },
    ["Дополнительные параметры", h("span", { html: icon("chevronRight", "w-4 h-4") })]
  );
  moreToggle.addEventListener("click", () => {
    showMore = !showMore;
    moreWrap.style.maxHeight = showMore ? "300px" : "0";
    moreWrap.style.opacity = showMore ? "1" : "0";
  });

  function submit() {
    if (!topic.trim()) {
      inputArea.classList.add("ring-2", "ring-red-300");
      inputArea.focus();
      return;
    }
    openMaterialPickerModal({
      onConfirm: (materialKeys) => {
        const project = createGeneratingProject({ topic, subject, grade, lang, goal, duration, textbook, materialKeys });
        navigate(`/generating/${project.id}`);
      },
    });
  }

  const card = h("div", { class: "card p-6 md:p-8 flex flex-col gap-5 max-w-3xl mx-auto" }, [
    h("div", {}, [
      h("h1", { class: "text-xl font-semibold text-ink tracking-tight" }, "AI Create"),
      h("p", { class: "text-sm text-muted mt-1" }, "Начните с темы, цели, текста или загруженного источника — уточнения не обязательны."),
    ]),
    tabsWrap,
    inputAreaWrap,
    h("div", { class: "flex flex-col gap-2" }, [h("p", { class: "text-xs font-medium text-muted" }, "Обязательные параметры"), requiredRow]),
    moreToggle,
    moreWrap,
    h("button", { class: "btn-primary self-center !px-8 !py-3 text-sm", onClick: submit }, [
      h("span", { html: icon("sparkles", "w-4 h-4") }),
      "Создать материалы",
    ]),
  ]);

  const content = h("div", { class: "flex-1 overflow-y-auto scrollbar-thin" }, [h("div", { class: "px-5 md:px-10 py-10" }, [card])]);

  mount(root, renderShell(content));
}
