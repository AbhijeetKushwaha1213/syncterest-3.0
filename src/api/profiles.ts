
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Profile } from "@/components/feed/types";

export type ProfileWithDetails = Profile & {
  posts: Tables<'posts'>[];
  stories: Tables<'stories'>[];
  events: Tables<'events'>[];
  reels: Tables<'reels'>[];
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
};

export const fetchProfileData = async (profileId: string, currentUserId?: string): Promise<ProfileWithDetails | null> => {
  if (!profileId) throw new Error("Profile ID is required");

  // 1. Check for blocks
  if (currentUserId && profileId !== currentUserId) {
    const { data: block, error: blockError } = await supabase
      .from('blocked_users')
      .select('id')
      .or(`and(user_id.eq.${profileId},blocked_user_id.eq.${currentUserId}),and(user_id.eq.${currentUserId},blocked_user_id.eq.${profileId})`)
      .maybeSingle();

    if (blockError) {
      console.error('Error checking block status:', blockError);
      throw blockError;
    }

    if (block) {
      return null; // A block exists, so we treat the profile as not found for privacy.
    }
  }

  // 2. Fetch basic profile data to check privacy settings
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select(`*`)
    .eq("id", profileId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    throw profileError;
  }
  
  const profile = profileData as Profile | null;
  
  if (!profile) return null;

  // 3. Perform privacy checks before fetching detailed data
  let isFollowing = false;
  if (currentUserId && currentUserId !== profileId) {
      // Check for mutual follow (friendship) to decide on visibility
      const { data: followship, error: isFollowingError } = await supabase
          .from('followers')
          .select('follower_id')
          .eq('follower_id', currentUserId)
          .eq('following_id', profileId)
          .maybeSingle();
      if(isFollowingError) throw isFollowingError;
      isFollowing = !!followship;

      const { data: followedByShip, error: isFollowedByError } = await supabase
          .from('followers')
          .select('follower_id')
          .eq('follower_id', profileId)
          .eq('following_id', currentUserId)
          .maybeSingle();
      if(isFollowedByError) throw isFollowedByError;
      const isFriend = isFollowing && !!followedByShip;

      // Apply privacy rules
      if (profile.profile_visibility === 'private') {
          return null; // Don't show private profiles to others
      }
      if (profile.profile_visibility === 'friends_only' && !isFriend) {
          return null; // Don't show friends_only profiles to non-friends
      }
  }

  // 4. If privacy checks pass, fetch all remaining details
  const { data: posts, count: postsCount, error: postsError } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error("Error fetching posts:", postsError);
    throw postsError;
  }

  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', profileId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (storiesError) {
    console.error("Error fetching stories:", storiesError);
    throw storiesError;
  }

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', profileId)
    .order('event_time', { ascending: false });
  
  if (eventsError) {
    console.error("Error fetching events:", eventsError);
    throw eventsError;
  }

  const { data: reels, error: reelsError } = await supabase
    .from('reels')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });
  
  if (reelsError) {
    console.error("Error fetching reels:", reelsError);
    throw reelsError;
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

  return {
    ...profile,
    posts: posts ?? [],
    stories: stories ?? [],
    events: events ?? [],
    reels: reels ?? [],
    posts_count: postsCount ?? 0,
    followers_count: followersCount ?? 0,
    following_count: followingCount ?? 0,
    is_following: isFollowing,
  };
};
