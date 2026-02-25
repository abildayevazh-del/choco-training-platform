import { useState } from "react";
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  FileText, 
  BookOpen, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Award,
  Clock,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Rule {
  id: string;
  title: string;
  description: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const lessonData = {
  title: "Основы продукции Mixue",
  duration: "15 мин",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  description: `В этом уроке вы изучите основы продукции Mixue: от мороженого до напитков. Узнаете о ключевых ингредиентах, стандартах качества и правилах хранения.

Mixue — это международный бренд с высокими стандартами качества. Каждый продукт проходит строгий контроль качества.

После прохождения урока вы будете знать:
- Ассортимент продукции Mixue
- Правила хранения и приготовления
- Стандарты обслуживания клиентов`,
  
  checklist: [
    { id: "1", text: "Изучить ассортимент мороженого", completed: false },
    { id: "2", text: "Изучить ассортимент напитков", completed: false },
    { id: "3", text: "Запомнить температуру хранения продуктов", completed: false },
    { id: "4", text: "Пройти практику приготовления", completed: false },
    { id: "5", text: "Сдать тест по продукции", completed: false },
  ] as ChecklistItem[],
  
  rules: [
    { 
      id: "1", 
      title: "Температура хранения мороженого", 
      description: "Мороженое должно храниться при температуре -18°C. При температуре выше -15°C продукт начинает терять качество." 
    },
    { 
      id: "2", 
      title: "Срок годности напитков", 
      description: "Приготовленные напитки должны быть выданы клиенту в течение 5 минут. Напитки старше 10 минут подлежат утилизации." 
    },
    { 
      id: "3", 
      title: "Гигиена рук", 
      description: "Мыть руки каждые 30 минут и после каждого перерыва. Использовать санитайзер после контакта с деньгами." 
    },
    { 
      id: "4", 
      title: "Порядок на рабочем месте", 
      description: "Рабочее место должно быть чистым. Уборка поверхностей каждый час. Инвентарь на своих местах." 
    },
  ] as Rule[],
  
  questions: [
    {
      id: "1",
      question: "При какой температуре должно храниться мороженое Mixue?",
      options: ["-10°C", "-15°C", "-18°C", "-20°C"],
      correctAnswer: 2,
    },
    {
      id: "2", 
      question: "В течение какого времени приготовленный напиток должен быть выдан клиенту?",
      options: ["3 минуты", "5 минут", "10 минут", "15 минут"],
      correctAnswer: 1,
    },
    {
      id: "3",
      question: "Как часто нужно мыть руки во время работы?",
      options: ["Каждый час", "Каждые 30 минут", "Каждые 2 часа", "Только в начале смены"],
      correctAnswer: 1,
    },
  ] as QuizQuestion[],
};

export default function TrainingLesson() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(lessonData.checklist);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "checklist" | "rules" | "quiz">("content");

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const checklistProgress = (completedCount / checklist.length) * 100;

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const getQuizScore = () => {
    let correct = 0;
    lessonData.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  };

  const tabs = [
    { id: "content", label: "Материал", icon: FileText },
    { id: "checklist", label: "Чек-лист", icon: CheckCircle2 },
    { id: "rules", label: "Правила", icon: BookOpen },
    { id: "quiz", label: "Тест", icon: HelpCircle },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-lesson-title">
              {lessonData.title}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="secondary" size="sm">
                <Clock className="h-3 w-3 mr-1" />
                {lessonData.duration}
              </Badge>
              <Badge variant="outline" size="sm">
                Модуль 1
              </Badge>
            </div>
          </div>
        </div>

        <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
          <iframe
            src={lessonData.videoUrl}
            title={lessonData.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            data-testid="video-lesson"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="gap-2"
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "content" && (
          <Card data-testid="card-content">
            <CardHeader>
              <CardTitle className="text-lg">Описание урока</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {lessonData.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground mb-4 whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="h-4 w-4" />
                  <span>Скачать материалы урока</span>
                </div>
                <Button variant="outline" size="sm" data-testid="button-download-materials">
                  Скачать PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "checklist" && (
          <Card data-testid="card-checklist">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-lg">Чек-лист прохождения</CardTitle>
                <Badge variant="secondary" size="sm">
                  {completedCount} / {checklist.length}
                </Badge>
              </div>
              <Progress value={checklistProgress} className="h-2 mt-3" />
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover-elevate"
                  onClick={() => toggleChecklistItem(item.id)}
                  data-testid={`checklist-item-${item.id}`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={item.completed ? "line-through text-muted-foreground" : "text-foreground"}>
                    {item.text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "rules" && (
          <Card data-testid="card-rules">
            <CardHeader>
              <CardTitle className="text-lg">Правила и стандарты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lessonData.rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-lg bg-muted/50"
                  data-testid={`rule-${rule.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{rule.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <Separator className="my-4" />
              
              <Button variant="outline" className="w-full gap-2" data-testid="button-download-rules">
                <Download className="h-4 w-4" />
                Скачать правила (PDF)
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "quiz" && (
          <Card data-testid="card-quiz">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-lg">Тест после урока</CardTitle>
                {quizSubmitted && (
                  <Badge 
                    variant={getQuizScore() === lessonData.questions.length ? "default" : "secondary"}
                    className="gap-1"
                  >
                    <Award className="h-3 w-3" />
                    {getQuizScore()} / {lessonData.questions.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {lessonData.questions.map((q, qIndex) => (
                <div key={q.id} className="space-y-3" data-testid={`question-${q.id}`}>
                  <p className="font-medium text-foreground">
                    {qIndex + 1}. {q.question}
                  </p>
                  <RadioGroup
                    value={answers[q.id]?.toString()}
                    onValueChange={(value) => setAnswers(prev => ({ ...prev, [q.id]: parseInt(value) }))}
                    disabled={quizSubmitted}
                  >
                    {q.options.map((option, optIndex) => {
                      const isCorrect = optIndex === q.correctAnswer;
                      const isSelected = answers[q.id] === optIndex;
                      let optionClass = "p-3 rounded-lg border cursor-pointer";
                      
                      if (quizSubmitted) {
                        if (isCorrect) {
                          optionClass += " bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700";
                        } else if (isSelected && !isCorrect) {
                          optionClass += " bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700";
                        }
                      }
                      
                      return (
                        <div key={optIndex} className={optionClass}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem 
                              value={optIndex.toString()} 
                              id={`${q.id}-${optIndex}`}
                              data-testid={`radio-${q.id}-${optIndex}`}
                            />
                            <Label 
                              htmlFor={`${q.id}-${optIndex}`} 
                              className="flex-1 cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              ))}
              
              <Separator />
              
              {!quizSubmitted ? (
                <Button 
                  className="w-full" 
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(answers).length < lessonData.questions.length}
                  data-testid="button-submit-quiz"
                >
                  Проверить ответы
                </Button>
              ) : (
                <div className="space-y-4">
                  {getQuizScore() === lessonData.questions.length ? (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                      <Award className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
                      <p className="font-medium text-green-800 dark:text-green-300">
                        Отлично! Все ответы правильные!
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                      <p className="text-amber-800 dark:text-amber-300">
                        Правильных ответов: {getQuizScore()} из {lessonData.questions.length}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setAnswers({});
                        setQuizSubmitted(false);
                      }}
                      data-testid="button-retry-quiz"
                    >
                      Пройти заново
                    </Button>
                    <Link href="/" className="flex-1">
                      <Button className="w-full gap-2" data-testid="button-next-lesson">
                        Следующий урок
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
