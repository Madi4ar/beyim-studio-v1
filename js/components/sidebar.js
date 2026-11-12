// Left global navigation (spec sec. 5.1) + top bar with search/profile.

import { h, icon } from "../utils/dom.js";
import { t } from "../utils/i18n.js";
import { navigate, currentPath } from "../router.js";

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

export function renderSidebar() {
  const path = currentPath();
  const base = path.split("/")[1] || "";

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

  return h("aside", { class: "hidden md:flex w-20 shrink-0 chrome-surface border-r border-line flex-col items-center py-3 gap-1 h-screen sticky top-0 z-20" }, [
    h("nav", { class: "flex flex-col gap-1 w-full px-1.5" }, items),
  ]);
}

// Bottom tab bar shown on phones/tablets instead of the left rail.
export function renderMobileNav() {
  const path = currentPath();
  const base = path.split("/")[1] || "";

  const items = NAV_ITEMS.map((item) => {
    const itemBase = item.path.split("/")[1] || "";
    const active = itemBase === base;
    const el = h(
      "div",
      { class: `pressable flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[68px] shrink-0 text-[10px] font-medium ${active ? "text-brand" : "text-muted"}` },
      [h("span", { html: icon(item.icon, "w-5 h-5") }), h("span", { class: "whitespace-nowrap" }, t(item.key))]
    );
    el.addEventListener("click", () => navigate(item.path));
    return el;
  });

  return h("nav", { class: "md:hidden fixed bottom-0 inset-x-0 z-30 chrome-surface border-t border-line flex overflow-x-auto scrollbar-thin" }, items);
}
