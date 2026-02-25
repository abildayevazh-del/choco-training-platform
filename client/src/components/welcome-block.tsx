interface WelcomeBlockProps {
  userName?: string;
}

export function WelcomeBlock({ userName = "Пользователь" }: WelcomeBlockProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div data-testid="card-welcome">
      <h1 className="text-2xl font-bold text-foreground" data-testid="text-welcome-greeting">
        Добро пожаловать, {userName}!
      </h1>
      <p className="text-muted-foreground mt-1 text-sm" data-testid="text-welcome-subtitle">
        Состояние компании на {dateStr} г. выглядит следующим образом:
      </p>
    </div>
  );
}
