
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-24 mb-6" />
        <header className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-8">
            <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0" />
            <div className="flex flex-col gap-4 w-full items-center md:items-start">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex gap-8 mt-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
        </header>
        <div className="mb-8 space-y-2 text-center md:text-left">
            <Skeleton className="h-6 w-32 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
        <hr className="my-8" />
        <div>
            <Skeleton className="h-6 w-24 mx-auto mb-4" />
            <div className="flex flex-wrap gap-2 justify-center">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
            </div>
        </div>
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

  // Dummy data for stats, as this is not in the database yet.
  const stats = {
    posts: Math.floor(Math.random() * 200),
    followers: Math.floor(Math.random() * 5000),
    following: Math.floor(Math.random() * 500),
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
       <Button asChild variant="ghost" className="mb-6 -ml-4">
          <Link to="/home"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
       </Button>
       
       <header className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-8">
        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background ring-2 ring-primary shrink-0">
            <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username ?? "avatar"} />
            <AvatarFallback className="text-5xl">{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-4 items-center md:items-start">
            <h1 className="text-2xl md:text-3xl font-light">{profile.username}</h1>
            <div className="flex gap-4">
                <Button>Send Message</Button>
                <Button variant="outline">Follow</Button>
            </div>
            <div className="flex gap-8 mt-4 text-center md:text-left text-sm md:text-base">
                <div><span className="font-semibold">{stats.posts}</span> posts</div>
                <div><span className="font-semibold">{stats.followers}</span> followers</div>
                <div><span className="font-semibold">{stats.following}</span> following</div>
            </div>
        </div>
      </header>

      <div className="mb-8 text-center md:text-left">
        {profile.full_name && <h2 className="font-semibold text-lg">{profile.full_name}</h2>}
        <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{profile.bio || "No bio provided."}</p>
      </div>

      <hr className="my-8" />
      
      <div>
        <h3 className="font-semibold text-lg text-center mb-4 uppercase text-muted-foreground tracking-wider">Interests</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {profile.interests?.length > 0 ? profile.interests.map((interest) => (
            <div key={interest} className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">{interest}</div>
          )) : <p className="text-muted-foreground text-sm">No interests listed.</p>}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
