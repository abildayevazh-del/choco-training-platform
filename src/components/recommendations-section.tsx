import { Lightbulb, Snowflake, TrendingUp, Gift, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
  id: string;
  title: string;
  icon: typeof Lightbulb;
  priority: "high" | "medium" | "low";
  action?: string;
}

const recommendations: Recommendation[] = [
  {
    id: "1",
    title: "Скоро Новый год — запустите новогоднее меню и праздничные акции",
    icon: Snowflake,
    priority: "high",
    action: "Создать акцию",
  },
  {
    id: "2",
    title: "Средний чек упал на 8% — рекомендуем запустить комбо-предложения",
    icon: TrendingUp,
    priority: "high",
    action: "Настроить комбо",
  },
  {
    id: "3",
    title: "Добавьте программу лояльности для увеличения повторных визитов",
    icon: Gift,
    priority: "medium",
    action: "Настроить",
  },
];

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return (
        <Badge variant="destructive" size="sm">
          Важно
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="secondary" size="sm">
          Средний
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" size="sm">
          Низкий
        </Badge>
      );
  }
}

interface RecommendationsSectionProps {
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function RecommendationsSection({ isLoading, isError, onRetry }: RecommendationsSectionProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse" data-testid="card-recommendations-loading">
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card data-testid="card-recommendations-error">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Рекомендации на сегодня</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-6 text-muted-foreground">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">Не удалось загрузить</p>
            <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry-recommendations">
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-recommendations">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-lg font-medium">Рекомендации на сегодня</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50 hover-elevate transition-colors"
            data-testid={`card-recommendation-${rec.id}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <rec.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground" data-testid={`text-recommendation-${rec.id}`}>
                  {rec.title}
                </p>
              </div>
              <div className="flex-shrink-0">
                {getPriorityBadge(rec.priority)}
              </div>
            </div>
            {rec.action && (
              <Button variant="outline" size="sm" className="self-start ml-7" data-testid={`button-action-${rec.id}`}>
                {rec.action}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
