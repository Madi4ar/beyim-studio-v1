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

function renderThemeToggle(labelClass = "", buttonClass = "theme-toggle nav-item") {
  const iconWrap = h("span");
  const label = h("span", { class: `${labelClass} text-center leading-tight`.trim() });
  const button = h("button", { type: "button", class: buttonClass, "aria-label": t("themeToggle") }, [iconWrap, label]);

  function refresh(theme = getTheme()) {
    const dark = theme === "dark";
    iconWrap.innerHTML = icon(dark ? "sun" : "moon", "w-5 h-5");
    label.textContent = dark ? t("themeLight") : t("themeDark");
    button.title = dark ? t("themeEnableLight") : t("themeEnableDark");
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

// Compact header + modal drawer shown on phones instead of the left rail.
export function renderMobileHeader() {
  const path = currentPath();
  const routeBase = path.split("/")[1] || "";
  const base = routeBase === "lesson" ? "teach" : routeBase;

  const menuButton = h("button", {
    type: "button",
    class: "mobile-menu-trigger pressable",
    "aria-label": t("navOpen"),
    "aria-expanded": "false",
    "aria-controls": "mobile-menu-panel",
    html: icon("menu", "w-6 h-6"),
  });
  const closeButton = h("button", {
    type: "button",
    class: "mobile-menu-close pressable",
    "aria-label": t("navClose"),
    html: icon("x", "w-5 h-5"),
  });

  const items = NAV_ITEMS.map((item) => {
    const itemBase = item.path.split("/")[1] || "";
    const active = itemBase === base;
    const el = h(
      "button",
      {
        type: "button",
        class: `mobile-menu-item pressable${active ? " is-active" : ""}`,
        "aria-current": active ? "page" : null,
      },
      [h("span", { class: "mobile-menu-item-icon", html: icon(item.icon, "w-5 h-5") }), h("span", {}, t(item.key))]
    );
    el.addEventListener("click", () => {
      closeMenu(false);
      navigate(item.path);
    });
    return el;
  });

  const panel = h("aside", {
    id: "mobile-menu-panel",
    class: "mobile-menu-panel",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": t("navPrimary"),
    tabindex: "-1",
  }, [
    h("div", { class: "mobile-menu-panel-header" }, [
      h("div", { class: "flex items-center gap-3 min-w-0" }, [
        h("img", { src: "./assets/beyim-studio-ai-mark.png", alt: "", class: "w-10 h-10 object-contain shrink-0" }),
        h("span", { class: "text-sm font-semibold text-ink truncate" }, t("appName")),
      ]),
      closeButton,
    ]),
    h("nav", { class: "mobile-menu-list", "aria-label": t("navPrimary") }, items),
    h("div", { class: "mobile-menu-footer" }, [renderThemeToggle("", "mobile-menu-item theme-toggle pressable")]),
  ]);
  const backdrop = h("button", { type: "button", class: "mobile-menu-backdrop", "aria-label": t("navClose") });
  const overlay = h("div", { class: "mobile-menu-overlay md:hidden fixed inset-0 z-40", "aria-hidden": "true" }, [backdrop, panel]);
  let previousBodyOverflow = "";

  function handleRouteChange() {
    closeMenu(false);
  }

  function handleViewportChange() {
    if (window.innerWidth >= 768) closeMenu(false);
  }

  function closeMenu(returnFocus = true) {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.style.overflow = previousBodyOverflow;
    window.removeEventListener("hashchange", handleRouteChange);
    window.removeEventListener("resize", handleViewportChange);
    if (returnFocus) menuButton.focus();
  }

  function openMenu() {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("resize", handleViewportChange);
    closeButton.focus();
  }

  menuButton.addEventListener("click", openMenu);
  closeButton.addEventListener("click", () => closeMenu());
  backdrop.addEventListener("click", () => closeMenu());
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(panel.querySelectorAll("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  const logoButton = h("button", { type: "button", class: "mobile-header-logo pressable", "aria-label": t("navHome") }, [
    h("img", { src: "./assets/beyim-studio-ai-mark.png", alt: "", class: "w-10 h-10 object-contain shrink-0" }),
    h("span", { class: "text-sm font-semibold text-ink truncate" }, t("appName")),
  ]);
  logoButton.addEventListener("click", () => navigate("/"));

  const header = h("header", { class: "mobile-app-header md:hidden fixed top-0 inset-x-0 z-30" }, [logoButton, menuButton]);
  return h("div", { class: "mobile-navigation md:hidden" }, [header, overlay]);
}
