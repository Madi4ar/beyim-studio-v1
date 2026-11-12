import { h } from "../utils/dom.js";

/**
 * Decorative, local ambient light for the home AI composer.
 * The masked container stays fixed while its internal color fields drift.
 */
export function AmbientGradient() {
  return h(
    "div",
    {
      class: "ambient-gradient",
      "aria-hidden": "true",
    },
    [
      h("div", { class: "ambient-gradient__blob ambient-gradient__blob--teal" }),
      h("div", { class: "ambient-gradient__blob ambient-gradient__blob--blue" }),
      h("div", { class: "ambient-gradient__blob ambient-gradient__blob--violet" }),
    ]
  );
}
