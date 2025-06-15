
import { ConversationWithOtherParticipant } from '@/api/chat';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, sendMessage, MessageWithSender } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChannelPresence } from '@/hooks/useChannelPresence';
import { z } from 'zod';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageForm, { messageFormSchema } from './MessageForm';

interface ChatWindowProps {
  conversation: ConversationWithOtherParticipant | null;
  onBack: () => void;
}

const ChatWindow = ({ conversation, onBack }: ChatWindowProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const presenceState = useChannelPresence('live-users');

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { content: "" },
  });

  const { data: initialMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => getMessages(conversation!.id),
    enabled: !!conversation,
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`chat:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const { data: newMessage, error } = await supabase
            .from('messages')
            .select('*, sender:profiles (id, username, avatar_url)')
            .eq('id', payload.new.id)
            .single();
          
          if (error) {
            console.error("Error fetching new message:", error);
            return;
          }

          if (newMessage) {
            setMessages(currentMessages => {
              if (currentMessages.some(m => m.id === newMessage.id)) {
                return currentMessages;
              }
              return [...currentMessages, newMessage as MessageWithSender];
            });
            queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, queryClient, user?.id]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  useEffect(() => {
    // A short delay to allow images in bubbles to load
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      form.reset();
    },
    onError: (error) => {
      console.error("Failed to send message", error);
      // Here you could add a toast notification to inform the user
    },
  });

  const onSubmit = (values: z.infer<typeof messageFormSchema>) => {
    if (!conversation || !values.content.trim()) return;
    sendMessageMutation.mutate({ conversationId: conversation.id, content: values.content });
  };
  
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-muted/20">
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold">Welcome to Syncterest Chat</h2>
          <p className="text-muted-foreground mt-2">Select a conversation from the list on the left to start messaging. If you don't have any conversations, find a user and send them a message from their profile!</p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.other_participant;
  const isOnline = !!(otherParticipant?.id && presenceState && presenceState[otherParticipant.id]);

  return (
    <div className="flex flex-col h-full bg-background w-full">
      <ChatHeader
        otherParticipant={otherParticipant}
        isOnline={isOnline}
        onBack={onBack}
      />
      <main className="flex-1 p-4 overflow-y-auto bg-muted/20">
        <MessageList 
          isLoading={isLoadingMessages} 
          messages={messages}
          messagesEndRef={messagesEndRef}
        />
      </main>
      <MessageForm 
        form={form}
        onSubmit={onSubmit}
        isSending={sendMessageMutation.isPending}
      />
    </div>
  );
};

export default ChatWindow;
