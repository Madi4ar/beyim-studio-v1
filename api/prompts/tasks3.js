// Задания 3 уровней (differentiated 3-level tasks) prompt + strict JSON
// schema. Shape matches what editor.js's renderTasks3Body() and
// exportDocx.js's tasks3 section already render — this just makes the
// content real instead of generic placeholder tasks.

const LANG_NAME = { kz: "казахском", ru: "русском" };

export function buildTasks3Prompt({ topic, subject, grade, lang, textbook }) {
  const langName = LANG_NAME[lang] || "русском";
  const gradeNum = parseInt(grade, 10) || 7;

  const system = `Ты — опытный учитель, составляющий дифференцированные задания трёх уровней сложности по теме урока для школы в Казахстане (формативное оценивание, поддержка разных групп учеников).

Нужно подготовить РОВНО 3 уровня, в каждом — РОВНО 4 конкретных, решаемых задания (не абстрактные формулировки вроде "назови факт", а задания с конкретным содержанием по теме):
- "levelA" — поддерживающий уровень: простые задания на узнавание и воспроизведение факта/термина.
- "levelB" — основной уровень: задания на понимание и объяснение связи между фактами.
- "levelC" — продвинутый уровень: задания на анализ, сравнение, аргументацию или применение в новой ситуации.

Правила:
- Весь текст пиши на ${langName} языке, естественно, без пунктуационных ошибок (без двойных пробелов, без пробела перед знаком препинания).
- Каждое задание — самостоятельная, конкретная формулировка с привязкой к теме (не шаблон "Назови 2 факта по теме «X»", а реальный вопрос с конкретным содержанием).
- Задания внутри уровня не должны повторять друг друга по содержанию.
- Язык и сложность формулировок должны соответствовать ученику ${gradeNum} класса на каждом уровне.
- "label" для каждого уровня верни ровно такими: levelA.label = "Level A — поддерживающий", levelB.label = "Level B — основной", levelC.label = "Level C — продвинутый".
- Верни только данные по заданной схеме — никакого текста вне структуры.`;

  const user = `Тема урока: «${topic}»
Предмет: ${subject || "не указан — определи по теме"}
Класс: ${grade || "7"}
Учебник, по которому работает учитель: ${textbook && textbook.trim() ? textbook.trim() : "не указан — ориентируйся на типовую программу РК для этого класса и предмета"}${textbook && textbook.trim() ? "\nОпирайся на материал и терминологию этого учебника по теме." : ""}`;

  return { system, user };
}

function levelSchema() {
  return {
    type: "object",
    properties: {
      label: { type: "string" },
      tasks: { type: "array", items: { type: "string" } },
    },
    required: ["label", "tasks"],
    additionalProperties: false,
  };
}

export const TASKS3_JSON_SCHEMA = {
  name: "tasks3_levels",
  strict: true,
  schema: {
    type: "object",
    properties: {
      topic: { type: "string" },
      levelA: levelSchema(),
      levelB: levelSchema(),
      levelC: levelSchema(),
    },
    required: ["topic", "levelA", "levelB", "levelC"],
    additionalProperties: false,
  },
};
