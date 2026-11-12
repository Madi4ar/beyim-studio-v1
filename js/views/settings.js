// Settings (spec sec. 24, 41): teacher profile + adaptive classroom profiles.
// Class composition is visible only to the teacher (no public student labels).

import { h, icon, mount } from "../utils/dom.js";
import { renderShell } from "../components/shell.js";
import { getProfile, saveProfile, getClasses } from "../data/store.js";
import { setLang, getLang } from "../utils/i18n.js";

export function renderSettings(root) {
  const profile = getProfile();
  const classes = getClasses();

  const nameInput = h("input", { class: "input", value: profile.name });
  nameInput.addEventListener("change", (e) => {
    profile.name = e.target.value;
    saveProfile(profile);
  });

  const styleSelect = h(
    "select",
    { class: "input" },
    ["Академический", "Простой", "Для школьника", "Методический"].map((s) => h("option", { value: s, selected: s === profile.style ? "selected" : null }, s))
  );
  styleSelect.addEventListener("change", (e) => {
    profile.style = e.target.value;
    saveProfile(profile);
  });

  const langSelect = h(
    "select",
    { class: "input" },
    [h("option", { value: "ru", selected: getLang() === "ru" ? "selected" : null }, "Русский"), h("option", { value: "kz", selected: getLang() === "kz" ? "selected" : null }, "Қазақша")]
  );
  langSelect.addEventListener("change", (e) => {
    setLang(e.target.value);
    location.reload();
  });

  const profileCard = h("div", { class: "card p-6 flex flex-col gap-4" }, [
    h("p", { class: "font-semibold text-ink" }, "Учительский профиль"),
    h("div", { class: "grid sm:grid-cols-2 gap-4" }, [
      h("div", {}, [h("p", { class: "text-xs text-muted mb-1.5" }, "Имя"), nameInput]),
      h("div", {}, [h("p", { class: "text-xs text-muted mb-1.5" }, "Интерфейс"), langSelect]),
      h("div", {}, [h("p", { class: "text-xs text-muted mb-1.5" }, "Стиль подачи материала"), styleSelect]),
      h("div", {}, [h("p", { class: "text-xs text-muted mb-1.5" }, "Предметы"), h("p", { class: "text-sm text-ink pt-2" }, profile.subjects.join(", "))]),
    ]),
    h("div", {}, [
      h("p", { class: "text-xs text-muted mb-1.5" }, "Любимые форматы"),
      h("div", { class: "flex flex-wrap gap-2" }, profile.favoriteFormats.map((f) => h("span", { class: "chip" }, f))),
    ]),
  ]);

  const classesCard = h("div", { class: "card p-6 flex flex-col gap-4" }, [
    h("div", { class: "flex items-center justify-between" }, [
      h("p", { class: "font-semibold text-ink" }, "Профили классов (Adaptive classroom)"),
      h("p", { class: "text-xs text-muted" }, "Видно только вам"),
    ]),
    h(
      "div",
      { class: "grid sm:grid-cols-2 gap-4" },
      classes.map((c) =>
        h("div", { class: "bg-bg rounded-xl p-4 flex flex-col gap-2" }, [
          h("p", { class: "font-semibold text-ink" }, c.name),
          h("p", { class: "text-xs text-muted" }, `${c.size} учеников · ${c.subject}`),
          h("div", { class: "flex items-center gap-3 text-xs" }, [
            h("span", { class: "text-brand-dark" }, `${c.strong} сильных`),
            h("span", { class: "text-ink" }, `${c.medium} средних`),
            h("span", { class: "text-amber-700" }, `${c.support} требуют поддержки`),
          ]),
        ])
      )
    ),
  ]);

  const content = h("div", { class: "flex-1 overflow-y-auto scrollbar-thin" }, [
    h("div", { class: "max-w-4xl mx-auto px-5 md:px-8 py-10 flex flex-col gap-6" }, [
      h("h1", { class: "text-2xl font-semibold text-ink tracking-tight" }, "Настройки"),
      profileCard,
      classesCard,
    ]),
  ]);

  mount(root, renderShell(content));
}
