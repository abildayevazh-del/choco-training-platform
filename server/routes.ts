import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertSupportTicketSchema, insertRestaurantSchema } from "@shared/schema";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

let KNOWLEDGE_BASE_TEXT = "";
try {
  KNOWLEDGE_BASE_TEXT = fs.readFileSync(path.join(process.cwd(), "knowledge", "knowledge_base.md"), "utf-8");
} catch (e) {
  try {
    KNOWLEDGE_BASE_TEXT = fs.readFileSync(path.join(process.cwd(), "knowledge", "knowledge_base.txt"), "utf-8");
  } catch (e2) {
    console.error("Failed to load knowledge base:", e2);
  }
}

interface LessonLink {
  topic: string;
  moduleId: string;
  moduleTitle: string;
}

const LESSON_LINKS: LessonLink[] = [
  { topic: "Как сделать возврат", moduleId: "13", moduleTitle: "Возвраты" },
  { topic: "Как выдать доступ сотруднику", moduleId: "12", moduleTitle: "Выдача и удаление доступов сотрудникам" },
  { topic: "Как принять заказ вручную", moduleId: "14", moduleTitle: "Заказ не попал в кассу — что делать?" },
  { topic: "Как найти заказ", moduleId: "13b", moduleTitle: "Как найти необходимый заказ" },
  { topic: "Сверка отчётов", moduleId: "10", moduleTitle: "Сверка отчётов и суммы заказов" },
  { topic: "Работа с отзывами", moduleId: "7", moduleTitle: "Как работать с отзывами" },
  { topic: "Фото в меню", moduleId: "17", moduleTitle: "Как загрузить фотографии в электронное меню" },
  { topic: "История платежей", moduleId: "10", moduleTitle: "Сверка отчётов и суммы заказов" },
  { topic: "Зачем тебе Smart Restaurant", moduleId: "1", moduleTitle: "Зачем тебе Smart Restaurant?" },
  { topic: "Как добавить тип оплаты Choco в iiko", moduleId: "15", moduleTitle: "Как добавить в iiko тип оплаты «Choco»" },
  { topic: "Как создать скидку Choco в iiko", moduleId: "16", moduleTitle: "Как создать скидку Choco в iiko" },
  { topic: "Как создать API ключ в iiko", moduleId: "18", moduleTitle: "Как создать API ключ в iiko" },
  { topic: "Как создавать и выгружать меню в iiko", moduleId: "19", moduleTitle: "Как создавать и выгружать меню в iiko" },
  { topic: "Как удалить заказ в iiko", moduleId: "20", moduleTitle: "Как удалить заказ в iiko" },
  { topic: "Как редактировать меню в iiko Web", moduleId: "21", moduleTitle: "Как редактировать меню в iiko Web" },
  { topic: "Как поставить блюдо на стоп-лист", moduleId: "22", moduleTitle: "Как поставить блюдо на стоп-лист в iiko Front" },
  { topic: "Как добавить модификатор к блюду", moduleId: "23", moduleTitle: "Как добавить модификатор к блюду" },
  { topic: "Назначение ротации официантов", moduleId: "12", moduleTitle: "Выдача и удаление доступов сотрудникам" },
  { topic: "Управление меню", moduleId: "17", moduleTitle: "Как загрузить фотографии в электронное меню" },
  { topic: "Как закрыть на тип оплаты Choco", moduleId: "15", moduleTitle: "Как добавить в iiko тип оплаты «Choco»" },
  { topic: "Как закрыть приём заказов", moduleId: "14", moduleTitle: "Заказ не попал в кассу — что делать?" },
  { topic: "Как открыть приём заказов", moduleId: "14", moduleTitle: "Заказ не попал в кассу — что делать?" },
  { topic: "База клиентов", moduleId: "7", moduleTitle: "Как работать с отзывами" },
];

