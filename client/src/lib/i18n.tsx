import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Language = "ru" | "kk" | "en";

const LANG_STORAGE_KEY = "smart_restaurant_language";
const TRANSLATION_CACHE_KEY = "smart_restaurant_translations_cache";

interface Translations {
  welcome: string;
  allBranches: string;
  today: string;
  selectDates: string;
  allPeriod: string;
  select: string;
  revenue: string;
  orders: string;
  avgCheck: string;
  newGuests: string;
  ordersDynamics: string;
  day: string;
  week: string;
  month: string;
  branches: string;
  tasks: string;
  marketing: string;
  learning: string;
  onboarding: string;
  knowledgeBase: string;
  support: string;
  dashboard: string;
  menu: string;
  analytics: string;
  settings: string;
  createPromo: string;
  updateMenu: string;
  promotions: string;
  promoCodes: string;
  loyalty: string;
  progress: string;
  newLessons: string;
  checklists: string;
  popularArticles: string;
  recentRequests: string;
  retry: string;
  noData: string;
  loadError: string;
  active: string;
  lowActivity: string;
  menuUpdateRequired: string;
  home: string;
  cashRegister: string;
  reports: string;
  tools: string;
  clientWork: string;
  training: string;
  startTraining: string;
  repeatTraining: string;
  completed: string;
  locked: string;
  newLabel: string;
  video: string;
  document: string;
  test: string;
  simulator: string;
  whatYouLearn: string;
  algorithm: string;
  back: string;
  next: string;
  close: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  loading: string;
  error: string;
  success: string;
  selectRole: string;
  selectRoleDesc: string;
  selectProducts: string;
  selectProductsDesc: string;
  continueBtn: string;
  owner: string;
  manager: string;
  administrator: string;
  cashier: string;
  waiter: string;
  runner: string;
  accountant: string;
  marketer: string;
  ownerDesc: string;
  managerDesc: string;
  administratorDesc: string;
  cashierDesc: string;
  waiterDesc: string;
  runnerDesc: string;
  accountantDesc: string;
  marketerDesc: string;
  orderNoWaiter: string;
  orderNoCashier: string;
  billQr: string;
  selfServiceKiosk: string;
  orderNoWaiterDesc: string;
  orderNoCashierDesc: string;
  billQrDesc: string;
  selfServiceKioskDesc: string;
  describeProblem: string;
  aiConsultant: string;
  online: string;
  typing: string;
  greeting: string;
  connectionError: string;
  generalError: string;
  profile: string;
  logout: string;
  notifications: string;
  help: string;
  allModules: string;
  myModules: string;
  coreModules: string;
  roleModules: string;
  productModules: string;
  minutes: string;
  lesson: string;
  lessons: string;
  yourProgress: string;
  lessonsCompleted: string;
  overallProgress: string;
  step: string;
  of: string;
  clickHere: string;
  wrongClick: string;
  congratulations: string;
  simulatorCompleted: string;
  webMode: string;
  mobileMode: string;
  questionsInTest: string;
  correctAnswer: string;
  wrongAnswer: string;
  testCompleted: string;
  yourScore: string;
  tryAgain: string;
  passedTest: string;
  failedTest: string;
  question: string;
  chooseAnswer: string;
  submitAnswer: string;
  nextQuestion: string;
  finishTest: string;
  changeRole: string;
  formula: string;
  downloadPdf: string;
  moduleChecklist: string;
  correct: string;
  wrongTryAnother: string;
  stepXofY: string;
  clickHighlighted: string;
  nextModule: string;
  congratsCertificate: string;
  correctCount: string;
  changeAndRetry: string;
  allCorrect: string;
  quizNotAdded: string;
  downloadGuide: string;
  consequence: string;
  trainingPlatform: string;
  retakeTest: string;
  checkAnswers: string;
}

