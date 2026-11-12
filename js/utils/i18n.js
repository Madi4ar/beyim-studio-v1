// Minimal i18n dictionary — Russian (ru) and Kazakh (kz) UI strings.
// The platform is "Kazakh-first": labels and generated content headers
// switch with the selected teaching language.

const dict = {
  ru: {
    appName: "Beyim Studio",
    navHome: "Главная",
    navCreate: "AI Create",
    navMaterials: "Мои материалы",
    navTemplates: "Шаблоны",
    navLibrary: "Библиотека",
    navTeach: "Провести урок",
    navAnalytics: "Аналитика",
    navSettings: "Настройки",
    heroTitle: "Что будем создавать сегодня?",
    heroPlaceholder: "Введите тему, учебную цель или вставьте текст...",
    heroCta: "Создать материалы",
    quickActions: "Быстрые действия",
    recentMaterials: "Последние материалы",
    seeAll: "Смотреть все",
    subjectLabel: "Предмет",
    gradeLabel: "Класс",
    langLabel: "Язык",
    goalLabel: "Учебная цель",
    durationLabel: "Длительность урока",
    moreParams: "Дополнительные параметры",
    createPackage: "Создать комплект материалов",
    analyzing: "AI анализирует...",
    generatingTitle: "Создаем ваш урок",
    stageQueue: "Этапы генерации",
    open: "Открыть",
    edit: "Редактировать",
    export: "Экспорт",
    teach: "Провести урок",
    ready: "Готово",
    inProgress: "Генерация",
    goalMatch: "Соответствие учебной цели",
    whyThis: "Почему AI предложил это?",
    versions: "Версии",
    revertVersion: "Вернуться к предыдущей версии",
    aiEditor: "AI-редактор",
    aiEditorPlaceholder: "Сделай проще, переведи на казахский...",
    save: "Сохранено",
    cancel: "Отмена",
    optimize: "Оптимизировать",
    createLevels: "Создать уровни",
  },
  kz: {
    appName: "Beyim Studio",
    navHome: "Басты бет",
    navCreate: "AI Create",
    navMaterials: "Менің материалдарым",
    navTemplates: "Үлгілер",
    navLibrary: "Кітапхана",
    navTeach: "Сабақ өткізу",
    navAnalytics: "Аналитика",
    navSettings: "Баптаулар",
    heroTitle: "Бүгін не жасаймыз?",
    heroPlaceholder: "Тақырыпты, оқу мақсатын енгізіңіз немесе мәтін қойыңыз...",
    heroCta: "Материалдар жасау",
    quickActions: "Жылдам әрекеттер",
    recentMaterials: "Соңғы материалдар",
    seeAll: "Барлығын көру",
    subjectLabel: "Пән",
    gradeLabel: "Сынып",
    langLabel: "Тіл",
    goalLabel: "Оқу мақсаты",
    durationLabel: "Сабақ ұзақтығы",
    moreParams: "Қосымша параметрлер",
    createPackage: "Материалдар жинағын жасау",
    analyzing: "AI талдап жатыр...",
    generatingTitle: "Сабағыңызды жасаймыз",
    stageQueue: "Жасау кезеңдері",
    open: "Ашу",
    edit: "Өңдеу",
    export: "Экспорт",
    teach: "Сабақ өткізу",
    ready: "Дайын",
    inProgress: "Жасалып жатыр",
    goalMatch: "Оқу мақсатына сәйкестік",
    whyThis: "AI бұны неге ұсынды?",
    versions: "Нұсқалар",
    revertVersion: "Алдыңғы нұсқаға оралу",
    aiEditor: "AI-редактор",
    aiEditorPlaceholder: "Жеңілдет, қазақшаға аудар...",
    save: "Сақталды",
    cancel: "Бас тарту",
    optimize: "Оңтайландыру",
    createLevels: "Деңгейлер жасау",
  },
};

let currentLang = localStorage.getItem("beyim_ui_lang") || "ru";

export function setLang(lang) {
  currentLang = dict[lang] ? lang : "ru";
  localStorage.setItem("beyim_ui_lang", currentLang);
}

export function getLang() {
  return currentLang;
}

export function t(key) {
  return (dict[currentLang] && dict[currentLang][key]) || dict.ru[key] || key;
}
