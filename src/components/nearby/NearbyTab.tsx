
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Compass } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
import { useLocation } from "@/hooks/useLocation";
import UserStatusCard from "../UserStatusCard";
import { Link } from "react-router-dom";

type Profile = Database['public']['Tables']['profiles']['Row'];

const NearbyTab = () => {
  const { profile } = useAuth();
  const { getLocation, loading: locationLoading, error: locationError, hasLocation, profileLocation } = useLocation();

  const { data: nearbyProfiles, isLoading, error } = useQuery<Profile[]>({
    queryKey: ['nearby_profiles', profile?.id, profileLocation.latitude, profileLocation.longitude],
    queryFn: async () => {
        if (!hasLocation || !profileLocation.latitude || !profileLocation.longitude) return [];
        
        const { data, error: rpcError } = await supabase.rpc('get_nearby_users', {
            p_latitude: profileLocation.latitude,
            p_longitude: profileLocation.longitude,
            p_radius_km: 50 // search within 50km radius
        });

        if (rpcError) throw rpcError;
        return data || [];
    },
    enabled: hasLocation,
  });

  if (!hasLocation) {
    return (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4 text-center p-4">
            <Compass className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Find people near you</h3>
            <p className="text-muted-foreground mb-4">Share your location to see who's around.</p>
            <Button onClick={getLocation} disabled={locationLoading}>
                {locationLoading ? 'Getting Location...' : 'Share My Location'}
            </Button>
            {locationError && <p className="text-sm text-red-500 mt-2">{locationError}</p>}
        </div>
    )
  }

  return (
    <div className="space-y-6">
        <UserStatusCard />
        
        <h3 className="text-lg font-semibold">People Nearby</h3>
        
        {isLoading && (
            <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-9 w-9" />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500">Error: {error.message}</p>}

        {!isLoading && !error && (!nearbyProfiles || nearbyProfiles.length === 0) && (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No one found nearby. Try expanding your search radius!</p>
            </div>
        )}

        {!isLoading && !error && nearbyProfiles && nearbyProfiles.length > 0 && (
            <div className="space-y-4">
            {nearbyProfiles.map(p => (
                <Link to={`/profile/${p.id}`} key={p.id} className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg">
                  <Avatar className="h-12 w-12">
                      <AvatarImage src={p.avatar_url ?? ""} alt={p.username ?? "avatar"} />
                      <AvatarFallback>{p.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                      <p className="font-semibold">{p.full_name || p.username}</p>
                      <p className="text-sm text-muted-foreground">{p.bio?.substring(0, 40) || 'No bio'}{p.bio && p.bio.length > 40 ? '...' : ''}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                      <UserPlus className="h-5 w-5" />
                  </Button>
                </Link>
            ))}
            </div>
        )}
    </div>
  );
};

export default NearbyTab;
