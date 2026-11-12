// Material editor + AI panel (spec sec. 18-19): AI edits the current
// document in place and records a new version each time.

import { h, icon, mount, clear } from "../utils/dom.js";
import { renderShell } from "../components/shell.js";
import { getProject, upsertProject } from "../data/store.js";
import { buildMaterialContent } from "../data/mockContent.js";
import { exportMaterialToDocx } from "../utils/exportDocx.js";
import { navigate } from "../router.js";

const AI_COMMANDS = ["Сделай проще", "Сделай сложнее", "Добавь примеры", "Переведи на казахский", "Сделай для 5 класса", "Добавь групповое задание", "Сократи до 30 минут"];

function renderKSPBody(data) {
  const totalPoints = (data.assessmentCriteria || []).reduce((sum, c) => sum + (c.points || 0), 0);
  return h("div", { class: "flex flex-col gap-5" }, [
    field("Раздел", data.section),
    field("Тема урока", data.topic),
    field("Цель обучения (куррикулум)", data.curriculumGoalCode ? `${data.curriculumGoalCode} — ${data.curriculumGoal}` : data.curriculumGoal),
    listField("Цели урока", data.lessonObjectives),
    listField("Ценности", data.values),
    field("Межпредметные связи", data.crossCurricularLinks),
    field("ИКТ / интерактив в уроке", data.ictElement),
    h("div", {}, [
      h("p", { class: "text-xs font-medium text-muted mb-2" }, "Ход урока"),
      h(
        "div",
        { class: "flex flex-col gap-3" },
        data.stages.map((stage) =>
          h("div", { class: "bg-bg rounded-xl overflow-hidden" }, [
            h("div", { class: "flex items-center justify-between bg-brand-soft/60 px-3 py-2" }, [
              h("span", { class: "text-sm font-semibold text-brand-dark" }, stage.name),
              h("span", { class: "text-xs font-medium text-brand-dark" }, stage.time),
            ]),
            h(
              "div",
              { class: "flex flex-col divide-y divide-line" },
              stage.activities.map((a) =>
                h("div", { class: "p-3 flex flex-col gap-1.5" }, [
                  h("p", { class: "text-sm font-medium text-ink" }, a.title),
                  h("p", { class: "text-xs text-muted italic" }, a.teacherScript),
                  h("p", { class: "text-xs text-ink" }, [h("span", { class: "text-muted" }, "Ученики: "), a.studentActions]),
                  h("p", { class: "text-xs text-ink" }, [h("span", { class: "text-muted" }, "Оценивание: "), a.assessment]),
                  a.resources && a.resources.length
                    ? h("p", { class: "text-xs text-muted" }, `Ресурсы: ${a.resources.join(", ")}`)
                    : null,
                ])
              )
            ),
          ])
        )
      ),
    ]),
    h("div", {}, [
      h("p", { class: "text-xs font-medium text-muted mb-2" }, "Дифференциация"),
      h("div", { class: "grid sm:grid-cols-2 gap-2" }, [
        h("div", { class: "bg-bg rounded-xl p-3" }, [h("p", { class: "text-xs font-semibold text-ink mb-1" }, "Для учащихся с высоким уровнем освоения материала"), h("p", { class: "text-xs text-muted" }, data.differentiation.advanced)]),
        h("div", { class: "bg-bg rounded-xl p-3" }, [h("p", { class: "text-xs font-semibold text-ink mb-1" }, "Для испытывающих трудности"), h("p", { class: "text-xs text-muted" }, data.differentiation.struggling)]),
      ]),
      h("div", { class: "bg-bg rounded-xl p-3 mt-2" }, [
        h("p", { class: "text-xs font-semibold text-ink mb-2" }, "Для учеников с ООП (по категориям)"),
        h(
          "div",
          { class: "flex flex-col gap-1.5" },
          (data.differentiation.sen || []).map((s) =>
            h("p", { class: "text-xs text-muted" }, [h("span", { class: "text-ink font-medium" }, `${s.category}: `), s.support])
          )
        ),
      ]),
    ]),
    h("div", {}, [
      h("p", { class: "text-xs font-medium text-muted mb-2" }, `Критерии оценивания за урок (${totalPoints} баллов)`),
      h("div", { class: "bg-bg rounded-xl overflow-hidden" }, [
        h(
          "div",
          { class: "flex flex-col divide-y divide-line" },
          (data.assessmentCriteria || []).map((c) =>
            h("div", { class: "flex items-start justify-between gap-3 p-3" }, [
              h("div", {}, [h("p", { class: "text-sm font-medium text-ink" }, c.criterion), h("p", { class: "text-xs text-muted mt-0.5" }, c.descriptors)]),
              h("span", { class: "text-sm font-semibold text-brand shrink-0" }, `${c.points}`),
            ])
          )
        ),
      ]),
    ]),
    h("div", {}, [
      h("p", { class: "text-xs font-medium text-muted mb-2" }, "Готовые задания"),
      h(
        "div",
        { class: "grid sm:grid-cols-2 gap-2" },
        (data.printableTasks || []).map((t) =>
          h("div", { class: "bg-bg rounded-xl p-3" }, [
            h("p", { class: "text-sm font-medium text-ink" }, t.title),
            h("p", { class: "text-xs text-muted mt-0.5" }, t.goal),
            h("p", { class: "text-xs text-ink mt-1" }, t.instruction),
          ])
        )
      ),
    ]),
    listField("Чек-лист контроля качества", data.qualityChecklist),
  ]);
}

