// Left global navigation (spec sec. 5.1) + top bar with search/profile.

import { h, icon } from "../utils/dom.js";
import { t } from "../utils/i18n.js";
import { navigate, currentPath } from "../router.js";
import { getTheme, toggleTheme } from "../utils/theme.js";

const NAV_ITEMS = [
  { path: "/", icon: "home2", key: "navHome" },
  { path: "/create", icon: "sparkles", key: "navCreate" },
  { path: "/materials", icon: "folder", key: "navMaterials" },
  { path: "/templates", icon: "layout", key: "navTemplates" },
  { path: "/library", icon: "library", key: "navLibrary" },
  { path: "/teach", icon: "play", key: "navTeach" },
  { path: "/analytics", icon: "chart", key: "navAnalytics" },
  { path: "/settings", icon: "settings", key: "navSettings" },
];

function renderThemeToggle(labelClass = "") {
  const iconWrap = h("span");
  const label = h("span", { class: `${labelClass} text-center leading-tight`.trim() });
  const button = h("button", { type: "button", class: "theme-toggle nav-item", "aria-label": "Переключить цветовую тему" }, [iconWrap, label]);

  function refresh(theme = getTheme()) {
    const dark = theme === "dark";
    iconWrap.innerHTML = icon(dark ? "sun" : "moon", "w-5 h-5");
    label.textContent = dark ? "Light" : "Dark";
    button.title = dark ? "Включить светлую тему" : "Включить тёмную тему";
    button.setAttribute("aria-pressed", String(dark));
  }

  button.addEventListener("click", () => refresh(toggleTheme()));
  refresh();
  return button;
}

export function renderSidebar(options = {}) {
  const path = currentPath();
  const base = path.split("/")[1] || "";

  if (options.sourceReplica) {
    const sourceItems = [
      { path: "/", icon: "home2", label: "Главная" },
      { path: "/create", icon: "sparkles", label: "AI Create" },
      { path: "/materials", icon: "folder", label: "Материалы" },
      { path: "/templates", icon: "layout", label: "Шаблоны" },
      { path: "/library", icon: "library", label: "Библиотека" },
      { path: "/teach", icon: "play", label: "Урок" },
      { path: "/analytics", icon: "chart", label: "Аналитика" },
      { path: "/settings", icon: "settings", label: "Настройки" },
    ].map((item) => {
      const active = (item.path.split("/")[1] || "") === base;
      const node = h("div", { class: active ? "nav-item-active" : "nav-item", title: item.label }, [
        h("span", { html: icon(item.icon, "w-5 h-5") }),
        h("span", { class: "source-nav-label text-center leading-tight" }, item.label),
      ]);
      node.addEventListener("click", () => navigate(item.path));
      return node;
    });
    const profile = h("div", { class: "nav-item", title: "Мадияр Шаширбеков" }, [
      h("div", { class: "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium bg-brand-soft text-brand-dark" }, "МШ"),
    ]);
    profile.addEventListener("click", () => navigate("/settings"));
    const sourceLogo = h("button", { type: "button", class: "mb-6 rounded-2xl pressable", "aria-label": "На главную" }, [
      h("img", { src: "./assets/beyim-studio-ai-mark.png", alt: "", class: "w-12 h-12 block object-contain" }),
    ]);
    sourceLogo.addEventListener("click", () => navigate("/"));
    return h("aside", { class: "app-sidebar source-sidebar hidden md:flex shrink-0 flex-col items-center h-screen sticky top-0 z-20" }, [
      sourceLogo,
      h("nav", { class: "flex flex-col gap-1 flex-1" }, sourceItems),
      renderThemeToggle("source-nav-label"),
      profile,
    ]);
  }

  const items = NAV_ITEMS.map((item) => {
    const itemBase = item.path.split("/")[1] || "";
    const active = itemBase === base;
    const el = h("div", { class: active ? "nav-item-active" : "nav-item", title: t(item.key) }, [
      h("span", { html: icon(item.icon, "w-5 h-5") }),
      h("span", { class: "text-center leading-tight" }, t(item.key)),
    ]);
    el.addEventListener("click", () => navigate(item.path));
    return el;
  });

  const logo = h("button", { type: "button", class: "mb-2 rounded-2xl pressable", "aria-label": "На главную" }, [
    h("img", { src: "./assets/beyim-studio-ai-mark.png", alt: "", class: "w-12 h-12 block object-contain" }),
  ]);
  logo.addEventListener("click", () => navigate("/"));

  return h("aside", { class: "app-sidebar hidden md:flex w-20 shrink-0 chrome-surface flex-col items-center py-3 gap-1 h-screen sticky top-0 z-20" }, [
    logo,
    h("nav", { class: "flex flex-col gap-1 w-full px-1.5" }, items),
    renderThemeToggle(),
  ]);
}

// Bottom tab bar shown on phones/tablets instead of the left rail.
export function renderMobileNav() {
  const path = currentPath();
  const routeBase = path.split("/")[1] || "";
  const base = routeBase === "lesson" ? "teach" : routeBase;
  let activeItem = null;

  const items = NAV_ITEMS.map((item) => {
    const itemBase = item.path.split("/")[1] || "";
    const active = itemBase === base;
    const el = h(
      "button",
      {
        type: "button",
        class: `pressable flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[68px] min-h-[52px] shrink-0 text-[10px] font-medium ${active ? "text-brand" : "text-muted"}`,
        "aria-current": active ? "page" : null,
        "aria-label": t(item.key),
      },
      [h("span", { html: icon(item.icon, "w-5 h-5") }), h("span", { class: "whitespace-nowrap" }, t(item.key))]
    );
    if (active) activeItem = el;
    el.addEventListener("click", () => navigate(item.path));
    return el;
  });

  const nav = h("nav", {
    class: "mobile-bottom-nav md:hidden fixed bottom-0 inset-x-0 z-30 chrome-surface flex overflow-x-auto scrollbar-thin",
    "aria-label": t("navPrimary"),
  }, items);
  if (window.matchMedia("(max-width: 767px)").matches) {
    requestAnimationFrame(() => activeItem?.scrollIntoView({ block: "nearest", inline: "center" }));
  }
  return nav;
}
