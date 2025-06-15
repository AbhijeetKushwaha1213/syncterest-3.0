
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ChannelWithUnread } from '@/types';

const markChannelAsRead = async (channelId: string) => {
  const { error } = await supabase.rpc('mark_channel_as_read', {
    p_channel_id: channelId,
  });

  if (error) {
    console.error('Error marking channel as read:', error);
    throw error;
  }
};

export const useMarkChannelAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = ['joined-channels', user?.id];

  return useMutation({
    mutationFn: markChannelAsRead,
    onSuccess: (_data, channelId) => {
      // Optimistically update the unread count to 0
      queryClient.setQueryData(queryKey, (oldData: ChannelWithUnread[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(channel => 
          channel.id === channelId ? { ...channel, unread_count: 0 } : channel
        );
      });
      // Invalidate to ensure consistency with the server
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
