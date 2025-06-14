
import { Link } from "react-router-dom";
import { Bell, Mic, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const AppHeader = () => {
  const { profile } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-2 border-b bg-background px-4 md:px-6">
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Mic className="h-5 w-5" />
      </Button>
      <Link to="/account">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </Link>
      <Link to={profile ? `/profile/${profile.id}` : "/account"}>
        <Avatar className="h-9 w-9">
          <AvatarImage src={profile?.avatar_url ?? ""} alt={profile?.username ?? "avatar"} />
          <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
};

export default AppHeader;
