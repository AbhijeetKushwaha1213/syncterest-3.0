
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

type Profile = Database['public']['Tables']['profiles']['Row'];

const PeopleNearYou = () => {
  const { profile } = useAuth();

  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ["profiles_nearby_sidebar", profile?.id, profile?.latitude, profile?.longitude],
    queryFn: async () => {
      if (profile && profile.latitude && profile.longitude) {
        const { data, error } = await supabase.rpc('get_nearby_users', {
          p_latitude: profile.latitude,
          p_longitude: profile.longitude,
          p_radius_km: 20 // A smaller radius for the sidebar
        });

        if (error) {
          console.error("Error fetching nearby users:", error);
        } else if (data && data.length > 0) {
          return data;
        }
      }

      // Fallback to fetching random profiles
      const { data, error } = await supabase
        .from("profiles")
        .select(`*`)
        .not("username", "is", null)
        .not('id', 'eq', profile?.id || '')
        .limit(5);

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: !!profile,
  });
  
  const getSubtext = (p: Profile) => {
    if (p.latitude && p.longitude && profile?.latitude && profile?.longitude) {
        return "Nearby";
    }
    return "From the community";
  }

  return (
    <Card className="hidden lg:block">
      <CardHeader>
        <CardTitle>People You May Like</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && [...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
        {profiles?.map(p => (
          <div key={p.id} className="flex items-center gap-4">
             <Link to={`/profile/${p.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={p.avatar_url ?? ""} alt={p.username ?? "avatar"} />
                <AvatarFallback>{p.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <Link to={`/profile/${p.id}`} className="font-semibold text-sm hover:underline">{p.full_name || p.username}</Link>
              <p className="text-xs text-muted-foreground">{getSubtext(p)}</p>
            </div>
            <Button variant="secondary" size="sm" className="whitespace-nowrap">
              Connect
            </Button>
          </div>
        ))}
        {!isLoading && (!profiles || profiles.length === 0) && (
             <p className="text-sm text-muted-foreground text-center py-4">Can't find anyone right now.</p>
         )}
      </CardContent>
    </Card>
  )
}

export default PeopleNearYou;
