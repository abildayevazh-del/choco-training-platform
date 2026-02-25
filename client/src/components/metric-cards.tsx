import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardMetrics } from "@shared/schema";

interface MetricCardProps {
  title: string;
  value: string;
  rawValue: number;
  emptyMessage?: string;
  testId: string;
}

function MetricCard({ title, value, rawValue, emptyMessage, testId }: MetricCardProps) {
  return (
    <Card data-testid={`card-${testId}`}>
      <CardContent className="p-5">
        {rawValue === 0 && emptyMessage ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{emptyMessage}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-foreground" data-testid={`text-${testId}`}>
              {value}
            </span>
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricCardsProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function MetricCards({ metrics, isLoading, isError, onRetry }: MetricCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-loading">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse" data-testid={`card-metric-skeleton-${i}`}>
            <CardContent className="p-5">
              <div className="flex flex-col gap-2">
                <div className="h-8 w-24 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card data-testid="metrics-error">
        <CardContent className="p-5">
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-muted-foreground">
            <AlertCircle className="h-10 w-10" />
            <p>Не удалось загрузить метрики</p>
            <Button variant="outline" onClick={onRetry} data-testid="button-retry-metrics">
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card data-testid="metrics-empty">
        <CardContent className="p-5">
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-muted-foreground">
            <p>Данные недоступны</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("ru-RU").format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-container">
      <MetricCard
        title="Выручка за сегодня"
        value={formatNumber(metrics.todayRevenue)}
        rawValue={metrics.todayRevenue}
        emptyMessage="Данных нет...Неужели гости ещё не оплачивали через Choco?"
        testId="metric-revenue"
      />
      <MetricCard
        title="Оплат прошло"
        value={String(metrics.ordersCount)}
        rawValue={metrics.ordersCount}
        testId="metric-orders"
      />
      <MetricCard
        title="Средний чек"
        value={formatNumber(metrics.averageCheck)}
        rawValue={metrics.averageCheck}
        testId="metric-average-check"
      />
      <MetricCard
        title="Новые гости"
        value={String(metrics.newGuests)}
        rawValue={metrics.newGuests}
        testId="metric-new-guests"
      />
    </div>
  );
}
