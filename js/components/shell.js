// Shared page shell: desktop left rail + mobile bottom tab bar, used by
// every "simple" view (sidebar + single content column).

import { h } from "../utils/dom.js";
import { renderSidebar, renderMobileNav } from "./sidebar.js";

export function renderShell(content, options = {}) {
  const replicaClass = options.sourceReplica ? " source-replica-shell" : "";
  const contentClass = "app-shell-content flex-1 flex flex-col min-w-0";
  return h("div", { class: `flex flex-col md:flex-row min-h-screen bg-bg${replicaClass}` }, [
    renderSidebar(options),
    h("div", { class: contentClass }, [content]),
    renderMobileNav(),
  ]);
}
