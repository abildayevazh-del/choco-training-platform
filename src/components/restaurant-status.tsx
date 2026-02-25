import { Building2, PlusCircle, AlertCircle, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RestaurantWithStats {
  id: string;
  name: string;
  status: string;
  growthPercent: number;
  recommendation?: string;
}

interface RestaurantStatusProps {
  restaurants?: { id: string; name: string; status: string; statusMessage: string | null; isActive: boolean | null }[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const restaurantStats: Record<string, RestaurantWithStats> = {
  "1": { id: "1", name: "Mixue Глобус", status: "active", growthPercent: 12.5 },
  "2": { id: "2", name: "Mixue Форум", status: "active", growthPercent: -8.3, recommendation: "Запустите акцию для привлечения гостей" },
};

function getStatusIcon(status: string, growthPercent: number) {
  if (growthPercent > 0) {
    return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
  }
  if (growthPercent < 0) {
    return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
  }
  return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
}

export function RestaurantStatus({ restaurants, isLoading, isError, onRetry }: RestaurantStatusProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse" data-testid="card-restaurants-loading">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="h-8 w-32 bg-muted rounded" />
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
      <Card data-testid="card-restaurants-error">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Статус заведений</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12" />
            <p>Не удалось загрузить данные</p>
            <Button variant="outline" onClick={onRetry} data-testid="button-retry-restaurants">
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <Card data-testid="card-restaurants-empty">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Статус заведений</CardTitle>
          <Button size="sm" variant="outline" data-testid="button-add-venue">
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить точку
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-muted-foreground">
            <Building2 className="h-12 w-12" />
            <p>У вас пока нет заведений</p>
            <Button data-testid="button-add-first-venue">
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить первое заведение
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-restaurants">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="text-lg font-medium">Статус заведений</CardTitle>
        <Button size="sm" variant="outline" data-testid="button-add-venue">
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить точку
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {restaurants.map((restaurant) => {
          const stats = restaurantStats[restaurant.id] || { growthPercent: 0 };
          const hasRecommendation = stats.recommendation;
          
          return (
            <div
              key={restaurant.id}
              className="relative p-4 rounded-lg bg-muted/50 hover-elevate transition-colors"
              data-testid={`card-restaurant-${restaurant.id}`}
            >
              {hasRecommendation && (
                <div className="absolute -top-2 right-4">
                  <Badge variant="secondary" size="sm" className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    <Lightbulb className="h-3 w-3" />
                    Рекомендация
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate" data-testid={`text-restaurant-name-${restaurant.id}`}>
                      {restaurant.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {getStatusIcon(restaurant.status, stats.growthPercent)}
                      <span className="text-sm text-muted-foreground">Активно</span>
                      <span className={`text-sm font-medium ${stats.growthPercent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} data-testid={`text-restaurant-growth-${restaurant.id}`}>
                        {stats.growthPercent >= 0 ? "+" : ""}{stats.growthPercent}%
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="default"
                  size="sm"
                  className="flex-shrink-0"
                  data-testid={`badge-restaurant-${restaurant.id}`}
                >
                  Активно
                </Badge>
              </div>
              {hasRecommendation && (
                <p className="mt-3 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded" data-testid={`text-recommendation-${restaurant.id}`}>
                  {stats.recommendation}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
