// Tiny hash-based router/SPA shell.

const routes = new Map();
let notFoundHandler = () => {};

export function registerRoute(pattern, handler) {
  routes.set(pattern, handler);
}

export function setNotFound(handler) {
  notFoundHandler = handler;
}

function matchRoute(path) {
  for (const [pattern, handler] of routes.entries()) {
    const paramNames = [];
    const regexStr = pattern.replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });
    const match = path.match(new RegExp(`^${regexStr}$`));
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => (params[name] = decodeURIComponent(match[i + 1])));
      return { handler, params };
    }
  }
  return null;
}

export function navigate(path) {
  window.location.hash = path;
}

export function currentPath() {
  const hash = window.location.hash || "#/";
  return hash.slice(1) || "/";
}

export function startRouter() {
  const render = () => {
    const path = currentPath();
    const matched = matchRoute(path);
    if (matched) matched.handler(matched.params);
    else notFoundHandler();
  };
  window.addEventListener("hashchange", render);
  render();
}
