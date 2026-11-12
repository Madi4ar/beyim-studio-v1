// "Провести урок" pages copied from /Users/madiar/Desktop/new-proj.

import { h, icon, mount } from "../utils/dom.js";
import { sourcePage } from "../components/sourcePage.js";
import { renderShell } from "../components/shell.js";
import { getProjects, getProject, getClasses } from "../data/store.js";
import { navigate } from "../router.js";

const SLIDES = ["Тема урока", "Проблемный вопрос", "Ключевое понятие", "Пример", "Визуализация", "Групповая активность", "Проверка понимания", "Итог урока", "Рефлексия"];
const FLOW = [
  { time: "0–5", name: "Разминка" },
  { time: "5–12", name: "Объяснение" },
  { time: "12–22", name: "Работа в группах" },
  { time: "22–30", name: "Детектив текста" },
  { time: "30–38", name: "Quiz" },
  { time: "38–43", name: "Практика" },
  { time: "43–45", name: "Exit ticket" },
];

function toast(message, iconName = "check") {
  const node = h("div", { class: "fixed left-1/2 bottom-5 -translate-x-1/2 z-[100] bg-[#171717] text-white text-[13px] px-4 py-2 rounded-full shadow-xl flex items-center gap-2" }, [
    h("span", { html: icon(iconName, "w-4 h-4") }), message,
  ]);
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2100);
}

export function renderLessonSelect(root) {
  const ready = getProjects().filter((project) => project.status === "ready");
  let body;
  if (ready.length) {
    body = h("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 source-enter" }, ready.map((project) => {
      const start = h("button", { class: "source-btn source-btn-primary source-btn-sm mt-1" }, [h("span", { html: icon("play", "w-4 h-4") }), "Провести урок"]);
      start.addEventListener("click", () => navigate(`/teach/${project.id}`));
      return h("div", { class: "source-card source-card-hover p-5 flex flex-col gap-3" }, [
        h("div", { class: "font-medium text-[15px]" }, project.topic),
        h("div", { class: "text-[13px] source-soft" }, `${project.grade} класс, ${project.duration} минут`),
        start,
      ]);
    }));
  } else {
    body = h("div", { class: "source-enter flex flex-col items-center justify-center text-center py-14 px-6 border rounded-lg", style: "border-color:var(--source-border)" }, [
      h("span", { class: "w-11 h-11 rounded-full flex items-center justify-center mb-3 bg-white source-soft", html: icon("play", "w-5 h-5") }),
      h("div", { class: "font-medium text-[14.5px]" }, "Нет готовых уроков"),
      h("div", { class: "text-[13px] mt-1 source-soft" }, "Сначала создайте и доведите до готовности материалы урока."),
    ]);
  }
  mount(root, sourcePage({ title: "Провести урок", subtitle: "Выберите готовый урок, чтобы открыть режим проведения", body }));
}

