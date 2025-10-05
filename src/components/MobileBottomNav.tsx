
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Home, Search, MessageCircle, User, Users } from "lucide-react";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Messages", href: "/chat", icon: MessageCircle },
    { name: "Profile", href: user?.id ? `/profile/${user.id}` : "/settings/account", icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t z-50 safe-area-pb">
      <nav className="flex justify-around">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href.startsWith('/profile/') && location.pathname.startsWith('/profile/'));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 min-h-[64px] flex-1 transition-all duration-200",
                "active:scale-95 active:bg-muted/50",
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              )}
            >
              <item.icon className={cn(
                "mb-1 transition-all duration-200",
                isActive ? "h-7 w-7" : "h-6 w-6"
              )} />
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive ? "scale-105" : ""
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
