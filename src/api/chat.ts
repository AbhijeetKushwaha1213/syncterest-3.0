
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];

export type MessageWithSender = Message & {
  sender: Pick<Profile, 'id' | 'username' | 'avatar_url'> | null;
};

export type ConversationWithOtherParticipant = Conversation & {
  other_participant: Profile;
  messages: Pick<Message, 'content' | 'created_at'>[];
};

export const getConversations = async (userId: string): Promise<ConversationWithOtherParticipant[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages ( content, created_at ),
      conversation_participants!inner(
        profiles!inner(id, username, avatar_url, full_name, last_active_at)
      )
    `)
    .order('updated_at', { ascending: false })
    .order('created_at', { foreignTable: 'messages', ascending: false })
    .limit(1, { foreignTable: 'messages' });

  if (error) {
    console.error("Error fetching conversations:", error);
    throw new Error(error.message);
  }
  if (!data) return [];

  const conversationsWithOtherParticipant = data.map(conv => {
    const participants = (conv.conversation_participants as any[]).map(p => p.profiles as Profile);
    const other_participant = participants.find(p => p.id !== userId);
    return {
      ...(conv as Conversation),
      other_participant: other_participant!,
      messages: conv.messages as Pick<Message, 'content' | 'created_at'>[],
    };
  }).filter(c => c.other_participant);

  return conversationsWithOtherParticipant as unknown as ConversationWithOtherParticipant[];
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
