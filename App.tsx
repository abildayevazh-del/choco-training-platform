import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { FloatingButtons } from "@/components/floating-buttons";
import { LanguageProvider } from "@/lib/i18n";
import { RoleProvider } from "@/lib/role-context";
import { RoleSelectionModal } from "@/components/role-selection-modal";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import TrainingLesson from "@/pages/training-lesson";
import Training from "@/pages/training";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/training" component={Training} />
      <Route path="/training/product-basics" component={TrainingLesson} />
      <Route path="/training/:lessonId" component={TrainingLesson} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <RoleProvider>
          <TooltipProvider>
            <RoleSelectionModal />
            <SidebarProvider style={sidebarStyle as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1 min-w-0">
                  <DashboardHeader />
                  <main className="flex-1 min-h-0 overflow-hidden">
                    <Router />
                  </main>
                </div>
              </div>
              <FloatingButtons />
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </RoleProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
