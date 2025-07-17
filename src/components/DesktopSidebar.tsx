
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, LogOut, MessageCircle, Settings, User, Hash, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DesktopSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const DesktopSidebar = ({ isCollapsed, onToggle }: DesktopSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const profileLink = profile ? `/profile/${profile.id}` : "/settings/account";

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    { href: "/channels", icon: Hash, label: "Channels" },
    { href: profileLink, icon: User, label: "Profile" },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = (location.pathname.startsWith(item.href) && item.href !== "/home") ||
      (location.pathname === item.href) ||
      (item.label === 'Profile' && location.pathname.startsWith('/profile'));

    const content = (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
        isActive && "bg-muted text-primary",
        isCollapsed && "justify-center"
        )}
      >
        <item.icon className="h-5 w-5" />
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-50 hidden h-screen flex-col border-r bg-background md:flex transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center border-b px-6">
        {!isCollapsed && (
          <Link to="/home" className="text-2xl font-bold">
            syncterest
          </Link>
        )}
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>
      <div className="mt-auto space-y-2 border-t p-4">
        {!isCollapsed ? (
          <>
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
                location.pathname.startsWith("/settings") && "bg-muted text-primary"
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 px-3">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className={cn(
                    "flex items-center justify-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
                    location.pathname.startsWith("/settings") && "bg-muted text-primary"
                  )}
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button 
          onClick={onToggle} 
          variant="ghost" 
          size="sm"
          className={cn("w-full", isCollapsed ? "px-0" : "justify-start gap-3 px-3")}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronsLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
