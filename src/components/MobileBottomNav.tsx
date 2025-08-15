
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Home, Search, MessageCircle, User } from "lucide-react";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Messages", href: "/chat", icon: MessageCircle },
    { name: "Profile", href: `/profile/${user?.id}`, icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <nav className="flex justify-around">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href.startsWith('/profile/') && location.pathname.startsWith('/profile/'));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 min-h-[60px] flex-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