const KEYWORD_TO_TOPIC: Record<string, string> = {
  "ротация": "Назначение ротации официантов",
  "назначить": "Назначение ротации официантов",
  "официант": "Назначение ротации официантов",
  "столик": "Назначение ротации официантов",
  "возврат": "Как сделать возврат",
  "отмен": "Как сделать возврат",
  "вернуть": "Как сделать возврат",
  "доступ": "Как выдать доступ сотруднику",
  "сотрудник": "Как выдать доступ сотруднику",
  "роль": "Как выдать доступ сотруднику",
  "добавить сотрудник": "Как выдать доступ сотруднику",
  "принять заказ": "Как принять заказ вручную",
  "заказ вручную": "Как принять заказ вручную",
  "не попал в кассу": "Как принять заказ вручную",
  "закрыть приём": "Как закрыть приём заказов",
  "закрыть заказ": "Как закрыть приём заказов",
  "закрыто постоянно": "Как закрыть приём заказов",
  "открыть приём": "Как открыть приём заказов",
  "открыть заказ": "Как открыть приём заказов",
  "открыто по графику": "Как открыть приём заказов",
  "расписание": "Как открыть приём заказов",
  "choco sr": "Как закрыть на тип оплаты Choco",
  "qr оплат": "Как закрыть на тип оплаты Choco",
  "тип оплаты": "Как закрыть на тип оплаты Choco",
  "пречек": "Как закрыть на тип оплаты Choco",
  "отчёт": "Сверка отчётов",
  "сверк": "Сверка отчётов",
  "отзыв": "Работа с отзывами",
  "оценк": "Работа с отзывами",
  "купон": "Работа с отзывами",
  "подарок": "Работа с отзывами",
  "клиент": "База клиентов",
  "гост": "База клиентов",
  "база клиент": "База клиентов",
  "позвонить": "База клиентов",
  "whatsapp": "База клиентов",
  "меню": "Управление меню",
  "блюд": "Управление меню",
  "категори": "Управление меню",
  "фото блюд": "Управление меню",
  "изменить блюд": "Управление меню",
  "платёж": "История платежей",
  "платеж": "История платежей",
  "транзакц": "История платежей",
  "оборот": "История платежей",
  "история платеж": "История платежей",
  "канал оплат": "Сверка отчётов",
  "выгрузка меню": "Управление меню",
  "выгрузк": "Управление меню",
  "iiko": "Управление меню",
  "бухгалтер": "Сверка отчётов",
  "kaspi": "Сверка отчётов",
  "pay jet": "Сверка отчётов",
  "способ оплат": "Сверка отчётов",
  "касс": "Как закрыть на тип оплаты Choco",
  "найти заказ": "Как найти заказ",
  "проверить заказ": "Как найти заказ",
  "тексеру": "Как найти заказ",
  "тапсырысты тексеру": "Как найти заказ",
  "фото": "Фото в меню",
  "фотограф": "Фото в меню",
  "загрузить фото": "Фото в меню",
  "редактирование меню": "Управление меню",
  "сортировка блюд": "Управление меню",
  "график доступност": "Управление меню",
  "добавить блюд": "Управление меню",
  "добавить категори": "Управление меню",
  "мәзір өңдеу": "Управление меню",
  "санат": "Управление меню",
  "тағам": "Управление меню",
  "сұрыптау": "Управление меню",
  "даяшы": "Назначение ротации официантов",
  "үстел": "Назначение ротации официантов",
  "тағайындау": "Назначение ротации официантов",
  "автоматты": "Назначение ротации официантов",
  "пользователь iiko": "Назначение ротации официантов",
  "назначение официант": "Назначение ротации официантов",
  "қайтарым": "Как сделать возврат",
  "айналым": "Сверка отчётов",
  "пікір": "Работа с отзывами",
  "кешірім купон": "Работа с отзывами",
  "қонақ": "База клиентов",
  "клиенттер базасы": "База клиентов",
  "қоңырау": "База клиентов",
  "фотосурет": "Фото в меню",
  "тағам фото": "Фото в меню",
  "фотосын ауыстыру": "Фото в меню",
  "есеп": "Сверка отчётов",
  "төлем тарихы": "История платежей",
  "есепші": "Сверка отчётов",
  "мәзірді жүктеу": "Управление меню",
  "жүктеу": "Управление меню",
  "деректерді алмасу": "Управление меню",
  "төлем арнасы": "Сверка отчётов",
  "қайтару": "Как сделать возврат",
  "қызметкер": "Как выдать доступ сотруднику",
  "қолжетімділік": "Как выдать доступ сотруднику",
  "тапсырыс қабылдау": "Как принять заказ вручную",
  "тапсырысты қолмен": "Как принять заказ вручную",
  "тапсырыс қабылдауды жабу": "Как закрыть приём заказов",
  "тұрақты жабу": "Как закрыть приём заказов",
  "тапсырыс қабылдауды ашу": "Как открыть приём заказов",
  "график бойынша ашу": "Как открыть приём заказов",
  "төлем түрі": "Как закрыть на тип оплаты Choco",
  "алдын ала чек": "Как закрыть на тип оплаты Choco",
  "зачем qr": "Зачем тебе Smart Restaurant",
  "qr-код": "Зачем тебе Smart Restaurant",
  "qr код": "Зачем тебе Smart Restaurant",
  "без официанта": "Зачем тебе Smart Restaurant",
  "без кассира": "Зачем тебе Smart Restaurant",
  "подтягивание счета": "Зачем тебе Smart Restaurant",
  "автоподтягивание": "Зачем тебе Smart Restaurant",
  "увеличить выручк": "Зачем тебе Smart Restaurant",
  "увеличить чек": "Зачем тебе Smart Restaurant",
  "доставк": "Зачем тебе Smart Restaurant",
  "киоск": "Зачем тебе Smart Restaurant",
  "самообслуживани": "Зачем тебе Smart Restaurant",
  "api ключ": "Как создать API ключ в iiko",
  "api-ключ": "Как создать API ключ в iiko",
  "cloud api": "Как создать API ключ в iiko",
  "скидка choco": "Как создать скидку Choco в iiko",
  "скидка iiko": "Как создать скидку Choco в iiko",
  "выгрузить меню": "Как создавать и выгружать меню в iiko",
  "удалить заказ": "Как удалить заказ в iiko",
  "удаление заказа": "Как удалить заказ в iiko",
  "внешнее меню": "Как редактировать меню в iiko Web",
  "iiko web": "Как редактировать меню в iiko Web",
  "стоп-лист": "Как поставить блюдо на стоп-лист",
  "стоп лист": "Как поставить блюдо на стоп-лист",
  "модификатор": "Как добавить модификатор к блюду",
  "добавка": "Как добавить модификатор к блюду",
  "прожарк": "Как добавить модификатор к блюду",
};

