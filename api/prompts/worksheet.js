// Рабочий лист (worksheet) prompt + strict JSON schema. The previous mock
// shape only had section titles and item *counts*, no actual exercise
// content — this schema carries real, printable content for every section.
// editor.js's renderWorksheetBody() and exportDocx.js's worksheet section
// both render exactly this structure.

const LANG_NAME = { kz: "казахском", ru: "русском" };

export function buildWorksheetPrompt({ topic, subject, grade, lang, duration, textbook }) {
  const langName = LANG_NAME[lang] || "русском";
  const gradeNum = parseInt(grade, 10) || 7;

  const system = `Ты — опытный учитель, составляющий печатный рабочий лист (worksheet) для самостоятельной работы учеников на уроке в школе Казахстана.

Рабочий лист должен содержать РЕАЛЬНЫЙ, готовый к печати контент — не заголовки разделов, а сами задания с правильными ответами для учителя.

Структура (всегда все 4 блока):
1. "matching" — 5 пар "термин → определение" по теме урока (term короткий, definition — 1 предложение).
2. "fillIn" — 6 предложений с пропуском (пропуск обозначай как "_____" внутри "sentence"), плюс правильное слово/фраза в "answer".
3. "table" — таблица на 4 строки с двумя смысловыми колонками по теме (например "Причина"/"Следствие", "Понятие"/"Пример", "До"/"После" — выбери уместные по теме названия колонок columnA/columnB), с заполненными правильными значениями в каждой строке.
4. "openQuestions" — 2 открытых вопроса на понимание/применение темы, каждый с кратким эталонным ответом в "sampleAnswer" (для учителя, не для печати ученику).

Правила:
- Весь текст пиши на ${langName} языке, естественно, без пунктуационных ошибок (без двойных пробелов, без пробела перед знаком препинания).
- Контент должен быть понятен и решаем учеником ${gradeNum} класса, без терминов выше уровня класса.
- Не повторяй один и тот же факт в разных блоках — покрывай разные части темы.
- Каждый "instruction" — короткая инструкция ученику простыми словами ("Соедини понятие с определением" и т.п.).
- Верни только данные по заданной схеме — никакого текста вне структуры.`;

  const user = `Тема урока: «${topic}»
Предмет: ${subject || "не указан — определи по теме"}
Класс: ${grade || "7"}
Учебник, по которому работает учитель: ${textbook && textbook.trim() ? textbook.trim() : "не указан — ориентируйся на типовую программу РК для этого класса и предмета"}${textbook && textbook.trim() ? "\nИспользуй терминологию и примеры в стиле этого учебника." : ""}`;

  return { system, user };
}

export const WORKSHEET_JSON_SCHEMA = {
  name: "worksheet",
  strict: true,
  schema: {
    type: "object",
    properties: {
      topic: { type: "string" },
      matching: {
        type: "object",
        properties: {
          instruction: { type: "string" },
          pairs: {
            type: "array",
            items: {
              type: "object",
              properties: { term: { type: "string" }, definition: { type: "string" } },
              required: ["term", "definition"],
              additionalProperties: false,
            },
          },
        },
        required: ["instruction", "pairs"],
        additionalProperties: false,
      },
      fillIn: {
        type: "object",
        properties: {
          instruction: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: { sentence: { type: "string" }, answer: { type: "string" } },
              required: ["sentence", "answer"],
              additionalProperties: false,
            },
          },
        },
        required: ["instruction", "items"],
        additionalProperties: false,
      },
      table: {
        type: "object",
        properties: {
          instruction: { type: "string" },
          columnA: { type: "string" },
          columnB: { type: "string" },
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: { a: { type: "string" }, b: { type: "string" } },
              required: ["a", "b"],
              additionalProperties: false,
            },
          },
        },
        required: ["instruction", "columnA", "columnB", "rows"],
        additionalProperties: false,
      },
      openQuestions: {
        type: "object",
        properties: {
          instruction: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: { question: { type: "string" }, sampleAnswer: { type: "string" } },
              required: ["question", "sampleAnswer"],
              additionalProperties: false,
            },
          },
        },
        required: ["instruction", "items"],
        additionalProperties: false,
      },
    },
    required: ["topic", "matching", "fillIn", "table", "openQuestions"],
    additionalProperties: false,
  },
};
