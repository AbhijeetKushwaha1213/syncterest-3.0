
import { Database } from "@/integrations/supabase/types";
type Tables = Database['public']['Tables'];

export type Profile = Tables['profiles']['Row'];
export type Post = Tables['posts']['Row'];
export type Event = Tables['events']['Row'];

export type PostWithProfile = Post & { profiles: Profile | null };
export type EventWithProfile = Event & { profiles: Profile | null };

export type FeedItem =
  | (PostWithProfile & { item_type: 'post' })
  | (EventWithProfile & { item_type: 'event' });
