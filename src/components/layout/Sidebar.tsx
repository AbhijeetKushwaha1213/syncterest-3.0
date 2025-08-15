
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, Calendar, MapPin, Search, Bell, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Nearby", href: "/nearby", icon: MapPin },
  { name: "Search", href: "/search", icon: Search },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-muted/30">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Community</h1>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={location.pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          asChild
        >
          <Link to={`/profile/${user?.id}`}>
            <User className="mr-3 h-5 w-5" />
            My Profile
          </Link>
        </Button>
      </div>
    </div>
  );
}
