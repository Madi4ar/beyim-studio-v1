const THEME_KEY = "beyim_theme";

function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getTheme() {
  return document.documentElement.dataset.theme || systemTheme();
}

export function setTheme(theme, { persist = true } = {}) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#06161D" : "#0D7377");
  if (persist) localStorage.setItem(THEME_KEY, next);
  window.dispatchEvent(new CustomEvent("beyim:themechange", { detail: { theme: next } }));
  return next;
}

export function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  return setTheme(stored === "dark" || stored === "light" ? stored : systemTheme(), { persist: Boolean(stored) });
}

export function toggleTheme() {
  return setTheme(getTheme() === "dark" ? "light" : "dark");
}
