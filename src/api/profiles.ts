
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type ProfileWithDetails = Tables<'profiles'> & {
  posts: Tables<'posts'>[];
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
};

export const fetchProfileData = async (profileId: string, currentUserId?: string): Promise<ProfileWithDetails | null> => {
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

  const { data: posts, count: postsCount, error: postsError } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error("Error fetching posts:", postsError);
    throw postsError;
  }

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
    posts: posts ?? [],
    posts_count: postsCount ?? 0,
    followers_count: followersCount ?? 0,
    following_count: followingCount ?? 0,
    is_following: isFollowing,
  };
};