const translations: Record<Language, Translations> = {
  ru: {
    welcome: "Добро пожаловать",
    allBranches: "Все филиалы",
    today: "Сегодня",
    selectDates: "Выбрать даты",
    allPeriod: "Весь период",
    select: "Выбрать",
    revenue: "Оборот",
    orders: "Заказы",
    avgCheck: "Средний чек",
    newGuests: "Новые гости",
    ordersDynamics: "Динамика заказов",
    day: "День",
    week: "Неделя",
    month: "Месяц",
    branches: "Филиалы",
    tasks: "Задачи на сегодня",
    marketing: "Маркетинг",
    learning: "Академия",
    onboarding: "Онбординг",
    knowledgeBase: "База знаний",
    support: "Поддержка",
    dashboard: "Дашборд",
    menu: "Меню",
    analytics: "Аналитика",
    settings: "Настройки",
    createPromo: "Создать акцию",
    updateMenu: "Обновить меню",
    promotions: "Акции",
    promoCodes: "Промокоды",
    loyalty: "Программа лояльности",
    progress: "Прогресс",
    newLessons: "Новые уроки",
    checklists: "Чек-листы",
    popularArticles: "Популярные статьи",
    recentRequests: "Последние обращения",
    retry: "Попробовать снова",
    noData: "Нет данных",
    loadError: "Ошибка загрузки",
    active: "Активно",
    lowActivity: "Низкая активность",
    menuUpdateRequired: "Требуется обновление меню",
    home: "Главная",
    cashRegister: "Касса",
    reports: "Отчеты",
    tools: "Инструменты",
    clientWork: "Работа с клиентами",
    training: "Академия",
    startTraining: "Начать обучение",
    repeatTraining: "Повторить",
    completed: "Завершено",
    locked: "Заблокировано",
    newLabel: "НОВИНКА",
    video: "Видео",
    document: "Документ",
    test: "Тест",
    simulator: "Тренажёр",
    whatYouLearn: "Чему вы научитесь",
    algorithm: "Алгоритм",
    back: "Назад",
    next: "Далее",
    close: "Закрыть",
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    edit: "Редактировать",
    add: "Добавить",
    search: "Поиск",
    filter: "Фильтр",
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успешно",
    selectRole: "Выберите вашу роль",
    selectRoleDesc: "Это поможет показать только нужные материалы",
    selectProducts: "Какие продукты подключены?",
    selectProductsDesc: "Выберите продукты, которые используются в вашем заведении",
    continueBtn: "Продолжить",
    owner: "Владелец",
    manager: "Управляющий",
    administrator: "Администратор",
    cashier: "Кассир",
    waiter: "Официант",
    runner: "Раннер",
    accountant: "Бухгалтер",
    marketer: "Маркетолог",
    ownerDesc: "Полный доступ ко всем функциям",
    managerDesc: "Управление заведением и персоналом",
    administratorDesc: "Операционное управление",
    cashierDesc: "Работа с заказами и оплатой",
    waiterDesc: "Обслуживание гостей",
    runnerDesc: "Доставка заказов гостям",
    accountantDesc: "Финансовая отчётность",
    marketerDesc: "Продвижение и акции",
    orderNoWaiter: "Заказ без официанта",
    orderNoCashier: "Заказ без кассира",
    billQr: "Подтягивание счета",
    selfServiceKiosk: "Киоск самообслуживания",
    orderNoWaiterDesc: "Для заведений с официантами и раннерами",
    orderNoCashierDesc: "Гость совершает заказ у кассы по QR",
    billQrDesc: "Закрытие счета на оплату через QR",
    selfServiceKioskDesc: "Заказ через терминал самообслуживания",
    describeProblem: "Опишите проблему...",
    aiConsultant: "AI-консультант Choco",
    online: "Онлайн",
    typing: "Печатает...",
    greeting: "Привет! Я помощник Choco. Задайте вопрос про работу с системой — отвечу коротко и по делу.",
    connectionError: "Произошла ошибка соединения. Обратитесь в поддержку: +7 708 292 5746",
    generalError: "Произошла ошибка. Обратитесь в поддержку: +7 708 292 5746",
    profile: "Профиль",
    logout: "Выйти",
    notifications: "Уведомления",
    help: "Помощь",
    allModules: "Все модули",
    myModules: "Мои модули",
    coreModules: "Базовые",
    roleModules: "По роли",
    productModules: "По продукту",
    minutes: "мин",
    lesson: "Урок",
    lessons: "Уроки",
    yourProgress: "Ваш прогресс",
    lessonsCompleted: "уроков пройдено",
    overallProgress: "Общий прогресс",
    step: "Шаг",
    of: "из",
    clickHere: "Нажмите сюда",
    wrongClick: "Неверно! Попробуйте ещё раз",
    congratulations: "Поздравляем!",
    simulatorCompleted: "Тренажёр пройден!",
    webMode: "Веб",
    mobileMode: "Мобильный",
    questionsInTest: "вопросов в тесте",
    correctAnswer: "Правильно!",
    wrongAnswer: "Неверно!",
    testCompleted: "Тест завершён",
    yourScore: "Ваш результат",
    tryAgain: "Попробовать снова",
    passedTest: "Тест пройден!",
    failedTest: "Тест не пройден",
    question: "Вопрос",
    chooseAnswer: "Выберите ответ",
    submitAnswer: "Ответить",
    nextQuestion: "Следующий вопрос",
    finishTest: "Завершить тест",
    changeRole: "Сменить роль",
    formula: "Формула",
    downloadPdf: "Скачать PDF-инструкцию",
    moduleChecklist: "Чек-лист модуля",
    correct: "Правильно!",
    wrongTryAnother: "Неправильно. Выберите другой ответ.",
    stepXofY: "Шаг",
    clickHighlighted: "Нажми на подсвеченную область",
    nextModule: "Следующий модуль",
    congratsCertificate: "Поздравляем! Вы получили сертификат!",
    correctCount: "Правильных ответов:",
    changeAndRetry: "Измените ответы и попробуйте снова.",
    allCorrect: "Отлично! Все ответы правильные!",
    quizNotAdded: "Тест не добавлен",
    downloadGuide: "Скачать гайд",
    consequence: "Возможные последствия",
    trainingPlatform: "Обучающая платформа",
    retakeTest: "Пересдать тест",
    checkAnswers: "Проверить ответы",
  },
  kk: {
    welcome: "Қош келдіңіз",
    allBranches: "Барлық филиалдар",
    today: "Бүгін",
    selectDates: "Күндерді таңдау",
    allPeriod: "Барлық кезең",
    select: "Таңдау",
    revenue: "Айналым",
    orders: "Тапсырыстар",
    avgCheck: "Орташа чек",
    newGuests: "Жаңа қонақтар",
    ordersDynamics: "Тапсырыстар динамикасы",
    day: "Күн",
    week: "Апта",
    month: "Ай",
    branches: "Филиалдар",
    tasks: "Бүгінгі тапсырмалар",
    marketing: "Маркетинг",
    learning: "Академия",
    onboarding: "Онбординг",
    knowledgeBase: "Білім базасы",
    support: "Қолдау",
    dashboard: "Басқару тақтасы",
    menu: "Мәзір",
    analytics: "Аналитика",
    settings: "Баптаулар",
    createPromo: "Акция жасау",
    updateMenu: "Мәзірді жаңарту",
    promotions: "Акциялар",
    promoCodes: "Промокодтар",
    loyalty: "Адалдық бағдарламасы",
    progress: "Прогресс",
    newLessons: "Жаңа сабақтар",
    checklists: "Чек-листтер",
    popularArticles: "Танымал мақалалар",
    recentRequests: "Соңғы өтініштер",
    retry: "Қайталап көру",
    noData: "Деректер жоқ",
    loadError: "Жүктеу қатесі",
    active: "Белсенді",
    lowActivity: "Төмен белсенділік",
    menuUpdateRequired: "Мәзірді жаңарту қажет",
    home: "Басты бет",
    cashRegister: "Касса",
    reports: "Есептер",
    tools: "Құралдар",
    clientWork: "Клиенттермен жұмыс",
    training: "Академия",
    startTraining: "Оқытуды бастау",
    repeatTraining: "Қайталау",
    completed: "Аяқталды",
    locked: "Құлыпталған",
    newLabel: "ЖАҢА",
    video: "Бейне",
    document: "Құжат",
    test: "Тест",
    simulator: "Тренажёр",
    whatYouLearn: "Не үйренесіз",
    algorithm: "Алгоритм",
    back: "Артқа",
    next: "Келесі",
    close: "Жабу",
    save: "Сақтау",
    cancel: "Бас тарту",
    delete: "Жою",
    edit: "Өңдеу",
    add: "Қосу",
    search: "Іздеу",
    filter: "Сүзгі",
    loading: "Жүктелуде...",
    error: "Қате",
    success: "Сәтті",
    selectRole: "Рөліңізді таңдаңыз",
    selectRoleDesc: "Бұл тек қажетті материалдарды көрсетуге көмектеседі",
    selectProducts: "Қандай өнімдер қосылған?",
    selectProductsDesc: "Мекемеңізде қолданылатын өнімдерді таңдаңыз",
    continueBtn: "Жалғастыру",
    owner: "Иесі",
    manager: "Басқарушы",
    administrator: "Әкімші",
    cashier: "Кассир",
    waiter: "Даяшы",
    runner: "Раннер",
    accountant: "Бухгалтер",
    marketer: "Маркетолог",
    ownerDesc: "Барлық функцияларға толық қолжетімділік",
    managerDesc: "Мекеме мен қызметкерлерді басқару",
    administratorDesc: "Операциялық басқару",
    cashierDesc: "Тапсырыстар мен төлемдермен жұмыс",
    waiterDesc: "Қонақтарға қызмет көрсету",
    runnerDesc: "Тапсырыстарды қонақтарға жеткізу",
    accountantDesc: "Қаржылық есептілік",
    marketerDesc: "Жарнамалау және акциялар",
    orderNoWaiter: "Даяшысыз тапсырыс",
    orderNoCashier: "Кассирсіз тапсырыс",
    billQr: "Шотты тарту",
    selfServiceKiosk: "Өзіне-өзі қызмет көрсету киоскі",
    orderNoWaiterDesc: "Даяшылар мен раннерлері бар мекемелер үшін",
    orderNoCashierDesc: "Қонақ кассада QR арқылы тапсырыс береді",
    billQrDesc: "QR арқылы төлем шотын жабу",
    selfServiceKioskDesc: "Өзіне-өзі қызмет көрсету терминалы арқылы тапсырыс",
    describeProblem: "Мәселені сипаттаңыз...",
    aiConsultant: "AI-кеңесші Choco",
    online: "Онлайн",
    typing: "Теруде...",
    greeting: "Сәлем! Мен Choco көмекшісімін. Жүйемен жұмыс туралы сұрақ қойыңыз — қысқа және нақты жауап беремін.",
    connectionError: "Байланыс қатесі орын алды. Қолдау қызметіне хабарласыңыз: +7 708 292 5746",
    generalError: "Қате орын алды. Қолдау қызметіне хабарласыңыз: +7 708 292 5746",
    profile: "Профиль",
    logout: "Шығу",
    notifications: "Хабарламалар",
    help: "Көмек",
    allModules: "Барлық модульдер",
    myModules: "Менің модульдерім",
    coreModules: "Негізгі",
    roleModules: "Рөл бойынша",
    productModules: "Өнім бойынша",
    minutes: "мин",
    lesson: "Сабақ",
    lessons: "Сабақтар",
    yourProgress: "Сіздің прогрессіңіз",
    lessonsCompleted: "сабақ өтілді",
    overallProgress: "Жалпы прогресс",
    step: "Қадам",
    of: "ішінен",
    clickHere: "Мұнда басыңыз",
    wrongClick: "Қате! Қайталап көріңіз",
    congratulations: "Құттықтаймыз!",
    simulatorCompleted: "Тренажёр өтілді!",
    webMode: "Веб",
    mobileMode: "Мобильді",
    questionsInTest: "тесттегі сұрақтар",
    correctAnswer: "Дұрыс!",
    wrongAnswer: "Қате!",
    testCompleted: "Тест аяқталды",
    yourScore: "Сіздің нәтижеңіз",
    tryAgain: "Қайталап көру",
    passedTest: "Тест өтілді!",
    failedTest: "Тест өтілмеді",
    question: "Сұрақ",
    chooseAnswer: "Жауапты таңдаңыз",
    submitAnswer: "Жауап беру",
    nextQuestion: "Келесі сұрақ",
    finishTest: "Тестті аяқтау",
    changeRole: "Рөлді ауыстыру",
    formula: "Формула",
    downloadPdf: "PDF нұсқаулықты жүктеу",
    moduleChecklist: "Модуль тексеру парағы",
    correct: "Дұрыс!",
    wrongTryAnother: "Қате. Басқа жауапты таңдаңыз.",
    stepXofY: "Қадам",
    clickHighlighted: "Белгіленген аймақты басыңыз",
    nextModule: "Келесі модуль",
    congratsCertificate: "Құттықтаймыз! Сертификат алдыңыз!",
    correctCount: "Дұрыс жауаптар:",
    changeAndRetry: "Жауаптарды өзгертіп, қайта байқап көріңіз.",
    allCorrect: "Тамаша! Барлық жауаптар дұрыс!",
    quizNotAdded: "Тест қосылмаған",
    downloadGuide: "Нұсқаулықты жүктеу",
    consequence: "Ықтимал салдары",
    trainingPlatform: "Оқыту платформасы",
    retakeTest: "Тестті қайта тапсыру",
    checkAnswers: "Жауаптарды тексеру",
  },
  en: {
    welcome: "Welcome",
    allBranches: "All branches",
    today: "Today",
    selectDates: "Select dates",
    allPeriod: "All time",
    select: "Select",
    revenue: "Revenue",
    orders: "Orders",
    avgCheck: "Avg check",
    newGuests: "New guests",
    ordersDynamics: "Orders dynamics",
    day: "Day",
    week: "Week",
    month: "Month",
    branches: "Branches",
    tasks: "Today's tasks",
    marketing: "Marketing",
    learning: "Академия",
    onboarding: "Onboarding",
    knowledgeBase: "Knowledge base",
    support: "Support",
    dashboard: "Dashboard",
    menu: "Menu",
    analytics: "Analytics",
    settings: "Settings",
    createPromo: "Create promotion",
    updateMenu: "Update menu",
    promotions: "Promotions",
    promoCodes: "Promo codes",
    loyalty: "Loyalty program",
    progress: "Progress",
    newLessons: "New lessons",
    checklists: "Checklists",
    popularArticles: "Popular articles",
    recentRequests: "Recent requests",
    retry: "Try again",
    noData: "No data",
    loadError: "Load error",
    active: "Active",
    lowActivity: "Low activity",
    menuUpdateRequired: "Menu update required",
    home: "Home",
    cashRegister: "Cash register",
    reports: "Reports",
    tools: "Tools",
    clientWork: "Client management",
    training: "Академия",
    startTraining: "Start training",
    repeatTraining: "Repeat",
    completed: "Completed",
    locked: "Locked",
    newLabel: "NEW",
    video: "Video",
    document: "Document",
    test: "Test",
    simulator: "Trainer",
    whatYouLearn: "What you'll learn",
    algorithm: "Algorithm",
    back: "Back",
    next: "Next",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    selectRole: "Select your role",
    selectRoleDesc: "This helps show only relevant materials",
    selectProducts: "Which products are connected?",
    selectProductsDesc: "Select products used in your venue",
    continueBtn: "Continue",
    owner: "Owner",
    manager: "Manager",
    administrator: "Administrator",
    cashier: "Cashier",
    waiter: "Waiter",
    runner: "Runner",
    accountant: "Accountant",
    marketer: "Marketer",
    ownerDesc: "Full access to all features",
    managerDesc: "Venue and staff management",
    administratorDesc: "Operations management",
    cashierDesc: "Orders and payments",
    waiterDesc: "Guest service",
    runnerDesc: "Order delivery to guests",
    accountantDesc: "Financial reporting",
    marketerDesc: "Promotion and campaigns",
    orderNoWaiter: "Order without waiter",
    orderNoCashier: "Order without cashier",
    billQr: "Bill via QR",
    selfServiceKiosk: "Self-service kiosk",
    orderNoWaiterDesc: "For venues with waiters and runners",
    orderNoCashierDesc: "Guest orders at counter via QR",
    billQrDesc: "Bill payment via QR code",
    selfServiceKioskDesc: "Order via self-service terminal",
    describeProblem: "Describe your problem...",
    aiConsultant: "AI Consultant Choco",
    online: "Online",
    typing: "Typing...",
    greeting: "Hi! I'm the Choco assistant. Ask a question about the system — I'll answer briefly and to the point.",
    connectionError: "Connection error. Contact support: +7 708 292 5746",
    generalError: "An error occurred. Contact support: +7 708 292 5746",
    profile: "Profile",
    logout: "Log out",
    notifications: "Notifications",
    help: "Help",
    allModules: "All modules",
    myModules: "My modules",
    coreModules: "Core",
    roleModules: "By role",
    productModules: "By product",
    minutes: "min",
    lesson: "Lesson",
    lessons: "Lessons",
    yourProgress: "Your progress",
    lessonsCompleted: "lessons completed",
    overallProgress: "Overall progress",
    step: "Step",
    of: "of",
    clickHere: "Click here",
    wrongClick: "Wrong! Try again",
    congratulations: "Congratulations!",
    simulatorCompleted: "Trainer completed!",
    webMode: "Web",
    mobileMode: "Mobile",
    questionsInTest: "questions in test",
    correctAnswer: "Correct!",
    wrongAnswer: "Wrong!",
    testCompleted: "Test completed",
    yourScore: "Your score",
    tryAgain: "Try again",
    passedTest: "Test passed!",
    failedTest: "Test failed",
    question: "Question",
    chooseAnswer: "Choose an answer",
    submitAnswer: "Submit",
    nextQuestion: "Next question",
    finishTest: "Finish test",
    changeRole: "Change role",
    formula: "Formula",
    downloadPdf: "Download PDF guide",
    moduleChecklist: "Module checklist",
    correct: "Correct!",
    wrongTryAnother: "Incorrect. Choose another answer.",
    stepXofY: "Step",
    clickHighlighted: "Click the highlighted area",
    nextModule: "Next module",
    congratsCertificate: "Congratulations! You earned a certificate!",
    correctCount: "Correct answers:",
    changeAndRetry: "Change your answers and try again.",
    allCorrect: "Great! All answers are correct!",
    quizNotAdded: "Quiz not added",
    downloadGuide: "Download guide",
    consequence: "Possible consequences",
    trainingPlatform: "Training platform",
    retakeTest: "Retake test",
    checkAnswers: "Check answers",
  },
};