function field(label, value) {
  return h("div", {}, [h("p", { class: "text-xs font-medium text-muted mb-1" }, label), h("p", { class: "text-sm text-ink" }, value)]);
}
function listField(label, items) {
  return h("div", {}, [
    h("p", { class: "text-xs font-medium text-muted mb-1" }, label),
    h("ul", { class: "list-disc list-inside text-sm text-ink space-y-0.5" }, items.map((i) => h("li", {}, i))),
  ]);
}

function renderPresentationBody(data) {
  return h(
    "div",
    { class: "grid sm:grid-cols-2 gap-3" },
    data.slides.map((s) =>
      h("div", { class: "rounded-xl p-3 aspect-[4/3] flex flex-col justify-between bg-gradient-to-br from-brand-soft to-white" }, [
        h("span", { class: "text-[11px] font-semibold text-brand-dark" }, `Слайд ${s.index}`),
        h("p", { class: "text-sm font-semibold text-ink leading-snug" }, s.title),
        h("p", { class: "text-xs text-muted line-clamp-2" }, s.note),
      ])
    )
  );
}

function renderWorksheetBody(data) {
  const sectionBlock = (title, instruction, children) =>
    h("div", {}, [
      h("p", { class: "text-xs font-medium text-muted mb-1" }, title),
      h("p", { class: "text-xs text-ink italic mb-2" }, instruction),
      children,
    ]);

  return h("div", { class: "flex flex-col gap-5" }, [
    sectionBlock(
      "Соотнеси понятия",
      data.matching.instruction,
      h(
        "div",
        { class: "bg-bg rounded-xl overflow-hidden" },
        h(
          "div",
          { class: "flex flex-col divide-y divide-line" },
          data.matching.pairs.map((p) =>
            h("div", { class: "flex items-start gap-3 p-3 text-sm" }, [
              h("span", { class: "font-medium text-ink shrink-0" }, p.term),
              h("span", { class: "text-muted" }, "→"),
              h("span", { class: "text-ink" }, p.definition),
            ])
          )
        )
      )
    ),
    sectionBlock(
      "Заполни пропуски",
      data.fillIn.instruction,
      h(
        "div",
        { class: "flex flex-col gap-1.5" },
        data.fillIn.items.map((it, i) =>
          h("p", { class: "text-sm text-ink" }, [
            `${i + 1}. ${it.sentence} `,
            h("span", { class: "text-brand-dark font-medium" }, `(${it.answer})`),
          ])
        )
      )
    ),
    sectionBlock(
      "Таблица",
      data.table.instruction,
      h("div", { class: "bg-bg rounded-xl overflow-hidden" }, [
        h("div", { class: "grid grid-cols-2 bg-brand-soft/60 text-xs font-semibold text-brand-dark" }, [
          h("div", { class: "p-2 border-r border-line" }, data.table.columnA),
          h("div", { class: "p-2" }, data.table.columnB),
        ]),
        h(
          "div",
          { class: "flex flex-col divide-y divide-line" },
          data.table.rows.map((r) =>
            h("div", { class: "grid grid-cols-2 text-sm" }, [
              h("div", { class: "p-2 border-r border-line text-ink" }, r.a),
              h("div", { class: "p-2 text-ink" }, r.b),
            ])
          )
        ),
      ])
    ),
    sectionBlock(
      "Открытые вопросы",
      data.openQuestions.instruction,
      h(
        "div",
        { class: "flex flex-col gap-2" },
        data.openQuestions.items.map((q, i) =>
          h("div", { class: "bg-bg rounded-xl p-3" }, [
            h("p", { class: "text-sm font-medium text-ink" }, `${i + 1}. ${q.question}`),
            h("p", { class: "text-xs text-muted mt-1" }, [h("span", { class: "text-brand-dark font-medium" }, "Эталон: "), q.sampleAnswer]),
          ])
        )
      )
    ),
  ]);
}

