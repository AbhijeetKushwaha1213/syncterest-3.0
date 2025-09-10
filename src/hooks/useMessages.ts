import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, sendMessage, MessageWithSender, markMessagesAsRead, uploadAttachment } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useMessages = (conversationId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);

  const { data: initialMessages, isLoading, error } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => {
      if (!conversationId) {
        console.error('No conversation ID provided');
        return [];
      }
      return getMessages(conversationId);
    },
    enabled: !!conversationId,
    retry: 2,
    retryDelay: 1000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (error) => {
      console.error("Failed to mark messages as read", error);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      // Message will be updated via real-time subscription
    },
    onError: (error) => {
      console.error("Failed to send message", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message,
      });
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    },
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Real-time subscriptions for messages
  useEffect(() => {
    if (!conversationId || !user?.id) return;
    
    let messageChannel: any = null;
    let reactionChannel: any = null;

    try {
      messageChannel = supabase
        .channel(`chat-messages-${conversationId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          async (payload) => {
            try {
              const { data: newMessage, error } = await supabase
                .from('messages')
                .select('*, sender:profiles (id, username, avatar_url), reactions(*)')
                .eq('id', payload.new.id)
                .single();
              
              if (error) {
                console.error("Error fetching new message:", error);
                return;
              }

              if (newMessage) {
                setMessages(currentMessages => {
                  // Remove any temporary message and add real message
                  const withoutTemp = currentMessages.filter(m => !m.id.startsWith('temp-'));
                  if (withoutTemp.some(m => m.id === newMessage.id)) {
                    return withoutTemp;
                  }
                  return [...withoutTemp, newMessage as MessageWithSender];
                });
                
                // Mark as read if it's an incoming message
                if (newMessage.sender_id !== user.id) {
                  markAsReadMutation.mutate(conversationId);
                } else {
                  // If we sent the message, just invalidate conversations to update list
                  queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
                }
              }
            } catch (error) {
              console.error("Error processing new message:", error);
            }
          }
        )
        .subscribe();

      reactionChannel = supabase
        .channel(`chat-reactions-${conversationId}-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' },
          (payload) => {
            try {
              setMessages(currentMessages => {
                const messageInState = currentMessages.some(m => m.conversation_id === conversationId);
                if (!messageInState) return currentMessages;

                if (payload.eventType === 'INSERT') {
                  const newReaction = payload.new as any;
                  return currentMessages.map(m => {
                    if (m.id === newReaction.message_id) {
                      if (m.reactions.some(r => r.id === newReaction.id)) return m;
                      return { ...m, reactions: [...m.reactions, newReaction] };
                    }
                    return m;
                  });
                }

                if (payload.eventType === 'DELETE') {
                  const oldReaction = payload.old as any;
                  return currentMessages.map(m => {
                    if (m.id === oldReaction.message_id) {
                      return { ...m, reactions: m.reactions.filter(r => r.id !== oldReaction.id) };
                    }
                    return m;
                  });
                }
                return currentMessages;
              });
            } catch (error) {
              console.error("Error processing reaction:", error);
            }
          }
        ).subscribe();
    } catch (error) {
      console.error("Error setting up chat subscriptions:", error);
    }

    return () => {
      try {
        if (messageChannel) supabase.removeChannel(messageChannel);
        if (reactionChannel) supabase.removeChannel(reactionChannel);
      } catch (error) {
        console.warn("Error cleaning up chat subscriptions:", error);
      }
    };
  }, [conversationId, user?.id, queryClient, markAsReadMutation]);

  return {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    markAsRead: markAsReadMutation.mutate,
  };
};