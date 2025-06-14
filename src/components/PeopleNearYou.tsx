
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { UserPlus } from "lucide-react";

const fetchProfiles = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`*`)
    .not("username", "is", null)
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const PeopleNearYou = () => {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles_nearby"],
    queryFn: fetchProfiles
  });

  return (
    <Card className="hidden lg:block">
      <CardHeader>
        <CardTitle>People Near You</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && [...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
        {profiles?.map(profile => (
          <div key={profile.id} className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username ?? "avatar"} />
              <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{profile.username}</p>
              <p className="text-xs text-muted-foreground">3 km away</p>
            </div>
            <Badge variant="outline" className="border-orange-400 text-orange-400">Active</Badge>
            <Button variant="ghost" size="icon">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default PeopleNearYou;
