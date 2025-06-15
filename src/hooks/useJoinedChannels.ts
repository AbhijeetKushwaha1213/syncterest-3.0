
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ChannelWithUnread } from '@/types';
import { useEffect } from 'react';

export const useJoinedChannels = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['joined-channels', user?.id];

  useEffect(() => {
    if (!user) return;

    const channelSubscription = supabase
      .channel('joined-channels-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'channel_messages'
      }, (payload) => {
        const joinedChannels = queryClient.getQueryData<ChannelWithUnread[]>(queryKey);
        const isMember = joinedChannels?.some(c => c.id === payload.new.channel_id);

        if (isMember && payload.new.user_id !== user.id) {
          queryClient.invalidateQueries({ queryKey });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    }
  }, [user, queryClient, queryKey]);

  return useQuery({
    queryKey,
    queryFn: async (): Promise<ChannelWithUnread[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc('get_joined_channels_with_unread', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching joined channels:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });
};
