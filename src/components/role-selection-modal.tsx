import { useState } from "react";
import { UserRole, SRProduct, ROLES, PRODUCTS, useRole } from "@/lib/role-context";
import { useLanguage, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Crown, 
  Briefcase, 
  Shield, 
  CreditCard, 
  UtensilsCrossed, 
  Footprints, 
  Calculator, 
  Megaphone,
  Check,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Heart,
  Menu
} from "lucide-react";

const ROLE_ICONS: Record<UserRole, typeof Crown> = {
  owner: Crown,
  manager: Briefcase,
  admin: Shield,
  cashier: CreditCard,
  waiter: UtensilsCrossed,
  runner: Footprints,
  accountant: Calculator,
  marketer: Megaphone,
};

const PRODUCT_ICONS: Record<SRProduct, typeof Menu> = {
  order_no_waiter: UtensilsCrossed,
  order_no_cashier: QrCode,
  bill_qr: CreditCard,
  self_service_kiosk: Menu,
};

type TranslationsType = ReturnType<typeof useLanguage>["t"];

const ROLE_TITLE_KEYS: Record<UserRole, keyof TranslationsType> = {
  owner: "owner",
  manager: "manager",
  admin: "administrator",
  cashier: "cashier",
  waiter: "waiter",
  runner: "runner",
  accountant: "accountant",
  marketer: "marketer",
};

const ROLE_DESC_KEYS: Record<UserRole, keyof TranslationsType> = {
  owner: "ownerDesc",
  manager: "managerDesc",
  admin: "administratorDesc",
  cashier: "cashierDesc",
  waiter: "waiterDesc",
  runner: "runnerDesc",
  accountant: "accountantDesc",
  marketer: "marketerDesc",
};

const PRODUCT_TITLE_KEYS: Record<SRProduct, keyof TranslationsType> = {
  order_no_waiter: "orderNoWaiter",
  order_no_cashier: "orderNoCashier",
  bill_qr: "billQr",
  self_service_kiosk: "selfServiceKiosk",
};

const PRODUCT_DESC_KEYS: Record<SRProduct, keyof TranslationsType> = {
  order_no_waiter: "orderNoWaiterDesc",
  order_no_cashier: "orderNoCashierDesc",
  bill_qr: "billQrDesc",
  self_service_kiosk: "selfServiceKioskDesc",
};

type SetupStep = "role" | "products";

export function RoleSelectionModal() {
  const { role, products, setRole, setProducts, isSetupComplete } = useRole();
  const { t } = useLanguage();
  const [step, setStep] = useState<SetupStep>("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(role);
  const [selectedProducts, setSelectedProducts] = useState<SRProduct[]>(products);

  if (isSetupComplete) {
    return null;
  }

  const handleRoleConfirm = () => {
    if (selectedRole) {
      setRole(selectedRole);
      setStep("products");
    }
  };

  const handleProductToggle = (productId: SRProduct) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(p => p !== productId)
        : [...prev, productId]
    );
  };

  const handleProductsConfirm = () => {
    if (selectedProducts.length > 0) {
      setProducts(selectedProducts);
    }
  };

  const handleBack = () => {
    setStep("role");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center py-6 px-4">
        <div className="w-full max-w-3xl space-y-4 sm:space-y-6">
          {step === "role" && (
            <>
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                  <div className="h-2 w-8 rounded-full bg-primary" />
                  <div className="h-2 w-8 rounded-full bg-muted" />
                </div>
                <h1 className="text-xl sm:text-3xl font-bold text-foreground" data-testid="text-role-selection-title">
                  {t.welcome} Smart Restaurant
                </h1>
                <p className="text-sm sm:text-lg text-muted-foreground">
                  {t.step} 1: {t.selectRole}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                {ROLES.map((roleInfo) => {
                  const Icon = ROLE_ICONS[roleInfo.id];
                  const isSelected = selectedRole === roleInfo.id;
                  
                  return (
                    <Card
                      key={roleInfo.id}
                      onClick={() => setSelectedRole(roleInfo.id)}
                      className={`cursor-pointer transition-all relative ${
                        isSelected 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : "hover-elevate"
                      }`}
                      data-testid={`role-card-${roleInfo.id}`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                      <CardContent className="p-3 sm:p-4 text-center space-y-1 sm:space-y-2">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-full flex items-center justify-center ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base text-foreground">{t[ROLE_TITLE_KEYS[roleInfo.id]]}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {t[ROLE_DESC_KEYS[roleInfo.id]]}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center pb-4">
                <Button 
                  size="lg" 
                  onClick={handleRoleConfirm}
                  disabled={!selectedRole}
                  className="min-w-[200px] gap-2"
                  data-testid="button-confirm-role"
                >
                  {t.next}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === "products" && (
            <>
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                  <div className="h-2 w-8 rounded-full bg-primary" />
                  <div className="h-2 w-8 rounded-full bg-primary" />
                </div>
                <h1 className="text-xl sm:text-3xl font-bold text-foreground" data-testid="text-products-selection-title">
                  {t.selectProducts}
                </h1>
                <p className="text-sm sm:text-lg text-muted-foreground">
                  {t.step} 2: {t.selectProductsDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {PRODUCTS.map((product) => {
                  const Icon = PRODUCT_ICONS[product.id];
                  const isSelected = selectedProducts.includes(product.id);
                  
                  return (
                    <Card
                      key={product.id}
                      onClick={() => handleProductToggle(product.id)}
                      className={`cursor-pointer transition-all relative ${
                        isSelected 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : "hover-elevate"
                      }`}
                      data-testid={`product-card-${product.id}`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                      <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        <div>
                          <p className="font-semibold text-base sm:text-lg text-foreground">{t[PRODUCT_TITLE_KEYS[product.id]]}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {t[PRODUCT_DESC_KEYS[product.id]]}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3 pb-4">
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleBack}
                  className="min-w-[120px] gap-2"
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.back}
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleProductsConfirm}
                  disabled={selectedProducts.length === 0}
                  className="min-w-[200px]"
                  data-testid="button-confirm-products"
                >
                  {t.startTraining}
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground pb-2">
                {selectedProducts.length} {t.of} {PRODUCTS.length}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
