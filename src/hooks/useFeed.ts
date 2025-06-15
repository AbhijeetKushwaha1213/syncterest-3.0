
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FeedItem } from "@/components/feed/types";

export const useFeed = (selectedInterest: string | null) => {
  const fetchFeed = async () => {
    let postsQuery = selectedInterest
      ? supabase.from('posts').select('*, profiles!inner(*)').contains('profiles.interests', [selectedInterest])
      : supabase.from('posts').select('*, profiles(*)');

    const { data: posts, error: postsError } = await postsQuery.order('created_at', { ascending: false }).limit(20);
    if(postsError) {
      console.error("Error fetching posts:", postsError);
      throw postsError;
    }

    let eventsQuery = selectedInterest
      ? supabase.from('events').select('*, profiles!inner(*)').contains('profiles.interests', [selectedInterest])
      : supabase.from('events').select('*, profiles(*)');

    const { data: events, error: eventsError } = await eventsQuery.order('created_at', { ascending: false }).limit(20);
    if(eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    const combined: FeedItem[] = [
      ...(posts || []).map(p => ({ ...p, item_type: 'post' as const })),
      ...(events || []).map(e => ({ ...e, item_type: 'event' as const }))
    ];

    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return combined;
  };

  return useQuery<FeedItem[]>({
    queryKey: ['feed', selectedInterest],
    queryFn: fetchFeed,
  });
};
