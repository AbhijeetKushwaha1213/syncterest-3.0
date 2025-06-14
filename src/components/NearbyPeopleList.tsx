
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const fetchProfiles = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`*`)
    .not("username", "is", null)
    .limit(3);

  if (error) {
    throw new Error(error.message);
  }
  
  const mockData = [
    {
      distance: "500m away",
      last_active: "2m ago",
      status: "Looking to chat",
      location: "at Central Park",
      status_color: "bg-green-500",
      badge_classes: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    },
    {
      distance: "1.2km away",
      last_active: "5m ago",
      status: "Studying",
      location: "at Coffee Bean Café",
      status_color: "bg-yellow-500",
      badge_classes: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    },
    {
      distance: "2.8km away",
      last_active: "10m ago",
      status: "Open to meetup",
      location: "at Library Downtown",
      status_color: "bg-blue-500",
      badge_classes: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    },
  ];

  if (!data) return [];

  const profilesWithMockData = data.map((profile, index) => {
    return {
      ...profile,
      ...(mockData[index] || mockData[0]),
    };
  });
  return profilesWithMockData;
};

const NearbyPeopleList = () => {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles_nearby_list"],
    queryFn: fetchProfiles
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users className="h-6 w-6" /> 
        People Nearby ({isLoading ? '...' : profiles?.length || 0})
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
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.distance}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {profile.last_active}</span>
                    </div>
                    <div>
                        <Badge variant="outline" className={cn("rounded-md px-2 py-1 border-transparent", profile.badge_classes)}>
                            {profile.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground ml-2">{profile.location}</span>
                    </div>
                </div>
                <Button>Connect</Button>
            </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NearbyPeopleList;
