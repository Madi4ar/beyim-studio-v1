// Settings page copied from /Users/madiar/Desktop/new-proj.

import { h, mount } from "../utils/dom.js";
import { sourcePage, sourceSelect } from "../components/sourcePage.js";
import { getProfile, saveProfile, getClasses } from "../data/store.js";
import { setLang } from "../utils/i18n.js";

export function renderSettings(root) {
  const profile = getProfile();
  const classProfile = getClasses()[0] || { name: "7А", strong: 6, medium: 13, support: 5 };
  const displayName = profile.name === "Мадияр" ? "Мадияр Шаширбеков" : profile.name;

  const nameField = sourceSelect({ name: "name", label: "Имя", options: [displayName], selected: displayName });
  const subjectsField = sourceSelect({ name: "subjects", label: "Предметы", options: profile.subjects, selected: profile.subjects[0] });
  const langField = sourceSelect({ name: "language", label: "Язык интерфейса", options: ["Қазақша", "Русский"], selected: "Қазақша" });
  const styleField = sourceSelect({ name: "stylePref", label: "Предпочитаемый стиль", options: ["Академический", "Простой", "Для школьника", "Методический"], selected: profile.style || "Методический" });

  styleField.querySelector("select").addEventListener("change", (event) => {
    profile.style = event.target.value;
    saveProfile(profile);
  });
  langField.querySelector("select").addEventListener("change", (event) => {
    setLang(event.target.value === "Қазақша" ? "kz" : "ru");
  });

  const metric = (value, label) => h("div", { class: "source-card py-3 text-center" }, [
    h("div", { class: "text-[18px] font-semibold tabular-nums" }, String(value)),
    h("div", { class: "text-[12px] source-soft" }, label),
  ]);

  const body = h("div", { class: "source-enter flex flex-col gap-5" }, [
    h("div", { class: "source-card p-5" }, [
      h("div", { class: "text-[13.5px] font-medium mb-3" }, "Профиль учителя"),
      h("div", { class: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, [nameField, subjectsField, langField, styleField]),
    ]),
    h("div", { class: "source-card p-5" }, [
      h("div", { class: "text-[13.5px] font-medium mb-3" }, `Профиль класса «${classProfile.name}»`),
      h("p", { class: "text-[12.5px] mb-3 source-soft" }, "Эти данные видите только вы — используются для автоматической дифференциации."),
      h("div", { class: "grid grid-cols-3 gap-3 text-center" }, [
        metric(classProfile.strong, "сильных"), metric(classProfile.medium, "средних"), metric(classProfile.support, "нужна поддержка"),
      ]),
    ]),
  ]);

  mount(root, sourcePage({ title: "Настройки", subtitle: "Профиль, предпочтения и класс", body }));
}
