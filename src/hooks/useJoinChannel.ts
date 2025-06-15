
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

const joinChannel = async ({ channelId, userId }: { channelId: string; userId: string }) => {
  const { data, error } = await supabase
    .from('channel_members')
    .insert({ channel_id: channelId, user_id: userId, role: 'member' })
    .select();

  if (error) {
    // Handle potential duplicate join attempts gracefully
    if (error.code === '23505') { // unique constraint violation
      console.warn(`User ${userId} already a member of channel ${channelId}.`);
      return null;
    }
    throw error;
  }
  return data;
};

export const useJoinChannel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (channelId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return joinChannel({ channelId, userId: user.id });
    },
    onSuccess: (data, channelId) => {
      if(data !== null) {
        toast({ title: "Success", description: "You've joined the channel." });
      }
      queryClient.invalidateQueries({ queryKey: ['joined-channels'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['channel', channelId] });
    },
    onError: (error) => {
      console.error('Error joining channel:', error);
      toast({
        variant: "destructive",
        title: "Error joining channel",
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
};
