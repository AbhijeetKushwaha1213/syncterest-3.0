import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Home, Search, MessageCircle, User, Settings } from "lucide-react";

const DesktopSidebar = () => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const navigation = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Messages", href: "/chat", icon: MessageCircle },
    { name: "Profile", href: `/profile/${user?.id}`, icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-card border-r pt-5 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-primary">Syncterest</h1>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href.startsWith('/profile/') && location.pathname.startsWith('/profile/'));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* User Profile Section */}
          <div className="flex-shrink-0 p-4 border-t">
            <Link 
              to={`/profile/${user?.id}`}
              className="flex items-center space-x-3 hover:bg-muted p-2 rounded-md transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url ?? ""} alt={profile?.username ?? "avatar"} />
                <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || profile?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{profile?.username || "username"}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopSidebar;
