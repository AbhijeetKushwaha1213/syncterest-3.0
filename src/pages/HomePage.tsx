
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
    .not("username", "is", null); // Only show profiles that are set up

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const HomePage = () => {
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: fetchProfiles
  });

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Find People</h1>
        <p className="text-muted-foreground">Browse profiles and connect with others.</p>
      </header>
      
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <div className="flex flex-wrap gap-2 mt-4">
                   <Skeleton className="h-6 w-20" />
                   <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && <p className="text-destructive">Error fetching profiles: {error.message}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles?.map((profile) => (
          <Link to={`/profile/${profile.id}`} key={profile.id} className="block">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username ?? "avatar"} />
                    <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{profile.username}</CardTitle>
                    {profile.full_name && <p className="text-sm text-muted-foreground">{profile.full_name}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">{profile.bio}</p>
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.interests?.slice(0, 3).map((interest) => (
                      <div key={interest} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{interest}</div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
