
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

  return (
    <header className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-8">
      <div className="p-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 shrink-0">
        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background">
          <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username ?? "avatar"} />
          <AvatarFallback className="text-5xl">{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col gap-4 items-center md:items-start">
        <h1 className="text-2xl md:text-3xl font-light">{profile.username}</h1>
        <div className="flex gap-4">
          {isOwnProfile ? (
            <Button asChild variant="outline">
              <Link to="/account">Edit Profile</Link>
            </Button>
          ) : (
            <>
              <Button onClick={() => sendMessageMutation.mutate()} disabled={sendMessageMutation.isPending}>
                {sendMessageMutation.isPending ? 'Starting chat...' : 'Send Message'}
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
        <div className="flex gap-8 mt-4">
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
        </div>
      </div>
    </header>
  );
};
