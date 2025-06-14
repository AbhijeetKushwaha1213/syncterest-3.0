
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { usePresence } from "@/hooks/usePresence";

const LoggedInLayout = () => {
  usePresence();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default LoggedInLayout;
