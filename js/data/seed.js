// Seed data: mock projects, class profiles and teacher profile used on
// first run (frontend-only prototype — no backend).

export function seedTeacherProfile() {
  return {
    name: "Мадияр",
    email: "gshashirbekova@gmail.com",
    subjects: ["История Казахстана", "Всемирная история"],
    defaultGrade: "7",
    defaultLang: "ru",
    style: "Методический",
    favoriteFormats: ["Quiz", "Рабочий лист", "Exit ticket"],
  };
}

export function seedClasses() {
  return [
    {
      id: "class_7a",
      name: "7А",
      size: 24,
      strong: 6,
      medium: 13,
      support: 5,
      subject: "История Казахстана",
    },
    {
      id: "class_8b",
      name: "8Б",
      size: 21,
      strong: 5,
      medium: 11,
      support: 5,
      subject: "История Казахстана",
    },
  ];
}

const MATERIAL_TYPES = [
  { key: "ksp", label: "КСП", icon: "clipboard" },
  { key: "presentation", label: "Презентация", icon: "presentation" },
  { key: "worksheet", label: "Рабочий лист", icon: "doc" },
  { key: "tasks3", label: "Задания 3 уровней", icon: "layers" },
  { key: "quiz", label: "Quiz", icon: "quiz" },
  { key: "reflection", label: "Рефлексия", icon: "cards" },
  { key: "homework", label: "Домашнее задание", icon: "doc" },
  { key: "textDetective", label: "Детектив текста", icon: "detective" },
  { key: "cards", label: "Карточки", icon: "cards" },
];

export function materialTypeList() {
  return MATERIAL_TYPES;
}

export function seedProjects() {
  const now = Date.now();
  return [
    {
      id: "proj_demo1",
      topic: "Казахское ханство",
      subject: "История Казахстана",
      grade: "7",
      lang: "kz",
      goal: "Объяснить причины образования Казахского ханства",
      duration: 45,
      status: "ready",
      progress: 100,
      createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      goalMatch: 92,
      materials: MATERIAL_TYPES.map((m) => ({ ...m, status: "ready", versions: 1 })),
    },
    {
      id: "proj_demo2",
      topic: "Пропорции и отношения",
      subject: "Математика",
      grade: "6",
      lang: "ru",
      goal: "Научить применять пропорции в реальных задачах",
      duration: 40,
      status: "generating",
      progress: 68,
      createdAt: new Date(now - 1000 * 60 * 40).toISOString(),
      goalMatch: null,
      materials: MATERIAL_TYPES.map((m, i) => ({
        ...m,
        status: i < 5 ? "ready" : i === 5 ? "running" : "pending",
        versions: i < 5 ? 1 : 0,
      })),
    },
    {
      id: "proj_demo3",
      topic: "Функциональная грамотность: бюджет семьи",
      subject: "Функциональная грамотность",
      grade: "9",
      lang: "ru",
      goal: "Развить навык интерпретации данных и принятия решений",
      duration: 45,
      status: "ready",
      progress: 100,
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      goalMatch: 88,
      materials: MATERIAL_TYPES.map((m) => ({ ...m, status: "ready", versions: 2 })),
    },
  ];
}
