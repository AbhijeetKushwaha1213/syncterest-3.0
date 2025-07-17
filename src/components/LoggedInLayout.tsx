
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { usePresence } from "@/hooks/usePresence";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

const LoggedInLayoutContent = () => {
  usePresence();
  const { leftSidebarCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DesktopSidebar />
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
        leftSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
      }`}>
        <AppHeader />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
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
