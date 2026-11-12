// Quiz prompt + strict JSON schema. Deliberately simple shape per the
// teacher's request — just question/answer pairs, no multiple-choice
// options, no PIN/Kahoot-style metadata. editor.js's renderQuizBody() and
// exportDocx.js's quiz section both render exactly this structure.

const LANG_NAME = { kz: "казахском", ru: "русском" };

export function buildQuizPrompt({ topic, subject, grade, lang, duration, textbook }) {
  const langName = LANG_NAME[lang] || "русском";
  const gradeNum = parseInt(grade, 10) || 7;
  const dur = Number(duration) || 45;
  const count = Math.max(6, Math.min(12, Math.round(dur / 5)));

  const system = `Ты — опытный учитель, составляющий короткий устный/письменный квиз по теме урока для школы в Казахстане.

САМОЕ ВАЖНОЕ ТРЕБОВАНИЕ: массив "questions" должен содержать РОВНО ${count} пар вопрос-ответ, ни больше, ни меньше.

Правила:
- Весь текст пиши на ${langName} языке, естественно, без пунктуационных ошибок (без двойных пробелов, без пробела перед знаком препинания).
- Формат строго "вопрос + ответ" — никаких вариантов на выбор, никакого PIN-кода, никакой доп. метаинформации.
- Каждый "question" — короткий, однозначный вопрос по теме урока, языком, понятным ученику ${gradeNum} класса.
- Каждый "answer" — краткий правильный ответ (1 фраза или короткое предложение), без лишних пояснений.
- Вопросы должны идти от простых (факт/термин) к более сложным (понимание/применение), покрывая разные части темы, без повторов.
- Не выдумывай факты, которых нет в теме; если тема узкая — не растягивай искусственно.
- Если указан учебник — формулируй вопросы в его терминологии и ориентируйся на материал, который по этой теме даётся именно в нём (понятия, примеры, порядок подачи), а не на абстрактную тему в отрыве от учебника.
- Верни только данные по заданной схеме — никакого текста вне структуры.`;

  const user = `Тема урока: «${topic}»
Предмет: ${subject || "не указан — определи по теме"}
Класс: ${grade || "7"}
Нужно вопросов: ровно ${count}
Учебник, по которому работает учитель: ${textbook && textbook.trim() ? textbook.trim() : "не указан — ориентируйся на типовую программу РК для этого класса и предмета"}${textbook && textbook.trim() ? "\nСформулируй вопросы и ответы так, будто проверяешь именно параграф этого учебника по теме, а не общие знания." : ""}`;

  return { system, user, count };
}

export const QUIZ_JSON_SCHEMA = {
  name: "quiz_qa",
  strict: true,
  schema: {
    type: "object",
    properties: {
      topic: { type: "string" },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
          required: ["question", "answer"],
          additionalProperties: false,
        },
      },
    },
    required: ["topic", "questions"],
    additionalProperties: false,
  },
};
