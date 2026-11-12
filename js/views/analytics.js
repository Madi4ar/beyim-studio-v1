// Analytics (spec sec. 45-47): teacher usage stats + per-lesson results.

import { h, mount } from "../utils/dom.js";
import { sourcePage } from "../components/sourcePage.js";
import { getProjects } from "../data/store.js";
import { createGeneratingProject } from "../data/generationEngine.js";
import { navigate } from "../router.js";

export function renderAnalytics(root) {
  const projects = getProjects();
  const readyProjects = projects.filter((p) => p.status === "ready");

  const stats = [
    { label: "Создано материалов", value: readyProjects.reduce((acc, p) => acc + p.materials.filter((m) => m.status === "ready").length, 0) },
    { label: "Проведено уроков", value: Math.max(1, readyProjects.length - 1) },
    { label: "Использовано Quiz", value: readyProjects.length },
    { label: "Средний результат", value: "78%" },
  ];

  const statsGrid = h(
    "div",
    { class: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4" },
    stats.map((s) => h("div", { class: "card p-5" }, [h("p", { class: "text-2xl font-bold text-brand" }, String(s.value)), h("p", { class: "text-xs text-muted mt-1" }, s.label)]))
  );

  const lessonTopic = readyProjects[0]?.topic || "Казахское ханство";
  const weakQuestions = [
    { n: 4, score: 43 },
    { n: 7, score: 52 },
  ];

  const lessonCard = h("div", { class: "card p-6 flex flex-col gap-4" }, [
    h("div", { class: "flex items-center justify-between" }, [
      h("div", {}, [h("p", { class: "text-sm text-muted" }, "Тема"), h("p", { class: "font-semibold text-ink text-lg" }, lessonTopic)]),
      h("div", { class: "text-right" }, [h("p", { class: "text-2xl font-bold text-brand tracking-tight" }, "81%"), h("p", { class: "text-xs text-muted" }, "Средний результат")]),
    ]),
    h("p", { class: "text-sm text-muted" }, "24 ученика"),
    h("div", {}, [
      h("p", { class: "text-xs font-medium text-muted mb-2" }, "Сложные вопросы"),
      h(
        "div",
        { class: "flex gap-3" },
        weakQuestions.map((q) => h("span", { class: "chip" }, `№${q.n} — ${q.score}%`))
      ),
    ]),
    h("div", { class: "card p-4 bg-brand-soft/40 border-brand/10 flex items-center justify-between gap-3" }, [
      h("p", { class: "text-sm text-ink" }, "Рекомендуется повторить причины образования Казахского ханства."),
      h(
        "button",
        {
          class: "btn-primary !py-1.5 !px-3 text-xs shrink-0",
          onClick: () => {
            const project = createGeneratingProject({ topic: `Повторение: ${lessonTopic}`, subject: "История Казахстана", grade: "7", lang: "ru" });
            navigate(`/generating/${project.id}`);
          },
        },
        "Создать материал для повторения"
      ),
    ]),
  ]);

  mount(root, sourcePage({
    title: "Аналитика",
    subtitle: "Результаты по созданным материалам и проведённым урокам",
    body: h("div", { class: "source-enter flex flex-col gap-6" }, [
      statsGrid,
      h("p", { class: "text-sm font-medium text-muted" }, "Аналитика последнего урока"),
      lessonCard,
    ]),
  }));
}
