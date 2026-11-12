// Single source of truth for the subject and grade lists offered across the
// app (AI Create, Home quick-create, etc). Both entry points import from
// here instead of keeping their own hardcoded copies, so adding/removing an
// option only has to happen once.

export const SUBJECTS = [
  "Казахский язык",
  "Русский язык",
  "Казахская литература",
  "Русская литература",
  "Английский язык",
  "Математика",
  "Алгебра",
  "Геометрия",
  "Информатика",
  "Естествознание",
  "Познание мира",
  "Физика",
  "Химия",
  "Биология",
  "География",
  "История Казахстана",
  "Всемирная история",
  "Основы права",
  "Самопознание",
  "Музыка",
  "Изобразительное искусство",
  "Художественный труд",
  "Физическая культура",
  "Начальная военная и технологическая подготовка",
  "Функциональная грамотность",
  "Глобальные компетенции",
];

export const GRADES = Array.from({ length: 11 }, (_, i) => `${i + 1} класс`);
