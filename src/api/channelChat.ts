
import { supabase } from "@/integrations/supabase/client";
import { ChannelMessage, Profile, ChannelMessageReaction } from "@/types";

export type ChannelMessageWithSender = ChannelMessage & {
  sender: Pick<Profile, 'id' | 'username' | 'avatar_url'> | null;
  channel_message_reactions: ChannelMessageReaction[];
};

export const getChannelMessages = async (channelId: string): Promise<ChannelMessageWithSender[]> => {
  if (!channelId) return [];

  const { data, error } = await supabase
    .from('channel_messages')
    .select(`
      *,
      sender:profiles (id, username, avatar_url),
      channel_message_reactions(*)
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

export const uploadChannelAttachment = async (channelId: string, file: Blob, fileExtension: string): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const fileName = `${Date.now()}.${fileExtension}`;
  const path = `channels/${channelId}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('channel_attachments')
    .upload(path, file);
  
  if (uploadError) {
    throw new Error(`Failed to upload attachment: ${uploadError.message}`);
  }

  return path;
};

export const addChannelReaction = async ({ messageId, emoji }: { messageId: number; emoji: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('channel_message_reactions')
    .insert({ message_id: messageId, emoji, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error('Error adding reaction', error);
    throw new Error(error.message);
  }
  return data;
};

export const removeChannelReaction = async (reactionId: string) => {
  const { error } = await supabase
    .from('channel_message_reactions')
    .delete()
    .eq('id', reactionId);

  if (error) {
    console.error('Error removing reaction', error);
    throw new Error(error.message);
  }
};
