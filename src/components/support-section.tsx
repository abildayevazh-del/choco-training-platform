import { useState } from "react";
import { Headphones, Plus, Clock, CheckCircle2, AlertCircle, Ticket, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIChat } from "./ai-chat";
import type { SupportTicket } from "@shared/schema";

interface SupportSectionProps {
  tickets?: SupportTicket[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

function getStatusBadge(status: string) {
  if (status === "in_progress") {
    return (
      <Badge variant="secondary" size="sm" className="gap-1">
        <Clock className="h-3 w-3" />
        В работе
      </Badge>
    );
  }
  return (
    <Badge variant="outline" size="sm" className="gap-1 text-green-600 dark:text-green-400 border-green-600/30">
      <CheckCircle2 className="h-3 w-3" />
      Решено
    </Badge>
  );
}

export function SupportSection({ tickets, isLoading, isError, onRetry }: SupportSectionProps) {
  const [showAIChat, setShowAIChat] = useState(false);

  if (showAIChat) {
    return <AIChat onClose={() => setShowAIChat(false)} />;
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse" data-testid="card-support-loading">
        <CardHeader className="pb-2">
          <div className="h-6 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-9 w-full bg-muted rounded" />
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-muted rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card data-testid="card-support-error">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-medium">Техподдержка</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">Не удалось загрузить</p>
            <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry-support">
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-support">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Headphones className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-medium">Техподдержка</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full bg-gradient-to-r from-primary to-primary/80" 
          onClick={() => setShowAIChat(true)}
          data-testid="button-ai-assistant"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Помощник
        </Button>
        
        <Button variant="outline" className="w-full" data-testid="button-create-ticket">
          <Plus className="mr-2 h-4 w-4" />
          Оставить заявку
        </Button>
        
        {(!tickets || tickets.length === 0) ? (
          <div className="flex flex-col items-center justify-center gap-3 py-4 text-muted-foreground">
            <Ticket className="h-8 w-8" />
            <p className="text-sm">Нет заявок</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50"
                data-testid={`card-ticket-${ticket.id}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate" data-testid={`text-ticket-title-${ticket.id}`}>
                    {ticket.title}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-ticket-date-${ticket.id}`}>
                    {ticket.createdAt}
                  </p>
                </div>
                <div data-testid={`badge-ticket-status-${ticket.id}`}>
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
