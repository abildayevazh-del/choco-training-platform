import { BookOpen, FileText, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Article } from "@shared/schema";

interface KnowledgeBaseSectionProps {
  articles?: Article[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function KnowledgeBaseSection({ articles, isLoading, isError, onRetry }: KnowledgeBaseSectionProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse" data-testid="card-knowledge-base-loading">
        <CardHeader className="pb-2">
          <div className="h-6 w-40 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
          <div className="h-9 w-full bg-muted rounded mt-2" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card data-testid="card-knowledge-base-error">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-medium">Популярные статьи</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">Не удалось загрузить</p>
            <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry-articles">
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <Card data-testid="card-knowledge-base-empty">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-medium">Популярные статьи</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-muted-foreground">
            <FileText className="h-8 w-8" />
            <p className="text-sm">Статьи не найдены</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-knowledge-base">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-medium">Популярные статьи</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {articles.map((article) => (
          <div
            key={article.id}
            className="flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer transition-colors"
            data-testid={`card-article-${article.id}`}
          >
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-foreground" data-testid={`text-article-title-${article.id}`}>
              {article.title}
            </span>
          </div>
        ))}
        
        <Button className="w-full mt-2" variant="outline" data-testid="button-open-knowledge-base">
          Открыть базу знаний
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