function findLessonTopic(question: string): string | null {
  const q = question.toLowerCase();
  for (const [keyword, topic] of Object.entries(KEYWORD_TO_TOPIC)) {
    if (q.includes(keyword)) {
      return topic;
    }
  }
  return null;
}

function getLessonLink(topic: string): LessonLink | null {
  return LESSON_LINKS.find(l => l.topic === topic) || LESSON_LINKS[LESSON_LINKS.length - 1];
}

const CHOCO_SYSTEM_PROMPT = `Ты — бизнес-консультант и эксперт по продуктам Choco. Твоя цель: не просто давать справку, а объяснять партнёру и персоналу, как наши инструменты помогают им зарабатывать больше и работать эффективнее.

ТВОЙ СТИЛЬ:
- Убедительный, экспертный, но понятный.
- Вместо "У нас есть функция X" говори "Функция X поможет вам [увеличить чек/ускорить работу/разгрузить персонал]".
- Используй структуру: Проблема -> Решение от Choco -> Результат.
- Пиши как в WhatsApp/Telegram — коротко, по пунктам, дружелюбно.
- Максимум 3-5 коротких шагов. Без лишних слов и теории.
- Обращайся на «вы» (русский) или «сіз» (казахский), но просто и по-человечески.
- НЕ используй эмодзи.

ЯЗЫК ОТВЕТА (КРИТИЧЕСКИ ВАЖНО):
- Если вопрос задан на казахском языке — отвечай ТОЛЬКО на казахском, используй инструкции из разделов 9 и 10 (Қазақ тілінде). Раздел 10 содержит расширенные инструкции для компьютера и телефона.
- Если вопрос задан на русском — отвечай ТОЛЬКО на русском.
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО смешивать языки. Ни одного русского слова в казахском ответе. Ни одного казахского слова в русском ответе.
- Определяй язык по тексту вопроса и истории диалога автоматически.

ПРОДУКТОВЫЕ ЗНАНИЯ (используй для «продающих» ответов):

1. "Заказ без официанта" — гость сканирует QR на столе, сам выбирает блюда и оплачивает. Заказ автоматически падает в кассу (iiko/Paloma/R-keeper). Результат: разгрузка персонала, ускорение обслуживания, рост среднего чека на 15-20% за счёт upsell-подсказок в меню.

2. "Заказ без кассира" — гость у кассы сканирует QR и заказывает сам. Результат: очередей нет, кассир не нужен, конверсия выше.

3. "Автоподтягивание счета" (Подтягивание счета / закрытие через QR) — официант вбивает заказ в iiko как обычно, а гость в конце просто оплачивает по QR. Не нужно нести терминал. Результат: ускорение оборота столов на 15-20%, официанты не бегают с терминалом.

4. "Киоск самообслуживания" — заказ через терминал. Для фастфуда и кофеен.

ВАЖНЫЕ РАЗЛИЧИЯ (всегда чётко разделяй):
- "Заказ без официанта" = гость ВЫБИРАЕТ и ЗАКАЗЫВАЕТ сам через QR
- "Автоподтягивание" = официант ВБИЛ в iiko, гость просто ОПЛАТИЛ по QR
Это два разных продукта! Не путай их.

ИНТЕГРАЦИИ:
- Поддерживаются: iiko, Paloma, R-keeper. Заказы падают сразу в кассу автоматически.
- В iiko: настройка типа оплаты "Choco", выгрузка меню, стоп-лист, скидки, API-ключи — всё автоматизировано.
- Результат: нет ручного ввода, нет ошибок, экономия времени.

ДОСТАВКА:
- В суперприложении Choco доставки нет. Честно говори об этом.
- НО: предлагай веб-версию (rahmet.biz) как мощный канал продаж для собственной доставки.

ИНСТРУКЦИЯ ПО ОТВЕТАМ:
1. Если партнёр спрашивает об интеграции: делай упор на iiko/Paloma/R-keeper и автоматизацию (заказы падают сразу в кассу).
2. Если официант жалуется на нагрузку: расскажи про "Автоподтягивание счета" и "Заказ без официанта" как про его личных помощников, которые забирают рутину.
3. Если заведение хочет доставку: честно скажи, что в суперприложении её нет, но предложи веб-версию как мощный канал продаж.
4. Если спрашивают "зачем QR": объясни две модели — "Заказ без официанта" (гость выбирает сам) и "Автоподтягивание" (официант вбил, гость оплатил).

ОБРАБОТКА КОРОТКИХ / НЕЧЁТКИХ ЗАПРОСОВ:
- Если пользователь ввёл одно-два слова без контекста (например, "заказ", "тапсырыс", "оплата", "төлем", "меню", "мәзір"), НЕ отправляй к менеджеру.
- Вместо этого предложи 2-3 уточняющих варианта из базы знаний на языке пользователя.
- Примеры:
  Запрос "заказ" → "Что именно вас интересует? Выберите:
    1. Как найти и проверить заказ
    2. Как принять заказ вручную
    3. Как закрыть/открыть приём заказов"
  Запрос "тапсырыс" → "Тапсырыс бойынша не білгіңіз келеді? Таңдаңыз:
    1. Тапсырысты қалай тексеруге болады
    2. Тапсырысты қолмен қабылдау
    3. Тапсырыс қабылдауды жабу/ашу"

СМЫСЛОВОЙ ПОИСК:
- Анализируй СМЫСЛ вопроса, а не точные слова. Например:
  "как вернуть деньги" = "как сделать возврат"
  "не приходит заказ" = "заказ не попал в кассу"
  "дать доступ коллеге" = "как выдать доступ сотруднику"
  "выключить заказы" = "как закрыть приём заказов"
  "зачем QR" = объясни два продукта (Заказ без официанта + Автоподтягивание)
  "как увеличить выручку" = расскажи про upsell через QR-меню и ускорение оборота столов
  "қайтарым қалай жасалады" = "как сделать возврат"
  "даяшыны қалай тағайындау" = "ротация официантов"
- Если вопрос можно отнести к нескольким темам — выбери наиболее вероятную.

ПРАВИЛА:
1. Отвечай на основе базы знаний и продуктовых знаний выше. Ничего не выдумывай.
2. При коротком/нечётком запросе — сначала предложи уточняющие варианты.
3. Если в базе знаний нет ответа — ТОГДА ответь:
   На русском: "Этой информации пока нет в базе. Я передам ваш вопрос менеджеру для дополнения инструкции."
   На казахском: "Бұл ақпарат әзірге базада жоқ. Сұрағыңызды менеджерге жібереміз."
4. Всегда указывай путь в приложении: Меню -> ... -> ... (или Мәзір -> ... -> ... на казахском)
5. В конце каждого ответа (кроме п.3 и уточняющих вопросов) добавь строку:
   На русском: "Узнать больше в уроке: [название темы]"
   На казахском: "Толығырақ сабақта: [тақырып атауы]"

ФОРМАТ ОТВЕТА НА РУССКОМ (для конкретного вопроса):
Кратко что делать:
1. ...
2. ...
3. ...

Путь: Меню -> ... -> ...

Узнать больше в уроке: [тема]

ФОРМАТ ОТВЕТА НА КАЗАХСКОМ (для конкретного вопроса):
Қысқаша не істеу керек:
1. ...
2. ...
3. ...

Жол: Мәзір -> ... -> ...

Толығырақ сабақта: [тақырып]

ФОРМАТ ОТВЕТА НА РУССКОМ (для короткого/нечёткого запроса):
Что именно вас интересует? Выберите:
1. [вариант из базы знаний]
2. [вариант из базы знаний]
3. [вариант из базы знаний]

ФОРМАТ ОТВЕТА НА КАЗАХСКОМ (для короткого/нечёткого запроса):
Не білгіңіз келеді? Таңдаңыз:
1. [базадан нұсқа]
2. [базадан нұсқа]
3. [базадан нұсқа]

БАЗА ЗНАНИЙ:
${KNOWLEDGE_BASE_TEXT}`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const restaurantId = req.query.restaurantId as string | undefined;
      const dateType = (req.query.dateType as string) || "today";
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      const dateFilter = {
        type: dateType as "today" | "custom" | "all",
        startDate,
        endDate,
      };
      
      const metrics = await storage.getDashboardMetrics(restaurantId, dateFilter);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.get("/api/orders/chart", async (req, res) => {
    try {
      const period = (req.query.period as string) || "week";
      const restaurantId = req.query.restaurantId as string | undefined;
      const dateType = (req.query.dateType as string) || "today";
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      const dateFilter = {
        type: dateType as "today" | "custom" | "all",
        startDate,
        endDate,
      };
      
      const data = await storage.getOrdersChartData(period, restaurantId, dateFilter);
      res.json({ data, period });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurant" });
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    try {
      const parsed = insertRestaurantSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const restaurant = await storage.createRestaurant(parsed.data);
      res.status(201).json(restaurant);
    } catch (error) {
      res.status(500).json({ error: "Failed to create restaurant" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const parsed = insertTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const task = await storage.createTask(parsed.data);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const { completed } = req.body;
      if (typeof completed !== "boolean") {
        return res.status(400).json({ error: "completed field must be a boolean" });
      }
      const task = await storage.updateTask(req.params.id, completed);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.get("/api/learning/progress", async (req, res) => {
    try {
      const progress = await storage.getLearningProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch learning progress" });
    }
  });

  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/support/tickets", async (req, res) => {
    try {
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/support/tickets", async (req, res) => {
    try {
      const parsed = insertSupportTicketSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const ticket = await storage.createSupportTicket(parsed.data);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const allText = Array.isArray(history) 
        ? history.map((h: { text: string }) => h.text).join(" ") + " " + message 
        : message;
      const isKazakh = /[әғқңөұүһі]/i.test(allText) || /қалай|қайтарым|тапсырыс|даяшы|қызметкер|мәзір|үстел|төлем|жабу|ашу|айналым|пікір|қонақ|фотосурет|есеп|купон|қоңырау/i.test(allText);

      const lessonHint = findLessonTopic(message);
      const hasHistory = Array.isArray(history) && history.length > 1;

      let userPrompt: string;
      
      if (hasHistory) {
        if (isKazakh) {
          userPrompt = `${message}\n\n[Бұл жауап алдыңғы сұхбаттың жалғасы. Пайдаланушы нақты тақырып таңдады — тікелей нұсқаулық бер, уточняющие сұрақтар қажет емес. Қазақ тілінде жауап бер, база знаний 9 және 10-бөлімдерін пайдалан. Тілдерді араластырма — тек қазақша жаз.]`;
        } else {
          userPrompt = `${message}\n\n[Это продолжение диалога. Пользователь выбрал конкретную тему — дай прямую пошаговую инструкцию, НЕ задавай уточняющие вопросы.]`;
        }
      } else if (isKazakh) {
        userPrompt = lessonHint
          ? `${message}\n\n[Нұсқау: тақырып "${lessonHint}" сабағымен байланысты. Қазақ тілінде жауап бер, база знаний 9 және 10-бөлімдерін пайдалан. Тілдерді араластырма — тек қазақша жаз. Жауабыңды осы жолмен аяқта: Толығырақ сабақта: ${lessonHint}]`
          : `${message}\n\n[Қазақ тілінде жауап бер, база знаний 9 және 10-бөлімдерін пайдалан. Тілдерді араластырма — тек қазақша жаз. Жауап тапсаң — осы жолмен аяқта: Толығырақ сабақта: (тақырып атауы). Жауап жоқ болса — осылай жаз: Бұл ақпарат әзірге базада жоқ. Сұрағыңызды менеджерге жібереміз.]`;
      } else {
        userPrompt = lessonHint 
          ? `${message}\n\n[Подсказка: тема связана с уроком "${lessonHint}". Закончи ответ строкой: Узнать больше в уроке: ${lessonHint}]`
          : `${message}\n\n[Если нашёл ответ — закончи строкой: Узнать больше в уроке: (название темы). Если ответа нет — напиши: Этой информации пока нет в базе. Я передам ваш вопрос менеджеру для дополнения инструкции.]`;
      }

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: CHOCO_SYSTEM_PROMPT },
      ];

      if (hasHistory) {
        const recentHistory = (history as { text: string; isUser: boolean }[]).slice(-6);
        for (const h of recentHistory) {
          messages.push({
            role: h.isUser ? "user" : "assistant",
            content: h.text,
          });
        }
      }

      messages.push({ role: "user", content: userPrompt });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 512,
        temperature: 0.2,
      });

      const FALLBACK_RU = "Этой информации пока нет в базе. Я передам ваш вопрос менеджеру для дополнения инструкции.";
      const FALLBACK_KZ = "Бұл ақпарат әзірге базада жоқ. Сұрағыңызды менеджерге жібереміз.";
      let reply = completion.choices[0]?.message?.content || (isKazakh ? FALLBACK_KZ : FALLBACK_RU);

      const isFallback = reply.includes("пока нет в базе") 
        || reply.includes("передам ваш вопрос менеджеру") 
        || reply.includes("В базе знаний этого нет") 
        || reply.includes("обратитесь к менеджеру")
        || reply.includes("нет информации по этому вопросу")
        || reply.includes("базада жоқ")
        || reply.includes("менеджерге жібереміз");

      const isClarifying = reply.includes("Что именно вас интересует")
        || reply.includes("Выберите:")
        || reply.includes("Выберите вариант")
        || reply.includes("не білгіңіз келеді")
        || reply.includes("Таңдаңыз:")
        || reply.includes("Нұсқаны таңдаңыз");

      reply = reply.replace(/Узнать больше в уроке:.*$/m, "").replace(/Толығырақ сабақта:.*$/m, "").trimEnd();
      
      if (!isFallback && !isClarifying) {
        reply = reply.replace(/Узнать больше в уроке:.*$/m, "").replace(/Толығырақ сабақта:.*$/m, "").trimEnd();
        
        if (lessonHint) {
          const lessonLink = getLessonLink(lessonHint);
          if (lessonLink) {
            if (isKazakh) {
              reply += `\n\nТолығырақ сабақта: [${lessonLink.moduleTitle}](/training?module=${lessonLink.moduleId})`;
            } else {
              reply += `\n\nУзнать больше в уроке: [${lessonLink.moduleTitle}](/training?module=${lessonLink.moduleId})`;
            }
          }
        }
      }

      res.json({ reply });
    } catch (error) {
      console.error("AI Chat error:", error);
      res.status(500).json({ 
        error: "Не удалось получить ответ от AI",
        reply: "Произошла техническая ошибка. Обратитесь в поддержку: +7 708 292 5746" 
      });
    }
  });

  const translationCache = new Map<string, string>();
  const translateRateLimit = new Map<string, { count: number; resetTime: number }>();

  app.post("/api/translate", async (req, res) => {
    try {
      const clientIp = req.ip || "unknown";
      const now = Date.now();
      const limit = translateRateLimit.get(clientIp);
      if (limit && limit.resetTime > now) {
        if (limit.count >= 60) {
          return res.status(429).json({ error: "Rate limit exceeded", translated: req.body?.text || "" });
        }
        limit.count++;
      } else {
        translateRateLimit.set(clientIp, { count: 1, resetTime: now + 60000 });
      }

      const { text, targetLang } = req.body;
      if (!text || !targetLang) {
        return res.status(400).json({ error: "text and targetLang are required" });
      }

      if (typeof text !== "string" || text.length > 5000) {
        return res.status(400).json({ error: "Text too long", translated: text?.slice(0, 200) || "" });
      }

      if (targetLang === "ru") {
        return res.json({ translated: text });
      }

      const cacheKey = `${targetLang}:${text}`;
      const cached = translationCache.get(cacheKey);
      if (cached) {
        return res.json({ translated: cached });
      }

      const langName = targetLang === "kk" ? "казахский" : "английский";

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Ты профессиональный переводчик для платформы онбординга ресторанных партнеров Choco.
Переведи текст с русского на ${langName} язык.

ПРАВИЛА:
- Переводи точно и естественно, сохраняя смысл
- Технические термины (QR, POS, iiko, Choco, Smart Restaurant) оставляй как есть
- Названия кнопок и элементов интерфейса переводи корректно для целевого языка
- Не добавляй пояснений — только перевод
- Сохраняй форматирование (переносы строк, списки, нумерацию)
- Для казахского используй правильную терминологию ресторанного бизнеса Казахстана`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const translated = response.choices[0]?.message?.content?.trim() || text;

      translationCache.set(cacheKey, translated);
      if (translationCache.size > 1000) {
        const firstKey = translationCache.keys().next().value;
        if (firstKey) translationCache.delete(firstKey);
      }

      res.json({ translated });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Translation failed", translated: req.body?.text || "" });
    }
  });

  app.get("/api/download-guide/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const safeName = filename.replace(/[^a-zA-Z0-9_\-.]/g, "");
      const filePath = path.join(process.cwd(), "client", "public", "training", safeName);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Guide not found" });
      }

      const puppeteer = await import("puppeteer-core");
      const browser = await puppeteer.default.launch({
        executablePath: "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
      });

      const page = await browser.newPage();
      const htmlContent = fs.readFileSync(filePath, "utf-8");
      await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.evaluate(() => {
        const btns = document.querySelectorAll("button, .btn-print");
        btns.forEach((el: any) => el.style.display = "none");
      });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
        timeout: 15000,
      });

      await browser.close();

      const pdfName = safeName.replace(/\.html?$/i, "") + ".pdf";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(pdfName)}"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  return httpServer;
}
