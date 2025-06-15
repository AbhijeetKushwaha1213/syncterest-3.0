import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileWithDetails } from "@/api/profiles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  profile: ProfileWithDetails;
  isOwnProfile: boolean;
}

export const ProfileHeader = ({ profile, isOwnProfile }: ProfileHeaderProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const followMutation = useMutation({
    mutationFn: async () => {
        if (!user || !profile.id) throw new Error("User or profile ID is missing");
        if (user.id === profile.id) throw new Error("You cannot follow yourself");
        const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: profile.id });
        if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
    }
  });

  const unfollowMutation = useMutation({
      mutationFn: async () => {
          if (!user || !profile.id) throw new Error("User or profile ID is missing");
          const { error } = await supabase.from('followers').delete().match({ follower_id: user.id, following_id: profile.id });
          if (error) throw error;
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
      }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
        if (!user || !profile.id) throw new Error("User or profile ID is missing");
        if (user.id === profile.id) throw new Error("You cannot message yourself");

        const { data, error } = await supabase.rpc('find_or_create_conversation', { p_other_user_id: profile.id });

        if (error) throw error;
        return data as string;
    },
    onSuccess: (conversationId) => {
        navigate(`/chat/${conversationId}`);
    },
    onError: (error) => {
        console.error("Error sending message:", error);
    }
  });

  const Stats = () => (
    <>
      <div className="text-center">
        <p className="font-bold text-lg">{profile.posts_count}</p>
        <p className="text-sm text-muted-foreground">posts</p>
      </div>
      <div className="text-center">
        <p className="font-bold text-lg">{profile.followers_count}</p>
        <p className="text-sm text-muted-foreground">followers</p>
      </div>
      <div className="text-center">
        <p className="font-bold text-lg">{profile.following_count}</p>
        <p className="text-sm text-muted-foreground">following</p>
      </div>
    </>
  );

  const Bio = () => (
    <div>
      {profile.full_name && <h2 className="font-semibold text-lg md:text-base">{profile.full_name}</h2>}
      <p className="text-muted-foreground mt-1 whitespace-pre-wrap text-sm">{profile.bio || "No bio provided."}</p>
    </div>
  );

  return (
    <header className="mb-8">
      {/* Desktop layout */}
      <div className="hidden md:flex flex-row items-center gap-16">
        <div className="shrink-0">
          <Avatar className="w-40 h-40">
            <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username ?? "avatar"} />
            <AvatarFallback className="text-5xl">{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col gap-4 flex-grow">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-light">{profile.username}</h1>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button asChild variant="outline">
                  <Link to="/settings/account">Edit Profile</Link>
                </Button>
              ) : (
                <>
                  <Button onClick={() => sendMessageMutation.mutate()} disabled={sendMessageMutation.isPending}>
                    {sendMessageMutation.isPending ? 'Starting...' : 'Message'}
                  </Button>
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
          </div>
          <div className="flex gap-8">
            <Stats />
          </div>
          <Bio />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username ?? "avatar"} />
              <AvatarFallback className="text-3xl">{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-grow flex justify-around">
            <Stats />
          </div>
        </div>
        <div className="mt-4">
          <Bio />
        </div>
        <div className="flex gap-2 mt-4 w-full">
          {isOwnProfile ? (
            <Button asChild variant="outline" className="flex-1">
              <Link to="/settings/account">Edit Profile</Link>
            </Button>
          ) : (
            <>
              <Button onClick={() => sendMessageMutation.mutate()} disabled={sendMessageMutation.isPending} className="flex-1">
                {sendMessageMutation.isPending ? 'Starting...' : 'Message'}
              </Button>
              {profile.is_following ? (
                <Button variant="outline" onClick={() => unfollowMutation.mutate()} disabled={unfollowMutation.isPending} className="flex-1">
                  {unfollowMutation.isPending ? 'Unfollowing...' : 'Unfollow'}
                </Button>
              ) : (
                <Button onClick={() => followMutation.mutate()} disabled={followMutation.isPending} className="flex-1">
                  {followMutation.isPending ? 'Following...' : 'Follow'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
