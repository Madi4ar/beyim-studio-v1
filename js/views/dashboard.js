// Lesson package dashboard shown after generation completes (spec sec. 16).

import { h, icon, mount, clear } from "../utils/dom.js";
import { renderShell } from "../components/shell.js";
import { renderMaterialCard } from "../components/materialCard.js";
import { getProject } from "../data/store.js";
import { exportProjectToDocx } from "../utils/exportDocx.js";
import { navigate } from "../router.js";

export function renderDashboard(root, { id }) {
  const project = getProject(id);
  if (!project) {
    navigate("/materials");
    return;
  }

  const readyCount = project.materials.filter((m) => m.status === "ready").length;

  const header = h("div", { class: "card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4" }, [
    h("div", {}, [
      h("div", { class: "flex items-center gap-2 text-xs text-muted mb-1" }, [
        h("button", { class: "flex items-center gap-1 hover:text-ink", onClick: () => navigate("/materials") }, [
          h("span", { html: icon("arrowLeft", "w-3.5 h-3.5") }),
          "Мои материалы",
        ]),
      ]),
      h("h1", { class: "text-2xl font-semibold text-ink" }, project.topic),
      h("p", { class: "text-sm text-muted mt-1" }, `${project.subject} · ${project.grade} класс · ${project.duration} минут`),
    ]),
    h("div", { class: "flex flex-wrap items-center gap-3" }, [
      project.goalMatch
        ? h("div", { class: "text-center" }, [
            h("p", { class: "text-2xl font-bold text-brand tracking-tight" }, `${project.goalMatch}%`),
            h("p", { class: "text-[11px] text-muted" }, "Соответствие цели"),
          ])
        : null,
      (() => {
        const exportBtn = h("button", { class: "btn-secondary" }, [h("span", { html: icon("download", "w-4 h-4") }), "Экспорт"]);
        exportBtn.addEventListener("click", async () => {
          exportBtn.disabled = true;
          exportBtn.textContent = "Экспортируем...";
          try {
            await exportProjectToDocx(project);
          } catch (err) {
            console.error("Export failed:", err);
            alert("Не удалось экспортировать документ. Попробуйте ещё раз.");
          } finally {
            exportBtn.disabled = false;
            clear(exportBtn);
            exportBtn.append(h("span", { html: icon("download", "w-4 h-4") }), "Экспорт");
          }
        });
        return exportBtn;
      })(),
      h("button", { class: "btn-primary", onClick: () => navigate(`/teach`) }, [h("span", { html: icon("play", "w-4 h-4") }), "Провести урок"]),
    ]),
  ]);

  const summary = h("p", { class: "text-sm text-brand-dark font-medium" }, [
    h("span", { class: "inline-block -mt-0.5 mr-1", html: icon("check", "w-4 h-4 inline") }),
    `Готово ${readyCount} материалов`,
  ]);

  const whyBtn = h(
    "button",
    { class: "text-xs text-brand-dark font-medium flex items-center gap-1" },
    ["Почему AI предложил этот набор?", h("span", { html: icon("chevronRight", "w-3.5 h-3.5") })]
  );
  const whyAnswer = h("p", { class: "text-sm text-muted card p-4 mt-2 hidden" },
    "Этот набор проверяет заявленную учебную цель через объяснение, практику, оценивание и рефлексию — каждый материал закрывает свой этап урока."
  );
  whyBtn.addEventListener("click", () => whyAnswer.classList.toggle("hidden"));

  const grid = h(
    "div",
    { class: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" },
    project.materials.map((m) => renderMaterialCard(project, m))
  );

  const content = h("div", { class: "flex-1 overflow-y-auto scrollbar-thin" }, [
    h("div", { class: "max-w-5xl mx-auto px-5 md:px-8 py-10 flex flex-col gap-6" }, [header, summary, whyBtn, whyAnswer, grid]),
  ]);

  mount(root, renderShell(content));
}
