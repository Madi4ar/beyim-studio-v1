// Home screen (spec sec. 6): "Что вы хотите подготовить к уроку?"

import { h, icon, mount } from "../utils/dom.js";
import { renderShell } from "../components/shell.js";
import { renderProjectCard } from "../components/projectCard.js";
import { renderSelectField } from "../components/selectField.js";
import { openMaterialPickerModal } from "../components/materialPickerModal.js";
import { getProjects } from "../data/store.js";
import { createGeneratingProject } from "../data/generationEngine.js";
import { SUBJECTS, GRADES } from "../data/curriculum.js";
import { navigate } from "../router.js";

// Types the headline out character by character, each letter fading in with
// a natural, slightly varying cadence, finished off by a blinking caret.
function renderTypewriterHeading(text, speed = 78) {
  const textEl = h("span", {});
  const caret = h("span", { class: "inline-block w-[3px] md:w-[4px] h-[0.85em] bg-brand ml-1 align-middle animate-caret-blink" });
  const heading = h("h1", { class: "text-display text-3xl md:text-5xl font-semibold text-ink max-w-2xl" }, [textEl, caret]);

  // Each word gets its own inline-block wrapper so the browser only ever
  // breaks the line at a space, never between two letters of one word.
  const words = text.split(" ");
  let wordIndex = 0;
  let charIndex = 0;
  let wordWrapper = null;

  function tick() {
    if (wordIndex >= words.length) return;
    const word = words[wordIndex];

    if (charIndex === 0) {
      wordWrapper = h("span", { class: "inline-block" });
      textEl.appendChild(wordWrapper);
    }

    if (charIndex < word.length) {
      wordWrapper.appendChild(h("span", { class: "inline-block animate-char-fade-in" }, word[charIndex]));
      charIndex++;
    } else {
      wordIndex++;
      charIndex = 0;
      if (wordIndex < words.length) textEl.appendChild(document.createTextNode(" "));
    }

    const jitter = Math.random() * 40 - 10;
    setTimeout(tick, speed + jitter);
  }
  tick();

  return heading;
}

const QUICK_ACTIONS = [
  { label: "Создать КСП", icon: "clipboard" },
  { label: "Создать презентацию", icon: "presentation" },
  { label: "Создать задания", icon: "layers" },
  { label: "Создать тест", icon: "quiz" },
  { label: "Создать рабочий лист", icon: "doc" },
  { label: "Создать игру", icon: "dice" },
  { label: "Адаптировать текст", icon: "wand" },
  { label: "Создать рефлексию", icon: "cards" },
];

export function renderHome(root) {
  const projects = getProjects().slice(0, 6);

  let topic = "";
  let subject = "История Казахстана";
  let grade = "7";
  let lang = "kz";

  const topicInput = h("textarea", {
    class: "input !pl-12 !py-5 !text-base min-h-[120px] resize-none",
    placeholder: "Введите тему, учебную цель или вставьте текст...",
    oninput: (e) => (topic = e.target.value),
  });
  const topicInputWrap = h("div", { class: "relative" }, [
    h("span", { class: "absolute left-4 top-5 text-brand pointer-events-none", html: icon("sparkles", "w-5 h-5") }),
    topicInput,
  ]);

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
    value: "Қазақша",
    options: ["Қазақша", "Русский"],
    onChange: (v) => (lang = v === "Қазақша" ? "kz" : "ru"),
  });

  function submit() {
    if (!topic.trim()) {
      topicInput.classList.add("ring-2", "ring-red-300");
      topicInput.focus();
      return;
    }
    openMaterialPickerModal({
      onConfirm: (materialKeys) => {
        const project = createGeneratingProject({ topic, subject, grade, lang, goal: "", duration: 45, materialKeys });
        navigate(`/generating/${project.id}`);
      },
    });
  }

  const heroCard = h("div", { class: "home-prompt-card sheet-surface w-full rounded-2xl p-6 md:p-8 flex flex-col gap-5" }, [
      topicInputWrap,
      h("div", { class: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, [subjectField, gradeField, langField]),
      h(
        "button",
        { class: "btn-primary w-full md:w-auto md:self-center !px-8 !py-3 text-sm", onClick: submit },
        [h("span", { html: icon("sparkles", "w-4 h-4") }), "Создать материалы"]
      ),
  ]);

  const hero = h("section", { class: "home-lovable-hero relative isolate overflow-hidden px-5 py-16 flex items-center justify-center text-center" }, [
    h("div", { class: "relative z-10 w-full max-w-3xl flex flex-col items-center gap-8 md:gap-10" }, [
      renderTypewriterHeading("Что будем создавать сегодня?"),
      heroCard,
    ]),
    h("div", { class: "absolute z-10 bottom-5 left-1/2 -translate-x-1/2 text-[11px] font-medium text-ink/55 flex flex-col items-center gap-1.5", "aria-hidden": "true" }, [
      h("span", {}, "Быстрые действия ниже"),
      h("span", { html: icon("chevronDown", "w-4 h-4") }),
    ]),
  ]);

  const quickActions = h("div", { class: "flex flex-col gap-3" }, [
    h("p", { class: "text-sm font-medium text-muted" }, "Быстрые действия"),
    h(
      "div",
      { class: "grid grid-cols-2 md:grid-cols-4 gap-3" },
      QUICK_ACTIONS.map((qa) =>
        h(
          "button",
          { class: "pressable card p-4 flex flex-col items-center gap-2.5 text-center hover:shadow-pop transition-shadow", onClick: () => navigate("/create") },
          [h("span", { class: "icon-tile w-11 h-11 rounded-xl", html: icon(qa.icon, "w-5 h-5") }), h("span", { class: "text-xs font-medium text-ink" }, qa.label)]
        )
      )
    ),
  ]);

  const recent = h("div", { class: "flex flex-col gap-3" }, [
    h("div", { class: "flex items-center justify-between" }, [
      h("p", { class: "text-sm font-medium text-muted" }, "Последние материалы"),
      h("button", { class: "text-xs text-brand-dark font-medium", onClick: () => navigate("/materials") }, "Смотреть все →"),
    ]),
    projects.length
      ? h("div", { class: "grid md:grid-cols-3 gap-4" }, projects.map(renderProjectCard))
      : h("p", { class: "text-sm text-muted" }, "Пока нет материалов — создайте первый урок выше."),
  ]);

  const content = h("div", { class: "flex-1 overflow-y-auto scrollbar-thin bg-bg" }, [
    hero,
    h("div", { class: "max-w-4xl mx-auto px-5 md:px-8 py-12 flex flex-col gap-10" }, [quickActions, recent]),
  ]);

  // Keep the home composition unique, but use the same 84px navigation rail
  // as every other menu route so horizontal positions never jump on navigation.
  mount(root, renderShell(content, { sourceReplica: true }));
}
