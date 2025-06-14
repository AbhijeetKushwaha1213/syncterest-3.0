
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from 'date-fns';
import type { Database } from "@/integrations/supabase/types";

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface ProfileWithStyle extends ProfileRow {
  status_color: string;
  badge_classes: string;
}

const statusStyles: { [key: string]: { status_color: string; badge_classes: string } } = {
  "Looking to chat": {
    status_color: "bg-green-500",
    badge_classes: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  },
  "Open to meetup": {
    status_color: "bg-blue-500",
    badge_classes: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  },
  "Studying": {
    status_color: "bg-yellow-500",
    badge_classes: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  },
  "Exploring": {
    status_color: "bg-purple-500",
    badge_classes: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
  },
  "default": {
    status_color: "bg-gray-400",
    badge_classes: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
  }
};

const fetchProfiles = async (currentUserId?: string): Promise<ProfileWithStyle[]> => {
  if (!currentUserId) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select(`*`)
    .not("username", "is", null)
    .neq('id', currentUserId)
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return [];

  return data.map((profile) => {
    const styles = statusStyles[profile.status || ''] || statusStyles.default;
    return {
      ...profile,
      ...styles,
    };
  });
};

const NearbyPeopleList = () => {
  const { user } = useAuth();
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles_nearby_list", user?.id],
    queryFn: () => fetchProfiles(user?.id),
    enabled: !!user
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users className="h-6 w-6" /> 
        People Nearby ({isLoading || !profiles ? '...' : profiles.length})
      </h2>
      {isLoading && [...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 p-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      ))}
      {profiles?.map(profile => (
        <Card key={profile.id}>
            <CardContent className="flex items-center gap-4 p-4">
                <div className="relative">
                    <Avatar className="h-16 w-16 border-2">
                        <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username ?? "avatar"} />
                        <AvatarFallback className="text-2xl">{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className={cn("absolute bottom-1 right-1 block h-4 w-4 rounded-full border-2 border-background", profile.status_color)}></span>
                </div>
                <div className="flex-1 space-y-1">
                    <p className="font-semibold">{profile.username}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {profile.last_active_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> 
                            {formatDistanceToNow(new Date(profile.last_active_at), { addSuffix: true })}
                          </span>
                        )}
                    </div>
                    <div>
                        <Badge variant="outline" className={cn("rounded-md px-2 py-1 border-transparent", profile.badge_classes)}>
                            {profile.status || "Away"}
                        </Badge>
                    </div>
                </div>
                <Button>Connect</Button>
            </CardContent>
        </Card>
      ))}
      {!isLoading && profiles?.length === 0 && (
         <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No one else is nearby right now.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NearbyPeopleList;
