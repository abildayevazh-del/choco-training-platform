import { Bell, HelpCircle, User, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage, type Language } from "@/lib/i18n";

export function DashboardHeader() {
  const { language, setLanguage, t, languageNames } = useLanguage();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between gap-4 px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="hidden md:flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary fill-primary" />
          <span className="text-base font-semibold text-foreground" data-testid="text-header-brand">
            Choco <span className="font-normal">бизнес</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              data-testid="button-language"
            >
              <span className="text-sm">{language === "kk" ? "Казақша" : language === "ru" ? "Русский" : "English"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(["kk", "ru", "en"] as Language[]).map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setLanguage(lang)}
                className={language === lang ? "bg-accent" : ""}
                data-testid={`menu-lang-${lang}`}
              >
                {languageNames[lang]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            3
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          data-testid="button-help"
        >
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="ml-1 gap-2"
              data-testid="button-profile"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  Ж
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm text-foreground">Жанар Аби</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Жанар Аби</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-profile">
              <User className="mr-2 h-4 w-4" />
              {t.profile}
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-settings">
              {t.settings}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-logout">
              {t.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
