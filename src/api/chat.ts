import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];

export type MessageWithSender = Message & {
  sender: Pick<Profile, 'id' | 'username' | 'avatar_url'> | null;
};

// This type is based on the get_conversations_for_user RPC function's return type.
export type ConversationWithOtherParticipant = {
  id: string;
  created_at: string;
  updated_at: string;
  other_participant: Profile;
  last_message: {
      content: string;
      created_at: string;
  } | null;
  unread_count: number;
};

export const getConversations = async (userId: string): Promise<ConversationWithOtherParticipant[]> => {
  if (!userId) return [];

  const { data, error } = await supabase.rpc('get_conversations_for_user', { p_user_id: userId });

  if (error) {
    console.error("Error fetching conversations:", error);
    throw new Error(error.message);
  }
  if (!data) return [];

  // The RPC returns jsonb for complex types, so we need to cast them.
  return data.map(c => ({
    id: c.id,
    created_at: c.created_at,
    updated_at: c.updated_at,
    other_participant: c.other_participant as Profile,
    last_message: c.last_message as { content: string; created_at: string } | null,
    unread_count: c.unread_count as number,
  })) as ConversationWithOtherParticipant[];
};

export const getMessages = async (conversationId: string): Promise<MessageWithSender[]> => {
  if (!conversationId) return [];

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles (id, username, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw new Error(error.message);
  }

  return data as unknown as MessageWithSender[];
};

export const sendMessage = async ({ conversationId, content }: { conversationId: string; content: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: content.trim(),
        })
        .select()
        .single();

    if (error) {
        console.error("Error sending message:", error);
        throw new Error(error.message);
    }

    return data;
};

export const markMessagesAsRead = async (conversationId: string) => {
    if (!conversationId) return;
    const { error } = await supabase.rpc('mark_messages_as_read', { p_conversation_id: conversationId });
    if (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
};
