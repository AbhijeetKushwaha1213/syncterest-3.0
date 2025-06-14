import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Grid3x3, Clapperboard, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

const fetchProfileData = async (profileId: string, currentUserId?: string) => {
  if (!profileId) throw new Error("Profile ID is required");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`*`)
    .eq("id", profileId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    throw profileError;
  }
  
  if (!profile) return null;

  // DUMMY posts count for now. Will be implemented next.
  const postsCount = 123;

  const { count: followersCount, error: followersError } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profileId);
  
  if (followersError) throw followersError;
  
  const { count: followingCount, error: followingError } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profileId);

  if (followingError) throw followingError;

  let isFollowing = false;
  if (currentUserId && currentUserId !== profileId) {
      const { data: followship, error: isFollowingError } = await supabase
          .from('followers')
          .select('follower_id')
          .eq('follower_id', currentUserId)
          .eq('following_id', profileId)
          .maybeSingle();
      if(isFollowingError) throw isFollowingError;
      isFollowing = !!followship;
  }

  return {
    ...profile,
    posts_count: postsCount,
    followers_count: followersCount ?? 0,
    following_count: followingCount ?? 0,
    is_following: isFollowing,
  };
};

const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", id, user?.id],
    queryFn: () => fetchProfileData(id!, user?.id),
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
        if (!user || !id) throw new Error("User or profile ID is missing");
        if (user.id === id) throw new Error("You cannot follow yourself");
        const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: id });
        if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', id] });
    }
  });

  const unfollowMutation = useMutation({
      mutationFn: async () => {
          if (!user || !id) throw new Error("User or profile ID is missing");
          const { error } = await supabase.from('followers').delete().match({ follower_id: user.id, following_id: id });
          if (error) throw error;
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['profile', id] });
      }
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
  
  const isOwnProfile = user?.id === profile.id;

  // Dummy data for highlights and posts.
  const highlights = [
    { id: 1, label: 'Travel', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200&h=200&fit=crop' },
    { id: 2, label: 'Food', image: 'https://images.unsplash.com/photo-1484723050470-264b152abde7?w=200&h=200&fit=crop' },
    { id: 3, label: 'Projects', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200&h=200&fit=crop' },
    { id: 4, label: 'Friends', image: 'https://images.unsplash.com/photo-1530541930197-58944de4b33d?w=200&h=200&fit=crop' },
    { id: 5, label: 'Fitness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
    { id: 6, label: 'Hobbies', image: 'https://images.unsplash.com/photo-1534447677768-64483a0f72d1?w=200&h=200&fit=crop' },
  ];

  const posts = [
    { id: 1, imageUrl: `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop` },
    { id: 2, imageUrl: `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&fit=crop` },
    { id: 3, imageUrl: `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop` },
    { id: 4, imageUrl: `https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop` },
    { id: 5, imageUrl: `https://images.unsplash.com/photo-1517694712202-1428bc3835b9?w=400&h=400&fit=crop` },
    { id: 6, imageUrl: `https://images.unsplash.com/photo-1542744095-291d1f69b253?w=400&h=400&fit=crop` },
    { id: 7, imageUrl: `https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop` },
    { id: 8, imageUrl: `https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=400&fit=crop` },
    { id: 9, imageUrl: `https://images.unsplash.com/photo-1522252234503-e356532cafd5?w=400&h=400&fit=crop` },
  ];

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
                {isOwnProfile ? (
                  <Button asChild variant="outline">
                    <Link to="/account">Edit Profile</Link>
                  </Button>
                ) : (
                  <>
                    <Button>Send Message</Button>
                    {profile.is_following ? (
                      <Button variant="outline" onClick={() => unfollowMutation.mutate()} disabled={unfollowMutation.isPending}>
                        {unfollowMutation.isPending ? 'Unfollowing...' : 'Unfollow'}
                      </Button>
                    ) : (
                      <Button onClick={() => followMutation.mutate()} disabled={followMutation.isPending}>
                        {followMutation.isPending ? 'Following...' : 'Follow'}
                      </Button>
                    )}
                  </>
                )}
            </div>
            <div className="flex gap-8 mt-4">
                <div className="text-center">
                  <p className="font-semibold text-lg">{profile.posts_count}</p>
                  <p className="text-sm text-muted-foreground">posts</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">{profile.followers_count}</p>
                  <p className="text-sm text-muted-foreground">followers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">{profile.following_count}</p>
                  <p className="text-sm text-muted-foreground">following</p>
                </div>
            </div>
        </div>
      </header>

      <div className="mb-8 text-center md:text-left">
        {profile.full_name && <h2 className="font-semibold text-lg">{profile.full_name}</h2>}
        <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{profile.bio || "No bio provided."}</p>
      </div>

      <div className="mb-10">
          <div className="flex space-x-6 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
              {highlights.map(highlight => (
                  <div key={highlight.id} className="text-center shrink-0 w-20">
                      <button className="w-16 h-16 rounded-full bg-muted flex items-center justify-center ring-2 ring-offset-2 ring-offset-background ring-gray-300 dark:ring-gray-700 cursor-pointer focus:outline-none focus:ring-primary">
                          <Avatar className="w-[58px] h-[58px]">
                              <AvatarImage src={highlight.image} alt={highlight.label} />
                              <AvatarFallback>{highlight.label.charAt(0)}</AvatarFallback>
                          </Avatar>
                      </button>
                      <p className="text-xs mt-2 font-medium truncate">{highlight.label}</p>
                  </div>
              ))}
          </div>
      </div>
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 border-b rounded-none">
            <TabsTrigger value="posts" className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-2 border-b-2 border-transparent text-muted-foreground gap-2">
                <Grid3x3 className="h-5 w-5"/> Posts
            </TabsTrigger>
            <TabsTrigger value="reels" className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-2 border-b-2 border-transparent text-muted-foreground gap-2">
                <Clapperboard className="h-5 w-5"/> Reels
            </TabsTrigger>
            <TabsTrigger value="tagged" className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-2 border-b-2 border-transparent text-muted-foreground gap-2">
                <Tag className="h-5 w-5"/> Tagged
            </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-4">
            <div className="grid grid-cols-3 gap-1 md:gap-2">
                {posts.map(post => (
                    <div key={post.id} className="aspect-square bg-muted overflow-hidden rounded-md">
                        <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"/>
                    </div>
                ))}
            </div>
             {posts.length === 0 && <p className="text-muted-foreground text-center mt-8 text-sm">No posts yet.</p>}
        </TabsContent>
        <TabsContent value="reels">
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Clapperboard className="w-12 h-12 mb-4"/>
                <h3 className="text-lg font-semibold">No Reels Yet</h3>
            </div>
        </TabsContent>
        <TabsContent value="tagged">
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Tag className="w-12 h-12 mb-4"/>
                <h3 className="text-lg font-semibold">No Tagged Photos Yet</h3>
            </div>
        </TabsContent>
    </Tabs>

      <hr className="my-12" />
      
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
