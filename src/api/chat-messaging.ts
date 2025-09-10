import { supabase } from "@/integrations/supabase/client";

// Function to create or find a conversation with another user
export const findOrCreateConversation = async (otherUserId: string) => {
  if (!otherUserId) {
    throw new Error("Other user ID is required");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  if (user.id === otherUserId) {
    throw new Error("Cannot create conversation with yourself");
  }

  try {
    console.log(`Creating/finding conversation between ${user.id} and ${otherUserId}`);
    
    const { data, error } = await supabase.rpc('find_or_create_conversation', { 
      p_other_user_id: otherUserId 
    });

    if (error) {
      console.error("Error creating/finding conversation:", error);
      throw new Error(error.message);
    }

    console.log("Conversation created/found:", data);
    return data; // This is the conversation ID
  } catch (error) {
    console.error("Error in findOrCreateConversation:", error);
    throw error;
  }
};