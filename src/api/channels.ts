
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types";

export const updateChannel = async ({ channelId, updates }: { channelId: string, updates: Partial<Pick<Channel, 'name' | 'description'>> }) => {
    const { data, error } = await supabase
        .from('channels')
        .update(updates)
        .eq('id', channelId)
        .select()
        .single();

    if (error) {
        console.error("Error updating channel:", error);
        throw new Error(error.message);
    }
    return data;
};
