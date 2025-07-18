
import { Outlet } from "react-router-dom";
import { useState } from "react";
import AppHeader from "./AppHeader";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { usePresence } from "@/hooks/usePresence";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import ErrorBoundary from "./ErrorBoundary";

const LoggedInLayoutContent = () => {
  usePresence();
  const { leftSidebarCollapsed } = useSidebar();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DesktopSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        <AppHeader 
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};

const LoggedInLayout = () => {
  return (
    <SidebarProvider>
      <LoggedInLayoutContent />
    </SidebarProvider>
  );
};

export default LoggedInLayout;
