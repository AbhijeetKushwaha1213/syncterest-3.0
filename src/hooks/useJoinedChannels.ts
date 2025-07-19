
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ChannelWithUnread } from '@/types';
import { useEffect, useRef } from 'react';

export const useJoinedChannels = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['joined-channels', user?.id];
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Clean up existing subscription before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create new subscription
    channelRef.current = supabase
      .channel(`joined-channels-realtime-${user.id}`) // Use unique channel name
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
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, queryClient, queryKey]);

  return useQuery({
    queryKey,
    queryFn: async (): Promise<ChannelWithUnread[]> => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase.rpc('get_joined_channels_with_unread' as any, {
          p_user_id: user.id
        });

        if (error) {
          console.error('Error fetching joined channels:', error);
          throw error;
        }
        
        return data as unknown as ChannelWithUnread[];
      } catch (error) {
        console.error('Failed to fetch joined channels:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