function renderTasks3Body(data) {
  const levels = [data.levelA, data.levelB, data.levelC];
  return h(
    "div",
    { class: "grid sm:grid-cols-3 gap-3" },
    levels.map((lvl) =>
      h("div", { class: "bg-bg rounded-xl p-3" }, [
        h("p", { class: "text-sm font-semibold text-brand-dark mb-2" }, lvl.label),
        h("ul", { class: "list-disc list-inside text-xs text-ink space-y-1" }, lvl.tasks.map((t) => h("li", {}, t))),
      ])
    )
  );
}

function renderQuizBody(data) {
  return h("div", { class: "flex flex-col gap-3" }, [
    h("div", { class: "flex items-center gap-2 text-sm" }, [h("span", { class: "chip" }, `${data.questions.length} вопросов`)]),
    ...data.questions.map((q, i) =>
      h("div", { class: "bg-bg rounded-xl p-3" }, [
        h("p", { class: "text-sm font-medium text-ink" }, `${i + 1}. ${q.question}`),
        h("p", { class: "text-xs text-muted mt-1.5" }, [h("span", { class: "text-brand-dark font-medium" }, "Ответ: "), q.answer]),
      ])
    ),
  ]);
}

function renderGenericListBody(items) {
  return h("ul", { class: "list-disc list-inside text-sm text-ink space-y-1" }, items.map((i) => h("li", {}, typeof i === "string" ? i : JSON.stringify(i))));
}

function renderBody(key, data) {
  if (key === "ksp") return renderKSPBody(data);
  if (key === "presentation") return renderPresentationBody(data);
  if (key === "worksheet") return renderWorksheetBody(data);
  if (key === "tasks3") return renderTasks3Body(data);
  if (key === "quiz") return renderQuizBody(data);
  if (key === "reflection") return renderGenericListBody(data.prompts);
  if (key === "homework") return renderGenericListBody(data.tasks);
  if (key === "textDetective") return renderGenericListBody(data.modes);
  if (key === "cards")
    return h(
      "div",
      { class: "grid sm:grid-cols-3 gap-3" },
      data.cards.map((c) => h("div", { class: "bg-bg rounded-xl p-3 text-center" }, [h("p", { class: "text-sm font-semibold text-ink" }, c.front), h("p", { class: "text-xs text-muted mt-1" }, c.back)]))
    );
  return h("p", { class: "text-sm text-muted" }, "Нет данных");
}

