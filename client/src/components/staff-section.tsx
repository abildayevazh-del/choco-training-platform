import { Users, Star, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  rating: number;
  shiftsThisWeek: number;
  salesAmount: number;
}

const staffData: StaffMember[] = [
  { id: "1", name: "Айгерим", role: "Кассир", rating: 4.8, shiftsThisWeek: 5, salesAmount: 245000 },
  { id: "2", name: "Нурлан", role: "Кассир", rating: 4.5, shiftsThisWeek: 4, salesAmount: 198000 },
  { id: "3", name: "Диана", role: "Старший смены", rating: 4.9, shiftsThisWeek: 6, salesAmount: 312000 },
];

function getRatingColor(rating: number) {
  if (rating >= 4.5) return "text-green-600 dark:text-green-400";
  if (rating >= 4.0) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

interface StaffSectionProps {
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function StaffSection({ isLoading, isError, onRetry }: StaffSectionProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse" data-testid="card-staff-loading">
        <CardHeader className="pb-2">
          <div className="h-6 w-32 bg-muted rounded" />
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
      <Card data-testid="card-staff-error">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-medium">Сотрудники</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">Не удалось загрузить</p>
            <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry-staff">
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topPerformer = staffData.reduce((a, b) => a.salesAmount > b.salesAmount ? a : b);

  return (
    <Card data-testid="card-staff">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-medium">Сотрудники</CardTitle>
          </div>
          <Badge variant="secondary" size="sm">
            {staffData.length} человек
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800/30">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-400">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium">Лучший за неделю:</span>
            <span>{topPerformer.name}</span>
            <span className="text-amber-600 dark:text-amber-500">
              ({(topPerformer.salesAmount / 1000).toFixed(0)}K ₸)
            </span>
          </div>
        </div>

        {staffData.map((staff) => (
          <div
            key={staff.id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50"
            data-testid={`card-staff-${staff.id}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground" data-testid={`text-staff-name-${staff.id}`}>
                  {staff.name}
                </p>
                <Badge variant="outline" size="sm">{staff.role}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1">
                  <Star className={`h-3 w-3 ${getRatingColor(staff.rating)}`} />
                  <span className={`text-xs font-medium ${getRatingColor(staff.rating)}`}>
                    {staff.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{staff.shiftsThisWeek} смен</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{(staff.salesAmount / 1000).toFixed(0)}K ₸</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full" data-testid="button-view-all-staff">
          Все сотрудники
        </Button>
      </CardContent>
    </Card>
  );
}
