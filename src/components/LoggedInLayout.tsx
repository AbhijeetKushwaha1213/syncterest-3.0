import { Outlet } from "react-router-dom";
import { useState } from "react";
import AppHeader from "./AppHeader";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { usePresence } from "@/hooks/usePresence";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import ErrorBoundary from "./ErrorBoundary";
import SectionErrorBoundary from "./SectionErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const LoggedInLayoutContent = () => {
  usePresence();
  const { leftSidebarCollapsed } = useSidebar();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <SectionErrorBoundary sectionName="Navigation Sidebar">
        <DesktopSidebar />
      </SectionErrorBoundary>
      
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        <SectionErrorBoundary sectionName="Header">
          <AppHeader 
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </SectionErrorBoundary>
        
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      
      <SectionErrorBoundary sectionName="Mobile Navigation">
        <MobileBottomNav />
      </SectionErrorBoundary>
    </div>
  );
};

const LoadingLayout = () => (
  <div className="flex min-h-screen w-full bg-background">
    <div className="w-64 border-r bg-muted/30 p-4">
      <Skeleton className="h-8 w-full mb-4" />
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full mb-2" />
      ))}
    </div>
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4">
        <Skeleton className="h-10 w-1/3" />
      </div>
      <div className="flex-1 p-4">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const LoggedInLayout = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingLayout />;
  }

  return (
    <SidebarProvider>
      <ErrorBoundary>
        <LoggedInLayoutContent />
      </ErrorBoundary>
    </SidebarProvider>
  );
};

export default LoggedInLayout;
