// Material card used on dashboard / my-materials / library grids (spec sec. 17).

import { h, icon } from "../utils/dom.js";
import { t } from "../utils/i18n.js";
import { navigate } from "../router.js";
import { buildMaterialContent } from "../data/mockContent.js";

const META = {
  ksp: { pages: "10 полей", unit: "" },
  presentation: { pages: null, unit: "слайдов", countPath: "slides" },
  worksheet: { pages: "4 раздела", unit: "" },
  tasks3: { pages: "3 уровня", unit: "" },
  quiz: { pages: null, unit: "вопросов", countPath: "questions" },
  reflection: { pages: "4 вопроса", unit: "" },
  homework: { pages: "3 задания", unit: "" },
  textDetective: { pages: "5 режимов", unit: "" },
  cards: { pages: null, unit: "карточек", countPath: "cards" },
};

function statusBadge(status) {
  if (status === "ready") {
    return h("span", { class: "inline-flex items-center gap-1 text-xs font-medium text-brand-dark bg-brand-soft px-2 py-1 rounded-full shrink-0 whitespace-nowrap" }, [
      h("span", { html: icon("check", "w-3.5 h-3.5") }),
      t("ready"),
    ]);
  }
  if (status === "running") {
    return h("span", { class: "inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full shrink-0 whitespace-nowrap" }, [
      h("span", { class: "w-2 h-2 rounded-full bg-amber-500 animate-pulse-dot" }),
      t("inProgress"),
    ]);
  }
  return h("span", { class: "inline-flex items-center gap-1 text-xs font-medium text-muted bg-bg px-2 py-1 rounded-full shrink-0 whitespace-nowrap" }, [
    h("span", { html: icon("circle", "w-3 h-3") }),
    "Ожидает",
  ]);
}

export function renderMaterialCard(project, material) {
  const meta = META[material.key] || {};
  const resolvedContent = material.content || (material.status === "ready" && project ? buildMaterialContent(material.key, project) : null);
  const contentList = meta.countPath && resolvedContent ? resolvedContent[meta.countPath] : null;
  const count = Array.isArray(contentList) ? contentList.length : null;
  const metaLine = meta.pages || (meta.unit ? (count != null ? `${count} ${meta.unit}` : `— ${meta.unit}`) : "");

  const body = h("div", { class: "flex items-center gap-3 min-w-0 flex-1" }, [
    h("div", { class: "icon-tile w-10 h-10 rounded-xl" }, [h("span", { html: icon(material.icon, "w-5 h-5") })]),
    h("div", { class: "min-w-0 flex-1" }, [
      h("p", { class: "font-semibold text-ink text-sm truncate" }, material.label),
      h("p", { class: "text-xs text-muted mt-0.5 truncate" }, metaLine),
    ]),
  ]);

  const card = h("div", { class: "card p-4 flex flex-col gap-3 hover:shadow-pop transition-shadow animate-fade-in" }, [
    h("div", { class: "flex flex-wrap items-start justify-between gap-2" }, [body, statusBadge(material.status)]),
    h("div", { class: "flex items-center justify-between pt-1" }, [
      h("span", { class: "text-xs text-muted" }, material.versions > 0 ? `v${material.versions}` : "—"),
      h(
        "button",
        {
          class: material.status === "ready" ? "btn-secondary !py-1.5 !px-3 text-xs" : "btn-ghost !py-1.5 !px-3 text-xs",
          disabled: material.status !== "ready" ? "disabled" : null,
          onClick: () => project && navigate(`/editor/${project.id}/${material.key}`),
        },
        material.status === "ready" ? t("open") : t("inProgress")
      ),
    ]),
  ]);
  return card;
}
