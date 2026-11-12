// КСП (краткосрочный план) prompt + strict JSON schema, modeled on a real
// methodologist-grade КСП (full teacher scripts per activity, multi-activity
// macro-stages, a separate 10-point assessment table, printable task cards,
// a quality checklist) rather than a thin skeleton. The shape here is the
// single source of truth — editor.js's renderKSPBody() and exportDocx.js's
// КСП section both render exactly this structure.

const LANG_NAME = { kz: "казахском", ru: "русском" };

export function buildKSPPrompt({ topic, subject, grade, lang, goal, duration, textbook }) {
  const langName = LANG_NAME[lang] || "русском";
  const dur = Number(duration) || 45;
  const gradeNum = parseInt(grade, 10) || 7;
  const ageHint = `${gradeNum + 5}-${gradeNum + 6} лет`;

  const t1 = Math.max(5, Math.round(dur * 0.1));
  const t2 = Math.max(t1 + 5, Math.round(dur * 0.65));
  const t3 = Math.max(t2 + 5, Math.round(dur * 0.85));
  const t4 = Math.max(t3 + 5, dur);

  const system = `Ты — опытный методист, составляющий краткосрочные планы уроков (КСП) для школ Казахстана по приказу МОН РК №130, на уровне реального рабочего документа учителя, а не конспекта-скелета.

САМОЕ ВАЖНОЕ ТРЕБОВАНИЕ — СТРУКТУРА "stages": массив "stages" должен содержать РОВНО 4 элемента, ни одним меньше, в точности такие:
1. { "name": "Начало урока", "time": "0–${t1} мин" }
2. { "name": "Середина урока", "time": "${t1}–${t2} мин" }
3. { "name": "Конец урока", "time": "${t2}–${t3} мин" }
4. { "name": "Рефлексия", "time": "${t3}–${t4} мин" }
Это не ориентир, а обязательный план — нельзя остановиться после 1-2 этапов. Каждый из 4 этапов обязан иметь хотя бы одну содержательную "activity" с собственным teacherScript, прежде чем переходить к следующей части схемы (differentiation, assessmentCriteria и т.д.). Проверь перед ответом: в массиве stages ровно 4 объекта.

Остальные правила:
- Весь текст пиши на ${langName} языке, естественно, без кальки с другого языка. Следи за пунктуацией: без двойных пробелов, без пробела перед точкой/запятой/двоеточием, без лишних пробелов в конце предложения, без лишних тире и точек подряд.
- "curriculumGoalCode" — формальный шифр цели обучения из типовой учебной программы РК в формате "класс.раздел.подраздел.номер" (например "${gradeNum}.2.1.3"). "curriculumGoal" — формулировка этой цели официальным языком учебной программы.
- "lessonObjectives" (цели урока) должны быть ПРОЩЕ и КОНКРЕТНЕЕ, чем curriculumGoal: сформулируй их языком, понятным ребёнку ${ageHint} (ученику ${gradeNum} класса) — короткие, глагол + конкретное действие, без канцелярита и терминов учебной программы.
- Внутри каждого этапа — 1-3 "activities". Объём работы в каждой activity должен быть РЕАЛИСТИЧНЫМ для возраста ${ageHint} и отведённого времени: не закладывай в один отрезок времени больше заданий, чем ученики этого возраста реально успеют сделать (например, отрезок в ${t2 - t1} минут — это ОДНО-ДВА полноценных задания с инструктажем и выполнением, а не исследование + презентация + обсуждение подряд).
- "ictElement" — ОБЯЗАТЕЛЬНО укажи один конкретный элемент ИКТ, интерактива или работы с ИИ-инструментом, уместный возрасту (например: интерактивная доска, онлайн-тренажёр/квиз Kahoot/Wordwall/Quizizz, образовательное видео, работа с ИИ-помощником для поиска/проверки информации под руководством учителя), и повтори его в "resources" того этапа, где он используется.
- "teacherScript" — это ПОЛНЫЕ РЕПЛИКИ учителя в кавычках, как в реальном сценарии урока (что именно учитель говорит классу), а не абстрактное описание действия.
- "assessment" у каждой activity — дескрипторы без баллов для неоцениваемых этапов (вызов, изучение, рефлексия), и "дескрипторы + баллы" для оцениваемых заданий (закрепление, групповая работа и т.п.).
- "assessmentCriteria" — сводная таблица оценивания урока: 2-4 критерия, у каждого свои дескрипторы и балл; сумма "points" должна быть РОВНО 10.
- "printableTasks" — 3-6 самостоятельных карточек заданий для печати (цель + инструкция), основанных на заданиях из activities, без дублирования текста один в один.
- "differentiation.advanced" — поддержка для учеников с высоким уровнем освоения материала (НЕ используй слово "одарённые"/"одарённых" нигде в тексте — это некорректный термин).
- "differentiation.struggling" — поддержка для испытывающих трудности в освоении материала.
- "differentiation.sen" — поддержка для учеников с особыми образовательными потребностями, 2-4 ОТДЕЛЬНЫХ записи по категориям (например: "ЗПР", "РАС", "нарушения зрения", "нарушения слуха", "ТНР"), каждая со своей собственной рекомендацией. НЕ обобщай одной рекомендацией на всех — у разных категорий разный уровень сохранности интеллекта и разные реальные потребности (например, при РАС интеллект часто сохранен и нужна в первую очередь сенсорная/коммуникативная адаптация, а при ЗПР — другой тип поддержки).
- "qualityChecklist" — 3-5 пунктов самопроверки, что план логичен и баллы сходятся (по образцу: "сумма баллов оцениваемых заданий = 10").
- Не выдумывай персональные данные учеников или школы.
- Контекст может опираться на реалии Казахстана (география, история, культура, тенге и т.д.), если уместно теме.
- Верни только данные по заданной схеме — никакого текста вне структуры.`;

  const user = `Раздел программы и тема урока: «${topic}»
Предмет: ${subject || "не указан — определи по теме"}
Класс: ${grade || "7"}
Цель обучения (куррикулум): ${goal ? goal : "не указана — сформулируй уместную цель по теме и классу, подбери корректный шифр"}
Длительность урока: ${dur} минут
Учебник, по которому работает учитель: ${textbook && textbook.trim() ? textbook.trim() : "не указан — ориентируйся на типовую программу РК для этого класса и предмета"}${textbook && textbook.trim() ? "\nИспользуй этот учебник как источник ресурсов (указывай конкретные параграфы/главы/упражнения там, где это уместно, и держись его терминологии)." : ""}`;

  return { system, user };
}

const activitySchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    teacherScript: { type: "string" },
    studentActions: { type: "string" },
    assessment: { type: "string" },
    resources: { type: "array", items: { type: "string" } },
  },
  required: ["title", "teacherScript", "studentActions", "assessment", "resources"],
  additionalProperties: false,
};

export const KSP_JSON_SCHEMA = {
  name: "ksp_lesson_plan",
  strict: true,
  schema: {
    type: "object",
    properties: {
      subject: { type: "string" },
      section: { type: "string", description: "Раздел программы" },
      grade: { type: "string" },
      topic: { type: "string", description: "Тема конкретного урока" },
      curriculumGoalCode: { type: "string", description: "Шифр цели обучения из типовой учебной программы, формат класс.раздел.подраздел.номер" },
      curriculumGoal: { type: "string", description: "Формулировка цели обучения со ссылкой на учебную программу" },
      lessonObjectives: { type: "array", items: { type: "string" }, description: "Цели урока простым языком, понятным ученику этого возраста" },
      values: { type: "array", items: { type: "string" } },
      crossCurricularLinks: { type: "string" },
      ictElement: {
        type: "string",
        description:
          "Один конкретный элемент ИКТ/интерактива/работы с ИИ-инструментом, использованный в уроке: что именно и на каком этапе (например: «В середине урока — онлайн-тренажёр Wordwall для проверки терминов»).",
      },
      stages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            time: { type: "string" },
            activities: { type: "array", items: activitySchema },
          },
          required: ["name", "time", "activities"],
          additionalProperties: false,
        },
      },
      differentiation: {
        type: "object",
        properties: {
          advanced: { type: "string", description: "Поддержка для учеников с высоким уровнем освоения материала" },
          struggling: { type: "string" },
          sen: {
            type: "array",
            description: "Поддержка для учеников с ООП, отдельная запись на каждую категорию — без обобщения",
            items: {
              type: "object",
              properties: {
                category: { type: "string", description: "Например: ЗПР, РАС, нарушения зрения, нарушения слуха, ТНР" },
                support: { type: "string" },
              },
              required: ["category", "support"],
              additionalProperties: false,
            },
          },
        },
        required: ["advanced", "struggling", "sen"],
        additionalProperties: false,
      },
      assessmentCriteria: {
        type: "array",
        items: {
          type: "object",
          properties: {
            criterion: { type: "string" },
            descriptors: { type: "string" },
            points: { type: "number" },
          },
          required: ["criterion", "descriptors", "points"],
          additionalProperties: false,
        },
      },
      printableTasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            goal: { type: "string" },
            instruction: { type: "string" },
          },
          required: ["title", "goal", "instruction"],
          additionalProperties: false,
        },
      },
      qualityChecklist: { type: "array", items: { type: "string" } },
    },
    required: [
      "subject",
      "section",
      "grade",
      "topic",
      "curriculumGoalCode",
      "curriculumGoal",
      "lessonObjectives",
      "values",
      "crossCurricularLinks",
      "ictElement",
      "stages",
      "differentiation",
      "assessmentCriteria",
      "printableTasks",
      "qualityChecklist",
    ],
    additionalProperties: false,
  },
};
