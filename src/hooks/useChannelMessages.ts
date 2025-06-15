
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getChannelMessages, ChannelMessageWithSender } from '@/api/channelChat';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { ChannelMessageReaction } from '@/types';

export const useChannelMessages = (channelId: string | undefined) => {
  const queryClient = useQueryClient();

  const queryKey = ['channel-messages', channelId];

  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`channel-chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
            const { data: newMessage, error } = await supabase
                .from('channel_messages')
                .select('*, sender:profiles (id, username, avatar_url), channel_message_reactions(*)')
                .eq('id', payload.new.id)
                .single();

            if (error) {
                console.error("Error fetching new channel message:", error);
                return;
            }

            if(newMessage) {
                queryClient.setQueryData(queryKey, (oldData: ChannelMessageWithSender[] | undefined) => {
                    if (!oldData) return [newMessage as ChannelMessageWithSender];
                    if (oldData.some(m => m.id === newMessage.id)) return oldData;
                    return [...oldData, newMessage as ChannelMessageWithSender];
                });
            }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_message_reactions',
        },
        (payload) => {
          const newReaction = payload.new as ChannelMessageReaction;
          queryClient.setQueryData(queryKey, (oldData: ChannelMessageWithSender[] | undefined) => {
            if (!oldData || !oldData.some(m => m.id === newReaction.message_id)) return oldData;
            return oldData.map(message => 
              message.id === newReaction.message_id
                ? { ...message, channel_message_reactions: [...message.channel_message_reactions.filter(r => r.id !== newReaction.id), newReaction] }
                : message
            );
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'channel_message_reactions',
        },
        (payload) => {
          const oldReaction = payload.old as Partial<ChannelMessageReaction>;
          queryClient.setQueryData(queryKey, (oldData: ChannelMessageWithSender[] | undefined) => {
            if (!oldData || !oldData.some(m => m.id === oldReaction.message_id)) return oldData;
            return oldData.map(message =>
              message.id === oldReaction.message_id
                ? { ...message, channel_message_reactions: message.channel_message_reactions.filter(r => r.id !== oldReaction.id) }
                : message
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient, queryKey]);

  return useQuery({
    queryKey,
    queryFn: () => getChannelMessages(channelId!),
    enabled: !!channelId,
    staleTime: Infinity, // Real-time updates will manage data freshness
  });
};
