
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FeedItem } from "@/components/feed/types";
import { useAuth } from "./useAuth";

export const useFeed = (selectedInterest: string | null) => {
  const { user } = useAuth();

  const fetchFeed = async () => {
    if (!user) return [];

    // 1. Get user's friends (matches) to apply friends_only privacy
    const { data: friendIdsData, error: friendsError } = await supabase.rpc('get_matches');
    
    if (friendsError) {
      console.error('Error fetching friends:', friendsError);
    }
    const friendIds = (friendIdsData?.map(match => match.profile_id)) || [];

    // 2. Build privacy filter
    // The feed should contain content from:
    // - The current user (their own posts/events)
    // - Profiles with 'public' visibility
    // - Profiles with 'friends_only' visibility, if they are a friend (match)
    const friendIdsString = friendIds.length > 0 ? friendIds.join(',') : '';
    
    const orFilterParts = [
      `id.eq.${user.id}`, // Their own profile's content
      'profile_visibility.eq.public' // Public profiles' content
    ];
    if (friendIdsString) {
      orFilterParts.push(`and(profile_visibility.eq.friends_only,id.in.(${friendIdsString}))`);
    }
    const privacyFilter = orFilterParts.join(',');

    let postsQuery = supabase
      .from('posts')
      .select('*, profiles!inner(*)')
      .or(privacyFilter, { foreignTable: 'profiles' });

    if (selectedInterest) {
      postsQuery = postsQuery.contains('profiles.interests', [selectedInterest]);
    }

    let eventsQuery = supabase
      .from('events')
      .select('*, profiles!inner(*)')
      .or(privacyFilter, { foreignTable: 'profiles' });

    if (selectedInterest) {
      eventsQuery = eventsQuery.contains('profiles.interests', [selectedInterest]);
    }

    const [{ data: posts, error: postsError }, { data: events, error: eventsError }] = await Promise.all([
      postsQuery.order('created_at', { ascending: false }).limit(20),
      eventsQuery.order('created_at', { ascending: false }).limit(20)
    ]);
    
    if (postsError) {
      console.error("Error fetching posts:", postsError);
      throw postsError;
    }
    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    const combined: FeedItem[] = [
      ...((posts as any[]) || []).map(p => ({ ...p, item_type: 'post' as const })),
      ...((events as any[]) || []).map(e => ({ ...e, item_type: 'event' as const }))
    ];

    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return combined;
  };

  return useQuery<FeedItem[]>({
    queryKey: ['feed', selectedInterest, user?.id],
    queryFn: fetchFeed,
    enabled: !!user,
  });
};
