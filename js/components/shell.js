// Shared page shell: desktop left rail + mobile bottom tab bar, used by
// every "simple" view (sidebar + single content column).

import { h } from "../utils/dom.js";
import { renderSidebar, renderMobileNav } from "./sidebar.js";

export function renderShell(content) {
  return h("div", { class: "flex flex-col md:flex-row min-h-screen bg-bg" }, [
    renderSidebar(),
    h("div", { class: "flex-1 flex flex-col min-w-0 pb-16 md:pb-0" }, [content]),
    renderMobileNav(),
  ]);
}
