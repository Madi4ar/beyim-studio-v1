// "Материалы" (spec sec. 15-16): all projects, ready or generating.

import { h, icon, mount } from "../utils/dom.js";
import { sourcePage } from "../components/sourcePage.js";
import { renderProjectCard } from "../components/projectCard.js";
import { getProjects } from "../data/store.js";
import { navigate } from "../router.js";
import { renderAlert } from "../components/feedback.js";

export function renderMyMaterials(root) {
  const projects = getProjects();
  const generatingProjects = projects.filter((project) => project.status === "generating");

  const newProject = h("button", { class: "source-btn source-btn-primary source-btn-sm", onClick: () => navigate("/create") }, [
    h("span", { html: icon("plus", "w-4 h-4") }),
    "Новый проект",
  ]);

  const grid = projects.length
    ? h("div", { class: "grid md:grid-cols-2 lg:grid-cols-3 gap-4" }, projects.map(renderProjectCard))
    : h("div", { class: "card p-10 text-center text-muted" }, "Пока нет проектов. Начните с AI Create.");

  const generationAlert = generatingProjects.length
    ? renderAlert({
        tone: "info",
        title: "Материалы продолжают создаваться",
        message: `${generatingProjects.length} проект(а) активно готовятся в фоне. Можно открыть прогресс и уже готовые части.`,
        actions: [
          h("button", { class: "source-btn source-btn-secondary source-btn-sm", onClick: () => navigate(`/generating/${generatingProjects[0].id}`) }, "Посмотреть прогресс"),
        ],
      })
    : null;

  mount(root, sourcePage({
    title: "Материалы",
    subtitle: "Все созданные проекты и материалы",
    actions: newProject,
    body: h("div", { class: "source-enter flex flex-col gap-5" }, [generationAlert, grid]),
  }));
}
