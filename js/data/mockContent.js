// Template-based "AI" content generator. There is no real backend/LLM call
// here — this fills pedagogical templates from the lesson parameters so the
// UI can demonstrate the full Beyim Studio flow end to end.

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function seedFromString(str) {
  let s = 0;
  for (let i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) % 100000;
  return s;
}

// Fallback shape only (used when the real /api/generate-ksp call fails) —
// matches KSP_JSON_SCHEMA in api/prompts/ksp.js exactly, just without the
// richness a real model call produces.
export function buildKSP(project) {
  const seed = seedFromString(project.topic + project.grade);
  const dur = project.duration || 45;
  return {
    subject: project.subject,
    section: pick(["Раздел 1. Основы", "Раздел 2. Развитие", "Раздел 3. Итоги"], seed),
    grade: project.grade,
    topic: project.topic,
    curriculumGoalCode: `${project.grade}.2.1.1`,
    curriculumGoal: project.goal || `Понять и объяснить тему «${project.topic}»`,
    lessonObjectives: [
      `Назвать главные причины темы «${project.topic}»`,
      `Сравнить факты по теме «${project.topic}» и сделать вывод`,
      `Выполнить задание по теме «${project.topic}»`,
    ],
    values: ["Уважение к истории и культуре", "Сотрудничество", "Критическое мышление"],
    crossCurricularLinks: "Связь с функциональной грамотностью и смежными предметами по теме урока.",
    ictElement: "В середине урока — онлайн-тренажёр (Wordwall) для проверки ключевых терминов темы.",
    stages: [
      {
        name: "Начало урока",
        time: `0–${Math.round(dur * 0.1)} мин`,
        activities: [
          {
            title: "Вызов",
            teacherScript: `Учитель: «Сегодня мы разбираем тему «${project.topic}». Как вы думаете, почему это важно?»`,
            studentActions: "Высказывают предположения, формулируют ожидания от урока.",
            assessment: "Дескрипторы (без баллов): участвует в обсуждении, проявляет интерес.",
            resources: ["Доска/презентация"],
          },
        ],
      },
      {
        name: "Середина урока",
        time: `${Math.round(dur * 0.1)}–${Math.round(dur * 0.65)} мин`,
        activities: [
          {
            title: "Изучение нового материала",
            teacherScript: "Учитель: «Разберём ключевые факты по теме, затем обсудим их в группах.»",
            studentActions: "Слушают, фиксируют ключевые идеи, работают в группах.",
            assessment: "Дескрипторы (без баллов): фиксирует ключевые идеи, работает в группе.",
            resources: ["Рабочий лист", "Карточки с заданиями", "Онлайн-тренажёр (Wordwall)"],
          },
        ],
      },
      {
        name: "Конец урока",
        time: `${Math.round(dur * 0.65)}–${Math.round(dur * 0.85)} мин`,
        activities: [
          {
            title: "Закрепление",
            teacherScript: "Учитель: «Выполните задание самостоятельно, затем проверим вместе.»",
            studentActions: "Выполняют задания, участвуют во взаимопроверке.",
            assessment: "Критерий: применение изученного материала. Дескрипторы: верно выполняет задание (1 балл); аргументирует ответ (1 балл). Максимум: 2 балла.",
            resources: ["Quiz"],
          },
        ],
      },
      {
        name: "Рефлексия",
        time: `${Math.round(dur * 0.85)}–${dur} мин`,
        activities: [
          {
            title: "Рефлексия",
            teacherScript: "Учитель: «Что было понятно? Что осталось непонятным? Приведите пример.»",
            studentActions: "Отвечают на вопросы рефлексии.",
            assessment: "Дескрипторы (без баллов): формулирует вопрос или мнение.",
            resources: ["Стикеры"],
          },
        ],
      },
    ],
    differentiation: {
      advanced: "Задания продвинутого уровня, творческий контекст, дополнительные источники.",
      struggling: "Базовый уровень, карточки-подсказки, работа в паре с сильным учеником.",
      sen: [
        { category: "ЗПР", support: "Упрощённая инструкция по шагам, опора на образец, дополнительное время." },
        { category: "РАС", support: "Чёткий визуальный план урока, заранее известная структура, возможность письменного ответа вместо устного." },
        { category: "Нарушения зрения/слуха", support: "Крупный шрифт или дублирование материала голосом/жестами, место рядом с источником информации." },
      ],
    },
    assessmentCriteria: [
      { criterion: "Понимание ключевых фактов темы", descriptors: "Называет не менее двух фактов по теме (1 балл); устанавливает связь между причиной и следствием (1 балл).", points: 4 },
      { criterion: "Применение изученного материала", descriptors: "Верно выполняет задание (1 балл); аргументирует ответ примером (1 балл).", points: 4 },
      { criterion: "Работа в группе/паре", descriptors: "Вносит вклад в обсуждение (1 балл); соблюдает правила сотрудничества (1 балл).", points: 2 },
    ],
    printableTasks: [
      { title: "Задание 1", goal: "Проверить понимание темы", instruction: `Назовите 2 факта по теме «${project.topic}» и объясните их значение.` },
      { title: "Задание 2", goal: "Применить знания", instruction: `Приведите пример из реальной жизни, связанный с темой «${project.topic}».` },
    ],
    qualityChecklist: [
      "Сумма баллов оцениваемых заданий равна 10.",
      "Каждый этап соответствует заявленной цели урока.",
      "Есть дифференциация для всех групп учеников.",
    ],
  };
}

