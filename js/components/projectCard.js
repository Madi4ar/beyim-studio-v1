// Project ("lesson package") summary card for home/recent + my-materials grids.

import { h, icon } from "../utils/dom.js";
import { renderProgressBar } from "./progress.js";
import { navigate } from "../router.js";

const LANG_LABEL = { ru: "Русский", kz: "Қазақша" };

export function renderProjectCard(project) {
  const readyCount = project.materials.filter((m) => m.status === "ready").length;
  const dateStr = new Date(project.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });

  const header = h("div", { class: "flex items-start justify-between gap-2" }, [
    h("div", {}, [
      h("p", { class: "font-semibold text-ink leading-tight" }, project.topic),
      h("p", { class: "text-xs text-muted mt-1" }, `${project.subject} · ${project.grade} класс · ${LANG_LABEL[project.lang] || project.lang}`),
    ]),
    h("span", { class: "text-xs text-muted shrink-0" }, dateStr),
  ]);

  const footer =
    project.status === "ready"
      ? h("div", { class: "flex items-center justify-between pt-2" }, [
          h("span", { class: "inline-flex items-center gap-1 text-xs text-brand-dark font-medium" }, [
            h("span", { html: icon("check", "w-3.5 h-3.5") }),
            `Готово ${readyCount} материалов`,
          ]),
          h("button", { class: "btn-secondary !py-1.5 !px-3 text-xs", onClick: () => navigate(`/dashboard/${project.id}`) }, "Открыть"),
        ])
      : h("div", { class: "flex flex-col gap-1.5 pt-2" }, [
          renderProgressBar(project.progress),
          h("div", { class: "flex items-center justify-between" }, [
            h("span", { class: "text-xs text-muted" }, `Генерация: ${project.progress}%`),
            h("button", { class: "btn-ghost !py-1 !px-2 text-xs", onClick: () => navigate(`/generating/${project.id}`) }, "Смотреть"),
          ]),
        ]);

  return h("div", { class: "card p-4 flex flex-col gap-1 hover:shadow-pop transition-shadow cursor-pointer animate-fade-in" }, [header, footer]);
}
