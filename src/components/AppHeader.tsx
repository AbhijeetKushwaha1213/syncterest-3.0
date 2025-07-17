
import { Link } from "react-router-dom";
import { Settings, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";
import GlobalSearch from "@/components/search/GlobalSearch";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";

const AppHeader = () => {
  const { profile } = useAuth();
  const { leftSidebarCollapsed, toggleLeftSidebar } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center gap-4">
        {leftSidebarCollapsed && (
          <Button variant="ghost" size="icon" onClick={toggleLeftSidebar}>
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
        )}
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
        <Link to={profile ? `/profile/${profile.id}` : "/settings/account"}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url ?? ""} alt={profile?.username ?? "avatar"} />
            <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};

export default AppHeader;
