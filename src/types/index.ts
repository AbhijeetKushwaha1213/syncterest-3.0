
import { Database } from "@/integrations/supabase/types";

export type Channel = Database['public']['Tables']['channels']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ChannelMember = Database['public']['Tables']['channel_members']['Row'];
export type ChannelMessage = Database['public']['Tables']['channel_messages']['Row'];
