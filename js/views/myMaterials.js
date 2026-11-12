// "Мои материалы" (spec sec. 15-16): all projects, ready or generating.

import { h, icon, mount } from "../utils/dom.js";
import { renderShell } from "../components/shell.js";
import { renderProjectCard } from "../components/projectCard.js";
import { getProjects } from "../data/store.js";
import { navigate } from "../router.js";

export function renderMyMaterials(root) {
  const projects = getProjects();

  const header = h("div", { class: "flex items-center justify-between" }, [
    h("h1", { class: "text-2xl font-semibold text-ink tracking-tight" }, "Мои материалы"),
    h("button", { class: "btn-primary", onClick: () => navigate("/create") }, [h("span", { html: icon("plus", "w-4 h-4") }), "Новый проект"]),
  ]);

  const grid = projects.length
    ? h("div", { class: "grid md:grid-cols-2 lg:grid-cols-3 gap-4" }, projects.map(renderProjectCard))
    : h("div", { class: "card p-10 text-center text-muted" }, "Пока нет проектов. Начните с AI Create.");

  const content = h("div", { class: "flex-1 overflow-y-auto scrollbar-thin" }, [
    h("div", { class: "max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col gap-6" }, [header, grid]),
  ]);

  mount(root, renderShell(content));
}
