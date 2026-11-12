// Fluid-interface motion primitives (WWDC "Designing Fluid Interfaces",
// translated for the DOM). Springs here are described with Apple's two
// designer-facing params instead of raw physics:
//   damping  — 1.0 = critically damped (no bounce), <1.0 = overshoots.
//   response — seconds to reach the target; NOT a fixed duration, the
//              settle time emerges from the params.
// Every spring is interruptible: retarget() reads the live value/velocity
// and keeps going from there, so nothing ever jumps.

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function springConstants(damping, response, mass = 1) {
  const stiffness = ((2 * Math.PI) / response) ** 2 * mass;
  const dampingCoef = (4 * Math.PI * damping * mass) / response;
  return { stiffness, dampingCoef };
}

/**
 * Drives `onUpdate(value, velocity)` every frame from `from` toward `to`,
 * starting at `velocity`, until the spring settles (then `onSettle` fires).
 * Returns a handle with `retarget()` (redirect mid-flight, optionally
 * blending in a new velocity — e.g. a gesture's release speed — rather than
 * cutting it to zero) and `stop()`.
 */
export function spring({ from, to, velocity = 0, damping = 1, response = 0.4, onUpdate, onSettle }) {
  let value = from;
  let v = velocity;
  let target = to;
  let { stiffness, dampingCoef } = springConstants(damping, response);
  let raf = null;
  let lastTime = null;

  function step(now) {
    if (lastTime === null) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 1 / 30);
    lastTime = now;

    const subSteps = 4;
    const sub = dt / subSteps;
    for (let i = 0; i < subSteps; i++) {
      const force = -stiffness * (value - target) - dampingCoef * v;
      v += force * sub;
      value += v * sub;
    }

    const settled = Math.abs(value - target) < 0.01 && Math.abs(v) < 0.01;
    if (settled) {
      value = target;
      v = 0;
      onUpdate(value, v);
      raf = null;
      onSettle?.();
      return;
    }
    onUpdate(value, v);
    raf = requestAnimationFrame(step);
  }

  function run() {
    lastTime = null;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  }
  run();

  return {
    retarget(newTarget, opts = {}) {
      target = newTarget;
      if (opts.damping != null || opts.response != null) {
        damping = opts.damping ?? damping;
        response = opts.response ?? response;
        ({ stiffness, dampingCoef } = springConstants(damping, response));
      }
      if (opts.velocity != null) v = opts.velocity; // blend, never hard-cut
      if (!raf) run();
    },
    stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    },
    get value() {
      return value;
    },
    get velocity() {
      return v;
    },
  };
}

// Apple's momentum-projection formula (Designing Fluid Interfaces sample
// code): where a flick "comes to rest" if left to decelerate naturally.
// decelerationRate ~0.998 reads like a normal scroll; ~0.99 feels snappier.
export function project(velocity, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

// Progressive resistance at a boundary: the further past it, the less the
// drag follows — real things slow down before they stop, instead of
// freezing dead at the edge.
export function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

// Keeps a short position/time history so a gesture's release velocity
// (px/s) can be read the instant the pointer lifts.
export function createVelocityTracker() {
  let history = [];
  return {
    record(pos) {
      const now = performance.now();
      history.push({ pos, t: now });
      history = history.filter((p) => now - p.t < 100);
    },
    velocity() {
      if (history.length < 2) return 0;
      const first = history[0];
      const last = history[history.length - 1];
      const dt = (last.t - first.t) / 1000;
      return dt > 0 ? (last.pos - first.pos) / dt : 0;
    },
    reset() {
      history = [];
    },
  };
}
