// Stage/progress visuals reused by generation screen, my-materials, dashboard.

import { h, icon } from "../utils/dom.js";

export function renderProgressBar(progress, cls = "") {
  return h("div", { class: `w-full h-2.5 rounded-full bg-brand-soft overflow-hidden ${cls}` }, [
    h("div", {
      class: "h-full bg-brand rounded-full transition-all duration-500",
      style: `width:${Math.max(2, progress)}%`,
    }),
  ]);
}

export function renderStageList(stages) {
  return h(
    "ul",
    { class: "flex flex-col gap-2.5" },
    stages.map((stage) => {
      const isDone = stage.status === "done";
      const isRunning = stage.status === "running";
      const iconName = isDone ? "check" : isRunning ? "dot" : "circle";
      const colorClass = isDone ? "text-brand" : isRunning ? "text-amber-500 animate-pulse-dot" : "text-muted/50";
      return h("li", { class: "flex items-center gap-2.5 text-sm" }, [
        h("span", { class: colorClass, html: icon(iconName, "w-4 h-4") }),
        h("span", { class: isDone ? "text-ink" : isRunning ? "text-ink font-medium" : "text-muted" }, stage.label),
      ]);
    })
  );
}
