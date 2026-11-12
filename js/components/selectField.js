// Icon-led dropdown field used for subject/grade/language pickers
// (home + AI Create) instead of plain chip rows.

import { h, icon, clear } from "../utils/dom.js";
import { spring, prefersReducedMotion } from "../utils/motion.js";

export function renderSelectField({ icon: iconName, label, value, options, onChange, columns = 1, allowCustom = false, customPlaceholder = "Свой вариант..." }) {
  let current = value;
  const reducedMotion = prefersReducedMotion();

  const TRIGGER_BASE =
    "pressable w-full flex items-center gap-3 border rounded-xl bg-white px-3.5 py-2.5 transition-all duration-150 text-left";
  const TRIGGER_IDLE = `${TRIGGER_BASE} border-line hover:border-brand/40 hover:shadow-card`;
  const TRIGGER_OPEN = `${TRIGGER_BASE} border-brand ring-4 ring-brand/10`;

  const valueText = h("span", { class: "block text-left text-[13.5px] font-semibold text-ink truncate leading-snug" }, current);
  const chevron = h("span", { class: "text-muted shrink-0 transition-transform duration-200", html: icon("chevronDown", "w-4 h-4") });

  const trigger = h("button", { type: "button", class: TRIGGER_IDLE }, [
    h("span", { class: "icon-tile", html: icon(iconName, "w-4 h-4") }),
    h("span", { class: "flex-1 min-w-0 text-left" }, [
      h("span", { class: "block text-left text-[11px] font-medium uppercase tracking-wide text-muted" }, label),
      valueText,
    ]),
    chevron,
  ]);

  // Anchored to its trigger (§7): the panel sits directly under it and
  // materializes by growing from that top edge, not fading in place.
  const panel = h("div", {
    class: "absolute z-20 left-0 right-0 mt-2 bg-white shadow-pop rounded-2xl p-2 hidden max-h-72 overflow-y-auto scrollbar-thin origin-top",
  });

  function renderOptions() {
    clear(panel);
    const list = h("div", { class: columns === 4 ? "grid grid-cols-4 gap-1.5" : "flex flex-col gap-0.5" });
    options.forEach((opt) => {
      const isActive = opt === current;
      const optBtn = h(
        "button",
        {
          type: "button",
          class: `pressable flex items-center ${columns === 4 ? "justify-center" : "justify-between"} gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
            isActive ? "bg-brand-soft text-brand-dark font-semibold" : "text-ink hover:bg-bg"
          }`,
        },
        columns === 4 ? opt : [h("span", {}, opt), isActive ? h("span", { class: "text-brand", html: icon("check", "w-3.5 h-3.5") }) : null]
      );
      optBtn.addEventListener("click", () => {
        current = opt;
        valueText.textContent = opt;
        onChange(opt);
        closePanel();
        renderOptions();
      });
      list.appendChild(optBtn);
    });
    panel.appendChild(list);

    if (allowCustom) {
      panel.appendChild(h("div", { class: "h-px bg-line my-1.5" }));
      const customInput = h("input", { class: "input !text-sm !py-2", placeholder: customPlaceholder });
      customInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && customInput.value.trim()) {
          current = customInput.value.trim();
          valueText.textContent = current;
          onChange(current);
          closePanel();
        }
      });
      customInput.addEventListener("click", (e) => e.stopPropagation());
      panel.appendChild(customInput);
    }
  }

  let panelSpring = null;
  let panelOpen = false;

  function setPanelStyle(v) {
    panel.style.opacity = String(v);
    panel.style.transform = `scaleY(${0.9 + 0.1 * v})`;
  }

  function onOutsideClick(e) {
    if (!wrap.contains(e.target)) closePanel();
  }
  function openPanel() {
    panelOpen = true;
    panel.classList.remove("hidden");
    trigger.className = TRIGGER_OPEN;
    chevron.style.transform = "rotate(180deg)";
    document.addEventListener("click", onOutsideClick, true);
    if (reducedMotion) {
      setPanelStyle(1);
      return;
    }
    panelSpring?.stop();
    // Starts from the panel's current on-screen opacity (0 the first time
    // it opens, or wherever a close was interrupted) rather than snapping.
    const from = panel.style.opacity ? Number(panel.style.opacity) : 0;
    setPanelStyle(from);
    panelSpring = spring({ from, to: 1, damping: 1, response: 0.28, onUpdate: setPanelStyle });
  }
  function closePanel() {
    panelOpen = false;
    trigger.className = TRIGGER_IDLE;
    chevron.style.transform = "";
    document.removeEventListener("click", onOutsideClick, true);
    if (reducedMotion) {
      panel.classList.add("hidden");
      return;
    }
    panelSpring?.stop();
    const from = panel.style.opacity ? Number(panel.style.opacity) : 1;
    panelSpring = spring({
      from,
      to: 0,
      damping: 1,
      response: 0.22,
      onUpdate: setPanelStyle,
      onSettle: () => {
        if (!panelOpen) panel.classList.add("hidden");
      },
    });
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!panelOpen) openPanel();
    else closePanel();
  });

  renderOptions();
  const wrap = h("div", { class: "relative" }, [trigger, panel]);
  return wrap;
}
