// "Провести урок" — fullscreen lesson workspace (spec sec. 25, 29-31).

import { h, icon, mount, clear } from "../utils/dom.js";
import { getProjects } from "../data/store.js";
import { getClasses } from "../data/store.js";
import { navigate } from "../router.js";

const FLOW = [
  { time: "0–5", name: "Разминка" },
  { time: "5–12", name: "Объяснение" },
  { time: "12–22", name: "Работа в группах" },
  { time: "22–30", name: "Детектив текста" },
  { time: "30–38", name: "Quiz" },
  { time: "38–43", name: "Практика" },
  { time: "43–45", name: "Exit ticket" },
];

export function renderLessonMode(root) {
  const projects = getProjects().filter((p) => p.status === "ready");
  const classes = getClasses();
  const project = projects[0];

  let seconds = (project ? project.duration : 45) * 60;
  let running = false;
  let stepIndex = 0;

  const timerEl = h("span", { class: "text-3xl font-bold text-ink tabular-nums tracking-tight" }, formatTime(seconds));
  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }
  let interval = null;
  function toggleTimer() {
    running = !running;
    playBtn.innerHTML = icon(running ? "circle" : "play", "w-4 h-4");
    if (running) {
      interval = setInterval(() => {
        if (seconds > 0) seconds -= 1;
        timerEl.textContent = formatTime(seconds);
      }, 1000);
    } else {
      clearInterval(interval);
    }
  }
  const playBtn = h("button", { class: "btn-secondary !p-2.5", onClick: toggleTimer }, [h("span", { html: icon("play", "w-4 h-4") })]);

  const flowWrap = h("div", { class: "flex flex-col gap-1.5" });
  function renderFlow() {
    clear(flowWrap);
    FLOW.forEach((step, i) => {
      flowWrap.appendChild(
        h("div", { class: `flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${i === stepIndex ? "bg-brand-soft text-brand-dark font-medium" : "text-muted"}` }, [
          h("span", { class: "text-xs w-14 shrink-0" }, `${step.time} мин`),
          h("span", {}, step.name),
        ])
      );
    });
  }
  renderFlow();

  const randomStudentBtn = h("button", { class: "btn-secondary w-full justify-start" }, [h("span", { html: icon("dice", "w-4 h-4") }), "Случайный ученик"]);
  const studentNameEl = h("p", { class: "text-sm text-center text-ink font-medium hidden" });
  const cls = classes[0];
  randomStudentBtn.addEventListener("click", () => {
    if (!cls) return;
    const n = Math.floor(Math.random() * cls.size) + 1;
    studentNameEl.textContent = `Ученик №${n} (${cls.name})`;
    studentNameEl.classList.remove("hidden");
  });

  const groupsBtn = h("button", { class: "btn-secondary w-full justify-start" }, [h("span", { html: icon("users", "w-4 h-4") }), "Сформировать группы"]);
  const groupsResult = h("div", { class: "grid grid-cols-2 gap-1.5 hidden" });
  groupsBtn.addEventListener("click", () => {
    if (!cls) return;
    const groupCount = 4;
    clear(groupsResult);
    groupsResult.classList.remove("hidden");
    const ids = Array.from({ length: cls.size }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    for (let g = 0; g < groupCount; g++) {
      const members = ids.filter((_, i) => i % groupCount === g);
      groupsResult.appendChild(h("div", { class: "border border-line rounded-lg p-2 text-xs text-muted" }, [h("p", { class: "font-medium text-ink" }, `Группа ${g + 1}`), `№ ${members.join(", ")}`]));
    }
  });

  const qrCard = h("div", { class: "card p-4 flex flex-col items-center gap-2" }, [
    h("span", { class: "text-brand", html: icon("qr", "w-16 h-16") }),
    h("p", { class: "text-xs text-muted text-center" }, "Покажите QR ученикам для входа в Quiz"),
  ]);

  const scoreboard = h(
    "div",
    { class: "flex flex-col gap-1.5" },
    [
      { name: "Группа 1", score: 86 },
      { name: "Группа 2", score: 74 },
      { name: "Группа 3", score: 65 },
      { name: "Группа 4", score: 58 },
    ]
      .sort((a, b) => b.score - a.score)
      .map((row, i) =>
        h("div", { class: "flex items-center justify-between text-sm" }, [
          h("span", { class: "flex items-center gap-2" }, [i === 0 ? h("span", { html: icon("trophy", "w-4 h-4 text-amber-500") }) : h("span", { class: "w-4" }), row.name]),
          h("span", { class: "font-semibold text-ink" }, `${row.score}%`),
        ])
      )
  );

  const slideNumber = { current: 1, total: 9 };
  const slideEl = h("div", { class: "card flex-1 flex flex-col items-center justify-center gap-3 min-h-[320px] bg-gradient-to-br from-brand-soft to-white" }, [
    h("span", { class: "text-xs font-semibold text-brand-dark" }, `Слайд ${slideNumber.current} / ${slideNumber.total}`),
    h("p", { class: "text-2xl font-semibold text-ink tracking-tight text-center max-w-md" }, project ? project.topic : "Нет готовых уроков"),
  ]);
  const slideNav = h("div", { class: "flex items-center justify-center gap-3" }, [
    navBtn(-1),
    h("span", { class: "text-xs text-muted" }, "слайд"),
    navBtn(1),
  ]);
  function navBtn(dir) {
    const btn = h("button", { class: "btn-secondary !p-2" }, [h("span", { html: icon(dir < 0 ? "arrowLeft" : "chevronRight", "w-4 h-4") })]);
    btn.addEventListener("click", () => {
      slideNumber.current = Math.min(slideNumber.total, Math.max(1, slideNumber.current + dir));
      slideEl.firstChild.textContent = `Слайд ${slideNumber.current} / ${slideNumber.total}`;
    });
    return btn;
  }

  const header = h("div", { class: "flex items-center justify-between px-4 md:px-6 py-3 border-b border-line chrome-surface sticky top-0 z-10 gap-2" }, [
    h("button", { class: "btn-ghost !p-2 shrink-0", onClick: () => navigate("/materials") }, [h("span", { html: icon("x", "w-5 h-5") })]),
    h("p", { class: "flex-1 min-w-0 truncate text-center text-sm font-medium text-ink px-2" }, project ? project.topic : "Провести урок"),
    h("div", { class: "flex items-center gap-2 shrink-0" }, [h("span", { html: icon("timer", "w-4 h-4 text-muted") }), timerEl, playBtn]),
  ]);

  const main = h("div", { class: "flex-1 grid lg:grid-cols-[1fr_300px] gap-5 p-4 md:p-5 overflow-y-auto scrollbar-thin" }, [
    h("div", { class: "flex flex-col gap-4" }, [slideEl, slideNav]),
    h("div", { class: "flex flex-col gap-4" }, [
      h("div", { class: "card p-4" }, [h("p", { class: "text-xs font-medium text-muted mb-2" }, "AI Lesson Flow"), flowWrap]),
      h("div", { class: "card p-4 flex flex-col gap-2" }, [randomStudentBtn, studentNameEl]),
      h("div", { class: "card p-4 flex flex-col gap-2" }, [groupsBtn, groupsResult]),
      qrCard,
      h("div", { class: "card p-4 flex flex-col gap-2" }, [h("p", { class: "text-xs font-medium text-muted mb-1 flex items-center gap-1.5" }, [h("span", { html: icon("trophy", "w-3.5 h-3.5") }), "Scoreboard"]), scoreboard]),
    ]),
  ]);

  mount(root, h("div", { class: "flex flex-col h-screen bg-bg" }, [header, main]));
}
