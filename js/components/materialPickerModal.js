// Modal shown after "Создать материалы": lets the teacher pick which
// materials to include in the package before generation starts (spec sec. 6:
// "Предлагает набор материалов → Учитель выбирает нужное → Генерация").
//
// Motion follows the apple-design skill: the sheet materializes in and
// dismisses back out along the same path (§7 spatial consistency), can be
// grabbed and thrown away by dragging its handle — tracking the pointer
// 1:1, resisting past its rest position with rubber-banding (§9), and
// handing the release velocity straight into the closing spring so there's
// no seam between the drag and the animation (§5, §6). Every spring reads
// the live on-screen value before retargeting, so grabbing it again
// mid-animation never causes a jump (§3 interruptibility).

import { h, icon } from "../utils/dom.js";
import { materialTypeList } from "../data/seed.js";
import { spring, project, rubberband, createVelocityTracker, prefersReducedMotion } from "../utils/motion.js";

const DISMISS_VELOCITY = 600; // px/s downward — fast flick always dismisses
const DISMISS_DISTANCE_RATIO = 0.3; // or dragged past 30% of the sheet's height

export function openMaterialPickerModal({ onConfirm }) {
  const items = materialTypeList();
  const selected = new Set();
  const reducedMotion = prefersReducedMotion();

  const overlay = h("div", { class: "fixed inset-0 z-50 flex items-center justify-center p-4" });
  overlay.style.background = "rgba(23,23,23,0)";

  const handle = h("div", {
    class: "self-center -mt-1.5 mb-1 h-1.5 w-10 rounded-full bg-ink/20 cursor-grab active:cursor-grabbing select-none",
    style: "touch-action: none;",
  });

  const rowsWrap = h("div", { class: "flex flex-col gap-1 max-h-[50vh] overflow-y-auto scrollbar-thin -mx-1 px-1" });

  function renderCount() {
    countLabel.textContent = selected.size > 0 ? `Выбрано: ${selected.size} из ${items.length}` : "Выберите хотя бы один материал";
    confirmBtn.disabled = selected.size === 0;
  }

  items.forEach((item) => {
    const checkbox = h("input", { type: "checkbox", class: "w-4 h-4 accent-[#18999D] rounded shrink-0 cursor-pointer" });
    const row = h(
      "label",
      { class: "flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg transition-colors cursor-pointer select-none" },
      [
        checkbox,
        h("span", { class: "icon-tile w-7 h-7 rounded-md", html: icon(item.icon, "w-3.5 h-3.5") }),
        h("span", { class: "text-sm font-medium text-ink flex-1" }, item.label),
      ]
    );
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selected.add(item.key);
      else selected.delete(item.key);
      renderCount();
    });
    rowsWrap.appendChild(row);
  });

  const countLabel = h("p", { class: "text-xs text-muted" });

  const selectAllBtn = h("button", { type: "button", class: "pressable text-xs text-brand-dark font-medium" }, "Выбрать все");
  selectAllBtn.addEventListener("click", () => {
    selected.clear();
    items.forEach((m) => selected.add(m.key));
    rowsWrap.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = true));
    renderCount();
  });
  const clearAllBtn = h("button", { type: "button", class: "pressable text-xs text-muted font-medium" }, "Снять все");
  clearAllBtn.addEventListener("click", () => {
    selected.clear();
    rowsWrap.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    renderCount();
  });

  const cancelBtn = h("button", { type: "button", class: "btn-secondary flex-1 whitespace-nowrap" }, "Отмена");
  cancelBtn.addEventListener("click", () => dismiss());

  const confirmBtn = h("button", { type: "button", class: "btn-primary flex-1 whitespace-nowrap" }, [
    h("span", { html: icon("sparkles", "w-4 h-4") }),
    "Создать",
  ]);
  confirmBtn.addEventListener("click", () => {
    if (selected.size === 0) return;
    const keys = items.filter((m) => selected.has(m.key)).map((m) => m.key);
    dismiss(() => onConfirm(keys));
  });

  const dialog = h("div", { class: "sheet-surface rounded-2xl w-full max-w-md p-6 pt-3 flex flex-col gap-4" }, [
    handle,
    h("div", {}, [
      h("h2", { class: "text-lg font-semibold text-ink tracking-tight" }, "Какие материалы создать?"),
      h("p", { class: "text-sm text-muted mt-1" }, "Отметьте, что нужно создать — лишнего AI генерировать не будет."),
    ]),
    h("div", { class: "flex items-center justify-between" }, [countLabel, h("div", { class: "flex items-center gap-3" }, [selectAllBtn, clearAllBtn])]),
    rowsWrap,
    h("div", { class: "flex items-center gap-3 pt-1" }, [cancelBtn, confirmBtn]),
  ]);

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  renderCount();

  // --- Presentation value: a single 0..1 "openness" that drives transform
  // + opacity on both layers. Every entry/exit/drag reads this live value
  // instead of a target, so nothing ever jumps when interrupted.
  const BASE_SCRIM = 0.4;
  let openness = 0;
  let dragOffset = 0; // px, independent of the spring — only nonzero mid-drag
  let sheetHeight = 0;
  let activeSpring = null;
  let activeDragMove = null; // the live pointermove handler while a drag is in progress

  function render() {
    const translateClosed = 24;
    const scale = 0.92 + 0.08 * openness;
    const translateY = (1 - openness) * translateClosed + dragOffset;
    dialog.style.transform = `translateY(${translateY}px) scale(${scale})`;
    dialog.style.opacity = String(Math.min(1, openness * 1.4));
    const dragFade = sheetHeight ? Math.max(0, 1 - Math.max(0, dragOffset) / sheetHeight) : 1;
    overlay.style.background = `rgba(23,23,23,${(BASE_SCRIM * openness * dragFade).toFixed(3)})`;
  }

  function animateOpenness(target, { velocity = 0, damping = 1, response = 0.4, onSettle } = {}) {
    activeSpring?.stop();
    activeSpring = spring({
      from: openness,
      to: target,
      velocity,
      damping,
      response,
      onUpdate: (v) => {
        openness = v;
        render();
      },
      onSettle,
    });
    return activeSpring;
  }

  function onKeydown(e) {
    if (e.key === "Escape") dismiss();
  }
  document.addEventListener("keydown", onKeydown);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) dismiss();
  });

  function dismiss(after) {
    document.removeEventListener("keydown", onKeydown);
    if (activeDragMove) {
      overlay.removeEventListener("pointermove", activeDragMove);
      activeDragMove = null;
    }
    if (reducedMotion) {
      overlay.remove();
      after?.();
      return;
    }
    // Leaves dragOffset untouched: a drag-initiated dismissal keeps driving
    // it from its own decay spring, and every other close path never
    // moved it from 0 in the first place.
    animateOpenness(0, { damping: 1, response: 0.3, onSettle: () => overlay.remove() });
    after?.();
  }

  if (reducedMotion) {
    dialog.classList.add("transition-opacity", "duration-150");
    openness = 1;
    render();
    dialog.style.opacity = "1";
  } else {
    render();
    requestAnimationFrame(() => animateOpenness(1, { damping: 1, response: 0.4 }));
  }

  // --- Drag-to-dismiss (§2 direct manipulation, §9 rubber-banding, §5/§6
  // velocity handoff + momentum projection). Only the handle starts a drag
  // so it never fights with scrolling the material list.
  if (!reducedMotion) {
    const tracker = createVelocityTracker();
    let dragging = false;
    let startY = 0;
    let startDragOffset = 0;

    function handleDragMove(e) {
      if (!dragging) return;
      const dy = e.clientY - startY;
      sheetHeight = dialog.getBoundingClientRect().height;
      // Dragging up past the rest position resists progressively instead
      // of letting the sheet overshoot above where it opened.
      dragOffset = dy < 0 ? rubberband(dy, sheetHeight) + startDragOffset : dy + startDragOffset;
      tracker.record(e.clientY);
      render();
    }

    handle.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      activeSpring?.stop();
      dragging = true;
      startY = e.clientY;
      startDragOffset = dragOffset;
      sheetHeight = dialog.getBoundingClientRect().height;
      tracker.reset();
      tracker.record(e.clientY);
      handle.setPointerCapture(e.pointerId);
      activeDragMove = handleDragMove;
      overlay.addEventListener("pointermove", handleDragMove);
    });

    handle.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      overlay.removeEventListener("pointermove", handleDragMove);
      activeDragMove = null;
      handle.releasePointerCapture(e.pointerId);

      const velocity = tracker.velocity(); // px/s, positive = moving down
      const projectedRest = dragOffset + project(velocity);
      const shouldDismiss = velocity > DISMISS_VELOCITY || projectedRest > sheetHeight * DISMISS_DISTANCE_RATIO;

      if (shouldDismiss) {
        dismiss();
        // dismiss() already starts an openness->0 spring; overlay the drag
        // offset decay on top so the finger's exact speed reads through
        // without a seam, instead of hard-cutting it to the fade-only path.
        const dragDecaySpring = spring({
          from: dragOffset,
          to: dragOffset + Math.max(velocity, 0) * 0.25,
          velocity,
          damping: 1,
          response: 0.3,
          onUpdate: (v) => {
            dragOffset = v;
            render();
          },
        });
        activeSpring = { stop: () => dragDecaySpring.stop() };
      } else {
        // Snap back to rest, still carrying the release velocity so the
        // bounce-back feels continuous with how fast it was pulled.
        activeSpring = spring({
          from: dragOffset,
          to: 0,
          velocity,
          damping: 0.9,
          response: 0.35,
          onUpdate: (v) => {
            dragOffset = v;
            render();
          },
        });
      }
    });
  }
}
