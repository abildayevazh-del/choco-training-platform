import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  FileText, 
  Video,
  HelpCircle,
  Clock,
  Lock,
  User,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useRole, ROLES, PRODUCTS, SRProduct, ModuleType } from "@/lib/role-context";
import { useLanguage, useTranslatedText } from "@/lib/i18n";
import { moduleTranslations } from "@/lib/training-i18n";

function TranslatedText({ text }: { text: string }) {
  const translated = useTranslatedText(text);
  return <>{translated}</>;
}

function CircularProgress({ value, size = 80, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-500"
        />
      </svg>
      <span className="absolute text-sm font-bold text-foreground">{Math.round(value)}%</span>
    </div>
  );
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isRealAction?: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  consequence?: string;
}

interface SimulatorStep {
  id: string;
  instruction: string;
  description?: string;
  hotspot: { top: string; left: string; width: string; height: string };
  screenType: "mobile" | "web";
  screenTitle?: string;
  screenElements?: { label: string; highlighted?: boolean; icon?: string }[];
  image?: string;
  resultImage?: string;
  overlays?: { top: string; left: string; width: string; height: string; color?: string }[];
  highlightZone?: { top: string; left: string; width: string; height: string };
  infoText?: string;
  duration?: number;
  feedback?: string;
  sectionTitle?: string;
}

interface SimulatorConfig {
  title: string;
  steps: SimulatorStep[];
}

interface Module {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  progress: number;
  isLocked: boolean;
  isCompleted: boolean;
  videoUrl: string;
  videoUrl2?: string;
  videoDescription?: string;
  content: string;
  whatYouLearn?: string[];
  checklist?: ChecklistItem[];
  quiz?: QuizQuestion[];
  hasVideo: boolean;
  hasDocument: boolean;
  hasTest: boolean;
  hasSimulator?: boolean;
  simulator?: SimulatorConfig;
  moduleType: ModuleType;
  products?: SRProduct[];
  badgeLabel?: string;
  coverGradient?: string;
  coverImage?: string;
  coverIcon?: string;
  guideUrl?: string;
  algorithm?: string;
  isNew?: boolean;
}

/*
 * ═══════════════════════════════════════════════════════════════
 * ШАБЛОН ДЛЯ СОЗДАНИЯ НОВОГО УРОКА
 * ═══════════════════════════════════════════════════════════════
 *
 * Скопируйте этот объект в массив `modules` и заполните данные:
 *
 * {
 *   id: "UNIQUE_ID",              // Уникальный ID (например "15", "16" и т.д.)
 *   number: 15,                   // Порядковый номер
 *   title: "Название урока",      // Привлекательное название
 *   description: "Краткое описание урока в одну строку",
 *   duration: "2:00",             // Длительность (мин:сек)
 *   progress: 0,                  // Всегда 0 для нового
 *   isLocked: false,              // false = доступен
 *   isCompleted: false,           // false для нового
 *   isNew: true,                  // true = бейдж "НОВИНКА"
 *
 *   // ─── БЛОК 1: ВИДЕО ───
 *   videoUrl: "https://www.youtube.com/embed/VIDEO_ID",
 *   hasVideo: true,
 *
 *   // ─── БЛОК 2: ТРЕНАЖЁР ───
 *   hasSimulator: true,           // true если есть скриншоты
 *   simulator: {
 *     title: "Тренажёр: Название",
 *     steps: [
 *       {
 *         screenType: "mobile" as const,  // "mobile" (9:16) или "web" (16:9)
 *         image: "/training/simulator/IMG_XXXX.jpg",
 *         resultImage: "/training/simulator/IMG_XXXX.jpg",
 *         hotspot: { top: "50%", left: "30%", width: "40%", height: "8%" },
 *         instruction: "Текст инструкции для шага",
 *       },
 *     ],
 *   },
 *
 *   // ─── БЛОК 3: ТЕКСТОВАЯ ИНСТРУКЦИЯ ───
 *   hasDocument: true,
 *   content: "Текст инструкции с переносами \\n\\n для абзацев",
 *   algorithm: "Шаг 1 -> Шаг 2 -> Шаг 3 -> формула: A + B = C",
 *   whatYouLearn: [
 *     "Пункт 1 — что узнает сотрудник",
 *     "Пункт 2",
 *   ],
 *
 *   // ─── БЛОК 4: ТЕСТ ───
 *   hasTest: true,
 *   quiz: [
 *     {
 *       id: "q1",
 *       question: "Вопрос?",
 *       options: ["Вариант A", "Вариант B", "Вариант C"],
 *       correctAnswer: 1,         // Индекс правильного (0, 1, 2)
 *       consequence: "Пояснение при неправильном ответе",
 *     },
 *   ],
 *
 *   // ─── ОФОРМЛЕНИЕ КАРТОЧКИ ───
 *   moduleType: "role",           // "core" | "role" | "product"
 *   badgeLabel: "Категория",      // Текст бейджа
 *   coverGradient: "from-purple-500 to-indigo-400",  // Tailwind градиент
 *   coverIcon: "FileText",        // Иконка: FileText, BarChart3, Star, Zap, User, Video, HelpCircle
 *   coverImage: "",               // URL картинки (если пусто — CSS обложка)
 *
 *   // ─── ДОПОЛНИТЕЛЬНО (необязательно) ───
 *   guideUrl: "/training/Guide.html",  // URL для скачивания PDF
 *   products: [],                 // Для moduleType "product"
 * }
 *
 * НЕ ЗАБУДЬТЕ: Добавить id в TRAINING_MODULE_CONFIG в role-context.tsx
 * с нужными ролями: { id: "UNIQUE_ID", type: "role", roles: [...] }
 * ═══════════════════════════════════════════════════════════════
 */

function parseAlgorithm(raw: string): { type: "step" | "formula" | "heading" | "note"; text: string }[] {
  const parts = raw.split("->").map(s => s.trim()).filter(Boolean);
  const result: { type: "step" | "formula" | "heading" | "note"; text: string }[] = [];
  const formulaPattern = /(?:формула|сумма|итого|=|\+\s*\w|—\s*\w|\*\s*\w).*$/i;
  const actionWords = /\b(нажми|выбери|зайди|перейди|открой|найди|введи|кликни|нажмите|выберите|зайдите|перейдите|откройте|найдите|введите|кликните|скачай|скачайте|выгрузи|выгрузите|установи|установите|подтверди|подтвердите|сохрани|сохраните|отметь|отметьте|удали|удалите|добавь|добавьте)\b/gi;

  parts.forEach((part) => {
    if (formulaPattern.test(part)) {
      const cleaned = part.replace(/^формула:\s*/i, "");
      result.push({ type: "formula", text: cleaned });
    } else {
      const expanded = part
        .replace(/^([А-ЯЁA-Z])/, (m) => m)
        .replace(actionWords, (match) => `**${match}**`);
      result.push({ type: "step", text: expanded });
    }
  });
  return result;
}

