import { h, icon } from "../utils/dom.js";
import { renderShell } from "./shell.js";

export function sourceAutosaveBadge() {
  return h("div", { class: "flex items-center gap-1.5 text-[12.5px] source-soft" }, [
    h("span", { html: icon("check", "w-3.5 h-3.5") }),
    h("span", {}, "Сохранено"),
  ]);
}

export function sourcePage({ title, subtitle = "", actions = null, body, wide = false }) {
  const header = h("header", { class: "source-header flex items-center justify-between gap-4 px-8 py-5" }, [
    h("div", { class: "min-w-0" }, [
      h("h1", { class: "text-[20px] font-semibold tracking-[-0.01em] truncate" }, title),
      subtitle ? h("p", { class: "text-[13px] mt-0.5 source-soft" }, subtitle) : null,
    ]),
    h("div", { class: "flex items-center gap-2 flex-shrink-0" }, actions ? [actions] : []),
  ]);

  const content = h("div", { class: "source-page flex-1 min-w-0 flex flex-col" }, [
    header,
    h("div", { class: "flex-1 overflow-y-auto source-scrollpane" }, [
      h("div", { class: `${wide ? "max-w-[1440px]" : "max-w-[1080px]"} mx-auto px-8 py-8 w-full` }, [body]),
    ]),
  ]);

  return renderShell(content, { sourceReplica: true });
}

export function sourceSelect({ name, label, options, selected }) {
  const select = h("select", { name, class: "source-select w-full pl-3 pr-10 py-2 text-[14px] bg-white appearance-none cursor-pointer" });
  options.forEach((option) => {
    select.appendChild(h("option", { value: String(option), selected: String(option) === String(selected) ? "selected" : null }, String(option)));
  });
  return h("label", { class: "block" }, [
    h("span", { class: "block text-[12.5px] mb-1.5 source-soft" }, label),
    h("span", { class: "relative block" }, [
      select,
      h("span", {
        class: "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 source-soft",
        html: icon("chevronDown", "w-4 h-4"),
      }),
    ]),
  ]);
}
