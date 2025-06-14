
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, LogOut, MessageCircle, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/home", icon: Users, label: "People" },
];

const DesktopSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/home" className="text-2xl font-bold">
          syncterest
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item, index) => (
          <Link
            key={`${item.href}-${index}`}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
              location.pathname === item.href && "bg-muted text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-2 border-t p-4">
        <Link
          to="/account"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
            location.pathname === "/account" && "bg-muted text-primary"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 px-3">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