function AlgorithmRenderer({ algorithm, title }: { algorithm: string; title: string }) {
  const { t } = useLanguage();
  const steps = parseAlgorithm(algorithm);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const footerText = `Choco Бизнес — ${t.trainingPlatform}`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>${title} — Инструкция</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Montserrat', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.7; }
.print-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; padding-bottom: 16px; border-bottom: 3px solid #FE2C55; }
.print-logo { font-size: 24px; font-weight: 700; color: #FE2C55; }
.print-logo span { color: #1a1a1a; }
.print-title { font-size: 22px; font-weight: 700; margin: 24px 0 20px; color: #1a1a1a; }
.print-step { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start; }
.step-number { min-width: 32px; height: 32px; background: #FE2C55; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; }
.step-text { font-size: 15px; padding-top: 5px; }
.step-text strong { font-weight: 700; }
.formula-block { background: #FFF5F7; border: 2px solid #FE2C55; border-radius: 8px; padding: 16px 20px; margin: 18px 0; }
.formula-block div:first-child { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #FE2C55; font-weight: 600; margin-bottom: 4px; }
.formula-block div:last-child { font-size: 18px; font-weight: 700; color: #1a1a1a; }
.print-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999; text-align: center; }
@media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="print-header"><div class="print-logo">Choco <span>бизнес</span></div></div>
<div class="print-title">${title}</div>
${printContent.innerHTML}
<div class="print-footer">${footerText}</div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  let stepNum = 0;

  return (
    <div className="space-y-4">
      <div ref={printRef} className="algorithm-content">
        <div className="space-y-3">
          {steps.map((step, i) => {
            if (step.type === "formula") {
              return (
                <div key={i} className="formula-block rounded-lg p-4 my-3" style={{ background: "#FFF5F7", border: "2px solid #FE2C55" }}>
                  <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: "#FE2C55" }}>{t.formula}</div>
                  <div className="text-lg font-bold text-foreground">{step.text}</div>
                </div>
              );
            }
            stepNum++;
            const currentStep = stepNum;
            return (
              <div key={i} className="print-step flex gap-3 items-start">
                <div className="step-number flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: "#FE2C55" }}>
                  {currentStep}
                </div>
                <div className="step-text text-sm text-foreground pt-1.5 leading-relaxed" dangerouslySetInnerHTML={{
                  __html: step.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />
              </div>
            );
          })}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2 mt-4"
        data-testid="button-print-algorithm"
      >
        <Download className="h-4 w-4" />
        {t.downloadPdf}
      </Button>
    </div>
  );
}

const modules: Module[] = [
  {
    id: "1",
    number: 1,
    title: "Зачем тебе Smart Restaurant?",
    description: "Узнай, как SR помогает работать быстрее и зарабатывать больше",
    duration: "1:20",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    videoUrl: "/training/videos/zachem-sr.MOV",
    content: "Главное из урока:\n\n• SR автоматизирует заказы — меньше ошибок, быстрее обслуживание\n• Гости заказывают сами через QR — персонал фокусируется на качестве\n• Владелец видит аналитику в реальном времени\n• Результат: больше выручка, выше чаевые",
    whatYouLearn: [
      "Что такое система Smart Restaurant и зачем она нужна",
      "Какие задачи SR решает для гостей и персонала",
      "Как SR влияет на выручку и чаевые",
    ],
    checklist: [
      { id: "c1", text: "Просмотреть вводное видео", completed: false },
      { id: "c2", text: "Понять ключевую идею Smart Restaurant", completed: false },
      { id: "c3", text: "Пройти тест по модулю", completed: false },
      { id: "c4", text: "Открой SR и найди раздел «Заказы»", completed: false, isRealAction: true },
    ],
    quiz: [
      {
        id: "q1",
        question: "Для чего заведению нужна система Smart Restaurant?",
        options: [
          "Чтобы заменить кассовую систему",
          "Чтобы ускорить обслуживание, снизить ошибки и улучшить удобство для гостей",
          "Чтобы усложнить процесс заказа",
        ],
        correctAnswer: 1,
        consequence: "Если не понимать назначение SR, ты будешь тратить время на ручные процессы вместо автоматических",
      },
      {
        id: "q2",
        question: "Что может сделать гость с помощью Smart Restaurant?",
        options: [
          "Только посмотреть меню",
          "Заказать и оплатить блюда онлайн без ожидания официанта",
          "Только оставить отзыв",
        ],
        correctAnswer: 1,
        consequence: "Если думать, что гость может 'только посмотреть меню', ты не сможешь помочь ему оформить заказ",
      },
      {
        id: "q3",
        question: "Какую выгоду получает персонал заведения?",
        options: [
          "Им становится сложнее принимать заказы",
          "Заказы появляются автоматически, меньше ошибок и суеты",
          "Они больше времени тратят на оформление заказов",
        ],
        correctAnswer: 1,
        consequence: "Неправильное понимание выгод приведёт к сопротивлению системе и ошибкам на смене",
      },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    moduleType: "core",
    badgeLabel: "Введение",
    coverGradient: "from-red-500 to-orange-400",
    coverImage: "/training/covers/module-1.png",
  },
  {
    id: "12",
    number: 12,
    title: "Выдача и удаление доступов сотрудникам",
    description: "Как добавить нового сотрудника и удалить доступ при увольнении",
    duration: "1:30",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    videoUrl: "https://www.youtube.com/embed/LdvVG3AgOWU?si=NsowK8K6lW7rZqxf&hd=1&vq=hd1080",
    algorithm: "Нажми «Меню» в правом нижнем углу -> Выбери раздел «Сотрудники» -> Нажми «Добавить сотрудника» -> Введи номер телефона сотрудника -> Выбери роль доступа (Администратор, Бариста/Кассир, Официант) -> Выбери филиал -> Нажми «Выбрать и завершить» -> Сотрудник входит в приложение и придумывает пароль",
    content: "Выдача и удаление доступов сотрудникам в Choco Бизнес\n\nЧтобы ваша команда могла работать в системе, каждому сотруднику нужно выдать доступ с правильной ролью. А при увольнении — сразу удалить.\n\nДобавление сотрудника:\n\n1. На главном экране нажмите «Меню» в правом нижнем углу\n2. Выберите раздел «Сотрудники»\n3. Нажмите «Добавить сотрудника»\n4. Введите номер телефона сотрудника\n5. Выберите роль доступа в зависимости от должности\n6. Выберите филиал, на который нужен доступ\n7. Нажмите «Выбрать и завершить»\n8. После этого у сотрудника открывается доступ в Choco Бизнес — ему необходимо войти в приложение через данный номер и придумать пароль\n\nУдаление сотрудника:\n\n1. На главном экране нажмите «Меню» → «Сотрудники»\n2. Найдите номер телефона сотрудника\n3. Нажмите на троеточие «···» справа от его имени\n4. Выберите «Удалить»\n5. Доступ будет отключён мгновенно\n\nРоли и права:\n\nАдминистратор — принятие заказов, оборот, отзывы, добавление сотрудников, возвраты, назначение официантов, управление меню и стоп-листами, редактирование графика работы и информации о заведении\nБариста/Кассир — принятие заказов, оборот, стоп-листы, чаевые\nОфициант — принятие заказов, назначение за столиками, чаевые, активация купонов\n\nВажно:\n\n• Каждый сотрудник должен иметь только необходимый уровень доступа\n• Уволенных сотрудников нужно сразу удалять из системы — иначе они сохранят доступ к данным\n• Менять роль сотрудника можно в любой момент",
    whatYouLearn: [
      "Как добавить нового сотрудника в систему",
      "Как удалить доступ уволенному сотруднику",
      "Какие роли доступны и чем они отличаются",
      "Как назначить филиал и управлять правами",
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    hasSimulator: true,
    simulator: {
      title: "Выдача доступа сотруднику: пошаговый тренажёр",
      steps: [
        {
          id: "e1",
          instruction: "На главном экране нажми «Меню» в правом нижнем углу",
          image: "/training/simulator/IMG_8983.jpg",
          resultImage: "/training/simulator/IMG_8984.jpg",
          hotspot: { top: "87%", left: "73%", width: "22%", height: "6%" },
          screenType: "mobile" as const,
          feedback: "Отлично!",
        },
        {
          id: "e2",
          instruction: "Выбери раздел «Сотрудники»",
          image: "/training/simulator/IMG_8984.jpg",
          resultImage: "/training/simulator/IMG_8985.jpg",
          hotspot: { top: "34%", left: "0%", width: "100%", height: "4%" },
          screenType: "mobile" as const,
          feedback: "Верно!",
        },
        {
          id: "e3",
          instruction: "Нажми кнопку «Добавить сотрудника»",
          image: "/training/simulator/IMG_8985.jpg",
          resultImage: "/training/simulator/IMG_8987.jpg",
          hotspot: { top: "82%", left: "4%", width: "92%", height: "5%" },
          screenType: "mobile" as const,
          feedback: "Молодец!",
        },
        {
          id: "e4",
          instruction: "Введи номер телефона сотрудника и нажми «Добавить сотрудника»",
          image: "/training/simulator/IMG_8987.jpg",
          resultImage: "/training/simulator/IMG_8988.jpg",
          hotspot: { top: "9.5%", left: "1%", width: "98%", height: "4%" },
          screenType: "mobile" as const,
          feedback: "Верно!",
        },
        {
          id: "e5",
          instruction: "Выбери роль для сотрудника — «Официант»",
          image: "/training/simulator/IMG_8988.jpg",
          resultImage: "/training/simulator/IMG_8990.jpg",
          hotspot: { top: "32%", left: "0%", width: "100%", height: "5%" },
          screenType: "mobile" as const,
          feedback: "Отлично!",
        },
        {
          id: "e6",
          instruction: "Нажми «Перейти к выбору сотрудников»",
          image: "/training/simulator/IMG_8988.jpg",
          resultImage: "/training/simulator/IMG_8990.jpg",
          hotspot: { top: "82%", left: "4%", width: "92%", height: "5%" },
          screenType: "mobile" as const,
          feedback: "Верно!",
        },
        {
          id: "e7",
          instruction: "Нажми «Выбрать 1 контакт» для подтверждения",
          image: "/training/simulator/IMG_8990.jpg",
          resultImage: "/training/simulator/IMG_8991.jpg",
          hotspot: { top: "82%", left: "4%", width: "92%", height: "5%" },
          screenType: "mobile" as const,
          feedback: "Молодец!",
        },
        {
          id: "e8",
          instruction: "Выбери филиал, где будет работать сотрудник",
          image: "/training/simulator/IMG_8991.jpg",
          resultImage: "/training/simulator/IMG_8992.jpg",
          hotspot: { top: "44%", left: "0%", width: "100%", height: "4%" },
          screenType: "mobile" as const,
          feedback: "Верно!",
        },
        {
          id: "e9",
          instruction: "Нажми «Выбрать и завершить»",
          image: "/training/simulator/IMG_8992.jpg",
          resultImage: "/training/simulator/IMG_8993.jpg",
          hotspot: { top: "82%", left: "4%", width: "92%", height: "5%" },
          screenType: "mobile" as const,
          feedback: "Сотрудник добавлен!",
        },
        {
          id: "e10",
          instruction: "Готово! Сотрудник добавлен. Нажми «Закрыть»",
          image: "/training/simulator/IMG_8993.jpg",
          resultImage: "/training/simulator/IMG_8995.jpg",
          hotspot: { top: "52%", left: "20%", width: "60%", height: "4%" },
          screenType: "mobile" as const,
          feedback: "Переходим к удалению!",
          sectionTitle: "ДОБАВЛЕНИЕ ЗАВЕРШЕНО",
        },
        {
          id: "e11",
          instruction: "Найди сотрудника и нажми «···» справа от имени",
          image: "/training/simulator/IMG_8995.jpg",
          resultImage: "/training/simulator/IMG_8997.jpg",
          hotspot: { top: "24%", left: "83%", width: "14%", height: "4%" },
          screenType: "mobile" as const,
          feedback: "Верно!",
          sectionTitle: "УДАЛЕНИЕ ДОСТУПА",
        },
        {
          id: "e12",
          instruction: "Нажми «Удалить»",
          image: "/training/simulator/IMG_8997.jpg",
          resultImage: "/training/simulator/IMG_8998.jpg",
          hotspot: { top: "76%", left: "5%", width: "90%", height: "3%" },
          screenType: "mobile" as const,
          feedback: "Сотрудник удалён!",
        },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "Какой путь ведёт к добавлению нового сотрудника?",
        options: [
          "Меню → Настройки → Пользователи",
          "Меню → Сотрудники → Добавить сотрудника",
          "Меню → Аналитика → Команда",
        ],
        correctAnswer: 1,
        consequence: "Если не знать путь, ты потеряешь время и не сможешь быстро выдать доступ новому сотруднику",
      },
      {
        id: "q2",
        question: "Какая роль позволяет управлять меню, стоп-листами и добавлять сотрудников?",
        options: [
          "Официант",
          "Бариста/Кассир",
          "Администратор",
        ],
        correctAnswer: 2,
        consequence: "Если назначить не ту роль, сотрудник получит доступ к разделам, которые ему не нужны, или наоборот — не сможет выполнять свои задачи",
      },
      {
        id: "q3",
        question: "Что нужно сделать сотруднику после того, как ему выдали доступ?",
        options: [
          "Ждать SMS с готовым паролем",
          "Войти в приложение через свой номер и придумать пароль",
          "Попросить администратора создать ему пароль",
        ],
        correctAnswer: 1,
        consequence: "Сотрудник не сможет начать работу, если не знает, что нужно самому войти и придумать пароль",
      },
      {
        id: "q4",
        question: "Как удалить доступ сотруднику?",
        options: [
          "Позвонить в поддержку и попросить удалить",
          "Меню → Сотрудники → найти номер → троеточие → Удалить",
          "Удалить приложение с его телефона",
        ],
        correctAnswer: 1,
        consequence: "Если не удалить бывшего сотрудника, он сохранит доступ к заказам, финансам и данным заведения",
      },
    ],
    moduleType: "role",
    badgeLabel: "Управление",
    coverGradient: "from-blue-500 to-indigo-400",
    coverImage: "/training/covers/module-12.png",
  },
  {
    id: "9",
    number: 9,
    title: "Блюдо закончилось — как поставить на стоп?",
    description: "Стоп-листы в приложении и кассе — не забудь оба!",
    duration: "1:40",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    videoUrl: "/training/stoplist-video.MOV",
    algorithm: "Открой приложение Choco Бизнес -> Нажми на «Предзаказ» -> Зайди в нужный филиал -> Нажми на шестерёнку «Настройки» -> Выбери «Стоп-лист» -> Найди нужное блюдо и поставь галочку -> Нажми «В стоп-лист» -> Выбери период (15 минут / До конца дня) -> Продублируй те же действия в кассовой системе",
    content: "Как поставить блюдо на стоп-лист (Choco Business)\n\nЦель: Своевременно скрывать позиции, которые закончились, чтобы гости не могли их заказать, а персоналу не приходилось делать возвраты.\n\nСпособ 1: Через мобильное приложение\n\nЭтот способ удобен, когда нужно быстро внести изменения прямо «в полях» с телефона.\n\n1. Вход в раздел: На главном экране приложения нажмите на плитку «Предзаказ».\n2. Выбор филиала: Зайдите в нужный филиал (например, Express).\n3. Настройки: В верхнем правом углу нажмите на иконку шестеренки («Настройки»).\n4. Стоп-лист: В открывшемся меню выберите пункт «Стоп-лист».\n5. Выбор блюда: Найдите в списке нужное блюдо (например, «ЯЙЦО ОТВАРНОЕ») и нажмите на пустой квадрат справа, чтобы появилась галочка.\n6. Установка времени: Нажмите красную кнопку «В стоп-лист». В появившемся окне выберите период (например, «До конца дня») и подтвердите действие.\n\nСпособ 2: Через ноутбук\n\nУдобно использовать при работе за компьютером для управления всем меню заведения.\n\n1. Меню инструментов: В левом боковом меню выберите раздел «Инструменты» → «Стоп-лист».\n2. Добавление: Нажмите красную кнопку «Добавить в стоп-лист» в верхнем углу экрана.\n3. Заведение: Выберите нужное заведение из выпадающего списка и нажмите «Далее».\n4. Позиция: Отметьте нужное блюдо (например, «Зеленый чай») галочкой и нажмите «Далее».\n5. Сохранение: Установите период (например, «15 минут») и нажмите кнопку «Сохранить».\n\nВажные правила (Прочитайте обязательно!)\n\nДублирование в кассе: ОБЯЗАТЕЛЬНО повторите те же действия в кассовой системе! Обновление в Choco не меняет данные в вашей внутренней кассе автоматически.\n\nПоследствия: Если забыть один из шагов (не обновить в приложении или в кассе) — гость закажет блюдо, которого по факту нет.",
    whatYouLearn: [
      "Как поставить блюдо на стоп через мобильное приложение",
      "Как поставить блюдо на стоп через ноутбук",
      "Почему нужно дублировать стоп-лист в кассовой системе",
      "Что произойдёт, если забыть обновить одну из систем",
    ],
    checklist: [
      { id: "c1", text: "Пройти тренажёр по стоп-листу", completed: false },
      { id: "c2", text: "Знать путь: Choco → Предзаказ → Настройки → Стоп-лист", completed: false },
      { id: "c3", text: "Понимать, что стоп-лист нужно обновлять в двух местах", completed: false },
      { id: "c4", text: "Пройти тест по модулю", completed: false },
      { id: "c5", text: "Поставь любое блюдо на стоп в приложении и в кассе", completed: false, isRealAction: true },
    ],
    quiz: [
      {
        id: "q1",
        question: "Где нужно ставить блюдо на стоп-лист?",
        options: [
          "Только в приложении Choco",
          "И в приложении, и в кассовой системе",
          "Только в кассовой системе",
        ],
        correctAnswer: 1,
        consequence: "Если обновить только одно место — гость закажет блюдо, которого нет, и будет ждать зря",
      },
      {
        id: "q2",
        question: "Какой путь в приложении ведёт к стоп-листу?",
        options: [
          "Choco → Меню → Редактировать",
          "Choco → Предзаказ → Настройки → Стоп-лист",
          "Choco → Заказы → Отмена",
        ],
        correctAnswer: 1,
        consequence: "Если не знать путь, ты потеряешь время в разгар смены, пока блюдо продолжат заказывать",
      },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    hasSimulator: true,
    simulator: {
      title: "Стоп-лист: пошаговый тренажёр",
      steps: [
        {
          id: "s1",
          instruction: "Нажми «Инструменты» в боковом меню",
          image: "/training/simulator/18.16.41.jpg",
          resultImage: "/training/simulator/18.16.51.jpg",
          hotspot: { top: "52%", left: "0%", width: "7%", height: "11%" },
          overlays: [
            { top: "5%", left: "7%", width: "40%", height: "10%", color: "#F0F0F0" },
          ],
          screenType: "web",
          feedback: "Отлично!",
        },
        {
          id: "s2",
          instruction: "Выбери «Стоп-лист» из подменю",
          image: "/training/simulator/18.16.51.jpg",
          resultImage: "/training/simulator/18.17.30.jpg",
          hotspot: { top: "17%", left: "7%", width: "13%", height: "5%" },
          screenType: "web",
          feedback: "Верно!",
        },
        {
          id: "s3",
          instruction: "Нажми кнопку «Добавить в стоп-лист»",
          image: "/training/simulator/18.17.30.jpg",
          resultImage: "/training/simulator/18.17.39.jpg",
          hotspot: { top: "10%", left: "78%", width: "22%", height: "3.5%" },
          screenType: "web",
          feedback: "Так держать!",
        },
        {
          id: "s4",
          instruction: "Нажми на поле «Выберите заведение»",
          image: "/training/simulator/18.17.39.jpg",
          resultImage: "/training/simulator/18.17.49.jpg",
          hotspot: { top: "39%", left: "38%", width: "28%", height: "5%" },
          overlays: [
            { top: "4%", left: "7%", width: "42%", height: "15%", color: "#F0F0F0" },
          ],
          screenType: "web",
          feedback: "Правильно!",
        },
        {
          id: "s5",
          instruction: "Выбери «TEADOT на Абая» из списка",
          image: "/training/simulator/18.17.49.jpg",
          resultImage: "/training/simulator/18.18.12.jpg",
          hotspot: { top: "50%", left: "38%", width: "28%", height: "5%" },
          overlays: [
            { top: "4%", left: "7%", width: "42%", height: "15%", color: "#F0F0F0" },
          ],
          screenType: "web",
          feedback: "Молодец!",
        },
        {
          id: "s6",
          instruction: "Нажми кнопку «Далее»",
          image: "/training/simulator/18.18.12.jpg",
          resultImage: "/training/simulator/18.18.48.jpg",
          hotspot: { top: "91%", left: "89%", width: "9%", height: "5%" },
          overlays: [
            { top: "11%", left: "25%", width: "13%", height: "5%", color: "#FFFFFF" },
          ],
          screenType: "web",
          feedback: "Отлично!",
        },
        {
          id: "s7",
          instruction: "Отметь «Зелёный чай с жемчугом» галочкой",
          image: "/training/simulator/18.18.48.jpg",
          resultImage: "/training/simulator/18.19.17.jpg",
          hotspot: { top: "59%", left: "87%", width: "5%", height: "6%" },
          screenType: "web",
          feedback: "Точно!",
        },
        {
          id: "s8",
          instruction: "Нажми «Далее» для перехода к шагу 3",
          image: "/training/simulator/18.19.17.jpg",
          resultImage: "/training/simulator/18.19.26.jpg",
          hotspot: { top: "91%", left: "89%", width: "9%", height: "5%" },
          screenType: "web",
          feedback: "Так держать!",
        },
        {
          id: "s9",
          instruction: "Выбери период «15 минут»",
          image: "/training/simulator/18.19.26.jpg",
          resultImage: "/training/simulator/18.20.07.jpg",
          hotspot: { top: "46%", left: "41%", width: "14%", height: "7%" },
          screenType: "web",
          feedback: "Отличная работа!",
        },
        {
          id: "s10",
          instruction: "Нажми «Сохранить»",
          image: "/training/simulator/18.20.07.jpg",
          hotspot: { top: "91%", left: "89%", width: "9%", height: "5%" },
          screenType: "web",
          feedback: "Превосходно!",
        },
        {
          id: "m1",
          instruction: "Нажми на «Меню» в правом нижнем углу экрана",
          image: "/training/simulator/IMG_8926.PNG",
          resultImage: "/training/simulator/IMG_8929.jpg",
          hotspot: { top: "93%", left: "65%", width: "35%", height: "7%" },
          overlays: [
            { top: "3%", left: "10%", width: "80%", height: "5%", color: "#F5F5F5" },
          ],
          screenType: "mobile",
          feedback: "Отлично!",
        },
        {
          id: "m2",
          instruction: "Выбери раздел «Касса»",
          image: "/training/simulator/IMG_8929.jpg",
          resultImage: "/training/simulator/IMG_8930.jpg",
          hotspot: { top: "23%", left: "0%", width: "100%", height: "6%" },
          overlays: [
            { top: "5.5%", left: "0%", width: "100%", height: "8%", color: "#F5F5F5" },
          ],
          screenType: "mobile",
          feedback: "Верно!",
        },
        {
          id: "m3",
          instruction: "Нажми на «Предзаказ»",
          image: "/training/simulator/IMG_8930.jpg",
          resultImage: "/training/simulator/IMG_8932.jpg",
          hotspot: { top: "28%", left: "0%", width: "85%", height: "10%" },
          screenType: "mobile",
          feedback: "Так держать!",
        },
        {
          id: "m4",
          instruction: "Выбери филиал «Express в ЖК 4YOU»",
          image: "/training/simulator/IMG_8932.jpg",
          resultImage: "/training/simulator/IMG_8933.jpg",
          hotspot: { top: "14%", left: "0%", width: "100%", height: "6%" },
          screenType: "mobile",
          feedback: "Правильно!",
        },
        {
          id: "m5",
          instruction: "Нажми на «Настройки» (шестерёнка справа вверху)",
          image: "/training/simulator/IMG_8933.jpg",
          resultImage: "/training/simulator/IMG_8934.jpg",
          hotspot: { top: "5%", left: "75%", width: "25%", height: "5%" },
          screenType: "mobile",
          feedback: "Молодец!",
        },
        {
          id: "m6",
          instruction: "Выбери «Стоп-лист» в меню настроек",
          image: "/training/simulator/IMG_8934.jpg",
          resultImage: "/training/simulator/IMG_8938.jpg",
          hotspot: { top: "76%", left: "5%", width: "90%", height: "7%" },
          screenType: "mobile",
          feedback: "Точно!",
        },
        {
          id: "m7",
          instruction: "Найди «ЯЙЦО ОТВАРНОЕ» и поставь галочку",
          image: "/training/simulator/IMG_8938.jpg",
          resultImage: "/training/simulator/IMG_8939.jpg",
          hotspot: { top: "55%", left: "0%", width: "100%", height: "9%" },
          screenType: "mobile",
          feedback: "Отлично!",
        },
        {
          id: "m8",
          instruction: "Нажми кнопку «В стоп-лист» внизу экрана",
          image: "/training/simulator/IMG_8939.jpg",
          resultImage: "/training/simulator/IMG_8940.jpg",
          hotspot: { top: "91%", left: "10%", width: "80%", height: "5%" },
          screenType: "mobile",
          feedback: "Принято! Сохраняем настройки",
        },
        {
          id: "m9",
          instruction: "Выбери период «До конца дня»",
          image: "/training/simulator/IMG_8940.jpg",
          resultImage: "/training/simulator/IMG_8941.jpg",
          hotspot: { top: "68%", left: "48%", width: "48%", height: "6%" },
          screenType: "mobile",
          feedback: "Принято! Сохраняем настройки",
        },
        {
          id: "m10",
          instruction: "Финальный шаг: жми красную кнопку «В стоп-лист»",
          image: "/training/simulator/IMG_8941.jpg",
          resultImage: "/training/simulator/IMG_8942.jpg",
          hotspot: { top: "90%", left: "5%", width: "90%", height: "6%" },
          screenType: "mobile",
          feedback: "Превосходно!",
        },
      ],
    },
    moduleType: "product",
    products: ["order_no_waiter", "order_no_cashier", "self_service_kiosk"],
    badgeLabel: "Инструкция",
    coverGradient: "from-red-600 to-red-400",
    coverImage: "/training/covers/module-9.png",
    guideUrl: "/training/Choco_StopList_Guide.html",
  },
  {
    id: "7",
    number: 7,
    title: "Как работать с отзывами",
    description: "Превращай негатив в лояльность и улучшай рейтинг заведения",
    duration: "1:15",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    videoUrl: "/training/reviews-video.MOV",
    content: "Главное из урока:\n\n• Отвечай на отзыв в течение 24 часов — это показывает заботу\n• Негативный отзыв = подарок: он показывает, что улучшить\n• Никогда не спорь с гостем публично\n• Критичные жалобы (отравление, грубость) — сразу передавай управляющему",
    whatYouLearn: [
      "Понимать, где смотреть отзывы",
      "Знать правила реакции на отзывы",
      "Понимать важность обратной связи",
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    hasSimulator: true,
    simulator: {
      title: "Работа с отзывами: пошаговый тренажёр",
      steps: [
        {
          id: "r1",
          instruction: "Главная страница Choco Бизнес. Нажми на блок «Отзывы»",
          image: "/training/simulator/IMG_8952.jpg",
          resultImage: "/training/simulator/IMG_8965.jpg",
          hotspot: { top: "79%", left: "10%", width: "80%", height: "11%" },
          screenType: "mobile",
          feedback: "Отлично!",
        },
        {
          id: "r2",
          instruction: "Здесь можно увидеть оценку и отзывы гостей",
          image: "/training/simulator/IMG_8965.jpg",
          resultImage: "/training/simulator/IMG_8961.jpg",
          hotspot: { top: "10%", left: "5%", width: "90%", height: "30%" },
          screenType: "mobile",
          feedback: "Верно!",
        },
        {
          id: "r3",
          instruction: "Нажми «Связаться» рядом с гостем, чтобы увидеть его номер",
          image: "/training/simulator/IMG_8961.jpg",
          resultImage: "/training/simulator/IMG_8962.jpg",
          hotspot: { top: "40%", left: "34%", width: "60%", height: "6%" },
          highlightZone: { top: "28%", left: "3%", width: "94%", height: "22%" },
          screenType: "mobile",
          feedback: "Молодец!",
        },
        {
          id: "r4",
          instruction: "Можно позвонить или написать на WhatsApp. Нажми «Написать на WhatsApp»",
          image: "/training/simulator/IMG_8962.jpg",
          hotspot: { top: "78%", left: "10%", width: "80%", height: "5%" },
          screenType: "mobile",
          feedback: "Ты справился!",
        },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "Гость оставил негативный отзыв. Что нужно сделать в первую очередь?",
        options: [
          "Написать ответный комментарий с оправданием",
          "Связаться с гостем лично (позвонить или написать в WhatsApp)",
          "Удалить отзыв",
        ],
        correctAnswer: 1,
        consequence: "Если спорить публично в комментариях, это увидят другие гости — и рейтинг пострадает ещё больше",
      },
      {
        id: "q2",
        question: "Гость написал, что ему стало плохо после еды. Что делать?",
        options: [
          "Ответить «Спасибо за отзыв, мы учтём»",
          "Сразу сообщить управляющему",
          "Подождать — может, он сам удалит отзыв",
        ],
        correctAnswer: 1,
        consequence: "Жалобы на здоровье — это критичная ситуация, промедление может привести к серьёзным проблемам для заведения",
      },
    ],
    moduleType: "role",
    badgeLabel: "Сервис",
    coverGradient: "from-pink-500 to-rose-400",
    coverImage: "/training/covers/module-7.png",
    guideUrl: "/training/Choco_Reviews_Guide.html",
  },
  {
    id: "10",
    number: 10,
    title: "Сверка отчётов и суммы заказов",
    description: "Как проверять отчёты, сверять суммы заказов и контролировать оплаты",
    duration: "1:30",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    videoUrl: "/training/reports-video.mp4",
    guideUrl: "/training/Choco_Reports_Guide.html",
    algorithm: "Меню -> Отчёты -> Выбери локацию (одну или все сразу) -> Установи период (день, неделя, месяц) -> Проверь поступления по каналам: Choco, Kaspi, POS-терминал -> Формула: Сумма заказов + Бонусы = фактический оборот -> Формула: Сумма заказов - Скидки = сумма к начислению -> Выгрузи отчёт в Excel",
    content: "Инструкция по работе с отчётами и сверкой Choco\n\nСверка данных — необходимый процесс для контроля ваших финансов. В приложении Choco Business отчёты позволяют увидеть детальную картину продаж по всем каналам.\n\nПорядок действий:\n\n1. Вход в систему: На главном экране перейдите в «Меню» → «Отчёты»\n2. Настройка фильтров: Выберите локации (одну конкретную или «Все сразу»). Установите период (день, неделя, месяц или произвольные даты)\n3. Анализ оплат: В отчёте отображаются поступления через разные каналы: Choco (оплата картами, Apple Pay, Google Pay), Kaspi (оплата картой Kaspi), POS-терминал (оплата через терминал на месте)\n4. Экспорт данных: Выгрузите отчёт в формате Excel для детального изучения на компьютере или отправьте его на свою электронную почту прямо из приложения\n\nОсновные формулы сверки:\n\nПри наличии программы лояльности:\nСумма заказов + Бонусы\n(Это ваш фактический оборот с учётом баллов)\n\nПри использовании купонов или акций:\nСумма заказов - Скидки\n(Это сумма, которая поступит к начислению)",
    whatYouLearn: [
      "Как использовать формулы сверки с бонусами и скидками",
      "Как настроить фильтры по локациям и периодам",
      "Как анализировать оплаты по каналам (Choco, Kaspi, POS)",
      "Как выгрузить отчёт в Excel",
    ],
    quiz: [
      {
        id: "q1",
        question: "Где в приложении Choco можно найти раздел «Отчёты»?",
        options: [
          "На главном экране в блоке «История транзакций»",
          "В разделе «Меню» → «Отчёты»",
          "В настройках профиля",
        ],
        correctAnswer: 1,
        consequence: "Без знания, где находятся отчёты, вы не сможете проверить свои начисления и данные по продажам",
      },
      {
        id: "q2",
        question: "Где можно посмотреть комиссию за эквайринг по каждому чеку?",
        options: [
          "В разделе «Настройки»",
          "Нажать кнопку «Способ оплаты» в отчёте",
          "Позвонить в поддержку",
        ],
        correctAnswer: 1,
        consequence: "Без детализации по способу оплаты вы не сможете проверить, сколько комиссии было списано за эквайринг",
      },
      {
        id: "q3",
        question: "Как выгрузить отчёт для бухгалтерии?",
        options: [
          "Сделать скриншот экрана",
          "Нажать кнопку «Выгрузить отчёт» — получите таблицу Excel",
          "Переписать данные вручную",
        ],
        correctAnswer: 1,
        consequence: "Ручное копирование данных занимает много времени и приводит к ошибкам — используйте выгрузку в Excel",
      },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    hasSimulator: true,
    simulator: {
      title: "Отчёты и сверка: пошаговый тренажёр",
      steps: [
        {
          id: "rep1",
          instruction: "Главная страница Choco Бизнес. Нажми на «Меню» внизу экрана",
          image: "/training/simulator/IMG_8970.jpg",
          resultImage: "/training/simulator/IMG_8971.jpg",
          hotspot: { top: "93%", left: "66%", width: "34%", height: "7%" },
          screenType: "mobile",
          feedback: "Отлично! Ты открыл меню",
        },
        {
          id: "rep2",
          instruction: "Найди и нажми на пункт «Отчеты»",
          image: "/training/simulator/IMG_8971.jpg",
          resultImage: "/training/simulator/IMG_8972.jpg",
          hotspot: { top: "28%", left: "0%", width: "100%", height: "6%" },
          screenType: "mobile",
          feedback: "Верно! Раздел отчётов открыт",
        },
        {
          id: "rep3",
          instruction: "Нажми на «Все филиалы», чтобы выбрать нужную локацию",
          image: "/training/simulator/IMG_8973.jpg",
          resultImage: "/training/simulator/IMG_8974.jpg",
          hotspot: { top: "7%", left: "5%", width: "42%", height: "6%" },
          screenType: "mobile",
          feedback: "Молодец! Теперь выбери филиал",
        },
        {
          id: "rep4",
          instruction: "Выбери нужный филиал из списка. Нажми на «Все филиалы»",
          image: "/training/simulator/IMG_8974.jpg",
          resultImage: "/training/simulator/IMG_8975.jpg",
          hotspot: { top: "24%", left: "5%", width: "90%", height: "6%" },
          screenType: "mobile",
          feedback: "Филиал выбран!",
        },
        {
          id: "rep5",
          instruction: "Теперь настрой период. Нажми на «Последние 30 дней»",
          image: "/training/simulator/IMG_8975.jpg",
          resultImage: "/training/simulator/IMG_8977.jpg",
          hotspot: { top: "48%", left: "5%", width: "85%", height: "7%" },
          screenType: "mobile",
          feedback: "Период выбран! Смотрим отчёт",
        },
        {
          id: "rep6",
          instruction: "Изучи сводку. Нажми на «Способ оплаты», чтобы увидеть детализацию",
          image: "/training/simulator/IMG_8977.jpg",
          resultImage: "/training/simulator/IMG_8978.jpg",
          hotspot: { top: "79%", left: "5%", width: "90%", height: "6%" },
          screenType: "mobile",
          feedback: "Отлично! Видишь разбивку по Choco, Kaspi и POS",
        },
        {
          id: "rep7",
          instruction: "Вверху видишь способы оплаты: Choco (карты, Apple/Google Pay), Kaspi (карта Kaspi), POS-терминал. Нажми на любой, чтобы увидеть детализацию по каждому каналу продаж",
          image: "/training/simulator/IMG_8978.jpg",
          resultImage: "/training/simulator/IMG_8978.jpg",
          hotspot: { top: "5%", left: "5%", width: "90%", height: "5%" },
          highlightZone: { top: "4%", left: "3%", width: "94%", height: "7%" },
          screenType: "mobile",
          feedback: "Здесь можно переключаться между Choco, Kaspi и POS",
        },
        {
          id: "rep8",
          instruction: "Теперь нажми «Выгрузить отчет», чтобы сохранить данные",
          image: "/training/simulator/IMG_8978.jpg",
          resultImage: "/training/simulator/IMG_8979.jpg",
          hotspot: { top: "53%", left: "8%", width: "84%", height: "6%" },
          screenType: "mobile",
          feedback: "Сейчас выберем формат выгрузки",
        },
        {
          id: "rep9",
          instruction: "Нажми «Выгрузить в Excel», чтобы скачать отчёт",
          image: "/training/simulator/IMG_8979.jpg",
          resultImage: "/training/simulator/IMG_8980.jpg",
          hotspot: { top: "82%", left: "8%", width: "84%", height: "7%" },
          screenType: "mobile",
          feedback: "Отчёт выгружен! Ты справился!",
        },
      ],
    },
    moduleType: "role",
    badgeLabel: "Финансы",
    coverGradient: "from-emerald-500 to-teal-400",
    coverImage: "/training/covers/module-10.png",
  },
  {
    id: "11",
    number: 11,
    title: "Ваш цифровой помощник: Choco Бизнес",
    description: "Знакомство с платформой: возможности, преимущества и как начать работать",
    duration: "1:30",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    videoUrl: "/training/choco-intro-video.mp4",
    videoDescription: "Личный кабинет Choco Бизнес: Ваш пульт управления прибылью\n\nДобро пожаловать в кабинет партнера! Это пространство, где цифры превращаются в лояльных клиентов, а отзывы - в безупречный сервис. Мы собрали здесь всё, чтобы ваш бизнес рос быстрее и эффективнее",
    content: "Главное из урока:\n\n• Choco Бизнес — это платформа для управления заведением: заказы, меню, оплаты, аналитика и отзывы в одном месте\n• Партнёр получает онлайн-меню, QR-заказы и систему доставки без комиссий маркетплейсов\n• Все инструменты доступны с телефона и ноутбука\n• Цель — увеличить выручку и упростить работу команды",
    whatYouLearn: [
      "Что такое Choco Бизнес и для чего он нужен",
      "Какие возможности даёт платформа партнёру",
      "Как Choco Бизнес помогает увеличить выручку",
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: false,
    moduleType: "core",
    badgeLabel: "Введение",
    coverGradient: "from-red-500 to-pink-400",
    coverImage: "/training/covers/module-11.png",
  },
  {
    id: "13",
    number: 13,
    title: "Возвраты",
    description: "Как оформить возврат заказа клиенту через Choco Бизнес",
    duration: "1:30",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    videoUrl: "https://www.youtube.com/embed/2BngbaL1Edg",
    guideUrl: "/training/Choco_Refund_Guide.html",
    content: "Возвраты в Choco Бизнес\n\nИногда клиент может попросить вернуть деньги за заказ — например, если блюдо оказалось не тем, что ожидалось, или заказ пришёл с ошибкой. В таких случаях важно знать, как правильно оформить возврат.\n\nКогда делается возврат:\n\n• Клиент получил не тот заказ\n• Блюдо оказалось некачественным\n• Клиент отменил заказ до приготовления\n• Ошибка в сумме или позициях заказа\n\nКак оформить возврат:\n\n1. Откройте раздел «Заказы» в приложении\n2. Найдите нужный заказ по номеру или по времени\n3. Откройте детали заказа\n4. Нажмите кнопку «Возврат»\n5. Выберите позиции, которые нужно вернуть (или весь заказ)\n6. Укажите причину возврата\n7. Подтвердите возврат\n8. Деньги вернутся клиенту на карту автоматически\n\nВажные правила:\n\n• Возврат можно сделать только по оплаченным заказам\n• Частичный возврат — можно вернуть отдельные позиции, а не весь заказ\n• Полный возврат — возвращается вся сумма заказа\n• Возврат проходит в течение нескольких рабочих дней в зависимости от банка клиента\n• Каждый возврат фиксируется в системе — администратор видит историю\n\nКто может делать возвраты:\n\n• Администратор — полный доступ к возвратам\n• Бариста/Кассир — только с разрешения администратора\n• Официант — не имеет права на возвраты\n\nЧастые ошибки:\n\n• Не оформлять возврат через систему, а отдавать наличные — это не учитывается в отчётности\n• Забыть указать причину — без причины сложно анализировать, почему происходят возвраты\n• Делать возврат по неоплаченному заказу — система не позволит это сделать",
    whatYouLearn: [
      "Когда нужно оформлять возврат",
      "Как сделать полный и частичный возврат",
      "Кто имеет право на возвраты",
      "Какие ошибки при возвратах допускают чаще всего",
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    hasSimulator: true,
    simulator: {
      title: "Тренажёр: Оформление возврата",
      steps: [
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9025.jpg",
          resultImage: "/training/simulator/IMG_9016.jpg",
          hotspot: { top: "92%", left: "80%", width: "15%", height: "7%" },
          instruction: "На главном экране нажми на кнопку «Меню»",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9016.jpg",
          resultImage: "/training/simulator/IMG_9017.jpg",
          hotspot: { top: "26%", left: "0%", width: "100%", height: "6%" },
          instruction: "В списке выбери пункт «Касса»",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9018.jpg",
          resultImage: "/training/simulator/IMG_9019.jpg",
          hotspot: { top: "31%", left: "0%", width: "100%", height: "8%" },
          instruction: "Перейди в раздел «Предзаказ»",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9020.jpg",
          resultImage: "/training/simulator/IMG_9021.jpg",
          hotspot: { top: "22%", left: "5%", width: "90%", height: "6%" },
          instruction: "Выбери своё заведение / филиал",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9021.jpg",
          resultImage: "/training/simulator/IMG_9022.jpg",
          hotspot: { top: "13%", left: "76%", width: "22%", height: "5%" },
          instruction: "Выберите нужный этап заказа",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9022.jpg",
          resultImage: "/training/simulator/IMG_9023.jpg",
          hotspot: { top: "18%", left: "3%", width: "94%", height: "18%" },
          instruction: "Выбери нужный заказ из списка (нажми на карточку)",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9023.jpg",
          resultImage: "/training/simulator/IMG_9024.jpg",
          hotspot: { top: "71%", left: "3%", width: "40%", height: "4%" },
          instruction: "В деталях заказа нажми «Сделать возврат»",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9024.jpg",
          hotspot: { top: "39%", left: "5%", width: "90%", height: "8%" },
          instruction: "Выбери частичный или полный возврат",
        },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "Как правильно оформить возврат клиенту?",
        options: [
          "Отдать наличные из кассы",
          "Через раздел «Заказы» → найти заказ → нажать «Возврат»",
          "Позвонить в банк клиента",
        ],
        correctAnswer: 1,
        consequence: "Если отдавать наличные вместо оформления через систему, возврат не отразится в отчётности и возникнут расхождения в финансах",
      },
      {
        id: "q2",
        question: "Можно ли вернуть деньги только за часть заказа?",
        options: [
          "Нет, возврат только за весь заказ целиком",
          "Да, можно выбрать конкретные позиции для возврата",
          "Только если сумма возврата больше 5000 тенге",
        ],
        correctAnswer: 1,
        consequence: "Если не знать про частичный возврат, можно вернуть клиенту лишние деньги за позиции, которые были приготовлены правильно",
      },
      {
        id: "q3",
        question: "Кто из сотрудников НЕ имеет права делать возвраты?",
        options: [
          "Администратор",
          "Бариста/Кассир",
          "Официант",
        ],
        correctAnswer: 2,
        consequence: "Если официант попытается сделать возврат, у него не будет доступа — нужно обратиться к администратору",
      },
    ],
    moduleType: "role",
    badgeLabel: "Финансы",
    coverGradient: "from-orange-500 to-amber-400",
    coverImage: "/training/covers/module-13.png",
  },
  {
    id: "13b",
    number: 13.5,
    title: "Как найти необходимый заказ",
    description: "Поиск заказов в приложении Choco Бизнес по номеру, дате и статусу",
    duration: "1:30",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    isNew: true,
    coverIcon: "Search",
    videoUrl: "https://www.youtube.com/embed/EQEeECpraBQ",
    content: "Как найти необходимый заказ в Choco Бизнес\n\nВ процессе работы часто возникает необходимость найти конкретный заказ — например, для проверки деталей, оформления возврата или уточнения информации для клиента. Приложение Choco Бизнес предоставляет удобные инструменты для быстрого поиска.\n\nКогда нужно найти заказ:\n\n• Клиент спрашивает о статусе своего заказа\n• Нужно оформить возврат по конкретному заказу\n• Необходимо проверить состав или сумму заказа\n• Возник вопрос по оплате\n• Нужно найти заказ за определённую дату\n\nГде искать заказы:\n\n1. Откройте приложение Choco Бизнес\n2. Перейдите в раздел «Касса» через меню\n3. Выберите нужный раздел: «Предзаказ», «В работе» или «Завершён»\n4. Используйте фильтры по дате и статусу\n5. Нажмите на карточку заказа для просмотра деталей\n\nСоветы по быстрому поиску:\n\n• Если знаете номер заказа — используйте поиск по номеру\n• Если знаете примерное время — отфильтруйте по дате\n• Завершённые заказы находятся во вкладке «Завершён»\n• Текущие заказы — во вкладке «В работе»\n• Предзаказы на будущее — во вкладке «Предзаказ»",
    whatYouLearn: [
      "Где находится раздел с заказами в приложении",
      "Как использовать фильтры для поиска",
      "Разницу между вкладками заказов",
      "Как быстро найти заказ по номеру или дате",
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    hasSimulator: true,
    simulator: {
      title: "Тренажёр: Поиск транзакции",
      steps: [
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9027.jpg",
          resultImage: "/training/simulator/IMG_9028.jpg",
          hotspot: { top: "92%", left: "80%", width: "15%", height: "7%" },
          instruction: "На главном экране нажми на слово «Меню» (внизу справа)",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9028.jpg",
          resultImage: "/training/simulator/IMG_9029.jpg",
          hotspot: { top: "26%", left: "0%", width: "100%", height: "6%" },
          instruction: "Теперь выбери самый первый пункт — «Касса»",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9029.jpg",
          resultImage: "/training/simulator/IMG_9030.jpg",
          hotspot: { top: "22%", left: "0%", width: "100%", height: "6%" },
          instruction: "Перейди во второй раздел — «История платежей»",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9030.jpg",
          resultImage: "/training/simulator/IMG_9031.jpg",
          hotspot: { top: "6%", left: "4%", width: "28%", height: "3%" },
          instruction: "Чтобы сузить поиск, нажми на кнопку «Фильтр» сверху",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9031.jpg",
          resultImage: "/training/simulator/IMG_9032.jpg",
          hotspot: { top: "50%", left: "2%", width: "96%", height: "5%" },
          instruction: "Настрой дату или филиал и нажми красную кнопку «Применить»",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9032.jpg",
          resultImage: "/training/simulator/IMG_9033.jpg",
          hotspot: { top: "12%", left: "0%", width: "100%", height: "13%" },
          instruction: "В списке найденных транзакций нажми на нужный заказ",
        },
        {
          screenType: "mobile" as const,
          image: "/training/simulator/IMG_9033.jpg",
          hotspot: { top: "47%", left: "4%", width: "92%", height: "5%" },
          instruction: "Готово! Ты видишь все детали транзакции. Нажми «Закрыть»",
        },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "Где в приложении Choco Бизнес можно найти список заказов?",
        options: [
          "В разделе «Настройки»",
          "В разделе «Касса» через меню",
          "В разделе «Отчёты»",
        ],
        correctAnswer: 1,
        consequence: "Если искать заказы не в том разделе, вы потратите время и не сможете быстро помочь клиенту",
      },
      {
        id: "q2",
        question: "В какой вкладке находятся уже выполненные заказы?",
        options: [
          "«В работе»",
          "«Предзаказ»",
          "«Завершён»",
        ],
        correctAnswer: 2,
        consequence: "Если искать завершённый заказ во вкладке «В работе», вы его не найдёте — он уже перемещён в «Завершён»",
      },
      {
        id: "q3",
        question: "Клиент просит проверить заказ, сделанный вчера. Что нужно сделать?",
        options: [
          "Перейти в «Касса» → «Завершён» и найти заказ по дате",
          "Позвонить в техподдержку и попросить найти заказ",
          "Сказать клиенту, что вчерашние заказы уже удалены",
        ],
        correctAnswer: 0,
        consequence: "Все завершённые заказы сохраняются в системе — их всегда можно найти по дате во вкладке «Завершён»",
      },
    ],
    moduleType: "role",
    badgeLabel: "Заказы",
    coverGradient: "from-blue-500 to-cyan-400",
    coverImage: "/training/covers/module-history.png",
  },
  {
    id: "17",
    number: 17,
    title: "Как загрузить фотографии в электронное меню",
    description: "Пошаговая инструкция по загрузке и обновлению фотографий блюд в электронном меню Choco Бизнес",
    duration: "2:00",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/TrM8Qi0-Dy8",
    algorithm: "Меню → Электронное меню → Выбрать блюдо → Загрузить фото → Сохранить",
    content: "Как загрузить фотографии в электронное меню\n\nКрасивые фотографии блюд увеличивают количество заказов. В Choco Бизнес можно легко загрузить и обновить фото для каждой позиции электронного меню.\n\nПошаговый алгоритм:\n\n1. Откройте раздел «Электронное меню» в Choco Бизнес\n2. Найдите нужную категорию блюд\n3. Выберите блюдо, к которому хотите добавить фото\n4. Нажмите на область загрузки изображения\n5. Выберите фотографию из галереи или сделайте новое фото\n6. При необходимости обрежьте или отредактируйте фото\n7. Нажмите «Сохранить»\n\nРекомендации по фотографиям:\n\n• Используйте качественные фото с хорошим освещением\n• Снимайте блюда сверху или под углом 45 градусов\n• Фон должен быть чистым и нейтральным\n• Размер фото — не менее 800x600 пикселей\n• Формат — JPG или PNG\n\nКогда пригодится:\n\n• При добавлении новых блюд в меню\n• При обновлении фотографий сезонных позиций\n• При запуске акций и специальных предложений\n• Для улучшения конверсии заказов через QR Меню",
    whatYouLearn: [
      "Как загрузить фото блюда в электронное меню",
      "Какие требования к качеству фотографий",
      "Как обновить или заменить существующее фото",
      "Как фотографии влияют на заказы",
    ],
    quiz: [
      {
        id: "q1",
        question: "Где в Choco Бизнес можно загрузить фото блюда?",
        options: ["В разделе «Отчёты»", "В разделе «Электронное меню»", "В разделе «Настройки»"],
        correctAnswer: 1,
        consequence: "Фотографии блюд загружаются через раздел «Электронное меню» — там вы выбираете блюдо и добавляете изображение."
      },
      {
        id: "q2",
        question: "Что произойдёт после сохранения фотографии?",
        options: ["Фото сразу появится в QR-меню", "Нужно ждать проверку менеджера", "Фото появится через 24 часа"],
        correctAnswer: 0,
        consequence: "После сохранения фотография мгновенно отображается в QR-меню для гостей — никакой модерации не требуется."
      },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    hasSimulator: true,
    simulator: {
      title: "Тренажёр: Загрузка фото в электронное меню",
      steps: [
        {
          id: "pm1",
          instruction: "На главной странице нажми «Инструменты» в боковом меню слева",
          image: "/training/simulator/photo-menu-step1-main.png",
          resultImage: "/training/simulator/photo-menu-step2-dropdown.png",
          hotspot: { top: "52%", left: "0%", width: "7%", height: "10%" },
          highlightZone: { top: "50%", left: "0%", width: "8%", height: "12%" },
          screenType: "web" as const,
          feedback: "Отлично! Открылось выпадающее меню инструментов",
        },
        {
          id: "pm2",
          instruction: "В выпадающем меню выбери «Меню»",
          image: "/training/simulator/photo-menu-step2-dropdown.png",
          resultImage: "/training/simulator/photo-menu-step3-categories.png",
          hotspot: { top: "10%", left: "7%", width: "14%", height: "5%" },
          highlightZone: { top: "9%", left: "7%", width: "15%", height: "6%" },
          screenType: "web" as const,
          feedback: "Верно! Ты открыл раздел «Меню» — здесь видны все категории",
        },
        {
          id: "pm3",
          instruction: "Выбери категорию и нажми «Открыть блюда»",
          image: "/training/simulator/photo-menu-step3-categories.png",
          resultImage: "/training/simulator/photo-menu-step4-dishes.png",
          hotspot: { top: "55%", left: "74%", width: "16%", height: "4%" },
          highlightZone: { top: "54%", left: "73%", width: "18%", height: "5.5%" },
          screenType: "web" as const,
          feedback: "Молодец! Теперь видны все блюда в этой категории",
        },
        {
          id: "pm4",
          instruction: "Найди нужное блюдо и нажми «Изменить»",
          image: "/training/simulator/photo-menu-step4-dishes.png",
          resultImage: "/training/simulator/photo-menu-step5-edit.png",
          hotspot: { top: "38%", left: "72%", width: "14%", height: "5%" },
          highlightZone: { top: "37%", left: "71%", width: "16%", height: "6.5%" },
          screenType: "web" as const,
          feedback: "Открылась страница редактирования блюда!",
        },
        {
          id: "pm5",
          instruction: "Внеси корректировки в позицию (фото, наименование, описание) и нажми «Сохранить»",
          image: "/training/simulator/photo-menu-step5-edit.png",
          hotspot: { top: "88%", left: "48%", width: "22%", height: "6%" },
          highlightZone: { top: "87%", left: "47%", width: "24%", height: "7.5%" },
          screenType: "web" as const,
          feedback: "Готово! Изменения сохранены и сразу отобразятся в QR-меню для гостей!",
        },
      ],
    },
    moduleType: "role",
    badgeLabel: "Меню",
    guideUrl: "/training/Choco_Photo_Menu_Guide.html",
    coverGradient: "from-orange-500 to-amber-400",
    coverImage: "/training/covers/module-17.png",
  },
  {
    id: "14",
    number: 14,
    title: "Заказ не попал в кассу — что делать?",
    description: "Как найти и решить проблему, если заказ не синхронизировался с кассовой системой",
    duration: "1:40",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    videoUrl: "https://www.youtube.com/embed/dioGgXaclA4",
    algorithm: "Открой приложение Choco Бизнес → Нажми «Меню» → Перейди в «Касса» → Нажми «Предзаказ» → Выбери нужный филиал → На вкладке «Новый» найди заказ → Внеси заказ вручную в кассу → Закрой на способ оплаты «Choco»",
    content: "Заказ не попал в кассовую систему — что делать?\n\nИногда заказ, оплаченный через Choco, может не отобразиться в кассовой системе. Это не значит, что заказ потерян — он сохранён в приложении и его нужно внести вручную.\n\nКак найти заказ, не попавший в кассу:\n\n1. Откройте приложение Choco Бизнес\n2. Нажмите «Меню» в правом нижнем углу\n3. Перейдите в раздел «Касса»\n4. Нажмите «Предзаказ»\n5. Выберите нужный филиал\n6. На вкладке «Новый» будут отображаться все заказы, не попавшие в кассовую систему\n\nЧто делать с таким заказом:\n\n• Если заказ не попал в кассу, его необходимо внести вручную\n• Укажите все содержимое заказа (блюда, напитки, количество)\n• Закройте заказ на способ оплаты «Choco»\n• Это важно для корректной отчётности и учёта\n\nПочему заказ может не попасть в кассу:\n\n• Нет интернета или нестабильное соединение\n• Кассовая система была выключена или перезагружалась\n• Сбой синхронизации между Choco и кассой\n\nВажно:\n\n• Проверяйте вкладку «Новый» в начале и конце каждой смены\n• Все непроведённые заказы нужно вносить в кассу вручную\n• Не удаляйте заказ — это приведёт к расхождению в отчётности\n• При систематических сбоях сообщите администратору",
    whatYouLearn: [
      "Почему заказ может не попасть в кассовую систему",
      "Как проверить статус синхронизации заказа",
      "Как повторить синхронизацию вручную",
      "Что делать, если проблема не решается",
    ],
    checklist: [
      { id: "c1", text: "Понять причины несинхронизации заказов", completed: false },
      { id: "c2", text: "Знать, как проверить статус синхронизации", completed: false },
      { id: "c3", text: "Уметь повторить синхронизацию вручную", completed: false },
      { id: "c4", text: "Пройти тест по модулю", completed: false },
      { id: "c5", text: "Проверь статус синхронизации последних заказов на смене", completed: false, isRealAction: true },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    hasSimulator: true,
    simulator: {
      title: "Заказ не попал в кассу: пошаговый тренажёр",
      steps: [
        {
          id: "m14-s1",
          instruction: "Открой раздел «Касса»",
          image: "/training/simulator/order_menu.jpg",
          resultImage: "/training/simulator/order_kassa.jpg",
          hotspot: { top: "24%", left: "0%", width: "100%", height: "5%" },
          screenType: "mobile" as const,
          feedback: "Отлично!",
        },
        {
          id: "m14-s2",
          instruction: "Нажми на «Предзаказ»",
          image: "/training/simulator/order_kassa.jpg",
          resultImage: "/training/simulator/order_predzakaz.jpg",
          hotspot: { top: "31%", left: "0%", width: "100%", height: "7%" },
          screenType: "mobile" as const,
          feedback: "Верно!",
        },
        {
          id: "m14-s3",
          instruction: "Выбери нужный филиал из списка",
          image: "/training/simulator/order_predzakaz.jpg",
          resultImage: "/training/simulator/order_new.jpg",
          hotspot: { top: "15%", left: "0%", width: "100%", height: "5%" },
          screenType: "mobile" as const,
          feedback: "Так держать!",
        },
        {
          id: "m14-s4",
          instruction: "Нажми на вкладку «Новый»",
          image: "/training/simulator/order_new.jpg",
          resultImage: "/training/simulator/order_new.jpg",
          hotspot: { top: "10%", left: "0%", width: "25%", height: "4%" },
          screenType: "mobile" as const,
          feedback: "Верно!",
        },
        {
          id: "m14-s5",
          instruction: "",
          image: "/training/simulator/order_new.jpg",
          hotspot: { top: "30%", left: "10%", width: "80%", height: "30%" },
          screenType: "mobile" as const,
          feedback: "Отлично! Ты прошёл тренажёр",
          infoText: "Если заказ не попал в кассу, его необходимо внести вручную, указав все содержимое заказа и закрыть на способ оплаты «Choco»",
        },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "Где найти заказ, который не попал в кассу?",
        options: [
          "Меню → Отчёты → Заказы",
          "Меню → Касса → Предзаказ → вкладка «Новый»",
          "Меню → Настройки → История",
        ],
        correctAnswer: 1,
        consequence: "Если не знать путь, ты не сможешь быстро найти потерянный заказ и внести его в кассу",
      },
      {
        id: "q2",
        question: "Что нужно сделать с заказом, который не попал в кассу?",
        options: [
          "Удалить его и попросить гостя заказать заново",
          "Внести вручную в кассу и закрыть на способ оплаты «Choco»",
          "Ничего не делать, он появится автоматически",
        ],
        correctAnswer: 1,
        consequence: "Если не внести заказ вручную, возникнет расхождение в отчётности и учёте",
      },
      {
        id: "q3",
        question: "На какой способ оплаты нужно закрыть заказ, внесённый вручную?",
        options: [
          "Наличные",
          "Банковская карта",
          "Choco",
        ],
        correctAnswer: 2,
        consequence: "Если закрыть на другой способ оплаты, отчётность не сойдётся с фактическими платежами через Choco",
      },
    ],
    moduleType: "role",
    badgeLabel: "Касса",
    coverGradient: "from-blue-500 to-indigo-400",
    coverImage: "/training/covers/module-16.png",
  },
  {
    id: "15",
    number: 15,
    title: "Как добавить в iiko тип оплаты «Choco»",
    description: "Быстрая настройка скидки Choco в системе автоматизации ресторана за 4 простых шага",
    duration: "2:00",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/qlhoYTB__Mc",
    algorithm: "В iiko: «Розничные продажи» → «Типы оплат» → «Добавить» → Наименование: Choco QR, тип: Банковские карты, в чеке: Choco → Галочка «Может приниматься извне» → Ввести уникальный код → Сохранить",
    content: "Эта инструкция поможет вам настроить Choco как способ оплаты (платежную систему), чтобы заказы могли закрываться через банковский терминал или внешние сервисы.\n\nШаг 1. Переход в справочник оплат\nВ главном меню iiko (левая панель) выберите раздел «Розничные продажи».\nВ открывшемся списке выберите пункт «Типы оплат».\n\nШаг 2. Добавление нового типа\nНажмите кнопку «Добавить», чтобы создать новый метод оплаты.\nЗаполните основные поля в появившемся окне:\n\n• Наименование: Choco или Choco QR\n• Тип оплаты: Выберите из выпадающего списка «Банковские карты»\n• Название в чеке: Choco\n\nШаг 3. Настройка прав и интеграции\nВнешние операции: Обязательно установите галочку в поле «Может приниматься извне». Это позволит системе принимать оплаты от внешних сервисов.\n\nКод: Введите любой удобный числовой или буквенный код для этого типа оплаты (например, 99 или CHQ). Этот код должен быть уникальным.\n\nШаг 4. Сохранение\nУбедитесь, что все данные введены верно, и нажмите кнопку «Сохранить».\nПосле этого в списке способов оплаты на кассе появится пункт Choco QR.\n\nПримечание: Если оплата будет проходить и на стороне ресторана, и через внешнее приложение, убедитесь, что настройки прав доступа позволяют кассиру выбирать этот тип оплаты вручную.",
    whatYouLearn: [
      "Где в iiko найти справочник типов оплат",
      "Как правильно создать тип оплаты Choco QR",
      "Зачем включать галочку «Может приниматься извне»",
      "Какой уникальный код задать для типа оплаты",
    ],
    checklist: [
      { id: "c1", text: "Найти «Розничные продажи» → «Типы оплат» в меню iiko", completed: false },
      { id: "c2", text: "Создать тип оплаты Choco QR с типом «Банковские карты»", completed: false },
      { id: "c3", text: "Поставить галочку «Может приниматься извне» и задать код", completed: false },
      { id: "c4", text: "Пройти тест по модулю", completed: false },
      { id: "c5", text: "Настрой тип оплаты Choco в iiko на рабочей смене", completed: false, isRealAction: true },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    quiz: [
      {
        id: "q1",
        question: "Где в iiko найти справочник типов оплат?",
        options: [
          "Настройки → Дисконтная система → Скидки",
          "Розничные продажи → Типы оплат",
          "Отчёты → Способы оплаты",
        ],
        correctAnswer: 1,
        consequence: "Если искать не в том разделе, вы не сможете добавить тип оплаты Choco",
      },
      {
        id: "q2",
        question: "Какую галочку обязательно нужно поставить при создании типа оплаты Choco?",
        options: [
          "Автоматическое списание",
          "Может приниматься извне",
          "Только для безналичного расчёта",
        ],
        correctAnswer: 1,
        consequence: "Без этой галочки система не сможет принимать оплаты от внешних сервисов, таких как Choco",
      },
      {
        id: "q3",
        question: "Какой тип оплаты нужно выбрать из выпадающего списка?",
        options: [
          "Наличные",
          "Банковские карты",
          "Бонусная программа",
        ],
        correctAnswer: 1,
        consequence: "Неправильный тип оплаты приведёт к некорректному отображению в отчётах и на кассе",
      },
    ],
    moduleType: "role",
    badgeLabel: "Касса / iiko",
    coverGradient: "from-sky-500 to-indigo-400",
    coverImage: "/training/covers/module-iiko-payment.png",
  },
  {
    id: "16",
    number: 16,
    title: "Как создать скидку Choco в iiko",
    description: "Быстрая настройка скидки CHOCO QR в дисконтной системе iiko за 4 шага",
    duration: "1:30",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/gSvM5ZMo3-4",
    algorithm: "Открой панель управления iiko → «Дисконтная система» → «Скидки и надбавки» → «Добавить» → Название: CHOCO QR, в чеке: CHQR → Вкладка «Параметры скидки» → Галочка «Фиксированная сумма» → Галочка «Активна» → Сохранить",
    content: "Данное руководство предназначено для быстрой конфигурации скидки Choco в системе автоматизации ресторана.\n\nШаг 1. Переход в настройки\nОткройте панель управления системой.\nВ боковом меню (левая часть экрана) найдите раздел «Дисконтная система».\nВыберите пункт «Скидки и надбавки».\n\nШаг 2. Создание новой записи\nНажмите кнопку «Добавить» на верхней панели.\nВ появившемся окне заполните первую вкладку (Основные свойства):\n\n• Название: CHOCO QR\n• Название в чеке: CHQR\n• Остальные параметры на этой вкладке оставьте без изменений.\n\nШаг 3. Настройки и параметры\nВкладка №2 (Настройки): Ничего не меняйте, оставьте все значения по умолчанию.\n\nВкладка №3 (Параметры скидки):\n• Найдите раздел «Тип»\n• Установите галочку напротив пункта «Фиксированная сумма»\n• Убедитесь, что чекбокс «Активировать» (или «Активна») включен.\n\nШаг 4. Завершение\nНажмите кнопку «Сохранить» (или «ОК»), чтобы применить изменения.\n\nВажно: Проверьте правильность написания названия для чека (CHQR), так как оно будет отображаться в фискальных документах.",
    whatYouLearn: [
      "Где найти раздел «Дисконтная система» в iiko",
      "Как создать скидку CHOCO QR с правильными параметрами",
      "Какие галочки нужно обязательно включить",
      "Почему важно правильно указать название в чеке",
    ],
    checklist: [
      { id: "c1", text: "Найти «Дисконтная система» → «Скидки и надбавки»", completed: false },
      { id: "c2", text: "Создать скидку CHOCO QR с названием в чеке CHQR", completed: false },
      { id: "c3", text: "Поставить галочки «Фиксированная сумма» и «Активна»", completed: false },
      { id: "c4", text: "Пройти тест по модулю", completed: false },
      { id: "c5", text: "Настрой скидку CHOCO QR в iiko на рабочей смене", completed: false, isRealAction: true },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: true,
    quiz: [
      {
        id: "q1",
        question: "В каком разделе iiko нужно создать скидку Choco?",
        options: [
          "Розничные продажи → Типы оплат",
          "Дисконтная система → Скидки и надбавки",
          "Отчёты → Скидки и акции",
        ],
        correctAnswer: 1,
        consequence: "Если искать не в том разделе, вы не сможете создать скидку для Choco",
      },
      {
        id: "q2",
        question: "Какую галочку нужно поставить на вкладке «Параметры скидки» в разделе «Тип»?",
        options: [
          "Процент от суммы заказа",
          "Фиксированная сумма",
          "Бонусная программа",
        ],
        correctAnswer: 1,
        consequence: "Без правильного типа скидка не будет корректно применяться к заказам Choco",
      },
    ],
    moduleType: "role",
    badgeLabel: "Касса / iiko",
    coverGradient: "from-emerald-500 to-teal-400",
    coverImage: "/training/covers/module-iiko-discount.png",
  },
  {
    id: "18",
    number: 18,
    title: "Как создать API ключ в iiko",
    description: "Настройка интеграции внешних сервисов с iiko через Cloud API за 5 шагов",
    duration: "3:00",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/NWtB_kZbKKc",
    algorithm: "В iiko: «Обмен данными» → «Настройка» → Авторизация в iiko Web → «Настройки Cloud API» → «Добавить интеграцию» → Указать имя → Подключить торговые точки → Проверить терминальные группы → Скопировать API-ключ",
    content: "Эта настройка необходима для интеграции внешних сервисов (например, Choco) с вашей системой iiko.\n\nШаг 1. Переход в настройки iiko Web\nВ основном меню iiko перейдите в раздел «Обмен данными».\nОткройте вкладку «Настройка».\nСистема перенаправит вас на страницу iiko Web.\nПройдите авторизацию, используя те же логин и пароль, которые вы используете для входа в iiko Chain или iiko Office.\n\nШаг 2. Создание интеграции (Cloud API)\nВ iiko Web перейдите в раздел «Настройки Cloud API».\nВ правой части экрана найдите кнопку «Добавить интеграцию» (иконка «плюс») и нажмите на неё.\nЗаполните поле «Имя API логина» (укажите понятное название для интеграции).\n\nШаг 3. Подключение торговых точек\nВ окне создания интеграции перейдите в раздел «Подключённые точки» (в правой части экрана).\nНажмите кнопку «Добавить точку» (иконка «плюс»).\nВ появившемся списке выберите нужную организацию, которую вы хотите интегрировать.\nНажмите «Добавить», а затем «Сохранить».\n\nШаг 4. Проверка терминальных групп\nВыйдите из раздела API-ключей и перейдите во вкладку «Организации».\nНайдите вашу организацию в списке и проверьте настройки терминальных групп.\nЕсли видимость для API-ключа отключена, включите её, отметив нужную терминальную группу галочкой.\n\nШаг 5. Получение токена (API-ключа)\nДля завершения процесса интеграции перейдите в раздел «Интеграции».\nВыберите в списке Choco.\nСкопируйте созданный API-ключ. Он понадобится вам для настройки связи между системами.",
    whatYouLearn: [
      "Как перейти в настройки iiko Web через меню «Обмен данными»",
      "Как создать интеграцию в Cloud API",
      "Как подключить торговые точки к интеграции",
      "Как проверить терминальные группы и получить API-ключ",
    ],
    checklist: [
      { id: "c1", text: "Авторизоваться в iiko Web через «Обмен данными» → «Настройка»", completed: false },
      { id: "c2", text: "Создать интеграцию в «Настройки Cloud API»", completed: false },
      { id: "c3", text: "Подключить нужные торговые точки", completed: false },
      { id: "c4", text: "Проверить видимость терминальных групп", completed: false },
      { id: "c5", text: "Скопировать API-ключ для настройки связи с Choco", completed: false, isRealAction: true },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: false,
    moduleType: "role",
    badgeLabel: "iiko / API",
    coverGradient: "from-violet-500 to-purple-400",
    coverImage: "/training/covers/module-iiko-api.png",
  },
  {
    id: "19",
    number: 19,
    title: "Как создавать и выгружать меню в iiko",
    description: "Формирование структуры меню и выгрузка позиций во внешние системы для интеграции с Choco",
    duration: "2:00",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/lgFYlx_y4Eo",
    algorithm: "В iiko: «Обмен данными» → «Выгрузка меню» → «Добавить группу» → Указать название и уровень → Сохранить → Выбрать позиции из номенклатуры → «Добавить выбранные товары» → Сохранить → Выгрузить",
    content: "Эта настройка позволяет отобрать нужные позиции из номенклатуры и выгрузить их во внешние системы (например, для интеграции с Choco).\n\nШаг 1. Переход в раздел выгрузки\nВ левой части экрана iiko найдите раздел «Обмен данными».\nВыберите вкладку «Выгрузка меню».\nИнтерфейс разделен на два окна:\n— Нижнее окно: здесь отображается вся ваша текущая номенклатура.\n— Верхнее окно: здесь настраивается структура меню для внешней выгрузки.\n\nШаг 2. Создание структуры меню\nВ верхнем окне нажмите кнопку «Добавить группу».\nВ появившемся окне заполните данные:\n— Первая строка: укажите название папки (например, «Меню для доставки»).\n— Вторая строка: выберите группу самого высокого уровня из справочника.\nНажмите кнопку «Сохранить».\n\nШаг 3. Добавление позиций в меню\nВ нижнем окне (номенклатура) отметьте галочками все нужные папки с блюдами.\nНажмите кнопку «Добавить выбранные товары», чтобы перенести их в созданную группу в верхнем окне.\n\nВажные правила структуры\nЧтобы выгрузка прошла успешно, соблюдайте следующие правила:\n— В созданную папку самого высокого уровня добавляйте только папки с категориями блюд.\n— Не добавляйте отдельные блюда вне папок.\n— Не создавайте вложенность категорий (нельзя добавлять одну папку с категорией в другую папку с категорией).\n\nШаг 4. Завершение и выгрузка\nПосле того как вы сформировали структуру и добавили все позиции, нажмите кнопку «Сохранить».\nНажмите кнопку «Выгрузить», чтобы отправить меню во внешнюю систему.",
    whatYouLearn: [
      "Как перейти в раздел выгрузки меню в iiko",
      "Как создать структуру групп для внешнего меню",
      "Как добавить позиции из номенклатуры в меню",
      "Какие правила структуры нужно соблюдать для успешной выгрузки",
    ],
    checklist: [
      { id: "c1", text: "Перейти в «Обмен данными» → «Выгрузка меню»", completed: false },
      { id: "c2", text: "Создать группу верхнего уровня с названием", completed: false },
      { id: "c3", text: "Выбрать и добавить нужные позиции из номенклатуры", completed: false },
      { id: "c4", text: "Проверить правила структуры (без вложенности категорий)", completed: false },
      { id: "c5", text: "Сохранить и выгрузить меню во внешнюю систему", completed: false, isRealAction: true },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: false,
    moduleType: "role",
    badgeLabel: "iiko / Меню",
    coverGradient: "from-gray-400 to-gray-300",
    coverImage: "/training/covers/module-iiko-menu.png",
  },
  {
    id: "20",
    number: 20,
    title: "Как удалить заказ в iiko",
    description: "Стандартный процесс отмены или удаления заказа на кассовом терминале iiko Front",
    duration: "1:30",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/TrxVveT5pfk",
    algorithm: "iiko Front → «Заказы» → Выбрать заказ → Подтвердить права (карта / PIN) → Проверить детали → Подтвердить удаление",
    content: "Эта процедура описывает стандартный процесс отмены или удаления заказа непосредственно на кассовом терминале.\n\nШаг 1. Переход к списку заказов\nНа главном экране iiko Front перейдите в раздел «Заказы».\nКнопка этого раздела обычно расположена в левом углу экрана.\n\nШаг 2. Выбор заказа\nВ открывшемся списке найдите и выберите тот заказ, который необходимо удалить.\n\nШаг 3. Подтверждение прав\nПосле выбора заказа система запросит подтверждение прав на выполнение данной операции.\nВ зависимости от настроек вашей кассы:\n— Приложите карту сотрудника к считывателю.\n— Или введите ваш персональный PIN-код.\n\nШаг 4. Завершение удаления\nПроверьте детали заказа ещё раз.\nПодтвердите удаление в диалоговом окне. Если вы подтверждаете отмену, заказ будет удалён из системы.\n\nВажные примечания\nПрава доступа: Если система не запрашивает карту или PIN-код, это означает, что у текущего пользователя уже есть права на удаление без дополнительного подтверждения, либо эта проверка отключена в настройках.\nБезопасность: В большинстве заведений подтверждение картой является обязательным, чтобы избежать случайных отмен или несанкционированных действий персонала.",
    whatYouLearn: [
      "Как перейти к списку заказов в iiko Front",
      "Как выбрать заказ для удаления",
      "Как подтвердить права доступа (карта или PIN-код)",
      "Как завершить процедуру удаления заказа",
    ],
    checklist: [
      { id: "c1", text: "Перейти в раздел «Заказы» на главном экране iiko Front", completed: false },
      { id: "c2", text: "Найти и выбрать нужный заказ из списка", completed: false },
      { id: "c3", text: "Подтвердить права (приложить карту или ввести PIN)", completed: false },
      { id: "c4", text: "Проверить детали и подтвердить удаление заказа", completed: false, isRealAction: true },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: false,
    moduleType: "role",
    badgeLabel: "iiko / Касса",
    coverGradient: "from-gray-400 to-gray-300",
    coverImage: "/training/covers/module-iiko-delete-order.png",
  },
  {
    id: "21",
    number: 21,
    title: "Как редактировать меню в iiko Web",
    description: "Добавление и удаление блюд во внешнем меню через веб-интерфейс iiko для интеграции с Choco",
    duration: "2:00",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/qSmQm99Vveo",
    algorithm: "iiko → «Обмен данными» → «Настройка Transport» → iiko Web → «Внешнее меню» → Папка Choco → «Список блюд» → Добавить / Удалить позиции → «Обновить» для синхронизации",
    content: "Эта инструкция поможет вам добавлять или удалять блюда во внешнем меню (например, для Choco) через веб-интерфейс.\n\nШаг 1. Переход в iiko Web\nВ левом меню основного приложения iiko найдите раздел «Обмен данными».\nВыберите пункт «Настройка Transport».\nВас автоматически перенаправит на страницу iiko Web в браузере.\n\nШаг 2. Поиск нужного меню\nВ боковом меню iiko Web найдите раздел «Внешнее меню».\nВ списке папок найдите и откройте папку «Choco».\nПерейдите во вкладку «Список блюд». Здесь отображаются все категории, которые сейчас находятся в этой папке.\n\nШаг 3. Добавление новых блюд\nВыберите категорию, в которую хотите добавить позицию.\nНажмите на значок шестерёнки в правом верхнем углу.\nВ строке поиска введите название нужного блюда из вашей номенклатуры.\nОтметьте блюдо галочкой и нажмите «Сохранить».\n\nШаг 4. Удаление позиций\nНайдите блюдо, которое нужно убрать из меню, и нажмите на него.\nВ правой части экрана откроется окно с деталями.\nВ левом нижнем углу этого окна нажмите на значок корзины («Удалить»).\n\nШаг 5. Синхронизация (Важно!)\nЧтобы изменения вступили в силу и отобразились на стороне Choco, нажмите кнопку «Обновить» в правом верхнем углу экрана.\nВыберите нужные параметры для обновления данных и подтвердите действие.",
    whatYouLearn: [
      "Как перейти в iiko Web через «Обмен данными»",
      "Как найти внешнее меню и папку Choco",
      "Как добавить новые блюда в категорию",
      "Как удалить позиции из меню",
      "Как синхронизировать изменения с Choco",
    ],
    checklist: [
      { id: "c1", text: "Перейти в iiko Web через «Обмен данными» → «Настройка Transport»", completed: false },
      { id: "c2", text: "Открыть «Внешнее меню» → папку Choco → «Список блюд»", completed: false },
      { id: "c3", text: "Добавить нужные блюда через шестерёнку и поиск", completed: false },
      { id: "c4", text: "Удалить ненужные позиции через значок корзины", completed: false },
      { id: "c5", text: "Нажать «Обновить» для синхронизации с Choco", completed: false, isRealAction: true },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: false,
    moduleType: "role",
    badgeLabel: "iiko / Меню",
    coverGradient: "from-gray-400 to-gray-300",
    coverImage: "/training/covers/module-iiko-edit-menu.png",
  },
  {
    id: "22",
    number: 22,
    title: "Как поставить блюдо на стоп-лист в iiko Front",
    description: "Быстрое добавление блюда в стоп-лист прямо с кассового терминала iiko Front",
    duration: "1:30",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/bWz4ULiLZdU",
    algorithm: "iiko Front → Меню → Выбрать блюдо → Нажать «Стоп-лист» → Подтвердить → Блюдо недоступно для заказа",
    content: "Эта инструкция описывает, как быстро поставить блюдо на стоп-лист непосредственно с кассового терминала iiko Front, чтобы оно стало недоступно для заказа.\n\nШаг 1. Переход в меню\nНа главном экране iiko Front перейдите в раздел с меню блюд.\nВы увидите список категорий и позиций, доступных для заказа.\n\nШаг 2. Выбор блюда\nНайдите категорию, в которой находится нужное блюдо.\nНажмите на блюдо, которое необходимо поставить на стоп.\n\nШаг 3. Добавление в стоп-лист\nВ открывшемся окне с информацией о блюде найдите кнопку «Стоп-лист» или соответствующий значок.\nНажмите на неё, чтобы добавить блюдо в стоп-лист.\nПодтвердите действие, если система запросит подтверждение.\n\nШаг 4. Проверка результата\nПосле добавления блюдо будет отмечено как недоступное — оно не будет отображаться для заказа или будет помечено специальным значком.\nЧтобы снять блюдо со стоп-листа, повторите те же шаги и уберите отметку.\n\nВажные примечания\nСтоп-лист действует до тех пор, пока вы не снимете блюдо вручную или до конца рабочей смены (в зависимости от настроек).\nИзменения в стоп-листе синхронизируются автоматически — блюдо сразу перестаёт быть доступным во всех точках заказа, включая Choco.",
    whatYouLearn: [
      "Как найти нужное блюдо в меню iiko Front",
      "Как добавить блюдо в стоп-лист",
      "Как проверить, что блюдо недоступно для заказа",
      "Как снять блюдо со стоп-листа",
    ],
    checklist: [
      { id: "c1", text: "Перейти в раздел меню на главном экране iiko Front", completed: false },
      { id: "c2", text: "Найти и выбрать нужное блюдо", completed: false },
      { id: "c3", text: "Нажать «Стоп-лист» и подтвердить действие", completed: false },
      { id: "c4", text: "Убедиться, что блюдо отмечено как недоступное", completed: false, isRealAction: true },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: false,
    moduleType: "role",
    badgeLabel: "iiko / Касса",
    coverGradient: "from-gray-400 to-gray-300",
    coverImage: "/training/covers/module-iiko-stoplist.png",
  },
  {
    id: "23",
    number: 23,
    title: "Как добавить модификатор к блюду",
    description: "Настройка модификаторов (соусы, добавки, степень прожарки) для блюд в iiko Office",
    duration: "2:00",
    progress: 0,
    isLocked: false,
    isCompleted: false,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/9tSba19oDjw",
    algorithm: "iiko Office → «Товары и склады» → «Номенклатура» → Выбрать блюдо → «Редактировать» → Блок «Модификаторы» → «Добавить» → Выбрать модификатор → Настроить Min/Max → Сохранить",
    content: "Модификаторы нужны для того, чтобы гость мог выбрать детали заказа: соус, степень прожарки стейка или дополнительные ингредиенты в пиццу.\n\nШаг 1. Переход в справочник номенклатуры\nВ левом меню iiko Office найдите раздел «Товары и склады».\nВ раскрывшемся списке выберите пункт «Номенклатура».\n\nШаг 2. Выбор блюда\nВ списке товаров найдите нужное блюдо, к которому вы хотите прикрепить добавки.\nКликните по нему правой кнопкой мыши и выберите пункт «Редактировать».\n\nШаг 3. Работа с блоком модификаторов\nВ открывшейся карточке блюда обратите внимание на правую часть экрана — там находится блок «Модификаторы».\nНажмите на название позиции (или на пустую область в блоке) и нажмите кнопку «Добавить».\nВ открывшемся списке выберите нужный модификатор или группу модификаторов.\n\nШаг 4. Настройка правил выбора (Min / Max)\nУстановите важные значения:\n— Минимальное количество: сколько модификаторов гость обязан выбрать (например, 1, если выбор обязателен).\n— Максимальное количество: сколько всего добавок можно выбрать для этого блюда.\nНажмите кнопку «Добавить».\n\nШаг 5. Проверка и сохранение\nПосле добавления убедитесь, что модификатор отобразился в списке в правой части карточки блюда.\nНажмите кнопку «Сохранить» в нижней или верхней части окна, чтобы изменения вступили в силу.",
    whatYouLearn: [
      "Как перейти в номенклатуру iiko Office",
      "Как найти и открыть карточку блюда для редактирования",
      "Как добавить модификатор или группу модификаторов",
      "Как настроить минимальное и максимальное количество выбора",
    ],
    checklist: [
      { id: "c1", text: "Перейти в «Товары и склады» → «Номенклатура»", completed: false },
      { id: "c2", text: "Найти блюдо и открыть его на редактирование", completed: false },
      { id: "c3", text: "Добавить нужный модификатор в блоке «Модификаторы»", completed: false },
      { id: "c4", text: "Настроить Min/Max количество выбора", completed: false },
      { id: "c5", text: "Сохранить изменения в карточке блюда", completed: false, isRealAction: true },
    ],
    hasVideo: true,
    hasDocument: true,
    hasTest: false,
    moduleType: "role",
    badgeLabel: "iiko / Меню",
    coverGradient: "from-gray-400 to-gray-300",
    coverImage: "/training/covers/module-iiko-modifier.png",
  },
];

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Award, Camera, ChevronRight, ChevronLeft, ArrowLeft, Trophy, Star, Zap, X, Smartphone, Monitor, MousePointerClick, PartyPopper, RotateCcw, Download, Search, Sparkles } from "lucide-react";
import { 
  getTrainingProgress, 
  saveTrainingProgress, 
  addPoints, 
  completeBlock as completeBlockStorage,
  unlockAchievement,
  earnCertificate,
  getLevel,
  saveModuleStep,
  getModuleProgress,
  type TrainingProgress 
} from "@/lib/training-storage";
import {
  trackCourseStart,
  trackModuleComplete,
  trackQuizResult,
  trackCertificateEarned
} from "@/lib/training-analytics";

interface RunnerModule {
  id: string;
  number: number;
  title: string;
  video: string;
  duration: string;
  points: number;
  content: string;
  quiz: {
    id: string;
    question: string;
    answers: string[];
    correct: number;
    consequence?: string;
  };
}

interface TrainingContentData {
  modules: {
    runner: {
      title: string;
      description: string;
      blocks: RunnerModule[];
      certificate: {
        title: string;
        description: string;
      };
    };
  };
}

function useRunnerModules() {
  const [modules, setModules] = useState<RunnerModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/training/data/content.json")
      .then(res => res.json())
      .then((data: TrainingContentData) => {
        setModules(data.modules.runner.blocks);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load training content:", err);
        setError("Failed to load modules");
        setLoading(false);
      });
  }, []);

  return { modules, loading, error };
}

function RunnerBlockQuiz({ questions, onComplete }: { questions: QuizQuestion[]; onComplete: () => void }) {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const allCorrect = submitted && questions.every(q => answers[q.id] === q.correctAnswer);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Тест для этого блока ещё не добавлен</p>
      </div>
    );
  }

  const getScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (questions.every(q => answers[q.id] === q.correctAnswer)) {
      onComplete();
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    if (submitted) setSubmitted(false);
    setAnswers({...answers, [questionId]: parseInt(value)});
  };

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-foreground">Тест по блоку</h4>
      
      {questions.map((q, qIndex) => (
        <div key={q.id} className="space-y-3">
          <p className="font-medium text-foreground">{qIndex + 1}. {q.question}</p>
          <RadioGroup
            value={answers[q.id] !== undefined ? answers[q.id].toString() : ""}
            onValueChange={(val) => handleAnswerChange(q.id, val)}
            className="space-y-2"
          >
            {q.options.map((option, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  submitted
                    ? idx === q.correctAnswer
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : answers[q.id] === idx
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-transparent"
                    : answers[q.id] === idx
                    ? "border-primary bg-primary/5"
                    : "border-transparent"
                }`}
              >
                <RadioGroupItem value={idx.toString()} id={`${q.id}-opt-${idx}`} />
                <Label htmlFor={`${q.id}-opt-${idx}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}

      {!submitted ? (
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
        >
          {t.checkAnswers}
        </Button>
      ) : (
        <div className="space-y-4">
          {allCorrect ? (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
              <Award className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
              <p className="font-medium text-green-800 dark:text-green-300">
                {t.allCorrect}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                <p className="text-amber-800 dark:text-amber-300">
                  {t.correctCount} {getScore()} {t.of} {questions.length}. {t.changeAndRetry}
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
                data-testid="button-retake-block-test"
              >
                {t.retakeTest}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RunnerOnboarding() {
  const { t } = useLanguage();
  const { modules, loading, error } = useRunnerModules();
  const [progress, setProgress] = useState<TrainingProgress>(() => getTrainingProgress());
  const [completedBlocks, setCompletedBlocks] = useState<string[]>(() => {
    return getTrainingProgress().completedBlocks;
  });
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const TOTAL_POINTS = modules.reduce((sum, m) => sum + m.points, 0);
  const completedCount = completedBlocks.length;
  const earnedPoints = modules.filter(m => completedBlocks.includes(m.id)).reduce((sum, m) => sum + m.points, 0);
  const canGetCertificate = modules.length > 0 && completedCount >= Math.ceil(modules.length * 0.7);

  const activeModule = activeModuleId ? modules.find(b => b.id === activeModuleId) : null;

  useEffect(() => {
    const updated = saveTrainingProgress({ completedBlocks });
    setProgress(updated);
  }, [completedBlocks]);

  const handleBlockComplete = (blockId: string, timeSpent: number = 0) => {
    if (!completedBlocks.includes(blockId)) {
      const newCompleted = [...completedBlocks, blockId];
      setCompletedBlocks(newCompleted);
      const module = modules.find(m => m.id === blockId);
      addPoints(module?.points || 10);
      completeBlockStorage(blockId, 100);
      trackModuleComplete(blockId, timeSpent);
      
      if (completedBlocks.length === 0) {
        unlockAchievement("first_block");
      }
      
      setProgress(getTrainingProgress());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Загрузка модулей...</p>
        </div>
      </div>
    );
  }

  if (error || modules.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error || "Модули не найдены"}</p>
        </div>
      </div>
    );
  }

  const handleGetCertificate = () => {
    if (canGetCertificate) {
      earnCertificate("runner");
      unlockAchievement("certified");
      trackCertificateEarned("runner");
      setShowCertificate(true);
    }
  };

  const startModule = (moduleId: string) => {
    if (completedBlocks.length === 0 && !activeModuleId) {
      trackCourseStart("runner", "runner_onboarding");
    }
    setActiveModuleId(moduleId);
  };

  const closeModule = () => {
    setActiveModuleId(null);
  };

  const currentModuleIndex = activeModule ? modules.findIndex(b => b.id === activeModule.id) : -1;

  const goToPrevModule = () => {
    if (currentModuleIndex > 0) {
      setActiveModuleId(modules[currentModuleIndex - 1].id);
    }
  };

  const goToNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      setActiveModuleId(modules[currentModuleIndex + 1].id);
    }
  };

  if (activeModule) {
    const isCompleted = completedBlocks.includes(activeModule.id);
    
    return (
      <div className="h-full overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={goToPrevModule} disabled={currentModuleIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
            <span className="font-medium text-foreground">
              Модуль {currentModuleIndex + 1}/{modules.length}
            </span>
            <Button variant="ghost" onClick={goToNextModule} disabled={currentModuleIndex === modules.length - 1}>
              Следующий
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>{activeModule.title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={closeModule}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="w-full max-h-[50vh] bg-muted rounded-lg overflow-hidden">
                {activeModule.video ? (
                  <video
                    src={activeModule.video}
                    className="w-full max-h-[50vh] object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <div className="w-full aspect-video max-h-[50vh] flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <div className="text-center space-y-3">
                      <Play className="h-12 w-12 mx-auto text-primary" />
                      <p className="text-muted-foreground">Видео {activeModule.duration}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Интерактивная зона</h3>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="whitespace-pre-line text-sm text-foreground">
                    {activeModule.content}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Квиз: 1 вопрос</h3>
                <ModuleQuizNew 
                  quiz={activeModule.quiz} 
                  onCorrect={() => handleBlockComplete(activeModule.id)}
                  isCompleted={isCompleted}
                />
              </div>

              {isCompleted && currentModuleIndex < modules.length - 1 && (
                <Button className="w-full" onClick={goToNextModule}>
                  Продолжить
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-w-[320px]">
        {showCertificate && (
          <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-green-800 dark:text-green-300">
                {t.congratsCertificate}
              </h2>
              <p className="text-green-700 dark:text-green-400">
                Сертификат раннера SR
              </p>
              <Button onClick={() => setShowCertificate(false)} variant="outline">
                Закрыть
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-center gap-6 p-4">
          <CircularProgress value={(completedCount / modules.length) * 100} size={100} strokeWidth={10} />
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">{completedCount}/{modules.length} модулей</p>
            <p className="text-sm text-muted-foreground">{earnedPoints}/{TOTAL_POINTS} баллов</p>
          </div>
        </div>

        <div className="space-y-3">
          {modules.map((block, idx) => {
            const isCompleted = completedBlocks.includes(block.id);
            
            return (
              <div
                key={block.id}
                className="flex items-center justify-between gap-4 p-4 border rounded-lg"
                data-testid={`module-${block.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <span className="text-sm font-semibold text-primary">{block.number}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Модуль {block.number}: {block.title}</p>
                    <p className="text-sm text-muted-foreground">+{block.points} баллов</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isCompleted && (
                    <Badge className="bg-green-500 text-white hidden sm:inline-flex">Прошёл</Badge>
                  )}
                  <Button 
                    variant={isCompleted ? "outline" : "default"}
                    onClick={() => startModule(block.id)}
                    className="min-h-[48px] min-w-[48px] touch-manipulation"
                  >
                    <Play className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">{isCompleted ? "Повторить" : "Начать"}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Button 
          className="w-full min-h-[48px] touch-manipulation" 
          disabled={!canGetCertificate}
          onClick={handleGetCertificate}
        >
          <Award className="h-5 w-5 mr-2" />
          Получить сертификат
          {!canGetCertificate && (
            <span className="ml-2 text-xs opacity-70">
              ({Math.ceil(modules.length * 0.7)} модулей)
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

interface NewQuizFormat {
  id: string;
  question: string;
  answers: string[];
  correct: number;
}

function ModuleQuizNew({ quiz, onCorrect, isCompleted }: { 
  quiz: NewQuizFormat & { consequence?: string }; 
  onCorrect: () => void;
  isCompleted: boolean;
}) {
  const { t } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(isCompleted);
  const isCorrect = selectedAnswer === quiz.correct;
  const answeredCorrectly = submitted && isCorrect;

  if (!quiz) {
    return <p className="text-muted-foreground">{t.quizNotAdded}</p>;
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setSubmitted(true);
    const isAnswerCorrect = selectedAnswer === quiz.correct;
    trackQuizResult(isAnswerCorrect, quiz.id);
    if (isAnswerCorrect) {
      onCorrect();
    }
  };

  const handleAnswerChange = (val: string) => {
    if (answeredCorrectly) return;
    if (submitted) setSubmitted(false);
    setSelectedAnswer(parseInt(val));
  };

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">{quiz.question}</p>
      <RadioGroup
        value={selectedAnswer?.toString()}
        onValueChange={handleAnswerChange}
        className="space-y-2"
      >
        {quiz.answers.map((answer, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              submitted
                ? idx === quiz.correct
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : selectedAnswer === idx
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-transparent"
                : selectedAnswer === idx
                ? "border-primary bg-primary/5"
                : "border-transparent"
            }`}
          >
            <RadioGroupItem value={idx.toString()} id={`quiz-${quiz.id}-opt-${idx}`} disabled={answeredCorrectly} />
            <Label htmlFor={`quiz-${quiz.id}-opt-${idx}`} className="flex-1 cursor-pointer">
              {answer}
              {submitted && idx === quiz.correct && (
                <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {!submitted ? (
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
        >
          Проверить
        </Button>
      ) : (
        <div className="space-y-3">
          <div className={`p-3 rounded-lg text-center ${
            isCorrect 
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" 
              : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
          }`}>
            {isCorrect ? t.correct : t.wrongTryAnother}
          </div>
          {!isCorrect && quiz.consequence && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                {quiz.consequence}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InteractiveSimulator({ simulator, onComplete, alreadyCompleted }: { simulator: SimulatorConfig; onComplete?: () => void; alreadyCompleted?: boolean }) {
  const { t } = useLanguage();
  const hasWebStepsInit = simulator.steps.some(s => s.screenType === "web");
  const [simulatorMode, setSimulatorMode] = useState<"web" | "mobile">(hasWebStepsInit ? "web" : "mobile");
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(!!alreadyCompleted);
  const [showingResult, setShowingResult] = useState(false);
  const [wrongClick, setWrongClick] = useState(false);
  const [started, setStarted] = useState(!!alreadyCompleted);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [wrongClickCount, setWrongClickCount] = useState(0);
  const advancingRef = useRef(false);
  const hotspotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const chocoRed = "#FE2C55";
  const wrongBlue = "#3B82F6";
  const allSteps = simulator.steps;
  const steps = allSteps.filter(s => s.screenType === simulatorMode);
  const step = steps[currentStep];

  const hasMobileSteps = allSteps.some(s => s.screenType === "mobile");
  const hasWebSteps = allSteps.some(s => s.screenType === "web");

  const handleModeSwitch = (mode: "web" | "mobile") => {
    if (mode === simulatorMode) return;
    setSimulatorMode(mode);
    setCurrentStep(0);
    setCompleted(false);
    setShowingResult(false);
    setWrongClick(false);
    setStarted(!!alreadyCompleted);
    setFeedbackMessage(null);
    setWrongClickCount(0);
    advancingRef.current = false;
  };

  useEffect(() => {
    steps.forEach(s => {
      if (s.resultImage) {
        const img = new Image();
        img.src = s.resultImage;
      }
      if (s.image) {
        const img = new Image();
        img.src = s.image;
      }
    });
  }, [steps]);

  const playClickSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }, []);

  const playWrongSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 220;
      osc.type = "square";
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }, []);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#FE2C55", "#FF6B8A", "#FFD700", "#00D4AA", "#3B82F6"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
        colors,
      });
    }, 500);
  }, []);

  const handleCorrectClick = () => {
    if (advancingRef.current) return;
    advancingRef.current = true;

    playClickSound();

    const fb = step.feedback || t.correct;
    setFeedbackMessage(fb);
    setWrongClickCount(0);

    if (step.resultImage) {
      setShowingResult(true);
      setTimeout(() => {
        setShowingResult(false);
        setFeedbackMessage(null);
        advancingRef.current = false;
        const cs = currentStepRef.current;
        if (cs < steps.length - 1) {
          setCurrentStep(cs + 1);
        } else {
          setCompleted(true);
          fireConfetti();
          onComplete?.();
        }
      }, 900);
    } else {
      setTimeout(() => {
        setFeedbackMessage(null);
        advancingRef.current = false;
        const cs = currentStepRef.current;
        if (cs < steps.length - 1) {
          setCurrentStep(cs + 1);
        } else {
          setCompleted(true);
          fireConfetti();
          onComplete?.();
        }
      }, 600);
    }
  };

  const handleWrongClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (advancingRef.current || showingResult) return;
    if (hotspotRef.current && hotspotRef.current.contains(e.target as Node)) return;
    setWrongClick(true);
    setWrongClickCount(prev => prev + 1);
    playWrongSound();
    setTimeout(() => setWrongClick(false), 600);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setCompleted(false);
    setStarted(false);
    setShowingResult(false);
    setWrongClick(false);
    setFeedbackMessage(null);
    setWrongClickCount(0);
    advancingRef.current = false;
  };

  const getArrowLine = (hotspot: { top: string; left: string; width: string; height: string }) => {
    const hTop = parseFloat(hotspot.top);
    const hLeft = parseFloat(hotspot.left);
    const hWidth = parseFloat(hotspot.width);
    const hHeight = parseFloat(hotspot.height);
    const centerX = hLeft + hWidth / 2;
    const centerY = hTop + hHeight / 2;

    const startX = centerX;
    let startY: number;
    let endY: number;

    if (hTop > 50) {
      startY = hTop - 12;
      endY = hTop;
    } else {
      startY = hTop + hHeight + 12;
      endY = hTop + hHeight;
    }

    if (startY < 2) startY = 2;
    if (startY > 98) startY = 98;

    return { startX, startY, endX: centerX, endY, centerX, centerY };
  };

  const modeToggle = hasMobileSteps && hasWebSteps ? (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted" data-testid="simulator-mode-toggle">
      <button
        onClick={() => handleModeSwitch("web")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          simulatorMode === "web"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid="button-mode-web"
      >
        <Monitor className="h-3.5 w-3.5" />
        Веб
      </button>
      <button
        onClick={() => handleModeSwitch("mobile")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          simulatorMode === "mobile"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid="button-mode-mobile"
      >
        <Smartphone className="h-3.5 w-3.5" />
        Мобильная
      </button>
    </div>
  ) : null;

  if (!started || !step) {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-16 space-y-4 sm:space-y-8">
        {modeToggle && <div className="flex justify-center">{modeToggle}</div>}
        <div className="text-center space-y-2 sm:space-y-3">
          <div
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl mx-auto flex items-center justify-center mb-2 sm:mb-4"
            style={{ background: chocoRed }}
          >
            <MousePointerClick className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-foreground">{simulator.title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto text-base">
            Кликай по подсвеченным элементам на реальных экранах приложения Choco
          </p>
          <div className="flex items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              {simulatorMode === "mobile" ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              {steps.length} шагов
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              ~2 мин
            </span>
          </div>
        </div>
        <button
          onClick={() => setStarted(true)}
          className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: chocoRed }}
          data-testid="button-simulator-start"
        >
          <Play className="h-5 w-5" />
          Начать тренажёр
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-16 space-y-4 sm:space-y-6">
        {modeToggle && <div className="flex justify-center">{modeToggle}</div>}
        <div
          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center sim-completion-pulse"
          style={{ background: `${chocoRed}15` }}
        >
          <PartyPopper className="h-8 w-8 sm:h-12 sm:w-12" style={{ color: chocoRed }} />
        </div>
        <div className="text-center space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-2xl font-bold text-foreground">
            {simulatorMode === "mobile" ? "Мобильный тренажёр пройден!" : "Тренажёр пройден!"}
          </h3>
          <p className="text-muted-foreground max-w-md text-base">
            {simulatorMode === "mobile"
              ? "Молодец! Ты успешно поставил Яйцо отварное на стоп-лист с телефона."
              : "Теперь ты знаешь, как поставить блюдо на стоп-лист в Choco. Попробуй повторить в реальной системе!"}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate text-xs gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {steps.length}/{steps.length} шагов
            </Badge>
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-border bg-card font-medium text-sm transition-all hover:shadow-md"
          data-testid="button-simulator-restart"
        >
          <RotateCcw className="h-4 w-4" />
          Пройти заново
        </button>
      </div>
    );
  }

  const arrowLine = getArrowLine(step.hotspot);
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  const isMobile = simulatorMode === "mobile";

  return (
    <div className="space-y-2 sm:space-y-4" data-testid="simulator-container" ref={containerRef}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3">
          {modeToggle || (
            <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate gap-1.5">
              {isMobile ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
              {isMobile ? "Мобильная версия" : "Веб-версия"}
            </Badge>
          )}
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            {t.stepXofY} {currentStep + 1} {t.of} {steps.length}
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {Math.round(progressPercent)}%
        </span>
      </div>

      <div className="h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%`, background: chocoRed }}
        />
      </div>

      {!isMobile && (
        <div
          className="rounded-xl border px-3 py-2 sm:px-4 sm:py-3 sim-instruction-enter"
          key={`instruction-${currentStep}-${simulatorMode}`}
          style={{ borderColor: chocoRed, background: `${chocoRed}08` }}
        >
          {step.sectionTitle && (
            <div className="text-center mb-2">
              <span className="font-black text-sm tracking-wider" style={{ color: chocoRed }}>{step.sectionTitle}</span>
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
            <MousePointerClick className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" style={{ color: chocoRed }} />
            <p className="font-medium text-foreground text-xs sm:text-sm">{step.instruction}</p>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        {isMobile ? (
          <div className="relative sim-phone-frame" style={{ maxWidth: "100%" }}>
            <div
              className="sim-phone-inner relative rounded-[2rem] sm:rounded-[2.5rem] border-[4px] sm:border-[6px] border-foreground/15 bg-black overflow-hidden shadow-xl flex flex-col"
              style={{ aspectRatio: "9/19.5" }}
            >
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-[20px] bg-black rounded-full z-40" style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.1)" }} />

              <div
                className={`relative flex-1 overflow-hidden bg-white ${wrongClick ? "sim-wrong-flash" : ""}`}
                onClick={handleWrongClick}
              >
                {(() => {
                  const hotspotTopVal = parseFloat(step.hotspot.top);
                  const overlayAtBottom = hotspotTopVal < 15;
                  return (
                    <div
                      className={`absolute left-0 right-0 z-30 px-3 ${overlayAtBottom ? "bottom-0 pb-3 pt-2" : "top-0 pt-7 pb-2"}`}
                      style={{
                        background: "rgba(255,255,255,0.93)",
                        backdropFilter: "blur(8px)",
                        ...(overlayAtBottom
                          ? { borderTop: `2px solid ${chocoRed}` }
                          : { borderBottom: `2px solid ${chocoRed}` }),
                      }}
                    >
                      <div className="w-full h-1 rounded-full bg-gray-200 mb-2">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: chocoRed }} />
                      </div>
                      {step.sectionTitle && (
                        <div
                          className="text-center mb-1.5 sim-instruction-enter"
                          key={`mobile-section-${currentStep}`}
                        >
                          <span className="font-black text-[12px] tracking-wider" style={{ color: chocoRed }}>{step.sectionTitle}</span>
                        </div>
                      )}
                      <div
                        className="flex items-center gap-2 sim-instruction-enter"
                        key={`mobile-instruction-${currentStep}`}
                      >
                        <MousePointerClick className="h-3.5 w-3.5 flex-shrink-0" style={{ color: chocoRed }} />
                        <p className="font-medium text-gray-900 text-[11px] leading-tight">{step.instruction}</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="relative w-full">
                  <img
                    src={showingResult && step.resultImage ? step.resultImage : step.image}
                    alt={`${t.stepXofY} ${currentStep + 1}`}
                    className="w-full h-auto block select-none"
                    draggable={false}
                    data-testid="simulator-step-image"
                  />

                  {!showingResult && step.overlays && step.overlays.map((ov, i) => (
                    <div
                      key={`m-overlay-${i}`}
                      className="absolute pointer-events-none"
                      style={{
                        top: ov.top,
                        left: ov.left,
                        width: ov.width,
                        height: ov.height,
                        background: ov.color || "#F0F0F0",
                        zIndex: 1,
                      }}
                    />
                  ))}

                  {!showingResult && step.infoText && (
                    <div
                      className="absolute pointer-events-none flex items-center justify-center px-3"
                      style={{
                        top: "20%",
                        left: "5%",
                        width: "90%",
                        height: "auto",
                        zIndex: 10,
                      }}
                    >
                      <div style={{
                        background: "rgba(255,255,255,0.95)",
                        borderRadius: "12px",
                        padding: "16px 14px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                      }}>
                        <p className="text-center font-medium leading-relaxed" style={{ color: "#1a1a1a", fontSize: "12px" }}>
                          {step.infoText}
                        </p>
                      </div>
                    </div>
                  )}

                  {!showingResult && step.highlightZone && (
                    <div
                      className="absolute z-5 pointer-events-none"
                      style={{
                        top: step.highlightZone.top,
                        left: step.highlightZone.left,
                        width: step.highlightZone.width,
                        height: step.highlightZone.height,
                        borderRadius: "12px",
                        border: `2.5px dashed ${chocoRed}80`,
                        background: `${chocoRed}08`,
                        animation: "sim-fade-in 0.5s ease",
                      }}
                    />
                  )}

                  {!showingResult && (
                    <div
                      ref={hotspotRef}
                      onClick={(e) => { e.stopPropagation(); handleCorrectClick(); }}
                      className={`absolute cursor-pointer z-10 ${!step.highlightZone && !step.infoText ? "sim-hotspot-pulse" : ""}`}
                      style={{
                        top: step.hotspot.top,
                        left: step.hotspot.left,
                        width: step.hotspot.width,
                        height: step.hotspot.height,
                        borderRadius: "4px",
                        border: step.highlightZone || step.infoText ? "none" : "3px solid #FE2C55",
                        background: step.highlightZone || step.infoText ? "transparent" : `${chocoRed}10`,
                        transition: "all 0.3s ease",
                      }}
                      data-testid="simulator-hotspot"
                    />
                  )}

                  {!showingResult && !wrongClick && !step.infoText && (
                    <svg
                      className="absolute inset-0 z-20 pointer-events-none"
                      width="100%"
                      height="100%"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      style={{ filter: "drop-shadow(0 1px 3px rgba(254,44,85,0.3))" }}
                    >
                      <defs>
                        <marker id="arrowhead-mobile" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto" fill="#FE2C55">
                          <polygon points="0 0, 8 3, 0 6" />
                        </marker>
                      </defs>
                      <line
                        x1={arrowLine.startX}
                        y1={arrowLine.startY}
                        x2={arrowLine.endX}
                        y2={arrowLine.endY}
                        stroke="#FE2C55"
                        strokeWidth="0.5"
                        strokeDasharray="1,0.6"
                        markerEnd="url(#arrowhead-mobile)"
                      />
                      <circle cx={arrowLine.startX} cy={arrowLine.startY} r="0.8" fill="#FE2C55" />
                    </svg>
                  )}
                </div>

                {wrongClick && (
                  <div className="absolute inset-0 z-30 pointer-events-none sim-blue-flash-overlay" />
                )}

                {wrongClick && wrongClickCount > 2 && (
                  <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg text-white text-[10px] font-medium pointer-events-none whitespace-nowrap"
                    style={{ background: `${wrongBlue}E6`, animation: "sim-fade-in 0.15s ease" }}
                  >
                    {t.clickHighlighted}
                  </div>
                )}

                {feedbackMessage && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 sim-feedback-toast">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold"
                      style={{ background: "rgba(34,197,94,0.92)", backdropFilter: "blur(8px)" }}>
                      <CheckCircle2 className="h-3 w-3" />
                      {feedbackMessage}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 bg-white" style={{ height: 16 }}>
                <div className="mx-auto mt-2 w-28 h-1 rounded-full bg-gray-400" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full sim-web-frame" style={{ maxWidth: 900, aspectRatio: "2940/1592" }}>
            <div
              className={`sim-web-inner relative rounded-xl overflow-hidden ${wrongClick ? "sim-wrong-flash" : ""}`}
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: wrongClick ? `2px solid ${wrongBlue}` : "1px solid hsl(var(--border))" }}
              onClick={handleWrongClick}
            >
              <img
                src={showingResult && step.resultImage ? step.resultImage : step.image}
                alt={`${t.stepXofY} ${currentStep + 1}`}
                className="w-full h-auto block select-none"
                draggable={false}
                data-testid="simulator-step-image"
              />

              {!showingResult && step.overlays && step.overlays.map((ov, i) => (
                <div
                  key={`overlay-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    top: ov.top,
                    left: ov.left,
                    width: ov.width,
                    height: ov.height,
                    background: ov.color || "#F0F0F0",
                    zIndex: 1,
                  }}
                />
              ))}

              {!showingResult && step.infoText && (
                <div
                  className="absolute pointer-events-none flex items-center justify-center px-6"
                  style={{
                    top: "20%",
                    left: "10%",
                    width: "80%",
                    height: "auto",
                    zIndex: 10,
                  }}
                >
                  <div style={{
                    background: "rgba(255,255,255,0.95)",
                    borderRadius: "12px",
                    padding: "20px 18px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                  }}>
                    <p className="text-center font-medium leading-relaxed" style={{ color: "#1a1a1a", fontSize: "14px" }}>
                      {step.infoText}
                    </p>
                  </div>
                </div>
              )}

              {!showingResult && step.highlightZone && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: step.highlightZone.top,
                    left: step.highlightZone.left,
                    width: step.highlightZone.width,
                    height: step.highlightZone.height,
                    borderRadius: "8px",
                    border: `2.5px dashed ${chocoRed}80`,
                    background: `${chocoRed}08`,
                    animation: "sim-fade-in 0.5s ease",
                    zIndex: 5,
                  }}
                />
              )}

              {!showingResult && (
                <div
                  ref={hotspotRef}
                  onClick={(e) => { e.stopPropagation(); handleCorrectClick(); }}
                  className={`absolute cursor-pointer z-10 ${!step.infoText ? "sim-hotspot-pulse" : ""}`}
                  style={{
                    top: step.hotspot.top,
                    left: step.hotspot.left,
                    width: step.hotspot.width,
                    height: step.hotspot.height,
                    borderRadius: "6px",
                    border: step.infoText ? "none" : "3px solid #FE2C55",
                    background: step.infoText ? "transparent" : `${chocoRed}10`,
                    transition: "all 0.3s ease",
                  }}
                  data-testid="simulator-hotspot"
                />
              )}

              {!showingResult && !wrongClick && !step.infoText && (
                <svg
                  className="absolute inset-0 z-20 pointer-events-none"
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{ filter: "drop-shadow(0 1px 4px rgba(254,44,85,0.3))" }}
                >
                  <defs>
                    <marker id="arrowhead-web" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto" fill="#FE2C55">
                      <polygon points="0 0, 8 3, 0 6" />
                    </marker>
                  </defs>
                  <line
                    x1={arrowLine.startX}
                    y1={arrowLine.startY}
                    x2={arrowLine.endX}
                    y2={arrowLine.endY}
                    stroke="#FE2C55"
                    strokeWidth="0.4"
                    strokeDasharray="1,0.6"
                    markerEnd="url(#arrowhead-web)"
                  />
                  <circle cx={arrowLine.startX} cy={arrowLine.startY} r="0.6" fill="#FE2C55" />
                </svg>
              )}

              {wrongClick && (
                <div className="absolute inset-0 z-30 pointer-events-none sim-blue-flash-overlay" />
              )}

              {wrongClick && wrongClickCount > 2 && (
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-lg text-white text-xs font-medium pointer-events-none"
                  style={{ background: `${wrongBlue}E6`, animation: "sim-fade-in 0.15s ease" }}
                >
                  Попробуй нажать на подсвеченную область
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {feedbackMessage && (
        <div className="flex justify-end sim-feedback-toast">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: "rgba(34,197,94,0.92)", backdropFilter: "blur(8px)" }}>
            <CheckCircle2 className="h-4 w-4" />
            {feedbackMessage}
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleQuiz({ questions, moduleTitle, onComplete }: { questions: QuizQuestion[]; moduleTitle: string; onComplete?: () => void }) {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [retakeKey, setRetakeKey] = useState(0);
  const allCorrect = submitted && questions.every(q => answers[q.id] === q.correctAnswer);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Тест для этого модуля ещё не добавлен</p>
      </div>
    );
  }

  const getScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    if (submitted) setSubmitted(false);
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) }));
  };

  return (
    <div className="space-y-6" key={retakeKey}>
      <h4 className="font-medium text-foreground">Тест по модулю "{moduleTitle}"</h4>
      
      {questions.map((q, qIndex) => (
        <div key={q.id} className="space-y-3" data-testid={`question-${q.id}`}>
          <p className="font-medium text-foreground">{qIndex + 1}. {q.question}</p>
          <RadioGroup
            value={answers[q.id] !== undefined ? answers[q.id].toString() : ""}
            onValueChange={(value) => handleAnswerChange(q.id, value)}
          >
            {q.options.map((option, optIndex) => {
              const isCorrect = optIndex === q.correctAnswer;
              const isSelected = answers[q.id] === optIndex;
              let optionClass = "p-3 rounded-lg border";
              
              if (submitted) {
                if (isCorrect) {
                  optionClass += " bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700";
                } else if (isSelected && !isCorrect) {
                  optionClass += " bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700";
                }
              }
              
              return (
                <div key={optIndex} className={optionClass}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={optIndex.toString()} id={`${q.id}-${optIndex}`} />
                    <Label htmlFor={`${q.id}-${optIndex}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      ))}

      {!submitted ? (
        <Button 
          className="w-full" 
          onClick={() => {
            setSubmitted(true);
            let correct = 0;
            questions.forEach(q => {
              if (answers[q.id] === q.correctAnswer) correct++;
            });
            if (correct === questions.length && onComplete) {
              onComplete();
            }
          }}
          disabled={Object.keys(answers).length < questions.length}
          data-testid="button-check-answers"
        >
          {t.checkAnswers}
        </Button>
      ) : (
        <div className="space-y-4">
          {allCorrect ? (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <Award className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
                <p className="font-medium text-green-800 dark:text-green-300">
                  {t.allCorrect}
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                  setRetakeKey(k => k + 1);
                }}
                data-testid="button-retake-test-success"
              >
                {t.retakeTest}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                <p className="text-amber-800 dark:text-amber-300">
                  {t.correctCount} {getScore()} {t.of} {questions.length}. {t.changeAndRetry}
                </p>
              </div>
              {questions.map(q => {
                if (answers[q.id] !== q.correctAnswer && q.consequence) {
                  return (
                    <div key={q.id} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        {q.question}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {q.consequence}
                      </p>
                    </div>
                  );
                }
                return null;
              })}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                  setRetakeKey(k => k + 1);
                }}
                data-testid="button-retake-test"
              >
                {t.retakeTest}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function applyModuleTranslation(m: Module, lang: "ru" | "kk" | "en"): Module {
  if (lang === "en") return m;
  const trans = moduleTranslations[m.id];
  if (!trans) return m;
  const langKey = lang === "ru" ? "ru" : "kk";
  const t = trans[langKey];
  if (!t) return m;
  return {
    ...m,
    title: t.title,
    description: t.description,
    content: t.content,
    badgeLabel: t.badgeLabel,
    ...(t.videoDescription && { videoDescription: t.videoDescription }),
    ...(t.algorithm && { algorithm: t.algorithm }),
    ...(t.whatYouLearn && { whatYouLearn: t.whatYouLearn }),
    ...(t.checklist && m.checklist && { checklist: m.checklist.map((orig, i) => {
      const tc = t.checklist?.[i];
      return tc ? { ...orig, text: tc.text } : orig;
    })}),
    ...(t.quiz && m.quiz && { quiz: m.quiz.map((orig, i) => {
      const tq = t.quiz?.[i];
      return tq ? { ...orig, question: tq.question, options: tq.options, ...(tq.consequence && { consequence: tq.consequence }) } : orig;
    })}),
    ...(t.simulator && m.simulator && {
      simulator: {
        ...m.simulator,
        title: t.simulator.title,
        steps: m.simulator.steps.map((step, i) => {
          const ts = t.simulator!.steps.find(s => s.id === step.id) || t.simulator!.steps[i];
          if (!ts) return step;
          return {
            ...step,
            instruction: ts.instruction,
            ...(ts.feedback && { feedback: ts.feedback }),
            ...(ts.sectionTitle && { sectionTitle: ts.sectionTitle }),
            ...(ts.description && { description: ts.description }),
          };
        }),
      },
    }),
  };
}

export default function Training() {
  const { hasModuleAccess, role } = useRole();
  const { t, language } = useLanguage();
  const roleInfo = ROLES.find(r => r.id === role);
  
  if (role === "runner") {
    return <RunnerOnboarding />;
  }
  
  const initialProgress = useMemo(() => getTrainingProgress(), []);
  const [completedState, setCompletedState] = useState<string[]>(initialProgress.completedBlocks);
  const [stepVersion, setStepVersion] = useState(0);

  const filteredModules = useMemo(() => {
    const accessible = modules.filter(m => hasModuleAccess(m.id)).map((m, idx) => ({
      ...m,
      number: idx + 1
    }));
    return accessible.map((m, idx) => {
      const localized = applyModuleTranslation(m, language);
      const selfCompleted = completedState.includes(m.id);
      const moduleProgress = getModuleProgress(m.id, m.hasVideo, m.hasDocument, m.hasTest, m.hasSimulator);
      return {
        ...localized,
        isLocked: false,
        isCompleted: selfCompleted,
        progress: moduleProgress,
      };
    });
  }, [hasModuleAccess, completedState, stepVersion, language]);

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeTab, setActiveTabRaw] = useState<"content" | "video" | "test" | "simulator">("video");
  const getDefaultTab = (mod: Module): "video" | "simulator" | "content" | "test" => {
    if (mod.hasVideo) return "video";
    if (mod.hasSimulator) return "simulator";
    if (mod.hasDocument) return "content";
    return "test";
  };

  const setActiveTab = (tab: "content" | "video" | "test" | "simulator") => {
    setActiveTabRaw(tab);
    if (currentModuleRef.current) {
      const modId = currentModuleRef.current.id;
      if (tab === "video") {
        saveModuleStep(modId, { videoWatched: true });
        setStepVersion(v => v + 1);
      } else if (tab === "content") {
        saveModuleStep(modId, { documentRead: true });
        setStepVersion(v => v + 1);
      }
    }
  };

  const currentModuleRef = useRef<Module | null>(null);

  useEffect(() => {
    setSelectedModule(null);
    setActiveTabRaw("video");
  }, [role]);

  const currentModule = selectedModule || filteredModules[0];
  currentModuleRef.current = currentModule;

  useEffect(() => {
    if (selectedModule && selectedModule.hasVideo) {
      saveModuleStep(selectedModule.id, { videoWatched: true });
      setStepVersion(v => v + 1);
    }
  }, [selectedModule?.id]);

  const completedModules = filteredModules.filter(m => m.isCompleted).length;
  const totalProgress = filteredModules.length > 0 
    ? Math.round((completedModules / filteredModules.length) * 100) 
    : 0;

  const tabs = [
    { id: "video", label: t.video, icon: Play, primary: true },
    { id: "content", label: t.document, icon: FileText, primary: false },
    { id: "test", label: t.test, icon: HelpCircle, primary: false },
  ];

  if (filteredModules.length === 0) {
    return (
      <div className="h-full overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground"><TranslatedText text="Нет доступных модулей" /></h2>
            <p className="text-muted-foreground mt-2"><TranslatedText text="Для вашей роли пока нет обучающих модулей" /></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground" data-testid="text-training-title">
              {t.training}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {roleInfo ? `Программа обучения для роли: ${roleInfo.title}` : "Модульная система обучения для сотрудников"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs sm:text-sm text-muted-foreground">{t.overallProgress}</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalProgress}%</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={totalProgress} className="h-3" />
          <p className="text-sm text-muted-foreground text-right">
            {completedModules}/{filteredModules.length} модулей
          </p>
        </div>

        {!selectedModule && (() => {
          const popularModules = filteredModules.filter(m => m.id === "1" || m.id === "11");
          const videoModules = filteredModules.filter(m => m.id !== "1" && m.id !== "10" && m.id !== "11");
          const analyticsModules = filteredModules.filter(m => m.id === "10");

          const renderModuleCard = (module: Module) => (
            <Card
              key={module.id}
              onClick={() => { setSelectedModule(module); setActiveTabRaw(getDefaultTab(module)); }}
              className="overflow-visible transition-all cursor-pointer hover-elevate"
              data-testid={`module-${module.id}`}
            >
              <div className={`relative h-36 rounded-t-md overflow-hidden ${!module.coverImage ? `bg-gradient-to-br ${module.coverGradient || "from-gray-500 to-gray-400"}` : ""}`}>
                {module.coverImage ? (
                  <img
                    src={module.coverImage}
                    alt={module.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-white/30 blur-2xl" />
                      <div className="absolute bottom-[-10%] left-[-5%] w-24 h-24 rounded-full bg-white/20 blur-xl" />
                    </div>
                    {module.coverIcon ? (
                      <div className="relative flex flex-col items-center gap-2">
                        <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
                          {module.coverIcon === "Search" && <Search className="h-10 w-10 text-white" />}
                          {module.coverIcon === "FileText" && <FileText className="h-10 w-10 text-white" />}
                          {module.coverIcon === "BarChart3" && <BarChart3 className="h-10 w-10 text-white" />}
                          {module.coverIcon === "Star" && <Star className="h-10 w-10 text-white" />}
                          {module.coverIcon === "Zap" && <Zap className="h-10 w-10 text-white" />}
                          {module.coverIcon === "User" && <User className="h-10 w-10 text-white" />}
                          {module.coverIcon === "Video" && <Video className="h-10 w-10 text-white" />}
                          {module.coverIcon === "HelpCircle" && <HelpCircle className="h-10 w-10 text-white" />}
                          {module.coverIcon === "Award" && <Award className="h-10 w-10 text-white" />}
                          {module.coverIcon === "Sparkles" && <Sparkles className="h-10 w-10 text-white" />}
                          {module.coverIcon === "Camera" && <Camera className="h-10 w-10 text-white" />}
                          {!["Search","FileText","BarChart3","Star","Zap","User","Video","HelpCircle","Award","Sparkles","Camera"].includes(module.coverIcon!) && <Play className="h-10 w-10 text-white" />}
                        </div>
                        <span className="text-xs font-semibold text-white/60 tracking-wider uppercase">{module.badgeLabel || ""}</span>
                      </div>
                    ) : (
                      <span className="text-4xl font-bold text-white/30">{module.number < 10 ? `0${module.number}` : module.number}</span>
                    )}
                  </div>
                )}
                {module.isNew && !module.isCompleted && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white animate-pulse" style={{ background: "#FE2C55" }}>
                      <Sparkles className="h-3 w-3" />
                      {t.newLabel}
                    </span>
                  </div>
                )}
                {module.isCompleted && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-sm text-foreground leading-tight">
                  {module.title}
                </h3>
                <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {module.duration}
                  </span>
                  {module.progress > 0 && (
                    <span className="flex items-center gap-1 font-medium" style={{ color: module.progress === 100 ? 'var(--color-green-600)' : 'hsl(var(--primary))' }}>
                      {module.progress}%
                    </span>
                  )}
                </div>
                {module.progress > 0 && (
                  <Progress value={module.progress} className="h-1.5" />
                )}
                <Button
                  size="sm"
                  className="w-full mt-2"
                  variant={module.isCompleted ? "outline" : "default"}
                  disabled={false}
                  data-testid={`button-start-module-${module.id}`}
                >
                  {module.isCompleted ? t.repeatTraining : module.progress > 0 ? t.next : t.startTraining}
                </Button>
              </CardContent>
            </Card>
          );

          return (
            <div className="space-y-8" data-testid="card-modules-list">
              {popularModules.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-foreground"><TranslatedText text="Важное" /></h2>
                    <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate text-xs">{popularModules.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {popularModules.map(renderModuleCard)}
                  </div>
                </section>
              )}

              {videoModules.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-foreground"><TranslatedText text="Видеоинструкции" /></h2>
                    <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate text-xs">{videoModules.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {videoModules.map(renderModuleCard)}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-bold text-foreground"><TranslatedText text="Финансы и аналитика" /></h2>
                  <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate text-xs">{analyticsModules.length}</Badge>
                </div>
                {analyticsModules.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {analyticsModules.map(renderModuleCard)}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">Модули по финансам и аналитике скоро появятся</p>
                    </CardContent>
                  </Card>
                )}
              </section>
            </div>
          );
        })()}

        {selectedModule && (() => {
          const storedSteps = getTrainingProgress().moduleSteps[currentModule.id] || {};
          const lessonSteps: { id: "video" | "content" | "test" | "simulator"; title: string; time: string; icon: typeof Play; completed: boolean }[] = [];
          if (currentModule.hasVideo) {
            lessonSteps.push({
              id: "video" as const,
              title: `${t.video}: ${currentModule.title}`,
              time: currentModule.duration,
              icon: Play,
              completed: !!storedSteps.videoWatched,
            });
          }
          if (currentModule.hasSimulator && currentModule.simulator) {
            lessonSteps.push({
              id: "simulator" as const,
              title: t.simulator,
              time: `${currentModule.simulator.steps.length} ${t.step}`,
              icon: MousePointerClick,
              completed: !!storedSteps.simulatorPassed,
            });
          }
          if (currentModule.hasDocument) {
            lessonSteps.push({
              id: "content" as const,
              title: t.document,
              time: `1 ${t.minutes}`,
              icon: FileText,
              completed: !!storedSteps.documentRead,
            });
          }
          if (currentModule.hasTest) {
            lessonSteps.push({
              id: "test" as const,
              title: t.test,
              time: `${currentModule.quiz?.length || 0} ${t.questionsInTest}`,
              icon: HelpCircle,
              completed: !!storedSteps.testPassed,
            });
          }

          return (
            <div className="space-y-4 pb-16 sm:pb-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedModule(null)}
                className="gap-2"
                data-testid="button-back-to-modules"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.allModules}
              </Button>

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-8" data-testid="card-module-content">
                <div className="hidden lg:block w-72 flex-shrink-0 self-start bg-card border border-border rounded-md p-5">
                  <h3 className="font-semibold text-sm text-foreground mb-4"><TranslatedText text="Содержание" /></h3>
                  <ul className="space-y-2.5">
                    {lessonSteps.map((step) => {
                      const isActive = activeTab === step.id;
                      return (
                        <li
                          key={step.id}
                          onClick={() => setActiveTab(step.id)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                            isActive
                              ? "bg-red-50 dark:bg-red-950/30 border border-primary"
                              : "bg-muted/50 dark:bg-muted/30 border border-transparent hover-elevate"
                          }`}
                          data-testid={`step-${step.id}`}
                        >
                          <div className="flex-shrink-0">
                            {step.completed ? (
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                              </div>
                            ) : (
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isActive ? "border-primary" : "border-muted-foreground/30"
                              }`}>
                                <Circle className={`h-2 w-2 ${isActive ? "text-primary fill-primary" : "text-transparent"}`} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className={`text-sm font-semibold leading-tight ${
                              isActive ? "text-foreground" : "text-foreground"
                            }`}>
                              {step.title}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5">{step.time}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="lg:hidden sticky top-0 z-40 bg-background flex gap-2 overflow-x-auto pb-2 pt-1 -mx-1 px-1">
                  {lessonSteps.map((step) => {
                    const isActive = activeTab === step.id;
                    const StepIcon = step.icon;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setActiveTab(step.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all border ${
                          isActive
                            ? "bg-red-50 dark:bg-red-950/30 border-primary text-foreground"
                            : "bg-muted/50 dark:bg-muted/30 border-transparent text-muted-foreground"
                        }`}
                        data-testid={`step-mobile-${step.id}`}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        ) : (
                          <StepIcon className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                        )}
                        {step.title.replace(new RegExp(`^(${t.video}|${t.test}): `), "")}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 min-w-0 overflow-hidden space-y-4">
                  <Card>
                    <CardContent className={`${activeTab === "simulator" ? "p-2 sm:p-6" : "p-4 sm:p-6"}`}>
                      <div className={`space-y-1 ${activeTab === "simulator" ? "hidden sm:block mb-4 sm:mb-6" : "mb-4 sm:mb-6"}`}>
                        <Badge className="no-default-hover-elevate no-default-active-elevate text-xs mb-2">
                          {activeTab === "video" ? t.video : activeTab === "content" ? t.document : activeTab === "simulator" ? t.simulator : t.test}
                        </Badge>
                        <h1 className="text-lg sm:text-2xl font-bold text-foreground break-words">{currentModule.title}</h1>
                        <p className="text-sm sm:text-base text-muted-foreground break-words">{currentModule.description}</p>
                      </div>

                      {activeTab === "video" && (
                        <div className="space-y-4">
                          {currentModule.videoDescription && (
                            <div className="px-1" data-testid="text-video-description">
                              <h3 className="text-lg font-semibold mb-2">{currentModule.videoDescription.split("\n")[0]}</h3>
                              <p className="text-muted-foreground text-sm leading-relaxed">{currentModule.videoDescription.split("\n").slice(1).join("\n").trim()}</p>
                            </div>
                          )}
                          <div className="flex justify-center">
                          <div className="video-container w-full">
                            {currentModule.videoUrl.includes("youtube") ? (
                              <iframe
                                src={(() => {
                                  const url = new URL(currentModule.videoUrl);
                                  url.searchParams.set("rel", "0");
                                  url.searchParams.set("modestbranding", "1");
                                  url.searchParams.set("vq", "hd1080");
                                  url.searchParams.set("hd", "1");
                                  return url.toString();
                                })()}
                                title={currentModule.title}
                                className="video-iframe"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                data-testid="video-iframe"
                              />
                            ) : currentModule.videoUrl ? (
                              <video
                                src={currentModule.videoUrl}
                                controls
                                className="video-iframe"
                                data-testid="video-player"
                              >
                                Ваш браузер не поддерживает видео
                              </video>
                            ) : (
                              <div className="w-full aspect-video flex items-center justify-center">
                                <Button size="lg" className="gap-2" data-testid="button-play-video">
                                  <Play className="h-5 w-5" />
                                  {t.video}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                          {currentModule.videoUrl2 && (
                            <div className="flex justify-center mt-6">
                              <div className="video-container w-full">
                                {currentModule.videoUrl2.includes("youtube") ? (
                                  <iframe
                                    src={(() => {
                                      const url = new URL(currentModule.videoUrl2);
                                      url.searchParams.set("rel", "0");
                                      url.searchParams.set("modestbranding", "1");
                                      url.searchParams.set("vq", "hd1080");
                                      url.searchParams.set("hd", "1");
                                      return url.toString();
                                    })()}
                                    title={`${currentModule.title} - 2`}
                                    className="video-iframe"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    data-testid="video-iframe-2"
                                  />
                                ) : (
                                  <video
                                    src={currentModule.videoUrl2}
                                    controls
                                    className="video-iframe"
                                    data-testid="video-player-2"
                                  >
                                    Ваш браузер не поддерживает видео
                                  </video>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "content" && (
                        <div className="space-y-6">
                          <div className="text-muted-foreground whitespace-pre-line break-words">
                            {currentModule.content.split("\n").map((line, i) => {
                              const boldPatterns = [
                                /^(Как поставить блюдо на стоп-лист.*)/,
                                /^(Цель:.*)/,
                                /^(Способ \d+:.*)/,
                                /^(Важные правила.*)/,
                                /^(Дублирование в кассе:.*)/,
                                /^(Последствия:.*)/,
                                /^(Порядок действий:)/,
                                /^(Основные формулы сверки:)/,
                                /^(При наличии программы лояльности:)/,
                                /^(При использовании купонов или акций:)/,
                                /^(Сумма заказов [+\-] .*)/,
                                /^(Администратор —.*)/,
                                /^(Менеджер —.*)/,
                                /^(Кассир —.*)/,
                                /^(Официант —.*)/,
                                /^(Бариста\/Кассир —.*)/,
                                /^(Роли и права:)/,
                                /^(Добавление сотрудника:)/,
                                /^(Удаление сотрудника:)/,
                              ];
                              const isBoldLine = boldPatterns.some(p => p.test(line.trim()));
                              if (isBoldLine) {
                                return <span key={i} className="font-semibold text-foreground">{line}{"\n"}</span>;
                              }
                              return <span key={i}>{line}{"\n"}</span>;
                            })}
                          </div>

                          {currentModule.guideUrl && (
                            <button
                              onClick={async () => {
                                const btn = document.querySelector('[data-testid="button-download-guide"]') as HTMLButtonElement;
                                if (btn) { btn.textContent = "Загрузка..."; btn.disabled = true; }
                                try {
                                  const guideFilename = currentModule.guideUrl!.split("/").pop() || "";
                                  const response = await fetch(`/api/download-guide/${encodeURIComponent(guideFilename)}`);
                                  if (!response.ok) throw new Error("Failed");
                                  const blob = await response.blob();
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = currentModule.title.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s]/g, "").trim() + ".pdf";
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                } catch (e) {
                                  console.error("PDF download error:", e);
                                  window.open(currentModule.guideUrl, "_blank");
                                }
                                if (btn) {
                                  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> ' + t.downloadPdf;
                                  btn.disabled = false;
                                }
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-white cursor-pointer border-0"
                              style={{ background: "#FE2C55" }}
                              data-testid="button-download-guide"
                            >
                              <Download className="h-4 w-4" />
                              {t.downloadPdf}
                            </button>
                          )}

                          {currentModule.whatYouLearn && currentModule.whatYouLearn.length > 0 && (
                            <div className="p-4 rounded-lg bg-muted/50">
                              <h4 className="font-medium text-foreground mb-3">{t.whatYouLearn}</h4>
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                {currentModule.whatYouLearn.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Circle className="h-3 w-3 flex-shrink-0 mt-1" />
                                    <span className="break-words min-w-0">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {currentModule.checklist && currentModule.checklist.length > 0 && (
                            <div className="p-4 rounded-lg bg-muted/50">
                              <h4 className="font-medium text-foreground mb-3">{t.moduleChecklist}</h4>
                              <ul className="space-y-2 text-sm">
                                {currentModule.checklist.map((item) => (
                                  <li key={item.id} className={`flex items-center gap-2 ${
                                    item.isRealAction
                                      ? "text-primary font-medium p-2 rounded-md bg-primary/5 border border-primary/10"
                                      : "text-muted-foreground"
                                  }`}>
                                    {item.completed ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    ) : item.isRealAction ? (
                                      <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                                    ) : (
                                      <Circle className="h-4 w-4 flex-shrink-0" />
                                    )}
                                    {item.text}
                                    {item.isRealAction && (
                                      <Badge variant="outline" className="ml-auto text-xs flex-shrink-0">Практика</Badge>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "simulator" && currentModule.simulator && (
                        <InteractiveSimulator
                          simulator={currentModule.simulator}
                          alreadyCompleted={!!(getTrainingProgress().moduleSteps[currentModule.id]?.simulatorPassed)}
                          onComplete={() => {
                            saveModuleStep(currentModule.id, { simulatorPassed: true });
                            setStepVersion(v => v + 1);
                          }}
                        />
                      )}

                      {activeTab === "test" && (
                        <ModuleQuiz
                          questions={currentModule.quiz || []}
                          moduleTitle={currentModule.title}
                          onComplete={() => {
                            saveModuleStep(currentModule.id, { testPassed: true });
                            setStepVersion(v => v + 1);
                            if (!completedState.includes(currentModule.id)) {
                              const newCompleted = [...completedState, currentModule.id];
                              setCompletedState(newCompleted);
                              completeBlockStorage(currentModule.id, 100);
                              addPoints(10);
                            }
                          }}
                        />
                      )}

                      <div className="hidden sm:flex items-center justify-between gap-4 pt-6 mt-6 border-t">
                        {activeTab !== lessonSteps[0]?.id ? (
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              const currentStepIndex = lessonSteps.findIndex(s => s.id === activeTab);
                              if (currentStepIndex > 0) {
                                setActiveTab(lessonSteps[currentStepIndex - 1].id);
                              }
                            }}
                            data-testid="button-prev-step"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            {t.back}
                          </Button>
                        ) : (
                          <div />
                        )}

                        {activeTab !== lessonSteps[lessonSteps.length - 1]?.id ? (
                          <Button
                            className="gap-2"
                            onClick={() => {
                              const currentStepIndex = lessonSteps.findIndex(s => s.id === activeTab);
                              if (currentStepIndex < lessonSteps.length - 1) {
                                setActiveTab(lessonSteps[currentStepIndex + 1].id);
                              }
                            }}
                            data-testid="button-next-step"
                          >
                            {t.next}
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            className="gap-2"
                            data-testid="button-next-module"
                            disabled={filteredModules.findIndex(m => m.id === currentModule.id) >= filteredModules.length - 1}
                            onClick={() => {
                              const currentIndex = filteredModules.findIndex(m => m.id === currentModule.id);
                              if (currentIndex < filteredModules.length - 1) {
                                const nextModule = filteredModules[currentIndex + 1];
                                if (!nextModule.isLocked) {
                                  setSelectedModule(nextModule);
                                  setActiveTabRaw(getDefaultTab(nextModule));
                                }
                              }
                            }}
                          >
                            {t.nextModule}
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-3 flex items-center justify-between gap-3">
                {activeTab !== lessonSteps[0]?.id ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 flex-1"
                    onClick={() => {
                      const currentStepIndex = lessonSteps.findIndex(s => s.id === activeTab);
                      if (currentStepIndex > 0) {
                        setActiveTab(lessonSteps[currentStepIndex - 1].id);
                      }
                    }}
                    data-testid="button-prev-step-mobile"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t.back}
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}

                {activeTab !== lessonSteps[lessonSteps.length - 1]?.id ? (
                  <Button
                    size="sm"
                    className="gap-1.5 flex-1"
                    onClick={() => {
                      const currentStepIndex = lessonSteps.findIndex(s => s.id === activeTab);
                      if (currentStepIndex < lessonSteps.length - 1) {
                        setActiveTab(lessonSteps[currentStepIndex + 1].id);
                      }
                    }}
                    data-testid="button-next-step-mobile"
                  >
                    {t.next}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="gap-1.5 flex-1"
                    data-testid="button-next-module-mobile"
                    disabled={filteredModules.findIndex(m => m.id === currentModule.id) >= filteredModules.length - 1}
                    onClick={() => {
                      const currentIndex = filteredModules.findIndex(m => m.id === currentModule.id);
                      if (currentIndex < filteredModules.length - 1) {
                        const nextModule = filteredModules[currentIndex + 1];
                        if (!nextModule.isLocked) {
                          setSelectedModule(nextModule);
                          setActiveTabRaw(getDefaultTab(nextModule));
                        }
                      }
                    }}
                  >
                    {t.nextModule}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
