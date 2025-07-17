
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  Home, 
  MessageCircle, 
  Users, 
  Hash, 
  Settings, 
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

interface DesktopSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const DesktopSidebar = ({ isCollapsed, onToggle }: DesktopSidebarProps) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
    { icon: Hash, label: "Channels", path: "/channels" },
    { icon: Users, label: "Groups", path: "/groups" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <TooltipProvider>
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-background border-r transition-all duration-300 hidden md:flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link to="/home" className="flex items-center space-x-2">
                <span className="text-xl font-bold">syncterest</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
};

export default DesktopSidebar;