const languageNames: Record<Language, string> = {
  ru: "Рус",
  kk: "Қаз",
  en: "Eng",
};

interface TranslationCache {
  [key: string]: { text: string; timestamp: number };
}

function loadTranslationCache(): TranslationCache {
  try {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return {};
}

function saveTranslationCache(cache: TranslationCache) {
  try {
    const MAX_ENTRIES = 500;
    const entries = Object.entries(cache);
    if (entries.length > MAX_ENTRIES) {
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      cache = Object.fromEntries(entries.slice(0, MAX_ENTRIES));
    }
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languageNames: Record<Language, string>;
  translateText: (text: string, targetLang?: Language) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
    if (saved && (saved === "ru" || saved === "kk" || saved === "en")) return saved;
    return "ru";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, []);

  const translateText = useCallback(async (text: string, targetLang?: Language): Promise<string> => {
    const lang = targetLang || language;
    if (lang === "ru") return text;
    if (!text.trim()) return text;

    const cacheKey = `${lang}:${text}`;
    const cache = loadTranslationCache();
    if (cache[cacheKey]) return cache[cacheKey].text;

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: lang }),
      });
      if (!response.ok) return text;
      const data = await response.json();
      const translated = data.translated || text;

      cache[cacheKey] = { text: translated, timestamp: Date.now() };
      saveTranslationCache(cache);
      return translated;
    } catch {
      return text;
    }
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    languageNames,
    translateText,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

export function useTranslatedText(text: string): string {
  const { language, translateText } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (language === "ru") {
      setTranslated(text);
      return;
    }

    const cacheKey = `${language}:${text}`;
    const cache = loadTranslationCache();
    if (cache[cacheKey]) {
      setTranslated(cache[cacheKey].text);
      return;
    }

    let cancelled = false;
    translateText(text).then((result) => {
      if (!cancelled) setTranslated(result);
    });
    return () => { cancelled = true; };
  }, [text, language, translateText]);

  return translated;
}
