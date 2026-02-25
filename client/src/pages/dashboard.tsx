import { useState } from "react";
import { WelcomeBlock } from "@/components/welcome-block";
import { MetricCards } from "@/components/metric-cards";
import { OrdersChart } from "@/components/orders-chart";
import { RestaurantStatus } from "@/components/restaurant-status";
import { RecommendationsSection } from "@/components/recommendations-section";
import { MarketingSection } from "@/components/marketing-section";
import { LearningSection } from "@/components/learning-section";
import { KnowledgeBaseSection } from "@/components/knowledge-base-section";
import { SupportSection } from "@/components/support-section";
import { StaffSection } from "@/components/staff-section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { DashboardMetrics, Restaurant, LearningProgress, Article, SupportTicket, DateFilterType } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";

export default function Dashboard() {
  const { t } = useLanguage();
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("today");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const buildDateParams = () => {
    const params = new URLSearchParams();
    if (selectedBranch !== "all") {
      params.set("restaurantId", selectedBranch);
    }
    params.set("dateType", dateFilterType);
    if (dateFilterType === "custom" && dateRange.from && dateRange.to) {
      params.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
      params.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
    }
    return params.toString();
  };

  const { 
    data: metrics, 
    isLoading: metricsLoading,
    isError: metricsError,
    refetch: refetchMetrics 
  } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics", selectedBranch, dateFilterType, dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      const params = buildDateParams();
      const response = await fetch(`/api/dashboard/metrics?${params}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
  });

  const { 
    data: restaurants, 
    isLoading: restaurantsLoading, 
    isError: restaurantsError,
    refetch: refetchRestaurants 
  } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const { 
    data: learningProgress, 
    isLoading: learningLoading, 
    isError: learningError,
    refetch: refetchLearning 
  } = useQuery<LearningProgress>({
    queryKey: ["/api/learning/progress"],
  });

  const { 
    data: articles, 
    isLoading: articlesLoading, 
    isError: articlesError,
    refetch: refetchArticles 
  } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { 
    data: tickets, 
    isLoading: ticketsLoading, 
    isError: ticketsError,
    refetch: refetchTickets 
  } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support/tickets"],
  });

  const getDateLabel = () => {
    if (dateFilterType === "today") return t.today;
    if (dateFilterType === "all") return t.allPeriod;
    if (dateFilterType === "custom" && dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "dd.MM.yy")} - ${format(dateRange.to, "dd.MM.yy")}`;
    }
    return t.selectDates;
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 bg-background min-h-full" data-testid="dashboard-container">
        <WelcomeBlock userName="Жанар" />

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4" />
            {t.filter}:
          </span>
          <Select value={dateFilterType} onValueChange={(v) => setDateFilterType(v as DateFilterType)}>
            <SelectTrigger className="w-[140px]" data-testid="select-date-type-trigger">
              <SelectValue placeholder={t.today} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today" data-testid="select-date-today">{t.today}</SelectItem>
              <SelectItem value="custom" data-testid="select-date-custom">{t.selectDates}</SelectItem>
              <SelectItem value="all" data-testid="select-date-all">{t.allPeriod}</SelectItem>
            </SelectContent>
          </Select>

          {dateFilterType === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-date-picker">
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange.from && dateRange.to ? (
                    <span>{format(dateRange.from, "dd.MM")} - {format(dateRange.to, "dd.MM")}</span>
                  ) : (
                    <span>{t.select}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  locale={ru}
                  numberOfMonths={2}
                  data-testid="calendar-date-range"
                />
              </PopoverContent>
            </Popover>
          )}

          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[180px]" data-testid="select-branch-trigger">
              <SelectValue placeholder={t.allBranches} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="select-branch-all">{t.allBranches}</SelectItem>
              {restaurants?.map((restaurant) => (
                <SelectItem 
                  key={restaurant.id} 
                  value={restaurant.id}
                  data-testid={`select-branch-${restaurant.id}`}
                >
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <MetricCards 
          metrics={metrics} 
          isLoading={metricsLoading}
          isError={metricsError}
          onRetry={() => refetchMetrics()}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <OrdersChart 
              restaurantId={selectedBranch} 
              dateFilterType={dateFilterType}
              startDate={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined}
              endDate={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined}
            />
            
            <RestaurantStatus 
              restaurants={restaurants} 
              isLoading={restaurantsLoading} 
              isError={restaurantsError}
              onRetry={() => refetchRestaurants()}
            />
            
            <MarketingSection />
          </div>
          
          <div className="space-y-6">
            <RecommendationsSection />
            
            <StaffSection />
            
            <KnowledgeBaseSection 
              articles={articles} 
              isLoading={articlesLoading} 
              isError={articlesError}
              onRetry={() => refetchArticles()}
            />
            
            <LearningSection 
              progress={learningProgress} 
              isLoading={learningLoading} 
              isError={learningError}
              onRetry={() => refetchLearning()}
            />
            
            <SupportSection 
              tickets={tickets} 
              isLoading={ticketsLoading} 
              isError={ticketsError}
              onRetry={() => refetchTickets()}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
