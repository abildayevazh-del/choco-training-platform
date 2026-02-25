import { Link, useLocation } from "wouter";
import {
  Home,
  ShoppingCart,
  FileText,
  LayoutGrid,
  Users,
  BarChart3,
  Heart,
  User,
  GraduationCap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useRole, ROLES, PRODUCTS } from "@/lib/role-context";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  titleKey: keyof ReturnType<typeof useLanguage>["t"];
  url: string;
  icon: typeof Home;
}

const navigation: NavItem[] = [
  { titleKey: "home", url: "/", icon: Home },
  { titleKey: "cashRegister", url: "/cash-register", icon: ShoppingCart },
  { titleKey: "reports", url: "/reports", icon: FileText },
  { titleKey: "tools", url: "/tools", icon: LayoutGrid },
  { titleKey: "clientWork", url: "/clients", icon: Users },
  { titleKey: "analytics", url: "/analytics", icon: BarChart3 },
  { titleKey: "training", url: "/training", icon: GraduationCap },
];

const ROLE_TITLE_KEYS: Record<string, keyof ReturnType<typeof useLanguage>["t"]> = {
  owner: "owner",
  manager: "manager",
  admin: "administrator",
  cashier: "cashier",
  waiter: "waiter",
  runner: "runner",
  accountant: "accountant",
  marketer: "marketer",
};

const PRODUCT_TITLE_KEYS: Record<string, keyof ReturnType<typeof useLanguage>["t"]> = {
  order_no_waiter: "orderNoWaiter",
  order_no_cashier: "orderNoCashier",
  bill_qr: "billQr",
  self_service_kiosk: "selfServiceKiosk",
};

export function AppSidebar() {
  const { role, products, clearSetup } = useRole();
  const { t } = useLanguage();
  const [location] = useLocation();
  const roleInfo = ROLES.find(r => r.id === role);
  const connectedProducts = PRODUCTS.filter(p => products.includes(p.id));

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary fill-primary" />
          <span className="font-semibold text-lg text-sidebar-foreground" data-testid="text-brand-name">
            Choco <span className="font-normal">бизнес</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                const isExactHome = item.url === "/" && location === "/";
                const active = item.url === "/" ? isExactHome : isActive;
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"}
                    >
                      <Link href={item.url} data-testid={`nav-${item.url.replace(/\//g, "-")}`}>
                        <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                        <span className="text-sm">{t[item.titleKey]}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div
          className="flex items-center gap-3 cursor-pointer hover-elevate rounded-lg p-2 -m-2"
          onClick={clearSetup}
          data-testid="button-change-role"
        >
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-sidebar-foreground">Жанар</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {roleInfo && (
                <Badge variant="secondary" className="text-xs">
                  {ROLE_TITLE_KEYS[roleInfo.id] ? t[ROLE_TITLE_KEYS[roleInfo.id]] : roleInfo.title}
                </Badge>
              )}
            </div>
            {connectedProducts.length > 0 && (
              <span className="text-xs text-muted-foreground mt-0.5">
                {connectedProducts.map(p => PRODUCT_TITLE_KEYS[p.id] ? t[PRODUCT_TITLE_KEYS[p.id]] : p.title).join(", ")}
              </span>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
