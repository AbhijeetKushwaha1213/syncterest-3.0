
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];

export type ConversationWithOtherParticipant = Conversation & {
  other_participant: Profile;
};

export const getConversations = async (userId: string): Promise<ConversationWithOtherParticipant[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      conversation_participants!inner(
        profiles!inner(id, username, avatar_url, full_name)
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    throw new Error(error.message);
  }
  if (!data) return [];

  const conversationsWithOtherParticipant = data.map(conv => {
    const participants = (conv.conversation_participants as any[]).map(p => p.profiles as Profile);
    const other_participant = participants.find(p => p.id !== userId);
    return {
      ...conv,
      other_participant: other_participant!,
    };
  }).filter(c => c.other_participant);

  return conversationsWithOtherParticipant as unknown as ConversationWithOtherParticipant[];
};
