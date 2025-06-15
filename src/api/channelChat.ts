
import { supabase } from "@/integrations/supabase/client";
import { ChannelMessage, Profile } from "@/types";

export type ChannelMessageWithSender = ChannelMessage & {
  sender: Pick<Profile, 'id' | 'username' | 'avatar_url'> | null;
};

export const getChannelMessages = async (channelId: string): Promise<ChannelMessageWithSender[]> => {
  if (!channelId) return [];

  const { data, error } = await supabase
    .from('channel_messages')
    .select(`
      *,
      sender:profiles (id, username, avatar_url)
    `)
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching channel messages:", error);
    throw new Error(error.message);
  }

  return data as unknown as ChannelMessageWithSender[];
};

export const sendChannelMessage = async ({ channelId, content }: { channelId: string; content: string; }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    if (!content?.trim()) {
        throw new Error("Message must have content.");
    }

    const { data, error } = await supabase
        .from('channel_messages')
        .insert({
            channel_id: channelId,
            user_id: user.id,
            content: content.trim(),
        })
        .select()
        .single();

    if (error) {
        console.error("Error sending channel message:", error);
        throw new Error(error.message);
    }

    return data;
};