export function buildPresentation(project) {
  const seed = seedFromString(project.topic);
  const count = 9 + (seed % 4);
  const structure = [
    "Титульный слайд", "Проблемный вопрос", "Ключевое понятие", "Пример из жизни",
    "Визуальная схема", "Групповое задание", "Проверка понимания", "Итоги урока", "Рефлексия",
    "Дополнительный пример", "Кейс из Казахстана", "Домашнее задание",
  ];
  const slides = Array.from({ length: count }, (_, i) => {
    const title = structure[i] || `Слайд ${i + 1}`;
    return {
      index: i + 1,
      title: i === 0 ? project.topic : title,
      note:
        i === 0
          ? `${project.subject} · ${project.grade} класс`
          : `Speaker notes: раскрыть "${title.toLowerCase()}" в контексте темы «${project.topic}».`,
    };
  });
  return { slideCount: count, slides, style: "Минималистичный, брендовый акцент Beyim" };
}

// Fallback shape only (used when the real /api/generate-worksheet call
// fails) — matches WORKSHEET_JSON_SCHEMA in api/prompts/worksheet.js.
export function buildWorksheet(project) {
  const t = project.topic;
  return {
    topic: t,
    matching: {
      instruction: "Соедини понятие с определением.",
      pairs: Array.from({ length: 5 }, (_, i) => ({
        term: `Понятие ${i + 1} (${t})`,
        definition: `Определение, связанное с темой «${t}».`,
      })),
    },
    fillIn: {
      instruction: "Заполни пропуски в предложениях.",
      items: Array.from({ length: 6 }, (_, i) => ({
        sentence: `Предложение ${i + 1} о теме «${t}» содержит пропуск: _____.`,
        answer: `ответ ${i + 1}`,
      })),
    },
    table: {
      instruction: "Заполни таблицу.",
      columnA: "Понятие",
      columnB: "Пример",
      rows: Array.from({ length: 4 }, (_, i) => ({ a: `Понятие ${i + 1}`, b: `Пример по теме «${t}»` })),
    },
    openQuestions: {
      instruction: "Ответь развёрнуто на вопросы.",
      items: [
        { question: `Объясни своими словами, что такое «${t}».`, sampleAnswer: `Краткое объяснение темы «${t}».` },
        { question: `Приведи пример применения темы «${t}» в жизни.`, sampleAnswer: `Пример, связанный с темой «${t}».` },
      ],
    },
  };
}