export function renderEditor(root, { id, materialKey }) {
  const project = getProject(id);
  if (!project) {
    navigate("/materials");
    return;
  }
  const material = project.materials.find((m) => m.key === materialKey);
  if (!material) {
    navigate(`/dashboard/${id}`);
    return;
  }

  let content = material.content || buildMaterialContent(materialKey, project);
  let versions = [{ n: 1, note: "Исходная генерация" }];

  const bodyWrap = h("div", { class: "card p-6" });
  const versionList = h("div", { class: "flex flex-col gap-1.5" });
  const chatLog = h("div", { class: "flex flex-col gap-3 flex-1 min-h-[120px] max-h-60 md:max-h-none overflow-y-auto scrollbar-thin" });

  function renderVersions() {
    clear(versionList);
    versions.forEach((v, i) => {
      const isLast = i === versions.length - 1;
      const row = h("div", { class: `flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 ${isLast ? "bg-brand-soft text-brand-dark font-medium" : "text-muted hover:bg-bg cursor-pointer"}` }, [
        h("span", {}, `Version ${v.n}`),
        h("span", { class: "truncate max-w-[110px]" }, v.note),
      ]);
      if (!isLast) {
        row.addEventListener("click", () => {
          versions = versions.slice(0, i + 1);
          renderVersions();
          logAI(`Вернулись к Version ${v.n}.`);
        });
      }
      versionList.appendChild(row);
    });
  }

  function logAI(text, isUser = false) {
    chatLog.appendChild(
      h("div", { class: `text-sm rounded-xl px-3 py-2 max-w-[90%] ${isUser ? "self-end bg-brand text-white" : "self-start bg-bg text-ink border border-line"}` }, text)
    );
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function applyCommand(cmdText) {
    logAI(cmdText, true);
    const thinking = h("div", { class: "self-start text-xs text-muted flex items-center gap-1.5" }, [
      h("span", { class: "w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot" }),
      "AI редактирует документ...",
    ]);
    chatLog.appendChild(thinking);
    chatLog.scrollTop = chatLog.scrollHeight;

    setTimeout(() => {
      thinking.remove();
      versions.push({ n: versions.length + 1, note: cmdText });
      material.versions = versions.length;
      upsertProject(project);
      renderVersions();
      logAI(`Готово. Применено: «${cmdText}». Создана Version ${versions.length}.`);
    }, 1100);
  }

  const header = h("div", { class: "flex flex-wrap items-center justify-between gap-y-2" }, [
    h("div", { class: "flex items-center gap-3" }, [
      h("button", { class: "btn-ghost !p-2", onClick: () => navigate(`/dashboard/${id}`) }, [h("span", { html: icon("arrowLeft", "w-5 h-5") })]),
      h("div", {}, [
        h("p", { class: "text-xs text-muted" }, material.label),
        h("h1", { class: "text-lg font-semibold text-ink tracking-tight" }, project.topic),
      ]),
    ]),
    h("div", { class: "flex items-center gap-2" }, [
      h("span", { class: "text-xs text-muted flex items-center gap-1" }, [h("span", { html: icon("check", "w-3.5 h-3.5 text-brand") }), "Сохранено"]),
      (() => {
        const exportBtn = h("button", { class: "btn-secondary !py-1.5 !px-3 text-xs" }, [h("span", { html: icon("download", "w-3.5 h-3.5") }), "Экспорт"]);
        exportBtn.addEventListener("click", async () => {
          exportBtn.disabled = true;
          exportBtn.textContent = "Экспортируем...";
          try {
            await exportMaterialToDocx(project, material, content);
          } catch (err) {
            console.error("Export failed:", err);
            alert("Не удалось экспортировать документ. Попробуйте ещё раз.");
          } finally {
            exportBtn.disabled = false;
            clear(exportBtn);
            exportBtn.append(h("span", { html: icon("download", "w-3.5 h-3.5") }), "Экспорт");
          }
        });
        return exportBtn;
      })(),
    ]),
  ]);

  bodyWrap.appendChild(renderBody(materialKey, content));

  const versionsPanel = h("div", { class: "card p-4" }, [h("p", { class: "text-xs font-medium text-muted mb-2" }, "Версии"), versionList]);
  renderVersions();

  const aiPanel = h("aside", { class: "w-full md:w-80 md:shrink-0 bg-white border-t md:border-t-0 md:border-l border-line p-4 flex flex-col gap-3 md:h-screen md:sticky md:top-0" }, [
    h("p", { class: "text-sm font-semibold text-ink flex items-center gap-1.5" }, [h("span", { html: icon("wand", "w-4 h-4 text-brand") }), "AI-редактор"]),
    chatLog,
    h(
      "div",
      { class: "flex flex-wrap gap-1.5" },
      AI_COMMANDS.map((c) => {
        const chip = h("span", { class: "chip !text-[11px]" }, c);
        chip.addEventListener("click", () => applyCommand(c));
        return chip;
      })
    ),
    (() => {
      const input = h("input", { class: "input !pl-10 !text-sm", placeholder: "Сделай проще, переведи на казахский..." });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && input.value.trim()) {
          applyCommand(input.value.trim());
          input.value = "";
        }
      });
      return h("div", { class: "relative" }, [
        h("span", { class: "absolute left-3.5 top-1/2 -translate-y-1/2 text-brand pointer-events-none", html: icon("wand", "w-4 h-4") }),
        input,
      ]);
    })(),
  ]);

  const main = h("div", { class: "flex-1 overflow-y-auto scrollbar-thin" }, [
    h("div", { class: "max-w-3xl mx-auto px-5 md:px-6 py-6 md:py-8 flex flex-col gap-5" }, [header, versionsPanel, bodyWrap]),
  ]);

  const columns = h("div", { class: "flex flex-col md:flex-row flex-1 min-h-0" }, [main, aiPanel]);

  mount(root, renderShell(columns));
}