export function renderLessonMode(root, params = {}) {
  const project = (params.id && getProject(params.id)) || getProjects().find((item) => item.status === "ready");
  if (!project) { navigate("/teach"); return; }

  let slideIndex = 0;
  let seconds = 0;
  let interval = null;
  let running = false;
  const classSize = getClasses()[0]?.size || 24;

  const mmss = () => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const timerText = h("span", { class: "tabular-nums text-xl font-bold text-ink tracking-tight" }, mmss());
  const timerButton = h("button", { class: "source-btn source-btn-secondary source-btn-sm !p-2" }, [h("span", { html: icon("play", "w-4 h-4") })]);
  timerButton.addEventListener("click", () => {
    running = !running;
    timerButton.innerHTML = icon(running ? "circle" : "play", "w-4 h-4");
    if (running) {
      interval = setInterval(() => {
        if (!timerText.isConnected) { clearInterval(interval); return; }
        seconds += 1;
        timerText.textContent = mmss();
      }, 1000);
    } else clearInterval(interval);
  });

  const slideTitle = h("span", { class: "text-[26px] font-semibold text-ink" }, SLIDES[0]);
  const slideCount = h("span", { class: "text-[13px] tabular-nums source-soft" }, `1 / ${SLIDES.length}`);
  const flowWrap = h("div", { class: "flex flex-col gap-1.5" });
  function renderFlow() {
    flowWrap.replaceChildren();
    FLOW.forEach((step, index) => {
      const active = index === slideIndex % FLOW.length;
      flowWrap.appendChild(h("div", { class: `flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${active ? "bg-brand-soft text-brand-dark font-medium" : "source-soft"}` }, [
        h("span", { class: "text-xs w-14 shrink-0 tabular-nums" }, `${step.time} мин`),
        h("span", {}, step.name),
      ]));
    });
  }
  renderFlow();
  function updateSlide() {
    slideTitle.textContent = SLIDES[slideIndex];
    slideCount.textContent = `${slideIndex + 1} / ${SLIDES.length}`;
    renderFlow();
  }
  const nav = (direction) => {
    const button = h("button", { class: "source-btn source-btn-secondary source-btn-sm !p-2.5" }, [h("span", { html: icon(direction < 0 ? "chevronLeft" : "chevronRight", "w-4 h-4") })]);
    button.addEventListener("click", () => { slideIndex = Math.max(0, Math.min(SLIDES.length - 1, slideIndex + direction)); updateSlide(); });
    return button;
  };

  const toolCard = (iconName, label, action) => {
    const button = h("button", { type: "button", class: "source-card source-card-hover p-3.5 flex items-center justify-between text-left" }, [
      h("span", { class: "flex items-center gap-2.5 text-[13.5px] text-ink" }, [h("span", { class: "source-brand", html: icon(iconName, "w-4 h-4") }), label]),
      h("span", { class: "text-[12px] source-soft" }, action),
    ]);
    button.addEventListener("click", () => {
      const messages = {
        shuffle: `Выбран ученик №${1 + Math.floor(Math.random() * classSize)}`,
        users: `Класс разделён на 4 группы (${classSize} учеников)`,
        qr: "QR-код показан на экране для учеников",
        quiz: "Live-сессия quiz запущена — ученики видят PIN на экране",
        trophy: "Scoreboard открыт",
      };
      toast(messages[iconName] || label, iconName);
    });
    return button;
  };

  const exit = h("button", { class: "source-btn source-btn-ghost source-btn-sm" }, [h("span", { html: icon("x", "w-4 h-4") }), "Завершить урок"]);
  exit.addEventListener("click", () => { clearInterval(interval); navigate(`/dashboard/${project.id}`); });

  const content = h("div", { class: "source-page flex-1 min-w-0 flex flex-col min-h-screen bg-[#f4f5f7]" }, [
    h("header", { class: "flex items-center justify-between px-4 md:px-6 py-3 border-b border-line chrome-surface sticky top-0 z-10 gap-2" }, [
      exit,
      h("div", { class: "text-[13px] source-soft truncate text-center" }, `${project.topic}, ${project.grade} класс`),
      h("div", { class: "flex items-center gap-2 shrink-0" }, [h("span", { class: "source-soft", html: icon("timer", "w-4 h-4") }), timerText, timerButton]),
    ]),
    h("div", { class: "flex-1 grid lg:grid-cols-[minmax(0,1fr)_300px] gap-5 p-4 md:p-5 overflow-y-auto source-scrollpane" }, [
      h("div", { class: "flex flex-col items-center justify-center gap-4 min-w-0" }, [
        h("div", { class: "source-card w-full max-w-2xl aspect-[16/9] min-h-[320px] flex items-center justify-center bg-gradient-to-br from-brand-soft to-white" }, [slideTitle]),
        h("div", { class: "flex items-center gap-3 mt-5" }, [nav(-1), slideCount, nav(1)]),
      ]),
      h("aside", { class: "flex flex-col gap-3" }, [
        h("div", { class: "source-card p-4" }, [
          h("p", { class: "text-xs font-medium source-soft mb-2 flex items-center gap-1.5" }, [h("span", { class: "source-brand", html: icon("sparkles", "w-3.5 h-3.5") }), "AI Lesson Flow"]),
          flowWrap,
        ]),
        toolCard("shuffle", "Случайный ученик", "Выбрать"),
        toolCard("users", "Группы", `${classSize} учеников, 4 группы`),
        toolCard("qr", "QR для учеников", "Показать QR"),
        toolCard("quiz", "Quiz", "Запустить live-сессию"),
        toolCard("trophy", "Scoreboard", "Открыть"),
      ]),
    ]),
  ]);

  mount(root, renderShell(content, { sourceReplica: true }));
}
