import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = 
  | "owner"        // владелец
  | "manager"      // управляющий
  | "admin"        // администратор
  | "cashier"      // кассир
  | "waiter"       // официант
  | "runner"       // раннер
  | "accountant"   // бухгалтер
  | "marketer";    // маркетолог

export type SRProduct = 
  | "order_no_waiter"     // Заказ без официанта
  | "order_no_cashier"    // Заказ без кассира
  | "bill_qr"             // Подтягивание счета (закрытие через QR)
  | "self_service_kiosk"; // Киоск самообслуживания

export interface RoleInfo {
  id: UserRole;
  title: string;
  description: string;
}

export interface ProductInfo {
  id: SRProduct;
  title: string;
  description: string;
}

export const ROLES: RoleInfo[] = [
  { id: "owner", title: "Владелец", description: "Полный доступ ко всем функциям" },
  { id: "manager", title: "Управляющий", description: "Управление заведением и персоналом" },
  { id: "admin", title: "Администратор", description: "Операционное управление" },
  { id: "cashier", title: "Кассир", description: "Работа с заказами и оплатой" },
  { id: "waiter", title: "Официант", description: "Обслуживание гостей" },
  { id: "runner", title: "Раннер", description: "Доставка заказов гостям" },
  { id: "accountant", title: "Бухгалтер", description: "Финансовая отчётность" },
  { id: "marketer", title: "Маркетолог", description: "Продвижение и акции" },
];

export const PRODUCTS: ProductInfo[] = [
  { id: "order_no_waiter", title: "Заказ без официанта", description: "Для заведений с официантами и раннерами" },
  { id: "order_no_cashier", title: "Заказ без кассира", description: "Гость совершает заказ у кассы по QR" },
  { id: "bill_qr", title: "Подтягивание счета", description: "Закрытие счета на оплату через QR" },
  { id: "self_service_kiosk", title: "Киоск самообслуживания", description: "Заказ через терминал самообслуживания" },
];

export type SidebarSection = 
  | "home"
  | "analytics"
  | "marketing"
  | "menu"
  | "venues"
  | "staff"
  | "training"
  | "knowledge"
  | "support"
  | "settings";

export const ROLE_SIDEBAR_ACCESS: Record<UserRole, SidebarSection[]> = {
  owner: ["home", "analytics", "marketing", "menu", "venues", "staff", "training", "knowledge", "support", "settings"],
  manager: ["home", "analytics", "marketing", "menu", "venues", "staff", "training", "knowledge", "support", "settings"],
  admin: ["home", "analytics", "menu", "staff", "training", "knowledge", "support", "settings"],
  cashier: ["home", "menu", "training", "knowledge", "support"],
  waiter: ["home", "menu", "training", "knowledge", "support"],
  runner: ["home", "training", "knowledge", "support"],
  accountant: ["home", "analytics", "training", "knowledge", "support", "settings"],
  marketer: ["home", "analytics", "marketing", "training", "knowledge", "support"],
};

export type ModuleType = "core" | "role" | "product";

export interface TrainingModuleConfig {
  id: string;
  type: ModuleType;
  roles: UserRole[];
  products?: SRProduct[];
}

export const TRAINING_MODULE_CONFIG: TrainingModuleConfig[] = [
  { id: "1", type: "core", roles: ["owner", "manager", "admin", "cashier", "waiter", "runner", "accountant", "marketer"] },
  { id: "7", type: "role", roles: ["owner", "manager", "admin", "waiter", "marketer"] },
  { id: "9", type: "product", roles: ["owner", "manager", "admin", "cashier", "waiter", "runner"], products: ["order_no_waiter", "order_no_cashier", "self_service_kiosk"] },
  { id: "10", type: "role", roles: ["owner", "manager", "admin", "cashier", "accountant"] },
  { id: "11", type: "core", roles: ["owner", "manager", "admin", "cashier", "waiter", "runner", "accountant", "marketer"] },
  { id: "12", type: "role", roles: ["owner", "manager", "admin"] },
  { id: "13", type: "role", roles: ["owner", "manager", "admin", "cashier"] },
  { id: "13b", type: "role", roles: ["owner", "manager", "admin", "cashier"] },
  { id: "17", type: "role", roles: ["owner", "manager", "admin"] },
  { id: "14", type: "role", roles: ["owner", "manager", "admin", "cashier"] },
  { id: "15", type: "role", roles: ["owner", "manager", "admin", "cashier"] },
  { id: "16", type: "role", roles: ["owner", "manager", "admin", "cashier"] },
  { id: "18", type: "role", roles: ["owner", "manager", "admin"] },
  { id: "19", type: "role", roles: ["owner", "manager", "admin"] },
  { id: "20", type: "role", roles: ["owner", "manager", "admin", "cashier"] },
  { id: "21", type: "role", roles: ["owner", "manager", "admin"] },
  { id: "22", type: "role", roles: ["owner", "manager", "admin", "cashier"] },
  { id: "23", type: "role", roles: ["owner", "manager", "admin"] },
];

interface RoleContextType {
  role: UserRole | null;
  products: SRProduct[];
  setRole: (role: UserRole) => void;
  setProducts: (products: SRProduct[]) => void;
  hasAccess: (section: SidebarSection) => boolean;
  hasModuleAccess: (moduleId: string) => boolean;
  isSetupComplete: boolean;
  clearSetup: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = "smart_restaurant_user_role";
const PRODUCTS_STORAGE_KEY = "smart_restaurant_products";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [products, setProductsState] = useState<SRProduct[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
    const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    
    if (savedRole && ROLES.some(r => r.id === savedRole)) {
      setRoleState(savedRole);
    }
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts) as SRProduct[];
        setProductsState(parsed.filter(p => PRODUCTS.some(prod => prod.id === p)));
      } catch {
        setProductsState([]);
      }
    }
    setIsInitialized(true);
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  const setProducts = (newProducts: SRProduct[]) => {
    setProductsState(newProducts);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
  };

  const clearSetup = () => {
    setRoleState(null);
    setProductsState([]);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
  };

  const hasAccess = (section: SidebarSection): boolean => {
    if (!role) return false;
    return ROLE_SIDEBAR_ACCESS[role].includes(section);
  };

  const hasModuleAccess = (moduleId: string): boolean => {
    if (!role) return false;
    
    const moduleConfig = TRAINING_MODULE_CONFIG.find(m => m.id === moduleId);
    if (!moduleConfig) return false;
    
    if (!moduleConfig.roles.includes(role)) return false;
    
    if (moduleConfig.type === "product" && moduleConfig.products) {
      return moduleConfig.products.some(p => products.includes(p));
    }
    
    return true;
  };

  if (!isInitialized) {
    return null;
  }

  const isSetupComplete = role !== null && products.length > 0;

  return (
    <RoleContext.Provider value={{ 
      role, 
      products,
      setRole,
      setProducts,
      hasAccess, 
      hasModuleAccess, 
      isSetupComplete,
      clearSetup
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
