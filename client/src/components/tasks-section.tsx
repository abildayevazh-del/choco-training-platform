import { Camera, ListX, TrendingDown, CheckCircle2, AlertCircle, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { Task } from "@shared/schema";

interface TasksSectionProps {
  tasks?: Task[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onToggleTask?: (id: string, completed: boolean) => void;
}

function getTaskIcon(title: string) {
  if (title.toLowerCase().includes("фото")) {
    return <Camera className="h-4 w-4 text-primary" />;
  }
  if (title.toLowerCase().includes("стоп")) {
    return <ListX className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
  }
  if (title.toLowerCase().includes("чек") || title.toLowerCase().includes("упал")) {
    return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
  }
  return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
}

export function TasksSection({ tasks, isLoading, isError, onRetry, onToggleTask }: TasksSectionProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse" data-testid="card-tasks-loading">
        <CardHeader>
          <div className="h-6 w-40 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card data-testid="card-tasks-error">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Задачи на сегодня</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-6 text-muted-foreground">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">Не удалось загрузить задачи</p>
            <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry-tasks">
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card data-testid="card-tasks-empty">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Задачи на сегодня</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-6 text-muted-foreground">
            <ClipboardList className="h-10 w-10" />
            <p className="text-sm">Нет задач на сегодня</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-tasks">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Задачи на сегодня</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover-elevate transition-colors"
            data-testid={`card-task-${task.id}`}
          >
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={(checked) => onToggleTask?.(task.id, checked as boolean)}
              className="mt-0.5"
              data-testid={`checkbox-task-${task.id}`}
            />
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="mt-0.5">{getTaskIcon(task.title)}</div>
              <label
                htmlFor={`task-${task.id}`}
                className={`text-sm cursor-pointer ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                data-testid={`text-task-${task.id}`}
              >
                {task.title}
              </label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