// Fallback shape only (used when the real /api/generate-tasks3 call fails)
// — matches TASKS3_JSON_SCHEMA in api/prompts/tasks3.js.
export function buildTasks3Levels(project) {
  const t = project.topic;
  return {
    topic: t,
    levelA: {
      label: "Level A — поддерживающий",
      tasks: [
        `Назови 2 факта по теме «${t}»`,
        `Выбери верное утверждение о теме «${t}» из списка`,
        `Запиши ключевой термин по теме «${t}»`,
        `Покажи на схеме/рисунке элемент темы «${t}»`,
      ],
    },
    levelB: {
      label: "Level B — основной",
      tasks: [
        `Объясни причину события в теме «${t}»`,
        `Сравни два факта по теме «${t}» и сделай вывод`,
        `Опиши последовательность этапов темы «${t}»`,
        `Приведи пример, иллюстрирующий тему «${t}»`,
      ],
    },
    levelC: {
      label: "Level C — продвинутый",
      tasks: [
        `Аргументируй свою точку зрения по теме «${t}»`,
        `Спрогнозируй последствия события в теме «${t}»`,
        `Сравни тему «${t}» с похожим явлением и выяви различия`,
        `Предложи решение проблемы, связанной с темой «${t}»`,
      ],
    },
  };
}

export function buildQuiz(project) {
  const seed = seedFromString(project.topic + "quiz");
  const n = 6 + (seed % 3);
  return {
    topic: project.topic,
    questions: Array.from({ length: n }, (_, i) => ({
      question: `Вопрос ${i + 1} по теме «${project.topic}»?`,
      answer: `Краткий ответ ${i + 1} по теме «${project.topic}».`,
    })),
  };
}

export function buildReflection() {
  return {
    prompts: ["Что ты понял?", "Что осталось непонятным?", "Назови один факт.", "Приведи пример."],
  };
}

export function buildHomework(project) {
  return {
    tasks: [
      `Повтори конспект по теме «${project.topic}»`,
      `Выполни 3 задания из рабочего листа`,
      `Подготовь один вопрос для обсуждения на следующем уроке`,
    ],
  };
}

export function buildTextDetective(project) {
  return {
    modes: ["Найди предложение", "Раскрой смысл", "Проверь вывод", "Собери аргумент", "Оцени источник"],
    sourceTopic: project.topic,
  };
}

export function buildCards(project) {
  const seed = seedFromString(project.topic + "cards");
  return {
    cards: Array.from({ length: 6 + (seed % 4) }, (_, i) => ({
      front: `Термин ${i + 1}`,
      back: `Определение, связанное с темой «${project.topic}»`,
    })),
  };
}

const BUILDERS = {
  ksp: buildKSP,
  presentation: buildPresentation,
  worksheet: buildWorksheet,
  tasks3: buildTasks3Levels,
  quiz: buildQuiz,
  reflection: buildReflection,
  homework: buildHomework,
  textDetective: buildTextDetective,
  cards: buildCards,
};

export function buildMaterialContent(key, project) {
  const builder = BUILDERS[key];
  return builder ? builder(project) : null;
}

export const GENERATION_STAGES = [
  { key: "analyze", label: "Анализ темы" },
  { key: "objectives", label: "Определение учебных целей" },
  { key: "structure", label: "Формирование структуры урока" },
  { key: "content", label: "Создание содержания" },
  { key: "tasks", label: "Создание заданий" },
  { key: "diff", label: "Дифференциация" },
  { key: "presentation", label: "Создание презентации" },
  { key: "quality", label: "Проверка качества" },
  { key: "files", label: "Формирование файлов" },
];

export const LIVE_MESSAGES = [
  "Анализируем тему...",
  "Подбираем структуру урока...",
  "Мы уже подготовили структуру урока.",
  "Создаем задания трех уровней сложности.",
  "Подбираем вопросы так, чтобы проверить не только запоминание, но и понимание темы.",
  "Создаем презентацию: слайды и speaker notes.",
  "Формируем критерии оценивания и дескрипторы.",
  "Проверяем соответствие учебной цели...",
  "Собираем файлы для экспорта.",
];
