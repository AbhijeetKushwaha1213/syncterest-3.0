
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Database } from "@/integrations/supabase/types";
import { useLocation } from "@/hooks/useLocation";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface WelcomeBannerProps {
  currentUserProfile: Profile;
}

const WelcomeBanner = ({ currentUserProfile }: WelcomeBannerProps) => {
  const { hasLocation, getLocation, loading } = useLocation();

  // Query for nearby users with shared interests
  const { data: nearbyCount } = useQuery({
    queryKey: ['nearby_shared_interests', currentUserProfile.id, currentUserProfile.interests],
    queryFn: async () => {
      if (!currentUserProfile.latitude || !currentUserProfile.longitude || !currentUserProfile.interests) {
        return 0;
      }

      const { data, error } = await supabase.rpc('get_nearby_users', {
        p_latitude: currentUserProfile.latitude,
        p_longitude: currentUserProfile.longitude,
        p_radius_km: 20
      });

      if (error) return 0;
      
      const sharedInterestUsers = data?.filter(user => 
        user.interests?.some(interest => 
          currentUserProfile.interests?.includes(interest)
        )
      ) || [];

      return sharedInterestUsers.length;
    },
    enabled: hasLocation && !!currentUserProfile.interests?.length
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    }
    if (hour < 18) {
      return "Good afternoon";
    }
    return "Good evening";
  };

  const getTopInterest = () => {
    return currentUserProfile.interests?.[0] || 'adventure';
  };

  const getBackgroundVideo = () => {
    const interest = getTopInterest().toLowerCase();
    // These would be actual video URLs in a real implementation
    const videoMap: Record<string, string> = {
      'tech': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=2000&auto=format&fit=crop',
      'fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000&auto=format&fit=crop',
      'art': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=2000&auto=format&fit=crop',
      'music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2000&auto=format&fit=crop',
      'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop',
      'default': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop'
    };
    return videoMap[interest] || videoMap.default;
  };

  return (
    <Card className="relative overflow-hidden border-none text-primary-foreground bg-cover bg-center group">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105"
        style={{ 
          backgroundImage: `url('${getBackgroundVideo()}')`,
          filter: 'blur(1px) brightness(0.7)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <CardContent className="relative z-10 p-6">
        <div className="flex items-center gap-4">
          <Link to={`/profile/${currentUserProfile.id}`}>
            <Avatar className="h-16 w-16 border-4 border-white/50 hover:border-white/80 transition-all duration-300 hover:scale-105">
              <AvatarImage src={currentUserProfile.avatar_url ?? ""} />
              <AvatarFallback className="bg-primary/50 text-2xl">{currentUserProfile.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <h1 className="text-2xl font-bold drop-shadow-md mb-1">
              {getGreeting()}, {currentUserProfile.full_name || currentUserProfile.username}!
            </h1>
            <p className="opacity-80 drop-shadow text-sm">
              {hasLocation
                ? "Ready to meet, create, and connect?"
                : "Enable location to see who's around you."}
            </p>
            {nearbyCount && nearbyCount > 0 && (
              <p className="opacity-90 text-sm mt-1 drop-shadow">
                <Link 
                  to="/search" 
                  className="text-accent-foreground hover:text-white transition-colors duration-200 underline underline-offset-2"
                >
                  {nearbyCount} people nearby share your interest in {getTopInterest()}
                </Link>
              </p>
            )}
            {!hasLocation && (
              <Button 
                onClick={getLocation} 
                disabled={loading} 
                size="sm" 
                variant="outline"
                className="mt-2 border-white/50 bg-transparent hover:bg-white/10 transition-all duration-300"
              >
                {loading ? 'Getting location...' : 'Enable Location'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeBanner;
