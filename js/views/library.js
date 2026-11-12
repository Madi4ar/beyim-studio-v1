// Library (spec sec. 37): saved materials with filters by subject/grade/type/language.

import { h, icon, mount, clear } from "../utils/dom.js";
import { renderShell } from "../components/shell.js";
import { getProjects } from "../data/store.js";
import { renderMaterialCard } from "../components/materialCard.js";
import { navigate } from "../router.js";

export function renderLibrary(root) {
  const projects = getProjects().filter((p) => p.status === "ready");
  let filterSubject = "Все";
  let filterGrade = "Все";

  const subjects = ["Все", ...new Set(projects.map((p) => p.subject))];
  const grades = ["Все", ...new Set(projects.map((p) => p.grade))];

  const resultsWrap = h("div", { class: "flex flex-col gap-8" });

  function renderResults() {
    clear(resultsWrap);
    const filtered = projects.filter((p) => (filterSubject === "Все" || p.subject === filterSubject) && (filterGrade === "Все" || p.grade === filterGrade));
    if (!filtered.length) {
      resultsWrap.appendChild(h("div", { class: "card p-10 text-center text-muted" }, "Ничего не найдено по заданным фильтрам."));
      return;
    }
    filtered.forEach((project) => {
      resultsWrap.appendChild(
        h("div", { class: "flex flex-col gap-3" }, [
          h("div", { class: "flex items-center justify-between" }, [
            h("div", {}, [
              h("p", { class: "font-semibold text-ink" }, project.topic),
              h("p", { class: "text-xs text-muted" }, `${project.subject} · ${project.grade} класс`),
            ]),
            h("button", { class: "text-xs text-brand-dark font-medium", onClick: () => navigate(`/dashboard/${project.id}`) }, "Открыть проект →"),
          ]),
          h("div", { class: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3" }, project.materials.slice(0, 4).map((m) => renderMaterialCard(project, m))),
        ])
      );
    });
  }

  function chipRow(options, selected, onPick) {
    const wrap = h("div", { class: "flex flex-wrap gap-2" });
    options.forEach((opt) => {
      const el = h("span", { class: opt === selected ? "chip-active" : "chip" }, opt);
      el.addEventListener("click", () => {
        onPick(opt);
        Array.from(wrap.children).forEach((c) => (c.className = c.textContent === opt ? "chip-active" : "chip"));
        renderResults();
      });
      wrap.appendChild(el);
    });
    return wrap;
  }

  const filtersCard = h("div", { class: "card p-4 flex flex-col md:flex-row gap-4" }, [
    h("div", { class: "flex-1" }, [h("p", { class: "text-xs text-muted mb-1.5" }, "Предмет"), chipRow(subjects, filterSubject, (v) => (filterSubject = v))]),
    h("div", { class: "flex-1" }, [h("p", { class: "text-xs text-muted mb-1.5" }, "Класс"), chipRow(grades, filterGrade, (v) => (filterGrade = v))]),
  ]);

  renderResults();

  const content = h("div", { class: "flex-1 overflow-y-auto scrollbar-thin" }, [
    h("div", { class: "max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col gap-6" }, [
      h("h1", { class: "text-2xl font-semibold text-ink tracking-tight" }, "Библиотека"),
      filtersCard,
      resultsWrap,
    ]),
  ]);

  mount(root, renderShell(content));
}
