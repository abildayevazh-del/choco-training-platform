import { Megaphone, Tag, Heart, ArrowRight, Printer, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MarketingCardProps {
  title: string;
  description: string;
  icon: typeof Megaphone;
  testId: string;
}

function MarketingCard({ title, description, icon: Icon, testId }: MarketingCardProps) {
  return (
    <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all group" data-testid={testId}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground" data-testid={`${testId}-title`}>{title}</h3>
            <p className="text-sm text-muted-foreground mt-1" data-testid={`${testId}-description`}>{description}</p>
          </div>
          <Button variant="ghost" className="w-fit p-0 h-auto gap-1" data-testid={`${testId}-button`}>
            <span className="text-sm text-primary font-medium">Перейти</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketingSection() {
  return (
    <div className="space-y-4" data-testid="section-marketing">
      <h2 className="text-lg font-medium text-foreground" data-testid="text-marketing-title">Маркетинг</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MarketingCard
          title="Создать акцию"
          description="Запустите специальное предложение"
          icon={Megaphone}
          testId="card-marketing-promotions"
        />
        <MarketingCard
          title="Промокоды"
          description="Управляйте скидками"
          icon={Tag}
          testId="card-marketing-promo-codes"
        />
        <MarketingCard
          title="Лояльность"
          description="Программа лояльности"
          icon={Heart}
          testId="card-marketing-loyalty"
        />
        <MarketingCard
          title="POS-материалы"
          description="Создайте наклейки и тейбл-тенты"
          icon={Printer}
          testId="card-marketing-pos"
        />
        <MarketingCard
          title="Грейдирование"
          description="Рейтинг и уровни партнёров"
          icon={Award}
          testId="card-marketing-grading"
        />
      </div>
    </div>
  );
}
