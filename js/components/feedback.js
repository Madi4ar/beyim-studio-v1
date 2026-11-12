import { h, icon } from "../utils/dom.js";

const ICONS = {
  info: "info",
  success: "check",
  warning: "warn",
  error: "warn",
};

export function renderAlert({ tone = "info", title, message, actions = [] }) {
  const role = tone === "error" || tone === "warning" ? "alert" : "status";
  return h("div", { class: `feedback-alert feedback-alert-${tone}`, role }, [
    h("span", { class: "feedback-alert-icon", html: icon(ICONS[tone] || "info", "w-5 h-5") }),
    h("div", { class: "min-w-0 flex-1" }, [
      h("p", { class: "text-sm font-semibold" }, title),
      message ? h("p", { class: "text-[13px] mt-0.5 opacity-80" }, message) : null,
      actions.length ? h("div", { class: "flex flex-wrap gap-2 mt-3" }, actions) : null,
    ]),
  ]);
}

function toastRoot() {
  let root = document.getElementById("project-toast-root");
  if (!root) {
    root = h("div", {
      id: "project-toast-root",
      class: "project-toast-root",
      "aria-live": "polite",
      "aria-atomic": "false",
    });
    document.body.appendChild(root);
  }
  return root;
}

export function showToast({ tone = "info", title, message = "", duration = 3600 }) {
  const toast = h("div", { class: `project-toast project-toast-${tone}`, role: tone === "error" ? "alert" : "status" }, [
    h("span", { class: "project-toast-icon", html: icon(ICONS[tone] || "info", "w-4 h-4") }),
    h("div", { class: "min-w-0 flex-1" }, [
      h("p", { class: "text-[13px] font-semibold" }, title),
      message ? h("p", { class: "text-xs mt-0.5 opacity-75" }, message) : null,
    ]),
  ]);
  const close = h("button", { type: "button", class: "project-toast-close", "aria-label": "Закрыть уведомление" }, [
    h("span", { html: icon("x", "w-3.5 h-3.5") }),
  ]);
  toast.appendChild(close);

  let timer = null;
  const dismiss = () => {
    clearTimeout(timer);
    toast.classList.add("is-leaving");
    setTimeout(() => toast.remove(), 180);
  };
  close.addEventListener("click", dismiss);
  toastRoot().appendChild(toast);
  timer = setTimeout(dismiss, duration);
  return { dismiss };
}
