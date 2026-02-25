import { GraduationCap, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { LearningProgress } from "@shared/schema";

interface LearningSectionProps {
  progress?: LearningProgress;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function LearningSection({ progress, isLoading, isError, onRetry }: LearningSectionProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse" data-testid="card-learning-loading">
        <CardHeader className="pb-2">
          <div className="h-6 w-48 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-28 bg-muted rounded" />
          </div>
          <div className="h-9 w-full bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card data-testid="card-learning-error">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-medium">Ваш прогресс обучения</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">Не удалось загрузить</p>
            <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry-learning">
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card data-testid="card-learning-empty">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-medium">Ваш прогресс обучения</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-muted-foreground">
            <p className="text-sm">Начните обучение</p>
            <Button data-testid="button-start-learning">
              Начать
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-learning">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-medium">Ваш прогресс обучения</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Пройдено</span>
            <span className="font-medium text-foreground" data-testid="text-progress-percent">
              {progress.completedPercent}%
            </span>
          </div>
          <Progress value={progress.completedPercent} className="h-2" data-testid="progress-learning" />
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Новые уроки</span>
            <span className="font-medium text-foreground" data-testid="text-new-lessons">
              {progress.newLessons}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Чек-листы</span>
            <span className="font-medium text-foreground" data-testid="text-checklists">
              {progress.checklists}
            </span>
          </div>
        </div>
        
        <Button className="w-full" variant="outline" data-testid="button-go-to-learning">
          Перейти к обучению
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
