
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
    <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between gap-2 sm:gap-4 border-b bg-background px-3 sm:px-4 md:px-6">
      <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar} 
          className="md:flex hidden shrink-0"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <GlobalSearch />
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <div className="hidden xs:block">
          <NotificationsDropdown />
        </div>
        
        <Link to="/settings" className="shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-9 w-9 sm:h-10 sm:w-10"
            title="Settings"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>
        
        {user && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-9 w-9 sm:h-10 sm:w-10 hidden sm:flex"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
        
        <Link 
          to={profile ? `/profile/${profile.id}` : "/settings/account"}
          className="shrink-0"
        >
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-background shadow-sm">
            <AvatarImage src={profile?.avatar_url ?? ""} alt={profile?.username ?? "avatar"} />
            <AvatarFallback className="text-xs">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};

export default AppHeader;
