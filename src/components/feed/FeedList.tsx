
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { FeedItem } from "./types";

const FeedList = ({ selectedInterest }: { selectedInterest: string | null }) => {
  const { profile: currentUserProfile } = useAuth();

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

  const { data: feedItems, isLoading } = useQuery<FeedItem[]>({
    queryKey: ['feed', selectedInterest],
    queryFn: fetchFeed,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
      </div>
    );
  }

  if (!feedItems || feedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4 text-center p-4">
        <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold">Nothing to see here... yet!</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {selectedInterest
            ? `No posts or events found for the "${selectedInterest}" interest. Try a different one!`
            : "No posts or events to show right now. Why not explore other sections?"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
      {feedItems.map((item) => (
        <ContentCard key={`${item.item_type}-${item.id}`} item={item} currentUserProfile={currentUserProfile} />
      ))}
    </div>
  );
};

export default FeedList;
