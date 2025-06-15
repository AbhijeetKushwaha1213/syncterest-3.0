
import { Database } from "@/integrations/supabase/types";

export type Channel = Database['public']['Tables']['channels']['Row'] & { type: 'text' | 'voice' };
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ChannelMember = Database['public']['Tables']['channel_members']['Row'];
export type ChannelMessage = Database['public']['Tables']['channel_messages']['Row'] & {
    attachment_url?: string | null;
    attachment_type?: string | null;
};
export type ChannelMessageReaction = Database['public']['Tables']['channel_message_reactions']['Row'];

export type ChannelWithUnread = {
    id: string;
    created_at: string;
    name: string;
    description: string | null;
    genre: 'general' | 'music' | 'reading' | 'gaming' | 'tech';
    visibility: 'public' | 'private';
    creator_id: string | null;
    image_url: string | null;
    color: string | null;
    logo_letter: string | null;
    unread_count: number;
    type: 'text' | 'voice';
};
