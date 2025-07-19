
import { Link } from "react-router-dom";
import { Settings, PanelLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import GlobalSearch from "@/components/search/GlobalSearch";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";

interface AppHeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const AppHeader = ({ isSidebarCollapsed, onToggleSidebar }: AppHeaderProps) => {
  const { profile, user } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out successfully",
          description: "You have been logged out.",
        });
      }
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      toast({
        title: "Error signing out",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:flex hidden">
          <PanelLeft className="h-5 w-5" />
        </Button>
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
        {user && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
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
