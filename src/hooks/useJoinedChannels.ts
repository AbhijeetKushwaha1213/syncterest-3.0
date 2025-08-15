
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ChannelWithUnread } from '@/types';
import { useEffect, useRef, useCallback } from 'react';

export const useJoinedChannels = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['joined-channels', user?.id];
  const channelRef = useRef<any>(null);
  const subscriptionInitialized = useRef(false);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.warn('Error removing channel subscription:', error);
      }
      channelRef.current = null;
    }
    subscriptionInitialized.current = false;
  }, []);

  useEffect(() => {
    if (!user?.id || subscriptionInitialized.current) return;

    // Clean up any existing subscription
    cleanup();

    try {
      // Create new subscription with unique channel name
      const channelName = `joined-channels-${user.id}-${Date.now()}`;
      channelRef.current = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_messages'
        }, (payload) => {
          try {
            const joinedChannels = queryClient.getQueryData<ChannelWithUnread[]>(queryKey);
            const isMember = joinedChannels?.some(c => c.id === payload.new.channel_id);

            if (isMember && payload.new.user_id !== user.id) {
              queryClient.invalidateQueries({ queryKey });
            }
          } catch (error) {
            console.error('Error handling channel message:', error);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            subscriptionInitialized.current = true;
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Channel subscription error');
            cleanup();
          }
        });
    } catch (error) {
      console.error('Error setting up channel subscription:', error);
    }

    return cleanup;
  }, [user?.id, queryClient, queryKey, cleanup]);

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
