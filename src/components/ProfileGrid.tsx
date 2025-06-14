
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const fetchProfiles = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`*`)
    .not("username", "is", null);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const ProfileGrid = () => {
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: fetchProfiles
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="text-center">
            <CardHeader className="items-center">
               <Skeleton className="h-24 w-24 rounded-full" />
               <Skeleton className="h-6 w-32 mt-4" />
               <Skeleton className="h-4 w-24 mt-2" />
            </CardHeader>
            <CardContent>
               <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) return <p className="text-destructive">Error: {error.message}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {profiles?.map((profile) => (
        <Link to={`/profile/${profile.id}`} key={profile.id} className="block">
          <Card className="hover:shadow-lg transition-shadow h-full text-center">
            <CardHeader className="items-center">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username ?? "avatar"} />
                <AvatarFallback className="text-3xl">{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="mt-4">
                <CardTitle className="text-xl">{profile.username}</CardTitle>
                {profile.full_name && <p className="text-sm text-muted-foreground">{profile.full_name}</p>}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 h-10">{profile.bio}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default ProfileGrid;
