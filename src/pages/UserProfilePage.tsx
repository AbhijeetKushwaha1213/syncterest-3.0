
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const fetchProfileById = async (id: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`*`)
    .eq("id", id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  return data;
};

const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchProfileById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <Skeleton className="h-8 w-24 mb-4" />
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-10 w-32 mt-2" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Skeleton className="h-5 w-12 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <div className="flex flex-wrap gap-2 mt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <p className="p-4 text-destructive">Error loading profile: {error.message}</p>;
  }

  if (!profile) {
    return (
       <div className="p-4 md:p-6 text-center">
         <p>Profile not found.</p>
         <Button asChild variant="link" className="mt-4">
           <Link to="/home"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
         </Button>
       </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
       <Button asChild variant="ghost" className="mb-4">
          <Link to="/home"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
       </Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username ?? "avatar"} />
              <AvatarFallback className="text-3xl">{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <CardTitle className="text-3xl">{profile.username}</CardTitle>
              {profile.full_name && <CardDescription className="text-lg">{profile.full_name}</CardDescription>}
              <Button className="mt-4">Send Message</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg">Bio</h3>
            <p className="text-muted-foreground mt-1">{profile.bio || "No bio provided."}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Interests</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.interests?.length > 0 ? profile.interests.map((interest) => (
                <div key={interest} className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full">{interest}</div>
              )) : <p className="text-muted-foreground text-sm">No interests listed.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
