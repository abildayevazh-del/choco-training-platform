import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BarChart3 } from "lucide-react";
import type { OrdersChartResponse } from "@shared/schema";

type TimeFilter = "day" | "week" | "month";

interface OrdersChartProps {
  restaurantId: string;
  dateFilterType: string;
  startDate?: string;
  endDate?: string;
}

export function OrdersChart({ restaurantId, dateFilterType, startDate, endDate }: OrdersChartProps) {
  const [filter, setFilter] = useState<TimeFilter>("week");

  const { data, isLoading, isError, refetch } = useQuery<OrdersChartResponse>({
    queryKey: ["/api/orders/chart", filter, restaurantId, dateFilterType, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ period: filter, dateType: dateFilterType });
      if (restaurantId !== "all") {
        params.set("restaurantId", restaurantId);
      }
      if (dateFilterType === "custom" && startDate && endDate) {
        params.set("startDate", startDate);
        params.set("endDate", endDate);
      }
      const response = await fetch(`/api/orders/chart?${params}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }
      return response.json();
    },
  });

  const filterLabels: Record<TimeFilter, string> = {
    day: "День",
    week: "Неделя",
    month: "Месяц",
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse" data-testid="card-orders-chart-loading">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card data-testid="card-orders-chart-error">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Динамика заказов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <AlertCircle className="h-12 w-12" />
            <p>Не удалось загрузить данные графика</p>
            <Button variant="outline" onClick={() => refetch()} data-testid="button-retry-chart">
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <Card data-testid="card-orders-chart-empty">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Динамика заказов</CardTitle>
          <div className="flex gap-1">
            {(["day", "week", "month"] as TimeFilter[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f)}
                data-testid={`button-filter-${f}`}
              >
                {filterLabels[f]}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <BarChart3 className="h-12 w-12" />
            <p>Нет данных за выбранный период</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-orders-chart">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Динамика заказов</CardTitle>
        <div className="flex gap-1">
          {(["day", "week", "month"] as TimeFilter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
              data-testid={`button-filter-${f}`}
            >
              {filterLabels[f]}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]" data-testid="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow-md)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar
                dataKey="orders"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="Заказы"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
