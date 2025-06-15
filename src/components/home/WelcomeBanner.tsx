
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface WelcomeBannerProps {
  currentUserProfile: Profile;
}

const WelcomeBanner = ({ currentUserProfile }: WelcomeBannerProps) => {
  return (
    <Card className="relative overflow-hidden border-none text-primary-foreground bg-cover bg-center group">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
      <CardContent className="relative z-10 p-6">
        <div className="flex items-center gap-4">
          <Link to={`/profile/${currentUserProfile.id}`}>
            <Avatar className="h-16 w-16 border-4 border-white/50 hover:border-white/80 transition-colors">
              <AvatarImage src={currentUserProfile.avatar_url ?? ""} />
              <AvatarFallback className="bg-primary/50 text-2xl">{currentUserProfile.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <h1 className="text-2xl font-bold drop-shadow-md">Welcome back, {currentUserProfile.full_name || currentUserProfile.username}!</h1>
            <p className="opacity-80 mt-1 drop-shadow">Ready to meet, create, and connect?</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeBanner;
