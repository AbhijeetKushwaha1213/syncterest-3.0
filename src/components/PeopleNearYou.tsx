
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import type { Database } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { differenceInMinutes } from "date-fns";
import { useState } from "react";

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserStatus = 'online' | 'recent' | 'offline';

const getUserStatus = (lastActiveAt: string | null): UserStatus => {
  if (!lastActiveAt) return 'offline';
  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffInMinutes = differenceInMinutes(now, lastActive);

  if (diffInMinutes < 5) return 'online';
  if (diffInMinutes < 60) return 'recent';
  return 'offline';
};

const PeopleNearYou = () => {
  const { profile } = useAuth();
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);
  const { followMutation } = useFollow();

  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ["profiles_nearby_sidebar", profile?.id, profile?.latitude, profile?.longitude],
    queryFn: async () => {
      let queryProfiles: Profile[] = [];
      if (profile && profile.latitude && profile.longitude) {
        const { data, error } = await supabase.rpc('get_nearby_users', {
          p_latitude: profile.latitude,
          p_longitude: profile.longitude,
          p_radius_km: 20
        });

        if (error) {
          console.error("Error fetching nearby users:", error);
        } else if (data) {
          queryProfiles = data.filter(p => p.id !== profile.id);
        }
      }

      if (queryProfiles.length < 5) {
        const limit = 5 - queryProfiles.length;
        const existingIds = queryProfiles.map(p => p.id);
        if(profile) existingIds.push(profile.id);

        const { data: randomData, error: randomError } = await supabase
          .from("profiles")
          .select(`*`)
          .not("username", "is", null)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .limit(limit);

        if (randomError) throw new Error(randomError.message);
        if(randomData) queryProfiles.push(...randomData);
      }
      
      return queryProfiles;
    },
    enabled: !!profile,
  });
  
  const getSubtext = (p: Profile) => {
    if (p.latitude && p.longitude && profile?.latitude && profile?.longitude) {
        return "Nearby";
    }
    return "From the community";
  }

  const handleConnect = (profileId: string) => {
    followMutation.mutate(profileId);
  };

  const getInterestTooltip = (interests: string[] | null) => {
    if (!interests || interests.length === 0) return "No interests listed";
    return interests.join(", ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>People You May Like</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {isLoading && (
          <div className="flex space-x-2 -ml-1">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="basis-1/2 p-1">
                    <Card className="text-center">
                        <CardContent className="p-4 flex flex-col items-center gap-2">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <Skeleton className="h-4 w-20 mt-2" />
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-9 w-full mt-2" />
                        </CardContent>
                    </Card>
                </div>
            ))}
          </div>
        )}
        {!isLoading && profiles && profiles.length > 0 && (
          <Carousel opts={{ align: "start", loop: profiles.length > 2 }} className="w-full">
            <CarouselContent className="-ml-2" style={{ overflow: 'visible' }}>
              {profiles.map((p, index) => {
                const status = getUserStatus(p.last_active_at);
                const isHovered = hoveredProfile === p.id;
                const isAdjacent = hoveredProfile && Math.abs(profiles.findIndex(prof => prof.id === hoveredProfile) - index) === 1;
                const displayedInterests = p.interests?.slice(0, 2) || [];
                const remainingCount = (p.interests?.length || 0) - 2;
                
                return (
                  <CarouselItem 
                    key={p.id} 
                    className="pl-2 basis-[55%] sm:basis-1/2 transition-all duration-300"
                    style={{
                      transform: isAdjacent ? 'scale(0.95)' : 'scale(1)',
                      filter: isAdjacent ? 'blur(1px)' : 'none',
                      opacity: isAdjacent ? 0.7 : 1
                    }}
                  >
                    <div className="p-1 h-full">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card 
                              className="text-center h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                              onMouseEnter={() => setHoveredProfile(p.id)}
                              onMouseLeave={() => setHoveredProfile(null)}
                              style={{
                                transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                              }}
                            >
                              <CardContent className="p-4 flex flex-col items-center gap-2 flex-1 justify-between">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="relative">
                                    <Link to={`/profile/${p.id}`}>
                                      <Avatar className="h-16 w-16 border-2 border-primary/50 transition-all duration-300 hover:border-primary hover:scale-110">
                                        <AvatarImage src={p.avatar_url ?? ""} alt={p.username ?? "avatar"} />
                                        <AvatarFallback>{p.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                      </Avatar>
                                    </Link>
                                    {status !== 'offline' && (
                                      <span
                                        className={`absolute bottom-1 right-1 block h-4 w-4 rounded-full ${
                                          status === 'online' ? 'bg-green-500' : 'bg-amber-400'
                                        } border-2 border-background transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}
                                        title={status === 'online' ? 'Online' : 'Recently Active'}
                                      />
                                    )}
                                  </div>
                                  <Link 
                                    to={`/profile/${p.id}`} 
                                    className="font-semibold text-sm hover:underline truncate w-full transition-colors duration-200 hover:text-primary" 
                                    title={p.full_name || p.username || ''}
                                  >
                                    {p.full_name || p.username}
                                  </Link>
                                  <p className="text-xs text-muted-foreground">{getSubtext(p)}</p>
                                  <div className="flex flex-wrap gap-1 justify-center w-full min-h-[22px] items-center">
                                    {displayedInterests.map((interest) => (
                                      <span 
                                        key={interest} 
                                        className="text-[10px] bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full truncate transition-all duration-200 hover:bg-primary/20"
                                      >
                                        {interest}
                                      </span>
                                    ))}
                                    {remainingCount > 0 && (
                                      <span className="text-[10px] bg-muted text-muted-foreground font-medium px-1.5 py-0.5 rounded-full">
                                        +{remainingCount} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConnect(p.id);
                                  }}
                                  variant="secondary" 
                                  size="sm" 
                                  className="w-full mt-2 whitespace-nowrap transition-all duration-300 hover:scale-105 hover:shadow-md"
                                  disabled={followMutation.isPending}
                                >
                                  {followMutation.isPending ? "Connecting..." : "Connect"}
                                </Button>
                              </CardContent>
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-xs">
                              <p className="font-semibold">{p.full_name || p.username}</p>
                              <p className="text-sm text-muted-foreground">
                                Interests: {getInterestTooltip(p.interests)}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-8 transition-all duration-200 hover:scale-110" />
            <CarouselNext className="absolute -right-3 top-1/2 -translate-y-1/2 h-8 w-8 transition-all duration-200 hover:scale-110" />
          </Carousel>
        )}
        {!isLoading && (!profiles || profiles.length === 0) && (
             <p className="text-sm text-muted-foreground text-center py-4">Can't find anyone right now.</p>
         )}
      </CardContent>
    </Card>
  )
}

export default PeopleNearYou;
